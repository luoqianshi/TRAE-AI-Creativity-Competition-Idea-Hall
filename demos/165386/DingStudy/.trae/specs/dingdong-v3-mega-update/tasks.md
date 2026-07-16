# Tasks — 叮咚学 v3 超大版本更新 — 全部完成 ✅

## 第一阶段：基础设施与数据

- [x] Task 1: 创建 v3 项目骨架
  - [x] SubTask 1.1: 复制 app-v2 为 app-v3 基础
  - [x] SubTask 1.2: 调整底部 Tab 为「学习/广场/乐园/学习库」
  - [x] SubTask 1.3: 移除地图工坊/应用工坊视图
  - [x] SubTask 1.4: 新增 17 个 v3 视图骨架

- [x] Task 2: 真实教材资源搜索与录入
  - [x] SubTask 2.1: 搜索人教版 1-6 年级语文课文目录
  - [x] SubTask 2.2: 搜索人教版/北师版/苏教版数学知识点
  - [x] SubTask 2.3: 搜索人教版英语单词表
  - [x] SubTask 2.4: 搜索科学/政治/历史/音乐/美术知识点
  - [x] SubTask 2.5: 将真实资源写入 data.js 的 TEXTBOOKS 结构

- [x] Task 3: 乐园材料库数据
  - [x] SubTask 3.1: 设计 58 种方块材料
  - [x] SubTask 3.2: 6 种场景预设配置
  - [x] SubTask 3.3: 成就数据

- [x] Task 4: 剧本系统数据结构
  - [x] SubTask 4.1: 剧本数据结构
  - [x] SubTask 4.2: 3 个示例剧本（魔法森林/太空探险/海底寻宝）

## 第二阶段：乐园 3.0

- [x] Task 5: 乐园建造引擎（assets/world.js，970 行）
  - [x] SubTask 5.1: 等距视角网格渲染（Canvas）
  - [x] SubTask 5.2: 方块放置/移除
  - [x] SubTask 5.3: 材料栏 UI
  - [x] SubTask 5.4: 视角平移/缩放
  - [x] SubTask 5.5: 世界数据序列化/反序列化
  - [x] SubTask 5.6: 撤销/重做

- [x] Task 6: 乐园场景与商店
  - [x] SubTask 6.1: 6 种场景切换
  - [x] SubTask 6.2: 材料商店
  - [x] SubTask 6.3: 场景专属材料解锁

- [x] Task 7: 乐园社交
  - [x] SubTask 7.1: 世界分享到广场
  - [x] SubTask 7.2: 浏览他人世界
  - [x] SubTask 7.3: 点赞/收藏世界

## 第三阶段：广场 3.0 + 剧本

- [x] Task 8: 剧本编辑器（assets/script.js，811 行）
  - [x] SubTask 8.1: 场景编辑器
  - [x] SubTask 8.2: 选择分支编辑器
  - [x] SubTask 8.3: 剧本预览
  - [x] SubTask 8.4: 创建消耗叮咚币
  - [x] SubTask 8.5: 剧本保存/序列化

- [x] Task 9: 剧本体验
  - [x] SubTask 9.1: 互动阅读模式
  - [x] SubTask 9.2: 分支选择
  - [x] SubTask 9.3: 点赞/收藏/投喂
  - [x] SubTask 9.4: 剧本排行榜

- [x] Task 10: 广场升级
  - [x] SubTask 10.1: 发布新增"剧本"和"世界"类型
  - [x] SubTask 10.2: 动态卡片适配新类型
  - [x] SubTask 10.3: 活动横幅升级

## 第四阶段：学习库 3.0

- [x] Task 11: 真实教材浏览
  - [x] SubTask 11.1: 按年级/学科/版本/单元导航树
  - [x] SubTask 11.2: 课文全文阅读
  - [x] SubTask 11.3: 生字表/词语表展示
  - [x] SubTask 11.4: 搜索功能

- [x] Task 12: AI 整理
  - [x] SubTask 12.1: AI 生成单元摘要
  - [x] SubTask 12.2: AI 提取重点字词
  - [x] SubTask 12.3: AI 生成考点提示
  - [x] SubTask 12.4: 知识卡片保存

## 第五阶段：AI 错题本 3.0

