// 暖邻帮 - 模拟数据

// 当前登录用户
const currentUser = {
  id: 'user_001',
  name: '张奶奶',
  avatar: '👵',
  phone: '138****5678',
  role: 'elderly', // elderly | volunteer | admin
  age: 78,
  address: '阳光小区 3号楼 201室',
  creditScore: 850,
  creditLevel: 4,
  points: 280,
  skills: [],
  helpHistory: 0,
  helpReceived: 12,
  emergencyContact: '张建国 139****2345'
};

// 志愿者数据
const volunteers = [
  {
    id: 'vol_001',
    name: '李阿姨',
    avatar: '👩',
    phone: '137****1234',
    age: 62,
    address: '阳光小区 5号楼 302室',
    creditScore: 980,
    creditLevel: 5,
    points: 1250,
    skills: ['代买药', '陪诊挂号', '聊天陪伴'],
    distance: '200米',
    available: true,
    completedTasks: 48,
    rating: 4.9
  },
  {
    id: 'vol_002',
    name: '王小明',
    avatar: '👨',
    phone: '136****5678',
    age: 35,
    address: '阳光小区 2号楼 501室',
    creditScore: 920,
    creditLevel: 4,
    points: 680,
    skills: ['智能设备教学', '搬运重物', '代取快递'],
    distance: '350米',
    available: true,
    completedTasks: 23,
    rating: 4.7
  },
  {
    id: 'vol_003',
    name: '刘大姐',
    avatar: '👩‍🦰',
    phone: '135****9012',
    age: 45,
    address: '阳光小区 7号楼 105室',
    creditScore: 950,
    creditLevel: 5,
    points: 890,
    skills: ['代买药', '做饭', '陪诊挂号'],
    distance: '500米',
    available: false,
    completedTasks: 35,
    rating: 4.8
  },
  {
    id: 'vol_004',
    name: '赵师傅',
    avatar: '👴',
    phone: '134****3456',
    age: 68,
    address: '阳光小区 1号楼 401室',
    creditScore: 880,
    creditLevel: 4,
    points: 560,
    skills: ['搬运重物', '修缮小活', '代取快递'],
    distance: '180米',
    available: true,
    completedTasks: 67,
    rating: 4.6
  }
];

// 任务类型定义
const taskTypes = [
  { id: 'medicine', name: '代买药', icon: '💊', color: '#FF6B35' },
  { id: 'hospital', name: '陪诊挂号', icon: '🏥', color: '#4ECDC4' },
  { id: 'delivery', name: '代取快递', icon: '📦', color: '#0984E3' },
  { id: 'heavy', name: '搬运重物', icon: '🏋️', color: '#F39C12' },
  { id: 'device', name: '智能设备教学', icon: '📱', color: '#9B59B6' },
  { id: 'chat', name: '聊天陪伴', icon: '💬', color: '#E91E63' },
  { id: 'urgent', name: '紧急求助', icon: '🆘', color: '#E74C3C' }
];

