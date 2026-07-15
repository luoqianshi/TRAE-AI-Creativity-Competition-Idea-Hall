"""RSI 相对强弱指标策略 - 均值回归"""
from __future__ import annotations
from collections import deque

import pandas as pd

from ..core.event import SignalEvent, Direction, MarketEvent
from ..core.strategy import Strategy


class RSIStrategy(Strategy):
    """RSI 策略

    参数:
        period:    RSI 计算周期
        oversold:  超卖阈值（低于买入）
        overbought: 超买阈值（高于卖出）
    """

    def __init__(self, period: int = 14, oversold: float = 30, overbought: float = 70, **kwargs):
        super().__init__(period=period, oversold=oversold, overbought=overbought, **kwargs)
        self.period = period
        self.oversold = oversold
        self.overbought = overbought
        self.prices: deque[float] = deque(maxlen=period + 1)
        self.in_position = False

    def warmup(self, data: pd.DataFrame) -> None:
        for price in data["close"].iloc[-(self.period + 1):]:
            self.prices.append(float(price))

    def on_market(self, event: MarketEvent) -> list[SignalEvent]:
        self.prices.append(event.bars.get("close", 0.0))
        if len(self.prices) < self.period + 1:
            return []

        rsi = self._calc_rsi()
        signals: list[SignalEvent] = []

        if rsi < self.oversold and not self.in_position:
            signals.append(SignalEvent(
                timestamp=event.timestamp,
                symbol=event.symbol,
                direction=Direction.LONG,
                strength=1.0,
            ))
            self.in_position = True
        elif rsi > self.overbought and self.in_position:
            signals.append(SignalEvent(
                timestamp=event.timestamp,
                symbol=event.symbol,
                direction=Direction.EXIT,
                strength=1.0,
            ))
            self.in_position = False

        return signals

    def _calc_rsi(self) -> float:
        prices = list(self.prices)
        gains, losses = 0.0, 0.0
        for i in range(1, len(prices)):
            change = prices[i] - prices[i - 1]
            if change > 0:
                gains += change
            else:
                losses += abs(change)
        avg_gain = gains / self.period
        avg_loss = losses / self.period
        if avg_loss == 0:
            return 100.0
        rs = avg_gain / avg_loss
        return 100 - (100 / (1 + rs))
