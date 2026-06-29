import Foundation

struct Address: Codable, Identifiable {
    let id: UUID
    var name: String
    var phone: String
    var province: String
    var city: String
    var district: String
    var detail: String
    var isDefault: Bool
    
    init(id: UUID = UUID(), name: String, phone: String, province: String, city: String, district: String, detail: String, isDefault: Bool = false) {
        self.id = id
        self.name = name
        self.phone = phone
        self.province = province
        self.city = city
        self.district = district
        self.detail = detail
        self.isDefault = isDefault
    }
    
    var fullAddress: String {
        "\(province)\(city)\(district)\(detail)"
    }
}
