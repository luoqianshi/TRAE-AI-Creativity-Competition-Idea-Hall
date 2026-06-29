from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.schemas.shop import DesignPayload, PrintAreaOut


PayDemoAction = Literal[
    "start",
    "succeed",
    "fail",
    "cancel",
    "callback_success",
    "callback_fail",
]


class OrderCreateRequest(BaseModel):
    source: str = Field(default="cart", max_length=30)
    note: str | None = Field(default="", max_length=200)

    @field_validator("source")
    @classmethod
    def validate_source(cls, value: str) -> str:
        cleaned = value.strip() or "cart"
        return cleaned

    @field_validator("note")
    @classmethod
    def normalize_note(cls, value: str | None) -> str:
        if value is None:
            return ""
        return value.strip()


class OrderItemOut(BaseModel):
    id: int
    product_id: int | None
    name: str
    emoji: str
    desc: str
    status: str
    print_area: PrintAreaOut
    quantity: int
    unit_price: float
    line_total: float
    design: DesignPayload | None
    kind: str


class OrderOut(BaseModel):
    id: int
    order_no: str
    user_id: int
    status: str
    payment_status: str
    payment_channel: str
    payment_provider: str | None
    payment_reference: str | None
    payment_payload: dict[str, Any]
    currency: str
    subtotal_amount: float
    discount_amount: float
    total_amount: float
    total_quantity: int
    paid_amount: float
    paid_at: datetime | None
    note: str
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemOut]


class OrderListPayload(BaseModel):
    items: list[OrderOut]


class OrderPayDemoRequest(BaseModel):
    action: PayDemoAction = "start"
    payment_provider: str | None = Field(default="demo-gateway", max_length=50)
    callback_payload: dict[str, Any] | None = None


class RevenueDashboardOut(BaseModel):
    currency: str
    total_revenue: float
    month_revenue: float
    pending_withdraw: float
    available_withdraw: float
    paid_orders_count: int
    withdrawn_total: float
    last_paid_at: datetime | None = None
    last_withdraw_requested_at: datetime | None = None
