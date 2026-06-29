from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OC(Base):
    __tablename__ = "ocs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    emoji: Mapped[str] = mapped_column(String(16), default="🌙", nullable=False)
    avatar: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    gradient: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    bar_color: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    story: Mapped[str] = mapped_column(Text, default="", nullable=False)
    tags: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    voice_lines: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    height: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    weight: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    personality: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    alignment: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    skills: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    weaknesses: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    catchphrases: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    timeline: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    stats: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
