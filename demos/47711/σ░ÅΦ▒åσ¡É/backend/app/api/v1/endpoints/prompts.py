from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.prompt import (
    PromptCommentCreateRequest,
    PromptCommentOut,
    PromptCreateRequest,
    PromptLikeTogglePayload,
    PromptListPayload,
    PromptOut,
)
from app.schemas.response import ApiResponse, success_response
from app.services.prompt_service import (
    add_prompt_comment,
    create_prompt,
    list_prompts,
    toggle_prompt_like,
)


router = APIRouter(prefix="/prompts", tags=["prompts"])


@router.get("", response_model=ApiResponse[PromptListPayload])
def get_prompt_list(
    tag: str | None = Query(default=None, description="按标签筛选"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[PromptListPayload]:
    return success_response(
        PromptListPayload(items=list_prompts(db, current_user=current_user, tag=tag)),
        message="获取提示词成功",
    )


@router.post("", response_model=ApiResponse[PromptOut])
def post_prompt(
    payload: PromptCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[PromptOut]:
    return success_response(
        create_prompt(db, current_user=current_user, payload=payload),
        message="发布提示词成功",
    )


@router.post("/{prompt_id}/like", response_model=ApiResponse[PromptLikeTogglePayload])
def post_prompt_like(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[PromptLikeTogglePayload]:
    return success_response(
        toggle_prompt_like(db, prompt_id=prompt_id, current_user=current_user),
        message="操作成功",
    )


@router.post("/{prompt_id}/comments", response_model=ApiResponse[PromptCommentOut])
def post_prompt_comment(
    prompt_id: int,
    payload: PromptCommentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[PromptCommentOut]:
    return success_response(
        add_prompt_comment(
            db,
            prompt_id=prompt_id,
            current_user=current_user,
            payload=payload,
        ),
        message="评论成功",
    )
