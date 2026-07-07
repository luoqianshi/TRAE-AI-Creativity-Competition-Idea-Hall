"""LLM client with unified retry, timeout, and prompt injection protection."""

import asyncio
import inspect
import json
import logging
import os
import random
import time
from functools import wraps
from typing import Any, Dict, List, Optional, Tuple, Type

from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


# ============================================================
# Prompt Injection protection
# ============================================================

_USER_INPUT_OPEN = "<user_input>"
_USER_INPUT_CLOSE = "</user_input>"
MAX_USER_INPUT_CHARS = 32_000


def _sanitize_user_input(text: str, max_chars: int = MAX_USER_INPUT_CHARS) -> str:
    """Sanitize and isolate user input to prevent prompt injection.

    1. Truncates overlong input to prevent context window exhaustion
    2. Strips delimiter close tags to prevent injection breakout
    3. Returns text wrapped in <user_input>...</user_input> tags

    Args:
        text: Raw user input.
        max_chars: Maximum allowed characters.

    Returns:
        Sanitized text wrapped in isolation delimiters.
    """
    text = text[:max_chars]
    text = text.replace(_USER_INPUT_CLOSE, "")
    return f"{_USER_INPUT_OPEN}\n{text}\n{_USER_INPUT_CLOSE}"


# ============================================================
# Exponential backoff retry decorator
# ============================================================

def _get_non_retriable_exceptions() -> Tuple[Type[BaseException], ...]:
    """Exceptions that should NOT be retried."""
    return (
        ValueError,
        TypeError,
        AttributeError,
        KeyError,
        IndexError,
        # HTTP 4xx client errors via OpenAI SDK
    )


def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    overall_timeout: Optional[float] = None,
):
    """Exponential backoff retry decorator for sync and async functions.

    Retries on recoverable errors (network, 5xx, timeout, rate-limit 429).
    Does NOT retry client errors (4xx auth/permission/param) or
    programming errors (ValueError, TypeError).

    Args:
        max_retries: Maximum retry attempts.
        base_delay: Initial delay in seconds.
        max_delay: Maximum delay cap in seconds.
        exponential_base: Base for exponential growth.
        jitter: Whether to add random jitter.
        overall_timeout: Total timeout including all retries. None = no limit.
    """
    non_retriable = _get_non_retriable_exceptions()

    def decorator(func):
        if inspect.iscoroutinefunction(func):

            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                start_time = time.monotonic()
                retries = 0
                delay = base_delay

                while retries <= max_retries:
                    if overall_timeout is not None:
                        elapsed = time.monotonic() - start_time
                        if elapsed >= overall_timeout:
                            logger.error(
                                "Function %s timed out (%.1fs >= %.1fs), stopping retries",
                                func.__name__, elapsed, overall_timeout,
                            )
                            raise asyncio.TimeoutError(
                                f"Function {func.__name__} timed out ({overall_timeout}s)"
                            )

                    try:
                        return await func(*args, **kwargs)
                    except non_retriable:
                        raise
                    except Exception as e:
                        retries += 1
                        if retries > max_retries:
                            logger.error(
                                "Function %s failed after %d retries: %s",
                                func.__name__, max_retries, e,
                            )
                            raise

                        current_delay = min(
                            delay * (exponential_base ** (retries - 1)), max_delay
                        )
                        if jitter:
                            current_delay = current_delay * (0.5 + random.random())

                        if overall_timeout is not None:
                            remaining = overall_timeout - (
                                time.monotonic() - start_time
                            )
                            if remaining <= 0:
                                raise asyncio.TimeoutError(
                                    f"Function {func.__name__} timed out ({overall_timeout}s)"
                                )
                            current_delay = min(current_delay, remaining)

                        logger.warning(
                            "Function %s failed (attempt %d/%d): %s. Retrying in %.2fs...",
                            func.__name__, retries, max_retries, e, current_delay,
                        )
                        await asyncio.sleep(current_delay)

                return None

            return async_wrapper
        else:

            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                start_time = time.monotonic()
                retries = 0
                delay = base_delay

                while retries <= max_retries:
                    if overall_timeout is not None:
                        elapsed = time.monotonic() - start_time
                        if elapsed >= overall_timeout:
                            logger.error(
                                "Function %s timed out (%.1fs >= %.1fs)",
                                func.__name__, elapsed, overall_timeout,
                            )
                            raise TimeoutError(
                                f"Function {func.__name__} timed out ({overall_timeout}s)"
                            )

                    try:
                        return func(*args, **kwargs)
                    except non_retriable:
                        raise
                    except Exception as e:
                        retries += 1
                        if retries > max_retries:
                            logger.error(
                                "Function %s failed after %d retries: %s",
                                func.__name__, max_retries, e,
                            )
                            raise

                        current_delay = min(
                            delay * (exponential_base ** (retries - 1)), max_delay
                        )
                        if jitter:
                            current_delay = current_delay * (0.5 + random.random())

                        if overall_timeout is not None:
                            remaining = overall_timeout - (
                                time.monotonic() - start_time
                            )
                            if remaining <= 0:
                                raise TimeoutError(
                                    f"Function {func.__name__} timed out ({overall_timeout}s)"
                                )
                            current_delay = min(current_delay, remaining)

                        logger.warning(
                            "Function %s failed (attempt %d/%d): %s. Retrying in %.2fs...",
                            func.__name__, retries, max_retries, e, current_delay,
                        )
                        time.sleep(current_delay)

                return None

            return sync_wrapper

    return decorator


