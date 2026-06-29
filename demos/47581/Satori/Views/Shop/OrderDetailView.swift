import SwiftUI

struct OrderDetailView: View {
    let order: Order
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
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
                    Text("订单详情")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.sm)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    HStack {
                        Text(order.statusText)
                            .font(.system(size: 22, weight: .bold))
                            .foregroundStyle(statusColor)
                        Spacer()
                    }
                    Text("订单金额：¥\(NSDecimalNumber(decimal: order.totalPrice).doubleValue, specifier: "%.0f")")
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                }
                .padding(Theme.Spacing.lg)
                .background(
                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                        .fill(Theme.Colors.cardDark(isDark))
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                .stroke(statusColor.opacity(0.45), lineWidth: 0.6)
                        )
                )
                .padding(.horizontal, Theme.Spacing.lg)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("收货信息")
                        .font(Theme.Fonts.headline)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    VStack(alignment: .leading, spacing: 4) {
                        Text("联系人：\(order.contactName)")
                            .font(Theme.Fonts.body)
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                        Text("电话：\(order.contactPhone)")
                            .font(Theme.Fonts.body)
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                        Text("地址：\(order.address)")
                            .font(Theme.Fonts.body)
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                    }
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
                
                VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                    Text("商品清单")
                        .font(Theme.Fonts.headline)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    
                    VStack(spacing: Theme.Spacing.sm) {
                        ForEach(order.items) { item in
                            HStack(spacing: Theme.Spacing.md) {
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
                                    .frame(width: 50, height: 50)
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(item.product.name)
                                        .font(Theme.Fonts.caption)
                                        .foregroundStyle(Theme.Colors.primary(isDark))
                                        .lineLimit(1)
                                    Text("×\(item.quantity)")
                                        .font(Theme.Fonts.small)
                                        .foregroundStyle(Theme.Colors.secondary(isDark))
                                }
                                
                                Spacer()
                                
                                Text("¥\(NSDecimalNumber(decimal: item.totalPrice).doubleValue, specifier: "%.0f")")
                                    .font(Theme.Fonts.caption)
                                    .foregroundStyle(Theme.Colors.primary(isDark))
                            }
                            .padding(.vertical, 4)
                        }
                    }
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
                
                Color.clear.frame(height: 40)
            }
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
    
    private var statusColor: Color {
        switch order.status {
        case .pending: return Theme.Colors.accentBright
        case .paid: return Theme.Colors.accent
        case .shipped: return Theme.Colors.vermilion
        case .delivered: return Theme.Colors.accent
        case .completed: return Theme.Colors.primary(isDark)
        case .cancelled: return Theme.Colors.tertiary(isDark)
        }
    }
}