// 任务列表
const tasks = [
  {
    id: 'task_001',
    type: 'medicine',
    title: '帮忙购买降压药',
    description: '需要帮忙去社区药店购买降压药硝苯地平缓释片，药品清单已准备好。',
    elderName: '张奶奶',
    elderPhone: '138****5678',
    elderAddress: '阳光小区 3号楼 201室',
    reward: 20,
    urgency: 'normal',
    status: 'pending',
    createdAt: '2024-01-15 09:30',
    preferredTime: '今天上午',
    remark: '药品清单在门口鞋柜上'
  },
  {
    id: 'task_002',
    type: 'hospital',
    title: '陪诊去市医院挂号',
    description: '下周二需要去市医院复查骨科，希望有志愿者陪同，帮忙挂号和取报告。',
    elderName: '王爷爷',
    elderPhone: '139****8765',
    elderAddress: '阳光小区 6号楼 302室',
    reward: 50,
    urgency: 'normal',
    status: 'accepted',
    volunteer: '李阿姨',
    createdAt: '2024-01-14 16:20',
    preferredTime: '下周二 上午8点',
    acceptedAt: '2024-01-14 17:45'
  },
  {
    id: 'task_003',
    type: 'delivery',
    title: '帮忙取个大件快递',
    description: '子女寄了个按摩仪到快递柜，是个大箱子，一个人搬不动。',
    elderName: '刘奶奶',
    elderPhone: '137****4567',
    elderAddress: '阳光小区 8号楼 105室',
    reward: 15,
    urgency: 'normal',
    status: 'pending',
    createdAt: '2024-01-15 08:15',
    preferredTime: '今天下午'
  },
  {
    id: 'task_004',
    type: 'device',
    title: '教我用微信视频通话',
    description: '儿子给我买了新手机，想学怎么用微信和他们视频聊天。',
    elderName: '赵奶奶',
    elderPhone: '136****7890',
    elderAddress: '阳光小区 4号楼 601室',
    reward: 30,
    urgency: 'normal',
    status: 'pending',
    createdAt: '2024-01-14 14:00',
    preferredTime: '周末下午'
  },
  {
    id: 'task_005',
    type: 'heavy',
    title: '帮忙搬几袋大米上楼',
    description: '超市买了几袋大米，10斤装的，电梯坏了，6楼实在搬不上去。',
    elderName: '陈爷爷',
    elderPhone: '135****2345',
    elderAddress: '阳光小区 9号楼 602室',
    reward: 25,
    urgency: 'high',
    status: 'pending',
    createdAt: '2024-01-15 07:45',
    preferredTime: '尽快'
  },
  {
    id: 'task_006',
    type: 'medicine',
    title: '帮忙买糖尿病药',
    description: '胰岛素笔芯快用完了，需要去指定药店购买同款。',
    elderName: '张爷爷',
    elderPhone: '134****6789',
    elderAddress: '阳光小区 1号楼 403室',
    reward: 20,
    urgency: 'urgent',
    status: 'pending',
    createdAt: '2024-01-15 06:30',
    preferredTime: '今天上午',
    remark: '必须是同款胰岛素笔芯'
  },
  {
    id: 'task_007',
    type: 'chat',
    title: '周末想找人聊聊天',
    description: '子女都在外地，平时一个人太孤单了，周末想找人下下棋、聊聊天。',
    elderName: '周爷爷',
    elderPhone: '133****3456',
    elderAddress: '阳光小区 2号楼 202室',
    reward: 15,
    urgency: 'normal',
    status: 'completed',
    volunteer: '李阿姨',
    createdAt: '2024-01-12 10:00',
    completedAt: '2024-01-13 15:00',
    rating: 5,
    comment: '李阿姨人很好，聊了很久，很开心！'
  },
  {
    id: 'task_008',
    type: 'urgent',
    title: '突然头晕需要帮忙',
    description: '突然感觉头晕不舒服，子女在外地，希望有人来帮忙看看情况。',
    elderName: '吴奶奶',
    elderPhone: '132****4567',
    elderAddress: '阳光小区 5号楼 301室',
    reward: 50,
    urgency: 'urgent',
    status: 'accepted',
    volunteer: '赵师傅',
    createdAt: '2024-01-15 10:00',
    acceptedAt: '2024-01-15 10:02'
  }
];

// 社区公告
const notices = [
  {
    id: 'notice_001',
    title: '腊八节邻里互助活动',
    content: '后天是腊八节，社区将举办"暖心腊八粥"活动，欢迎志愿者参与煮粥、送粥，让独居老人感受节日温暖。',
    date: '2024-01-15',
    author: '居委会',
    type: 'activity'
  },
  {
    id: 'notice_002',
    title: '新增免费理发服务',
    content: '本月起，每周三上午9:00-11:00，社区活动中心将提供免费理发服务，由辖区理发店志愿者提供服务。',
    date: '2024-01-14',
    author: '社区服务中心',
    type: 'service'
  },
  {
    id: 'notice_003',
    title: '互助积分兑换通知',
    content: '2023年第四季度积分兑换已开始，100积分可兑换一提纸巾，200积分可兑换一袋大米，请尽快到居委会兑换。',
    date: '2024-01-10',
    author: '暖邻帮运营',
    type: 'notice'
  },
  {
    id: 'notice_004',
    title: '志愿者培训报名',
    content: '下周六将举办志愿者培训会，内容包括：老年人沟通技巧、急救基础知识、AI工具使用，欢迎报名参加。',
    date: '2024-01-08',
    author: '社区居委会',
    type: 'activity'
  }
];

