import Foundation

struct FavoriteItem: Codable, Identifiable {
    let id: UUID
    let heritageItemId: UUID
    let heritageName: String
    let heritageCategory: String
    let heritageImage: String
    let craftsmanName: String?
    let price: Decimal
    
    init(id: UUID = UUID(), heritageItemId: UUID, heritageName: String, heritageCategory: String, heritageImage: String, craftsmanName: String? = nil, price: Decimal) {
        self.id = id
        self.heritageItemId = heritageItemId
        self.heritageName = heritageName
        self.heritageCategory = heritageCategory
        self.heritageImage = heritageImage
        self.craftsmanName = craftsmanName
        self.price = price
    }
}