# ============================================================
# LLM Client class (async)
# ============================================================

class LLMClient:
    """Unified async LLM client with retry and error handling."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        max_retries: int = 3,
        timeout: float = 30.0,
    ):
        self.provider = os.getenv("LLM_PROVIDER", "deepseek").lower()

        if self.provider == "local":
            default_api_key = os.getenv("LOCAL_LLM_API_KEY", "local")
            default_base_url = os.getenv("LOCAL_LLM_ENDPOINT", "http://localhost:8000/v1")
            default_model = os.getenv("LOCAL_LLM_MODEL", "Qwen2.5-72B-Instruct")
        elif self.provider == "openai":
            default_api_key = os.getenv("OPENAI_API_KEY", "")
            default_base_url = None
            default_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        else:  # deepseek (default)
            default_api_key = os.getenv("DEEPSEEK_API_KEY", "")
            default_base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
            default_model = os.getenv("LLM_MODEL", "deepseek-chat")

        cfg_api_key, cfg_base_url, cfg_model = self._load_config()

        self.api_key = api_key or cfg_api_key or default_api_key
        self.base_url = base_url or cfg_base_url or default_base_url
        self.model = model or cfg_model or default_model
        self.max_retries = max_retries
        self.timeout = timeout

        self._client: Optional[AsyncOpenAI] = None

    @staticmethod
    def _load_config():
        """Load LLM config from the config module, fall back to empty."""
        try:
            from config import get_config
            cfg = get_config()
            return cfg.llm.api_key, cfg.llm.base_url, cfg.llm.model
        except Exception:
            return "", "", ""

    async def get_client(self) -> AsyncOpenAI:
        """Get the underlying AsyncOpenAI client (lazy singleton)."""
        if self._client is None:
            client_kwargs = {
                "api_key": self.api_key or "local",
                "timeout": self.timeout,
            }
            if self.base_url:
                client_kwargs["base_url"] = self.base_url
            self._client = AsyncOpenAI(**client_kwargs)
        return self._client

    @retry_with_backoff(
        max_retries=3, base_delay=1.0, max_delay=60.0, overall_timeout=120.0
    )
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """Call LLM chat completion API with retry.

        Args:
            messages: Message list.
            temperature: Sampling temperature.
            max_tokens: Maximum output tokens.
            **kwargs: Additional API parameters.

        Returns:
            API response as a dict.
        """
        client = await self.get_client()
        response = await client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        )
        return response.model_dump()

    @retry_with_backoff(
        max_retries=3, base_delay=1.0, max_delay=60.0, overall_timeout=180.0
    )
    async def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract entities and relations from text with retry.

        Args:
            text: Input text.

        Returns:
            Dict with "entities" and "relations" lists.
        """
        from analysis.entity_extractor import ENTITY_EXTRACTION_PROMPT, _parse_llm_response

        safe_text = _sanitize_user_input(text)
        prompt = ENTITY_EXTRACTION_PROMPT.replace("{TEXT}", safe_text)

        client = await self.get_client()
        response = await client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=2000,
        )
        return _parse_llm_response(response.choices[0].message.content)

    async def summarize(self, texts: List[str], max_length: int = 500) -> str:
        """Generate a summary of multiple texts.

        Args:
            texts: List of texts to summarize.
            max_length: Maximum summary length in characters.

        Returns:
            Summary text.
        """
        combined = "\n\n---\n\n".join(texts)
        safe_text = _sanitize_user_input(combined, max_chars=16000)

        client = await self.get_client()
        response = await client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional intelligence analyst. Summarize the input concisely.",
                },
                {
                    "role": "user",
                    "content": f"Summarize the following intelligence reports in {max_length} characters or less:\n\n{safe_text}",
                },
            ],
            temperature=0.3,
            max_tokens=max_length // 2,
        )
        return response.choices[0].message.content.strip()

    async def infer_impact(self, event_description: str) -> Dict[str, Any]:
        """Infer the impact path of an event using chain-of-thought.

        Args:
            event_description: Description of the event.

        Returns:
            Dict with impact_path, confidence, and description.
        """
        safe_desc = _sanitize_user_input(event_description)
        prompt = f"""Analyze the potential impact of the following event using chain-of-thought reasoning:

{safe_desc}

Consider:
1. What direct consequences could this event cause?
2. What chain reactions could those consequences trigger?
3. Which domains or entities could ultimately be affected?

Output as JSON:
{{"impact_path": "A -> B -> C", "confidence": 0.0-1.0, "description": "detailed description"}}"""

        response = await self.chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional impact analysis assistant skilled in causal reasoning.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )

        content = response["choices"][0]["message"]["content"].strip()
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {
                "impact_path": "unknown",
                "confidence": 0.0,
                "description": content[:200],
            }


# ============================================================
# Global singleton
# ============================================================

_llm_client: Optional[LLMClient] = None


def get_llm_client() -> LLMClient:
    """Get or create the global LLMClient singleton.

    Uses dual-path resolution: if the DI container has a registered
    ``llm_client`` service, returns that instance. Otherwise creates
    a new singleton.
    """
    global _llm_client
    if _llm_client is None:
        from utils.di_container import try_resolve
        container_client = try_resolve("llm_client")
        if container_client is not None:
            _llm_client = container_client
            return _llm_client
        _llm_client = LLMClient()
    return _llm_client
