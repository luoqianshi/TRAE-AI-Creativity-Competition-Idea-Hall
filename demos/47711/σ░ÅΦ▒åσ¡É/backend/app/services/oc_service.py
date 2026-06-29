from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.oc import OC
from app.models.relation import Relation
from app.models.user import User
from app.schemas.oc import DEFAULT_STATS, OCCreate, OCOut, OCUpdate


def _normalize_stats(stats: dict | None) -> dict[str, int]:
    merged = dict(DEFAULT_STATS)
    if isinstance(stats, dict):
        for key, value in stats.items():
            try:
                merged[key] = int(value)
            except (TypeError, ValueError):
                merged[key] = 0
    return merged


def _normalize_json_items(items: list | None) -> list:
    normalized = []
    for item in items or []:
        if hasattr(item, "model_dump"):
            normalized.append(item.model_dump())
        elif isinstance(item, dict):
            normalized.append(dict(item))
        else:
            normalized.append(item)
    return normalized


def _oc_to_out(oc: OC) -> OCOut:
    return OCOut(
        id=oc.id,
        user_id=oc.user_id,
        name=oc.name,
        title=oc.title,
        emoji=oc.emoji,
        avatar=oc.avatar,
        gradient=oc.gradient,
        barColor=oc.bar_color,
        story=oc.story,
        tags=list(oc.tags or []),
        voiceLines=list(oc.voice_lines or []),
        height=oc.height,
        weight=oc.weight,
        personality=list(oc.personality or []),
        alignment=oc.alignment,
        skills=list(oc.skills or []),
        weaknesses=list(oc.weaknesses or []),
        catchphrases=list(oc.catchphrases or []),
        timeline=list(oc.timeline or []),
        level=oc.level,
        stats=_normalize_stats(oc.stats),
        created_at=oc.created_at,
        updated_at=oc.updated_at,
    )


def list_ocs(db: Session, current_user: User) -> list[OCOut]:
    items = (
        db.query(OC)
        .filter(OC.user_id == current_user.id)
        .order_by(OC.created_at.asc(), OC.id.asc())
        .all()
    )
    return [_oc_to_out(item) for item in items]


def get_oc_or_404(db: Session, current_user: User, oc_id: int) -> OC:
    oc = (
        db.query(OC)
        .filter(OC.id == oc_id, OC.user_id == current_user.id)
        .first()
    )
    if oc is None:
        raise NotFoundException("角色不存在")
    return oc


def get_oc_detail(db: Session, current_user: User, oc_id: int) -> OCOut:
    return _oc_to_out(get_oc_or_404(db, current_user, oc_id))


def create_oc(db: Session, current_user: User, payload: OCCreate) -> OCOut:
    oc = OC(
        user_id=current_user.id,
        name=payload.name,
        title=payload.title,
        emoji=payload.emoji,
        avatar=payload.avatar,
        gradient=payload.gradient,
        bar_color=payload.barColor,
        story=payload.story,
        tags=list(payload.tags),
        voice_lines=list(payload.voiceLines),
        height=payload.height,
        weight=payload.weight,
        personality=list(payload.personality),
        alignment=payload.alignment,
        skills=_normalize_json_items(payload.skills),
        weaknesses=list(payload.weaknesses),
        catchphrases=list(payload.catchphrases),
        timeline=_normalize_json_items(payload.timeline),
        level=payload.level,
        stats=_normalize_stats(payload.stats),
    )
    db.add(oc)
    db.commit()
    db.refresh(oc)
    return _oc_to_out(oc)


def update_oc(
    db: Session,
    current_user: User,
    oc_id: int,
    payload: OCUpdate,
) -> OCOut:
    oc = get_oc_or_404(db, current_user, oc_id)
    data = payload.model_dump(exclude_unset=True)

    if "name" in data:
        oc.name = data["name"] or ""
    if "title" in data:
        oc.title = data["title"] or ""
    if "emoji" in data:
        oc.emoji = data["emoji"] or "🌙"
    if "avatar" in data:
        oc.avatar = data["avatar"] or ""
    if "gradient" in data:
        oc.gradient = data["gradient"] or ""
    if "barColor" in data:
        oc.bar_color = data["barColor"] or ""
    if "story" in data:
        oc.story = data["story"] or ""
    if "tags" in data:
        oc.tags = list(data["tags"] or [])
    if "voiceLines" in data:
        oc.voice_lines = list(data["voiceLines"] or [])
    if "height" in data:
        oc.height = data["height"] or ""
    if "weight" in data:
        oc.weight = data["weight"] or ""
    if "personality" in data:
        oc.personality = list(data["personality"] or [])
    if "alignment" in data:
        oc.alignment = data["alignment"] or ""
    if "skills" in data:
        oc.skills = _normalize_json_items(data["skills"])
    if "weaknesses" in data:
        oc.weaknesses = list(data["weaknesses"] or [])
    if "catchphrases" in data:
        oc.catchphrases = list(data["catchphrases"] or [])
    if "timeline" in data:
        oc.timeline = _normalize_json_items(data["timeline"])
    if "level" in data and data["level"] is not None:
        oc.level = data["level"]
    if "stats" in data:
        oc.stats = _normalize_stats(data["stats"])

    db.commit()
    db.refresh(oc)
    return _oc_to_out(oc)


def delete_oc(db: Session, current_user: User, oc_id: int) -> None:
    oc = get_oc_or_404(db, current_user, oc_id)
    db.query(Relation).filter(
        Relation.user_id == current_user.id, Relation.oc_id == oc.id
    ).delete(synchronize_session=False)
    db.delete(oc)
    db.commit()
