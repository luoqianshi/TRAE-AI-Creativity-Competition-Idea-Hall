# 儿童英语课程制作技能

## 适用场景
当需要为6-7岁儿童制作单页HTML英语启蒙课程时使用。

## 核心原则
1. **单文件HTML**：所有代码、样式、逻辑集成在一个HTML文件中
2. **移动端优先**：适配手机、iPad，触摸友好
3. **无需后端**：纯前端，可部署到任何静态托管服务
4. **语音合成**：使用浏览器Web Speech API朗读英文

## 文件结构

```
english-greetings-lesson1/
├── english-greetings-lesson1.html   # 主文件（所有代码）
├── assets/                           # 图片资源
│   ├── cover_1.jpg ~ cover_12.jpg   # 课程封面
│   ├── storybook_1.png ~ storybook_12.png  # 绘本插图
│   └── hero_cover_1280x720.jpg      # 首页横幅
└── _shared/fonts/                    # 字体文件
    ├── Outfit-Bold.ttf
    ├── Outfit-Regular.ttf
    └── SmoochSans-Medium.ttf
```

## 课程数据结构

每个主题包含以下字段：

```javascript
{
  id: 1,                          // 主题编号
  title: "Colours",               // 英文标题
  titleCn: "多彩颜色",            // 中文标题
  emoji: "🎨",                    // 主题图标
  color: "#FF6B6B",               // 主题色
  words: {
    basic: [                      // 课内基础词（6个）
      { en: "red", cn: "红色", emoji: "🔴" }
    ],
    extra: [                      // 课外拓展词（4-5个）
      { en: "pink", cn: "粉色", emoji: "💗" }
    ]
  },
  sentences: [                    // 重点句型（3句）
    { en: "It is red.", cn: "它是红色的。" }
  ],
  dialogue: [                     // 对话练习（4轮）
    { role: "teacher", en: "What color is it?", cn: "这是什么颜色？" },
    { role: "child", en: "It is red!", cn: "是红色！" }
  ],
  story: {                        // 绘本信息
    title: "Brown Bear, Brown Bear, What Do You See?",
    desc: "经典颜色认知绘本..."
  },
  video: {                        // B站视频
    title: "颜色歌 Colors Song",
    desc: "SSS经典儿歌，节奏欢快...",
    url: "https://www.bilibili.com/video/BVxxxxx/",
    bvid: "BVxxxxx"
  },
  game: {                         // 互动游戏
    type: "color-match",          // 游戏类型
    instruction: "看颜色选单词！"  // 游戏说明
  }
}
```

## 图标设计规范

### 6-7岁儿童辨识度原则
1. **日常常见物品**优先：棒球帽🧢 > 礼帽🎩
2. **动作/姿态**优于表情：摸头🙆 > 笑脸😊
3. **职业特征**区分人物：围裙妈妈👩‍🍳 > 普通女性👩
4. **形状差异**区分文具：钢笔尖✒️ > 圆珠笔🖊️

### 主题句型匹配
| 主题类型 | 推荐句型 | 示例 |
|---------|---------|------|
| 名词（颜色/动物/食物） | It is... / Look! It is a... | It is red. |
| 家庭成员 | He/She is my... | He is my father. |
| 身体部位 | I have... / Touch your... | I have two eyes. |
| 日常动作 | I... / I like to... | I eat an apple. |
| 衣物 | I wear... / Put on your... | I wear a shirt. |
| 问候语 | 完整问候句 | Hello! Nice to meet you! |
| 数字 | I have... fingers / 算式 | 3 + 2 = ? |

## 游戏类型清单

| 类型 | 说明 | 适用主题 |
|------|------|---------|
| color-match | 颜色匹配 | Colours |
| count-select | 算式选择 | Numbers |
| image-word | 图片选词 | Animals, Food |
| match-family | 家庭成员匹配 | Family |
| food-sort | 食物分类 | Food |
| animal-sound | 动物特征描述 | Animals |
| body-point | 身体部位指令 | Body Parts |
| action-select | 动作选择 | Daily Actions |
| clothes-match | 衣物匹配 | Clothes |
| season-match | 季节匹配 | Time & Seasons |
| hobby-sort | 爱好分类 | Toys & Hobbies |
| greeting-scene | 场景选问候语 | Greetings |

## 游戏答错处理逻辑

```
用户点击选项
  ├── 答对 → 显示"Correct!" → 加分 → 1.5秒后下一题
  └── 答错
        ├── 第一次 → 禁用该按钮 → 显示"Try again!" → 用户可再选
        └── 第二次（或选其他也错） → 高亮正确答案 → 显示答案 → 2秒后下一题
```

关键代码：
- 用 `gameState.questionWrong` 追踪整道题状态（非单个按钮）
- 第一次答错：`el.style.pointerEvents = 'none'; el.style.opacity = '0.5';`
- 每题开始时重置：`gameState.questionWrong = false;`

## 绘本原声资源

每个主题配对1本经典绘本，提供B站原声朗读链接：

| 主题 | 绘本 | B站资源类型 |
|------|------|------------|
| Colours | Brown Bear, Brown Bear | 唱版 + 朗读版 |
| Numbers | Five Little Monkeys | 儿歌版 + 朗读版 |
| School Things | Dear Zoo | 绘本朗读 + 字幕版 |
| Family | Little Bear | 绘本故事 + 分级读物 |
| Food | The Very Hungry Caterpillar | 原版动画 + 唱版 |
| Animals | Dear Zoo | 绘本朗读 + 字幕版 |
| Body Parts | From Head to Toe | 原版朗读 + 歌谣版 |
| Daily Actions | We're Going on a Bear Hunt | 绘本故事 + 动画短片 |
| Clothes | Pete the Cat | 原声动画 + 绘本朗读 |
| Time & Seasons | The Very Hungry Caterpillar | 原版动画 + 唱版 |
| Toys & Hobbies | Go Away, Big Green Monster! | 绘本朗读 + 动画版 |
| Greetings | Oxford Reading Tree L1 | L1合集 + 单本朗读 |

## 个性化定制清单

每次制作新课程时检查：

- [ ] 浏览器标签标题：`<title>XX的英语小课堂</title>`
- [ ] 首页大标题：`欢迎来到XX的英语小课堂！`
- [ ] 开场白语音：`speak('Hello XX! Welcome to...')`
- [ ] 开场白文字：`Hello XX! Welcome!`
- [ ] 课程主题数据（12个主题）
- [ ] 图标辨识度检查（6-7岁儿童）
- [ ] 例句按主题类型定制
- [ ] 绘本原声B站链接验证

## 部署步骤

1. 确认 `english-greetings-lesson1.html` 为最新版本
2. 连同 `assets/` 和 `_shared/fonts/` 文件夹打包成 zip
3. 上传到 WorkBuddy / CodeBuddy 等静态托管服务
4. 获取在线链接，手机/iPad浏览器打开测试

## 注意事项

1. **B站iframe**：移动端托管服务可能因iframe加载外部资源而崩溃，建议改用链接跳转
2. **语音识别**：移动端`file://`协议或HTTP环境不支持，建议降级为纯跟读模式
3. **底部导航**：`position: fixed`在移动端可能被内容遮挡，建议用`position: sticky`
4. **字体文件**：确保字体文件路径正确，或使用base64内嵌
