# 人情记账本 · 产品需求文档（PRD）

> 版本：v2.0
> 更新日期：2026-07-13
> 状态：迭代开发中

---

## 一、产品概述

### 1.1 产品定位
面向个人用户的人情往来记账工具，帮助用户记录收礼/随礼、管理礼簿、统计人情收支、设置往来提醒，保护隐私。

### 1.2 核心价值
- **记账便捷**：收礼/随礼一键切换，金额大写实时显示
- **礼簿管理**：创建礼簿、收礼名单、签到管理
- **多维统计**：亲友/礼簿/统计三视图，收支趋势与分类占比
- **往来提醒**：随礼前一天自动提醒，应用打开弹窗提示
- **隐私保护**：4 位数字应用锁，本地存储不外传

### 1.3 设计风格
- 微信小程序风格 UI，移动端优先
- 品牌色：中国红 `#E54D42`
- 四级灰阶、6 级字号、3 级阴影
- 底部 TabBar 三 Tab：记账 / 看账 / 我的

---

## 二、技术架构

### 2.1 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6 | 构建工具 |
| Tailwind CSS | 3 | 样式 |
| Zustand | 5 | 状态管理（含 persist 中间件） |
| react-router-dom | 7 | 路由（HashRouter） |
| lucide-react | - | 图标库 |
| html2canvas | - | 分享图生成 |

### 2.2 项目结构
```
src/
├── App.tsx                      # 根组件（密码锁 + 路由 + 提醒弹窗）
├── components/                  # 公共组件
│   ├── MobileShell.tsx          # 移动端容器
│   ├── NavBar.tsx               # 顶部导航栏
│   ├── TabBar.tsx               # 底部三 Tab 导航
│   ├── Fab.tsx                  # 悬浮 + 号按钮
│   ├── Avatar.tsx               # 头像
│   ├── SegmentControl.tsx       # 分段切换
│   ├── FilterChips.tsx          # 筛选 chips
│   ├── StatCard.tsx             # 统计卡
│   ├── AmountText.tsx           # 金额文本
│   ├── PersonPicker.tsx         # 往来人选择面板
│   ├── GiftBookPicker.tsx       # 礼簿选择面板
│   ├── GiftBookEditModal.tsx    # 礼簿创建/编辑弹窗
│   ├── LockScreen.tsx           # 应用锁屏页
│   ├── PasswordModal.tsx        # 密码设置/修改/清除弹窗
│   └── ReminderAlert.tsx        # 应用打开提醒弹窗
├── pages/                       # 页面
│   ├── Home.tsx                 # 记账首页
│   ├── AddRecord.tsx            # 记一笔
│   ├── GiftBook.tsx             # 看账（亲友/礼簿/统计）
│   ├── BatchGift.tsx            # 礼簿详情页
│   ├── FriendDetail.tsx         # 友亲详情页
│   ├── Reminders.tsx            # 提醒页
│   ├── Profile.tsx              # 我的
│   └── Search.tsx               # 搜索页（已弃用，保留兼容）
├── store/
│   └── useAppStore.ts           # Zustand 全局状态
├── data/
│   └── seed.ts                  # 种子数据（已清空，仅保留 8 大类分类）
└── lib/
    ├── types.ts                 # 类型定义
    └── utils.ts                 # 工具函数（toChineseAmount, cn）
```

### 2.3 路由结构
| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 记账首页 |
| `/add` | AddRecord | 记一笔（支持 `?bookId=xxx` 预选礼簿） |
| `/gift-book` | GiftBook | 看账（支持 `?seg=friends\|books\|stats`） |
| `/friend/:id` | FriendDetail | 友亲详情 |
| `/gift-book/batch/:id` | BatchGift | 礼簿详情 |
| `/reminders` | Reminders | 提醒列表 |
| `/profile` | Profile | 我的 |
| `/search` | Search | 搜索（已弃用） |

---

## 三、数据模型

### 3.1 Transaction（交易记录）
```typescript
interface Transaction {
  id: string;
  type: "income" | "expense";    // 收礼 / 随礼
  amount: number;
  category: string;              // 分类 key（wedding/baby/...）
  personName: string;
  personId: string;
  event: string;                 // 事件描述
  giftBookId?: string;           // 仅收礼关联礼簿时携带
  date: string;                  // YYYY-MM-DD
  note?: string;
  emoji: string;
}
```

### 3.2 Friend（亲友）
```typescript
interface Friend {
  id: string;
  name: string;
  avatarColor: string;
  incomeCount: number;
  expenseCount: number;
  netAmount: number;             // 正=净收 负=净支
}
```

