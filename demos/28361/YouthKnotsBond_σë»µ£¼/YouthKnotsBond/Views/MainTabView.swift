import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var conversationVM = ConversationViewModel()
    @StateObject private var cardVM = CardViewModel()
    @StateObject private var timelineVM = TimelineViewModel()
    @StateObject private var tagVM = TagViewModel()
    
    var body: some View {
        TabView {
            // 对话页面
            ChatView()
                .environmentObject(conversationVM)
                .environmentObject(cardVM)
                .environmentObject(tagVM)
                .tabItem {
                    Label("对话", systemImage: "message.fill")
                }
            
            // 问题卡片
            CardListView()
                .environmentObject(cardVM)
                .environmentObject(tagVM)
                .tabItem {
                    Label("卡片", systemImage: "square.stack.fill")
                }
            
            // 时间轴
            TimelineView()
                .environmentObject(timelineVM)
                .environmentObject(tagVM)
                .tabItem {
                    Label("时间轴", systemImage: "clock.fill")
                }
            
            // 个人中心
            ProfileView()
                .tabItem {
                    Label("我的", systemImage: "person.fill")
                }
        }
        .accentColor(.pink)
    }
}
