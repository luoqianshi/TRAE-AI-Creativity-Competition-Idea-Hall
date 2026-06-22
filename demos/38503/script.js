// ===== 示例数据 =====
const resourcesData = [
    {
        id: 1,
        title: "2024年最新Python全栈开发教程（从入门到精通）",
        category: "course",
        categoryName: "学习教程",
        pan: "baidu",
        panName: "百度网盘",
        size: "28.5 GB",
        date: "2024-06-20",
        views: 3256,
        downloads: 1892,
        image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
        description: "本教程涵盖Python基础语法、Web开发（Django/Flask）、数据分析、机器学习等内容，适合零基础学员系统学习。包含视频教程、源码、课件等完整资料。",
        files: [
            "01-Python基础入门（1-20讲）",
            "02-Web开发实战（21-40讲）",
            "03-数据分析与可视化（41-60讲）",
            "04-机器学习入门（61-80讲）",
            "05-项目实战与源码"
        ],
        link: "https://pan.baidu.com/s/1aBcDeFgHiJkLmN",
        extractCode: "py24"
    },
    {
        id: 2,
        title: "豆瓣TOP250电影合集（蓝光1080P）",
        category: "movie",
        categoryName: "影视资源",
        pan: "aliyun",
        panName: "阿里云盘",
        size: "856 GB",
        date: "2024-06-18",
        views: 8921,
        downloads: 5634,
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=250&fit=crop",
        description: "精心整理的豆瓣电影TOP250合集，全部为蓝光1080P高清资源，包含中文字幕。涵盖经典老片到近年佳作，电影爱好者的必备收藏。",
        files: [
            "肖申克的救赎.The.Shawshank.Redemption.1994",
            "霸王别姬.Farewell.My.Concubine.1993",
            "阿甘正传.Forrest.Gump.1994",
            "泰坦尼克号.Titanic.1997",
            "...共250部电影"
        ],
        link: "https://www.aliyundrive.com/s/AbCdEfGhIj",
        extractCode: ""
    },
    {
        id: 3,
        title: "Adobe全家桶 2024 免激活版（Win/Mac）",
        category: "software",
        categoryName: "软件工具",
        pan: "quark",
        panName: "夸克网盘",
        size: "32.1 GB",
        date: "2024-06-15",
        views: 12456,
        downloads: 9876,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop",
        description: "Adobe Creative Cloud 2024 全套软件，包含Photoshop、Illustrator、Premiere Pro、After Effects等全部应用。已破解免激活，解压即用。",
        files: [
            "Adobe Photoshop 2024 v25.0",
            "Adobe Illustrator 2024 v28.0",
            "Adobe Premiere Pro 2024 v24.0",
            "Adobe After Effects 2024 v24.0",
            "安装教程与破解说明.pdf"
        ],
        link: "https://pan.quark.cn/s/a1b2c3d4e5",
        extractCode: "ad24"
    },
    {
        id: 4,
        title: "经典华语音乐无损合集（FLAC格式）",
        category: "music",
        categoryName: "音乐音频",
        pan: "baidu",
        panName: "百度网盘",
        size: "156 GB",
        date: "2024-06-12",
        views: 4567,
        downloads: 3210,
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
        description: "收录1980-2024年经典华语流行音乐，全部为FLAC无损格式。包含周杰伦、林俊杰、陈奕迅、邓紫棋等数百位歌手的经典作品。",
        files: [
            "周杰伦专辑合集（15张专辑）",
            "林俊杰专辑合集（12张专辑）",
            "陈奕迅专辑合集（18张专辑）",
            "邓紫棋专辑合集（8张专辑）",
            "经典老歌500首"
        ],
        link: "https://pan.baidu.com/s/1xYzAbCdEfGhIj",
        extractCode: "music"
    },
    {
        id: 5,
        title: "考研英语全套资料（词汇+真题+解析）",
        category: "document",
        categoryName: "文档资料",
        pan: "lanzou",
        panName: "蓝奏云",
        size: "2.3 GB",
        date: "2024-06-10",
        views: 6789,
        downloads: 5432,
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop",
        description: "2025年考研英语全套备考资料，包含词汇书PDF、历年真题及详细解析、作文模板、阅读理解技巧等。助力考研英语高分通过。",
        files: [
            "考研英语词汇红宝书.pdf",
            "历年真题（2010-2024）",
            "真题详细解析",
            "作文万能模板",
            "阅读理解技巧总结"
        ],
        link: "https://www.lanzoui.com/iAbCdEfG",
        extractCode: ""
    },
    {
        id: 6,
        title: "3A游戏大作合集（2023-2024）",
        category: "game",
        categoryName: "游戏资源",
        pan: "baidu",
        panName: "百度网盘",
        size: "1.2 TB",
        date: "2024-06-08",
        views: 9876,
        downloads: 7654,
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop",
        description: "精选2023-2024年热门3A游戏大作，包含艾尔登法环、博德之门3、赛博朋克2077、荒野大镖客2等。均已测试可玩，附带修改器和存档。",
        files: [
            "艾尔登法环.Elden.Ring",
            "博德之门3.Baldurs.Gate.3",
            "赛博朋克2077.Cyberpunk.2077",
            "荒野大镖客2.Red.Dead.Redemption.2",
            "游戏修改器与存档合集"
        ],
        link: "https://pan.baidu.com/s/1KlMnOpQrStUvWx",
        extractCode: "game"
    },
    {
        id: 7,
        title: "UI设计素材大礼包（图标+插画+模板）",
        category: "image",
        categoryName: "图片素材",
        pan: "aliyun",
        panName: "阿里云盘",
        size: "45.6 GB",
        date: "2024-06-05",
        views: 3456,
        downloads: 2345,
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
        description: "设计师必备素材库，包含10万+矢量图标、5000+插画素材、200+UI模板、100+样机模型。支持Sketch、Figma、Adobe XD等格式。",
        files: [
            "矢量图标库（100000+）",
            "插画素材合集（5000+）",
            "UI界面模板（200+）",
            "样机模型（100+）",
            "字体包合集"
        ],
        link: "https://www.aliyundrive.com/s/XyZaBcDeFg",
        extractCode: ""
    },
    {
        id: 8,
        title: "清华大学计算机课程全套视频",
        category: "course",
        categoryName: "学习教程",
        pan: "baidu",
        panName: "百度网盘",
        size: "156 GB",
        date: "2024-06-01",
        views: 11234,
        downloads: 8765,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
        description: "清华大学计算机系核心课程视频，包含数据结构、算法设计、操作系统、计算机网络、数据库等。由清华教授亲自授课，内容权威系统。",
        files: [
            "数据结构（邓俊辉教授）",
            "算法设计与分析",
            "操作系统原理",
            "计算机网络",
            "数据库系统概论"
        ],
        link: "https://pan.baidu.com/s/1ThUiOpAsDfGhJk",
        extractCode: "thu01"
    },
    {
        id: 9,
        title: "Netflix热门剧集合集（4K HDR）",
        category: "movie",
        categoryName: "影视资源",
        pan: "quark",
        panName: "夸克网盘",
        size: "2.5 TB",
        date: "2024-05-28",
        views: 15678,
        downloads: 12345,
        image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=250&fit=crop",
        description: "Netflix热门剧集4K HDR合集，包含《怪奇物语》、《纸牌屋》、《黑镜》、《王冠》等经典剧集。画质清晰，多语言字幕可选。",
        files: [
            "怪奇物语.Stranger.Things.S1-S4",
            "纸牌屋.House.of.Cards.S1-S6",
            "黑镜.Black.Mirror.S1-S6",
            "王冠.The.Crown.S1-S5",
            "更多热门剧集..."
        ],
        link: "https://pan.quark.cn/s/z1y2x3w4v5",
        extractCode: "nf4k"
    },
    {
        id: 10,
        title: "Office 2024 专业增强版（永久激活）",
        category: "software",
        categoryName: "软件工具",
        pan: "baidu",
        panName: "百度网盘",
        size: "5.8 GB",
        date: "2024-05-25",
        views: 23456,
        downloads: 19876,
        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=250&fit=crop",
        description: "Microsoft Office 2024 专业增强版，包含Word、Excel、PowerPoint、Outlook、Access等全部组件。已永久激活，支持在线更新。",
        files: [
            "Office 2024 安装包",
            "激活工具",
            "安装教程.pdf",
            "常见问题解答"
        ],
        link: "https://pan.baidu.com/s/1LmNoPqRsTuVwXy",
        extractCode: "off24"
    },
    {
        id: 11,
        title: "经典科幻小说合集（EPUB/MOBI/AZW3）",
        category: "document",
        categoryName: "文档资料",
        pan: "aliyun",
        panName: "阿里云盘",
        size: "12.5 GB",
        date: "2024-05-20",
        views: 5678,
        downloads: 4321,
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop",
        description: "精选经典科幻小说合集，包含三体、银河帝国、基地、沙丘、海伯利安等数百部经典作品。提供EPUB、MOBI、AZW3三种格式，适配各种阅读设备。",
        files: [
            "三体三部曲（刘慈欣）",
            "银河帝国系列（阿西莫夫）",
            "沙丘六部曲（弗兰克·赫伯特）",
            "海伯利安四部曲（丹·西蒙斯）",
            "更多经典科幻小说..."
        ],
        link: "https://www.aliyundrive.com/s/PqRsTuVwXyZ",
        extractCode: ""
    },
    {
        id: 12,
        title: "4K风景壁纸合集（10000+张）",
        category: "image",
        categoryName: "图片素材",
        pan: "lanzou",
        panName: "蓝奏云",
        size: "89 GB",
        date: "2024-05-15",
        views: 8765,
        downloads: 6543,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
        description: "超高清4K风景壁纸合集，包含自然风光、城市建筑、星空宇宙、海洋沙滩等各类主题。分辨率3840x2160，适配4K显示器。",
        files: [
            "自然风光（3000+张）",
            "城市建筑（2000+张）",
            "星空宇宙（1500+张）",
            "海洋沙滩（1500+张）",
            "其他主题（2000+张）"
        ],
        link: "https://www.lanzoui.com/iKlMnOpQr",
        extractCode: ""
    }
];