### 3.3 GiftBook（礼簿）
```typescript
interface GiftBook {
  id: string;
  title: string;
  date: string;
  reason?: string;               // 事由（8 大类 label）
  totalReceived: number;
  guestCount: number;
  guests: GiftBookGuest[];
}

interface GiftBookGuest {
  id: string;
  name: string;
  amount: number;
  checkedIn: boolean;
}
```

### 3.4 Reminder（提醒）
```typescript
interface Reminder {
  id: string;
  friendId: string;
  friendName: string;
  type: "gift" | "repay" | "reciprocal";  // 待回礼/还款/往来
  title: string;
  date: string;                  // 提醒日期
  daysLeft: number;              // 存储时静态，展示时动态计算
  amount?: number;
  status: "pending" | "done";
  desc?: string;
}
```

### 3.5 Category（8 大类事由）
| key | label | emoji | reasons |
|-----|-------|-------|---------|
| wedding | 婚嫁 | 💍 | 订婚、成婚 |
| baby | 生子 | 👶 | 满月、百天、周岁 |
| growth | 成长 | 🎓 | 升学、成人、入伍 |
| birthday | 生日 | 🎂 | 庆生、祝寿 |
| house | 置业 | 🏠 | 乔迁、开业 |
| career | 事业 | 💼 | 升职、退休、拜师 |
| condole | 慰问 | 🤝 | 探病、受灾、丧葬 |
| festival | 节庆 | 🏮 | 拜年、中秋、访友 |

### 3.6 持久化
- **存储方式**：Zustand `persist` 中间件 + localStorage
- **存储 key**：`renqing-ledger-v2`
- **持久化字段**：`transactions`、`friends`、`giftBooks`、`reminders`、`cloudSync`、`appPassword`
- **不持久化**：函数方法、`searchResults`

---

## 四、页面功能详述

### 4.1 记账首页（Home）

#### 4.1.1 月份翻页
- 默认显示当前月
- 左箭头：跳到上一个有记录的月份；无更早记录时置灰
- 右箭头：跳到下一个有记录的月份；后续无记录且当前查看月早于本月时，直接跳到当前月；已在本月且无更晚记录时置灰
- 跨年翻页支持（如 2026年1月 → 2025年12月）

#### 4.1.2 统计卡（双卡）
- 左卡：收礼，显示「收礼 本月 X 笔」+ 金额（绿色 +¥）
- 右卡：随礼，显示「随礼 本月 X 笔」+ 金额（深色 -¥）
- 标题样式：「收礼」字体大一号加粗，「本月 X 笔」小字灰色
- 金额居中显示，数字 26px
- **不可点击**（纯展示，统计入口已移至看账页）

#### 4.1.3 交易列表
- 按 chips 筛选：全部 / 收礼 / 随礼
- 每条记录显示：emoji、`{往来人} {事件}`、日期、金额（收礼绿/随礼深）
- **点击任一记录跳转** `/friend/:personId`（友亲详情页）
- 空月显示「本月暂无往来记录」

#### 4.1.4 FAB
- 右下角悬浮 + 号按钮
- 点击跳转 `/add`

---

### 4.2 记一笔页面（AddRecord）

#### 4.2.1 收礼/随礼切换
- 默认「收礼」高亮
- 切到「随礼」时：清空所属礼簿选择，隐藏礼簿行
- 切回「收礼」时：礼簿行重新出现（选填）

#### 4.2.2 金额输入
- 输入框居中，inputMode=decimal
- 实时显示大写金额（`toChineseAmount`），如 1288 → 「壹仟贰佰捌拾捌元整」
- 金额颜色：收礼绿 / 随礼深
- 零金额不显示大写

#### 4.2.3 分类宫格（8 大类）
- 4 列网格，每类含 emoji、类别名、常见事由小字
- 选中高亮（品牌红浅底）
- **默认回填**：上次保存的事由（localStorage `lastCat`）
- **事由锁定**：从礼簿详情 + 进入时，事由锁定为礼簿创建时的 reason，其余置灰 disabled

#### 4.2.4 往来人选择
- 点击「往来人」行弹出底部面板
- 选择已有亲友，或新建亲友（输入姓名创建）
- 未选往来人时保存按钮置灰

#### 4.2.5 所属礼簿（仅收礼）
- 点击「所属礼簿」行弹出底部面板
- 选择礼簿后，**事由自动同步**为该礼簿的 reason
- 再次点击已选中项可取消选择
- **默认回填**：上次的礼簿（localStorage `lastBookId`）
- 从礼簿详情 + 进入时（URL `?bookId=xxx`）：默认选中该礼簿，事由锁定

