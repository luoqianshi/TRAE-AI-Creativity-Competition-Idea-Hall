"""绩效分析器 - 回测统计指标计算"""
from __future__ import annotations
import numpy as np
import pandas as pd

from .portfolio import Portfolio

# 年化系数：美股 252 交易日，港股 250 交易日
TRADING_DAYS = 252


class PerformanceAnalyzer:
    """回测绩效分析"""

    def __init__(self, portfolio: Portfolio, trading_days: int = TRADING_DAYS):
        self.portfolio = portfolio
        self.trading_days = trading_days

    def analyze(self) -> dict:
        equity = self.portfolio.equity_df
        trades = self.portfolio.trades_df
        if equity.empty:
            return {}

        stats = {}
        stats["initial_capital"] = self.portfolio.initial_capital
        stats["final_equity"] = self.portfolio.total_equity
        stats["total_return"] = stats["final_equity"] / stats["initial_capital"] - 1

        # 日收益率
        returns = equity["return"].values
        stats["annual_return"] = self._annualized_return(returns)
        stats["annual_volatility"] = self._annualized_volatility(returns)
        stats["sharpe_ratio"] = self._sharpe_ratio(returns)
        stats["sortino_ratio"] = self._sortino_ratio(returns)
        stats["max_drawdown"] = self._max_drawdown(equity["total"].values)
        stats["calmar_ratio"] = self._calmar_ratio(returns, stats["max_drawdown"])

        # 胜率与盈亏比
        if not trades.empty:
            stats.update(self._trade_stats(trades))

        stats["trading_days"] = len(equity)
        stats["total_trades"] = len(trades)
        return stats

    def _annualized_return(self, returns: np.ndarray) -> float:
        if len(returns) == 0:
            return 0.0
        cum = np.prod(1 + returns) - 1
        n = len(returns)
        if n < self.trading_days:
            return cum  # 数据不足一年直接返回累计
        return (1 + cum) ** (self.trading_days / n) - 1

    def _annualized_volatility(self, returns: np.ndarray) -> float:
        if len(returns) < 2:
            return 0.0
        return float(np.std(returns, ddof=1) * np.sqrt(self.trading_days))

    def _sharpe_ratio(self, returns: np.ndarray, rf: float = 0.0) -> float:
        vol = self._annualized_volatility(returns)
        if vol == 0:
            return 0.0
        ann_ret = self._annualized_return(returns)
        return (ann_ret - rf) / vol

    def _sortino_ratio(self, returns: np.ndarray, rf: float = 0.0) -> float:
        if len(returns) < 2:
            return 0.0
        downside = returns[returns < 0]
        if len(downside) == 0:
            return 0.0
        downside_vol = np.std(downside, ddof=1) * np.sqrt(self.trading_days)
        if downside_vol == 0:
            return 0.0
        ann_ret = self._annualized_return(returns)
        return (ann_ret - rf) / downside_vol

    def _max_drawdown(self, equity: np.ndarray) -> float:
        if len(equity) == 0:
            return 0.0
        running_max = np.maximum.accumulate(equity)
        drawdown = (equity - running_max) / running_max
        return float(np.min(drawdown))

    def _calmar_ratio(self, returns: np.ndarray, max_dd: float) -> float:
        if max_dd == 0:
            return 0.0
        ann_ret = self._annualized_return(returns)
        return ann_ret / abs(max_dd)

    def _trade_stats(self, trades: pd.DataFrame) -> dict:
        """交易统计 - 按同标的连续配对计算盈亏"""
        profits = []
        for symbol in trades["symbol"].unique():
            sym_trades = trades[trades["symbol"] == symbol].reset_index(drop=True)
            # 简化：按每笔成交的持仓变化近似计算已实现盈亏
            position = 0
            cost = 0.0
            for _, row in sym_trades.iterrows():
                qty = row["quantity"]
                price = row["fill_price"]
                if position == 0:
                    position = qty
                    cost = qty * price
                elif (position > 0 and qty < 0) or (position < 0 and qty > 0):
                    # 减仓 - 计算已实现盈亏
                    closed_qty = min(abs(qty), abs(position))
                    if position > 0:
                        pnl = (price - cost / position) * closed_qty - row["commission"] - row["tax"]
                    else:
                        pnl = (cost / abs(position) - price) * closed_qty - row["commission"] - row["tax"]
                    profits.append(pnl)
                    position += qty
                    if position == 0:
                        cost = 0.0
                    else:
                        cost = position * price
                else:
                    # 加仓
                    cost += qty * price
                    position += qty

        if not profits:
            return {"win_rate": 0.0, "profit_factor": 0.0, "avg_profit": 0.0}

        wins = [p for p in profits if p > 0]
        losses = [p for p in profits if p < 0]
        win_rate = len(wins) / len(profits) if profits else 0.0
        gross_profit = sum(wins)
        gross_loss = abs(sum(losses))
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float("inf")
        avg_profit = np.mean(profits)
        return {
            "win_rate": win_rate,
            "profit_factor": profit_factor,
            "avg_profit": float(avg_profit),
            "total_profit": float(sum(profits)),
        }
