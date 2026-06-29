import SwiftUI

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @StateObject private var cartVM = CartViewModel()
    @StateObject private var favoritesVM = FavoritesViewModel()
    @StateObject private var orderVM = OrderViewModel()
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.xl) {
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
                    Text("我的")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }
                .padding(.bottom, Theme.Spacing.md)
                
                skillValueCard
                portfolioSection
                cartInlineSection
                functionMenu
            }
            .padding(Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.xl)
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }

    // MARK: - 手艺值卡片
    private var skillValueCard: some View {
        ZStack {
            RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous)
                .fill(
                    isDark ?
                    LinearGradient(
                        colors: [
                            Theme.Colors.bgDark,
                            Theme.Colors.bgMid,
                            Theme.Colors.bgLight
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ) :
                    LinearGradient(
                        colors: [
                            Color(red: 0.95, green: 0.97, blue: 0.98),
                            Color(red: 0.90, green: 0.94, blue: 0.97),
                            Color(red: 0.85, green: 0.90, blue: 0.95)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous)
                        .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                )

            RadialGradient(
                colors: [Theme.Colors.accent.opacity(isDark ? 0.45 : 0.25), Theme.Colors.accent.opacity(0)],
                center: UnitPoint(x: 0.75, y: 0.25),
                startRadius: 20,
                endRadius: 200
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous))

            GeometryReader { geo in
                Path { path in
                    let w = geo.size.width
                    let h = geo.size.height
                    path.move(to: CGPoint(x: w * 0.5, y: h * 0.9))
                    path.addQuadCurve(to: CGPoint(x: w * 0.7, y: h * 0.65),
                                     control: CGPoint(x: w * 0.6, y: h * 0.75))
                    path.addQuadCurve(to: CGPoint(x: w, y: h * 0.72),
                                     control: CGPoint(x: w * 0.85, y: h * 0.68))
                    path.addLine(to: CGPoint(x: w, y: h))
                    path.addLine(to: CGPoint(x: w * 0.5, y: h))
                    path.closeSubpath()
                }
                .fill(isDark ? Color.white.opacity(0.12) : Color.white.opacity(0.5))
            }

            // 右上角装饰
            VStack {
                HStack {
                    Spacer()
                    Text("匠")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 6)
                                .fill(Theme.Colors.accent)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(Color.white.opacity(0.4), lineWidth: 0.5)
                        )
                        .padding(Theme.Spacing.lg)
                }
                Spacer()
            }

            // 主内容
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                HStack(spacing: Theme.Spacing.md) {
                    ZStack {
                        Circle()
                            .fill(
                                RadialGradient(
                                    colors: [
                                        isDark ? Theme.Colors.bgLight.opacity(0.5) : Color.white.opacity(0.6),
                                        isDark ? Color.white.opacity(0.08) : Color.black.opacity(0.05)
                                    ],
                                    center: .center, startRadius: 5, endRadius: 30
                                )
                            )
                        Circle()
                            .stroke(Theme.Colors.accentBright.opacity(0.6), lineWidth: 1)
                        Text(String(viewModel.user.nickname.prefix(1)))
                            .font(.system(size: 22, weight: .bold))
                            .foregroundStyle(Theme.Colors.primary(isDark))
                    }
                    .frame(width: 56, height: 56)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(viewModel.user.nickname)
                            .font(Theme.Fonts.headline)
                            .foregroundStyle(Theme.Colors.primary(isDark))
                        Text("LV.\(viewModel.user.memberLevel) · \(viewModel.user.levelTitle)")
                            .font(Theme.Fonts.caption)
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                    }
                    Spacer()
                }

                Spacer()

                VStack(alignment: .leading, spacing: 4) {
                    Text("手艺值")
                        .font(Theme.Fonts.caption)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text("\(viewModel.user.skillValue)")
                            .font(.system(size: 42, weight: .bold))
                            .foregroundStyle(Theme.Colors.primary(isDark))
                        Text("分")
                            .font(Theme.Fonts.body)
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                    }
                }

                HStack {
                    Rectangle()
                        .fill(isDark ? Color.white.opacity(0.3) : Color.black.opacity(0.15))
                        .frame(height: 1)
                    Text("SA · TORI")
                        .font(.system(size: 10, weight: .light))
                        .foregroundStyle(isDark ? Color.white.opacity(0.5) : Color.black.opacity(0.3))
                        .tracking(4)
                    Rectangle()
                        .fill(isDark ? Color.white.opacity(0.3) : Color.black.opacity(0.15))
                        .frame(height: 1)
                }
            }
            .padding(Theme.Spacing.xl + Theme.Spacing.sm)
        }
        .frame(height: 260)
        .shadow(color: isDark ? Color.black.opacity(0.35) : Color.black.opacity(0.1), radius: 20, y: 8)
    }

    // MARK: - 作品集
    private var portfolioSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Text("我的作品集")
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                Spacer()
                NavigationLink {
                    FavoritesView(viewModel: favoritesVM)
                        .environmentObject(themeManager)
                } label: {
                    HStack(spacing: 4) {
                        Text("查看")
                            .font(Theme.Fonts.caption)
                        Image(systemName: "chevron.right")
                            .font(.system(size: 11))
                    }
                    .foregroundStyle(Theme.Colors.accentBright)
                }
            }

            if favoritesVM.favorites.isEmpty {
                VStack(spacing: Theme.Spacing.md) {
                    Image(systemName: "square.stack.3d.up")
                        .font(.system(size: 40, weight: .light))
                        .foregroundStyle(Theme.Colors.secondary(isDark).opacity(0.5))
                    Text("暂无收藏作品")
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                }
                .frame(maxWidth: .infinity)
                .padding(Theme.Spacing.xl)
                .background(
                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                        .fill(Theme.Colors.cardDark(isDark))
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                        )
                )
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Theme.Spacing.md) {
                        ForEach(favoritesVM.favorites.prefix(6)) { fav in
                            portfolioItem(fav)
                        }
                    }
                }
            }
        }
    }

    private func portfolioItem(_ fav: FavoriteItem) -> some View {
        VStack(alignment: .leading, spacing: 6) {
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
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                            .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.5)
                    )
                    .frame(width: 130, height: 100)

                GeometryReader { geo in
                    Path { path in
                        let w = geo.size.width
                        let h = geo.size.height
                        path.move(to: CGPoint(x: 0, y: h * 0.85))
                        path.addQuadCurve(to: CGPoint(x: w * 0.4, y: h * 0.55),
                                         control: CGPoint(x: w * 0.25, y: h * 0.65))
                        path.addQuadCurve(to: CGPoint(x: w, y: h * 0.7),
                                         control: CGPoint(x: w * 0.75, y: h * 0.6))
                        path.addLine(to: CGPoint(x: w, y: h))
                        path.addLine(to: CGPoint(x: 0, y: h))
                        path.closeSubpath()
                    }
                    .fill(isDark ? Theme.Colors.bgDark.opacity(0.5) : Color.white.opacity(0.4))
                }
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(fav.heritageName)
                    .font(Theme.Fonts.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                    .lineLimit(1)
                    .frame(width: 130, alignment: .leading)
                Text(fav.heritageCategory)
                    .font(Theme.Fonts.small)
                    .foregroundStyle(Theme.Colors.secondary(isDark))
                    .frame(width: 130, alignment: .leading)
            }
        }
    }

    // MARK: - 购物车
    private var cartInlineSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Image(systemName: "bag.fill")
                    .font(.system(size: 16, weight: .light))
                    .foregroundStyle(Theme.Colors.accentBright)
                    .frame(width: 34, height: 34)
                    .background(
                        Circle()
                            .fill(Theme.Colors.accent.opacity(0.2))
                    )
                Text("购物车")
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                Spacer()
                if !cartVM.items.isEmpty {
                    Text("\(cartVM.totalCount) 件")
                        .font(Theme.Fonts.caption)
                        .foregroundStyle(Theme.Colors.accentBright)
                }
            }

            if cartVM.items.isEmpty {
                VStack(spacing: Theme.Spacing.sm) {
                    Image(systemName: "bag")
                        .font(.system(size: 30, weight: .light))
                        .foregroundStyle(Theme.Colors.secondary(isDark).opacity(0.5))
                    Text("购物车空空如也")
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                }
                .frame(maxWidth: .infinity)
                .padding(Theme.Spacing.xl)
                .background(
                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                        .fill(Theme.Colors.cardDark(isDark))
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                        )
                )
            } else {
                VStack(spacing: Theme.Spacing.sm) {
                    ForEach(cartVM.items) { item in
                        cartItemRow(item)
                    }

                    DividerLine(isDark: isDark)

                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("合计：")
                                .font(Theme.Fonts.caption)
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                            Text("¥\(NSDecimalNumber(decimal: cartVM.selectedTotal).doubleValue, specifier: "%.0f")")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(Theme.Colors.accentBright)
                        }
                        Spacer()

                        NavigationLink {
                            OrderConfirmView(viewModel: cartVM, items: cartVM.items.filter { $0.isSelected })
                                .environmentObject(themeManager)
                        } label: {
                            Text("去结算（\(cartVM.items.filter { $0.isSelected }.count)）")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, Theme.Spacing.xl)
                                .padding(.vertical, Theme.Spacing.md)
                                .background(
                                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                        .fill(Theme.Colors.accent)
                                )
                        }
                        .buttonStyle(PlainButtonStyle())
                        .disabled(cartVM.items.allSatisfy { !$0.isSelected })
                        .opacity(cartVM.items.allSatisfy { !$0.isSelected } ? 0.4 : 1)
                    }
                    .padding(.top, Theme.Spacing.sm)
                }
                .padding(Theme.Spacing.md)
                .background(
                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                        .fill(Theme.Colors.cardDark(isDark))
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                        )
                )
            }
        }
    }

    private func cartItemRow(_ item: CartItem) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            Button(action: { cartVM.toggleSelect(item) }) {
                Image(systemName: item.isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(item.isSelected ? Theme.Colors.accentBright : Theme.Colors.secondary(isDark).opacity(0.65))
                    .font(.system(size: 22))
            }

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
                .frame(width: 60, height: 60)

            VStack(alignment: .leading, spacing: 4) {
                Text(item.product.name)
                    .font(Theme.Fonts.body)
                    .fontWeight(.medium)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                    .lineLimit(2)

                Text("¥\(NSDecimalNumber(decimal: item.product.price).doubleValue, specifier: "%.0f")")
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.accent)

                HStack(spacing: Theme.Spacing.md) {
                    Button(action: { cartVM.updateQuantity(item, quantity: item.quantity - 1) }) {
                        Image(systemName: "minus.circle.fill")
                            .foregroundStyle(Theme.Colors.secondary(isDark).opacity(0.65))
                            .font(.system(size: 18))
                    }
                    Text("\(item.quantity)")
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                        .frame(minWidth: 20)
                    Button(action: { cartVM.updateQuantity(item, quantity: item.quantity + 1) }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(Theme.Colors.accentBright)
                            .font(.system(size: 18))
                    }
                }
            }

            Spacer()

            Button(action: { cartVM.remove(item) }) {
                Image(systemName: "trash")
                    .foregroundStyle(Theme.Colors.vermilion.opacity(0.85))
                    .font(.system(size: 14))
            }
        }
        .padding(Theme.Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                .fill(isDark ? Color.white.opacity(0.05) : Color.black.opacity(0.03))
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                        .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.5)
                )
        )
    }

    // MARK: - 功能菜单
    private var functionMenu: some View {
        HStack(spacing: Theme.Spacing.sm) {
            NavigationLink {
                FavoritesView(viewModel: favoritesVM)
                    .environmentObject(themeManager)
            } label: {
                menuItem(icon: "heart.fill", title: "我的收藏",
                        accentColor: Theme.Colors.accentBright)
            }
            .buttonStyle(PlainButtonStyle())

            NavigationLink {
                OrderListView(viewModel: orderVM, cartViewModel: cartVM)
                    .environmentObject(themeManager)
            } label: {
                menuItem(icon: "bag.fill", title: "我的订单",
                        accentColor: Theme.Colors.accent)
            }
            .buttonStyle(PlainButtonStyle())

            NavigationLink {
                AddressListView(viewModel: viewModel)
                    .environmentObject(themeManager)
            } label: {
                menuItem(icon: "mappin.and.ellipse", title: "收货地址",
                        accentColor: Theme.Colors.vermilion)
            }
            .buttonStyle(PlainButtonStyle())

            NavigationLink {
                SettingsView(viewModel: viewModel)
                    .environmentObject(themeManager)
            } label: {
                menuItem(icon: "gearshape.fill", title: "设置",
                        accentColor: Theme.Colors.secondary(isDark))
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding(Theme.Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                .fill(Theme.Colors.cardDark(isDark))
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                        .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                )
        )
    }

    private func menuItem(icon: String, title: String, accentColor: Color) -> some View {
        VStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .light))
                .foregroundStyle(accentColor)
                .frame(width: 44, height: 44)
                .background(
                    Circle()
                        .fill(accentColor.opacity(0.2))
                )

            Text(title)
                .font(.system(size: 12))
                .foregroundStyle(Theme.Colors.primary(isDark))
        }
        .frame(maxWidth: .infinity)
    }
}
