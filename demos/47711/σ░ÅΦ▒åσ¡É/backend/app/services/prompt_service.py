from collections.abc import Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.prompt_comment import PromptComment
from app.models.prompt_like import PromptLike
from app.models.prompt_template import PromptTemplate
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.prompt import (
    PromptCommentCreateRequest,
    PromptCommentOut,
    PromptCreateRequest,
    PromptLikeTogglePayload,
    PromptOut,
)


DEFAULT_PROMPT_SEEDS: tuple[dict[str, object], ...] = (
    {
        "author_name": "画境师",
        "author_avatar": "🎨",
        "prompt": "身穿白色长裙，站在月光下的湖边，微风吹起发丝，表情温柔而忧伤",
        "tags": ["人物"],
    },
    {
        "author_name": "战场诗人",
        "author_avatar": "⚔️",
        "prompt": "手持双刃剑，在燃烧的废墟中与巨龙对峙，火焰粒子特效，动态构图",
        "tags": ["战斗"],
    },
    {
        "author_name": "机械少女",
        "author_avatar": "🤖",
        "prompt": "赛博朋克城市天台，霓虹光线切割雾气，机械义体少女背光站立",
        "tags": ["风格", "场景"],
    },
)


def _build_seed_user(db: Session) -> User:
    seed_user = db.query(User).filter(User.username == "prompt_seed").first()
    if seed_user is not None:
        return seed_user
    seed_user = User(
        username="prompt_seed",
        phone="prompt_seed_phone",
        password_hash="seed-user-no-login",
    )
    db.add(seed_user)
    db.flush()
    profile = UserProfile(
        user_id=seed_user.id,
        nickname="提示词机器人",
        mood="",
        avatar="",
        phone_verified=False,
    )
    db.add(profile)
    db.flush()
    return seed_user


def ensure_prompt_seed_data(db: Session) -> None:
    if db.query(PromptTemplate).count() > 0:
        return
    seed_user = _build_seed_user(db)
    for seed in DEFAULT_PROMPT_SEEDS:
        db.add(
            PromptTemplate(
                user_id=seed_user.id,
                author_name=str(seed["author_name"]),
                author_avatar=str(seed["author_avatar"]),
                prompt=str(seed["prompt"]),
                tags=list(seed["tags"]),  # type: ignore[arg-type]
                is_public=True,
            )
        )
    db.commit()


def _build_like_count_map(db: Session, prompt_ids: Sequence[int]) -> dict[int, int]:
    if not prompt_ids:
        return {}
    rows = (
        db.query(PromptLike.prompt_id, func.count(PromptLike.id))
        .filter(PromptLike.prompt_id.in_(prompt_ids))
        .group_by(PromptLike.prompt_id)
        .all()
    )
    return {prompt_id: count for prompt_id, count in rows}


def _build_comment_count_map(db: Session, prompt_ids: Sequence[int]) -> dict[int, int]:
    if not prompt_ids:
        return {}
    rows = (
        db.query(PromptComment.prompt_id, func.count(PromptComment.id))
        .filter(PromptComment.prompt_id.in_(prompt_ids))
        .group_by(PromptComment.prompt_id)
        .all()
    )
    return {prompt_id: count for prompt_id, count in rows}


def _build_liked_prompt_ids(db: Session, prompt_ids: Sequence[int], user_id: int) -> set[int]:
    if not prompt_ids:
        return set()
    rows = (
        db.query(PromptLike.prompt_id)
        .filter(PromptLike.user_id == user_id, PromptLike.prompt_id.in_(prompt_ids))
        .all()
    )
    return {prompt_id for (prompt_id,) in rows}


