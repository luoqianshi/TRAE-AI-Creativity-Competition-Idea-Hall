# Windows 桌面 AI 伴侣（模拟女友）— 完整设计方案

---

## 一、创意大赛报名大纲

### 1. 创意名称 + 创意介绍

**创意名称**：**「桌面恋人」— Windows 智能桌面 AI 伴侣**

**想解决什么问题**：
现代都市青年长期面对电脑，工作/游戏/学习时缺乏情感陪伴。现有的 AI 聊天工具要么藏在浏览器里、要么需要掏出手机，无法和用户的桌面行为产生联动——你在游戏里五杀了，没人替你欢呼；你深夜加班，没人关心你累不累。

**为什么会想到做这个**：
游戏里拿到五杀的那一刻，兴奋地想和谁分享，却发现身边空无一人。如果桌面上有一个"她"，能看到你在干嘛、理解你在玩什么、在你高光时刻第一时间为你喝彩——那种陪伴感，比任何聊天软件都真实。

**大概是什么产品**：
一款 Windows 桌面悬浮 AI 伴侣应用（WPF 原生），以动画角色形式常驻桌面，可监控用户前台行为，通过大语言模型实现自然对话交互。

---

### 2. 目标用户及痛点

**面向哪些用户**：
- 独自租住的年轻上班族 / 游戏玩家（18-35 岁）
- 经常熬夜加班、长时间面对电脑的知识工作者
- 喜欢二次元文化、对 AI 角色扮演有兴趣的用户
- 轻度社恐、在线下社交中感到压力但在虚拟关系中更自在的人

**在什么场景下使用**：
- 打游戏时：角色看到你五杀/吃鸡/通关，自动发出欢呼和夸奖
- 深夜加班时：角色会心疼你、提醒你休息，偶尔冒出几句撒娇的话
- 无聊发呆时：角色会主动搭话，聊天气、聊心情、随机小日常
- 学习/工作时：角色安静陪伴，偶尔递上一句"加油哦"

**当前痛点（如果没有这个产品）**：
- 现有 AI 聊天工具（ChatGPT/豆包）交互被动，不会主动找你说话
- 虚拟女友 App 都在手机上，和桌面行为完全割裂——它们看不到你在干什么
- 市面上的桌面宠物只有装饰作用，没有 AI 对话能力
- 真实社交对某些用户来说有压力，但情感需求又是刚需

---

### 3. 价值与意义

**社会价值**：
- 为城市独居青年提供低成本、低门槛的情感陪伴，缓解孤独感
- 提供一种"零压力社交"的替代方案，降低轻度社恐用户的情感获取门槛
- 角色可自由设定人格，用户能自定义"理想陪伴者"，满足多元情感需求

**商业价值**：
- 虚拟伴侣市场 2025 年全球超百亿美元且高速增长（参考 Character.AI、Replika 等产品）
- 差异化切入点：桌面级 + 行为感知联动，目前市场几乎没有同类竞品
- 商业模式可拓展：付费角色皮肤/动画包、高级 AI 模型订阅、角色市场（UGC 交易）

---

## 二、技术架构总览

### 2.1 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| 框架 | **C# WPF (.NET 8)** | Windows 原生，透明悬浮窗能力最强，安装包小（~50MB），资源占用低 |
| UI 模式 | **MVVM**（CommunityToolkit.Mvvm） | WPF 标准架构，数据绑定成熟 |
| AI 后端 | **Ollama（本地）+ OpenAI 兼容 API（云端）** | 双模式，用户可自由切换；隐私场景用本地，对话质量场景用云端 |
| 角色动画 | **Lottie 矢量动画** | 文件小（50-200KB），设计师友好，WPF 有可用包（LottieSharp） |
| 本地存储 | **SQLite** | 聊天记录、角色配置持久化，零配置 |
| 依赖注入 | **Microsoft.Extensions.DependencyInjection** | 解耦服务，便于测试和扩展 |

### 2.2 整体架构分层

