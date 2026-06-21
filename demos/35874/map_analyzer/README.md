# MAP 文件内存分析工具

解析 ARM Compiler (armlink) 生成的 `.map` 链接映射文件，生成交互式 HTML 内存分析报告。

## 功能

- 解析 `Image component sizes` 段中的对象和库成员
- 提取 Grand Totals、ROM/RAM 总用量
- 从 Memory Map 提取 Flash/RAM 容量上限
- 按模块自动分类（Application、RTOS、USB、HAL 等）
- 生成包含 ECharts 图表的 HTML 报告：
  - 汇总卡片（ROM/RAM/CODE/RO/RW/ZI）
  - Flash/RAM 使用率进度条
  - ROM/RAM 分类饼图
  - 分类堆叠柱状图
  - 可排序数据表格（TOP ROM/RAM/STACK）
  - Top 20 横向排行图

## 用法

```bash
# 基本用法
python map_analyzer.py path/to/omni.map

# 指定输出路径
python map_analyzer.py omni.map -o report.html

# 同时导出 JSON 数据
python map_analyzer.py omni.map --json map_data.json
```

## 测试

```bash
# 使用 daplink 项目的 omni.map
python map_analyzer.py ../../../applications/industrial/daplink/Listings/stm32f407/omni.map

# 使用 coremark 示例（较小）
python map_analyzer.py ../../../examples/coremark/coremark_base/Listings/stm32f407/omni.map
```

生成的 HTML 报告可直接在浏览器中打开，无需服务器。

## 依赖

- Python 3.10+
- 无第三方 Python 依赖
- HTML 报告通过 CDN 加载 ECharts
