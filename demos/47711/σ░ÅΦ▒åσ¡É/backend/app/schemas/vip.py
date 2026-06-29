from datetime import datetime

from pydantic import BaseModel, Field


class VipActivateDemoRequest(BaseModel):
    plan_code: str = Field(default="quarter")
    session_id: int | None = None


class VipStatusOut(BaseModel):
    is_active: bool
    plan_code: str
    activated_at: datetime | None = None
    expires_at: datetime | None = None


class VipActivateDemoPayload(BaseModel):
    vip: VipStatusOut
    activation_message: dict | None = None

