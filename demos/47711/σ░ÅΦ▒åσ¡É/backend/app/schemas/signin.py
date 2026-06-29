from datetime import date

from pydantic import BaseModel, ConfigDict


class FortuneOut(BaseModel):
    title: str
    summary: str
    lucky_color: str
    lucky_number: int
    score: int
    date: date

    model_config = ConfigDict(from_attributes=True)


class SigninStatusOut(BaseModel):
    signed_today: bool
    streak: int
    recent_dates: list[str]
    latest_date: str | None = None


class SigninResultOut(BaseModel):
    already_signed: bool
    streak: int
    recent_dates: list[str]
    exp_gained: int
    level: int
    exp: int
    fortune: FortuneOut
