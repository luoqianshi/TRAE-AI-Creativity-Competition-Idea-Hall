# 竞技场战斗动画升级方案

## Context

当前竞技场战斗动画极其简陋：两个 emoji 只是左右平移 40rpx 循环弹动，1.2秒后就显示胜负结果。没有 HP 条、没有伤害数字、没有攻击序列、没有元素特效，战斗缺乏打击感和视觉反馈。

本方案将战斗动画升级为多阶段、有剧情感的完整战斗演出：入场 → 攻防回合 → 元素技能 → 决胜 → 结果展示，总时长约 5 秒。

## 核心设计

### 战斗动画 6 阶段时序（总时长 ~5200ms）

| 阶段 | 时间 | 内容 | 视觉效果 |
|------|------|------|----------|
| 入场 | 0-800ms | 双方滑入 + VS弹出 | 我方从左滑入、敌方从右滑入、VS scale弹出 |
| 回合1 我方攻击 | 800-2100ms | 冲刺→技能名→元素特效→命中→伤害数字 | 元素技能名浮现、各元素独立特效、受击抖动、屏幕震动、伤害飘字 |
| 回合1 敌方反击 | 2100-3200ms | 敌方冲刺→红色冲击波→命中 | 红色冲击特效、轻屏幕震动、我方HP减少 |
| 回合2 我方再攻 | 3200-4200ms | 更快的冲刺+强化版技能 | 强化元素特效、重屏幕震动、暴击伤害数字(放大+金色) |
| 决胜 | 4200-4700ms | 胜/负分支演出 | 胜利：敌方消失+粒子爆发+我方胜利姿态；失败：我方倒下+敌方嘲讽+灰度滤镜 |
| 结果展示 | 4700ms+ | 面板上滑展示结果 | 结果面板从底部滑入，显示回合数/总伤害/经验奖励 |

### 四神兽元素技能差异化

| 神兽 | 技能名 | 特效动画 | 颜色 |
|------|--------|---------|------|
| 青龙 | 风雷斩 | 从左向右的弧形风刃 + 蓝绿拖尾 | #00d2ff → #3a7bd5 |
| 白虎 | 庚金裂空 | 银白十字旋转斩 + 闪光 | #f5f7fa → #c3cfe2 |
| 朱雀 | 涅槃之焰 | 中心爆发扩散火焰球 | #f12711 → #f5af19 |
| 玄武 | 深渊潮涌 | 同心圆波纹扩散 | #38ef7d → #11998e |

### 三个竞技场差异化敌人

| 竞技场 | 敌人名 | emoji | 战力 | 技能名 |
|--------|--------|-------|------|--------|
| 初级 | 小妖 | 👹 | 15 | 妖气弹 |
| 中级 | 夜叉 | 👺 | 40 | 暗影爪 |
| 高级 | 修罗 | 😈 | 80 | 修罗破天 |

### HP 血条

- 双方各一个血条，宽度通过 `style="width: {{hp}}%"` 动态控制
- `transition: width 0.4s ease-out` 平滑减少
- 颜色随 HP 变化：>50% 绿色、25-50% 黄色、<25% 红色

### 伤害数字

- JS 生成数组，WXML `wx:for` 渲染
- 我方攻击伤害显示在敌方上方（金色），敌方伤害显示在我方上方（红色）
- 暴击伤害字号放大 1.5 倍 + 💥 前缀
- 800ms 后自动从 DOM 移除

### 战斗"悬念"设计

虽然结果由 `fightArena()` 概率预先决定，但通过以下策略保持动态感：
1. 胜利路线：敌方第一回合也打掉我方 15-25% HP（制造紧张），第二回合暴击击杀（爽感）
2. 失败路线：我方第一回合也能打掉敌方 15-25% HP（差一点就赢了），第二回合被敌方重击
3. 每次伤害数值有随机波动，粒子效果位置/时序随机

## 修改文件清单

