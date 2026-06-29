import SwiftUI

struct HomeView: View {
    private let items = MockData.heritageItems
    private let craftsmen = MockData.craftsmen
    private let categories = Category.allCases
    
    @State private var selectedTab = 0
    @State private var scrollOffset: CGFloat = 0
    @EnvironmentObject var themeManager: ThemeManager
    
    private var isDark: Bool { themeManager.isDarkMode }

    var body: some View {
        NavigationStack {
            ScrollView {
                GeometryReader { geo in
                    Color.clear.preference(key: ScrollOffsetKey.self, value: geo.frame(in: .named("scroll")).minY)
                }
                .frame(height: 0)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.xxl) {
                    VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                        HStack(spacing: 8) {
                            Image(systemName: "location.fill")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Text("浙江-杭州")
                                .font(.system(size: 18, weight: .regular))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.top, 12)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("虽为人作 宛自天开")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Text("今天看点什么")
                                .font(.system(size: 17))
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        
                        HStack(spacing: Theme.Spacing.md) {
                            Button(action: {}) {
                                funcButton(title: "全部", icon: "square.grid.2x2", isSelected: true)
                            }
                            .buttonStyle(PlainButtonStyle())
                            funcButton(title: "任务", icon: "clock", isSelected: false)
                            NavigationLink {
                                SearchView()
                                    .environmentObject(themeManager)
                            } label: {
                                funcButton(title: "搜索", icon: "magnifyingglass", isSelected: false)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                    }
                    
                    VStack(spacing: Theme.Spacing.md) {
                        HStack(spacing: Theme.Spacing.xl) {
                            TabButton(title: "交流论坛", isSelected: selectedTab == 0) {
                                selectedTab = 0
                            }
                            TabButton(title: "匠人发布", isSelected: selectedTab == 1) {
                                selectedTab = 1
                            }
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        
                        if selectedTab == 1 {
                            craftsmanPostSection
                        } else {
                            forumSection
                        }
                    }

                    VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                        SectionTitle(title: "传统工艺", subtitle: "八大类别 · 匠心之选", isDark: isDark)
                            .padding(.horizontal, Theme.Spacing.lg)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: Theme.Spacing.md) {
                                ForEach(categories) { category in
                                    NavigationLink {
                                        HeritageDetailView(item: items.first { $0.category == category } ?? items[0])
                                            .environmentObject(themeManager)
                                    } label: {
                                        categoryChip(category)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            .padding(.horizontal, Theme.Spacing.lg)
                        }
                    }

                    VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                        SectionTitle(title: "匠心之作", subtitle: "精选非遗作品", isDark: isDark)
                            .padding(.horizontal, Theme.Spacing.lg)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: Theme.Spacing.md) {
                                ForEach(items) { item in
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

                    VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                        SectionTitle(title: "匠心传承", subtitle: "走近非遗大师", isDark: isDark)
                            .padding(.horizontal, Theme.Spacing.lg)

                        VStack(spacing: Theme.Spacing.sm) {
                            ForEach(craftsmen) { craftsman in
                                NavigationLink {
                                    CraftsmanDetailView(craftsman: craftsman)
                                        .environmentObject(themeManager)
                                } label: {
                                    CraftsmanCard(craftsman: craftsman, isDark: isDark)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                    }

                    VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                        SectionTitle(title: "好物精选", subtitle: "将非遗带回家", isDark: isDark)
                            .padding(.horizontal, Theme.Spacing.lg)

                        VStack(spacing: Theme.Spacing.sm) {
                            ForEach(MockData.products) { product in
                                NavigationLink {
                                    ProductDetailView(product: product)
                                        .environmentObject(themeManager)
                                } label: {
                                    ProductCard(product: product, isDark: isDark)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                    }

                    Color.clear.frame(height: 120)
                }
            }
            .coordinateSpace(name: "scroll")
            .themedBackground(isDark: isDark)
            .navigationBarHidden(true)
            .onPreferenceChange(ScrollOffsetKey.self) { value in
                scrollOffset = value
            }
            .overlay(alignment: .top) {
                navBar
            }
            .overlay(alignment: .topTrailing) {
                topRightButtons
            }
        }
    }
    
    private var navBar: some View {
        let progress = min(max((-scrollOffset - 40) / 80, 0), 1)
        let bgColor = isDark ? Theme.Colors.bgLight : Theme.Colors.bgDark
        return ZStack {
            Rectangle()
                .fill(bgColor.opacity(isDark ? progress * 0.9 : progress * 0.95))
                .background(.ultraThinMaterial.opacity(progress))
            
            Text("开物首页")
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(Theme.Colors.primary(isDark).opacity(progress))
        }
        .frame(maxWidth: .infinity)
        .frame(height: 90)
        .offset(y: -10)
    }
    
    private var topRightButtons: some View {
        NavigationLink {
            ProfileView()
                .environmentObject(themeManager)
        } label: {
            ZStack {
                Circle()
                    .fill(.ultraThinMaterial)
                Image(systemName: "person.fill")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Theme.Colors.primary(isDark))
            }
            .frame(width: 40, height: 40)
        }
        .buttonStyle(PlainButtonStyle())
        .padding(.trailing, Theme.Spacing.lg)
        .padding(.top, 12)
    }
    
    private func funcButton(title: String, icon: String, isSelected: Bool) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 32, weight: .regular))
                .foregroundStyle(isSelected ? (isDark ? Theme.Colors.accentBright : .white) : Theme.Colors.primary(isDark))
            Text(title)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(isSelected ? (isDark ? Theme.Colors.accentBright : .white) : Theme.Colors.primary(isDark))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 22)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(isSelected ? (isDark ? Color.white.opacity(0.1) : .black) : Theme.Colors.cardDark(isDark))
        )
    }
    
