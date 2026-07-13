/**
 * 智客AI客服管理平台 - 企业集团多租户后台
 * 核心应用逻辑
 */
(function() {
'use strict';

/* ===================== 全局状态 ===================== */
var State = {
  currentPage: 'dashboard',
  tenant: 'group', // group | sub
  tenantName: '集团总部',
  role: '集团管理员',
  permission: '完整操作权限',
  charts: {},
  modals: [],
  // AI人设
  personas: [],
  sensitiveWords: [],
  // 知识库
  knowledgeBase: [],
  // 复盘
  reviewData: { errors: [], unresolved: [], archived: [] },
  // 训练
  trainingSamples: [],
  // 渠道
  channels: [],
  // 账号
  accounts: [],
  // 协同工作台
  chatSessions: [],
  currentChatId: null,
};

/* ===================== 工具函数 ===================== */
function maskPhone(phone) {
  if (!phone) return '-';
  var s = String(phone);
  if (s.length < 7) return s;
  return s.substring(0, 3) + '****' + s.substring(s.length - 4);
}
function maskName(name) {
  if (!name) return '-';
  if (name.length <= 1) return name;
  return name[0] + '*'.repeat(name.length - 1);
}
function maskOrder(order) {
  if (!order) return '-';
  return '****' + String(order).slice(-4);
}
function maskIdCard(id) {
  if (!id) return '-';
  var s = String(id);
  return s.substring(0, 6) + '********' + s.substring(s.length - 4);
}
function formatNum(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toLocaleString();
}
function formatPercent(n) {
  return n.toFixed(1) + '%';
}
function randomDate(daysBack) {
  var d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().slice(0, 10);
}
function timeAgo(dateStr) {
  var d = new Date(dateStr);
  var now = new Date();
  var diff = (now - d) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
  return Math.floor(diff / 86400) + '天前';
}

/* ===================== Mock数据初始化 ===================== */
function initMockData() {
  // AI人设
  State.personas = [
    { id: 'P001', name: '官方旗舰店智能客服', avatar: 'blue', status: 'active', channels: ['官网H5','微信小程序'], scenario: '售前咨询', tone: '专业热情', language: '中文',
      opening: '您好！欢迎光临智客旗舰店，我是AI智能客服小智，很高兴为您服务！请问有什么可以帮到您的吗？',
      closing: '感谢您的咨询，祝您购物愉快！如有其他问题随时联系我哦~',
      transfer: '非常抱歉，您的问题需要人工客服为您进一步处理，正在为您转接专属客服，请稍候...',
      festival: '亲爱的朋友，新年快乐！愿您在新的一年里万事如意，心想事成！限时年货节火热进行中，多重好礼等您来~',
      festivalDate: '2026-02-17',
      knowledgeBase: ['产品FAQ','退换货政策','物流查询','促销活动'],
      createTime: '2025-11-15 10:30:00', updateTime: '2026-07-10 14:22:31' },
    { id: 'P002', name: '售后维保专员', avatar: 'green', status: 'active', channels: ['APP','企业微信'], scenario: '售后维保', tone: '耐心细致', language: '中文',
      opening: '您好，我是售后维保AI助手小维，为您提供设备保修、故障报修、维修进度查询等服务。',
      closing: '感谢您使用售后服务，如有其他问题请随时联系我们。祝您生活愉快！',
      transfer: '您的问题比较复杂，正在为您转接技术工程师，请保持通话...',
      festival: '端午安康！愿您阖家幸福，万事如意~',
      festivalDate: '2026-06-19',
      knowledgeBase: ['保修政策','故障排查','维修流程','配件价格'],
      createTime: '2025-12-01 09:00:00', updateTime: '2026-07-08 16:45:12' },
    { id: 'P003', name: 'VIP会员专属管家', avatar: 'purple', status: 'active', channels: ['官网H5','微信小程序','APP'], scenario: 'VIP服务', tone: '尊贵优雅', language: '中文',
      opening: '尊贵的VIP会员您好，我是您的专属智能管家小尊，随时为您提供尊享服务。',
      closing: '感谢您的信任，期待再次为您服务。祝您生活愉快，万事顺意！',
      transfer: '尊敬的VIP会员，您的需求正在为您转接至专属客户经理，请稍候片刻...',
      festival: '中秋佳节，月圆人团圆。祝您和家人中秋快乐，幸福美满！',
      festivalDate: '2026-09-25',
      knowledgeBase: ['VIP权益','积分商城','专属活动','会员等级'],
      createTime: '2026-01-10 11:20:00', updateTime: '2026-07-11 09:15:44' },
    { id: 'P004', name: '海外事业部客服', avatar: 'orange', status: 'inactive', channels: ['官网H5'], scenario: '海外咨询', tone: '专业严谨', language: '中英双语',
      opening: 'Hello! Welcome to Zhike Global. I am your AI assistant. 您好！欢迎咨询，我是海外客服小K。',
      closing: 'Thank you for contacting us. Have a great day! 感谢您的咨询，祝您一切顺利！',
      transfer: 'Your inquiry requires human assistance. Transferring you to our international team... 您的问题需要人工处理，正在为您转接...',
      festival: '',
      festivalDate: '',
      knowledgeBase: ['国际物流','关税政策','海外保修','多语言FAQ'],
      createTime: '2026-03-20 14:00:00', updateTime: '2026-06-30 10:30:00' },
  ];

  // 敏感词
  State.sensitiveWords = [
    { id: 'S001', word: '竞争对手品牌名', category: '品牌竞品', level: 'high', action: '拦截替换', replaceWith: '***', status: 'active' },
    { id: 'S002', word: '负面评价词汇A', category: '负面情绪', level: 'medium', action: '提醒客服', replaceWith: '', status: 'active' },
    { id: 'S003', word: '政治敏感词', category: '政治敏感', level: 'high', action: '直接拦截', replaceWith: '', status: 'active' },
    { id: 'S004', word: '脏话/辱骂词汇', category: '不文明用语', level: 'high', action: '拦截替换', replaceWith: '**', status: 'active' },
    { id: 'S005', word: '价格底线信息', category: '商业机密', level: 'high', action: '直接拦截', replaceWith: '', status: 'active' },
    { id: 'S006', word: '个人隐私信息', category: '隐私保护', level: 'high', action: '脱敏处理', replaceWith: '[已脱敏]', status: 'active' },
    { id: 'S007', word: '未授权承诺词', category: '合规风险', level: 'medium', action: '提醒客服', replaceWith: '', status: 'inactive' },
  ];

  // 知识库
  State.knowledgeBase = [
    { id: 'K001', title: '2026夏季新品FAQ合集', category: '产品知识', format: '文档', status: 'active', qaCount: 156, updateTime: '2026-07-11 14:30', source: '手动录入', persona: '官方旗舰店智能客服', fileSize: '2.3MB' },
    { id: 'K002', title: '退换货政策与流程指引', category: '售后政策', format: '表格', status: 'active', qaCount: 89, updateTime: '2026-07-09 10:15', source: 'Excel导入', persona: '售后维保专员', fileSize: '1.1MB' },
    { id: 'K003', title: 'VIP会员权益手册2026版', category: '会员服务', format: '文档', status: 'active', qaCount: 234, updateTime: '2026-07-10 16:42', source: '手动录入', persona: 'VIP会员专属管家', fileSize: '5.7MB' },
    { id: 'K004', title: '物流配送常见问题', category: '物流服务', format: '问答对', status: 'active', qaCount: 67, updateTime: '2026-07-08 09:20', source: '批量导入', persona: '官方旗舰店智能客服', fileSize: '890KB' },
    { id: 'K005', title: '产品使用说明书汇编', category: '产品知识', format: 'PDF', status: 'active', qaCount: 312, updateTime: '2026-07-05 11:00', source: 'PDF上传', persona: '售后维保专员', fileSize: '12.4MB' },
    { id: 'K006', title: '促销活动规则汇总', category: '营销活动', format: '文档', status: 'draft', qaCount: 45, updateTime: '2026-07-12 08:30', source: '手动录入', persona: '官方旗舰店智能客服', fileSize: '680KB' },
    { id: 'K007', title: '海外配送与关税指南', category: '国际业务', format: '文档', status: 'active', qaCount: 78, updateTime: '2026-06-28 15:00', source: '手动录入', persona: '海外事业部客服', fileSize: '1.8MB' },
    { id: 'K008', title: '故障排查知识图谱', category: '技术支持', format: '知识图谱', status: 'active', qaCount: 198, updateTime: '2026-07-07 13:45', source: '系统生成', persona: '售后维保专员', fileSize: '3.2MB' },
  ];

  // 错题台账
  State.reviewData.errors = [
    { id: 'E001', question: '夏季新款防晒衣的UPF值是多少？', aiAnswer: '该产品具有防晒功能。', correctAnswer: '夏季新款防晒衣UPF值为50+，可阻隔98%紫外线，适合户外运动穿着。', errorType: '回答不完整', severity: 'medium', status: 'pending', channel: '官网H5', count: 12, lastTime: '2026-07-12 10:30', persona: '官方旗舰店智能客服' },
    { id: 'E002', question: 'VIP会员的生日礼是什么？', aiAnswer: 'VIP会员有生日福利。', correctAnswer: '钻石级VIP会员生日当月可获赠价值299元生日礼盒一份及200积分，需在生日前7天在小程序领取。', errorType: '信息缺失', severity: 'high', status: 'pending', channel: '微信小程序', count: 8, lastTime: '2026-07-11 16:20', persona: 'VIP会员专属管家' },
    { id: 'E003', question: '保修期内维修收上门费吗？', aiAnswer: '保修期内维修免费。', correctAnswer: '保修期内维修免人工费和配件费，上门服务费根据地区不同收取30-80元，偏远地区可能略有上浮。', errorType: '回答不准确', severity: 'medium', status: 'pending', channel: 'APP', count: 15, lastTime: '2026-07-12 09:15', persona: '售后维保专员' },
    { id: 'E004', question: '海外订单的关税由谁承担？', aiAnswer: '关税由买家承担。', correctAnswer: '订单金额200美元以下免关税；200-500美元关税由平台承担；500美元以上需买家自行缴纳，具体税率以目的地国家海关规定为准。', errorType: '信息缺失', severity: 'high', status: 'pending', channel: '官网H5', count: 6, lastTime: '2026-07-10 14:00', persona: '海外事业部客服' },
    { id: 'E005', question: '618活动的满减规则是什么？', aiAnswer: '618有满减活动。', correctAnswer: '618活动满300减50，满600减120，满1000减220，可与店铺优惠券叠加使用，不可与限时秒杀同享。', errorType: '回答不完整', severity: 'low', status: 'resolved', channel: '官网H5', count: 23, lastTime: '2026-07-09 11:30', persona: '官方旗舰店智能客服' },
  ];

  // 未解决问题 - 待处理
  State.reviewData.unresolved = [
    { id: 'U001', question: '订单尾款可以延期支付吗？', similarQuestions: ['尾款能延期几天？','尾款支付期限能延长吗？'], count: 34, status: 'pending', channel: '官网H5', lastTime: '2026-07-12 11:00', persona: '官方旗舰店智能客服', tags: ['支付', '订单'] },
    { id: 'U002', question: '产品支持以旧换新吗？', similarQuestions: ['旧产品能抵扣多少？','以旧换新流程是什么？'], count: 28, status: 'pending', channel: 'APP', lastTime: '2026-07-12 10:15', persona: '售后维保专员', tags: ['售后', '以旧换新'] },
    { id: 'U003', question: '会员积分可以转赠他人吗？', similarQuestions: ['积分能转给别人吗？','积分转移怎么操作？'], count: 19, status: 'pending', channel: '微信小程序', lastTime: '2026-07-11 15:30', persona: 'VIP会员专属管家', tags: ['会员', '积分'] },
    { id: 'U004', question: '国际物流到澳洲要多久？', similarQuestions: ['发澳大利亚几天到？','澳洲运费多少？'], count: 15, status: 'pending', channel: '官网H5', lastTime: '2026-07-11 09:45', persona: '海外事业部客服', tags: ['物流', '海外'] },
    { id: 'U005', question: '定制产品可以中途修改需求吗？', similarQuestions: ['定制中能改配置吗？','定制产品修改流程？'], count: 12, status: 'pending', channel: 'APP', lastTime: '2026-07-10 14:20', persona: '官方旗舰店智能客服', tags: ['定制', '订单'] },
    { id: 'U006', question: '发票可以开具电子版和纸质版吗？', similarQuestions: ['能同时开电子和纸质发票吗？','发票类型有哪些？'], count: 9, status: 'pending', channel: '官网H5', lastTime: '2026-07-10 10:00', persona: '官方旗舰店智能客服', tags: ['发票', '财务'] },
  ];

  // 未解决问题 - 暂缓归档
  State.reviewData.archived = [
    { id: 'A001', question: '是否支持数字人民币支付？', similarQuestions: ['数字人民币能用吗？'], count: 5, status: 'archived', channel: '官网H5', lastTime: '2026-06-28 14:00', persona: '官方旗舰店智能客服', tags: ['支付'], archiveReason: '暂未接入数字人民币，待系统升级后处理', archiveDate: '2026-06-30' },
    { id: 'A002', question: '产品有NFC功能吗？', similarQuestions: ['支持NFC吗？','有近场通信吗？'], count: 8, status: 'archived', channel: 'APP', lastTime: '2026-06-25 11:30', persona: '售后维保专员', tags: ['产品功能'], archiveReason: '需产品部门确认硬件参数后补充知识库', archiveDate: '2026-06-28' },
  ];

  // 训练样本
  State.trainingSamples = [
    { id: 'T001', question: '怎么退货？', standardQuestion: '如何申请退货退款？', answer: '您好，申请退货请按以下步骤操作：1.进入"我的订单"；2.找到需要退货的订单，点击"申请退货"；3.选择退货原因并上传凭证；4.等待审核通过后将商品寄回。退款将在收到商品后3-5个工作日原路退回。', trainSynonyms: ['怎么退货','如何退货','退货流程','退货怎么操作','怎么退款','退款流程'], kbSynonyms: ['退货','退款','退换货','退货申请','退款申请'], category: '售后流程', status: 'trained', accuracy: 96.5, lastTrained: '2026-07-10', source: '人工标注' },
    { id: 'T002', question: '发货要多久？', standardQuestion: '订单发货时效是多久？', answer: '正常情况下，现货订单付款后24小时内发货；预售商品按商品详情页标注的发货时间发货；定制产品需7-15个工作日。发货后您将收到短信通知，可在订单详情查看物流信息。', trainSynonyms: ['发货要多久','多久发货','什么时候发货','发货时间','几天发货'], kbSynonyms: ['发货','发货时效','物流时效','配送时间'], category: '物流配送', status: 'trained', accuracy: 94.2, lastTrained: '2026-07-08', source: '人工标注' },
    { id: 'T003', question: '保修期多久？', standardQuestion: '产品保修期限是多长？', answer: '不同产品保修期不同：电子产品整机保修1年，电池保修6个月；家电产品整机保修3年，主要部件保修5年；配件类保修3个月。具体以产品说明书或保修卡为准。', trainSynonyms: ['保修期多久','保修多长时间','质保期','保修几年','保修期'], kbSynonyms: ['保修','质保','保修期','保修期限','保修政策'], category: '售后保修', status: 'trained', accuracy: 92.8, lastTrained: '2026-07-06', source: '人工标注' },
    { id: 'T004', question: '可以开发票吗？', standardQuestion: '如何申请开具发票？', answer: '可以的！我们支持电子发票和纸质增值税专用发票。下单时可在结算页面填写发票信息，电子发票将在发货后24小时内发送至您预留的邮箱；专票需在收货后7个工作日内申请，通过"我的订单-发票管理"提交。', trainSynonyms: ['可以开发票吗','怎么开发票','发票怎么开','能开发票吗','发票申请'], kbSynonyms: ['发票','开发票','增值税发票','电子发票','发票申请'], category: '财务发票', status: 'pending', accuracy: 0, lastTrained: '', source: 'AI采集' },
    { id: 'T005', question: '怎么成为VIP？', standardQuestion: '如何升级为VIP会员？', answer: '成为VIP会员有两种方式：1.累计消费满5000元自动升级为银卡VIP；2.购买年费VIP会员卡（999元/年）直接成为金卡VIP。VIP等级分为银卡、金卡、钻石三级，消费越多等级越高，权益越丰富。', trainSynonyms: ['怎么成为VIP','如何成为VIP','VIP怎么升级','会员升级','VIP条件'], kbSynonyms: ['VIP','会员','VIP会员','会员升级','会员等级'], category: '会员服务', status: 'pending', accuracy: 0, lastTrained: '', source: 'AI采集' },
  ];

  // 渠道
  State.channels = [
    { id: 'C001', name: '官网H5客服窗口', type: '官网H5', status: 'active', persona: '官方旗舰店智能客服', group: '售前客服组A', apiKey: 'zhk_h5_8a3f****d2e9', embedCode: '<script src="https://cdn.zhikeai.com/widget.js" data-key="zhk_h5_8a3f****d2e9"></script>', dailyConversations: 3420, satisfaction: 94.5 },
    { id: 'C002', name: '微信小程序客服', type: '微信小程序', status: 'active', persona: '官方旗舰店智能客服', group: '售前客服组B', apiKey: 'zhk_mp_2b7c****f1a8', embedCode: '<script src="https://cdn.zhikeai.com/widget.js" data-key="zhk_mp_2b7c****f1a8"></script>', dailyConversations: 2180, satisfaction: 93.2 },
    { id: 'C003', name: 'APP在线客服', type: 'APP', status: 'active', persona: '售后维保专员', group: '售后客服组', apiKey: 'zhk_app_9d4e****c3b7', embedCode: '<script src="https://cdn.zhikeai.com/widget.js" data-key="zhk_app_9d4e****c3b7"></script>', dailyConversations: 1560, satisfaction: 91.8 },
    { id: 'C004', name: '企业微信客服', type: '企业微信', status: 'active', persona: '售后维保专员', group: '售后客服组', apiKey: 'zhk_wx_5f2a****e8d1', embedCode: '<script src="https://cdn.zhikeai.com/widget.js" data-key="zhk_wx_5f2a****e8d1"></script>', dailyConversations: 890, satisfaction: 95.1 },
    { id: 'C005', name: '海外官网客服', type: '官网H5', status: 'inactive', persona: '海外事业部客服', group: '海外客服组', apiKey: 'zhk_en_3c8b****a6f4', embedCode: '<script src="https://cdn.zhikeai.com/widget.js" data-key="zhk_en_3c8b****a6f4"></script>', dailyConversations: 320, satisfaction: 88.5 },
  ];

  // 账号
  State.accounts = [
    { id: 'AC001', name: '管理员张', account: 'admin@zhike.com', role: '集团管理员', tenant: '集团总部', status: 'active', lastLogin: '2026-07-12 08:30', permissions: ['全部模块-查看','全部模块-编辑','全部模块-删除','系统设置','权限管理'] },
    { id: 'AC002', name: '王丽', account: 'wangli@zhike.com', role: '运营主管', tenant: '集团总部', status: 'active', lastLogin: '2026-07-11 17:45', permissions: ['仪表盘-查看','AI人设-查看','知识库-查看编辑','数据分析-查看','协同工作台-查看编辑'] },
    { id: 'AC003', name: '李强', account: 'liqiang@zhike.com', role: '客服组长', tenant: '华东子公司', status: 'active', lastLogin: '2026-07-12 09:15', permissions: ['仪表盘-查看','协同工作台-查看编辑','AI复盘-查看'] },
    { id: 'AC004', name: '赵敏', account: 'zhaomin@zhike.com', role: 'AI训练师', tenant: '集团总部', status: 'active', lastLogin: '2026-07-11 14:20', permissions: ['仪表盘-查看','AI人设-查看编辑','知识库-查看编辑','AI训练-查看编辑','AI复盘-查看编辑'] },
    { id: 'AC005', name: '陈杰', account: 'chenjie@zhike.com', role: '子公司客服', tenant: '华南子公司', status: 'inactive', lastLogin: '2026-06-28 10:00', permissions: ['仪表盘-查看','协同工作台-查看'] },
    { id: 'AC006', name: '刘洋', account: 'liuyang@zhike.com', role: '数据分析员', tenant: '集团总部', status: 'active', lastLogin: '2026-07-12 07:50', permissions: ['仪表盘-查看','数据分析-查看','渠道管理-查看'] },
  ];

  // 协同工作台 - 会话列表
  State.chatSessions = [
    { id: 'CS001', customerName: '张*明', phone: '138****5621', avatar: 'blue', lastMsg: '好的，那我先下单试试', time: '11:32', unread: 0, status: 'ai', tags: ['VIP','售前'], channel: '官网H5', orderNo: 'DD20260712001' },
    { id: 'CS002', customerName: '李*华', phone: '139****8832', avatar: 'green', lastMsg: '退款什么时候到账？', time: '11:18', unread: 2, status: 'waiting', tags: ['售后','退款'], channel: 'APP', orderNo: 'DD20260711008' },
    { id: 'CS003', customerName: '王*芳', phone: '137****4521', avatar: 'orange', lastMsg: '这个产品有现货吗？', time: '10:45', unread: 1, status: 'ai', tags: ['售前'], channel: '微信小程序', orderNo: '' },
    { id: 'CS004', customerName: '赵*磊', phone: '135****7788', avatar: 'purple', lastMsg: '保修期内维修要收费吗？', time: '10:20', unread: 0, status: 'human', tags: ['售后','维保'], channel: 'APP', orderNo: 'DD20260710032' },
    { id: 'CS005', customerName: '孙*婷', phone: '186****3344', avatar: 'blue', lastMsg: 'VIP生日礼怎么领取？', time: '09:58', unread: 3, status: 'waiting', tags: ['VIP','会员'], channel: '微信小程序', orderNo: '' },
    { id: 'CS006', customerName: '周*伟', phone: '188****9911', avatar: 'green', lastMsg: '请问618活动还有吗？', time: '09:30', unread: 0, status: 'ai', tags: ['活动'], channel: '官网H5', orderNo: '' },
    { id: 'CS007', customerName: '吴*静', phone: '133****2266', avatar: 'orange', lastMsg: '物流显示已签收但没收到', time: '昨天', unread: 0, status: 'human', tags: ['物流','投诉'], channel: '官网H5', orderNo: 'DD20260709015' },
    { id: 'CS008', customerName: '郑*军', phone: '131****5588', avatar: 'gray', lastMsg: '产品说明书在哪下载？', time: '昨天', unread: 0, status: 'offline', tags: ['产品'], channel: 'APP', orderNo: '' },
  ];

  State.currentChatId = 'CS002';
}

/* ===================== 导航配置 ===================== */
var NAV_CONFIG = [
  { id: 'dashboard', name: '首页仪表盘', icon: '📊' },
  { id: 'persona', name: 'AI人设配置', icon: '🤖' },
  { id: 'knowledge', name: '知识库投喂', icon: '📚' },
  { id: 'review', name: 'AI自动复盘', icon: '🔄', badge: '5' },
  { id: 'training', name: 'AI调教训练', icon: '🎯' },
  { id: 'analytics', name: '运营数据分析报告', icon: '📈' },
  { id: 'workspace', name: '协同工作台', icon: '💬', badge: '6' },
  { id: 'channel', name: '渠道接入管理', icon: '🔗' },
  { id: 'account', name: '账号权限管理', icon: '👤' },
];

var PAGE_NAMES = {
  dashboard: '首页仪表盘',
  persona: 'AI人设配置',
  knowledge: '知识库投喂',
  review: 'AI自动复盘',
  training: 'AI调教训练',
  analytics: '运营数据分析报告',
  workspace: '协同工作台',
  channel: '渠道接入管理',
  account: '账号权限管理',
};

/* ===================== 导航渲染 ===================== */
function renderNav() {
  var nav = document.getElementById('sidebarNav');
  var html = '';
  NAV_CONFIG.forEach(function(item) {
    var active = item.id === State.currentPage ? ' active' : '';
    var badge = item.badge ? '<span class="nav-badge">' + item.badge + '</span>' : '';
    html += '<div class="nav-item' + active + '" data-page="' + item.id + '">' +
      '<span class="nav-icon">' + item.icon + '</span>' +
      '<span>' + item.name + '</span>' +
      badge +
    '</div>';
  });
  nav.innerHTML = html;
  nav.querySelectorAll('.nav-item').forEach(function(el) {
    el.addEventListener('click', function() {
      navigateTo(el.dataset.page);
    });
  });
}

/* ===================== 路由 ===================== */
function navigateTo(pageId) {
  State.currentPage = pageId;
  // 更新导航高亮
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.page === pageId);
  });
  // 更新面包屑
  document.getElementById('breadcrumb').innerHTML =
    '<span class="crumb">首页</span><span class="sep">/</span><span class="crumb active">' + PAGE_NAMES[pageId] + '</span>';
  // 渲染页面
  var contentArea = document.getElementById('contentArea');
  var renderFn = PageRenderers[pageId];
  if (renderFn) {
    contentArea.innerHTML = '<div class="page active" id="page-' + pageId + '">' + renderFn() + '</div>';
    // 页面渲染后回调
    if (PageInit[pageId]) PageInit[pageId]();
  }
  contentArea.scrollTop = 0;
}

