from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class ForumPostCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=500)
    tags: list[str] = Field(default_factory=list, max_length=3)
    author_name: str = Field(min_length=1, max_length=50)
    author_avatar: str | None = Field(default=None, max_length=500)

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("帖子内容不能为空")
        return cleaned

    @field_validator("author_name")
    @classmethod
    def validate_author_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("作者名称不能为空")
        return cleaned

    @field_validator("author_avatar")
    @classmethod
    def validate_author_avatar(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: list[str]) -> list[str]:
        cleaned: list[str] = []
        seen: set[str] = set()
        for tag in value:
            item = tag.strip()
            if not item or item in seen:
                continue
            if len(item) > 20:
                raise ValueError("标签长度不能超过20个字符")
            cleaned.append(item)
            seen.add(item)
        return cleaned


class ForumCommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=500)
    author_name: str = Field(min_length=1, max_length=50)
    author_avatar: str | None = Field(default=None, max_length=500)

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("评论内容不能为空")
        return cleaned

    @field_validator("author_name")
    @classmethod
    def validate_author_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("作者名称不能为空")
        return cleaned

    @field_validator("author_avatar")
    @classmethod
    def validate_author_avatar(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class ForumCommentOut(BaseModel):
    id: int
    post_id: int
    user_id: int
    author_name: str
    author_avatar: str | None = None
    content: str
    created_at: datetime
    updated_at: datetime
    like_count: int = 0
    liked_by_me: bool = False


class ForumPostListItem(BaseModel):
    id: int
    user_id: int
    author_name: str
    author_avatar: str | None = None
    content: str
    tags: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    like_count: int = 0
    comment_count: int = 0
    liked_by_me: bool = False
    can_delete: bool = False


class ForumPostDetail(ForumPostListItem):
    comments: list[ForumCommentOut] = Field(default_factory=list)


class ForumLikeTogglePayload(BaseModel):
    target_id: int
    liked: bool
    like_count: int

