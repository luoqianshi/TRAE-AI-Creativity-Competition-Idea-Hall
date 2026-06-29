import Foundation
import SwiftUI

class CartViewModel: ObservableObject {
    @Published var items: [CartItem] = []
    
    init() { load() }
    
    func load() {
        if let data = UserDefaults.standard.data(forKey: "cartItems"),
           let decoded = try? JSONDecoder().decode([CartItem].self, from: data) {
            items = decoded
        }
    }
    
    func save() {
        if let data = try? JSONEncoder().encode(items) {
            UserDefaults.standard.set(data, forKey: "cartItems")
        }
    }
    
    func add(_ product: Product, quantity: Int = 1) {
        if let idx = items.firstIndex(where: { $0.product.id == product.id }) {
            items[idx].quantity += quantity
        } else {
            items.append(CartItem(product: product, quantity: quantity, isSelected: true))
        }
        save()
    }
    
    func remove(_ item: CartItem) {
        items.removeAll { $0.id == item.id }
        save()
    }
    
    func updateQuantity(_ item: CartItem, quantity: Int) {
        if let idx = items.firstIndex(where: { $0.id == item.id }) {
            items[idx].quantity = max(1, quantity)
            save()
        }
    }
    
    func toggleSelect(_ item: CartItem) {
        if let idx = items.firstIndex(where: { $0.id == item.id }) {
            items[idx].isSelected.toggle()
        }
    }
    
    var selectedTotal: Decimal {
        items.filter { $0.isSelected }.reduce(Decimal(0)) { $0 + $1.totalPrice }
    }
    
    var totalCount: Int {
        items.reduce(0) { $0 + $1.quantity }
    }
    
    func clearSelected() {
        items.removeAll { $0.isSelected }
        save()
    }
}
