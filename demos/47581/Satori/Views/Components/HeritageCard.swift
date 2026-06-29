import SwiftUI

struct HeritageCard: View {
    let item: HeritageItem
    var isDark: Bool = true

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            ZStack(alignment: .bottom) {
                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                    .fill(Theme.Colors.cardDark(isDark))

                if let firstImage = item.images.first, !firstImage.isEmpty {
                    AsyncImage(url: URL(string: firstImage)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        case .failure, .empty:
                            placeholderView
                        @unknown default:
                            placeholderView
                        }
                    }
                    .frame(height: 130)
                    .cornerRadius(Theme.Radius.md)
                    .clipped()
                } else {
                    placeholderView
                        .frame(height: 130)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(item.category.rawValue)
                        .font(Theme.Fonts.small)
                        .foregroundStyle(Theme.Colors.accentBright)
                    Spacer()
                }

                Text(item.name)
                    .font(Theme.Fonts.body)
                    .fontWeight(.semibold)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                    .lineLimit(2)

                Text(item.description)
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.secondary(isDark))
                    .lineLimit(2)

                if let price = item.price {
                    Text("¥\(NSDecimalNumber(decimal: price).doubleValue, specifier: "%.0f")")
                        .font(Theme.Fonts.caption)
                        .fontWeight(.bold)
                        .foregroundStyle(Theme.Colors.accentBright)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.md)
        }
        .glassCard(isDark: isDark)
    }

    private var placeholderView: some View {
        LinearGradient(
            colors: [
                Theme.Colors.bgMid.opacity(0.6),
                Theme.Colors.accent(isDark).opacity(0.15),
                Theme.Colors.bgDark.opacity(0.5)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}