/* ===================== 弹窗系统 ===================== */
function showModal(options) {
  var overlay = document.getElementById('modalOverlay');
  var sizeClass = options.size === 'lg' ? ' modal-lg' : options.size === 'xl' ? ' modal-xl' : options.size === 'sm' ? ' modal-sm' : '';
  var html = '<div class="modal' + sizeClass + '">' +
    '<div class="modal-header">' +
      '<span class="modal-title">' + (options.title || '弹窗') + '</span>' +
      '<div class="modal-close" data-modal-close>×</div>' +
    '</div>' +
    '<div class="modal-body">' + (options.body || '') + '</div>';
  if (options.footer !== false) {
    html += '<div class="modal-footer">' +
      (options.footer || '<button class="btn" data-modal-close>取消</button><button class="btn btn-primary" data-modal-confirm>确定</button>') +
    '</div>';
  }
  html += '</div>';
  overlay.innerHTML = html;
  overlay.classList.add('show');

  // 关闭事件
  overlay.querySelectorAll('[data-modal-close]').forEach(function(el) {
    el.addEventListener('click', function() { closeModal(); });
  });
  // 遮罩点击关闭
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal();
  });
  // 确认事件
  if (options.onConfirm) {
    var confirmBtn = overlay.querySelector('[data-modal-confirm]');
    if (confirmBtn) confirmBtn.addEventListener('click', options.onConfirm);
  }
  // 自定义初始化
  if (options.onInit) options.onInit(overlay.querySelector('.modal'));
  return overlay.querySelector('.modal');
}

function closeModal() {
  var overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('show');
  overlay.innerHTML = '';
}

function confirmDialog(options) {
  return showModal({
    title: options.title || '确认操作',
    size: 'sm',
    body: '<div style="text-align:center;padding:12px 0;">' +
      '<div style="font-size:36px;margin-bottom:8px;">' + (options.icon || '⚠️') + '</div>' +
      '<div style="font-size:14px;color:var(--ink);">' + (options.message || '确定要执行此操作吗？') + '</div>' +
      (options.desc ? '<div style="font-size:12px;color:var(--ink-muted);margin-top:4px;">' + options.desc + '</div>' : '') +
    '</div>',
    footer: '<button class="btn" data-modal-close>取消</button><button class="btn ' + (options.danger ? 'btn-danger' : 'btn-primary') + '" data-modal-confirm>' + (options.confirmText || '确定') + '</button>',
    onConfirm: function() {
      closeModal();
      if (options.onConfirm) options.onConfirm();
    }
  });
}

function toast(message, type) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:' +
    (type === 'error' ? '#F53F3F' : type === 'warning' ? '#FF7D00' : '#00B42A') +
    ';color:#fff;padding:8px 20px;border-radius:6px;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:fadeIn .2s;';
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(function() {
    t.style.transition = 'opacity .3s';
    t.style.opacity = '0';
    setTimeout(function() { t.remove(); }, 300);
  }, 2000);
}

function copyToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    toast('已复制到剪贴板');
  } catch(e) {
    toast('复制失败', 'error');
  }
  document.body.removeChild(textarea);
}

/* ===================== 租户切换 ===================== */
function initTenantSwitcher() {
  var selector = document.getElementById('tenantSelector');
  selector.addEventListener('click', function(e) {
    e.stopPropagation();
    var existing = document.querySelector('.tenant-dropdown');
    if (existing) { existing.remove(); return; }
    var dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu show tenant-dropdown';
    dropdown.style.cssText = 'position:fixed;top:' + (selector.getBoundingClientRect().bottom + 4) + 'px;left:' + selector.getBoundingClientRect().left + 'px;';
    dropdown.innerHTML =
      '<div class="menu-item" data-tenant="group"><span class="badge blue">集团</span>集团总部</div>' +
      '<div class="menu-item" data-tenant="sub1"><span class="badge orange">子公司</span>华东子公司</div>' +
      '<div class="menu-item" data-tenant="sub2"><span class="badge orange">子公司</span>华南子公司</div>';
    document.body.appendChild(dropdown);
    dropdown.querySelectorAll('.menu-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var tenant = item.dataset.tenant;
        if (tenant === 'group') {
          State.tenant = 'group';
          State.tenantName = '集团总部';
          State.role = '集团管理员';
          State.permission = '完整操作权限';
        } else if (tenant === 'sub1') {
          State.tenant = 'sub';
          State.tenantName = '华东子公司';
          State.role = '子公司运营';
          State.permission = '受限权限';
        } else {
          State.tenant = 'sub';
          State.tenantName = '华南子公司';
          State.role = '子公司运营';
          State.permission = '受限权限';
        }
        document.getElementById('tenantName').textContent = State.tenantName;
        var roleTag = document.getElementById('roleTag');
        var permTag = document.getElementById('permTag');
        if (State.tenant === 'group') {
          roleTag.className = 'tenant-tag role-admin';
          roleTag.textContent = State.role;
          permTag.className = 'tenant-tag perm';
          permTag.textContent = State.permission;
        } else {
          roleTag.className = 'tenant-tag role-sub';
          roleTag.textContent = State.role;
          permTag.className = 'tenant-tag perm';
          permTag.style.cssText = 'background:var(--warning-light);color:var(--warning);';
          permTag.textContent = State.permission;
        }
        dropdown.remove();
        toast('已切换到 ' + State.tenantName);
        navigateTo(State.currentPage);
      });
    });
    document.addEventListener('click', function close() {
      dropdown.remove();
      document.removeEventListener('click', close);
    }, { once: true });
  });
}

/* ===================== 权限检查 ===================== */
function hasPermission(action) {
  if (State.tenant === 'group') return true;
  // 子公司权限限制
  var restricted = ['delete', 'system', 'account_manage'];
  return restricted.indexOf(action) === -1;
}

function permDisabled(action) {
  return !hasPermission(action) ? ' disabled' : '';
}

function permHidden(action) {
  return !hasPermission(action) ? ' style="display:none;"' : '';
}

/* ===================== 图表颜色 ===================== */
function getChartColors() {
  var style = getComputedStyle(document.documentElement);
  return {
    primary: '#165DFF',
    primaryLight: '#4080FF',
    success: '#00B42A',
    warning: '#FF7D00',
    danger: '#F53F3F',
    purple: '#722ED1',
    ink: '#1D2129',
    muted: '#86909C',
    border: '#E5E6EB',
    bg: '#F7F8FA',
    bg2: '#FFFFFF',
  };
}

/* ===================== 通用筛选栏 ===================== */
function chartFilterBar(extra) {
  var html = '<div class="chart-filter">' +
    '<select class="select" style="height:28px;font-size:12px;">' +
      '<option>全部渠道</option><option>官网H5</option><option>微信小程序</option><option>APP</option><option>企业微信</option>' +
    '</select>' +
    '<select class="select" style="height:28px;font-size:12px;">' +
      '<option>全部子公司</option><option>集团总部</option><option>华东子公司</option><option>华南子公司</option>' +
    '</select>' +
    '<select class="select" style="height:28px;font-size:12px;">' +
      '<option>近7天</option><option>近30天</option><option>近90天</option><option>自定义</option>' +
    '</select>';
  if (extra) html += extra;
  html += '</div>';
  return html;
}

/* ===================== 通用分页 ===================== */
function paginationHTML(total, current, pageSize) {
  var totalPages = Math.ceil(total / pageSize);
  var html = '<div class="table-pagination">' +
    '<span class="pagination-info">共 ' + total + ' 条记录，第 ' + current + '/' + totalPages + ' 页</span>' +
    '<div class="pagination-btns">' +
      '<div class="page-btn ' + (current <= 1 ? 'disabled' : '') + '">‹</div>';
  for (var i = 1; i <= Math.min(totalPages, 5); i++) {
    html += '<div class="page-btn ' + (i === current ? 'active' : '') + '">' + i + '</div>';
  }
  if (totalPages > 5) html += '<div class="page-btn disabled">...</div><div class="page-btn">' + totalPages + '</div>';
  html += '<div class="page-btn ' + (current >= totalPages ? 'disabled' : '') + '">›</div>' +
    '</div></div>';
  return html;
}

/* ===================== 页面渲染器 ===================== */
var PageRenderers = {};
var PageInit = {};

