const products = [
    {
        id: 1,
        name: '有机西红柿',
        price: 8.5,
        origin: '云南省大理州',
        stock: 500,
        description: '产自云南大理高原的有机西红柿，日照充足，口感酸甜可口，富含维生素C。采用传统种植方式，不使用农药化肥。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20tomatoes%20on%20vine%20in%20farm%20garden%2C%20natural%20lighting%2C%20green%20leaves%2C%20rustic%20wooden%20background&image_size=square'
    },
    {
        id: 2,
        name: '高山苹果',
        price: 12.0,
        origin: '陕西省延安市',
        stock: 300,
        description: '陕北高原红富士苹果，海拔1200米以上种植，昼夜温差大，糖分积累充足，果肉脆甜多汁。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20fuji%20apples%20in%20basket%2C%20mountain%20farm%20background%2C%20natural%20sunlight%2C%20crispy%20texture&image_size=square'
    },
    {
        id: 3,
        name: '农家土鸡蛋',
        price: 28.0,
        origin: '湖南省邵阳市',
        stock: 200,
        description: '散养土鸡下的蛋，蛋黄饱满色泽金黄，营养丰富。每盒30枚装，新鲜直达。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20farm%20eggs%20in%20straw%20basket%2C%20rustic%20farmhouse%20kitchen%2C%20brown%20eggs%2C%20natural%20lighting&image_size=square'
    },
    {
        id: 4,
        name: '新鲜草莓',
        price: 25.0,
        origin: '四川省成都市',
        stock: 150,
        description: '冬草莓基地直供，果形饱满，色泽鲜艳，口感香甜细腻，是冬季不可错过的美味。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20strawberries%20in%20bowl%2C%20green%20leaves%2C%20water%20drops%2C%20farm%20background&image_size=square'
    },
    {
        id: 5,
        name: '生态大米',
        price: 18.0,
        origin: '黑龙江省五常市',
        stock: 1000,
        description: '五常稻花香大米，生长在黑土地上，水质纯净，米粒饱满，煮出的米饭香气扑鼻，口感软糯。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20white%20rice%20grains%20in%20wooden%20bowl%2C%20rice%20field%20background%2C%20golden%20harvest%2C%20Asian%20style&image_size=square'
    },
    {
        id: 6,
        name: '野生香菇',
        price: 35.0,
        origin: '浙江省丽水市',
        stock: 80,
        description: '深山老林采摘的野生香菇，肉质厚实，香气浓郁，营养丰富，是天然的山珍美味。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20wild%20mushrooms%20shiitake%20on%20wooden%20board%2C%20forest%20background%2C%20natural%20lighting%2C%20organic&image_size=square'
    }
];

const categories = ['全部', '蔬菜', '水果', '蛋类', '粮油', '干货'];

const farmerOrders = [
    {
        id: 'N20260709001',
        status: '待发货',
        productName: '有机西红柿',
        price: 8.5,
        quantity: 10,
        total: 85.0,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20tomatoes%20on%20vine%2C%20farm%20garden&image_size=square'
    },
    {
        id: 'N20260709002',
        status: '待发货',
        productName: '农家土鸡蛋',
        price: 28.0,
        quantity: 2,
        total: 56.0,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20farm%20eggs%20in%20basket&image_size=square'
    },
    {
        id: 'N20260708001',
        status: '已完成',
        productName: '高山苹果',
        price: 12.0,
        quantity: 5,
        total: 60.0,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20apples%2C%20mountain%20farm&image_size=square'
    }
];

const consumerOrders = [
    {
        id: 'N20260709001',
        status: '待收货',
        productName: '有机西红柿',
        price: 8.5,
        quantity: 10,
        total: 85.0,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20tomatoes%20on%20vine%2C%20farm%20garden&image_size=square'
    },
    {
        id: 'N20260708001',
        status: '已完成',
        productName: '高山苹果',
        price: 12.0,
        quantity: 5,
        total: 60.0,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20apples%2C%20mountain%20farm&image_size=square'
    }
];

