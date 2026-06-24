// 全局变量
let currentUser = null;
let wardrobe = [];
let savedOutfits = [];
let currentAvatar = {
    hair: 'hair-1',
    face: 'face-1',
    skin: '#FFE4C4'
};

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAvatarEditor();
    initCloset();
    initDressup();
    initCommunity();
    initModals();
    loadMockData();
});

// 初始化导航
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // 滚动时更新导航
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.section');
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
}

// 初始化形象编辑器
function initAvatarEditor() {
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const optionType = btn.dataset.option;
            const optionValue = btn.dataset.value;
            
            // 更新当前形象
            currentAvatar[optionType] = optionValue;
            
            // 更新UI
            updateAvatarPreview();
            
            // 更新选中状态
            document.querySelectorAll(`[data-option="${optionType}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 保存形象
    document.getElementById('saveAvatar').addEventListener('click', () => {
        localStorage.setItem('avatar', JSON.stringify(currentAvatar));
        showNotification('形象保存成功！');
    });
}

// 更新形象预览
function updateAvatarPreview() {
    const avatar = document.getElementById('customAvatar');
    
    // 更新发型
    const hair = document.getElementById('hair');
    hair.className = `hair ${currentAvatar.hair}`;
    
    // 更新脸型
    const face = document.getElementById('face');
    face.className = `face ${currentAvatar.face}`;
    face.style.background = currentAvatar.skin;
    
    // 更新肤色（眼睛和嘴巴）
    const eyes = document.getElementById('eyes');
    const mouth = document.getElementById('mouth');
}

// 初始化衣橱
function initCloset() {
    // 上传按钮
    const photoUpload = document.getElementById('photoUpload');
    const albumUpload = document.getElementById('albumUpload');
    
    photoUpload.addEventListener('change', handlePhotoUpload);
    albumUpload.addEventListener('change', handleAlbumUpload);
    
    // 筛选标签
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterClothes(tab.dataset.filter);
        });
    });
}

// 处理照片上传
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        processImage(file);
    }
}

// 处理相册上传
function handleAlbumUpload(e) {
    const files = e.target.files;
    Array.from(files).forEach(file => processImage(file));
}

// 处理图像
function processImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // 简单的卡通化处理（模拟）
            const cartoonImage = cartoonizeImage(img);
            
            // 创建服装对象
            const clothing = {
                id: Date.now(),
                name: file.name,
                category: autoDetectCategory(file.name),
                image: cartoonImage,
                originalImage: e.target.result,
                uploadedAt: new Date().toISOString()
            };
            
            wardrobe.push(clothing);
            saveWardrobe();
            renderCloset();
            showNotification('服装上传成功！');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 模拟卡通化处理
function cartoonizeImage(img) {
    // 创建canvas进行处理
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    // 绘制原始图像
    ctx.drawImage(img, 0, 0);
    
    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // 简化颜色（卡通化效果）
    for (let i = 0; i < data.length; i += 4) {
        // 简化RGB值
        data[i] = Math.round(data[i] / 50) * 50;
        data[i + 1] = Math.round(data[i + 1] / 50) * 50;
        data[i + 2] = Math.round(data[i + 2] / 50) * 50;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL();
}

// 自动检测分类
function autoDetectCategory(filename) {
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('shirt') || lowerName.includes('t恤') || lowerName.includes('上衣')) return 'top';
    if (lowerName.includes('pants') || lowerName.includes('裤子')) return 'pants';
    if (lowerName.includes('dress') || lowerName.includes('裙子')) return 'dress';
    if (lowerName.includes('coat') || lowerName.includes('外套') || lowerName.includes('jacket')) return 'coat';
    if (lowerName.includes('hat') || lowerName.includes('帽子') || lowerName.includes('accessory') || lowerName.includes('饰品')) return 'accessory';
    return 'top';
}

// 筛选服装
function filterClothes(filter) {
    const closetGrid = document.getElementById('closetGrid');
    closetGrid.innerHTML = '';
    
    const filtered = filter === 'all' ? wardrobe : wardrobe.filter(item => item.category === filter);
    
    if (filtered.length === 0) {
        closetGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shirt"></i>
                <p>还没有服装，快来上传吧！</p>
            </div>
        `;
        return;
    }
    
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'closet-card';
        card.innerHTML = `
            <div class="closet-image" style="background-image: url(${item.image})"></div>
            <div class="closet-info">
                <p>${item.name}</p>
                <span class="closet-category">${getCategoryName(item.category)}</span>
            </div>
        `;
        closetGrid.appendChild(card);
    });
}

