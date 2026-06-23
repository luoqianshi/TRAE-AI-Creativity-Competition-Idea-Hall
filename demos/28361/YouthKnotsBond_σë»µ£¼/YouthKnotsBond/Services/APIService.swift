import Foundation

class APIService {
    static let shared = APIService()
    
    private let baseURL = "https://youthknotsbond.qingguoguang.com/api"
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()
    
    private init() {}
    
    // MARK: - Generic Request
    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: [String: Any]? = nil,
        requiresAuth: Bool = true
    ) async throws -> APIResponse<T> {
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
        
        // 处理错误状态码
        guard (200...299).contains(httpResponse.statusCode) else {
            // 尝试解析错误信息
            if let errorResponse = try? decoder.decode(APIResponse<EmptyData>.self, from: data) {
                throw NetworkError.serverError(
                    errorResponse.message ?? "请求失败",
                    code: errorResponse.code
                )
            }
            throw NetworkError.statusCode(httpResponse.statusCode)
        }
        
        // 解析响应
        do {
            let response = try decoder.decode(APIResponse<T>.self, from: data)
            return response
        } catch {
            print("解析错误: \(error)")
            throw NetworkError.decodingError
        }
    }
}
