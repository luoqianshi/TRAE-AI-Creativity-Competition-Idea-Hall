import SwiftUI
import UIKit

struct MainTabView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @State private var selectedTab = 0
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tag(0)
                .tabItem {
                    Image(systemName: "mountain.2.fill")
                    Text("开物")
                }
            
            CategoryTabView()
                .tag(1)
                .tabItem {
                    Image(systemName: "book.closed.fill")
                    Text("百科")
                }
            
            ShopView()
                .tag(2)
                .tabItem {
                    Image(systemName: "bag.fill")
                    Text("品物")
                }
        }
        .tint(Theme.Colors.accentBright(isDark))
        .onAppear {
            configureTabBarAppearance(isDark: isDark)
        }
        .onChange(of: isDark) { oldValue, newValue in
            configureTabBarAppearance(isDark: newValue)
        }
    }
    
    private func configureTabBarAppearance(isDark: Bool) {
        let appearance = UITabBarAppearance()
        appearance.configureWithDefaultBackground()
        
        let itemAppearance = UITabBarItemAppearance()
        
        itemAppearance.normal.iconColor = isDark ? 
            UIColor(red: 0.5, green: 0.55, blue: 0.65, alpha: 0.8) :
            UIColor(red: 0.55, green: 0.58, blue: 0.65, alpha: 0.8)
        itemAppearance.normal.titleTextAttributes = [
            .foregroundColor: isDark ? 
                UIColor(red: 0.5, green: 0.55, blue: 0.65, alpha: 0.8) :
                UIColor(red: 0.55, green: 0.58, blue: 0.65, alpha: 0.8),
            .font: UIFont.systemFont(ofSize: 11, weight: .regular)
        ]
        
        itemAppearance.selected.iconColor = isDark ? 
            UIColor(red: 0.80, green: 0.38, blue: 0.42, alpha: 1) :
            UIColor(red: 0.58, green: 0.22, blue: 0.28, alpha: 1)
        itemAppearance.selected.titleTextAttributes = [
            .foregroundColor: isDark ? 
                UIColor(red: 0.80, green: 0.38, blue: 0.42, alpha: 1) :
                UIColor(red: 0.58, green: 0.22, blue: 0.28, alpha: 1),
            .font: UIFont.systemFont(ofSize: 11, weight: .semibold)
        ]
        
        appearance.stackedLayoutAppearance = itemAppearance
        appearance.inlineLayoutAppearance = itemAppearance
        appearance.compactInlineLayoutAppearance = itemAppearance
        
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
        UITabBar.appearance().isTranslucent = true
    }
}
