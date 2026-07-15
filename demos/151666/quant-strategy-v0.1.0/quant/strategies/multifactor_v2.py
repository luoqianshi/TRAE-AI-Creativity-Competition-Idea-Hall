"""多因子增强策略 v2 - 在 v1 基础上针对亏损交易特征做精细化优化

基于诊断结果的关键改进：
1. ADX 范围过滤 [15, 40]：>40 视为趋势末端不追，<15 视为震荡不进
2. RSI < 70：避开超买区域
3. 成交量确认：vol_ratio > 0.8（不要求放量，但避免缩量）
4. 移动止损：盈利 > 2% 后激活，回撤 5% 止损
5. 时间止损：持仓 30 天仍无进展退出
6. 入场更严格，但通过 trailing stop 让盈利单跑得更远
"""
from __future__ import annotations
from collections import deque

import pandas as pd

from ..core.event import MarketEvent, SignalEvent, Direction, FillEvent
from ..core.strategy import Strategy
from ..core.indicators import adx, rsi, atr, volume_ratio, TrailingStop
from ..news.aggregator import NewsSentimentAggregator
from ..news.news_provider import NewsArticle


class MultiFactorV2Strategy(Strategy):
    """多因子策略 v2 - 精细化过滤 + 移动止损

    买入条件（同时满足）:
    1. 金叉（短期均线上穿长期均线）
    2. ADX ∈ [adx_min, adx_max]：有趋势但非末端
    3. RSI < rsi_max：不超买
    4. +DI > -DI：多头方向
    5. 新闻情感 > -sentiment_threshold：非强烈负面
    6. 成交量比 > vol_min：不极度缩量

    卖出条件（任一触发）:
    1. 死叉
    2. 强烈负面新闻（panic_threshold）
    3. 移动止损触发（盈利后回撤 > trail_pct）
    4. 时间止损（持仓 > max_holding_days 且未达目标）
    5. RSI > rsi_exit：超买止盈
    """

    def __init__(
        self,
        short_window: int = 5,
        long_window: int = 20,
        # ADX 过滤
        adx_min: float = 15.0,        # 无趋势下限
        adx_max: float = 40.0,        # 趋势末端上限
        adx_period: int = 14,
        # RSI 过滤
        rsi_period: int = 14,
        rsi_max: float = 70.0,        # 超买上限
        rsi_exit: float = 75.0,       # 超买止盈
        # 新闻
        sentiment_threshold: float = 0.3,
        panic_threshold: float = 0.4,
        # 成交量
        vol_period: int = 20,
        vol_min: float = 0.8,
        # 止损
        trail_pct: float = 0.05,      # 移动止损回撤
        min_profit_to_trail: float = 0.02,  # 盈利多少后启动移动止损
        max_holding_days: int = 30,   # 时间止损
        use_vol_filter: bool = True,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.short_window = short_window
        self.long_window = long_window
        self.adx_min = adx_min
        self.adx_max = adx_max
        self.adx_period = adx_period
        self.rsi_period = rsi_period
        self.rsi_max = rsi_max
        self.rsi_exit = rsi_exit
        self.sentiment_threshold = sentiment_threshold
        self.panic_threshold = panic_threshold
        self.vol_period = vol_period
        self.vol_min = vol_min
        self.trail_pct = trail_pct
        self.min_profit_to_trail = min_profit_to_trail
        self.max_holding_days = max_holding_days
        self.use_vol_filter = use_vol_filter

        # 数据缓存
        buf_len = max(long_window, adx_period * 2 + 5, 50)
        self.prices: deque[float] = deque(maxlen=buf_len)
        self.highs: deque[float] = deque(maxlen=buf_len)
        self.lows: deque[float] = deque(maxlen=buf_len)
        self.volumes: deque[float] = deque(maxlen=buf_len)

        self.short_ma: float = 0.0
        self.long_ma: float = 0.0
        self.in_position = False

        # 新闻
        self.current_sentiment: float = 0.0
        self._aggregator: NewsSentimentAggregator | None = None
        self._news_ready = False

        # 止损跟踪
        self._trailing = TrailingStop(trail_pct, min_profit_to_trail)
        self._entry_bar: int = 0
        self._current_bar: int = 0

    def set_news(self, articles: list[NewsArticle]) -> None:
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
            self.volumes.append(float(row.get("volume", 0)))
        self._update_ma()

    def on_fill(self, event: FillEvent) -> None:
        """成交事件 - 记录建仓"""
        if event.quantity > 0:
            # 建仓
            self._trailing.start(event.fill_price)
            self._entry_bar = self._current_bar
        elif event.quantity < 0:
            # 平仓
            self._trailing = TrailingStop(self.trail_pct, self.min_profit_to_trail)

    def on_market(self, event: MarketEvent) -> list[SignalEvent]:
        price = event.bars.get("close", 0.0)
        high = event.bars.get("high", price)
        low = event.bars.get("low", price)
        vol = event.bars.get("volume", 0.0)
        self.prices.append(price)
        self.highs.append(high)
        self.lows.append(low)
        self.volumes.append(vol)
        self._current_bar += 1

        if len(self.prices) < self.long_window:
            return []

        prev_short, prev_long = self.short_ma, self.long_ma
        self._update_ma()

        # 更新情感
        if self._aggregator is not None:
            score, _, _ = self._aggregator.get_sentiment_for_date(event.timestamp)
            self.current_sentiment = score

        signals: list[SignalEvent] = []

        # 持仓中：优先检查止损/止盈
        if self.in_position:
            exit_reason = self._check_exits(event, prev_short, prev_long, price, high)
            if exit_reason:
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
                if self._check_entry_filters(price):
                    strength = self._calc_strength(price)
                    signals.append(SignalEvent(
                        timestamp=event.timestamp,
                        symbol=event.symbol,
                        direction=Direction.LONG,
                        strength=strength,
                    ))
                    self.in_position = True

        return signals

    # =================== 入场过滤 ===================

    def _check_entry_filters(self, price: float) -> bool:
        """多重入场过滤"""
        prices = list(self.prices)
        highs = list(self.highs)
        lows = list(self.lows)
        vols = list(self.volumes)

        # 1. ADX 范围过滤
        adx_val, plus_di, minus_di = adx(highs, lows, prices, self.adx_period)
        if adx_val < self.adx_min:
            return False  # 无趋势
        if adx_val > self.adx_max:
            return False  # 趋势末端

        # 2. +DI > -DI 多头方向
        if plus_di < minus_di:
            return False

        # 3. RSI 不超买
        rsi_val = rsi(prices, self.rsi_period)
        if rsi_val > self.rsi_max:
            return False

        # 4. 新闻情感非强烈负面
        if self._news_ready and self.current_sentiment <= -self.sentiment_threshold:
            return False

        # 5. 成交量不极度缩量
        if self.use_vol_filter:
            vr = volume_ratio(vols, self.vol_period)
            if vr < self.vol_min:
                return False

        # 6. 动量确认：价格站上短均线
        if price <= self.short_ma:
            return False

        return True

    # =================== 出场条件 ===================

    def _check_exits(
        self,
        event: MarketEvent,
        prev_short: float,
        prev_long: float,
        price: float,
        high: float,
    ) -> bool:
        """多重出场检查"""
        # 1. 死叉
        if prev_short >= prev_long and self.short_ma < self.long_ma:
            return True

        prices = list(self.prices)

        # 2. RSI 超买止盈
        rsi_val = rsi(prices, self.rsi_period)
        if rsi_val >= self.rsi_exit:
            return True

        # 3. 新闻恐慌
        if self._news_ready and self.current_sentiment <= -self.panic_threshold:
            return True

        # 4. 移动止损
        self._trailing.update(high)
        if self._trailing.is_stopped(price):
            return True

        # 5. 时间止损
        holding_bars = self._current_bar - self._entry_bar
        if holding_bars >= self.max_holding_days:
            # 仅当未盈利时才时间止损
            entry = self._trailing.entry_price
            if entry is not None and price <= entry:
                return True

        return False

    # =================== 仓位管理 ===================

    def _calc_strength(self, price: float) -> float:
        """根据信号质量调整仓位 [0.4, 1.0]"""
        strength = 0.5

        # 新闻正面加成
        if self._news_ready and self.current_sentiment > 0:
            strength += 0.15 * min(1.0, self.current_sentiment / 0.5)

        # 动量强度加成
        if self.long_ma > 0:
            momentum = (self.short_ma - self.long_ma) / self.long_ma
            strength += 0.2 * min(1.0, momentum / 0.03)

        # ADX 适中加成（趋势质量好）
        _, _, _ = 0, 0, 0
        adx_val, _, _ = adx(list(self.highs), list(self.lows), list(self.prices), self.adx_period)
        if 20 <= adx_val <= 35:
            strength += 0.15

        return max(0.4, min(1.0, strength))

    def _update_ma(self) -> None:
        prices = list(self.prices)
        n_short = min(self.short_window, len(prices))
        n_long = min(self.long_window, len(prices))
        self.short_ma = sum(prices[-n_short:]) / n_short if n_short else 0.0
        self.long_ma = sum(prices[-n_long:]) / n_long if n_long else 0.0
