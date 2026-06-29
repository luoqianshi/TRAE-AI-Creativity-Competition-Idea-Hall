from __future__ import annotations

import json
from typing import Any

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.generation_job import GenerationJob
from app.models.oc import OC
from app.models.user import User
from app.schemas.generation import (
    AssistantChatOut,
    AssistantChatRequest,
    GenerationJobCreateRequest,
    GenerationJobOut,
    TextGenerateOut,
    TextGenerateRequest,
)
from services.ai import (
    chat_completion,
    create_video_generation_task,
    get_video_generation_task,
    image_generation,
    json_completion,
)


AI_PROVIDER_NAME = "volcengine-ark"


def _extract_nested_url(payload: dict[str, Any]) -> str:
    url_keys = {
        "image_url",
        "video_url",
        "videoUrl",
        "url",
        "file_url",
        "fileUrl",
        "download_url",
        "downloadUrl",
    }

    def walk(value: Any) -> str:
        if isinstance(value, dict):
            for key in url_keys:
                item = value.get(key)
                if isinstance(item, str) and item.strip():
                    return item.strip()
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


def _task_status_to_job_status(status: str) -> str:
    normalized = status.strip().lower()
    if normalized in {"queued", "running", "processing", "pending", "submitted", "in_progress"}:
        return "running"
    if normalized in {"succeeded", "success", "completed", "done"}:
        return "succeeded"
    if normalized in {"failed", "error", "cancelled", "canceled", "expired"}:
        return "failed"
    return "running"


