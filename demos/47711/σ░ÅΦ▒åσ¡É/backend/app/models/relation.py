from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Relation(Base):
    __tablename__ = "relations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    oc_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("ocs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    emoji: Mapped[str] = mapped_column(String(16), default="🌸", nullable=False)
    avatar: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    type: Mapped[str] = mapped_column(String(64), default="挚友", nullable=False)
    color: Mapped[str] = mapped_column(String(32), default="#f472b6", nullable=False)
    reverse_type: Mapped[str] = mapped_column(String(64), default="挚友", nullable=False)
    reverse_color: Mapped[str] = mapped_column(
        String(32), default="#f472b6", nullable=False
    )
    asymmetric: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
