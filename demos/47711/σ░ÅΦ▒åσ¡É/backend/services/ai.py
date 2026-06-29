from __future__ import annotations

import json
import re
from typing import Any

import httpx

from app.core.exceptions import BadRequestException, BusinessException
from config import ai_settings


ARK_PROVIDER_NAME = "volcengine-ark"


def _friendly_ark_error(detail: str) -> str:
    try:
        payload = json.loads(detail)
    except json.JSONDecodeError:
        return "AI 服务调用失败"

    error = payload.get("error")
    if not isinstance(error, dict):
        return "AI 服务调用失败"

    code = str(error.get("code") or "").strip()
    message = str(error.get("message") or "").strip()
    if code == "ModelNotOpen":
        model_match = re.search(r"model\s+([A-Za-z0-9_.-]+)", message)
        model_name = model_match.group(1) if model_match else "当前模型"
        return f"{model_name} 未开通，请先在火山方舟控制台开通模型服务"
    if code == "AccessDenied":
        return "当前 API Key 无权访问该模型，请检查火山方舟模型权限"
    return message or "AI 服务调用失败"


def _ark_api_key() -> str:
    api_key = ai_settings.ark_api_key.strip()
    if not api_key:
        raise BadRequestException("ARK_API_KEY 未配置，无法调用 AI 接口")
    return api_key


def _ark_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {_ark_api_key()}"}


def _ark_request(method: str, url: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
    try:
        with httpx.Client(trust_env=False) as client:
            response = client.request(
                method=method,
                url=url,
                json=body,
                headers=_ark_headers(),
                timeout=ai_settings.ark_timeout_seconds,
            )
        response.raise_for_status()
        payload = response.json()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:500]
        raise BusinessException(
            _friendly_ark_error(detail),
            error_code=50010,
            status_code=502,
            data={"provider": ARK_PROVIDER_NAME, "detail": detail},
        ) from exc
    except httpx.ConnectError as exc:
        raise BusinessException(
            "AI 服务不可达",
            error_code=50011,
            status_code=502,
            data={"provider": ARK_PROVIDER_NAME, "detail": str(exc)},
        ) from exc
    except httpx.TimeoutException as exc:
        raise BusinessException(
            "AI 服务超时",
            error_code=50014,
            status_code=502,
            data={"provider": ARK_PROVIDER_NAME, "detail": str(exc)},
        ) from exc
    except Exception as exc:
        raise BusinessException(
            "AI 服务异常",
            error_code=50015,
            status_code=502,
            data={"provider": ARK_PROVIDER_NAME, "detail": str(exc)[:500]},
        ) from exc

    if not isinstance(payload, dict):
        raise BusinessException(
            "AI 服务返回格式异常",
            error_code=50017,
            status_code=502,
            data={"provider": ARK_PROVIDER_NAME},
        )
    return payload


def _extract_message_content(payload: dict[str, Any]) -> str:
    choices = payload.get("choices") or []
    if not choices:
        return ""
    message = choices[0].get("message") or {}
    content = message.get("content")
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        texts: list[str] = []
        for item in content:
            if isinstance(item, dict) and isinstance(item.get("text"), str):
                texts.append(item["text"])
            elif isinstance(item, str):
                texts.append(item)
        return "\n".join(part.strip() for part in texts if part and part.strip())
    return ""


def _extract_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        payload = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise
        payload = json.loads(match.group(0))
    if not isinstance(payload, dict):
        raise ValueError("AI JSON response must be an object")
    return payload


def _extract_first_url(payload: dict[str, Any]) -> str:
    url_keys = {
        "url",
        "image_url",
        "video_url",
        "videoUrl",
        "file_url",
        "fileUrl",
        "download_url",
        "downloadUrl",
    }

    def walk(value: Any) -> str:
        if isinstance(value, dict):
            for key in url_keys:
                url = value.get(key)
                if isinstance(url, str) and url.strip():
                    return url.strip()
            for item in value.values():
                nested = walk(item)
                if nested:
                    return nested
        if isinstance(value, list):
            for item in value:
                nested = walk(item)
                if nested:
                    return nested
        return ""

    return walk(payload)
    return ""


