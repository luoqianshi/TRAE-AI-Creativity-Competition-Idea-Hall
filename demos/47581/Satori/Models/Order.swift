import Foundation

enum OrderStatus: String, Codable {
    case pending
    case paid
    case shipped
    case delivered
    case completed
    case cancelled
}

struct Order: Codable, Identifiable {
    let id: UUID
    var items: [CartItem]
    var totalPrice: Decimal
    var status: OrderStatus
    var address: String
    var contactName: String
    var contactPhone: String
    var createTime: Date
    
    init(id: UUID = UUID(), items: [CartItem], totalPrice: Decimal, status: OrderStatus, address: String, contactName: String, contactPhone: String, createTime: Date = Date()) {
        self.id = id
        self.items = items
        self.totalPrice = totalPrice
        self.status = status
        self.address = address
        self.contactName = contactName
        self.contactPhone = contactPhone
        self.createTime = createTime
    }
    
    var statusText: String {
        switch status {
        case .pending: return "待支付"
        case .paid: return "已支付"
        case .shipped: return "已发货"
        case .delivered: return "已送达"
        case .completed: return "已完成"
        case .cancelled: return "已取消"
        }
    }
}
