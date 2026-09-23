import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.lab import Lab, LabStep
from app.models.lab_session import LabSession
from app.models.user import User
from app.schemas.lab import LabDetailOut, LabOut, LabSessionOut, SubmitFlagRequest
from app.services.lab_sessions import (
    ACTIVE_STATUSES,
    DailyLimitExceededError,
    IncorrectFlagError,
    heartbeat,
    launch_lab,
    stop_session,
    submit_flag,
)
from app.services.mutation import NoVariantsAvailableError
from app.services.provisioner import ProvisioningError, get_provisioner

router = APIRouter(tags=["labs"])


def _get_lab_or_404(db: Session, slug: str) -> Lab:
    lab = db.scalar(select(Lab).where(Lab.slug == slug, Lab.published.is_(True)))
    if lab is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab not found")
    return lab


def _get_own_session_or_404(db: Session, session_id: uuid.UUID, user: User) -> LabSession:
    session = db.get(LabSession, session_id)
    if session is None or session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


def _session_out(db: Session, session: LabSession) -> LabSessionOut:
    lab = db.get(Lab, session.lab_id)
    return LabSessionOut(
        id=session.id,
        lab_id=session.lab_id,
        lab_slug=lab.slug if lab else "",
        status=session.status,
        connection_info=session.connection_info,
        expires_at=session.expires_at,
        last_active_at=session.last_active_at,
        created_at=session.created_at,
    )


@router.get("/labs", response_model=list[LabOut])
def list_labs(db: Session = Depends(get_db)) -> list[Lab]:
    return list(db.scalars(select(Lab).where(Lab.published.is_(True)).order_by(Lab.slug)))


@router.get("/labs/{slug}", response_model=LabDetailOut)
def get_lab(slug: str, db: Session = Depends(get_db)) -> LabDetailOut:
    lab = _get_lab_or_404(db, slug)
    steps = list(
        db.scalars(select(LabStep).where(LabStep.lab_id == lab.id).order_by(LabStep.sequence))
    )
    return LabDetailOut(**LabOut.model_validate(lab).model_dump(), steps=steps)


@router.post(
    "/labs/{slug}/launch", response_model=LabSessionOut, status_code=status.HTTP_201_CREATED
)
def launch(
    slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> LabSessionOut:
    lab = _get_lab_or_404(db, slug)
    provisioner = get_provisioner()
    try:
        session = launch_lab(db, current_user.id, lab, provisioner)
        return _session_out(db, session)
    except DailyLimitExceededError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc)) from exc
    except NoVariantsAvailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="This lab isn't available to launch right now.",
        ) from exc
    except ProvisioningError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="Couldn't start the lab environment."
        ) from exc


@router.get("/me/lab-sessions", response_model=list[LabSessionOut])
def list_my_sessions(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[LabSessionOut]:
    sessions = db.scalars(
        select(LabSession)
        .where(LabSession.user_id == current_user.id, LabSession.status.in_(ACTIVE_STATUSES))
        .order_by(LabSession.created_at.desc())
    )
    return [_session_out(db, s) for s in sessions]


@router.get("/lab-sessions/{session_id}", response_model=LabSessionOut)
def get_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LabSessionOut:
    session = _get_own_session_or_404(db, session_id, current_user)
    return _session_out(db, session)


@router.post("/lab-sessions/{session_id}/heartbeat", response_model=LabSessionOut)
def send_heartbeat(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LabSessionOut:
    session = _get_own_session_or_404(db, session_id, current_user)
    session = heartbeat(db, session)
    return _session_out(db, session)


@router.post("/lab-sessions/{session_id}/stop", response_model=LabSessionOut)
def stop(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LabSessionOut:
    session = _get_own_session_or_404(db, session_id, current_user)
    session = stop_session(db, session, get_provisioner())
    return _session_out(db, session)


@router.post("/lab-sessions/{session_id}/submit-flag", status_code=status.HTTP_204_NO_CONTENT)
def submit(
    session_id: uuid.UUID,
    body: SubmitFlagRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    session = _get_own_session_or_404(db, session_id, current_user)
    lab = db.get(Lab, session.lab_id)
    if lab is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab not found")
    try:
        submit_flag(db, session, lab, body.flag)
    except IncorrectFlagError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