#### 4.2.6 日期选择
- 原生 `<input type="date">`，点击直接弹出系统日期选择器
- 默认今天
- 支持选未来日期（用于计划随礼）

#### 4.2.7 备注
- 行内直接输入，无需弹窗
- 选填

#### 4.2.8 保存
- 金额 > 0 且已选往来人方可保存
- 保存后：
  - 写入 transactions（头部插入）
  - 持久化 lastCat / lastBookId
  - **随礼且日期在未来**：自动生成一条 reciprocal 提醒（详见 4.7）
  - 跳转回首页

---

### 4.3 看账页面（GiftBook）

#### 4.3.1 三段切换
- 顶部 SegmentControl：亲友 / 礼簿 / 统计
- URL 参数 `?seg=books|stats` 可直达对应段
- 搜索框 + 筛选按钮仅「亲友/礼簿」段显示，统计段隐藏

#### 4.3.2 亲友段
- 列表项：头像、姓名、`收X · 支Y`、净额（正绿 +¥ / 负深 -¥）
- **点击跳转** `/friend/:id`
- FAB：+ 号，跳转 `/add`
- 空列表显示「暂无匹配记录」

#### 4.3.3 礼簿段
- 列表项：标题、`日期 · 人数`、总金额（品牌红）
- **点击跳转** `/gift-book/batch/:id`
- FAB：+ 号，弹出 GiftBookEditModal 创建礼簿
- 空列表显示「暂无匹配礼簿」

#### 4.3.4 内联搜索
- 搜索框可直接输入文字（不跳转搜索页）
- 亲友段：匹配往来人姓名 + 事件
- 礼簿段：匹配礼簿标题 + 事件
- 实时过滤，带 X 清除按钮
- 有结果时显示「找到 X 条」

#### 4.3.5 筛选面板
底部滑出，包含：
- **类型**（仅亲友段）：全部 / 收礼 / 随礼
- **时间范围**：全部 / 本月 / 本年 / 自定义（起止月份）
- **往来事项**：全部 / 8 大类
- **金额区间**：
  - 亲友段（单笔金额）：全部 / 500以内 / 500-2000 / 2000-5000 / 5000以上
  - 礼簿段（总金额）：全部 / 10000以内 / 10000-20000 / 20000-50000 / 50000以上
- 重置按钮：清空所有筛选
- 有激活筛选时，筛选按钮高亮（品牌红浅底）

#### 4.3.6 统计段
##### 周期切换
- 月 / 年 / 全全 三段切换

##### 收支趋势图
- 柱状图：收礼（品牌红）+ 随礼（深色）双柱
- 月周期：本年按月分组（1月、2月…）
- 年周期：按年分组（2024年、2025年…）
- 全部周期：所有年份按年分组
- 柱高按当前最大值换算百分比
- 空数据显示「暂无收支数据」

##### 分类占比
- 按 category 分组统计金额，计算百分比
- 按金额降序排列
- 每项：类别名、金额、进度条、百分比
- 配色：品牌红 → 灰阶递减
- 空数据显示「暂无分类数据」

##### 社交成本报告
- 今年净支出 = 今年随礼总额 − 今年收礼总额
- 净支出（随礼>收礼）：红色显示
- 净收入（收礼>随礼）：绿色显示，文案改为「今年人情净收入」
- 同比：与去年净支出对比
  - 下降：绿色 TrendingDown + 「下降 X%」
  - 上升：红色 TrendingUp + 「上升 X%」
  - 无上年数据：显示「暂无上年数据对比」

##### 生成分享图
- 用 `html2canvas` 截图「收支趋势 + 分类占比 + 社交成本报告」三块卡片
- 优先调 `navigator.share`（移动端原生分享）
- 不支持时回退 `<a download>` 下载 PNG
- 点击后按钮显示「生成中...」并禁用
- 按钮居中显示（已移除导出 PDF 按钮）

---

### 4.4 礼簿详情页（BatchGift）

#### 4.4.1 汇总卡
- 已收礼金（总额，绿色）
- 收礼人数
- 礼簿信息：日期 · 事由

#### 4.4.2 收礼名单
- 每行：头像（首字）、姓名、签到按钮、金额
- **签到切换**：点击「未签到」→「已签到」（绿色），再点切回
- 签到按钮独立 `stopPropagation`，不触发行跳转
- **点击名单行（非签到按钮）跳转** `/friend/:friendId`
- 名单标题：`共X人 · 已签到Y`
- 无「主桌」字段（已移除）