```
┌──────────────────────────────────────────────────────┐
│                 表现层 (Presentation)                  │
│  ┌──────────────────┐  ┌─────────────────────────┐  │
│  │ 悬浮角色窗口      │  │ 对话框窗口/控制面板       │  │
│  │ (RenderLayerWnd) │  │ (ChatDialogWnd/Settings) │  │
│  └──────────────────┘  └─────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│                  业务逻辑层 (Core)                     │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐ │
│  │ AI对话引擎 │ │ 角色管理器 │ │ 行为事件引擎        │  │
│  │(LlmService)│ │(CharMgr) │ │(BehaviorEngine)    │  │
│  └──────────┘ └──────────┘ └─────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐ │
│  │ 提示词构建 │ │ 配置服务  │ │ 对话触发调度器       │  │
│  │(PromptBld)│ │(CfgSvc)  │ │(ConversationTrigger)│  │
│  └──────────┘ └──────────┘ └─────────────────────┘ │
├──────────────────────────────────────────────────────┤
│                基础设施层 (Infrastructure)              │
│  ┌───────────┐ ┌───────────┐ ┌───────────────────┐ │
│  │ Win32 API │ │ SQLite   │ │ HTTP 客户端        │  │
│  │ 互操作层   │ │ 本地存储  │ │ (LLM API+Ollama)  │  │
│  │(WindowMon)│ │(ChatHis) │ │                   │  │
│  └───────────┘ └───────────┘ └───────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 2.3 核心数据流

```
[Win32窗口监控] → [行为事件引擎] → [AI对话引擎] → [角色动画触发]
       │                 │                │               │
       v                 v                v               v
 [前台窗口文本]    [事件规则匹配]   [LLM/Ollama API]  [Lottie播放]
                                                          │
                                                          v
                                                  [对话框UI更新]
                                                  [悬浮窗表情变化]
```

---

## 三、核心模块详细设计

### 3.1 悬浮角色窗口（双层窗口架构）

**设计思路**：使用两个独立窗口层叠，各司其职：

```
层级结构：
┌─────────────────────────────────┐
│ 顶层：交互层 (InteractionLayer)   │  ← 可点击的 WPF 控件区域
│ AllowsTransparency=true           │    处理按钮点击、拖拽
│ 局部透明，仅控件区域不透明        │
├─────────────────────────────────┤
│ 底层：渲染层 (RenderLayer)        │  ← 角色动画/表情展示
│ WS_EX_LAYERED | WS_EX_TRANSPARENT│    完全鼠标穿透
│ 使用 UpdateLayeredWindow 渲染    │
└─────────────────────────────────┘
```

**关键实现**：
- 底层窗口设置 `WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE`，实现完全透明 + 鼠标穿透 + 不抢占焦点
- 顶层窗口 `AllowsTransparency="True"` + `Background="Transparent"`，仅局部控件区域设为 `#01000000`（几乎透明但保留点击能力）
- 两窗口位置通过 `WindowSyncManager` 实时同步

**窗口行为**：
- 不在任务栏显示（`ShowInTaskbar="False"`）
- 始终置顶（`Topmost="True"`）
- 可通过拖拽控件移动位置
- 鼠标悬停时显示交互按钮（对话/设置/换角色）

### 3.2 前台窗口监控

**混合监控策略**：

| 检测方式 | 时机 | CPU 开销 |
|----------|------|---------|
| **WinEvent Hook** | 窗口切换时（系统推送） | 零轮询开销 |
| **自适应 Timer** | 空闲 2000ms / 切换中 500ms / 游戏中 1000ms | 可忽略 |

**监控流程**：
1. `SetWinEventHook(EVENT_SYSTEM_FOREGROUND)` 注册系统级钩子
2. 钩子触发 → 获取 `GetForegroundWindow()` → `GetWindowText()` → `GetWindowThreadProcessId()`
3. 将 `(窗口标题, 进程名, 进程ID, 时间戳)` 以事件形式发布
4. `BehaviorEngine` 订阅事件，匹配规则

**隐私保障**：
- 窗口监控数据**仅存于内存**，不落盘、不上传、不序列化
- 仅提取进程名和窗口标题供行为匹配，不收集任何文件内容或个人数据
- 用户可在设置中关闭窗口监控功能

### 3.3 AI 对话引擎（双 Provider 架构）

**统一抽象接口**：

```csharp
public interface ILlmProvider
{
    string ProviderName { get; }
    IAsyncEnumerable<string> ChatStreamAsync(List<ChatMessage> history, CancellationToken ct);
    Task<bool> IsAvailableAsync();
    Task<List<string>> GetAvailableModelsAsync();
}
```

**两种实现**：

