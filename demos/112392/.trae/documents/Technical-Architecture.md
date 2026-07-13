# 象形文字字体动画制作工具 - 技术架构文档

## 1. 架构设计
```
┌──────────────────────────────────────────────┐
│                   前端层                       │
│  ┌─────────────┐  ┌─────────────────────┐    │
│  │  设置面板   │  │    动画预览区        │    │
│  │  (Controls) │  │  (Animation Stage)  │    │
│  └─────────────┘  └─────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │         动画时间轴 (Timeline)         │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

## 2. 技术选型
- **前端框架**：原生 HTML5 + CSS3 + JavaScript
- **字体加载**：@font-face 加载本地 TTF 字体
- **动画实现**：CSS Animations + CSS Transitions
- **布局方案**：CSS Grid + Flexbox

## 3. 文件结构
```
g:\phpstudy_pro\WWW1\JGW\JGWOK3\
├── index.html          # 主页面
├── styles.css          # 样式文件
├── app.js              # 应用逻辑
├── XXOBS-VF.ttf        # 象形甲骨文字体
├── XXSC-VF.ttf         # 象形简体字体
└── XXTC-VF.ttf         # 象形繁体字体
```

## 4. 字体定义
| 字体名称 | 文件名 | font-family 值 |
|----------|--------|----------------|
| 象形甲骨文 | XXOBS-VF.ttf | XXOBS-VF |
| 象形简体 | XXSC-VF.ttf | XXSC-VF |
| 象形繁体 | XXTC-VF.ttf | XXTC-VF |

## 5. 组件模块

### 5.1 设置面板 (Control Panel)
- 字体选择下拉框
- 字体大小滑块（范围：16-200）
- 字重滑块（范围：100-900，步长：100）
- 颜色选择器（字体颜色、背景颜色）
- 旋转角度滑块（范围：0-360）
- 翻转开关（水平翻转、垂直翻转）

### 5.2 动画预览区 (Animation Stage)
- 画布容器
- 字体展示元素
- 背景设置

### 5.3 动画时间轴 (Timeline)
- 入场动画选择器（淡入、滑入、缩放、弹跳）
- 循环动画选择器（脉冲、摇摆、呼吸、旋转）
- 出场动画选择器（淡出、滑出、缩小、消散）
- 路径动画开关和路径类型选择
- 字重动画开关和字重范围设置
- 动画时长控制
- 播放/暂停/重置按钮

## 6. 动画效果定义

### 6.1 入场动画
- `fadeIn` - 透明度0→1
- `slideInLeft` - 从左侧滑入
- `slideInRight` - 从右侧滑入
- `scaleIn` - 从小到大缩放
- `bounceIn` - 弹跳进入

### 6.2 循环动画
- `pulse` - 脉冲缩放
- `swing` - 左右摇摆
- `breath` - 呼吸效果
- `rotate` - 持续旋转

### 6.3 出场动画
- `fadeOut` - 透明度1→0
- `slideOutLeft` - 向左侧滑出
- `slideOutRight` - 向右侧滑出
- `scaleOut` - 从大到小缩小
- `dissolve` - 消散效果

## 7. 状态管理
```javascript
state = {
  fontFamily: 'XXOBS-VF',
  fontSize: 80,
  fontWeight: 400,
  color: '#000000',
  backgroundColor: '#FFFFFF',
  rotate: 0,
  flipX: false,
  flipY: false,
  entryAnimation: 'fadeIn',
  loopAnimation: 'pulse',
  exitAnimation: 'fadeOut',
  pathAnimation: { enabled: false, type: 'linear' },
  weightAnimation: { enabled: false, min: 100, max: 900 }
}
```