/* -------------------- 模块1: 首页仪表盘 -------------------- */
PageRenderers.dashboard = function() {
  return '' +
  '<div class="page-header">' +
    '<span class="page-title">首页仪表盘</span>' +
    '<span class="page-desc">实时监控AI客服全链路运营数据</span>' +
    '<div style="margin-left:auto;display:flex;gap:8px;">' +
      '<select class="select"><option>全部子公司</option><option>集团总部</option><option>华东子公司</option><option>华南子公司</option></select>' +
      '<select class="select"><option>今日</option><option>近7天</option><option>近30天</option></select>' +
      '<button class="btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出报表</button>' +
    '</div>' +
  '</div>' +
  '<div class="grid-4 mb-16">' +
    '<div class="stat-card">' +
      '<div class="stat-icon blue">💬</div>' +
      '<div class="stat-label">今日总会话数</div>' +
      '<div class="stat-value">8,420<span class="unit">次</span></div>' +
      '<div class="stat-trend up">↑ 12.5% 较昨日</div>' +
    '</div>' +
    '<div class="stat-card">' +
      '<div class="stat-icon green">✅</div>' +
      '<div class="stat-label">AI独立解决率</div>' +
      '<div class="stat-value">87.3<span class="unit">%</span></div>' +
      '<div class="stat-trend up">↑ 3.2% 较昨日</div>' +
    '</div>' +
    '<div class="stat-card">' +
      '<div class="stat-icon orange">⏱️</div>' +
      '<div class="stat-label">平均响应时长</div>' +
      '<div class="stat-value">1.2<span class="unit">秒</span></div>' +
      '<div class="stat-trend down">↓ 0.3秒 较昨日</div>' +
    '</div>' +
    '<div class="stat-card">' +
      '<div class="stat-icon purple">😊</div>' +
      '<div class="stat-label">客户满意度</div>' +
      '<div class="stat-value">94.6<span class="unit">%</span></div>' +
      '<div class="stat-trend up">↑ 1.8% 较昨日</div>' +
    '</div>' +
  '</div>' +
  '<div class="grid-2 mb-16">' +
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">会话量趋势（近7天）</span>' + chartFilterBar() + '</div>' +
      '<div class="card-body"><div id="chart-dashboard-trend" class="chart-container"></div></div>' +
    '</div>' +
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">AI解决率 vs 人工转接率</span>' + chartFilterBar() + '</div>' +
      '<div class="card-body"><div id="chart-dashboard-rate" class="chart-container"></div></div>' +
    '</div>' +
  '</div>' +
  '<div class="grid-3 mb-16">' +
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">渠道分布</span></div>' +
      '<div class="card-body"><div id="chart-dashboard-channel" class="chart-container short"></div></div>' +
    '</div>' +
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">业务场景分布</span></div>' +
      '<div class="card-body"><div id="chart-dashboard-scenario" class="chart-container short"></div></div>' +
    '</div>' +
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">实时处理状态</span></div>' +
      '<div class="card-body">' +
        '<div class="flex-between mb-12"><span class="text-sm text-muted">AI处理中</span><span class="text-bold" style="color:var(--primary);">326</span></div>' +
        '<div class="progress-bar mb-12"><div class="progress-fill" style="width:78%;background:var(--primary);"></div></div>' +
        '<div class="flex-between mb-12"><span class="text-sm text-muted">排队等待人工</span><span class="text-bold" style="color:var(--warning);">18</span></div>' +
        '<div class="progress-bar mb-12"><div class="progress-fill" style="width:12%;background:var(--warning);"></div></div>' +
        '<div class="flex-between mb-12"><span class="text-sm text-muted">人工处理中</span><span class="text-bold" style="color:var(--success);">42</span></div>' +
        '<div class="progress-bar mb-12"><div class="progress-fill" style="width:35%;background:var(--success);"></div></div>' +
        '<div class="flex-between mb-12"><span class="text-sm text-muted">离线回访待处理</span><span class="text-bold" style="color:var(--danger);">6</span></div>' +
        '<div class="progress-bar"><div class="progress-fill" style="width:8%;background:var(--danger);"></div></div>' +
      '</div>' +
    '</div>' +
  '</div>' +
  '<div class="grid-2">' +
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">高频问题TOP5</span><button class="btn-text" onclick="App.navigateTo(\'analytics\')">查看全部 →</button></div>' +
      '<div class="card-body no-pad"><div class="table-wrap"><table class="data-table">' +
        '<thead><tr><th>排名</th><th>问题</th><th>出现次数</th><th>AI解决率</th></tr></thead>' +
        '<tbody>' +
          '<tr><td><span class="badge blue">1</span></td><td>怎么退货？</td><td>342</td><td><span class="badge green">96%</span></td></tr>' +
          '<tr><td><span class="badge blue">2</span></td><td>发货要多久？</td><td>287</td><td><span class="badge green">94%</span></td></tr>' +
          '<tr><td><span class="badge blue">3</span></td><td>保修期多久？</td><td>256</td><td><span class="badge green">92%</span></td></tr>' +
          '<tr><td><span class="badge blue">4</span></td><td>可以开发票吗？</td><td>198</td><td><span class="badge orange">78%</span></td></tr>' +
          '<tr><td><span class="badge blue">5</span></td><td>怎么成为VIP？</td><td>165</td><td><span class="badge red">0%</span></td></tr>' +
        '</tbody>' +
      '</table></div></div>' +
    '</div>' +
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">待处理事项</span><button class="btn-text" onclick="App.navigateTo(\'review\')">前往处理 →</button></div>' +
      '<div class="card-body">' +
        '<div class="timeline">' +
          '<div class="timeline-item"><div class="timeline-time">10:30</div><div class="timeline-content">AI复盘发现 <strong>5条</strong> 错题需修正</div></div>' +
          '<div class="timeline-item"><div class="timeline-time">10:15</div><div class="timeline-content"><strong>6条</strong> 未解决问题待处理</div></div>' +
          '<div class="timeline-item"><div class="timeline-time">09:50</div><div class="timeline-content">VIP会员会话 <strong>3条</strong> 待人工接入</div></div>' +
          '<div class="timeline-item"><div class="timeline-time">09:30</div><div class="timeline-content">知识库「促销活动规则」待审核</div></div>' +
          '<div class="timeline-item"><div class="timeline-time">09:00</div><div class="timeline-content">训练样本 <strong>2条</strong> 待标注训练</div></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
};

PageInit.dashboard = function() {
  var colors = getChartColors();
  // 趋势图
  var trendChart = echarts.init(document.getElementById('chart-dashboard-trend'), null, { renderer: 'svg' });
  trendChart.setOption({
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['AI处理', '人工处理'], right: 0, top: 0, textStyle: { color: colors.muted, fontSize: 12 } },
    grid: { left: 40, right: 10, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: ['7/6','7/7','7/8','7/9','7/10','7/11','7/12'], axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.muted, fontSize: 11 } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: colors.border, type: 'dashed' } }, axisLabel: { color: colors.muted, fontSize: 11 } },
    series: [
      { name: 'AI处理', type: 'line', smooth: true, data: [6200, 6500, 6800, 7100, 6900, 7300, 7400], itemStyle: { color: colors.primary }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,93,255,0.2)' }, { offset: 1, color: 'rgba(22,93,255,0)' }] } } },
      { name: '人工处理', type: 'line', smooth: true, data: [980, 1020, 950, 1100, 980, 1050, 1020], itemStyle: { color: colors.success }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,180,42,0.15)' }, { offset: 1, color: 'rgba(0,180,42,0)' }] } } }
    ]
  });
  State.charts.trend = trendChart;

  // 解决率
  var rateChart = echarts.init(document.getElementById('chart-dashboard-rate'), null, { renderer: 'svg' });
  rateChart.setOption({
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['AI解决率', '人工转接率'], right: 0, top: 0, textStyle: { color: colors.muted, fontSize: 12 } },
    grid: { left: 40, right: 10, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: ['7/6','7/7','7/8','7/9','7/10','7/11','7/12'], axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.muted, fontSize: 11 } },
    yAxis: { type: 'value', max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: colors.border, type: 'dashed' } }, axisLabel: { color: colors.muted, fontSize: 11, formatter: '{value}%' } },
    series: [
      { name: 'AI解决率', type: 'bar', data: [82, 84, 83, 85, 86, 86.5, 87.3], itemStyle: { color: colors.primary, borderRadius: [4,4,0,0] }, barWidth: 16 },
      { name: '人工转接率', type: 'bar', data: [18, 16, 17, 15, 14, 13.5, 12.7], itemStyle: { color: colors.warning, borderRadius: [4,4,0,0] }, barWidth: 16 }
    ]
  });
  State.charts.rate = rateChart;

  // 渠道分布
  var channelChart = echarts.init(document.getElementById('chart-dashboard-channel'), null, { renderer: 'svg' });
  channelChart.setOption({
    tooltip: { trigger: 'item', appendToBody: true },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['50%', '50%'],
      label: { color: colors.muted, fontSize: 11 },
      data: [
        { value: 3420, name: '官网H5', itemStyle: { color: colors.primary } },
        { value: 2180, name: '小程序', itemStyle: { color: colors.success } },
        { value: 1560, name: 'APP', itemStyle: { color: colors.warning } },
        { value: 890, name: '企微', itemStyle: { color: colors.purple } },
        { value: 370, name: '其他', itemStyle: { color: colors.muted } },
      ]
    }]
  });
  State.charts.channel = channelChart;

  // 场景分布
  var scenarioChart = echarts.init(document.getElementById('chart-dashboard-scenario'), null, { renderer: 'svg' });
  scenarioChart.setOption({
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: 60, right: 10, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: colors.border, type: 'dashed' } }, axisLabel: { color: colors.muted, fontSize: 11 } },
    yAxis: { type: 'category', data: ['售前咨询','售后服务','物流查询','会员服务','技术支持'], axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.muted, fontSize: 11 } },
    series: [{ type: 'bar', data: [3200, 2400, 1500, 820, 500], itemStyle: { color: colors.primary, borderRadius: [0,4,4,0] }, barWidth: 14 }]
  });
  State.charts.scenario = scenarioChart;

  window.addEventListener('resize', function() {
    Object.values(State.charts).forEach(function(c) { c && c.resize(); });
  });
};

/* -------------------- 模块2: AI人设配置 -------------------- */
PageRenderers.persona = function() {
  return '' +
  '<div class="page-header">' +
    '<span class="page-title">AI人设配置</span>' +
    '<span class="page-desc">管理AI客服人设形象、话术模板与敏感词过滤</span>' +
  '</div>' +
  '<div class="tabs" id="personaTabs">' +
    '<div class="tab-item active" data-tab="persona">AI人设管理 <span class="tab-count">' + State.personas.length + '</span></div>' +
    '<div class="tab-item" data-tab="sensitive">敏感词管理 <span class="tab-count">' + State.sensitiveWords.length + '</span></div>' +
  '</div>' +
  '<div id="personaTabContent">' + renderPersonaList() + '</div>';
};

function renderPersonaList() {
  var html = '<div class="filter-bar">' +
    '<div class="input-group" style="width:240px;"><span class="input-icon">🔍</span><input class="input input-with-icon" placeholder="搜索人设名称..." id="personaSearch"></div>' +
    '<select class="select"><option>全部状态</option><option>启用中</option><option>已停用</option></select>' +
    '<select class="select"><option>全部场景</option><option>售前咨询</option><option>售后维保</option><option>VIP服务</option><option>海外咨询</option></select>' +
    '<div style="margin-left:auto;">' +
      '<button class="btn" onclick="App.exportData()">导出</button>' +
      '<button class="btn btn-primary" onclick="App.openPersonaModal()" ' + permDisabled('create') + '>+ 新建AI人设</button>' +
    '</div>' +
  '</div>';
  html += '<div class="card"><div class="table-wrap"><table class="data-table">' +
    '<thead><tr><th>人设名称</th><th>应用场景</th><th>语气风格</th><th>绑定渠道</th><th>关联知识库</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody>';
  State.personas.forEach(function(p) {
    var channelHtml = p.channels.map(function(c) { return '<span class="badge gray">' + c + '</span>'; }).join(' ');
    var kbHtml = p.knowledgeBase.map(function(k) { return '<span class="badge blue">' + k + '</span>'; }).join(' ');
    html += '<tr>' +
      '<td><div class="flex-center gap-8"><span class="avatar-md avatar-' + p.avatar + '">' + p.name.charAt(0) + '</span><span class="text-bold">' + p.name + '</span></div></td>' +
      '<td>' + p.scenario + '</td>' +
      '<td>' + p.tone + '</td>' +
      '<td>' + channelHtml + '</td>' +
      '<td>' + kbHtml + '</td>' +
      '<td>' + (p.status === 'active' ? '<span class="badge dot green">启用中</span>' : '<span class="badge dot gray">已停用</span>') + '</td>' +
      '<td class="text-sm text-muted">' + p.updateTime + '</td>' +
      '<td><div class="flex gap-8">' +
        '<button class="btn-text btn-sm" onclick="App.openPersonaModal(\'' + p.id + '\')">编辑</button>' +
        '<button class="btn-text btn-sm" onclick="App.openPersonaDetail(\'' + p.id + '\')">查看</button>' +
        '<button class="btn-text btn-sm ' + (p.status === 'active' ? 'warning' : '') + '" onclick="App.togglePersonaStatus(\'' + p.id + '\')" ' + permDisabled('edit') + '>' + (p.status === 'active' ? '停用' : '启用') + '</button>' +
        '<button class="btn-text btn-sm danger" onclick="App.deletePersona(\'' + p.id + '\')" ' + permDisabled('delete') + '>删除</button>' +
      '</div></td>' +
    '</tr>';
  });
  html += '</tbody></table></div>' + paginationHTML(State.personas.length, 1, 10) + '</div>';
  return html;
}

function renderSensitiveList() {
  var html = '<div class="filter-bar">' +
    '<div class="input-group" style="width:240px;"><span class="input-icon">🔍</span><input class="input input-with-icon" placeholder="搜索敏感词..."></div>' +
    '<select class="select"><option>全部分类</option><option>品牌竞品</option><option>负面情绪</option><option>政治敏感</option><option>不文明用语</option><option>商业机密</option><option>隐私保护</option><option>合规风险</option></select>' +
    '<select class="select"><option>全部等级</option><option>高</option><option>中</option><option>低</option></select>' +
    '<div style="margin-left:auto;">' +
      '<button class="btn">批量导入</button>' +
      '<button class="btn btn-primary" onclick="App.openSensitiveModal()" ' + permDisabled('create') + '>+ 新增敏感词</button>' +
    '</div>' +
  '</div>';
  html += '<div class="card"><div class="table-wrap"><table class="data-table">' +
    '<thead><tr><th><label class="checkbox"><input type="checkbox"></label></th><th>敏感词</th><th>分类</th><th>风险等级</th><th>处理方式</th><th>替换内容</th><th>状态</th><th>操作</th></tr></thead><tbody>';
  State.sensitiveWords.forEach(function(s) {
    var levelBadge = s.level === 'high' ? '<span class="badge red">高</span>' : s.level === 'medium' ? '<span class="badge orange">中</span>' : '<span class="badge gray">低</span>';
    html += '<tr>' +
      '<td><label class="checkbox"><input type="checkbox"></label></td>' +
      '<td class="text-bold">' + s.word + '</td>' +
      '<td><span class="badge purple">' + s.category + '</span></td>' +
      '<td>' + levelBadge + '</td>' +
      '<td>' + s.action + '</td>' +
      '<td class="text-muted">' + (s.replaceWith || '-') + '</td>' +
      '<td>' + (s.status === 'active' ? '<span class="badge dot green">生效中</span>' : '<span class="badge dot gray">已停用</span>') + '</td>' +
      '<td><div class="flex gap-8">' +
        '<button class="btn-text btn-sm" onclick="App.openSensitiveModal(\'' + s.id + '\')">编辑</button>' +
        '<button class="btn-text btn-sm danger" onclick="App.deleteSensitive(\'' + s.id + '\')" ' + permDisabled('delete') + '>删除</button>' +
      '</div></td>' +
    '</tr>';
  });
  html += '</tbody></table></div>' + paginationHTML(State.sensitiveWords.length, 1, 10) + '</div>';
  return html;
}

PageInit.persona = function() {
  var tabs = document.querySelectorAll('#personaTabs .tab-item');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var content = document.getElementById('personaTabContent');
      if (tab.dataset.tab === 'persona') {
        content.innerHTML = renderPersonaList();
      } else {
        content.innerHTML = renderSensitiveList();
      }
    });
  });
};

/* -------------------- 模块3: 知识库投喂 -------------------- */
PageRenderers.knowledge = function() {
  var html = '' +
  '<div class="page-header">' +
    '<span class="page-title">知识库投喂</span>' +
    '<span class="page-desc">管理AI客服知识库内容，支持多格式导入与关联人设</span>' +
    '<div style="margin-left:auto;display:flex;gap:8px;">' +
      '<button class="btn">批量导入</button>' +
      '<button class="btn btn-primary" onclick="App.openKnowledgeModal()" ' + permDisabled('create') + '>+ 新增知识</button>' +
    '</div>' +
  '</div>' +
  '<div class="grid-4 mb-16">' +
    '<div class="stat-card"><div class="stat-icon blue">📚</div><div class="stat-label">知识库总数</div><div class="stat-value">' + State.knowledgeBase.length + '<span class="unit">套</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon green">📝</div><div class="stat-label">问答对总数</div><div class="stat-value">1,179<span class="unit">条</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon orange">🔄</div><div class="stat-label">待审核</div><div class="stat-value">1<span class="unit">套</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon purple">📊</div><div class="stat-label">本月更新</div><div class="stat-value">23<span class="unit">次</span></div></div>' +
  '</div>' +
  '<div class="filter-bar">' +
    '<div class="input-group" style="width:260px;"><span class="input-icon">🔍</span><input class="input input-with-icon" placeholder="搜索知识库名称..."></div>' +
    '<select class="select"><option>全部分类</option><option>产品知识</option><option>售后政策</option><option>会员服务</option><option>物流服务</option><option>营销活动</option><option>技术支持</option><option>国际业务</option></select>' +
    '<select class="select"><option>全部格式</option><option>文档</option><option>表格</option><option>问答对</option><option>PDF</option><option>知识图谱</option></select>' +
    '<select class="select"><option>全部状态</option><option>已生效</option><option>草稿</option><option>待审核</option></select>' +
  '</div>' +
  '<div class="card"><div class="table-wrap"><table class="data-table">' +
    '<thead><tr><th>知识库名称</th><th>分类</th><th>格式</th><th>关联AI人设</th><th>问答对数</th><th>来源</th><th>文件大小</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody>';
  State.knowledgeBase.forEach(function(k) {
    var statusBadge = k.status === 'active' ? '<span class="badge dot green">已生效</span>' : k.status === 'draft' ? '<span class="badge dot orange">草稿</span>' : '<span class="badge dot gray">待审核</span>';
    html += '<tr>' +
      '<td class="text-bold">' + k.title + '</td>' +
      '<td><span class="badge blue">' + k.category + '</span></td>' +
      '<td><span class="badge gray">' + k.format + '</span></td>' +
      '<td>' + k.persona + '</td>' +
      '<td>' + k.qaCount + ' 条</td>' +
      '<td class="text-sm">' + k.source + '</td>' +
      '<td class="text-sm text-muted">' + k.fileSize + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td class="text-sm text-muted">' + k.updateTime + '</td>' +
      '<td><div class="flex gap-8">' +
        '<button class="btn-text btn-sm" onclick="App.openKnowledgeModal(\'' + k.id + '\')">编辑</button>' +
        '<button class="btn-text btn-sm" onclick="App.viewKnowledge(\'' + k.id + '\')">查看问答</button>' +
        '<button class="btn-text btn-sm danger" onclick="App.deleteKnowledge(\'' + k.id + '\')" ' + permDisabled('delete') + '>删除</button>' +
      '</div></td>' +
    '</tr>';
  });
  html += '</tbody></table></div>' + paginationHTML(State.knowledgeBase.length, 1, 10) + '</div>';
  return html;
};

