import Foundation
import SwiftUI

class FavoritesViewModel: ObservableObject {
    @Published var favorites: [FavoriteItem] = []
    
    init() { load() }
    
    func load() {
        if let data = UserDefaults.standard.data(forKey: "favorites"),
           let decoded = try? JSONDecoder().decode([FavoriteItem].self, from: data) {
            favorites = decoded
        }
    }
    
    func save() {
        if let data = try? JSONEncoder().encode(favorites) {
            UserDefaults.standard.set(data, forKey: "favorites")
        }
    }
    
    func isFavorite(itemId: UUID) -> Bool {
        favorites.contains { $0.heritageItemId == itemId }
    }
    
    func toggleFavorite(heritageItem: HeritageItem, craftsmanName: String? = nil) {
        if isFavorite(itemId: heritageItem.id) {
            favorites.removeAll { $0.heritageItemId == heritageItem.id }
        } else {
            favorites.append(FavoriteItem(
                heritageItemId: heritageItem.id,
                heritageName: heritageItem.name,
                heritageCategory: heritageItem.category.rawValue,
                heritageImage: heritageItem.images.first ?? "",
                craftsmanName: craftsmanName,
                price: heritageItem.price ?? 0
            ))
        }
        save()
    }
    
    func remove(_ favorite: FavoriteItem) {
        favorites.removeAll { $0.id == favorite.id }
        save()
    }
    
    var count: Int { favorites.count }
}
