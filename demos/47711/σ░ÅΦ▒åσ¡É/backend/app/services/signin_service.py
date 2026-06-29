from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException
from app.models.fortune import Fortune
from app.models.signin import SignIn
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.signin import FortuneOut, SigninResultOut, SigninStatusOut


FORTUNE_PRESETS: tuple[dict[str, object], ...] = (
    {
        "title": "大吉",
        "summary": "灵感流动很顺，适合更新 OC 设定、发作品或推进约稿沟通。",
        "lucky_color": "樱粉",
        "lucky_number": 8,
        "score": 98,
    },
    {
        "title": "中吉",
        "summary": "今天适合整理资料和稳定输出，慢一点反而更容易拿到结果。",
        "lucky_color": "雾紫",
        "lucky_number": 5,
        "score": 86,
    },
    {
        "title": "小吉",
        "summary": "适合查漏补缺，把头像、资料页和设定细节补完整。",
        "lucky_color": "月白",
        "lucky_number": 3,
        "score": 76,
    },
    {
        "title": "吉",
        "summary": "适合和同好互动，评论区和私聊里可能会冒出新的合作机会。",
        "lucky_color": "湖蓝",
        "lucky_number": 6,
        "score": 82,
    },
    {
        "title": "末吉",
        "summary": "别急着做大改动，先把节奏稳住，今天更适合维护已有内容。",
        "lucky_color": "浅灰",
        "lucky_number": 2,
        "score": 68,
    },
)

EXP_GAIN_PER_SIGNIN = 5


def _today() -> date:
    return datetime.now().date()


def _ensure_profile(db: Session, user: User) -> UserProfile:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if profile is not None:
        return profile

    profile = UserProfile(
        user_id=user.id,
        nickname=user.username,
        mood="初次来到这个世界...",
        avatar="",
        phone_verified=False,
    )
    db.add(profile)
    db.flush()
    return profile


def _query_sign_dates(db: Session, user_id: int) -> list[date]:
    rows = (
        db.query(SignIn.sign_in_date)
        .filter(SignIn.user_id == user_id)
        .order_by(SignIn.sign_in_date.desc())
        .all()
    )
    return [row[0] for row in rows]


def _calculate_streak(sign_dates: list[date]) -> int:
    if not sign_dates:
        return 0

    unique_dates = sorted(set(sign_dates), reverse=True)
    streak = 1
    current = unique_dates[0]

    for next_date in unique_dates[1:]:
        if current - next_date == timedelta(days=1):
            streak += 1
            current = next_date
            continue
        break

    return streak


def _build_status(sign_dates: list[date]) -> SigninStatusOut:
    today = _today()
    recent_dates = sorted({item.isoformat() for item in sign_dates[:30]})
    signed_today = today.isoformat() in recent_dates

    if signed_today:
        streak_source = sign_dates
    else:
        yesterday = today - timedelta(days=1)
        streak_source = [item for item in sign_dates if item <= yesterday]

    latest_date = streak_source[0].isoformat() if streak_source else None
    return SigninStatusOut(
        signed_today=signed_today,
        streak=_calculate_streak(streak_source),
        recent_dates=recent_dates,
        latest_date=latest_date,
    )


def _build_fortune_payload(fortune: Fortune) -> FortuneOut:
    return FortuneOut(
        title=fortune.title,
        summary=fortune.summary,
        lucky_color=fortune.lucky_color,
        lucky_number=fortune.lucky_number,
        score=fortune.score,
        date=fortune.fortune_date,
    )


def get_today_fortune(db: Session, user: User) -> FortuneOut:
    today = _today()
    fortune = (
        db.query(Fortune)
        .filter(Fortune.user_id == user.id, Fortune.fortune_date == today)
        .first()
    )
    if fortune is None:
        seed = (user.id * 1000003 + today.toordinal()) % len(FORTUNE_PRESETS)
        preset = FORTUNE_PRESETS[seed]
        fortune = Fortune(
            user_id=user.id,
            fortune_date=today,
            title=str(preset["title"]),
            summary=str(preset["summary"]),
            lucky_color=str(preset["lucky_color"]),
            lucky_number=int(preset["lucky_number"]),
            score=int(preset["score"]),
        )
        db.add(fortune)
        db.commit()
        db.refresh(fortune)

    return _build_fortune_payload(fortune)


def get_signin_status(db: Session, user: User) -> SigninStatusOut:
    sign_dates = _query_sign_dates(db, user.id)
    return _build_status(sign_dates)


def sign_in_today(db: Session, user: User) -> SigninResultOut:
    today = _today()
    existing = (
        db.query(SignIn)
        .filter(SignIn.user_id == user.id, SignIn.sign_in_date == today)
        .first()
    )
    profile = _ensure_profile(db, user)
    fortune = get_today_fortune(db, user)

    if existing is not None:
        status = get_signin_status(db, user)
        return SigninResultOut(
            already_signed=True,
            streak=status.streak,
            recent_dates=status.recent_dates,
            exp_gained=0,
            level=profile.level,
            exp=profile.exp,
            fortune=fortune,
        )

    db.add(SignIn(user_id=user.id, sign_in_date=today))
    profile.exp += EXP_GAIN_PER_SIGNIN
    while profile.exp >= 100:
        profile.exp -= 100
        profile.level += 1
    profile.interact_days += 1
    db.commit()

    status = get_signin_status(db, user)
    return SigninResultOut(
        already_signed=False,
        streak=status.streak,
        recent_dates=status.recent_dates,
        exp_gained=EXP_GAIN_PER_SIGNIN,
        level=profile.level,
        exp=profile.exp,
        fortune=fortune,
    )
