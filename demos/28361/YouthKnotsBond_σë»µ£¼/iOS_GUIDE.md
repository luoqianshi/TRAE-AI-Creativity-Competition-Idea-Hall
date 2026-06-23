# YouthKnotsBond iOS 前端开发指南

## 一、项目结构建议

```
YouthKnotsBond/
├── App/
│   └── YouthKnotsBondApp.swift
├── Models/
│   ├── User.swift
│   ├── Conversation.swift
│   ├── ProblemCard.swift
│   ├── Tag.swift
│   └── PaymentOrder.swift
├── ViewModels/
│   ├── AuthViewModel.swift
│   ├── ConversationViewModel.swift
│   ├── CardViewModel.swift
│   ├── TimelineViewModel.swift
│   └── PaymentViewModel.swift
├── Views/
│   ├── Auth/
│   │   ├── LoginView.swift
│   │   └── VerificationCodeView.swift
│   ├── Chat/
│   │   ├── ChatView.swift
│   │   └── MessageBubbleView.swift
│   ├── Card/
│   │   ├── CardListView.swift
│   │   ├── CardDetailView.swift
│   │   └── CreateCardView.swift
│   ├── Timeline/
│   │   ├── TimelineView.swift
│   │   └── TimelineNodeView.swift
│   └── Payment/
│       ├── PackageView.swift
│       └── OrderListView.swift
├── Services/
│   ├── APIService.swift
│   ├── AuthService.swift
│   └── StorageService.swift
└── Utils/
    ├── Constants.swift
    ├── Extensions.swift
    └── NetworkError.swift
```

## 二、核心代码示例

### 2.1 网络服务层 (APIService.swift)

```swift
import Foundation

class APIService {
    static let shared = APIService()
    
    private let baseURL = "https://youthknotsbond.qingguoguang.com/api"
    
    private init() {}
    
    // MARK: - Generic Request
    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: [String: Any]? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // 添加认证Token
        if requiresAuth, let token = StorageService.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // 添加请求体
        if let body = body {
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            // 解析错误信息
            if let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw NetworkError.serverError(errorResponse.message)
            }
            throw NetworkError.statusCode(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(T.self, from: data)
    }
}

// MARK: - Response Models
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let message: String?
}

struct ErrorResponse: Decodable {
    let success: Bool
    let message: String
    let code: String?
}

// MARK: - Network Error
enum NetworkError: LocalizedError {
    case invalidURL
    case invalidResponse
    case statusCode(Int)
    case serverError(String)
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "无效的URL"
        case .invalidResponse:
            return "无效的响应"
        case .statusCode(let code):
            return "请求失败，状态码: \(code)"
        case .serverError(let message):
            return message
        case .decodingError:
            return "数据解析失败"
        }
    }
}
```

### 2.2 数据模型 (Models/)

```swift
// User.swift
struct User: Codable, Identifiable {
    let id: Int
    let phone: String
    var nickname: String?
    var avatarUrl: String?
    var totalUsageCount: Int
    var remainingCount: Int
    var packageExpireTime: Date?
    var isFirstTime: Bool
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, phone, nickname
        case avatarUrl = "avatar_url"
        case totalUsageCount = "total_usage_count"
        case remainingCount = "remaining_count"
        case packageExpireTime = "package_expire_time"
        case isFirstTime = "is_first_time"
        case createdAt = "created_at"
    }
}

// Conversation.swift
struct Conversation: Codable, Identifiable {
    let id: Int
    let userId: Int
    let userInput: String
    let agentReply: String
    let coreRecord: String?
    let sessionId: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case userInput = "user_input"
        case agentReply = "agent_reply"
        case coreRecord = "core_record"
        case sessionId = "session_id"
        case createdAt = "created_at"
    }
}

// ProblemCard.swift
struct ProblemCard: Codable, Identifiable {
    let id: Int
    let userId: Int
    let conversationId: Int?
    let coreDescription: String
    var additionalNotes: String?
    var tags: [Tag]
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case conversationId = "conversation_id"
        case coreDescription = "core_description"
        case additionalNotes = "additional_notes"
        case tags
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// Tag.swift
struct Tag: Codable, Identifiable {
    let id: Int
    let tagName: String
    let usageCount: Int
    let isPreset: Bool
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case tagName = "tag_name"
        case usageCount = "usage_count"
        case isPreset = "is_preset"
        case createdAt = "created_at"
    }
}

// TimelineNode.swift
struct TimelineNode: Codable, Identifiable {
    let id: Int
    let coreDescription: String
    let additionalNotes: String?
    let createdAt: Date
    let tags: [Tag]
    let nodeType: String
    let nodeColor: String
    let nodeLabel: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case coreDescription = "core_description"
        case additionalNotes = "additional_notes"
        case createdAt = "created_at"
        case tags
        case nodeType = "nodeType"
        case nodeColor = "nodeColor"
        case nodeLabel = "nodeLabel"
    }
}
```

