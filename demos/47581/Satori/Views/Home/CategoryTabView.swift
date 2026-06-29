import SwiftUI

struct CategoryTabView: View {
    private let craftsmen = MockData.craftsmen
    
    @State private var selectedTab = 0 // 0: 非遗百科, 1: 非遗匠人, 2: 设计师
    @State private var showConnectAlert = false
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
                    // 顶部：位置 + 通知 + 标题
                    VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                        // 位置
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
                        
                        // 主标题区域
                        VStack(alignment: .leading, spacing: 8) {
                            Text("开物百科")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundStyle(Theme.Colors.primary(isDark))
                            Text("中国文化宣传学习中心")
                                .font(.system(size: 17))
                                .foregroundStyle(Theme.Colors.secondary(isDark))
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        
                        // 搜索框
                        NavigationLink {
                            SearchView()
                                .environmentObject(themeManager)
                        } label: {
                            HStack(spacing: Theme.Spacing.sm) {
                                Text("搜点你感兴趣的")
                                    .font(.system(size: 14))
                                    .foregroundStyle(Theme.Colors.secondary(isDark))
                                Spacer()
                                Image(systemName: "magnifyingglass")
                                    .font(.system(size: 16))
                                    .foregroundStyle(Theme.Colors.secondary(isDark))
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .frame(width: 200)
                            .background(Theme.Colors.cardDark(isDark))
                            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                                    .stroke(Theme.Colors.cardBorder(isDark), lineWidth: 0.6)
                            )
                        }
                        .buttonStyle(PlainButtonStyle())
                        .padding(.horizontal, Theme.Spacing.lg)
                    }
                    
                    // Tab栏
                    HStack(spacing: Theme.Spacing.xl) {
                        TabButton(title: "非遗百科", isSelected: selectedTab == 0) {
                            selectedTab = 0
                        }
                        TabButton(title: "非遗匠人", isSelected: selectedTab == 1) {
                            selectedTab = 1
                        }
                        TabButton(title: "设计师", isSelected: selectedTab == 2) {
                            selectedTab = 2
                        }
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    // 内容区域
                    if selectedTab == 1 {
                        craftsmanSection
                    } else if selectedTab == 0 {
                        encyclopediaSection
                    } else {
                        designerSection
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
            .overlay {
                if showConnectAlert {
                    connectAlertView
                        .transition(.opacity.combined(with: .scale))
                }
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
            
            Text("开物百科")
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
    
    // MARK: - 建立联系弹窗
    private var connectAlertView: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .transition(.opacity)
                .onTapGesture {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                        showConnectAlert = false
                    }
                }
            
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Theme.Colors.accentBright(isDark).opacity(0.15))
                        .frame(width: 80, height: 80)
                    
                    Circle()
                        .fill(Theme.Colors.accentBright(isDark).opacity(0.25))
                        .frame(width: 60, height: 60)
                    
                    Image(systemName: "person.2.fill")
                        .font(.system(size: 32, weight: .semibold))
                        .foregroundStyle(Theme.Colors.accentBright(isDark))
                }
                
                Text("你已经建立联系")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(Theme.Colors.primary(isDark))
                
