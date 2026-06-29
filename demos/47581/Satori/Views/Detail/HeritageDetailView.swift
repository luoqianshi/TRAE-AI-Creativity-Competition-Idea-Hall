import SwiftUI

struct HeritageDetailView: View {
    let item: HeritageItem
    @StateObject private var favoritesVM = FavoritesViewModel()
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                ZStack(alignment: .top) {
                    if let firstImage = item.images.first, !firstImage.isEmpty {
                        AsyncImage(url: URL(string: firstImage)) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            case .failure, .empty:
                                placeholderView
                            @unknown default:
                                placeholderView
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 380)
                        .clipped()
                    } else {
                        placeholderView
                            .frame(maxWidth: .infinity)
                            .frame(height: 380)
                    }
                    
                    HStack {
                        Button(action: { dismiss() }) {
                            ZStack {
                                Circle()
                                    .fill(isDark ? Color.black.opacity(0.4) : Color.white.opacity(0.8))
                                    .frame(width: 40, height: 40)
                                Image(systemName: "chevron.left")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundStyle(Theme.Colors.primary(isDark))
                            }
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            favoritesVM.toggleFavorite(heritageItem: item, craftsmanName: item.craftsman?.name)
                        }) {
                            ZStack {
                                Circle()
                                    .fill(isDark ? Color.black.opacity(0.4) : Color.white.opacity(0.8))
                                    .frame(width: 40, height: 40)
                                Image(systemName: favoritesVM.isFavorite(itemId: item.id) ? "heart.fill" : "heart")
                                    .font(.system(size: 18))
                                    .foregroundStyle(favoritesVM.isFavorite(itemId: item.id) ? Theme.Colors.vermilion : Theme.Colors.primary(isDark))
                            }
                        }
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.top, Theme.Spacing.lg + 40)
                }
                
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    HStack(alignment: .top) {
                        Text(item.name)
                            .font(.system(size: 26, weight: .bold))
                            .foregroundStyle(Theme.Colors.primary(isDark))
                        Spacer()
                    }
                    
                    HStack(spacing: Theme.Spacing.sm) {
                        Text(item.category.rawValue)
                            .font(Theme.Fonts.caption)
                            .foregroundStyle(.white)
                            .padding(.horizontal, Theme.Spacing.md)
                            .padding(.vertical, Theme.Spacing.xs + 2)
                            .background(
                                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                    .fill(Theme.Colors.accent)
                            )
                        
                        if let price = item.price {
                            Text("参考价 ¥\(NSDecimalNumber(decimal: price).doubleValue, specifier: "%.0f")")
                                .font(Theme.Fonts.caption)
                                .foregroundStyle(Theme.Colors.accentBright)
                                .padding(.horizontal, Theme.Spacing.md)
                                .padding(.vertical, Theme.Spacing.xs + 2)
                                .background(
                                    RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                        .fill(Theme.Colors.accent.opacity(0.2))
                                )
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
                
                sectionCard(title: "作品描述") {
                    Text(item.description)
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                        .lineSpacing(8)
                }
                
                if !item.history.isEmpty {
                    sectionCard(title: "技艺渊源") {
                        Text(item.history)
                            .font(Theme.Fonts.body)
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                            .lineSpacing(8)
                    }
                }
                
                if let craftsman = item.craftsman {
                    sectionCard(title: "匠心传承") {
                        NavigationLink {
                            CraftsmanDetailView(craftsman: craftsman)
                                .environmentObject(themeManager)
                        } label: {
                            CraftsmanCard(craftsman: craftsman, isDark: isDark)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                
                Color.clear.frame(height: 40)
            }
        }
        .ignoresSafeArea(edges: .top)
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
    
    @ViewBuilder
    private func sectionCard<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Text(title)
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                Spacer()
            }
            content()
        }
        .padding(Theme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                .fill(Theme.Colors.cardDark(isDark))
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                        .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                )
        )
        .padding(.horizontal, Theme.Spacing.lg)
    }
    
    private var placeholderView: some View {
        LinearGradient(
            colors: [
                Theme.Colors.bgMid.opacity(0.6),
                Theme.Colors.accent(isDark).opacity(0.15),
                Theme.Colors.bgDark.opacity(0.5)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}