def _serialize_comment(comment: PromptComment) -> PromptCommentOut:
    return PromptCommentOut(
        id=comment.id,
        prompt_id=comment.prompt_id,
        user_id=comment.user_id,
        author_name=comment.author_name,
        author_avatar=comment.author_avatar,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


def _serialize_prompt(
    prompt: PromptTemplate,
    *,
    liked_prompt_ids: set[int],
    like_count_map: dict[int, int],
    comment_count_map: dict[int, int],
    comments: list[PromptCommentOut],
) -> PromptOut:
    return PromptOut(
        id=prompt.id,
        user_id=prompt.user_id,
        author_name=prompt.author_name,
        author_avatar=prompt.author_avatar,
        prompt=prompt.prompt,
        tags=list(prompt.tags or []),
        like_count=like_count_map.get(prompt.id, 0),
        comment_count=comment_count_map.get(prompt.id, 0),
        liked_by_me=prompt.id in liked_prompt_ids,
        comments=comments,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
    )


def _comment_map(db: Session, prompt_ids: Sequence[int]) -> dict[int, list[PromptCommentOut]]:
    if not prompt_ids:
        return {}
    rows = (
        db.query(PromptComment)
        .filter(PromptComment.prompt_id.in_(prompt_ids))
        .order_by(PromptComment.created_at.asc(), PromptComment.id.asc())
        .all()
    )
    grouped: dict[int, list[PromptCommentOut]] = {}
    for row in rows:
        grouped.setdefault(row.prompt_id, []).append(_serialize_comment(row))
    return grouped


def list_prompts(
    db: Session,
    *,
    current_user: User,
    tag: str | None = None,
) -> list[PromptOut]:
    ensure_prompt_seed_data(db)
    query = db.query(PromptTemplate).filter(PromptTemplate.is_public.is_(True))
    if tag:
        normalized_tag = tag.strip()
        query = query.filter(PromptTemplate.tags.contains([normalized_tag]))
    prompts = query.order_by(PromptTemplate.created_at.desc(), PromptTemplate.id.desc()).all()
    prompt_ids = [item.id for item in prompts]
    like_count_map = _build_like_count_map(db, prompt_ids)
    comment_count_map = _build_comment_count_map(db, prompt_ids)
    liked_prompt_ids = _build_liked_prompt_ids(db, prompt_ids, current_user.id)
    comments_by_prompt = _comment_map(db, prompt_ids)
    return [
        _serialize_prompt(
            item,
            liked_prompt_ids=liked_prompt_ids,
            like_count_map=like_count_map,
            comment_count_map=comment_count_map,
            comments=comments_by_prompt.get(item.id, []),
        )
        for item in prompts
    ]


def create_prompt(
    db: Session,
    *,
    current_user: User,
    payload: PromptCreateRequest,
) -> PromptOut:
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    author_name = profile.nickname if profile and profile.nickname else current_user.username
    author_avatar = profile.avatar if profile else ""

    prompt = PromptTemplate(
        user_id=current_user.id,
        author_name=author_name,
        author_avatar=author_avatar or "",
        prompt=payload.prompt,
        tags=payload.tags,
        is_public=True,
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return _serialize_prompt(
        prompt,
        liked_prompt_ids=set(),
        like_count_map={prompt.id: 0},
        comment_count_map={prompt.id: 0},
        comments=[],
    )


def _get_prompt_or_404(db: Session, *, prompt_id: int) -> PromptTemplate:
    prompt = db.query(PromptTemplate).filter(PromptTemplate.id == prompt_id).first()
    if prompt is None or not prompt.is_public:
        raise NotFoundException("提示词不存在")
    return prompt


def toggle_prompt_like(
    db: Session,
    *,
    prompt_id: int,
    current_user: User,
) -> PromptLikeTogglePayload:
    _get_prompt_or_404(db, prompt_id=prompt_id)
    like = (
        db.query(PromptLike)
        .filter(PromptLike.prompt_id == prompt_id, PromptLike.user_id == current_user.id)
        .first()
    )
    liked = like is None
    if like is None:
        db.add(PromptLike(prompt_id=prompt_id, user_id=current_user.id))
    else:
        db.delete(like)
    db.commit()
    like_count = (
        db.query(func.count(PromptLike.id))
        .filter(PromptLike.prompt_id == prompt_id)
        .scalar()
        or 0
    )
    return PromptLikeTogglePayload(prompt_id=prompt_id, liked=liked, like_count=like_count)


def add_prompt_comment(
    db: Session,
    *,
    prompt_id: int,
    current_user: User,
    payload: PromptCommentCreateRequest,
) -> PromptCommentOut:
    _get_prompt_or_404(db, prompt_id=prompt_id)
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    author_name = profile.nickname if profile and profile.nickname else current_user.username
    author_avatar = profile.avatar if profile else ""
    comment = PromptComment(
        prompt_id=prompt_id,
        user_id=current_user.id,
        author_name=author_name,
        author_avatar=author_avatar or "",
        content=payload.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return _serialize_comment(comment)
