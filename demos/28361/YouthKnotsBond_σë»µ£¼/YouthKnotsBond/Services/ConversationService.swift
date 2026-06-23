import Foundation

class ConversationService {
    static let shared = ConversationService()
    private let api = APIService.shared
    
    private init() {}
    
    // MARK: - 发起对话
    func chat(message: String, sessionId: String = "default") async throws -> ChatResponse {
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
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 获取对话历史
    func getHistory(sessionId: String = "default", page: Int = 1, pageSize: Int = 20) async throws -> ConversationHistory {
        let response: APIResponse<ConversationHistory> = try await api.request(
            endpoint: "/conversation/history?sessionId=\(sessionId)&page=\(page)&pageSize=\(pageSize)"
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
}
