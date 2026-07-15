"""演示脚本 - 对比不同策略的回测效果"""
from __future__ import annotations
import sys
sys.stdout.reconfigure(encoding="utf-8")

from quant.runner import run_backtest


def run_and_print(symbol, strategy_name, label, **params):
    """运行一个策略并打印结果"""
    r = run_backtest(
        symbol=symbol,
        strategy_name=strategy_name,
        strategy_params=params,
        data_source="sample",
        start_date="2023-01-01",
        end_date="2024-12-31",
        initial_capital=100_000,
    )
    s = r.statistics
    wr = s.get("win_rate", 0) * 100
    pf = s.get("profit_factor", 0)
    ret = r.total_return * 100
    sh = s["sharpe_ratio"]
    mdd = s["max_drawdown"] * 100
    tr = s["total_trades"]
    print(f"{label:<25} 胜率={wr:5.1f}%  盈亏比={pf:5.2f}  收益={ret:6.2f}%  夏普={sh:4.2f}  回撤={mdd:5.2f}%  交易={tr}")
    return r


def main():
    symbol = "AAPL"
    print("=" * 95)
    print(f"  策略对比演示 (标的: {symbol}, 模拟数据 2023-01-01 ~ 2024-12-31)")
    print("=" * 95)
    print(f"{'策略':<25} {'胜率':>8} {'盈亏比':>8} {'收益':>8} {'夏普':>8} {'回撤':>8} {'交易':>6}")
    print("-" * 95)

    # 基础策略
    run_and_print(symbol, "ma_cross", "1. 双均线交叉 (入门)", short_window=5, long_window=20)

    # 多因子 v1
    run_and_print(symbol, "multifactor", "2. 多因子 v1 (基线)")

    # 推荐 v3
    run_and_print(symbol, "multifactor_v3", "3. 多因子 v3 (推荐)")

    # v4
    run_and_print(symbol, "multifactor_v4", "4. 多因子 v4 (ATR止损)")

    print()
    print("=" * 95)
    print("  说明:")
    print("  - 胜率: 盈利交易占总交易的比例 (越高越好)")
    print("  - 盈亏比: 总盈利/总亏损 (越高越好, >1 才能盈利)")
    print("  - 夏普: 风险调整后收益 (越高越好, >1 不错, >2 优秀)")
    print("  - 回撤: 最大亏损幅度 (越小越好)")
    print("=" * 95)


if __name__ == "__main__":
    main()
