from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.activity_signup import ActivitySignup


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    emoji: Mapped[str] = mapped_column(String(10), nullable=False, default="🎭")
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    event_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    max_participants: Mapped[int] = mapped_column(Integer, nullable=False, default=20)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="报名中")
    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    organizer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    organizer_avatar: Mapped[str | None] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    signups: Mapped[list["ActivitySignup"]] = relationship(
        "ActivitySignup",
        back_populates="activity",
        cascade="all, delete-orphan",
        order_by="ActivitySignup.created_at.desc()",
    )
