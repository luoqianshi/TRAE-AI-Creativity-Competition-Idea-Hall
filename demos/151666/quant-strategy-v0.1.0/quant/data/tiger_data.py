"""老虎证券 OpenAPI 数据接入

文档: https://www.tigerbrokers.com/openapi/info
需要配置 .env 中的 TIGER_ACCOUNT_ID / TIGER_ACCESS_TOKEN / TIGER_SECRET_KEY
"""
from __future__ import annotations
import logging
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd

from config import settings

logger = logging.getLogger(__name__)


class TigerDataProvider:
    """老虎证券行情数据提供者"""

    def __init__(self):
        self._client = None
        self._initialized = False

    def _init_client(self):
        """初始化 Tiger API 客户端"""
        if self._initialized:
            return
        try:
            from tigeropen.tiger_open_api import TigerOpenClient
            from tigeropen.tiger_open_api_config import TigerOpenApiConfig

            if not settings.tiger_account_id or not settings.tiger_access_token:
                logger.warning("Tiger API 凭证未配置，将无法获取真实行情")
                self._initialized = True
                return

            config = TigerOpenApiConfig(
                account_id=settings.tiger_account_id,
                access_token=settings.tiger_access_token,
                secret_key=settings.tiger_secret_key,
                paper_trading=settings.tiger_paper_account,
            )
            self._client = TigerOpenClient(config)
            self._initialized = True
            logger.info("Tiger API 客户端初始化成功 (模拟账户=%s)", settings.tiger_paper_account)
        except ImportError:
            logger.warning("tigeropen 未安装，运行: pip install tigeropen")
        except Exception as e:
            logger.error(f"Tiger API 初始化失败: {e}")

    def get_kline(
        self,
        symbol: str,
        period: str = "daily",
        start_date: str | None = None,
        end_date: str | None = None,
        count: int = 200,
    ) -> pd.DataFrame:
        """获取K线数据

        Args:
            symbol:    标的代码（美股如 AAPL，港股如 00700）
            period:    周期 daily/weekly/monthly 或分钟级 1m/5m/15m/60m
            start_date: 起始日期 YYYY-MM-DD
            end_date:   结束日期 YYYY-MM-DD
            count:     K线数量
        """
        self._init_client()
        if self._client is None:
            raise RuntimeError(
                "Tiger API 未就绪，请检查 .env 配置或安装 tigeropen。"
                "可使用 generate_sample_data() 生成测试数据。"
            )

        try:
            from tigeropen.quote.quote_client import QuoteClient
            from tigeropen.common.consts import BarPeriod

            period_map = {
                "daily": BarPeriod.DAY,
                "weekly": BarPeriod.WEEK,
                "monthly": BarPeriod.MONTH,
                "1m": BarPeriod.ONE_MINUTE,
                "5m": BarPeriod.FIVE_MINUTES,
                "15m": BarPeriod.FIFTEEN_MINUTES,
                "60m": BarPeriod.SIXTY_MINUTES,
            }
            bar_period = period_map.get(period, BarPeriod.DAY)

            quote_client = QuoteClient(self._client.config)
            bars = quote_client.get_bars(
                symbol=symbol,
                period=bar_period,
                count=count,
                begin_time=start_date.replace("-", "") if start_date else None,
                end_time=end_date.replace("-", "") if end_date else None,
            )
            df = self._normalize(bars)
            logger.info(f"获取 {symbol} K线 {len(df)} 根")
            return df
        except Exception as e:
            logger.error(f"获取K线失败: {e}")
            raise

    @staticmethod
    def _normalize(bars) -> pd.DataFrame:
        """规范化K线数据为统一格式"""
        if isinstance(bars, pd.DataFrame):
            df = bars.copy()
        else:
            df = pd.DataFrame(bars)

        # 兼容 Tiger 返回的列名
        col_map = {
            "time": "datetime", "date": "datetime",
            "open": "open", "high": "high", "low": "low",
            "close": "close", "volume": "volume",
        }
        df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})
        df.columns = [c.lower() for c in df.columns]

        if "datetime" not in df.columns and df.index.name in ("time", "date"):
            df["datetime"] = df.index

        df["datetime"] = pd.to_datetime(df["datetime"], unit="ms", errors="ignore")
        df["datetime"] = pd.to_datetime(df["datetime"])
        df = df[["datetime", "open", "high", "low", "close", "volume"]].copy()
        df = df.sort_values("datetime").reset_index(drop=True)
        return df


# 单例
tiger_provider = TigerDataProvider()
