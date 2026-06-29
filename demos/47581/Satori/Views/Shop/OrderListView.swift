import SwiftUI

struct OrderListView: View {
    @ObservedObject var viewModel: OrderViewModel
    @ObservedObject var cartViewModel: CartViewModel
    @State private var filter: OrderStatus? = nil
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
                    Text("我的订单")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.md)
                
                VStack(spacing: Theme.Spacing.xl) {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Theme.Spacing.sm) {
                            filterChip(title: "全部", status: nil)
                            filterChip(title: "待支付", status: .pending)
                            filterChip(title: "已支付", status: .paid)
                            filterChip(title: "已发货", status: .shipped)
                            filterChip(title: "已送达", status: .delivered)
                            filterChip(title: "已完成", status: .completed)
                            filterChip(title: "已取消", status: .cancelled)
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                    }
                    
                    let filtered = viewModel.orders(for: filter)
                    if filtered.isEmpty {
                        EmptyStateView(icon: "bag", title: emptyMessage, subtitle: "暂无相关订单", isDark: isDark)
                    } else {
                        VStack(spacing: Theme.Spacing.sm) {
                            ForEach(filtered) { order in
                                NavigationLink {
                                    OrderDetailView(order: order)
                                        .environmentObject(themeManager)
                                } label: {
                                    orderCard(order)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                    }
                }
                .padding(.top, Theme.Spacing.md)
            }
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
    
    private var emptyMessage: String {
        guard let filter = filter else { return "暂无订单" }
        switch filter {
        case .pending: return "暂无待支付订单"
        case .paid: return "暂无已支付订单"
        case .shipped: return "暂无已发货订单"
        case .delivered: return "暂无已送达订单"
        case .completed: return "暂无已完成订单"
        case .cancelled: return "暂无已取消订单"
        }
    }
    
    private func filterChip(title: String, status: OrderStatus?) -> some View {
        let selected = (filter == nil && status == nil) || (filter != nil && filter == status)
        return Button(action: { filter = status }) {
            Text(title)
                .font(Theme.Fonts.caption)
                .foregroundStyle(selected ? .white : Theme.Colors.primary(isDark))
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, Theme.Spacing.sm)
                .background(
                    RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                        .fill(selected ? Theme.Colors.accent : Theme.Colors.cardDark(isDark))
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                .stroke(selected ? Theme.Colors.accentBright.opacity(0.55) : Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                        )
                )
        }
    }
    
    private func orderCard(_ order: Order) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Text("订单号：\(String(order.id.uuidString.prefix(12)))")
                    .font(Theme.Fonts.small)
                    .foregroundStyle(Theme.Colors.secondary(isDark))
                Spacer()
                Text(order.statusText)
                    .font(Theme.Fonts.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(statusColor(order.status))
                    .padding(.horizontal, Theme.Spacing.sm)
                    .padding(.vertical, 4)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.Radius.sm, style: .continuous)
                            .fill(statusColor(order.status).opacity(0.18))
                    )
            }
            
            VStack(spacing: 6) {
                ForEach(order.items.prefix(2)) { item in
                    HStack {
                        Text(item.product.name)
                            .font(Theme.Fonts.caption)
                            .foregroundStyle(Theme.Colors.primary(isDark))
                            .lineLimit(1)
                        Spacer()
                        Text("×\(item.quantity)")
                            .font(Theme.Fonts.small)
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                    }
                }
                if order.items.count > 2 {
                    Text("等 \(order.items.count) 件商品")
                        .font(Theme.Fonts.small)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                }
            }
            
            HStack {
                Text("共\(order.items.reduce(0) { $0 + $1.quantity })件")
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.secondary(isDark))
                Spacer()
                Text("¥\(NSDecimalNumber(decimal: order.totalPrice).doubleValue, specifier: "%.0f")")
                    .font(.system(size: 17, weight: .bold))
                    .foregroundStyle(Theme.Colors.accentBright)
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
    
    private func statusColor(_ status: OrderStatus) -> Color {
        switch status {
        case .pending: return Theme.Colors.accentBright
        case .paid: return Theme.Colors.accent
        case .shipped: return Theme.Colors.vermilion
        case .delivered: return Theme.Colors.accent
        case .completed: return Theme.Colors.primary(isDark)
        case .cancelled: return Theme.Colors.tertiary(isDark)
        }
    }
}