                Text("名片已加入收藏")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.Colors.secondary(isDark))
            }
            .padding(.horizontal, 48)
            .padding(.vertical, 36)
            .background(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(Theme.Colors.cardDark(isDark))
            )
            .shadow(color: .black.opacity(0.25), radius: 30, y: 12)
            .transition(
                .asymmetric(
                    insertion: .scale(scale: 0.85).combined(with: .opacity).animation(.spring(response: 0.45, dampingFraction: 0.7)),
                    removal: .scale(scale: 0.9).combined(with: .opacity).animation(.easeOut(duration: 0.25))
                )
            )
        }
    }
    
    // MARK: - Tab按钮
    private func TabButton(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(isSelected ? Theme.Colors.primary(isDark) : Theme.Colors.tertiary(isDark))
        }
    }
    
    // MARK: - 操作按钮
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
    
    // MARK: - 非遗匠人区域
    private var craftsmanSection: some View {
        VStack(spacing: Theme.Spacing.md) {
            ForEach(MockData.craftsmanProfiles) { profile in
                SwipeableCard(isDark: isDark, swipeAreaRatio: 0.5) {
                    HStack(spacing: Theme.Spacing.md) {
                        craftsmanInfoCard(profile)
                            .frame(maxWidth: .infinity)
                        craftsmanBusinessCard(profile)
                            .frame(maxWidth: .infinity)
                    }
                } actions: {
                    actionButton(icon: "heart", color: .red) {}
                    actionButton(icon: "message", color: .orange) {}
                    actionButton(icon: "square.and.arrow.up", color: .blue) {}
                }
            }
        }
        .padding(.horizontal, Theme.Spacing.lg)
    }
    
    private func craftsmanInfoCard(_ profile: CraftsmanProfile) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(Theme.Colors.cardMid(isDark))
                        .frame(width: 40, height: 40)
                    Text(String(profile.name.prefix(1)))
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.accentBright(isDark))
                }
                
                VStack(alignment: .leading, spacing: 3) {
                    Text(profile.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    
                    HStack(spacing: 4) {
                        Text(profile.title)
                            .font(.system(size: 10))
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                        
                        Text("认证")
                            .font(.system(size: 8))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 1.5)
                            .background(
                                Capsule()
                                    .fill(.black)
                            )
                    }
                }
            }
            
            VStack(alignment: .leading, spacing: 2) {
                ForEach(profile.descriptionLines, id: \.self) { line in
                    Text(line)
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                        .lineLimit(1)
                }
            }
            
            Spacer()
            
            HStack {
                Spacer()
                Image(systemName: "person")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.Colors.secondary(isDark))
            }
        }
        .padding(12)
        .frame(maxHeight: .infinity)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous)
                .fill(Theme.Colors.cardDark(isDark))
        )
    }
    
    private func craftsmanBusinessCard(_ profile: CraftsmanProfile) -> some View {
        BusinessCardStack(
            cards: profile.friendCards,
            cardsGiven: profile.cardsGiven,
            cardsCollected: profile.cardsCollected,
            isDark: isDark,
            onAdd: {
                withAnimation(.spring(response: 0.45, dampingFraction: 0.7)) {
                    showConnectAlert = true
                }
            }
        )
    }
    
    // MARK: - 非遗百科区域
    private var encyclopediaSection: some View {
        VStack(spacing: Theme.Spacing.md) {
            ForEach(MockData.articles) { article in
                SwipeableCard(isDark: isDark) {
                    articleCard(article)
                } actions: {
                        actionButton(icon: "heart", color: .red) {}
                        actionButton(icon: "message", color: .orange) {}
                        actionButton(icon: "square.and.arrow.up", color: .blue) {}
                    }
            }
        }
        .padding(.horizontal, Theme.Spacing.lg)
    }
    
    private func articleCard(_ article: Article) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            // 图片
            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
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
                .frame(height: 180)
            
            // 标题和作者
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(article.title)
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    HStack(spacing: Theme.Spacing.sm) {
                        Text(article.author)
                            .font(Theme.Fonts.caption)
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
                    Image(systemName: "bookmark")
                        .font(.system(size: 20))
                        .foregroundStyle(Theme.Colors.accentBright(isDark))
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
    
    // MARK: - 设计师区域
    private var designerSection: some View {
        VStack(spacing: Theme.Spacing.md) {
            ForEach(MockData.designerProfiles) { profile in
                SwipeableCard(isDark: isDark, swipeAreaRatio: 0.5) {
                    HStack(spacing: Theme.Spacing.md) {
                        designerInfoCard(profile)
                            .frame(maxWidth: .infinity)
                        designerBusinessCard(profile)
                            .frame(maxWidth: .infinity)
                    }
                } actions: {
                    actionButton(icon: "heart", color: .red) {}
                    actionButton(icon: "message", color: .orange) {}
                    actionButton(icon: "square.and.arrow.up", color: .blue) {}
                }
            }
        }
        .padding(.horizontal, Theme.Spacing.lg)
    }
    
    private func designerInfoCard(_ profile: DesignerProfile) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(Theme.Colors.cardMid(isDark))
                        .frame(width: 40, height: 40)
                    Text(String(profile.name.prefix(1)))
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.Colors.accentBright(isDark))
                }
                
                VStack(alignment: .leading, spacing: 3) {
                    Text(profile.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                    
                    HStack(spacing: 4) {
                        Text(profile.title)
                            .font(.system(size: 10))
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                        
                        Text("认证")
                            .font(.system(size: 8))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 1.5)
                            .background(
                                Capsule()
                                    .fill(.black)
                            )
                    }
                }
            }
            
            VStack(alignment: .leading, spacing: 2) {
                ForEach(profile.descriptionLines, id: \.self) { line in
                    Text(line)
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.Colors.primary(isDark))
                        .lineLimit(1)
                }
            }
            
            Spacer()
            
            HStack {
                Spacer()
                Image(systemName: "person")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.Colors.secondary(isDark))
            }
        }
        .padding(12)
        .frame(maxHeight: .infinity)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous)
                .fill(Theme.Colors.cardDark(isDark))
        )
    }
    
    private func designerBusinessCard(_ profile: DesignerProfile) -> some View {
        BusinessCardStack(
            cards: profile.friendCards,
            cardsGiven: profile.cardsGiven,
            cardsCollected: profile.cardsCollected,
            isDark: isDark,
            onAdd: {
                withAnimation(.spring(response: 0.45, dampingFraction: 0.7)) {
                    showConnectAlert = true
                }
            }
        )
    }
}


