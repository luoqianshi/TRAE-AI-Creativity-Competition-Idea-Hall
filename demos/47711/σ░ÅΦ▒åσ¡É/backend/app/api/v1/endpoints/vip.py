from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.chat import ChatMessageOut
from app.schemas.response import ApiResponse, success_response
from app.schemas.vip import VipActivateDemoPayload, VipActivateDemoRequest
from app.services.chat_service import _create_message, _get_owned_session, serialize_message
from app.services.vip_service import activate_demo_vip


router = APIRouter(tags=["vip"])


@router.post("/vip/activate-demo", response_model=ApiResponse[VipActivateDemoPayload])
def activate_demo(
    payload: VipActivateDemoRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[VipActivateDemoPayload]:
    vip_status = activate_demo_vip(db, user_id=current_user.id, plan_code=payload.plan_code)
    activation_message: ChatMessageOut | None = None
    if payload.session_id is not None:
        session = _get_owned_session(db, user_id=current_user.id, session_id=payload.session_id)
        message = _create_message(
            db,
            session=session,
            message_type="system",
            text="契约升级成功，已解锁 VIP 占位功能",
            metadata={"event_type": "vip_unlock", "plan_code": vip_status.plan_code},
        )
        db.commit()
        activation_message = serialize_message(message)

    return success_response(
        VipActivateDemoPayload(
            vip=vip_status,
            activation_message=activation_message.model_dump() if activation_message else None,
        ),
        message="VIP 体验版已开通",
    )

