import SwiftUI

struct ProductCard: View {
    let product: Product
    var isDark: Bool = true

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            ZStack {
                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                    .fill(Theme.Colors.cardDark(isDark))

                if let imageUrl = product.image, !imageUrl.isEmpty {
                    AsyncImage(url: URL(string: imageUrl)) { phase in
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
                } else {
                    placeholderView
                }
            }
            .frame(width: 90, height: 90)
            .cornerRadius(Theme.Radius.md)
            .clipped()

            VStack(alignment: .leading, spacing: 6) {
                Text(product.name)
                    .font(Theme.Fonts.body)
                    .fontWeight(.semibold)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                    .lineLimit(2)

                Text(product.description)
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.secondary(isDark))
                    .lineLimit(2)

                if let craftsman = product.craftsmanName {
                    HStack(spacing: 4) {
                        Image(systemName: "person.text.rectangle")
                            .font(.system(size: 11))
                        Text("匠人·\(craftsman)")
                            .font(Theme.Fonts.small)
                    }
                    .foregroundStyle(Theme.Colors.tertiary(isDark))
                }

                HStack {
                    Text("¥\(NSDecimalNumber(decimal: product.price).doubleValue, specifier: "%.0f")")
                        .font(Theme.Fonts.headline)
                        .fontWeight(.bold)
                        .foregroundStyle(Theme.Colors.vermilion)
                    Spacer()
                }
            }
        }
        .padding(Theme.Spacing.md)
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
