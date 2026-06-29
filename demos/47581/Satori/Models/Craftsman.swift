import Foundation

struct Craftsman: Codable, Identifiable {
    let id: UUID
    let name: String
    let title: String
    let category: String
    let avatar: String
    let bio: String
    let experience: Int
    let location: String
    let works: [String]
    
    init(id: UUID = UUID(), name: String, title: String, category: String, avatar: String = "", bio: String, experience: Int, location: String, works: [String] = []) {
        self.id = id
        self.name = name
        self.title = title
        self.category = category
        self.avatar = avatar
        self.bio = bio
        self.experience = experience
        self.location = location
        self.works = works
    }
}
