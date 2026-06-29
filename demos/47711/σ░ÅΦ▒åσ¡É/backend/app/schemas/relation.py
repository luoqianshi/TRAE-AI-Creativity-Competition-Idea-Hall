from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RelationBase(BaseModel):
    ocId: int
    name: str
    emoji: str = "🌸"
    avatar: str = ""
    type: str = "挚友"
    color: str = "#f472b6"
    reverseType: str = "挚友"
    reverseColor: str = "#f472b6"
    asymmetric: bool = False


class RelationCreate(RelationBase):
    pass


class RelationUpdate(BaseModel):
    ocId: int | None = None
    name: str | None = None
    emoji: str | None = None
    avatar: str | None = None
    type: str | None = None
    color: str | None = None
    reverseType: str | None = None
    reverseColor: str | None = None
    asymmetric: bool | None = None


class RelationOut(RelationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
