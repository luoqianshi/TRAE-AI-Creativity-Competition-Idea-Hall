import SwiftUI

struct CardListView: View {
    @EnvironmentObject var cardVM: CardViewModel
    @EnvironmentObject var tagVM: TagViewModel
    
    @State private var selectedTagId: Int?
    @State private var showFilterSheet = false
    @State private var selectedCardId: Int?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 筛选栏
                filterBar
                
                // 卡片列表
                if cardVM.cards.isEmpty {
                    emptyView
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(cardVM.cards) { card in
                                CardRowView(card: card, onDelete: {
                                    deleteCard(card)
                                })
                                .onTapGesture {
                                    selectedCardId = card.id
                                }
                            }
                            
                            // 加载更多
                            if cardVM.hasMorePages {
                                ProgressView()
                                    .onAppear {
                                        Task {
                                            await cardVM.loadCards(tagId: selectedTagId)
                                        }
                                    }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("问题卡片")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showFilterSheet = true }) {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .sheet(isPresented: $showFilterSheet) {
                TagFilterSheet(selectedTagId: $selectedTagId)
                    .environmentObject(tagVM)
                    .environmentObject(cardVM)
            }
            .sheet(isPresented: Binding(
                get: { selectedCardId != nil },
                set: { if !$0 { selectedCardId = nil } }
            )) {
                if let cardId = selectedCardId {
                    CardDetailView(cardId: cardId)
                        .environmentObject(cardVM)
                        .environmentObject(tagVM)
                }
            }
            .refreshable {
                await cardVM.loadCards(tagId: selectedTagId, refresh: true)
            }
            .task {
                await cardVM.loadCards(tagId: selectedTagId, refresh: true)
                await tagVM.loadAllTags()
            }
        }
    }
    
    // MARK: - 删除卡片
    private func deleteCard(_ card: ProblemCard) {
        Task {
            let success = await cardVM.deleteCard(cardId: card.id)
            if !success {
                // 可以显示错误提示
                print("删除失败: \(cardVM.errorMessage ?? "")")
            }
        }
    }
    
    // MARK: - 筛选栏
    private var filterBar: some View {
        HStack {
            if let tagId = selectedTagId,
               let tag = tagVM.allTags.first(where: { $0.id == tagId }) {
                HStack {
                    Text("筛选: \(tag.tagName)")
                        .font(.caption)
                        .foregroundColor(.pink)
                    
                    Button(action: {
                        selectedTagId = nil
                        Task {
                            await cardVM.loadCards(refresh: true)
                        }
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.pink.opacity(0.1))
                .cornerRadius(16)
            } else {
                Text("全部卡片")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text("共 \(cardVM.cards.count) 张")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
    }
    
    // MARK: - 空视图
    private var emptyView: some View {
        VStack(spacing: 20) {
            Image(systemName: "square.stack")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("还没有问题卡片")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text("在对话后创建卡片，记录孩子的问题")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - 卡片行视图
struct CardRowView: View {
    let card: ProblemCard
    let onDelete: () -> Void
    
    @State private var showDeleteAlert = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 核心描述
            Text(card.coreDescription)
                .font(.body)
                .lineLimit(2)
            
            // 标签
            if !card.tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(card.tags) { tag in
                            Text(tag.tagName)
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.pink.opacity(0.1))
                                .foregroundColor(.pink)
                                .cornerRadius(8)
                        }
                    }
                }
            }
            
            // 时间和删除按钮
            HStack {
                Image(systemName: "clock")
                    .font(.caption2)
                Text(card.createdAt, style: .date)
                    .font(.caption)
                
                Spacer()
                
                // 删除按钮
                Button(action: {
                    showDeleteAlert = true
                }) {
                    Image(systemName: "trash")
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(8)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(6)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        .alert("删除卡片", isPresented: $showDeleteAlert) {
            Button("取消", role: .cancel) {}
            Button("删除", role: .destructive) {
                onDelete()
            }
        } message: {
            Text("确定要删除这张卡片吗？删除后无法恢复。")
        }
    }
}

// MARK: - 标签筛选Sheet
struct TagFilterSheet: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var tagVM: TagViewModel
    @EnvironmentObject var cardVM: CardViewModel
    @Binding var selectedTagId: Int?
    
    var body: some View {
        NavigationView {
            List {
                Button(action: {
                    selectedTagId = nil
                    Task {
                        await cardVM.loadCards(refresh: true)
                    }
                    dismiss()
                }) {
                    HStack {
                        Text("全部")
                        Spacer()
                        if selectedTagId == nil {
                            Image(systemName: "checkmark")
                                .foregroundColor(.pink)
                        }
                    }
                }
                
                ForEach(tagVM.allTags) { tag in
                    Button(action: {
                        selectedTagId = tag.id
                        Task {
                            await cardVM.loadCards(tagId: tag.id, refresh: true)
                        }
                        dismiss()
                    }) {
                        HStack {
                            Text(tag.tagName)
                            Spacer()
                            if selectedTagId == tag.id {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.pink)
                            }
                        }
                    }
                }
            }
            .navigationTitle("筛选标签")
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
}
