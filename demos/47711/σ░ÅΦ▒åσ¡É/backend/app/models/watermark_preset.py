from datetime import datetime
from typing import TYPE_CHECKING, Literal

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


WatermarkType = Literal["text", "image"]
WatermarkMode = Literal["tile", "fixed"]


class WatermarkPreset(Base):
    __tablename__ = "watermark_presets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    type: Mapped[WatermarkType] = mapped_column(String(20), nullable=False, default="text")
    mode: Mapped[WatermarkMode] = mapped_column(String(20), nullable=False, default="tile")
    text_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    font_size: Mapped[int] = mapped_column(Integer, nullable=False, default=24)
    color: Mapped[str] = mapped_column(String(50), nullable=False, default="rgba(255,255,255,0.8)")
    opacity: Mapped[float] = mapped_column(Float, nullable=False, default=0.3)
    angle: Mapped[int] = mapped_column(Integer, nullable=False, default=-45)
    spacing: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    position: Mapped[str] = mapped_column(String(30), nullable=False, default="bottom-right")
    scale: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User")
