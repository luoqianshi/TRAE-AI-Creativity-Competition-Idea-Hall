import SwiftUI

struct CategoryListView: View {
    let category: Category
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        let items = MockData.heritageItems.filter { $0.category == category }
        
        return ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                // 顶部返回按钮和标题
                HStack {
                    Button(action: { dismiss() }) {
                        ZStack {
                            Circle()
                                .fill(isDark ? Color.black.opacity(0.3) : Color.black.opacity(0.1))
                                .frame(width: 40, height: 40)
                            Image(systemName: "chevron.left")
                                .font(.system(size: 18, weight: .medium))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                        }
                    }
                    Spacer()
                    Text(category.rawValue)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.md)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    HStack(alignment: .bottom, spacing: Theme.Spacing.md) {
                        ZStack {
                            RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                .fill(
                                    isDark ?
                                    LinearGradient(
                                        colors: [Theme.Colors.bgLight, Theme.Colors.bgMid.opacity(0.7)],
                                        startPoint: .topLeading, endPoint: .bottomTrailing
                                    ) :
                                    LinearGradient(
                                        colors: [Color(red: 0.92, green: 0.95, blue: 0.97), Color(red: 0.88, green: 0.92, blue: 0.95)],
                                        startPoint: .topLeading, endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 70, height: 70)
                            Image(systemName: category.icon)
                                .font(.system(size: 30, weight: .light))
                                .foregroundStyle(Theme.Colors.accentBright)
                        }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(category.rawValue)
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Text(category.descriptionText)
                                .font(Theme.Fonts.caption)
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
                
                if items.isEmpty {
                    EmptyStateView(icon: category.icon, title: "暂无作品", subtitle: "该分类正在完善中", isDark: isDark)
                } else {
                    LazyVStack(spacing: Theme.Spacing.sm) {
                        ForEach(items) { item in
                            NavigationLink {
                                HeritageDetailView(item: item)
                                    .environmentObject(themeManager)
                            } label: {
                                HeritageCard(item: item, isDark: isDark)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                }
            }
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
}
