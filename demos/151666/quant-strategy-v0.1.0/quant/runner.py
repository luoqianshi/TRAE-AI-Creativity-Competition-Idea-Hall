"""回测运行器 - 统一入口，组装数据+策略+引擎"""
from __future__ import annotations
import logging
from typing import Any

import pandas as pd

from .core.data_handler import CSVDataHandler, DataFrameDataHandler
from .core.engine import BacktestEngine, BacktestResult
from .core.portfolio import Portfolio
from .core.strategy import Strategy
from .strategies import MovingAverageCrossStrategy, RSIStrategy
from .strategies.news_enhanced import NewsEnhancedMAStrategy
from .strategies.multifactor import MultiFactorStrategy
from .strategies.multifactor_v2 import MultiFactorV2Strategy
from .strategies.multifactor_v3 import MultiFactorV3Strategy
from .strategies.multifactor_v4 import MultiFactorV4Strategy
from .data import generate_sample_data, tiger_provider
from .news.news_provider import MockNewsProvider, NewsProvider
from config import settings

logger = logging.getLogger(__name__)

# 策略注册表
STRATEGY_REGISTRY: dict[str, type[Strategy]] = {
    "ma_cross": MovingAverageCrossStrategy,
    "rsi": RSIStrategy,
    "news_ma": NewsEnhancedMAStrategy,
    "multifactor": MultiFactorStrategy,
    "multifactor_v2": MultiFactorV2Strategy,
    "multifactor_v3": MultiFactorV3Strategy,
    "multifactor_v4": MultiFactorV4Strategy,
}


def get_strategy(name: str, **params: Any) -> Strategy:
    """根据名称创建策略实例"""
    cls = STRATEGY_REGISTRY.get(name)
    if cls is None:
        raise ValueError(f"未知策略: {name}，可选: {list(STRATEGY_REGISTRY)}")
    return cls(**params)


def run_backtest(
    symbol: str,
    strategy_name: str = "ma_cross",
    strategy_params: dict | None = None,
    data_source: str = "sample",          # sample / tiger / csv
    csv_path: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    initial_capital: float | None = None,
    commission: float | None = None,
    slippage: float | None = None,
    stamp_tax: float | None = None,
    warmup_bars: int = 50,
    period: str = "daily",
    news_provider: NewsProvider | None = None,
    company_name: str | None = None,
) -> BacktestResult:
    """执行回测

    Args:
        symbol:          标的代码
        strategy_name:   策略名称（见 STRATEGY_REGISTRY）
        strategy_params: 策略参数
        data_source:     数据来源 sample/tiger/csv
        csv_path:        CSV 文件路径（data_source=csv 时）
        start_date:      起始日期
        end_date:        结束日期
        initial_capital: 初始资金
        commission:      佣金费率
        slippage:        滑点费率
        stamp_tax:       印花税率
        warmup_bars:     策略预热K线数
        period:          K线周期（tiger 数据源）
        news_provider:   新闻提供者（新闻增强策略用）
        company_name:    公司名称（生成新闻标题用）
    """
    strategy_params = strategy_params or {}
    strategy = get_strategy(strategy_name, **strategy_params)

    # 加载数据
    if data_source == "csv" and csv_path:
        data_handler = CSVDataHandler(csv_path, symbol, start_date, end_date)
    elif data_source == "tiger":
        df = tiger_provider.get_kline(symbol, period=period, start_date=start_date, end_date=end_date)
        data_handler = DataFrameDataHandler(df, symbol)
    else:
        df = generate_sample_data(symbol=symbol, start_date=start_date or "2023-01-01")
        if end_date:
            df = df[df["datetime"] <= pd.to_datetime(end_date)]
        data_handler = DataFrameDataHandler(df, symbol)

    # 新闻增强策略：生成并注入新闻数据
    if strategy_name in ("news_ma", "multifactor", "multifactor_v2", "multifactor_v3", "multifactor_v4"):
        all_data = data_handler.get_all_bars(symbol)
        if not all_data.empty:
            price_series = all_data.set_index("datetime")["close"]
            s_date = str(all_data["datetime"].iloc[0].date())
            e_date = str(all_data["datetime"].iloc[-1].date())
            if news_provider is None:
                news_provider = MockNewsProvider(
                    company_name=company_name or symbol,
                    seed=42,
                )
            articles = news_provider.get_news(
                symbol=symbol,
                start_date=s_date,
                end_date=e_date,
                price_series=price_series,
            )
            if hasattr(strategy, "set_news"):
                strategy.set_news(articles)  # type: ignore[attr-defined]

    # 组合
    portfolio = Portfolio(
        initial_capital=initial_capital or settings.default_initial_capital,
        commission_rate=commission if commission is not None else settings.default_commission,
        slippage_rate=slippage if slippage is not None else settings.default_slippage,
        stamp_tax_rate=stamp_tax if stamp_tax is not None else settings.default_stamp_tax,
    )

    # 引擎
    engine = BacktestEngine(
        data_handler=data_handler,
        strategy=strategy,
        portfolio=portfolio,
        warmup_bars=warmup_bars,
    )
    return engine.run()


def result_to_dict(result: BacktestResult) -> dict:
    """将回测结果转为可序列化字典"""
    equity = result.equity_curve
    trades = result.trades
    return {
        "statistics": result.statistics,
        "final_equity": result.final_equity,
        "initial_capital": result.initial_capital,
        "total_return": result.total_return,
        "equity_curve": equity.to_dict(orient="records") if not equity.empty else [],
        "trades": trades.to_dict(orient="records") if not trades.empty else [],
    }
