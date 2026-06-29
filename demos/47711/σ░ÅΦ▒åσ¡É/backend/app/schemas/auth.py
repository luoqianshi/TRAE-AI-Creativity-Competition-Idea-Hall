from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RegisterRequest(BaseModel):
    username: str = Field(min_length=2, max_length=20)
    phone: str = Field(min_length=11, max_length=11)
    password: str = Field(min_length=6, max_length=20)
    sms_code: str = Field(min_length=6, max_length=6)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("账号不能为空")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 11:
            raise ValueError("请输入11位手机号")
        return value

    @field_validator("sms_code")
    @classmethod
    def validate_sms_code(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 6:
            raise ValueError("请输入6位验证码")
        return value


class LoginRequest(BaseModel):
    username: str = Field(min_length=2, max_length=20)
    password: str = Field(min_length=6, max_length=20)


class SendSmsRequest(BaseModel):
    phone: str = Field(min_length=11, max_length=11)
    scene: str = Field(min_length=3, max_length=50)

    @field_validator("phone")
    @classmethod
    def validate_send_sms_phone(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 11:
            raise ValueError("请输入11位手机号")
        return value

    @field_validator("scene")
    @classmethod
    def validate_scene(cls, value: str) -> str:
        scene = value.strip().lower().replace("-", "_")
        allowed = {
            "register",
            "login",
            "register_login",
            "change_phone",
            "reset_password",
            "password_reset",
            "bind_phone",
            "bind_new_phone",
            "verify_bind_phone",
        }
        if scene not in allowed:
            raise ValueError("短信场景不支持")
        return scene


class ForgotPasswordRequest(BaseModel):
    phone: str = Field(min_length=11, max_length=11)
    code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=6, max_length=20)

    @field_validator("phone")
    @classmethod
    def validate_forgot_phone(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 11:
            raise ValueError("请输入11位手机号")
        return value

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 6:
            raise ValueError("请输入6位验证码")
        return value


class UserOut(BaseModel):
    id: int
    username: str
    phone: str
    nickname: str
    phone_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthPayload(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class DebugCodePayload(BaseModel):
    debug_code: str | None = None


class TokenPayload(BaseModel):
    sub: str
