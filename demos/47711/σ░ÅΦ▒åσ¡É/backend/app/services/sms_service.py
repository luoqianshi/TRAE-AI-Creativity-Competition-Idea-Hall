import re
from datetime import datetime, timedelta
from functools import lru_cache

from Tea.exceptions import TeaException
from alibabacloud_dypnsapi20170525 import models as dypns_models
from alibabacloud_dypnsapi20170525.client import Client as DypnsClient
from alibabacloud_tea_openapi import models as open_api_models

from app.core.config import settings
from app.core.exceptions import BadRequestException
from app.core.security import generate_code


PHONE_PATTERN = re.compile(r"^1[3-9]\d{9}$")
DEBUG_SMS_EXPIRE_MINUTES = 10
_debug_sms_codes: dict[str, tuple[str, datetime]] = {}
SCENE_ALIASES = {
    "register": "register_login",
    "login": "register_login",
    "register_login": "register_login",
    "change_phone": "change_phone",
    "reset_password": "reset_password",
    "password_reset": "reset_password",
    "bind_phone": "bind_new_phone",
    "bind_new_phone": "bind_new_phone",
    "verify_bind_phone": "verify_bind_phone",
}
SMS_ERROR_MESSAGES = {
    "MOBILE_NUMBER_ILLEGAL": "手机号格式不正确",
    "BUSINESS_LIMIT_CONTROL": "发送次数超限，请明天再试",
    "FREQUENCY": "发送太频繁，请稍后再试",
    "FREQUENCY_FAIL": "发送太频繁，请稍后再试",
}


def _normalize_error_code(code: str | None) -> str:
    if not code:
        return ""
    cleaned = code.strip().upper()
    if "." in cleaned:
        cleaned = cleaned.split(".")[-1]
    return cleaned


def _raise_sms_error(code: str | None, fallback_message: str) -> None:
    normalized_code = _normalize_error_code(code)
    if normalized_code in SMS_ERROR_MESSAGES:
        raise BadRequestException(SMS_ERROR_MESSAGES[normalized_code])
    raise BadRequestException(fallback_message)


def _is_debug_sms_enabled() -> bool:
    return settings.sms_debug_fallback and settings.app_env.lower() in {
        "local",
        "dev",
        "development",
        "test",
    }


def _is_sms_provider_configured() -> bool:
    return bool(
        settings.aliyun_dypns_access_key_id
        and settings.aliyun_dypns_access_key_secret
        and settings.aliyun_sms_sign_name
    )


def _store_debug_sms_code(phone: str) -> str:
    code = generate_code()
    expires_at = datetime.now() + timedelta(minutes=DEBUG_SMS_EXPIRE_MINUTES)
    _debug_sms_codes[phone] = (code, expires_at)
    return code


def _check_debug_sms_code(phone: str, code: str) -> bool:
    stored = _debug_sms_codes.get(phone)
    if stored is None:
        raise BadRequestException("请先发送验证码")

    stored_code, expires_at = stored
    if expires_at < datetime.now():
        _debug_sms_codes.pop(phone, None)
        raise BadRequestException("验证码已过期，请重新获取")
    if stored_code != code:
        raise BadRequestException("验证码错误或已过期")

    _debug_sms_codes.pop(phone, None)
    return True


def _normalize_scene(scene: str) -> str:
    scene_key = scene.strip().lower().replace("-", "_")
    canonical_scene = SCENE_ALIASES.get(scene_key)
    if canonical_scene is None:
        raise BadRequestException("短信场景不支持")
    return canonical_scene


def _resolve_template_code(scene: str) -> str:
    template_by_scene = {
        "register_login": settings.aliyun_sms_template_register_login,
        "change_phone": settings.aliyun_sms_template_change_phone,
        "reset_password": settings.aliyun_sms_template_reset_password,
        "bind_new_phone": settings.aliyun_sms_template_bind_new_phone,
        "verify_bind_phone": settings.aliyun_sms_template_verify_bind_phone,
    }
    template_code = template_by_scene.get(_normalize_scene(scene), "").strip()
    if not template_code:
        raise BadRequestException("短信模板配置缺失，请联系管理员")
    return template_code


@lru_cache(maxsize=1)
def _get_sms_client() -> DypnsClient:
    if not settings.aliyun_dypns_access_key_id or not settings.aliyun_dypns_access_key_secret:
        raise BadRequestException("短信服务未配置，请联系管理员")
    if not settings.aliyun_sms_sign_name:
        raise BadRequestException("短信签名未配置，请联系管理员")

    config = open_api_models.Config(
        access_key_id=settings.aliyun_dypns_access_key_id,
        access_key_secret=settings.aliyun_dypns_access_key_secret,
        endpoint=settings.aliyun_dypns_endpoint,
    )
    return DypnsClient(config=config)


def _validate_phone(phone: str) -> None:
    if not PHONE_PATTERN.match(phone):
        raise BadRequestException("请输入正确的11位手机号")


def send_sms(phone: str, scene: str) -> str | None:
    _validate_phone(phone)
    _normalize_scene(scene)

    if not _is_sms_provider_configured():
        if _is_debug_sms_enabled():
            return _store_debug_sms_code(phone)
        raise BadRequestException("短信服务未配置，请联系管理员")

    template_code = _resolve_template_code(scene)
    client = _get_sms_client()

    request = dypns_models.SendSmsVerifyCodeRequest(
        phone_number=phone,
        sign_name=settings.aliyun_sms_sign_name,
        template_code=template_code,
        template_param=settings.aliyun_sms_template_param,
        code_length=settings.aliyun_sms_code_length,
        valid_time=settings.aliyun_sms_valid_time,
        interval=settings.aliyun_sms_interval,
        code_type=settings.aliyun_sms_code_type,
    )
    try:
        response = client.send_sms_verify_code(request)
    except TeaException as exc:
        _raise_sms_error(exc.code, "验证码发送失败，请稍后重试")
    except Exception as exc:
        _ = exc
        raise BadRequestException("验证码发送失败，请稍后重试")

    body = response.body
    if not body or not body.success:
        _raise_sms_error(getattr(body, "code", None), "验证码发送失败，请稍后重试")
    return None


def check_sms_code(phone: str, code: str) -> bool:
    _validate_phone(phone)
    if not code.isdigit() or len(code) != settings.aliyun_sms_code_length:
        raise BadRequestException(f"请输入{settings.aliyun_sms_code_length}位验证码")

    if not _is_sms_provider_configured() and _is_debug_sms_enabled():
        return _check_debug_sms_code(phone, code)

    client = _get_sms_client()
    request = dypns_models.CheckSmsVerifyCodeRequest(
        phone_number=phone,
        verify_code=code,
    )
    try:
        response = client.check_sms_verify_code(request)
    except TeaException as exc:
        _raise_sms_error(exc.code, "验证码校验失败，请重试")
    except Exception as exc:
        _ = exc
        raise BadRequestException("验证码校验失败，请重试")

    body = response.body
    if not body or not body.success:
        _raise_sms_error(getattr(body, "code", None), "验证码校验失败，请重试")

    verify_result = getattr(getattr(body, "model", None), "verify_result", "")
    if verify_result != "PASS":
        raise BadRequestException("验证码错误或已过期")
    return True
