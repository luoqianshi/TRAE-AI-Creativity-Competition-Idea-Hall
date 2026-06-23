import Foundation
import Combine

@MainActor
class TimelineViewModel: ObservableObject {
    @Published var timelineNodes: [TimelineNode] = []
    @Published var selectedNode: TimelineNode?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedTagId: Int?
    
    private let timelineService = TimelineService.shared
    
    // MARK: - 加载时间轴
    func loadTimeline(tagId: Int? = nil) async {
        isLoading = true
        errorMessage = nil
        selectedTagId = tagId
        
        do {
            let nodes = try await timelineService.getTimeline(tagId: tagId)
            timelineNodes = nodes
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - 刷新时间轴
    func refreshTimeline() async {
        await loadTimeline(tagId: selectedTagId)
    }
    
    // MARK: - 选择节点
    func selectNode(_ node: TimelineNode) {
        selectedNode = node
    }
    
    // MARK: - 清除选择
    func clearSelection() {
        selectedNode = nil
    }
}
