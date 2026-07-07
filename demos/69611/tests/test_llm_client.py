"""测试 LLM 客户端模块"""

import os
import pytest
from unittest.mock import Mock, patch, AsyncMock
from utils.llm_client import LLMClient, retry_with_backoff

os.environ.setdefault("DEEPSEEK_API_KEY", "test-api-key")
os.environ.setdefault("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
os.environ.setdefault("LLM_MODEL", "deepseek-chat")


class TestRetryDecorator:
    """Retry decorator tests."""

    @retry_with_backoff(max_retries=3, base_delay=0.01)
    async def _success_func(self):
        return "success"

    @retry_with_backoff(max_retries=3, base_delay=0.01)
    async def _fail_func(self):
        raise ValueError("test error")

    @pytest.mark.asyncio
    async def test_retry_success_on_first_attempt(self):
        result = await self._success_func()
        assert result == "success"

    @pytest.mark.asyncio
    async def test_retry_fails_after_max_retries(self):
        with pytest.raises(ValueError, match="test error"):
            await self._fail_func()


class TestLLMClient:
    """LLM 客户端测试"""

    def test_init_default_values(self):
        client = LLMClient()
        assert client.api_key == "test-api-key"
        assert client.base_url == "https://api.deepseek.com/v1"
        assert client.model == "deepseek-chat"
        assert client.max_retries == 3

    @pytest.mark.asyncio
    async def test_chat_completion_success(self):
        client = LLMClient()
        mock_response = {
            "choices": [{"message": {"content": "test response"}}]
        }
        with patch.object(client, "_session") as mock_session:
            mock_post = AsyncMock()
            mock_post.json = AsyncMock(return_value=mock_response)
            mock_session.post = AsyncMock(return_value=mock_post)
            result = await client.chat_completion(
                messages=[{"role": "user", "content": "hello"}],
            )
            assert result["choices"][0]["message"]["content"] == "test response"
