"""新闻情感聚合器 - 将新闻按交易日聚合为情感分数"""
from __future__ import annotations
import logging
from collections import defaultdict
from datetime import datetime

import pandas as pd

from .news_provider import NewsArticle
from ..core.event import NewsEvent

logger = logging.getLogger(__name__)


class NewsSentimentAggregator:
    """新闻情感聚合器

    将多条新闻按交易日聚合，计算每日加权情感分数，
    并在回测时生成对应的 NewsEvent 注入引擎。

    聚合方法：
    - 简单平均
    - 加权平均（越新权重越高 + 标题权重 > 摘要）
    - 情感强度衰减（时间越旧权重越低）
    """

    def __init__(
        self,
        lookback_days: int = 3,
        decay_factor: float = 0.7,    # 每日衰减系数
        min_articles: int = 1,        # 最少新闻条数才触发
        threshold: float = 0.15,      # 情感阈值（超过才认为有信号）
    ):
        self.lookback_days = lookback_days
        self.decay_factor = decay_factor
        self.min_articles = min_articles
        self.threshold = threshold
        self._daily_scores: dict[str, dict] = {}  # date_str -> {score, count, headlines}

    def aggregate(self, articles: list[NewsArticle]) -> dict[str, dict]:
        """将新闻按交易日聚合

        Returns:
            dict: {date_str: {"score": float, "count": int, "headlines": list[str]}}
        """
        daily: dict[str, list[NewsArticle]] = defaultdict(list)
        for art in articles:
            day = art.published_at.strftime("%Y-%m-%d")
            daily[day].append(art)

        result: dict[str, dict] = {}
        for day in sorted(daily.keys()):
            # 计算当日情感：标题权重 1.5，摘要权重 1.0
            scores: list[float] = []
            headlines: list[str] = []
            for art in daily[day]:
                if art.sentiment is None:
                    continue
                # 标题权重更高
                title_weight = 1.5
                scores.append(art.sentiment.compound * title_weight)
                headlines.append(art.title)

            if not scores:
                result[day] = {"score": 0.0, "count": 0, "headlines": []}
                continue

            avg_score = sum(scores) / len(scores)
            # 限制在 [-1, 1]
            avg_score = max(-1.0, min(1.0, avg_score))
            result[day] = {
                "score": avg_score,
                "count": len(scores),
                "headlines": headlines[:5],
            }

        self._daily_scores = result
        logger.info(f"聚合新闻 {len(articles)} 篇 -> {len(result)} 个交易日有情感数据")
        return result

    def get_sentiment_for_date(self, date: datetime | str) -> tuple[float, int, list[str]]:
        """获取指定日期的加权情感分数（含 lookback 窗口内的衰减加权）

        返回: (score, article_count, headlines)
        """
        if isinstance(date, str):
            date = pd.to_datetime(date).to_pydatetime() if hasattr(pd.to_datetime(date), "to_pydatetime") else pd.Timestamp(date).to_pydatetime()

        target_date = date.date()
        weighted_sum = 0.0
        total_weight = 0.0
        total_count = 0
        all_headlines: list[str] = []

        for offset in range(self.lookback_days):
            day = target_date - pd.Timedelta(days=offset)
            day_str = day.strftime("%Y-%m-%d")
            data = self._daily_scores.get(day_str)
            if data is None or data["count"] == 0:
                continue

            weight = self.decay_factor ** offset
            weighted_sum += data["score"] * weight
            total_weight += weight
            total_count += data["count"]
            if offset == 0:
                all_headlines = data["headlines"]

        if total_weight == 0 or total_count < self.min_articles:
            return 0.0, 0, []

        final_score = weighted_sum / total_weight
        return round(final_score, 4), total_count, all_headlines

    def is_bullish(self, date: datetime | str) -> bool:
        """是否为看涨信号"""
        score, count, _ = self.get_sentiment_for_date(date)
        return count >= self.min_articles and score >= self.threshold

    def is_bearish(self, date: datetime | str) -> bool:
        """是否为看跌信号"""
        score, count, _ = self.get_sentiment_for_date(date)
        return count >= self.min_articles and score <= -self.threshold

    def make_event(self, symbol: str, date: datetime) -> NewsEvent | None:
        """为指定日期生成新闻事件（仅当有有效情感时）"""
        score, count, headlines = self.get_sentiment_for_date(date)
        if count < self.min_articles:
            return None
        return NewsEvent(
            timestamp=date,
            symbol=symbol,
            sentiment_score=score,
            article_count=count,
            headlines=headlines,
        )
