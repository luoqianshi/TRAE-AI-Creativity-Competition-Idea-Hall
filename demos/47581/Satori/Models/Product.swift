import Foundation

struct Product: Codable, Identifiable {
    let id: UUID
    let name: String
    let description: String
    let price: Decimal
    let images: [String]
    let category: String
    let craftsmanName: String?
    let stock: Int
    let image: String?
    
    init(id: UUID = UUID(), name: String, description: String, price: Decimal, images: [String] = [], category: String, craftsmanName: String? = nil, stock: Int = 100, image: String? = nil) {
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.images = images
        self.category = category
        self.craftsmanName = craftsmanName
        self.stock = stock
        self.image = image
    }
}