- [x] Task 13: 错题录入（assets/wrongbook.js，1070 行）
  - [x] SubTask 13.1: 拍照录入（摄像头 + AI OCR）
  - [x] SubTask 13.2: 手动录入表单
  - [x] SubTask 13.3: 从答题/试卷自动收集
  - [x] SubTask 13.4: 错题卡片（翻转看解析）

- [x] Task 14: AI 讲解与举一反三
  - [x] SubTask 14.1: AI 逐题讲解（流式）
  - [x] SubTask 14.2: AI 生成变种题
  - [x] SubTask 14.3: 变种题答题练习
  - [x] SubTask 14.4: 掌握度标记

- [x] Task 15: AI 错题分析
  - [x] SubTask 15.1: 按学科/知识点统计
  - [x] SubTask 15.2: SVG 可视化（饼图/雷达图）
  - [x] SubTask 15.3: AI 自然语言总结
  - [x] SubTask 15.4: 针对性练习建议
  - [x] SubTask 15.5: 艾宾浩斯复习提醒

## 第六阶段：学习 3.0

- [x] Task 16: AI 自适应试卷（assets/adaptive.js，1646 行）
  - [x] SubTask 16.1: 综合用户数据
  - [x] SubTask 16.2: AI 生成 10 题试卷
  - [x] SubTask 16.3: 难度自适应
  - [x] SubTask 16.4: 试卷结算 + 错题自动入错题本

- [x] Task 17: 游戏化升级
  - [x] SubTask 17.1: BOSS 战模式
  - [x] SubTask 17.2: 学习路径图
  - [x] SubTask 17.3: 三环紧扣升级

## 第七阶段：个性化

- [x] Task 18: 个性化系统
  - [x] SubTask 18.1: 10 款头像框
  - [x] SubTask 18.2: 8 款主题
  - [x] SubTask 18.3: 个人主页定制
  - [x] SubTask 18.4: 称号装备升级
  - [x] SubTask 18.5: 彩色昵称

- [x] Task 19: 商店升级
  - [x] SubTask 19.1: 材料商品
  - [x] SubTask 19.2: 头像框商品
  - [x] SubTask 19.3: 主题商品
  - [x] SubTask 19.4: 剧本创建卡
  - [x] SubTask 19.5: 连胜保护卡/双倍经验/金币加成

## 第八阶段：AI 升级

- [x] Task 20: AI 能力扩展（ai.js 新增 328 行）
  - [x] SubTask 20.1: 举一反三 prompt（generateVariants）
  - [x] SubTask 20.2: 变种题生成 prompt
  - [x] SubTask 20.3: 错题分析 prompt（analyzeWrongBook）
  - [x] SubTask 20.4: 自适应出题 prompt（generateAdaptivePaper）
  - [x] SubTask 20.5: 教材整理 prompt（summarizeTextbook）
  - [x] SubTask 20.6: OCR 题目识别 prompt（ocrQuestion + preLearnExplain）

## 第九阶段：验证

- [x] Task 21: 全面验证
  - [x] SubTask 21.1: 括号平衡验证（{} 和 [] 全部平衡）
  - [x] SubTask 21.2: node --check 语法验证（全部通过）
  - [x] SubTask 21.3: 7 个文件大小确认
  - [x] SubTask 21.4: 17 个新视图 HTML 骨架确认
  - [x] SubTask 21.5: CSS 暗色模式适配确认
  - [x] SubTask 21.6: 触摸目标 ≥ 44px 确认
  - [x] SubTask 21.7: A11y aria-label 确认

# 文件清单
| 文件 | 大小 | 行数 |
|------|------|------|
| index.html | 106.6 KB | ~2100 |
| styles.css | 74.2 KB | ~2200 |
| app.js | 163.6 KB | 4024 |
| data/data.js | 95.8 KB | 1000 |
| assets/icons.js | 11.2 KB | ~350 |
| assets/ai.js | 42.1 KB | 1024 |
| assets/world.js | 32.2 KB | 970 |
| assets/script.js | 25.4 KB | 811 |
| assets/wrongbook.js | 35.3 KB | 1070 |
| assets/adaptive.js | 51.8 KB | 1646 |
| **总计** | **~538 KB** | **~13200** |