#### 4.4.3 FAB
- 右下角 + 号，与记账页位置/大小一致
- 点击跳转 `/add?bookId=:id`（携带礼簿 ID）

#### 4.4.4 编辑礼簿
- 右上角铅笔图标，弹出 GiftBookEditModal 编辑弹窗

#### 4.4.5 返回
- 返回到 `/gift-book?seg=books`（礼簿列表）

---

### 4.5 友亲详情页（FriendDetail）

#### 4.5.1 统计卡
- 收礼总额（绿色 +¥）
- 随礼总额（深色 -¥）

#### 4.5.2 收支明细
- 按时间倒序（最近的在先）
- 每条：emoji、事件、日期、金额
- 标题：`共X笔`
- 空状态：「暂无往来记录」

#### 4.5.3 返回
- `navigate(-1)`，返回来源页（看账 / 收礼名单 / 记账首页）

---

### 4.6 我的页面（Profile）

#### 4.6.1 用户卡
- 渐变背景（品牌红 → 紫色）
- 头像 + 「人情账本用户」+ 「本地账本 · 私密守护」

#### 4.6.2 菜单项
| emoji | 标签 | 副标题 | 动作 |
|-------|------|--------|------|
| 🔔 | 提醒设置 | 往来提醒 · 人情无忧 | 跳转 `/reminders` |
| 📤 | 数据导出 | 导出账单 · 备份恢复 | （占位） |
| 🔒 | 设置密码 / 修改密码 | 应用锁 · 隐私保护 / 应用锁已开启 · 点击修改 | 弹出 PasswordModal |
| 💬 | 意见反馈 | 问题反馈 · 功能建议 | （占位） |
| ℹ️ | 关于软件 | 功能介绍 · 联系我们 | （占位） |
| 🛡️ | 隐私政策 | 数据采集 · 权限使用 | （占位） |

- 菜单项标题字体为 text-body
- 副标题 12px 灰色（text-text3）
- 已设置密码时，标签改为「修改密码」，副标题改为「应用锁已开启 · 点击修改」

---

### 4.7 提醒功能

#### 4.7.1 自动生成提醒
- **触发条件**：保存随礼记录时，日期晚于今天
- **提醒类型**：reciprocal（往来）
- **提醒日期**：随礼日期的前一天
- **标题**：`明天有随礼 · {事件}`
- **描述**：`随礼 ¥{金额} · {往来人}`
- **初始状态**：pending

#### 4.7.2 提醒列表页（Reminders）
- **即将到来**（pending）：金色计数徽章
  - 每项：头像、标题、`{天数} · 描述`、类型标签
  - 天数动态计算：
    - 未来：`X天后`
    - 当日：`今天`
    - 已过期：`已过期X天`（红色）
  - 点击：标记为已完成 + 跳转 `/add`
- **已处理**（done）：灰色列表，60% 透明度，不可点击

#### 4.7.3 应用打开弹窗（ReminderAlert）
- 检查条件：`status === "pending"` 且 `reminder.date <= 今天`
- 有到期提醒时弹窗提示
- 最多显示 3 条，超出显示「还有 X 条...」
- 按钮：「稍后」关闭 / 「去查看」跳转 `/reminders`
- 每次会话只弹一次（sessionStorage `reminder-alert-shown` 控制）

---

### 4.8 应用锁（密码保护）

#### 4.8.1 锁屏页（LockScreen）
- **触发**：`appPassword` 非空且未解锁时，显示全屏锁屏
- **样式**：品牌红渐变背景 + 毛玻璃数字键盘
- **输入**：4 位数字，4 个圆点指示器
- **自动验证**：输入满 4 位自动校验
- **错误反馈**：密码格抖动 + 金色边框，0.5 秒后清空重输
- **解锁成功**：进入应用

#### 4.8.2 密码管理弹窗（PasswordModal）
底部滑出，三种模式：

##### 设置密码（首次）
- 新密码（4 格独立输入框，每格 1 位数字，自动跳转下一格）
- 确认密码（4 格）
- 两次输入一致方可设置

##### 修改密码
- 原密码（4 格）
- 新密码（4 格）
- 确认密码（4 格）
- 校验：原密码正确 + 新密码 4 位数字 + 两次一致 + 新旧不同

##### 清除密码
- 输入当前密码验证
- 清除后进入应用不再需要解锁

##### 输入框规格
- 4 格独立输入框，每格 `h-12 w-12`（48×48px 正方形）
- 间距 `gap-3`（12px）
- 退格键：当前格有值则清空，当前格为空则跳回上一格
- 聚焦时自动选中内容
- 标签（原密码/新密码/确认密码）与输入框同行居中，字间距 8px

