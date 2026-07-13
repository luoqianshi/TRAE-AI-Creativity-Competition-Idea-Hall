"""消息与媒体 API"""
from __future__ import annotations

import asyncio
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import MEDIA_DIR, PROJECT_ROOT
from app.logging import get_logger
from app.security import get_current_user
from core.message_router import handle_read_receipt
from db import repository as repo
from db.session import get_db, get_db_dependency

logger = get_logger(__name__)
router = APIRouter(tags=["messages"])


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}
ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


@router.get("/conversations")
async def list_conversations(
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """会话列表（按最后消息排序）"""
    convs = await repo.get_recent_conversations(session, current["user_id"])
    unread = await repo.get_unread_count(session, current["user_id"])
    return {"conversations": convs, "total_unread": unread}


@router.get("/messages/{peer_id}")
async def get_messages(
    peer_id: str,
    limit: int = 50,
    before_id: int | None = None,
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """获取与某人的消息历史"""
    messages = await repo.get_conversation_history(
        session, current["user_id"], peer_id, limit=limit, before_id=before_id
    )

    # 标记对方发来的为已读
    await repo.mark_messages_read(session, current["user_id"], peer_id)
    await session.commit()

    # 通知对方已读
    await handle_read_receipt(current["user_id"], peer_id)

    return {
        "messages": [_msg_to_dict(m, current["user_id"]) for m in messages],
        "peer_id": peer_id,
    }


@router.post("/messages/upload")
async def upload_image(
    file: UploadFile = File(...),
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """上传图片，返回 media_path（用于 WS 发送 image 消息时引用）"""
    # 校验类型
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, f"不支持的图片类型: {file.content_type}")

    # 读取内容
    data = await file.read()
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(400, f"图片大小不能超过 {MAX_IMAGE_SIZE // 1024 // 1024}MB")

    # sha256 去重
    sha256 = hashlib.sha256(data).hexdigest()

    existing = await repo.find_media_by_sha256(session, sha256)
    if existing is not None:
        return {
            "media_path": existing.local_path,
            "sha256": sha256,
            "size": len(data),
            "cached": True,
        }

    # 保存文件（按 sha256 前缀分目录）
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTS:
        ext = ".jpg"

    sub_dir = MEDIA_DIR / "images" / sha256[:2]
    sub_dir.mkdir(parents=True, exist_ok=True)
    save_path = sub_dir / f"{sha256}{ext}"

    await asyncio.to_thread(save_path.write_bytes, data)

    # 落库
    await repo.save_media_asset(
        session, sha256=sha256, local_path=str(save_path), media_type="image"
    )
    await session.commit()

    logger.info(f"图片已上传: {save_path} ({len(data)} bytes)")

    return {
        "media_path": str(save_path),
        "sha256": sha256,
        "size": len(data),
        "cached": False,
    }


@router.get("/media/{path:path}")
async def serve_media(path: str):
    """访问已上传的媒体文件"""
    # 安全：禁止路径穿越
    if ".." in path or path.startswith("/"):
        raise HTTPException(400, "非法路径")

    full_path = MEDIA_DIR / path
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(404, "文件不存在")

    return FileResponse(str(full_path))


def _msg_to_dict(msg, current_user_id: str) -> dict[str, Any]:
    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "msg_type": msg.msg_type,
        "content": msg.content,
        "media_path": msg.media_path,
        "status": msg.status,
        "llm_model": msg.llm_model,
        "is_mine": msg.sender_id == current_user_id,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }
