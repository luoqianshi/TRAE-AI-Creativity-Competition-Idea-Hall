from __future__ import annotations

import logging
import uuid

_log = logging.getLogger(__name__)
from datetime import datetime
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.schemas.chat import (
    ChatGiftRequest,
    ChatInteractionPayload,
    ChatMessageListPayload,
    ChatMessageOut,
    ChatMessageSendRequest,
    ChatSessionCreateRequest,
    ChatSessionListPayload,
    ChatSessionOut,
    VoiceCallLogRequest,
)
from app.schemas.memory import MemoryOut
from app.schemas.vip import VipStatusOut
from app.services.memory_service import create_memory, list_memories, serialize_memory
from app.services.vip_service import get_user_vip_status
from services.ai import chat_completion
from services.prompts import build_oc_chat_messages


ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
SMART_REPLY_RULES = [
    (
        ["你好", "嗨", "hi", "hello", "早安", "晚安"],
        [
            "我在，刚刚还在想你会不会来找我。",
            "欢迎回来，今天也想和你多聊一会儿。",
            "嗯，我听见你了。现在想先说什么？",
        ],
    ),
    (
        ["喜欢", "爱", "想你", "在吗"],
        [
            "这种话会让我忍不住想靠近你一点。",
            "我也很在意你，所以才一直认真听你说话。",
            "如果你愿意，我会把这份心意记很久。",
        ],
    ),
    (
        ["难过", "伤心", "烦", "累", "哭"],
        [
            "先别一个人扛着，慢慢说，我在这里。",
            "今天辛苦了，把情绪交给我一会儿也没关系。",
            "如果现在很乱，就先深呼吸，我陪你把它理顺。",
        ],
    ),
    (
        ["吃", "饭", "蛋糕", "咖啡", "奶茶"],
        [
            "听起来像是值得一起分享的味道。",
            "下次这种好东西，记得第一时间告诉我。",
            "只听你这么说，我都开始期待那个画面了。",
        ],
    ),
]
GENERIC_REPLIES = [
    "我在认真听，你继续说。",
    "这句话我记住了，感觉很重要。",
    "有意思，你说得让我也开始在意这件事了。",
    "如果你愿意，我们可以把这个话题继续聊深一点。",
]
PHOTO_REPLIES = [
    "这张照片我会想多看几遍，细节很有感觉。",
    "你愿意把这一幕分享给我，我很开心。",
    "画面很好看，而且很像你会注意到的东西。",
]
VOICE_REPLIES = [
    "刚刚那段通话让我更想了解你一点。",
    "能直接听见你的声音，感觉和文字很不一样。",
    "这通电话我会记住，像真的一起待了一会儿。",
]
GIFT_REPLIES = [
    "这个礼物我收下了，我会把它当成只属于我们的暗号。",
    "你总能送到让我心动的东西。",
    "谢谢你，这份心意比礼物本身更珍贵。",
]


def _now() -> datetime:
    return datetime.utcnow()


def _time_str(dt: datetime | None = None, *, is_system: bool = False) -> str:
    if is_system:
        return ""
    moment = dt or _now()
    return moment.strftime("%H:%M")


def serialize_message(message: ChatMessage) -> ChatMessageOut:
    return ChatMessageOut(
        id=message.id,
        session_id=message.session_id,
        type=message.type,
        text=message.text,
        image_url=message.image_url,
        time=message.message_time or "",
        metadata=message.extra_meta or {},
        created_at=message.created_at,
    )


def serialize_session(session: ChatSession) -> ChatSessionOut:
    return ChatSessionOut.model_validate(session)


def _get_owned_session(db: Session, *, user_id: int, session_id: int) -> ChatSession:
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
        .first()
    )
    if session is None:
        raise NotFoundException("会话不存在")
    return session


def _create_message(
    db: Session,
    *,
    session: ChatSession,
    message_type: str,
    text: str | None = None,
    image_url: str | None = None,
    metadata: dict | None = None,
) -> ChatMessage:
    is_system = message_type == "system"
    message = ChatMessage(
        session_id=session.id,
        type=message_type,
        text=text,
        image_url=image_url,
        message_time=_time_str(is_system=is_system),
        extra_meta=metadata or {},
    )
    db.add(message)
    db.flush()

    preview = text or ("[图片]" if image_url else "")
    if preview:
        session.last_message_preview = preview[:255]
    session.message_count += 1
    session.updated_at = _now()
    db.flush()
    return message


