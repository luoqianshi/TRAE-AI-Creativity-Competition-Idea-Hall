from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.exceptions import UnauthorizedException
from app.schemas.response import ApiResponse, success_response
from app.schemas.auth import (
    AuthPayload,
    DebugCodePayload,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    SendSmsRequest,
)
from app.services.auth_service import (
    authenticate_user,
    build_auth_payload,
    create_user,
    reset_password,
)
from app.services.sms_service import send_sms


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=ApiResponse[AuthPayload])
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[AuthPayload]:
    user = create_user(db, payload)
    return success_response(build_auth_payload(db, user), message="注册成功")


@router.post("/login", response_model=ApiResponse[AuthPayload])
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[AuthPayload]:
    user = authenticate_user(db, payload)
    if user is None:
        raise UnauthorizedException("账号或密码错误")
    return success_response(build_auth_payload(db, user), message="登录成功")


@router.post("/send-sms", response_model=ApiResponse[DebugCodePayload])
def send_sms_code(payload: SendSmsRequest) -> ApiResponse[DebugCodePayload]:
    debug_code = send_sms(payload.phone, payload.scene)
    return success_response(
        DebugCodePayload(debug_code=debug_code),
        message="验证码已发送",
    )


@router.post("/forgot-password", response_model=ApiResponse[None])
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[None]:
    reset_password(db, payload)
    return success_response(message="密码重置成功")


@router.get("/health", response_model=ApiResponse[dict[str, str]])
def health() -> ApiResponse[dict[str, str]]:
    return success_response({"status": "ok"}, message="ok")