PageInit.knowledge = function() {};

/* -------------------- 模块4: AI自动复盘 -------------------- */
PageRenderers.review = function() {
  var pendingCount = State.reviewData.unresolved.length;
  var archivedCount = State.reviewData.archived.length;
  var errorCount = State.reviewData.errors.filter(function(e){return e.status==='pending';}).length;
  return '' +
  '<div class="page-header">' +
    '<span class="page-title">AI自动复盘</span>' +
    '<span class="page-desc">自动分析AI客服对话中的错误与未解决问题，驱动数据自迭代闭环</span>' +
  '</div>' +
  '<div class="grid-4 mb-16">' +
    '<div class="stat-card"><div class="stat-icon red">❌</div><div class="stat-label">待处理错题</div><div class="stat-value">' + errorCount + '<span class="unit">条</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon orange">❓</div><div class="stat-label">未解决问题</div><div class="stat-value">' + pendingCount + '<span class="unit">条</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon gray">📦</div><div class="stat-label">暂缓归档</div><div class="stat-value">' + archivedCount + '<span class="unit">条</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon green">✅</div><div class="stat-label">本月已修复</div><div class="stat-value">47<span class="unit">条</span></div></div>' +
  '</div>' +
  '<div class="tabs" id="reviewTabs">' +
    '<div class="tab-item active" data-tab="errors">错题台账 <span class="tab-count">' + errorCount + '</span></div>' +
    '<div class="tab-item" data-tab="unresolved">未解决问题汇总 <span class="tab-count">' + pendingCount + '</span></div>' +
  '</div>' +
  '<div id="reviewTabContent">' + renderErrorList() + '</div>';
};

function renderErrorList() {
  var html = '<div class="filter-bar">' +
    '<select class="select"><option>全部错误类型</option><option>回答不完整</option><option>信息缺失</option><option>回答不准确</option></select>' +
    '<select class="select"><option>全部严重程度</option><option>高</option><option>中</option><option>低</option></select>' +
    '<select class="select"><option>全部状态</option><option>待处理</option><option>已修复</option></select>' +
    '<div style="margin-left:auto;"><button class="btn">批量导出</button></div>' +
  '</div>';
  html += '<div class="card"><div class="table-wrap"><table class="data-table">' +
    '<thead><tr><th>问题</th><th>AI回答</th><th>正确答案</th><th>错误类型</th><th>严重度</th><th>出现次数</th><th>关联人设</th><th>状态</th><th>操作</th></tr></thead><tbody>';
  State.reviewData.errors.forEach(function(e) {
    var sevBadge = e.severity === 'high' ? '<span class="badge red">高</span>' : e.severity === 'medium' ? '<span class="badge orange">中</span>' : '<span class="badge gray">低</span>';
    var statusBadge = e.status === 'pending' ? '<span class="badge dot orange">待处理</span>' : '<span class="badge dot green">已修复</span>';
    html += '<tr>' +
      '<td style="max-width:200px;" class="text-bold">' + e.question + '</td>' +
      '<td style="max-width:200px;color:var(--danger);">' + e.aiAnswer + '</td>' +
      '<td style="max-width:250px;color:var(--success);">' + e.correctAnswer + '</td>' +
      '<td><span class="badge purple">' + e.errorType + '</span></td>' +
      '<td>' + sevBadge + '</td>' +
      '<td><span class="text-bold">' + e.count + '</span> 次</td>' +
      '<td class="text-sm">' + e.persona + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td><div class="flex gap-8">' +
        (e.status === 'pending' ?
          '<button class="btn-text btn-sm" onclick="App.fixError(\'' + e.id + '\')">修正</button>' +
          '<button class="btn-text btn-sm" onclick="App.sendToTraining(\'' + e.id + '\')">→送训练</button>' +
          '<button class="btn-text btn-sm warning" onclick="App.archiveError(\'' + e.id + '\')">暂缓</button>'
        :
          '<button class="btn-text btn-sm" onclick="App.viewErrorDetail(\'' + e.id + '\')">查看</button>'
        ) +
      '</div></td>' +
    '</tr>';
  });
  html += '</tbody></table></div>' + paginationHTML(State.reviewData.errors.length, 1, 10) + '</div>';
  return html;
}

function renderUnresolvedList(tab) {
  var list = tab === 'archived' ? State.reviewData.archived : State.reviewData.unresolved;
  var isArchived = tab === 'archived';
  var html = '<div class="filter-bar">' +
    '<div class="flex gap-8" style="background:var(--bg);padding:4px;border-radius:6px;">' +
      '<button class="btn btn-sm ' + (!isArchived ? 'btn-primary' : '') + '" onclick="App.switchReviewTab(\'pending\')">待处理 (' + State.reviewData.unresolved.length + ')</button>' +
      '<button class="btn btn-sm ' + (isArchived ? 'btn-primary' : '') + '" onclick="App.switchReviewTab(\'archived\')">暂缓归档 (' + State.reviewData.archived.length + ')</button>' +
    '</div>' +
    '<select class="select"><option>全部渠道</option><option>官网H5</option><option>微信小程序</option><option>APP</option></select>' +
    '<select class="select"><option>全部人设</option>' + State.personas.map(function(p){return '<option>'+p.name+'</option>';}).join('') + '</select>' +
    '<div style="margin-left:auto;">' +
      (isArchived ? '' : '<button class="btn" onclick="App.batchMerge()">批量合并同义</button>') +
    '</div>' +
  '</div>';
  html += '<div class="card"><div class="table-wrap"><table class="data-table">' +
    '<thead><tr>' +
    (!isArchived ? '<th><label class="checkbox"><input type="checkbox" id="unresolvedSelectAll"></label></th>' : '') +
    '<th>未解决问题</th><th>同义问题</th><th>出现次数</th><th>标签</th><th>渠道</th><th>关联人设</th>' +
    (isArchived ? '<th>归档原因</th><th>归档日期</th>' : '<th>最后出现</th>') +
    '<th>操作</th></tr></thead><tbody>';
  list.forEach(function(u) {
    var tagHtml = u.tags.map(function(t){return '<span class="badge gray">'+t+'</span>';}).join(' ');
    var similarHtml = u.similarQuestions.map(function(q){return '<div class="text-sm text-muted">• '+q+'</div>';}).join('');
    html += '<tr>' +
      (!isArchived ? '<td><label class="checkbox"><input type="checkbox" class="unresolved-check" value="'+u.id+'"></label></td>' : '') +
      '<td class="text-bold" style="max-width:220px;">' + u.question + '</td>' +
      '<td style="max-width:200px;">' + similarHtml + '</td>' +
      '<td><span class="text-bold">' + u.count + '</span> 次</td>' +
      '<td>' + tagHtml + '</td>' +
      '<td><span class="badge blue">'+u.channel+'</span></td>' +
      '<td class="text-sm">' + u.persona + '</td>' +
      (isArchived ? '<td class="text-sm text-muted" style="max-width:200px;">'+u.archiveReason+'</td><td class="text-sm">'+u.archiveDate+'</td>' : '<td class="text-sm text-muted">'+u.lastTime+'</td>') +
      '<td><div class="flex gap-8">' +
        (isArchived ?
          '<button class="btn-text btn-sm" onclick="App.restoreArchived(\''+u.id+'\')">恢复</button>' +
          '<button class="btn-text btn-sm" onclick="App.viewSession(\''+u.id+'\')">查看会话</button>'
        :
          '<button class="btn-text btn-sm" onclick="App.openResolveModal(\''+u.id+'\')">去解决</button>' +
          '<button class="btn-text btn-sm" onclick="App.mergeSimilar(\''+u.id+'\')">合并同义</button>' +
          '<button class="btn-text btn-sm" onclick="App.viewSession(\''+u.id+'\')">查看会话</button>' +
          '<button class="btn-text btn-sm warning" onclick="App.archiveUnresolved(\''+u.id+'\')">暂缓归档</button>'
        ) +
      '</div></td>' +
    '</tr>';
  });
  html += '</tbody></table></div>' + paginationHTML(list.length, 1, 10) + '</div>';
  return html;
}

PageInit.review = function() {
  var tabs = document.querySelectorAll('#reviewTabs .tab-item');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var content = document.getElementById('reviewTabContent');
      if (tab.dataset.tab === 'errors') {
        content.innerHTML = renderErrorList();
      } else {
        content.innerHTML = renderUnresolvedList('pending');
      }
    });
  });
};

/* -------------------- 模块5: AI调教训练 -------------------- */
PageRenderers.training = function() {
  var trained = State.trainingSamples.filter(function(t){return t.status==='trained';}).length;
  var pending = State.trainingSamples.filter(function(t){return t.status==='pending';}).length;
  var html = '' +
  '<div class="page-header">' +
    '<span class="page-title">AI调教训练</span>' +
    '<span class="page-desc">训练样本管理，区分训练同义（模型微调）与知识库同义（线上检索）</span>' +
    '<div style="margin-left:auto;display:flex;gap:8px;">' +
      '<button class="btn">批量导入</button>' +
      '<button class="btn btn-primary" onclick="App.openTrainingModal()" ' + permDisabled('create') + '>+ 新增训练样本</button>' +
    '</div>' +
  '</div>' +
  '<div class="grid-4 mb-16">' +
    '<div class="stat-card"><div class="stat-icon blue">🎯</div><div class="stat-label">训练样本总数</div><div class="stat-value">' + State.trainingSamples.length + '<span class="unit">条</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon green">✅</div><div class="stat-label">已训练</div><div class="stat-value">' + trained + '<span class="unit">条</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon orange">⏳</div><div class="stat-label">待训练</div><div class="stat-value">' + pending + '<span class="unit">条</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon purple">📈</div><div class="stat-label">平均准确率</div><div class="stat-value">94.5<span class="unit">%</span></div></div>' +
  '</div>' +
  '<div class="filter-bar">' +
    '<div class="input-group" style="width:240px;"><span class="input-icon">🔍</span><input class="input input-with-icon" placeholder="搜索问题..."></div>' +
    '<select class="select"><option>全部分类</option><option>售后流程</option><option>物流配送</option><option>售后保修</option><option>财务发票</option><option>会员服务</option></select>' +
    '<select class="select"><option>全部状态</option><option>已训练</option><option>待训练</option></select>' +
    '<select class="select"><option>全部来源</option><option>人工标注</option><option>AI采集</option></select>' +
  '</div>' +
  '<div class="card"><div class="table-wrap"><table class="data-table">' +
    '<thead><tr><th>标准问题</th><th>分类</th><th>训练同义词</th><th>知识库同义词</th><th>准确率</th><th>来源</th><th>状态</th><th>最后训练</th><th>操作</th></tr></thead><tbody>';
  State.trainingSamples.forEach(function(t) {
    var trainSynHtml = t.trainSynonyms.map(function(s){return '<span class="badge blue">'+s+'</span>';}).join(' ');
    var kbSynHtml = t.kbSynonyms.map(function(s){return '<span class="badge green">'+s+'</span>';}).join(' ');
    var statusBadge = t.status === 'trained' ? '<span class="badge dot green">已训练</span>' : '<span class="badge dot orange">待训练</span>';
    var accDisplay = t.accuracy > 0 ? '<span class="' + (t.accuracy >= 95 ? 'badge green' : t.accuracy >= 90 ? 'badge blue' : 'badge orange') + '">' + t.accuracy + '%</span>' : '<span class="badge gray">-</span>';
    html += '<tr>' +
      '<td style="max-width:200px;" class="text-bold">' + t.standardQuestion + '</td>' +
      '<td><span class="badge purple">' + t.category + '</span></td>' +
      '<td style="max-width:200px;">' + trainSynHtml + '</td>' +
      '<td style="max-width:200px;">' + kbSynHtml + '</td>' +
      '<td>' + accDisplay + '</td>' +
      '<td class="text-sm">' + t.source + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td class="text-sm text-muted">' + (t.lastTrained || '-') + '</td>' +
      '<td><div class="flex gap-8">' +
        '<button class="btn-text btn-sm" onclick="App.openTrainingModal(\'' + t.id + '\')">编辑</button>' +
        (t.status === 'pending' ? '<button class="btn-text btn-sm" onclick="App.trainSample(\'' + t.id + '\')">训练</button>' : '<button class="btn-text btn-sm" onclick="App.retrainSample(\'' + t.id + '\')">重训</button>') +
        '<button class="btn-text btn-sm danger" onclick="App.deleteSample(\'' + t.id + '\')" ' + permDisabled('delete') + '>删除</button>' +
      '</div></td>' +
    '</tr>';
  });
  html += '</tbody></table></div>' + paginationHTML(State.trainingSamples.length, 1, 10) + '</div>';
  return html;
};

PageInit.training = function() {};

/* -------------------- 模块6: 运营数据分析报告 -------------------- */
PageRenderers.analytics = function() {
  return '' +
  '<div class="page-header">' +
    '<span class="page-title">运营数据分析报告</span>' +
    '<span class="page-desc">全链路转化漏斗、流失统计、高频提问、情绪舆情与AI准确率趋势</span>' +
    '<div style="margin-left:auto;display:flex;gap:8px;">' +
      '<button class="btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出报告</button>' +
    '</div>' +
  '</div>' +
  // 全链路正向转化漏斗
  '<div class="card mb-16">' +
    '<div class="card-header"><span class="card-title">全链路正向转化漏斗</span>' + chartFilterBar('<span class="text-sm text-muted" style="margin-left:8px;">点击各阶段可查看详情</span>') + '</div>' +
    '<div class="card-body">' +
      '<div id="funnelContainer" style="display:flex;gap:24px;align-items:center;">' +
        '<div style="flex:1;">' +
          '<div class="funnel-chart">' +
            '<div class="funnel-stage" style="background:#165DFF;width:100%;" onclick="App.openFunnelDrill(\'visit\')"><span class="stage-name">访问触达</span><span><span class="stage-value">12,840</span><span class="stage-rate">100%</span></span></div>' +
            '<div class="funnel-arrow">↓ 转化率 87.3%</div>' +
            '<div class="funnel-stage" style="background:#4080FF;width:90%;" onclick="App.openFunnelDrill(\'engage\')"><span class="stage-name">发起对话</span><span><span class="stage-value">11,210</span><span class="stage-rate">87.3%</span></span></div>' +
            '<div class="funnel-arrow">↓ 转化率 95.2%</div>' +
            '<div class="funnel-stage" style="background:#00B42A;width:80%;" onclick="App.openFunnelDrill(\'ai_resolve\')"><span class="stage-name">AI独立解决</span><span><span class="stage-value">9,782</span><span class="stage-rate">87.2%</span></span></div>' +
            '<div class="funnel-arrow" style="color:var(--warning);">↓ 转人工率 12.8%</div>' +
            '<div class="funnel-stage" style="background:#FF7D00;width:65%;" onclick="App.openFunnelDrill(\'human\')"><span class="stage-name">人工接入</span><span><span class="stage-value">1,428</span><span class="stage-rate">12.8%</span></span></div>' +
            '<div class="funnel-arrow">↓ 解决率 89.6%</div>' +
            '<div class="funnel-stage" style="background:#722ED1;width:55%;" onclick="App.openFunnelDrill(\'resolve\')"><span class="stage-name">问题解决</span><span><span class="stage-value">1,279</span><span class="stage-rate">89.6%</span></span></div>' +
            '<div class="funnel-arrow">↓ 满意率 94.6%</div>' +
            '<div class="funnel-stage" style="background:#F53F3F;width:50%;" onclick="App.openFunnelDrill(\'satisfied\')"><span class="stage-name">客户满意</span><span><span class="stage-value">1,210</span><span class="stage-rate">94.6%</span></span></div>' +
          '</div>' +
        '</div>' +
        '<div style="width:280px;">' +
          '<div class="card" style="background:var(--bg);border:none;">' +
            '<div style="padding:16px;">' +
              '<div class="text-sm text-muted mb-8">整体转化率</div>' +
              '<div class="text-2xl" style="color:var(--primary);">9.42%</div>' +
              '<div class="text-sm text-muted mt-12">关键流失节点</div>' +
              '<div class="text-bold" style="color:var(--warning);">AI→人工转接</div>' +
              '<div class="text-sm text-muted mt-12">建议</div>' +
              '<div class="text-sm">优化AI在复杂售后场景的解决能力，预计可提升整体转化率3-5%</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +
  '<div class="grid-2 mb-16">' +
    // 流失统计
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">流失节点统计</span>' + chartFilterBar() + '</div>' +
      '<div class="card-body"><div id="chart-analytics-churn" class="chart-container"></div></div>' +
    '</div>' +
    // 高频提问排行
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">高频提问排行TOP10</span>' + chartFilterBar() + '</div>' +
      '<div class="card-body"><div id="chart-analytics-topq" class="chart-container"></div></div>' +
    '</div>' +
  '</div>' +
  '<div class="grid-2 mb-16">' +
    // 情绪舆情
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">客户情绪舆情分布</span>' + chartFilterBar() + '</div>' +
      '<div class="card-body">' +
        '<div id="chart-analytics-sentiment" class="chart-container short"></div>' +
        '<div class="mt-12">' +
          '<div class="flex-between mb-8"><span class="text-sm text-muted">负面情绪会话</span><span class="text-bold" style="color:var(--danger);">286 条 (3.4%)</span></div>' +
          '<div class="progress-bar mb-12"><div class="progress-fill" style="width:3.4%;background:var(--danger);"></div></div>' +
          '<div class="flex-between mb-8"><span class="text-sm text-muted">需人工介入</span><span class="text-bold" style="color:var(--warning);">89 条</span></div>' +
          '<div class="progress-bar"><div class="progress-fill" style="width:12%;background:var(--warning);"></div></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    // AI准确率7日趋势
    '<div class="card">' +
      '<div class="card-header"><span class="card-title">AI准确率7日趋势</span>' + chartFilterBar() + '</div>' +
      '<div class="card-body"><div id="chart-analytics-accuracy" class="chart-container"></div></div>' +
    '</div>' +
  '</div>';
};

