import SwiftUI

struct ImageGalleryView: View {
    let images: [String]
    let title: String
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        VStack(spacing: 0) {
            // 顶部返回按钮和标题
            HStack {
                Button(action: { dismiss() }) {
                    ZStack {
                        Circle()
                            .fill(Color.black.opacity(0.3))
                            .frame(width: 40, height: 40)
                        Image(systemName: "chevron.left")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(.white)
                    }
                }
                Spacer()
                Text(title)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(.white)
                Spacer()
                Color.clear.frame(width: 40, height: 40)
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.top, Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.md)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.Spacing.md) {
                    ForEach(images, id: \.self) { img in
                        ZStack {
                            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [
                                            Theme.Colors.bgMid.opacity(0.6),
                                            Theme.Colors.accent(isDark).opacity(0.15),
                                            Theme.Colors.bgDark.opacity(0.5)
                                        ],
                                        startPoint: .topLeading, endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 300, height: 220)
                            
                            GeometryReader { geo in
                                Path { path in
                                    let w = geo.size.width
                                    let h = geo.size.height
                                    path.move(to: CGPoint(x: 0, y: h * 0.72))
                                    path.addQuadCurve(to: CGPoint(x: w * 0.35, y: h * 0.48),
                                                     control: CGPoint(x: w * 0.17, y: h * 0.55))
                                    path.addQuadCurve(to: CGPoint(x: w * 0.65, y: h * 0.58),
                                                     control: CGPoint(x: w * 0.5, y: h * 0.52))
                                    path.addQuadCurve(to: CGPoint(x: w, y: h * 0.5),
                                                     control: CGPoint(x: w * 0.82, y: h * 0.55))
                                    path.addLine(to: CGPoint(x: w, y: h))
                                    path.addLine(to: CGPoint(x: 0, y: h))
                                    path.closeSubpath()
                                }
                                .fill(Theme.Colors.accent.opacity(0.2))
                            }
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
            }
            Spacer()
        }
        .background(DarkGradientBackground())
        .navigationBarHidden(true)
    }
}