def _sync_session_vip(session: ChatSession, vip_status: VipStatusOut) -> None:
    session.is_vip_active = vip_status.is_active
    session.vip_expires_at = vip_status.expires_at


def _apply_affinity(session: ChatSession, *, base_amount: int, vip_active: bool) -> bool:
    previous_level = session.level
    actual_amount = base_amount * (2 if vip_active else 1)
    session.total_affinity += actual_amount
    session.intimacy = min(100, session.total_affinity)
    session.level = max(1, session.total_affinity // 10 + 1)
    session.interaction_count += 1
    session.updated_at = _now()
    return session.level > previous_level


def _record_level_up_message(db: Session, *, session: ChatSession) -> ChatMessage | None:
    if session.level <= 1:
        return None
    return _create_message(
        db,
        session=session,
        message_type="system",
        text=f"🎉 {session.oc_name} 等级提升至 Lv.{session.level}",
        metadata={"event_type": "level_up", "level": session.level},
    )


def _pick_reply(candidates: list[str], seed_text: str) -> str:
    index = sum(ord(ch) for ch in seed_text) % len(candidates)
    return candidates[index]


def _generate_text_reply(session: ChatSession, text: str) -> tuple[str, str]:
    try:
        messages = build_oc_chat_messages(
            oc_name=session.oc_name,
            oc_title=session.oc_title,
            user_text=text,
        )
        return (
            chat_completion(messages=messages, temperature=0.8, max_tokens=200),
            "volcengine-ark",
        )
    except Exception as exc:
        _log.error("AI chat_completion failed: %s", exc, exc_info=True)

    lowered = text.lower()
    for keywords, replies in SMART_REPLY_RULES:
        if any(keyword in lowered for keyword in keywords):
            return _pick_reply(replies, f"{session.oc_name}:{text}"), "fallback-rule-engine"
    return _pick_reply(GENERIC_REPLIES, f"{session.oc_name}:{text}"), "fallback-rule-engine"


def _maybe_create_memory_for_text(
    db: Session,
    *,
    session: ChatSession,
    user_id: int,
    text: str,
) -> MemoryOut | None:
    if len(text.strip()) < 6 and session.interaction_count % 5 != 0:
        return None
    if session.interaction_count % 5 != 0:
        return None

    memory = create_memory(
        db,
        user_id=user_id,
        session_id=session.id,
        oc_id=session.oc_id,
        oc_name=session.oc_name,
        oc_emoji=session.oc_emoji,
        text=f"和{session.oc_name}聊到了「{text[:18]}」",
        metadata={"source": "chat_text"},
    )
    return serialize_memory(memory)


def _bootstrap_session(db: Session, *, session: ChatSession) -> None:
    existing = (
        db.query(ChatMessage.id)
        .filter(ChatMessage.session_id == session.id)
        .first()
    )
    if existing is not None:
        return

    _create_message(
        db,
        session=session,
        message_type="system",
        text="灵魂契约已建立，次元通道开启",
        metadata={"event_type": "session_created"},
    )
    _create_message(
        db,
        session=session,
        message_type="oc",
        text=f"你好呀，我是{session.oc_name}。这一次，我们终于正式连上线了。",
    )


def create_or_get_session(
    db: Session,
    *,
    user_id: int,
    payload: ChatSessionCreateRequest,
) -> ChatSessionOut:
    vip_status = get_user_vip_status(db, user_id=user_id)
    session = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id, ChatSession.oc_id == payload.oc_id)
        .first()
    )
    if session is None:
        session = ChatSession(
            user_id=user_id,
            oc_id=payload.oc_id,
            oc_name=payload.oc_name,
            oc_emoji=payload.oc_emoji,
            oc_avatar=payload.oc_avatar,
            oc_gradient=payload.oc_gradient,
            oc_title=payload.oc_title,
            intimacy=min(100, payload.initial_intimacy),
            total_affinity=max(payload.initial_intimacy, (payload.initial_level - 1) * 10),
            level=max(payload.initial_level, 1),
            is_vip_active=vip_status.is_active,
            vip_expires_at=vip_status.expires_at,
        )
        db.add(session)
        db.flush()
    else:
        session.oc_name = payload.oc_name
        session.oc_emoji = payload.oc_emoji
        session.oc_avatar = payload.oc_avatar
        session.oc_gradient = payload.oc_gradient
        session.oc_title = payload.oc_title
        session.total_affinity = max(
            session.total_affinity,
            payload.initial_intimacy,
            max(payload.initial_level - 1, 0) * 10,
        )
        session.intimacy = min(100, max(session.intimacy, payload.initial_intimacy))
        session.level = max(session.level, payload.initial_level, session.total_affinity // 10 + 1)
        _sync_session_vip(session, vip_status)
        db.flush()

    _bootstrap_session(db, session=session)
    db.commit()
    db.refresh(session)
    return serialize_session(session)


def list_sessions(db: Session, *, user_id: int) -> ChatSessionListPayload:
    vip_status = get_user_vip_status(db, user_id=user_id)
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(ChatSession.updated_at.desc(), ChatSession.id.desc())
        .all()
    )
    for item in sessions:
        _sync_session_vip(item, vip_status)
    db.commit()
    return ChatSessionListPayload(
        items=[serialize_session(item) for item in sessions],
        vip=vip_status,
    )


