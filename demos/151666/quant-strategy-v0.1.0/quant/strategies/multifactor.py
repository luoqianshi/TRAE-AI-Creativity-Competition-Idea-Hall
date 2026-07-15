"""多因子增强策略 - 技术面 + 新闻情感 + 动量 + 波动率过滤

核心改进：
1. 负面新闻回避：强烈负面情感时不买甚至提前卖（防黑天鹅）
2. 情感趋势确认：情感在上升时买入（改善中）
3. 波动率过滤：高波动时期降低仓位
4. 动量确认：短期趋势向上才开仓
"""
from __future__ import annotations
from collections import deque

import pandas as pd

from ..core.event import (
    MarketEvent, SignalEvent, Direction, NewsEvent,
)
from ..core.strategy import Strategy
from ..news.aggregator import NewsSentimentAggregator
from ..news.news_provider import NewsArticle


class MultiFactorStrategy(Strategy):
    """多因子增强策略

    买入条件（同时满足）:
    1. 短期均线上穿长期均线（金叉）
    2. 非强烈负面情感（score > -threshold）—— 回避雷区
    3. 短期动量为正（价格在短均线上方）
    4. 波动率不过高（ATR / 价格 < vol_threshold）

    卖出条件（任一触发）:
    1. 死叉
    2. 强烈负面情感（score < -panic_threshold）—— 新闻驱动止损
    3. 短期动量反转（跌破短均线 N 天）
    """

    def __init__(
        self,
        short_window: int = 5,
        long_window: int = 20,
        sentiment_threshold: float = 0.3,    # 强烈负面阈值（回避）
        panic_threshold: float = 0.4,        # 恐慌阈值（立即卖）
        vol_threshold: float = 0.05,         # 波动率上限
        use_sentiment_filter: bool = True,
        use_vol_filter: bool = True,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.short_window = short_window
        self.long_window = long_window
        self.sentiment_threshold = sentiment_threshold
        self.panic_threshold = panic_threshold
        self.vol_threshold = vol_threshold
        self.use_sentiment_filter = use_sentiment_filter
        self.use_vol_filter = use_vol_filter

        self.prices: deque[float] = deque(maxlen=long_window + 10)
        self.highs: deque[float] = deque(maxlen=long_window)
        self.lows: deque[float] = deque(maxlen=long_window)
        self.short_ma: float = 0.0
        self.long_ma: float = 0.0
        self.in_position = False

        # 新闻情感
        self.current_sentiment: float = 0.0
        self._aggregator: NewsSentimentAggregator | None = None
        self._news_ready = False

    def set_news(self, articles: list[NewsArticle]):
        self._aggregator = NewsSentimentAggregator(
            lookback_days=3,
            decay_factor=0.7,
            min_articles=1,
            threshold=self.sentiment_threshold,
        )
        self._aggregator.aggregate(articles)
        self._news_ready = True

    def warmup(self, data: pd.DataFrame) -> None:
        for _, row in data.iloc[-self.long_window:].iterrows():
            self.prices.append(float(row["close"]))
            self.highs.append(float(row["high"]))
            self.lows.append(float(row["low"]))
        self._update_indicators()

    def on_market(self, event: MarketEvent) -> list[SignalEvent]:
        price = event.bars.get("close", 0.0)
        high = event.bars.get("high", price)
        low = event.bars.get("low", price)
        self.prices.append(price)
        self.highs.append(high)
        self.lows.append(low)

        if len(self.prices) < self.long_window:
            return []

        prev_short, prev_long = self.short_ma, self.long_ma
        self._update_indicators()

        # 更新情感
        if self._aggregator is not None:
            score, _, _ = self._aggregator.get_sentiment_for_date(event.timestamp)
            self.current_sentiment = score

        signals: list[SignalEvent] = []

        # 金叉 + 多因子确认 -> 买入
        if prev_short <= prev_long and self.short_ma > self.long_ma and not self.in_position:
            if self._check_buy_filters(price):
                # 根据信心调整仓位
                strength = self._calc_strength(price)
                signals.append(SignalEvent(
                    timestamp=event.timestamp,
                    symbol=event.symbol,
                    direction=Direction.LONG,
                    strength=strength,
                ))
                self.in_position = True
                return signals

        # 持仓中检查卖出
        if self.in_position:
            if self._check_exit(prev_short, prev_long):
                signals.append(SignalEvent(
                    timestamp=event.timestamp,
                    symbol=event.symbol,
                    direction=Direction.EXIT,
                    strength=1.0,
                ))
                self.in_position = False

        return signals

    def _check_buy_filters(self, price: float) -> bool:
        """买入过滤条件"""
        # 动量确认：价格在短均线上方
        if price <= self.short_ma:
            return False

        # 负面新闻回避
        if self.use_sentiment_filter and self._news_ready:
            if self.current_sentiment <= -self.sentiment_threshold:
                return False

        # 波动率过滤
        if self.use_vol_filter:
            atr = self._calc_atr()
            if atr / price > self.vol_threshold:
                return False

        return True

    def _check_exit(self, prev_short: float, prev_long: float) -> bool:
        """卖出条件检查"""
        # 死叉
        if prev_short >= prev_long and self.short_ma < self.long_ma:
            return True

        # 新闻恐慌：强烈负面
        if self.use_sentiment_filter and self._news_ready:
            if self.current_sentiment <= -self.panic_threshold:
                return True

        return False

    def _calc_strength(self, price: float) -> float:
        """根据多因子信心计算仓位强度 [0.3, 1.0]"""
        strength = 0.5  # 基础仓位

        # 情感正面加成
        if self._news_ready and self.current_sentiment > 0:
            strength += 0.2 * min(1.0, self.current_sentiment / 0.5)

        # 动量强度加成
        if self.short_ma > self.long_ma:
            momentum = (self.short_ma - self.long_ma) / self.long_ma
            strength += 0.2 * min(1.0, momentum / 0.05)

        # 低波动加成（稳定行情下更敢加仓）
        if self.use_vol_filter:
            atr = self._calc_atr()
            vol = atr / price
            if vol < self.vol_threshold * 0.5:
                strength += 0.1

        return max(0.3, min(1.0, strength))

    def _calc_atr(self, period: int = 14) -> float:
        """简易 ATR（平均真实波幅）"""
        if len(self.highs) < 2:
            return 0.0
        trs = []
        prices = list(self.prices)
        highs = list(self.highs)
        lows = list(self.lows)
        for i in range(1, len(highs)):
            tr = max(
                highs[i] - lows[i],
                abs(highs[i] - prices[i-1]),
                abs(lows[i] - prices[i-1]),
            )
            trs.append(tr)
        if not trs:
            return 0.0
        n = min(period, len(trs))
        return sum(trs[-n:]) / n

    def _update_indicators(self) -> None:
        prices = list(self.prices)
        n_short = min(self.short_window, len(prices))
        n_long = min(self.long_window, len(prices))
        self.short_ma = sum(prices[-n_short:]) / n_short if n_short else 0.0
        self.long_ma = sum(prices[-n_long:]) / n_long if n_long else 0.0
