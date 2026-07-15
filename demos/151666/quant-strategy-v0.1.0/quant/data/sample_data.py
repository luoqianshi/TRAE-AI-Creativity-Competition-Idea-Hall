"""测试数据生成器 - 生成带真实市场特征的模拟行情

特征：
1. Regime switching（牛/熊/震荡切换）
2. 动量效应（趋势持续，自相关）
3. 波动率聚类（GARCH-like）
4. 不同标的有不同特性（波动率、趋势强度）
"""
from __future__ import annotations
from datetime import datetime, timedelta

import numpy as np
import pandas as pd


# 不同标的的市场特性（年化）
SYMBOL_PROFILES = {
    "AAPL":  {"price": 150.0, "vol": 0.25, "trend": 0.15, "momentum": 0.15},
    "MSFT":  {"price": 300.0, "vol": 0.22, "trend": 0.18, "momentum": 0.18},
    "GOOGL": {"price": 120.0, "vol": 0.28, "trend": 0.12, "momentum": 0.12},
    "TSLA":  {"price": 200.0, "vol": 0.55, "trend": 0.05, "momentum": 0.25},
    "AMZN":  {"price": 130.0, "vol": 0.32, "trend": 0.10, "momentum": 0.15},
    "META":  {"price": 250.0, "vol": 0.35, "trend": 0.14, "momentum": 0.20},
    "NVDA":  {"price": 400.0, "vol": 0.45, "trend": 0.30, "momentum": 0.25},
    "NFLX":  {"price": 350.0, "vol": 0.40, "trend": 0.08, "momentum": 0.18},
}


def generate_sample_data(
    symbol: str = "AAPL",
    start_date: str = "2023-01-01",
    days: int = 500,
    initial_price: float | None = None,
    seed: int | None = 42,
) -> pd.DataFrame:
    """生成带真实市场特征的模拟K线数据

    数据特征：
    - Regime switching：牛/熊/震荡市场切换（趋势跟踪策略需在趋势市场中才有用）
    - 动量效应：昨日收益对今日有正向影响（让趋势跟踪策略可盈利）
    - 波动率聚类：高波动后倾向高波动（GARCH-like）
    - 标的差异化：不同 symbol 有不同波动率和趋势强度

    Args:
        symbol:        标的代码（决定初始价格、波动率、趋势强度）
        start_date:    起始日期
        days:          交易日天数
        initial_price: 初始价格（None=按 symbol 自动选择）
        seed:          随机种子基础值（会与 symbol 组合，保证可复现）
    """
    profile = SYMBOL_PROFILES.get(symbol.upper(), {
        "price": 100.0, "vol": 0.30, "trend": 0.10, "momentum": 0.15,
    })
    if initial_price is None:
        initial_price = profile["price"]

    # 基于 symbol 调整种子
    if seed is not None:
        symbol_hash = sum(ord(c) for c in symbol)
        np.random.seed(seed + symbol_hash)

    # 生成交易日（跳过周末）
    dates = []
    current = datetime.strptime(start_date, "%Y-%m-%d")
    while len(dates) < days:
        if current.weekday() < 5:
            dates.append(current)
        current += timedelta(days=1)

    # === 1. Regime switching：牛/熊/震荡 ===
    # 每个 regime 持续 30-90 天，不同 regime 有不同的漂移
    regimes = []
    regime_drift = {"bull": 0.0015, "bear": -0.0012, "range": 0.0001}
    regime_vol_mult = {"bull": 0.8, "bear": 1.3, "range": 0.9}
    regime_types = list(regime_drift.keys())

    i = 0
    while i < days:
        # 随机选择 regime，长度 30-90 天
        rtype = np.random.choice(regime_types, p=[0.4, 0.25, 0.35])
        rlen = int(np.random.uniform(30, 90))
        rlen = min(rlen, days - i)
        regimes.extend([(rtype, regime_drift[rtype], regime_vol_mult[rtype])] * rlen)
        i += rlen

    # === 2. 动量效应 + 波动率聚类 ===
    daily_vol = profile["vol"] / np.sqrt(252)  # 日波动率
    momentum_strength = profile["momentum"]    # 动量自相关系数
    base_drift = profile["trend"] / 252        # 年化趋势转日

    returns = np.zeros(days)
    vol_series = np.zeros(days)
    vol_series[0] = daily_vol

    # GARCH(1,1) 参数
    omega = daily_vol ** 2 * 0.05
    alpha = 0.10  # 昨日波动的影响
    beta = 0.85   # 波动率持续性

    prev_ret = 0.0
    for t in range(days):
        rtype, regime_d, vol_m = regimes[t]

        # GARCH 波动率
        if t > 0:
            vol_series[t] = np.sqrt(
                omega + alpha * returns[t-1]**2 + beta * vol_series[t-1]**2
            )
        vol_t = vol_series[t] * vol_m

        # 漂移 = 基础趋势 + regime 漂移 + 动量延续
        drift = base_drift + regime_d + momentum_strength * prev_ret

        # 日收益
        ret = drift + vol_t * np.random.standard_normal()
        returns[t] = ret
        prev_ret = ret

    prices = initial_price * np.cumprod(1 + returns)

    # === 3. 构造 OHLCV ===
    data = []
    for i, date in enumerate(dates):
        close = float(prices[i])
        open_ = float(prices[i - 1] if i > 0 else initial_price)
        # 日内波动 ~ 日波动率的 60-100%
        intraday = vol_series[i] * np.random.uniform(0.6, 1.0)
        high = max(open_, close) * (1 + abs(np.random.normal(0, intraday * 0.5)))
        low = min(open_, close) * (1 - abs(np.random.normal(0, intraday * 0.5)))
        # 检查 high >= close >= low
        high = max(high, close, open_)
        low = min(low, close, open_)
        volume = int(np.random.lognormal(mean=15, sigma=0.5))

        data.append({
            "datetime": date,
            "open": round(open_, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close, 2),
            "volume": volume,
        })

    df = pd.DataFrame(data)
    import logging
    logging.getLogger(__name__).info(
        f"生成 {symbol} 模拟数据 {len(df)} 根K线 "
        f"[{df['datetime'].iloc[0].date()} ~ {df['datetime'].iloc[-1].date()}] "
        f"vol={profile['vol']:.2f} trend={profile['trend']:.2f}"
    )
    return df


def save_sample_csv(symbol: str = "AAPL", path: str | None = None, **kwargs) -> str:
    """生成并保存模拟数据为 CSV"""
    from config import DATA_DIR
    df = generate_sample_data(symbol=symbol, **kwargs)
    path = path or str(DATA_DIR / f"{symbol}_sample.csv")
    df.to_csv(path, index=False)
    return path