// ===== 状态管理 =====
let currentCategory = 'all';
let currentPan = 'all';
let currentSort = 'newest';
let searchQuery = '';
let displayedCount = 9;

// ===== DOM 元素 =====
const resourceGrid = document.getElementById('resourceGrid');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('resourceModal');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    renderResources();
    setupEventListeners();
});

// ===== 渲染资源卡片 =====
function renderResources() {
    const filtered = filterResources();
    const sorted = sortResources(filtered);
    const displayData = sorted.slice(0, displayedCount);

    if (displayData.length === 0) {
        resourceGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h3 style="font-size: 18px; color: var(--text); margin-bottom: 8px;">未找到相关资源</h3>
                <p style="color: var(--text-muted); font-size: 14px;">请尝试其他关键词或筛选条件</p>
            </div>
        `;
        return;
    }

    resourceGrid.innerHTML = displayData.map(resource => createResourceCard(resource)).join('');

    // 绑定卡片点击事件
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            openModal(id);
        });
    });

    // 更新加载更多按钮
    const loadMoreBtn = document.getElementById('loadMore');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = sorted.length > displayedCount ? 'inline-flex' : 'none';
    }
}

// ===== 创建资源卡片 HTML =====
function createResourceCard(resource) {
    const panBadgeClass = resource.pan;
    const panNames = {
        baidu: '百度网盘',
        aliyun: '阿里云盘',
        quark: '夸克网盘',
        lanzou: '蓝奏云',
        other: '其他网盘'
    };

    return `
        <div class="resource-card" data-id="${resource.id}">
            <div class="resource-image">
                <img src="${resource.image}" alt="${resource.title}" loading="lazy">
                <span class="pan-badge ${panBadgeClass}">${panNames[resource.pan]}</span>
                <span class="resource-size">${resource.size}</span>
            </div>
            <div class="resource-content">
                <h3 class="resource-title">${resource.title}</h3>
                <div class="resource-meta">
                    <span class="resource-category">${resource.categoryName}</span>
                    <span class="resource-date">${resource.date}</span>
                </div>
                <div class="resource-stats">
                    <span class="stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        ${formatNumber(resource.views)}
                    </span>
                    <span class="stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        ${formatNumber(resource.downloads)}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// ===== 筛选资源 =====
function filterResources() {
    return resourcesData.filter(resource => {
        const matchCategory = currentCategory === 'all' || resource.category === currentCategory;
        const matchPan = currentPan === 'all' || resource.pan === currentPan;
        const matchSearch = !searchQuery || 
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.categoryName.includes(searchQuery) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchPan && matchSearch;
    });
}

// ===== 排序资源 =====
function sortResources(resources) {
    const sorted = [...resources];
    switch (currentSort) {
        case 'newest':
            return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'popular':
            return sorted.sort((a, b) => b.views - a.views);
        case 'downloads':
            return sorted.sort((a, b) => b.downloads - a.downloads);
        default:
            return sorted;
    }
}

// ===== 格式化数字 =====
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// ===== 打开模态框 =====
function openModal(id) {
    const resource = resourcesData.find(r => r.id === id);
    if (!resource) return;

    document.getElementById('modalTitle').textContent = resource.title;
    document.getElementById('modalCategory').textContent = resource.categoryName;
    document.getElementById('modalDate').textContent = resource.date;
    document.getElementById('modalSize').textContent = resource.size;
    document.getElementById('modalDescription').textContent = resource.description;
    document.getElementById('modalLink').value = resource.link;

    const panBadge = document.getElementById('modalPanBadge');
    panBadge.textContent = resource.panName;
    panBadge.className = `modal-pan-badge ${resource.pan}`;

    const extractCodeBox = document.getElementById('extractCodeBox');
    if (resource.extractCode) {
        document.getElementById('modalExtractCode').textContent = resource.extractCode;
        extractCodeBox.style.display = 'flex';
    } else {
        extractCodeBox.style.display = 'none';
    }

    const filesList = document.getElementById('modalFiles');
    filesList.innerHTML = resource.files.map(file => `<li>${file}</li>`).join('');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ===== 关闭模态框 =====
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== 显示提示 =====
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ===== 复制到剪贴板 =====
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板');
    } catch (err) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('已复制到剪贴板');
    }
}

