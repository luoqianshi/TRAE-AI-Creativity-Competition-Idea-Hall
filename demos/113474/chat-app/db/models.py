"""SQLAlchemy ORM 模型（SQLite 适配）"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """SQLAlchemy 2.0 声明式基类"""


class User(Base):
    """用户表（含 AI bot 账号）"""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(128))
    nickname: Mapped[str | None] = mapped_column(String(64))
    avatar: Mapped[str | None] = mapped_column(Text)
    is_bot: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )


class Friendship(Base):
    """好友关系（双向记录）"""

    __tablename__ = "friendships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    friend_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)
    # pending | accepted | blocked
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime)


class Message(Base):
    """消息表"""

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sender_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    receiver_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    msg_type: Mapped[str] = mapped_column(String(16), default="text")
    # text | image | system

    content: Mapped[str | None] = mapped_column(Text)
    media_path: Mapped[str | None] = mapped_column(Text)

    status: Mapped[str] = mapped_column(String(16), default="sent")
    # sent | delivered | read

    llm_model: Mapped[str | None] = mapped_column(String(64))
    prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    completion_tokens: Mapped[int | None] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), index=True
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime)


class AIBot(Base):
    """AI 机器人配置"""

    __tablename__ = "ai_bots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), unique=True, index=True
    )
    name: Mapped[str] = mapped_column(String(64))
    provider: Mapped[str] = mapped_column(String(32), default="local")
    # local | deepseek | openai

    api_key: Mapped[str | None] = mapped_column(String(256))
    base_url: Mapped[str] = mapped_column(String(256))
    model: Mapped[str] = mapped_column(String(64))
    system_prompt: Mapped[str | None] = mapped_column(Text)

    max_history: Mapped[int] = mapped_column(Integer, default=10)
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    max_tokens: Mapped[int] = mapped_column(Integer, default=256)
    image_gen_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    created_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )


class MediaAsset(Base):
    """素材去重表"""

    __tablename__ = "media_assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sha256: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    local_path: Mapped[str] = mapped_column(Text)
    media_type: Mapped[str] = mapped_column(String(16), default="image")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
