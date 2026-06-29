from math import ceil
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel, Field


ItemT = TypeVar("ItemT")


class PageParams(BaseModel):
    page: int = Field(default=1, ge=1)
    size: int = Field(default=10, ge=1, le=100)

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