| Provider | 地址 | 适用场景 |
|----------|------|---------|
| `OllamaLlmProvider` | `http://localhost:11434/api/chat` | 隐私模式、离线使用 |
| `OpenAiLlmProvider` | 兼容 OpenAI 的任意 API 端点 | 高质量对话、无需本地显卡 |

**LlmService 切换管理**：
- 启动时自动检测 Ollama 可用性，优先使用本地模型
- 用户可在设置面板手动切换 Provider
- 切换时校验 Provider 可用性，失败则降级到备用 Provider

### 3.4 角色系统

**角色档案模型**：

```json
{
  "id": "uuid",
  "name": "小萤",
  "age": 21,
  "gender": "female",
  "personality": "活泼开朗、爱撒娇、偶尔毒舌",
  "identity": "自称是来自异世界的见习魔法师，因为魔法失误被传送到你的电脑里",
  "relationship": "女友",
  "traits": ["主动", "好奇心强", "爱吐槽", "打游戏时会变热血"],
  "appearance": {
    "avatar_path": "default_01",
    "hair_color": "银色",
    "eye_color": "紫色"
  },
  "voice_style": "活泼少女音"
}
```

**角色来源**：
1. **预设角色库**（5-10 个）：附带默认 Lottie 动画和性格设定
2. **随机生成**：从性格/身份/外观模板库中随机组合，每次生成独一无二的角色
3. **自定义创建**：用户通过设置面板逐项设定，所见即所得

**角色持久化**：
- 使用 SQLite 存储角色档案（`character_profiles` 表）
- 支持导出/导入 JSON 配置文件
- 可保存多个角色，随时切换

### 3.5 行为感知与游戏事件联动

**游戏检测配置**（JSON，可扩展）：

```json
{
  "games": [
    {
      "processName": "League of Legends.exe",
      "displayName": "英雄联盟",
      "ocrRegion": { "xRatio": 0.3, "yRatio": 0.75, "wRatio": 0.4, "hRatio": 0.08 },
      "events": [
        {
          "keywords": ["五杀", "penta kill"],
          "reactions": [
            "天哪！五杀！！{name}你太强了！！！(≧▽≦)",
            "五杀五杀五杀！我要把这个时刻记下来！！"
          ]
        },
        {
          "keywords": ["超神", "legendary"],
          "reactions": [
            "Legendary！{name}已经完全无人能挡了呢～",
            "对面都被你打哭了吧！嘿嘿～"
          ]
        }
      ]
    }
  ]
}
```

**事件检测流程**：
1. 监控到前台进程匹配 `League of Legends.exe`
2. 启用 OCR 轮询（每 2 秒截取游戏窗口指定区域）
3. 使用 `Windows.Media.Ocr.OcrEngine` 识别击杀提示文字
4. 匹配关键词 → 触发对应 `reactions` → 角色播放表情动画 + 弹出对话气泡

### 3.6 主动对话调度器

**设计目标**：让角色看起来"有生命"，而不是等用户先开口。

**触发规则**：

| 触发条件 | 概率 | 示例 |
|----------|------|------|
| 用户静止/发呆 5 分钟 | 30% | "在发呆吗？要不要聊聊天？" |
| 检测到浏览器（非工作） | 25% | "在看什么呢？让我也看看～" |
| 深夜（22:00-02:00）+ 前台活跃 | 40% | "这么晚还在忙？该休息了哦…（心疼" |
| 开机后首次检测到活动 | 50% | "早上好！今天也要加油哦～" |
| 用户切换应用超过 10 次/分钟 | 35% | "感觉你很焦虑呢，遇到什么问题了吗？" |
| 游戏结束后（游戏进程退出） | 60% | "打得怎么样？赢了没？" |

**冷却机制**：
- 每次主动对话后冷却 3-10 分钟（可配）
- 游戏进行中冷却时间加倍，避免干扰
- 用户在聊天窗口中时暂停自动触发

### 3.7 开机自启

**实现方式**：写入注册表

```
路径：HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
键名：AIC Companion
键值："C:\path\to\AiCompanion.exe" --autostart --minimized
```

**启动行为**：
- `--autostart`：标记为系统自启，非用户手动启动
- `--minimized`：启动后最小化到系统托盘，仅显示悬浮角色
- 用户可在设置面板一键开关此功能

### 3.8 对话框 UI

