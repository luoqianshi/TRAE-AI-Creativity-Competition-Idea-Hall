import Foundation
import SwiftUI

class SearchViewModel: ObservableObject {
    @Published var keyword: String = ""
    
    var results: [HeritageItem] {
        guard !keyword.isEmpty else { return [] }
        let lower = keyword.lowercased()
        return MockData.heritageItems.filter {
            $0.name.lowercased().contains(lower) ||
            $0.category.rawValue.contains(keyword) ||
            $0.description.lowercased().contains(lower)
        }
    }
}
