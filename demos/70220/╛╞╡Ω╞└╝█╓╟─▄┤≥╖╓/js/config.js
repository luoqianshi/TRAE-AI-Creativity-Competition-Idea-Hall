/* ============================================
   配置数据：评分维度、评分等级、Prompt 模板、来源
   首次加载时初始化到 localStorage，可在页面修改
   ============================================ */

// 默认评分维度配置
const DEFAULT_DIMENSIONS = [
    {
        id: 'dim_room', key: 'room', name: '客房', order: 1, enabled: true,
        description: '客房维度包括：床品舒适度、房间面积、隔音效果、空调温度、热水供应、装修风格、卫生间、淋浴等',
        keywords: '床、被子、枕头、空调、热水、隔音、房间、卫生间、淋浴、装修、面积'
    },
    {
        id: 'dim_front_desk', key: 'front_desk', name: '前台', order: 2, enabled: true,
        description: '前台维度包括：办理入住/退房效率、前台服务态度、问询响应、特殊需求处理等',
        keywords: '前台、入住、退房、办理、登记、排队、接待、问询'
    },
    {
        id: 'dim_restaurant', key: 'restaurant', name: '餐饮', order: 3, enabled: true,
        description: '餐饮维度包括：早餐种类与品质、餐厅环境、菜品口味、服务效率等',
        keywords: '早餐、晚餐、餐厅、餐饮、菜品、口味、种类、自助餐、咖啡、茶'
    },
    {
        id: 'dim_cleanliness', key: 'cleanliness', name: '卫生', order: 4, enabled: true,
        description: '卫生维度包括：房间整体清洁度、床品卫生、卫生间清洁、公共区域卫生等',
        keywords: '卫生、干净、清洁、脏、污渍、异味、整洁、消毒'
    },
    {
        id: 'dim_facility', key: 'facility', name: '设施', order: 5, enabled: true,
        description: '设施维度包括：酒店硬件设施完备度、电梯、停车场、健身房、泳池、Wi-Fi等',
        keywords: '设施、电梯、停车场、健身房、泳池、Wi-Fi、空调、电视、电器'
    },
    {
        id: 'dim_location', key: 'location', name: '位置', order: 6, enabled: true,
        description: '位置维度包括：地理位置便利性、周边交通、商圈距离、景点可达性等',
        keywords: '位置、地段、交通、地铁、公交、机场、火车站、商圈、周边、方便'
    },
    {
        id: 'dim_service', key: 'service', name: '服务态度', order: 7, enabled: true,
        description: '服务态度维度包括：员工整体服务意识、响应速度、解决问题的主动性、客房服务等',
        keywords: '服务、态度、热情、冷漠、耐心、主动、周到、贴心'
    }
];

// 默认评分等级配置（七级评分体系）
const DEFAULT_RATINGS = [
    {
        id: 'r_strong_pos', key: 'strong_positive', name: '强好评', score: 10, order: 7,
        color: '#52c41a', color_name: '深绿',
        description: '客人明确且强烈地赞扬，使用"太好了""非常满意""超赞"等强烈正面词汇，或主动推荐'
    },
    {
        id: 'r_pos', key: 'positive', name: '好评', score: 5, order: 6,
        color: '#73d13d', color_name: '浅绿',
        description: '客人表达满意或认可，语气较为正面但无强烈情绪词'
    },
    {
        id: 'r_mild_pos', key: 'mild_positive', name: '弱好评', score: 2, order: 5,
        color: '#b7eb8f', color_name: '黄绿',
        description: '客人提及该维度且倾向正面，但表述含糊或只是附带提及（如"还行""可以"）'
    },
    {
        id: 'r_neutral', key: 'neutral', name: '中性', score: 0, order: 4,
        color: '#bfbfbf', color_name: '灰色',
        description: '客人提到该维度但未表达任何明显的正面或负面倾向，或评价内容与该维度无关'
    },
    {
        id: 'r_mild_neg', key: 'mild_negative', name: '弱差评', score: -2, order: 3,
        color: '#ffc069', color_name: '浅红',
        description: '客人提及该维度且倾向负面，但表述轻微或只是附带抱怨（如"有点吵""一般般"）'
    },
    {
        id: 'r_neg', key: 'negative', name: '差评', score: -5, order: 2,
        color: '#ff9c6e', color_name: '红色',
        description: '客人明确表达不满，指出具体问题但不涉及严重体验损害'
    },
    {
        id: 'r_strong_neg', key: 'strong_negative', name: '强差评', score: -10, order: 1,
        color: '#ff4d4f', color_name: '深红',
        description: '客人强烈表达不满或愤怒，涉及严重体验损害（如"太差了""再也不来了""恶心"）'
    }
];

// 默认评价来源配置
const DEFAULT_SOURCES = [
    { id: 'src_ctrip', key: 'ctrip', name: '携程' },
    { id: 'src_meituan', key: 'meituan', name: '美团' },
    { id: 'src_fliggy', key: 'fliggy', name: '飞猪' },
    { id: 'src_dianping', key: 'dianping', name: '大众点评' },
    { id: 'src_self', key: 'self', name: '酒店自有问卷' }
];

