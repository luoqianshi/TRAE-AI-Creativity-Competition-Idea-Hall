# YouthKnotsBond iOS 前端完整代码

## 📁 项目结构

```
YouthKnotsBond/
├── Models/
│   └── Models.swift                    ✅ 已生成
├── Services/
│   ├── APIService.swift                ✅ 已生成
│   ├── AuthService.swift               ✅ 已生成
│   ├── ConversationService.swift       ✅ 已生成
│   ├── CardService.swift               ✅ 已生成
│   ├── TagService.swift                ✅ 已生成
│   ├── TimelineService.swift           ✅ 已生成
│   ├── PaymentService.swift            ✅ 已生成
│   └── StorageService.swift            ✅ 已生成
├── ViewModels/
│   ├── AuthViewModel.swift             ✅ 已生成
│   ├── ConversationViewModel.swift     ✅ 已生成
│   ├── CardViewModel.swift             ✅ 已生成
│   ├── TagViewModel.swift              ✅ 已生成
│   └── TimelineViewModel.swift         ✅ 已生成
├── Views/
│   ├── Auth/
│   │   ├── LoginView.swift             📝 需要添加
│   │   ├── VerificationCodeView.swift  📝 需要添加
│   │   └── ResetPasswordView.swift     📝 需要添加
│   ├── Chat/
│   │   ├── ChatView.swift              📝 需要添加
│   │   ├── MessageBubbleView.swift     📝 需要添加
│   │   └── CreateCardSheet.swift       📝 需要添加
│   ├── Card/
│   │   ├── CardListView.swift          📝 需要添加
│   │   ├── CardDetailView.swift        📝 需要添加
│   │   └── EditCardView.swift          📝 需要添加
│   ├── Timeline/
│   │   ├── TimelineView.swift          📝 需要添加
│   │   └── TimelineNodeView.swift      📝 需要添加
│   ├── Payment/
│   │   ├── PurchaseView.swift          📝 需要添加
│   │   └── OrderListView.swift         📝 需要添加
│   ├── Profile/
│   │   └── ProfileView.swift           📝 需要添加
│   └── MainTabView.swift               📝 需要添加
├── Utils/
│   ├── NetworkError.swift              ✅ 已生成
│   ├── Constants.swift                 📝 需要添加
│   └── Extensions.swift                📝 需要添加
└── YouthKnotsBondApp.swift             📝 需要添加
```

## ✅ 已完成的核心代码

### 1. 数据模型层 (Models/)
- ✅ User, Conversation, ProblemCard, Tag, TimelineNode
- ✅ PaymentOrder, APIResponse, LoginResponse, ChatResponse
- ✅ 所有响应模型和分页模型

### 2. 网络服务层 (Services/)
- ✅ APIService: 通用网络请求封装
- ✅ AuthService: 登录、注册、密码管理
- ✅ ConversationService: 对话管理
- ✅ CardService: 问题卡片CRUD
- ✅ TagService: 标签管理
- ✅ TimelineService: 时间轴数据
- ✅ PaymentService: 支付相关
- ✅ StorageService: 本地存储

### 3. 视图模型层 (ViewModels/)
- ✅ AuthViewModel: 认证状态管理
- ✅ ConversationViewModel: 对话状态管理
- ✅ CardViewModel: 卡片状态管理
- ✅ TagViewModel: 标签状态管理
- ✅ TimelineViewModel: 时间轴状态管理

### 4. 工具类 (Utils/)
- ✅ NetworkError: 网络错误定义

## 📝 需要添加的UI页面代码

由于代码量较大，以下是关键页面的实现框架：

### 主应用入口 (YouthKnotsBondApp.swift)

```swift
import SwiftUI

@main
struct YouthKnotsBondApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            if authViewModel.isAuthenticated {
                MainTabView()
                    .environmentObject(authViewModel)
            } else {
                LoginView()
                    .environmentObject(authViewModel)
            }
        }
    }
}
```

### 主标签页 (MainTabView.swift)

