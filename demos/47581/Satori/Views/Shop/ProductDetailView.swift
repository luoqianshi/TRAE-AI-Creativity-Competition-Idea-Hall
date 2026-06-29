import SwiftUI

struct ProductDetailView: View {
    let product: Product
    @StateObject private var cartVM = CartViewModel()
    @State private var showAdded = false
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                ZStack(alignment: .topLeading) {
                    if let imageUrl = product.image, !imageUrl.isEmpty {
                        AsyncImage(url: URL(string: imageUrl)) { phase in
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
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.top, Theme.Spacing.lg + 40)
                }
                
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text(product.name)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                        .lineLimit(2)
                    
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text("¥")
                            .font(Theme.Fonts.headline)
                            .foregroundStyle(Theme.Colors.vermilion)
                        Text("\(NSDecimalNumber(decimal: product.price).doubleValue, specifier: "%.0f")")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundStyle(Theme.Colors.vermilion)
                    }
                    
                    Text(product.category)
                        .font(Theme.Fonts.caption)
                        .foregroundStyle(.white)
                        .padding(.horizontal, Theme.Spacing.md)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                .fill(Theme.Colors.vermilion)
                        )
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.md)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                    Text("商品描述")
                        .font(Theme.Fonts.headline)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Text(product.description)
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                        .lineSpacing(8)
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
                
                if let craftsman = product.craftsmanName {
                    HStack(spacing: Theme.Spacing.md) {
                        ZStack {
                            Circle()
                                .fill(
                                    isDark ?
                                    RadialGradient(
                                        colors: [Theme.Colors.bgLight, Theme.Colors.bgMid.opacity(0.85)],
                                        center: .center, startRadius: 5, endRadius: 25
                                    ) :
                                    RadialGradient(
                                        colors: [
                                            Color(red: 0.92, green: 0.95, blue: 0.97),
                                            Color(red: 0.88, green: 0.92, blue: 0.95)
                                        ],
                                        center: .center, startRadius: 5, endRadius: 25
                                    )
                                )
                                .frame(width: 44, height: 44)
                            Text(String(craftsman.prefix(1)))
                                .font(.system(size: 18, weight: .bold))
                                .foregroundStyle(Theme.Colors.accentBright)
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("匠人制作")
                                .font(Theme.Fonts.small)
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                            Text(craftsman)
                                .font(Theme.Fonts.body)
                                .fontWeight(.semibold)
                                .foregroundStyle(Theme.Colors.primary(isDark))
                        }
                        Spacer()
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
                
                Color.clear.frame(height: 120)
            }
        }
        .ignoresSafeArea(edges: .top)
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
        .overlay(alignment: .bottom) {
            HStack(spacing: Theme.Spacing.md) {
                Button(action: {
                    cartVM.add(product)
                    showAdded = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        showAdded = false
                    }
                }) {
                    HStack(spacing: Theme.Spacing.sm) {
                        Image(systemName: "cart.fill")
                        Text("加入购物车")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundStyle(Theme.Colors.primary(isDark))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.Spacing.md + 2)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                            .fill(Theme.Colors.cardDark(isDark))
                    )
                }
                
                Button(action: {
                    cartVM.add(product)
                    showAdded = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        showAdded = false
                    }
                }) {
                    HStack(spacing: Theme.Spacing.sm) {
                        Image(systemName: "bag.fill")
                        Text("立即购买")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.Spacing.md + 2)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                            .fill(Theme.Colors.vermilion)
                    )
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.lg)
            
            if showAdded {
                Text("已加入购物车")
                    .font(Theme.Fonts.body)
                    .foregroundStyle(.white)
                    .padding(.horizontal, Theme.Spacing.xl)
                    .padding(.vertical, Theme.Spacing.md)
                    .background(Theme.Colors.vermilion)
                    .cornerRadius(Theme.Radius.lg)
                    .padding(.bottom, 80)
                    .transition(.opacity)
            }
        }
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
