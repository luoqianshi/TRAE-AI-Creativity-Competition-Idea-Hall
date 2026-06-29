from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import DebugCodePayload
from app.schemas.response import ApiResponse, success_response
from app.schemas.signin import FortuneOut, SigninResultOut, SigninStatusOut
from app.schemas.user import (
    AvatarUploadOut,
    DashboardOut,
    MeOut,
    PhoneSendCodeRequest,
    PhoneVerifyRequest,
    UpdateMeRequest,
    WithdrawRequestCreate,
    WithdrawRequestSubmitOut,
)
from app.services.signin_service import get_signin_status, get_today_fortune, sign_in_today
from app.services.user_service import (
    create_withdraw_request,
    get_dashboard,
    get_me,
    send_phone_verify_code,
    update_me,
    upload_avatar,
    verify_phone,
)


router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=ApiResponse[MeOut])
def read_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[MeOut]:
    return success_response(get_me(db, current_user), message="获取成功")


@router.patch("", response_model=ApiResponse[MeOut])
def patch_me(
    payload: UpdateMeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[MeOut]:
    return success_response(update_me(db, current_user, payload), message="资料已更新")


@router.post("/avatar", response_model=ApiResponse[AvatarUploadOut])
def post_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[AvatarUploadOut]:
    me = upload_avatar(db, current_user, file)
    return success_response(
        AvatarUploadOut(avatar=me.avatar),
        message="头像已更新",
    )


@router.post("/phone/send-code", response_model=ApiResponse[DebugCodePayload])
def post_phone_send_code(
    payload: PhoneSendCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[DebugCodePayload]:
    debug_code = send_phone_verify_code(db, current_user, payload)
    return success_response(
        DebugCodePayload(debug_code=debug_code),
        message="验证码已发送",
    )


@router.post("/phone/verify", response_model=ApiResponse[MeOut])
def post_phone_verify(
    payload: PhoneVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[MeOut]:
    return success_response(
        verify_phone(db, current_user, payload),
        message="手机号已绑定",
    )


@router.post("/signin", response_model=ApiResponse[SigninResultOut])
def post_signin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[SigninResultOut]:
    result = sign_in_today(db, current_user)
    message = "今日已签到" if result.already_signed else "签到成功"
    return success_response(result, message=message)


@router.get("/signin/status", response_model=ApiResponse[SigninStatusOut])
def read_signin_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[SigninStatusOut]:
    return success_response(get_signin_status(db, current_user), message="获取成功")


@router.get("/fortune/today", response_model=ApiResponse[FortuneOut])
def read_today_fortune(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[FortuneOut]:
    return success_response(get_today_fortune(db, current_user), message="获取成功")


@router.get("/dashboard", response_model=ApiResponse[DashboardOut])
def read_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[DashboardOut]:
    return success_response(get_dashboard(db, current_user), message="获取成功")


@router.post("/withdraw-requests", response_model=ApiResponse[WithdrawRequestSubmitOut])
def post_withdraw_request(
    payload: WithdrawRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[WithdrawRequestSubmitOut]:
    return success_response(
        create_withdraw_request(db, current_user, payload),
        message="提现申请已提交",
    )
