// ToiletGo App - 找厕所应用

class ToiletGoApp {
    constructor() {
        this.currentLocation = null;
        this.toilets = [];
        this.filters = {
            type: 'all',
            hours: 'all',
            facilities: []
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.getLocation();
        this.generateMockData();
    }

    // 绑定事件
    bindEvents() {
        // 找厕所按钮
        document.getElementById('find-btn').addEventListener('click', () => {
            this.searchToilets();
        });

        // 筛选按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e.target);
            });
        });

        // 返回按钮
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showPage('home-page');
        });

        document.getElementById('detail-back-btn').addEventListener('click', () => {
            this.showPage('results-page');
        });
    }

    // 获取定位
    getLocation() {
        const locationSpan = document.getElementById('current-location');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    locationSpan.textContent = '定位成功';
                    setTimeout(() => {
                        locationSpan.textContent = '当前位置';
                    }, 2000);
                },
                (error) => {
                    console.error('定位失败:', error);
                    locationSpan.textContent = '定位失败，使用默认位置';
                    // 默认位置（北京天安门）
                    this.currentLocation = { lat: 39.9042, lng: 116.4074 };
                }
            );
        } else {
            locationSpan.textContent = '浏览器不支持定位';
            this.currentLocation = { lat: 39.9042, lng: 116.4074 };
        }
    }

    // 生成模拟数据
    generateMockData() {
        const mockToilets = [
            {
                id: 1,
                name: '朝阳公园公共卫生间',
                type: 'public',
                address: '北京市朝阳区朝阳公园南路1号',
                lat: 39.9342,
                lng: 116.4774,
                hours: '06:00-22:00',
                is24Hour: false,
                rating: 4.5,
                reviewCount: 128,
                facilities: ['accessible'],
                hasTissue: true,
                hasPad: false,
                photos: ['https://picsum.photos/400/300?random=1'],
                reviews: [
                    { user: '张先生', rating: 5, text: '很干净，设施齐全' },
                    { user: '李女士', rating: 4, text: '位置好找，就是人多时需要排队' }
                ]
            },
            {
                id: 2,
                name: '国贸商城卫生间',
                type: 'mall',
                address: '北京市朝阳区建国门外大街1号国贸商城B1层',
                lat: 39.9092,
                lng: 116.4374,
                hours: '10:00-22:00',
                is24Hour: false,
                rating: 4.8,
                reviewCount: 256,
                facilities: ['baby', 'accessible'],
                hasTissue: true,
                hasPad: true,
                photos: ['https://picsum.photos/400/300?random=2'],
                reviews: [
                    { user: '王小姐', rating: 5, text: '母婴室设施很完善' },
                    { user: '陈先生', rating: 5, text: '非常干净，商场卫生间里算顶级的' }
                ]
            },
            {
                id: 3,
                name: '地铁1号线建国门站卫生间',
                type: 'subway',
                address: '北京市东城区建国门内大街地铁1号线站台层',
                lat: 39.9042,
                lng: 116.4274,
                hours: '05:00-23:30',
                is24Hour: false,
                rating: 3.8,
                reviewCount: 89,
                facilities: ['accessible'],
                hasTissue: true,
                hasPad: false,
                photos: ['https://picsum.photos/400/300?random=3'],
                reviews: [
                    { user: '刘先生', rating: 4, text: '地铁站里算不错的' },
                    { user: '赵女士', rating: 3, text: '高峰期人很多' }
                ]
            },
            {
                id: 4,
                name: '24小时共享卫生间-三里屯店',
                type: 'shared',
                address: '北京市朝阳区三里屯太古里南区',
                lat: 39.9142,
                lng: 116.4474,
                hours: '24小时',
                is24Hour: true,
                rating: 4.2,
                reviewCount: 67,
                facilities: ['accessible'],
                hasTissue: true,
                hasPad: true,
                photos: ['https://picsum.photos/400/300?random=4'],
                reviews: [
                    { user: '孙先生', rating: 4, text: '深夜也能用，很方便' },
                    { user: '周女士', rating: 4, text: '扫码就能进，挺智能的' }
                ]
            },
            {
                id: 5,
                name: '王府井步行街公共卫生间',
                type: 'public',
                address: '北京市东城区王府井大街218号',
                lat: 39.9042,
                lng: 116.4074,
                hours: '06:00-23:00',
                is24Hour: false,
                rating: 4.0,
                reviewCount: 156,
                facilities: ['baby', 'accessible'],
                hasTissue: true,
                hasPad: true,
                photos: ['https://picsum.photos/400/300?random=5'],
                reviews: [
                    { user: '吴先生', rating: 4, text: '位置明显，游客很方便' },
                    { user: '郑女士', rating: 4, text: '有母婴室，带娃出行很贴心' }
                ]
            },
            {
                id: 6,
                name: '西单大悦城卫生间',
                type: 'mall',
                address: '北京市西城区西单北大街131号大悦城4层',
                lat: 39.9042,
                lng: 116.3774,
                hours: '10:00-22:00',
                is24Hour: false,
                rating: 4.6,
                reviewCount: 198,
                facilities: ['baby', 'accessible'],
                hasTissue: true,
                hasPad: true,
                photos: ['https://picsum.photos/400/300?random=6'],
                reviews: [
                    { user: '钱先生', rating: 5, text: '每层都有，很方便' },
                    { user: '冯女士', rating: 4, text: '装修很好，干净整洁' }
                ]
            },
            {
                id: 7,
                name: '24小时加油站卫生间',
                type: 'shared',
                address: '北京市朝阳区东三环中路39号中石化加油站',
                lat: 39.9242,
                lng: 116.4574,
                hours: '24小时',
                is24Hour: true,
                rating: 3.5,
                reviewCount: 45,
                facilities: [],
                hasTissue: false,
                hasPad: false,
                photos: ['https://picsum.photos/400/300?random=7'],
                reviews: [
                    { user: '何先生', rating: 3, text: '24小时开放很方便，但设施一般' }
                ]
            },
            {
                id: 8,
                name: '地铁2号线西直门站卫生间',
                type: 'subway',
                address: '北京市西城区西直门外大街地铁2号线',
                lat: 39.9342,
                lng: 116.3474,
                hours: '05:00-23:30',
                is24Hour: false,
                rating: 3.6,
                reviewCount: 76,
                facilities: ['accessible'],
                hasTissue: true,
                hasPad: false,
                photos: ['https://picsum.photos/400/300?random=8'],
                reviews: [
                    { user: '沈女士', rating: 4, text: '换乘站里算干净的' },
                    { user: '杨先生', rating: 3, text: '人太多了' }
                ]
            }
        ];

        this.toilets = mockToilets.map(toilet => ({
            ...toilet,
            distance: this.calculateDistance(toilet.lat, toilet.lng)
        })).sort((a, b) => a.distance - b.distance);
    }

    // 计算距离（简化版）
    calculateDistance(lat, lng) {
        if (!this.currentLocation) return 0;
        
        const R = 6371; // 地球半径 km
        const dLat = (lat - this.currentLocation.lat) * Math.PI / 180;
        const dLon = (lng - this.currentLocation.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.currentLocation.lat * Math.PI / 180) *
                  Math.cos(lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // 处理筛选点击
    handleFilterClick(btn) {
        const filterType = btn.dataset.filter;
        const filterValue = btn.dataset.value;

        if (filterType === 'facility') {
            // 设施筛选支持多选
            btn.classList.toggle('active');
            const activeFacilities = Array.from(document.querySelectorAll(`[data-filter="facility"].active`))
                .map(b => b.dataset.value);
            this.filters.facilities = activeFacilities;
        } else {
            // 其他筛选单选
            document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            this.filters[filterType] = filterValue;
        }
    }

    // 搜索厕所
    searchToilets() {
        let filtered = this.toilets.filter(toilet => {
            // 类型筛选
            if (this.filters.type !== 'all' && toilet.type !== this.filters.type) {
                return false;
            }
            
            // 时间筛选
            if (this.filters.hours === '24h' && !toilet.is24Hour) {
                return false;
            }
            
            // 设施筛选
            if (this.filters.facilities.length > 0) {
                const hasAllFacilities = this.filters.facilities.every(f => {
                    if (f === 'tissue') return toilet.hasTissue;
                    if (f === 'pad') return toilet.hasPad;
                    return toilet.facilities.includes(f);
                });
                if (!hasAllFacilities) return false;
            }
            
            return true;
        });

        this.renderResults(filtered);
        this.showPage('results-page');
    }

    // 渲染结果列表
    renderResults(toilets) {
        const resultsList = document.getElementById('results-list');
        const resultsCount = document.getElementById('results-count');
        
        resultsCount.textContent = `${toilets.length}个结果`;
        
        // 渲染活跃筛选标签
        this.renderActiveFilters();

        if (toilets.length === 0) {
            resultsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>未找到符合条件的厕所</p>
                    <p style="font-size: 12px; margin-top: 8px;">试试调整筛选条件</p>
                </div>
            `;
            return;
        }

        resultsList.innerHTML = toilets.map(toilet => this.renderToiletCard(toilet)).join('');

        // 绑定卡片事件
        toilets.forEach(toilet => {
            const card = document.querySelector(`[data-id="${toilet.id}"]`);
            if (card) {
                card.addEventListener('click', () => {
                    this.showDetail(toilet);
                });
            }

            // 导航按钮
            const navBtn = document.querySelector(`#nav-btn-${toilet.id}`);
            if (navBtn) {
                navBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.navigate(toilet);
                });
            }
        });
    }

    // 渲染活跃筛选标签
    renderActiveFilters() {
        const container = document.getElementById('active-filters');
        const tags = [];

        if (this.filters.type !== 'all') {
            const typeNames = { public: '公共', mall: '商场', subway: '地铁', shared: '共享' };
            tags.push({ type: 'type', value: this.filters.type, label: typeNames[this.filters.type] });
        }

        if (this.filters.hours === '24h') {
            tags.push({ type: 'hours', value: '24h', label: '24小时' });
        }

        this.filters.facilities.forEach(f => {
            const facilityNames = { baby: '母婴室', accessible: '无障碍', tissue: '卫生纸', pad: '卫生巾' };
            tags.push({ type: 'facility', value: f, label: facilityNames[f] });
        });

        container.innerHTML = tags.map(tag => `
            <span class="active-filter-tag">
                ${tag.label}
                <span class="remove" data-type="${tag.type}" data-value="${tag.value}">×</span>
            </span>
        `).join('');

        // 绑定移除事件
        container.querySelectorAll('.remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const value = e.target.dataset.value;
                
                if (type === 'facility') {
                    const facilityBtn = document.querySelector(`[data-filter="facility"][data-value="${value}"]`);
                    if (facilityBtn) facilityBtn.classList.remove('active');
                    this.filters.facilities = this.filters.facilities.filter(f => f !== value);
                } else if (type === 'type') {
                    document.querySelectorAll('[data-filter="type"]').forEach(b => b.classList.remove('active'));
                    document.querySelector('[data-filter="type"][data-value="all"]').classList.add('active');
                    this.filters.type = 'all';
                } else if (type === 'hours') {
                    document.querySelectorAll('[data-filter="hours"]').forEach(b => b.classList.remove('active'));
                    document.querySelector('[data-filter="hours"][data-value="all"]').classList.add('active');
                    this.filters.hours = 'all';
                }
                
                this.searchToilets();
            });
        });
    }

    // 渲染厕所卡片
    renderToiletCard(toilet) {
        const typeNames = { public: '公共', mall: '商场', subway: '地铁', shared: '共享' };
        const typeClass = `type-${toilet.type}`;
        
        const facilityNames = { baby: '母婴室', accessible: '无障碍' };
        const facilitiesHtml = toilet.facilities.map(f => 
            `<span class="facility-tag">${facilityNames[f]}</span>`
        ).join('');

        // 卫生纸/卫生巾状态标签
        const supplyTags = [];
        if (toilet.hasTissue) {
            supplyTags.push('<span class="supply-tag supply-tissue"><i class="fas fa-toilet-paper"></i> 卫生纸</span>');
        }
        if (toilet.hasPad) {
            supplyTags.push('<span class="supply-tag supply-pad"><i class="fas fa-heart"></i> 卫生巾</span>');
        }
        const supplyHtml = supplyTags.length > 0 ? `<div class="supply-tags">${supplyTags.join('')}</div>` : '';

        const stars = this.renderStars(toilet.rating);

        return `
            <div class="toilet-card" data-id="${toilet.id}">
                <div class="card-header">
                    <span class="toilet-name">${toilet.name}</span>
                    <span class="toilet-type ${typeClass}">${typeNames[toilet.type]}</span>
                </div>
                <div class="card-info">
                    <div class="info-row">
                        <i class="fas fa-location-dot"></i>
                        <span>${toilet.address}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-road"></i>
                        <span class="distance">${toilet.distance.toFixed(1)}km</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-clock"></i>
                        <span>${toilet.hours}</span>
                    </div>
                    <div class="info-row rating">
                        <i class="fas fa-star"></i>
                        <span>${stars} ${toilet.rating} (${toilet.reviewCount}条评价)</span>
                    </div>
                    ${facilitiesHtml ? `<div class="facilities">${facilitiesHtml}</div>` : ''}
                    ${supplyHtml}
                </div>
                <div class="card-actions">
                    <button class="action-btn btn-navigate" id="nav-btn-${toilet.id}">
                        <i class="fas fa-location-arrow"></i>
                        导航
                    </button>
                </div>
            </div>
        `;
    }

    // 渲染星级
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let html = '';
        
        for (let i = 0; i < fullStars; i++) {
            html += '<i class="fas fa-star"></i>';
        }
        if (hasHalf) {
            html += '<i class="fas fa-star-half-alt"></i>';
        }
        const empty = 5 - fullStars - (hasHalf ? 1 : 0);
        for (let i = 0; i < empty; i++) {
            html += '<i class="far fa-star"></i>';
        }
        
        return html;
    }

    // 显示详情
    showDetail(toilet) {
        const detailContent = document.getElementById('detail-content');
        const typeNames = { public: '公共厕所', mall: '商场卫生间', subway: '地铁站卫生间', shared: '共享卫生间' };
        
        const facilityNames = { baby: '母婴室', accessible: '无障碍设施' };
        const facilitiesHtml = toilet.facilities.map(f => 
            `<span class="facility-tag">${facilityNames[f]}</span>`
        ).join('');

        // 卫生纸/卫生巾供应状态
        const tissueStatus = toilet.hasTissue 
            ? '<span class="supply-tag supply-tissue"><i class="fas fa-toilet-paper"></i> 提供卫生纸</span>' 
            : '<span class="supply-tag supply-none"><i class="fas fa-toilet-paper"></i> 无卫生纸</span>';
        const padStatus = toilet.hasPad 
            ? '<span class="supply-tag supply-pad"><i class="fas fa-heart"></i> 提供卫生巾</span>' 
            : '<span class="supply-tag supply-none"><i class="fas fa-heart"></i> 无卫生巾</span>';
        const supplyDetailHtml = `<div class="supply-tags" style="margin-top: 12px;">${tissueStatus}${padStatus}</div>`;

        const reviewsHtml = toilet.reviews.map(r => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-user">${r.user}</span>
                    <span class="review-rating">${this.renderStars(r.rating)}</span>
                </div>
                <p class="review-text">${r.text}</p>
            </div>
        `).join('');

        detailContent.innerHTML = `
            <div class="detail-photos">
                ${toilet.photos.map(p => `<img src="${p}" class="detail-photo" alt="厕所实拍">`).join('')}
            </div>
            
            <div class="detail-section">
                <h3>${toilet.name}</h3>
                <div class="detail-info-grid">
                    <div class="detail-info-item">
                        <div class="label">类型</div>
                        <div class="value">${typeNames[toilet.type]}</div>
                    </div>
                    <div class="detail-info-item">
                        <div class="label">距离</div>
                        <div class="value">${toilet.distance.toFixed(1)}km</div>
                    </div>
                    <div class="detail-info-item">
                        <div class="label">开放时间</div>
                        <div class="value">${toilet.hours}</div>
                    </div>
                    <div class="detail-info-item">
                        <div class="label">评分</div>
                        <div class="value">${toilet.rating}分</div>
                    </div>
                </div>
                ${facilitiesHtml ? `<div class="facilities" style="margin-top: 12px;">${facilitiesHtml}</div>` : ''}
                ${supplyDetailHtml}
            </div>
            
            <div class="detail-section">
                <h3>地址</h3>
                <p style="font-size: 14px; color: #666; line-height: 1.6;">${toilet.address}</p>
            </div>
            
            <div class="detail-section">
                <h3>用户评价</h3>
                ${reviewsHtml}
            </div>
            
            <button class="detail-navigate-btn" id="detail-nav-btn">
                <i class="fas fa-location-arrow"></i>
                一键导航
            </button>
        `;

        // 绑定导航按钮
        document.getElementById('detail-nav-btn').addEventListener('click', () => {
            this.navigate(toilet);
        });

        this.showPage('detail-page');
    }

    // 导航功能
    navigate(toilet) {
        // 调用第三方地图导航
        const lat = toilet.lat;
        const lng = toilet.lng;
        const name = encodeURIComponent(toilet.name);
        const address = encodeURIComponent(toilet.address);

        // 检测平台并调用对应地图
        const ua = navigator.userAgent.toLowerCase();
        let url;

        if (/iphone|ipad|ipod/.test(ua)) {
            // iOS - 尝试高德地图，失败则苹果地图
            url = `iosamap://path?sourceApplication=ToiletGo&dlat=${lat}&dlon=${lng}&dname=${name}&dev=0&t=0`;
            // 备用：苹果地图
            const appleMapUrl = `http://maps.apple.com/?daddr=${lat},${lng}&q=${name}`;
            
            // 尝试打开高德，超时则跳转苹果地图
            const startTime = Date.now();
            window.location.href = url;
            
            setTimeout(() => {
                if (Date.now() - startTime < 1500) {
                    window.location.href = appleMapUrl;
                }
            }, 1000);
            return;
        } else if (/android/.test(ua)) {
            // Android - 高德地图
            url = `amapuri://route/plan/?dlat=${lat}&dlon=${lng}&dname=${name}&dev=0&t=0`;
            // 备用：浏览器打开高德网页版
            const webUrl = `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car&policy=1`;
            
            window.location.href = url;
            setTimeout(() => {
                window.open(webUrl, '_blank');
            }, 1000);
            return;
        }

        // 其他设备 - 使用网页版地图
        url = `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car&policy=1`;
        window.open(url, '_blank');
    }

    // 页面切换
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        window.scrollTo(0, 0);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ToiletGoApp();
});