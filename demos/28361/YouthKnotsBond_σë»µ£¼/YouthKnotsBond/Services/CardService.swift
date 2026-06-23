import Foundation

class CardService {
    static let shared = CardService()
    private let api = APIService.shared
    
    private init() {}
    
    // MARK: - 创建问题卡片
    func createCard(
        conversationId: Int,
        coreDescription: String,
        tagIds: [Int],
        additionalNotes: String? = nil
    ) async throws -> ProblemCard {
        var body: [String: Any] = [
            "conversationId": conversationId,
            "coreDescription": coreDescription,
            "tagIds": tagIds
        ]
        
        if let notes = additionalNotes {
            body["additionalNotes"] = notes
        }
        
        let response: APIResponse<ProblemCard> = try await api.request(
            endpoint: "/cards",
            method: "POST",
            body: body
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 获取卡片列表
    func getCards(tagId: Int? = nil, page: Int = 1, pageSize: Int = 20) async throws -> CardListResponse {
        var endpoint = "/cards?page=\(page)&pageSize=\(pageSize)"
        if let tagId = tagId {
            endpoint += "&tagId=\(tagId)"
        }
        
        let response: APIResponse<CardListResponse> = try await api.request(
            endpoint: endpoint
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 获取卡片详情
    func getCardDetail(cardId: Int) async throws -> ProblemCard {
        let response: APIResponse<ProblemCard> = try await api.request(
            endpoint: "/cards/\(cardId)"
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 更新卡片（补充信息）
    func updateCard(cardId: Int, additionalNotes: String) async throws -> ProblemCard {
        let body = ["additionalNotes": additionalNotes]
        
        let response: APIResponse<ProblemCard> = try await api.request(
            endpoint: "/cards/\(cardId)",
            method: "PUT",
            body: body
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 添加标签
    func addTag(cardId: Int, tagId: Int) async throws -> ProblemCard {
        let body = ["tagId": tagId]
        
        let response: APIResponse<ProblemCard> = try await api.request(
            endpoint: "/cards/\(cardId)/tags",
            method: "POST",
            body: body
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 删除标签
    func removeTag(cardId: Int, tagId: Int) async throws -> ProblemCard {
        let response: APIResponse<ProblemCard> = try await api.request(
            endpoint: "/cards/\(cardId)/tags/\(tagId)",
            method: "DELETE"
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 删除卡片
    func deleteCard(cardId: Int) async throws {
        let _: APIResponse<EmptyData> = try await api.request(
            endpoint: "/cards/\(cardId)",
            method: "DELETE"
        )
    }
}
