import Foundation

class StorageService {
    static let shared = StorageService()
    
    private let tokenKey = "auth_token"
    private let userKey = "current_user"
    
    private init() {}
    
    // MARK: - Token管理
    func saveToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: tokenKey)
    }
    
    func getToken() -> String? {
        return UserDefaults.standard.string(forKey: tokenKey)
    }
    
    func clearToken() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
    }
    
    // MARK: - 用户信息管理
    func saveUser(_ user: User) {
        if let encoded = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(encoded, forKey: userKey)
        }
    }
    
    func getUser() -> User? {
        guard let data = UserDefaults.standard.data(forKey: userKey),
              let user = try? JSONDecoder().decode(User.self, from: data) else {
            return nil
        }
        return user
    }
    
    func clearUser() {
        UserDefaults.standard.removeObject(forKey: userKey)
    }
    
    func clearAll() {
        clearToken()
        clearUser()
    }
}
