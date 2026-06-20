// ==================== DATA ====================
const workOrders = [
  { id: 1, user: '张先生', avatar: '👨', time: '10分钟前', location: '西湖区文三路', desc: '路灯不亮了，晚上出行很不方便，希望尽快维修。', images: ['🌆','💡','🚧'], category: 'public', status: 'pending', statusText: '待处理', likes: 12, comments: 5 },
  { id: 2, user: '李女士', avatar: '👩', time: '25分钟前', location: '拱墅区湖墅南路', desc: '小区门口垃圾堆积，气味难闻，影响居民生活。', images: ['🗑️','🏘️','😷'], category: 'city', status: 'processing', statusText: '处理中', likes: 8, comments: 3 },
  { id: 3, user: '王大爷', avatar: '👴', time: '1小时前', location: '上城区解放路', desc: '人行道地砖破损，老人走路容易绊倒，存在安全隐患。', images: ['🚧','👣','⚠️'], category: 'public', status: 'done', statusText: '已办结', likes: 23, comments: 7 },
  { id: 4, user: '赵女士', avatar: '👩', time: '2小时前', location: '滨江区江南大道', desc: '小区绿化带被车辆碾压，草坪破坏严重。', images: ['🌿','🚗','🏠'], category: 'city', status: 'pending', statusText: '待处理', likes: 6, comments: 2 },
  { id: 5, user: '陈先生', avatar: '👨', time: '3小时前', location: '萧山区市心路', desc: '楼上邻居半夜噪音扰民，多次沟通无果。', images: ['🔊','🌙','🏢'], category: 'neighbor', status: 'processing', statusText: '处理中', likes: 15, comments: 9 },
  { id: 6, user: '刘女士', avatar: '👩', time: '4小时前', location: '余杭区五常大道', desc: '消防通道被杂物堵塞，存在严重安全隐患。', images: ['🚒','📦','⚠️'], category: 'public', status: 'pending', statusText: '待处理', likes: 31, comments: 12 },
  { id: 7, user: '孙先生', avatar: '👨', time: '5小时前', location: '临平区东湖路', desc: '路面大面积积水，雨天出行困难。', images: ['💧','🌧️','🚗'], category: 'city', status: 'processing', statusText: '处理中', likes: 9, comments: 4 },
  { id: 8, user: '周阿姨', avatar: '👵', time: '6小时前', location: '钱塘区下沙路', desc: '广场舞噪音过大，影响周边居民休息。', images: ['🎵','👯','🏠'], category: 'neighbor', status: 'done', statusText: '已办结', likes: 18, comments: 6 },
  { id: 9, user: '吴先生', avatar: '👨', time: '8小时前', location: '西湖区曙光路', desc: '井盖破损，有小孩差点掉下去，非常危险！', images: ['⚠️','🕳️','👶'], category: 'public', status: 'done', statusText: '已办结', likes: 45, comments: 15 },
  { id: 10, user: '郑女士', avatar: '👩', time: '昨天', location: '拱墅区莫干山路', desc: '共享单车乱停放，占用盲道。', images: ['🚲','🚶','🚧'], category: 'city', status: 'pending', statusText: '待处理', likes: 7, comments: 3 },
  { id: 11, user: '钱先生', avatar: '👨', time: '昨天', location: '上城区庆春路', desc: '小区电梯故障，高层居民出行困难。', images: ['🛗','🏢','😤'], category: 'public', status: 'processing', statusText: '处理中', likes: 20, comments: 8 },
  { id: 12, user: '冯阿姨', avatar: '👵', time: '昨天', location: '滨江区长河路', desc: '流浪狗成群，担心咬到小孩。', images: ['🐕','👶','🏘️'], category: 'neighbor', status: 'pending', statusText: '待处理', likes: 14, comments: 5 },
  { id: 13, user: '沈先生', avatar: '👨', time: '2天前', location: '萧山区金城路', desc: '绿化带树木枯萎，需要补种。', images: ['🌳','🍂','🌱'], category: 'city', status: 'done', statusText: '已办结', likes: 5, comments: 1 },
  { id: 14, user: '韩女士', avatar: '👩', time: '2天前', location: '余杭区未来科技城', desc: '工地扬尘严重，窗户都不敢开。', images: ['🏗️','💨','🏠'], category: 'city', status: 'processing', statusText: '处理中', likes: 11, comments: 4 },
  { id: 15, user: '杨先生', avatar: '👨', time: '2天前', location: '临平区南苑街', desc: '公共座椅损坏，老人没地方休息。', images: ['🪑','👴','🛠️'], category: 'public', status: 'pending', statusText: '待处理', likes: 8, comments: 2 },
  { id: 16, user: '朱女士', avatar: '👩', time: '3天前', location: '钱塘区白杨街道', desc: '社区图书馆书籍老旧，需要更新。', images: ['📚','🏛️','📖'], category: 'volunteer', status: 'done', statusText: '已办结', likes: 16, comments: 6 },
  { id: 17, user: '秦先生', avatar: '👨', time: '3天前', location: '西湖区灵隐路', desc: '景区公厕卫生状况差，影响游客体验。', images: ['🚻','😷','🧹'], category: 'city', status: 'processing', statusText: '处理中', likes: 22, comments: 7 },
  { id: 18, user: '尤女士', avatar: '👩', time: '3天前', location: '拱墅区大关路', desc: '邻里宠物纠纷，狗吠声影响休息。', images: ['🐕','😴','🏠'], category: 'neighbor', status: 'pending', statusText: '待处理', likes: 13, comments: 5 },
  { id: 19, user: '许先生', avatar: '👨', time: '4天前', location: '上城区望江路', desc: '公交站牌倾斜，有倒塌风险。', images: ['🚌','⚠️','🚧'], category: 'public', status: 'done', statusText: '已办结', likes: 19, comments: 4 },
  { id: 20, user: '何女士', avatar: '👩', time: '4天前', location: '滨江区西兴路', desc: '河道漂浮垃圾，影响环境美观。', images: ['🌊','🗑️','🌿'], category: 'city', status: 'processing', statusText: '处理中', likes: 10, comments: 3 }
];

