import SwiftUI

struct CardDetailView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var cardVM: CardViewModel
    @EnvironmentObject var tagVM: TagViewModel
    
    let cardId: Int
    
    @State private var card: ProblemCard?
    @State private var showEditSheet = false
    @State private var showFullConversation = false
    @State private var showAddTagSheet = false
    
    var body: some View {
        NavigationView {
            Group {
                if let card = card {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 20) {
                            // 核心问题描述
                            sectionCard(title: "核心问题", icon: "exclamationmark.circle.fill") {
                                Text(card.coreDescription)
                                    .font(.body)
                            }
                            
                            // 问题摘要
                            if let summary = card.coreSummary {
                                sectionCard(title: "问题摘要", icon: "doc.text.fill") {
                                    Text(summary)
                                        .font(.body)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            // 关键建议
                            if let suggestions = card.keySuggestions {
                                sectionCard(title: "关键建议", icon: "lightbulb.fill") {
                                    Text(suggestions)
                                        .font(.body)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            // 补充信息
                            if let notes = card.additionalNotes, !notes.isEmpty {
                                sectionCard(title: "补充信息", icon: "note.text") {
                                    Text(notes)
                                        .font(.body)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            // 标签
                            sectionCard(title: "标签", icon: "tag.fill") {
                                tagSection(card: card)
                            }
                            
                            // 查看完整对话
                            if card.userInputSnapshot != nil || card.agentReplySnapshot != nil {
                                Button(action: { showFullConversation = true }) {
                                    HStack {
                                        Image(systemName: "message.fill")
                                        Text("查看完整对话")
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                    }
                                    .padding()
                                    .background(Color.pink.opacity(0.1))
                                    .foregroundColor(.pink)
                                    .cornerRadius(12)
                                }
                            }
                            
                            // 时间信息
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text("创建时间:")
                                        .foregroundColor(.secondary)
                                    Text(card.createdAt, style: .date)
                                    Text(card.createdAt, style: .time)
                                }
                                .font(.caption)
                                
                                if card.updatedAt != card.createdAt {
                                    HStack {
                                        Text("更新时间:")
                                            .foregroundColor(.secondary)
                                        Text(card.updatedAt, style: .date)
                                        Text(card.updatedAt, style: .time)
                                    }
                                    .font(.caption)
                                }
                            }
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                        }
                        .padding()
                    }
                } else {
                    ProgressView()
                }
            }
            .navigationTitle("卡片详情")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("关闭") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showEditSheet = true }) {
                        Text("补充信息")
                    }
                }
            }
            .sheet(isPresented: $showEditSheet) {
                if let card = card {
                    EditCardSheet(card: card)
                        .environmentObject(cardVM)
                        .onDisappear {
                            // 关闭后刷新卡片数据
                            refreshCard()
                        }
                }
            }
            .sheet(isPresented: $showFullConversation) {
                if let card = card {
                    FullConversationView(card: card)
                }
            }
            .sheet(isPresented: $showAddTagSheet) {
                if let card = card {
                    AddTagSheet(card: card)
                        .environmentObject(cardVM)
                        .environmentObject(tagVM)
                        .onDisappear {
                            // 关闭后刷新卡片数据
                            refreshCard()
                        }
                }
            }
            .task {
                // 初始加载
                await loadCard()
            }
        }
    }
    
    // MARK: - 加载卡片
    private func loadCard() async {
        await cardVM.loadCardDetail(cardId: cardId)
        if let loadedCard = cardVM.selectedCard {
            card = loadedCard
        }
    }
    
    // MARK: - 刷新卡片
    private func refreshCard() {
        Task {
            await loadCard()
        }
    }
    
    // MARK: - 区块卡片
    private func sectionCard<Content: View>(title: String, icon: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.pink)
                Text(title)
                    .font(.headline)
            }
            
            content()
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - 标签区域
    private func tagSection(card: ProblemCard) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            FlowLayout(spacing: 8) {
                ForEach(card.tags) { tag in
                    HStack(spacing: 4) {
                        Text(tag.tagName)
                            .font(.caption)
                        
                        Button(action: {
                            removeTag(tag)
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.caption)
                        }
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.pink.opacity(0.1))
                    .foregroundColor(.pink)
                    .cornerRadius(16)
                }
                
                // 添加标签按钮
                Button(action: { showAddTagSheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus.circle.fill")
                        Text("添加")
                    }
                    .font(.caption)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.gray.opacity(0.1))
                    .foregroundColor(.gray)
                    .cornerRadius(16)
                }
            }
        }
    }
    
    // MARK: - 删除标签
    private func removeTag(_ tag: Tag) {
        guard let currentCard = card else { return }
        Task {
            await cardVM.removeTag(cardId: currentCard.id, tagId: tag.id)
            // 刷新卡片数据
            await loadCard()
        }
    }
}

