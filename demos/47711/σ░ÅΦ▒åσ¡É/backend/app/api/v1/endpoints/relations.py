from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.relation import RelationCreate, RelationOut, RelationUpdate
from app.schemas.response import ApiResponse, success_response
from app.services.relation_service import (
    create_relation,
    delete_relation,
    list_relations,
    update_relation,
)


router = APIRouter(prefix="/relations", tags=["relations"])


@router.get("", response_model=ApiResponse[list[RelationOut]])
def get_relations(
    oc_id: Annotated[int | None, Query(alias="oc_id")] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[list[RelationOut]]:
    return success_response(
        list_relations(db, current_user, oc_id),
        message="获取关系网成功",
    )


@router.post("", response_model=ApiResponse[RelationOut])
def post_relation(
    payload: RelationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[RelationOut]:
    return success_response(
        create_relation(db, current_user, payload),
        message="关系创建成功",
    )


@router.patch("/{relation_id}", response_model=ApiResponse[RelationOut])
def patch_relation(
    relation_id: int,
    payload: RelationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[RelationOut]:
    return success_response(
        update_relation(db, current_user, relation_id, payload),
        message="关系更新成功",
    )


@router.delete("/{relation_id}", response_model=ApiResponse[None])
def remove_relation(
    relation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[None]:
    delete_relation(db, current_user, relation_id)
    return success_response(message="关系删除成功")
