from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WorldUpdate(BaseModel):
    name: str = ""
    desc: str = ""
    powerSystem: str = ""


class WorldOut(WorldUpdate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
