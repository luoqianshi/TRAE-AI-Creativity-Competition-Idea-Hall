from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.signin import FortuneOut, SigninStatusOut


class MeOut(BaseModel):
    id: int
    username: str
    nickname: str
    mood: str
    avatar: str
    phone: str
    phone_verified: bool
    level: int
    exp: int
    vip: bool
    interact_days: int
    setting_count: int
    total_revenue: float
    month_revenue: float
    pending_withdraw: float
    month_views: int
    new_followers: int
    interact_rate: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UpdateMeRequest(BaseModel):
    nickname: str | None = Field(default=None, max_length=50)
    mood: str | None = Field(default=None, max_length=100)

    @field_validator("nickname", "mood")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()


class AvatarUploadOut(BaseModel):
    avatar: str


class PhoneSendCodeRequest(BaseModel):
    phone: str = Field(min_length=11, max_length=11)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 11:
            raise ValueError("请输入11位手机号")
        return value


class PhoneVerifyRequest(BaseModel):
    phone: str = Field(min_length=11, max_length=11)
    code: str = Field(min_length=6, max_length=6)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 11:
            raise ValueError("请输入11位手机号")
        return value

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 6:
            raise ValueError("请输入6位验证码")
        return value


class DashboardOut(BaseModel):
    profile: MeOut
    signin_status: SigninStatusOut
    today_fortune: FortuneOut


class WithdrawRequestCreate(BaseModel):
    amount: float | None = Field(default=None, gt=0)
    note: str | None = Field(default="", max_length=200)

    @field_validator("note")
    @classmethod
    def strip_note(cls, value: str | None) -> str | None:
        if value is None:
            return ""
        return value.strip()


class WithdrawRequestOut(BaseModel):
    id: int
    amount: float
    status: str
    note: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WithdrawRequestSubmitOut(BaseModel):
    request: WithdrawRequestOut
    pending_withdraw: float
