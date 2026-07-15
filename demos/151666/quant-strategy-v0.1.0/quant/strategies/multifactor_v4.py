"""v4 策略：用 ATR 动态止损替代 v3 的固定百分比止损

v3 失败原因：-3% 固定止损在正常波动中频繁误杀好仓位
（30 笔交易 vs v1 的 18 笔，最大回撤 -12% vs v1 的 -3.9%）

v4 改进：
1. 入场：保持 v1 的过滤（情感 + ATR + 动量）
2. 止损：基于 ATR 的动态止损
   - 初始止损 = entry - k_init * ATR（给趋势足够空间）
   - 盈利达到 k_protect * ATR 后，止损上移到 entry（保本）
   - 盈利达到 k_lock * ATR 后，止损上移到 entry + k_lock_profit * ATR（锁定部分利润）
3. 出场：死叉 / 新闻恐慌 / 动态止损
4. 不使用 trailing stop（避免过早砍掉盈利单）
"""
from __future__ import annotations
from collections import deque

import pandas as pd

from ..core.event import MarketEvent, SignalEvent, Direction, FillEvent
from ..core.strategy import Strategy
from ..core.indicators import atr
from ..news.aggregator import NewsSentimentAggregator
from ..news.news_provider import NewsArticle


class MultiFactorV4Strategy(Strategy):
    """多因子策略 v4 - ATR 动态止损

    入场条件（同 v1）:
    1. 金叉
    2. ATR/Price < vol_threshold（低波动环境）
    3. 新闻情感 > -sentiment_threshold（非强烈负面）
    4. 价格站上短均线

    出场条件（任一）:
    1. 死叉
    2. 强烈负面新闻
    3. ATR 动态止损
       - 亏损超过 k_init * ATR → 止损
       - 盈利达到 k_protect * ATR 后回撤到 entry → 保本
       - 盈利达到 k_lock * ATR 后回撤到 entry + k_lock_profit * ATR → 锁定利润
    """

    def __init__(
        self,
        short_window: int = 5,
        long_window: int = 20,
        sentiment_threshold: float = 0.3,
        panic_threshold: float = 0.4,
        vol_threshold: float = 0.05,
        atr_period: int = 14,
        # ATR 止损倍数
        k_init: float = 2.5,            # 初始止损：entry - 2.5 * ATR
        k_protect: float = 2.0,         # 盈利 2 * ATR 后启动保本
        k_lock: float = 4.0,            # 盈利 4 * ATR 后锁定利润
        k_lock_profit: float = 1.0,     # 锁定后止损位 = entry + 1 * ATR
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.short_window = short_window
        self.long_window = long_window
        self.sentiment_threshold = sentiment_threshold
        self.panic_threshold = panic_threshold
        self.vol_threshold = vol_threshold
        self.atr_period = atr_period
        self.k_init = k_init
        self.k_protect = k_protect
        self.k_lock = k_lock
        self.k_lock_profit = k_lock_profit

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
        self._entry_atr: float = 0.0       # 入场时的 ATR
        self._max_favorable: float = 0.0   # 持仓期间最高价
        self._stage: int = 0               # 0=初始, 1=保本, 2=锁定

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
            self._entry_atr = self._calc_atr()
            self._max_favorable = event.fill_price
            self._stage = 0
        elif event.quantity < 0:
            self._entry_price = 0.0
            self._entry_atr = 0.0
            self._max_favorable = 0.0
            self._stage = 0

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
            if high > self._max_favorable:
                self._max_favorable = high
            self._update_stage()

            if self._check_exit(prev_short, prev_long, price, low):
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

    def _update_stage(self) -> None:
        """根据盈利程度升级止损阶段"""
        if self._entry_price <= 0 or self._entry_atr <= 0:
            return
        favorable = self._max_favorable - self._entry_price

        if favorable >= self.k_lock * self._entry_atr:
            self._stage = 2  # 锁定利润
        elif favorable >= self.k_protect * self._entry_atr:
            self._stage = 1  # 保本
        else:
            self._stage = 0  # 初始

    def _check_entry(self, price: float) -> bool:
        """入场过滤（同 v1）"""
        if price <= self.short_ma:
            return False

        atr_val = self._calc_atr()
        if price > 0 and atr_val / price > self.vol_threshold:
            return False

        if self._news_ready and self.current_sentiment <= -self.sentiment_threshold:
            return False

        return True

    def _check_exit(self, prev_short: float, prev_long: float,
                    price: float, low: float) -> bool:
        """出场：ATR 动态止损"""
        # 1. 死叉
        if prev_short >= prev_long and self.short_ma < self.long_ma:
            return True

        # 2. 新闻恐慌
        if self._news_ready and self.current_sentiment <= -self.panic_threshold:
            return True

        # 3. ATR 动态止损（用 low 触及判断更真实）
        if self._entry_price > 0 and self._entry_atr > 0:
            if self._stage == 0:
                # 初始止损：entry - k_init * ATR
                stop = self._entry_price - self.k_init * self._entry_atr
                if low <= stop:
                    return True
            elif self._stage == 1:
                # 保本止损：回撤到 entry
                if low <= self._entry_price:
                    return True
            elif self._stage == 2:
                # 锁定利润：entry + k_lock_profit * ATR
                stop = self._entry_price + self.k_lock_profit * self._entry_atr
                if low <= stop:
                    return True

        return False

    def _calc_atr(self) -> float:
        if len(self.highs) < self.atr_period + 1:
            return 0.0
        return atr(
            list(self.highs), list(self.lows), list(self.prices),
            self.atr_period,
        )

    def _update_ma(self) -> None:
        prices = list(self.prices)
        n_short = min(self.short_window, len(prices))
        n_long = min(self.long_window, len(prices))
        self.short_ma = sum(prices[-n_short:]) / n_short if n_short else 0.0
        self.long_ma = sum(prices[-n_long:]) / n_long if n_long else 0.0
