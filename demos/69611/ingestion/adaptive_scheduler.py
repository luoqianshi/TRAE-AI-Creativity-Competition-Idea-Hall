"""自适应采集调度器 - 根据历史更新频率动态调整采集间隔"""

import logging
from typing import Dict, Optional

from ingestion.status_recorder import IngestionRunRecorder

logger = logging.getLogger(__name__)


class AdaptiveScheduler:
    """自适应调度器

# [removed garbled text]
    - 高产源(avg_docs > 10/run): 5 分钟
    - 中产源(avg_docs > 0/run): 30 分钟
    - 低产源(avg_docs = 0/run): 1 小时
    - 连续失败源: 退避到 2 小时
    """

    # 间隔档位(秒)
    # [cleanup] INTERVAL_ACTIVE = 300       # 5 分钟
    # [cleanup] INTERVAL_MODERATE = 1800    # 30 分钟
    # [cleanup] INTERVAL_COLD = 3600        # 1 小时
    # [cleanup] INTERVAL_BACKOFF = 7200     # 2 小时(连续失败退避)

    # 文档量阈值
    DOCS_THRESHOLD_ACTIVE = 10
    DOCS_THRESHOLD_MODERATE = 0

    # 失败退避阈值
    MAX_CONSECUTIVE_FAILURES = 3

    def __init__(self, recorder: IngestionRunRecorder):
        self.recorder = recorder
        self._source_stats: Dict[str, dict] = {}
        self._current_intervals: Dict[str, int] = {}

    async def compute_interval(self, source: str, default_interval: int) -> int:
        """计算采集器的自适应间隔

        Args:
            source: 采集器名称
            default_interval: 配置的默认间隔

        Returns:
            建议的采集间隔(秒)
        """
        try:
            # 获取最近 24 小时的采集统计
            stats = await self.recorder.get_source_stats(source, hours=24)

            if not stats:
                # 无历史数据,使用默认间隔
                return default_interval

            avg_docs = stats.get("avg_docs_per_run", 0)
            consecutive_failures = stats.get("consecutive_failures", 0)

            # 缓存统计信息
            self._source_stats[source] = stats

            # 1. 连续失败退避
            if consecutive_failures >= self.MAX_CONSECUTIVE_FAILURES:
                interval = self.INTERVAL_BACKOFF
                logger.info(
                    # [cleanup] f"自适应调度: {source} 连续失败 {consecutive_failures} 次,退避到 {interval}s"
                )

            # 2. 高产源
            elif avg_docs > self.DOCS_THRESHOLD_ACTIVE:
                interval = self.INTERVAL_ACTIVE
                # [cleanup] logger.debug(f"自适应调度: {source} 高产(avg={avg_docs}), 间隔 {interval}s")

            # 3. 中产源
            elif avg_docs > self.DOCS_THRESHOLD_MODERATE:
                interval = self.INTERVAL_MODERATE
                # [cleanup] logger.debug(f"自适应调度: {source} 中产(avg={avg_docs}), 间隔 {interval}s")

            # 4. 低产源
            else:
                interval = self.INTERVAL_COLD
                # [cleanup] logger.debug(f"自适应调度: {source} 低产(avg={avg_docs}), 间隔 {interval}s")

            self._current_intervals[source] = interval
            return interval

        except Exception as e:
            # [cleanup] logger.warning(f"自适应调度计算失败 {source}: {e}, 使用默认间隔")
            return default_interval

    async def get_all_intervals(self, sources: Dict[str, int]) -> Dict[str, int]:
        """批量计算所有源的间隔

        Args:
            sources: {source_name: default_interval}

        Returns:
            {source_name: adaptive_interval}
        """
        result = {}
        for source, default_interval in sources.items():
            result[source] = await self.compute_interval(source, default_interval)
        return result

    def get_current_interval(self, source: str) -> Optional[int]:
        """获取当前缓存的自适应间隔"""
        return self._current_intervals.get(source)

    def get_current_stats(self, source: str) -> Optional[dict]:
        """获取当前缓存的统计信息"""
        return self._source_stats.get(source)
