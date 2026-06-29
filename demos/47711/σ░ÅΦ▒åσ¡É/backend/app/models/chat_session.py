from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = (
        UniqueConstraint("user_id", "oc_id", name="uq_chat_sessions_user_oc"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    oc_id: Mapped[str] = mapped_column(String(64), nullable=False)
    oc_name: Mapped[str] = mapped_column(String(100), nullable=False)
    oc_emoji: Mapped[str | None] = mapped_column(String(20), nullable=True)
    oc_avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    oc_gradient: Mapped[str | None] = mapped_column(String(255), nullable=True)
    oc_title: Mapped[str | None] = mapped_column(String(100), nullable=True)
    intimacy: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_affinity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    interaction_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    message_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_message_preview: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_vip_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vip_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    messages = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.id",
    )
    memories = relationship(
        "Memory",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="Memory.id.desc()",
    )

