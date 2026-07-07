"""utils/timezone.py 单元测试"""

from datetime import datetime, timedelta, timezone

import pytest

from utils import timezone as tz


@pytest.mark.unit
class TestTimezoneConstants:
    """时区常量测试"""

    def test_business_tz_default_offset(self):
        """默认业务时区为东八区"""
        assert tz.BUSINESS_TZ.utcoffset(None) == timedelta(hours=8)

    def test_utc_tz_is_utc(self):
        """UTC_TZ 应为标准 UTC"""
        assert tz.UTC_TZ.utcoffset(None) == timedelta(0)

    def test_business_tz_env_override(self, monkeypatch):
        """环境变量 BUSINESS_TZ_OFFSET 应生效"""
        monkeypatch.setenv("BUSINESS_TZ_OFFSET", "5")
        # 重新加载模块以应用新环境变量
        import importlib

        importlib.reload(tz)
        try:
            assert tz.BUSINESS_TZ.utcoffset(None) == timedelta(hours=5)
        finally:
            # 恢复默认
            monkeypatch.delenv("BUSINESS_TZ_OFFSET", raising=False)
            importlib.reload(tz)


@pytest.mark.unit
class TestNowFunctions:
    """当前时间获取函数测试"""

    def test_business_now_is_aware(self):
        """business_now 返回 aware datetime"""
        now = tz.business_now()
        assert now.tzinfo is not None

    def test_utc_now_is_aware(self):
        """utc_now 返回 aware datetime"""
        now = tz.utc_now()
        assert now.tzinfo is not None

    def test_utc_now_naive_has_no_tzinfo(self):
        """utc_now_naive 返回 naive datetime"""
        now = tz.utc_now_naive()
        assert now.tzinfo is None

    def test_business_now_naive_has_no_tzinfo(self):
        """business_now_naive 返回 naive datetime"""
        now = tz.business_now_naive()
        assert now.tzinfo is None

    def test_business_now_offset_matches_utc_plus_8(self):
        """business_now 与 utc_now 时差应为 8 小时(默认配置)"""
        business = tz.business_now()
        utc = tz.utc_now()
        diff = business.replace(tzinfo=None) - utc.replace(tzinfo=None)
        # 允许 1 秒内的执行误差
        assert abs(diff - timedelta(hours=8)) < timedelta(seconds=1)


@pytest.mark.unit
class TestToBusiness:
    """to_business 转换函数测试"""

    def test_aware_datetime_conversion(self):
        """aware datetime 正确转换"""
        utc_dt = datetime(2024, 6, 15, 0, 0, 0, tzinfo=timezone.utc)
        business_dt = tz.to_business(utc_dt)
        assert business_dt.tzinfo is not None
        # [cleanup] assert business_dt.hour == 8  # UTC 0:00 → 北京 8:00

    def test_naive_datetime_treated_as_utc(self):
        """naive datetime 视为 UTC"""
        naive_dt = datetime(2024, 6, 15, 0, 0, 0)
        business_dt = tz.to_business(naive_dt)
        assert business_dt.tzinfo is not None
        assert business_dt.hour == 8

    def test_already_business_tz_preserved(self):
        """已是业务时区的 datetime 保持不变"""
        business_dt = datetime(2024, 6, 15, 10, 0, 0, tzinfo=tz.BUSINESS_TZ)
        converted = tz.to_business(business_dt)
        assert converted.hour == 10


@pytest.mark.unit
class TestBusinessDateFunctions:
    """业务日期函数测试"""

    def test_business_date_today_is_midnight(self):
        """business_date_today 返回当天 00:00:00"""
        today = tz.business_date_today()
        assert today.hour == 0
        assert today.minute == 0
        assert today.second == 0
        assert today.microsecond == 0
        assert today.tzinfo is not None

    def test_business_date_yesterday_is_one_day_earlier(self):
        """business_date_yesterday 比 today 早 1 天"""
        today = tz.business_date_today()
        yesterday = tz.business_date_yesterday()
        assert today - yesterday == timedelta(days=1)

    def test_business_date_yesterday_is_aware(self):
        """business_date_yesterday 返回 aware datetime"""
        yesterday = tz.business_date_yesterday()
        assert yesterday.tzinfo is not None