    private func TabButton(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(isSelected ? Theme.Colors.primary(isDark) : Theme.Colors.tertiary(isDark))
        }
    }
    
    private var craftsmanPostSection: some View {
        VStack(spacing: Theme.Spacing.md) {
            ForEach(MockData.craftsmanPosts) { post in
                SwipeableCard(isDark: isDark) {
                    NavigationLink {
                        CraftsmanDetailView(craftsman: craftsmen.first ?? craftsmen[0])
                            .environmentObject(themeManager)
                    } label: {
                        craftsmanPostCard(post)
                    }
                    .buttonStyle(PlainButtonStyle())
                } actions: {
                    actionButton(icon: "heart", color: .red) {}
                    actionButton(icon: "message", color: .orange) {}
                    actionButton(icon: "square.and.arrow.up", color: .blue) {}
                }
            }
        }
        .padding(.horizontal, Theme.Spacing.lg)
    }
    
    private func craftsmanPostCard(_ post: CraftsmanPost) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                    .fill(Theme.Colors.cardDark(isDark))
                    .frame(height: 180)
                AsyncImage(url: URL(string: post.imageUrl)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure, .empty:
                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                            .fill(Theme.Colors.cardDark(isDark))
                    @unknown default:
                        RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                            .fill(Theme.Colors.cardDark(isDark))
                    }
                }
                .frame(height: 180)
                .clipped()
                .cornerRadius(Theme.Radius.lg)
            }
            
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(post.title)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    Text(post.location)
                        .font(Theme.Fonts.caption)
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                }
                Spacer()
                HStack(spacing: 2) {
                    Image(systemName: "circle.dollar")
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.Colors.accent(isDark))
                    Text("¥\(post.budget)")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.accent(isDark))
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text("设计要求")
                    .font(Theme.Fonts.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(Theme.Colors.primary(isDark))
                Text(post.requirement)
                    .font(Theme.Fonts.body)
                    .foregroundStyle(Theme.Colors.secondary(isDark))
                    .lineLimit(2)
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
    
    private var forumSection: some View {
        VStack(spacing: Theme.Spacing.md) {
            ForEach(MockData.forumPosts) { post in
                SwipeableCard(isDark: isDark) {
                    forumPostCard(post)
                } actions: {
                    actionButton(icon: "heart", color: .red) {}
                    actionButton(icon: "message", color: .orange) {}
                    actionButton(icon: "square.and.arrow.up", color: .blue) {}
                }
            }
        }
        .padding(.horizontal, Theme.Spacing.lg)
    }
    
    private func actionButton(icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(color)
                .frame(width: 60, height: 60)
        }
        .frame(maxHeight: .infinity)
        .background(Color.clear)
    }
    
    private func forumPostCard(_ post: ForumPost) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // 头部：头像 + 名字 + 职称 + 认证 + 更多
            HStack(alignment: .top, spacing: 8) {
                // 头像
                ZStack {
                    Circle()
                        .fill(Theme.Colors.cardMid(isDark))
                        .frame(width: 36, height: 36)
                    Text(String(post.author.prefix(1)))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(isDark ? Theme.Colors.accentBright : .black)
                }
                
                VStack(alignment: .leading, spacing: 3) {
                    Text(post.author)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    
                    HStack(spacing: 5) {
                        Text(post.title)
                            .font(.system(size: 10))
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                        
                        Text("认证")
                            .font(.system(size: 8))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(
                                Capsule()
                                    .fill(.black)
                            )
                    }
                }
                
                Spacer()
                
                Button(action: {}) {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 16))
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                }
            }
            
            // 内容
            Text(post.content)
                .font(.system(size: 15))
                .foregroundStyle(Theme.Colors.primary(isDark))
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(isDark ? Color.white.opacity(0.05) : Theme.Colors.cardMid(isDark))
                )
                .lineLimit(2)
            
            // 回复
            if let reply = post.reply {
                HStack(alignment: .center, spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(Theme.Colors.cardMid(isDark))
                            .frame(width: 32, height: 32)
                        Text(String(reply.author.prefix(1)))
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(isDark ? Theme.Colors.accentBright : .black)
                    }
                    
                    Text(reply.content)
                        .font(.system(size: 14))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .fill(isDark ? Color.white.opacity(0.1) : .black)
                        )
                    
                    Spacer()
                    
                    Button(action: {}) {
                        Image(systemName: "message")
                            .font(.system(size: 16))
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                    }
                }
            }
            
            // 图片
            if post.hasImage {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Theme.Colors.bgMid.opacity(0.6),
                                Theme.Colors.accent(isDark).opacity(0.15),
                                Theme.Colors.bgDark.opacity(0.5)
                            ],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 160)
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(isDark ? Color.white.opacity(0.06) : Theme.Colors.cardDark(isDark))
        )
    }

    private func categoryChip(_ category: Category) -> some View {
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
                    .foregroundStyle(Theme.Colors.primary(isDark))
            }

            Text(category.rawValue)
                .font(Theme.Fonts.caption)
                .foregroundStyle(Theme.Colors.primary(isDark))
                .frame(width: 80)
                .lineLimit(1)
        }
    }
}

