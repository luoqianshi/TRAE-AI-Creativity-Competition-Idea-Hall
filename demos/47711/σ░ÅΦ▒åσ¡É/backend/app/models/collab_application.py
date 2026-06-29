from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.collab_listing import CollabListing
    from app.models.user import User


class CollabApplication(Base):
    __tablename__ = "collab_applications"
    __table_args__ = (
        UniqueConstraint("collab_id", "user_id", name="uq_collab_application_user"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    collab_id: Mapped[int] = mapped_column(
        ForeignKey("collab_listings.id"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    applicant_name: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    collab: Mapped["CollabListing"] = relationship(
        "CollabListing", back_populates="applications"
    )
    user: Mapped["User"] = relationship("User")
