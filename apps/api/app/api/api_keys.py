import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.audit import record_audit_event
from app.core.security import generate_api_key
from app.db.session import get_db
from app.models._mixins import utcnow
from app.models.api_key import ApiKey
from app.models.user import User
from app.schemas.account import ApiKeyCreatedOut, ApiKeyCreateRequest, ApiKeyOut

router = APIRouter(prefix="/me/api-keys", tags=["api-keys"])


@router.get("", response_model=list[ApiKeyOut])
def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ApiKey]:
    return list(
        db.scalars(
            select(ApiKey)
            .where(ApiKey.user_id == current_user.id, ApiKey.revoked_at.is_(None))
            .order_by(ApiKey.created_at.desc())
        )
    )


@router.post("", response_model=ApiKeyCreatedOut, status_code=status.HTTP_201_CREATED)
def create_api_key(
    body: ApiKeyCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiKeyCreatedOut:
    raw_key, prefix, key_hash = generate_api_key()
    key = ApiKey(user_id=current_user.id, name=body.name, prefix=prefix, key_hash=key_hash)
    db.add(key)
    db.flush()
    record_audit_event(db, current_user.id, "api_key.created", key.name)
    db.commit()
    db.refresh(key)
    return ApiKeyCreatedOut(
        id=key.id,
        name=key.name,
        prefix=key.prefix,
        created_at=key.created_at,
        last_used_at=key.last_used_at,
        key=raw_key,
    )


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_api_key(
    key_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    key = db.get(ApiKey, key_id)
    if key is None or key.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    key.revoked_at = utcnow()
    record_audit_event(db, current_user.id, "api_key.revoked", key.name)
    db.commit()
