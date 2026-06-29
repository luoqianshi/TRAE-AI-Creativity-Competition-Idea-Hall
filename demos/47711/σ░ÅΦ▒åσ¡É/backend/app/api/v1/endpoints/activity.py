from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.models.user import User
from app.schemas.activity import ActivityOut, ActivitySignupRequest
from app.schemas.response import ApiResponse, success_response
from app.services.activity_service import (
    cancel_activity_signup,
    get_activity_detail,
    list_activities,
    list_my_signups,
    signup_activity,
)


router = APIRouter(prefix="/activity", tags=["activity"])
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


@router.get("/my-signups", response_model=ApiResponse[list[ActivityOut]])
def get_my_signups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[list[ActivityOut]]:
    return success_response(list_my_signups(db, current_user))


@router.get("", response_model=ApiResponse[list[ActivityOut]])
def get_activities(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> ApiResponse[list[ActivityOut]]:
    return success_response(list_activities(db, current_user))


@router.get("/{activity_id}", response_model=ApiResponse[ActivityOut])
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> ApiResponse[ActivityOut]:
    return success_response(get_activity_detail(db, activity_id, current_user))


@router.post("/{activity_id}/signup", response_model=ApiResponse[ActivityOut])
def create_activity_signup(
    activity_id: int,
    payload: ActivitySignupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[ActivityOut]:
    activity = signup_activity(db, activity_id, current_user, payload)
    return success_response(activity, message="报名成功")


@router.delete("/{activity_id}/signup", response_model=ApiResponse[ActivityOut])
def remove_activity_signup(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[ActivityOut]:
    activity = cancel_activity_signup(db, activity_id, current_user)
    return success_response(activity, message="已取消报名")
