import Foundation

struct User: Codable {
    var id: UUID
    var nickname: String
    var avatar: String
    var memberLevel: Int
    var skillValue: Int
    var createdAt: Date
    
    init() {
        self.id = UUID()
        self.nickname = "非遗传承人"
        self.avatar = ""
        self.memberLevel = 1
        self.skillValue = 1280
        self.createdAt = Date()
    }
    
    static var current: User {
        get {
            if let data = UserDefaults.standard.data(forKey: "currentUser"),
               let user = try? JSONDecoder().decode(User.self, from: data) {
                return user
            }
            let user = User()
            return user
        }
        set {
            if let data = try? JSONEncoder().encode(newValue) {
                UserDefaults.standard.set(data, forKey: "currentUser")
            }
        }
    }
    
    var levelTitle: String {
        switch memberLevel {
        case 1: return "初心学徒"
        case 2: return "入门匠人"
        case 3: return "熟练工匠"
        case 4: return "高级匠人"
        case 5: return "工艺大师"
        default: return "非遗传承大师"
        }
    }
}