def _extract_task_status(payload: dict[str, Any]) -> str:
    for key in ("status", "task_status", "state"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip().lower()
    data = payload.get("data")
    if isinstance(data, dict):
        for key in ("status", "task_status", "state"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip().lower()
    return ""


def _extract_task_id(payload: dict[str, Any]) -> str:
    for key in ("id", "task_id", "taskId"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
        if isinstance(value, int):
            return str(value)
    data = payload.get("data")
    if isinstance(data, dict):
        for key in ("id", "task_id", "taskId"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
            if isinstance(value, int):
                return str(value)
    return ""


def chat_completion(
    *,
    messages: list[dict[str, str]],
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int | None = None,
) -> str:
    body: dict[str, object] = {
        "model": model or ai_settings.ark_model,
        "messages": messages,
        "temperature": temperature,
    }
    if max_tokens is not None:
        body["max_tokens"] = max_tokens
    if ai_settings.ark_disable_thinking:
        body["thinking"] = {"type": "disabled"}

    payload = _ark_request("POST", ai_settings.chat_completions_url, body)
    content = _extract_message_content(payload)
    if not content:
        raise BusinessException(
            "AI 未返回有效内容",
            error_code=50013,
            status_code=502,
            data={"provider": ARK_PROVIDER_NAME},
        )
    return content


def json_completion(
    *,
    messages: list[dict[str, str]],
    temperature: float = 0.65,
    max_tokens: int = 1400,
) -> dict[str, Any]:
    content = chat_completion(
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    try:
        payload = _extract_json_object(content)
    except Exception as exc:
        raise BusinessException(
            "AI 返回内容不是有效 JSON",
            error_code=50016,
            status_code=502,
            data={"provider": ARK_PROVIDER_NAME, "content": content[:500]},
        ) from exc
    payload.setdefault("raw_text", content)
    return payload


def image_generation(
    *,
    prompt: str,
    model: str | None = None,
    size: str = "1024x1024",
    image: str | None = None,
    response_format: str = "url",
    watermark: bool | None = None,
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "model": model or ai_settings.ark_image_model,
        "prompt": prompt,
        "size": size,
        "response_format": response_format,
    }
    if image:
        body["image"] = image
    if watermark is not None:
        body["watermark"] = watermark

    payload = _ark_request("POST", ai_settings.image_generations_url, body)
    image_url = _extract_first_url(payload)
    if image_url:
        payload["image_url"] = image_url
    payload.setdefault("provider", ARK_PROVIDER_NAME)
    payload.setdefault("model", body["model"])
    return payload


def create_video_generation_task(
    *,
    prompt: str,
    model: str | None = None,
    image: str | None = None,
    ratio: str | None = None,
    duration: int | None = None,
) -> dict[str, Any]:
    content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
    if image:
        content.append({"type": "image_url", "image_url": image})

    body: dict[str, Any] = {
        "model": model or ai_settings.ark_video_model,
        "content": content,
    }
    if ratio:
        body["ratio"] = ratio
    if duration is not None:
        body["duration"] = duration

    payload = _ark_request("POST", ai_settings.video_generation_tasks_url, body)
    task_id = _extract_task_id(payload)
    if task_id:
        payload["task_id"] = task_id
    task_status = _extract_task_status(payload)
    if task_status:
        payload["task_status"] = task_status
    payload.setdefault("provider", ARK_PROVIDER_NAME)
    payload.setdefault("model", body["model"])
    return payload


def get_video_generation_task(task_id: str) -> dict[str, Any]:
    payload = _ark_request("GET", ai_settings.video_generation_task_url(task_id))
    task_status = _extract_task_status(payload)
    if task_status:
        payload["task_status"] = task_status
    video_url = _extract_first_url(payload)
    if video_url:
        payload["video_url"] = video_url
    payload.setdefault("provider", ARK_PROVIDER_NAME)
    return payload
