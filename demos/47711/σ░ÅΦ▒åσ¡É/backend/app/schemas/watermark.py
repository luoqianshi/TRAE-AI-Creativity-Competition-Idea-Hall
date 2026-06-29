from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


WatermarkType = Literal["text", "image"]
WatermarkMode = Literal["tile", "fixed"]
WatermarkSpacing = Literal["dense", "medium", "sparse"]
WatermarkPosition = Literal[
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
]


class WatermarkPresetPayload(BaseModel):
    type: WatermarkType = "text"
    mode: WatermarkMode = "tile"
    text_content: str | None = Field(default=None, max_length=100)
    font_size: int = Field(default=24, ge=12, le=96)
    color: str = Field(default="rgba(255,255,255,0.8)", min_length=1, max_length=50)
    opacity: float = Field(default=0.3, ge=0.05, le=1)
    angle: int = Field(default=-45, ge=-90, le=90)
    spacing: WatermarkSpacing = "medium"
    position: WatermarkPosition = "bottom-right"
    scale: float = Field(default=0.5, ge=0.2, le=2)

    @field_validator("text_content")
    @classmethod
    def validate_text_content(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("颜色不能为空")
        return cleaned

    @model_validator(mode="after")
    def validate_type_specific_fields(self) -> "WatermarkPresetPayload":
        if self.type == "text" and not self.text_content:
            raise ValueError("文字水印预设必须包含文字内容")
        return self


class WatermarkPresetSyncRequest(BaseModel):
    presets: list[WatermarkPresetPayload] = Field(default_factory=list, max_length=5)


class WatermarkPresetRead(WatermarkPresetPayload):
    id: int
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
