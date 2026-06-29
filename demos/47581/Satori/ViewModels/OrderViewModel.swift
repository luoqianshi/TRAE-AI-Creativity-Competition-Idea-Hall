import Foundation
import SwiftUI

class OrderViewModel: ObservableObject {
    @Published var orders: [Order] = []
    
    init() { load() }
    
    func load() {
        if let data = UserDefaults.standard.data(forKey: "orders"),
           let decoded = try? JSONDecoder().decode([Order].self, from: data) {
            orders = decoded
        }
    }
    
    func save() {
        if let data = try? JSONEncoder().encode(orders) {
            UserDefaults.standard.set(data, forKey: "orders")
        }
    }
    
    func createOrder(items: [CartItem], address: String, name: String, phone: String) -> Order {
        let total = items.reduce(Decimal(0)) { $0 + $1.totalPrice }
        let order = Order(items: items, totalPrice: total, status: .pending, address: address, contactName: name, contactPhone: phone)
        orders.insert(order, at: 0)
        save()
        return order
    }
    
    func updateStatus(_ order: Order, status: OrderStatus) {
        if let idx = orders.firstIndex(where: { $0.id == order.id }) {
            orders[idx].status = status
            save()
        }
    }
    
    func orders(for status: OrderStatus?) -> [Order] {
        guard let status = status else { return orders }
        return orders.filter { $0.status == status }
    }
}
