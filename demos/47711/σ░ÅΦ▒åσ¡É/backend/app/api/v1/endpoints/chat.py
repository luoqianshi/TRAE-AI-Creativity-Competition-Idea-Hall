from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.api.v1.endpoints.memories import router as memories_router
from app.api.v1.endpoints.vip import router as vip_router
from app.models.user import User
from app.schemas.chat import (
    ChatGiftRequest,
    ChatInteractionPayload,
    ChatMessageListPayload,
    ChatMessageSendRequest,
    ChatSessionCreateRequest,
    ChatSessionListPayload,
    VoiceCallLogRequest,
)
from app.schemas.response import ApiResponse, success_response
from app.services.chat_service import (
    create_or_get_session,
    list_messages,
    list_sessions,
    log_voice_call,
    send_gift,
    send_image_message,
    send_text_message,
)


router = APIRouter(tags=["chat"])
router.include_router(memories_router)
router.include_router(vip_router)


@router.get("/chat/sessions", response_model=ApiResponse[ChatSessionListPayload])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[ChatSessionListPayload]:
    return success_response(list_sessions(db, user_id=current_user.id))


@router.post("/chat/sessions", response_model=ApiResponse[dict])
def create_chat_session(
    payload: ChatSessionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[dict]:
    session = create_or_get_session(db, user_id=current_user.id, payload=payload)
    return success_response({"session": session})


@router.get("/chat/sessions/{session_id}/messages", response_model=ApiResponse[ChatMessageListPayload])
def get_chat_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[ChatMessageListPayload]:
    return success_response(
        list_messages(db, user_id=current_user.id, session_id=session_id),
    )


@router.post("/chat/sessions/{session_id}/messages", response_model=ApiResponse[ChatInteractionPayload])
def post_chat_message(
    session_id: int,
    payload: ChatMessageSendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[ChatInteractionPayload]:
    return success_response(
        send_text_message(
            db,
            user_id=current_user.id,
            session_id=session_id,
            payload=payload,
        ),
    )


@router.post("/chat/sessions/{session_id}/image-message", response_model=ApiResponse[ChatInteractionPayload])
def post_image_message(
    session_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[ChatInteractionPayload]:
    return success_response(
        send_image_message(
            db,
            user_id=current_user.id,
            session_id=session_id,
            file=file,
        ),
    )


@router.post("/chat/sessions/{session_id}/gift", response_model=ApiResponse[ChatInteractionPayload])
def post_gift(
    session_id: int,
    payload: ChatGiftRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[ChatInteractionPayload]:
    return success_response(
        send_gift(
            db,
            user_id=current_user.id,
            session_id=session_id,
            payload=payload,
        ),
    )


@router.post("/chat/sessions/{session_id}/voice-call-log", response_model=ApiResponse[ChatInteractionPayload])
def post_voice_call_log(
    session_id: int,
    payload: VoiceCallLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[ChatInteractionPayload]:
    return success_response(
        log_voice_call(
            db,
            user_id=current_user.id,
            session_id=session_id,
            payload=payload,
        ),
    )
