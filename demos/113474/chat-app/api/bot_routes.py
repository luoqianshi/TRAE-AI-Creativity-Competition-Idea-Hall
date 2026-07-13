"""AI 机器人管理 API"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ai.engine import get_ai_engine
from app.security import get_current_user
from db import repository as repo
from db.session import get_db_dependency

router = APIRouter(prefix="/bots", tags=["bots"])


class CreateBotRequest(BaseModel):
    name: str = Field(..., max_length=64, description="bot 显示名")
    username: str = Field(..., min_length=2, max_length=32, description="bot 登录名")
    provider: str = Field("local", description="local | deepseek | openai")
    api_key: str | None = Field(None, description="API 密钥")
    base_url: str = Field("http://127.0.0.1:11434/v1", description="OpenAI 兼容端点")
    model: str = Field("qwen2.5", description="模型名")
    system_prompt: str | None = Field(None, description="系统提示词")
    max_history: int = Field(10, ge=1, le=50)
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(256, ge=16, le=4096)
    image_gen_enabled: bool = True


class UpdateBotRequest(BaseModel):
    name: str | None = None
    provider: str | None = None
    api_key: str | None = None
    base_url: str | None = None
    model: str | None = None
    system_prompt: str | None = None
    max_history: int | None = Field(None, ge=1, le=50)
    temperature: float | None = Field(None, ge=0.0, le=2.0)
    max_tokens: int | None = Field(None, ge=16, le=4096)
    image_gen_enabled: bool | None = None


@router.post("")
async def create_bot(
    req: CreateBotRequest,
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """创建 AI bot（创建一个 bot 用户 + 配置）"""
    # 校验用户名
    existing = await repo.get_user_by_username(session, req.username)
    if existing is not None:
        raise HTTPException(409, f"用户名 '{req.username}' 已被占用")

    bot_user_id = str(uuid.uuid4())
    user = await repo.create_user(
        session,
        user_id=bot_user_id,
        username=req.username,
        password_hash=None,
        nickname=req.name,
        is_bot=True,
    )

    bot = await repo.create_ai_bot(
        session,
        user_id=bot_user_id,
        name=req.name,
        provider=req.provider,
        api_key=req.api_key,
        base_url=req.base_url,
        model=req.model,
        system_prompt=req.system_prompt,
        max_history=req.max_history,
        temperature=req.temperature,
        max_tokens=req.max_tokens,
        image_gen_enabled=req.image_gen_enabled,
        created_by=current["user_id"],
    )
    await session.commit()

    return {
        "bot_id": bot.id,
        "user_id": bot_user_id,
        "username": req.username,
        "name": req.name,
    }


@router.get("")
async def list_bots(
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """列出可管理的 AI bot（系统默认 + 自己创建的）"""
    bots = await repo.list_ai_bots(session, creator_id=current["user_id"])
    return {
        "bots": [
            {
                "id": b.id,
                "user_id": b.user_id,
                "name": b.name,
                "provider": b.provider,
                "base_url": b.base_url,
                "model": b.model,
                "has_api_key": bool(b.api_key),
                "image_gen_enabled": b.image_gen_enabled,
                "max_history": b.max_history,
                "temperature": b.temperature,
                "max_tokens": b.max_tokens,
                "system_prompt": b.system_prompt,
                "created_by": b.created_by,
            }
            for b in bots
        ]
    }


@router.get("/{bot_id}")
async def get_bot(
    bot_id: int,
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """获取 bot 详情"""
    bot = await repo.get_ai_bot_by_id(session, bot_id)
    if bot is None:
        raise HTTPException(404, "bot 不存在")
    return {
        "id": bot.id,
        "user_id": bot.user_id,
        "name": bot.name,
        "provider": bot.provider,
        "api_key": bot.api_key,
        "base_url": bot.base_url,
        "model": bot.model,
        "system_prompt": bot.system_prompt,
        "max_history": bot.max_history,
        "temperature": bot.temperature,
        "max_tokens": bot.max_tokens,
        "image_gen_enabled": bot.image_gen_enabled,
        "created_by": bot.created_by,
    }


@router.put("/{bot_id}")
async def update_bot(
    bot_id: int,
    req: UpdateBotRequest,
    current: dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_dependency),
):
    """更新 bot 配置"""
    bot = await repo.get_ai_bot_by_id(session, bot_id)
    if bot is None:
        raise HTTPException(404, "bot 不存在")

    fields = {k: v for k, v in req.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "没有需要更新的字段")

    await repo.update_ai_bot(session, bot_id, **fields)
    await session.commit()

    # 清除缓存的 LLM 客户端（配置变了需重建）
    get_ai_engine().invalidate(bot.user_id)

    return {"status": "ok", "updated": list(fields.keys())}
