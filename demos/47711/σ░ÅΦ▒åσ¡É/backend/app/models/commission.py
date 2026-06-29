from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.commission_application import CommissionApplication
    from app.models.user import User


class Commission(Base):
    __tablename__ = "commissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    publisher_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    avatar: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    author: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    desc: Mapped[str] = mapped_column(Text, nullable=False)
    styles: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    price_range: Mapped[str] = mapped_column(String(100), nullable=False, default="面议")
    turnaround: Mapped[str] = mapped_column(String(100), nullable=False, default="待商议")
    samples: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    applicants: Mapped[list["CommissionApplication"]] = relationship(
        "CommissionApplication",
        back_populates="commission",
        cascade="all, delete-orphan",
        order_by="CommissionApplication.time.desc()",
    )
    publisher: Mapped["User"] = relationship("User")

