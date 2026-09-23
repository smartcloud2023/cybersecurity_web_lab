import hashlib
import hmac
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
import pyotp
from webauthn.helpers import base64url_to_bytes, bytes_to_base64url

from app.core.config import settings

JWT_ALGORITHM = "HS256"
MFA_PENDING_SCOPE = "mfa_pending"
WEBAUTHN_REGISTRATION_SCOPE = "webauthn_registration"
WEBAUTHN_AUTHENTICATION_SCOPE = "webauthn_authentication"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: uuid.UUID, session_id: uuid.UUID) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": str(user_id), "sid": str(session_id), "exp": expires_at}
    return jwt.encode(payload, settings.secret_key, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> tuple[uuid.UUID, uuid.UUID] | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        return None
    if "scope" in payload:
        # A pending-MFA/WebAuthn-challenge token carries a scope claim and
        # must never be accepted as a full session token.
        return None
    try:
        return uuid.UUID(payload["sub"]), uuid.UUID(payload["sid"])
    except (KeyError, ValueError):
        return None


def create_mfa_pending_token(user_id: uuid.UUID) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    payload = {"sub": str(user_id), "exp": expires_at, "scope": MFA_PENDING_SCOPE}
    return jwt.encode(payload, settings.secret_key, algorithm=JWT_ALGORITHM)


def decode_mfa_pending_token(token: str) -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        return None
    if payload.get("scope") != MFA_PENDING_SCOPE:
        return None
    try:
        return uuid.UUID(payload["sub"])
    except (KeyError, ValueError):
        return None


def generate_verification_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_code(code: str) -> str:
    # sha256 rather than bcrypt: a 6-digit code only has 1e6 possibilities
    # regardless of hash cost, so the real protection is short expiry (see
    # verification_code_expires_at) plus keeping it out of the DB as
    # plaintext — not hashing expense. Salted with the app secret so a DB
    # leak alone isn't enough to precompute a lookup table.
    return hashlib.sha256(f"{settings.secret_key}:{code}".encode("utf-8")).hexdigest()


def verify_code(code: str, hashed: str) -> bool:
    return hmac.compare_digest(hash_code(code), hashed)


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def totp_provisioning_uri(secret: str, email: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name="CyberLab")


def verify_totp_code(secret: str, code: str) -> bool:
    return pyotp.totp.TOTP(secret).verify(code, valid_window=1)


def generate_api_key() -> tuple[str, str, str]:
    """Returns (raw_key, display_prefix, key_hash). Only raw_key is ever
    shown to the user, and only once — the DB keeps prefix + hash."""
    raw_key = f"cl_live_{secrets.token_urlsafe(32)}"
    prefix = raw_key[:16]
    key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    return raw_key, prefix, key_hash


def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def create_webauthn_challenge_token(scope: str, user_id: uuid.UUID, challenge: bytes) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    payload = {
        "sub": str(user_id),
        "challenge": bytes_to_base64url(challenge),
        "exp": expires_at,
        "scope": scope,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=JWT_ALGORITHM)


def decode_webauthn_challenge_token(token: str, scope: str) -> tuple[uuid.UUID, bytes] | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        return None
    if payload.get("scope") != scope:
        return None
    try:
        return uuid.UUID(payload["sub"]), base64url_to_bytes(payload["challenge"])
    except (KeyError, ValueError):
        return None
