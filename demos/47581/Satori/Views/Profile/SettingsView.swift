import SwiftUI

struct SettingsView: View {
    @ObservedObject var viewModel: ProfileViewModel
    @EnvironmentObject var themeManager: ThemeManager
    @State private var nickname: String = ""
    @Environment(\.dismiss) private var dismiss
    
    private var isDark: Bool { themeManager.isDarkMode }
    
    init(viewModel: ProfileViewModel) {
        self.viewModel = viewModel
        _nickname = State(initialValue: viewModel.user.nickname)
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
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
                    Text("设置")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }
                .padding(.bottom, Theme.Spacing.md)
                
                // 账户设置
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("账户")
                        .font(Theme.Fonts.caption)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                        .padding(.horizontal, Theme.Spacing.md)
                    
                    VStack(spacing: 0) {
                        HStack {
                            Text("昵称")
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Spacer()
                            TextField("请输入昵称", text: $nickname)
                                .multilineTextAlignment(.trailing)
                                .foregroundStyle(Theme.Colors.primary(isDark))
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.vertical, Theme.Spacing.md)
                        
                        Rectangle()
                            .fill(Theme.Colors.divider(isDark))
                            .frame(height: 0.5)
                            .padding(.leading, Theme.Spacing.lg)
                        
                        HStack {
                            Text("手艺值")
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Spacer()
                            Text("\(viewModel.user.skillValue)")
                                .foregroundStyle(Theme.Colors.accentBright)
                                .fontWeight(.semibold)
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.vertical, Theme.Spacing.md)
                    }
                    .background(
                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                            .fill(Theme.Colors.cardDark(isDark))
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                    .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                            )
                    )
                }
                
                // 主题设置
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("主题")
                        .font(Theme.Fonts.caption)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                        .padding(.horizontal, Theme.Spacing.md)
                    
                    HStack(spacing: Theme.Spacing.md) {
                        Button(action: {
                            themeManager.isDarkMode = false
                        }) {
                            VStack(spacing: Theme.Spacing.sm) {
                                Image(systemName: "sun.max.fill")
                                    .font(.system(size: 24))
                                    .foregroundStyle(!isDark ? .white : Theme.Colors.secondary(isDark))
                                Text("亮色模式")
                                    .font(.system(size: 13))
                                    .foregroundStyle(!isDark ? .white : Theme.Colors.primary(isDark))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Theme.Spacing.md)
                            .background(
                                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                    .fill(!isDark ? Theme.Colors.accent : Theme.Colors.cardDark(isDark))
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                    .stroke(!isDark ? Theme.Colors.accentBright : Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                            )
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        
                        Button(action: {
                            themeManager.isDarkMode = true
                        }) {
                            VStack(spacing: Theme.Spacing.sm) {
                                Image(systemName: "moon.fill")
                                    .font(.system(size: 24))
                                    .foregroundStyle(isDark ? .white : Theme.Colors.secondary(isDark))
                                Text("暗色模式")
                                    .font(.system(size: 13))
                                    .foregroundStyle(isDark ? .white : Theme.Colors.primary(isDark))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Theme.Spacing.md)
                            .background(
                                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                    .fill(isDark ? Theme.Colors.accent : Theme.Colors.cardDark(isDark))
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                    .stroke(isDark ? Theme.Colors.accentBright : Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                            )
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(Theme.Spacing.md)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                            .fill(Theme.Colors.cardDark(isDark))
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                    .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                            )
                    )
                }
                
                // 关于
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("关于")
                        .font(Theme.Fonts.caption)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                        .padding(.horizontal, Theme.Spacing.md)
                    
                    VStack(spacing: 0) {
                        HStack {
                            Text("应用名称")
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Spacer()
                            Text("Satori · 非遗传承")
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.vertical, Theme.Spacing.md)
                        
                        Rectangle()
                            .fill(Theme.Colors.divider(isDark))
                            .frame(height: 0.5)
                            .padding(.leading, Theme.Spacing.lg)
                        
                        HStack {
                            Text("版本")
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Spacer()
                            Text("1.0.0")
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.vertical, Theme.Spacing.md)
                        
                        Rectangle()
                            .fill(Theme.Colors.divider(isDark))
                            .frame(height: 0.5)
                            .padding(.leading, Theme.Spacing.lg)
                        
                        HStack {
                            Text("设计理念")
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Spacer()
                            Text("水墨山水 · 匠心传承")
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                                .font(.system(size: 13))
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.vertical, Theme.Spacing.md)
                    }
                    .background(
                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                            .fill(Theme.Colors.cardDark(isDark))
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                    .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                            )
                    )
                }
                
                Color.clear.frame(height: Theme.Spacing.xl)
            }
            .padding(Theme.Spacing.lg)
        }
        .themedBackground(isDark: isDark)
        .navigationBarHidden(true)
    }
}
