import SwiftUI

@main
struct YouthKnotsBondApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    
    init() {
        // 在App启动时立即发起一个网络请求，触发iOS系统的网络权限弹窗
        triggerNetworkPermissionPrompt()
    }
    
    var body: some Scene {
        WindowGroup {
            Group {
                if authViewModel.isAuthenticated {
                    MainTabView()
                        .environmentObject(authViewModel)
                } else {
                    AuthContainerView()
                        .environmentObject(authViewModel)
                }
            }
        }
    }
    
    /// 触发网络权限提示
    /// 在App启动时发起一个简单的网络请求，让iOS系统弹出网络权限选择弹窗
    private func triggerNetworkPermissionPrompt() {
        // 发起一个简单的网络请求到服务器
        guard let url = URL(string: "https://youthknotsbond.qingguoguang.com/api/health") else { return }
        
        let task = URLSession.shared.dataTask(with: url) { _, _, _ in
            // 不需要处理响应，只是为了触发网络权限弹窗
            print("✅ 网络权限检查完成")
        }
        task.resume()
    }
}