// 默认 Prompt 模板
const DEFAULT_PROMPTS = [
    {
        id: 'prompt_default', name: '默认评分分析模板', enabled: true, is_default: true,
        system_prompt:
            '你是一位专业的酒店服务质量评估专家。你的任务是分析住客评价内容，根据提供的评分标准，识别评价涉及的服务维度，并给出量化的评分。请严格按照要求的输出格式返回结果，不要返回任何与评分无关的内容。',
        user_prompt:
`请根据以下评分标准，对这条酒店住客评价进行分析打分：

{{scoring_criteria}}

【待分析评价内容】
{{review_content}}

请以如下 JSON 格式返回结果（仅返回 JSON，不要包含任何其他文字）：
{
  "overall_sentiment": "strong_positive|positive|mild_positive|neutral|mild_negative|negative|strong_negative",
  "identified_dimensions": [
    {
      "dimension": "维度英文标识",
      "dimension_name": "维度中文名称",
      "rating": "等级英文标识",
      "score": 分值数字,
      "reason": "判定理由简要说明（一句话）",
      "evidence_text": "评价中支持该判定的原文片段"
    }
  ],
  "summary": "一句话概括评价核心内容"
}

注意事项：
1. 仅识别评价中确实提及或可明显推断的维度，未提及的维度不要列入
2. score 必须与 rating 等级对应的分值一致
3. reason 要简明扼要，evidence_text 要尽量引用评价原文
4. overall_sentiment 综合考虑所有维度的整体情感倾向`,
        output_format: 'JSON',
        description: '系统默认评分分析模板，包含完整的评分标准与输出格式要求'
    }
];

// 系统设置默认值
const DEFAULT_SETTINGS = {
    default_model: 'deepseek',
    default_prompt: 'prompt_default',
    max_review_length: 2000,
    data_retention_days: 365,
    retry_count: 3,
    retry_interval: 1000,
    concurrency: 5,
    rate_limit: 60
};

// 调用策略默认配置
const DEFAULT_STRATEGY = {
    primary_model: 'deepseek',
    backup_model: '',
    retry_count: 3,
    retry_interval: 1000,
    concurrency: 5,
    rate_limit: 60
};

// 配置初始化入口
function initConfig() {
    if (!localStorage.getItem('config_dimensions')) {
        Store.set('config_dimensions', DEFAULT_DIMENSIONS);
    }
    if (!localStorage.getItem('config_ratings')) {
        Store.set('config_ratings', DEFAULT_RATINGS);
    }
    if (!localStorage.getItem('config_sources')) {
        Store.set('config_sources', DEFAULT_SOURCES);
    }
    if (!localStorage.getItem('config_prompts')) {
        Store.set('config_prompts', DEFAULT_PROMPTS);
    }
    if (!localStorage.getItem('system_settings')) {
        Store.set('system_settings', DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem('call_strategy')) {
        Store.set('call_strategy', DEFAULT_STRATEGY);
    }
    if (!localStorage.getItem('reviews_data')) {
        Store.set('reviews_data', []);
    }
    if (!localStorage.getItem('operation_logs')) {
        Store.set('operation_logs', []);
    }
}

// 获取维度根据 key
function getDimensionByKey(key) {
    const dims = Store.get('config_dimensions', DEFAULT_DIMENSIONS);
    return dims.find(d => d.key === key);
}

// 获取等级根据 key
function getRatingByKey(key) {
    const ratings = Store.get('config_ratings', DEFAULT_RATINGS);
    return ratings.find(r => r.key === key);
}

// 生成评分标准文本（用于 Prompt）
function buildScoringCriteriaText() {
    const dims = Store.get('config_dimensions', DEFAULT_DIMENSIONS).filter(d => d.enabled);
    const ratings = Store.get('config_ratings', DEFAULT_RATINGS).sort((a, b) => b.order - a.order);

    let text = '【评分等级定义】\n';
    ratings.forEach(r => {
        text += `- ${r.name}(${r.score >= 0 ? '+' : ''}${r.score})：${r.description}\n`;
    });

    text += '\n【评分维度及判定标准】\n';
    dims.forEach((d, i) => {
        text += `${i + 1}. ${d.name}(${d.key})\n`;
        text += `   维度说明：${d.description}\n`;
        text += `   关键词提示：${d.keywords}\n`;
        text += `   各等级判定：\n`;
        ratings.forEach(r => {
            text += `     - ${r.name}(${r.score >= 0 ? '+' : ''}${r.score})：参考等级通用判定标准\n`;
        });
        text += '\n';
    });

    return text;
}

// 生成完整 Prompt（替换占位符）
function buildFinalPrompt(promptTemplate, reviewContent) {
    const criteriaText = buildScoringCriteriaText();
    let userPrompt = promptTemplate.user_prompt || '';
    userPrompt = userPrompt.replace(/\{\{scoring_criteria\}\}/g, criteriaText);
    userPrompt = userPrompt.replace(/\{\{review_content\}\}/g, reviewContent || '');
    return userPrompt;
}
