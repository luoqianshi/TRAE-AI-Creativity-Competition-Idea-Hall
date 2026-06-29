from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.common import PageParams


bearer_scheme = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_pagination_params(
    page: Annotated[int, Query(1, ge=1, description="页码，从 1 开始")] = 1,
    size: Annotated[
        int,
        Query(
            settings.default_page_size,
            ge=1,
            le=settings.max_page_size,
            description="每页数量",
        ),
    ] = settings.default_page_size,
) -> PageParams:
    return PageParams(page=page, size=size)


def is_dev_auth_bypass_enabled() -> bool:
    return settings.dev_auth_bypass and settings.app_env.lower() in {
        "local",
        "dev",
        "development",
        "test",
    }


def get_or_create_dev_user(db: Session) -> User:
    username = settings.dev_auth_username.strip() or "dev"
    phone = settings.dev_auth_phone.strip() or "13900000000"
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        user = User(
            username=username,
            phone=phone,
            password_hash="dev-auth-bypass-no-login",
        )
        db.add(user)
        db.flush()
    elif user.phone != phone:
        user.phone = phone
        db.flush()

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if profile is None:
        profile = UserProfile(
            user_id=user.id,
            nickname="开发者",
            mood="开发者模式免登录",
            avatar="",
            phone_verified=True,
        )
        db.add(profile)
    else:
        profile.phone_verified = True
    db.commit()
    db.refresh(user)
    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        if is_dev_auth_bypass_enabled():
            return get_or_create_dev_user(db)
        raise UnauthorizedException("未登录或凭证缺失")

    payload = decode_access_token(credentials.credentials)
    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedException("登录状态无效，请重新登录")

    try:
        user_id = int(subject)
    except (TypeError, ValueError) as exc:
        raise UnauthorizedException("登录状态无效，请重新登录") from exc

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise UnauthorizedException("用户不存在或已失效")
    return user


DBSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]
Pagination = Annotated[PageParams, Depends(get_pagination_params)]
