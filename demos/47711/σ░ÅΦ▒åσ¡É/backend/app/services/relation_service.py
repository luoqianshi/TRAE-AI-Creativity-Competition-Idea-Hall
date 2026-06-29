from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.oc import OC
from app.models.relation import Relation
from app.models.user import User
from app.schemas.relation import RelationCreate, RelationOut, RelationUpdate


def _ensure_oc_owned(db: Session, current_user: User, oc_id: int) -> None:
    exists = (
        db.query(OC.id)
        .filter(OC.id == oc_id, OC.user_id == current_user.id)
        .first()
    )
    if exists is None:
        raise NotFoundException("关联的角色不存在")


def _relation_to_out(relation: Relation) -> RelationOut:
    return RelationOut(
        id=relation.id,
        user_id=relation.user_id,
        ocId=relation.oc_id,
        name=relation.name,
        emoji=relation.emoji,
        avatar=relation.avatar,
        type=relation.type,
        color=relation.color,
        reverseType=relation.reverse_type,
        reverseColor=relation.reverse_color,
        asymmetric=relation.asymmetric,
        created_at=relation.created_at,
        updated_at=relation.updated_at,
    )


def list_relations(
    db: Session,
    current_user: User,
    oc_id: int | None = None,
) -> list[RelationOut]:
    query = db.query(Relation).filter(Relation.user_id == current_user.id)
    if oc_id is not None:
        query = query.filter(Relation.oc_id == oc_id)
    items = query.order_by(Relation.created_at.asc(), Relation.id.asc()).all()
    return [_relation_to_out(item) for item in items]


def get_relation_or_404(db: Session, current_user: User, relation_id: int) -> Relation:
    relation = (
        db.query(Relation)
        .filter(Relation.id == relation_id, Relation.user_id == current_user.id)
        .first()
    )
    if relation is None:
        raise NotFoundException("关系不存在")
    return relation


def create_relation(
    db: Session,
    current_user: User,
    payload: RelationCreate,
) -> RelationOut:
    _ensure_oc_owned(db, current_user, payload.ocId)
    relation = Relation(
        user_id=current_user.id,
        oc_id=payload.ocId,
        name=payload.name,
        emoji=payload.emoji,
        avatar=payload.avatar,
        type=payload.type,
        color=payload.color,
        reverse_type=payload.reverseType,
        reverse_color=payload.reverseColor,
        asymmetric=payload.asymmetric,
    )
    db.add(relation)
    db.commit()
    db.refresh(relation)
    return _relation_to_out(relation)


def update_relation(
    db: Session,
    current_user: User,
    relation_id: int,
    payload: RelationUpdate,
) -> RelationOut:
    relation = get_relation_or_404(db, current_user, relation_id)
    data = payload.model_dump(exclude_unset=True)

    if "ocId" in data and data["ocId"] is not None:
        _ensure_oc_owned(db, current_user, data["ocId"])
        relation.oc_id = data["ocId"]
    if "name" in data:
        relation.name = data["name"] or ""
    if "emoji" in data:
        relation.emoji = data["emoji"] or "🌸"
    if "avatar" in data:
        relation.avatar = data["avatar"] or ""
    if "type" in data:
        relation.type = data["type"] or "挚友"
    if "color" in data:
        relation.color = data["color"] or "#f472b6"
    if "reverseType" in data:
        relation.reverse_type = data["reverseType"] or relation.type
    if "reverseColor" in data:
        relation.reverse_color = data["reverseColor"] or relation.color
    if "asymmetric" in data and data["asymmetric"] is not None:
        relation.asymmetric = data["asymmetric"]

    db.commit()
    db.refresh(relation)
    return _relation_to_out(relation)


def delete_relation(db: Session, current_user: User, relation_id: int) -> None:
    relation = get_relation_or_404(db, current_user, relation_id)
    db.delete(relation)
    db.commit()
