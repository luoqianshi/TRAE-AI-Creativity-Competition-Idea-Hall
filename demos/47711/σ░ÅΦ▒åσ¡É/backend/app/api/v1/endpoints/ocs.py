from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.oc import OCCreate, OCOut, OCUpdate
from app.schemas.response import ApiResponse, success_response
from app.services.oc_service import (
    create_oc,
    delete_oc,
    get_oc_detail,
    list_ocs,
    update_oc,
)


router = APIRouter(prefix="/ocs", tags=["ocs"])


@router.get("", response_model=ApiResponse[list[OCOut]])
def get_ocs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[list[OCOut]]:
    return success_response(list_ocs(db, current_user), message="获取角色列表成功")


@router.post("", response_model=ApiResponse[OCOut])
def post_oc(
    payload: OCCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[OCOut]:
    return success_response(create_oc(db, current_user, payload), message="角色创建成功")


@router.get("/{oc_id}", response_model=ApiResponse[OCOut])
def get_oc(
    oc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[OCOut]:
    return success_response(get_oc_detail(db, current_user, oc_id), message="获取角色成功")


@router.patch("/{oc_id}", response_model=ApiResponse[OCOut])
def patch_oc(
    oc_id: int,
    payload: OCUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[OCOut]:
    return success_response(update_oc(db, current_user, oc_id, payload), message="角色更新成功")


@router.delete("/{oc_id}", response_model=ApiResponse[None])
def remove_oc(
    oc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[None]:
    delete_oc(db, current_user, oc_id)
    return success_response(message="角色删除成功")
