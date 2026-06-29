from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ActivitySignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=30)
    phone: str = Field(min_length=11, max_length=11)
    note: str | None = Field(default=None, max_length=200)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("姓名不能为空")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 11:
            raise ValueError("请输入11位手机号")
        return value

    @field_validator("note")
    @classmethod
    def validate_note(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class ActivitySignupOut(BaseModel):
    id: int
    user_id: int | None = None
    name: str
    phone: str
    note: str | None = None
    signup_time: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityOut(BaseModel):
    id: int
    emoji: str
    title: str
    description: str
    date: str
    time: str
    location: str
    max_participants: int
    tags: list[str]
    organizer: str
    organizer_avatar: str | None = None
    status: str
    signup_count: int
    is_signed_up: bool = False
    my_signup_time: datetime | None = None
    signups: list[ActivitySignupOut] = Field(default_factory=list)
