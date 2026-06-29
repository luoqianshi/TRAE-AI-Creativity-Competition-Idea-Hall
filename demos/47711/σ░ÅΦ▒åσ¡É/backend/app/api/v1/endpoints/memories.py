from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.memory import MemoryListPayload
from app.schemas.response import ApiResponse, success_response
from app.services.memory_service import list_memories


router = APIRouter(tags=["memories"])


@router.get("/memories", response_model=ApiResponse[MemoryListPayload])
def get_memories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[MemoryListPayload]:
    return success_response(
        MemoryListPayload(items=list_memories(db, user_id=current_user.id)),
    )

