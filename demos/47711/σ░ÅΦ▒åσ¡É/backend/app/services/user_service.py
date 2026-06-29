from datetime import datetime, timedelta

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException
from app.core.security import generate_code
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.withdraw_request import WithdrawRequest
from app.schemas.signin import FortuneOut, SigninStatusOut
from app.schemas.user import (
    DashboardOut,
    MeOut,
    PhoneSendCodeRequest,
    PhoneVerifyRequest,
    UpdateMeRequest,
    WithdrawRequestCreate,
    WithdrawRequestOut,
    WithdrawRequestSubmitOut,
)
from app.services.auth_service import dispatch_sms_code, is_debug_code_enabled
from app.services.file_service import file_storage_service
from app.services.signin_service import get_signin_status, get_today_fortune


PHONE_CODE_EXPIRE_MINUTES = 10


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


def build_me_out(user: User, profile: UserProfile) -> MeOut:
    return MeOut(
        id=user.id,
        username=user.username,
        nickname=profile.nickname,
        mood=profile.mood,
        avatar=profile.avatar,
        phone=user.phone,
        phone_verified=profile.phone_verified,
        level=profile.level,
        exp=profile.exp,
        vip=profile.vip,
        interact_days=profile.interact_days,
        setting_count=profile.setting_count,
        total_revenue=profile.total_revenue,
        month_revenue=profile.month_revenue,
        pending_withdraw=profile.pending_withdraw,
        month_views=profile.month_views,
        new_followers=profile.new_followers,
        interact_rate=profile.interact_rate,
        created_at=user.created_at,
        updated_at=max(user.updated_at, profile.updated_at),
    )


def get_me(db: Session, user: User) -> MeOut:
    profile = ensure_user_profile(db, user)
    db.commit()
    db.refresh(profile)
    return build_me_out(user, profile)


def update_me(db: Session, user: User, payload: UpdateMeRequest) -> MeOut:
    profile = ensure_user_profile(db, user)

    if payload.nickname is not None:
        if not payload.nickname:
            raise BadRequestException("昵称不能为空")
        profile.nickname = payload.nickname
    if payload.mood is not None:
        profile.mood = payload.mood

    db.commit()
    db.refresh(profile)
    db.refresh(user)
    return build_me_out(user, profile)


def upload_avatar(db: Session, user: User, file: UploadFile) -> MeOut:
    profile = ensure_user_profile(db, user)
    stored_file = file_storage_service.save(file, folder="avatars")
    profile.avatar = stored_file.url
    db.commit()
    db.refresh(profile)
    db.refresh(user)
    return build_me_out(user, profile)


def send_phone_verify_code(
    db: Session,
    user: User,
    payload: PhoneSendCodeRequest,
) -> str | None:
    duplicated_user = (
        db.query(User)
        .filter(User.phone == payload.phone, User.id != user.id)
        .first()
    )
    if duplicated_user is not None:
        raise BadRequestException("该手机号已被其他账号绑定")

    profile = ensure_user_profile(db, user)
    code = generate_code()
    profile.pending_phone = payload.phone
    profile.phone_code = code
    profile.phone_code_expires_at = datetime.now() + timedelta(
        minutes=PHONE_CODE_EXPIRE_MINUTES
    )
    dispatch_sms_code(payload.phone, code, "bind_phone")
    db.commit()
    return code if is_debug_code_enabled() else None


def verify_phone(
    db: Session,
    user: User,
    payload: PhoneVerifyRequest,
) -> MeOut:
    profile = ensure_user_profile(db, user)
    if profile.pending_phone != payload.phone:
        raise BadRequestException("请先获取当前手机号的验证码")
    if not profile.phone_code or not profile.phone_code_expires_at:
        raise BadRequestException("请先发送验证码")
    if profile.phone_code != payload.code:
        raise BadRequestException("验证码错误")
    if profile.phone_code_expires_at < datetime.now():
        raise BadRequestException("验证码已过期，请重新获取")

    duplicated_user = (
        db.query(User)
        .filter(User.phone == payload.phone, User.id != user.id)
        .first()
    )
    if duplicated_user is not None:
        raise BadRequestException("该手机号已被其他账号绑定")

    user.phone = payload.phone
    profile.phone_verified = True
    profile.pending_phone = None
    profile.phone_code = None
    profile.phone_code_expires_at = None
    db.commit()
    db.refresh(profile)
    db.refresh(user)
    return build_me_out(user, profile)


def get_dashboard(db: Session, user: User) -> DashboardOut:
    profile = ensure_user_profile(db, user)
    signin_status: SigninStatusOut = get_signin_status(db, user)
    today_fortune: FortuneOut = get_today_fortune(db, user)
    db.commit()
    db.refresh(profile)
    db.refresh(user)
    return DashboardOut(
        profile=build_me_out(user, profile),
        signin_status=signin_status,
        today_fortune=today_fortune,
    )


def create_withdraw_request(
    db: Session,
    user: User,
    payload: WithdrawRequestCreate,
) -> WithdrawRequestSubmitOut:
    profile = ensure_user_profile(db, user)
    amount = payload.amount if payload.amount is not None else profile.pending_withdraw

    if amount <= 0:
        raise BadRequestException("暂无可提现金额")
    if amount > profile.pending_withdraw:
        raise BadRequestException("提现金额超过可提现余额")

    withdraw_request = WithdrawRequest(
        user_id=user.id,
        amount=amount,
        status="pending",
        note=payload.note or "",
    )
    db.add(withdraw_request)
    profile.pending_withdraw = round(profile.pending_withdraw - amount, 2)
    db.commit()
    db.refresh(withdraw_request)
    return WithdrawRequestSubmitOut(
        request=WithdrawRequestOut.model_validate(withdraw_request),
        pending_withdraw=profile.pending_withdraw,
    )
