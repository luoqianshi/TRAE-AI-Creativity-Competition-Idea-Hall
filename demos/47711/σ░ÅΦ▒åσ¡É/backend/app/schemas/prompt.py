from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PromptCreateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=1000)
    tags: list[str] = Field(default_factory=list, max_length=8)

    @field_validator("prompt")
    @classmethod
    def normalize_prompt(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("提示词不能为空")
        return cleaned

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, value: list[str]) -> list[str]:
        cleaned: list[str] = []
        for tag in value:
            normalized = tag.strip()
            if normalized and normalized not in cleaned:
                cleaned.append(normalized[:20])
        return cleaned[:8]


class PromptCommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=500)

    @field_validator("content")
    @classmethod
    def normalize_content(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("评论不能为空")
        return cleaned


class PromptCommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    prompt_id: int
    user_id: int
    author_name: str
    author_avatar: str = ""
    content: str
    created_at: datetime
    updated_at: datetime


class PromptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    author_name: str
    author_avatar: str = ""
    prompt: str
    tags: list[str] = Field(default_factory=list)
    like_count: int = 0
    comment_count: int = 0
    liked_by_me: bool = False
    comments: list[PromptCommentOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class PromptListPayload(BaseModel):
    items: list[PromptOut]


class PromptLikeTogglePayload(BaseModel):
    prompt_id: int
    liked: bool
    like_count: int
