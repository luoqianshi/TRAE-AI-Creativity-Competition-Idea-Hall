import Foundation
import Combine

@MainActor
class AuthViewModel: ObservableObject {
    @Published var user: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let authService = AuthService.shared
    private let storageService = StorageService.shared
    
    init() {
        checkAuthStatus()
    }
    
    // MARK: - 检查认证状态
    func checkAuthStatus() {
        if storageService.getToken() != nil {
            isAuthenticated = true
            user = storageService.getUser()
            
            // 刷新用户信息
            Task {
                try? await refreshUserInfo()
            }
        }
    }
    
    // MARK: - 发送验证码
    func sendVerificationCode(phone: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await authService.sendVerificationCode(phone: phone)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - 验证码登录
    func login(phone: String, code: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let (_, user) = try await authService.login(phone: phone, code: code)
            self.user = user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - 密码登录
    func loginWithPassword(phone: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let (_, user) = try await authService.loginWithPassword(phone: phone, password: password)
            self.user = user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - 刷新用户信息
    func refreshUserInfo() async throws {
        let user = try await authService.getUserInfo()
        self.user = user
    }
    
    // MARK: - 更新用户信息
    func updateUserInfo(nickname: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await authService.updateUserInfo(nickname: nickname)
            try await refreshUserInfo()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - 注销账号
    func deleteAccount() async -> Bool {
        isLoading = true
        errorMessage = nil
        
        do {
            try await authService.deleteAccount()
            // 注销成功，清除本地数据并登出
            authService.logout()
            user = nil
            isAuthenticated = false
            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }
    
    // MARK: - 登出
    func logout() {
        authService.logout()
        user = nil
        isAuthenticated = false
    }
}
