import Foundation

struct CartItem: Codable, Identifiable {
    let id: UUID
    var product: Product
    var quantity: Int
    var isSelected: Bool
    
    init(id: UUID = UUID(), product: Product, quantity: Int, isSelected: Bool = false) {
        self.id = id
        self.product = product
        self.quantity = quantity
        self.isSelected = isSelected
    }
    
    var totalPrice: Decimal {
        product.price * Decimal(quantity)
    }
}
