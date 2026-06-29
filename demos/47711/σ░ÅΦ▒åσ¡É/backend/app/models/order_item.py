from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    product_name: Mapped[str] = mapped_column(String(120), nullable=False)
    product_emoji: Mapped[str] = mapped_column(String(20), nullable=False, default="🛍️")
    product_desc: Mapped[str] = mapped_column(Text, nullable=False, default="")
    product_status: Mapped[str] = mapped_column(String(30), nullable=False, default="在售")
    print_area: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    line_total: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    design_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False, default="physical")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    order = relationship("Order", back_populates="items")
