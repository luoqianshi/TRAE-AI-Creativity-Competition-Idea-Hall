import SwiftUI

struct ResetPasswordView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var phone = ""
    @State private var code = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var countdown = 0
    @State private var timer: Timer?
    @State private var showAlert = false
    @State private var alertMessage = ""
    @State private var resetSuccess = false
    
    let backToLogin: () -> Void
    
    var body: some View {
        ScrollView {
            VStack(spacing: 30) {
                // 标题
                VStack(spacing: 16) {
                    Image(systemName: "lock.rotation")
                        .font(.system(size: 60))
                        .foregroundColor(.pink)
                    
                    Text("重置密码")
                        .font(.system(size: 28, weight: .bold))
                    
                    Text("通过验证码重置您的登录密码")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 60)
                
                // 输入框
                VStack(spacing: 20) {
                    // 手机号
                    HStack {
                        Image(systemName: "phone.fill")
                            .foregroundColor(.gray)
                            .frame(width: 24)
                        TextField("请输入手机号", text: $phone)
                            .keyboardType(.phonePad)
                            .textContentType(.telephoneNumber)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // 验证码
                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundColor(.gray)
                            .frame(width: 24)
                        TextField("请输入验证码", text: $code)
                            .keyboardType(.numberPad)
                            .textContentType(.oneTimeCode)
                        
                        Divider()
                            .frame(height: 24)
                        
                        Button(action: sendCode) {
                            Text(countdown > 0 ? "\(countdown)s" : "获取验证码")
                                .font(.system(size: 14))
                                .foregroundColor(countdown > 0 ? .gray : .pink)
                        }
                        .disabled(countdown > 0 || phone.isEmpty || !isValidPhone(phone))
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // 新密码
                    HStack {
                        Image(systemName: "lock.fill")
                            .foregroundColor(.gray)
                            .frame(width: 24)
                        SecureField("请输入新密码（6位以上）", text: $newPassword)
                            .textContentType(.newPassword)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // 确认密码
                    HStack {
                        Image(systemName: "lock.fill")
                            .foregroundColor(.gray)
                            .frame(width: 24)
                        SecureField("请再次输入新密码", text: $confirmPassword)
                            .textContentType(.newPassword)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // 密码强度提示
                    if !newPassword.isEmpty {
                        HStack {
                            Image(systemName: passwordStrength.icon)
                                .foregroundColor(passwordStrength.color)
                            Text(passwordStrength.text)
                                .font(.caption)
                                .foregroundColor(passwordStrength.color)
                            Spacer()
                        }
                        .padding(.horizontal, 4)
                    }
                }
                .padding(.horizontal, 30)
                
                // 重置按钮
                Button(action: resetPassword) {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("重置密码")
                            .font(.headline)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(isResetButtonEnabled ? Color.pink : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
                .padding(.horizontal, 30)
                .disabled(!isResetButtonEnabled || authViewModel.isLoading)
                
                // 返回登录
                Button(action: backToLogin) {
                    Text("返回登录")
                        .font(.subheadline)
                        .foregroundColor(.pink)
                }
                
                // 错误提示
                if let error = authViewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal, 30)
                        .multilineTextAlignment(.center)
                }
                
                Spacer()
            }
        }
        .alert("重置成功", isPresented: $resetSuccess) {
            Button("返回登录") {
                backToLogin()
            }
        } message: {
            Text("密码已重置，请使用新密码登录")
        }
        .alert("提示", isPresented: $showAlert) {
            Button("确定", role: .cancel) {}
        } message: {
            Text(alertMessage)
        }
    }
    
    // MARK: - 验证手机号
    private func isValidPhone(_ phone: String) -> Bool {
        let phoneRegex = "^1[3-9]\\d{9}$"
        let phonePredicate = NSPredicate(format: "SELF MATCHES %@", phoneRegex)
        return phonePredicate.evaluate(with: phone)
    }
    
    // MARK: - 密码强度
    private var passwordStrength: (icon: String, text: String, color: Color) {
        let length = newPassword.count
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
    
    // MARK: - 重置按钮是否可用
    private var isResetButtonEnabled: Bool {
        return !phone.isEmpty &&
               !code.isEmpty &&
               !newPassword.isEmpty &&
               !confirmPassword.isEmpty &&
               isValidPhone(phone) &&
               newPassword.count >= 6 &&
               newPassword == confirmPassword
    }
    
    // MARK: - 发送验证码
    private func sendCode() {
        guard isValidPhone(phone) else {
            alertMessage = "请输入正确的手机号"
            showAlert = true
            return
        }
        
        Task {
            await authViewModel.sendVerificationCode(phone: phone)
            
            if authViewModel.errorMessage == nil {
                startCountdown()
                alertMessage = "验证码已发送"
                showAlert = true
            }
        }
    }
    
    // MARK: - 重置密码
    private func resetPassword() {
        guard newPassword == confirmPassword else {
            alertMessage = "两次输入的密码不一致"
            showAlert = true
            return
        }
        
        guard newPassword.count >= 6 else {
            alertMessage = "密码长度不能少于6位"
            showAlert = true
            return
        }
        
        Task {
            do {
                try await AuthService.shared.resetPassword(
                    phone: phone,
                    code: code,
                    newPassword: newPassword
                )
                resetSuccess = true
            } catch {
                authViewModel.errorMessage = error.localizedDescription
            }
        }
    }
    
    // MARK: - 倒计时
    private func startCountdown() {
        countdown = 60
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if countdown > 0 {
                countdown -= 1
            } else {
                timer?.invalidate()
            }
        }
    }
}
