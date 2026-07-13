/* ============================================
   颐养评估 - Mock数据
   ============================================ */

(function(window) {
    'use strict';

    /* ============================================
       1. 量表数据
       ============================================ */

    // 量表1：老年人能力综合评估（GB/T 42195-2022）
    const scale01 = {
        id: 'scale-001',
        name: '老年人能力综合评估',
        standard: 'GB/T 42195-2022 国家标准',
        description: '依据国家标准，从日常生活活动、精神状态、感知觉与沟通、社会参与四个维度综合评估老年人能力等级，为养老服务提供科学依据。',
        totalItems: 26,
        estimatedTime: '约30分钟',
        dimensions: [
            {
                id: 'dim-1',
                name: '日常生活活动',
                itemCount: 10,
                maxScore: 100,
                description: '评估老年人独立完成日常活动的能力',
                items: [
                    { id: 'item-1-1', name: '进食', scoreOptions: [
                        { label: '可独立进食', score: 10, level: 0 },
                        { label: '需部分帮助', score: 5, level: 1 },
                        { label: '需极大帮助或完全依赖', score: 0, level: 3 }
                    ]},
                    { id: 'item-1-2', name: '洗澡', scoreOptions: [
                        { label: '可独立完成', score: 5, level: 0 },
                        { label: '需部分帮助', score: 3, level: 1 },
                        { label: '需极大帮助或完全依赖', score: 0, level: 3 }
                    ]},
                    { id: 'item-1-3', name: '修饰', scoreOptions: [
                        { label: '可独立完成', score: 5, level: 0 },
                        { label: '需部分帮助', score: 3, level: 1 },
                        { label: '需极大帮助或完全依赖', score: 0, level: 3 }
                    ]},
                    { id: 'item-1-4', name: '穿衣', scoreOptions: [
                        { label: '可独立完成', score: 10, level: 0 },
                        { label: '需部分帮助', score: 5, level: 1 },
                        { label: '需极大帮助或完全依赖', score: 0, level: 3 }
                    ]},
                    { id: 'item-1-5', name: '大便控制', scoreOptions: [
                        { label: '可控制', score: 10, level: 0 },
                        { label: '偶有失禁（每周≤1次）', score: 5, level: 1 },
                        { label: '经常失禁或完全失控', score: 0, level: 3 }
                    ]},
                    { id: 'item-1-6', name: '小便控制', scoreOptions: [
                        { label: '可控制', score: 10, level: 0 },
                        { label: '偶有失禁（每日≤1次）', score: 5, level: 1 },
                        { label: '经常失禁或完全失控', score: 0, level: 3 }
                    ]},
                    { id: 'item-1-7', name: '如厕', scoreOptions: [
                        { label: '可独立完成', score: 10, level: 0 },
                        { label: '需部分帮助', score: 5, level: 1 },
                        { label: '需极大帮助或完全依赖', score: 0, level: 3 }
                    ]},
                    { id: 'item-1-8', name: '床椅转移', scoreOptions: [
                        { label: '可独立完成', score: 15, level: 0 },
                        { label: '需部分帮助', score: 10, level: 1 },
                        { label: '需极大帮助', score: 5, level: 2 },
                        { label: '完全依赖', score: 0, level: 3 }
                    ]},
                    { id: 'item-1-9', name: '平地行走', scoreOptions: [
                        { label: '可独立行走45m以上', score: 15, level: 0 },
                        { label: '需部分帮助', score: 10, level: 1 },
                        { label: '需极大帮助', score: 5, level: 2 },
                        { label: '完全不能独立', score: 0, level: 3 }
                    ]},
                    { id: 'item-1-10', name: '上下楼梯', scoreOptions: [
                        { label: '可独立完成', score: 10, level: 0 },
                        { label: '需部分帮助', score: 5, level: 1 },
                        { label: '需极大帮助或完全依赖', score: 0, level: 3 }
                    ]}
                ]
            },
            {
                id: 'dim-2',
                name: '精神状态',
                itemCount: 4,
                maxScore: 40,
                description: '评估老年人认知功能、情绪行为等精神状态',
                items: [
                    { id: 'item-2-1', name: '认知功能', scoreOptions: [
                        { label: '认知功能正常', score: 10, level: 0 },
                        { label: '轻度认知障碍', score: 5, level: 1 },
                        { label: '中度认知障碍', score: 2, level: 2 },
                        { label: '重度认知障碍', score: 0, level: 3 }
                    ]},
                    { id: 'item-2-2', name: '攻击行为', scoreOptions: [
                        { label: '无攻击行为', score: 10, level: 0 },
                        { label: '偶有攻击行为', score: 5, level: 1 },
                        { label: '常有攻击行为', score: 0, level: 3 }
                    ]},
                    { id: 'item-2-3', name: '抑郁症状', scoreOptions: [
                        { label: '无抑郁症状', score: 10, level: 0 },
                        { label: '轻度抑郁', score: 5, level: 1 },
                        { label: '中度至重度抑郁', score: 0, level: 3 }
                    ]},
                    { id: 'item-2-4', name: '行为退缩', scoreOptions: [
                        { label: '无行为退缩', score: 10, level: 0 },
                        { label: '轻度行为退缩', score: 5, level: 1 },
                        { label: '重度行为退缩', score: 0, level: 3 }
                    ]}
                ]
            },
            {
                id: 'dim-3',
                name: '感知觉与沟通',
                itemCount: 5,
                maxScore: 50,
                description: '评估老年人感知觉功能及沟通能力',
                items: [
                    { id: 'item-3-1', name: '意识水平', scoreOptions: [
                        { label: '意识清醒', score: 10, level: 0 },
                        { label: '轻度意识障碍', score: 5, level: 1 },
                        { label: '中度意识障碍', score: 2, level: 2 },
                        { label: '重度意识障碍', score: 0, level: 3 }
                    ]},
                    { id: 'item-3-2', name: '视力', scoreOptions: [
                        { label: '正常', score: 10, level: 0 },
                        { label: '轻度障碍', score: 7, level: 0 },
                        { label: '中度障碍', score: 3, level: 1 },
                        { label: '重度障碍', score: 0, level: 3 }
                    ]},
                    { id: 'item-3-3', name: '听力', scoreOptions: [
                        { label: '正常', score: 10, level: 0 },
                        { label: '轻度障碍', score: 7, level: 0 },
                        { label: '中度障碍', score: 3, level: 1 },
                        { label: '重度障碍', score: 0, level: 3 }
                    ]},
                    { id: 'item-3-4', name: '沟通交流', scoreOptions: [
                        { label: '沟通无障碍', score: 10, level: 0 },
                        { label: '轻度沟通困难', score: 5, level: 1 },
                        { label: '中度沟通困难', score: 2, level: 2 },
                        { label: '重度沟通困难', score: 0, level: 3 }
                    ]},
                    { id: 'item-3-5', name: '疼痛评估', scoreOptions: [
                        { label: '无疼痛', score: 10, level: 0 },
                        { label: '轻度疼痛', score: 7, level: 0 },
                        { label: '中度疼痛', score: 4, level: 1 },
                        { label: '重度疼痛', score: 0, level: 2 }
                    ]}
                ]
            },
            {
                id: 'dim-4',
                name: '社会参与',
                itemCount: 7,
                maxScore: 70,
                description: '评估老年人社会交往及参与能力',
                items: [
                    { id: 'item-4-1', name: '生活能力', scoreOptions: [
                        { label: '可完全独立', score: 10, level: 0 },
                        { label: '需部分指导', score: 7, level: 0 },
                        { label: '需较多指导', score: 3, level: 1 },
                        { label: '完全不能', score: 0, level: 3 }
                    ]},
                    { id: 'item-4-2', name: '工作能力', scoreOptions: [
                        { label: '正常', score: 10, level: 0 },
                        { label: '轻度下降', score: 7, level: 0 },
                        { label: '明显下降', score: 3, level: 1 },
                        { label: '丧失', score: 0, level: 3 }
                    ]},
                    { id: 'item-4-3', name: '时间/空间定向', scoreOptions: [
                        { label: '定向正常', score: 10, level: 0 },
                        { label: '轻度障碍', score: 7, level: 0 },
                        { label: '中度障碍', score: 3, level: 1 },
                        { label: '重度障碍', score: 0, level: 3 }
                    ]},
                    { id: 'item-4-4', name: '人物定向', scoreOptions: [
                        { label: '定向正常', score: 10, level: 0 },
                        { label: '轻度障碍', score: 7, level: 0 },
                        { label: '中度障碍', score: 3, level: 1 },
                        { label: '重度障碍', score: 0, level: 3 }
                    ]},
                    { id: 'item-4-5', name: '社会交往能力', scoreOptions: [
                        { label: '正常', score: 10, level: 0 },
                        { label: '轻度减退', score: 7, level: 0 },
                        { label: '中度减退', score: 3, level: 1 },
                        { label: '重度减退', score: 0, level: 3 }
                    ]},
                    { id: 'item-4-6', name: '家庭关系', scoreOptions: [
                        { label: '良好', score: 10, level: 0 },
                        { label: '一般', score: 7, level: 0 },
                        { label: '较差', score: 3, level: 1 },
                        { label: '极差', score: 0, level: 2 }
                    ]},
                    { id: 'item-4-7', name: '社会支持', scoreOptions: [
                        { label: '良好', score: 10, level: 0 },
                        { label: '一般', score: 7, level: 0 },
                        { label: '较少', score: 3, level: 1 },
                        { label: '缺乏', score: 0, level: 2 }
                    ]}
                ]
            }
        ],
        levelMapping: [
            { level: 0, name: '能力完好', minScore: 90, description: '各项功能完好，完全自理' },
            { level: 1, name: '轻度失能', minScore: 65, description: '轻度功能障碍，基本自理' },
            { level: 2, name: '中度失能', minScore: 45, description: '中度功能障碍，需要协助' },
            { level: 3, name: '重度失能', minScore: 0, description: '重度功能障碍，完全依赖' }
        ]
    };

    // 量表2：ADL量表评估（Barthel指数）
    const scale02 = {
        id: 'scale-002',
        name: 'ADL量表评估',
        subtitle: 'Barthel指数评定',
        standard: '国际通用巴氏指数',
        description: 'Barthel指数是国际通用的日常生活活动能力评定量表，通过10项日常生活活动评估患者的自理能力，总分100分。',
        totalItems: 10,
        estimatedTime: '约15分钟',
        dimensions: [
            {
                id: 'adl-1',
                name: '日常生活活动',
                itemCount: 10,
                maxScore: 100,
                items: [
                    { id: 'adl-1', name: '进食', scoreOptions: [
                        { label: '完全独立，能自己进食', score: 10 },
                        { label: '需部分帮助（夹菜、盛饭）', score: 5 },
                        { label: '完全依赖，需喂食', score: 0 }
                    ]},
                    { id: 'adl-2', name: '洗澡', scoreOptions: [
                        { label: '完全独立', score: 5 },
                        { label: '依赖他人帮助', score: 0 }
                    ]},
                    { id: 'adl-3', name: '修饰', scoreOptions: [
                        { label: '能独立完成洗脸、刷牙、梳头、刮脸', score: 5 },
                        { label: '需他人帮助', score: 0 }
                    ]},
                    { id: 'adl-4', name: '穿衣', scoreOptions: [
                        { label: '完全独立，能自己穿脱', score: 10 },
                        { label: '需部分帮助', score: 5 },
                        { label: '完全依赖', score: 0 }
                    ]},
                    { id: 'adl-5', name: '大便控制', scoreOptions: [
                        { label: '完全能控制，无失禁', score: 10 },
                        { label: '偶有失禁（每周<1次）', score: 5 },
                        { label: '经常失禁或完全失控', score: 0 }
                    ]},
                    { id: 'adl-6', name: '小便控制', scoreOptions: [
                        { label: '完全能控制，无失禁', score: 10 },
                        { label: '偶有失禁（每日<1次）', score: 5 },
                        { label: '经常失禁或尿潴留', score: 0 }
                    ]},
                    { id: 'adl-7', name: '如厕', scoreOptions: [
                        { label: '完全独立', score: 10 },
                        { label: '需部分帮助', score: 5 },
                        { label: '完全依赖', score: 0 }
                    ]},
                    { id: 'adl-8', name: '床椅转移', scoreOptions: [
                        { label: '完全独立', score: 15 },
                        { label: '需少量帮助（1人）或指导', score: 10 },
                        { label: '需大量帮助（2人）', score: 5 },
                        { label: '完全依赖，不能坐起', score: 0 }
                    ]},
                    { id: 'adl-9', name: '平地行走45m', scoreOptions: [
                        { label: '完全独立', score: 15 },
                        { label: '需少量帮助或使用轮椅', score: 10 },
                        { label: '需大量帮助（1人躯体帮助）', score: 5 },
                        { label: '完全依赖，不能行走', score: 0 }
                    ]},
                    { id: 'adl-10', name: '上下楼梯', scoreOptions: [
                        { label: '完全独立', score: 10 },
                        { label: '需部分帮助', score: 5 },
                        { label: '完全依赖', score: 0 }
                    ]}
                ]
            }
        ],
        levelMapping: [
            { level: '重度', name: '重度功能障碍', minScore: 0, maxScore: 40, description: '大部分或全部日常生活需要他人照料' },
            { level: '中度', name: '中度功能障碍', minScore: 41, maxScore: 60, description: '日常生活需要一定的帮助' },
            { level: '轻度', name: '轻度功能障碍', minScore: 61, maxScore: 99, description: '日常生活基本自理' },
            { level: '正常', name: '日常生活自理', minScore: 100, maxScore: 100, description: '日常生活完全独立' }
        ]
    };

    // 量表3：跌倒风险评估（Morse跌倒量表）
    const scale03 = {
        id: 'scale-003',
        name: '跌倒风险评估',
        subtitle: 'Morse跌倒量表',
        standard: 'MFS 国际通用跌倒风险评估',
        description: 'Morse跌倒评估量表是专门用于预测患者跌倒风险的评估工具，通过6个维度评估患者跌倒风险等级。',
        totalItems: 6,
        estimatedTime: '约5分钟',
        dimensions: [
            {
                id: 'mfs-1',
                name: '跌倒风险因素',
                itemCount: 6,
                maxScore: 125,
                items: [
                    { id: 'mfs-1', name: '跌倒史', scoreOptions: [
                        { label: '无跌倒史', score: 0 },
                        { label: '有跌倒史', score: 25 }
                    ]},
                    { id: 'mfs-2', name: '多医学诊断', scoreOptions: [
                        { label: '1种诊断', score: 0 },
                        { label: '2种及以上诊断', score: 15 }
                    ]},
                    { id: 'mfs-3', name: '行走辅助', scoreOptions: [
                        { label: '不需要/卧床/轮椅/由他人协助', score: 0 },
                        { label: '手杖/拐杖/助行器', score: 15 },
                        { label: '扶着家具行走', score: 30 }
                    ]},
                    { id: 'mfs-4', name: '静脉输液/肝素锁', scoreOptions: [
                        { label: '无', score: 0 },
                        { label: '有', score: 20 }
                    ]},
                    { id: 'mfs-5', name: '步态', scoreOptions: [
                        { label: '正常/卧床/轮椅', score: 0 },
                        { label: '虚弱', score: 10 },
                        { label: '残疾/失调', score: 20 }
                    ]},
                    { id: 'mfs-6', name: '认知状态', scoreOptions: [
                        { label: '有自知力/量力而行', score: 0 },
                        { label: '高估自己能力/健忘', score: 15 }
                    ]}
                ]
            }
        ],
        levelMapping: [
            { level: 'low', name: '低风险', minScore: 0, maxScore: 24, description: '跌倒风险较低，正常护理即可' },
            { level: 'medium', name: '中风险', minScore: 25, maxScore: 44, description: '跌倒风险中等，需采取预防措施' },
            { level: 'high', name: '高风险', minScore: 45, maxScore: 125, description: '跌倒风险高，必须采取严格预防措施' }
        ]
    };

    // 量表4：居家环境安全评估
    const scale04 = {
        id: 'scale-004',
        name: '居家环境安全评估',
        standard: '养老机构环境安全标准',
        description: '从住房条件、地面安全、卫浴安全、家具照明、电气厨房、紧急呼叫六个维度评估老年人居家环境的安全性，识别潜在风险。',
        totalItems: 25,
        estimatedTime: '约20分钟',
        dimensions: [
            {
                id: 'env-1',
                name: '住房条件',
                itemCount: 4,
                maxScore: 40,
                items: [
                    { id: 'env-1-1', name: '住房类型', scoreOptions: [
                        { label: '平房/一层，出入方便', score: 10, status: 'good' },
                        { label: '有电梯的楼房', score: 8, status: 'good' },
                        { label: '无电梯且在2-3层', score: 4, status: 'warning' },
                        { label: '无电梯且在4层及以上', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-1-2', name: '室内面积', scoreOptions: [
                        { label: '宽敞（人均≥15㎡）', score: 10, status: 'good' },
                        { label: '适中（人均10-15㎡）', score: 8, status: 'good' },
                        { label: '较拥挤（人均5-10㎡）', score: 4, status: 'warning' },
                        { label: '拥挤（人均<5㎡）', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-1-3', name: '采光通风', scoreOptions: [
                        { label: '采光好，通风良好', score: 10, status: 'good' },
                        { label: '采光一般，通风尚可', score: 7, status: 'good' },
                        { label: '采光较差，通风一般', score: 4, status: 'warning' },
                        { label: '阴暗潮湿，通风差', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-1-4', name: '室内温度', scoreOptions: [
                        { label: '温度适宜，有取暖/降温设备', score: 10, status: 'good' },
                        { label: '基本舒适', score: 7, status: 'good' },
                        { label: '冬冷夏热', score: 4, status: 'warning' },
                        { label: '极端温度，无调节设备', score: 0, status: 'danger' }
                    ]}
                ]
            },
            {
                id: 'env-2',
                name: '地面安全',
                itemCount: 4,
                maxScore: 40,
                items: [
                    { id: 'env-2-1', name: '地面材质', scoreOptions: [
                        { label: '防滑地板/地毯，平整', score: 10, status: 'good' },
                        { label: '普通地板，基本平整', score: 7, status: 'good' },
                        { label: '光滑地砖，有少量门槛', score: 4, status: 'warning' },
                        { label: '不平整/湿滑/有高低差', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-2-2', name: '地面整洁', scoreOptions: [
                        { label: '整洁无杂物', score: 10, status: 'good' },
                        { label: '基本整洁，少量物品', score: 7, status: 'good' },
                        { label: '杂物较多，行走不便', score: 4, status: 'warning' },
                        { label: '杂物堆积，影响通行', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-2-3', name: '地毯/脚垫', scoreOptions: [
                        { label: '无或固定良好', score: 10, status: 'good' },
                        { label: '有防滑底垫', score: 8, status: 'good' },
                        { label: '有松动的小地毯', score: 4, status: 'warning' },
                        { label: '地毯易滑动，有绊倒风险', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-2-4', name: '楼梯台阶', scoreOptions: [
                        { label: '无楼梯/有扶手且防滑', score: 10, status: 'good' },
                        { label: '有扶手，台阶完好', score: 8, status: 'good' },
                        { label: '无扶手或部分损坏', score: 4, status: 'warning' },
                        { label: '台阶破损/无扶手/高度不均', score: 0, status: 'danger' }
                    ]}
                ]
            },
            {
                id: 'env-3',
                name: '卫浴安全',
                itemCount: 5,
                maxScore: 50,
                items: [
                    { id: 'env-3-1', name: '浴室防滑', scoreOptions: [
                        { label: '防滑地板+防滑垫+扶手', score: 10, status: 'good' },
                        { label: '有防滑垫或扶手', score: 7, status: 'good' },
                        { label: '防滑措施不足', score: 4, status: 'warning' },
                        { label: '无防滑措施', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-3-2', name: '如厕设施', scoreOptions: [
                        { label: '坐便器，有扶手，高度适宜', score: 10, status: 'good' },
                        { label: '坐便器，无扶手', score: 7, status: 'good' },
                        { label: '蹲便器，有助起设施', score: 4, status: 'warning' },
                        { label: '蹲便器，无辅助设施', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-3-3', name: '洗浴设施', scoreOptions: [
                        { label: '淋浴，有座椅和扶手', score: 10, status: 'good' },
                        { label: '淋浴，有扶手', score: 7, status: 'good' },
                        { label: '浴缸，需跨进', score: 4, status: 'warning' },
                        { label: '浴缸深，出入困难', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-3-4', name: '浴室通风', scoreOptions: [
                        { label: '通风良好，干燥快', score: 10, status: 'good' },
                        { label: '有窗户，基本通风', score: 7, status: 'good' },
                        { label: '通风一般，潮湿', score: 4, status: 'warning' },
                        { label: '通风差，长期潮湿', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-3-5', name: '紧急呼叫装置', scoreOptions: [
                        { label: '浴室内有紧急呼叫铃', score: 10, status: 'good' },
                        { label: '附近有呼叫设备', score: 7, status: 'good' },
                        { label: '有手机可联系', score: 4, status: 'warning' },
                        { label: '无任何呼叫装置', score: 0, status: 'danger' }
                    ]}
                ]
            },
            {
                id: 'env-4',
                name: '家具照明',
                itemCount: 4,
                maxScore: 40,
                items: [
                    { id: 'env-4-1', name: '家具摆放', scoreOptions: [
                        { label: '摆放合理，通道宽敞', score: 10, status: 'good' },
                        { label: '摆放有序，通道畅通', score: 8, status: 'good' },
                        { label: '摆放较拥挤，通行一般', score: 4, status: 'warning' },
                        { label: '摆放杂乱，通道狭窄', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-4-2', name: '家具稳定性', scoreOptions: [
                        { label: '家具稳固，边角圆润', score: 10, status: 'good' },
                        { label: '基本稳固，少量尖角', score: 7, status: 'good' },
                        { label: '部分家具不稳/有尖角', score: 4, status: 'warning' },
                        { label: '家具晃动/多处尖角', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-4-3', name: '室内照明', scoreOptions: [
                        { label: '光线充足，分布均匀', score: 10, status: 'good' },
                        { label: '照明良好', score: 8, status: 'good' },
                        { label: '部分区域照明不足', score: 4, status: 'warning' },
                        { label: '照明差，有暗区', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-4-4', name: '夜间照明', scoreOptions: [
                        { label: '床边有感应灯/夜灯', score: 10, status: 'good' },
                        { label: '有夜灯/台灯易触达', score: 8, status: 'good' },
                        { label: '需起身开灯', score: 4, status: 'warning' },
                        { label: '无夜间照明', score: 0, status: 'danger' }
                    ]}
                ]
            },
            {
                id: 'env-5',
                name: '电气厨房',
                itemCount: 4,
                maxScore: 40,
                items: [
                    { id: 'env-5-1', name: '电气安全', scoreOptions: [
                        { label: '线路规范，有漏电保护', score: 10, status: 'good' },
                        { label: '线路基本规范', score: 7, status: 'good' },
                        { label: '线路老化/私拉电线', score: 4, status: 'warning' },
                        { label: '线路杂乱，有安全隐患', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-5-2', name: '燃气安全', scoreOptions: [
                        { label: '管道燃气，有报警器', score: 10, status: 'good' },
                        { label: '瓶装燃气，使用规范', score: 7, status: 'good' },
                        { label: '燃气设施有老化', score: 4, status: 'warning' },
                        { label: '燃气设施老旧/无报警', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-5-3', name: '厨房操作', scoreOptions: [
                        { label: '台面高度适宜，操作方便', score: 10, status: 'good' },
                        { label: '基本满足操作需求', score: 7, status: 'good' },
                        { label: '操作不便，有一定困难', score: 4, status: 'warning' },
                        { label: '难以独立操作', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-5-4', name: '消防设施', scoreOptions: [
                        { label: '有灭火器/烟感报警器', score: 10, status: 'good' },
                        { label: '有基本消防意识', score: 7, status: 'good' },
                        { label: '消防设施不足', score: 4, status: 'warning' },
                        { label: '无任何消防措施', score: 0, status: 'danger' }
                    ]}
                ]
            },
            {
                id: 'env-6',
                name: '紧急呼叫',
                itemCount: 4,
                maxScore: 40,
                items: [
                    { id: 'env-6-1', name: '呼叫设备', scoreOptions: [
                        { label: '佩戴紧急呼叫器/智能手环', score: 10, status: 'good' },
                        { label: '手机随身携带', score: 8, status: 'good' },
                        { label: '有固定电话', score: 4, status: 'warning' },
                        { label: '无便捷通讯设备', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-6-2', name: '紧急联系人', scoreOptions: [
                        { label: '多位家属随叫随到', score: 10, status: 'good' },
                        { label: '有家属可及时联系', score: 8, status: 'good' },
                        { label: '有邻居/社区可联系', score: 4, status: 'warning' },
                        { label: '缺乏紧急联系人', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-6-3', name: '社区服务', scoreOptions: [
                        { label: '有社区养老服务中心', score: 10, status: 'good' },
                        { label: '社区有定期探访', score: 7, status: 'good' },
                        { label: '社区服务较少', score: 4, status: 'warning' },
                        { label: '无社区养老服务', score: 0, status: 'danger' }
                    ]},
                    { id: 'env-6-4', name: '医疗资源', scoreOptions: [
                        { label: '周边有三甲医院/社区医院', score: 10, status: 'good' },
                        { label: '有社区卫生服务站', score: 8, status: 'good' },
                        { label: '距离医疗机构较远', score: 4, status: 'warning' },
                        { label: '医疗资源匮乏', score: 0, status: 'danger' }
                    ]}
                ]
            }
        ],
        levelMapping: [
            { level: 'excellent', name: '安全等级：优秀', minScore: 90, description: '居家环境安全，无明显风险' },
            { level: 'good', name: '安全等级：良好', minScore: 70, description: '居家环境较安全，少量需改进' },
            { level: 'warning', name: '安全等级：中等', minScore: 50, description: '存在一定安全隐患，建议改造' },
            { level: 'danger', name: '安全等级：较差', minScore: 0, description: '安全隐患较多，急需改造' }
        ]
    };

    // 量表5：社会支持网络评估
    const scale05 = {
        id: 'scale-005',
        name: '社会支持网络评估',
        standard: '社会支持评定量表 (SSRS)',
        description: '从居住状况、家庭支持、邻里关系、社区参与、社会关系五个维度评估老年人的社会支持网络状况。',
        totalItems: 18,
        estimatedTime: '约15分钟',
        dimensions: [
            {
                id: 'ss-1',
                name: '居住状况',
                itemCount: 3,
                maxScore: 30,
                items: [
                    { id: 'ss-1-1', name: '居住方式', scoreOptions: [
                        { label: '与配偶同住', score: 10 },
                        { label: '与子女同住', score: 10 },
                        { label: '与配偶及子女同住', score: 10 },
                        { label: '独居', score: 4 },
                        { label: '养老机构', score: 7 }
                    ]},
                    { id: 'ss-1-2', name: '居住稳定性', scoreOptions: [
                        { label: '长期居住（≥10年）', score: 10 },
                        { label: '居住较久（5-10年）', score: 8 },
                        { label: '居住一般（2-5年）', score: 6 },
                        { label: '频繁搬迁（<2年）', score: 3 }
                    ]},
                    { id: 'ss-1-3', name: '居住满意度', scoreOptions: [
                        { label: '非常满意', score: 10 },
                        { label: '比较满意', score: 8 },
                        { label: '一般', score: 5 },
                        { label: '不太满意', score: 2 },
                        { label: '很不满意', score: 0 }
                    ]}
                ]
            },
            {
                id: 'ss-2',
                name: '家庭支持',
                itemCount: 4,
                maxScore: 40,
                items: [
                    { id: 'ss-2-1', name: '家庭成员数量', scoreOptions: [
                        { label: '3人以上', score: 10 },
                        { label: '2人', score: 7 },
                        { label: '1人（独居）', score: 3 }
                    ]},
                    { id: 'ss-2-2', name: '子女探望频率', scoreOptions: [
                        { label: '每天/几乎每天', score: 10 },
                        { label: '每周1-2次', score: 8 },
                        { label: '每月1-2次', score: 5 },
                        { label: '每年几次', score: 2 },
                        { label: '几乎不来', score: 0 }
                    ]},
                    { id: 'ss-2-3', name: '家庭经济支持', scoreOptions: [
                        { label: '充足，有结余', score: 10 },
                        { label: '够用，无压力', score: 8 },
                        { label: '基本够用', score: 5 },
                        { label: '较为紧张', score: 2 },
                        { label: '入不敷出', score: 0 }
                    ]},
                    { id: 'ss-2-4', name: '家庭关系满意度', scoreOptions: [
                        { label: '非常满意', score: 10 },
                        { label: '比较满意', score: 8 },
                        { label: '一般', score: 5 },
                        { label: '不太满意', score: 2 },
                        { label: '很不满意', score: 0 }
                    ]}
                ]
            },
            {
                id: 'ss-3',
                name: '邻里关系',
                itemCount: 3,
                maxScore: 30,
                items: [
                    { id: 'ss-3-1', name: '邻里交往频率', scoreOptions: [
                        { label: '经常来往', score: 10 },
                        { label: '偶尔来往', score: 7 },
                        { label: '点头之交', score: 4 },
                        { label: '基本不往来', score: 1 }
                    ]},
                    { id: 'ss-3-2', name: '邻里互助', scoreOptions: [
                        { label: '经常互相帮助', score: 10 },
                        { label: '偶尔互相帮助', score: 7 },
                        { label: '很少互帮互助', score: 4 },
                        { label: '没有互助', score: 1 }
                    ]},
                    { id: 'ss-3-3', name: '邻里关系满意度', scoreOptions: [
                        { label: '非常满意', score: 10 },
                        { label: '比较满意', score: 8 },
                        { label: '一般', score: 5 },
                        { label: '不太满意', score: 2 },
                        { label: '很不满意', score: 0 }
                    ]}
                ]
            },
            {
                id: 'ss-4',
                name: '社区参与',
                itemCount: 4,
                maxScore: 40,
                items: [
                    { id: 'ss-4-1', name: '社区活动参与', scoreOptions: [
                        { label: '经常参加', score: 10 },
                        { label: '偶尔参加', score: 7 },
                        { label: '很少参加', score: 3 },
                        { label: '从不参加', score: 0 }
                    ]},
                    { id: 'ss-4-2', name: '兴趣小组', scoreOptions: [
                        { label: '参加2个及以上', score: 10 },
                        { label: '参加1个', score: 7 },
                        { label: '有兴趣但未参加', score: 4 },
                        { label: '没有兴趣', score: 1 }
                    ]},
                    { id: 'ss-4-3', name: '志愿服务', scoreOptions: [
                        { label: '经常参与', score: 10 },
                        { label: '偶尔参与', score: 7 },
                        { label: '想参与但无渠道', score: 4 },
                        { label: '不感兴趣', score: 1 }
                    ]},
                    { id: 'ss-4-4', name: '社区归属感', scoreOptions: [
                        { label: '归属感很强', score: 10 },
                        { label: '归属感较强', score: 8 },
                        { label: '一般', score: 5 },
                        { label: '归属感较弱', score: 2 },
                        { label: '没有归属感', score: 0 }
                    ]}
                ]
            },
            {
                id: 'ss-5',
                name: '社会关系',
                itemCount: 4,
                maxScore: 40,
                items: [
                    { id: 'ss-5-1', name: '亲密朋友数量', scoreOptions: [
                        { label: '5个以上', score: 10 },
                        { label: '3-5个', score: 8 },
                        { label: '1-2个', score: 5 },
                        { label: '没有亲密朋友', score: 1 }
                    ]},
                    { id: 'ss-5-2', name: '社交活动频率', scoreOptions: [
                        { label: '每周多次', score: 10 },
                        { label: '每周1次左右', score: 8 },
                        { label: '每月1-2次', score: 5 },
                        { label: '很少社交', score: 2 },
                        { label: '基本不社交', score: 0 }
                    ]},
                    { id: 'ss-5-3', name: '倾诉对象', scoreOptions: [
                        { label: '有多位可以倾诉的人', score: 10 },
                        { label: '有1-2位可以倾诉的人', score: 7 },
                        { label: '较少有倾诉对象', score: 3 },
                        { label: '没有倾诉对象', score: 0 }
                    ]},
                    { id: 'ss-5-4', name: '社会支持满意度', scoreOptions: [
                        { label: '非常满意', score: 10 },
                        { label: '比较满意', score: 8 },
                        { label: '一般', score: 5 },
                        { label: '不太满意', score: 2 },
                        { label: '很不满意', score: 0 }
                    ]}
                ]
            }
        ],
        levelMapping: [
            { level: 'high', name: '社会支持充足', minScore: 85, description: '社会支持网络完善，生活幸福感高' },
            { level: 'medium', name: '社会支持良好', minScore: 65, description: '社会支持较好，基本满足需求' },
            { level: 'low', name: '社会支持一般', minScore: 45, description: '社会支持有限，需要关注' },
            { level: 'lack', name: '社会支持匮乏', minScore: 0, description: '社会支持严重不足，急需介入' }
        ]
    };

    /* ============================================
       2. 老人信息（12条）
       ============================================ */
    const elders = [
        {
            id: 'elder-001',
            name: '张桂兰',
            gender: '女',
            age: 78,
            idCard: '310101********2345',
            birthDate: '1947-05-12',
            address: '阳光花园小区3号楼2单元501室',
            phone: '138****5678',
            familyPhone: '139****1234',
            familyName: '李伟（儿子）',
            community: '阳光社区',
            abilityLevel: 2,
            abilityLevelText: '中度失能',
            hasDementia: false,
            hasHypertension: true,
            hasDiabetes: true,
            livingCondition: '与子女同住',
            medicalInsurance: '城镇职工医保',
            avatar: '张'
        },
        {
            id: 'elder-002',
            name: '王建国',
            gender: '男',
            age: 82,
            idCard: '310102********3456',
            birthDate: '1944-08-23',
            address: '幸福里小区7号楼1单元302室',
            phone: '137****9012',
            familyPhone: '136****7890',
            familyName: '王芳（女儿）',
            community: '幸福社区',
            abilityLevel: 1,
            abilityLevelText: '轻度失能',
            hasDementia: false,
            hasHypertension: true,
            hasDiabetes: false,
            livingCondition: '与配偶同住',
            medicalInsurance: '城镇职工医保',
            avatar: '王'
        },
        {
            id: 'elder-003',
            name: '李秀英',
            gender: '女',
            age: 85,
            idCard: '310103********4567',
            birthDate: '1941-02-14',
            address: '安康苑小区2号楼4单元201室',
            phone: '135****6789',
            familyPhone: '134****2345',
            familyName: '李明（孙子）',
            community: '安康社区',
            abilityLevel: 3,
            abilityLevelText: '重度失能',
            hasDementia: true,
            hasHypertension: true,
            hasDiabetes: true,
            livingCondition: '独居',
            medicalInsurance: '城乡居民医保',
            avatar: '李'
        },
        {
            id: 'elder-004',
            name: '赵德顺',
            gender: '男',
            age: 72,
            idCard: '310104********5678',
            birthDate: '1954-11-08',
            address: '祥和家园小区5号楼3单元401室',
            phone: '133****4567',
            familyPhone: '132****8901',
            familyName: '赵小明（儿子）',
            community: '祥和社区',
            abilityLevel: 0,
            abilityLevelText: '能力完好',
            hasDementia: false,
            hasHypertension: false,
            hasDiabetes: false,
            livingCondition: '与配偶同住',
            medicalInsurance: '城镇职工医保',
            avatar: '赵'
        },
        {
            id: 'elder-005',
            name: '陈美华',
            gender: '女',
            age: 76,
            idCard: '310105********6789',
            birthDate: '1949-07-30',
            address: '康乐小区1号楼2单元603室',
            phone: '131****2345',
            familyPhone: '130****5678',
            familyName: '陈静（女儿）',
            community: '康乐社区',
            abilityLevel: 1,
            abilityLevelText: '轻度失能',
            hasDementia: false,
            hasHypertension: true,
            hasDiabetes: false,
            livingCondition: '独居',
            medicalInsurance: '城镇职工医保',
            avatar: '陈'
        },
        {
            id: 'elder-006',
            name: '刘长根',
            gender: '男',
            age: 88,
            idCard: '310106********7890',
            birthDate: '1938-03-17',
            address: '福寿苑小区8号楼1单元102室',
            phone: '159****3456',
            familyPhone: '158****6789',
            familyName: '刘建华（儿子）',
            community: '福寿社区',
            abilityLevel: 3,
            abilityLevelText: '重度失能',
            hasDementia: true,
            hasHypertension: true,
            hasDiabetes: true,
            livingCondition: '与子女同住',
            medicalInsurance: '离休干部',
            avatar: '刘'
        },
        {
            id: 'elder-007',
            name: '周雪芬',
            gender: '女',
            age: 70,
            idCard: '310107********8901',
            birthDate: '1956-09-25',
            address: '阳光花园小区1号楼3单元302室',
            phone: '157****8901',
            familyPhone: '156****2345',
            familyName: '周强（儿子）',
            community: '阳光社区',
            abilityLevel: 0,
            abilityLevelText: '能力完好',
            hasDementia: false,
            hasHypertension: false,
            hasDiabetes: false,
            livingCondition: '与配偶同住',
            medicalInsurance: '城镇职工医保',
            avatar: '周'
        },
        {
            id: 'elder-008',
            name: '吴志远',
            gender: '男',
            age: 79,
            idCard: '310108********9012',
            birthDate: '1946-12-03',
            address: '幸福里小区4号楼2单元401室',
            phone: '155****4567',
            familyPhone: '154****7890',
            familyName: '吴磊（侄子）',
            community: '幸福社区',
            abilityLevel: 2,
            abilityLevelText: '中度失能',
            hasDementia: false,
            hasHypertension: true,
            hasDiabetes: true,
            livingCondition: '独居',
            medicalInsurance: '城乡居民医保',
            avatar: '吴'
        },
        {
            id: 'elder-009',
            name: '郑秀珍',
            gender: '女',
            age: 83,
            idCard: '310109********0123',
            birthDate: '1943-04-19',
            address: '安康苑小区6号楼2单元501室',
            phone: '153****6789',
            familyPhone: '152****0123',
            familyName: '郑华（儿子）',
            community: '安康社区',
            abilityLevel: 1,
            abilityLevelText: '轻度失能',
            hasDementia: false,
            hasHypertension: true,
            hasDiabetes: false,
            livingCondition: '与子女同住',
            medicalInsurance: '城镇职工医保',
            avatar: '郑'
        },
        {
            id: 'elder-010',
            name: '孙国富',
            gender: '男',
            age: 75,
            idCard: '310110********1234',
            birthDate: '1951-06-07',
            address: '祥和家园小区2号楼1单元203室',
            phone: '189****1234',
            familyPhone: '188****4567',
            familyName: '孙明（儿子）',
            community: '祥和社区',
            abilityLevel: 0,
            abilityLevelText: '能力完好',
            hasDementia: false,
            hasHypertension: false,
            hasDiabetes: false,
            livingCondition: '与配偶同住',
            medicalInsurance: '城镇职工医保',
            avatar: '孙'
        },
        {
            id: 'elder-011',
            name: '马玉琴',
            gender: '女',
            age: 81,
            idCard: '310111********2345',
            birthDate: '1945-10-11',
            address: '康乐小区3号楼3单元101室',
            phone: '187****5678',
            familyPhone: '186****8901',
            familyName: '马丽（女儿）',
            community: '康乐社区',
            abilityLevel: 2,
            abilityLevelText: '中度失能',
            hasDementia: true,
            hasHypertension: true,
            hasDiabetes: false,
            livingCondition: '独居',
            medicalInsurance: '城乡居民医保',
            avatar: '马'
        },
        {
            id: 'elder-012',
            name: '黄玉堂',
            gender: '男',
            age: 86,
            idCard: '310112********3456',
            birthDate: '1940-01-28',
            address: '福寿苑小区3号楼2单元302室',
            phone: '185****9012',
            familyPhone: '184****2345',
            familyName: '黄伟（孙子）',
            community: '福寿社区',
            abilityLevel: 3,
            abilityLevelText: '重度失能',
            hasDementia: true,
            hasHypertension: true,
            hasDiabetes: true,
            livingCondition: '与子女同住',
            medicalInsurance: '离休干部',
            avatar: '黄'
        }
    ];

    /* ============================================
       3. 评估员信息（6条）
       ============================================ */
    const evaluators = [
        {
            id: 'eval-001',
            name: '张敏',
            employeeId: 'PGY2024001',
            phone: '138****1234',
            community: '阳光社区',
            role: '评估员',
            roleLevel: 1,
            status: 'active',
            completedCount: 156,
            avatar: '张',
            certificate: '初级养老评估师',
            joinDate: '2023-03-15'
        },
        {
            id: 'eval-002',
            name: '李文静',
            employeeId: 'PGY2024002',
            phone: '139****5678',
            community: '幸福社区',
            role: '评估员',
            roleLevel: 2,
            status: 'active',
            completedCount: 203,
            avatar: '李',
            certificate: '中级养老评估师',
            joinDate: '2022-08-20'
        },
        {
            id: 'eval-003',
            name: '王晓明',
            employeeId: 'PGY2024003',
            phone: '137****9012',
            community: '安康社区',
            role: '评估员',
            roleLevel: 1,
            status: 'active',
            completedCount: 98,
            avatar: '王',
            certificate: '初级养老评估师',
            joinDate: '2023-09-01'
        },
        {
            id: 'eval-004',
            name: '赵丽华',
            employeeId: 'SHY2024001',
            phone: '136****3456',
            community: '区民政局',
            role: '审核员',
            roleLevel: 3,
            status: 'active',
            completedCount: 456,
            avatar: '赵',
            certificate: '高级养老评估师',
            joinDate: '2021-05-10'
        },
        {
            id: 'eval-005',
            name: '陈建国',
            employeeId: 'GLY2024001',
            phone: '135****7890',
            community: '区民政局',
            role: '管理员',
            roleLevel: 4,
            status: 'active',
            completedCount: 0,
            avatar: '陈',
            certificate: '高级养老评估师',
            joinDate: '2020-01-08'
        },
        {
            id: 'eval-006',
            name: '刘芳',
            employeeId: 'PGY2024004',
            phone: '134****1234',
            community: '祥和社区',
            role: '评估员',
            roleLevel: 2,
            status: 'leave',
            completedCount: 178,
            avatar: '刘',
            certificate: '中级养老评估师',
            joinDate: '2022-11-25'
        }
    ];

    /* ============================================
       4. 租户/社区服务站（8条）
       ============================================ */
    const organizations = [
        {
            id: 'org-001',
            name: '阳光社区养老服务站',
            street: '和平街道',
            status: 'active',
            statusText: '已激活',
            completedCount: 356,
            adminName: '张敏',
            adminPhone: '138****1234',
            elderCount: 128,
            createDate: '2023-01-15'
        },
        {
            id: 'org-002',
            name: '幸福社区养老服务站',
            street: '幸福街道',
            status: 'active',
            statusText: '已激活',
            completedCount: 423,
            adminName: '李文静',
            adminPhone: '139****5678',
            elderCount: 156,
            createDate: '2023-02-20'
        },
        {
            id: 'org-003',
            name: '安康社区养老服务站',
            street: '安康街道',
            status: 'active',
            statusText: '已激活',
            completedCount: 289,
            adminName: '王晓明',
            adminPhone: '137****9012',
            elderCount: 98,
            createDate: '2023-03-10'
        },
        {
            id: 'org-004',
            name: '祥和社区养老服务站',
            street: '祥和街道',
            status: 'active',
            statusText: '已激活',
            completedCount: 198,
            adminName: '刘芳',
            adminPhone: '134****1234',
            elderCount: 87,
            createDate: '2023-04-05'
        },
        {
            id: 'org-005',
            name: '康乐社区养老服务站',
            street: '康乐街道',
            status: 'pending',
            statusText: '待激活',
            completedCount: 0,
            adminName: '周雪芬',
            adminPhone: '157****8901',
            elderCount: 0,
            createDate: '2024-06-10'
        },
        {
            id: 'org-006',
            name: '福寿社区养老服务站',
            street: '福寿街道',
            status: 'active',
            statusText: '已激活',
            completedCount: 312,
            adminName: '孙国富',
            adminPhone: '189****1234',
            elderCount: 134,
            createDate: '2023-05-18'
        },
        {
            id: 'org-007',
            name: '新城社区养老服务站',
            street: '新城街道',
            status: 'pending',
            statusText: '待激活',
            completedCount: 0,
            adminName: '郑秀珍',
            adminPhone: '153****6789',
            elderCount: 0,
            createDate: '2024-06-25'
        },
        {
            id: 'org-008',
            name: '中心街道综合养老服务中心',
            street: '中心街道',
            status: 'active',
            statusText: '已激活',
            completedCount: 678,
            adminName: '赵丽华',
            adminPhone: '136****3456',
            elderCount: 245,
            createDate: '2022-12-01'
        }
    ];

    /* ============================================
       5. 服务目录（6大类，每类4-6项）
       ============================================ */
    const serviceCatalog = [
        {
            id: 'cat-001',
            name: '生活照料类',
            icon: 'life',
            color: 'primary',
            services: [
                { id: 'svc-001', name: '助餐服务', description: '提供营养配餐、送餐上门服务', price: '15-30元/餐', unit: '次' },
                { id: 'svc-002', name: '助洁服务', description: '居家清洁、衣物洗涤、整理收纳', price: '30-50元/小时', unit: '小时' },
                { id: 'svc-003', name: '助浴服务', description: '协助沐浴、理发、个人卫生护理', price: '50-80元/次', unit: '次' },
                { id: 'svc-004', name: '助行服务', description: '陪同外出、代购代办、陪伴就医', price: '25-40元/小时', unit: '小时' },
                { id: 'svc-005', name: '夜间照护', description: '夜间陪护、巡视、应急处理', price: '120-200元/晚', unit: '晚' }
            ]
        },
        {
            id: 'cat-002',
            name: '医疗护理类',
            icon: 'medical',
            color: 'success',
            services: [
                { id: 'svc-006', name: '健康监测', description: '定期体检、生命体征监测、健康档案管理', price: '免费', unit: '次' },
                { id: 'svc-007', name: '慢病管理', description: '高血压、糖尿病等慢性病管理与指导', price: '100-200元/月', unit: '月' },
                { id: 'svc-008', name: '康复护理', description: '术后康复、功能训练、理疗按摩', price: '80-150元/次', unit: '次' },
                { id: 'svc-009', name: '用药指导', description: '用药提醒、药物管理、用药咨询', price: '50-80元/次', unit: '次' },
                { id: 'svc-010', name: '压疮护理', description: '压疮预防与治疗、专业护理指导', price: '60-100元/次', unit: '次' },
                { id: 'svc-011', name: '临终关怀', description: '姑息治疗、心理慰藉、家属支持', price: '按需收费', unit: '天' }
            ]
        },
        {
            id: 'cat-003',
            name: '精神慰藉类',
            icon: 'psychology',
            color: 'accent',
            services: [
                { id: 'svc-012', name: '陪伴聊天', description: '定期上门陪伴、聊天解闷', price: '25-35元/小时', unit: '小时' },
                { id: 'svc-013', name: '心理疏导', description: '专业心理咨询、情绪疏导', price: '100-200元/次', unit: '次' },
                { id: 'svc-014', name: '兴趣活动', description: '书法、绘画、唱歌等兴趣班', price: '30-50元/次', unit: '次' },
                { id: 'svc-015', name: '老年大学', description: '文化课程、技能培训', price: '200-500元/学期', unit: '学期' }
            ]
        },
        {
            id: 'cat-004',
            name: '适老化改造类',
            icon: 'home',
            color: 'warning',
            services: [
                { id: 'svc-016', name: '防滑改造', description: '地面防滑处理、防滑垫铺设', price: '500-2000元', unit: '项' },
                { id: 'svc-017', name: '扶手安装', description: '卫生间、走廊、床边扶手安装', price: '200-800元/处', unit: '处' },
                { id: 'svc-018', name: '照明改造', description: '感应灯、夜灯、整体照明优化', price: '300-1000元', unit: '项' },
                { id: 'svc-019', name: '智能设备', description: '紧急呼叫器、智能手环、监控设备', price: '200-1500元', unit: '套' },
                { id: 'svc-020', name: '整体改造', description: '全屋适老化评估与改造方案', price: '5000-30000元', unit: '套' }
            ]
        },
        {
            id: 'cat-005',
            name: '紧急救援类',
            icon: 'emergency',
            color: 'danger',
            services: [
                { id: 'svc-021', name: '一键呼叫', description: '24小时紧急呼叫响应服务', price: '30-50元/月', unit: '月' },
                { id: 'svc-022', name: '跌倒救助', description: '跌倒检测、紧急救助、就医陪同', price: '含在服务费内', unit: '次' },
                { id: 'svc-023', name: '走失找寻', description: 'GPS定位、走失寻找服务', price: '免费', unit: '次' },
                { id: 'svc-024', name: '应急联络', description: '紧急情况家属联络、协调资源', price: '免费', unit: '次' }
            ]
        },
        {
            id: 'cat-006',
            name: '其他服务类',
            icon: 'other',
            color: 'info',
            services: [
                { id: 'svc-025', name: '法律咨询', description: '老年权益保障、遗嘱公证咨询', price: '免费-200元/次', unit: '次' },
                { id: 'svc-026', name: '理财指导', description: '防诈骗宣传、理财咨询', price: '免费', unit: '次' },
                { id: 'svc-027', name: '辅具租赁', description: '轮椅、助行器、护理床等租赁', price: '50-300元/月', unit: '月' },
                { id: 'svc-028', name: '喘息服务', description: '短期托养、家属喘息服务', price: '150-300元/天', unit: '天' }
            ]
        }
    ];

    /* ============================================
       6. 评估任务列表
       ============================================ */
    const assessmentTasks = [
        {
            id: 'task-001',
            taskNo: 'PG202406001',
            elderId: 'elder-001',
            elderName: '张桂兰',
            elderAge: 78,
            elderGender: '女',
            address: '阳光花园小区3号楼2单元501室',
            scaleId: 'scale-001',
            scaleName: '老年人能力综合评估',
            type: 'initial',
            typeText: '首次评估',
            status: 'pending',
            statusText: '待评估',
            evaluatorId: 'eval-001',
            evaluatorName: '张敏',
            createTime: '2024-06-28 09:30:00',
            appointTime: '2024-06-30 09:00:00',
            community: '阳光社区',
            source: '家属申请'
        },
        {
            id: 'task-002',
            taskNo: 'PG202406002',
            elderId: 'elder-003',
            elderName: '李秀英',
            elderAge: 85,
            elderGender: '女',
            address: '安康苑小区2号楼4单元201室',
            scaleId: 'scale-001',
            scaleName: '老年人能力综合评估',
            type: 'reassessment',
            typeText: '年度复评',
            status: 'in_progress',
            statusText: '评估中',
            evaluatorId: 'eval-003',
            evaluatorName: '王晓明',
            createTime: '2024-06-27 14:00:00',
            appointTime: '2024-06-29 10:00:00',
            community: '安康社区',
            source: '定期复评',
            progress: 60
        },
        {
            id: 'task-003',
            taskNo: 'PG202406003',
            elderId: 'elder-006',
            elderName: '刘长根',
            elderAge: 88,
            elderGender: '男',
            address: '福寿苑小区8号楼1单元102室',
            scaleId: 'scale-001',
            scaleName: '老年人能力综合评估',
            type: 'reassessment',
            typeText: '变更评估',
            status: 'submitted',
            statusText: '待审核',
            evaluatorId: 'eval-004',
            evaluatorName: '赵丽华',
            createTime: '2024-06-26 11:00:00',
            completeTime: '2024-06-28 16:30:00',
            community: '福寿社区',
            source: '状态变更'
        },
        {
            id: 'task-004',
            taskNo: 'PG202406004',
            elderId: 'elder-002',
            elderName: '王建国',
            elderAge: 82,
            elderGender: '男',
            address: '幸福里小区7号楼1单元302室',
            scaleId: 'scale-003',
            scaleName: '跌倒风险评估',
            type: 'initial',
            typeText: '专项评估',
            status: 'approved',
            statusText: '已通过',
            evaluatorId: 'eval-002',
            evaluatorName: '李文静',
            createTime: '2024-06-25 08:30:00',
            completeTime: '2024-06-26 15:00:00',
            approveTime: '2024-06-27 10:00:00',
            community: '幸福社区',
            source: '社区转介'
        },
        {
            id: 'task-005',
            taskNo: 'PG202406005',
            elderId: 'elder-008',
            elderName: '吴志远',
            elderAge: 79,
            elderGender: '男',
            address: '幸福里小区4号楼2单元401室',
            scaleId: 'scale-004',
            scaleName: '居家环境安全评估',
            type: 'initial',
            typeText: '首次评估',
            status: 'pending',
            statusText: '待评估',
            evaluatorId: 'eval-002',
            evaluatorName: '李文静',
            createTime: '2024-06-29 10:00:00',
            appointTime: '2024-07-01 14:00:00',
            community: '幸福社区',
            source: '适老化改造申请'
        },
        {
            id: 'task-006',
            taskNo: 'PG202406006',
            elderId: 'elder-011',
            elderName: '马玉琴',
            elderAge: 81,
            elderGender: '女',
            address: '康乐小区3号楼3单元101室',
            scaleId: 'scale-005',
            scaleName: '社会支持网络评估',
            type: 'initial',
            typeText: '首次评估',
            status: 'rejected',
            statusText: '已退回',
            evaluatorId: 'eval-003',
            evaluatorName: '王晓明',
            createTime: '2024-06-24 09:00:00',
            completeTime: '2024-06-25 16:00:00',
            rejectTime: '2024-06-26 11:00:00',
            rejectReason: '评估信息不完整，请补充社会关系部分内容',
            community: '康乐社区',
            source: '主动申请'
        },
        {
            id: 'task-007',
            taskNo: 'PG202406007',
            elderId: 'elder-005',
            elderName: '陈美华',
            elderAge: 76,
            elderGender: '女',
            address: '康乐小区1号楼2单元603室',
            scaleId: 'scale-002',
            scaleName: 'ADL量表评估',
            type: 'reassessment',
            typeText: '季度复评',
            status: 'approved',
            statusText: '已通过',
            evaluatorId: 'eval-001',
            evaluatorName: '张敏',
            createTime: '2024-06-20 14:00:00',
            completeTime: '2024-06-22 10:30:00',
            approveTime: '2024-06-23 09:00:00',
            community: '康乐社区',
            source: '定期复评'
        },
        {
            id: 'task-008',
            taskNo: 'PG202406008',
            elderId: 'elder-012',
            elderName: '黄玉堂',
            elderAge: 86,
            elderGender: '男',
            address: '福寿苑小区3号楼2单元302室',
            scaleId: 'scale-001',
            scaleName: '老年人能力综合评估',
            type: 'reassessment',
            typeText: '年度复评',
            status: 'in_progress',
            statusText: '评估中',
            evaluatorId: 'eval-004',
            evaluatorName: '赵丽华',
            createTime: '2024-06-28 08:00:00',
            appointTime: '2024-06-28 14:00:00',
            community: '福寿社区',
            source: '定期复评',
            progress: 35
        }
    ];

    /* ============================================
       7. 评估结果样例（3份完整评估结果）
       ============================================ */
    const assessmentResults = [
        {
            id: 'result-001',
            taskId: 'task-003',
            taskNo: 'PG202406003',
            elderId: 'elder-006',
            elderName: '刘长根',
            elderAge: 88,
            elderGender: '男',
            scaleId: 'scale-001',
            scaleName: '老年人能力综合评估',
            scaleStandard: 'GB/T 42195-2022 国家标准',
            evaluatorName: '赵丽华',
            evaluatorId: 'eval-004',
            assessmentDate: '2024-06-28',
            assessmentType: '变更评估',
            totalScore: 28,
            abilityLevel: 3,
            abilityLevelText: '重度失能',
            overallConclusion: '被评估者日常生活活动能力严重受损，存在重度认知功能障碍，感知觉功能减退，社会参与能力丧失。建议享受重度失能等级养老服务补贴，纳入重点照护对象。',
            dimensionScores: [
                { id: 'dim-1', name: '日常生活活动', score: 15, maxScore: 100, percentage: 15, level: '重度受损' },
                { id: 'dim-2', name: '精神状态', score: 5, maxScore: 40, percentage: 12, level: '重度受损' },
                { id: 'dim-3', name: '感知觉与沟通', score: 18, maxScore: 50, percentage: 36, level: '中度受损' },
                { id: 'dim-4', name: '社会参与', score: 0, maxScore: 70, percentage: 0, level: '重度受损' }
            ],
            serviceRecommendations: [
                { category: '生活照料类', services: ['助餐服务', '助洁服务', '助浴服务', '夜间照护'], priority: 'high' },
                { category: '医疗护理类', services: ['健康监测', '慢病管理', '压疮护理', '用药指导'], priority: 'high' },
                { category: '康复护理类', services: ['康复训练', '功能维持'], priority: 'medium' },
                { category: '精神慰藉类', services: ['陪伴聊天', '心理疏导'], priority: 'medium' },
                { category: '紧急救援类', services: ['一键呼叫', '跌倒救助'], priority: 'high' },
                { category: '适老化改造类', services: ['扶手安装', '防滑改造', '智能设备'], priority: 'high' }
            ],
            careAdvice: '1. 建议24小时有人陪护，防止意外发生；\n2. 定期进行皮肤护理，预防压疮；\n3. 进行认知功能训练，延缓衰退；\n4. 保持适当肢体活动，预防肌肉萎缩；\n5. 加强营养支持，增强抵抗力。',
            examiner: '赵丽华',
            reviewer: '陈建国',
            reviewDate: '2024-06-28',
            status: 'approved'
        },
        {
            id: 'result-002',
            taskId: 'task-004',
            taskNo: 'PG202406004',
            elderId: 'elder-002',
            elderName: '王建国',
            elderAge: 82,
            elderGender: '男',
            scaleId: 'scale-003',
            scaleName: '跌倒风险评估',
            scaleStandard: 'MFS 国际通用跌倒风险评估',
            evaluatorName: '李文静',
            evaluatorId: 'eval-002',
            assessmentDate: '2024-06-26',
            assessmentType: '专项评估',
            totalScore: 55,
            riskLevel: 'high',
            riskLevelText: '高风险',
            overallConclusion: '被评估者跌倒风险评估得分为55分，属于高风险等级。有多次跌倒史，存在步态失调，使用辅助器具，建议采取综合预防措施。',
            dimensionScores: [
                { name: '跌倒史', score: 25, maxScore: 25, status: '高风险' },
                { name: '多医学诊断', score: 15, maxScore: 15, status: '风险' },
                { name: '行走辅助', score: 15, maxScore: 30, status: '中等风险' },
                { name: '静脉输液', score: 0, maxScore: 20, status: '无风险' },
                { name: '步态', score: 20, maxScore: 20, status: '高风险' },
                { name: '认知状态', score: 0, maxScore: 15, status: '无风险' }
            ],
            serviceRecommendations: [
                { category: '适老化改造类', services: ['扶手安装', '防滑改造', '照明改造'], priority: 'high' },
                { category: '生活照料类', services: ['助行服务', '助浴服务'], priority: 'medium' },
                { category: '康复护理类', services: ['平衡训练', '肌力训练'], priority: 'medium' },
                { category: '紧急救援类', services: ['一键呼叫', '跌倒救助'], priority: 'high' }
            ],
            careAdvice: '1. 居家环境进行适老化改造，加装扶手、铺设防滑垫；\n2. 行走时务必使用助行器，并有专人陪护；\n3. 穿着防滑鞋，避免穿拖鞋行走；\n4. 睡前减少饮水，床边放置便器；\n5. 定期进行平衡和肌力训练；\n6. 配置紧急呼叫设备，确保随时可以求助。',
            examiner: '李文静',
            reviewer: '赵丽华',
            reviewDate: '2024-06-27',
            status: 'approved'
        },
        {
            id: 'result-003',
            taskId: 'task-007',
            taskNo: 'PG202406007',
            elderId: 'elder-005',
            elderName: '陈美华',
            elderAge: 76,
            elderGender: '女',
            scaleId: 'scale-002',
            scaleName: 'ADL量表评估',
            scaleStandard: '国际通用巴氏指数',
            evaluatorName: '张敏',
            evaluatorId: 'eval-001',
            assessmentDate: '2024-06-22',
            assessmentType: '季度复评',
            totalScore: 75,
            functionalLevel: '轻度',
            functionalLevelText: '轻度功能障碍',
            overallConclusion: '被评估者Barthel指数得分为75分，属于轻度功能障碍。日常生活基本自理，在较为复杂的活动中需要一定帮助。与上季度评估相比，日常生活能力略有下降。',
            dimensionScores: [
                { name: '进食', score: 10, maxScore: 10, level: '独立' },
                { name: '洗澡', score: 0, maxScore: 5, level: '依赖' },
                { name: '修饰', score: 5, maxScore: 5, level: '独立' },
                { name: '穿衣', score: 5, maxScore: 10, level: '部分帮助' },
                { name: '大便控制', score: 10, maxScore: 10, level: '可控制' },
                { name: '小便控制', score: 10, maxScore: 10, level: '可控制' },
                { name: '如厕', score: 5, maxScore: 10, level: '部分帮助' },
                { name: '床椅转移', score: 10, maxScore: 15, level: '少量帮助' },
                { name: '平地行走', score: 10, maxScore: 15, level: '少量帮助' },
                { name: '上下楼梯', score: 0, maxScore: 10, level: '依赖' }
            ],
            serviceRecommendations: [
                { category: '生活照料类', services: ['助浴服务', '助洁服务'], priority: 'medium' },
                { category: '康复护理类', services: ['平衡训练', '下肢肌力训练'], priority: 'high' },
                { category: '适老化改造类', services: ['扶手安装', '防滑改造'], priority: 'medium' }
            ],
            careAdvice: '1. 洗澡和上下楼梯时需要有人协助；\n2. 坚持下肢功能锻炼，改善行走能力；\n3. 居家环境加装扶手，预防跌倒；\n4. 定期复查，监测功能变化趋势；\n5. 保持积极心态，参与社区活动。',
            examiner: '张敏',
            reviewer: '赵丽华',
            reviewDate: '2024-06-23',
            status: 'approved'
        }
    ];

    /* ============================================
       8. 仪表盘统计数据
       ============================================ */
    const dashboardStats = {
        totalElders: 1256,
        elderGrowth: 12.5,
        totalEvaluations: 2345,
        evaluationGrowth: 18.3,
        pendingTasks: 56,
        pendingGrowth: -5.2,
        passRate: 92.6,
        passRateGrowth: 2.1,
        monthlyEvaluations: [
            { month: '1月', count: 156 },
            { month: '2月', count: 132 },
            { month: '3月', count: 189 },
            { month: '4月', count: 201 },
            { month: '5月', count: 234 },
            { month: '6月', count: 267 }
        ],
        abilityDistribution: [
            { level: '能力完好', count: 456, percentage: 36.3 },
            { level: '轻度失能', count: 378, percentage: 30.1 },
            { level: '中度失能', count: 267, percentage: 21.3 },
            { level: '重度失能', count: 155, percentage: 12.3 }
        ],
        recentActivities: [
            { time: '今天 09:30', type: '评估提交', content: '张敏 提交了 张桂兰 的能力综合评估', status: 'info' },
            { time: '今天 08:45', type: '审核通过', content: '赵丽华 审核通过了 刘长根 的变更评估', status: 'success' },
            { time: '昨天 16:30', type: '评估提交', content: '李文静 提交了 王建国 的跌倒风险评估', status: 'info' },
            { time: '昨天 14:00', type: '新建任务', content: '系统创建了 吴志远 的居家环境评估任务', status: 'info' },
            { time: '昨天 10:20', type: '审核退回', content: '陈建国 退回了 马玉琴 的社会支持评估', status: 'warning' }
        ]
    };

    /* ============================================
       9. 消息通知
       ============================================ */
    const messages = [
        {
            id: 'msg-001',
            type: 'task',
            title: '新的评估任务已分配',
            content: '您有一条新的评估任务：张桂兰 - 老年人能力综合评估，请在预约时间内完成。',
            time: '2小时前',
            unread: true,
            taskId: 'task-001'
        },
        {
            id: 'msg-002',
            type: 'review',
            title: '评估报告已通过审核',
            content: '您提交的王建国跌倒风险评估报告已审核通过，可查看评估结果。',
            time: '5小时前',
            unread: true,
            taskId: 'task-004'
        },
        {
            id: 'msg-003',
            type: 'reject',
            title: '评估报告被退回',
            content: '您提交的马玉琴社会支持网络评估被退回，原因：评估信息不完整，请补充社会关系部分内容。',
            time: '昨天',
            unread: true,
            taskId: 'task-006'
        },
        {
            id: 'msg-004',
            type: 'system',
            title: '系统升级通知',
            content: '系统将于本周五晚22:00-24:00进行升级维护，期间系统将暂停服务，请提前做好工作安排。',
            time: '2天前',
            unread: false
        },
        {
            id: 'msg-005',
            type: 'task',
            title: '评估任务提醒',
            content: '您明天有2条预约评估任务，请提前做好准备工作。',
            time: '3天前',
            unread: false
        },
        {
            id: 'msg-006',
            type: 'training',
            title: '培训通知',
            content: '下周将开展高级评估师培训，有意参加者请在系统中报名。',
            time: '5天前',
            unread: false
        }
    ];

    /* ============================================
       挂载到全局
       ============================================ */
    window.YYMockData = {
        scales: [scale01, scale02, scale03, scale04, scale05],
        elders: elders,
        evaluators: evaluators,
        organizations: organizations,
        serviceCatalog: serviceCatalog,
        assessmentTasks: assessmentTasks,
        assessmentResults: assessmentResults,
        dashboardStats: dashboardStats,
        messages: messages
    };

})(window);
