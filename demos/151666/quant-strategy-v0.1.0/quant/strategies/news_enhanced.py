"""新闻增强策略 - 技术面 + 新闻情感面双重过滤

核心思路：
- 保留原技术指标信号（如均线金叉）
- 叠加新闻情感过滤：只有当情感方向与技术信号一致时才开仓
- 情感确认能过滤掉假突破，提高胜率（但交易次数会减少）
"""
from __future__ import annotations
from collections import deque

import pandas as pd

from ..core.event import (
    MarketEvent, SignalEvent, Direction, NewsEvent,
)
from ..core.strategy import Strategy
from ..news.sentiment import FinancialSentimentAnalyzer
from ..news.aggregator import NewsSentimentAggregator
from ..news.news_provider import NewsArticle


class NewsEnhancedMAStrategy(Strategy):
    """新闻增强的双均线策略

    买入条件（全部满足）：
    1. 短期均线上穿长期均线（金叉）
    2. 新闻情感为正面（>= sentiment_threshold）
    3. 情感在增强（近 3 日情感上升）

    卖出条件（任一满足）：
    1. 死叉
    2. 新闻情感转为负面（<-sentiment_threshold）
    """

    def __init__(
        self,
        short_window: int = 5,
        long_window: int = 20,
        sentiment_threshold: float = 0.15,
        use_sentiment_filter: bool = True,
        sentiment_exit: bool = True,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.short_window = short_window
        self.long_window = long_window
        self.sentiment_threshold = sentiment_threshold
        self.use_sentiment_filter = use_sentiment_filter
        self.sentiment_exit = sentiment_exit

        self.prices: deque[float] = deque(maxlen=long_window)
        self.short_ma: float = 0.0
        self.long_ma: float = 0.0
        self.in_position = False

        # 新闻情感
        self.current_sentiment: float = 0.0
        self.sentiment_history: deque[float] = deque(maxlen=10)
        self._aggregator: NewsSentimentAggregator | None = None
        self._news_ready = False

    def set_news(self, articles: list[NewsArticle]):
        """注入新闻数据"""
        self._aggregator = NewsSentimentAggregator(
            lookback_days=3,
            decay_factor=0.7,
            min_articles=1,
            threshold=self.sentiment_threshold,
        )
        self._aggregator.aggregate(articles)
        self._news_ready = True

    def warmup(self, data: pd.DataFrame) -> None:
        for price in data["close"].iloc[-self.long_window:]:
            self.prices.append(float(price))
        self._update_ma()

    def on_market(self, event: MarketEvent) -> list[SignalEvent]:
        price = event.bars.get("close", 0.0)
        self.prices.append(price)

        if len(self.prices) < self.long_window:
            return []

        prev_short, prev_long = self.short_ma, self.long_ma
        self._update_ma()

        # 更新情感（从聚合器获取当日情感）
        if self._aggregator is not None:
            score, _, _ = self._aggregator.get_sentiment_for_date(event.timestamp)
            self.current_sentiment = score
            self.sentiment_history.append(score)

        signals: list[SignalEvent] = []
        bullish = self._is_bullish()
        bearish = self._is_bearish()

        # 金叉 + 情感确认 -> 买入
        if prev_short <= prev_long and self.short_ma > self.long_ma and not self.in_position:
            if not self.use_sentiment_filter or bullish:
                signals.append(SignalEvent(
                    timestamp=event.timestamp,
                    symbol=event.symbol,
                    direction=Direction.LONG,
                    strength=1.0,
                ))
                self.in_position = True
                return signals

        # 死叉 或 情感转空 -> 卖出
        if self.in_position:
            exit_signal = False
            if prev_short >= prev_long and self.short_ma < self.long_ma:
                exit_signal = True
            elif self.sentiment_exit and bearish:
                exit_signal = True

            if exit_signal:
                signals.append(SignalEvent(
                    timestamp=event.timestamp,
                    symbol=event.symbol,
                    direction=Direction.EXIT,
                    strength=1.0,
                ))
                self.in_position = False

        return signals

    def on_news(self, event: NewsEvent) -> None:
        """处理新闻事件（备用，实际从聚合器获取）"""
        self.current_sentiment = event.sentiment_score
        self.sentiment_history.append(event.sentiment_score)

    def _is_bullish(self) -> bool:
        """判断是否为看涨情绪环境"""
        if not self.use_sentiment_filter or not self._news_ready:
            return True  # 无新闻时不过滤
        return self.current_sentiment >= self.sentiment_threshold

    def _is_bearish(self) -> bool:
        """判断是否为看跌情绪环境"""
        if not self.sentiment_exit or not self._news_ready:
            return False
        return self.current_sentiment <= -self.sentiment_threshold

    def _update_ma(self) -> None:
        prices = list(self.prices)
        n_short = min(self.short_window, len(prices))
        n_long = min(self.long_window, len(prices))
        self.short_ma = sum(prices[-n_short:]) / n_short if n_short else 0.0
        self.long_ma = sum(prices[-n_long:]) / n_long if n_long else 0.0