### 2.3 认证服务 (AuthService.swift)

```swift
import Foundation

class AuthService {
    static let shared = AuthService()
    private let api = APIService.shared
    
    private init() {}
    
    // 发送验证码
    func sendVerificationCode(phone: String) async throws {
        let body = ["phone": phone]
        let response: APIResponse<EmptyData> = try await api.request(
            endpoint: "/auth/send-code",
            method: "POST",
            body: body,
            requiresAuth: false
        )
        
        if !response.success {
            throw NetworkError.serverError(response.message ?? "发送失败")
        }
    }
    
    // 登录/注册
    func login(phone: String, code: String) async throws -> (token: String, user: User) {
        let body = ["phone": phone, "code": code]
        let response: APIResponse<LoginData> = try await api.request(
            endpoint: "/auth/login",
            method: "POST",
            body: body,
            requiresAuth: false
        )
        
        guard let data = response.data else {
            throw NetworkError.serverError("登录失败")
        }
        
        // 保存Token
        StorageService.shared.saveToken(data.token)
        
        return (data.token, data.user)
    }
    
    // 获取用户信息
    func getUserInfo() async throws -> User {
        let response: APIResponse<User> = try await api.request(
            endpoint: "/auth/user-info"
        )
        
        guard let user = response.data else {
            throw NetworkError.serverError("获取用户信息失败")
        }
        
        return user
    }
    
    // 更新用户信息
    func updateUserInfo(nickname: String?, avatarUrl: String?) async throws {
        var body: [String: Any] = [:]
        if let nickname = nickname {
            body["nickname"] = nickname
        }
        if let avatarUrl = avatarUrl {
            body["avatar_url"] = avatarUrl
        }
        
        let _: APIResponse<EmptyData> = try await api.request(
            endpoint: "/auth/user-info",
            method: "PUT",
            body: body
        )
    }
    
    // 登出
    func logout() {
        StorageService.shared.clearToken()
    }
}

// MARK: - Response Data Models
struct LoginData: Codable {
    let token: String
    let user: User
}

struct EmptyData: Codable {}
```

### 2.4 本地存储服务 (StorageService.swift)

```swift
import Foundation

class StorageService {
    static let shared = StorageService()
    
    private let tokenKey = "auth_token"
    private let userKey = "current_user"
    
    private init() {}
    
    // Token管理
    func saveToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: tokenKey)
    }
    
    func getToken() -> String? {
        return UserDefaults.standard.string(forKey: tokenKey)
    }
    
    func clearToken() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
    }
    
    // 用户信息管理
    func saveUser(_ user: User) {
        if let encoded = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(encoded, forKey: userKey)
        }
    }
    
    func getUser() -> User? {
        guard let data = UserDefaults.standard.data(forKey: userKey),
              let user = try? JSONDecoder().decode(User.self, from: data) else {
            return nil
        }
        return user
    }
    
    func clearUser() {
        UserDefaults.standard.removeObject(forKey: userKey)
    }
    
    func clearAll() {
        clearToken()
        clearUser()
    }
}
```

