import SwiftUI

struct CraftsmanDetailView: View {
    let craftsman: Craftsman
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                // 顶部返回按钮
                HStack {
                    Button(action: { dismiss() }) {
                        ZStack {
                            Circle()
                                .fill(isDark ? Color.black.opacity(0.3) : Color.black.opacity(0.1))
                                .frame(width: 40, height: 40)
                            Image(systemName: "chevron.left")
                                .font(.system(size: 18, weight: .medium))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                        }
                    }
                    Spacer()
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.lg)
                
                VStack(spacing: Theme.Spacing.md) {
                    ZStack {
                        Circle()
                            .fill(
                                isDark ?
                                RadialGradient(
                                    colors: [Theme.Colors.bgLight, Theme.Colors.bgMid.opacity(0.85)],
                                    center: .center, startRadius: 20, endRadius: 90
                                ) :
                                RadialGradient(
                                    colors: [Color(red: 0.92, green: 0.95, blue: 0.97), Color(red: 0.88, green: 0.92, blue: 0.95)],
                                    center: .center, startRadius: 20, endRadius: 90
                                )
                            )
                            .frame(width: 150, height: 150)
                        Circle()
                            .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 1)
                            .frame(width: 150, height: 150)
                        Text(String(craftsman.name.prefix(1)))
                            .font(.system(size: 68, weight: .bold))
                            .foregroundStyle(Theme.Colors.accentBright.opacity(0.9))
                    }
                    
                    Text(craftsman.name)
                        .font(.system(size: 26, weight: .bold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    
                    Text(craftsman.title)
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                }
                .frame(maxWidth: .infinity)
                
                HStack {
                    infoBlock(title: "从业", value: "\(craftsman.experience) 年")
                    Spacer()
                    infoBlock(title: "领域", value: craftsman.category)
                    Spacer()
                    infoBlock(title: "所在地", value: craftsman.location)
                }
                .padding(Theme.Spacing.lg)
                .background(
                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                        .fill(Theme.Colors.cardDark(isDark))
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                        )
                )
                .padding(.horizontal, Theme.Spacing.lg)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                    Text("匠人简介")
                        .font(Theme.Fonts.headline)
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Text(craftsman.bio)
                        .font(Theme.Fonts.body)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                        .lineSpacing(8)
                }
                .padding(Theme.Spacing.lg)
                .background(
                    RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                        .fill(Theme.Colors.cardDark(isDark))
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                        )
                )
                .padding(.horizontal, Theme.Spacing.lg)
                
                if !craftsman.works.isEmpty {
                    VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                        Text("代表作品")
                            .font(Theme.Fonts.headline)
                            .foregroundStyle(Theme.Colors.primary(isDark))
                        VStack(spacing: Theme.Spacing.sm) {
                            ForEach(craftsman.works, id: \.self) { work in
                                HStack(spacing: Theme.Spacing.sm) {
                                    Image(systemName: "bookmark.fill")
                                        .foregroundStyle(Theme.Colors.accent)
                                        .font(.system(size: 14))
                                    Text(work)
                                        .font(Theme.Fonts.body)
                                        .foregroundStyle(Theme.Colors.primary(isDark))
                                    Spacer()
                                }
                                .padding(.vertical, Theme.Spacing.sm)
                                
                                if craftsman.works.last != work {
                                    Rectangle()
                                        .fill(Theme.Colors.divider(isDark))
                                        .frame(height: 0.5)
                                }
                            }
                        }
                    }
                    .padding(Theme.Spacing.lg)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                            .fill(Theme.Colors.cardDark(isDark))
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                    .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                            )
                    )
                    .padding(.horizontal, Theme.Spacing.lg)
                }
                
                Color.clear.frame(height: Theme.Spacing.xl)
            }
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
    
    private func infoBlock(title: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(title)
                .font(Theme.Fonts.small)
                .foregroundStyle(Theme.Colors.secondary(isDark))
            Text(value)
                .font(Theme.Fonts.caption)
                .fontWeight(.semibold)
                .foregroundStyle(Theme.Colors.primary(isDark))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }
}