// MARK: - 匠人资料数据模型
struct CraftsmanProfile: Identifiable {
    let id = UUID()
    let name: String
    let title: String
    let location: String
    let descriptionLines: [String]
    let businessCard: String
    let cardsGiven: Int
    let cardsCollected: Int
    let friendCards: [FriendCard]
}

// MARK: - 朋友名片数据模型
struct FriendCard: Identifiable {
    let id = UUID()
    let name: String
    let location: String
    let businessCard: String
}

// MARK: - 设计师资料数据模型
struct DesignerProfile: Identifiable {
    let id = UUID()
    let name: String
    let title: String
    let location: String
    let descriptionLines: [String]
    let businessCard: String
    let cardsGiven: Int
    let cardsCollected: Int
    let friendCards: [FriendCard]
}

// MARK: - 文章数据模型
struct Article: Identifiable {
    let id = UUID()
    let title: String
    let author: String
}

// MARK: - Mock数据扩展
extension MockData {
    static let articles: [Article] = [
        Article(
            title: "乱编法在产品设计中的应用",
            author: "吴竹张品牌创始人"
        ),
        Article(
            title: "开物即是修行，给心灵来个SPA",
            author: "王黎明"
        )
    ]
    
    static let craftsmanProfiles: [CraftsmanProfile] = [
        CraftsmanProfile(
            name: "吴国斌",
            title: "竹艺大师",
            location: "浙江·杭州",
            descriptionLines: [
                "联盒圈 工艺美术大师",
                "中国非物质文化遗产传承人",
                "吴竹张品牌创始人"
            ],
            businessCard: "吴竹张品牌创始人\n188****014\n188****014",
            cardsGiven: 156,
            cardsCollected: 32,
            friendCards: [
                FriendCard(name: "吴国斌", location: "浙江·杭州", businessCard: "吴竹张品牌创始人\n188****014\n188****014"),
                FriendCard(name: "韩梅之", location: "河南·驻马店", businessCard: "毛毡非遗传承人\n188****014"),
                FriendCard(name: "王黎明", location: "浙江·杭州", businessCard: "西泠印社荣誉会员")
            ]
        ),
        CraftsmanProfile(
            name: "韩梅之",
            title: "毛毡大师",
            location: "河南·驻马店",
            descriptionLines: [
                "中国非物质文化遗产传承人",
                "驻马店市手工艺家",
                "韩美品牌创始人"
            ],
            businessCard: "毛毡非遗传承人\n188****014",
            cardsGiven: 120,
            cardsCollected: 46,
            friendCards: [
                FriendCard(name: "韩梅之", location: "河南·驻马店", businessCard: "毛毡非遗传承人\n188****014"),
                FriendCard(name: "王黎明", location: "浙江·杭州", businessCard: "西泠印社荣誉会员"),
                FriendCard(name: "吴国斌", location: "浙江·杭州", businessCard: "吴竹张品牌创始人\n188****014\n188****014")
            ]
        ),
        CraftsmanProfile(
            name: "王黎明",
            title: "篆刻大师",
            location: "浙江·杭州",
            descriptionLines: [
                "中国非物质文化遗产传承人",
                "西泠印社，荣誉会员"
            ],
            businessCard: "西泠印社荣誉会员",
            cardsGiven: 130,
            cardsCollected: 40,
            friendCards: [
                FriendCard(name: "王黎明", location: "浙江·杭州", businessCard: "西泠印社荣誉会员"),
                FriendCard(name: "吴国斌", location: "浙江·杭州", businessCard: "吴竹张品牌创始人\n188****014\n188****014"),
                FriendCard(name: "韩梅之", location: "河南·驻马店", businessCard: "毛毡非遗传承人\n188****014")
            ]
        )
    ]
    
