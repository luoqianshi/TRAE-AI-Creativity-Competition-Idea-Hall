from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import BadRequestException
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.auth import (
    AuthPayload,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    UserOut,
)
from app.services.sms_service import check_sms_code


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def is_debug_code_enabled() -> bool:
    return settings.app_env.lower() in {"local", "dev", "development", "test"}


def dispatch_sms_code(phone: str, code: str, scene: str) -> None:
    # Placeholder for future SMS provider integration.
    # The current implementation intentionally keeps the delivery boundary in one place.
    _ = (phone, code, scene)


def ensure_user_profile(db: Session, user: User) -> UserProfile:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if profile is not None:
        return profile

    profile = UserProfile(
        user_id=user.id,
        nickname=user.username,
        mood="初次来到这个世界...",
        avatar="",
        phone_verified=False,
    )
    db.add(profile)
    db.flush()
    return profile


def create_user(db: Session, payload: RegisterRequest) -> User:
    username = payload.username.strip()
    duplicated_user = (
        db.query(User)
        .filter(or_(User.username == username, User.phone == payload.phone))
        .first()
    )
    if duplicated_user:
        if duplicated_user.username == username:
            raise BadRequestException("该账号已被注册")
        raise BadRequestException("该手机号已被注册")

    check_sms_code(payload.phone, payload.sms_code)

    user = User(
        username=username,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.flush()
    ensure_user_profile(db, user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, payload: LoginRequest) -> User | None:
    user = get_user_by_username(db, payload.username)
    if user is None:
        return None
    if not verify_password(payload.password, user.password_hash):
        return None
    return user


def build_auth_payload(db: Session, user: User) -> AuthPayload:
    profile = ensure_user_profile(db, user)
    db.commit()
    db.refresh(user)
    db.refresh(profile)
    return AuthPayload(
        access_token=create_access_token(str(user.id)),
        user=UserOut(
            id=user.id,
            username=user.username,
            phone=user.phone,
            nickname=profile.nickname,
            phone_verified=profile.phone_verified,
            created_at=user.created_at,
            updated_at=user.updated_at,
        ),
    )


def reset_password(db: Session, payload: ForgotPasswordRequest) -> None:
    user = db.query(User).filter(User.phone == payload.phone).first()
    if user is None:
        raise BadRequestException("该手机号未注册")

    check_sms_code(payload.phone, payload.code)

    user.password_hash = get_password_hash(payload.new_password)
    user.reset_code = None
    user.reset_code_expires_at = None
    db.commit()
