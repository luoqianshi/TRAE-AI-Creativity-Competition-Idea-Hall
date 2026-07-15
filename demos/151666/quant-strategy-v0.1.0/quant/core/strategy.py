"""策略基类 - 所有策略继承此类"""
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any

import pandas as pd

from .event import Event, SignalEvent


class Strategy(ABC):
    """策略抽象基类

    子类需实现:
        - on_market(event): 收到行情时计算信号
        - on_fill(event):   收到成交时更新内部状态（可选）
    """

    def __init__(self, **params: Any):
        self.params = params
        self.symbol: str = ""

    @abstractmethod
    def on_market(self, event: Event) -> list[SignalEvent]:
        """处理市场事件，返回信号列表（可为空）"""

    def on_fill(self, event: Event) -> None:
        """处理成交事件（默认空实现）"""

    def warmup(self, data: pd.DataFrame) -> None:
        """策略预热（用历史数据初始化指标，默认空实现）"""