```swift
import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var conversationVM = ConversationViewModel()
    @StateObject private var cardVM = CardViewModel()
    @StateObject private var timelineVM = TimelineViewModel()
    
    var body: some View {
        TabView {
            // 对话页面
            ChatView()
                .environmentObject(conversationVM)
                .tabItem {
                    Label("对话", systemImage: "message.fill")
                }
            
            // 问题卡片
            CardListView()
                .environmentObject(cardVM)
                .tabItem {
                    Label("卡片", systemImage: "square.stack.fill")
                }
            
            // 时间轴
            TimelineView()
                .environmentObject(timelineVM)
                .tabItem {
                    Label("时间轴", systemImage: "clock.fill")
                }
            
            // 个人中心
            ProfileView()
                .tabItem {
                    Label("我的", systemImage: "person.fill")
                }
        }
        .accentColor(.pink)
    }
}
```

### 登录页面 (LoginView.swift)

```swift
import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var phone = ""
    @State private var code = ""
    @State private var countdown = 0
    @State private var timer: Timer?
    
    var body: some View {
        VStack(spacing: 30) {
            // Logo
            VStack(spacing: 16) {
                Image(systemName: "heart.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.pink)
                
                Text("青春结")
                    .font(.system(size: 32, weight: .bold))
                
                Text("陪伴您和孩子共同成长")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 60)
            
            Spacer()
            
            // 输入框
            VStack(spacing: 20) {
                // 手机号
                HStack {
                    Image(systemName: "phone.fill")
                        .foregroundColor(.gray)
                    TextField("请输入手机号", text: $phone)
                        .keyboardType(.phonePad)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                // 验证码
                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundColor(.gray)
                    TextField("请输入验证码", text: $code)
                        .keyboardType(.numberPad)
                    
                    Button(action: sendCode) {
                        Text(countdown > 0 ? "\(countdown)s" : "获取验证码")
                            .font(.system(size: 14))
                            .foregroundColor(countdown > 0 ? .gray : .pink)
                    }
                    .disabled(countdown > 0 || phone.isEmpty)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
            }
            .padding(.horizontal, 30)
            
            // 登录按钮
            Button(action: login) {
                if authViewModel.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("登录/注册")
                        .font(.headline)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(phone.isEmpty || code.isEmpty ? Color.gray : Color.pink)
            .foregroundColor(.white)
            .cornerRadius(12)
            .padding(.horizontal, 30)
            .disabled(phone.isEmpty || code.isEmpty || authViewModel.isLoading)
            
            // 错误提示
            if let error = authViewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding(.horizontal, 30)
            }
            
            Spacer()
            
            Text("登录即表示同意《用户协议》和《隐私政策》")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.bottom, 30)
        }
    }
    
    private func sendCode() {
        Task {
            await authViewModel.sendVerificationCode(phone: phone)
            startCountdown()
        }
    }
    
    private func login() {
        Task {
            await authViewModel.login(phone: phone, code: code)
        }
    }
    
    private func startCountdown() {
        countdown = 60
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if countdown > 0 {
                countdown -= 1
            } else {
                timer?.invalidate()
            }
        }
    }
}
```

### 对话页面 (ChatView.swift)

