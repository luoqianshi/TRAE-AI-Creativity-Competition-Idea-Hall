import SwiftUI

class ThemeManager: ObservableObject {
    @Published var isDarkMode: Bool {
        didSet {
            UserDefaults.standard.set(isDarkMode, forKey: "isDarkMode")
        }
    }
    
    static let shared = ThemeManager()
    
    private init() {
        if let saved = UserDefaults.standard.object(forKey: "isDarkMode") as? Bool {
            isDarkMode = saved
        } else {
            isDarkMode = true
        }
    }
}

struct ThemeModeKey: EnvironmentKey {
    static var defaultValue: ThemeManager = ThemeManager.shared
}

extension EnvironmentValues {
    var themeManager: ThemeManager {
        get { self[ThemeModeKey.self] }
        set { self[ThemeModeKey.self] = newValue }
    }
}

struct DarkGradientBackground: View {
    var body: some View {
        ZStack {
            Color(red: 0.005, green: 0.01, blue: 0.02)
                .ignoresSafeArea()
            
            LinearGradient(
                colors: [
                    Color(red: 0.08, green: 0.22, blue: 0.38),
                    Color(red: 0.04, green: 0.12, blue: 0.24),
                    Color(red: 0.02, green: 0.06, blue: 0.14),
                    Color(red: 0.005, green: 0.01, blue: 0.02)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            RadialGradient(
                colors: [
                    Color(red: 0.20, green: 0.55, blue: 0.70).opacity(0.55),
                    Color(red: 0.10, green: 0.35, blue: 0.50).opacity(0.30),
                    Color.clear
                ],
                center: .top,
                startRadius: 20,
                endRadius: 420
            )
            .ignoresSafeArea()
            
            RadialGradient(
                colors: [
                    Color(red: 0.25, green: 0.40, blue: 0.70).opacity(0.35),
                    Color.clear
                ],
                center: .topTrailing,
                startRadius: 40,
                endRadius: 300
            )
            .ignoresSafeArea()
            
            RadialGradient(
                colors: [
                    Color(red: 0.15, green: 0.45, blue: 0.50).opacity(0.20),
                    Color.clear
                ],
                center: .bottomLeading,
                startRadius: 80,
                endRadius: 400
            )
            .ignoresSafeArea()
            
            RadialGradient(
                colors: [
                    Color(red: 0.30, green: 0.25, blue: 0.50).opacity(0.15),
                    Color.clear
                ],
                center: UnitPoint(x: 0.9, y: 0.5),
                startRadius: 50,
                endRadius: 280
            )
            .ignoresSafeArea()
        }
    }
}

struct LightGradientBackground: View {
    var body: some View {
        ZStack {
            Color.white
                .ignoresSafeArea()
        }
    }
}

struct GlassCard: ViewModifier {
    var opacity: Double = 1.0
    var isDark: Bool = true
    
    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                    .fill(Theme.Colors.cardDark(isDark))
                    .opacity(opacity)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                            .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                    )
                    .shadow(color: isDark ? Color.black.opacity(0.25) : Color.black.opacity(0.06), radius: isDark ? 16 : 12, y: isDark ? 4 : 2)
            )
    }
}

struct ProfileCircleButton: View {
    var size: CGFloat = 44
    var isDark: Bool = true
    
    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [
                            Theme.Colors.accentBright.opacity(0.7),
                            Theme.Colors.accent.opacity(0.4)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: size, height: size)
            
            Circle()
                .fill(isDark ? Theme.Colors.bgDark.opacity(0.9) : Color.white.opacity(0.9))
                .frame(width: size - 4, height: size - 4)
            
            Image(systemName: "person.crop.circle.fill")
                .font(.system(size: size * 0.55, weight: .regular))
                .foregroundStyle(isDark ? .white : .black)
        }
    }
}

struct SectionTitle: View {
    let title: String
    var subtitle: String? = nil
    var isDark: Bool = true
    
    var body: some View {
        HStack(alignment: .bottom, spacing: Theme.Spacing.sm) {
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(title)
                    .font(Theme.Fonts.title2)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(Theme.Fonts.caption)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                }
            }
            Spacer()
        }
    }
}

struct DividerLine: View {
    var isDark: Bool = true
    
    var body: some View {
        Rectangle()
            .fill(Theme.Colors.divider(isDark))
            .frame(height: 1)
    }
}

extension View {
    func glassCard(opacity: Double = 1.0, isDark: Bool = true) -> some View {
        modifier(GlassCard(opacity: opacity, isDark: isDark))
    }
    
    func darkBackground() -> some View {
        background(DarkGradientBackground())
    }
    
    func lightBackground() -> some View {
        background(LightGradientBackground())
    }
    
