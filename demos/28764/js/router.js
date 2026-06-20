/**
 * SPA Router — FlowerSea Blog (Dark Theme Edition)
 */

// Page title map
const pageTitleMap = {
    home: "FlowerSea's Blog — 代码与创造",
    post: '文章详情 — FlowerSea',
    article: '文章详情 — FlowerSea',
    about: '关于 — FlowerSea',
    archive: '归档 — FlowerSea'
};

let currentPage = 'home';
let currentArticleId = null;

// Get article index for prev/next nav
function getArticleIds() {
    return Object.keys(window.markdownLoader ? window.markdownLoader.getArticleList() : []).reverse();
}

// Generate Home Page (used for Home, Category, Archive, and Search results)
function getHomeTemplate(pageNum = 1, filterType = null, filterValue = null) {
    let allArticles = (window.markdownLoader ? window.markdownLoader.getArticleList() : []).slice().reverse();
    
    // Apply filters
    let pageTitle = "Blog Posts";
    let sectionTag = "// 最近更新";
    
    if (filterType === 'category' && filterValue) {
        allArticles = allArticles.filter(a => a.category === filterValue);
        pageTitle = `分类: ${filterValue}`;
        sectionTag = "// 分类筛选";
    } else if (filterType === 'archive' && filterValue) {
        allArticles = allArticles.filter(a => {
            let m = a.date.match(/(\d+)年(\d+)月/);
            if (!m) m = a.date.match(/(\d{4})-(\d{2})/);
            
            if (m) {
                const monthStr = parseInt(m[2], 10).toString();
                const k = m[1] + '年' + monthStr + '月';
                return k === filterValue;
            }
            return false;
        });
        pageTitle = `归档: ${filterValue}`;
        sectionTag = "// 归档筛选";
    } else if (filterType === 'search' && filterValue) {
        const q = filterValue.toLowerCase();
        allArticles = allArticles.filter(a => 
            a.title.toLowerCase().includes(q) || 
            a.category.toLowerCase().includes(q) ||
            (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
        );
        pageTitle = `搜索: "${filterValue}"`;
        sectionTag = "// 搜索结果";
    }

    // Pagination logic
    const pageSize = 5;
    const totalPages = Math.ceil(allArticles.length / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(pageNum, totalPages));
    const articles = allArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const cards = articles.map(a => {
        const summary = a.summary || '';
        return `
        <article class="post-card" data-tilt>
            <div class="post-card-glow"></div>
            <div class="post-card-inner">
                <div class="post-category"><span class="category-dot"></span><a href="#" onclick="navigateTo('home', null, 1, false, 'category', '${a.category}');return false;" style="color:inherit;text-decoration:none;">${a.category}</a></div>
                <h2><a href="#" onclick="navigateTo('article','${a.id}');return false;">${a.title}</a></h2>
                <div class="article-meta-new">
                    <span>FlowerSea</span>
                    <span>${a.date}</span>
                </div>
                <div class="article-excerpt-wrapper">
                    <p class="article-excerpt-toggle" onclick="toggleExcerpt('${a.id}')">
                        <span class="excerpt-text">点击阅读摘要</span>
                        <svg class="excerpt-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </p>
                    <div class="article-excerpt-content" id="excerpt-${a.id}">
                        <p>${summary}</p>
                    </div>
                </div>
                <div class="post-footer-new">
                    <div class="post-meta"><span class="post-date">${a.date}</span></div>
                    <a href="#" onclick="navigateTo('article','${a.id}');return false;" class="post-link-new magnetic">
                        Read
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
        </article>
    `}).join('');

    // Pagination Controls
    let paginationHTML = '<div class="pagination">';
    if (currentPage > 1) {
        paginationHTML += `<a href="#" onclick="navigateTo('home', null, ${currentPage - 1}, true, '${filterType || ''}', '${filterValue || ''}');return false;" class="page-btn">← 上一页</a>`;
    }
    paginationHTML += `<span class="page-info">第 ${currentPage} / ${totalPages} 页</span>`;
    if (currentPage < totalPages) {
        paginationHTML += `<a href="#" onclick="navigateTo('home', null, ${currentPage + 1}, true, '${filterType || ''}', '${filterValue || ''}');return false;" class="page-btn">下一页 →</a>`;
    }
    paginationHTML += '</div>';

    return `
        <div id="posts-list">
            <div class="section-header reveal">
                <span class="section-tag">${sectionTag}</span>
                <h2 class="section-title">${pageTitle} <span style="font-size: 0.5em; color: var(--text-muted); font-weight: normal; margin-left: 10px;">(共 ${allArticles.length} 篇)</span></h2>
            </div>
            ${filterType ? `<div style="margin-bottom: 20px;"><a href="#" onclick="navigateTo('home');return false;" class="page-btn" style="display:inline-block; font-size: 13px;">清除筛选 ✕</a></div>` : ''}
            <div class="posts-grid">
                ${cards || '<div class="loading">暂无相关文章</div>'}
            </div>
            ${totalPages > 1 ? paginationHTML : ''}
        </div>
    `;
}

// Generate Archive Page
function getArchiveTemplate() {
    const articles = (window.markdownLoader ? window.markdownLoader.getArticleList() : []).slice().reverse();
    
    const items = articles.map(a => `
        <div class="archive-item">
            <a href="#" onclick="navigateTo('article','${a.id}');return false;">${a.title}</a>
            <span class="date">${a.date}</span>
        </div>
    `).join('');

    return `
        <div class="archive-page">
            <div class="section-header reveal">
                <span class="section-tag">// 文章归档</span>
                <h2 class="section-title">Archive</h2>
            </div>
            ${items || '<div class="loading">加载中</div>'}
        </div>
    `;
}

// Generate About Page
function getAboutTemplate() {
    return `
        <div class="about-page">
            <div class="about-hero-card reveal">
                <div class="about-avatar-circle"><span>👨‍💻</span></div>
                <div class="about-intro-text">
                    <h3>FlowerSea</h3>
                    <div class="role">Full-Stack Engineer · Open Source Lover</div>
                    <p>你好，欢迎来到我的个人博客！我是一名热爱技术的开发者，喜欢探索新技术，也喜欢将所学知识分享给他人。这个博客是我记录学习心得、分享技术经验的地方。</p>
                    <p>我相信代码可以改变世界，也相信分享能让知识更有价值。</p>
                    <div class="social-links">
                        <a href="https://github.com/Myth2265742472" target="_blank" class="magnetic">🐙 GitHub</a>
                        <a href="https://juejin.cn/user/960332145889899" target="_blank" class="magnetic">📝 掘金</a>
                        <a href="javascript:void(0)" onclick="navigator.clipboard.writeText('mythlj2265@163.com');this.textContent='已复制 ✓';setTimeout(()=>this.textContent='📧 Email',2000)" class="magnetic">📧 Email</a>
                    </div>
                </div>
            </div>

            <div class="about-section-card reveal">
                <div class="about-section-title"><div class="icon-box icon-blue">✦</div>博客内容</div>
                <ul>
                    <li><span style="color:var(--accent)">▸</span> <strong>ESP32 嵌入式开发</strong> — 蓝牙 BLE、WiFi、I2S 音频、舵机控制、姿态检测</li>
                    <li><span style="color:var(--accent)">▸</span> <strong>传感器与物联网</strong> — MPU6050、DS18B20、ESP-NOW 无线通信</li>
                    <li><span style="color:var(--accent)">▸</span> <strong>计算机视觉</strong> — ESP32-CAM 图像识别、MediaPipe 人脸追踪、OpenCV</li>
                    <li><span style="color:var(--accent)">▸</span> <strong>单片机开发</strong> — 51 单片机、STC89C52、Keil C51</li>
                    <li><span style="color:var(--accent)">▸</span> <strong>Python 应用</strong> — Flask Web 服务、MicroPython、串口通信</li>
                    <li><span style="color:var(--accent)">▸</span> <strong>算法与数学</strong> — 卡尔曼滤波、互补滤波、四元数姿态解算</li>
                    <li><span style="color:var(--accent)">▸</span> <strong>MATLAB</strong> — 串口数据采集、3D 可视化、实时绘图</li>
                    <li><span style="color:var(--accent)">▸</span> <strong>Web 前端</strong> — 博客系统搭建、Git 版本控制、性能优化</li>
                </ul>
            </div>

            <div class="about-section-card reveal">
                <div class="about-section-title"><div class="icon-box icon-cyan">⚡</div>技术栈</div>
                <ul>
                    <li><span style="color:var(--accent-2)">▸</span> <strong>嵌入式</strong> — ESP32, ESP32-S3, Arduino, STC89C52</li>
                    <li><span style="color:var(--accent-2)">▸</span> <strong>通信协议</strong> — BLE, WiFi, ESP-NOW, I2C, I2S, UART, MQTT</li>
                    <li><span style="color:var(--accent-2)">▸</span> <strong>传感器</strong> — MPU6050, DS18B20, INMP441, ESP32-CAM</li>
                    <li><span style="color:var(--accent-2)">▸</span> <strong>编程语言</strong> — C/C++ (Arduino/Keil), Python, JavaScript, MATLAB</li>
                    <li><span style="color:var(--accent-2)">▸</span> <strong>驱动模块</strong> — PCA9685 PWM, L298N 电机驱动, SG90/MG996R 舵机</li>
                    <li><span style="color:var(--accent-2)">▸</span> <strong>视觉 AI</strong> — MediaPipe, OpenCV, TensorFlow Lite, CanMV K230</li>
                    <li><span style="color:var(--accent-2)">▸</span> <strong>前端</strong> — HTML5, CSS3, JavaScript, marked.js, SPA 路由</li>
                    <li><span style="color:var(--accent-2)">▸</span> <strong>工具</strong> — Git, Arduino IDE, PlatformIO, VS Code, MATLAB</li>
                </ul>
            </div>

            <div class="contact-cta reveal">
                <h3>一起聊聊？</h3>
                <p>无论是技术问题、项目合作还是随便聊聊，都欢迎联系我</p>
                <a href="javascript:void(0)" onclick="navigator.clipboard.writeText('mythlj2265@163.com');this.textContent='已复制 ✓';setTimeout(()=>this.textContent='mythlj2265@163.com',2000)" class="email-box magnetic">mythlj2265@163.com</a>
            </div>
        </div>
    `;
}

// Generate Article Detail Page
function getArticleHTML(article) {
    if (!article) return '<div class="loading">文章加载失败</div>';

    const ids = getArticleIds();
    const idx = ids.indexOf(article.id);
    const prevId = idx > 0 ? ids[idx - 1] : null;
    const nextId = idx < ids.length - 1 ? ids[idx + 1] : null;
    const prevMeta = prevId && window.markdownLoader ? window.markdownLoader.getArticleList().find(a => a.id === prevId) : null;
    const nextMeta = nextId && window.markdownLoader ? window.markdownLoader.getArticleList().find(a => a.id === nextId) : null;

    // Generate table of contents from raw markdown content
    const toc = generateTOC(article.rawMarkdown || article.content);

    return `
        <div class="article-detail">
            <div class="article-header">
                <a href="#" onclick="navigateTo('home');return false;" style="display:inline-flex;align-items:center;gap:8px;color:var(--text-muted);font-size:13px;font-family:var(--font-mono);margin-bottom:20px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    返回首页
                </a>
                <h1 class="article-title">${article.meta.title}</h1>
                <div class="article-info">
                    <span>FlowerSea</span>
                    <span class="dot"></span>
                    <span>${article.meta.date}</span>
                    <span class="dot"></span>
                    <span>${article.meta.category}</span>
                    <span class="dot"></span>
                    <span id="article-comment-count">💬 加载中...</span>
                </div>
            </div>
            <div class="article-content-wrapper">
                <div class="article-body prose">${article.content}</div>
                ${toc ? `<aside class="article-toc" id="article-toc">${toc}</aside>` : ''}
            </div>
            <div class="article-tags">
                <span class="tag-label">#</span>
                ${article.meta.tags.map(t => `<a href="#" class="magnetic">${t}</a>`).join('')}
            </div>
            <div class="article-nav">
                ${prevMeta ? `<div class="article-nav-item"><div class="nav-label">← 上一篇</div><a href="#" onclick="navigateTo('article','${prevId}');return false;">${prevMeta.title}</a></div>` : '<div></div>'}
                ${nextMeta ? `<div class="article-nav-item" style="text-align:right;"><div class="nav-label">下一篇 →</div><a href="#" onclick="navigateTo('article','${nextId}');return false;">${nextMeta.title}</a></div>` : '<div></div>'}
            </div>

            <!-- 留言板 -->
            <div class="comment-section" id="comment-section">
                <div class="comment-header">
                    <h3>💬 留言板</h3>
                    <span class="comment-count" id="comment-count">加载中...</span>
                </div>
                <div class="comment-form">
                    <div class="comment-form-row">
                        <input type="text" id="comment-nickname" placeholder="昵称 *" maxlength="50" required>
                        <input type="email" id="comment-email" placeholder="邮箱（可选）" maxlength="100">
                    </div>
                    <textarea id="comment-content" placeholder="写下你的留言..." rows="4" maxlength="2000" required></textarea>
                    <button class="comment-submit-btn" onclick="submitComment('${article.id}')">
                        <span>提交留言</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </button>
                </div>
                <div class="comment-list" id="comment-list">
                    <div class="comment-loading">正在加载留言...</div>
                </div>
            </div>
        </div>
    `;
}

// Navigate
async function navigateTo(pageName, articleId = null, pageNum = 1, isPagination = false, filterType = null, filterValue = null) {
    const contentArea = document.getElementById('content-area');
    const hero = document.getElementById('hero');
    if (!contentArea) return;

    // Fade out
    contentArea.style.opacity = '0';
    contentArea.style.transform = 'translateY(10px)';

    setTimeout(async () => {
        // Show/hide hero
        if (hero) hero.classList.toggle('hidden', pageName !== 'home');

        // Show/hide sidebar (hide on article pages for full-width reading)
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (pageName === 'article') {
                sidebar.style.display = 'none';
                contentArea.parentElement.style.gridTemplateColumns = '1fr';
            } else {
                sidebar.style.display = '';
                contentArea.parentElement.style.gridTemplateColumns = '';
            }
        }

        if (pageName === 'article' && articleId) {
            currentArticleId = articleId;
            const article = await window.markdownLoader.loadArticle(articleId);
            contentArea.innerHTML = getArticleHTML(article);
            document.title = `${article ? article.meta.title : '文章'} — FlowerSea`;
            
            // For articles, scroll to the top of the article content, not the very top of the page
            const articleEl = document.querySelector('.article-detail');
            if (articleEl) {
                const y = articleEl.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            } else {
                window.scrollTo(0, 0);
            }
            
            // Initialize TOC after article content is rendered
            setTimeout(initArticleTOC, 100);
            
            // Load comments for this article
            setTimeout(() => loadComments(articleId), 200);
            
            // Load comment count for article header
            setTimeout(() => loadCommentCount(articleId), 100);
        } else if (pageName === 'home') {
            contentArea.innerHTML = getHomeTemplate(pageNum, filterType, filterValue);
            document.title = pageTitleMap.home;
        } else if (pageName === 'archive') {
            contentArea.innerHTML = getArchiveTemplate();
            document.title = pageTitleMap.archive;
        } else if (pageName === 'about') {
            contentArea.innerHTML = getAboutTemplate();
            document.title = pageTitleMap.about;
        } else if (pageName === 'post') {
            currentArticleId = 'article1';
            const article = await window.markdownLoader.loadArticle('article1');
            contentArea.innerHTML = getArticleHTML(article);
            document.title = pageTitleMap.post;
        } else {
            contentArea.innerHTML = getHomeTemplate(pageNum, filterType, filterValue);
            document.title = pageTitleMap.home;
        }

        // Fade in
        contentArea.style.opacity = '1';
        contentArea.style.transform = 'translateY(0)';

        // Update nav
        document.querySelectorAll('.nav-link').forEach(l => { l.classList.remove('active'); if (l.dataset.page === pageName) l.classList.add('active'); });

        // Scroll logic is now handled in individual page branches to avoid overriding
        if (pageName !== 'article') {
            if (isPagination || filterType) {
                // When paginating OR when applying a filter (search/category/archive),
                // scroll to the top of the posts list (main content area).
                const postsList = document.getElementById('posts-list');
                const mainContent = document.getElementById('content-area');
                const targetEl = postsList || mainContent;
                
                if (targetEl) {
                    // Scroll to the top of the target element, accounting for the fixed navbar (approx 80px)
                    const y = targetEl.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                } else {
                    window.scrollTo(0, 0);
                }
            } else if (pageName === 'home' && !filterType) {
                 // For pure home navigation, leave it at the top to see the hero, or let user scroll
                 window.scrollTo(0, 0);
            } else {
                 window.scrollTo(0, 0);
            }
        }

        currentPage = pageName;

        // Update URL
        let url = '?page=' + pageName;
        if (articleId) url += '&id=' + articleId;
        if (pageName === 'home' && pageNum > 1) url += '&p=' + pageNum;
        if (filterType && filterValue) {
            url += `&filter=${filterType}&val=${encodeURIComponent(filterValue)}`;
        }
        history.pushState({ page: pageName, articleId, pageNum, filterType, filterValue }, '', url);
    }, 250);
}