const volunteerOrders = [
  { id: 101, desc: '帮助独居老人维修水管', address: '西湖区文新街道', distance: '0.8km', reward: '¥ 80', type: 'paid', deadline: '2026-06-12', status: 'open' },
  { id: 102, desc: '社区环境清扫志愿服务', address: '拱墅区米市巷', distance: '1.2km', reward: '50积分', type: 'free', deadline: '2026-06-11', status: 'open' },
  { id: 103, desc: '协助调解邻里纠纷', address: '上城区小营街道', distance: '2.5km', reward: '¥ 120', type: 'paid', deadline: '2026-06-13', status: 'open' },
  { id: 104, desc: '为残障人士提供出行帮助', address: '滨江区长河街道', distance: '3.1km', reward: '80积分', type: 'free', deadline: '2026-06-14', status: 'open' },
  { id: 105, desc: '社区图书整理分类', address: '萧山区城厢街道', distance: '4.0km', reward: '30积分', type: 'free', deadline: '2026-06-10', status: 'open' },
  { id: 106, desc: '老旧小区电路检修', address: '余杭区仓前街道', distance: '5.2km', reward: '¥ 200', type: 'paid', deadline: '2026-06-15', status: 'open' },
  { id: 107, desc: '义务植树活动', address: '临平区东湖街道', distance: '6.8km', reward: '100积分', type: 'free', deadline: '2026-06-16', status: 'open' },
  { id: 108, desc: '帮助搬运重物', address: '钱塘区白杨街道', distance: '7.5km', reward: '¥ 60', type: 'paid', deadline: '2026-06-11', status: 'open' },
  { id: 109, desc: '陪伴空巢老人聊天', address: '西湖区西溪街道', distance: '1.5km', reward: '40积分', type: 'free', deadline: '2026-06-12', status: 'open' },
  { id: 110, desc: '社区安全巡逻', address: '拱墅区朝晖街道', distance: '2.0km', reward: '60积分', type: 'free', deadline: '2026-06-13', status: 'open' }
];

const messages = [
  { title: `工单状态更新`, content: `您上报的"路灯不亮"问题已派单给维修人员`, time: `10分钟前` },
  { title: `处理完成`, content: `您上报的"井盖破损"问题已处理完毕`, time: `2小时前` },
  { title: `系统通知`, content: `恭喜您获得"热心市民"勋章`, time: `昨天` },
  { title: '评价提醒', content: '您有2个已办结工单待评价', time: '昨天' },
  { title: '活动邀请', content: '社区志愿服务活动招募中，欢迎报名', time: '2天前' },
  { title: '积分到账', content: '您因积极参与治理获得50积分奖励', time: '3天前' },
  { title: '工单提醒', content: '您上报的问题即将超时，请耐心等待', time: '3天前' },
  { title: '安全提示', content: '夏季用电高峰期，请注意消防安全', time: '4天前' },
  { title: '政策宣传', content: '新修订的《物业管理条例》已实施', time: '5天前' },
  { title: '满意度调查', content: '请对上次服务进行评价，帮助我们改进', time: '1周前' }
];

