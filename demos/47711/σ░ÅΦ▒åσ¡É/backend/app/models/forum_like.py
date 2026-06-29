from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ForumLike(Base):
    __tablename__ = "forum_likes"
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_forum_like_user_post"),
        UniqueConstraint("user_id", "comment_id", name="uq_forum_like_user_comment"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    post_id: Mapped[int | None] = mapped_column(
        ForeignKey("forum_posts.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    comment_id: Mapped[int | None] = mapped_column(
        ForeignKey("forum_comments.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