struct CraftsmanPost: Identifiable {
    let id = UUID()
    let title: String
    let location: String
    let budget: Int
    let requirement: String
    let imageUrl: String
}

struct ForumPost: Identifiable {
    let id = UUID()
    let author: String
    let title: String
    let content: String
    let reply: Reply?
    let hasImage: Bool
}

struct Reply {
    let author: String
    let content: String
}

extension MockData {
    static let craftsmanPosts: [CraftsmanPost] = [
        CraftsmanPost(
            title: "秋山木工",
            location: "西湖区·转塘街道",
            budget: 2000,
            requirement: "参考明代家具设计一款造型简约的古典师爷椅\n时间限制在两周内",
            imageUrl: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20traditional%20wooden%20furniture%20craft%20workspace%20dark%20background&image_size=landscape_4_3"
        ),
        CraftsmanPost(
            title: "龙泉青瓷",
            location: "丽水市·龙泉市",
            budget: 1500,
            requirement: "定制一套茶具，要求采用传统青瓷工艺，釉色温润如玉",
            imageUrl: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20celadon%20porcelain%20teapot%20traditional%20craft%20dark%20background&image_size=landscape_4_3"
        )
    ]
    
    static let forumPosts: [ForumPost] = [
        ForumPost(
            author: "吴国斌",
            title: "竹艺大师",
            content: "现在有一个竹制笔筒需要设计一下...",
            reply: Reply(author: "张三", content: "老师,这听起来不错~"),
            hasImage: false
        ),
        ForumPost(
            author: "韩梅之",
            title: "毛毡大师",
            content: "有一个毛毡玩偶需要设计一下，需要会建模同学",
            reply: nil,
            hasImage: true
        )
    ]
}
