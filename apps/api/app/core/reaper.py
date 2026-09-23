import asyncio
import logging

from app.db.session import SessionLocal
from app.services.lab_sessions import reap_idle_sessions, reap_stuck_provisioning
from app.services.provisioner import get_provisioner

logger = logging.getLogger("cyberlab.reaper")

REAP_INTERVAL_SECONDS = 60


async def run_reaper_loop() -> None:
    """Background loop, not a separate worker process/queue — a legitimate
    MVP choice given there's no Celery/RQ + Redis in this stack yet, not a
    final architecture. Runs the (synchronous, SQLAlchemy) reap functions in
    a thread so they don't block the event loop the rest of the API shares.
    """
    while True:
        try:
            await asyncio.to_thread(_reap_once)
        except Exception:
            logger.exception("Lab session reaper pass failed")
        await asyncio.sleep(REAP_INTERVAL_SECONDS)


def _reap_once() -> None:
    db = SessionLocal()
    try:
        provisioner = get_provisioner()
        idle = reap_idle_sessions(db, provisioner)
        stuck = reap_stuck_provisioning(db)
        if idle or stuck:
            logger.info("Reaped %d idle and %d stuck lab sessions", idle, stuck)
    finally:
        db.close()
