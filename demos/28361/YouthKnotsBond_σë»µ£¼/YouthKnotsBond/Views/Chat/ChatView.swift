import SwiftUI

struct ChatView: View {
    @EnvironmentObject var conversationVM: ConversationViewModel
    @EnvironmentObject var cardVM: CardViewModel
    @EnvironmentObject var tagVM: TagViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    
    @State private var inputText = ""
    @State private var showCreateCard = false
    @State private var showPurchase = false
    @State private var scrollProxy: ScrollViewProxy?
    @State private var showWelcome = true
    @State private var pendingMessage: String?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 顶部信息栏
                topInfoBar
                
                // 对话列表
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            // 预设问题卡片（仅在没有对话时显示）
                            if showWelcome && conversationVM.conversations.isEmpty {
                                presetQuestionsCard
                            }
                            
                            ForEach(conversationVM.conversations) { conversation in
                                conversationBubble(conversation)
                                    .id(conversation.id)
                            }
                            
                            // 显示正在发送的消息
                            if let pending = pendingMessage {
                                pendingMessageBubble(pending)
                                    .id("pending")
                            }
                            
                            // 显示加载中
                            if conversationVM.isLoading {
                                loadingBubble
                                    .id("loading")
                            }
                        }
                        .padding()
                    }
                    .onTapGesture {
                        // 点击空白处收起键盘
                        hideKeyboard()
                    }
                    .onAppear {
                        scrollProxy = proxy
                    }
                    .onChange(of: conversationVM.isLoading) { isLoading in
                        if isLoading {
                            withAnimation {
                                scrollProxy?.scrollTo("loading", anchor: .bottom)
                            }
                        }
                    }
                }
                
                // 输入框
                inputBar
            }
            .navigationTitle("解铃契AI助手")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    VStack(spacing: 2) {
                        Text("解铃契AI助手")
                            .font(.headline)
                            .fontWeight(.semibold)
                        Text("家长您好呀，我是解铃契，专门帮你一起解孩子的小情绪~")
                            .font(.system(size: 10))
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                }
            }
            .sheet(isPresented: $showCreateCard) {
                if let conversationId = conversationVM.lastConversationId,
                   let coreRecord = conversationVM.coreRecord {
                    CreateCardSheet(
                        conversationId: conversationId,
                        coreRecord: coreRecord,
                        suggestedTags: conversationVM.suggestedTags
                    )
                    .environmentObject(cardVM)
                    .environmentObject(tagVM)
                }
            }
            .sheet(isPresented: $showPurchase) {
                PurchaseView()
                    .environmentObject(authViewModel)
            }
            .task {
                await conversationVM.loadHistory()
                await tagVM.loadPresetTags()
                
                // 加载完成后滚动到最后一条对话
                if let lastId = conversationVM.conversations.last?.id {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        withAnimation {
                            scrollProxy?.scrollTo(lastId, anchor: .bottom)
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - 收起键盘
    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
    
    // MARK: - 顶部信息栏
    var topInfoBar: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("剩余次数: \(authViewModel.user?.remainingCount ?? 0)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if let user = authViewModel.user, !user.isPackageExpired {
                    Text("套餐: \(user.packageRemainingCount) | 9元10次: \(user.singleRemainingCount)")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            if authViewModel.user?.isFirstTime == true {
                Text("🎁 首次免费")
                    .font(.caption)
                    .foregroundColor(.pink)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.pink.opacity(0.1))
                    .cornerRadius(8)
            }
            
            Button(action: { showPurchase = true }) {
                Image(systemName: "cart.fill")
                    .foregroundColor(.pink)
            }
        }
        .padding()
        .background(Color(.systemGray6))
    }
    
    // MARK: - 欢迎消息
    var welcomeMessage: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Image(systemName: "heart.circle.fill")
                    .font(.title2)
                    .foregroundColor(.pink)
                Text("解铃契")
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(.pink)
            }
            
            
            // 预设问题
            VStack(alignment: .leading, spacing: 10) {
                Text("您可以问我：")
                    .font(.system(size: 13))
                    .foregroundColor(.secondary)
                
                ForEach(presetQuestions, id: \.self) { question in
                    Button(action: {
                        inputText = question
                        showWelcome = false
                    }) {
                        HStack(spacing: 8) {
                            Image(systemName: "lightbulb.fill")
                                .font(.system(size: 12))
                            Text(question)
                                .font(.system(size: 13))
                                .fixedSize(horizontal: false, vertical: true)
                            Spacer()
                            Image(systemName: "arrow.right.circle")
                                .font(.system(size: 12))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 10)
                        .background(Color.pink.opacity(0.05))
                        .foregroundColor(.pink)
                        .cornerRadius(8)
                    }
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }
    
    // 预设问题列表
    let presetQuestions = [
        "孩子自伤，该怎么办？",
        "孩子写作业拖延怎么办？",
        "孩子情绪低落，如何安慰？",
        "孩子沉迷手机怎么办？"
    ]
    
    // MARK: - 预设问题卡片
    var presetQuestionsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("您可以问我：")
                .font(.system(size: 13))
                .foregroundColor(.secondary)
                .padding(.horizontal, 4)
            
            ForEach(presetQuestions, id: \.self) { question in
                Button(action: {
                    inputText = question
                    showWelcome = false
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "lightbulb.fill")
                            .font(.system(size: 12))
                        Text(question)
                            .font(.system(size: 13))
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer()
                        Image(systemName: "arrow.right.circle")
                            .font(.system(size: 12))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(Color.pink.opacity(0.05))
                    .foregroundColor(.pink)
                    .cornerRadius(8)
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }
    
    // MARK: - 待发送消息气泡
    func pendingMessageBubble(_ message: String) -> some View {
        HStack {
            Spacer()
            Text(message)
                .padding()
                .background(Color.pink.opacity(0.5))
                .foregroundColor(.white)
                .cornerRadius(16)
                .frame(maxWidth: 280, alignment: .trailing)
        }
    }
    
    // MARK: - 加载气泡
    var loadingBubble: some View {
        HStack {
            HStack(spacing: 8) {
                ForEach(0..<3) { index in
                    Circle()
                        .fill(Color.gray)
                        .frame(width: 8, height: 8)
                        .scaleEffect(conversationVM.isLoading ? 1.0 : 0.5)
                        .animation(
                            Animation.easeInOut(duration: 0.6)
                                .repeatForever()
                                .delay(Double(index) * 0.2),
                            value: conversationVM.isLoading
                        )
                }
                Text("正在思考中...")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(16)
            Spacer()
        }
    }
    
    // MARK: - 对话气泡
    func conversationBubble(_ conversation: Conversation) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // 用户消息
            HStack {
                Spacer()
                Text(conversation.userInput)
                    .padding(12)
                    .background(Color.pink)
                    .foregroundColor(.white)
                    .cornerRadius(16)
                    .frame(maxWidth: 280, alignment: .trailing)
            }
            
            // Agent回复
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text(conversation.agentReply)
                        .padding(12)
                        .background(Color(.systemGray5))
                        .foregroundColor(.primary)
                        .cornerRadius(16)
                        .frame(maxWidth: 280, alignment: .leading)
                    
                    // 核心记录
                    if let coreRecord = conversation.coreRecord {
                        HStack {
                            Image(systemName: "star.fill")
                                .font(.caption2)
                                .foregroundColor(.orange)
                            Text("核心记录：\(coreRecord)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal, 4)
                    }
                }
                Spacer()
            }
        }
    }
    
    // MARK: - 输入框
    var inputBar: some View {
        HStack(spacing: 12) {
            TextField("请描述孩子出现的问题（300字内）", text: $inputText, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .lineLimit(1...5)
            
            Button(action: sendMessage) {
                if conversationVM.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .frame(width: 40, height: 40)
                } else {
                    Image(systemName: "paperplane.fill")
                        .foregroundColor(.white)
                        .frame(width: 40, height: 40)
                        .background(inputText.isEmpty ? Color.gray : Color.pink)
                        .clipShape(Circle())
                }
            }
            .disabled(inputText.isEmpty || conversationVM.isLoading)
        }
        .padding()
        .background(Color(.systemBackground))
    }
    
    // MARK: - 发送消息
    func sendMessage() {
        let message = inputText
        inputText = ""
        showWelcome = false
        
        // 立即显示用户消息
        pendingMessage = message
        
        // 滚动到底部
        withAnimation {
            scrollProxy?.scrollTo("pending", anchor: .bottom)
        }
        
        Task {
            await conversationVM.sendMessage(message)
            
            // 清除待发送消息
            pendingMessage = nil
            
            // 检查次数不足：只弹购买页面，不做其他操作
            if let error = conversationVM.errorMessage,
               error.contains("次数") {
                showPurchase = true
                return
            }
            
            // 刷新用户信息
            try? await authViewModel.refreshUserInfo()
            
            // 提示创建卡片
            if conversationVM.lastConversationId != nil {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    showCreateCard = true
                }
            }
            
            // 滚动到底部
            if let lastId = conversationVM.conversations.last?.id {
                withAnimation {
                    scrollProxy?.scrollTo(lastId, anchor: .bottom)
                }
            }
        }
    }
}
