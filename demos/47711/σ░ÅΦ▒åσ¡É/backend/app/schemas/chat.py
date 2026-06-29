from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.memory import MemoryOut
from app.schemas.vip import VipStatusOut


MessageType = Literal["system", "user", "oc"]


class ChatSessionCreateRequest(BaseModel):
    oc_id: str
    oc_name: str
    oc_emoji: str | None = None
    oc_avatar: str | None = None
    oc_gradient: str | None = None
    oc_title: str | None = None
    initial_intimacy: int = Field(default=0, ge=0)
    initial_level: int = Field(default=1, ge=1)

    @field_validator("oc_id", "oc_name")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("字段不能为空")
        return cleaned


class ChatMessageSendRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("消息不能为空")
        return cleaned


class ChatGiftRequest(BaseModel):
    gift_code: str | None = None
    name: str = Field(min_length=1, max_length=50)
    emoji: str | None = None
    intimacy: int = Field(default=1, ge=1, le=100)
    reply_text: str | None = Field(default=None, max_length=500)


class VoiceCallLogRequest(BaseModel):
    duration_seconds: int = Field(ge=1, le=60 * 60 * 8)
    tone_name: str | None = Field(default=None, max_length=50)
    tone_emoji: str | None = Field(default=None, max_length=10)


class ChatMessageOut(BaseModel):
    id: int
    session_id: int
    type: MessageType
    text: str | None = None
    image_url: str | None = None
    time: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSessionOut(BaseModel):
    id: int
    oc_id: str
    oc_name: str
    oc_emoji: str | None = None
    oc_avatar: str | None = None
    oc_gradient: str | None = None
    oc_title: str | None = None
    intimacy: int
    total_affinity: int
    level: int
    interaction_count: int
    message_count: int
    last_message_preview: str | None = None
    is_vip_active: bool
    vip_expires_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSessionListPayload(BaseModel):
    items: list[ChatSessionOut]
    vip: VipStatusOut


class ChatMessageListPayload(BaseModel):
    session: ChatSessionOut
    items: list[ChatMessageOut]
    vip: VipStatusOut


class ChatInteractionPayload(BaseModel):
    session: ChatSessionOut
    messages: list[ChatMessageOut]
    memories: list[MemoryOut] = Field(default_factory=list)
    vip: VipStatusOut

