"""数据质量监控 - 检测采集量突降, 去重率异常, 抽取失败率, 报告延迟"""

import asyncio
import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

from utils.db_pool import get_pool_manager
from utils.monitor import get_monitor, Alert, AlertLevel
from utils.timezone import business_now

logger = logging.getLogger(__name__)


class DataQualityMonitor:
    """数据质量监控器"""

    def __init__(self):
        self._pool_manager = None
        self._monitor = None
        # 修复: 恢复 _check_interval (原被注释删除, start() 引用导致 AttributeError + 死循环不 sleep)
        self._check_interval = 300  # 5 分钟检查一次

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    def _get_monitor(self):
        if self._monitor is None:
            self._monitor = get_monitor()
        return self._monitor

    async def _trigger_alert(
        self,
        rule_name: str,
        level: str,
        message: str,
        labels: Optional[dict] = None,
    ):
        """通过监控模块触发告警 (async)

        修复: 原方法为同步, 但 AlertManager._trigger_alert 是 async,
        同步调用返回协程对象但不执行, 告警永远不被触发.
        Args:
            rule_name: 告警规则名称
            level: 告警级别 (info/warning/error/critical)
            message: 告警消息
            labels: 标签/元数据
        """
        monitor = self._get_monitor()
        if monitor is None:
            return

        level_map = {
            "info": AlertLevel.INFO,
            "warning": AlertLevel.WARNING,
            "error": AlertLevel.ERROR,
            "critical": AlertLevel.CRITICAL,
        }
        alert = Alert(
            id=f"{rule_name}_{int(time.time())}",
            rule_name=rule_name,
            level=level_map.get(level, AlertLevel.WARNING),
            message=message,
            metadata=labels or {},
        )
        # 修复: 改用公共接口 evaluate_rules 不便 (需要 collector),
        # 直接调用 async _trigger_alert 并 await
        await monitor.alert_manager._trigger_alert(alert)

    async def check_collection_drop(self):
        """Check for collection volume drops (0 docs in 2h for any source)."""
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()

            threshold = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=2)
            async with pg_pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT DISTINCT source
                    FROM ingestion_status
                    WHERE last_success_at < $1
                       OR last_success_at IS NULL
                    """,
                    threshold,
                )
                for row in rows:
                    source = row["source"]
                    logger.warning("Collection drop detected for source: %s", source)
                    await self._trigger_alert(
                        rule_name="collection_drop",
                        level="warning",
                        message=f"采集源 {source} 已 2 小时无新数据",
                        labels={"source": source},
                    )
        except Exception as e:
            logger.warning("Collection drop check failed: %s", e)

    async def check_report_consistency(self):
        """Check daily report consistency across PG and MongoDB."""
        try:
            yesterday = (
                business_now() - timedelta(days=1)
            ).strftime("%Y-%m-%d")
            today = business_now()

            report_found = False

            # 1. 优先查 PG(主存)
            try:
                pool = await self._get_pool_manager()
                pg_pool = await pool.postgres.get_pool()
                async with pg_pool.acquire() as conn:
                    row = await conn.fetchval(
                        "SELECT 1 FROM daily_reports WHERE report_date = $1::date",
                        yesterday,
                    )
                    report_found = row is not None
            except Exception as pg_err:
                logger.debug("PG daily_reports query failed: %s", pg_err)

            # 2. 降级查 MongoDB(仅当 PG 查询失败时)
            if not report_found:
                try:
                    pool = await self._get_pool_manager()
                    mongo_client = await pool.mongodb.get_client()

                    from config import get_config
                    config = get_config()
                    db = mongo_client[config.mongodb.database]
                    collection = db["daily_reports"]

                    report = await collection.find_one({"date": yesterday})
                    report_found = report is not None
                except Exception as mongo_err:
                    logger.debug("MongoDB reports query failed: %s", mongo_err)

            # 如果昨天的报告尚未生成,且今天已超过 10:00,触发告警
            if not report_found and today.hour >= 10:
                # 修复: 恢复告警消息 (原为空元组导致下游类型错误)
                await self._trigger_alert(
                    rule_name="report_delay",
                    level="warning",
                    message=(
                        f"{yesterday} 日报生成延迟, "
                        f"当前已 {today.strftime('%H:%M')}"
                    ),
                    labels={"date": yesterday},
                )
        except Exception as e:
            logger.warning("Report consistency check failed: %s", e, exc_info=True)

    # 修复: 实现缺失的三个方法 (原 run_check_cycle 调用它们但未定义, AttributeError)
    async def check_dedup_rate_anomaly(self):
        """检测去重率异常 (simhash 命中率突然飙升, 表示源被污染或重复采集)."""
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            threshold = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=24)
            async with pg_pool.acquire() as conn:
                # 近 24h 总文档数与去重后文档数对比
                row = await conn.fetchrow(
                    """
                    SELECT
                        COUNT(*) AS total,
                        COUNT(DISTINCT fingerprint) AS unique_docs
                    FROM documents
                    WHERE timestamp >= $1
                    """,
                    threshold,
                )
                if row and row["total"] > 100:
                    dup_rate = 1.0 - (row["unique_docs"] / row["total"])
                    # 去重率 > 80% 视为异常 (正常应 < 50%)
                    if dup_rate > 0.8:
                        logger.warning(
                            "Dedup rate anomaly: %.2f%% (total=%d, unique=%d)",
                            dup_rate * 100, row["total"], row["unique_docs"],
                        )
                        await self._trigger_alert(
                            rule_name="dedup_rate_anomaly",
                            level="warning",
                            message=(
                                f"去重率异常: {dup_rate*100:.1f}% "
                                f"(总 {row['total']}, 唯一 {row['unique_docs']})"
                            ),
                            labels={"dup_rate": str(dup_rate)},
                        )
        except Exception as e:
            logger.debug("Dedup rate check failed: %s", e)

    async def check_extraction_failure_rate(self):
        """检测实体抽取失败率 (LLM/NER 抽取失败比例过高)."""
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            threshold = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=6)
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    SELECT
                        COUNT(*) AS total,
                        COUNT(*) FILTER (WHERE entities_extracted = 0) AS failed
                    FROM documents
                    WHERE timestamp >= $1
                    """,
                    threshold,
                )
                if row and row["total"] > 50:
                    fail_rate = row["failed"] / row["total"]
                    # 失败率 > 30% 视为异常
                    if fail_rate > 0.3:
                        logger.warning(
                            "Extraction failure rate: %.2f%% (failed=%d/%d)",
                            fail_rate * 100, row["failed"], row["total"],
                        )
                        await self._trigger_alert(
                            rule_name="extraction_failure_rate",
                            level="error",
                            message=(
                                f"实体抽取失败率 {fail_rate*100:.1f}% "
                                f"(失败 {row['failed']}/{row['total']})"
                            ),
                            labels={"fail_rate": str(fail_rate)},
                        )
        except Exception as e:
            logger.debug("Extraction failure rate check failed: %s", e)

    async def check_report_delay(self):
        """检测日报生成延迟 (委托给 check_report_consistency)."""
        # check_report_consistency 已包含延迟检测逻辑, 这里委托调用避免重复
        await self.check_report_consistency()

    async def run_check_cycle(self):
        """运行一次完整的质量检查"""
        logger.info("Starting data quality check cycle...")
        # 修复: 移除对不存在方法的调用 (check_report_delay 委托到 check_report_consistency)
        await asyncio.gather(
            self.check_collection_drop(),
            self.check_dedup_rate_anomaly(),
            self.check_extraction_failure_rate(),
            self.check_report_consistency(),
            return_exceptions=True,
        )
        logger.info("Data quality check cycle complete")

    async def start(self):
        """启动后台监控循环"""
        logger.info("Data quality monitor started")
        while True:
            try:
                await self.run_check_cycle()
            except Exception as e:
                logger.error("Data quality check cycle crashed: %s", e, exc_info=True)
            # 修复: _check_interval 已在 __init__ 中恢复
            await asyncio.sleep(self._check_interval)


# 全局实例
_dq_monitor: Optional[DataQualityMonitor] = None


def get_data_quality_monitor() -> DataQualityMonitor:
    global _dq_monitor
    if _dq_monitor is None:
        _dq_monitor = DataQualityMonitor()
    return _dq_monitor
