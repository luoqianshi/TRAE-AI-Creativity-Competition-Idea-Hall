import SwiftUI

class ThemeManager: ObservableObject {
    @Published var isDarkMode: Bool = true
    
    static let shared = ThemeManager()
    
    private init() {
        if let saved = UserDefaults.standard.object(forKey: "isDarkMode") as? Bool {
            isDarkMode = saved
        }
    }
    
    func toggleTheme() {
        isDarkMode.toggle()
        UserDefaults.standard.set(isDarkMode, forKey: "isDarkMode")
    }
}

struct ThemeModeKey: EnvironmentKey {
    static var defaultValue: ThemeManager = ThemeManager.shared
}

extension EnvironmentValues {
    var themeManager: ThemeManager {
        get { self[ThemeModeKey] }
        set { self[ThemeModeKey] = newValue }
    }
}