const purchaseGroups = [
    {
        id: 1,
        name: '社区爱心团购-水果套餐',
        description: '为社区居民精选的当季水果组合',
        endTime: '2026-07-15 23:59',
        currentCount: 128,
        targetCount: 200,
        products: ['高山苹果', '新鲜草莓'],
        originalPrice: 60.0,
        groupPrice: 45.0
    },
    {
        id: 2,
        name: '助农蔬菜套餐',
        description: '支持偏远农户，购买新鲜蔬菜',
        endTime: '2026-07-12 23:59',
        currentCount: 85,
        targetCount: 100,
        products: ['有机西红柿', '生态大米'],
        originalPrice: 40.0,
        groupPrice: 30.0
    },
    {
        id: 3,
        name: '农家土特产礼包',
        description: '汇集各地农家特色产品',
        endTime: '2026-07-20 23:59',
        currentCount: 200,
        targetCount: 300,
        products: ['农家土鸡蛋', '野生香菇'],
        originalPrice: 80.0,
        groupPrice: 60.0
    }
];

let currentRole = null;
let currentProduct = null;
let currentCategory = '全部';

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
}

function selectRole(role) {
    currentRole = role;
    showPage(`${role}-home`);
    loadRoleData(role);
}

function loadRoleData(role) {
    if (role === 'farmer') {
        renderFarmerProducts();
        renderFarmerOrders();
    } else if (role === 'consumer') {
        renderConsumerProducts();
        renderPurchaseGroups();
    } else if (role === 'group-leader') {
        renderGroupLeaderGroups();
    }
}

function renderFarmerProducts() {
    const container = document.getElementById('farmer-product-list');
    if (!container) return;
    
    const myProducts = products.slice(0, 3);
    container.innerHTML = myProducts.map(product => `
        <div class="product-item" onclick="showProductDetail(${product.id})">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-meta">
                    <span class="product-price">¥${product.price}/斤</span>
                    <span class="product-origin">${product.origin}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderFarmerOrders() {
    const container = document.getElementById('farmer-order-list');
    if (!container) return;
    
    container.innerHTML = farmerOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">订单号：${order.id}</span>
                <span class="order-status">${order.status}</span>
            </div>
            <div class="order-product">
                <img src="${order.image}" alt="${order.productName}">
                <div class="order-product-info">
                    <div class="order-product-name">${order.productName}</div>
                    <div class="order-product-price">¥${order.price}/斤 x ${order.quantity}斤</div>
                </div>
            </div>
            <div class="order-total">合计：¥${order.total.toFixed(2)}</div>
            ${order.status === '待发货' ? '<button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="confirmDelivery(\'' + order.id + '\')">确认发货</button>' : ''}
        </div>
    `).join('');
}

