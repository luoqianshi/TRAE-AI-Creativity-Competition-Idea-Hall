"""消息路由：持久化 → 推送 → 触发 AI"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from app.logging import get_logger
from core.connection_manager import get_connection_manager
from db import repository as repo
from db.session import get_db
from db.models import Message

logger = get_logger(__name__)


async def handle_outgoing_message(
    sender_id: str,
    receiver_id: str,
    msg_type: str,
    content: str | None = None,
    media_path: str | None = None,
) -> dict[str, Any]:
    """处理用户发出的消息

    流程：
    1. 持久化到 DB（status=sent）
    2. 回 ACK 给发送者
    3. 若接收者是 bot → 异步触发 AI 回复
    4. 否则推送给接收者（在线则 status=delivered，离线仅存库）
    """
    # 1. 持久化
    async with get_db() as session:
        msg = await repo.save_message(
            session,
            sender_id=sender_id,
            receiver_id=receiver_id,
            msg_type=msg_type,
            content=content,
            media_path=media_path,
            status="sent",
        )
        msg_id = msg.id
        created_at = msg.created_at

        # 查接收者是否 bot
        receiver = await repo.get_user_by_id(session, receiver_id)
        is_bot_receiver = receiver is not None and receiver.is_bot

    cm = get_connection_manager()

    # 2. ACK 给发送者（所有设备）
    ack_payload = {
        "type": "ack",
        "data": {
            "msg_id": msg_id,
            "receiver_id": receiver_id,
            "msg_type": msg_type,
            "content": content,
            "media_path": media_path,
            "status": "sent",
            "created_at": created_at.isoformat() if created_at else None,
        },
    }
    await cm.send_to_user(sender_id, ack_payload)

    # 3. 若接收者是 bot → 异步触发 AI
    if is_bot_receiver:
        asyncio.create_task(
            _trigger_ai_reply(sender_id, receiver_id, msg_id)
        )
        return {"msg_id": msg_id, "status": "sent", "triggered_ai": True}

    # 4. 推送给接收者
    chat_payload = {
        "type": "chat",
        "data": {
            "msg_id": msg_id,
            "sender_id": sender_id,
            "msg_type": msg_type,
            "content": content,
            "media_path": media_path,
            "created_at": created_at.isoformat() if created_at else None,
        },
    }
    delivered = await cm.send_to_user(receiver_id, chat_payload)

    # 更新状态
    new_status = "delivered" if delivered else "sent"
    async with get_db() as session:
        await repo.update_message_status(session, msg_id, new_status)

    return {"msg_id": msg_id, "status": new_status, "triggered_ai": False}


async def handle_read_receipt(
    reader_id: str, peer_id: str
) -> int:
    """标记对方发来的消息为已读，并通知对方"""
    async with get_db() as session:
        count = await repo.mark_messages_read(session, reader_id, peer_id)

    if count > 0:
        cm = get_connection_manager()
        await cm.send_to_user(
            peer_id,
            {
                "type": "read",
                "data": {"reader_id": reader_id, "count": count},
            },
        )
    return count


async def handle_typing(
    sender_id: str, receiver_id: str, is_typing: bool = True
) -> None:
    """转发"正在输入"状态"""
    cm = get_connection_manager()
    await cm.send_to_user(
        receiver_id,
        {
            "type": "typing",
            "data": {
                "sender_id": sender_id,
                "is_typing": is_typing,
            },
        },
    )


async def _trigger_ai_reply(
    sender_id: str, bot_id: str, user_msg_id: int
):
    """触发 AI 自动回复（异步，不阻塞主消息流）"""
    try:
        # 延迟导入避免循环依赖
        from core.ai_handler import get_ai_handler

        handler = get_ai_handler()
        await handler.process(sender_id, bot_id, user_msg_id)
    except Exception as e:
        logger.exception(f"AI 回复触发失败: {e}")
        # 兜底：发送错误提示
        cm = get_connection_manager()
        await cm.send_to_user(
            sender_id,
            {
                "type": "chat",
                "data": {
                    "sender_id": bot_id,
                    "msg_type": "system",
                    "content": f"[AI 暂时无法回复：{type(e).__name__}]",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                },
            },
        )
