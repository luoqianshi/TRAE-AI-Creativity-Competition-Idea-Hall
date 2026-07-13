"""AI 引擎：按 bot 缓存 AsyncOpenAI 客户端

DeepSeek/llama.cpp/OpenAI 均走 OpenAI 兼容协议，统一用 AsyncOpenAI。
"""
from __future__ import annotations

from typing import Any

from openai import AsyncOpenAI

from app.logging import get_logger

logger = get_logger(__name__)


class AIEngine:
    """AI 引擎单例：管理多个 bot 的 LLM 客户端"""

    def __init__(self):
        # 缓存：bot_user_id -> AsyncOpenAI
        self._clients: dict[str, AsyncOpenAI] = {}

    def get_client(
        self,
        bot_user_id: str,
        api_key: str,
        base_url: str,
    ) -> AsyncOpenAI:
        """获取或创建 LLM 客户端（按 bot 缓存）"""
        if bot_user_id in self._clients:
            return self._clients[bot_user_id]

        client = AsyncOpenAI(
            api_key=api_key or "local",
            base_url=base_url,
            timeout=120.0,
        )
        self._clients[bot_user_id] = client
        logger.info(f"创建 LLM 客户端: bot={bot_user_id} base_url={base_url}")
        return client

    def invalidate(self, bot_user_id: str) -> None:
        """配置变更时清除缓存的客户端"""
        self._clients.pop(bot_user_id, None)

    async def chat(
        self,
        bot_user_id: str,
        api_key: str,
        base_url: str,
        model: str,
        messages: list[dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 256,
    ) -> dict[str, Any]:
        """调用 LLM 生成回复

        Returns:
            {
                "text": str,
                "model": str,
                "prompt_tokens": int,
                "completion_tokens": int,
            }
        """
        client = self.get_client(bot_user_id, api_key, base_url)

        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=False,
        )

        text = response.choices[0].message.content or ""
        prompt_tokens = response.usage.prompt_tokens if response.usage else 0
        completion_tokens = response.usage.completion_tokens if response.usage else 0

        return {
            "text": text.strip(),
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        }


# 全局单例
_engine: AIEngine | None = None


def get_ai_engine() -> AIEngine:
    global _engine
    if _engine is None:
        _engine = AIEngine()
    return _engine
