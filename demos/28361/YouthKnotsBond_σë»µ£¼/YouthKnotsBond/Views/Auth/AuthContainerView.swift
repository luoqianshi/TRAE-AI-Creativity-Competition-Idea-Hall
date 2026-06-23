import SwiftUI

struct AuthContainerView: View {
    @State private var currentPage: AuthPage = .login
    
    enum AuthPage {
        case login
        case resetPassword
    }
    
    var body: some View {
        NavigationView {
            Group {
                switch currentPage {
                case .login:
                    LoginView(showResetPassword: {
                        currentPage = .resetPassword
                    })
                case .resetPassword:
                    ResetPasswordView(backToLogin: {
                        currentPage = .login
                    })
                }
            }
        }
    }
}
