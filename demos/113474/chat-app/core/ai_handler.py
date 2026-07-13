"""AI 自动回复处理器

当用户发消息给 AI bot 时，此处理器：
1. 推送 typing 状态
2. 加载 bot 配置 + 对话历史
3. 调用 LLM 生成回复
4. 若回复含 [IMAGE:...] 标记 → 生成图片
5. 持久化回复 + 推送给用户
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select

from app.logging import get_logger
from ai.engine import get_ai_engine
from ai.image_gen import get_image_gen_service
from core.connection_manager import get_connection_manager
from db import repository as repo
from db.models import Message
from db.session import get_db

logger = get_logger(__name__)


# 匹配 [IMAGE:图片描述] 标记
IMAGE_TAG_PATTERN = re.compile(r"\[IMAGE[:：]\s*(.+?)\]", re.IGNORECASE | re.DOTALL)

FALLBACK_REPLIES = [
    "抱歉，我现在无法回复，请稍后再试。",
    "AI 服务暂时不可用，请稍后重试。",
]


class AIHandler:
    """AI 自动回复处理器"""

    async def process(
        self,
        sender_id: str,
        bot_id: str,
        user_msg_id: int,
    ) -> None:
        """处理用户 → bot 的消息，生成 AI 回复"""
        cm = get_connection_manager()

        # 1. 推送 typing 状态
        await cm.send_to_user(
            sender_id,
            {
                "type": "typing",
                "data": {"sender_id": bot_id, "is_typing": True},
            },
        )

        try:
            async with get_db() as session:
                # 2. 加载 bot 配置
                bot = await repo.get_ai_bot_by_user_id(session, bot_id)
                if bot is None:
                    await self._send_fallback(sender_id, bot_id, "bot 配置不存在")
                    return

                # 获取用户原始消息
                user_msg_result = await session.execute(
                    select(Message).where(Message.id == user_msg_id)
                )
                user_msg = user_msg_result.scalar_one_or_none()
                if user_msg is None:
                    return

                user_content = user_msg.content or ""

                # 3. 查对话历史
                history_msgs = await repo.get_conversation_history(
                    session, sender_id, bot_id, limit=bot.max_history * 2
                )

            # 4. 组装 LLM messages
            llm_messages = self._build_llm_messages(
                bot.system_prompt, history_msgs, sender_id, bot_id, user_content
            )

            # 5. 调用 LLM
            engine = get_ai_engine()
            result = await engine.chat(
                bot_user_id=bot_id,
                api_key=bot.api_key or "local",
                base_url=bot.base_url,
                model=bot.model,
                messages=llm_messages,
                temperature=bot.temperature,
                max_tokens=bot.max_tokens,
            )

            reply_text = result["text"]

            # 6. 检查是否需要生成图片
            image_path = None
            text_to_send = reply_text

            if bot.image_gen_enabled:
                img_match = IMAGE_TAG_PATTERN.search(reply_text)
                if img_match:
                    img_prompt = img_match.group(1).strip()
                    # 移除标记，保留其余文本
                    text_to_send = IMAGE_TAG_PATTERN.sub("", reply_text).strip()
                    if not text_to_send:
                        text_to_send = None

                    image_gen = get_image_gen_service()
                    image_path = await image_gen.generate(img_prompt)

            # 7. 推送 typing 结束
            await cm.send_to_user(
                sender_id,
                {
                    "type": "typing",
                    "data": {"sender_id": bot_id, "is_typing": False},
                },
            )

            # 8. 持久化 + 推送文本回复
            if text_to_send:
                async with get_db() as session:
                    msg = await repo.save_message(
                        session,
                        sender_id=bot_id,
                        receiver_id=sender_id,
                        msg_type="text",
                        content=text_to_send,
                        status="sent",
                        llm_model=result["model"],
                        prompt_tokens=result["prompt_tokens"],
                        completion_tokens=result["completion_tokens"],
                    )
                    msg_id = msg.id
                    created_at = msg.created_at

                await cm.send_to_user(
                    sender_id,
                    {
                        "type": "chat",
                        "data": {
                            "msg_id": msg_id,
                            "sender_id": bot_id,
                            "msg_type": "text",
                            "content": text_to_send,
                            "llm_model": result["model"],
                            "created_at": created_at.isoformat() if created_at else None,
                        },
                    },
                )

            # 9. 持久化 + 推送图片
            if image_path:
                async with get_db() as session:
                    msg = await repo.save_message(
                        session,
                        sender_id=bot_id,
                        receiver_id=sender_id,
                        msg_type="image",
                        content="[AI 生成图片]",
                        media_path=image_path,
                        status="sent",
                        llm_model=result["model"],
                    )
                    msg_id = msg.id
                    created_at = msg.created_at

                await cm.send_to_user(
                    sender_id,
                    {
                        "type": "chat",
                        "data": {
                            "msg_id": msg_id,
                            "sender_id": bot_id,
                            "msg_type": "image",
                            "content": "[AI 生成图片]",
                            "media_path": image_path,
                            "llm_model": result["model"],
                            "created_at": created_at.isoformat() if created_at else None,
                        },
                    },
                )

            logger.info(
                f"AI 回复完成: bot={bot_id} user={sender_id} "
                f"tokens={result['prompt_tokens']}+{result['completion_tokens']}"
            )

        except Exception as e:
            logger.exception(f"AI 回复失败: {e}")
            err_msg = str(e)
            if "402" in err_msg or "Insufficient Balance" in err_msg:
                hint = "API 账户余额不足，请充值或切换到本地模型"
            elif "401" in err_msg or "Authentication" in err_msg:
                hint = "API key 无效，请在设置页检查配置"
            elif "Connection" in err_msg or "connect" in err_msg.lower():
                hint = "无法连接 AI 服务，请检查 base_url 或确认本地 llama-server 已启动"
            else:
                hint = f"{type(e).__name__}: {err_msg}"

            await self._send_fallback(sender_id, bot_id, hint)

    def _build_llm_messages(
        self,
        system_prompt: str | None,
        history: list,
        sender_id: str,
        bot_id: str,
        current_content: str,
    ) -> list[dict[str, str]]:
        """组装 LLM messages（system + history + current）"""
        messages: list[dict[str, str]] = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        # 历史消息（排除当前消息）
        for m in history:
            if m.content is None:
                continue
            if m.sender_id == bot_id:
                messages.append({"role": "assistant", "content": m.content})
            else:
                messages.append({"role": "user", "content": m.content})

        # 当前消息
        messages.append({"role": "user", "content": current_content})

        return messages

    async def _send_fallback(
        self, sender_id: str, bot_id: str, reason: str
    ) -> None:
        """发送兜底回复"""
        import random

        text = f"{random.choice(FALLBACK_REPLIES)}\n（原因：{reason}）"

        async with get_db() as session:
            msg = await repo.save_message(
                session,
                sender_id=bot_id,
                receiver_id=sender_id,
                msg_type="text",
                content=text,
                status="sent",
                llm_model="fallback",
            )
            msg_id = msg.id
            created_at = msg.created_at

        cm = get_connection_manager()
        await cm.send_to_user(
            sender_id,
            {
                "type": "chat",
                "data": {
                    "msg_id": msg_id,
                    "sender_id": bot_id,
                    "msg_type": "text",
                    "content": text,
                    "llm_model": "fallback",
                    "created_at": created_at.isoformat() if created_at else None,
                },
            },
        )


# 全局单例
_handler: AIHandler | None = None


def get_ai_handler() -> AIHandler:
    global _handler
    if _handler is None:
        _handler = AIHandler()
    return _handler
