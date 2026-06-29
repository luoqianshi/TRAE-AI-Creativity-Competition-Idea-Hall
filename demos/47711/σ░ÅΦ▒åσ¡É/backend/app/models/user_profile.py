from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    nickname: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    mood: Mapped[str] = mapped_column(Text, nullable=False, default="")
    avatar: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    phone_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    exp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    vip: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    interact_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    setting_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_revenue: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    month_revenue: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    pending_withdraw: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    month_views: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    new_followers: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    interact_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    pending_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    phone_code: Mapped[str | None] = mapped_column(String(6), nullable=True)
    phone_code_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