- 聊天气泡式布局，类似微信/QQ
- 支持 Markdown 渲染（表情/加粗/换行）
- 打字中指示器（呼吸动画）
- 输入框支持文字输入 + 快捷回复按钮
- 角色消息附带小头像和当前表情
- 聊天历史可按"今天/昨天/更早"分组

---

## 四、项目文件结构

```
AiCompanion/
├── AiCompanion.sln
│
├── src/
│   ├── AiCompanion.App/                    # 主应用（WPF UI）
│   │   ├── App.xaml / App.xaml.cs           # 启动入口、命令行解析、DI 配置
│   │   ├── Views/                           # XAML 视图
│   │   │   ├── RenderLayerWindow.xaml       # 底层角色渲染窗口（鼠标穿透）
│   │   │   ├── InteractionLayerWindow.xaml  # 顶层交互窗口
│   │   │   ├── ChatDialogWindow.xaml        # 对话框
│   │   │   ├── SettingsWindow.xaml          # 设置面板
│   │   │   └── Controls/                    # 自定义控件
│   │   │       ├── ChatBubble.xaml          # 聊天气泡
│   │   │       └── TypingIndicator.xaml     # 打字指示器
│   │   ├── ViewModels/                      # MVVM ViewModel
│   │   │   ├── ChatViewModel.cs
│   │   │   ├── SettingsViewModel.cs
│   │   │   └── SystemTrayViewModel.cs
│   │   ├── Assets/                          # 静态资源
│   │   │   ├── Lottie/expressions/          # 表情动画 (idle/happy/sad/angry/surprised/blush/talking)
│   │   │   ├── Icons/                       # 应用图标
│   │   │   └── Sounds/                      # 提示音效（可选）
│   │   └── Converters/                      # WPF 值转换器
│   │
│   ├── AiCompanion.Core/                    # 核心业务逻辑（无 UI 依赖）
│   │   ├── Models/
│   │   │   ├── CharacterProfile.cs          # 角色档案
│   │   │   ├── ChatMessage.cs               # 聊天消息
│   │   │   ├── ChatSession.cs               # 对话会话
│   │   │   ├── GameConfig.cs / GameEvent.cs # 游戏配置/事件
│   │   │   └── WindowActivitySnapshot.cs    # 窗口活动快照
│   │   ├── Services/
│   │   │   ├── ILlmProvider.cs              # LLM 提供器接口
│   │   │   ├── OpenAiLlmProvider.cs         # OpenAI 兼容实现
│   │   │   ├── OllamaLlmProvider.cs         # Ollama 本地实现
│   │   │   ├── LlmService.cs                # LLM 提供器切换管理
│   │   │   ├── ICharacterManager.cs         # 角色管理接口
│   │   │   ├── CharacterManager.cs          # 角色 CRUD + 随机生成
│   │   │   ├── IPromptBuilder.cs            # 提示词构建接口
│   │   │   ├── PromptBuilder.cs             # System Prompt 动态组装
│   │   │   ├── IBehaviorEngine.cs           # 行为引擎接口
│   │   │   ├── BehaviorEngine.cs            # 事件驱动行为调度
│   │   │   ├── IConversationTrigger.cs      # 主动对话触发接口
│   │   │   ├── ConversationTrigger.cs       # 主动对话调度逻辑
│   │   │   └── IConfigService.cs / ConfigService.cs  # JSON 配置读写
│   │   ├── Events/                          # 领域事件
│   │   └── Utils/
│   │       ├── CharacterGenerator.cs        # 角色随机生成器
│   │       └── EmotionAnalyzer.cs           # 简单情绪分析
│   │
│   ├── AiCompanion.Infrastructure/          # 基础设施层
│   │   ├── Win32/
│   │   │   ├── NativeMethods.cs             # P/Invoke 声明汇总
│   │   │   ├── WindowMonitor.cs             # 前台窗口监控（WinEvent Hook）
│   │   │   ├── ProcessHelper.cs             # 进程信息辅助
│   │   │   └── ScreenCaptureHelper.cs       # 屏幕截图（OCR 用）
│   │   ├── Storage/
│   │   │   ├── ChatHistoryRepository.cs     # 聊天记录存储
│   │   │   └── CharacterProfileRepository.cs # 角色档案存储
│   │   ├── Startup/
│   │   │   └── StartupManager.cs            # 注册表开机自启管理
│   │   └── Configuration/
│   │       └── AppSettings.cs               # 强类型配置类
│   │
│   └── AiCompanion.Animation/               # 动画子系统
│       ├── IAnimationController.cs          # 动画控制器接口
│       ├── LottieAnimationController.cs     # Lottie 实现
│       ├── SpriteAnimationController.cs     # 序列帧备用方案
│       └── AnimationQueueManager.cs         # 动画队列/过渡管理
│
├── data/                                    # 运行时数据（部署时包含）
│   ├── game_config.json                     # 游戏检测配置
│   └── character_templates.json             # 角色生成模板库
│
├── tests/
│   ├── AiCompanion.Core.Tests/              # 核心逻辑单元测试
│   └── AiCompanion.Infrastructure.Tests/    # 基础设施测试
│
├── .gitignore
└── README.md
```

