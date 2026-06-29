from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


CommissionType = Literal["seeker", "artist"]
ApplicationStatus = Literal["pending", "accepted", "rejected"]


class CommissionCreateRequest(BaseModel):
    type: CommissionType
    avatar: str | None = Field(default="", max_length=255)
    title: str = Field(min_length=1, max_length=120)
    desc: str = Field(min_length=1, max_length=1000)
    styles: list[str] = Field(default_factory=list, max_length=12)
    priceRange: str = Field(default="面议", max_length=100)
    turnaround: str = Field(default="待商议", max_length=100)
    samples: list[str] = Field(default_factory=list, max_length=12)

    @field_validator("avatar", "priceRange", "turnaround")
    @classmethod
    def normalize_text(cls, value: str | None) -> str:
        return (value or "").strip()

    @field_validator("title", "desc")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("字段不能为空")
        return cleaned

    @field_validator("styles")
    @classmethod
    def normalize_styles(cls, value: list[str]) -> list[str]:
        styles: list[str] = []
        for item in value:
            cleaned = item.strip()
            if cleaned and cleaned not in styles:
                styles.append(cleaned[:20])
        return styles[:12]

    @field_validator("samples")
    @classmethod
    def normalize_samples(cls, value: list[str]) -> list[str]:
        samples: list[str] = []
        for item in value:
            cleaned = item.strip()
            if cleaned:
                samples.append(cleaned[:255])
        return samples[:12]


class CommissionApplyRequest(BaseModel):
    msg: str | None = Field(default=None, max_length=300)

    @field_validator("msg")
    @classmethod
    def normalize_msg(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class CommissionApplicationOut(BaseModel):
    id: int
    user_id: int
    name: str
    msg: str | None = None
    time: datetime
    status: ApplicationStatus


class CommissionOut(BaseModel):
    id: int
    type: CommissionType
    avatar: str
    author: str
    title: str
    desc: str
    styles: list[str]
    priceRange: str
    turnaround: str
    samples: list[str]
    status: str
    time: datetime
    applicants: list[CommissionApplicationOut] = Field(default_factory=list)
    ownedByMe: bool = False
    appliedByMe: bool = False
    myApplicationId: int | None = None


class CommissionDashboardOut(BaseModel):
    received_applications: list[CommissionOut] = Field(default_factory=list)
    in_progress_as_client: list[CommissionOut] = Field(default_factory=list)
    in_progress_as_artist: list[CommissionOut] = Field(default_factory=list)
    pending_outgoing: list[CommissionOut] = Field(default_factory=list)