    static let designerProfiles: [DesignerProfile] = [
        DesignerProfile(
            name: "林雨堂",
            title: "产品设计师",
            location: "上海·浦东",
            descriptionLines: [
                "独立产品设计师",
                "红点设计奖获得者",
                "雨堂设计工作室创始人"
            ],
            businessCard: "雨堂设计工作室创始人\n138****8888",
            cardsGiven: 180,
            cardsCollected: 65,
            friendCards: [
                FriendCard(name: "林雨堂", location: "上海·浦东", businessCard: "雨堂设计工作室创始人\n138****8888"),
                FriendCard(name: "苏清荷", location: "浙江·杭州", businessCard: "清荷设计主理人\n139****6666"),
                FriendCard(name: "陈墨白", location: "北京·朝阳", businessCard: "墨白空间设计创始人\n137****9999")
            ]
        ),
        DesignerProfile(
            name: "苏清荷",
            title: "视觉设计师",
            location: "浙江·杭州",
            descriptionLines: [
                "品牌视觉设计专家",
                "中国美术学院讲师",
                "清荷设计主理人"
            ],
            businessCard: "清荷设计主理人\n139****6666",
            cardsGiven: 145,
            cardsCollected: 58,
            friendCards: [
                FriendCard(name: "苏清荷", location: "浙江·杭州", businessCard: "清荷设计主理人\n139****6666"),
                FriendCard(name: "陈墨白", location: "北京·朝阳", businessCard: "墨白空间设计创始人\n137****9999"),
                FriendCard(name: "林雨堂", location: "上海·浦东", businessCard: "雨堂设计工作室创始人\n138****8888")
            ]
        ),
        DesignerProfile(
            name: "陈墨白",
            title: "空间设计师",
            location: "北京·朝阳",
            descriptionLines: [
                "非遗空间活化设计师",
                "清华大学美术学院",
                "墨白空间设计创始人"
            ],
            businessCard: "墨白空间设计创始人\n137****9999",
            cardsGiven: 165,
            cardsCollected: 72,
            friendCards: [
                FriendCard(name: "陈墨白", location: "北京·朝阳", businessCard: "墨白空间设计创始人\n137****9999"),
                FriendCard(name: "林雨堂", location: "上海·浦东", businessCard: "雨堂设计工作室创始人\n138****8888"),
                FriendCard(name: "苏清荷", location: "浙江·杭州", businessCard: "清荷设计主理人\n139****6666")
            ]
        )
    ]
}

// MARK: - 名片栈组件（可滑动切换）
struct BusinessCardStack: View {
    let cards: [FriendCard]
    let cardsGiven: Int
    let cardsCollected: Int
    let isDark: Bool
    var onAdd: () -> Void
    
    @State private var currentIndex = 0
    @State private var dragOffset: CGFloat = 0
    @State private var isDragging = false
    @State private var dragStartLocation: CGPoint = .zero
    
    private let cardOffset: CGFloat = 12
    