PageInit.analytics = function() {
  var colors = getChartColors();

  // 流失统计
  var churnChart = echarts.init(document.getElementById('chart-analytics-churn'), null, { renderer: 'svg' });
  churnChart.setOption({
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['访问→对话','对话→AI解决','AI→人工','人工→解决','解决→满意'], axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.muted, fontSize: 10, rotate: 15 } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: colors.border, type: 'dashed' } }, axisLabel: { color: colors.muted, fontSize: 11 } },
    series: [{
      type: 'bar', data: [
        { value: 1630, itemStyle: { color: colors.primary } },
        { value: 1428, itemStyle: { color: colors.warning } },
        { value: 149, itemStyle: { color: colors.danger } },
        { value: 69, itemStyle: { color: colors.danger } },
        { value: 69, itemStyle: { color: colors.danger } },
      ],
      itemStyle: { borderRadius: [4,4,0,0] }, barWidth: 32,
      label: { show: true, position: 'top', color: colors.ink, fontSize: 12, fontWeight: 600 }
    }]
  });
  State.charts.churn = churnChart;

  // 高频提问
  var topqChart = echarts.init(document.getElementById('chart-analytics-topq'), null, { renderer: 'svg' });
  topqChart.setOption({
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 30, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: colors.border, type: 'dashed' } }, axisLabel: { color: colors.muted, fontSize: 11 } },
    yAxis: { type: 'category', data: ['怎么退货？','发货要多久？','保修期多久？','可以开发票吗？','怎么成为VIP？','产品有现货吗？','退换货运费谁出？','会员积分怎么用？','订单能改地址吗？','产品支持以旧换新？'].reverse(), axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.muted, fontSize: 11 } },
    series: [{
      type: 'bar', data: [165,198,256,287,342,120,98,85,72,60].reverse(),
      itemStyle: { color: function(p) { var palette = [colors.primary,colors.primary,colors.primary,colors.primary,colors.primary,colors.success,colors.success,colors.warning,colors.warning,colors.danger]; return palette[p.dataIndex]; }, borderRadius: [0,4,4,0] },
      barWidth: 16,
      label: { show: true, position: 'right', color: colors.ink, fontSize: 11 }
    }]
  });
  State.charts.topq = topqChart;

  // 情绪分布
  var sentimentChart = echarts.init(document.getElementById('chart-analytics-sentiment'), null, { renderer: 'svg' });
  sentimentChart.setOption({
    tooltip: { trigger: 'item', appendToBody: true },
    series: [{
      type: 'pie', radius: ['40%', '65%'], center: ['50%', '50%'],
      label: { formatter: '{b}\n{d}%', color: colors.muted, fontSize: 11 },
      data: [
        { value: 6840, name: '正面', itemStyle: { color: colors.success } },
        { value: 1280, name: '中性', itemStyle: { color: colors.muted } },
        { value: 286, name: '负面', itemStyle: { color: colors.danger } },
      ]
    }]
  });
  State.charts.sentiment = sentimentChart;

  // AI准确率7日趋势
  var accChart = echarts.init(document.getElementById('chart-analytics-accuracy'), null, { renderer: 'svg' });
  accChart.setOption({
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: ['7/6','7/7','7/8','7/9','7/10','7/11','7/12'], axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.muted, fontSize: 11 } },
    yAxis: { type: 'value', min: 80, max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: colors.border, type: 'dashed' } }, axisLabel: { color: colors.muted, fontSize: 11, formatter: '{value}%' } },
    series: [{
      type: 'line', smooth: true, data: [88.2, 89.5, 90.1, 91.3, 92.8, 93.6, 94.5],
      itemStyle: { color: colors.primary }, lineStyle: { width: 3 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,93,255,0.2)' }, { offset: 1, color: 'rgba(22,93,255,0)' }] } },
      markLine: { data: [{ yAxis: 95, name: '目标线', lineStyle: { color: colors.success, type: 'dashed' }, label: { formatter: '目标95%', color: colors.success, fontSize: 11 } }] }
    }]
  });
  State.charts.accuracy = accChart;

  window.addEventListener('resize', function() {
    [churnChart, topqChart, sentimentChart, accChart].forEach(function(c) { c.resize(); });
  });
};

/* -------------------- 模块7: 协同工作台 -------------------- */
PageRenderers.workspace = function() {
  return '' +
  '<div class="chat-layout">' +
    // 左侧：会话列表 + 离线回访
    '<div class="chat-sidebar">' +
      '<div class="chat-sidebar-header">' +
        '<div class="chat-sidebar-tabs">' +
          '<div class="chat-tab active" data-ct="online">在线会话 (' + State.chatSessions.filter(function(s){return s.status!=='offline';}).length + ')</div>' +
          '<div class="chat-tab" data-ct="offline">离线回访 (' + State.chatSessions.filter(function(s){return s.status==='offline';}).length + ')</div>' +
        '</div>' +
        '<div class="input-group"><span class="input-icon">🔍</span><input class="input input-with-icon" placeholder="搜索客户/会话..." style="height:28px;font-size:12px;"></div>' +
      '</div>' +
      '<div class="chat-list" id="chatList">' + renderChatList() + '</div>' +
    '</div>' +
    // 右侧：聊天对话框
    '<div class="chat-main" id="chatMain">' + renderChatMain() + '</div>' +
  '</div>';
};

function renderChatList(filter) {
  var sessions = filter === 'offline' ? State.chatSessions.filter(function(s){return s.status==='offline';}) : State.chatSessions.filter(function(s){return s.status!=='offline';});
  var html = '';
  sessions.forEach(function(s) {
    var active = s.id === State.currentChatId ? ' active' : '';
    var statusColor = s.status === 'ai' ? 'avatar-blue' : s.status === 'waiting' ? 'avatar-orange' : s.status === 'human' ? 'avatar-green' : 'avatar-gray';
    var statusTag = s.status === 'ai' ? '<span class="badge blue">AI</span>' : s.status === 'waiting' ? '<span class="badge orange">待接入</span>' : s.status === 'human' ? '<span class="badge green">人工</span>' : '<span class="badge gray">离线</span>';
    html += '<div class="chat-list-item' + active + '" data-cid="' + s.id + '">' +
      '<div class="avatar ' + statusColor + '">' + s.customerName.charAt(0) + '</div>' +
      '<div class="info">' +
        '<div class="name"><span>' + s.customerName + ' ' + statusTag + '</span><span class="time">' + s.time + '</span></div>' +
        '<div class="preview">' + s.lastMsg + '</div>' +
      '</div>' +
      (s.unread > 0 ? '<div class="unread">' + s.unread + '</div>' : '') +
    '</div>';
  });
  return html;
}

function renderChatMain() {
  var session = State.chatSessions.find(function(s){return s.id === State.currentChatId;});
  if (!session) return '<div class="empty-state"><div class="empty-icon">💬</div>请选择一个会话</div>';
  var tagHtml = session.tags.map(function(t){return '<span class="badge gray">'+t+'</span>';}).join(' ');
  return '' +
    '<div class="chat-header">' +
      '<div class="customer-info">' +
        '<div class="avatar-md avatar-' + session.avatar + '">' + session.customerName.charAt(0) + '</div>' +
        '<div>' +
          '<div class="customer-name">' + session.customerName + ' <span class="badge blue">' + maskPhone(session.phone) + '</span></div>' +
          '<div class="customer-tags">' + tagHtml + ' <span class="badge gray">' + session.channel + '</span>' + (session.orderNo ? ' <span class="badge purple">订单:' + maskOrder(session.orderNo) + '</span>' : '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="flex gap-8">' +
        '<button class="btn btn-sm">客户画像</button>' +
        '<button class="btn btn-sm">转接</button>' +
        '<button class="btn btn-sm">结束会话</button>' +
      '</div>' +
    '</div>' +
    '<div class="chat-messages" id="chatMessages">' +
      '<div class="msg-system">— 2026-07-12 10:15 —</div>' +
      '<div class="message-row"><div class="msg-avatar customer">' + session.customerName.charAt(0) + '</div><div class="msg-content"><div class="msg-bubble">' + session.lastMsg + '</div><div class="msg-time">10:15</div></div></div>' +
      '<div class="message-row right"><div class="msg-avatar ai">AI</div><div class="msg-content"><div class="msg-bubble">您好！感谢您的咨询。关于退款到账时间，一般情况下退款会在收到退货商品后3-5个工作日内原路退回您的支付账户。请问您是通过什么方式支付的呢？</div><div class="msg-time">10:16 · AI自动回复</div></div></div>' +
      '<div class="message-row"><div class="msg-avatar customer">' + session.customerName.charAt(0) + '</div><div class="msg-content"><div class="msg-bubble">我是用微信支付的，已经退货3天了还没到账</div><div class="msg-time">10:18</div></div></div>' +
      '<div class="msg-system">— AI识别到情绪波动，建议人工介入 —</div>' +
      '<div class="message-row right"><div class="msg-avatar agent">客</div><div class="msg-content"><div class="msg-bubble">您好，我是人工客服小李。理解您的焦急，我马上为您查询退款进度。请稍等片刻~</div><div class="msg-time">10:19 · 人工客服</div></div></div>' +
    '</div>' +
    // AI辅助推荐
    '<div class="ai-recommend">' +
      '<div class="ai-recommend-header">🤖 AI推荐话术 <span style="font-weight:400;color:var(--ink-muted);margin-left:4px;">点击一键复制到输入框</span></div>' +
      '<div class="ai-recommend-list">' +
        '<div class="ai-recommend-item" onclick="App.useRecommend(this,\'已为您查询到退款正在处理中，预计今日18:00前到账您的微信账户，请您留意通知。给您带来不便深表歉意！\')">📋 查询退款进度</div>' +
        '<div class="ai-recommend-item" onclick="App.useRecommend(this,\'抱歉让您久等了！我已加急处理您的退款，预计2小时内到账，到账后会有短信通知您。\')">⚡ 加急处理</div>' +
        '<div class="ai-recommend-item" onclick="App.useRecommend(this,\'为表达歉意，已为您发放10元无门槛优惠券，可在下次购物时使用。感谢您的理解与支持！\')">🎁 安抚补偿</div>' +
      '</div>' +
    '</div>' +
    // 输入区
    '<div class="chat-input-area">' +
      '<div class="chat-input-toolbar">' +
        '<div class="tool-btn tooltip" data-tip="表情">😊</div>' +
        '<div class="tool-btn tooltip" data-tip="图片">🖼️</div>' +
        '<div class="tool-btn tooltip" data-tip="文件">📎</div>' +
        '<div class="tool-btn tooltip" data-tip="快捷回复">💬</div>' +
        '<div class="tool-btn tooltip" data-tip="知识库">📚</div>' +
        '<div style="margin-left:auto;" class="text-sm text-muted">会话标签：<span class="badge orange">售后退款</span> <span class="badge red">情绪波动</span></div>' +
      '</div>' +
      '<div class="chat-input-box">' +
        '<textarea id="chatInput" placeholder="输入消息，按Enter发送..."></textarea>' +
        '<button class="btn btn-primary" onclick="App.sendChatMessage()">发送</button>' +
      '</div>' +
    '</div>';
}

PageInit.workspace = function() {
  // Tab切换
  document.querySelectorAll('.chat-sidebar-tabs .chat-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.chat-sidebar-tabs .chat-tab').forEach(function(t){t.classList.remove('active');});
      tab.classList.add('active');
      document.getElementById('chatList').innerHTML = renderChatList(tab.dataset.ct);
      bindChatListClicks();
    });
  });
  bindChatListClicks();
  // Enter发送
  var input = document.getElementById('chatInput');
  if (input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); App.sendChatMessage(); }
    });
  }
};

function bindChatListClicks() {
  document.querySelectorAll('.chat-list-item').forEach(function(item) {
    item.addEventListener('click', function() {
      State.currentChatId = item.dataset.cid;
      document.getElementById('chatMain').innerHTML = renderChatMain();
      PageInit.workspace();
      document.querySelectorAll('.chat-list-item').forEach(function(i){i.classList.remove('active');});
      item.classList.add('active');
    });
  });
}

/* -------------------- 模块8: 渠道接入管理 -------------------- */
PageRenderers.channel = function() {
  var html = '' +
  '<div class="page-header">' +
    '<span class="page-title">渠道接入管理</span>' +
    '<span class="page-desc">多渠道配置管理，支持API密钥与嵌入代码一键接入</span>' +
    '<div style="margin-left:auto;display:flex;gap:8px;">' +
      '<button class="btn btn-primary" onclick="App.openChannelModal()" ' + permDisabled('create') + '>+ 新增渠道</button>' +
    '</div>' +
  '</div>' +
  '<div class="grid-4 mb-16">' +
    '<div class="stat-card"><div class="stat-icon blue">🔗</div><div class="stat-label">接入渠道数</div><div class="stat-value">' + State.channels.length + '<span class="unit">个</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon green">✅</div><div class="stat-label">启用中</div><div class="stat-value">' + State.channels.filter(function(c){return c.status==='active';}).length + '<span class="unit">个</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon orange">💬</div><div class="stat-label">今日总会话</div><div class="stat-value">8,370<span class="unit">次</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon purple">😊</div><div class="stat-label">平均满意度</div><div class="stat-value">92.6<span class="unit">%</span></div></div>' +
  '</div>' +
  '<div class="filter-bar">' +
    '<select class="select"><option>全部渠道类型</option><option>官网H5</option><option>微信小程序</option><option>APP</option><option>企业微信</option></select>' +
    '<select class="select"><option>全部状态</option><option>启用中</option><option>已停用</option></select>' +
  '</div>' +
  '<div class="card"><div class="table-wrap"><table class="data-table">' +
    '<thead><tr><th>渠道名称</th><th>类型</th><th>绑定AI人设</th><th>分流客服组</th><th>API密钥</th><th>今日会话</th><th>满意度</th><th>状态</th><th>操作</th></tr></thead><tbody>';
  State.channels.forEach(function(c) {
    var statusBadge = c.status === 'active' ? '<span class="badge dot green">启用中</span>' : '<span class="badge dot gray">已停用</span>';
    html += '<tr>' +
      '<td class="text-bold">' + c.name + '</td>' +
      '<td><span class="badge blue">' + c.type + '</span></td>' +
      '<td>' + c.persona + '</td>' +
      '<td>' + c.group + '</td>' +
      '<td><span class="masked text-sm">' + c.apiKey + '</span> <button class="btn-text btn-sm" onclick="App.copyToClipboard(\'' + c.apiKey + '\')">复制</button></td>' +
      '<td>' + c.dailyConversations.toLocaleString() + '</td>' +
      '<td><span class="' + (c.satisfaction >= 95 ? 'badge green' : c.satisfaction >= 90 ? 'badge blue' : 'badge orange') + '">' + c.satisfaction + '%</span></td>' +
      '<td>' + statusBadge + '</td>' +
      '<td><div class="flex gap-8">' +
        '<button class="btn-text btn-sm" onclick="App.openChannelModal(\'' + c.id + '\')">编辑</button>' +
        '<button class="btn-text btn-sm" onclick="App.viewEmbedCode(\'' + c.id + '\')">嵌入代码</button>' +
        '<button class="btn-text btn-sm ' + (c.status==='active'?'warning':'') + '" onclick="App.toggleChannelStatus(\'' + c.id + '\')" ' + permDisabled('edit') + '>' + (c.status==='active'?'停用':'启用') + '</button>' +
        '<button class="btn-text btn-sm danger" onclick="App.deleteChannel(\'' + c.id + '\')" ' + permDisabled('delete') + '>删除</button>' +
      '</div></td>' +
    '</tr>';
  });
  html += '</tbody></table></div>' + paginationHTML(State.channels.length, 1, 10) + '</div>';
  return html;
};