// 获取分类名称
function getCategoryName(category) {
    const names = {
        top: '上衣',
        pants: '裤子',
        dress: '裙子',
        coat: '外套',
        accessory: '饰品'
    };
    return names[category] || category;
}

// 渲染衣橱
function renderCloset() {
    const closetGrid = document.getElementById('closetGrid');
    
    if (wardrobe.length === 0) {
        closetGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shirt"></i>
                <p>还没有服装，快来上传吧！</p>
            </div>
        `;
        return;
    }
    
    closetGrid.innerHTML = '';
    wardrobe.forEach(item => {
        const card = document.createElement('div');
        card.className = 'closet-card';
        card.innerHTML = `
            <div class="closet-image" style="background-image: url(${item.image}); background-size: cover; background-position: center;"></div>
            <div class="closet-info">
                <p>${item.name}</p>
                <span class="closet-category">${getCategoryName(item.category)}</span>
            </div>
        `;
        closetGrid.appendChild(card);
    });
}

// 初始化穿搭工作室
function initDressup() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showCategoryItems(btn.dataset.category);
        });
    });

    // 保存搭配
    document.getElementById('saveOutfit').addEventListener('click', saveOutfit);
    
    // 分享搭配
    document.getElementById('shareOutfit').addEventListener('click', shareOutfit);
    
    // 清空搭配
    document.getElementById('clearOutfit').addEventListener('click', clearOutfit);
}

// 显示分类服装
function showCategoryItems(category) {
    const dressupItems = document.getElementById('dressupItems');
    const filtered = wardrobe.filter(item => item.category === category);
    
    if (filtered.length === 0) {
        dressupItems.innerHTML = '<div class="empty-items"><p>该分类暂无服装</p></div>';
        return;
    }
    
    dressupItems.innerHTML = '';
    filtered.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'dressup-item';
        itemEl.innerHTML = `
            <div class="item-image" style="background-image: url(${item.image}); background-size: cover; background-position: center;"></div>
            <p>${item.name}</p>
        `;
        itemEl.addEventListener('click', () => wearClothing(item));
        dressupItems.appendChild(itemEl);
    });
}

// 穿戴服装
function wearClothing(item) {
    const stageClothes = document.getElementById('stageClothes');
    const stagePants = document.getElementById('stagePants');
    
    switch(item.category) {
        case 'top':
        case 'coat':
            stageClothes.style.backgroundImage = `url(${item.image})`;
            stageClothes.style.backgroundSize = 'cover';
            stageClothes.style.backgroundPosition = 'center';
            break;
        case 'pants':
            stagePants.style.backgroundImage = `url(${item.image})`;
            stagePants.style.backgroundSize = 'cover';
            stagePants.style.backgroundPosition = 'center';
            break;
        case 'dress':
            stageClothes.style.backgroundImage = `url(${item.image})`;
            stageClothes.style.backgroundSize = 'cover';
            stageClothes.style.backgroundPosition = 'center';
            // 隐藏裤子
            stagePants.style.display = 'none';
            break;
    }
}

// 保存搭配
function saveOutfit() {
    const outfit = {
        id: Date.now(),
        name: `搭配 ${savedOutfits.length + 1}`,
        createdAt: new Date().toISOString(),
        clothes: {
            top: document.getElementById('stageClothes').style.backgroundImage,
            pants: document.getElementById('stagePants').style.backgroundImage
        },
        avatar: { ...currentAvatar }
    };
    
    savedOutfits.push(outfit);
    localStorage.setItem('outfits', JSON.stringify(savedOutfits));
    renderSavedOutfits();
    showNotification('搭配保存成功！');
}

// 分享搭配
function shareOutfit() {
    // 模拟分享功能
    showNotification('分享链接已复制到剪贴板！');
}

// 清空搭配
function clearOutfit() {
    const stageClothes = document.getElementById('stageClothes');
    const stagePants = document.getElementById('stagePants');
    
    stageClothes.style.backgroundImage = '';
    stageClothes.style.backgroundColor = '#E5E5E5';
    stagePants.style.backgroundImage = '';
    stagePants.style.backgroundColor = '#E5E5E5';
    stagePants.style.display = 'flex';
}

// 渲染保存的搭配
function renderSavedOutfits() {
    const outfitsGrid = document.getElementById('outfitsGrid');
    
    if (savedOutfits.length === 0) {
        outfitsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">还没有保存的搭配</p>';
        return;
    }
    
    outfitsGrid.innerHTML = '';
    savedOutfits.forEach(outfit => {
        const card = document.createElement('div');
        card.className = 'outfit-card';
        card.innerHTML = `
            <div class="outfit-preview">
                <div class="outfit-avatar">
                    <div class="outfit-head">
                        <div class="outfit-hair ${outfit.avatar.hair}"></div>
                    </div>
                    <div class="outfit-body">
                        <div class="outfit-clothes" style="${outfit.clothes.top || 'background: #E5E5E5'}"></div>
                    </div>
                </div>
            </div>
            <div class="outfit-info">
                <p>${outfit.name}</p>
            </div>
        `;
        outfitsGrid.appendChild(card);
    });
}

// 初始化社区
function initCommunity() {
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const icon = btn.querySelector('i');
            const count = btn.querySelector('span');
            
            if (icon.classList.contains('fas')) {
                icon.classList.remove('fas');
                icon.classList.add('far');
                count.textContent = parseInt(count.textContent) - 1;
            } else {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#FF6B9D';
                count.textContent = parseInt(count.textContent) + 1;
            }
        });
    });
}

// 初始化弹窗
function initModals() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeLogin = document.getElementById('closeLogin');
    const closeSignup = document.getElementById('closeSignup');
    const goToSignup = document.getElementById('goToSignup');
    const goToLogin = document.getElementById('goToLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    signupBtn.addEventListener('click', () => signupModal.classList.add('active'));
    closeLogin.addEventListener('click', () => loginModal.classList.remove('active'));
    closeSignup.addEventListener('click', () => signupModal.classList.remove('active'));
    goToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        signupModal.classList.add('active');
    });
    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.classList.remove('active');
        loginModal.classList.add('active');
    });
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // 模拟登录
        currentUser = { name: '测试用户' };
        loginModal.classList.remove('active');
        document.querySelector('.user-actions').innerHTML = '<span style="color: #FF6B9D; font-weight: 500;">欢迎，测试用户</span>';
        showNotification('登录成功！');
    });
    
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // 模拟注册
        currentUser = { name: '新用户' };
        signupModal.classList.remove('active');
        document.querySelector('.user-actions').innerHTML = '<span style="color: #FF6B9D; font-weight: 500;">欢迎，新用户</span>';
        showNotification('注册成功！');
    });
    
    // 点击弹窗外部关闭
    [loginModal, signupModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// 保存衣橱到本地存储
function saveWardrobe() {
    localStorage.setItem('wardrobe', JSON.stringify(wardrobe));
}

// 加载模拟数据
function loadMockData() {
    // 检查是否有保存的数据
    const savedWardrobe = localStorage.getItem('wardrobe');
    const savedAvatar = localStorage.getItem('avatar');
    const savedOutfitsData = localStorage.getItem('outfits');
    
    if (savedWardrobe) {
        wardrobe = JSON.parse(savedWardrobe);
    } else {
        // 添加模拟服装数据
        wardrobe = [
            { id: 1, name: '粉色T恤', category: 'top', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23C4A7A7" width="100" height="100" rx="8"/%3E%3Crect fill="%23D4B7B7" x="10" y="10" width="80" height="80" rx="6"/%3E%3C/svg%3E', uploadedAt: new Date().toISOString() },
            { id: 2, name: '牛仔裤', category: 'pants', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%236B7A8A" width="100" height="100" rx="8"/%3E%3Crect fill="%237B8A9A" x="10" y="10" width="80" height="80" rx="6"/%3E%3C/svg%3E', uploadedAt: new Date().toISOString() },
            { id: 3, name: '连衣裙', category: 'dress', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23A8A4B8" width="100" height="100" rx="8"/%3E%3Crect fill="%23B8B4C8" x="10" y="10" width="80" height="80" rx="6"/%3E%3C/svg%3E', uploadedAt: new Date().toISOString() },
            { id: 4, name: '外套', category: 'coat', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%238B9A7D" width="100" height="100" rx="8"/%3E%3Crect fill="%239BAA8D" x="10" y="10" width="80" height="80" rx="6"/%3E%3C/svg%3E', uploadedAt: new Date().toISOString() },
            { id: 5, name: '帽子', category: 'accessory', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23D4A574" width="100" height="100" rx="8"/%3E%3Crect fill="%23E4B584" x="10" y="10" width="80" height="80" rx="6"/%3E%3C/svg%3E', uploadedAt: new Date().toISOString() },
            { id: 6, name: '蓝色衬衫', category: 'top', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%239AB8A8" width="100" height="100" rx="8"/%3E%3Crect fill="%23AACA B8" x="10" y="10" width="80" height="80" rx="6"/%3E%3C/svg%3E', uploadedAt: new Date().toISOString() },
            { id: 7, name: '米色长裤', category: 'pants', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23D4CEC4" width="100" height="100" rx="8"/%3E%3Crect fill="%23E4DED4" x="10" y="10" width="80" height="80" rx="6"/%3E%3C/svg%3E', uploadedAt: new Date().toISOString() },
            { id: 8, name: '红色连衣裙', category: 'dress', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23C47A7A" width="100" height="100" rx="8"/%3E%3Crect fill="%23D48A8A" x="10" y="10" width="80" height="80" rx="6"/%3E%3C/svg%3E', uploadedAt: new Date().toISOString() },
        ];
        localStorage.setItem('wardrobe', JSON.stringify(wardrobe));
    }
    
    if (savedAvatar) {
        currentAvatar = JSON.parse(savedAvatar);
    }
    
    if (savedOutfitsData) {
        savedOutfits = JSON.parse(savedOutfitsData);
    }
    
    // 渲染页面
    renderCloset();
    renderSavedOutfits();
    updateAvatarPreview();
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #8B9A7D, #7A8D70);
        color: white;
        border-radius: 25px;
        box-shadow: 0 10px 40px rgba(139, 154, 125, 0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 添加衣橱卡片样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .closet-card {
        background: #FAF8F5;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #E8E0D5;
        transition: all 0.3s;
    }
    
    .closet-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(139, 154, 125, 0.12);
    }
    
    .closet-image {
        height: 120px;
        background: #F5F1EB;
        background-size: cover;
        background-position: center;
    }
    
    .closet-info {
        padding: 1rem;
    }
    
    .closet-info p {
        margin: 0;
        font-weight: 500;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #4A4540;
    }
    
    .closet-category {
        font-size: 0.7rem;
        color: #8B9A7D;
        background: #F5F1EB;
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
    }
    
    .dressup-item {
        background: #FAF8F5;
        border-radius: 14px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;
        border: 2px solid transparent;
    }
    
    .dressup-item:hover {
        border-color: #8B9A7D;
        transform: scale(1.05);
    }
    
    .item-image {
        height: 80px;
        background: #F5F1EB;
    }
    
    .dressup-item p {
        padding: 0.5rem;
        margin: 0;
        font-size: 0.8rem;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #4A4540;
    }
    
    .outfit-card {
        background: #FAF8F5;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #E8E0D5;
    }
    
    .outfit-preview {
        height: 150px;
        background: linear-gradient(180deg, #F5F1EB 0%, #FAF8F5 100%);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .outfit-avatar {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .outfit-head {
        width: 44px;
        height: 44px;
        position: relative;
    }
    
    .outfit-hair {
        width: 36px;
        height: 20px;
        position: absolute;
        top: -4px;
        left: 50%;
        transform: translateX(-50%);
        image-rendering: pixelated;
    }
    
    .outfit-hair.hair-1 {
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 20'%3E%3Crect fill='%23D4A574' width='36' height='20'/%3E%3Crect fill='%23C4956A' x='2' y='2' width='32' height='16'/%3E%3C/svg%3E");
    }
    
    .outfit-face {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 28px;
        height: 24px;
        background: #E8D4B8;
        border: 2px solid #5C4D43;
    }
    
    .outfit-body {
        margin-top: -2px;
    }
    
    .outfit-clothes {
        width: 36px;
        height: 30px;
        border: 2px solid #5C4D43;
        image-rendering: pixelated;
    }
    
    .outfit-info {
        padding: 1rem;
        text-align: center;
    }
    
    .outfit-info p {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 500;
        color: #4A4540;
    }
`;
document.head.appendChild(style);