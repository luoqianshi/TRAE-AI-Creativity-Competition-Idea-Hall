from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


TextMode = Literal["story", "diary", "dialogue", "poem"]
JobType = Literal["image", "video", "text"]
JobStatus = Literal["queued", "running", "succeeded", "failed", "not_implemented"]


class TextGenerateRequest(BaseModel):
    mode: TextMode
    oc_id: int | None = None
    requirement: str = Field(default="", max_length=300)

    @field_validator("requirement")
    @classmethod
    def validate_requirement(cls, value: str) -> str:
        return value.strip()


class TextGenerateOut(BaseModel):
    mode: TextMode
    provider: str
    content: str


class AssistantChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("消息不能为空")
        return cleaned


class AssistantChatOut(BaseModel):
    provider: str
    content: str


class GenerationJobCreateRequest(BaseModel):
    job_type: JobType
    prompt: str = Field(min_length=1, max_length=1000)
    oc_id: int | None = None
    template_name: str = Field(default="", max_length=100)
    input_payload: dict[str, Any] = Field(default_factory=dict)

    @field_validator("prompt", "template_name")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        return value.strip()


class GenerationJobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    oc_id: int | None = None
    job_type: JobType
    status: JobStatus
    provider: str
    prompt: str
    template_name: str = ""
    input_payload: dict[str, Any] = Field(default_factory=dict)
    output_payload: dict[str, Any] = Field(default_factory=dict)
    error_message: str = ""
    created_at: datetime
    updated_at: datetime
