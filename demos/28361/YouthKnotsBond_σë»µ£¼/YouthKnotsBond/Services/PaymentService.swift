import Foundation

class PaymentService {
    static let shared = PaymentService()
    private let api = APIService.shared
    
    private init() {}
    
    // MARK: - 获取套餐信息
    func getPackageInfo() async throws -> PackageInfo {
        let response: APIResponse<PackageInfo> = try await api.request(
            endpoint: "/payment/package-info",
            requiresAuth: false
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 创建订单
    func createOrder(orderType: String, count: Int = 1) async throws -> CreateOrderResponse {
        let body: [String: Any] = [
            "orderType": orderType,
            "count": count
        ]
        
        let response: APIResponse<CreateOrderResponse> = try await api.request(
            endpoint: "/payment/create-order",
            method: "POST",
            body: body
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - Apple支付回调
    func applePaymentCallback(
        orderNo: String,
        transactionId: String,
        receiptData: String
    ) async throws -> PaymentResult {
        let body: [String: Any] = [
            "orderNo": orderNo,
            "transactionId": transactionId,
            "receiptData": receiptData
        ]
        
        let response: APIResponse<PaymentResult> = try await api.request(
            endpoint: "/payment/apple-callback",
            method: "POST",
            body: body
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
    
    // MARK: - 获取订单列表
    func getOrders(page: Int = 1, pageSize: Int = 20) async throws -> OrderListResponse {
        let response: APIResponse<OrderListResponse> = try await api.request(
            endpoint: "/payment/orders?page=\(page)&pageSize=\(pageSize)"
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        return data
    }
}
