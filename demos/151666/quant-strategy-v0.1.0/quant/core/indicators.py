"""技术指标工具库 - 提供 ADX/RSI/ATR 等指标的滚动计算

用于策略实时计算指标，不依赖 pandas-ta。
所有指标都接受 deque 或 list 输入，返回最新值。
"""
from __future__ import annotations
from collections import deque
from typing import Sequence


def sma(values: Sequence[float], period: int) -> float:
    """简单移动平均"""
    if len(values) < period:
        return sum(values) / len(values) if values else 0.0
    return sum(values[-period:]) / period


def ema(values: Sequence[float], period: int) -> float:
    """指数移动平均（一次性计算）"""
    if not values:
        return 0.0
    k = 2 / (period + 1)
    e = values[0]
    for v in values[1:]:
        e = v * k + e * (1 - k)
    return e


def rsi(prices: Sequence[float], period: int = 14) -> float:
    """RSI 相对强弱指标

    使用 Wilder 平滑法（指数平滑）
    """
    if len(prices) < period + 1:
        return 50.0

    gains = []
    losses = []
    for i in range(1, len(prices)):
        change = prices[i] - prices[i - 1]
        gains.append(max(change, 0))
        losses.append(max(-change, 0))

    if len(gains) < period:
        return 50.0

    # Wilder 平滑
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def atr(
    highs: Sequence[float],
    lows: Sequence[float],
    closes: Sequence[float],
    period: int = 14,
) -> float:
    """ATR 平均真实波幅（Wilder 平滑）"""
    if len(closes) < 2:
        return 0.0

    trs = []
    for i in range(1, len(closes)):
        tr = max(
            highs[i] - lows[i],
            abs(highs[i] - closes[i - 1]),
            abs(lows[i] - closes[i - 1]),
        )
        trs.append(tr)

    if len(trs) < period:
        return sum(trs) / len(trs) if trs else 0.0

    # Wilder 平滑
    atr_val = sum(trs[:period]) / period
    for i in range(period, len(trs)):
        atr_val = (atr_val * (period - 1) + trs[i]) / period
    return atr_val


def adx(
    highs: Sequence[float],
    lows: Sequence[float],
    closes: Sequence[float],
    period: int = 14,
) -> tuple[float, float, float]:
    """ADX 趋势强度指标

    返回 (adx, plus_di, minus_di)
    - ADX > 25: 有趋势
    - ADX > 40: 趋势极强（可能末端）
    - ADX < 15: 无趋势（震荡市）
    """
    n = len(closes)
    if n < period * 2 + 1:
        return 0.0, 0.0, 0.0

    # 计算 +DM, -DM, TR
    plus_dm_list = []
    minus_dm_list = []
    tr_list = []
    for i in range(1, n):
        up_move = highs[i] - highs[i - 1]
        down_move = lows[i - 1] - lows[i]
        plus_dm = up_move if (up_move > down_move and up_move > 0) else 0
        minus_dm = down_move if (down_move > up_move and down_move > 0) else 0
        tr = max(
            highs[i] - lows[i],
            abs(highs[i] - closes[i - 1]),
            abs(lows[i] - closes[i - 1]),
        )
        plus_dm_list.append(plus_dm)
        minus_dm_list.append(minus_dm)
        tr_list.append(tr)

    # Wilder 平滑
    atr_val = sum(tr_list[:period]) / period
    plus_dm_smooth = sum(plus_dm_list[:period]) / period
    minus_dm_smooth = sum(minus_dm_list[:period]) / period

    plus_di_list = [100 * plus_dm_smooth / atr_val if atr_val else 0]
    minus_di_list = [100 * minus_dm_smooth / atr_val if atr_val else 0]
    dx_list = []

    for i in range(period, len(tr_list)):
        atr_val = (atr_val * (period - 1) + tr_list[i]) / period
        plus_dm_smooth = (plus_dm_smooth * (period - 1) + plus_dm_list[i]) / period
        minus_dm_smooth = (minus_dm_smooth * (period - 1) + minus_dm_list[i]) / period

        plus_di = 100 * plus_dm_smooth / atr_val if atr_val else 0
        minus_di = 100 * minus_dm_smooth / atr_val if atr_val else 0
        plus_di_list.append(plus_di)
        minus_di_list.append(minus_di)

        di_sum = plus_di + minus_di
        dx = 100 * abs(plus_di - minus_di) / di_sum if di_sum else 0
        dx_list.append(dx)

    if len(dx_list) < period:
        return 0.0, plus_di_list[-1] if plus_di_list else 0, minus_di_list[-1] if minus_di_list else 0

    # ADX = DX 的平滑平均
    adx_val = sum(dx_list[:period]) / period
    for i in range(period, len(dx_list)):
        adx_val = (adx_val * (period - 1) + dx_list[i]) / period

    return adx_val, plus_di_list[-1], minus_di_list[-1]


def volume_ratio(volumes: Sequence[float], period: int = 20) -> float:
    """当前成交量与均值比"""
    if len(volumes) < period:
        return 1.0
    avg = sum(volumes[-period:]) / period
    return volumes[-1] / avg if avg > 0 else 1.0


class TrailingStop:
    """移动止损器 - 跟踪最高价，回撤超过阈值则止损

    用法:
        stop = TrailingStop(trail_pct=0.05)
        stop.update(high_price)  # 持仓中持续更新
        if stop.is_stopped(current_price):
            # 触发止损
    """

    def __init__(
        self,
        trail_pct: float = 0.05,       # 回撤百分比止损
        min_profit_pct: float = 0.02,  # 至少盈利 2% 后才启动移动止损
    ):
        self.trail_pct = trail_pct
        self.min_profit_pct = min_profit_pct
        self.peak: float | None = None
        self.entry_price: float | None = None
        self.activated: bool = False

    def start(self, entry_price: float) -> None:
        """持仓建立时调用"""
        self.entry_price = entry_price
        self.peak = entry_price
        self.activated = False

    def update(self, high_price: float) -> None:
        """每根K线的高点更新"""
        if self.peak is None or self.entry_price is None:
            return
        if high_price > self.peak:
            self.peak = high_price
        # 盈利达到阈值后激活
        if not self.activated and self.peak / self.entry_price - 1 >= self.min_profit_pct:
            self.activated = True

    def is_stopped(self, current_price: float) -> bool:
        """是否触发止损"""
        if not self.activated or self.peak is None:
            return False
        drawdown = (self.peak - current_price) / self.peak
        return drawdown >= self.trail_pct

    @property
    def stop_price(self) -> float | None:
        """当前止损价"""
        if not self.activated or self.peak is None:
            return None
        return self.peak * (1 - self.trail_pct)
