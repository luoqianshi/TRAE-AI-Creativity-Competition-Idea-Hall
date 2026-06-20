export const mockData = {
  score: 4.5,
  scoreDetails: {
    hygiene: 4.6,
    maintenance: 4.4,
    security: 4.7,
    service: 4.3
  },
  complaintTrend: [
    { month: '1月', count: 28 },
    { month: '2月', count: 22 },
    { month: '3月', count: 35 },
    { month: '4月', count: 29 },
    { month: '5月', count: 31 },
    { month: '6月', count: 26 }
  ],
  financeStatus: {
    collectionRate: 92.5,
    publicIncome: 156000,
    publicExpense: 89000,
    lastUpdate: '2024-06-15'
  },
  incomeList: [
    { id: 1, category: '物业费', amount: 1250000, description: '2024年上半年物业费收入', date: '2024-06-30' },
    { id: 2, category: '公共收益', amount: 156000, description: '电梯广告、停车场收入', date: '2024-06-30' },
    { id: 3, category: '其他收入', amount: 28000, description: '装修押金退还利息', date: '2024-06-30' }
  ],
  expenseList: [
    { id: 1, category: '人员工资', amount: 450000, description: '物业人员薪酬', date: '2024-06-30' },
    { id: 2, category: '公共设施维护', amount: 180000, description: '电梯维护、绿化养护', date: '2024-06-30' },
    { id: 3, category: '水电费', amount: 95000, description: '公共区域水电费用', date: '2024-06-30' },
    { id: 4, category: '清洁卫生', amount: 68000, description: '保洁服务费用', date: '2024-06-30' },
    { id: 5, category: '安保服务', amount: 52000, description: '保安人员费用', date: '2024-06-30' },
    { id: 6, category: '办公费用', amount: 28000, description: '办公用品、水电费', date: '2024-06-30' }
  ],
  publicIncomeFlow: [
    { source: '电梯广告', amount: 45000, use: '小区公共设施维修' },
    { source: '地下停车场', amount: 68000, use: '绿化升级改造' },
    { source: '快递柜租金', amount: 22000, use: '健身器材更新' },
    { source: '场地租赁', amount: 21000, use: '儿童游乐区维护' }
  ],
  complaints: [
    {
      id: 1,
      type: '卫生',
      description: '小区楼道垃圾桶长期未清理，异味严重，影响居民生活。',
      images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=dirty%20trash%20can%20in%20residential%20building%20corridor&image_size=square'],
      status: 'completed',
      createdAt: '2024-06-10 14:30',
      updatedAt: '2024-06-11 09:15',
      rating: 5
    },
    {
      id: 2,
      type: '维修',
      description: '3号楼2单元电梯故障已持续3天，严重影响高层住户出行。',
      images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=broken%20elevator%20in%20residential%20building&image_size=square'],
      status: 'processing',
      createdAt: '2024-06-14 08:20',
      updatedAt: '2024-06-14 10:30'
    },
    {
      id: 3,
      type: '安保',
      description: '小区东门门禁系统损坏，外来人员可随意进出，存在安全隐患。',
      images: [],
      status: 'pending',
      createdAt: '2024-06-15 16:45',
      updatedAt: '2024-06-15 16:45'
    },
    {
      id: 4,
      type: '绿化',
      description: '小区中心花园草坪长期无人修剪，杂草丛生，蚊虫滋生。',
      images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=overgrown%20lawn%20with%20weeds%20in%20residential%20garden&image_size=square'],
      status: 'completed',
      createdAt: '2024-06-08 09:10',
      updatedAt: '2024-06-09 15:20',
      rating: 4
    },
    {
      id: 5,
      type: '噪音',
      description: '夜间11点后仍有装修施工噪音，严重影响睡眠。',
      images: [],
      status: 'processing',
      createdAt: '2024-06-13 23:15',
      updatedAt: '2024-06-14 09:00'
    }
  ],
  complaintTypes: ['卫生', '维修', '安保', '绿化', '噪音', '其他'],
  serviceRecords: [
    {
      id: 1,
      serviceType: '保洁服务',
      title: '楼道日常清洁',
      description: '每日对小区所有楼道进行清扫，保持公共区域整洁',
      status: 'completed',
      completedAt: '2024-06-15',
      rating: 4.7
    },
    {
      id: 2,
      serviceType: '设施维修',
      title: '电梯定期维保',
      description: '每月对所有电梯进行安全检查和维护保养',
      status: 'completed',
      completedAt: '2024-06-10',
      rating: 4.8
    },
    {
      id: 3,
      serviceType: '安保服务',
      title: '24小时巡逻',
      description: '安保人员全天候巡逻，确保小区安全',
      status: 'completed',
      completedAt: '2024-06-15',
      rating: 4.5
    },
    {
      id: 4,
      serviceType: '绿化养护',
      title: '草坪修剪',
      description: '定期修剪小区草坪和灌木',
      status: 'pending',
      completedAt: null,
      rating: null
    },
    {
      id: 5,
      serviceType: '设备维护',
      title: '消防设备检查',
      description: '季度消防设备全面检查',
      status: 'completed',
      completedAt: '2024-06-01',
      rating: 5.0
    },
    {
      id: 6,
      serviceType: '保洁服务',
      title: '垃圾清运',
      description: '每日定时清运小区生活垃圾',
      status: 'completed',
      completedAt: '2024-06-15',
      rating: 4.6
    }
  ],
  creditScore: {
    score: 92,
    level: '优秀',
    evaluation: '该物业公司服务质量优秀，业主满意度高',
    details: [
      { name: '服务响应速度', score: 95 },
      { name: '问题解决率', score: 90 },
      { name: '业主满意度', score: 93 },
      { name: '费用透明度', score: 88 }
    ]
  },
  dashboardStats: {
    totalComplaints: 156,
    resolvedComplaints: 142,
    resolutionRate: 91.0,
    avgResponseTime: '2.5小时',
    satisfactionRate: 88.5,
    pendingCount: 14
  },
  heatmapData: [
    { district: '1号楼', count: 28, lat: 31.2304, lng: 121.4737 },
    { district: '2号楼', count: 15, lat: 31.2308, lng: 121.4742 },
    { district: '3号楼', count: 35, lat: 31.2312, lng: 121.4739 },
    { district: '4号楼', count: 18, lat: 31.2306, lng: 121.4745 },
    { district: '5号楼', count: 22, lat: 31.2310, lng: 121.4741 },
    { district: '6号楼', count: 14, lat: 31.2309, lng: 121.4735 },
    { district: '7号楼', count: 24, lat: 31.2305, lng: 121.4748 },
    { district: '8号楼', count: 10, lat: 31.2311, lng: 121.4733 }
  ],
  monthlyStats: [
    { month: '1月', complaints: 28, resolved: 26 },
    { month: '2月', complaints: 22, resolved: 21 },
    { month: '3月', complaints: 35, resolved: 32 },
    { month: '4月', complaints: 29, resolved: 28 },
    { month: '5月', complaints: 31, resolved: 29 },
    { month: '6月', complaints: 26, resolved: 24 }
  ],
  complaintTypeStats: [
    { type: '卫生', count: 45, percentage: 28.9 },
    { type: '维修', count: 38, percentage: 24.4 },
    { type: '安保', count: 25, percentage: 16.0 },
    { type: '绿化', count: 18, percentage: 11.5 },
    { type: '噪音', count: 22, percentage: 14.1 },
    { type: '其他', count: 8, percentage: 5.1 }
  ],
  companyRanking: [
    { rank: 1, name: '绿城物业', score: 95, complaints: 12 },
    { rank: 2, name: '万科物业', score: 92, complaints: 18 },
    { rank: 3, name: '保利物业', score: 90, complaints: 22 },
    { rank: 4, name: '碧桂园物业', score: 88, complaints: 28 },
    { rank: 5, name: '恒大物业', score: 85, complaints: 35 }
  ]
}