---

## 五、关键设计决策

### 5.1 隐私保护策略（用户明确要求）

| 数据 | 存储方式 | 是否上传 | 说明 |
|------|----------|----------|------|
| 窗口标题/进程名 | 仅内存，不落盘 | 永不 | 仅用于行为匹配 |
| AI 对话内容 | SQLite 本地加密 | 仅当使用云端 LLM 时不可避免 | 本地模型完全离线 |
| 角色配置文件 | SQLite + JSON 导出 | 否 | 用户可自主备份 |
| 用户行为日志 | 不记录 | 否 | 无埋点、无遥测 |

### 5.2 NuGet 包依赖

```xml
<PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.*" />
<PackageReference Include="CommunityToolkit.Mvvm" Version="8.*" />
<PackageReference Include="Microsoft.Data.Sqlite" Version="8.0.*" />
<PackageReference Include="LottieSharp" Version="2.*" />
<!-- OCR 用于游戏事件检测 -->
<PackageReference Include="Microsoft.Windows.SDK.Contracts" Version="10.*" />
```

### 5.3 为什么不选 Electron

虽然 Electron 生态丰富（如 Super Agent Party），但：
- 安装包 ~1GB，启动 25 秒+，对桌面悬浮应用来说不可接受
- 透明窗口 + WebView2 渲染极为困难
- WPF 原生 50MB 安装包、亚秒级启动、透明窗口零配置

---

## 六、实现阶段划分

### 阶段一：最小可用原型（MVP）
- [ ] 透明悬浮窗 + 角色 Lottie 动画展示
- [ ] 基础对话框（文字输入 + LLM API 对话）
- [ ] 角色选择/随机生成
- [ ] 单一 LLM Provider（Ollama 本地）

### 阶段二：行为感知
- [ ] Win32 窗口监控 + 进程识别
- [ ] 主动对话调度器
- [ ] 游戏事件检测（LOL 五杀等）
- [ ] 双 Provider 切换（Ollama + OpenAI）

### 阶段三：完整体验
- [ ] 设置面板（角色自定义、Provider 配置、开机自启）
- [ ] 聊天历史与角色持久化
- [ ] 表情动画与对话联动
- [ ] 系统托盘 + 开机自启
- [ ] 多角色切换

### 阶段四：打磨与扩展
- [ ] 角色动画包市场（UGC）
- [ ] 语音对话（TTS/STT）
- [ ] 更多游戏事件支持
- [ ] 用户数据导出/导入

---

## 七、验证方式

1. **窗口测试**：启动后角色悬浮窗出现在桌面右上角，可拖拽移动，鼠标穿透区域正确
2. **对话测试**：点击对话框按钮 → 输入文字 → 收到 LLM 流式回复 → Lottie 表情联动变化
3. **监控测试**：打开 LOL → 确认日志打印"检测到英雄联盟" → 游戏内五杀 → 角色弹出欢呼气泡
4. **主动触发测试**：静置 5 分钟不操作 → 角色主动发起对话
5. **开机自启测试**：重启电脑 → 登录后角色自动出现在桌面（托盘最小化）
6. **隐私测试**：抓包确认无用户行为数据外发

---

## 八、假设与前提

- 用户操作系统为 Windows 10/11，已安装 .NET 8 Runtime
- 本地 Ollama 模式需要用户自行安装 Ollama 并下载模型（qwen2.5:7b 推荐）
- 云端 LLM 需要用户自行提供 API Key
- Lottie 动画资源使用 LottieFiles 免费素材或自行制作
- OCR 游戏事件检测依赖 Windows 10+ 内置 OCR 引擎，中文识别准确率约 85%-95%，可通过配置多关键词容错
