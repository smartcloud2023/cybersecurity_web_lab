from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_keys import router as api_keys_router
from app.api.audit_events import router as audit_events_router
from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.passkeys import router as passkeys_router
from app.api.sessions import router as sessions_router
from app.core.config import settings

app = FastAPI(title="CyberLab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(sessions_router, prefix="/api")
app.include_router(audit_events_router, prefix="/api")
app.include_router(api_keys_router, prefix="/api")
app.include_router(passkeys_router, prefix="/api")
