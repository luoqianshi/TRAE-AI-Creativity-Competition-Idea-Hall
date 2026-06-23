import Foundation

class TimelineService {
    static let shared = TimelineService()
    private let api = APIService.shared
    
    private init() {}
    
    // MARK: - 获取时间轴
    func getTimeline(tagId: Int? = nil) async throws -> [TimelineNode] {
        var endpoint = "/timeline"
        if let tagId = tagId {
            endpoint += "?tagId=\(tagId)"
        }
        
        let response: APIResponse<[TimelineNode]> = try await api.request(
            endpoint: endpoint
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 获取标签历史（供Agent读取）
    func getTagHistory(tagIds: [Int]) async throws -> [ProblemCard] {
        let tagIdsString = tagIds.map { String($0) }.joined(separator: ",")
        
        let response: APIResponse<[ProblemCard]> = try await api.request(
            endpoint: "/timeline/tag-history?tagIds=\(tagIdsString)"
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
}