PageInit.channel = function() {};

/* -------------------- 模块9: 账号权限管理 -------------------- */
PageRenderers.account = function() {
  var html = '' +
  '<div class="page-header">' +
    '<span class="page-title">账号权限管理</span>' +
    '<span class="page-desc">管理集团及子公司账号，配置角色与操作权限</span>' +
    '<div style="margin-left:auto;display:flex;gap:8px;">' +
      '<button class="btn">角色管理</button>' +
      '<button class="btn btn-primary" onclick="App.openAccountModal()" ' + permDisabled('account_manage') + '>+ 新增账号</button>' +
    '</div>' +
  '</div>' +
  '<div class="grid-4 mb-16">' +
    '<div class="stat-card"><div class="stat-icon blue">👤</div><div class="stat-label">账号总数</div><div class="stat-value">' + State.accounts.length + '<span class="unit">个</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon green">✅</div><div class="stat-label">活跃账号</div><div class="stat-value">' + State.accounts.filter(function(a){return a.status==='active';}).length + '<span class="unit">个</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon orange">🏢</div><div class="stat-label">集团账号</div><div class="stat-value">' + State.accounts.filter(function(a){return a.tenant==='集团总部';}).length + '<span class="unit">个</span></div></div>' +
    '<div class="stat-card"><div class="stat-icon purple">🏬</div><div class="stat-label">子公司账号</div><div class="stat-value">' + State.accounts.filter(function(a){return a.tenant!=='集团总部';}).length + '<span class="unit">个</span></div></div>' +
  '</div>' +
  '<div class="filter-bar">' +
    '<div class="input-group" style="width:220px;"><span class="input-icon">🔍</span><input class="input input-with-icon" placeholder="搜索账号/姓名..."></div>' +
    '<select class="select"><option>全部角色</option><option>集团管理员</option><option>运营主管</option><option>客服组长</option><option>AI训练师</option><option>子公司客服</option><option>数据分析员</option></select>' +
    '<select class="select"><option>全部租户</option><option>集团总部</option><option>华东子公司</option><option>华南子公司</option></select>' +
    '<select class="select"><option>全部状态</option><option>启用</option><option>停用</option></select>' +
  '</div>' +
  '<div class="card"><div class="table-wrap"><table class="data-table">' +
    '<thead><tr><th>姓名</th><th>账号</th><th>角色</th><th>所属租户</th><th>权限摘要</th><th>最后登录</th><th>状态</th><th>操作</th></tr></thead><tbody>';
  State.accounts.forEach(function(a) {
    var roleBadge = a.role === '集团管理员' ? '<span class="badge blue">集团管理员</span>' : a.role === '运营主管' ? '<span class="badge green">运营主管</span>' : a.role === '客服组长' ? '<span class="badge orange">客服组长</span>' : a.role === 'AI训练师' ? '<span class="badge purple">AI训练师</span>' : a.role === '数据分析员' ? '<span class="badge gray">数据分析员</span>' : '<span class="badge gray">子公司客服</span>';
    var statusBadge = a.status === 'active' ? '<span class="badge dot green">启用</span>' : '<span class="badge dot gray">停用</span>';
    var permSummary = a.permissions.length + '项权限';
    html += '<tr>' +
      '<td><div class="flex-center gap-8"><span class="avatar-sm avatar-blue">' + a.name.charAt(0) + '</span><span class="text-bold">' + a.name + '</span></div></td>' +
      '<td class="text-muted">' + a.account + '</td>' +
      '<td>' + roleBadge + '</td>' +
      '<td>' + a.tenant + '</td>' +
      '<td><span class="text-sm">' + permSummary + '</span> <button class="btn-text btn-sm" onclick="App.viewPermissions(\'' + a.id + '\')">查看</button></td>' +
      '<td class="text-sm text-muted">' + a.lastLogin + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td><div class="flex gap-8">' +
        '<button class="btn-text btn-sm" onclick="App.openAccountModal(\'' + a.id + '\')" ' + permDisabled('account_manage') + '>编辑</button>' +
        '<button class="btn-text btn-sm" onclick="App.resetPassword(\'' + a.id + '\')" ' + permDisabled('account_manage') + '>重置密码</button>' +
        '<button class="btn-text btn-sm ' + (a.status==='active'?'warning':'') + '" onclick="App.toggleAccountStatus(\'' + a.id + '\')" ' + permDisabled('account_manage') + '>' + (a.status==='active'?'停用':'启用') + '</button>' +
        '<button class="btn-text btn-sm danger" onclick="App.deleteAccount(\'' + a.id + '\')" ' + permDisabled('account_manage') + '>删除</button>' +
      '</div></td>' +
    '</tr>';
  });
  html += '</tbody></table></div>' + paginationHTML(State.accounts.length, 1, 10) + '</div>';
  return html;
};

PageInit.account = function() {};