def _serialize_job(job: GenerationJob) -> GenerationJobOut:
    return GenerationJobOut(
        id=job.id,
        user_id=job.user_id,
        oc_id=job.oc_id,
        job_type=job.job_type,
        status=job.status,  # type: ignore[arg-type]
        provider=job.provider,
        prompt=job.prompt,
        template_name=job.template_name or "",
        input_payload=job.input_payload or {},
        output_payload=job.output_payload or {},
        error_message=job.error_message or "",
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


def _get_oc(db: Session, *, user_id: int, oc_id: int | None) -> OC | None:
    if oc_id is None:
        return None
    return db.query(OC).filter(OC.user_id == user_id, OC.id == oc_id).first()


def _get_oc_context(oc: OC | None) -> dict[str, Any]:
    if oc is None:
        return {
            "name": "你的OC",
            "title": "旅人",
            "emoji": "🌙",
            "gradient": "linear-gradient(135deg, #f9a8d4, #c084fc)",
            "bar_color": "#c084fc",
            "level": 1,
            "stats": {"intimacy": 0, "combat": 0, "emotion": 0},
        }
    return {
        "name": oc.name,
        "title": oc.title or "旅人",
        "emoji": oc.emoji or "🌙",
        "gradient": oc.gradient or "linear-gradient(135deg, #f9a8d4, #c084fc)",
        "bar_color": oc.bar_color or "#c084fc",
        "level": oc.level or 1,
        "stats": oc.stats or {"intimacy": 0, "combat": 0, "emotion": 0},
    }


def generate_text(db: Session, *, current_user: User, payload: TextGenerateRequest) -> TextGenerateOut:
    oc = _get_oc(db, user_id=current_user.id, oc_id=payload.oc_id)
    messages = build_text_generate_messages(
        mode=payload.mode,
        requirement=payload.requirement,
        oc_name=oc.name if oc else "你的OC",
        oc_title=oc.title if oc and oc.title else "旅人",
    )
    content = chat_completion(messages=messages)
    return TextGenerateOut(
        mode=payload.mode,
        provider=AI_PROVIDER_NAME,
        content=content,
    )


def chat_app_assistant(payload: AssistantChatRequest) -> AssistantChatOut:
    messages = build_app_assistant_messages(payload.message)
    content = chat_completion(messages=messages)
    return AssistantChatOut(provider=AI_PROVIDER_NAME, content=content)


def _build_image_generation_result(
    *,
    oc: OC | None,
    template_name: str,
    user_desc: str,
    prompt: str,
) -> dict[str, Any]:
    oc_context = _get_oc_context(oc)
    return {
        "title": f"{oc_context['name']} · {template_name or '海报'}",
        "subtitle": user_desc[:36] or "AI 生成海报",
        "image_prompt": prompt,
        "negative_prompt": "低清晰度，模糊，畸形，多余肢体，文字错误",
        "palette": ["#f9a8d4", "#c084fc", "#818cf8"],
        "layout": "居中构图，柔和发光，角色居前景",
        "poster_caption": f"{oc_context['name']} · {oc_context['title']}",
        "video_prompt": f"{oc_context['name']} 的动态短片预告",
        "shot_list": [
            {"shot": 1, "scene": f"{oc_context['name']} 在{template_name or '海报'}场景中亮相"},
            {"shot": 2, "scene": f"镜头推进，突出{user_desc[:18] or '角色'}的动作与情绪"},
            {"shot": 3, "scene": "收束到角色特写，保留氛围光效"},
        ],
        "oc": oc_context,
    }


def _build_video_generation_result(
    *,
    oc: OC | None,
    template_name: str,
    user_desc: str,
    prompt: str,
) -> dict[str, Any]:
    oc_context = _get_oc_context(oc)
    return {
        "title": f"{oc_context['name']} · 视频预告",
        "subtitle": user_desc[:36] or "AI 生成视频分镜",
        "video_prompt": prompt,
        "style": "动画感 / 梦幻感",
        "duration": "15s",
        "hook": f"{oc_context['name']} 出场",
        "shot_list": [
            {"shot": 1, "scene": f"开场建立{oc_context['name']}所在环境，突出{template_name or '视频'}氛围"},
            {"shot": 2, "scene": f"角色动作与特效推进，呈现{user_desc[:18] or '核心动作'}"},
            {"shot": 3, "scene": "以角色特写和光效收尾"},
        ],
        "music_hint": "轻快、空灵、氛围感",
        "caption": f"{oc_context['name']} · {oc_context['title']}",
        "kind": "video",
        "oc": oc_context,
    }


def _build_image_job_output(
    *,
    oc: OC | None,
    template_name: str,
    user_desc: str,
    prompt: str,
    input_payload: dict[str, Any],
) -> dict[str, Any]:
    result = _build_image_generation_result(
        oc=oc,
        template_name=template_name,
        user_desc=user_desc,
        prompt=prompt,
    )
    ark_result = image_generation(
        prompt=result.get("image_prompt", prompt),
        size=str(input_payload.get("size") or "1024x1024"),
        image=(str(input_payload.get("image_url") or input_payload.get("image") or "").strip() or None),
        watermark=input_payload.get("watermark"),
    )
    image_url = _extract_nested_url(ark_result)
    if image_url:
        result["image_url"] = image_url
    result["ark_response"] = ark_result
    result["provider"] = AI_PROVIDER_NAME
    result["model"] = ark_result.get("model", "")
    result["job_kind"] = "image"
    return result


def _build_video_job_output(
    *,
    oc: OC | None,
    template_name: str,
    user_desc: str,
    prompt: str,
    input_payload: dict[str, Any],
) -> dict[str, Any]:
    result = _build_video_generation_result(
        oc=oc,
        template_name=template_name,
        user_desc=user_desc,
        prompt=prompt,
    )
    ark_result = create_video_generation_task(
        prompt=result.get("video_prompt", prompt),
        image=(str(input_payload.get("image_url") or input_payload.get("image") or "").strip() or None),
        ratio=(str(input_payload.get("ratio") or "").strip() or None),
        duration=(int(input_payload["duration"]) if str(input_payload.get("duration", "")).strip().isdigit() else None),
    )
    task_status = str(ark_result.get("task_status") or ark_result.get("status") or "running")
    task_id = str(ark_result.get("task_id") or "").strip()
    video_url = _extract_nested_url(ark_result)
    result["ark_task_response"] = ark_result
    result["ark_task_id"] = task_id
    result["ark_task_status"] = task_status
    result["provider"] = AI_PROVIDER_NAME
    result["model"] = ark_result.get("model", "")
    if video_url:
        result["video_url"] = video_url
    return result


def create_generation_job(
    db: Session,
    *,
    current_user: User,
    payload: GenerationJobCreateRequest,
) -> GenerationJobOut:
    oc = _get_oc(db, user_id=current_user.id, oc_id=payload.oc_id)
    normalized_template = payload.template_name or ""
    input_payload = payload.input_payload or {}

    job = GenerationJob(
        user_id=current_user.id,
        oc_id=payload.oc_id,
        job_type=payload.job_type,
        status="running",
        provider=AI_PROVIDER_NAME,
        prompt=payload.prompt,
        template_name=normalized_template,
        input_payload=input_payload,
        output_payload={},
        error_message="",
    )
    db.add(job)
    db.flush()

    try:
        if payload.job_type == "video":
            job.output_payload = _build_video_job_output(
                oc=oc,
                template_name=normalized_template,
                user_desc=str(input_payload.get("user_desc", "")),
                prompt=payload.prompt,
                input_payload=input_payload,
            )
            job.status = _task_status_to_job_status(str(job.output_payload.get("ark_task_status") or "running"))
        elif payload.job_type == "image":
            job.output_payload = _build_image_job_output(
                oc=oc,
                template_name=normalized_template,
                user_desc=str(input_payload.get("user_desc", "")),
                prompt=payload.prompt,
                input_payload=input_payload,
            )
            job.status = "succeeded"
        else:
            job.output_payload = {
                "kind": "text",
                "content": chat_completion(
                    messages=[
                        {
                            "role": "system",
                            "content": "你是一个生成任务助手，请用一句话总结任务目标。",
                        },
                        {"role": "user", "content": payload.prompt},
                    ]
                ),
            }
        if payload.job_type != "video":
            job.status = "succeeded"
        job.error_message = ""
        db.commit()
        db.refresh(job)
        return _serialize_job(job)
    except Exception as exc:
        job.status = "failed"
        job.error_message = str(exc)
        db.commit()
        db.refresh(job)
        return _serialize_job(job)


def get_generation_job(
    db: Session,
    *,
    current_user: User,
    job_id: int,
) -> GenerationJobOut:
    job = (
        db.query(GenerationJob)
        .filter(GenerationJob.id == job_id, GenerationJob.user_id == current_user.id)
        .first()
    )
    if job is None:
        raise NotFoundException("生成任务不存在")

    if job.job_type == "video" and job.provider == AI_PROVIDER_NAME:
        output_payload = job.output_payload or {}
        task_id = str(output_payload.get("ark_task_id") or "").strip()
        current_status = str(output_payload.get("ark_task_status") or job.status).lower()
        if task_id and current_status in {"queued", "running"}:
            task_payload = get_video_generation_task(task_id)
            task_status = str(task_payload.get("task_status") or task_payload.get("status") or current_status)
            video_url = _extract_nested_url(task_payload)
            output_payload = {
                **output_payload,
                "ark_task_response": task_payload,
                "ark_task_status": task_status,
            }
            if video_url:
                output_payload["video_url"] = video_url
            job.output_payload = output_payload
            mapped_status = _task_status_to_job_status(task_status)
            if mapped_status != job.status:
                job.status = mapped_status
            if mapped_status == "failed" and not job.error_message:
                job.error_message = str(task_payload.get("message") or task_payload.get("detail") or "视频生成失败")
            db.commit()
            db.refresh(job)
    return _serialize_job(job)
