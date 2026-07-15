"""事件系统 - 事件驱动架构核心"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
from typing import Any


class EventType(str, Enum):
    MARKET = "MARKET"      # 市场数据事件（新K线/Tick）
    NEWS = "NEWS"          # 新闻事件
    SIGNAL = "SIGNAL"      # 策略信号事件
    ORDER = "ORDER"        # 订单事件
    FILL = "FILL"          # 成交事件


class Direction(str, Enum):
    LONG = "LONG"          # 买入/做多
    SHORT = "SHORT"        # 卖出/做空
    EXIT = "EXIT"          # 平仓


class OrderType(str, Enum):
    MARKET = "MKT"         # 市价单
    LIMIT = "LMT"          # 限价单
    STOP = "STP"           # 止损单


@dataclass
class Event:
    """事件基类"""
    timestamp: datetime
    type: EventType = EventType.MARKET

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "timestamp": self.timestamp.isoformat()}


@dataclass
class MarketEvent(Event):
    """市场数据事件 - 新行情到达"""
    symbol: str = ""
    bars: dict[str, Any] = field(default_factory=dict)  # OHLCV 数据

    def __post_init__(self):
        self.type = EventType.MARKET

    def to_dict(self) -> dict[str, Any]:
        d = super().to_dict()
        d.update({"symbol": self.symbol, "bars": self.bars})
        return d


@dataclass
class SignalEvent(Event):
    """策略信号事件"""
    symbol: str = ""
    direction: Direction = Direction.LONG
    strength: float = 1.0   # 信号强度（用于头寸规模）
    stop_price: float | None = None

    def __post_init__(self):
        self.type = EventType.SIGNAL

    def to_dict(self) -> dict[str, Any]:
        d = super().to_dict()
        d.update({
            "symbol": self.symbol,
            "direction": self.direction.value,
            "strength": self.strength,
            "stop_price": self.stop_price,
        })
        return d


@dataclass
class OrderEvent(Event):
    """订单事件"""
    symbol: str = ""
    order_type: OrderType = OrderType.MARKET
    quantity: int = 0        # 正数买入，负数卖出
    limit_price: float | None = None

    def __post_init__(self):
        self.type = EventType.ORDER

    def to_dict(self) -> dict[str, Any]:
        d = super().to_dict()
        d.update({
            "symbol": self.symbol,
            "order_type": self.order_type.value,
            "quantity": self.quantity,
            "limit_price": self.limit_price,
        })
        return d


@dataclass
class FillEvent(Event):
    """成交事件"""
    symbol: str = ""
    quantity: int = 0        # 正数买入，负数卖出
    fill_price: float = 0.0
    commission: float = 0.0
    slippage: float = 0.0
    tax: float = 0.0

    def __post_init__(self):
        self.type = EventType.FILL

    @property
    def cost(self) -> float:
        """成交总成本（不含标的价格）"""
        return self.commission + self.slippage + self.tax

    def to_dict(self) -> dict[str, Any]:
        d = super().to_dict()
        d.update({
            "symbol": self.symbol,
            "quantity": self.quantity,
            "fill_price": self.fill_price,
            "commission": self.commission,
            "slippage": self.slippage,
            "tax": self.tax,
        })
        return d


@dataclass
class NewsEvent(Event):
    """新闻事件 - 新闻到达时触发

    携带当日/当根K线对应的情感分数与新闻条数
    """
    symbol: str = ""
    sentiment_score: float = 0.0    # 当日情感分数 [-1, 1]
    article_count: int = 0          # 新闻条数
    headlines: list[str] = field(default_factory=list)

    def __post_init__(self):
        self.type = EventType.NEWS

    def to_dict(self) -> dict[str, Any]:
        d = super().to_dict()
        d.update({
            "symbol": self.symbol,
            "sentiment_score": self.sentiment_score,
            "article_count": self.article_count,
            "headlines": self.headlines,
        })
        return d
