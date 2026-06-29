import SwiftUI
import UIKit

class ScrollViewGestureCoordinator: NSObject, UIGestureRecognizerDelegate {
    static let shared = ScrollViewGestureCoordinator()
    
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return true
    }
}

@main
struct SatoriApp: App {
    @State private var showSplash = true
    @StateObject private var themeManager = ThemeManager.shared
    
    init() {
        UIScrollView.appearance().keyboardDismissMode = .onDrag
    }
    
    var body: some Scene {
        WindowGroup {
            ZStack {
                MainTabView()
                    .environmentObject(themeManager)
                    .opacity(showSplash ? 0 : 1)
                    .scaleEffect(showSplash ? 1.05 : 1.0)
                    .blur(radius: showSplash ? 20 : 0)
                
                if showSplash {
                    SplashScreenView()
                        .opacity(showSplash ? 1 : 0)
                        .scaleEffect(showSplash ? 1.0 : 1.1)
                        .blur(radius: showSplash ? 0 : 10)
                }
            }
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                    withAnimation(.easeInOut(duration: 0.9)) {
                        showSplash = false
                    }
                }
            }
        }
    }
}
