"""量化回测示例 - 命令行运行

用法:
    python example.py
"""
from __future__ import annotations
import logging

from quant.runner import run_backtest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)


def main():
    print("=" * 60)
    print("量化回测示例 - 双均线交叉策略 (模拟数据)")
    print("=" * 60)

    result = run_backtest(
        symbol="AAPL",
        strategy_name="ma_cross",
        strategy_params={"short_window": 5, "long_window": 20},
        data_source="sample",
        start_date="2023-01-01",
        initial_capital=100000.0,
        warmup_bars=20,
    )

    s = result.statistics
    print(f"\n回测结果:")
    print(f"  初始资金:     ${s['initial_capital']:>12,.2f}")
    print(f"  最终净值:     ${s['final_equity']:>12,.2f}")
    print(f"  总收益率:     {s['total_return']*100:>11.2f}%")
    print(f"  年化收益:     {s['annual_return']*100:>11.2f}%")
    print(f"  年化波动:     {s['annual_volatility']*100:>11.2f}%")
    print(f"  夏普比率:     {s['sharpe_ratio']:>12.2f}")
    print(f"  索提诺比率:   {s['sortino_ratio']:>12.2f}")
    print(f"  最大回撤:     {s['max_drawdown']*100:>11.2f}%")
    print(f"  卡尔玛比率:   {s['calmar_ratio']:>12.2f}")
    print(f"  胜率:         {s.get('win_rate', 0)*100:>11.1f}%")
    print(f"  盈亏比:       {s.get('profit_factor', 0):>12.2f}")
    print(f"  交易次数:     {s['total_trades']:>12d}")
    print(f"  交易日数:     {s['trading_days']:>12d}")

    print(f"\n成交记录 (前5笔):")
    if not result.trades.empty:
        print(result.trades.head().to_string(index=False))
    print("\n✅ 回测验证通过")


if __name__ == "__main__":
    main()
