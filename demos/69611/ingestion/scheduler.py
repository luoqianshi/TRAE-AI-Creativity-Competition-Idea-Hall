"""采集调度器 - 使用 APScheduler 定时触发采集任务"""

import asyncio
import logging
import random
from datetime import datetime, timedelta
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

from collectors.base import BaseCollector
from collectors.registry import CollectorRegistry, get_registry
from ingestion.redis_publisher import RedisStreamPublisher
from ingestion.minio_backup import MinIOBackup
from ingestion.status_recorder import IngestionRunRecorder, RunStatus
from ingestion.adaptive_scheduler import AdaptiveScheduler

logger = logging.getLogger(__name__)


class IngestionScheduler:
    """采集调度器 - 协调采集, 发布, 备份和状态记录"""

    def __init__(
        self,
        redis_url: str,
        minio_endpoint: str,
        minio_access_key: str,
        minio_secret_key: str,
        postgres_dsn: str,
        registry: Optional[CollectorRegistry] = None
    ):
        """
        初始化调度器

        Args:
            redis_url: Redis 连接 URL
            minio_endpoint: MinIO 端点
            minio_access_key: MinIO 访问密钥
            minio_secret_key: MinIO 密钥
            postgres_dsn: PostgreSQL 连接字符串
            registry: 采集器注册表
        """
        self.redis_url = redis_url
        self.minio_endpoint = minio_endpoint
        self.minio_access_key = minio_access_key
        self.minio_secret_key = minio_secret_key
        self.postgres_dsn = postgres_dsn
        self.registry = registry or get_registry()

        self.scheduler = AsyncIOScheduler(timezone="Asia/Shanghai")
        self.redis_publisher = RedisStreamPublisher(redis_url)
        self.minio_backup = MinIOBackup(
            minio_endpoint, minio_access_key, minio_secret_key
        )
        self.status_recorder = IngestionRunRecorder(postgres_dsn)
        self.adaptive_scheduler = AdaptiveScheduler(self.status_recorder)
        self._cron_sources: set = set()
        self._running: bool = False

    async def start(self):
        """启动调度器"""
        self.scheduler.start()
        self._running = True
        logger.info("采集调度器已启动")

    async def stop(self):
        """停止调度器"""
        if not self._running:
            return
        await asyncio.to_thread(self.scheduler.shutdown, wait=True)
        await self.redis_publisher.disconnect()
        await self.status_recorder.disconnect()
        self._running = False
        logger.info("采集调度器已停止")

    def add_collector_job(
        self,
        collector_name: str,
        interval_seconds: int = 300,
        cron_expression: Optional[str] = None
    ):
        """添加采集任务

        Args:
            collector_name: 采集器名称
            interval_seconds: 间隔秒数(与 cron_expression 二选一)
            cron_expression: Cron 表达式(如 "0 */2 * * *")
        """
        job_id = f"collect_{collector_name}"

        if cron_expression:
            self.scheduler.add_job(
                self._run_collector_by_name,
                trigger=CronTrigger.from_crontab(cron_expression),
                args=[collector_name],
                id=job_id,
                name=f"Collect: {collector_name}",
                replace_existing=True,
            )
            self._cron_sources.add(collector_name)
        else:
            self.scheduler.add_job(
                self._run_collector_by_name,
                trigger=IntervalTrigger(seconds=interval_seconds),
                args=[collector_name],
                id=job_id,
                name=f"Collect: {collector_name}",
                replace_existing=True,
            )
        logger.debug(
            "Added collector job: %s (interval=%ds, cron=%s)",
            collector_name, interval_seconds, cron_expression or "N/A",
        )

    async def add_all_enabled_collectors(self, default_interval: int = 300):
        """为所有已启用的采集器添加调度任务(含启动错开)"""
        enabled_collectors = self.registry.get_enabled_instances()

        for name, collector in enabled_collectors.items():
            configured_interval = collector.config.get(
                "update_interval", default_interval
            )
            adaptive_interval = await self.adaptive_scheduler.compute_interval(
                name, configured_interval
            )
            self.add_collector_job(name, interval_seconds=adaptive_interval)

        logger.info(
            "已添加 %d 个采集任务(自适应调度)",
            len(enabled_collectors),
        )

    async def refresh_adaptive_intervals(self):
        """刷新所有非 cron 采集器的自适应间隔

        根据最新历史数据重新计算间隔,并重新调度任务.
        cron 模式的采集器不受影响.
        """
        jobs = self.scheduler.get_jobs()
        refreshed = 0

        for job in jobs:
            job_id = job.id
            if not job_id.startswith("collect_"):
                continue

            source = job_id[len("collect_"):]

            # cron 模式的采集器跳过
            if source in self._cron_sources:
                continue

            # 仅处理 IntervalTrigger 类型的任务
            if not isinstance(job.trigger, IntervalTrigger):
                continue

            # 获取采集器实例以读取配置的默认间隔
            collector = self.registry.get_instance(source)
            if not collector:
                continue

            configured_interval = collector.config.get("update_interval", 300)

            # 重新计算自适应间隔
            new_interval = await self.adaptive_scheduler.compute_interval(
                source, configured_interval
            )

            # 当前间隔未变化则跳过
            current_interval = int(job.trigger.interval.total_seconds())
            if current_interval == new_interval:
                continue

            # 重新调度任务(保留 job_id)
            new_trigger = IntervalTrigger(seconds=new_interval)
            self.scheduler.reschedule_job(job_id, trigger=new_trigger)
            refreshed += 1
            logger.debug(
                "自适应刷新: %s 间隔 %ds -> %ds",
                source, current_interval, new_interval,
            )

        if refreshed > 0:
            logger.info("已刷新 %d 个采集器的自适应间隔", refreshed)

    async def _run_collector_by_name(self, collector_name: str):
        """通过名称查找采集器实例并执行"""
        collector = self.registry.get_instance(collector_name)
        if collector is None:
            logger.warning("采集器不存在: %s", collector_name)
            return
        await self._run_collector(collector)

    async def _run_collector(self, collector: BaseCollector):
        """执行单个采集器任务"""
        source = collector.name
        run_id = None

        try:
            run_id = await self.status_recorder.start_run(source)
            documents = await collector.collect_with_dedup()

            if not documents:
                await self.status_recorder.finish_run(
                    run_id, RunStatus.SUCCESS, 0
                )
                return

            published_count = await self.redis_publisher.publish_documents(documents)

            loop = asyncio.get_event_loop()
            backup_count = await loop.run_in_executor(
                None, self.minio_backup.backup_documents, documents
            )

            status = RunStatus.SUCCESS
            if published_count < len(documents) or backup_count < len(documents):
                status = RunStatus.PARTIAL

            await self.status_recorder.finish_run(
                run_id, status, len(documents)
            )

            logger.info(
                "采集完成: %s - 文档数: %d, 发布: %d, 备份: %d",
                source, len(documents), published_count, backup_count,
            )

        except Exception as e:
            logger.error("采集失败: %s - %s", source, e)
            if run_id:
                await self.status_recorder.finish_run(
                    run_id, RunStatus.FAILED, 0, str(e)
                )

    async def run_collector_now(self, collector_name: str) -> bool:
        """立即执行指定采集器"""
        collector = self.registry.get_instance(collector_name)
        if not collector:
            return False
        await self._run_collector(collector)
        return True

    def get_jobs(self) -> list:
        """获取所有调度任务"""
        return self.scheduler.get_jobs()

    def remove_job(self, collector_name: str) -> bool:
        """移除采集任务"""
        job_id = f"collect_{collector_name}"
        try:
            self.scheduler.remove_job(job_id)
            return True
        except Exception:
            return False
