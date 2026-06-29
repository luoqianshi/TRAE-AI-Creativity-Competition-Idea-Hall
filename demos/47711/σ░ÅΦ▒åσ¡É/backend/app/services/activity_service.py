from datetime import datetime

from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.models.activity import Activity
from app.models.activity_signup import ActivitySignup
from app.models.user import User
from app.schemas.activity import ActivityOut, ActivitySignupOut, ActivitySignupRequest


DEFAULT_ACTIVITY_SEEDS = [
    {
        "emoji": "🎭",
        "title": "OC 角色扮演线下聚会",
        "description": "带上你的 OC 设定集，和其他创作者面对面交流。现场有角色扮演、即兴剧情和速写摊位。",
        "event_at": datetime(2026, 5, 1, 14, 0),
        "location": "上海·静安区创意园 3F",
        "max_participants": 30,
        "tags": ["线下", "Cosplay"],
        "organizer_name": "次元组委会",
        "organizer_avatar": "🌸",
        "status": "报名中",
        "signups": [
            {"name": "星辰", "phone": "13812341234", "note": "带两个 OC"},
            {"name": "月落", "phone": "13956785678", "note": None},
        ],
    },
    {
        "emoji": "🎨",
        "title": "OC 立绘创作大赛",
        "description": "以“星与海”为主题，为你的 OC 绘制一幅立绘参赛，设有画技奖、设定奖和人气奖。",
        "event_at": datetime(2026, 5, 15, 10, 0),
        "location": "线上·Discord 频道",
        "max_participants": 100,
        "tags": ["线上", "比赛"],
        "organizer_name": "画师联盟",
        "organizer_avatar": "🎨",
        "status": "报名中",
        "signups": [
            {"name": "墨染", "phone": "13790129012", "note": "参加最佳设定奖"},
        ],
    },
    {
        "emoji": "⚔️",
        "title": "OC 跨次元对战锦标赛",
        "description": "提交你的战斗数据和技能设定，系统自动匹配对手进行回合制对战，冠军获得限定称号。",
        "event_at": datetime(2026, 4, 20, 19, 0),
        "location": "线上·APP 内",
        "max_participants": 64,
        "tags": ["线上", "对战"],
        "organizer_name": "竞技场管理员",
        "organizer_avatar": "⚔️",
        "status": "报名中",
        "signups": [],
    },
    {
        "emoji": "📖",
        "title": "OC 世界观共创工作坊",
        "description": "三天线上工作坊，由资深设定师带领共同搭建世界观框架，参与者的 OC 可写入设定集。",
        "event_at": datetime(2026, 4, 10, 20, 0),
        "location": "线上·腾讯会议",
        "max_participants": 20,
        "tags": ["线上", "创作"],
        "organizer_name": "设定研究所",
        "organizer_avatar": "📖",
        "status": "已结束",
        "signups": [
            {"name": "白夜", "phone": "13634563456", "note": "带了三个世界观"},
            {"name": "千雪", "phone": "13578907890", "note": None},
        ],
    },
]


def mask_phone(phone: str) -> str:
    if phone.isdigit() and len(phone) == 11:
        return f"{phone[:3]}****{phone[-4:]}"
    if len(phone) <= 4:
        return "*" * len(phone)
    return f"{phone[:3]}****{phone[-1:]}"


def ensure_activity_seed_data(db: Session) -> None:
    if db.query(Activity).count() > 0:
        return

    for seed in DEFAULT_ACTIVITY_SEEDS:
        signups = seed["signups"]
        activity = Activity(
            emoji=seed["emoji"],
            title=seed["title"],
            description=seed["description"],
            event_at=seed["event_at"],
            location=seed["location"],
            max_participants=seed["max_participants"],
            tags=seed["tags"],
            organizer_name=seed["organizer_name"],
            organizer_avatar=seed["organizer_avatar"],
            status=seed["status"],
        )
        db.add(activity)
        db.flush()
        for signup_seed in signups:
            db.add(
                ActivitySignup(
                    activity_id=activity.id,
                    user_id=None,
                    name=signup_seed["name"],
                    phone=signup_seed["phone"],
                    note=signup_seed["note"],
                )
            )
    db.commit()


