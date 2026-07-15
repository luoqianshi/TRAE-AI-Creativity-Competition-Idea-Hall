"""双均线交叉策略 - 经典趋势跟踪"""
from __future__ import annotations
from collections import deque

import pandas as pd

from ..core.event import Event, SignalEvent, Direction, MarketEvent
from ..core.strategy import Strategy


class MovingAverageCrossStrategy(Strategy):
    """双均线交叉策略

    参数:
        short_window: 短期均线周期
        long_window:  长期均线周期
    金叉（短均线上穿长均线）-> 买入
    死叉（短均线下穿长均线）-> 平仓
    """

    def __init__(self, short_window: int = 5, long_window: int = 20, **kwargs):
        super().__init__(
            short_window=short_window,
            long_window=long_window,
            **kwargs,
        )
        self.short_window = short_window
        self.long_window = long_window
        self.prices: deque[float] = deque(maxlen=long_window)
        self.short_ma: float = 0.0
        self.long_ma: float = 0.0
        self.in_position = False

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

        signals: list[SignalEvent] = []

        # 金叉 -> 买入
        if prev_short <= prev_long and self.short_ma > self.long_ma and not self.in_position:
            signals.append(SignalEvent(
                timestamp=event.timestamp,
                symbol=event.symbol,
                direction=Direction.LONG,
                strength=1.0,
            ))
            self.in_position = True
        # 死叉 -> 平仓
        elif prev_short >= prev_long and self.short_ma < self.long_ma and self.in_position:
            signals.append(SignalEvent(
                timestamp=event.timestamp,
                symbol=event.symbol,
                direction=Direction.EXIT,
                strength=1.0,
            ))
            self.in_position = False

        return signals

    def _update_ma(self) -> None:
        prices = list(self.prices)
        n_short = min(self.short_window, len(prices))
        n_long = min(self.long_window, len(prices))
        self.short_ma = sum(prices[-n_short:]) / n_short if n_short else 0.0
        self.long_ma = sum(prices[-n_long:]) / n_long if n_long else 0.0
