"""数据处理器 - 行情数据获取与回测数据供给"""
from __future__ import annotations
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
import logging

import pandas as pd

from .event import MarketEvent

logger = logging.getLogger(__name__)


class DataHandler(ABC):
    """数据处理器抽象基类 - 提供逐K线数据流"""

    @abstractmethod
    def get_latest_bars(self, symbol: str, n: int = 1) -> pd.DataFrame:
        """获取最近 n 根K线"""

    @abstractmethod
    def update_bars(self) -> MarketEvent | None:
        """推进一根K线，返回市场事件（无数据返回None）"""

    @abstractmethod
    def get_all_bars(self, symbol: str) -> pd.DataFrame:
        """获取全部K线数据（用于策略预热指标）"""


class CSVDataHandler(DataHandler):
    """CSV 数据处理器 - 从本地 CSV 文件加载历史数据回测"""

    def __init__(
        self,
        csv_path: str | Path,
        symbol: str,
        start_date: str | None = None,
        end_date: str | None = None,
    ):
        self.symbol = symbol
        self.csv_path = Path(csv_path)
        self._load_data(start_date, end_date)
        self._index = 0
        self._current_bar: dict | None = None

    def _load_data(self, start_date: str | None, end_date: str | None):
        if not self.csv_path.exists():
            raise FileNotFoundError(f"CSV 数据文件不存在: {self.csv_path}")

        df = pd.read_csv(self.csv_path)
        # 兼容常见列名
        col_map = {
            "date": "datetime", "time": "datetime", "timestamp": "datetime",
            "Date": "datetime", "Time": "datetime",
        }
        df = df.rename(columns=col_map)
        if "datetime" not in df.columns:
            df.columns = [c.lower() for c in df.columns]
            if "datetime" not in df.columns:
                raise ValueError("CSV 必须包含 date/time/timestamp 列")

        df["datetime"] = pd.to_datetime(df["datetime"])
        df = df.sort_values("datetime").reset_index(drop=True)

        # 规范化列名为小写
        df.columns = [c.lower() for c in df.columns]

        # 日期过滤
        if start_date:
            df = df[df["datetime"] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df["datetime"] <= pd.to_datetime(end_date)]

        required = ["open", "high", "low", "close", "volume"]
        missing = [c for c in required if c not in df.columns]
        if missing:
            raise ValueError(f"CSV 缺少必要列: {missing}")

        self.data = df.reset_index(drop=True)
        self.symbols = [self.symbol]
        logger.info(f"加载 {self.symbol} 数据 {len(self.data)} 根K线 [{self.data['datetime'].iloc[0]} ~ {self.data['datetime'].iloc[-1]}]")

    def get_latest_bars(self, symbol: str, n: int = 1) -> pd.DataFrame:
        end = self._index  # 当前已"到达"的位置（不含）
        start = max(0, end - n)
        return self.data.iloc[start:end].copy()

    def update_bars(self) -> MarketEvent | None:
        if self._index >= len(self.data):
            return None
        row = self.data.iloc[self._index]
        self._current_bar = row.to_dict()
        self._index += 1
        bars = {
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
            "volume": float(row["volume"]),
        }
        return MarketEvent(
            timestamp=row["datetime"].to_pydatetime() if hasattr(row["datetime"], "to_pydatetime") else pd.Timestamp(row["datetime"]).to_pydatetime(),
            symbol=self.symbol,
            bars=bars,
        )

    def get_all_bars(self, symbol: str) -> pd.DataFrame:
        return self.data.copy()

    @property
    def progress(self) -> float:
        return min(1.0, self._index / len(self.data)) if len(self.data) else 0.0


class DataFrameDataHandler(DataHandler):
    """DataFrame 数据处理器 - 直接使用内存中的 DataFrame"""

    def __init__(self, df: pd.DataFrame, symbol: str):
        df = df.copy()
        df.columns = [c.lower() for c in df.columns]
        if "datetime" not in df.columns:
            df["datetime"] = pd.to_datetime(df.index)
        df["datetime"] = pd.to_datetime(df["datetime"])
        df = df.sort_values("datetime").reset_index(drop=True)
        self.data = df
        self.symbol = symbol
        self.symbols = [symbol]
        self._index = 0

    def get_latest_bars(self, symbol: str, n: int = 1) -> pd.DataFrame:
        end = self._index
        start = max(0, end - n)
        return self.data.iloc[start:end].copy()

    def update_bars(self) -> MarketEvent | None:
        if self._index >= len(self.data):
            return None
        row = self.data.iloc[self._index]
        self._index += 1
        bars = {
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
            "volume": float(row["volume"]),
        }
        ts = row["datetime"]
        ts = ts.to_pydatetime() if hasattr(ts, "to_pydatetime") else pd.Timestamp(ts).to_pydatetime()
        return MarketEvent(timestamp=ts, symbol=self.symbol, bars=bars)

    def get_all_bars(self, symbol: str) -> pd.DataFrame:
        return self.data.copy()

    @property
    def progress(self) -> float:
        return min(1.0, self._index / len(self.data)) if len(self.data) else 0.0
