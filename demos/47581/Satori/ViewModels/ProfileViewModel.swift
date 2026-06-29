import Foundation
import SwiftUI

class ProfileViewModel: ObservableObject {
    @Published var user: User
    @Published var addresses: [Address] = []
    
    init() {
        self.user = User.current
        loadAddresses()
    }
    
    func loadAddresses() {
        if let data = UserDefaults.standard.data(forKey: "addresses"),
           let decoded = try? JSONDecoder().decode([Address].self, from: data) {
            addresses = decoded
        }
    }
    
    func saveAddresses() {
        if let data = try? JSONEncoder().encode(addresses) {
            UserDefaults.standard.set(data, forKey: "addresses")
        }
    }
    
    func addAddress(_ address: Address) {
        if address.isDefault {
            addresses = addresses.map { var a = $0; a.isDefault = false; return a }
        }
        addresses.append(address)
        saveAddresses()
    }
    
    func updateAddress(_ address: Address) {
        if let idx = addresses.firstIndex(where: { $0.id == address.id }) {
            if address.isDefault {
                addresses = addresses.map { var a = $0; a.isDefault = false; return a }
            }
            addresses[idx] = address
            saveAddresses()
        }
    }
    
    func removeAddress(_ address: Address) {
        addresses.removeAll { $0.id == address.id }
        saveAddresses()
    }
    
    var defaultAddress: Address? {
        addresses.first { $0.isDefault } ?? addresses.first
    }
    
    func updateSkillValue(_ value: Int) {
        user.skillValue = value
        User.current = user
    }
    
    func updateNickname(_ name: String) {
        user.nickname = name
        User.current = user
    }
}