const walletRecords = [
  { title: '完成工单 #1023', amount: '+¥ 80', time: '2026-06-09', type: 'income' },
  { title: '完成工单 #1018', amount: '+¥ 120', time: '2026-06-08', type: 'income' },
  { title: '积分兑换', amount: '-¥ 50', time: '2026-06-07', type: 'expense' },
  { title: '完成工单 #1015', amount: '+¥ 200', time: '2026-06-06', type: 'income' },
  { title: '提现到银行卡', amount: '-¥ 500', time: '2026-06-05', type: 'expense' },
  { title: '完成工单 #1012', amount: '+¥ 60', time: '2026-06-04', type: 'income' }
];

const govPendingOrders = [
  { id: 'WO-2026-0610-001', title: '路灯不亮', location: '西湖区文三路', time: '10分钟前', status: 'pending' },
  { id: 'WO-2026-0610-002', title: '垃圾堆积', location: '拱墅区湖墅南路', time: '25分钟前', status: 'pending' },
  { id: 'WO-2026-0610-003', title: '绿化带损坏', location: '滨江区江南大道', time: '2小时前', status: 'pending' },
  { id: 'WO-2026-0610-004', title: '消防通道堵塞', location: '余杭区五常大道', time: '4小时前', status: 'pending' },
  { id: 'WO-2026-0610-005', title: '噪音扰民', location: '萧山区市心路', time: '5小时前', status: 'processing' },
  { id: 'WO-2026-0610-006', title: '道路积水', location: '临平区东湖路', time: '6小时前', status: 'processing' },
  { id: 'WO-2026-0610-007', title: '共享单车乱停', location: '拱墅区莫干山路', time: '昨天', status: 'pending' },
  { id: 'WO-2026-0610-008', title: '电梯故障', location: '上城区庆春路', time: '昨天', status: 'processing' },
  { id: 'WO-2026-0610-009', title: '流浪狗问题', location: '滨江区长河路', time: '昨天', status: 'pending' },
  { id: 'WO-2026-0610-010', title: '工地扬尘', location: '余杭区未来科技城', time: '2天前', status: 'processing' }
];

const pendingVolunteers = [
  { name: '张三', phone: '138****1234', skills: ['水电维修','管道疏通'], time: '2026-06-10' },
  { name: '李四', phone: '139****5678', skills: ['调解服务'], time: '2026-06-09' },
  { name: '王五', phone: '137****9012', skills: ['机械作业','清扫保洁'], time: '2026-06-09' },
  { name: '赵六', phone: '136****3456', skills: ['水电维修'], time: '2026-06-08' },
  { name: '孙七', phone: '135****7890', skills: ['调解服务','清扫保洁'], time: '2026-06-08' }
];

const volunteerList = [
  { name: '志愿达人', credit: 95, orders: 156, rating: 4.9 },
  { name: '热心市民', credit: 88, orders: 89, rating: 4.7 },
  { name: '社区卫士', credit: 92, orders: 134, rating: 4.8 },
  { name: '爱心使者', credit: 85, orders: 67, rating: 4.6 },
  { name: '治理先锋', credit: 98, orders: 201, rating: 5.0 }
];

const performanceData = [
  { name: '张网格', completed: 45, avgTime: '2.3天', satisfaction: '98%' },
  { name: '李网格', completed: 38, avgTime: '2.8天', satisfaction: '95%' },
  { name: '王网格', completed: 52, avgTime: '1.9天', satisfaction: '99%' },
  { name: '赵网格', completed: 41, avgTime: '2.5天', satisfaction: '96%' },
  { name: '陈网格', completed: 35, avgTime: '3.1天', satisfaction: '93%' }
];

// ==================== UTILS ====================
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

