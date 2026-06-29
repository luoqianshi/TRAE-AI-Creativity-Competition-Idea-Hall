import SwiftUI

struct CraftsmanCard: View {
    let craftsman: Craftsman
    var isDark: Bool = true

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            ZStack {
                Circle()
                    .fill(Theme.Colors.cardDark(isDark))
                    .overlay(
                        Circle()
                            .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.8)
                    )

                if !craftsman.avatar.isEmpty, let url = URL(string: craftsman.avatar) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .clipShape(Circle())
                        case .failure, .empty:
                            Text(String(craftsman.name.prefix(1)))
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                        @unknown default:
                            Text(String(craftsman.name.prefix(1)))
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                        }
                    }
                } else {
                    Text(String(craftsman.name.prefix(1)))
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                }
            }
            .frame(width: 56, height: 56)

            VStack(alignment: .leading, spacing: 4) {
                Text(craftsman.name)
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                Text(craftsman.title)
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.secondary(isDark))
                    .lineLimit(1)
                HStack(spacing: 6) {
                    Image(systemName: "mappin.and.ellipse")
                        .font(.system(size: 10))
                    Text(craftsman.location)
                        .font(Theme.Fonts.small)
                }
                .foregroundStyle(Theme.Colors.tertiary(isDark))
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Theme.Colors.secondary(isDark).opacity(0.5))
        }
        .padding(Theme.Spacing.md)
        .glassCard(isDark: isDark)
    }
}