### 1. `miniprogram/utils/constants.js`
- 新增 `ENEMY_CONFIG` 常量（三个敌人配置：名字/emoji/战力/技能名/颜色）
- 新增 `SKILL_NAMES` 常量（四神兽技能名映射）
- 在 `ARENA_CONFIG.levels` 每个级别中增加 `enemyId` 字段
- 导出新增常量

### 2. `miniprogram/utils/arena-store.js`
- `fightArena()` 返回值中补充 `arenaId` 字段（便于调用方查找敌方配置）

### 3. `miniprogram/pages/arena/arena.wxml`
- 替换现有简单 `battle-overlay` 为新的完整战斗场景
- 新增元素：HP 血条、伤害数字层、技能名称、元素特效层、回合指示器、粒子效果层
- 敌方信息从硬编码改为动态数据（`enemyEmoji`/`enemyName`）
- 结果面板增加战斗详情（回合数、总伤害）和"点击关闭"提示

### 4. `miniprogram/pages/arena/arena.wxss`
- 删除旧 3 个关键帧（`battle-attack-left/right`、`result-pop`）
- 新增约 15+ 个关键帧：
  - 入场：`slide-in-left`、`slide-in-right`、`vs-pop`
  - 待机：`idle-breathe`
  - 攻击：`player-lunge`/`player-retreat`、`enemy-lunge`/`enemy-retreat`
  - 受击：`hit-shake`、`screen-shake-light`、`screen-shake-heavy`
  - 伤害：`damage-float`、`damage-float-critical`
  - 元素特效：`element-qinglong-attack`、`element-baihu-attack`、`element-zhuque-attack`、`element-xuanwu-attack`
  - 技能名：`skill-flash`
  - 胜负：`defeat-fade`、`defeat-fall`、`victory-stand`、`enemy-taunt`、`result-slide-up`
  - 敌方攻击：`enemy-strike-wave`
  - 粒子：`victory-particle`
- 新增 HP 血条、伤害数字、元素特效等样式

### 5. `miniprogram/pages/arena/arena.js`
- `data` 新增战斗动画状态字段（battlePhase、playerAnimClass、enemyAnimClass、HP值、伤害数字等）
- 重写 `onFight`：先调用 `fightArena()` 获取结果，再调用 `startBattle()` 编排动画
- 新增方法：
  - `startBattle(battleData, result, arena)` — 核心时序编排，setTimeout 链式调用
  - `generateBattleData(result, beastConfig, enemyConfig, petData)` — 根据预定胜负构造视觉战斗过程数据
  - `scheduleAnim(delay, callback)` — 统一动画调度，自动管理 timer
  - `spawnDamageNumber(value, isEnemy, isCritical)` — 生成伤害数字
  - `createVictoryParticles()` — 胜利粒子效果
  - `cleanupBattle()` — 清理所有战斗状态和计时器
- 在 `onUnload()` 和 `onHide()` 中调用 `cleanupBattle()`

## 性能保障

- 粒子数量上限 10 个
- 伤害数字 800ms 后自动移除
- 元素特效用单一 div + box-shadow 实现（不多 div 拼贴）
- 同时运行的 CSS 动画不超过 6 个
- 高频 transform 元素添加 `will-change: transform, opacity`

## 验证方法

1. 在微信开发者工具中打开项目，切换到竞技场页面
2. 分别在初级/中级/高级竞技场发起战斗，确认：
   - 入场动画流畅（双方滑入 + VS弹出）
   - 第一回合我方攻击有技能名+元素特效+伤害数字+HP减少
   - 第一回合敌方反击有红色冲击+我方受伤+HP减少
   - 第二回合攻击更强（屏幕重震+暴击数字）
   - 胜利时敌方消失+粒子+胜利姿态
   - 失败时我方倒下+灰度滤镜
   - 结果面板正确显示回合数/总伤害/经验奖励
3. 测试三种神兽的元素特效视觉差异
4. 连续快速点击"挑战"不崩溃（计时器正确清理）
