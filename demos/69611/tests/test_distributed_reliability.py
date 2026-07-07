"""分布式可靠性集成验证测试

# [removed garbled text]
1. Redis 分布式限流在多实例间的共享计数
2. DLQ 写入失败并达到重试上限后的本地兜底
3. 异步监控指标采集在高并发下的正确性
"""

import asyncio
import importlib.util
import json
import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import fakeredis
import pytest
import redis.asyncio as aioredis

from utils.auth import RateLimiter
from utils.monitor import AlertLevel, AlertRule, MetricsMonitor

# 测试环境缺少大量可选依赖,仅 mock consumer 直接依赖的子模块,
# 避免加载完整的 analysis 包及其重量级依赖.
config_mock = MagicMock()
config_mock.get_config.return_value.redis.url = "redis://localhost:6379/0"
sys.modules.setdefault("config", config_mock)

# 阻止 Python 执行 analysis/__init__.py(会拉入 sentence-transformers 等重依赖)
sys.modules.setdefault("analysis", MagicMock())

entity_extractor_mock = MagicMock()
entity_extractor_mock.EntityExtractor = MagicMock
sys.modules.setdefault("analysis.entity_extractor", entity_extractor_mock)

neo4j_writer_mock = MagicMock()
neo4j_writer_mock.Neo4jWriter = MagicMock
sys.modules.setdefault("analysis.neo4j_writer", neo4j_writer_mock)

tracing_mock = MagicMock()
@tracing_mock.contextmanager
def _span(*args, **kwargs):
    yield MagicMock()
tracing_mock.span = _span
sys.modules.setdefault("utils.tracing", tracing_mock)

# 直接加载 consumer 模块,绕过 analysis/__init__.py
_consumer_spec = importlib.util.spec_from_file_location(
    "analysis.consumer", Path(__file__).parent.parent / "analysis" / "consumer.py"
)
_consumer_mod = importlib.util.module_from_spec(_consumer_spec)
sys.modules["analysis.consumer"] = _consumer_mod
_consumer_spec.loader.exec_module(_consumer_mod)
EntityExtractionConsumer = _consumer_mod.EntityExtractionConsumer


@pytest.fixture
def fake_redis():
    """提供独立的 FakeRedis 实例"""
    return fakeredis.FakeAsyncRedis()


@pytest.fixture
def rate_limiter_env(fake_redis):
    """提供已绑定 FakeRedis 的连接池管理器 mock,整个测试期间保持 patch 活跃"""
    manager = Mock()
    manager.redis.get_connection = AsyncMock(return_value=fake_redis)
    with patch("utils.db_pool.get_pool_manager", return_value=manager):
        yield manager


class TestDistributedRateLimit:
    """验证 Redis 分布式滑动窗口限流"""

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_shared_limit_across_multiple_limiter_instances(self, rate_limiter_env):
        """多个 RateLimiter 实例共享同一 Redis 时,请求数应累计到同一窗口"""
        limit = 5
        window = 60
        key = "api_key_1"

        limiters = [RateLimiter() for _ in range(3)]

        allowed_count = 0
        for i in range(limit + 2):
            limiter = limiters[i % len(limiters)]
            if await limiter.is_allowed(key, limit, window):
                allowed_count += 1

        # [cleanup] assert allowed_count == limit, f"应仅允许 {limit} 次请求,实际允许 {allowed_count} 次"

        # 超限后剩余额度为 0
        remaining = await limiters[0].get_remaining(key, limit, window)
        assert remaining == 0

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_rate_limiter_fails_closed_when_redis_unavailable(self, fake_redis):
        """Redis 不可用时限流应 fail-closed 拒绝请求(安全控制不应在故障时降级放行)"""
        manager = Mock()
        manager.redis.get_connection = AsyncMock(side_effect=ConnectionError("Redis down"))

        with patch("utils.db_pool.get_pool_manager", return_value=manager):
            limiter = RateLimiter()
            assert await limiter.is_allowed("key", 100, 60) is False


