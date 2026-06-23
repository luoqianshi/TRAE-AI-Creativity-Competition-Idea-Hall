import SwiftUI

struct TimelineView: View {
    @EnvironmentObject var timelineVM: TimelineViewModel
    @EnvironmentObject var tagVM: TagViewModel
    
    @State private var showFilterSheet = false
    @State private var selectedNode: TimelineNode?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 筛选栏
                filterBar
                
                // 时间轴
                if timelineVM.timelineNodes.isEmpty {
                    emptyView
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(Array(timelineVM.timelineNodes.enumerated()), id: \.element.id) { index, node in
                                TimelineNodeRow(
                                    node: node,
                                    isFirst: index == 0,
                                    isLast: index == timelineVM.timelineNodes.count - 1
                                )
                                .onTapGesture {
                                    selectedNode = node
                                }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("时间轴")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showFilterSheet = true }) {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .sheet(isPresented: $showFilterSheet) {
                TimelineTagFilterSheet(selectedTagId: Binding(
                    get: { timelineVM.selectedTagId },
                    set: { newValue in
                        Task {
                            await timelineVM.loadTimeline(tagId: newValue)
                        }
                    }
                ))
                .environmentObject(tagVM)
            }
            .sheet(item: $selectedNode) { node in
                TimelineNodeDetailView(node: node)
            }
            .refreshable {
                await timelineVM.refreshTimeline()
            }
            .task {
                await timelineVM.loadTimeline()
                await tagVM.loadAllTags()
            }
        }
    }
    
    // MARK: - 筛选栏
    private var filterBar: some View {
        HStack {
            if let tagId = timelineVM.selectedTagId,
               let tag = tagVM.allTags.first(where: { $0.id == tagId }) {
                HStack {
                    Text("筛选: \(tag.tagName)")
                        .font(.caption)
                        .foregroundColor(.pink)
                    
                    Button(action: {
                        Task {
                            await timelineVM.loadTimeline()
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
                Text("全部记录")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text("共 \(timelineVM.timelineNodes.count) 条")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
    }
    
    // MARK: - 空视图
    private var emptyView: some View {
        VStack(spacing: 20) {
            Image(systemName: "clock")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("还没有时间轴记录")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text("创建问题卡片后会自动生成时间轴")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - 时间轴节点行
struct TimelineNodeRow: View {
    let node: TimelineNode
    let isFirst: Bool
    let isLast: Bool
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // 时间轴线
            VStack(spacing: 0) {
                if !isFirst {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 2, height: 20)
                }
                
                // 节点圆点
                Circle()
                    .fill(Color(hex: node.nodeColor) ?? .blue)
                    .frame(width: 16, height: 16)
                    .overlay(
                        Circle()
                            .stroke(Color.white, lineWidth: 2)
                    )
                
                if !isLast {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 2)
                }
            }
            .frame(width: 16)
            
            // 内容卡片
            VStack(alignment: .leading, spacing: 12) {
                // 节点标签
                if let label = node.nodeLabel {
                    Text(label)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color(hex: node.nodeColor)?.opacity(0.2) ?? Color.blue.opacity(0.2))
                        .foregroundColor(Color(hex: node.nodeColor) ?? .blue)
                        .cornerRadius(8)
                }
                
                // 核心描述
                Text(node.coreDescription)
                    .font(.body)
                    .lineLimit(2)
                
                // 标签
                if !node.tags.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(node.tags) { tag in
                                Text(tag.tagName)
                                    .font(.caption2)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 3)
                                    .background(Color.pink.opacity(0.1))
                                    .foregroundColor(.pink)
                                    .cornerRadius(6)
                            }
                        }
                    }
                }
                
                // 时间
                HStack {
                    Image(systemName: "clock")
                        .font(.caption2)
                    Text(node.createdAt, style: .date)
                        .font(.caption)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
        .padding(.vertical, 8)
    }
}

// MARK: - 时间轴节点详情
struct TimelineNodeDetailView: View {
    @Environment(\.dismiss) var dismiss
    let node: TimelineNode
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // 节点类型标签
                    if let label = node.nodeLabel {
                        HStack {
                            Circle()
                                .fill(Color(hex: node.nodeColor) ?? .blue)
                                .frame(width: 12, height: 12)
                            
                            Text(label)
                                .font(.headline)
                                .foregroundColor(Color(hex: node.nodeColor) ?? .blue)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(hex: node.nodeColor)?.opacity(0.1) ?? Color.blue.opacity(0.1))
                        .cornerRadius(12)
                    }
                    
                    // 核心描述
                    sectionCard(title: "核心问题", icon: "exclamationmark.circle.fill") {
                        Text(node.coreDescription)
                    }
                    
                    // 问题摘要
                    if let summary = node.coreSummary {
                        sectionCard(title: "问题摘要", icon: "doc.text.fill") {
                            Text(summary)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // 关键建议
                    if let suggestions = node.keySuggestions {
                        sectionCard(title: "关键建议", icon: "lightbulb.fill") {
                            Text(suggestions)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // 补充信息
                    if let notes = node.additionalNotes, !notes.isEmpty {
                        sectionCard(title: "补充信息", icon: "note.text") {
                            Text(notes)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // 标签
                    if !node.tags.isEmpty {
                        sectionCard(title: "标签", icon: "tag.fill") {
                            FlowLayout(spacing: 8) {
                                ForEach(node.tags) { tag in
                                    Text(tag.tagName)
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(Color.pink.opacity(0.1))
                                        .foregroundColor(.pink)
                                        .cornerRadius(16)
                                }
                            }
                        }
                    }
                    
                    // 时间
                    HStack {
                        Image(systemName: "clock")
                        Text(node.createdAt, style: .date)
                        Text(node.createdAt, style: .time)
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
                .padding()
            }
            .navigationTitle("记录详情")
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
}

// MARK: - Color Extension
extension Color {
    init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - 时间轴标签筛选Sheet
struct TimelineTagFilterSheet: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var tagVM: TagViewModel
    @Binding var selectedTagId: Int?
    
    var body: some View {
        NavigationView {
            List {
                Button(action: {
                    selectedTagId = nil
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
