"""回测引擎 - 事件驱动主循环"""
from __future__ import annotations
import logging
from collections import deque
from dataclasses import dataclass, field

from .event import (
    Event, EventType, MarketEvent, SignalEvent, OrderEvent, FillEvent,
    Direction, OrderType,
)
from .data_handler import DataHandler
from .strategy import Strategy
from .portfolio import Portfolio
from .execution import SimulatedExecutionHandler

logger = logging.getLogger(__name__)


@dataclass
class BacktestResult:
    """回测结果"""
    equity_curve: object          # pd.DataFrame
    trades: object                # pd.DataFrame
    final_equity: float
    initial_capital: float
    total_return: float
    statistics: dict = field(default_factory=dict)


class BacktestEngine:
    """事件驱动回测引擎

    事件流转: Market -> Signal -> Order -> Fill -> Portfolio

    示例:
        engine = BacktestEngine(data_handler, strategy, portfolio)
        result = engine.run()
    """

    def __init__(
        self,
        data_handler: DataHandler,
        strategy: Strategy,
        portfolio: Portfolio,
        execution: SimulatedExecutionHandler | None = None,
        warmup_bars: int = 0,
    ):
        self.data_handler = data_handler
        self.strategy = strategy
        self.portfolio = portfolio
        self.execution = execution or SimulatedExecutionHandler(portfolio)
        self.warmup_bars = warmup_bars

        self.events: deque[Event] = deque()
        self._symbol = data_handler.symbol
        self.strategy.symbol = self._symbol

        # 统计
        self.signals_count = 0
        self.orders_count = 0
        self.fills_count = 0

    def run(self) -> BacktestResult:
        """执行回测主循环"""
        logger.info(
            f"开始回测 symbol={self._symbol} 初始资金={self.portfolio.initial_capital:.2f} "
            f"佣金率={self.portfolio.commission_rate} 滑点={self.portfolio.slippage_rate}"
        )

        # 策略预热
        if self.warmup_bars > 0:
            warmup_data = self.data_handler.get_all_bars(self._symbol).head(self.warmup_bars)
            self.strategy.warmup(warmup_data)
            logger.info(f"策略预热完成 {len(warmup_data)} 根K线")

        bar_count = 0
        while True:
            # 1. 推进行情
            market_event = self.data_handler.update_bars()
            if market_event is None:
                break
            self.events.append(market_event)
            bar_count += 1

            # 2. 处理事件队列
            self._process_events()

        # 收尾：处理剩余事件
        self._process_events()

        logger.info(
            f"回测完成 K线={bar_count} 信号={self.signals_count} "
            f"订单={self.orders_count} 成交={self.fills_count} "
            f"最终净值={self.portfolio.total_equity:.2f}"
        )

        from .performance import PerformanceAnalyzer
        analyzer = PerformanceAnalyzer(self.portfolio)
        stats = analyzer.analyze()

        return BacktestResult(
            equity_curve=self.portfolio.equity_df,
            trades=self.portfolio.trades_df,
            final_equity=self.portfolio.total_equity,
            initial_capital=self.portfolio.initial_capital,
            total_return=self.portfolio.total_equity / self.portfolio.initial_capital - 1,
            statistics=stats,
        )

    def _process_events(self) -> None:
        """处理事件队列直到清空"""
        while self.events:
            event = self.events.popleft()
            if event.type == EventType.MARKET:
                self._on_market(event)
            elif event.type == EventType.SIGNAL:
                self._on_signal(event)
            elif event.type == EventType.ORDER:
                self._on_order(event)
            elif event.type == EventType.FILL:
                self._on_fill(event)

    def _on_market(self, event: MarketEvent) -> None:
        """行情事件 -> 组合更新 + 策略计算信号"""
        self.portfolio.update_on_market(event)
        signals = self.strategy.on_market(event)
        for sig in signals:
            sig.timestamp = event.timestamp
            self.signals_count += 1
            self.events.append(sig)

    def _on_signal(self, event: SignalEvent) -> None:
        """信号事件 -> 风控/头寸管理 -> 生成订单"""
        order = self._signal_to_order(event)
        if order is not None:
            self.orders_count += 1
            self.events.append(order)

    def _on_order(self, event: OrderEvent) -> None:
        """订单事件 -> 执行撮合 -> 成交事件"""
        # 注入最新参考价（当前K线收盘价）
        event.ref_price = self.portfolio.positions[event.symbol].current_price  # type: ignore[attr-defined]
        fill = self.execution.execute_order(event)
        if fill is not None:
            self.fills_count += 1
            self.events.append(fill)

    def _on_fill(self, event: FillEvent) -> None:
        """成交事件 -> 更新组合 + 通知策略"""
        self.portfolio.process_fill(event)
        self.strategy.on_fill(event)

    def _signal_to_order(self, signal: SignalEvent) -> OrderEvent | None:
        """信号转订单 - 基于固定比例的资金管理"""
        symbol = signal.symbol
        pos = self.portfolio.positions.get(symbol)
        current_qty = pos.quantity if pos else 0
        price = pos.current_price if pos else 0.0

        if price <= 0:
            return None

        # 用总权益的固定比例计算目标仓位
        target_value = self.portfolio.total_equity * signal.strength * 0.5
        target_qty = int(target_value / price)

        if signal.direction == Direction.LONG:
            # 买入至目标仓位（差额下单）
            order_qty = target_qty - current_qty
        elif signal.direction == Direction.EXIT:
            order_qty = -current_qty
        else:
            return None

        if order_qty == 0:
            return None

        return OrderEvent(
            timestamp=signal.timestamp,
            symbol=symbol,
            order_type=OrderType.MARKET,
            quantity=order_qty,
        )
