from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.models.user import User
from app.schemas.collab import CollabApplyRequest, CollabCreateRequest, CollabOut
from app.schemas.response import ApiResponse, success_response
from app.services.collab_service import (
    apply_collab,
    cancel_collab_apply,
    create_collab,
    list_collabs,
)


router = APIRouter(prefix="/collabs", tags=["collabs"])
optional_bearer = HTTPBearer(auto_error=False)


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None or not credentials.credentials:
        return None

    try:
        payload = decode_access_token(credentials.credentials)
    except UnauthorizedException:
        return None
    subject = payload.get("sub")
    if not subject:
        return None

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        return None

    return db.query(User).filter(User.id == user_id).first()


@router.get("", response_model=ApiResponse[list[CollabOut]])
def get_collab_list(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> ApiResponse[list[CollabOut]]:
    return success_response(list_collabs(db, current_user))


@router.post("", response_model=ApiResponse[CollabOut])
def create_collab_listing(
    payload: CollabCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[CollabOut]:
    collab = create_collab(db, current_user, payload)
    return success_response(collab, message="联动发布成功")


@router.post("/{collab_id}/apply", response_model=ApiResponse[CollabOut])
def apply_for_collab(
    collab_id: int,
    payload: CollabApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[CollabOut]:
    collab = apply_collab(db, collab_id, current_user, payload)
    return success_response(collab, message="已发送联动申请")


@router.delete("/{collab_id}/apply", response_model=ApiResponse[CollabOut])
def cancel_collab_application(
    collab_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[CollabOut]:
    collab = cancel_collab_apply(db, collab_id, current_user)
    return success_response(collab, message="已取消联动申请")
