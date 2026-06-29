import SwiftUI

struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String?
    var isDark: Bool = true
    
    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            ZStack {
                Circle()
                    .fill(
                        isDark ?
                        RadialGradient(
                            colors: [Theme.Colors.bgLight, Theme.Colors.bgMid.opacity(0.85)],
                            center: .center, startRadius: 10, endRadius: 70
                        ) :
                        RadialGradient(
                            colors: [
                                Color(red: 0.92, green: 0.95, blue: 0.97),
                                Color(red: 0.88, green: 0.92, blue: 0.95)
                            ],
                            center: .center, startRadius: 10, endRadius: 70
                        )
                    )
                    .frame(width: 120, height: 120)
                Image(systemName: icon)
                    .font(.system(size: 52, weight: .light))
                    .foregroundStyle(Theme.Colors.accentBright.opacity(0.85))
            }
            
            VStack(spacing: Theme.Spacing.xs) {
                Text(title)
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                        .multilineTextAlignment(.center)
                }
            }
        }
        .padding(Theme.Spacing.xl * 2)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
