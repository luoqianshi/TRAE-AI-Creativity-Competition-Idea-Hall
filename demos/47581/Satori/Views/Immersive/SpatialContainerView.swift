import SwiftUI

struct SpatialContainerView: View {
    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Image(systemName: "cube.box.fill")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.primary(true))
            Text("空间容器")
                .font(Theme.Fonts.headline)
                .foregroundStyle(Theme.Colors.primary(true))
            Text("在 Vision Pro 设备上查看 3D 非遗作品模型")
                .font(Theme.Fonts.body)
                .foregroundStyle(Theme.Colors.secondary(true))
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(DarkGradientBackground())
    }
}