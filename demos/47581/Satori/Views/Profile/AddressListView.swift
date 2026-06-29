import SwiftUI

struct AddressListView: View {
    @ObservedObject var viewModel: ProfileViewModel
    @State private var showAdd = false
    @State private var editingAddress: Address?
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // 顶部返回按钮和标题
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
                    Text("收货地址")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Button(action: { showAdd = true }) {
                        ZStack {
                            Circle()
                                .fill(isDark ? Color.black.opacity(0.3) : Color.black.opacity(0.1))
                                .frame(width: 40, height: 40)
                            Image(systemName: "plus")
                                .font(.system(size: 18, weight: .medium))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.md)
                
                VStack(spacing: Theme.Spacing.sm) {
                    ForEach(viewModel.addresses) { addr in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(addr.name)
                                    .font(Theme.Fonts.headline)
                                    .foregroundStyle(Theme.Colors.primary(isDark))
                                Spacer()
                                if addr.isDefault {
                                    Text("默认")
                                        .font(Theme.Fonts.small)
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, Theme.Spacing.sm)
                                        .padding(.vertical, 4)
                                        .background(
                                            RoundedRectangle(cornerRadius: Theme.Radius.sm, style: .continuous)
                                                .fill(Theme.Colors.accent)
                                        )
                                }
                            }
                            Text(addr.phone)
                                .font(Theme.Fonts.caption)
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                            Text(addr.fullAddress)
                                .font(Theme.Fonts.body)
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                            
                            HStack {
                                Button(action: { editingAddress = addr }) {
                                    Label("编辑", systemImage: "pencil")
                                        .font(Theme.Fonts.caption)
                                        .foregroundStyle(Theme.Colors.primary(isDark))
                                }
                                Spacer()
                                Button(role: .destructive, action: { viewModel.removeAddress(addr) }) {
                                    Label("删除", systemImage: "trash")
                                        .font(Theme.Fonts.caption)
                                        .foregroundStyle(Theme.Colors.vermilion)
                                }
                            }
                            .padding(.top, Theme.Spacing.xs)
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
                .padding(Theme.Spacing.lg)
            }
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
        .sheet(isPresented: $showAdd) {
            AddressEditView(address: nil, viewModel: viewModel)
                .environmentObject(themeManager)
        }
        .sheet(item: $editingAddress) { addr in
            AddressEditView(address: addr, viewModel: viewModel)
                .environmentObject(themeManager)
        }
    }
}
