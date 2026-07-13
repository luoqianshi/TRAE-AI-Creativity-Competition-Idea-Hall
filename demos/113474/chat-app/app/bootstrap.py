"""应用启动/关闭逻辑"""
from __future__ import annotations

import uuid

from app.config import get_default_bot_config, get_settings
from app.logging import get_logger
from db.models import Base
from db.repository import (
    create_ai_bot,
    create_user,
    get_ai_bot_by_user_id,
    get_user_by_username,
)
from db.session import AsyncSessionLocal, engine

logger = get_logger(__name__)


async def startup():
    """启动：建表 + 初始化默认 AI bot"""
    # 建表
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("数据库表已就绪")

    # 初始化默认 AI bot
    await _init_default_bot()

    settings = get_settings()
    logger.info(
        f"IM 聊天应用已启动：http://{settings.host}:{settings.port}"
    )


async def shutdown():
    """关闭：释放资源"""
    await engine.dispose()
    logger.info("数据库连接已关闭")


async def _init_default_bot():
    """初始化默认 AI bot（若不存在）"""
    cfg = get_default_bot_config()
    if not cfg:
        return

    bot_username = cfg.get("username", "ai_assistant")

    async with AsyncSessionLocal() as session:
        existing = await get_user_by_username(session, bot_username)
        if existing is not None:
            # 已存在则跳过（保持用户修改的配置不被覆盖）
            return

        bot_user_id = str(uuid.uuid4())
        await create_user(
            session,
            user_id=bot_user_id,
            username=bot_username,
            password_hash=None,
            nickname=cfg.get("nickname", cfg.get("name", "AI助手")),
            is_bot=True,
        )

        await create_ai_bot(
            session,
            user_id=bot_user_id,
            name=cfg.get("name", "AI助手"),
            provider=cfg.get("provider", "local"),
            api_key=cfg.get("api_key"),
            base_url=cfg.get("base_url", "http://127.0.0.1:11434/v1"),
            model=cfg.get("model", "qwen2.5"),
            system_prompt=cfg.get("system_prompt"),
            max_history=int(cfg.get("max_history", 10)),
            temperature=float(cfg.get("temperature", 0.7)),
            max_tokens=int(cfg.get("max_tokens", 256)),
            image_gen_enabled=bool(cfg.get("image_gen_enabled", True)),
            created_by=None,  # 系统创建
        )
        await session.commit()
        logger.info(f"默认 AI bot 已创建: @{bot_username}")
