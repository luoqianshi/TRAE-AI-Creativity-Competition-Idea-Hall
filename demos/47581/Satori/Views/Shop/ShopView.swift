import SwiftUI

struct ShopView: View {
    private let products = MockData.products
    
    @State private var selectedTab = 0
    @State private var scrollOffset: CGFloat = 0
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                GeometryReader { geo in
                    Color.clear.preference(key: ScrollOffsetKey.self, value: geo.frame(in: .named("scroll")).minY)
                }
                .frame(height: 0)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.xxl) {
                    VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                        HStack(spacing: 8) {
                            Image(systemName: "location.fill")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Text("浙江-杭州")
                                .font(.system(size: 18, weight: .regular))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.top, 12)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("品物商城")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Text("非遗成果展示和收藏")
                                .font(.system(size: 17))
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        
                        NavigationLink {
                            SearchView()
                                .environmentObject(themeManager)
                        } label: {
                            HStack(spacing: Theme.Spacing.sm) {
                                Text("搜点你感兴趣的")
                                    .font(.system(size: 14))
                                    .foregroundStyle(Theme.Colors.secondary(isDark))
                                Spacer()
                                Image(systemName: "magnifyingglass")
                                    .font(.system(size: 16))
                                    .foregroundStyle(Theme.Colors.secondary(isDark))
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .frame(width: 200)
                            .background(Theme.Colors.cardDark(isDark))
                            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                    .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                            )
                        }
                        .buttonStyle(PlainButtonStyle())
                        .padding(.horizontal, Theme.Spacing.lg)
                    }
                    
                    HStack(spacing: Theme.Spacing.xl) {
                        TabButton(title: "品物流行", isSelected: selectedTab == 0) {
                            selectedTab = 0
                        }
                        TabButton(title: "NFR商品", isSelected: selectedTab == 1) {
                            selectedTab = 1
                        }
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    productGridSection
                        .padding(.horizontal, Theme.Spacing.lg)
                    
                    Color.clear.frame(height: Theme.Spacing.xl)
                }
            }
            .coordinateSpace(name: "scroll")
            .themedBackground(isDark: isDark)
            .navigationBarHidden(true)
            .onPreferenceChange(ScrollOffsetKey.self) { value in
                scrollOffset = value
            }
            .overlay(alignment: .top) {
                navBar
            }
            .overlay(alignment: .topTrailing) {
                topRightButtons
            }
        }
    }
    
    private var navBar: some View {
        let progress = min(max((-scrollOffset - 40) / 80, 0), 1)
        let bgColor = isDark ? Theme.Colors.bgLight : Theme.Colors.bgDark
        return ZStack {
            Rectangle()
                .fill(bgColor.opacity(isDark ? progress * 0.9 : progress * 0.95))
                .background(.ultraThinMaterial.opacity(progress))
            
            Text("品物商城")
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(Theme.Colors.primary(isDark).opacity(progress))
        }
        .frame(maxWidth: .infinity)
        .frame(height: 90)
        .offset(y: -10)
    }
    
    private var topRightButtons: some View {
        NavigationLink {
            ProfileView()
                .environmentObject(themeManager)
        } label: {
            ZStack {
                Circle()
                    .fill(.ultraThinMaterial)
                Image(systemName: "person.fill")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Theme.Colors.primary(isDark))
            }
            .frame(width: 40, height: 40)
        }
        .buttonStyle(PlainButtonStyle())
        .padding(.trailing, Theme.Spacing.lg)
        .padding(.top, 12)
    }
    
    private var productGridSection: some View {
        let leftIndices = [0, 2, 4]
        let rightIndices = [1, 3, 5]
        
        return HStack(alignment: .top, spacing: Theme.Spacing.md) {
            LazyVStack(spacing: Theme.Spacing.md) {
                ForEach(leftIndices, id: \.self) { index in
                    if index < products.count {
                        productItem(product: products[index], isTall: true)
                    }
                }
            }
            .frame(maxWidth: .infinity)
            
            LazyVStack(spacing: Theme.Spacing.md) {
                ForEach(rightIndices, id: \.self) { index in
                    if index < products.count {
                        productItem(product: products[index], isTall: false)
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
    }
    
    private func productItem(product: Product, isTall: Bool) -> some View {
        let height: CGFloat = isTall ? 240 : 180
        
        return ZStack(alignment: .bottomTrailing) {
            AsyncImage(url: URL(string: product.image ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(height: height)
                        .clipped()
                case .failure, .empty:
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    Theme.Colors.bgMid.opacity(0.6),
                                    Theme.Colors.accent(isDark).opacity(0.15),
                                    Theme.Colors.bgDark.opacity(0.5)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(height: height)
                @unknown default:
                    Rectangle()
                        .fill(Theme.Colors.cardMid(isDark))
                        .frame(height: height)
                }
            }
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous))
            
            HStack(spacing: 8) {
                Text("¥\(Int(truncating: product.price as NSNumber))")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
                Image(systemName: "cart")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.white)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(.black.opacity(0.7))
            )
            .padding(10)
        }
        .frame(height: height)
    }
    
    private func TabButton(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(isSelected ? Theme.Colors.primary(isDark) : Theme.Colors.tertiary(isDark))
        }
    }
}

#Preview {
    ShopView()
        .environmentObject(ThemeManager.shared)
}