def list_messages(
    db: Session,
    *,
    user_id: int,
    session_id: int,
) -> ChatMessageListPayload:
    vip_status = get_user_vip_status(db, user_id=user_id)
    session = _get_owned_session(db, user_id=user_id, session_id=session_id)
    _sync_session_vip(session, vip_status)
    _bootstrap_session(db, session=session)
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.id.asc())
        .all()
    )
    db.commit()
    db.refresh(session)
    return ChatMessageListPayload(
        session=serialize_session(session),
        items=[serialize_message(item) for item in messages],
        vip=vip_status,
    )


def send_text_message(
    db: Session,
    *,
    user_id: int,
    session_id: int,
    payload: ChatMessageSendRequest,
) -> ChatInteractionPayload:
    vip_status = get_user_vip_status(db, user_id=user_id)
    session = _get_owned_session(db, user_id=user_id, session_id=session_id)
    _sync_session_vip(session, vip_status)

    user_message = _create_message(
        db,
        session=session,
        message_type="user",
        text=payload.text,
    )
    reply_text, provider = _generate_text_reply(session, payload.text)
    reply_message = _create_message(
        db,
        session=session,
        message_type="oc",
        text=reply_text,
        metadata={"provider": provider},
    )
    leveled_up = _apply_affinity(session, base_amount=1, vip_active=vip_status.is_active)
    messages = [serialize_message(user_message), serialize_message(reply_message)]
    if leveled_up:
        level_up_message = _record_level_up_message(db, session=session)
        if level_up_message is not None:
            messages.append(serialize_message(level_up_message))

    new_memory = _maybe_create_memory_for_text(
        db,
        session=session,
        user_id=user_id,
        text=payload.text,
    )
    db.commit()
    db.refresh(session)
    memories = [new_memory] if new_memory is not None else []
    return ChatInteractionPayload(
        session=serialize_session(session),
        messages=messages,
        memories=memories,
        vip=vip_status,
    )


def _store_uploaded_image(file: UploadFile) -> str:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise BadRequestException("仅支持 jpg/jpeg/png/gif/webp 图片")

    directory = settings.upload_path / "chat"
    directory.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{extension}"
    target = directory / filename
    with target.open("wb") as output:
        output.write(file.file.read())
    return f"/uploads/chat/{filename}"


def send_image_message(
    db: Session,
    *,
    user_id: int,
    session_id: int,
    file: UploadFile,
) -> ChatInteractionPayload:
    vip_status = get_user_vip_status(db, user_id=user_id)
    session = _get_owned_session(db, user_id=user_id, session_id=session_id)
    _sync_session_vip(session, vip_status)

    image_url = _store_uploaded_image(file)
    user_message = _create_message(
        db,
        session=session,
        message_type="user",
        image_url=image_url,
        metadata={"kind": "image"},
    )
    reply_message = _create_message(
        db,
        session=session,
        message_type="oc",
        text=_pick_reply(PHOTO_REPLIES, image_url),
        metadata={"provider": "placeholder-rule-engine", "source": "image"},
    )
    leveled_up = _apply_affinity(session, base_amount=2, vip_active=vip_status.is_active)
    memory = create_memory(
        db,
        user_id=user_id,
        session_id=session.id,
        oc_id=session.oc_id,
        oc_name=session.oc_name,
        oc_emoji=session.oc_emoji,
        text=f"给{session.oc_name}分享了一张照片",
        metadata={"source": "image_message", "image_url": image_url},
    )
    messages = [serialize_message(user_message), serialize_message(reply_message)]
    if leveled_up:
        level_up_message = _record_level_up_message(db, session=session)
        if level_up_message is not None:
            messages.append(serialize_message(level_up_message))

    db.commit()
    db.refresh(session)
    return ChatInteractionPayload(
        session=serialize_session(session),
        messages=messages,
        memories=[serialize_memory(memory)],
        vip=vip_status,
    )


