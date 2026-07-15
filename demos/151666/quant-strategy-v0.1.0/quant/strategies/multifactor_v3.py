"""v3 策略：在 v1 基础上改进出场逻辑，而非增加入场过滤

核心改进：
1. 入场：保持 v1 的简单过滤（情感 + ATR + 动量）
2. 出场改进：
   - 亏损单：硬止损 -3%（截断亏损）
   - 盈利单：让利润奔跑，仅死叉或强烈负面新闻才退出
   - 不使用 trailing stop（避免过早砍掉盈利单）
3. 仓位管理：盈利单加仓（金字塔加仓）
"""
from __future__ import annotations
from collections import deque

import pandas as pd

from ..core.event import MarketEvent, SignalEvent, Direction, FillEvent
from ..core.strategy import Strategy
from ..core.indicators import atr
from ..news.aggregator import NewsSentimentAggregator
from ..news.news_provider import NewsArticle


class MultiFactorV3Strategy(Strategy):
    """多因子策略 v3 - 截断亏损，让利润奔跑

    入场条件（同 v1）:
    1. 金叉
    2. ATR/Price < vol_threshold（低波动环境）
    3. 新闻情感 > -sentiment_threshold（非强烈负面）
    4. 价格站上短均线

    出场条件（任一）:
    1. 死叉
    2. 强烈负面新闻
    3. 硬止损：浮亏 > stop_loss_pct（截断亏损）
    4. 盈利保护：曾盈利 > protect_pct 后回撤到保本
    """

    def __init__(
        self,
        short_window: int = 5,
        long_window: int = 20,
        sentiment_threshold: float = 0.3,
        panic_threshold: float = 0.4,
        vol_threshold: float = 0.05,
        atr_period: int = 14,
        # 止损
        stop_loss_pct: float = 0.03,        # 硬止损 3%
        protect_threshold: float = 0.015,   # 盈利 1.5% 后启动保本
        protect_stop_pct: float = 0.005,    # 保护性止损回撤 0.5%
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.short_window = short_window
        self.long_window = long_window
        self.sentiment_threshold = sentiment_threshold
        self.panic_threshold = panic_threshold
        self.vol_threshold = vol_threshold
        self.atr_period = atr_period
        self.stop_loss_pct = stop_loss_pct
        self.protect_threshold = protect_threshold
        self.protect_stop_pct = protect_stop_pct

        buf_len = max(long_window, atr_period * 2, 50)
        self.prices: deque[float] = deque(maxlen=buf_len)
        self.highs: deque[float] = deque(maxlen=buf_len)
        self.lows: deque[float] = deque(maxlen=buf_len)

        self.short_ma: float = 0.0
        self.long_ma: float = 0.0
        self.in_position = False

        # 新闻
        self.current_sentiment: float = 0.0
        self._aggregator: NewsSentimentAggregator | None = None
        self._news_ready = False

        # 持仓跟踪
        self._entry_price: float = 0.0
        self._max_favorable: float = 0.0  # 持仓期间最高价
        self._protection_active: bool = False

    def set_news(self, articles: list[NewsArticle]) -> None:
        self._aggregator = NewsSentimentAggregator(
            lookback_days=3, decay_factor=0.7,
            min_articles=1, threshold=self.sentiment_threshold,
        )
        self._aggregator.aggregate(articles)
        self._news_ready = True

    def warmup(self, data: pd.DataFrame) -> None:
        for _, row in data.iloc[-self.long_window:].iterrows():
            self.prices.append(float(row["close"]))
            self.highs.append(float(row["high"]))
            self.lows.append(float(row["low"]))
        self._update_ma()

    def on_fill(self, event: FillEvent) -> None:
        if event.quantity > 0:
            self._entry_price = event.fill_price
            self._max_favorable = event.fill_price
            self._protection_active = False
        elif event.quantity < 0:
            self._entry_price = 0.0
            self._max_favorable = 0.0
            self._protection_active = False

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
        self._update_ma()

        if self._aggregator is not None:
            score, _, _ = self._aggregator.get_sentiment_for_date(event.timestamp)
            self.current_sentiment = score

        signals: list[SignalEvent] = []

        # 持仓中：检查止损/止盈
        if self.in_position:
            # 更新最高价
            if high > self._max_favorable:
                self._max_favorable = high

            # 检查是否激活保本止损
            if not self._protection_active and self._entry_price > 0:
                profit_pct = (self._max_favorable - self._entry_price) / self._entry_price
                if profit_pct >= self.protect_threshold:
                    self._protection_active = True

            should_exit = self._check_exit(prev_short, prev_long, price)
            if should_exit:
                signals.append(SignalEvent(
                    timestamp=event.timestamp,
                    symbol=event.symbol,
                    direction=Direction.EXIT,
                    strength=1.0,
                ))
                self.in_position = False
                return signals

        # 空仓：检查入场
        if not self.in_position:
            if prev_short <= prev_long and self.short_ma > self.long_ma:
                if self._check_entry(price):
                    signals.append(SignalEvent(
                        timestamp=event.timestamp,
                        symbol=event.symbol,
                        direction=Direction.LONG,
                        strength=1.0,
                    ))
                    self.in_position = True

        return signals

    def _check_entry(self, price: float) -> bool:
        """入场过滤（同 v1）"""
        # 动量确认
        if price <= self.short_ma:
            return False

        # 波动率过滤
        atr_val = atr(list(self.highs), list(self.lows), list(self.prices), self.atr_period)
        if price > 0 and atr_val / price > self.vol_threshold:
            return False

        # 新闻情感
        if self._news_ready and self.current_sentiment <= -self.sentiment_threshold:
            return False

        return True

    def _check_exit(self, prev_short: float, prev_long: float, price: float) -> bool:
        """出场：截断亏损，让利润奔跑"""
        # 1. 死叉
        if prev_short >= prev_long and self.short_ma < self.long_ma:
            return True

        # 2. 新闻恐慌
        if self._news_ready and self.current_sentiment <= -self.panic_threshold:
            return True

        # 3. 硬止损（亏损超过 stop_loss_pct）
        if self._entry_price > 0:
            loss_pct = (price - self._entry_price) / self._entry_price
            if loss_pct <= -self.stop_loss_pct:
                return True

            # 4. 保本止损（盈利后回撤到保本线）
            if self._protection_active:
                protect_price = self._entry_price * (1 + self.protect_stop_pct)
                if price < protect_price:
                    return True

        return False

    def _update_ma(self) -> None:
        prices = list(self.prices)
        n_short = min(self.short_window, len(prices))
        n_long = min(self.long_window, len(prices))
        self.short_ma = sum(prices[-n_short:]) / n_short if n_short else 0.0
        self.long_ma = sum(prices[-n_long:]) / n_long if n_long else 0.0
