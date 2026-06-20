# AI塔罗牌 - 技术架构文档

## 1. 项目架构

```
神奇Ai塔罗牌/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── app.js          # JavaScript逻辑
├── images/
│   ├── card-back.png   # 卡片背面
│   └── cards/          # 塔罗牌正面图片
│       ├── card-01.png
│       ├── card-02.png
│       └── ...
└── assets/
    └── tarot-data.js   # 塔罗牌数据
```

## 2. 技术栈

- **前端**: 原生HTML5 + CSS3 + JavaScript (ES6+)
- **构建工具**: 无需构建工具，直接运行
- **动画**: CSS3动画 + JavaScript控制
- **响应式**: CSS媒体查询

## 3. 核心模块

### 3.1 状态管理
```javascript
const state = {
  currentPhase: 'input', // input | selection | result
  question: '',
  selectedCards: [],     // 已选中的卡片索引
  revealedCards: []      // 已翻开的卡片
}
```

### 3.2 流程控制
1. **输入阶段**: 显示问题输入界面
2. **选择阶段**: 显示5张卡片，等待用户选择2张
3. **结果阶段**: 翻开卡片，显示内容和标题

## 4. 路由设计

单页面应用，无需路由：
- 所有阶段在同一个页面
- 通过JavaScript控制显示/隐藏不同阶段

## 5. 图片资源规范

### 卡片尺寸
- 推荐尺寸: 200x350px
- 比例: 2:3.5 (标准塔罗牌比例)

### 图片格式
- PNG格式，支持透明背景
- 卡片背面: `card-back.png`
- 卡片正面: `card-01.png` ~ `card-78.png`

## 6. 塔罗牌数据模型

```javascript
const tarotCards = [
  {
    id: Number,          // 卡片编号 1-78
    name: String,        // 卡片名称
    image: String,       // 图片路径
    description: String  // 卡片描述
  }
]
```

## 7. 核心交互

### 7.1 卡片选择
- 点击卡片选中/取消选中
- 最多选择2张
- 已选卡片高亮显示

### 7.2 卡片翻转
- CSS 3D翻转动画
- 点击确定后翻转

### 7.3 阶段切换
- 平滑过渡动画
- 状态保持

## 8. 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 9. 性能考虑

- 图片延迟加载
- CSS动画优化
- 最小化DOM操作
