from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.models.collab_application import CollabApplication
from app.models.collab_listing import CollabListing
from app.models.user import User
from app.schemas.collab import (
    CollabApplicationOut,
    CollabApplyRequest,
    CollabCreateRequest,
    CollabOut,
)


DEFAULT_COLLAB_SEEDS = [
    {
        "owner_name": "焰灵契约社",
        "oc_name": "焰灵·Blaze",
        "emoji": "🔥",
        "description": "寻找水属性角色进行对立剧情联动。",
        "tags": ["火属性", "对立"],
        "status": "招募中",
    },
    {
        "owner_name": "月下旅团",
        "oc_name": "月华·Luna",
        "emoji": "🌙",
        "description": "想找一个旅伴一起探索遗迹，偏冒险搭档向。",
        "tags": ["冒险", "搭档"],
        "status": "招募中",
    },
    {
        "owner_name": "铃兰学园",
        "oc_name": "铃兰·Bell",
        "emoji": "🔔",
        "description": "校园日常联动，轻松向，可以从同班同学开局。",
        "tags": ["日常", "校园"],
        "status": "招募中",
    },
    {
        "owner_name": "绯红书局",
        "oc_name": "绯红·Scarlet",
        "emoji": "🌹",
        "description": "寻找宿敌关系的角色，适合长线剧情推进。",
        "tags": ["宿敌", "长线"],
        "status": "招募中",
    },
]


def ensure_collab_seed_data(db: Session) -> None:
    if db.query(CollabListing).count() > 0:
        return

    for seed in DEFAULT_COLLAB_SEEDS:
        db.add(
            CollabListing(
                owner_user_id=None,
                owner_name=seed["owner_name"],
                oc_name=seed["oc_name"],
                emoji=seed["emoji"],
                description=seed["description"],
                status=seed["status"],
                tags=seed["tags"],
            )
        )
    db.commit()


def _collab_query(db: Session):
    return db.query(CollabListing).options(selectinload(CollabListing.applications))


def _get_collab_or_404(db: Session, collab_id: int) -> CollabListing:
    ensure_collab_seed_data(db)
    collab = _collab_query(db).filter(CollabListing.id == collab_id).first()
    if collab is None:
        raise NotFoundException("联动信息不存在")
    return collab


def _to_collab_out(collab: CollabListing, current_user: User | None = None) -> CollabOut:
    current_user_id = current_user.id if current_user else None
    return CollabOut(
        id=collab.id,
        owner_user_id=collab.owner_user_id,
        owner_name=collab.owner_name,
        oc_name=collab.oc_name,
        emoji=collab.emoji,
        description=collab.description,
        status=collab.status,
        tags=list(collab.tags or []),
        application_count=len(collab.applications),
        applied=any(
            application.user_id == current_user_id for application in collab.applications
        )
        if current_user_id is not None
        else False,
        owned_by_me=collab.owner_user_id == current_user_id if current_user_id else False,
        created_at=collab.created_at,
        applications=[
            CollabApplicationOut(
                id=application.id,
                user_id=application.user_id,
                applicant_name=application.applicant_name,
                message=application.message,
                apply_time=application.created_at,
            )
            for application in collab.applications
        ],
    )


def list_collabs(db: Session, current_user: User | None = None) -> list[CollabOut]:
    ensure_collab_seed_data(db)
    collabs = _collab_query(db).order_by(CollabListing.created_at.desc()).all()
    return [_to_collab_out(collab, current_user) for collab in collabs]


def create_collab(db: Session, current_user: User, payload: CollabCreateRequest) -> CollabOut:
    collab = CollabListing(
        owner_user_id=current_user.id,
        owner_name=current_user.username,
        oc_name=payload.oc_name,
        emoji=payload.emoji,
        description=payload.description,
        status="招募中",
        tags=payload.tags,
    )
    db.add(collab)
    db.commit()
    db.refresh(collab)
    collab = _get_collab_or_404(db, collab.id)
    return _to_collab_out(collab, current_user)


def apply_collab(
    db: Session,
    collab_id: int,
    current_user: User,
    payload: CollabApplyRequest,
) -> CollabOut:
    collab = _get_collab_or_404(db, collab_id)
    if collab.owner_user_id == current_user.id:
        raise BadRequestException("不能申请自己发布的联动")
    if any(application.user_id == current_user.id for application in collab.applications):
        raise ConflictException("不能重复申请，该联动已提交申请")

    db.add(
        CollabApplication(
            collab_id=collab.id,
            user_id=current_user.id,
            applicant_name=current_user.username,
            message=payload.message,
        )
    )
    db.commit()
    collab = _get_collab_or_404(db, collab_id)
    return _to_collab_out(collab, current_user)


def cancel_collab_apply(db: Session, collab_id: int, current_user: User) -> CollabOut:
    collab = _get_collab_or_404(db, collab_id)
    application = next(
        (item for item in collab.applications if item.user_id == current_user.id),
        None,
    )
    if application is None:
        raise BadRequestException("你还没有申请该联动")

    db.delete(application)
    db.commit()
    collab = _get_collab_or_404(db, collab_id)
    return _to_collab_out(collab, current_user)
