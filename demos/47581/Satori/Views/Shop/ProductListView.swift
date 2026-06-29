import SwiftUI

struct ProductListView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
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
                    Text("非遗商品")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.md)
                
                LazyVStack(spacing: Theme.Spacing.sm) {
                    ForEach(MockData.products) { product in
                        NavigationLink {
                            ProductDetailView(product: product)
                                .environmentObject(themeManager)
                        } label: {
                            ProductCard(product: product, isDark: isDark)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .padding(Theme.Spacing.lg)
            }
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
}
