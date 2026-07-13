"""WebSocket 路由：连接鉴权 + 消息分发"""
from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from app.logging import get_logger
from app.security import decode_token
from core.connection_manager import get_connection_manager
from core.message_router import (
    handle_outgoing_message,
    handle_read_receipt,
    handle_typing,
)

logger = get_logger(__name__)
router = APIRouter(tags=["ws"])


@router.websocket("/ws/chat")
async def ws_chat(
    ws: WebSocket,
    token: str = Query(..., description="JWT token"),
):
    """WebSocket 聊天端点

    连接：ws://host:port/ws/chat?token=xxx
    消息格式：{type: "chat"|"read"|"typing"|"ping", data: {...}}
    """
    # 1. 鉴权
    payload = decode_token(token)
    if payload is None:
        await ws.close(code=4401, reason="token 无效或已过期")
        return

    user_id = payload["sub"]
    username = payload.get("username", "")

    cm = get_connection_manager()
    await cm.connect(user_id, ws)

    # 心跳超时检测
    last_ping = asyncio.get_event_loop().time()
    heartbeat_task = asyncio.create_task(_heartbeat_check(ws, user_id, cm, lambda: last_ping))

    try:
        while True:
            msg = await ws.receive_json()
            msg_type = msg.get("type")
            data = msg.get("data", {})

            if msg_type == "ping":
                last_ping = asyncio.get_event_loop().time()
                await ws.send_json({"type": "pong", "data": {}})
                continue

            if msg_type == "chat":
                await _handle_chat(ws, user_id, data)
            elif msg_type == "read":
                peer_id = data.get("peer_id")
                if peer_id:
                    await handle_read_receipt(user_id, peer_id)
            elif msg_type == "typing":
                peer_id = data.get("peer_id")
                is_typing = data.get("is_typing", True)
                if peer_id:
                    await handle_typing(user_id, peer_id, is_typing)
            else:
                await ws.send_json(
                    {"type": "error", "data": {"message": f"未知消息类型: {msg_type}"}}
                )

    except WebSocketDisconnect:
        logger.info(f"用户 {username} WebSocket 断开")
    except Exception as e:
        logger.exception(f"WebSocket 异常: {e}")
    finally:
        heartbeat_task.cancel()
        await cm.disconnect(user_id, ws)


async def _handle_chat(ws: WebSocket, sender_id: str, data: dict[str, Any]):
    """处理客户端发来的聊天消息"""
    receiver_id = data.get("receiver_id")
    if not receiver_id:
        await ws.send_json(
            {"type": "error", "data": {"message": "缺少 receiver_id"}}
        )
        return

    msg_type = data.get("msg_type", "text")
    if msg_type not in ("text", "image"):
        await ws.send_json(
            {"type": "error", "data": {"message": f"不支持的消息类型: {msg_type}"}}
        )
        return

    content = data.get("content")
    media_path = data.get("media_path")

    if msg_type == "text" and not content:
        await ws.send_json(
            {"type": "error", "data": {"message": "文本消息不能为空"}}
        )
        return

    await handle_outgoing_message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        msg_type=msg_type,
        content=content,
        media_path=media_path,
    )


async def _heartbeat_check(ws: WebSocket, user_id: str, cm, get_last_ping):
    """心跳超时检测：120s 无 ping 则断开"""
    try:
        while True:
            await asyncio.sleep(30)
            now = asyncio.get_event_loop().time()
            if now - get_last_ping() > 120:
                logger.info(f"用户 {user_id} 心跳超时，断开连接")
                try:
                    await ws.close(code=4408, reason="心跳超时")
                except Exception:
                    pass
                return
    except asyncio.CancelledError:
        pass
