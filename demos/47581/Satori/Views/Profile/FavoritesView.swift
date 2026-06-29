import SwiftUI

struct FavoritesView: View {
    @ObservedObject var viewModel: FavoritesViewModel
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // 顶部返回按钮
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
                    Text("我的收藏")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.md)
                
                if viewModel.favorites.isEmpty {
                    EmptyStateView(icon: "heart", title: "暂无收藏", subtitle: "探索非遗世界，收藏你喜爱的作品", isDark: isDark)
                        .padding(.top, 100)
                } else {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.Spacing.md) {
                        ForEach(viewModel.favorites) { fav in
                            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                        .fill(
                                            LinearGradient(
                                                colors: [
                                                    Theme.Colors.bgMid.opacity(0.6),
                                                    Theme.Colors.accent(isDark).opacity(0.15),
                                                    Theme.Colors.bgDark.opacity(0.5)
                                                ],
                                                startPoint: .topLeading, endPoint: .bottomTrailing
                                            )
                                        )
                                        .frame(height: 130)
                                    
                                    GeometryReader { geo in
                                        Path { path in
                                            let w = geo.size.width
                                            let h = geo.size.height
                                            path.move(to: CGPoint(x: 0, y: h * 0.85))
                                            path.addQuadCurve(to: CGPoint(x: w * 0.35, y: h * 0.5),
                                                             control: CGPoint(x: w * 0.18, y: h * 0.65))
                                            path.addQuadCurve(to: CGPoint(x: w, y: h * 0.7),
                                                             control: CGPoint(x: w * 0.7, y: h * 0.6))
                                            path.addLine(to: CGPoint(x: w, y: h))
                                            path.addLine(to: CGPoint(x: 0, y: h))
                                            path.closeSubpath()
                                        }
                                        .fill(Theme.Colors.accent.opacity(isDark ? 0.18 : 0.12))
                                    }
                                }
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(fav.heritageCategory)
                                        .font(Theme.Fonts.small)
                                        .foregroundStyle(Theme.Colors.accent)
                                    Text(fav.heritageName)
                                        .font(Theme.Fonts.caption)
                                        .fontWeight(.medium)
                                        .foregroundStyle(Theme.Colors.primary(isDark))
                                        .lineLimit(2)
                                    
                                    Text("¥\(NSDecimalNumber(decimal: fav.price).doubleValue, specifier: "%.0f")")
                                        .font(Theme.Fonts.small)
                                        .fontWeight(.bold)
                                        .foregroundStyle(Theme.Colors.accentBright)
                                }
                                .padding(.horizontal, Theme.Spacing.sm)
                                .padding(.bottom, Theme.Spacing.sm)
                            }
                            .background(
                                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                    .fill(Theme.Colors.cardDark(isDark))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                            .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                                    )
                            )
                            .contextMenu {
                                Button(role: .destructive) {
                                    viewModel.remove(fav)
                                } label: {
                                    Label("取消收藏", systemImage: "trash")
                                }
                            }
                        }
                    }
                    .padding(Theme.Spacing.lg)
                }
                
                Color.clear.frame(height: 40)
            }
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
}
