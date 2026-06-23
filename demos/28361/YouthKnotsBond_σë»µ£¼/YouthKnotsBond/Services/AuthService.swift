import Foundation

class AuthService {
    static let shared = AuthService()
    private let api = APIService.shared
    
    private init() {}
    
    // MARK: - 发送验证码
    func sendVerificationCode(phone: String) async throws {
        let body = ["phone": phone]
        let _: APIResponse<EmptyData> = try await api.request(
            endpoint: "/auth/send-code",
            method: "POST",
            body: body,
            requiresAuth: false
        )
    }
    
    // MARK: - 验证码登录/注册
    func login(phone: String, code: String) async throws -> (token: String, user: User) {
        let body = ["phone": phone, "code": code]
        let response: APIResponse<LoginResponse> = try await api.request(
            endpoint: "/auth/login",
            method: "POST",
            body: body,
            requiresAuth: false
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        // 保存Token和用户信息
        StorageService.shared.saveToken(data.token)
        StorageService.shared.saveUser(data.user)
        
        return (data.token, data.user)
    }
    
    // MARK: - 密码登录
    func loginWithPassword(phone: String, password: String) async throws -> (token: String, user: User) {
        let body = ["phone": phone, "password": password]
        let response: APIResponse<LoginResponse> = try await api.request(
            endpoint: "/auth/login-password",
            method: "POST",
            body: body,
            requiresAuth: false
        )
        
        guard let data = response.data else {
            throw NetworkError.noData
        }
        
        StorageService.shared.saveToken(data.token)
        StorageService.shared.saveUser(data.user)
        
        return (data.token, data.user)
    }
    
    // MARK: - 设置密码
    func setPassword(password: String) async throws {
        let body = ["password": password]
        let _: APIResponse<EmptyData> = try await api.request(
            endpoint: "/auth/set-password",
            method: "POST",
            body: body
        )
    }
    
    // MARK: - 重置密码
    func resetPassword(phone: String, code: String, newPassword: String) async throws {
        let body = [
            "phone": phone,
            "code": code,
            "newPassword": newPassword
        ]
        let _: APIResponse<EmptyData> = try await api.request(
            endpoint: "/auth/reset-password",
            method: "POST",
            body: body,
            requiresAuth: false
        )
    }
    
    // MARK: - 获取用户信息
    func getUserInfo() async throws -> User {
        let response: APIResponse<User> = try await api.request(
            endpoint: "/auth/user-info"
        )
        
        guard let user = response.data else {
            throw NetworkError.noData
        }
        
        StorageService.shared.saveUser(user)
        return user
    }
    
    // MARK: - 更新用户信息
    func updateUserInfo(nickname: String) async throws {
        let body = ["nickname": nickname]
        let _: APIResponse<EmptyData> = try await api.request(
            endpoint: "/auth/user-info",
            method: "PUT",
            body: body
        )
    }
    
    // MARK: - 注销账号
    func deleteAccount() async throws {
        let _: APIResponse<EmptyData> = try await api.request(
            endpoint: "/auth/delete-account",
            method: "DELETE"
        )
    }
    
    // MARK: - 登出
    func logout() {
        StorageService.shared.clearAll()
    }
}