### 2.5 认证ViewModel (AuthViewModel.swift)

```swift
import Foundation
import Combine

@MainActor
class AuthViewModel: ObservableObject {
    @Published var user: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let authService = AuthService.shared
    private let storageService = StorageService.shared
    
    init() {
        checkAuthStatus()
    }
    
    // 检查认证状态
    func checkAuthStatus() {
        if storageService.getToken() != nil {
            isAuthenticated = true
            Task {
                try? await refreshUserInfo()
            }
        }
    }
    
    // 发送验证码
    func sendVerificationCode(phone: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await authService.sendVerificationCode(phone: phone)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // 登录
    func login(phone: String, code: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let (_, user) = try await authService.login(phone: phone, code: code)
            self.user = user
            storageService.saveUser(user)
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // 刷新用户信息
    func refreshUserInfo() async throws {
        let user = try await authService.getUserInfo()
        self.user = user
        storageService.saveUser(user)
    }
    
    // 登出
    func logout() {
        authService.logout()
        storageService.clearAll()
        user = nil
        isAuthenticated = false
    }
}
```

### 2.6 对话ViewModel (ConversationViewModel.swift)

```swift
import Foundation

@MainActor
class ConversationViewModel: ObservableObject {
    @Published var conversations: [Conversation] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentReply: String?
    @Published var suggestedTags: [String] = []
    @Published var coreRecord: String?
    @Published var lastConversationId: Int?
    
    private let api = APIService.shared
    
    // 发起对话
    func sendMessage(_ message: String, sessionId: String = "default") async {
        guard message.count <= 300 else {
            errorMessage = "输入内容不能超过300字"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let body: [String: Any] = [
                "message": message,
                "sessionId": sessionId
            ]
            
            let response: APIResponse<ChatResponse> = try await api.request(
                endpoint: "/conversation/chat",
                method: "POST",
                body: body
            )
            
            guard let data = response.data else {
                throw NetworkError.serverError("对话失败")
            }
            
            // 更新UI
            currentReply = data.reply
            coreRecord = data.coreRecord
            suggestedTags = data.suggestedTags
            lastConversationId = data.conversationId
            
            // 刷新对话历史
            await loadHistory(sessionId: sessionId)
            
        } catch let error as NetworkError {
            if case .serverError(let message) = error {
                errorMessage = message
            } else {
                errorMessage = error.localizedDescription
            }
        } catch {
            errorMessage = "发送失败，请重试"
        }
        
        isLoading = false
    }
    
    // 加载对话历史
    func loadHistory(sessionId: String = "default", page: Int = 1) async {
        do {
            let response: APIResponse<ConversationHistory> = try await api.request(
                endpoint: "/conversation/history?sessionId=\(sessionId)&page=\(page)&pageSize=20"
            )
            
            if let data = response.data {
                conversations = data.conversations
            }
        } catch {
            errorMessage = "加载历史失败"
        }
    }
}

// MARK: - Response Models
struct ChatResponse: Codable {
    let conversationId: Int
    let reply: String
    let coreRecord: String
    let suggestedTags: [String]
    let remainingCount: Int
    
    enum CodingKeys: String, CodingKey {
        case conversationId, reply
        case coreRecord = "coreRecord"
        case suggestedTags = "suggestedTags"
        case remainingCount = "remainingCount"
    }
}

struct ConversationHistory: Codable {
    let conversations: [Conversation]
    let pagination: Pagination
}

struct Pagination: Codable {
    let page: Int
    let pageSize: Int
    let total: Int
}
```

### 2.7 登录界面示例 (LoginView.swift)

