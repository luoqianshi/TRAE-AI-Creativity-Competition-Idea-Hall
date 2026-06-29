from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


DEFAULT_STATS = {"intimacy": 0, "combat": 0, "emotion": 0}


class SkillItem(BaseModel):
    name: str = ""
    level: int = 1


class TimelineItem(BaseModel):
    time: str = ""
    event: str = ""


class OCBase(BaseModel):
    name: str
    title: str = ""
    emoji: str = "🌙"
    avatar: str = ""
    gradient: str = ""
    barColor: str = ""
    story: str = ""
    tags: list[str] = Field(default_factory=list)
    voiceLines: list[str] = Field(default_factory=list)
    height: str = ""
    weight: str = ""
    personality: list[str] = Field(default_factory=list)
    alignment: str = ""
    skills: list[SkillItem] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    catchphrases: list[str] = Field(default_factory=list)
    timeline: list[TimelineItem] = Field(default_factory=list)
    level: int = 1
    stats: dict[str, int] = Field(default_factory=lambda: dict(DEFAULT_STATS))


class OCCreate(OCBase):
    pass


class OCUpdate(BaseModel):
    name: str | None = None
    title: str | None = None
    emoji: str | None = None
    avatar: str | None = None
    gradient: str | None = None
    barColor: str | None = None
    story: str | None = None
    tags: list[str] | None = None
    voiceLines: list[str] | None = None
    height: str | None = None
    weight: str | None = None
    personality: list[str] | None = None
    alignment: str | None = None
    skills: list[SkillItem] | None = None
    weaknesses: list[str] | None = None
    catchphrases: list[str] | None = None
    timeline: list[TimelineItem] | None = None
    level: int | None = None
    stats: dict[str, int] | None = None


class OCOut(OCBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
