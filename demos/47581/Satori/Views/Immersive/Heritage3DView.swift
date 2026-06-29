import SwiftUI

struct Heritage3DView: View {
    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Image(systemName: "photo.3d")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.accent)
            Text("3D 作品展示")
                .font(Theme.Fonts.headline)
                .foregroundStyle(Theme.Colors.primary(true))
            Text("非遗作品的三维模型即将上线")
                .font(Theme.Fonts.body)
                .foregroundStyle(Theme.Colors.secondary(true))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(DarkGradientBackground())
        .navigationTitle("3D 作品")
        .navigationBarTitleDisplayMode(.inline)
    }
}