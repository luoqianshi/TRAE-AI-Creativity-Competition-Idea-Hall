import SwiftUI

struct SearchView: View {
    @State private var keyword: String = ""
    @EnvironmentObject var themeManager: ThemeManager
    @Environment(\.dismiss) private var dismiss
    @FocusState private var isFocused: Bool
    
    private var isDark: Bool { themeManager.isDarkMode }

    var filteredItems: [HeritageItem] {
        guard !keyword.isEmpty else { return [] }
        let lower = keyword.lowercased()
        return MockData.heritageItems.filter {
            $0.name.lowercased().contains(lower) ||
            $0.category.rawValue.contains(keyword) ||
            $0.description.lowercased().contains(lower)
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.xxl) {
                    VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                        HStack(spacing: Theme.Spacing.md) {
                            Button(action: { dismiss() }) {
                                Image(systemName: "chevron.left")
                                    .font(.system(size: 20, weight: .medium))
                                    .foregroundStyle(Theme.Colors.primary(isDark))
                            }
                            
                            HStack(spacing: Theme.Spacing.sm) {
                                Image(systemName: "magnifyingglass")
                                    .foregroundStyle(Theme.Colors.secondary(isDark))
                                TextField("搜索非遗作品、匠人、分类...", text: $keyword)
                                    .foregroundStyle(Theme.Colors.primary(isDark))
                                    .focused($isFocused)
                                if !keyword.isEmpty {
                                    Button(action: { keyword = "" }) {
                                        Image(systemName: "xmark.circle.fill")
                                            .foregroundStyle(Theme.Colors.secondary(isDark))
                                    }
                                }
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
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.top, 12)
                        .onAppear {
                            isFocused = true
                        }
                    }

                    if keyword.isEmpty {
                        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                            SectionTitle(title: "热门搜索", subtitle: "点击快速查找", isDark: isDark)
                                .padding(.horizontal, Theme.Spacing.lg)

                            WrappingHStack(horizontalSpacing: Theme.Spacing.sm, verticalSpacing: Theme.Spacing.sm) {
                                ForEach(["青花", "刺绣", "木雕", "剪纸", "漆器", "玉器", "紫砂壶", "皮影"], id: \.self) { tag in
                                    Button(action: { keyword = tag }) {
                                        Text(tag)
                                            .font(Theme.Fonts.caption)
                                            .foregroundStyle(Theme.Colors.primary(isDark))
                                            .padding(.horizontal, Theme.Spacing.md)
                                            .padding(.vertical, Theme.Spacing.sm)
                                            .background(
                                                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                                    .fill(Theme.Colors.cardDark(isDark))
                                                    .overlay(
                                                        RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                                                            .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                                                    )
                                            )
                                    }
                                }
                            }
                            .padding(.horizontal, Theme.Spacing.lg)
                        }

                        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                            SectionTitle(title: "热门分类", subtitle: "按类目浏览", isDark: isDark)
                                .padding(.horizontal, Theme.Spacing.lg)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: Theme.Spacing.md) {
                                    ForEach(Category.allCases) { category in
                                        NavigationLink {
                                            CategoryListView(category: category)
                                                .environmentObject(themeManager)
                                        } label: {
                                            searchCategoryChip(category)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                }
                                .padding(.horizontal, Theme.Spacing.lg)
                            }
                        }

                        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                            SectionTitle(title: "热门作品", subtitle: "大家都在看", isDark: isDark)
                                .padding(.horizontal, Theme.Spacing.lg)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: Theme.Spacing.md) {
                                    ForEach(MockData.heritageItems) { item in
                                        NavigationLink {
                                            HeritageDetailView(item: item)
                                                .environmentObject(themeManager)
                                        } label: {
                                            HeritageCard(item: item, isDark: isDark)
                                                .frame(width: 200)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                }
                                .padding(.horizontal, Theme.Spacing.lg)
                            }
                        }
                    } else if filteredItems.isEmpty {
                        EmptyStateView(icon: "exclamationmark.triangle", title: "未找到相关内容", subtitle: "试试其他关键词", isDark: isDark)
                    } else {
                        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                            SectionTitle(title: "搜索结果", subtitle: "共 \(filteredItems.count) 件", isDark: isDark)
                                .padding(.horizontal, Theme.Spacing.lg)

                            VStack(spacing: Theme.Spacing.sm) {
                                ForEach(filteredItems) { item in
                                    NavigationLink {
                                        HeritageDetailView(item: item)
                                            .environmentObject(themeManager)
                                    } label: {
                                        HeritageCard(item: item, isDark: isDark)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            .padding(.horizontal, Theme.Spacing.lg)
                        }
                    }

                    Color.clear.frame(height: Theme.Spacing.xl)
                }
            }
            .themedBackground(isDark: isDark)
            .onTapGesture {
                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
            }
            .navigationBarHidden(true)
        }
    }

    private func searchCategoryChip(_ category: Category) -> some View {
        VStack(spacing: Theme.Spacing.sm) {
            ZStack {
                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                    .fill(Theme.Colors.cardDark(isDark))
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                            .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                    )
                    .frame(width: 70, height: 70)

                Image(systemName: category.icon)
                    .font(.system(size: 26, weight: .light))
                    .foregroundStyle(Theme.Colors.accentBright)
            }

            Text(category.rawValue)
                .font(Theme.Fonts.caption)
                .foregroundStyle(Theme.Colors.primary(isDark))
                .frame(width: 80)
                .lineLimit(1)
        }
    }
}

struct WrappingHStack: Layout {
    var horizontalSpacing: CGFloat = 8
    var verticalSpacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 0
        var height: CGFloat = 0
        var currentRowHeight: CGFloat = 0
        var currentX: CGFloat = 0
        var isFirstInRow = true

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > width && !isFirstInRow {
                height += currentRowHeight + verticalSpacing
                currentX = size.width
                currentRowHeight = size.height
                isFirstInRow = false
            } else {
                currentX += size.width + (isFirstInRow ? 0 : horizontalSpacing)
                currentRowHeight = max(currentRowHeight, size.height)
                isFirstInRow = false
            }
        }
        height += currentRowHeight
        return CGSize(width: width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var currentX = bounds.minX
        var currentY = bounds.minY
        var currentRowHeight: CGFloat = 0
        var isFirstInRow = true

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > bounds.maxX && !isFirstInRow {
                currentY += currentRowHeight + verticalSpacing
                currentX = bounds.minX
                currentRowHeight = size.height
            } else {
                currentRowHeight = max(currentRowHeight, size.height)
            }
            subview.place(at: CGPoint(x: currentX, y: currentY), proposal: ProposedViewSize(size))
            currentX += size.width + horizontalSpacing
            isFirstInRow = false
        }
    }
}
