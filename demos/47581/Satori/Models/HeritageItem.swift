import Foundation

struct HeritageItem: Codable, Identifiable {
    let id: UUID
    let name: String
    let category: Category
    let images: [String]
    let description: String
    let history: String
    let craftsman: Craftsman?
    let price: Decimal?
    let isFavorite: Bool
    
    init(id: UUID = UUID(), name: String, category: Category, images: [String] = [], description: String, history: String = "", craftsman: Craftsman? = nil, price: Decimal? = nil, isFavorite: Bool = false) {
        self.id = id
        self.name = name
        self.category = category
        self.images = images
        self.description = description
        self.history = history
        self.craftsman = craftsman
        self.price = price
        self.isFavorite = isFavorite
    }
}
