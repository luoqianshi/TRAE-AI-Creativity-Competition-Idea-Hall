"""执行处理器 - 模拟券商成交撮合"""
from __future__ import annotations
from abc import ABC, abstractmethod
import logging

from .event import FillEvent, OrderEvent
from .portfolio import Portfolio

logger = logging.getLogger(__name__)


class ExecutionHandler(ABC):
    """执行处理器抽象基类"""

    @abstractmethod
    def execute_order(self, event: OrderEvent) -> FillEvent | None:
        """执行订单，返回成交事件"""


class SimulatedExecutionHandler(ExecutionHandler):
    """模拟撮合执行器 - 回测使用

    市价单按当前K线收盘价（含滑点）成交
    """

    def __init__(self, portfolio: Portfolio):
        self.portfolio = portfolio

    def execute_order(self, event: OrderEvent) -> FillEvent | None:
        if event.quantity == 0:
            return None

        # 用订单事件中的最新价（由引擎注入）或取组合中持仓当前价
        ref_price = getattr(event, "ref_price", None)
        if ref_price is None:
            pos = self.portfolio.positions.get(event.symbol)
            ref_price = pos.current_price if pos else 0.0

        if ref_price <= 0:
            logger.warning(f"无法成交 {event.symbol}: 无有效参考价")
            return None

        commission, slippage_cost, tax, fill_price = self.portfolio.calc_costs(
            event.quantity, ref_price
        )

        fill = FillEvent(
            timestamp=event.timestamp,
            symbol=event.symbol,
            quantity=event.quantity,
            fill_price=fill_price,
            commission=commission,
            slippage=slippage_cost,
            tax=tax,
        )
        logger.info(
            f"订单成交 {event.symbol} qty={event.quantity} price={fill_price:.4f} "
            f"commission={commission:.2f} tax={tax:.2f}"
        )
        return fill
