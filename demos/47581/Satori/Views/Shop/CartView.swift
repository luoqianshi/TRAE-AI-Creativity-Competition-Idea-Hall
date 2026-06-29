import SwiftUI

struct CartView: View {
    @ObservedObject var viewModel: CartViewModel
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    var showNavigation: Bool = true
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        VStack {
            if showNavigation {
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
                    Text("购物车")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.lg)
            }
            
            if viewModel.items.isEmpty {
                ScrollView {
                    EmptyStateView(icon: "bag", title: "购物车空空如也", subtitle: "快去挑选心仪的非遗作品吧", isDark: isDark)
                }
                .themedBackground(isDark: isDark)
            } else {
                ScrollView {
                    VStack(spacing: Theme.Spacing.sm) {
                        ForEach(viewModel.items) { item in
                            cartItemRow(item)
                        }
                    }
                    .padding(Theme.Spacing.lg)
                    .padding(.bottom, 120)
                }
                .themedBackground(isDark: isDark)
                
                VStack(spacing: 0) {
                    Rectangle()
                        .fill(Theme.Colors.divider(isDark))
                        .frame(height: 0.5)
                    
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("合计：")
                                .font(Theme.Fonts.caption)
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                            Text("¥\(NSDecimalNumber(decimal: viewModel.selectedTotal).doubleValue, specifier: "%.0f")")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(Theme.Colors.accentBright)
                        }
                        
                        Spacer()
                        
                        NavigationLink {
                            OrderConfirmView(viewModel: viewModel, items: viewModel.items.filter { $0.isSelected })
                                .environmentObject(themeManager)
                        } label: {
                            Text("去结算（\(viewModel.items.filter { $0.isSelected }.count)）")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, Theme.Spacing.xl)
                                .padding(.vertical, Theme.Spacing.md)
                                .background(
                                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                        .fill(Theme.Colors.accent)
                                )
                        }
                        .disabled(viewModel.items.allSatisfy { !$0.isSelected })
                        .opacity(viewModel.items.allSatisfy { !$0.isSelected } ? 0.4 : 1)
                    }
                    .padding(Theme.Spacing.lg)
                    .background(isDark ? Theme.Colors.bgDark.opacity(0.7) : Color.white.opacity(0.9))
                }
            }
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
    
    private func cartItemRow(_ item: CartItem) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            Button(action: { viewModel.toggleSelect(item) }) {
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
                .frame(width: 70, height: 70)
            
            VStack(alignment: .leading, spacing: 6) {
                Text(item.product.name)
                    .font(Theme.Fonts.body)
                    .fontWeight(.medium)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                    .lineLimit(2)
                
                Text("¥\(NSDecimalNumber(decimal: item.product.price).doubleValue, specifier: "%.0f")")
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.accent)
                
                HStack(spacing: Theme.Spacing.md) {
                    Button(action: { viewModel.updateQuantity(item, quantity: item.quantity - 1) }) {
                        Image(systemName: "minus.circle.fill")
                            .foregroundStyle(Theme.Colors.secondary(isDark).opacity(0.65))
                            .font(.system(size: 20))
                    }
                    Text("\(item.quantity)")
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                        .frame(minWidth: 20)
                    Button(action: { viewModel.updateQuantity(item, quantity: item.quantity + 1) }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(Theme.Colors.accentBright)
                            .font(.system(size: 20))
                    }
                }
            }
            
            Spacer()
            
            Button(action: { viewModel.remove(item) }) {
                Image(systemName: "trash")
                    .foregroundStyle(Theme.Colors.vermilion.opacity(0.85))
                    .font(.system(size: 16))
            }
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
