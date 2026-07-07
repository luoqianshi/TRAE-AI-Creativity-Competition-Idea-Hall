"""统一时区工具

提供全项目共享的时区定义和时间获取函数,消除各模块重复定义
`timezone(timedelta(hours=int(os.getenv("BUSINESS_TZ_OFFSET", "8"))))` 的问题.

# [removed garbled text]
- 业务时区通过环境变量 BUSINESS_TZ_OFFSET 配置(默认东八区)
- UTC 时区使用标准库 timezone.utc
- 所有"业务当前时间"使用 business_now(),避免 naive datetime
- 所有"UTC 当前时间"使用 utc_now()
"""

import os
from datetime import datetime, timedelta, timezone

# 业务时区偏移(小时),默认东八区
_BUSINESS_TZ_OFFSET_HOURS = int(os.getenv("BUSINESS_TZ_OFFSET", "8"))

# 业务时区(aware tzinfo)
BUSINESS_TZ: timezone = timezone(timedelta(hours=_BUSINESS_TZ_OFFSET_HOURS))

# UTC 时区(aware tzinfo)
UTC_TZ: timezone = timezone.utc


def business_now() -> datetime:
    """返回当前业务时区的 aware datetime"""
    return datetime.now(BUSINESS_TZ)


def utc_now() -> datetime:
    """返回当前 UTC aware datetime

    替代已弃用的 datetime.utcnow()(Python 3.12+).
    """
    return datetime.now(UTC_TZ)


def utc_now_naive() -> datetime:
    """返回当前 UTC 的 naive datetime(无 tzinfo)

    用于兼容历史代码中存储 naive datetime 的场景(如 PG timestamp 列).
    优先使用 utc_now(),仅在确需 naive 时使用本函数.
    """
    return utc_now().replace(tzinfo=None)


def business_now_naive() -> datetime:
    """返回当前业务时区的 naive datetime(无 tzinfo)

    用于兼容历史代码中存储 naive datetime 的场景.
    """
    return business_now().replace(tzinfo=None)


def to_business(dt: datetime) -> datetime:
    """将任意 datetime 转换为业务时区 aware datetime

    若输入是 naive datetime,视为 UTC 并转换.
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC_TZ)
    return dt.astimezone(BUSINESS_TZ)


def business_date_today() -> datetime:
    """返回业务时区今天的 00:00:00 aware datetime"""
    now = business_now()
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def business_date_yesterday() -> datetime:
    """返回业务时区昨天的 00:00:00 aware datetime"""
    return business_date_today() - timedelta(days=1)