// 积分商城商品
const products = [
  { id: 'p001', name: '抽纸一提', points: 100, stock: 50, icon: '🧻' },
  { id: 'p002', name: '大米5斤装', points: 200, stock: 30, icon: '🍚' },
  { id: 'p003', name: '食用油1.8L', points: 300, stock: 20, icon: '🫒' },
  { id: 'p004', name: '洗衣液2kg', points: 250, stock: 25, icon: '🧴' },
  { id: 'p005', name: '牙膏牙刷套装', points: 150, stock: 40, icon: '🦷' },
  { id: 'p006', name: '保温杯', points: 400, stock: 15, icon: '🥤' }
];

// 积分记录
const pointRecords = [
  { id: 'pr001', type: 'earn', amount: 20, reason: '完成代买药任务', date: '2024-01-14' },
  { id: 'pr002', type: 'earn', amount: 30, reason: '陪诊任务获得好评', date: '2024-01-13' },
  { id: 'pr003', type: 'spend', amount: -100, reason: '兑换抽纸一提', date: '2024-01-12' },
  { id: 'pr004', type: 'earn', amount: 15, reason: '完成代取快递任务', date: '2024-01-11' },
  { id: 'pr005', type: 'earn', amount: 25, reason: '帮助搬运获得好评', date: '2024-01-10' }
];

// 健康数据（模拟）
const healthData = {
  bloodPressure: { systolic: 135, diastolic: 85 },
  heartRate: 72,
  sleepHours: 7.5,
  steps: 3500,
  medicationTaken: true,
  lastCheckIn: '2024-01-15 08:30'
};

// AI匹配函数
function findBestMatch(taskType, urgency) {
  const availableVolunteers = volunteers.filter(v => v.available);

  // 根据任务类型过滤有相关技能的志愿者
  let matched = availableVolunteers.filter(v =>
    v.skills.some(skill => {
      const skillMap = {
        '代买药': ['medicine', 'hospital'],
        '陪诊挂号': ['hospital'],
        '代取快递': ['delivery'],
        '搬运重物': ['heavy'],
        '智能设备教学': ['device'],
        '聊天陪伴': ['chat']
      };
      return skillMap[skill]?.includes(taskType);
    })
  );

  // 如果没有精确匹配的，放宽条件
  if (matched.length === 0) {
    matched = availableVolunteers;
  }

  // 计算匹配分数
  matched = matched.map(v => {
    let score = 70;

    // 距离越近分数越高
    const distanceMap = { '200米': 20, '350米': 15, '500米': 10, '180米': 20 };
    score += distanceMap[v.distance] || 5;

    // 信用分加成
    score += Math.floor((v.creditScore - 800) / 20);

    // 好评率加成
    score += Math.floor((v.rating - 4) * 10);

    // 紧急任务优先派给距离近的志愿者
    if (urgency === 'urgent' && v.distance === '180米') {
      score += 20;
    }

    return { ...v, matchScore: Math.min(score, 99) };
  });

  // 按匹配分数排序
  matched.sort((a, b) => b.matchScore - a.matchScore);

  return matched.slice(0, 3);
}

// 获取任务类型信息
function getTaskTypeInfo(typeId) {
  return taskTypes.find(t => t.id === typeId) || taskTypes[0];
}

// 格式化距离
function formatDistance(meters) {
  if (meters < 1000) {
    return meters + '米';
  }
  return (meters / 1000).toFixed(1) + '公里';
}

// 计算响应时间
function getResponseTime(task) {
  if (task.status === 'pending') {
    const created = new Date(task.createdAt);
    const now = new Date();
    const diff = Math.floor((now - created) / 60000);
    if (diff < 60) return diff + '分钟前';
    return Math.floor(diff / 60) + '小时前';
  }
  if (task.acceptedAt) {
    const created = new Date(task.createdAt);
    const accepted = new Date(task.acceptedAt);
    const diff = Math.floor((accepted - created) / 60000);
    return diff + '分钟';
  }
  return '-';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    pending: '待接单',
    accepted: '已接单',
    inProgress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
}

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    currentUser,
    volunteers,
    taskTypes,
    tasks,
    notices,
    products,
    pointRecords,
    healthData,
    findBestMatch,
    getTaskTypeInfo,
    formatDistance,
    getResponseTime,
    getStatusText
  };
}