```swift
import SwiftUI

struct ChatView: View {
    @EnvironmentObject var conversationVM: ConversationViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var inputText = ""
    @State private var showCreateCard = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 顶部信息栏
                HStack {
                    Text("剩余次数: \(authViewModel.user?.remainingCount ?? 0)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    if authViewModel.user?.isFirstTime == true {
                        Text("🎁 首次免费")
                            .font(.caption)
                            .foregroundColor(.pink)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                
                // 对话列表
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(conversationVM.conversations) { conversation in
                            VStack(alignment: .leading, spacing: 8) {
                                // 用户消息
                                MessageBubbleView(
                                    text: conversation.userInput,
                                    isUser: true
                                )
                                
                                // Agent回复
                                MessageBubbleView(
                                    text: conversation.agentReply,
                                    isUser: false
                                )
                                
                                // 核心记录
                                if let coreRecord = conversation.coreRecord {
                                    Text("核心记录：\(coreRecord)")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                        .padding(.horizontal)
                                }
                            }
                        }
                    }
                    .padding()
                }
                
                // 输入框
                HStack(spacing: 12) {
                    TextField("请描述孩子出现的问题（300字内）", text: $inputText, axis: .vertical)
                        .textFieldStyle(.roundedBorder)
                        .lineLimit(1...5)
                    
                    Button(action: sendMessage) {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.white)
                            .padding(10)
                            .background(inputText.isEmpty ? Color.gray : Color.pink)
                            .clipShape(Circle())
                    }
                    .disabled(inputText.isEmpty || conversationVM.isLoading)
                }
                .padding()
            }
            .navigationTitle("智能助手")
            .sheet(isPresented: $showCreateCard) {
                if let conversationId = conversationVM.lastConversationId {
                    CreateCardSheet(conversationId: conversationId)
                }
            }
            .task {
                await conversationVM.loadHistory()
            }
        }
    }
    
    private func sendMessage() {
        let message = inputText
        inputText = ""
        
        Task {
            await conversationVM.sendMessage(message)
            
            // 提示创建卡片
            if conversationVM.lastConversationId != nil {
                showCreateCard = true
            }
        }
    }
}

struct MessageBubbleView: View {
    let text: String
    let isUser: Bool
    
    var body: some View {
        HStack {
            if isUser { Spacer() }
            
            Text(text)
                .padding(12)
                .background(isUser ? Color.pink : Color(.systemGray5))
                .foregroundColor(isUser ? .white : .primary)
                .cornerRadius(16)
                .frame(maxWidth: 280, alignment: isUser ? .trailing : .leading)
            
            if !isUser { Spacer() }
        }
    }
}
```

## 🎨 设计规范

### 颜色主题
- 主色调：粉色 (Color.pink)
- 背景色：系统灰色 (Color(.systemGray6))
- 文字色：系统默认

### 字体规范
- 标题：.title, .title2, .title3
- 正文：.body, .callout
- 辅助：.caption, .caption2

### 圆角规范
- 卡片：12-16pt
- 按钮：12pt
- 消息气泡：16pt

## 📦 完整代码包

所有核心代码已生成在：
`/Users/macbook/Desktop/YouthKnotsBond/YouthKnotsBond/`

### 使用方法

1. **在Xcode中创建新项目**
   - 选择 iOS App
   - Interface: SwiftUI
   - Language: Swift

2. **复制生成的代码**
   - 将 Models/ 文件夹添加到项目
   - 将 Services/ 文件夹添加到项目
   - 将 ViewModels/ 文件夹添加到项目
   - 将 Utils/ 文件夹添加到项目

3. **添加UI页面**
   - 参考上面的代码框架创建Views
   - 或使用iOS_GUIDE.md中的完整示例

4. **配置内购**
   - 参考 IOS_IAP_GUIDE.md
   - 配置 StoreKit

5. **运行测试**
   - 连接真机
   - 配置签名
   - 运行测试

## 🔗 相关文档

- `iOS_GUIDE.md` - iOS开发完整指南
- `IOS_IAP_GUIDE.md` - iOS内购配置指南
- `ARCHITECTURE.md` - 系统架构说明
- `DATA_STORAGE_STRATEGY.md` - 数据存储策略

## 📞 API接口

所有API接口已在Services层封装，直接调用即可：

```swift
// 示例：发起对话
let response = try await ConversationService.shared.chat(
    message: "孩子最近总是摔门",
    sessionId: "default"
)

// 示例：创建卡片
let card = try await CardService.shared.createCard(
    conversationId: 123,
    coreDescription: "孩子摔门问题",
    tagIds: [1, 4]
)
```

---

**核心代码已完成！** 可以直接在Xcode中使用，添加UI页面即可运行。
