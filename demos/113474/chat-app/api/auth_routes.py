"""认证与用户 API"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.security import create_access_token, get_current_user, hash_password, verify_password
from db import repository as repo
from db.session import get_db_dependency

router = APIRouter(prefix="/auth", tags=["auth"])


# ===== 请求模型 =====

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=32, description="登录用户名")
    password: str = Field(..., min_length=6, max_length=64, description="密码")
    nickname: str | None = Field(None, max_length=64, description="昵称")


class LoginRequest(BaseModel):
    username: str
    password: str


# ===== 接口 =====

@router.post("/register")
async def register(
    req: RegisterRequest,
    session: AsyncSession = Depends(get_db_dependency),
):
    """注册新用户"""
    # 校验用户名是否占用
    existing = await repo.get_user_by_username(session, req.username)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"用户名 '{req.username}' 已被占用",
        )

    user_id = str(uuid.uuid4())
    user = await repo.create_user(
        session,
        user_id=user_id,
        username=req.username,
        password_hash=hash_password(req.password),
        nickname=req.nickname or req.username,
        is_bot=False,
    )
    await session.commit()

    token = create_access_token(user_id, user.username)
    return {
        "token": token,
        "user": _user_to_dict(user),
    }


@router.post("/login")
async def login(
    req: LoginRequest,
    session: AsyncSession = Depends(get_db_dependency),
):
    """登录"""
    user = await repo.get_user_by_username(session, req.username)
    if user is None or user.is_bot:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )

    if not verify_password(req.password, user.password_hash or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )

    token = create_access_token(user.id, user.username)
    return {
        "token": token,
        "user": _user_to_dict(user),
    }


@router.get("/me")
async def get_me(
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """获取当前用户信息"""
    user = await repo.get_user_by_id(session, current["user_id"])
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return _user_to_dict(user)


@router.get("/users/search")
async def search_users(
    keyword: str,
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """搜索用户（按用户名精确或昵称模糊）"""
    if not keyword or len(keyword.strip()) < 1:
        return {"users": []}

    users = await repo.search_users(session, keyword.strip())
    return {
        "users": [
            _user_to_dict(u) for u in users if u.id != current["user_id"]
        ]
    }


def _user_to_dict(user) -> dict[str, Any]:
    return {
        "id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "avatar": user.avatar,
        "is_bot": user.is_bot,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