    var body: some View {
        GeometryReader { geo in
            let totalWidth = geo.size.width
            let cardWidth = totalWidth - cardOffset * 2
            let threshold = cardWidth * 0.35
            
            ZStack(alignment: .topLeading) {
                // 名片层叠
                ZStack(alignment: .leading) {
                    // 第三张名片
                    cardView(at: (currentIndex + 2) % cards.count, index: 2, cardWidth: cardWidth)
                        .offset(x: cardOffset * 2 + dragOffset * 0.2)
                    
                    // 第二张名片
                    cardView(at: (currentIndex + 1) % cards.count, index: 1, cardWidth: cardWidth)
                        .offset(x: cardOffset + dragOffset * 0.5)
                    
                    // 第一张名片（最前面）
                    frontCardView(at: currentIndex % cards.count, cardWidth: cardWidth)
                        .offset(x: dragOffset)
                }
                .frame(width: totalWidth, alignment: .leading)
                .gesture(
                    DragGesture(minimumDistance: 15)
                        .onChanged { value in
                            if !isDragging {
                                dragStartLocation = value.startLocation
                            }
                            isDragging = true
                            
                            let horizontalAmount = abs(value.translation.width)
                            let verticalAmount = abs(value.translation.height)
                            
                            if horizontalAmount > verticalAmount {
                                dragOffset = value.translation.width
                            }
                        }
                        .onEnded { value in
                            isDragging = false
                            let horizontalAmount = abs(value.translation.width)
                            let verticalAmount = abs(value.translation.height)
                            
                            guard horizontalAmount > verticalAmount else {
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                                    dragOffset = 0
                                }
                                return
                            }
                            
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                                if value.translation.width < -threshold {
                                    currentIndex = (currentIndex + 1) % cards.count
                                } else if value.translation.width > threshold {
                                    currentIndex = (currentIndex - 1 + cards.count) % cards.count
                                }
                                dragOffset = 0
                            }
                        }
                )
            }
            .frame(width: totalWidth, height: 180)
        }
        .frame(height: 180)
    }
    
    // 后面的名片（第二、第三张）
    private func cardView(at index: Int, index offsetIndex: Int, cardWidth: CGFloat) -> some View {
        let bgColor: Color
        if isDark {
            bgColor = offsetIndex == 2 ? Color.white.opacity(0.04) : Color.white.opacity(0.07)
        } else {
            bgColor = offsetIndex == 2 ? Theme.Colors.cardLight(isDark) : Theme.Colors.cardMid(isDark)
        }
        return VStack {
            HStack {
                Spacer()
                RoundedRectangle(cornerRadius: 2)
                    .fill(isDark ? Color.white.opacity(0.06) : (offsetIndex == 2 ? Theme.Colors.cardLight(isDark) : Theme.Colors.cardMid(isDark)))
                    .frame(width: 3, height: 56)
                    .padding(.trailing, 22)
                    .padding(.top, 14)
            }
            Spacer()
        }
        .frame(width: cardWidth, height: 140)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                .fill(bgColor)
        )
    }
    
    // 最前面的名片
    private func frontCardView(at index: Int, cardWidth: CGFloat) -> some View {
        let card = cards[index]
        let barExtraWidth: CGFloat = 10
        let frontBgColor = isDark ? Color.white.opacity(0.12) : Theme.Colors.cardDark(isDark)
        return VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("名片")
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                    
                    Spacer()
                    
                    Button(action: onAdd) {
                        Image(systemName: "plus")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(Theme.Colors.secondary(isDark))
                    }
                }
                .padding(.bottom, 10)
                
                Text(card.name)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Theme.Colors.primary(isDark))
                    .padding(.bottom, 3)
                
                Text(card.location)
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.Colors.secondary(isDark))
                    .padding(.bottom, 12)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(card.businessCard)
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.Colors.secondary(isDark))
                        .lineLimit(2)
                }
                
                Spacer()
            }
            .padding(12)
            .frame(width: cardWidth, height: 140)
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                    .fill(frontBgColor)
            )
            
            // 底部黑色统计条（比名片宽一点）
            HStack {
                HStack(spacing: 4) {
                    Text("递出")
                        .font(.system(size: 10))
                        .foregroundStyle(.white.opacity(0.8))
                    Text("\(cardsGiven)/200")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.white)
                }
                
                Spacer()
                
                HStack(spacing: 4) {
                    Text("收藏")
                        .font(.system(size: 10))
                        .foregroundStyle(.white.opacity(0.8))
                    Text("\(cardsCollected)")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.white)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .frame(width: cardWidth + barExtraWidth * 2)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(.black)
            )
            .offset(x: -barExtraWidth, y: -6)
        }
        .shadow(color: isDark ? .black.opacity(0.4) : .black.opacity(0.1), radius: 12, x: 0, y: 6)
    }
}
