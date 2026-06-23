import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    @State private var showEditProfile = false
    @State private var showSetPassword = false
    @State private var showPurchaseHistory = false
    @State private var showAbout = false
    @State private var showUserAgreement = false
    @State private var showPrivacyPolicy = false
    @State private var showLogoutAlert = false
    @State private var showDeleteAccountAlert = false
    
    var body: some View {
        NavigationView {
            List {
                // 用户信息
                Section {
                    userInfoCard
                }
                
                // 使用情况
                Section("使用情况") {
                    usageInfoRow
                    packageInfoRow
                }
                
                // 账号管理
                Section("账号管理") {
                    Button(action: { showSetPassword = true }) {
                        Label("设置密码", systemImage: "lock")
                            .foregroundColor(.primary)
                    }
                    
                    Button(action: { showPurchaseHistory = true }) {
                        Label("购买记录", systemImage: "list.bullet.rectangle")
                            .foregroundColor(.primary)
                    }
                }
                
                // 关于
                Section("关于") {
                    Button(action: { showAbout = true }) {
                        Label("关于解铃契", systemImage: "info.circle")
                            .foregroundColor(.primary)
                    }
                    
                    Button(action: { showUserAgreement = true }) {
                        Label("用户协议", systemImage: "doc.text")
                            .foregroundColor(.primary)
                    }
                    
                    Button(action: { showPrivacyPolicy = true }) {
                        Label("隐私政策", systemImage: "lock.doc")
                            .foregroundColor(.primary)
                    }
                    
                    HStack {
                        Label("版本", systemImage: "app.badge")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                }
                
                // 退出登录
                Section {
                    Button(action: { showLogoutAlert = true }) {
                        HStack {
                            Spacer()
                            Text("退出登录")
                                .foregroundColor(.orange)
                            Spacer()
                        }
                    }
                    .listRowInsets(EdgeInsets())
                    
                    Button(action: { showDeleteAccountAlert = true }) {
                        HStack {
                            Spacer()
                            Text("注销账号")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                    .listRowInsets(EdgeInsets())
                }
            }
            .navigationTitle("我的")
            .sheet(isPresented: $showEditProfile) {
                EditProfileView()
                    .environmentObject(authViewModel)
            }
            .sheet(isPresented: $showSetPassword) {
                SetPasswordView()
                    .environmentObject(authViewModel)
            }
            .sheet(isPresented: $showPurchaseHistory) {
                PurchaseHistoryView()
            }
            .sheet(isPresented: $showAbout) {
                AboutView()
            }
            .sheet(isPresented: $showUserAgreement) {
                UserAgreementView()
            }
            .sheet(isPresented: $showPrivacyPolicy) {
                PrivacyPolicyView()
            }
            .alert("退出登录", isPresented: $showLogoutAlert) {
                Button("取消", role: .cancel) {}
                Button("退出", role: .destructive) {
                    authViewModel.logout()
                }
            } message: {
                Text("确定要退出登录吗？")
            }
            .alert("注销账号", isPresented: $showDeleteAccountAlert) {
                Button("取消", role: .cancel) {}
                Button("注销", role: .destructive) {
                    deleteAccount()
                }
            } message: {
                Text("注销后将删除所有数据，包括对话记录、问题卡片、购买记录等，此操作不可恢复！")
            }
        }
    }
    
    // MARK: - 注销账号
    private func deleteAccount() {
        Task {
            let success = await authViewModel.deleteAccount()
            if success {
                // 注销成功，AuthViewModel会自动登出
            }
        }
    }
    
    // MARK: - 用户信息卡片
    private var userInfoCard: some View {
        HStack(spacing: 16) {
            // 头像
            Circle()
                .fill(Color.pink.opacity(0.2))
                .frame(width: 60, height: 60)
                .overlay(
                    Image(systemName: "person.fill")
                        .font(.title)
                        .foregroundColor(.pink)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(authViewModel.user?.nickname ?? "未设置昵称")
                    .font(.headline)
                
                Text(authViewModel.user?.phone ?? "")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(.gray)
        }
        .padding(.vertical, 8)
        .contentShape(Rectangle())
        .onTapGesture {
            showEditProfile = true
        }
    }
    
    // MARK: - 使用情况行
    private var usageInfoRow: some View {
        HStack {
            Label("剩余次数", systemImage: "number.circle")
            Spacer()
            Text("\(authViewModel.user?.remainingCount ?? 0)")
                .font(.headline)
                .foregroundColor(.pink)
        }
    }
    
    // MARK: - 套餐信息行
    private var packageInfoRow: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Label("套餐信息", systemImage: "gift")
                Spacer()
            }
            
            if let user = authViewModel.user {
                VStack(spacing: 4) {
                    HStack {
                        Text("套餐次数:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(user.packageRemainingCount)")
                            .font(.caption)
                    }
                    
                    HStack {
                        Text("9元10次购买（永久有效）:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(user.singleRemainingCount)")
                            .font(.caption)
                    }
                    
                    if let expireTime = user.packageExpireTime {
                        HStack {
                            Text("到期时间:")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(expireTime, style: .date)
                                .font(.caption)
                                .foregroundColor(user.isPackageExpired ? .red : .primary)
                        }
                    }
                }
                .padding(.top, 4)
            }
        }
    }
}

