from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MediaAssetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    biz_type: str
    biz_id: str
    file_type: str
    url: str
    mime_type: str | None = None
    size: int = Field(ge=0)
    width: int | None = None
    height: int | None = None
    duration: float | None = None
    created_at: datetime


class OCMediaCollection(BaseModel):
    oc_id: str
    images: list[MediaAssetRead]
    videos: list[MediaAssetRead]


class DeleteMediaResult(BaseModel):
    id: int


class MediaUploadPolicy(BaseModel):
    max_size_mb: int
    image_extensions: list[str]
    video_extensions: list[str]
