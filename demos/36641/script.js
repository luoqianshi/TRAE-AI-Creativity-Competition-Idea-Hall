// 地球村·超级联盟 DEMO 交互脚本

// 当前角色
let currentRole = 'consumer';

// 角色名称映射
const roleNames = {
    'consumer': '消费者',
    'driver': '司机',
    'rider': '骑手',
    'merchant': '商家'
};

// 选择角色
function selectRole(role) {
    currentRole = role;
    
    // 隐藏角色选择器
    document.getElementById('roleSelector').classList.add('hidden');
    
    // 显示主应用
    document.getElementById('mainApp').classList.remove('hidden');
    
    // 更新角色显示
    document.getElementById('currentRoleDisplay').innerHTML = `<span class="role-badge">${roleNames[role]}</span>`;
    
    // 隐藏所有视图
    hideAllViews();
    
    // 显示对应角色的视图
    document.getElementById(role + 'View').classList.remove('hidden');
}

// 显示角色选择器
function showRoleSelector() {
    document.getElementById('roleSelector').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

// 隐藏所有视图
function hideAllViews() {
    document.getElementById('consumerView').classList.add('hidden');
    document.getElementById('driverView').classList.add('hidden');
    document.getElementById('riderView').classList.add('hidden');
    document.getElementById('merchantView').classList.add('hidden');
}

// ========== 消费者界面 Tab切换 ==========

function switchConsumerTab(tab) {
    // 更新导航状态
    const navItems = document.querySelectorAll('#consumerView .nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // 更新内容显示
    const tabs = document.querySelectorAll('#consumerView .tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
}

// ========== 司机界面 Tab切换 ==========

function switchDriverTab(tab) {
    // 更新导航状态
    const navItems = document.querySelectorAll('#driverView .nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // 更新内容显示
    const tabs = document.querySelectorAll('#driverView .tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById('driver' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Tab').classList.add('active');
}

// 司机接单状态切换
function toggleDriverStatus() {
    const toggle = event.currentTarget;
    const statusText = toggle.nextElementSibling;
    
    if (toggle.classList.contains('active')) {
        toggle.classList.remove('active');
        statusText.textContent = '休息中';
        statusText.style.color = '#ccc';
    } else {
        toggle.classList.add('active');
        statusText.textContent = '接单中';
        statusText.style.color = '#27ae60';
    }
}

// ========== 骑手界面 Tab切换 ==========

function switchRiderTab(tab) {
    // 更新导航状态
    const navItems = document.querySelectorAll('#riderView .nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // 更新内容显示
    const tabs = document.querySelectorAll('#riderView .tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById('rider' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Tab').classList.add('active');
}

// 骑手接单状态切换
function toggleRiderStatus() {
    const toggle = event.currentTarget;
    const statusText = toggle.nextElementSibling;
    
    if (toggle.classList.contains('active')) {
        toggle.classList.remove('active');
        statusText.textContent = '休息中';
        statusText.style.color = '#ccc';
    } else {
        toggle.classList.add('active');
        statusText.textContent = '接单中';
        statusText.style.color = '#27ae60';
    }
}

// ========== 商家界面 Tab切换 ==========

function switchMerchantTab(tab) {
    // 更新导航状态
    const navItems = document.querySelectorAll('#merchantView .nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // 更新内容显示
    const tabs = document.querySelectorAll('#merchantView .tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById('merchant' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Tab').classList.add('active');
}

// 商家营业状态切换
function toggleShopStatus() {
    const toggle = event.currentTarget;
    const statusText = toggle.nextElementSibling;
    
    if (toggle.classList.contains('active')) {
        toggle.classList.remove('active');
        statusText.textContent = '休息中';
        statusText.style.color = '#ccc';
    } else {
        toggle.classList.add('active');
        statusText.textContent = '营业中';
        statusText.style.color = '#27ae60';
    }
}

// ========== 打车功能 ==========

function callRide() {
    const destination = document.getElementById('destinationInput').value;
    
    if (!destination) {
        alert('请输入目的地');
        return;
    }
    
    alert(`正在为您叫车...\n目的地：${destination}\n预估费用：¥15-20\n\n提示：这是DEMO演示，实际功能将在正式版本中实现。`);
}

// ========== AI助手 ==========

function openAIAssistant() {
    document.getElementById('aiAssistantModal').classList.remove('hidden');
}

function closeAIAssistant() {
    document.getElementById('aiAssistantModal').classList.add('hidden');
}

function aiQuickAction(action) {
    const chatArea = document.querySelector('.ai-chat-area');
    
    let response = '';
    
    switch(action) {
        case 'route':
            response = '好的，请告诉我您的常走路线起点和终点，我来帮您添加。例如："从望京到中关村"';
            break;
        case 'order':
            response = '您今日已完成12单订单，总收益¥186.50。最近一单：望京SOHO → 中关村软件园，预估¥19.5';
            break;
        case 'points':
            response = '您当前有1,250积分，86贡献分，¥50代金券。积分可用于兑换优惠券，贡献分可抵扣会员费（最高50%）';
            break;
        case 'coupon':
            response = '为您推荐以下优惠券：\n1. 华为Mate60 Pro 满5000减200（需20000积分）\n2. 餐饮新店 满30减5（需500积分）\n是否兑换？';
            break;
    }
    
    // 添加用户消息
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message';
    userMsg.innerHTML = `<span class="ai-avatar" style="font-size:20px;">👤</span><span class="ai-text">${getActionText(action)}</span>`;
    chatArea.appendChild(userMsg);
    
    // 添加AI回复
    const aiMsg = document.createElement('div');
    aiMsg.className = 'ai-message';
    aiMsg.innerHTML = `<span class="ai-avatar">🤖</span><span class="ai-text">${response}</span>`;
    chatArea.appendChild(aiMsg);
    
    // 滚动到底部
    chatArea.scrollTop = chatArea.scrollHeight;
}

function getActionText(action) {
    switch(action) {
        case 'route': return '添加常走路线';
        case 'order': return '查询今日订单';
        case 'points': return '查询积分';
        case 'coupon': return '领取优惠券';
        default: return action;
    }
}

// ========== 优惠券兑换 ==========

document.querySelectorAll('.exchange-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.product-card');
        const productName = card.querySelector('.product-name').textContent;
        const pointsNeeded = card.querySelector('.coupon-points').textContent.match(/\d+/)[0];
        
        alert(`兑换优惠券：${productName}\n所需积分：${pointsNeeded}\n\n提示：这是DEMO演示，实际兑换功能将在正式版本中实现。`);
    });
});

// ========== 餐厅点击 ==========

document.querySelectorAll('.restaurant-card').forEach(card => {
    card.addEventListener('click', function() {
        const name = this.querySelector('.restaurant-name').textContent;
        alert(`进入餐厅：${name}\n\n提示：这是DEMO演示，实际点餐功能将在正式版本中实现。`);
    });
});

// ========== 订单操作 ==========

document.querySelectorAll('.accept-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.order-card, .delivery-card');
        const orderId = card.querySelector('.order-id, .delivery-id').textContent;
        
        alert(`已接受订单：${orderId}\n\n提示：这是DEMO演示，实际接单功能将在正式版本中实现。`);
    });
});