def _activity_query(db: Session):
    return db.query(Activity).options(selectinload(Activity.signups))


def _get_activity_or_404(db: Session, activity_id: int) -> Activity:
    ensure_activity_seed_data(db)
    activity = (
        _activity_query(db)
        .filter(Activity.id == activity_id)
        .first()
    )
    if activity is None:
        raise NotFoundException("活动不存在")
    return activity


def _to_signup_out(signups: list[ActivitySignup]) -> list[ActivitySignupOut]:
    return [
        ActivitySignupOut(
            id=signup.id,
            user_id=signup.user_id,
            name=signup.name,
            phone=mask_phone(signup.phone),
            note=signup.note,
            signup_time=signup.created_at,
        )
        for signup in signups
    ]


def _to_activity_out(activity: Activity, current_user_id: int | None = None) -> ActivityOut:
    my_signup = None
    if current_user_id is not None:
        my_signup = next(
            (signup for signup in activity.signups if signup.user_id == current_user_id),
            None,
        )

    return ActivityOut(
        id=activity.id,
        emoji=activity.emoji,
        title=activity.title,
        description=activity.description,
        date=activity.event_at.strftime("%Y-%m-%d"),
        time=activity.event_at.strftime("%H:%M"),
        location=activity.location,
        max_participants=activity.max_participants,
        tags=list(activity.tags or []),
        organizer=activity.organizer_name,
        organizer_avatar=activity.organizer_avatar,
        status=activity.status,
        signup_count=len(activity.signups),
        is_signed_up=my_signup is not None,
        my_signup_time=my_signup.created_at if my_signup else None,
        signups=_to_signup_out(activity.signups),
    )


def list_activities(db: Session, current_user: User | None = None) -> list[ActivityOut]:
    ensure_activity_seed_data(db)
    activities = _activity_query(db).order_by(Activity.event_at.asc(), Activity.id.asc()).all()
    current_user_id = current_user.id if current_user else None
    return [_to_activity_out(activity, current_user_id) for activity in activities]


def get_activity_detail(
    db: Session,
    activity_id: int,
    current_user: User | None = None,
) -> ActivityOut:
    activity = _get_activity_or_404(db, activity_id)
    return _to_activity_out(activity, current_user.id if current_user else None)


def signup_activity(
    db: Session,
    activity_id: int,
    current_user: User,
    payload: ActivitySignupRequest,
) -> ActivityOut:
    activity = _get_activity_or_404(db, activity_id)
    if activity.status != "报名中":
        raise BadRequestException("活动已截止报名")
    if any(signup.user_id == current_user.id for signup in activity.signups):
        raise ConflictException("不能重复申请，该活动已报名")
    if len(activity.signups) >= activity.max_participants:
        raise ConflictException("报名已满")

    db.add(
        ActivitySignup(
            activity_id=activity.id,
            user_id=current_user.id,
            name=payload.name,
            phone=payload.phone,
            note=payload.note,
        )
    )
    db.commit()
    db.refresh(activity)
    activity = _get_activity_or_404(db, activity_id)
    return _to_activity_out(activity, current_user.id)


def cancel_activity_signup(db: Session, activity_id: int, current_user: User) -> ActivityOut:
    activity = _get_activity_or_404(db, activity_id)
    signup = next(
        (item for item in activity.signups if item.user_id == current_user.id),
        None,
    )
    if signup is None:
        raise BadRequestException("你还没有报名该活动")

    db.delete(signup)
    db.commit()
    activity = _get_activity_or_404(db, activity_id)
    return _to_activity_out(activity, current_user.id)


def list_my_signups(db: Session, current_user: User) -> list[ActivityOut]:
    ensure_activity_seed_data(db)
    activities = (
        _activity_query(db)
        .join(ActivitySignup, ActivitySignup.activity_id == Activity.id)
        .filter(ActivitySignup.user_id == current_user.id)
        .order_by(ActivitySignup.created_at.desc())
        .all()
    )
    return [_to_activity_out(activity, current_user.id) for activity in activities]
