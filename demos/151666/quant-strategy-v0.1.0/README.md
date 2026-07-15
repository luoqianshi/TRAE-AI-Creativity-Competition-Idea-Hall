# 量化策略库 (quant-strategy v0.1.0)

事件驱动的美股/港股量化回测框架,集成多因子策略、新闻情感分析与风控机制。

## 特性

- **事件驱动回测引擎** - 模拟真实订单流、成交、组合管理
- **多策略对比** - 双均线、RSI、多因子(v1/v3/v4)、新闻增强
- **新闻情感分析** - 内置金融词典(中英双语),可选 VADER 增强
- **风控机制** - 硬止损、保本止盈、ATR 动态止损
- **多数据源** - 内置模拟数据(含 regime switching / GARCH / 动量效应)、CSV、老虎证券 OpenAPI

## 环境要求

- Python >= 3.10
- Windows / macOS / Linux

## 安装

```bash
# 1. 解压后进入目录
cd quant-strategy-v0.1.0

# 2. (推荐) 创建虚拟环境
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt
```

## 快速开始

### 1. 运行策略对比演示

```bash
python run_demo.py
```

输出 4 个策略在 AAPL 模拟数据上的胜率/盈亏比/收益/夏普/回撤对比。

### 2. 运行单策略示例

```bash
python example.py
```

### 3. 在自己的代码中调用

```python
from quant.runner import run_backtest

# 使用模拟数据回测推荐策略 v3
result = run_backtest(
    symbol="AAPL",
    strategy_name="multifactor_v3",   # 推荐策略
    data_source="sample",              # sample / csv / tiger
    start_date="2023-01-01",
    end_date="2024-12-31",
    initial_capital=100_000,
)

# 查看统计
stats = result.statistics
print(f"胜率: {stats['win_rate']*100:.1f}%")
print(f"收益: {result.total_return*100:.2f}%")
print(f"夏普: {stats['sharpe_ratio']:.2f}")
print(f"最大回撤: {stats['max_drawdown']*100:.2f}%")

# 查看成交记录
print(result.trades.head())
```

## 策略列表

| 名称 | 说明 | 特点 |
|------|------|------|
| `ma_cross` | 双均线交叉 | 入门级,趋势跟踪 |
| `rsi` | RSI 超买超卖 | 反转策略 |
| `multifactor` | 多因子 v1 基线 | 均线 + 情感 + 动量 |
| `multifactor_v3` | 多因子 v3 (推荐) | 加入硬止损 + 保本 |
| `multifactor_v4` | 多因子 v4 | ATR 动态止损 |
| `news_ma` | 新闻增强均线 | 负面新闻规避 |

## 配置 (可选)

复制 `.env.example` 为 `.env` 并填入老虎证券 API 凭证以使用真实行情数据:

```bash
cp .env.example .env
```

```env
TIGER_ACCOUNT_ID=your_account_id
TIGER_ACCESS_TOKEN=your_token
TIGER_SECRET_KEY=your_secret
TIGER_PAPER_ACCOUNT=true
```

未配置时,系统自动使用内置模拟数据(已包含 regime switching、GARCH(1,1) 波动聚集、动量效应等真实市场特征)。

## 项目结构

```
quant-strategy-v0.1.0/
├── quant/                  # 策略库
│   ├── core/               # 引擎/事件/组合/绩效
│   ├── data/               # 数据接入 (sample / csv / tiger)
│   ├── news/               # 新闻提供者 + 情感分析
│   ├── strategies/         # 策略实现
│   └── runner.py           # 统一回测入口
├── run_demo.py             # 策略对比演示
├── example.py              # 单策略示例
├── config.py               # 配置(支持 pydantic-settings 降级)
├── requirements.txt
└── .env.example
```

## 风险提示

本框架仅用于学习研究和历史数据回测,不构成任何投资建议。回测结果不代表未来收益。实盘交易前请充分了解风险。