/* ===================== 全局App对象 ===================== */
window.App = {
  navigateTo: navigateTo,
  showModal: showModal,
  closeModal: closeModal,
  confirmDialog: confirmDialog,
  toast: toast,
  copyToClipboard: copyToClipboard,
  maskPhone: maskPhone,
  maskName: maskName,
  maskOrder: maskOrder,
  exportData: function() { toast('报表导出中，请稍候...'); },
  State: State,
  getChartColors: getChartColors,

  /* ========== AI人设弹窗 ========== */
  openPersonaModal: function(id) {
    var p = id ? State.personas.find(function(x){return x.id===id;}) : null;
    var title = p ? '编辑AI人设' : '新建AI人设';
    var body = '' +
    '<div class="form-group"><label class="form-label">人设名称 <span class="required">*</span></label><input class="input" id="pm_name" value="' + (p?p.name:'') + '" placeholder="请输入AI人设名称"></div>' +
    '<div class="grid-2">' +
      '<div class="form-group"><label class="form-label">应用场景 <span class="required">*</span></label><select class="select" id="pm_scenario" style="width:100%;">' +
        '<option ' + (p&&p.scenario==='售前咨询'?'selected':'') + '>售前咨询</option><option ' + (p&&p.scenario==='售后维保'?'selected':'') + '>售后维保</option><option ' + (p&&p.scenario==='VIP服务'?'selected':'') + '>VIP服务</option><option ' + (p&&p.scenario==='海外咨询'?'selected':'') + '>海外咨询</option>' +
      '</select></div>' +
      '<div class="form-group"><label class="form-label">语气风格</label><select class="select" id="pm_tone" style="width:100%;">' +
        '<option ' + (p&&p.tone==='专业热情'?'selected':'') + '>专业热情</option><option ' + (p&&p.tone==='耐心细致'?'selected':'') + '>耐心细致</option><option ' + (p&&p.tone==='尊贵优雅'?'selected':'') + '>尊贵优雅</option><option ' + (p&&p.tone==='专业严谨'?'selected':'') + '>专业严谨</option>' +
      '</select></div>' +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="form-group"><label class="form-label">语言</label><select class="select" id="pm_lang" style="width:100%;"><option ' + (p&&p.language==='中文'?'selected':'') + '>中文</option><option ' + (p&&p.language==='中英双语'?'selected':'') + '>中英双语</option><option>英文</option></select></div>' +
      '<div class="form-group"><label class="form-label">状态</label><div style="padding-top:6px;"><label class="switch"><input type="checkbox" id="pm_status" ' + (!p||p.status==='active'?'checked':'') + '><span class="slider"></span></label> <span class="text-sm text-muted">启用</span></div></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">绑定渠道</label><div class="tag-input-area" id="pm_channels">' +
      (p?p.channels.map(function(c){return '<span class="tag-chip">'+c+'<span class="tag-remove" onclick="this.parentElement.remove()">×</span></span>';}).join(''):'') +
      '<input placeholder="输入渠道后回车..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();var v=this.value.trim();if(v){var chip=document.createElement(\'span\');chip.className=\'tag-chip\';chip.innerHTML=v+\'<span class=\\\'tag-remove\\\' onclick=\\\'this.parentElement.remove()\\\'>×</span>\';this.parentNode.insertBefore(chip,this);this.value=\'\';}}">' +
    '</div></div>' +
    '<div class="form-group"><label class="form-label">关联知识库</label><div class="tag-input-area" id="pm_kb">' +
      (p?p.knowledgeBase.map(function(k){return '<span class="tag-chip">'+k+'<span class="tag-remove" onclick="this.parentElement.remove()">×</span></span>';}).join(''):'') +
      '<input placeholder="输入知识库名称后回车..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();var v=this.value.trim();if(v){var chip=document.createElement(\'span\');chip.className=\'tag-chip\';chip.innerHTML=v+\'<span class=\\\'tag-remove\\\' onclick=\\\'this.parentElement.remove()\\\'>×</span>\';this.parentNode.insertBefore(chip,this);this.value=\'\';}}">' +
    '</div></div>' +
    '<div style="border-top:1px solid var(--border-light);margin:8px 0 16px;padding-top:12px;"><div class="text-bold mb-12">话术配置（每套人设独立）</div></div>' +
    '<div class="form-group"><label class="form-label">开场话术 <span class="required">*</span></label><textarea class="input" id="pm_opening" rows="2" placeholder="AI客服开场白...">' + (p?p.opening:'') + '</textarea></div>' +
    '<div class="form-group"><label class="form-label">结束话术</label><textarea class="input" id="pm_closing" rows="2" placeholder="会话结束语...">' + (p?p.closing:'') + '</textarea></div>' +
    '<div class="form-group"><label class="form-label">转接话术</label><textarea class="input" id="pm_transfer" rows="2" placeholder="转人工话术...">' + (p?p.transfer:'') + '</textarea></div>' +
    '<div class="form-group"><label class="form-label">节日话术 <span class="badge orange">时效</span></label>' +
      '<textarea class="input" id="pm_festival" rows="2" placeholder="节日祝福话术（可留空）...">' + (p?p.festival:'') + '</textarea>' +
      '<div class="mt-8 flex gap-8"><input class="input" id="pm_festival_date" type="date" value="' + (p?p.festivalDate:'') + '" style="width:200px;"><span class="text-sm text-muted" style="line-height:32px;">设置节日话术生效日期</span></div>' +
    '</div>';
    showModal({
      title: title, size: 'lg', body: body,
      footer: '<button class="btn" data-modal-close>取消</button><button class="btn btn-primary" data-modal-confirm>保存</button>',
      onConfirm: function() {
        confirmDialog({
          title: '确认保存', message: '确定要保存此人设配置吗？',
          onConfirm: function() {
            toast(p ? '人设已更新' : '人设已创建');
            if (!p) {
              State.personas.push({
                id: 'P' + String(State.personas.length + 1).padStart(3, '0'),
                name: document.getElementById('pm_name').value || '新人设',
                avatar: 'blue', status: 'active',
                scenario: document.getElementById('pm_scenario').value,
                tone: document.getElementById('pm_tone').value,
                language: document.getElementById('pm_lang').value,
                channels: [], knowledgeBase: [],
                opening: document.getElementById('pm_opening').value,
                closing: document.getElementById('pm_closing').value,
                transfer: document.getElementById('pm_transfer').value,
                festival: document.getElementById('pm_festival').value,
                festivalDate: document.getElementById('pm_festival_date').value,
                createTime: new Date().toISOString().slice(0,19).replace('T',' '),
                updateTime: new Date().toISOString().slice(0,19).replace('T',' ')
              });
            }
            navigateTo('persona');
          }
        });
      }
    });
  },

  openPersonaDetail: function(id) {
    var p = State.personas.find(function(x){return x.id===id;});
    if (!p) return;
    var body = '<div class="grid-2 mb-16">' +
      '<div><div class="text-sm text-muted mb-8">人设名称</div><div class="text-bold">' + p.name + '</div></div>' +
      '<div><div class="text-sm text-muted mb-8">应用场景</div><div>' + p.scenario + '</div></div>' +
      '<div><div class="text-sm text-muted mb-8">语气风格</div><div>' + p.tone + '</div></div>' +
      '<div><div class="text-sm text-muted mb-8">语言</div><div>' + p.language + '</div></div>' +
    '</div>' +
    '<div class="mb-16"><div class="text-sm text-muted mb-8">绑定渠道</div><div>' + p.channels.map(function(c){return '<span class="badge gray">'+c+'</span> ';}).join('') + '</div></div>' +
    '<div class="mb-16"><div class="text-sm text-muted mb-8">关联知识库</div><div>' + p.knowledgeBase.map(function(k){return '<span class="badge blue">'+k+'</span> ';}).join('') + '</div></div>' +
    '<div style="border-top:1px solid var(--border-light);padding-top:16px;">' +
      '<div class="text-bold mb-12">话术配置</div>' +
      '<div class="mb-12"><div class="text-sm text-muted mb-4">开场话术</div><div class="card"><div class="card-body" style="padding:12px;">' + p.opening + '</div></div></div>' +
      '<div class="mb-12"><div class="text-sm text-muted mb-4">结束话术</div><div class="card"><div class="card-body" style="padding:12px;">' + p.closing + '</div></div></div>' +
      '<div class="mb-12"><div class="text-sm text-muted mb-4">转接话术</div><div class="card"><div class="card-body" style="padding:12px;">' + p.transfer + '</div></div></div>' +
      (p.festival ? '<div class="mb-12"><div class="text-sm text-muted mb-4">节日话术 <span class="badge orange">生效日期: ' + p.festivalDate + '</span></div><div class="card"><div class="card-body" style="padding:12px;">' + p.festival + '</div></div></div>' : '') +
    '</div>';
    showModal({ title: '人设详情 - ' + p.name, size: 'lg', body: body, footer: '<button class="btn" data-modal-close>关闭</button>' });
  },

  togglePersonaStatus: function(id) {
    var p = State.personas.find(function(x){return x.id===id;});
    if (!p) return;
    confirmDialog({
      title: p.status === 'active' ? '停用人设' : '启用人设',
      message: '确定要' + (p.status === 'active' ? '停用' : '启用') + '「' + p.name + '」吗？',
      onConfirm: function() { p.status = p.status === 'active' ? 'inactive' : 'active'; toast('状态已更新'); navigateTo('persona'); }
    });
  },

  deletePersona: function(id) {
    confirmDialog({ title:'删除人设', message:'确定要删除此AI人设吗？删除后不可恢复。', danger:true, confirmText:'确认删除',
      onConfirm:function(){ var i = State.personas.findIndex(function(x){return x.id===id;}); if(i>-1) State.personas.splice(i,1); toast('已删除'); navigateTo('persona'); } });
  },

  /* ========== 敏感词弹窗 ========== */
  openSensitiveModal: function(id) {
    var s = id ? State.sensitiveWords.find(function(x){return x.id===id;}) : null;
    var body = '' +
    '<div class="form-group"><label class="form-label">敏感词 <span class="required">*</span></label><input class="input" id="sm_word" value="' + (s?s.word:'') + '" placeholder="请输入敏感词"></div>' +
    '<div class="grid-2">' +
      '<div class="form-group"><label class="form-label">分类</label><select class="select" id="sm_cat" style="width:100%;"><option>品牌竞品</option><option>负面情绪</option><option>政治敏感</option><option>不文明用语</option><option>商业机密</option><option>隐私保护</option><option>合规风险</option></select></div>' +
      '<div class="form-group"><label class="form-label">风险等级</label><select class="select" id="sm_level" style="width:100%;"><option value="high">高</option><option value="medium">中</option><option value="low">低</option></select></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">处理方式</label><select class="select" id="sm_action" style="width:100%;"><option>直接拦截</option><option>拦截替换</option><option>提醒客服</option><option>脱敏处理</option></select></div>' +
    '<div class="form-group"><label class="form-label">替换内容</label><input class="input" id="sm_replace" value="' + (s?s.replaceWith:'') + '" placeholder="替换为的内容（如***）"></div>' +
    '<div class="form-group"><label class="form-label">状态</label><div><label class="switch"><input type="checkbox" id="sm_status" ' + (!s||s.status==='active'?'checked':'') + '><span class="slider"></span></label> <span class="text-sm text-muted">生效</span></div></div>';
    if (s) { document.addEventListener('modal:init', function initSelects() { document.removeEventListener('modal:init', initSelects); }, { once: true }); }
    showModal({ title: s ? '编辑敏感词' : '新增敏感词', body: body,
      onConfirm: function() { toast(s ? '敏感词已更新' : '敏感词已新增'); closeModal(); } });
  },

  deleteSensitive: function(id) {
    confirmDialog({ title:'删除敏感词', message:'确定要删除此敏感词吗？', danger:true, confirmText:'确认删除',
      onConfirm:function(){ var i = State.sensitiveWords.findIndex(function(x){return x.id===id;}); if(i>-1) State.sensitiveWords.splice(i,1); toast('已删除'); navigateTo('persona'); } });
  },

  /* ========== 知识库弹窗 ========== */
  openKnowledgeModal: function(id) {
    var k = id ? State.knowledgeBase.find(function(x){return x.id===id;}) : null;
    var personaOptions = State.personas.map(function(p){return '<option ' + (k&&k.persona===p.name?'selected':'') + '>' + p.name + '</option>';}).join('');
    var body = '' +
    '<div class="form-group"><label class="form-label">知识库名称 <span class="required">*</span></label><input class="input" value="' + (k?k.title:'') + '" placeholder="请输入知识库名称"></div>' +
    '<div class="grid-2">' +
      '<div class="form-group"><label class="form-label">分类</label><select class="select" style="width:100%;"><option>产品知识</option><option>售后政策</option><option>会员服务</option><option>物流服务</option><option>营销活动</option><option>技术支持</option><option>国际业务</option></select></div>' +
      '<div class="form-group"><label class="form-label">格式</label><select class="select" style="width:100%;"><option>文档</option><option>表格</option><option>问答对</option><option>PDF</option><option>知识图谱</option></select></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">关联AI人设</label><select class="select" style="width:100%;">' + personaOptions + '</select></div>' +
    '<div class="form-group"><label class="form-label">上传文件 / 导入内容</label><div style="border:2px dashed var(--border);border-radius:var(--radius-md);padding:24px;text-align:center;color:var(--ink-muted);cursor:pointer;" onclick="App.toast(\'请选择文件上传\')"><div style="font-size:28px;margin-bottom:4px;">📤</div><div>点击或拖拽文件到此处上传</div><div class="text-sm mt-8">支持 PDF、Word、Excel、TXT 等格式</div></div></div>' +
    '<div class="form-group"><label class="form-label">问答对预览</label><div style="background:var(--bg);border-radius:var(--radius-md);padding:12px;max-height:150px;overflow-y:auto;">' +
      '<div class="mb-8"><div class="text-sm text-bold">Q: 怎么退货？</div><div class="text-sm text-muted">A: 进入我的订单→申请退货→选择原因→寄回商品</div></div>' +
      '<div class="mb-8"><div class="text-sm text-bold">Q: 退货运费谁出？</div><div class="text-sm text-muted">A: 质量问题由商家承担，个人原因由买家承担</div></div>' +
    '</div></div>';
    showModal({ title: k ? '编辑知识库' : '新增知识库', size: 'lg', body: body,
      onConfirm: function() { confirmDialog({ title:'确认保存', message:'确定要保存此知识库配置吗？', onConfirm:function(){ toast(k?'知识库已更新':'知识库已创建'); } }); } });
  },

  viewKnowledge: function(id) {
    var k = State.knowledgeBase.find(function(x){return x.id===id;});
    if (!k) return;
    var body = '<div class="flex-between mb-16"><span class="text-bold">' + k.title + '</span><span class="badge blue">' + k.qaCount + ' 条问答对</span></div>' +
    '<div class="table-wrap"><table class="data-table"><thead><tr><th>问题</th><th>答案</th><th>状态</th></tr></thead><tbody>' +
      '<tr><td>怎么退货？</td><td>进入"我的订单"→"申请退货"→选择退货原因→上传凭证→寄回商品</td><td><span class="badge green">已生效</span></td></tr>' +
      '<tr><td>退货运费谁出？</td><td>质量问题由商家承担运费，个人原因由买家承担运费</td><td><span class="badge green">已生效</span></td></tr>' +
      '<tr><td>退款多久到账？</td><td>收到退货商品后3-5个工作日原路退回</td><td><span class="badge green">已生效</span></td></tr>' +
      '<tr><td>可以部分退货吗？</td><td>可以，在订单中选择需要退货的商品即可</td><td><span class="badge orange">待审核</span></td></tr>' +
    '</tbody></table></div>';
    showModal({ title: '问答对详情', size: 'lg', body: body, footer: '<button class="btn" data-modal-close>关闭</button>' });
  },

  deleteKnowledge: function(id) {
    confirmDialog({ title:'删除知识库', message:'确定要删除此知识库吗？删除后关联的AI人设将无法使用该知识。', danger:true, confirmText:'确认删除',
      onConfirm:function(){ var i = State.knowledgeBase.findIndex(function(x){return x.id===id;}); if(i>-1) State.knowledgeBase.splice(i,1); toast('已删除'); navigateTo('knowledge'); } });
  },

  /* ========== AI复盘操作 ========== */
  fixError: function(id) {
    var e = State.reviewData.errors.find(function(x){return x.id===id;});
    if (!e) return;
    var body = '<div class="mb-16"><div class="text-sm text-muted mb-4">原始问题</div><div class="text-bold">' + e.question + '</div></div>' +
      '<div class="mb-16"><div class="text-sm text-muted mb-4">AI回答 <span class="badge red">错误</span></div><div class="card"><div class="card-body" style="padding:12px;color:var(--danger);">' + e.aiAnswer + '</div></div></div>' +
      '<div class="mb-16"><div class="text-sm text-muted mb-4">正确答案 <span class="badge green">已标注</span></div><div class="card"><div class="card-body" style="padding:12px;color:var(--success);">' + e.correctAnswer + '</div></div></div>' +
      '<div class="form-group"><label class="form-label">修正后的标准回答 <span class="required">*</span></label><textarea class="input" rows="4" placeholder="请输入修正后的标准回答...">' + e.correctAnswer + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">处理方式</label><div class="flex gap-12"><label class="radio"><input type="radio" name="fix_action" value="kb" checked> 更新知识库</label><label class="radio"><input type="radio" name="fix_action" value="train"> 送入训练</label><label class="radio"><input type="radio" name="fix_action" value="both"> 同时更新知识库+训练</label></div></div>';
    showModal({ title: '修正错题 - ' + e.id, size: 'lg', body: body,
      footer: '<button class="btn" data-modal-close>取消</button><button class="btn btn-primary" data-modal-confirm>提交修正</button>',
      onConfirm: function() {
        confirmDialog({ title:'确认提交', message:'修正后将自动更新知识库并重新训练模型，确定提交吗？', onConfirm:function(){
          e.status = 'resolved'; toast('错题已修正，知识库已更新'); navigateTo('review');
        }});
      }});
  },

  sendToTraining: function(id) {
    confirmDialog({ title:'送入训练', message:'确定要将此错题送入AI训练样本库吗？系统将自动生成训练样本。', confirmText:'确认送入',
      onConfirm:function(){ toast('已送入训练样本库'); }});
  },

  archiveError: function(id) {
    confirmDialog({ title:'暂缓处理', message:'确定要暂缓处理此错题吗？', confirmText:'确认暂缓',
      onConfirm:function(){ toast('已暂缓'); }});
  },

  viewErrorDetail: function(id) {
    var e = State.reviewData.errors.find(function(x){return x.id===id;});
    if (!e) return;
    showModal({ title: '错题详情', size: 'lg',
      body: '<div class="mb-16"><div class="text-sm text-muted mb-4">问题</div><div class="text-bold">' + e.question + '</div></div>' +
        '<div class="mb-16"><div class="text-sm text-muted mb-4">AI回答</div><div class="card"><div class="card-body" style="padding:12px;color:var(--danger);">' + e.aiAnswer + '</div></div></div>' +
        '<div class="mb-16"><div class="text-sm text-muted mb-4">正确答案</div><div class="card"><div class="card-body" style="padding:12px;color:var(--success);">' + e.correctAnswer + '</div></div></div>' +
        '<div class="grid-3"><div><div class="text-sm text-muted">错误类型</div><div><span class="badge purple">'+e.errorType+'</span></div></div>' +
        '<div><div class="text-sm text-muted">出现次数</div><div class="text-bold">'+e.count+'次</div></div>' +
        '<div><div class="text-sm text-muted">状态</div><div><span class="badge green">已修复</span></div></div></div>',
      footer: '<button class="btn" data-modal-close>关闭</button>' });
  },

  switchReviewTab: function(tab) {
    document.getElementById('reviewTabContent').innerHTML = renderUnresolvedList(tab);
  },

  openResolveModal: function(id) {
    var u = State.reviewData.unresolved.find(function(x){return x.id===id;});
    if (!u) return;
    var body = '<div class="mb-16"><div class="text-sm text-muted mb-4">未解决问题</div><div class="text-bold">' + u.question + '</div></div>' +
      '<div class="mb-16"><div class="text-sm text-muted mb-4">同义问题 (' + u.similarQuestions.length + ')</div>' +
        u.similarQuestions.map(function(q){return '<div class="text-sm mb-4">• ' + q + '</div>';}).join('') + '</div>' +
      '<div class="mb-16"><div class="text-sm text-muted mb-4">出现次数</div><div class="text-bold">' + u.count + ' 次</div></div>' +
      '<div class="form-group"><label class="form-label">标准回答 <span class="required">*</span></label><textarea class="input" rows="4" placeholder="请输入标准回答..."></textarea></div>' +
      '<div class="form-group"><label class="form-label">处理方式</label><div class="flex gap-12"><label class="radio"><input type="radio" name="resolve_action" value="kb" checked> 新增知识库条目</label><label class="radio"><input type="radio" name="resolve_action" value="train"> 新增训练样本</label><label class="radio"><input type="radio" name="resolve_action" value="both"> 知识库+训练样本</label></div></div>' +
      '<div class="form-group"><label class="form-label">关联分类</label><select class="select" style="width:100%;">' + u.tags.map(function(t){return '<option>'+t+'</option>';}).join('') + '<option>其他</option></select></div>';
    showModal({ title: '解决未解决问题 - ' + u.id, size: 'lg', body: body,
      footer: '<button class="btn" data-modal-close>取消</button><button class="btn btn-primary" data-modal-confirm>提交解决</button>',
      onConfirm: function() {
        confirmDialog({ title:'确认提交', message:'提交后将自动更新知识库/训练样本，该问题将标记为已解决。', onConfirm:function(){
          var i = State.reviewData.unresolved.findIndex(function(x){return x.id===id;});
          if (i > -1) State.reviewData.unresolved.splice(i, 1);
          toast('问题已解决，数据已自迭代'); navigateTo('review');
        }});
      }});
  },

  mergeSimilar: function(id) {
    var u = State.reviewData.unresolved.find(function(x){return x.id===id;});
    if (!u) return;
    var body = '<div class="text-sm text-muted mb-12">选择要与「' + u.question + '」合并的同义问题：</div>';
    State.reviewData.unresolved.filter(function(x){return x.id!==id;}).forEach(function(other) {
      body += '<label class="checkbox mb-8" style="display:flex;"><input type="checkbox" value="'+other.id+'"> <span style="margin-left:8px;">'+other.question+' <span class="text-muted">('+other.count+'次)</span></span></label>';
    });
    showModal({ title: '合并同义问题', body: body,
      footer: '<button class="btn" data-modal-close>取消</button><button class="btn btn-primary" data-modal-confirm>确认合并</button>',
      onConfirm: function() {
        confirmDialog({ title:'确认合并', message:'合并后同义问题将被归入主问题，相关知识库和训练样本将同步更新。', onConfirm:function(){ toast('同义问题已合并'); navigateTo('review'); }});
      }});
  },

  batchMerge: function() {
    toast('请勾选要合并的问题后点击批量合并');
  },

  viewSession: function(id) {
    showModal({ title: '关联会话记录', size: 'lg',
      body: '<div class="text-sm text-muted mb-16">该问题关联的近期会话记录：</div>' +
        '<div class="timeline">' +
          '<div class="timeline-item"><div class="timeline-time">2026-07-12 11:00</div><div class="timeline-content">客户 ' + maskName('张明') + ' (' + maskPhone('13812345678') + ') 在官网H5咨询此问题</div></div>' +
          '<div class="timeline-item"><div class="timeline-time">2026-07-11 15:30</div><div class="timeline-content">客户 ' + maskName('李华') + ' (' + maskPhone('13987654321') + ') 在微信小程序咨询此问题</div></div>' +
          '<div class="timeline-item"><div class="timeline-time">2026-07-10 09:15</div><div class="timeline-content">客户 ' + maskName('王芳') + ' (' + maskPhone('13711223344') + ') 在APP咨询此问题</div></div>' +
        '</div>',
      footer: '<button class="btn" data-modal-close>关闭</button><button class="btn btn-primary" onclick="App.navigateTo(\'workspace\');App.closeModal();">前往协同工作台</button>' });
  },

  archiveUnresolved: function(id) {
    var body = '<div class="form-group"><label class="form-label">暂缓归档原因 <span class="required">*</span></label><textarea class="input" rows="3" id="archive_reason" placeholder="请输入暂缓归档原因..."></textarea></div>' +
      '<div class="form-group"><label class="form-label">预计处理时间</label><input class="input" type="date" id="archive_date"></div>';
    showModal({ title: '暂缓归档', size: 'sm', body: body,
      footer: '<button class="btn" data-modal-close>取消</button><button class="btn btn-warning" data-modal-confirm>确认归档</button>',
      onConfirm: function() {
        var reason = document.getElementById('archive_reason').value || '暂未处理';
        var i = State.reviewData.unresolved.findIndex(function(x){return x.id===id;});
        if (i > -1) {
          var item = State.reviewData.unresolved.splice(i, 1)[0];
          item.status = 'archived';
          item.archiveReason = reason;
          item.archiveDate = new Date().toISOString().slice(0,10);
          State.reviewData.archived.push(item);
        }
        toast('已归档'); navigateTo('review');
      }});
  },

  restoreArchived: function(id) {
    confirmDialog({ title:'恢复问题', message:'确定要将此问题恢复到待处理列表吗？', confirmText:'确认恢复',
      onConfirm:function(){
        var i = State.reviewData.archived.findIndex(function(x){return x.id===id;});
        if (i > -1) {
          var item = State.reviewData.archived.splice(i, 1)[0];
          item.status = 'pending';
          State.reviewData.unresolved.push(item);
        }
        toast('已恢复到待处理'); navigateTo('review');
      }});
  },

  /* ========== AI训练操作 ========== */
  openTrainingModal: function(id) {
    var t = id ? State.trainingSamples.find(function(x){return x.id===id;}) : null;
    var body = '' +
    '<div class="form-group"><label class="form-label">标准问题 <span class="required">*</span></label><input class="input" id="tm_question" value="' + (t?t.standardQuestion:'') + '" placeholder="请输入标准问题"></div>' +
    '<div class="form-group"><label class="form-label">分类</label><select class="select" style="width:100%;"><option>售后流程</option><option>物流配送</option><option>售后保修</option><option>财务发票</option><option>会员服务</option></select></div>' +
    '<div class="form-group"><label class="form-label">标准回答 <span class="required">*</span></label><textarea class="input" rows="4" id="tm_answer" placeholder="请输入标准回答...">' + (t?t.answer:'') + '</textarea></div>' +
    // 训练同义 - 蓝色 - 用于模型微调
    '<div class="form-group"><label class="form-label">训练同义词 <span class="badge blue">模型微调用</span></label>' +
      '<div class="text-sm text-muted mb-8">用于AI模型微调，提高语义理解能力。不同表述方式越多，模型理解越准确。</div>' +
      '<div class="tag-input-area" id="tm_train_syn">' +
        (t?t.trainSynonyms.map(function(s){return '<span class="tag-chip" style="background:var(--primary-light);color:var(--primary);">'+s+'<span class="tag-remove" onclick="this.parentElement.remove()">×</span></span>';}).join(''):'') +
        '<input placeholder="输入训练同义词后回车..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();var v=this.value.trim();if(v){var chip=document.createElement(\'span\');chip.className=\'tag-chip\';chip.style.cssText=\'background:var(--primary-light);color:var(--primary);\';chip.innerHTML=v+\'<span class=\\\'tag-remove\\\' onclick=\\\'this.parentElement.remove()\\\'>×</span>\';this.parentNode.insertBefore(chip,this);this.value=\'\';}}">' +
      '</div>' +
      '<div class="mt-8"><button class="btn btn-sm" onclick="App.syncSynonyms(\'train_to_kb\')">↓ 一键复用到知识库同义</button></div>' +
    '</div>' +
    // 知识库同义 - 绿色 - 用于线上检索
    '<div class="form-group"><label class="form-label">知识库同义词 <span class="badge green">线上检索用</span></label>' +
      '<div class="text-sm text-muted mb-8">用于线上知识库检索匹配，提高用户问题命中率。关键词越丰富，检索越精准。</div>' +
      '<div class="tag-input-area" id="tm_kb_syn">' +
        (t?t.kbSynonyms.map(function(s){return '<span class="tag-chip" style="background:var(--success-light);color:var(--success);">'+s+'<span class="tag-remove" onclick="this.parentElement.remove()">×</span></span>';}).join(''):'') +
        '<input placeholder="输入知识库同义词后回车..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();var v=this.value.trim();if(v){var chip=document.createElement(\'span\');chip.className=\'tag-chip\';chip.style.cssText=\'background:var(--success-light);color:var(--success);\';chip.innerHTML=v+\'<span class=\\\'tag-remove\\\' onclick=\\\'this.parentElement.remove()\\\'>×</span>\';this.parentNode.insertBefore(chip,this);this.value=\'\';}}">' +
      '</div>' +
      '<div class="mt-8"><button class="btn btn-sm" onclick="App.syncSynonyms(\'kb_to_train\')">↑ 一键复用到训练同义</button></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">来源</label><select class="select" style="width:100%;"><option>人工标注</option><option>AI采集</option><option>错题转化</option></select></div>';
    showModal({ title: t ? '编辑训练样本' : '新增训练样本', size: 'lg', body: body,
      footer: '<button class="btn" data-modal-close>取消</button>' + (t && t.status === 'trained' ? '<button class="btn btn-success" data-modal-confirm>保存并重训</button>' : '<button class="btn btn-primary" data-modal-confirm>保存并训练</button>'),
      onConfirm: function() {
        confirmDialog({ title:'确认训练', message:'保存后将触发模型微调训练，预计耗时5-10分钟。确定吗？', onConfirm:function(){
          if (t) { t.status = 'trained'; t.accuracy = 90 + Math.random()*8; t.lastTrained = new Date().toISOString().slice(0,10); }
          toast('样本已保存，训练已启动'); navigateTo('training');
        }});
      }});
  },

  syncSynonyms: function(direction) {
    if (direction === 'train_to_kb') {
      var trainTags = document.querySelectorAll('#tm_train_syn .tag-chip');
      var kbArea = document.getElementById('tm_kb_syn');
      var existing = Array.from(kbArea.querySelectorAll('.tag-chip')).map(function(c){return c.textContent.replace('×','').trim();});
      var added = 0;
      trainTags.forEach(function(tag) {
        var text = tag.textContent.replace('×','').trim();
        if (existing.indexOf(text) === -1) {
          var chip = document.createElement('span');
          chip.className = 'tag-chip';
          chip.style.cssText = 'background:var(--success-light);color:var(--success);';
          chip.innerHTML = text + '<span class="tag-remove" onclick="this.parentElement.remove()">×</span>';
          kbArea.insertBefore(chip, kbArea.querySelector('input'));
          added++;
        }
      });
      toast(added > 0 ? '已复用 ' + added + ' 个同义词' : '无新增同义词（已全部存在）');
    } else {
      var kbTags = document.querySelectorAll('#tm_kb_syn .tag-chip');
      var trainArea = document.getElementById('tm_train_syn');
      var existingT = Array.from(trainArea.querySelectorAll('.tag-chip')).map(function(c){return c.textContent.replace('×','').trim();});
      var addedT = 0;
      kbTags.forEach(function(tag) {
        var text = tag.textContent.replace('×','').trim();
        if (existingT.indexOf(text) === -1) {
          var chip = document.createElement('span');
          chip.className = 'tag-chip';
          chip.style.cssText = 'background:var(--primary-light);color:var(--primary);';
          chip.innerHTML = text + '<span class="tag-remove" onclick="this.parentElement.remove()">×</span>';
          trainArea.insertBefore(chip, trainArea.querySelector('input'));
          addedT++;
        }
      });
      toast(addedT > 0 ? '已复用 ' + addedT + ' 个同义词' : '无新增同义词（已全部存在）');
    }
  },

  trainSample: function(id) {
    confirmDialog({ title:'启动训练', message:'确定要训练此样本吗？预计耗时5-10分钟。', confirmText:'确认训练',
      onConfirm:function(){ var t = State.trainingSamples.find(function(x){return x.id===id;}); if(t){t.status='trained';t.accuracy=90+Math.random()*8;t.lastTrained=new Date().toISOString().slice(0,10);} toast('训练已启动'); navigateTo('training'); }});
  },

  retrainSample: function(id) {
    confirmDialog({ title:'重新训练', message:'确定要重新训练此样本吗？将覆盖现有模型权重。', confirmText:'确认重训',
      onConfirm:function(){ toast('重训已启动'); navigateTo('training'); }});
  },

  deleteSample: function(id) {
    confirmDialog({ title:'删除样本', message:'确定要删除此训练样本吗？', danger:true, confirmText:'确认删除',
      onConfirm:function(){ var i = State.trainingSamples.findIndex(function(x){return x.id===id;}); if(i>-1) State.trainingSamples.splice(i,1); toast('已删除'); navigateTo('training'); }});
  },

  /* ========== 漏斗下钻 ========== */
  openFunnelDrill: function(stage) {
    var stageData = {
      visit: { name: '访问触达', count: 12840, channels: [{name:'官网H5',value:5240},{name:'微信小程序',value:3680},{name:'APP',value:2820},{name:'企业微信',value:1100}] },
      engage: { name: '发起对话', count: 11210, channels: [{name:'官网H5',value:4560},{name:'微信小程序',value:3210},{name:'APP',value:2480},{name:'企业微信',value:960}] },
      ai_resolve: { name: 'AI独立解决', count: 9782, channels: [{name:'官网H5',value:3980},{name:'微信小程序',value:2810},{name:'APP',value:2160},{name:'企业微信',value:832}] },
      human: { name: '人工接入', count: 1428, channels: [{name:'官网H5',value:580},{name:'微信小程序',value:400},{name:'APP',value:320},{name:'企业微信',value:128}] },
      resolve: { name: '问题解决', count: 1279, channels: [{name:'官网H5',value:520},{name:'微信小程序',value:358},{name:'APP',value:286},{name:'企业微信',value:115}] },
      satisfied: { name: '客户满意', count: 1210, channels: [{name:'官网H5',value:492},{name:'微信小程序',value:340},{name:'APP',value:270},{name:'企业微信',value:108}] },
    };
    var d = stageData[stage];
    var colors = ['#165DFF','#00B42A','#FF7D00','#722ED1'];
    var body = '<div class="flex-between mb-16"><div><div class="text-bold text-lg">' + d.name + '</div><div class="text-2xl" style="color:var(--primary);">' + d.count.toLocaleString() + '</div></div>' +
      '<div class="flex gap-8"><button class="btn btn-sm" onclick="App.navigateTo(\'analytics\');App.closeModal();">流失统计 →</button><button class="btn btn-sm" onclick="App.navigateTo(\'analytics\');App.closeModal();">高频提问 →</button></div></div>' +
      '<div class="text-sm text-muted mb-12">各渠道分布：</div>' +
      '<div id="funnelDrillChart" class="chart-container short"></div>' +
      '<div class="mt-12">' +
        d.channels.map(function(c, i) {
          var pct = (c.value / d.count * 100).toFixed(1);
          return '<div class="flex-between mb-8"><span class="text-sm"><span class="badge" style="background:'+colors[i]+'20;color:'+colors[i]+';">' + c.name + '</span></span><span class="text-sm"><span class="text-bold">' + c.value.toLocaleString() + '</span> (' + pct + '%)</span></div>' +
            '<div class="progress-bar mb-8"><div class="progress-fill" style="width:'+pct+'%;background:'+colors[i]+';"></div></div>';
        }).join('') +
      '</div>';
    showModal({ title: '流量预览 - ' + d.name, size: 'lg', body: body,
      footer: '<button class="btn" data-modal-close>关闭</button><button class="btn btn-primary" onclick="App.navigateTo(\'analytics\');App.closeModal();">查看流失统计</button>',
      onInit: function(modal) {
        setTimeout(function() {
          var chart = echarts.init(modal.querySelector('#funnelDrillChart'), null, { renderer: 'svg' });
          chart.setOption({
            tooltip: { trigger: 'item', appendToBody: true },
            series: [{ type: 'pie', radius: ['40%','65%'], center: ['50%','50%'],
              label: { formatter: '{b}: {c} ({d}%)', fontSize: 11 },
              data: d.channels.map(function(c, i) { return { value: c.value, name: c.name, itemStyle: { color: colors[i] } }; })
            }]
          });
        }, 100);
      }
    });
  },

  /* ========== 协同工作台 ========== */
  useRecommend: function(el, text) {
    var input = document.getElementById('chatInput');
    if (input) { input.value = text; input.focus(); toast('已复制到输入框'); }
  },

  sendChatMessage: function() {
    var input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) { toast('请输入消息内容', 'warning'); return; }
    var msg = input.value.trim();
    var session = State.chatSessions.find(function(s){return s.id===State.currentChatId;});
    var messages = document.getElementById('chatMessages');
    if (messages) {
      var now = new Date();
      var timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
      var div = document.createElement('div');
      div.className = 'message-row right';
      div.innerHTML = '<div class="msg-avatar agent">客</div><div class="msg-content"><div class="msg-bubble">' + msg.replace(/</g,'&lt;') + '</div><div class="msg-time">' + timeStr + ' · 人工客服</div></div>';
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }
    input.value = '';
    if (session) session.lastMsg = msg;
    // 模拟客户回复
    setTimeout(function() {
      if (messages) {
        var reply = document.createElement('div');
        reply.className = 'message-row';
        reply.innerHTML = '<div class="msg-avatar customer">' + (session?session.customerName.charAt(0):'客') + '</div><div class="msg-content"><div class="msg-bubble">好的，谢谢您的帮助！</div><div class="msg-time">' + new Date().toTimeString().slice(0,5) + '</div></div>';
        messages.appendChild(reply);
        messages.scrollTop = messages.scrollHeight;
      }
    }, 1500);
  },

  /* ========== 渠道管理 ========== */
  openChannelModal: function(id) {
    var c = id ? State.channels.find(function(x){return x.id===id;}) : null;
    var personaOptions = State.personas.map(function(p){return '<option ' + (c&&c.persona===p.name?'selected':'') + '>' + p.name + '</option>';}).join('');
    var body = '' +
    '<div class="form-group"><label class="form-label">渠道名称 <span class="required">*</span></label><input class="input" value="' + (c?c.name:'') + '" placeholder="请输入渠道名称"></div>' +
    '<div class="grid-2">' +
      '<div class="form-group"><label class="form-label">渠道类型 <span class="required">*</span></label><select class="select" style="width:100%;"><option>官网H5</option><option>微信小程序</option><option>APP</option><option>企业微信</option><option>抖音</option><option>支付宝小程序</option></select></div>' +
      '<div class="form-group"><label class="form-label">状态</label><div style="padding-top:6px;"><label class="switch"><input type="checkbox" ' + (!c||c.status==='active'?'checked':'') + '><span class="slider"></span></label> <span class="text-sm text-muted">启用</span></div></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">绑定AI人设 <span class="required">*</span></label><select class="select" style="width:100%;">' + personaOptions + '</select><div class="form-hint">该渠道的AI客服将使用此人设进行对话</div></div>' +
    '<div class="form-group"><label class="form-label">分流客服组 <span class="required">*</span></label><select class="select" style="width:100%;"><option>售前客服组A</option><option>售前客服组B</option><option>售后客服组</option><option>海外客服组</option><option>VIP客服组</option></select><div class="form-hint">AI无法解决时转接的客服分组</div></div>' +
    (c ? '<div class="form-group"><label class="form-label">API密钥</label><div class="flex gap-8"><input class="input masked" value="' + c.apiKey + '" readonly><button class="btn" onclick="App.copyToClipboard(\'' + c.apiKey + '\')">复制</button></div></div>' : '');
    showModal({ title: c ? '编辑渠道' : '新增渠道', size: 'lg', body: body,
      footer: '<button class="btn" data-modal-close>取消</button><button class="btn btn-primary" data-modal-confirm>' + (c?'保存':'创建并生成密钥') + '</button>',
      onConfirm: function() {
        toast(c ? '渠道已更新' : '渠道已创建，API密钥已生成');
        closeModal();
      }});
  },

  viewEmbedCode: function(id) {
    var c = State.channels.find(function(x){return x.id===id;});
    if (!c) return;
    var code = c.embedCode;
    var lineNums = code.split('\n').map(function(_, i){return '<span class="line-num">' + (i+1) + '</span>';}).join('');
    var body = '<div class="mb-16">' +
      '<div class="text-sm text-muted mb-8">渠道信息</div>' +
      '<div class="grid-2">' +
        '<div><div class="text-sm text-muted">渠道名称</div><div class="text-bold">' + c.name + '</div></div>' +
        '<div><div class="text-sm text-muted">渠道类型</div><div><span class="badge blue">' + c.type + '</span></div></div>' +
        '<div><div class="text-sm text-muted">绑定人设</div><div>' + c.persona + '</div></div>' +
        '<div><div class="text-sm text-muted">分流客服组</div><div>' + c.group + '</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="mb-16"><div class="text-sm text-muted mb-8">API密钥</div><div class="flex gap-8"><input class="input masked" value="' + c.apiKey + '" readonly><button class="btn" onclick="App.copyToClipboard(\'' + c.apiKey + '\')">复制密钥</button></div></div>' +
    '<div><div class="text-sm text-muted mb-8">嵌入代码（嵌入到网页&lt;body&gt;标签内即可生效）</div>' +
      '<div class="code-block"><div class="copy-btn" onclick="App.copyToClipboard(\'' + code.replace(/'/g, "\\'") + '\')">复制代码</div>' +
        '<div style="white-space:pre-wrap;">' + code.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>' +
      '</div>' +
    '</div>';
    showModal({ title: '嵌入代码 - ' + c.name, size: 'lg', body: body,
      footer: '<button class="btn" data-modal-close>关闭</button>' });
  },

  toggleChannelStatus: function(id) {
    var c = State.channels.find(function(x){return x.id===id;});
    if (!c) return;
    confirmDialog({ title: c.status==='active'?'停用渠道':'启用渠道', message: '确定要' + (c.status==='active'?'停用':'启用') + '渠道「' + c.name + '」吗？', onConfirm:function(){ c.status = c.status==='active'?'inactive':'active'; toast('状态已更新'); navigateTo('channel'); }});
  },

  deleteChannel: function(id) {
    confirmDialog({ title:'删除渠道', message:'确定要删除此渠道吗？删除后嵌入代码将失效。', danger:true, confirmText:'确认删除',
      onConfirm:function(){ var i = State.channels.findIndex(function(x){return x.id===id;}); if(i>-1) State.channels.splice(i,1); toast('已删除'); navigateTo('channel'); }});
  },

  /* ========== 账号管理 ========== */
  openAccountModal: function(id) {
    var a = id ? State.accounts.find(function(x){return x.id===id;}) : null;
    var body = '' +
    '<div class="grid-2">' +
      '<div class="form-group"><label class="form-label">姓名 <span class="required">*</span></label><input class="input" value="' + (a?a.name:'') + '" placeholder="请输入姓名"></div>' +
      '<div class="form-group"><label class="form-label">账号 <span class="required">*</span></label><input class="input" value="' + (a?a.account:'') + '" placeholder="请输入登录账号"></div>' +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="form-group"><label class="form-label">角色 <span class="required">*</span></label><select class="select" style="width:100%;"><option>集团管理员</option><option>运营主管</option><option>客服组长</option><option>AI训练师</option><option>子公司客服</option><option>数据分析员</option></select></div>' +
      '<div class="form-group"><label class="form-label">所属租户 <span class="required">*</span></label><select class="select" style="width:100%;"><option>集团总部</option><option>华东子公司</option><option>华南子公司</option></select></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">权限配置</label><div class="text-sm text-muted mb-8">勾选该账号可访问的模块及操作权限：</div>' +
      '<div style="border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;max-height:200px;overflow-y:auto;">' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox" checked> 仪表盘 - 查看</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox" checked> AI人设配置 - 查看</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> AI人设配置 - 编辑</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox" checked> 知识库投喂 - 查看</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> 知识库投喂 - 编辑</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> AI自动复盘 - 查看</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> AI调教训练 - 查看</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> AI调教训练 - 编辑</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> 运营数据分析 - 查看</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> 协同工作台 - 查看</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> 协同工作台 - 编辑</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> 渠道接入管理 - 查看</label></div>' +
        '<div class="mb-8"><label class="checkbox"><input type="checkbox"> 账号权限管理 - 查看</label></div>' +
      '</div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">状态</label><div><label class="switch"><input type="checkbox" ' + (!a||a.status==='active'?'checked':'') + '><span class="slider"></span></label> <span class="text-sm text-muted">启用</span></div></div>';
    showModal({ title: a ? '编辑账号' : '新增账号', size: 'lg', body: body,
      footer: '<button class="btn" data-modal-close>取消</button><button class="btn btn-primary" data-modal-confirm>保存</button>',
      onConfirm: function() { toast(a ? '账号已更新' : '账号已创建'); closeModal(); }});
  },

  viewPermissions: function(id) {
    var a = State.accounts.find(function(x){return x.id===id;});
    if (!a) return;
    var body = '<div class="flex-between mb-16"><div><div class="text-bold text-lg">' + a.name + '</div><div class="text-sm text-muted">' + a.account + ' · ' + a.role + '</div></div><span class="badge blue">' + a.permissions.length + '项权限</span></div>' +
      '<div class="text-sm text-muted mb-8">已授权权限列表：</div>' +
      '<div>' + a.permissions.map(function(p){return '<div class="mb-8"><label class="checkbox"><input type="checkbox" checked disabled> ' + p + '</label></div>';}).join('') + '</div>';
    showModal({ title: '权限详情', body: body, footer: '<button class="btn" data-modal-close>关闭</button>' });
  },

  resetPassword: function(id) {
    var a = State.accounts.find(function(x){return x.id===id;});
    confirmDialog({ title:'重置密码', message:'确定要重置「' + (a?a.name:'') + '」的密码吗？系统将发送新密码到其注册邮箱。', confirmText:'确认重置',
      onConfirm:function(){ toast('密码已重置，新密码已发送到邮箱'); }});
  },

  toggleAccountStatus: function(id) {
    var a = State.accounts.find(function(x){return x.id===id;});
    confirmDialog({ title: a.status==='active'?'停用账号':'启用账号', message: '确定要' + (a.status==='active'?'停用':'启用') + '「' + a.name + '」的账号吗？', onConfirm:function(){ a.status = a.status==='active'?'inactive':'active'; toast('状态已更新'); navigateTo('account'); }});
  },

  deleteAccount: function(id) {
    confirmDialog({ title:'删除账号', message:'确定要删除此账号吗？删除后不可恢复。', danger:true, confirmText:'确认删除',
      onConfirm:function(){ var i = State.accounts.findIndex(function(x){return x.id===id;}); if(i>-1) State.accounts.splice(i,1); toast('已删除'); navigateTo('account'); }});
  },
};

/* ===================== 初始化 ===================== */
function init() {
  initMockData();
  renderNav();
  initTenantSwitcher();
  navigateTo('dashboard');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
