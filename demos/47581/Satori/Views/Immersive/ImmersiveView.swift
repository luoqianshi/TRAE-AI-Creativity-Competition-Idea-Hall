import SwiftUI

struct ImmersiveView: View {
    var body: some View {
        VStack(spacing: Theme.Spacing.xl) {
            Image(systemName: "sparkles")
                .font(.system(size: 80))
                .foregroundStyle(Theme.Colors.accent)
            Text("沉浸式体验")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundStyle(Theme.Colors.primary(true))
            Text("此功能需要 visionOS 设备支持")
                .font(.body)
                .foregroundStyle(Theme.Colors.secondary(true))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(DarkGradientBackground())
        .navigationTitle("沉浸体验")
        .navigationBarTitleDisplayMode(.inline)
    }
}