function renderConsumerProducts() {
    const container = document.getElementById('consumer-product-list');
    if (!container) return;
    
    const filteredProducts = currentCategory === '全部' 
        ? products 
        : products.filter(p => getProductCategory(p.name) === currentCategory);
    
    container.innerHTML = filteredProducts.map(product => `
        <div class="product-item" onclick="showProductDetail(${product.id})">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-meta">
                    <span class="product-price">¥${product.price}/斤</span>
                    <span class="product-origin">${product.origin}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPurchaseGroups() {
    const container = document.getElementById('purchase-group-list');
    if (!container) return;
    
    container.innerHTML = purchaseGroups.map(group => `
        <div class="purchase-group">
            <div class="purchase-group-header">
                <div class="purchase-group-icon">🥬</div>
                <div class="purchase-group-info">
                    <h3>${group.name}</h3>
                    <p>${group.products.join(' + ')}</p>
                </div>
            </div>
            <div class="purchase-group-footer">
                <div>
                    <span class="purchase-group-price">¥${group.groupPrice}</span>
                    <span class="text-gray text-sm" style="text-decoration:line-through;">¥${group.originalPrice}</span>
                </div>
                <button class="purchase-group-btn" onclick="joinPurchaseGroup(${group.id})">立即参团</button>
            </div>
        </div>
    `).join('');
}

function renderGroupLeaderGroups() {
    const container = document.getElementById('group-leader-group-list');
    if (!container) return;
    
    container.innerHTML = purchaseGroups.map(group => `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${group.name}</h3>
                <span class="text-primary">已拼${group.currentCount}/${group.targetCount}人</span>
            </div>
            <p class="text-gray text-sm mb-16">${group.description}</p>
            <div class="grid grid-3">
                <div class="stat-card">
                    <div class="stat-value">¥${group.groupPrice}</div>
                    <div class="stat-label">团购价</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${group.currentCount}</div>
                    <div class="stat-label">已参团</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${group.targetCount}</div>
                    <div class="stat-label">目标人数</div>
                </div>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:16px;">查看详情</button>
        </div>
    `).join('');
}

function getProductCategory(name) {
    if (name.includes('西红柿')) return '蔬菜';
    if (name.includes('苹果') || name.includes('草莓')) return '水果';
    if (name.includes('鸡蛋')) return '蛋类';
    if (name.includes('大米')) return '粮油';
    if (name.includes('香菇')) return '干货';
    return '全部';
}

function showProductDetail(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;
    
    document.getElementById('product-detail-image').src = currentProduct.image;
    document.getElementById('product-detail-name').textContent = currentProduct.name;
    document.getElementById('product-detail-price').textContent = '¥' + currentProduct.price + '/斤';
    document.getElementById('product-detail-origin').textContent = '产地：' + currentProduct.origin;
    document.getElementById('product-detail-description').textContent = currentProduct.description;
    document.getElementById('product-detail-stock').textContent = '库存：' + currentProduct.stock + '斤';
    
    showPage('product-detail');
}

function showOrderConfirm() {
    if (!currentProduct) return;
    
    document.getElementById('order-confirm-product-image').src = currentProduct.image;
    document.getElementById('order-confirm-product-name').textContent = currentProduct.name;
    document.getElementById('order-confirm-product-price').textContent = '¥' + currentProduct.price + '/斤';
    document.getElementById('order-confirm-product-quantity').textContent = '购买数量：10斤';
    document.getElementById('order-confirm-total-value').textContent = '¥' + (currentProduct.price * 10).toFixed(2);
    
    showPage('order-confirm');
}

function submitOrder() {
    showPage('success');
}

function confirmDelivery(orderId) {
    showModal('发货成功', '订单已确认发货，感谢您的辛勤付出！');
}

function joinPurchaseGroup(groupId) {
    showModal('参团成功', '您已成功加入团购，等待拼团完成后统一发货！');
}

function showModal(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function switchCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent === category) {
            item.classList.add('active');
        }
    });
    renderConsumerProducts();
}

function switchRole(role) {
    selectRole(role);
}

function initNav(role) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`.nav-item[data-role="${role}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.role-card[data-role="farmer"]').addEventListener('click', () => selectRole('farmer'));
    document.querySelector('.role-card[data-role="consumer"]').addEventListener('click', () => selectRole('consumer'));
    document.querySelector('.role-card[data-role="group-leader"]').addEventListener('click', () => selectRole('group-leader'));
    
    document.getElementById('farmer-publish-btn').addEventListener('click', () => showPage('farmer-publish'));
    document.getElementById('farmer-orders-btn').addEventListener('click', () => showPage('farmer-orders'));
    document.getElementById('farmer-profile-btn').addEventListener('click', () => showPage('farmer-profile'));
    
    document.getElementById('consumer-orders-btn').addEventListener('click', () => showPage('consumer-orders'));
    document.getElementById('consumer-profile-btn').addEventListener('click', () => showPage('consumer-profile'));
    
    document.getElementById('group-leader-products-btn').addEventListener('click', () => showPage('group-leader-products'));
    document.getElementById('group-leader-profile-btn').addEventListener('click', () => showPage('group-leader-profile'));
    
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentRole) {
                showPage(`${currentRole}-home`);
            } else {
                showPage('home');
            }
        });
    });
    
    document.getElementById('product-detail-buy-btn').addEventListener('click', showOrderConfirm);
    
    document.getElementById('order-confirm-submit').addEventListener('click', submitOrder);
    
    document.getElementById('success-back-btn').addEventListener('click', () => {
        if (currentRole) {
            showPage(`${currentRole}-home`);
        } else {
            showPage('home');
        }
    });
    
    document.getElementById('farmer-publish-submit').addEventListener('click', () => {
        showModal('发布成功', '您的产品已成功发布，感谢您的参与！');
    });
    
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-confirm').addEventListener('click', closeModal);
    
    document.querySelectorAll('.role-switcher-option').forEach(option => {
        option.addEventListener('click', () => {
            const role = option.dataset.role;
            switchRole(role);
        });
    });
    
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            switchCategory(item.textContent);
        });
    });
    
    showPage('home');
});