```swift
import SwiftUI

struct LoginView: View {
    @StateObject private var viewModel = AuthViewModel()
    @State private var phone = ""
    @State private var code = ""
    @State private var countdown = 0
    @State private var timer: Timer?
    
    var body: some View {
        VStack(spacing: 30) {
            // Logo和标题
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
                // 手机号输入
                HStack {
                    Image(systemName: "phone.fill")
                        .foregroundColor(.gray)
                    TextField("请输入手机号", text: $phone)
                        .keyboardType(.phonePad)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                // 验证码输入
                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundColor(.gray)
                    TextField("请输入验证码", text: $code)
                        .keyboardType(.numberPad)
                    
                    Button(action: sendCode) {
                        Text(countdown > 0 ? "\(countdown)s" : "获取验证码")
                            .font(.system(size: 14))
                            .foregroundColor(countdown > 0 ? .gray : .blue)
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
                if viewModel.isLoading {
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
            .disabled(phone.isEmpty || code.isEmpty || viewModel.isLoading)
            
            // 错误提示
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding(.horizontal, 30)
            }
            
            Spacer()
            
            // 用户协议
            Text("登录即表示同意《用户协议》和《隐私政策》")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.bottom, 30)
        }
    }
    
    // 发送验证码
    private func sendCode() {
        Task {
            await viewModel.sendVerificationCode(phone: phone)
            startCountdown()
        }
    }
    
    // 登录
    private func login() {
        Task {
            await viewModel.login(phone: phone, code: code)
        }
    }
    
    // 倒计时
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

### 2.8 对话界面示例 (ChatView.swift)

```swift
import SwiftUI

struct ChatView: View {
    @StateObject private var viewModel = ConversationViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var inputText = ""
    @State private var showCreateCard = false
    
    var body: some View {
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
                    ForEach(viewModel.conversations) { conversation in
                        VStack(alignment: .leading, spacing: 8) {
                            // 用户消息
                            MessageBubble(
                                text: conversation.userInput,
                                isUser: true
                            )
                            
                            // Agent回复
                            MessageBubble(
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
                .disabled(inputText.isEmpty || viewModel.isLoading)
            }
            .padding()
        }
        .navigationTitle("智能助手")
        .alert("创建问题卡片", isPresented: $showCreateCard) {
            Button("创建") {
                // 跳转到创建卡片页面
            }
            Button("取消", role: .cancel) {}
        } message: {
            Text("是否将此次对话创建为问题卡片？")
        }
        .task {
            await viewModel.loadHistory()
        }
    }
    
    private func sendMessage() {
        let message = inputText
        inputText = ""
        
        Task {
            await viewModel.sendMessage(message)
            
            // 提示创建卡片
            if viewModel.lastConversationId != nil {
                showCreateCard = true
            }
        }
    }
}

struct MessageBubble: View {
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

## 三、关键注意事项

### 3.1 HTTPS要求
- iOS App Transport Security (ATS) 要求使用HTTPS
- 确保所有API请求使用 `https://` 协议

### 3.2 错误处理
```swift
// 处理次数不足
if error.code == "NO_REMAINING_COUNT" {
    // 显示购买弹窗
}

// 处理套餐过期
if error.code == "PACKAGE_EXPIRED" {
    // 提示重新购买
}
```

### 3.3 Token管理
- Token存储在UserDefaults
- 每次请求自动添加到Header
- Token过期后需要重新登录

### 3.4 数据刷新
- 对话后刷新用户信息（更新剩余次数）
- 创建卡片后刷新时间轴
- 支付成功后刷新用户信息

## 四、部署清单

### 后端部署步骤
1. ✅ 上传代码到服务器
2. ✅ 安装依赖
3. ✅ 配置环境变量
4. ✅ 初始化数据库
5. ✅ 配置SSL证书
6. ✅ 配置Nginx
7. ✅ 启动PM2服务

### 前端开发步骤
1. 实现网络层和数据模型
2. 实现认证流程
3. 实现对话功能
4. 实现卡片管理
5. 实现时间轴展示
6. 实现支付功能
7. UI/UX优化
8. 测试和调试

---

**完成！** 所有后端代码、数据库结构、部署配置和前端开发指南已生成。
