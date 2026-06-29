from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CollabCreateRequest(BaseModel):
    oc_name: str = Field(min_length=1, max_length=100)
    emoji: str = Field(min_length=1, max_length=10)
    description: str = Field(min_length=5, max_length=300)
    tags: list[str] = Field(default_factory=list, max_length=8)

    @field_validator("oc_name", "emoji", "description")
    @classmethod
    def validate_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("字段不能为空")
        return cleaned

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: list[str]) -> list[str]:
        tags: list[str] = []
        for tag in value:
            cleaned = tag.strip()
            if cleaned and cleaned not in tags:
                tags.append(cleaned[:20])
        return tags[:8]


class CollabApplyRequest(BaseModel):
    message: str | None = Field(default=None, max_length=200)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class CollabApplicationOut(BaseModel):
    id: int
    user_id: int
    applicant_name: str
    message: str | None = None
    apply_time: datetime

    model_config = ConfigDict(from_attributes=True)


class CollabOut(BaseModel):
    id: int
    owner_user_id: int | None = None
    owner_name: str
    oc_name: str
    emoji: str
    description: str
    status: str
    tags: list[str]
    application_count: int
    applied: bool = False
    owned_by_me: bool = False
    created_at: datetime
    applications: list[CollabApplicationOut] = Field(default_factory=list)
