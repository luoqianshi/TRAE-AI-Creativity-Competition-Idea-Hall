import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var phone = ""
    @State private var code = ""
    @State private var password = ""
    @State private var loginMode: LoginMode = .code
    @State private var countdown = 0
    @State private var timer: Timer?
    @State private var showAlert = false
    @State private var alertMessage = ""
    @State private var showUserAgreement = false
    @State private var showPrivacyPolicy = false
    
    let showResetPassword: () -> Void
    
    enum LoginMode {
        case code
        case password
    }
    
    var body: some View {
        ZStack {
            // 温馨渐变背景 - 适配浅色和深色模式
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 1.0, green: 0.85, blue: 0.85),
                    Color(red: 1.0, green: 0.92, blue: 0.85),
                    Color(red: 1.0, green: 0.98, blue: 0.95)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 30) {
                    // Logo和标题
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(colors: [Color.pink.opacity(0.3), Color.pink.opacity(0.1)]),
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 90, height: 90)
                            
                            Image(systemName: "heart.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.pink)
                        }
                        .offset(y: countdown > 0 ? -10 : 0)
                        .animation(
                            Animation.easeInOut(duration: 2.0)
                                .repeatForever(autoreverses: true),
                            value: countdown
                        )
                        
                        Text("解铃契")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(Color(red: 0.2, green: 0.2, blue: 0.2))
                        
                        Text("陪伴您和孩子共同成长")
                            .font(.subheadline)
                            .foregroundColor(Color(red: 0.4, green: 0.4, blue: 0.4))
                    }
                    .padding(.top, 60)
                    
                    // 登录方式切换
                    Picker("登录方式", selection: $loginMode) {
                        Text("验证码登录").tag(LoginMode.code)
                        Text("密码登录").tag(LoginMode.password)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, 30)
                    
                    // 输入框
                    VStack(spacing: 20) {
                        // 手机号输入
                        HStack {
                            Image(systemName: "phone.fill")
                                .foregroundColor(.pink)
                                .frame(width: 24)
                            TextField("请输入手机号", text: $phone)
                                .keyboardType(.phonePad)
                                .textContentType(.telephoneNumber)
                                .foregroundColor(Color(red: 0.2, green: 0.2, blue: 0.2))
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.white)
                                .shadow(color: Color.pink.opacity(0.15), radius: 8, x: 0, y: 4)
                        )
                        
                        // 验证码或密码输入
                        if loginMode == .code {
                            // 验证码输入
                            HStack {
                                Image(systemName: "lock.fill")
                                    .foregroundColor(.pink)
                                    .frame(width: 24)
                                TextField("请输入验证码", text: $code)
                                    .keyboardType(.numberPad)
                                    .textContentType(.oneTimeCode)
                                    .foregroundColor(Color(red: 0.2, green: 0.2, blue: 0.2))
                                
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
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.white)
                                    .shadow(color: Color.pink.opacity(0.15), radius: 8, x: 0, y: 4)
                            )
                        } else {
                            // 密码输入
                            HStack {
                                Image(systemName: "lock.fill")
                                    .foregroundColor(.pink)
                                    .frame(width: 24)
                                SecureField("请输入密码", text: $password)
                                    .textContentType(.password)
                                    .foregroundColor(Color(red: 0.2, green: 0.2, blue: 0.2))
                            }
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.white)
                                    .shadow(color: Color.pink.opacity(0.15), radius: 8, x: 0, y: 4)
                            )
                        }
                    }
                    .padding(.horizontal, 30)
                    
                    // 忘记密码
                    if loginMode == .password {
                        HStack {
                            Spacer()
                            Button(action: showResetPassword) {
                                Text("忘记密码？")
                                    .font(.caption)
                                    .foregroundColor(.pink)
                            }
                        }
                        .padding(.horizontal, 30)
                        .padding(.top, -10)
                    }
                    
                    // 登录按钮
                    Button(action: login) {
                        if authViewModel.isLoading {
                            HStack(spacing: 8) {
                                ForEach(0..<3) { index in
                                    Circle()
                                        .fill(Color.white)
                                        .frame(width: 10, height: 10)
                                        .scaleEffect(authViewModel.isLoading ? 1.0 : 0.5)
                                        .animation(
                                            Animation.easeInOut(duration: 0.6)
                                                .repeatForever()
                                                .delay(Double(index) * 0.2),
                                            value: authViewModel.isLoading
                                        )
                                }
                            }
                        } else {
                            Text(loginMode == .code ? "登录/注册" : "登录")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                isLoginButtonEnabled ? Color.pink : Color.gray,
                                isLoginButtonEnabled ? Color.pink.opacity(0.8) : Color.gray.opacity(0.8)
                            ]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
                    .padding(.horizontal, 30)
                    .disabled(!isLoginButtonEnabled || authViewModel.isLoading)
                    .scaleEffect(authViewModel.isLoading ? 0.98 : 1.0)
                    
                    // 错误提示
                    if let error = authViewModel.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding(.horizontal, 30)
                            .multilineTextAlignment(.center)
                    }
                    
                    Spacer()
                    
                    // 用户协议
                    VStack(spacing: 8) {
                        if loginMode == .code {
                            Text("首次登录将自动注册账号")
                                .font(.caption2)
                                .foregroundColor(Color(red: 0.5, green: 0.5, blue: 0.5))
                        }
                        
                        HStack(spacing: 4) {
                            Text("登录即表示同意")
                                .font(.caption)
                                .foregroundColor(Color(red: 0.5, green: 0.5, blue: 0.5))
                            
                            Button(action: { showUserAgreement = true }) {
                                Text("《用户协议》")
                                    .font(.caption)
                                    .foregroundColor(.pink)
                            }
                            
                            Text("和")
                                .font(.caption)
                                .foregroundColor(Color(red: 0.5, green: 0.5, blue: 0.5))
                            
                            Button(action: { showPrivacyPolicy = true }) {
                                Text("《隐私政策》")
                                    .font(.caption)
                                    .foregroundColor(.pink)
                            }
                        }
                    }
                    .padding(.bottom, 30)
                }
            }
        }
        .sheet(isPresented: $showUserAgreement) {
            UserAgreementView()
        }
        .sheet(isPresented: $showPrivacyPolicy) {
            PrivacyPolicyView()
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
    
    // MARK: - 登录按钮是否可用
    private var isLoginButtonEnabled: Bool {
        if loginMode == .code {
            return !phone.isEmpty && !code.isEmpty && isValidPhone(phone)
        } else {
            return !phone.isEmpty && !password.isEmpty && isValidPhone(phone)
        }
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
    
    // MARK: - 登录
    private func login() {
        Task {
            if loginMode == .code {
                await authViewModel.login(phone: phone, code: code)
            } else {
                await authViewModel.loginWithPassword(phone: phone, password: password)
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
