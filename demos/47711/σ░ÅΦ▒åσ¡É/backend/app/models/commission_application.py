from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.commission import Commission
    from app.models.user import User


class CommissionApplication(Base):
    __tablename__ = "commission_applications"
    __table_args__ = (
        UniqueConstraint(
            "commission_id",
            "user_id",
            name="uq_commission_application_user",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    commission_id: Mapped[int] = mapped_column(
        ForeignKey("commissions.id"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    msg: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    time: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    commission: Mapped["Commission"] = relationship(
        "Commission",
        back_populates="applicants",
    )
    user: Mapped["User"] = relationship("User")

