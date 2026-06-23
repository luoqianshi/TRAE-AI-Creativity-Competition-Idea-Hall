import SwiftUI

// MARK: - 温馨渐变背景
struct WarmGradientBackground: View {
    var body: some View {
        LinearGradient(
            gradient: Gradient(colors: [
                Color(red: 1.0, green: 0.95, blue: 0.95),
                Color(red: 1.0, green: 0.98, blue: 0.95),
                Color.white
            ]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}

// MARK: - 温馨卡片样式
struct WarmCardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white)
                    .shadow(color: Color.pink.opacity(0.1), radius: 10, x: 0, y: 5)
            )
    }
}

extension View {
    func warmCardStyle() -> some View {
        modifier(WarmCardStyle())
    }
}

// MARK: - 主题颜色
extension Color {
    static let warmPink = Color(red: 1.0, green: 0.75, blue: 0.8)
    static let warmOrange = Color(red: 1.0, green: 0.85, blue: 0.7)
    static let warmPurple = Color(red: 0.9, green: 0.8, blue: 1.0)
    static let softGray = Color(red: 0.95, green: 0.95, blue: 0.97)
}

// MARK: - 温馨按钮样式
struct WarmButtonStyle: ButtonStyle {
    var color: Color = .pink
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .frame(maxWidth: .infinity)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [color, color.opacity(0.8)]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .foregroundColor(.white)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: configuration.isPressed)
    }
}

// MARK: - 浮动动画
struct FloatingAnimation: ViewModifier {
    @State private var isAnimating = false
    
    func body(content: Content) -> some View {
        content
            .offset(y: isAnimating ? -10 : 0)
            .animation(
                Animation.easeInOut(duration: 2.0)
                    .repeatForever(autoreverses: true),
                value: isAnimating
            )
            .onAppear {
                isAnimating = true
            }
    }
}

extension View {
    func floatingAnimation() -> some View {
        modifier(FloatingAnimation())
    }
}

// MARK: - 温馨图标
struct WarmIcon: View {
    let systemName: String
    let color: Color
    let size: CGFloat
    
    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [color.opacity(0.2), color.opacity(0.1)]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: size * 1.5, height: size * 1.5)
            
            Image(systemName: systemName)
                .font(.system(size: size))
                .foregroundColor(color)
        }
    }
}

// MARK: - 标签样式
struct WarmTagView: View {
    let text: String
    let color: Color
    
    var body: some View {
        Text(text)
            .font(.caption)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [color.opacity(0.2), color.opacity(0.1)]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
            )
            .foregroundColor(color)
    }
}

// MARK: - 输入框样式
struct WarmTextFieldStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white)
                    .shadow(color: Color.gray.opacity(0.1), radius: 5, x: 0, y: 2)
            )
    }
}

extension View {
    func warmTextFieldStyle() -> some View {
        modifier(WarmTextFieldStyle())
    }
}

// MARK: - 分隔线
struct WarmDivider: View {
    var body: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color.clear,
                        Color.pink.opacity(0.3),
                        Color.clear
                    ]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .frame(height: 1)
    }
}

// MARK: - 加载动画
struct WarmLoadingView: View {
    @State private var isAnimating = false
    
    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(Color.pink)
                    .frame(width: 10, height: 10)
                    .scaleEffect(isAnimating ? 1.0 : 0.5)
                    .animation(
                        Animation.easeInOut(duration: 0.6)
                            .repeatForever()
                            .delay(Double(index) * 0.2),
                        value: isAnimating
                    )
            }
        }
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - 空状态视图
struct WarmEmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    
    var body: some View {
        VStack(spacing: 20) {
            WarmIcon(systemName: icon, color: .pink, size: 50)
                .floatingAnimation()
            
            Text(title)
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