// ===== 设置事件监听 =====
function setupEventListeners() {
    // 分类筛选
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentCategory = card.dataset.category;
            displayedCount = 9;
            renderResources();
        });
    });

    // 网盘筛选
    document.querySelectorAll('.pan-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.pan-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPan = tab.dataset.pan;
            displayedCount = 9;
            renderResources();
        });
    });

    // 排序
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            renderResources();
        });
    });

    // 搜索
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        displayedCount = 9;
        renderResources();
    });

    document.querySelector('.search-btn').addEventListener('click', () => {
        searchQuery = searchInput.value.trim();
        displayedCount = 9;
        renderResources();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value.trim();
            displayedCount = 9;
            renderResources();
        }
    });

    // 加载更多
    document.getElementById('loadMore').addEventListener('click', () => {
        displayedCount += 6;
        renderResources();
    });

    // 模态框关闭
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // 复制链接
    document.getElementById('copyLink').addEventListener('click', () => {
        const link = document.getElementById('modalLink').value;
        copyToClipboard(link);
    });

    // 复制提取码
    document.getElementById('copyCode').addEventListener('click', () => {
        const code = document.getElementById('modalExtractCode').textContent;
        copyToClipboard(code);
    });

    // 前往下载
    document.getElementById('goDownload').addEventListener('click', () => {
        const link = document.getElementById('modalLink').value;
        window.open(link, '_blank');
    });

    // 热门标签点击
    document.querySelectorAll('.hot-tags a').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            searchInput.value = tag.textContent;
            searchQuery = tag.textContent;
            displayedCount = 9;
            renderResources();
            document.getElementById('resources').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 移动端菜单
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    mobileMenuBtn.addEventListener('click', () => {
        showToast('移动端菜单功能开发中...');
    });

    // 分享资源按钮
    document.querySelector('.nav-actions .btn').addEventListener('click', () => {
        showToast('分享功能开发中，敬请期待！');
    });
}