    @ViewBuilder
    func themedBackground(isDark: Bool) -> some View {
        if isDark {
            background(DarkGradientBackground())
        } else {
            background(LightGradientBackground())
        }
    }
}

struct MountainRiverBackground: View {
    var body: some View {
        DarkGradientBackground()
    }
}

struct InkBorderCard: ViewModifier {
    var isDark: Bool = true
    
    func body(content: Content) -> some View {
        content
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

struct SealStamp: View {
    let text: String
    
    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                RoundedRectangle(cornerRadius: 4)
                    .fill(Theme.Colors.vermilion)
            )
    }
}

// MARK: - 可滑动卡片组件
struct SwipeableCard<Content: View, Actions: View>: View {
    var isDark: Bool
    var swipeAreaRatio: CGFloat = 1.0
    @ViewBuilder var content: () -> Content
    @ViewBuilder var actions: () -> Actions
    
    @State private var offset: CGFloat = 0
    @State private var isOpen: Bool = false
    
    private let actionWidth: CGFloat = 80
    
    var body: some View {
        ZStack(alignment: .trailing) {
            content()
                .offset(x: offset)
            
            VStack(spacing: 0) {
                actions()
            }
            .frame(width: actionWidth)
            .offset(x: offset + actionWidth)
            
            HStack {
                Rectangle()
                    .fill(.ultraThinMaterial)
                    .opacity(offset > 0 ? Double(min(offset / 100, 1.0)) : 0)
                    .frame(width: max(offset, 0))
                Spacer()
            }
            .allowsHitTesting(false)
            .offset(x: offset)
        }
        .contentShape(Rectangle())
        .overlay(
            GeometryReader { geo in
                SwipeGestureView(
                    actionWidth: actionWidth,
                    swipeAreaRatio: swipeAreaRatio,
                    onChanged: { delta in
                        if isOpen {
                            offset = min(0, -actionWidth + delta)
                        } else {
                            offset = min(0, delta)
                        }
                    },
                    onEnded: { velocity in
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                            if offset < -actionWidth * 0.5 {
                                offset = -actionWidth
                                isOpen = true
                            } else {
                                offset = 0
                                isOpen = false
                            }
                        }
                    }
                )
                .frame(width: geo.size.width * swipeAreaRatio, alignment: .leading)
            }
        )
        .onTapGesture {
            if isOpen {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    offset = 0
                    isOpen = false
                }
            }
        }
    }
}

// MARK: - UIKit滑动手势包装（确保与父ScrollView同时识别）
struct SwipeGestureView: UIViewRepresentable {
    let actionWidth: CGFloat
    var swipeAreaRatio: CGFloat = 1.0
    let onChanged: (CGFloat) -> Void
    let onEnded: (CGFloat) -> Void
    
    func makeUIView(context: Context) -> UIView {
        let view = UIView()
        view.backgroundColor = .clear
        let pan = UIPanGestureRecognizer(
            target: context.coordinator,
            action: #selector(Coordinator.handlePan(_:))
        )
        pan.delegate = context.coordinator
        pan.minimumNumberOfTouches = 1
        view.addGestureRecognizer(pan)
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(actionWidth: actionWidth, onChanged: onChanged, onEnded: onEnded)
    }
    
    class Coordinator: NSObject, UIGestureRecognizerDelegate {
        let actionWidth: CGFloat
        let onChanged: (CGFloat) -> Void
        let onEnded: (CGFloat) -> Void
        private var startX: CGFloat = 0
        private var isHorizontal: Bool = false
        private var initialOffset: CGFloat = 0
        
        init(actionWidth: CGFloat, onChanged: @escaping (CGFloat) -> Void, onEnded: @escaping (CGFloat) -> Void) {
            self.actionWidth = actionWidth
            self.onChanged = onChanged
            self.onEnded = onEnded
        }
        
        @objc func handlePan(_ gesture: UIPanGestureRecognizer) {
            let translation = gesture.translation(in: gesture.view)
            let velocity = gesture.velocity(in: gesture.view)
            
            switch gesture.state {
            case .began:
                startX = translation.x
                isHorizontal = false
            case .changed:
                if !isHorizontal {
                    let dx = abs(translation.x)
                    let dy = abs(translation.y)
                    if dx > 15 && dx > dy * 1.5 {
                        isHorizontal = true
                        initialOffset = translation.x
                    }
                    return
                }
                let delta = translation.x - initialOffset
                onChanged(delta)
            case .ended, .cancelled:
                if isHorizontal {
                    onEnded(velocity.x)
                }
                isHorizontal = false
            default:
                break
            }
        }
        
        func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
            return true
        }
    }
}

// MARK: - 滚动偏移PreferenceKey
struct ScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}
