import Foundation

class MockDataService {
    static let shared = MockDataService()
    
    func fetchCategories() -> [Category] {
        Category.allCases
    }
    
    func fetchCraftsmen() -> [Craftsman] {
        MockData.craftsmen
    }
    
    func fetchHeritageItems() -> [HeritageItem] {
        MockData.heritageItems
    }
    
    func fetchProducts() -> [Product] {
        MockData.products
    }
    
    func fetchCraftsman(by id: UUID) -> Craftsman? {
        MockData.craftsmen.first { $0.id == id }
    }
    
    func searchHeritageItems(keyword: String) -> [HeritageItem] {
        guard !keyword.isEmpty else { return MockData.heritageItems }
        let lower = keyword.lowercased()
        return MockData.heritageItems.filter {
            $0.name.lowercased().contains(lower) ||
            $0.category.rawValue.contains(keyword) ||
            $0.description.lowercased().contains(lower)
        }
    }
}
