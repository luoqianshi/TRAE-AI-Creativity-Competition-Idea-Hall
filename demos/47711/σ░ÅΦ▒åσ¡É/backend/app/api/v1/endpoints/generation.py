from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.generation import (
    AssistantChatOut,
    AssistantChatRequest,
    GenerationJobCreateRequest,
    GenerationJobOut,
    TextGenerateOut,
    TextGenerateRequest,
)
from app.schemas.response import ApiResponse, success_response
from app.services.generation_service import (
    chat_app_assistant,
    create_generation_job,
    generate_text,
    get_generation_job,
)


router = APIRouter(tags=["generation"])


@router.post("/ai/text-generate", response_model=ApiResponse[TextGenerateOut])
def post_text_generate(
    payload: TextGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[TextGenerateOut]:
    return success_response(
        generate_text(db, current_user=current_user, payload=payload),
        message="文本生成成功",
    )


@router.post("/ai/assistant/chat", response_model=ApiResponse[AssistantChatOut])
def post_ai_assistant_chat(
    payload: AssistantChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[AssistantChatOut]:
    _ = (db, current_user)
    return success_response(
        chat_app_assistant(payload),
        message="助手回复成功",
    )


@router.post("/generation/jobs", response_model=ApiResponse[GenerationJobOut])
def post_generation_job(
    payload: GenerationJobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[GenerationJobOut]:
    return success_response(
        create_generation_job(db, current_user=current_user, payload=payload),
        message="任务已提交",
    )


@router.get("/generation/jobs/{job_id}", response_model=ApiResponse[GenerationJobOut])
def get_generation_job_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[GenerationJobOut]:
    return success_response(
        get_generation_job(db, current_user=current_user, job_id=job_id),
        message="获取任务状态成功",
    )