// MARK: - 流式布局
struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(in: proposal.replacingUnspecifiedDimensions().width, subviews: subviews, spacing: spacing)
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.frames[index].minX, y: bounds.minY + result.frames[index].minY), proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var frames: [CGRect] = []
        var size: CGSize = .zero
        
        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var lineHeight: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                
                if x + size.width > maxWidth && x > 0 {
                    x = 0
                    y += lineHeight + spacing
                    lineHeight = 0
                }
                
                frames.append(CGRect(x: x, y: y, width: size.width, height: size.height))
                lineHeight = max(lineHeight, size.height)
                x += size.width + spacing
            }
            
            self.size = CGSize(width: maxWidth, height: y + lineHeight)
        }
    }
}

// MARK: - 完整对话视图
struct FullConversationView: View {
    @Environment(\.dismiss) var dismiss
    let card: ProblemCard
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if let userInput = card.userInputSnapshot {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("我的问题")
                                .font(.headline)
                                .foregroundColor(.pink)
                            
                            Text(userInput)
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.pink.opacity(0.1))
                                .cornerRadius(12)
                        }
                    }
                    
                    if let agentReply = card.agentReplySnapshot {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("AI助手回复")
                                .font(.headline)
                                .foregroundColor(.blue)
                            
                            Text(agentReply)
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("完整对话")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("关闭") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - 编辑卡片Sheet
struct EditCardSheet: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var cardVM: CardViewModel
    
    let card: ProblemCard
    @State private var additionalNotes: String
    
    init(card: ProblemCard) {
        self.card = card
        _additionalNotes = State(initialValue: card.additionalNotes ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextEditor(text: $additionalNotes)
                        .frame(minHeight: 150)
                } header: {
                    Text("补充信息")
                } footer: {
                    Text("记录新的观察或变化")
                }
            }
            .navigationTitle("补充信息")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("保存") {
                        saveNotes()
                    }
                }
            }
        }
    }
    
    private func saveNotes() {
        Task {
            let success = await cardVM.updateCard(cardId: card.id, additionalNotes: additionalNotes)
            if success {
                dismiss()
            }
        }
    }
}

// MARK: - 添加标签Sheet
struct AddTagSheet: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var cardVM: CardViewModel
    @EnvironmentObject var tagVM: TagViewModel
    
    let card: ProblemCard
    @State private var selectedTags: Set<Int> = []
    
    var body: some View {
        NavigationView {
            List {
                ForEach(tagVM.allTags.filter { tag in
                    !card.tags.contains(where: { $0.id == tag.id })
                }) { tag in
                    Button(action: {
                        addTag(tag)
                    }) {
                        HStack {
                            Text(tag.tagName)
                                .foregroundColor(.primary)
                            Spacer()
                            if selectedTags.contains(tag.id) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.pink)
                            } else {
                                Image(systemName: "plus.circle")
                                    .foregroundColor(.pink)
                            }
                        }
                    }
                }
            }
            .navigationTitle("添加标签")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完成") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func addTag(_ tag: Tag) {
        // 添加到选中集合
        selectedTags.insert(tag.id)
        
        Task {
            let _ = await cardVM.addTag(cardId: card.id, tagId: tag.id)
            
            // 延迟移除选中状态（给用户视觉反馈）
            try? await Task.sleep(nanoseconds: 500_000_000) // 0.5秒
            selectedTags.remove(tag.id)
        }
    }
}