function switchRole(role) {
  document.getElementById('role-switcher').style.display = 'none';
  document.getElementById('role-badge').style.display = 'flex';
  document.getElementById('citizen-app').classList.add('hidden');
  document.getElementById('volunteer-app').classList.add('hidden');
  document.getElementById('gov-app').classList.add('hidden');

  const dot = document.getElementById('role-dot');
  const label = document.getElementById('role-label');

  if (role === 'citizen') {
    document.getElementById('citizen-app').classList.remove('hidden');
    dot.className = 'dot dot-citizen';
    label.textContent = '市民端';
    renderWorkOrderFeed();
  } else if (role === 'volunteer') {
    document.getElementById('volunteer-app').classList.remove('hidden');
    dot.className = 'dot dot-volunteer';
    label.textContent = '志愿者端';
    renderVolunteerOrders();
  } else if (role === 'gov') {
    document.getElementById('gov-app').classList.remove('hidden');
    dot.className = 'dot dot-gov';
    label.textContent = '政府端';
    renderGovDashboard();
  }
}

function toggleRoleSwitcher() {
  const rs = document.getElementById('role-switcher');
  rs.style.display = rs.style.display === 'none' ? 'flex' : 'none';
}

// ==================== CITIZEN ====================
function goCitizenScreen(screenId) {
  document.querySelectorAll('#citizen-app .screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  if (screenId === 'citizen-home') renderWorkOrderFeed();
  if (screenId === 'citizen-orders') renderMyOrders();
  if (screenId === 'citizen-messages') renderMessages();
  if (screenId === 'citizen-posts') renderMyPosts();
}

function renderWorkOrderFeed(filter = 'all') {
  const feed = document.getElementById('workorder-feed');
  let html = '';
  workOrders.forEach(order => {
    if (filter !== 'all' && order.category !== filter) return;
    const statusColor = order.status === 'done' ? 'tag-success' : order.status === 'processing' ? 'tag-warning' : 'tag-danger';
    html += `
      <div class="card fade-in" style="cursor:pointer;" onclick="showOrderDetail(${order.id})">
        <div style="display:flex;align-items:center;margin-bottom:10px;">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;margin-right:10px;">${order.avatar}</div>
          <div style="flex:1;"><div style="font-weight:600;font-size:14px;">${order.user}</div><div style="font-size:11px;color:var(--muted);">${order.time} · ${order.location}</div></div>
          <span class="tag ${statusColor}">${order.statusText}</span>
        </div>
        <div style="font-size:14px;margin-bottom:10px;line-height:1.5;">${order.desc}</div>
        <div style="display:flex;gap:6px;margin-bottom:10px;">
          ${order.images.map(img => `<div style="width:80px;height:80px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:28px;">${img}</div>`).join('')}
        </div>
        <div style="display:flex;gap:16px;font-size:13px;color:var(--muted);">
          <span onclick="event.stopPropagation();likeOrder(this)">❤️ ${order.likes}</span>
          <span>💬 ${order.comments}</span>
          <span onclick="event.stopPropagation();showToast('举报成功')">🚩 举报</span>
        </div>
      </div>
    `;
  });
  feed.innerHTML = html;
}

function filterCategory(cat) {
  renderWorkOrderFeed(cat);
}

function likeOrder(el) {
  const match = el.textContent.match(/\d+/);
  const num = match ? parseInt(match[0]) + 1 : 1;
  el.textContent = `❤️ ${num}`;
}

function showOrderDetail(id) {
  const order = workOrders.find(o => o.id === id);
  if (!order) return;
  const content = document.getElementById('order-detail-content');
  const statusColor = order.status === 'done' ? 'tag-success' : order.status === 'processing' ? 'tag-warning' : 'tag-danger';
  const steps = ['已上报','已接单','处理中','已核验','已办结'];
  const stepIndex = order.status === 'pending' ? 0 : order.status === 'processing' ? 2 : 4;

  content.innerHTML = `
    <div style="padding:16px;">
      <div style="display:flex;align-items:center;margin-bottom:16px;">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;margin-right:12px;">${order.avatar}</div>
        <div><div style="font-weight:600;font-size:16px;">${order.user}</div><div style="font-size:12px;color:var(--muted);">${order.time} · ${order.location}</div></div>
        <span class="tag ${statusColor}" style="margin-left:auto;">${order.statusText}</span>
      </div>
      <div style="font-size:15px;line-height:1.6;margin-bottom:16px;">${order.desc}</div>
      <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
        ${order.images.map(img => `<div style="width:100px;height:100px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:36px;">${img}</div>`).join('')}
      </div>
      <div style="margin-bottom:20px;">
        <div style="font-weight:600;margin-bottom:12px;">处理进度</div>
        <div class="progress-bar">
          ${steps.map((s, i) => `<div class="progress-step ${i < stepIndex ? 'done' : i === stepIndex ? 'active' : ''}">${s}</div>`).join('')}
        </div>
      </div>
      <div style="margin-bottom:20px;">
        <div style="font-weight:600;margin-bottom:12px;">处理记录</div>
        <div style="background:var(--bg);border-radius:8px;padding:12px;font-size:13px;">
          <div style="margin-bottom:8px;">📝 网格员接单 - 2026-06-10 09:30</div>
          <div style="margin-bottom:8px;">🤝 志愿者接单 - 2026-06-10 10:15</div>
          <div style="margin-bottom:8px;">📷 整改照片已上传 - 2026-06-10 14:20</div>
          <div>✅ 核验通过 - 2026-06-10 16:00</div>
        </div>
      </div>
      <div style="margin-bottom:20px;">
        <div style="font-weight:600;margin-bottom:12px;">评论区</div>
        <div style="background:var(--bg);border-radius:8px;padding:12px;">
          <div style="display:flex;gap:8px;margin-bottom:10px;"><div style="width:28px;height:28px;border-radius:50%;background:var(--secondary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;">A</div><div style="flex:1;font-size:13px;"><div style="font-weight:600;">热心网友</div><div style="color:var(--muted);font-size:11px;">5分钟前</div><div style="margin-top:4px;">这个问题我也遇到过，支持尽快处理！</div></div></div>
          <div style="display:flex;gap:8px;margin-bottom:10px;"><div style="width:28px;height:28px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;">B</div><div style="flex:1;font-size:13px;"><div style="font-weight:600;">附近居民</div><div style="color:var(--muted);font-size:11px;">20分钟前</div><div style="margin-top:4px;">已经反映好几次了，希望这次能解决。</div></div></div>
          <div style="display:flex;gap:8px;"><div style="width:28px;height:28px;border-radius:50%;background:var(--success);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;">C</div><div style="flex:1;font-size:13px;"><div style="font-weight:600;">社区志愿者</div><div style="color:var(--muted);font-size:11px;">1小时前</div><div style="margin-top:4px;">我已接单，预计今天处理完毕。</div></div></div>
        </div>
      </div>
      <div style="display:flex;gap:12px;">
        <button class="btn" style="flex:1;background:var(--bg);color:var(--ink);" onclick="likeOrder(this)">❤️ ${order.likes}</button>
        <button class="btn" style="flex:1;background:var(--bg);color:var(--ink);" onclick="showToast('举报成功')">🚩 举报</button>
        ${order.status === 'done' ? `<button class="btn btn-primary" style="flex:1;" onclick="showToast('⭐⭐⭐⭐⭐ 评价成功')">评价</button>` : ''}
      </div>
    </div>
  `;
  goCitizenScreen('citizen-order-detail');
}

function setPostPrivacy(type) {
  document.getElementById('post-public').style.background = type === 'public' ? 'var(--primary)' : 'var(--bg)';
  document.getElementById('post-public').style.color = type === 'public' ? '#fff' : 'var(--muted)';
  document.getElementById('post-private').style.background = type === 'private' ? 'var(--primary)' : 'var(--bg)';
  document.getElementById('post-private').style.color = type === 'private' ? '#fff' : 'var(--muted)';
}

function toggleTag(el) {
  if (el.classList.contains('tag-primary')) {
    el.classList.remove('tag-primary');
    el.classList.add('tag-muted');
  } else {
    el.classList.remove('tag-muted');
    el.classList.add('tag-primary');
  }
  checkAI();
}

function addMockImage() {
  const container = document.getElementById('post-images');
  const imgs = ['🌆','🏞️','🌇','🏙️','🌳'];
  const img = imgs[Math.floor(Math.random() * imgs.length)];
  const div = document.createElement('div');
  div.style.cssText = 'width:80px;height:80px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:36px;';
  div.textContent = img;
  container.insertBefore(div, container.lastElementChild);
  checkAI();
}

function checkAI() {
  const desc = document.getElementById('post-desc').value;
  if (desc.length > 5) {
    document.getElementById('ai-check').style.display = 'block';
  }
}

document.getElementById('post-desc').addEventListener('input', checkAI);

function submitPost() {
  showToast('提交成功，工单已生成');
  setTimeout(() => goCitizenScreen('citizen-home'), 1500);
}

function renderMyOrders() {
  const list = document.getElementById('my-orders-list');
  let html = '';
  workOrders.slice(0, 10).forEach(order => {
    const statusColor = order.status === 'done' ? 'tag-success' : order.status === 'processing' ? 'tag-warning' : 'tag-danger';
    html += `
      <div class="list-item" onclick="showOrderDetail(${order.id})">
        <div class="content">
          <div class="title">${order.desc.substring(0, 20)}...</div>
          <div class="meta">${order.time} · ${order.location}</div>
        </div>
        <span class="tag ${statusColor}">${order.statusText}</span>
      </div>
    `;
  });
  list.innerHTML = html;
}

function renderMessages() {
  const list = document.getElementById('messages-list');
  let html = '';
  messages.forEach(msg => {
    html += `
      <div class="list-item">
        <div class="avatar" style="background:var(--secondary);">📢</div>
        <div class="content">
          <div class="title">${msg.title}</div>
          <div class="desc">${msg.content}</div>
          <div class="meta">${msg.time}</div>
        </div>
      </div>
    `;
  });
  list.innerHTML = html;
}

function renderMyPosts() {
  const list = document.getElementById('my-posts-list');
  let html = '';
  workOrders.slice(0, 5).forEach(order => {
    const statusColor = order.status === 'done' ? 'tag-success' : order.status === 'processing' ? 'tag-warning' : 'tag-danger';
    html += `
      <div class="card" onclick="showOrderDetail(${order.id})">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:13px;color:var(--muted);">${order.time}</span>
          <span class="tag ${statusColor}">${order.statusText}</span>
        </div>
        <div style="font-size:14px;">${order.desc}</div>
      </div>
    `;
  });
  list.innerHTML = html;
}

function addMockCert(el) {
  el.innerHTML = '📄';
  el.style.fontSize = '36px';
}

// ==================== VOLUNTEER ====================
function goVolunteerScreen(screenId) {
  document.querySelectorAll('#volunteer-app .screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  if (screenId === 'volunteer-home') renderVolunteerOrders();
  if (screenId === 'volunteer-tasks') renderMyTasks();
  if (screenId === 'volunteer-wallet') renderWallet();
}

function renderVolunteerOrders() {
  const container = document.getElementById('volunteer-orders');
  let html = '';
  volunteerOrders.forEach(order => {
    const typeTag = order.type === 'paid' ? '<span class="tag tag-primary">有偿</span>' : '<span class="tag tag-success">公益</span>';
    html += `
      <div class="card fade-in">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <div style="font-weight:600;font-size:15px;flex:1;">${order.desc}</div>
          ${typeTag}
        </div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:8px;">📍 ${order.address} · ${order.distance}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div><span style="font-size:18px;font-weight:700;color:var(--primary);">${order.reward}</span> <span style="font-size:12px;color:var(--muted);">截止: ${order.deadline}</span></div>
          <button class="btn btn-primary btn-sm" id="grab-btn-${order.id}" onclick="grabOrder(${order.id})">抢单</button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function grabOrder(id) {
  const btn = document.getElementById(`grab-btn-${id}`);
  btn.textContent = '已接单';
  btn.disabled = true;
  btn.style.background = 'var(--success)';
  showToast('抢单成功，请尽快处理');
}

function renderMyTasks() {
  const list = document.getElementById('my-tasks-list');
  let html = '';
  volunteerOrders.slice(0, 5).forEach(order => {
    html += `
      <div class="card" onclick="showVolunteerTaskDetail(${order.id})">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-weight:600;">${order.desc}</span>
          <span class="tag tag-warning">处理中</span>
        </div>
        <div style="font-size:13px;color:var(--muted);">📍 ${order.address}</div>
      </div>
    `;
  });
  list.innerHTML = html;
}

function showVolunteerTaskDetail(id) {
  const order = volunteerOrders.find(o => o.id === id);
  if (!order) return;
  const content = document.getElementById('volunteer-task-content');
  content.innerHTML = `
    <div style="padding:16px;">
      <div style="font-weight:600;font-size:16px;margin-bottom:16px;">${order.desc}</div>
      <div style="background:var(--bg);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="margin-bottom:8px;">📍 地址: ${order.address}</div>
        <div style="margin-bottom:8px;">📞 联系人: 王先生 138****1234</div>
        <div>⏰ 截止时间: ${order.deadline}</div>
      </div>
      <button class="btn btn-primary btn-block" style="margin-bottom:12px;" onclick="showToast('正在打开导航')">🧭 导航前往</button>
      <div style="margin-bottom:16px;">
        <div class="form-label">📷 上传整改照片</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <div style="width:80px;height:80px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer;border:2px dashed var(--rule);" onclick="this.innerHTML='✅';this.style.fontSize='36px';">+</div>
        </div>
      </div>
      <button class="btn btn-success btn-block" onclick="showToast('已提交验收，等待网格员核验')">提交验收</button>
    </div>
  `;
  goVolunteerScreen('volunteer-task-detail');
}

function renderWallet() {
  const list = document.getElementById('wallet-records');
  let html = '';
  walletRecords.forEach(rec => {
    const color = rec.type === 'income' ? 'var(--success)' : 'var(--danger)';
    html += `
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--rule);">
        <div><div style="font-size:14px;">${rec.title}</div><div style="font-size:12px;color:var(--muted);">${rec.time}</div></div>
        <div style="font-weight:600;color:${color};">${rec.amount}</div>
      </div>
    `;
  });
  list.innerHTML = html;
}

// ==================== GOVERNMENT ====================
function goGovScreen(screenId) {
  document.querySelectorAll('#gov-app .screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  document.querySelectorAll('.pc-sidebar .nav-item').forEach(n => n.classList.remove('active'));
  event.target.classList.add('active');

  if (screenId === 'gov-dashboard') renderGovDashboard();
  if (screenId === 'gov-orders') renderGovOrders();
  if (screenId === 'gov-volunteers') renderGovVolunteers();
  if (screenId === 'gov-performance') renderGovPerformance();
}

function renderGovDashboard() {
  renderGovPendingList();
  // Simple chart simulation with div bars
  const trendChart = document.getElementById('gov-chart-trend');
  if (trendChart) {
    const days = ['6/4','6/5','6/6','6/7','6/8','6/9','6/10'];
    const data = [85, 92, 78, 105, 98, 112, 128];
    const max = Math.max(...data);
    let html = '<div style="display:flex;align-items:flex-end;justify-content:space-around;height:240px;padding:20px 0;">';
    data.forEach((val, i) => {
      const pct = (val / max) * 100;
      html += `
        <div style="display:flex;flex-direction:column;align-items:center;flex:1;">
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px;">${val}</div>
          <div style="width:32px;background:linear-gradient(to top,var(--primary),var(--secondary));border-radius:4px 4px 0 0;transition:height 0.5s;" style="height:${pct}%"></div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">${days[i]}</div>
        </div>
      `;
    });
    html += '</div>';
    trendChart.innerHTML = html;
  }

  const pieChart = document.getElementById('gov-chart-pie');
  if (pieChart) {
    const categories = [
      { name: '市容环境', value: 35, color: '#2563eb' },
      { name: '公共设施', value: 28, color: '#0ea5e9' },
      { name: '邻里纠纷', value: 20, color: '#f59e0b' },
      { name: '志愿服务', value: 17, color: '#10b981' }
    ];
    let html = '<div style="padding:20px;">';
    categories.forEach(cat => {
      html += `
        <div style="display:flex;align-items:center;margin-bottom:12px;">
          <div style="width:12px;height:12px;border-radius:2px;background:${cat.color};margin-right:8px;"></div>
          <div style="flex:1;font-size:14px;">${cat.name}</div>
          <div style="font-weight:600;">${cat.value}%</div>
        </div>
        <div style="width:100%;height:8px;background:var(--bg);border-radius:4px;margin-bottom:16px;">
          <div style="width:${cat.value}%;height:100%;background:${cat.color};border-radius:4px;"></div>
        </div>
      `;
    });
    html += '</div>';
    pieChart.innerHTML = html;
  }
}

function renderGovPendingList() {
  const list = document.getElementById('gov-pending-list');
  let html = '';
  govPendingOrders.forEach(order => {
    const statusTag = order.status === 'pending' ? '<span class="tag tag-danger">待派单</span>' : '<span class="tag tag-warning">处理中</span>';
    html += `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--rule);">
        <div><div style="font-weight:600;font-size:14px;">${order.id} · ${order.title}</div><div style="font-size:12px;color:var(--muted);margin-top:2px;">${order.location} · ${order.time}</div></div>
        <div style="display:flex;gap:6px;">${statusTag}<button class="btn btn-primary btn-sm" onclick="showToast('派单成功')">派单</button></div>
      </div>
    `;
  });
  list.innerHTML = html;
}

function renderGovOrders() {
  const list = document.getElementById('gov-orders-list');
  let html = '<table style="width:100%;border-collapse:collapse;font-size:14px;"><thead><tr style="border-bottom:2px solid var(--rule);"><th style="text-align:left;padding:10px;">工单号</th><th style="text-align:left;padding:10px;">标题</th><th style="text-align:left;padding:10px;">位置</th><th style="text-align:left;padding:10px;">状态</th><th style="text-align:left;padding:10px;">操作</th></tr></thead><tbody>';
  govPendingOrders.forEach(order => {
    const statusText = order.status === 'pending' ? '待派单' : order.status === 'processing' ? '处理中' : '已办结';
    const statusClass = order.status === 'pending' ? 'tag-danger' : order.status === 'processing' ? 'tag-warning' : 'tag-success';
    html += `
      <tr style="border-bottom:1px solid var(--rule);">
        <td style="padding:10px;">${order.id}</td>
        <td style="padding:10px;">${order.title}</td>
        <td style="padding:10px;">${order.location}</td>
        <td style="padding:10px;"><span class="tag ${statusClass}">${statusText}</span></td>
        <td style="padding:10px;">
          <button class="btn btn-primary btn-sm" onclick="showToast('派单成功')">派单</button>
          <button class="btn btn-success btn-sm" style="margin-left:4px;" onclick="showToast('核验通过')">核验</button>
        </td>
      </tr>
    `;
  });
  html += '</tbody></table>';
  list.innerHTML = html;
}

function renderGovVolunteers() {
  const pending = document.getElementById('gov-pending-volunteers');
  let html = '';
  pendingVolunteers.forEach((v, i) => {
    html += `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--rule);">
        <div><div style="font-weight:600;">${v.name}</div><div style="font-size:12px;color:var(--muted);">${v.phone} · ${v.skills.join(',')}</div></div>
        <div style="display:flex;gap:6px;"><button class="btn btn-success btn-sm" onclick="showToast('已通过')">通过</button><button class="btn btn-danger btn-sm" onclick="showToast('已拒绝')">拒绝</button></div>
      </div>
    `;
  });
  pending.innerHTML = html;

  const list = document.getElementById('gov-volunteer-list');
  html = '';
  volunteerList.forEach(v => {
    html += `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--rule);">
        <div><div style="font-weight:600;">${v.name}</div><div style="font-size:12px;color:var(--muted);">接单${v.orders} · 评分${v.rating}</div></div>
        <div style="display:flex;align-items:center;gap:8px;"><span style="font-weight:600;color:var(--primary);">${v.credit}分</span><button class="btn btn-sm" style="background:var(--bg);" onclick="showToast('信用分已调整')">+/-</button></div>
      </div>
    `;
  });
  list.innerHTML = html;
}

function renderGovPerformance() {
  const list = document.getElementById('gov-performance-list');
  let html = '<table style="width:100%;border-collapse:collapse;font-size:14px;"><thead><tr style="border-bottom:2px solid var(--rule);"><th style="text-align:left;padding:10px;">排名</th><th style="text-align:left;padding:10px;">姓名</th><th style="text-align:left;padding:10px;">办结数</th><th style="text-align:left;padding:10px;">平均时长</th><th style="text-align:left;padding:10px;">满意度</th></tr></thead><tbody>';
  performanceData.forEach((p, i) => {
    html += `
      <tr style="border-bottom:1px solid var(--rule);">
        <td style="padding:10px;font-weight:700;color:var(--primary);">#${i+1}</td>
        <td style="padding:10px;">${p.name}</td>
        <td style="padding:10px;">${p.completed}</td>
        <td style="padding:10px;">${p.avgTime}</td>
        <td style="padding:10px;color:var(--success);font-weight:600;">${p.satisfaction}</td>
      </tr>
    `;
  });
  html += '</tbody></table>';
  list.innerHTML = html;
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
  // Default to citizen
  switchRole('citizen');
});
