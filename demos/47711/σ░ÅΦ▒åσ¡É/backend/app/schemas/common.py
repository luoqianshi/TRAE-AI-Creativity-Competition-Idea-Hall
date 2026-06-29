from datetime import datetime
from enum import IntEnum
from math import ceil
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel, ConfigDict, Field


DataT = TypeVar("DataT")
ItemT = TypeVar("ItemT")


class ErrorCode(IntEnum):
    SUCCESS = 0
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    CONFLICT = 409
    VALIDATION_ERROR = 422
    INTERNAL_ERROR = 500


class TimestampSchema(BaseModel):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApiResponse(BaseModel, Generic[DataT]):
    code: int = ErrorCode.SUCCESS
    message: str = "success"
    data: DataT | None = None


def success_response(
    data: DataT | None = None,
    message: str = "success",
) -> ApiResponse[DataT]:
    return ApiResponse(code=ErrorCode.SUCCESS, message=message, data=data)


class PageParams(BaseModel):
    page: int = Field(default=1, ge=1, description="页码，从 1 开始")
    size: int = Field(default=10, ge=1, le=100, description="每页数量")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


class PageMeta(BaseModel):
    page: int
    size: int
    total: int
    total_pages: int


class PageData(BaseModel, Generic[ItemT]):
    items: list[ItemT]
    pagination: PageMeta


def build_page_data(
    items: Sequence[ItemT],
    *,
    total: int,
    params: PageParams,
) -> PageData[ItemT]:
    total_pages = ceil(total / params.size) if total else 0
    return PageData(
        items=list(items),
        pagination=PageMeta(
            page=params.page,
            size=params.size,
            total=total,
            total_pages=total_pages,
        ),
    )


class FileUploadPolicy(BaseModel):
    field_name: str = "file"
    folder_field_name: str = "folder"
    max_size_mb: int
    allowed_extensions: list[str]


class StoredFile(BaseModel):
    filename: str
    original_filename: str
    storage_key: str
    url: str
    content_type: str | None = None
    size: int = Field(ge=0)
