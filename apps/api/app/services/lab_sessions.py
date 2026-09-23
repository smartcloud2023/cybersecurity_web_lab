import logging
import uuid
from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.audit import record_audit_event
from app.core.config import settings
from app.core.security import hash_code, verify_code
from app.models._mixins import utcnow
from app.models.lab import Lab
from app.models.lab_session import LabSession, LabSessionStatus
from app.models.progress import Progress, ProgressStatus
from app.services.mutation import draw_variant, generate_flag
from app.services.provisioner import LabProvisioner, ProvisioningError

logger = logging.getLogger("cyberlab.lab_sessions")

ACTIVE_STATUSES = (
    LabSessionStatus.requested,
    LabSessionStatus.provisioning,
    LabSessionStatus.ready,
    LabSessionStatus.active,
)


class DailyLimitExceededError(Exception):
    pass


class IncorrectFlagError(Exception):
    pass


def get_active_session(db: Session, user_id: uuid.UUID, lab_id: uuid.UUID) -> LabSession | None:
    return db.scalar(
        select(LabSession)
        .where(
            LabSession.user_id == user_id,
            LabSession.lab_id == lab_id,
            LabSession.status.in_(ACTIVE_STATUSES),
        )
        .order_by(LabSession.created_at.desc())
    )


def count_sessions_today(db: Session, user_id: uuid.UUID, lab_id: uuid.UUID) -> int:
    start_of_today = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        db.scalar(
            select(func.count())
            .select_from(LabSession)
            .where(
                LabSession.user_id == user_id,
                LabSession.lab_id == lab_id,
                LabSession.created_at >= start_of_today,
                LabSession.status != LabSessionStatus.failed,
            )
        )
        or 0
    )


def _ensure_in_progress(db: Session, user_id: uuid.UUID, lab_id: uuid.UUID) -> None:
    """Marks the lab in_progress for this student the moment they actually
    launch it, rather than leaving Progress untouched until (if ever) they
    submit a correct flag — otherwise the dashboard has nothing to show for
    a launch until completion. Never downgrades an already-completed lab."""
    progress = db.scalar(
        select(Progress).where(Progress.user_id == user_id, Progress.lab_id == lab_id)
    )
    if progress is None:
        db.add(Progress(user_id=user_id, lab_id=lab_id, status=ProgressStatus.in_progress, score=0))
    elif progress.status == ProgressStatus.not_started:
        progress.status = ProgressStatus.in_progress


def launch_lab(
    db: Session, user_id: uuid.UUID, lab: Lab, provisioner: LabProvisioner
) -> LabSession:
    """Resumes an in-progress session if one exists, otherwise enforces the
    daily quota and provisions a new one. Raises DailyLimitExceededError,
    NoVariantsAvailableError (see mutation.py), or ProvisioningError."""
    existing = get_active_session(db, user_id, lab.id)
    if existing is not None:
        return existing

    used_today = count_sessions_today(db, user_id, lab.id)
    if used_today >= settings.lab_daily_session_limit:
        raise DailyLimitExceededError(
            f"Daily limit reached for {lab.title} "
            f"({settings.lab_daily_session_limit}/day) — try again tomorrow."
        )

    variant = draw_variant(db, lab.id)
    flag = generate_flag()

    session = LabSession(
        user_id=user_id,
        lab_id=lab.id,
        variant_id=variant.id,
        status=LabSessionStatus.provisioning,
        flag_hash=hash_code(flag),
        last_active_at=utcnow(),
    )
    db.add(session)
    db.flush()

    try:
        result = provisioner.provision(session, lab, variant, flag)
    except ProvisioningError as exc:
        # The real cause (e.g. docker stderr) never reaches the student —
        # the API only returns a generic 502 — so this is the only place
        # it's visible at all. Check `docker compose logs api` after a
        # failed launch.
        logger.error("Provisioning failed for session %s: %s", session.id, exc)
        session.status = LabSessionStatus.failed
        record_audit_event(db, user_id, "lab.launch_failed", lab.slug)
        db.commit()
        raise

    session.status = LabSessionStatus.ready
    session.resource_ref = result.resource_ref
    session.port = result.port
    session.connection_info = result.connection_info
    session.expires_at = utcnow() + timedelta(minutes=settings.lab_max_duration_minutes)
    _ensure_in_progress(db, user_id, lab.id)
    record_audit_event(db, user_id, "lab.launched", lab.slug)
    db.commit()
    db.refresh(session)
    return session


def heartbeat(db: Session, session: LabSession) -> LabSession:
    if session.status == LabSessionStatus.ready:
        session.status = LabSessionStatus.active
    session.last_active_at = utcnow()
    db.commit()
    db.refresh(session)
    return session


def stop_session(db: Session, session: LabSession, provisioner: LabProvisioner) -> LabSession:
    if session.status in ACTIVE_STATUSES:
        provisioner.destroy(session)
        session.status = LabSessionStatus.destroyed
        record_audit_event(db, session.user_id, "lab.stopped", str(session.id))
        db.commit()
        db.refresh(session)
    return session


def submit_flag(db: Session, session: LabSession, lab: Lab, flag: str) -> None:
    if session.status not in (LabSessionStatus.ready, LabSessionStatus.active) or not session.flag_hash:
        raise IncorrectFlagError("No active session to submit a flag for.")
    if not verify_code(flag, session.flag_hash):
        raise IncorrectFlagError("Incorrect flag.")

    progress = db.scalar(
        select(Progress).where(Progress.user_id == session.user_id, Progress.lab_id == lab.id)
    )
    if progress is None:
        # score=0 set explicitly rather than left to the column default —
        # that default only applies once this row is actually flushed, and
        # `max(progress.score, 100)` below reads it back before that.
        progress = Progress(user_id=session.user_id, lab_id=lab.id, score=0)
        db.add(progress)
    progress.status = ProgressStatus.completed
    progress.score = max(progress.score, 100)
    record_audit_event(db, session.user_id, "lab.flag_correct", lab.slug)
    db.commit()


def reap_idle_sessions(db: Session, provisioner: LabProvisioner) -> int:
    """Destroys any ready/active session whose last_active_at is older than
    the idle timeout — the auto-destroy-after-10-minutes-idle rule."""
    cutoff = utcnow() - timedelta(minutes=settings.lab_idle_timeout_minutes)
    stale = db.scalars(
        select(LabSession).where(
            LabSession.status.in_([LabSessionStatus.ready, LabSessionStatus.active]),
            LabSession.last_active_at < cutoff,
        )
    ).all()
    for session in stale:
        provisioner.destroy(session)
        session.status = LabSessionStatus.destroyed
        record_audit_event(db, session.user_id, "lab.expired", str(session.id))
    if stale:
        db.commit()
    return len(stale)


def reap_stuck_provisioning(db: Session) -> int:
    """A provisioner call that never returns shouldn't strand a session in
    'provisioning' forever, blocking that user from ever launching this lab
    again."""
    cutoff = utcnow() - timedelta(minutes=5)
    stuck = db.scalars(
        select(LabSession).where(
            LabSession.status == LabSessionStatus.provisioning,
            LabSession.created_at < cutoff,
        )
    ).all()
    for session in stuck:
        session.status = LabSessionStatus.failed
        record_audit_event(db, session.user_id, "lab.launch_failed", "stuck in provisioning")
    if stuck:
        db.commit()
    return len(stuck)
