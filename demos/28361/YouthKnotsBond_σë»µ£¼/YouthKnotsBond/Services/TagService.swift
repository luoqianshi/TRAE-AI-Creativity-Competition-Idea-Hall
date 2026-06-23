import Foundation

class TagService {
    static let shared = TagService()
    private let api = APIService.shared
    
    private init() {}
    
    // MARK: - 获取所有标签
    func getAllTags() async throws -> [Tag] {
        let response: APIResponse<[Tag]> = try await api.request(
            endpoint: "/tags"
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 获取预设标签
    func getPresetTags() async throws -> [Tag] {
        let response: APIResponse<[Tag]> = try await api.request(
            endpoint: "/tags/preset"
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 创建自定义标签
    func createTag(tagName: String) async throws -> Tag {
        let body = ["tagName": tagName]
        
        let response: APIResponse<Tag> = try await api.request(
            endpoint: "/tags",
            method: "POST",
            body: body
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
}