// MARK: - 编辑资料
struct EditProfileView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    
    @State private var nickname: String = ""
    @State private var showAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    HStack {
                        Text("手机号")
                        Spacer()
                        Text(authViewModel.user?.phone ?? "")
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("昵称")
                        TextField("请输入昵称", text: $nickname)
                            .multilineTextAlignment(.trailing)
                    }
                }
                
                Section {
                    HStack {
                        Text("注册时间")
                        Spacer()
                        if let createdAt = authViewModel.user?.createdAt {
                            Text(createdAt, style: .date)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    HStack {
                        Text("累计使用")
                        Spacer()
                        Text("\(authViewModel.user?.totalUsageCount ?? 0) 次")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("编辑资料")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("保存") {
                        saveProfile()
                    }
                    .disabled(nickname.isEmpty)
                }
            }
            .alert("提示", isPresented: $showAlert) {
                Button("确定") {
                    if alertMessage.contains("成功") {
                        dismiss()
                    }
                }
            } message: {
                Text(alertMessage)
            }
            .onAppear {
                nickname = authViewModel.user?.nickname ?? ""
            }
        }
    }
    
    private func saveProfile() {
        Task {
            await authViewModel.updateUserInfo(nickname: nickname)
            
            if authViewModel.errorMessage == nil {
                alertMessage = "保存成功"
                showAlert = true
            } else {
                alertMessage = authViewModel.errorMessage ?? "保存失败"
                showAlert = true
            }
        }
    }
}

// MARK: - 设置密码
struct SetPasswordView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    SecureField("请输入密码（6位以上）", text: $password)
                    SecureField("请再次输入密码", text: $confirmPassword)
                } footer: {
                    Text("设置密码后可以使用密码登录")
                }
                
                if !password.isEmpty {
                    Section {
                        HStack {
                            Image(systemName: passwordStrength.icon)
                                .foregroundColor(passwordStrength.color)
                            Text(passwordStrength.text)
                                .foregroundColor(passwordStrength.color)
                        }
                    }
                }
            }
            .navigationTitle("设置密码")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("保存") {
                        setPassword()
                    }
                    .disabled(!isValid)
                }
            }
            .alert("提示", isPresented: $showAlert) {
                Button("确定") {
                    if alertMessage.contains("成功") {
                        dismiss()
                    }
                }
            } message: {
                Text(alertMessage)
            }
        }
    }
    
    private var isValid: Bool {
        return password.count >= 6 && password == confirmPassword
    }
    
    private var passwordStrength: (icon: String, text: String, color: Color) {
        let length = password.count
        if length < 6 {
            return ("xmark.circle.fill", "密码长度不能少于6位", .red)
        } else if length < 8 {
            return ("checkmark.circle.fill", "密码强度：弱", .orange)
        } else if length < 12 {
            return ("checkmark.circle.fill", "密码强度：中", .blue)
        } else {
            return ("checkmark.circle.fill", "密码强度：强", .green)
        }
    }
    
    private func setPassword() {
        guard password == confirmPassword else {
            alertMessage = "两次输入的密码不一致"
            showAlert = true
            return
        }
        
        Task {
            do {
                try await AuthService.shared.setPassword(password: password)
                alertMessage = "密码设置成功"
                showAlert = true
            } catch {
                alertMessage = error.localizedDescription
                showAlert = true
            }
        }
    }
}

// MARK: - 关于
struct AboutView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 30) {
                    // Logo
                    Image(systemName: "heart.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.pink)
                        .padding(.top, 40)
                    
                    Text("解铃契")
                        .font(.system(size: 32, weight: .bold))
                    
                    Text("版本 1.0.0")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    // 介绍
                    VStack(alignment: .leading, spacing: 16) {
                        Text("关于我们")
                            .font(.headline)
                        
                        Text("解铃契致力于为家长打造一个高效实用的平台，助力解决孩子在少儿情感及青春期出现的各类问题。通过与智能助手交流、记录问题及查看时间轴等功能，协助家长更好地理解孩子，缓解育儿焦虑。")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // 联系方式
                    VStack(alignment: .leading, spacing: 12) {
                        Text("联系我们")
                            .font(.headline)
                        
                        HStack {
                            Image(systemName: "envelope")
                            Text("support@youthknotsbond.com")
                                .font(.caption)
                        }
                        
                        HStack {
                            Image(systemName: "globe")
                            Text("www.youthknotsbond.com")
                                .font(.caption)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    Spacer()
                    
                    Text("© 2026 解铃契. All rights reserved.")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .padding(.bottom, 30)
                }
                .padding()
            }
            .navigationTitle("关于")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("关闭") {
                        dismiss()
                    }
                }
            }
        }
    }
}
