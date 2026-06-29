import SwiftUI

struct AddressEditView: View {
    let address: Address?
    @ObservedObject var viewModel: ProfileViewModel
    @State private var name: String = ""
    @State private var phone: String = ""
    @State private var province: String = ""
    @State private var city: String = ""
    @State private var district: String = ""
    @State private var detail: String = ""
    @State private var isDefault: Bool = false
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    init(address: Address?, viewModel: ProfileViewModel) {
        self.address = address
        self.viewModel = viewModel
        if let addr = address {
            _name = State(initialValue: addr.name)
            _phone = State(initialValue: addr.phone)
            _province = State(initialValue: addr.province)
            _city = State(initialValue: addr.city)
            _district = State(initialValue: addr.district)
            _detail = State(initialValue: addr.detail)
            _isDefault = State(initialValue: addr.isDefault)
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button("取消") { dismiss() }
                    .foregroundStyle(Theme.Colors.secondary(isDark))
                Spacer()
                Text(address == nil ? "新增地址" : "编辑地址")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(Theme.Colors.primary(isDark))
                Spacer()
                Button("保存") {
                    if let addr = address {
                        viewModel.updateAddress(Address(id: addr.id, name: name, phone: phone, province: province, city: city, district: district, detail: detail, isDefault: isDefault))
                    } else {
                        viewModel.addAddress(Address(name: name, phone: phone, province: province, city: city, district: district, detail: detail, isDefault: isDefault))
                    }
                    dismiss()
                }
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Theme.Colors.accentBright)
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.top, Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.md)
            
            Form {
                Section("联系人信息") {
                    TextField("姓名", text: $name)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    TextField("手机号", text: $phone)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                }
                
                Section("地址信息") {
                    TextField("省", text: $province)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    TextField("市", text: $city)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    TextField("区/县", text: $district)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    TextField("详细地址", text: $detail, axis: .vertical)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                        .lineLimit(2 ... 3)
                }
                
                Section {
                    Toggle("设为默认地址", isOn: $isDefault)
                        .tint(Theme.Colors.accent)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                }
            }
            .scrollContentBackground(.hidden)
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
}
