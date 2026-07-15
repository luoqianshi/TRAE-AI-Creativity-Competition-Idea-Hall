"""组合管理 - 持仓、现金、净值跟踪"""
from __future__ import annotations
from datetime import datetime
from dataclasses import dataclass, field
import logging

import pandas as pd

from .event import FillEvent, MarketEvent

logger = logging.getLogger(__name__)


@dataclass
class Position:
    """单个持仓"""
    symbol: str
    quantity: int = 0        # 持仓数量（正数多头，负数空头）
    avg_price: float = 0.0   # 持仓均价
    current_price: float = 0.0

    @property
    def market_value(self) -> float:
        return self.quantity * self.current_price

    def update_on_fill(self, fill_qty: int, fill_price: float):
        """成交后更新持仓"""
        old_qty = self.quantity
        new_qty = old_qty + fill_qty

        if old_qty == 0:
            # 新建仓
            self.avg_price = fill_price
        elif (old_qty > 0 and fill_qty > 0) or (old_qty < 0 and fill_qty < 0):
            # 加仓 - 更新均价
            total_cost = old_qty * self.avg_price + fill_qty * fill_price
            self.avg_price = total_cost / new_qty if new_qty != 0 else 0.0
        # 减仓不改变均价

        self.quantity = new_qty
        self.current_price = fill_price


@dataclass
class Portfolio:
    """组合管理 - 现金/持仓/净值记录

    Args:
        initial_capital: 初始资金
        commission_rate: 佣金费率（双边）
        slippage_rate:   滑点费率
        stamp_tax_rate:  印花税率（仅卖出，港股适用）
    """
    initial_capital: float
    commission_rate: float = 0.0005
    slippage_rate: float = 0.001
    stamp_tax_rate: float = 0.001
    min_commission: float = 1.0  # 最小佣金

    # 运行时状态
    cash: float = field(init=False)
    positions: dict[str, Position] = field(default_factory=dict)
    equity_curve: list[dict] = field(default_factory=list)
    trades: list[dict] = field(default_factory=list)

    def __post_init__(self):
        self.cash = self.initial_capital

    def update_on_market(self, event: MarketEvent) -> None:
        """行情更新后刷新持仓市值并记录权益"""
        symbol = event.symbol
        price = event.bars.get("close", 0.0)
        if symbol not in self.positions:
            self.positions[symbol] = Position(symbol=symbol)
        self.positions[symbol].current_price = price

        total_value = self.cash + self.total_market_value
        self.equity_curve.append({
            "datetime": event.timestamp,
            "cash": self.cash,
            "market_value": self.total_market_value,
            "total": total_value,
            "price": price,
        })

    def process_fill(self, event: FillEvent) -> None:
        """处理成交事件"""
        symbol = event.symbol
        if symbol not in self.positions:
            self.positions[symbol] = Position(symbol=symbol)

        pos = self.positions[symbol]
        fill_value = event.quantity * event.fill_price

        # 现金变动（买入减现金，卖出加现金）
        self.cash -= fill_value
        # 扣除费用
        self.cash -= (event.commission + event.tax)

        pos.update_on_fill(event.quantity, event.fill_price)

        trade_record = {
            "datetime": event.timestamp,
            "symbol": symbol,
            "quantity": event.quantity,
            "fill_price": event.fill_price,
            "commission": event.commission,
            "tax": event.tax,
            "cash_after": self.cash,
        }
        self.trades.append(trade_record)
        logger.debug(
            f"成交 {symbol} {'买入' if event.quantity>0 else '卖出'} {abs(event.quantity)}@{event.fill_price:.2f} "
            f"佣金={event.commission:.2f} 税={event.tax:.2f} 现金={self.cash:.2f}"
        )

    def calc_costs(self, quantity: int, price: float) -> tuple[float, float, float, float]:
        """计算成交费用: (commission, slippage_cost, tax, fill_price)"""
        trade_value = abs(quantity * price)
        # 滑点：买入价上浮，卖出价下浮
        if quantity > 0:
            fill_price = price * (1 + self.slippage_rate)
        else:
            fill_price = price * (1 - self.slippage_rate)

        commission = max(trade_value * self.commission_rate, self.min_commission)
        # 印花税仅卖出（港股）
        tax = trade_value * self.stamp_tax_rate if quantity < 0 else 0.0
        slippage_cost = abs(quantity) * abs(fill_price - price)
        return commission, slippage_cost, tax, fill_price

    @property
    def total_market_value(self) -> float:
        return sum(p.market_value for p in self.positions.values())

    @property
    def total_equity(self) -> float:
        return self.cash + self.total_market_value

    @property
    def equity_df(self) -> pd.DataFrame:
        if not self.equity_curve:
            return pd.DataFrame()
        df = pd.DataFrame(self.equity_curve)
        df["datetime"] = pd.to_datetime(df["datetime"])
        df["return"] = df["total"].pct_change().fillna(0)
        df["cum_return"] = df["total"] / self.initial_capital - 1
        return df

    @property
    def trades_df(self) -> pd.DataFrame:
        if not self.trades:
            return pd.DataFrame()
        return pd.DataFrame(self.trades)