// Generate Table of Contents from raw markdown content
function generateTOC(mdContent) {
    if (!mdContent) return '';
    const lines = mdContent.split('\n');
    const headings = [];
    const idCount = {}; // Track duplicate IDs
    
    for (const line of lines) {
        // Match ## and ### headings (h2 and h3)
        const match = line.match(/^(#{2,3})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2].replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').trim();
            // Create a slug for the heading
            const slug = text.replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
            // Handle duplicate headings with incrementing suffix
            if (idCount[slug] === undefined) {
                idCount[slug] = 0;
            } else {
                idCount[slug]++;
            }
            const id = 'toc-' + slug + (idCount[slug] > 0 ? '-' + idCount[slug] : '');
            headings.push({ level, text, id });
        }
    }
    
    if (headings.length < 3) return ''; // Only show TOC if 3+ headings
    
    let html = '<div class="toc-title">目录</div><ul class="toc-list">';
    for (const h of headings) {
        const indent = h.level === 3 ? ' toc-h3' : '';
        html += `<li class="toc-item${indent}"><a href="#${h.id}" onclick="event.preventDefault();scrollToHeading('${h.id}')">${h.text}</a></li>`;
    }
    html += '</ul>';
    return html;
}

// Scroll to heading and update TOC active state
function scrollToHeading(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
}

// Initialize TOC: add IDs to headings and setup scroll tracking
function initArticleTOC() {
    const prose = document.querySelector('.article-body.prose');
    if (!prose) return;
    
    // Add IDs to all h2 and h3 elements, with duplicate handling
    const headings = prose.querySelectorAll('h2, h3');
    const idCount = {};
    headings.forEach(h => {
        const text = h.textContent.trim();
        const slug = text.replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
        if (idCount[slug] === undefined) {
            idCount[slug] = 0;
        } else {
            idCount[slug]++;
        }
        h.id = 'toc-' + slug + (idCount[slug] > 0 ? '-' + idCount[slug] : '');
    });
    
    // Setup scroll spy for TOC
    const tocLinks = document.querySelectorAll('.toc-item a');
    if (tocLinks.length === 0) return;
    
    function updateActiveTOC() {
        const scrollY = window.scrollY;
        let activeId = '';
        
        headings.forEach(h => {
            if (h.getBoundingClientRect().top + scrollY - 100 <= scrollY) {
                activeId = h.id;
            }
        });
        
        tocLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + activeId) {
                link.classList.add('toc-active');
            } else {
                link.classList.remove('toc-active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveTOC, { passive: true });
    updateActiveTOC();
}

// Toggle article excerpt expand/collapse
function toggleExcerpt(articleId) {
    const content = document.getElementById('excerpt-' + articleId);
    const toggle = content.previousElementSibling;
    const arrow = toggle.querySelector('.excerpt-arrow');
    const text = toggle.querySelector('.excerpt-text');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        toggle.classList.remove('active');
        text.textContent = '点击阅读摘要';
    } else {
        // Close other expanded excerpts
        document.querySelectorAll('.article-excerpt-content.expanded').forEach(el => {
            el.classList.remove('expanded');
            const otherToggle = el.previousElementSibling;
            if (otherToggle) {
                otherToggle.classList.remove('active');
                const otherText = otherToggle.querySelector('.excerpt-text');
                if (otherText) otherText.textContent = '点击阅读摘要';
            }
        });
        
        content.classList.add('expanded');
        toggle.classList.add('active');
        text.textContent = '收起摘要';
    }
}

// Search
function handleSearch() {
    const q = document.getElementById('search-input').value.trim();
    if (!q) return;
    
    // Reset search input visually
    document.getElementById('search-input').value = '';
    
    // Navigate to home page with search filter
    navigateTo('home', null, 1, false, 'search', q);
}

// Update sidebar data
function updateSidebar() {
    const articles = window.markdownLoader ? window.markdownLoader.getArticleList() : [];
    if (!articles.length) return;

    // Latest Articles
    const latestEl = document.getElementById('latest-articles');
    if (latestEl) {
        // Reverse to get the latest first, then slice top 5
        const latestArticles = articles.slice().reverse().slice(0, 5);
        latestEl.innerHTML = latestArticles.map(a => `<li><a href="#" onclick="navigateTo('article', '${a.id}'); return false;">${a.title}</a></li>`).join('');
    }

    // Categories
    const cats = {};
    articles.forEach(a => cats[a.category] = (cats[a.category] || 0) + 1);
    const catEl = document.getElementById('category-list');
    if (catEl) catEl.innerHTML = Object.entries(cats).map(([c, n]) => `<li><a href="#" onclick="navigateTo('home', null, 1, false, 'category', '${c}'); return false;">${c} (${n})</a></li>`).join('');

    // Archive
    const arcs = {};
    articles.forEach(a => { 
        // 支持两种日期格式: "2026年3月7日" 和 "2026-03-07"
        let m = a.date.match(/(\d+)年(\d+)月/); 
        if (!m) {
            m = a.date.match(/(\d{4})-(\d{2})/);
        }
        
        if (m) { 
            // 统一转换成 "2026年3月" 格式进行统计和展示
            const monthStr = parseInt(m[2], 10).toString(); // 去掉前导0
            const k = m[1] + '年' + monthStr + '月'; 
            arcs[k] = (arcs[k] || 0) + 1; 
        } 
    });
    const arcEl = document.getElementById('archive-list');
    if (arcEl) {
        const sorted = Object.entries(arcs).sort((a, b) => new Date(b[0].replace(/年/, '-').replace(/月/, '-01')) - new Date(a[0].replace(/年/, '-').replace(/月/, '-01')));
        arcEl.innerHTML = sorted.map(([m, n]) => `<li><a href="#" onclick="navigateTo('home', null, 1, false, 'archive', '${m}'); return false;">${m} (${n})</a></li>`).join('');
    }
}

// Init
async function initRouter() {
    // Transition style
    const s = document.createElement('style');
    s.textContent = `#content-area { transition: opacity 0.3s ease, transform 0.3s ease; }`;
    document.head.appendChild(s);

    // Update Hero Stats dynamically
    const updateHeroStats = () => {
        // Calculate days running from the earliest article date
        const articles = window.markdownLoader ? window.markdownLoader.getArticleList() : [];
        const totalArticles = articles.length;
        
        // Parse all article dates and find the earliest one
        const parsedDates = articles.map(a => {
            let m = a.date.match(/(\d+)年(\d+)月(\d+)日/);
            if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
            m = a.date.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
            return null;
        }).filter(d => d !== null);
        
        const launchDate = parsedDates.length > 0 ? new Date(Math.min(...parsedDates)) : new Date();
        const daysRunning = Math.floor((new Date() - launchDate) / (1000 * 60 * 60 * 24));
        
        // Update DOM elements before counter animation starts
        const statEls = document.querySelectorAll('.stat-number');
        if (statEls.length >= 3) {
            statEls[0].dataset.target = totalArticles; // 篇文章
            statEls[1].dataset.target = daysRunning;   // 天运行
            
            // Try to fetch public repos as "commits/projects" or fallback to a calculated number
            fetch('https://api.github.com/users/Myth2265742472?' + Date.now())
                .then(res => res.json())
                .then(data => {
                    if (data && data.public_repos !== undefined) {
                        statEls[2].dataset.target = data.public_repos; // Use public repos
                        const labelEl = statEls[2].nextElementSibling;
                        if (labelEl) labelEl.textContent = '个开源项目';
                    } else {
                        statEls[2].dataset.target = totalArticles * 12; // fallback mock
                    }
                })
                .catch(() => {
                    statEls[2].dataset.target = totalArticles * 12; // fallback mock
                });
        }
    };
    updateHeroStats();

    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const id = params.get('id');
    const p = parseInt(params.get('p')) || 1;
    const filter = params.get('filter');
    const val = params.get('val');

    if (page === 'article' && id) await navigateTo('article', id);
    else if (page === 'post') await navigateTo('post');
    else if (page === 'about') await navigateTo('about');
    else if (page === 'archive') await navigateTo('archive');
    else await navigateTo('home', null, p, false, filter, val);

    updateSidebar();

    window.addEventListener('popstate', e => {
        if (e.state && e.state.page) navigateTo(e.state.page, e.state.articleId, e.state.pageNum || 1, false, e.state.filterType, e.state.filterValue);
    });
}

// ==================== Comment System ====================

const API_BASE_URL = 'https://mythlj2.lovestoblog.com/api/comments.php';

/**
 * 加载文章留言数量（用于标题栏显示）
 */
async function loadCommentCount(articleId) {
    const countEl = document.getElementById('article-comment-count');
    if (!countEl) return;

    try {
        const response = await fetch(`${API_BASE_URL}?action=count&article_id=${articleId}`);
        const result = await response.json();

        if (result.success && result.data) {
            const count = result.data.count;
            countEl.textContent = `💬 ${count} 条`;
        } else {
            countEl.textContent = '💬 0 条';
        }
    } catch (err) {
        console.error('加载留言数量失败:', err);
        countEl.textContent = '💬 0 条';
    }
}

/**
 * 加载文章留言列表
 */
async function loadComments(articleId) {
    const listEl = document.getElementById('comment-list');
    const countEl = document.getElementById('comment-count');
    if (!listEl) return;

    try {
        const response = await fetch(`${API_BASE_URL}?action=list&article_id=${articleId}&limit=50`);
        const result = await response.json();

        if (result.success && result.data) {
            const comments = result.data.comments;
            const total = result.data.total;

            if (countEl) countEl.textContent = `${total} 条留言`;

            if (comments.length === 0) {
                listEl.innerHTML = '<div class="comment-empty">暂无留言，来做第一个留言的人吧！</div>';
                return;
            }

            listEl.innerHTML = comments.map(c => `
                <div class="comment-item">
                    <div class="comment-meta">
                        <span class="comment-author">${escapeHtml(c.nickname)}</span>
                        <span class="comment-time">${c.created_at}</span>
                    </div>
                    <div class="comment-body">${escapeHtml(c.content)}</div>
                </div>
            `).join('');
        } else {
            listEl.innerHTML = '<div class="comment-error">加载留言失败，请刷新重试</div>';
        }
    } catch (err) {
        console.error('加载留言失败:', err);
        listEl.innerHTML = '<div class="comment-error">加载留言失败，请检查网络连接</div>';
    }
}

/**
 * 提交新留言
 */
async function submitComment(articleId) {
    const nicknameEl = document.getElementById('comment-nickname');
    const emailEl = document.getElementById('comment-email');
    const contentEl = document.getElementById('comment-content');
    const submitBtn = document.querySelector('.comment-submit-btn');

    const nickname = nicknameEl.value.trim();
    const email = emailEl.value.trim();
    const content = contentEl.value.trim();

    // 验证
    if (!nickname) {
        alert('请输入昵称');
        nicknameEl.focus();
        return;
    }
    if (!content) {
        alert('请输入留言内容');
        contentEl.focus();
        return;
    }
    if (nickname.length > 50) {
        alert('昵称不能超过 50 个字符');
        return;
    }
    if (content.length > 2000) {
        alert('留言内容不能超过 2000 个字符');
        return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('邮箱格式不正确');
        return;
    }

    // 禁用按钮防止重复提交
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>提交中...</span>';

    try {
        const response = await fetch(`${API_BASE_URL}?action=submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                article_id: articleId,
                nickname: nickname,
                email: email,
                content: content
            })
        });

        const result = await response.json();

        if (result.success) {
            // 清空表单
            nicknameEl.value = '';
            emailEl.value = '';
            contentEl.value = '';
            // 重新加载留言列表
            await loadComments(articleId);
            alert('留言提交成功！');
        } else {
            alert(result.message || '提交失败，请重试');
        }
    } catch (err) {
        console.error('提交留言失败:', err);
        alert('提交失败，请检查网络连接');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>提交留言</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    }
}

/**
 * HTML 转义防止 XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRouter);
else initRouter();