---

## 五、公共组件

### 5.1 MobileShell
- 桌面端（≥768px）：居中 420px 宽度
- 移动端（<768px）：全屏
- `withTabBar` 参数：底部留白适配 TabBar

### 5.2 NavBar
- 左：返回箭头（可配置 `backTo` 指定返回路径）
- 中：标题
- 右：可选操作按钮（如编辑铅笔）

### 5.3 TabBar
- 三 Tab：记账 / 看账 / 我的
- 当前页高亮（品牌红）
- 所有主页面统一显示

### 5.4 GiftBookEditModal
- 底部滑出弹窗，创建/编辑礼簿共用
- 字段：名称（maxLength 20）、时间（date input）、事由（8 大类 select 下拉）
- 创建模式：表单初始为空
- 编辑模式：字段回填原数据
- 点击遮罩或取消关闭
- 名称必填，时间默认今天

### 5.5 PersonPicker / GiftBookPicker
- 底部滑出选择面板
- PersonPicker：选择已有亲友或新建
- GiftBookPicker：选择礼簿，可再次点击已选中项取消

---

## 六、Store 操作

### 6.1 数据操作
| 方法 | 说明 |
|------|------|
| `addTransaction(t)` | 新增交易；随礼且日期未来时自动生成提醒 |
| `addFriend(name)` | 新增亲友，返回新建 Friend |
| `addGiftBook(title, date?)` | 简化新增礼簿 |
| `addGiftBookFull({title, date, reason?})` | 完整字段新增礼簿 |
| `updateGiftBook(id, info)` | 更新礼簿 title/date/reason |
| `toggleGuestCheckIn(bookId, guestId)` | 切换宾客签到状态 |
| `markReminderDone(id)` | 提醒标记为已完成 |
| `search(keyword)` | 搜索交易（匹配 personName / event） |
| `setAppPassword(pwd)` | 设置应用锁密码 |
| `clearAppPassword()` | 清除应用锁密码 |
| `setCloudSync(v)` | 云同步开关（占位） |

---

## 七、工具函数

### 7.1 toChineseAmount(num)
将数字转为中文大写金额。
- 整数：`3600` → `叁仟陆佰元整`
- 带角：`1288.5` → `壹仟贰佰捌拾捌元伍角`
- 带分：`1288.56` → `壹仟贰佰捌拾捌元伍角陆分`
- 零：`0` → `零元整`
- 负数：`-100` → `负壹佰元整`
- 四舍五入到分

### 7.2 cn(...classes)
Tailwind 类名合并，冲突时后者覆盖。

---

## 八、设计规范

### 8.1 色彩
| 变量 | 色值 | 用途 |
|------|------|------|
| `--brand` | `#E54D42` | 品牌红 |
| `--brand-light` | - | 品牌红浅底 |
| `--income` | - | 收礼（绿） |
| `--expense` | - | 随礼（深色） |
| `--text-1` ~ `--text-4` | - | 四级灰阶 |
| `--bg-card` | - | 卡片背景 |
| `--fill` | - | 填充背景 |
| `--border` | - | 边框 |
| `--shadow-1` / `--shadow-2` | - | 两级阴影 |

### 8.2 字号
| 变量 | 大小 | 用途 |
|------|------|------|
| `text-h1` | 最大 | 大数字 |
| `text-h2` | 次大 | 金额 |
| `text-body` | 15px | 正文 |
| `text-caption` | 13px | 说明文字 |
| `text-mini` | 11px | 辅助文字 |

### 8.3 动效
- 底部弹窗：`slideUp 240ms cubic-bezier(.2,.8,.2,1)`
- 按钮点击：`active:scale-[0.98]`
- 列表项点击：`active:opacity-70`
- 密码错误抖动：`shake 0.4s`
- 弹窗出现：`popIn 200ms`

---

## 九、待办与已知限制

### 9.1 待实现
- 数据导出功能（菜单项已占位）
- 意见反馈、关于软件、隐私政策详情页
- 云同步功能（开关已占位）
- 提醒的推送通知（Web 受限，仅支持应用内被动检查）

### 9.2 已知限制
- Web 应用无法后台推送提醒，仅打开应用时检查
- `navigator.share` 图片分享在部分浏览器（如微信内置）支持有限，会回退下载
- localStorage 数据不跨设备同步
- 分享图截取 CSS 变量时，html2canvas 通过 `getComputedStyle` 解析

### 9.3 测试参考
详见 [TEST_CASES.md](./TEST_CASES.md)，覆盖 11 大模块、130+ 条用例。
