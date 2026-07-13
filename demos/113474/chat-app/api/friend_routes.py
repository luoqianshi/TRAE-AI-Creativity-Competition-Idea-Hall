"""好友系统 API"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.security import get_current_user
from core.connection_manager import get_connection_manager
from db import repository as repo
from db.session import get_db_dependency

router = APIRouter(prefix="/friends", tags=["friends"])


class FriendRequestPayload(BaseModel):
    friend_id: str = Field(..., description="目标用户 ID")


@router.post("/request")
async def send_friend_request(
    req: FriendRequestPayload,
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """发送好友请求"""
    user_id = current["user_id"]
    friend_id = req.friend_id

    if user_id == friend_id:
        raise HTTPException(400, "不能加自己为好友")

    target = await repo.get_user_by_id(session, friend_id)
    if target is None:
        raise HTTPException(404, "目标用户不存在")

    # 检查是否已是好友或已有待处理请求
    existing = await repo.get_friendship(session, user_id, friend_id)
    if existing is not None:
        if existing.status == "accepted":
            raise HTTPException(400, "已经是好友了")
        if existing.status == "pending":
            raise HTTPException(400, "好友请求已发送，等待对方确认")
        if existing.status == "blocked":
            raise HTTPException(400, "好友请求已被拒绝")

    fp = await repo.create_friend_request(session, user_id, friend_id)

    # AI bot 无需人工确认，自动接受（双向 accepted）
    if target.is_bot:
        await repo.accept_friend_request(session, fp.id)
        await session.commit()
        return {"status": "accepted", "friendship_id": fp.id}

    await session.commit()

    # WS 推送给对方
    cm = get_connection_manager()
    await cm.send_to_user(
        friend_id,
        {
            "type": "friend_request",
            "data": {
                "friendship_id": fp.id,
                "user_id": user_id,
                "username": current["username"],
                "created_at": fp.created_at.isoformat() if fp.created_at else None,
            },
        },
    )

    return {"status": "ok", "friendship_id": fp.id}


@router.post("/{friendship_id}/accept")
async def accept_friend_request(
    friendship_id: int,
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """接受好友请求"""
    ok = await repo.accept_friend_request(session, friendship_id)
    if not ok:
        raise HTTPException(400, "好友请求不存在或已处理")
    await session.commit()

    # 查原请求方信息，WS 通知
    from sqlalchemy import select
    from db.models import Friendship, User

    result = await session.execute(
        select(Friendship).where(Friendship.id == friendship_id)
    )
    fp = result.scalar_one_or_none()
    if fp:
        # 通知请求方：对方已接受
        cm = get_connection_manager()
        await cm.send_to_user(
            fp.user_id,
            {
                "type": "friend_accepted",
                "data": {"friend_id": current["user_id"]},
            },
        )

    return {"status": "ok"}


@router.post("/{friendship_id}/reject")
async def reject_friend_request(
    friendship_id: int,
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """拒绝好友请求"""
    ok = await repo.reject_friend_request(session, friendship_id)
    if not ok:
        raise HTTPException(400, "好友请求不存在")
    await session.commit()
    return {"status": "ok"}


@router.get("")
async def list_friends(
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """好友列表"""
    friends = await repo.list_friends(session, current["user_id"])
    return {
        "friends": [
            {
                "id": f.id,
                "username": f.username,
                "nickname": f.nickname,
                "avatar": f.avatar,
                "is_bot": f.is_bot,
            }
            for f in friends
        ]
    }


@router.get("/requests")
async def list_pending_requests(
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """收到的待处理好友请求"""
    requests = await repo.list_pending_requests(session, current["user_id"])
    return {"requests": requests}
