import Foundation

enum NetworkError: LocalizedError {
    case invalidURL
    case invalidResponse
    case statusCode(Int)
    case serverError(String, code: String?)
    case decodingError
    case noData
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "无效的URL"
        case .invalidResponse:
            return "无效的响应"
        case .statusCode(let code):
            return "请求失败，状态码: \(code)"
        case .serverError(let message, _):
            return message
        case .decodingError:
            return "数据解析失败"
        case .noData:
            return "没有数据"
        }
    }
    
    var errorCode: String? {
        switch self {
        case .serverError(_, let code):
            return code
        default:
            return nil
        }
    }
}
