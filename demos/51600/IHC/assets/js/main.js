let cart = JSON.parse(localStorage.getItem('cart') || '[]');

const fallbackImages = {
    product: 'assets/images/product-placeholder.svg',
    craftsman: 'assets/images/craftsman-placeholder.svg',
    hero: 'assets/images/hero-placeholder.svg'
};

function getSafeImage(url, type = 'product') {
    if (!url || url.trim() === '') {
        return fallbackImages[type];
    }
    return url;
}

function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i>🛒</i>
                    <p>购物车是空的</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return '';
                return `
                    <div class="cart-item">
                        <img src="${getSafeImage(product.images[0])}" alt="${product.name}" class="cart-item-image" onerror="this.src='${fallbackImages.product}'">
                        <div class="cart-item-info">
                            <h4>${product.name}</h4>
                            <div class="price">¥${product.price.toLocaleString()}</div>
                            <div class="cart-item-quantity">
                                <button onclick="updateCartItemQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateCartItemQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                            </div>
                            <button class="cart-item-remove" onclick="removeCartItem('${item.productId}')">删除</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    if (cartTotal) {
        const total = cart.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
        cartTotal.textContent = `¥${total.toLocaleString()}`;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    updateCart();
    showModal('✅', '添加成功', '已将商品加入购物车');
}

function updateCartItemQuantity(productId, quantity) {
    if (quantity <= 0) {
        removeCartItem(productId);
        return;
    }
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity = quantity;
        updateCart();
    }
}

function removeCartItem(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCart();
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('open');
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    }
}

function showModal(icon, title, message) {
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    if (modal && modalOverlay && modalIcon && modalTitle && modalMessage) {
        modalIcon.textContent = icon;
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('open');
        modalOverlay.classList.add('open');
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modalOverlay');
    if (modal && modalOverlay) {
        modal.classList.remove('open');
        modalOverlay.classList.remove('open');
    }
}

function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('open');
    }
}

let heroSliderState = {
    currentSlide: 0,
    slides: [],
    indicatorItems: []
};

function goToSlide(index) {
    heroSliderState.currentSlide = index;
    heroSliderState.slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === heroSliderState.currentSlide);
    });
    heroSliderState.indicatorItems.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === heroSliderState.currentSlide);
    });
}

function renderHeroSlider() {
    const slider = document.getElementById('heroSlider');
    const indicators = document.getElementById('heroIndicators');
    
    if (!slider || !indicators || !heroSlides) return;

    slider.innerHTML = heroSlides.map((slide, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}">
            <img src="${getSafeImage(slide.image, 'hero')}" alt="${slide.title}" onerror="this.src='${fallbackImages.hero}'">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1>${slide.title}</h1>
                <div class="subtitle">${slide.subtitle}</div>
                <p>${slide.description}</p>
                <a href="products.html" class="btn btn-primary">探索好物</a>
            </div>
        </div>
    `).join('');

    indicators.innerHTML = heroSlides.map((_, index) => `
        <div class="hero-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');

    heroSliderState.slides = document.querySelectorAll('.hero-slide');
    heroSliderState.indicatorItems = document.querySelectorAll('.hero-indicator');

    heroSliderState.indicatorItems.forEach(indicator => {
        indicator.addEventListener('click', () => {
            goToSlide(parseInt(indicator.dataset.index));
        });
    });

    function nextSlide() {
        heroSliderState.currentSlide = (heroSliderState.currentSlide + 1) % heroSliderState.slides.length;
        goToSlide(heroSliderState.currentSlide);
    }

    function prevSlide() {
        heroSliderState.currentSlide = (heroSliderState.currentSlide - 1 + heroSliderState.slides.length) % heroSliderState.slides.length;
        goToSlide(heroSliderState.currentSlide);
    }

    const heroNext = document.getElementById('heroNext');
    const heroPrev = document.getElementById('heroPrev');
    
    if (heroNext) heroNext.addEventListener('click', nextSlide);
    if (heroPrev) heroPrev.addEventListener('click', prevSlide);

    setInterval(nextSlide, 5000);
}

function renderCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid || !categories) return;

    categoriesGrid.innerHTML = categories.map(category => `
        <div class="category-card" onclick="filterProducts('${category.id}')">
            <div class="category-icon">${category.icon}</div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
        </div>
    `).join('');
}

function filterProducts(categoryId) {
    window.location.href = `products.html?category=${categoryId}`;
}

function renderProductCard(product) {
    return `
        <div class="product-card" onclick="goToProductDetail('${product.id}')">
            <img src="${getSafeImage(product.images[0])}" alt="${product.name}" class="product-image" onerror="this.src='${fallbackImages.product}'">
            ${product.is_hot ? '<div class="product-badge">🔥 热门</div>' : ''}
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-tags">
                    ${product.tags.slice(0, 2).map(tag => `<span class="product-tag">${tag}</span>`).join('')}
                </div>
                <div class="product-price-row">
                    <div class="product-price">¥${product.price.toLocaleString()}</div>
                    <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${product.id}')">加入购物车</button>
                </div>
            </div>
        </div>
    `;
}

function renderHotProducts() {
    const hotProducts = document.getElementById('hotProducts');
    if (!hotProducts || !products) return;

    const hotItems = products.filter(p => p.is_hot);
    hotProducts.innerHTML = hotItems.map(product => renderProductCard(product)).join('');
}

function renderCraftsmenGrid(elementId, limit = null) {
    const grid = document.getElementById(elementId);
    if (!grid || !craftsmen) return;

    const items = limit ? craftsmen.slice(0, limit) : craftsmen;
    grid.innerHTML = items.map(craftsman => `
        <div class="craftsman-card" onclick="goToCraftsmanDetail('${craftsman.id}')">
            <img src="${getSafeImage(craftsman.avatar, 'craftsman')}" alt="${craftsman.name}" class="craftsman-avatar" onerror="this.src='${fallbackImages.craftsman}'">
            <h3>${craftsman.name}</h3>
            <div class="title">${craftsman.title}</div>
            <p>${craftsman.origin}</p>
        </div>
    `).join('');
}

function goToProductDetail(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function goToCraftsmanDetail(craftsmanId) {
    window.location.href = `craftsman-detail.html?id=${craftsmanId}`;
}

function renderProductDetail() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        container.innerHTML = '<div style="text-align: center; padding: 50px;">未找到商品</div>';
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        container.innerHTML = '<div style="text-align: center; padding: 50px;">商品不存在</div>';
        return;
    }

    const craftsman = craftsmen.find(c => c.id === product.craftsman_id);
    const category = categories.find(c => c.id === product.category_id);

    container.innerHTML = `
        <div class="product-detail-container">
            <div class="product-images">
                <img src="${getSafeImage(product.images[0])}" alt="${product.name}" class="main-image" id="mainImage" onerror="this.src='${fallbackImages.product}'">
                <div class="thumbnails">
                    ${product.images.map((img, index) => `
                        <img src="${getSafeImage(img)}" alt="${product.name}" class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${getSafeImage(img)}', this)" onerror="this.src='${fallbackImages.product}'">
                    `).join('')}
                </div>
            </div>
            <div class="product-detail-info">
                <div class="product-detail-tags">
                    ${category ? `<span class="product-tag">${category.name}</span>` : ''}
                    ${product.tags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
                </div>
                <h1>${product.name}</h1>
                <div class="price">¥${product.price.toLocaleString()}</div>
                <p class="description">${product.description}</p>
                
                <div class="product-specs">
                    <h3>规格参数</h3>
                    ${Object.entries(product.specs).map(([key, value]) => `
                        <div class="spec-item">
                            <span>${key}</span>
                            <span>${value}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="craft-description">
                    <h3>工艺介绍</h3>
                    <p>${product.craft_description}</p>
                </div>

                <div class="order-section">
                    <div class="stock">库存：${product.stock}件</div>
                    <div class="quantity-selector">
                        <label>数量：</label>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="decreaseQuantity()">-</button>
                            <input type="number" class="quantity-input" id="quantityInput" value="1" min="1" max="${product.stock}" readonly>
                            <button class="quantity-btn" onclick="increaseQuantity(${product.stock})">+</button>
                        </div>
                    </div>
                    <div class="order-buttons">
                        <button class="btn btn-secondary" onclick="addToCart('${product.id}')">加入购物车</button>
                        <button class="btn btn-primary" onclick="addToCart('${product.id}'); showModal('✅', '下单成功', '已将商品加入购物车，请前往结算');">立即购买</button>
                    </div>
                    
                    ${craftsman ? `
                        <a href="craftsman-detail.html?id=${craftsman.id}" class="craftsman-link">
                            <img src="${getSafeImage(craftsman.avatar, 'craftsman')}" alt="${craftsman.name}" onerror="this.src='${fallbackImages.craftsman}'">
                            <div class="craftsman-link-info">
                                <h4>匠人：${craftsman.name}</h4>
                                <p>${craftsman.title}</p>
                            </div>
                            <span>→</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function changeMainImage(src, element) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = src;
    }
    document.querySelectorAll('.thumbnail').forEach(img => img.classList.remove('active'));
    element.classList.add('active');
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (input && input.value > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function increaseQuantity(max) {
    const input = document.getElementById('quantityInput');
    if (input && input.value < max) {
        input.value = parseInt(input.value) + 1;
    }
}

function renderProductsList() {
    const productsGrid = document.getElementById('productsGrid');
    const filterCategories = document.getElementById('filterCategories');
    const pagination = document.getElementById('pagination');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchInput');
    
    if (!productsGrid || !filterCategories || !pagination) return;

    const urlParams = new URLSearchParams(window.location.search);
    let selectedCategory = urlParams.get('category') || 'all';
    let sortBy = urlParams.get('sort') || 'default';
    let keyword = urlParams.get('keyword') || '';
    let currentPage = parseInt(urlParams.get('page')) || 1;
    const itemsPerPage = 6;

    if (sortSelect) {
        sortSelect.value = sortBy;
    }

    if (searchInput) {
        searchInput.value = keyword;
    }

    filterCategories.innerHTML = `
        <div class="filter-category ${selectedCategory === 'all' ? 'active' : ''}" onclick="filterByCategory('all')">全部</div>
        ${categories.map(category => `
            <div class="filter-category ${selectedCategory === category.id ? 'active' : ''}" onclick="filterByCategory('${category.id}')">
                ${category.icon} ${category.name}
            </div>
        `).join('')}
    `;

    let filteredProducts = products;
    
    if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category_id === selectedCategory);
    }

    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(lowerKeyword) ||
            p.description.toLowerCase().includes(lowerKeyword) ||
            p.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
        );
    }

    switch (sortBy) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'hot':
            filteredProducts.sort((a, b) => (b.is_hot ? 1 : 0) - (a.is_hot ? 1 : 0));
            break;
    }

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);

    if (pageProducts.length === 0) {
        productsGrid.innerHTML = '<div style="text-align: center; padding: 50px; grid-column: 1 / -1;">暂无商品</div>';
    } else {
        productsGrid.innerHTML = pageProducts.map(product => renderProductCard(product)).join('');
    }

    let paginationHTML = '';
    if (currentPage > 1) {
        paginationHTML += `<button onclick="goToPage(${currentPage - 1})">‹</button>`;
    }
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="goToPage(${currentPage + 1})">›</button>`;
    }
    pagination.innerHTML = paginationHTML;
}

function filterByCategory(categoryId) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('category', categoryId);
    urlParams.set('page', '1');
    window.location.search = urlParams.toString();
}

function goToPage(page) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('page', page);
    window.location.search = urlParams.toString();
}

function renderCraftsmanDetail() {
    const container = document.getElementById('craftsmanDetailContainer');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const craftsmanId = urlParams.get('id');
    
    if (!craftsmanId) {
        container.innerHTML = '<div style="text-align: center; padding: 50px;">未找到匠人</div>';
        return;
    }

    const craftsman = craftsmen.find(c => c.id === craftsmanId);
    if (!craftsman) {
        container.innerHTML = '<div style="text-align: center; padding: 50px;">匠人不存在</div>';
        return;
    }

    const works = products.filter(p => craftsman.representative_works.includes(p.id));

    container.innerHTML = `
        <div class="craftsman-detail-header">
            <img src="${getSafeImage(craftsman.avatar, 'craftsman')}" alt="${craftsman.name}" class="craftsman-detail-avatar" onerror="this.src='${fallbackImages.craftsman}'">
            <div class="craftsman-detail-info">
                <h1>${craftsman.name}</h1>
                <div class="title">${craftsman.title}</div>
                <div class="origin">📍 ${craftsman.origin}</div>
                <div class="lineage">${craftsman.lineage}</div>
                <p class="bio">${craftsman.bio}</p>
            </div>
        </div>

        <div class="awards-section">
            <h3>荣誉奖项</h3>
            <div class="awards-list">
                ${craftsman.awards.map(award => `<div class="award-item">🏆 ${award}</div>`).join('')}
            </div>
        </div>

        <div class="timeline-section">
            <h3>传承历程</h3>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-date">传承起源</div>
                    <div class="timeline-content">${craftsman.lineage}，家族世代传承技艺</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">技艺精进</div>
                    <div class="timeline-content">多年深耕细作，不断提升技艺水平</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">获得认可</div>
                    <div class="timeline-content">荣获多项国家级、省级工艺美术大奖</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">传承创新</div>
                    <div class="timeline-content">致力于传统技艺的传承与创新，培养新一代传承人</div>
                </div>
            </div>
        </div>

        <div class="representative-works-section">
            <h3>代表作品</h3>
            <div class="representative-works-grid">
                ${works.length > 0 ? works.map(product => `
                    <div class="product-card" onclick="goToProductDetail('${product.id}')">
                        <img src="${getSafeImage(product.images[0])}" alt="${product.name}" class="product-image" onerror="this.src='${fallbackImages.product}'">
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <div class="product-price">¥${product.price.toLocaleString()}</div>
                        </div>
                    </div>
                `).join('') : '<div style="text-align: center; padding: 50px; grid-column: 1 / -1;">暂无代表作品</div>'}
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    updateCart();

    const cartBtn = document.getElementById('cartBtn');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const modalBtn = document.getElementById('modalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const sortSelect = document.getElementById('sortSelect');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    if (modalBtn) modalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('sort', e.target.value);
            urlParams.set('page', '1');
            window.location.search = urlParams.toString();
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const keyword = searchInput.value.trim();
            if (keyword) {
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('keyword', keyword);
                urlParams.set('page', '1');
                window.location.search = urlParams.toString();
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        renderHeroSlider();
        renderCategories();
        renderHotProducts();
        renderCraftsmenGrid('craftsmenGrid', 3);
    }

    if (window.location.pathname.includes('products.html')) {
        renderProductsList();
    }

    if (window.location.pathname.includes('product-detail.html')) {
        renderProductDetail();
    }

    if (window.location.pathname.includes('craftsmen.html')) {
        renderCraftsmenGrid('craftsmenFullGrid');
    }

    if (window.location.pathname.includes('craftsman-detail.html')) {
        renderCraftsmanDetail();
    }
});