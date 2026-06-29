from datetime import datetime, date
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class HomeProfileOut(BaseModel):
    nickname: str
    mood: str
    avatar: str
    level: int


class HomeOCOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    title: str
    emoji: str
    avatar: str
    gradient: str
    barColor: str
    story: str
    tags: list[str] = Field(default_factory=list)
    voiceLines: list[str] = Field(default_factory=list)
    level: int
    stats: dict[str, int] = Field(default_factory=dict)
    created_at: datetime


class HomeMemoryOut(BaseModel):
    id: int
    text: str
    oc: str
    emoji: str | None = None
    date: str
    created_at: datetime


class HomeCartItemOut(BaseModel):
    cartId: int
    name: str
    emoji: str
    price: float
    qty: int
    design: dict[str, Any] | None = None


class HomeCartSummaryOut(BaseModel):
    total_items: int
    total_amount: float
    items: list[HomeCartItemOut] = Field(default_factory=list)


class HomeCommissionPreviewOut(BaseModel):
    id: int
    type: str
    avatar: str
    author: str
    title: str
    priceRange: str
    applicants: list[dict[str, Any]] = Field(default_factory=list)
    samples: list[str] = Field(default_factory=list)


class HomeFortuneOut(BaseModel):
    level: str
    desc: str
    color: str
    lucky: str
    luckyNum: int
    date: date
    score: int


class HomeDashboardOut(BaseModel):
    profile: HomeProfileOut
    oc_list: list[HomeOCOut] = Field(default_factory=list)
    memories: list[HomeMemoryOut] = Field(default_factory=list)
    cart_summary: HomeCartSummaryOut
    commission_preview: list[HomeCommissionPreviewOut] = Field(default_factory=list)
    fortune_today: HomeFortuneOut
