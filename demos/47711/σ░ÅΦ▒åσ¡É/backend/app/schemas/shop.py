from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PrintAreaOut(BaseModel):
    width: int = Field(default=0, ge=0)
    height: int = Field(default=0, ge=0)
    shape: str = "rect"
    label: str = ""


class DesignPayload(BaseModel):
    image_path: str = Field(..., max_length=500)
    x: float = 0
    y: float = 0
    scale: float = Field(default=1.0, gt=0)

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("image_path")
    @classmethod
    def validate_image_path(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("image_path 不能为空")
        return cleaned


class ProductOut(BaseModel):
    id: int
    name: str
    emoji: str
    price: float
    desc: str
    status: str
    print_area: PrintAreaOut
    kind: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListPayload(BaseModel):
    items: list[ProductOut]


class CartItemCreateRequest(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=99)
    design: DesignPayload | None = None


class CartItemUpdateRequest(BaseModel):
    quantity: int | None = Field(default=None, ge=1, le=99)
    design: DesignPayload | None = None


class CartItemOut(BaseModel):
    id: int
    product_id: int
    name: str
    emoji: str
    price: float
    desc: str
    status: str
    print_area: PrintAreaOut
    quantity: int
    design: DesignPayload | None = None
    line_total: float
    kind: str
    created_at: datetime
    updated_at: datetime


class CartPayload(BaseModel):
    items: list[CartItemOut]
    total_quantity: int
    total_amount: float
    currency: str = "CNY"
