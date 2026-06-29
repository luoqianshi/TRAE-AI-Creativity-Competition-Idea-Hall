from random import Random

from sqlalchemy.orm import Session

from app.models.collab_listing import CollabListing
from app.models.memory import Memory
from app.models.oc import OC
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.home import (
    HomeCartItemOut,
    HomeCartSummaryOut,
    HomeCommissionPreviewOut,
    HomeDashboardOut,
    HomeFortuneOut,
    HomeMemoryOut,
    HomeOCOut,
    HomeProfileOut,
)
from app.services.signin_service import get_today_fortune


def _ensure_profile(db: Session, current_user: User) -> UserProfile:
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile is not None:
        return profile
    profile = UserProfile(
        user_id=current_user.id,
        nickname=current_user.username,
        mood="初次来到这个世界...",
        avatar="",
        phone_verified=False,
    )
    db.add(profile)
    db.flush()
    return profile


def _serialize_oc(item: OC) -> HomeOCOut:
    raw_stats = dict(item.stats or {})
    stats = {
        "intimacy": int(raw_stats.get("intimacy", 0)),
        "combat": int(raw_stats.get("combat", 0)),
        "emotion": int(raw_stats.get("emotion", 0)),
    }
    return HomeOCOut(
        id=item.id,
        name=item.name,
        title=item.title,
        emoji=item.emoji,
        avatar=item.avatar,
        gradient=item.gradient,
        barColor=item.bar_color,
        story=item.story,
        tags=list(item.tags or []),
        voiceLines=list(item.voice_lines or []),
        level=item.level,
        stats=stats,
        created_at=item.created_at,
    )


def _serialize_memory(item: Memory) -> HomeMemoryOut:
    return HomeMemoryOut(
        id=item.id,
        text=item.text,
        oc=item.oc_name,
        emoji=item.oc_emoji,
        date=item.created_at.strftime("%Y-%m-%d"),
        created_at=item.created_at,
    )


def _build_mock_cart_summary(*, user_id: int, has_ocs: bool) -> HomeCartSummaryOut:
    if not has_ocs:
        return HomeCartSummaryOut(total_items=0, total_amount=0.0, items=[])
    rnd = Random(user_id * 9973)
    item_count = 1 + rnd.randint(0, 2)
    sample_catalog = [
        ("定制 OC 亚克力立牌", "🏷️", 68.0),
        ("OC 主题手机壳", "📱", 128.0),
        ("限定版 OC 抱枕", "🛏️", 198.0),
    ]
    items: list[HomeCartItemOut] = []
    total_amount = 0.0
    total_items = 0
    for i in range(item_count):
        name, emoji, unit_price = sample_catalog[i]
        qty = 1 + rnd.randint(0, 1)
        total_items += qty
        total_amount += unit_price * qty
        items.append(
            HomeCartItemOut(
                cartId=100000 + user_id * 10 + i,
                name=name,
                emoji=emoji,
                price=unit_price,
                qty=qty,
                design=None,
            )
        )
    return HomeCartSummaryOut(
        total_items=total_items,
        total_amount=round(total_amount, 2),
        items=items,
    )


def _build_commission_preview(db: Session) -> list[HomeCommissionPreviewOut]:
    listings = (
        db.query(CollabListing)
        .order_by(CollabListing.created_at.desc(), CollabListing.id.desc())
        .limit(6)
        .all()
    )
    result: list[HomeCommissionPreviewOut] = []
    for item in listings:
        result.append(
            HomeCommissionPreviewOut(
                id=item.id,
                type="artist",
                avatar=item.emoji or "🌟",
                author=item.owner_name,
                title=item.oc_name,
                priceRange="100 ~ 500",
                applicants=[],
                samples=[],
            )
        )
    return result


def get_home_dashboard(db: Session, *, current_user: User) -> HomeDashboardOut:
    profile = _ensure_profile(db, current_user)
    ocs = (
        db.query(OC)
        .filter(OC.user_id == current_user.id)
        .order_by(OC.created_at.asc(), OC.id.asc())
        .all()
    )
    memories = (
        db.query(Memory)
        .filter(Memory.user_id == current_user.id)
        .order_by(Memory.created_at.desc(), Memory.id.desc())
        .limit(20)
        .all()
    )
    fortune = get_today_fortune(db, current_user)
    cart_summary = _build_mock_cart_summary(user_id=current_user.id, has_ocs=bool(ocs))
    commission_preview = _build_commission_preview(db)

    db.commit()
    db.refresh(profile)

    return HomeDashboardOut(
        profile=HomeProfileOut(
            nickname=profile.nickname,
            mood=profile.mood,
            avatar=profile.avatar,
            level=profile.level,
        ),
        oc_list=[_serialize_oc(item) for item in ocs],
        memories=[_serialize_memory(item) for item in memories],
        cart_summary=cart_summary,
        commission_preview=commission_preview,
        fortune_today=HomeFortuneOut(
            level=fortune.title,
            desc=fortune.summary,
            color=fortune.lucky_color,
            lucky=fortune.lucky_color,
            luckyNum=fortune.lucky_number,
            date=fortune.date,
            score=fortune.score,
        ),
    )