document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.order-card, .delivery-card');
        card.style.display = 'none';
        alert('订单已拒绝');
    });
});

// ========== 菜单项点击 ==========

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        const text = this.querySelector('.menu-text').textContent;
        alert(`进入：${text}\n\n提示：这是DEMO演示，实际功能将在正式版本中实现。`);
    });
});

// ========== 筛选标签切换 ==========

document.querySelectorAll('.filter-tag, .category-tag, .cat-tag').forEach(tag => {
    tag.addEventListener('click', function() {
        const parent = this.parentElement;
        parent.querySelectorAll('.filter-tag, .category-tag, .cat-tag').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

// ========== 车型选择 ==========

document.querySelectorAll('.ride-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.ride-option').forEach(o => o.classList.remove('active'));
        this.classList.add('active');
    });
});

// ========== AI输入发送 ==========

document.querySelector('.ai-send-btn').addEventListener('click', function() {
    const input = document.querySelector('.ai-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    const chatArea = document.querySelector('.ai-chat-area');
    
    // 添加用户消息
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message';
    userMsg.innerHTML = `<span class="ai-avatar" style="font-size:20px;">👤</span><span class="ai-text">${text}</span>`;
    chatArea.appendChild(userMsg);
    
    // 添加AI回复
    const aiMsg = document.createElement('div');
    aiMsg.className = 'ai-message';
    aiMsg.innerHTML = `<span class="ai-avatar">🤖</span><span class="ai-text">收到您的消息："${text}"。这是DEMO演示，AI助手将在正式版本中提供完整的智能服务。</span>`;
    chatArea.appendChild(aiMsg);
    
    // 清空输入
    input.value = '';
    
    // 滚动到底部
    chatArea.scrollTop = chatArea.scrollHeight;
});

// ========== 语音按钮 ==========

document.querySelector('.ai-voice-btn').addEventListener('click', function() {
    alert('语音唤醒："你好，村长"\n\n提示：这是DEMO演示，语音功能将在正式版本中实现。');
});

// ========== 初始化 ==========

console.log('🌍 地球村·超级联盟 DEMO 已加载');
console.log('提示：这是产品原型演示，实际功能将在正式版本中实现。');