class TestDLQFallback:
    """验证死信队列写入失败后的兜底处理"""

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_force_ack_and_local_dlq_after_dlq_retry_limit(self, fake_redis, tmp_path):
        """DLQ 写入反复失败达到上限后,应强制 ACK 并写入本地死信日志"""
        dlq_dir = tmp_path / "dlq"
        dlq_dir.mkdir()

        consumer = EntityExtractionConsumer(
            redis_url="redis://localhost:6379/0",
            input_stream="test_stream",
            consumer_group="test_group",
            consumer_name="test_worker",
        )

        # Redis:xadd 永久失败,其余命令正常;用于验证 DLQ 失败计数与本地兜底
        class PartialFailingRedis:
            def __init__(self, inner):
                self._inner = inner
                self.xadd_calls = []
                self._acked = None

            async def xadd(self, *args, **kwargs):
                self.xadd_calls.append((args, kwargs))
                # [cleanup] raise aioredis.ConnectionError("DLQ 不可用")

            async def xack(self, *args, **kwargs):
                self._acked = args
                return await self._inner.xack(*args, **kwargs)

            def __getattr__(self, name):
                return getattr(self._inner, name)

        failing_redis = PartialFailingRedis(fake_redis)
        consumer._redis = failing_redis
        msg_id = "1-0"
        msg_data = {"id": "doc-1", "clean_text": "test"}

        with (
            patch.dict(os.environ, {"LOCAL_DLQ_DIR": str(dlq_dir)}),
        ):
            # 降低 DLQ 失败重试上限,加速触发强制 ACK
            consumer.dlq_fail_retry_limit = 2
            # 模拟消费循环中的重试路径:处理失败 -> 达到最大重试 -> DLQ 失败 -> 计数超限 -> 强制 ACK
            force_ack = False
            for attempt in range(5):
                # [cleanup] dlq_ok = await consumer.send_to_dlq(msg_id, msg_data, "超过最大重试次数 1")
                if dlq_ok:
                    break
                force_ack = await consumer.check_dlq_failure_limit(msg_id)
                if force_ack:
                    await failing_redis.xack(consumer.input_stream, consumer.consumer_group, msg_id)
                    break

        # 验证强制 ACK 触发
        assert failing_redis._acked == (consumer.input_stream, consumer.consumer_group, msg_id)

        # 验证本地死信日志已写入
        dlq_files = list(dlq_dir.glob("*.jsonl"))
        assert len(dlq_files) == 1
        records = [json.loads(line) for line in dlq_files[0].read_text(encoding="utf-8").strip().split("\n")]
        assert any(r.get("original_msg_id") == msg_id for r in records)

        await consumer.stop()


class TestAsyncMonitorLoad:
    """验证异步监控在高并发指标写入下的正确性"""

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.slow
    async def test_concurrent_metric_recording_and_alerting(self):
        """高并发写入指标时,告警规则仍能正确触发且无数据竞争"""
        monitor = MetricsMonitor(config={"check_interval": 0.1})

        triggered = []

        def capture_alert(alert):
            triggered.append(alert)

        monitor.alert_manager.add_notifier(capture_alert)
        monitor.add_alert_rule(
            AlertRule(
                name="high_cpu",
                metric_name="cpu_usage",
                condition=lambda v: v > 80,
                level=AlertLevel.WARNING,
                # [cleanup] message_template="CPU 过高: {value}",
                cooldown_seconds=0,
            )
        )

        await monitor.start()

        async def writer(value):
            for _ in range(50):
                await monitor.record_metric("cpu_usage", value)
                await asyncio.sleep(0)

        # 并发写入高低两种指标
        await asyncio.gather(
            *[writer(95) for _ in range(10)],
            *[writer(30) for _ in range(10)],
        )

        # 确保最后一条是高指标,避免 get_latest 恰好为低值
        await monitor.record_metric("cpu_usage", 95)

        # 给监控循环至少一次评估机会(check_interval=0.1s)
        await asyncio.sleep(0.2)
        await monitor.stop()

        metrics = await monitor.get_metrics()
        cpu_points = metrics["metrics"].get("cpu_usage", [])
        assert len(cpu_points) == 1001

        # 告警应被触发
        assert len(triggered) >= 1

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_monitor_restart_resets_stop_event(self):
        """停止后重新启动监控器,stop_event 应被重置,避免循环立即退出"""
        monitor = MetricsMonitor(config={"check_interval": 0.1})
        monitor.add_alert_rule(
            AlertRule(
                name="high_cpu",
                metric_name="cpu_usage",
                condition=lambda v: v > 80,
                level=AlertLevel.WARNING,
                # [cleanup] message_template="CPU 过高: {value}",
                cooldown_seconds=0,
            )
        )
        await monitor.start()
        await monitor.stop()

        # 修复前:_stop_event 仍为 set,下一次循环会立即退出
        # 修复后:start() 会重置 _stop_event
        await monitor.start()
        assert monitor._monitor_task is not None

        await monitor.record_metric("cpu_usage", 95)
        await asyncio.sleep(0.2)
        await monitor.stop()

        alerts = await monitor.alert_manager.get_active_alerts()
        # 循环确实执行过且告警被触发
        assert len(alerts) >= 1
