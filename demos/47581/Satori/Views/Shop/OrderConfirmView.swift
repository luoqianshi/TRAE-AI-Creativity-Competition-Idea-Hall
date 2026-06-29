import SwiftUI

struct OrderConfirmView: View {
    @ObservedObject var viewModel: CartViewModel
    let items: [CartItem]
    @StateObject private var orderVM = OrderViewModel()
    @State private var name = "张三"
    @State private var phone = "13800138000"
    @State private var address = "北京市东城区某某街道某某号"
    @State private var showSuccess = false
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
                    Text("确认订单")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Button(action: {
                        _ = orderVM.createOrder(items: items, address: address, name: name, phone: phone)
                        viewModel.clearSelected()
                        showSuccess = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                            dismiss()
                        }
                    }) {
                        Text("提交")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Theme.Colors.accentBright)
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.sm)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                    Text("收货信息")
                        .font(Theme.Fonts.headline)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    
                    VStack(spacing: Theme.Spacing.sm) {
                        TextField("联系人姓名", text: $name)
                            .textFieldStyle(.roundedBorder)
                            .foregroundStyle(Theme.Colors.primary(isDark))
                        TextField("联系电话", text: $phone)
                            .textFieldStyle(.roundedBorder)
                            .foregroundStyle(Theme.Colors.primary(isDark))
                        TextField("详细地址", text: $address, axis: .vertical)
                            .textFieldStyle(.roundedBorder)
                            .foregroundStyle(Theme.Colors.primary(isDark))
                            .lineLimit(2 ... 3)
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
                        ForEach(items) { item in
                            HStack(spacing: Theme.Spacing.md) {
                                Text(item.product.name)
                                    .font(Theme.Fonts.caption)
                                    .foregroundStyle(Theme.Colors.primary(isDark))
                                    .lineLimit(1)
                                Spacer()
                                Text("×\(item.quantity)")
                                    .font(Theme.Fonts.small)
                                    .foregroundStyle(Theme.Colors.secondary(isDark))
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
                
                HStack {
                    Text("订单总金额：")
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                    Spacer()
                    Text("¥\(NSDecimalNumber(decimal: items.reduce(Decimal(0)) { $0 + $1.totalPrice }).doubleValue, specifier: "%.0f")")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(Theme.Colors.accentBright)
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
        .overlay {
            if showSuccess {
                Text("下单成功！")
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, Theme.Spacing.xl)
                    .padding(.vertical, Theme.Spacing.md)
                    .background(Theme.Colors.accentBright)
                    .cornerRadius(Theme.Radius.lg)
            }
        }
    }
}