def send_gift(
    db: Session,
    *,
    user_id: int,
    session_id: int,
    payload: ChatGiftRequest,
) -> ChatInteractionPayload:
    vip_status = get_user_vip_status(db, user_id=user_id)
    session = _get_owned_session(db, user_id=user_id, session_id=session_id)
    _sync_session_vip(session, vip_status)

    system_message = _create_message(
        db,
        session=session,
        message_type="system",
        text=f"你送出了 {payload.emoji or '🎁'} {payload.name}",
        metadata={
            "event_type": "gift",
            "gift_code": payload.gift_code,
            "gift_name": payload.name,
            "gift_emoji": payload.emoji,
            "affinity": payload.intimacy,
        },
    )
    reply_text = payload.reply_text or _pick_reply(GIFT_REPLIES, payload.name)
    reply_message = _create_message(
        db,
        session=session,
        message_type="oc",
        text=reply_text,
        metadata={"provider": "placeholder-rule-engine", "source": "gift"},
    )
    leveled_up = _apply_affinity(session, base_amount=payload.intimacy, vip_active=vip_status.is_active)
    memory = create_memory(
        db,
        user_id=user_id,
        session_id=session.id,
        oc_id=session.oc_id,
        oc_name=session.oc_name,
        oc_emoji=session.oc_emoji,
        text=f"给{session.oc_name}送了{payload.name}",
        metadata={"source": "gift", "gift_name": payload.name, "gift_emoji": payload.emoji},
    )

    messages = [serialize_message(system_message), serialize_message(reply_message)]
    if leveled_up:
        level_up_message = _record_level_up_message(db, session=session)
        if level_up_message is not None:
            messages.append(serialize_message(level_up_message))

    db.commit()
    db.refresh(session)
    return ChatInteractionPayload(
        session=serialize_session(session),
        messages=messages,
        memories=[serialize_memory(memory)],
        vip=vip_status,
    )


def log_voice_call(
    db: Session,
    *,
    user_id: int,
    session_id: int,
    payload: VoiceCallLogRequest,
) -> ChatInteractionPayload:
    vip_status = get_user_vip_status(db, user_id=user_id)
    if not vip_status.is_active:
        raise BadRequestException("语音通话为 VIP 占位功能，请先开通体验版 VIP")

    session = _get_owned_session(db, user_id=user_id, session_id=session_id)
    _sync_session_vip(session, vip_status)

    minutes = payload.duration_seconds // 60
    seconds = payload.duration_seconds % 60
    system_message = _create_message(
        db,
        session=session,
        message_type="system",
        text=f"语音通话已结束，时长 {minutes}分{seconds}秒",
        metadata={
            "event_type": "voice_call",
            "duration_seconds": payload.duration_seconds,
            "tone_name": payload.tone_name,
            "tone_emoji": payload.tone_emoji,
        },
    )
    reply_message = _create_message(
        db,
        session=session,
        message_type="oc",
        text=_pick_reply(VOICE_REPLIES, f"{session.oc_name}:{payload.duration_seconds}"),
        metadata={"provider": "placeholder-rule-engine", "source": "voice_call"},
    )
    affinity_amount = max(1, payload.duration_seconds // 30 + 1)
    leveled_up = _apply_affinity(session, base_amount=affinity_amount, vip_active=vip_status.is_active)
    memory = create_memory(
        db,
        user_id=user_id,
        session_id=session.id,
        oc_id=session.oc_id,
        oc_name=session.oc_name,
        oc_emoji=session.oc_emoji,
        text=f"和{session.oc_name}进行了一次 {minutes}分{seconds}秒 的语音通话",
        metadata={
            "source": "voice_call",
            "duration_seconds": payload.duration_seconds,
            "tone_name": payload.tone_name,
        },
    )

    messages = [serialize_message(system_message), serialize_message(reply_message)]
    if leveled_up:
        level_up_message = _record_level_up_message(db, session=session)
        if level_up_message is not None:
            messages.append(serialize_message(level_up_message))

    db.commit()
    db.refresh(session)
    return ChatInteractionPayload(
        session=serialize_session(session),
        messages=messages,
        memories=[serialize_memory(memory)],
        vip=vip_status,
    )


def latest_memories(db: Session, *, user_id: int, limit: int = 50) -> list[MemoryOut]:
    return list_memories(db, user_id=user_id, limit=limit)
