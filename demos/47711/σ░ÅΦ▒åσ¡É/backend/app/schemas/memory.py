from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MemoryOut(BaseModel):
    id: int
    text: str
    oc: str
    emoji: str | None = None
    date: str
    session_id: int | None = None
    oc_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MemoryListPayload(BaseModel):
    items: list[MemoryOut]

