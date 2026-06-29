from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.response import ApiResponse, success_response
from app.schemas.world import WorldOut, WorldUpdate
from app.services.world_service import get_world, upsert_world


router = APIRouter(prefix="/world", tags=["world"])


@router.get("", response_model=ApiResponse[WorldOut])
def read_world(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[WorldOut]:
    return success_response(get_world(db, current_user), message="获取世界观成功")


@router.put("", response_model=ApiResponse[WorldOut])
def put_world(
    payload: WorldUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[WorldOut]:
    return success_response(upsert_world(db, current_user, payload), message="世界观保存成功")
