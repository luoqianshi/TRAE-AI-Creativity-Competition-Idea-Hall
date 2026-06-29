function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function fillExample(text) {
    document.getElementById('queryInput').value = text;
    document.getElementById('queryInput').focus();
}

function syncData(source) {
    const card = document.querySelector(`.pipeline-card:has(.card-icon.${source})`);
    if (!card) return;
    
    const statusText = card.querySelector('.status-text');
    const progressFill = card.querySelector('.progress-fill');
    const updateTime = card.querySelector('.update-time');
    const statValue = card.querySelector('.stat-value');
    const syncBtn = card.querySelector('.sync-btn');
    
    statusText.textContent = '同步中...';
    syncBtn.classList.add('syncing');
    progressFill.style.width = '0%';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress > 100) progress = 100;
        progressFill.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            
            setTimeout(() => {
                statusText.textContent = '同步完成';
                syncBtn.classList.remove('syncing');
                
                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                updateTime.textContent = `最后更新: 今天 ${timeStr}`;
                
                if (statValue) {
                    const current = parseInt(statValue.textContent.replace(/,/g, ''));
                    const increment = Math.floor(Math.random() * 50) + 10;
                    statValue.textContent = (current + increment).toLocaleString();
                }
                
                showToast(`成功同步${source === 'sif' ? 'SIF关键词' : source === 'lingxing' ? '领星广告数据' : '链仓库存'}`, 'success');
            }, 500);
        }
    }, 200);
}

function showSection(sectionName) {
    const sections = document.querySelectorAll('.workspace-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    const sectionMap = { query: 0, pipeline: 1, monitor: 2, rules: 3, connections: 4 };
    const index = sectionMap[sectionName];
    if (index !== undefined && navItems[index]) {
        navItems[index].classList.add('active');
    }
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.add('hidden'));
    
    const activeTab = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    const targetContent = document.getElementById(tabName === 'result' ? 'dataResult' : `${tabName}Result`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
    }
}

function showRulesTab(tabName) {
    const tabs = document.querySelectorAll('.rules-tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const contents = document.querySelectorAll('.rules-tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    if (tabName === 'enabled') {
        tabs[0]?.classList.add('active');
    } else {
        tabs[1]?.classList.add('active');
    }
    
    const targetContent = document.getElementById(`${tabName}Rules`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

const ruleTemplates = {
    ad_waste: {
        name: '广告浪费告警',
        scenario: '烧钱不转化',
        condition: '近7天花费>200美元且零广告订单',
        sql: "SELECT keyword, SUM(spend) as total_spend FROM sif_ad_keywords WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY keyword HAVING total_spend > 200 AND SUM(conversions) = 0;"
    },
    stock_shortage: {
        name: '断货预警',
        scenario: '快卖断货',
        condition: '可售库存<7天日均销量×15且有销量的SKU',
        sql: "SELECT i.sku, i.asin, i.product_name, i.stock_quantity, AVG(o.quantity) as avg_daily_sales FROM liancang_inventory i JOIN amazon_orders o ON i.asin = o.asin WHERE o.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY i.sku HAVING i.stock_quantity < avg_daily_sales * 15;"
    },
    slow_sales: {
        name: '滞销预警',
        scenario: '库存积压',
        condition: '库龄>90天且可用库存>50',
        sql: "SELECT sku, asin, product_name, stock_quantity, age_days FROM liancang_inventory WHERE age_days > 90 AND stock_quantity > 50;"
    },
    inventory_anomaly: {
        name: '库存异常',
        scenario: '数据异常',
        condition: '可用库存为负或突降>50%',
        sql: "SELECT sku, asin, stock_quantity FROM liancang_inventory WHERE stock_quantity < 0 OR (stock_quantity < safety_stock * 0.5);"
    }
};

let currentEditingRuleId = null;

function editRule(ruleId) {
    currentEditingRuleId = ruleId;
    const rule = ruleTemplates[ruleId];
    
    if (rule) {
        document.getElementById('ruleName').value = rule.name;
        document.getElementById('ruleScenario').value = rule.scenario;
        document.getElementById('ruleCondition').value = rule.condition;
        document.getElementById('ruleSql').value = rule.sql;
        document.getElementById('ruleEnabled').checked = true;
    }
    
    document.getElementById('ruleEditModal').classList.add('active');
}

function closeRuleModal() {
    document.getElementById('ruleEditModal').classList.remove('active');
    currentEditingRuleId = null;
}

function saveRule() {
    const name = document.getElementById('ruleName').value.trim();
    const scenario = document.getElementById('ruleScenario').value.trim();
    const condition = document.getElementById('ruleCondition').value.trim();
    const sql = document.getElementById('ruleSql').value.trim();
    
    if (!name || !condition) {
        showToast('请填写规则名称和触发条件', 'error');
        return;
    }
    
    if (currentEditingRuleId && ruleTemplates[currentEditingRuleId]) {
        ruleTemplates[currentEditingRuleId] = {
            name,
            scenario,
            condition,
            sql
        };
        
        const ruleItem = document.querySelector(`.rule-item[onclick="editRule('${currentEditingRuleId}')"]`);
        if (ruleItem) {
            ruleItem.querySelector('.rule-name').textContent = name;
            ruleItem.querySelector('.rule-desc').textContent = condition;
            ruleItem.querySelector('.rule-scenario').textContent = scenario;
        }
        
        showToast('规则保存成功', 'success');
        closeRuleModal();
    }
}

function showRulesPage(page) {
    const tabs = document.querySelectorAll('.rules-tab-header-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const pages = document.querySelectorAll('.rules-page');
    pages.forEach(p => p.classList.remove('active'));
    
    if (page === 'rules') {
        tabs[0]?.classList.add('active');
        document.getElementById('rulesPage')?.classList.add('active');
    } else {
        tabs[1]?.classList.add('active');
        document.getElementById('marketPage')?.classList.add('active');
    }
}

function toggleRuleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = section?.previousElementSibling;
    const arrow = header?.querySelector('.section-arrow');
    
    if (section) {
        section.classList.toggle('active');
        if (arrow) {
            arrow.style.transform = section.classList.contains('active') ? 'rotate(0deg)' : 'rotate(-90deg)';
        }
    }
}

function addTerm() {
    const list = document.getElementById('termsList');
    const emptyHint = list.querySelector('.empty-hint');
    if (emptyHint) emptyHint.remove();
    
    const row = document.createElement('div');
    row.className = 'table-row-item';
    row.innerHTML = `
        <div style="width: 25%;"><input type="text" placeholder="术语名称" class="inline-input"></div>
        <div style="width: 45%;"><input type="text" placeholder="定义描述" class="inline-input"></div>
        <div style="width: 20%;"><input type="text" placeholder="关联指标" class="inline-input"></div>
        <div style="width: 10%; text-align: center;">
            <button class="row-delete-btn" onclick="this.closest('.table-row-item').remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    list.appendChild(row);
}

function addField() {
    const list = document.getElementById('fieldList');
    const emptyHint = list.querySelector('.empty-hint');
    if (emptyHint) emptyHint.remove();
    
    const row = document.createElement('div');
    row.className = 'table-row-item';
    row.innerHTML = `
        <div style="width: 20%;"><input type="text" placeholder="字段名" class="inline-input"></div>
        <div style="width: 70%;"><input type="text" placeholder="字段说明" class="inline-input"></div>
        <div style="width: 10%; text-align: center;">
            <button class="row-delete-btn" onclick="this.closest('.table-row-item').remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    list.appendChild(row);
}

function addMetric() {
    const list = document.getElementById('metricsList');
    const emptyHint = list.querySelector('.empty-hint');
    if (emptyHint) emptyHint.remove();
    
    const row = document.createElement('div');
    row.className = 'table-row-item';
    row.innerHTML = `
        <div style="width: 20%;"><input type="text" placeholder="指标名" class="inline-input"></div>
        <div style="width: 55%;"><input type="text" placeholder="计算公式" class="inline-input"></div>
        <div style="width: 15%;">
            <select class="inline-select">
                <option value="">-</option>
                <option value="number">number</option>
                <option value="percentage">percentage</option>
                <option value="money">money</option>
            </select>
        </div>
        <div style="width: 10%; text-align: center;">
            <button class="row-delete-btn" onclick="this.closest('.table-row-item').remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    list.appendChild(row);
}

function saveRuleConfig() {
    showToast('规则配置已保存', 'success');
}

function loadSavedRules() {
    showToast('已加载已保存规则', 'success');
}

function toggleJsonEditor() {
    showToast('JSON编辑器开发中', 'info');
}

function filterMarketTemplates(filter) {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.classList.remove('active'));
    btns[filter === 'all' ? 0 : 1]?.classList.add('active');
}

const templateData = {
    ad: {
        name: '广告投放分析（标准）',
        domain: 'advertising',
        adoption: 1,
        scene: 'SEM/信息流/展示广告的关键词、广告组、广告活动维度效果分析。覆盖 Amazon Ads、Google Ads、Facebook Ads、巨量引擎等主流平台。核心分析方向：ACoS/ROAS投产评估、CTR/CVR转化漏斗、低效关键词排查、品牌新客表现。',
        defaultSettings: [
            { key: 'time_range', value: '最近完整7天（不含当日），若为自然周则取上周一至上周日' },
            { key: 'limit', value: '50' },
            { key: 'sort_order', value: '默认按广告花费降序，除非用户明确指定其他排序' },
            { key: 'min_samples', value: '{"ctr_analysis_min_impressions":100,"cvr_analysis_min_clicks":10,"acos_analysis_min_ad_orders":1,"roas_analysis_min_spend":1,"brand_new_customer_analysis_min_orders":1}', mono: true }
        ],
        terms: [
            { name: '点击率高', def: '曝光量>=100 且 CTR 位于当前查询范围前25%', metric: 'CTR' },
            { name: '点击率低', def: '曝光量>=100 且 CTR 位于当前查询范围后25%', metric: 'CTR' },
            { name: '转化率高', def: '点击>=10 且 总转化率位于当前查询范围前25%', metric: '总转化率' },
            { name: '转化率低', def: '点击>=10 且 总转化率位于当前查询范围后25%', metric: '总转化率' },
            { name: '消耗高', def: '花费位于当前查询范围前20%', metric: '花费' },
            { name: '消耗低', def: '花费位于当前查询范围后30%', metric: '花费' },
            { name: '低效关键词', def: '点击>=10 且 广告订单=0 且 直接订单=0', metric: '总订单' },
            { name: '有花费无成交', def: '花费>0 且 广告订单=0', metric: '广告订单' },
            { name: '高消耗无转化', def: '花费位于前20% 且 点击>=10 且 广告订单=0 且 直接订单=0', metric: '花费' },
            { name: '广告投产差', def: '广告订单>=1 且 ACoS位于前25%（ACoS越高投产越差）', metric: 'ACoS' },
            { name: '广告投产好', def: '广告订单>=1 且 ACoS位于后25%', metric: 'ACoS' },
            { name: '自然引流好', def: '总订单>0 且 TACoS位于后25%', metric: 'TACoS' },
            { name: '品牌新客表现好', def: '品牌新客订单>=1 且 品牌新客CVR位于前25%', metric: '品牌新客CVR' },
            { name: '高投产', def: 'ROAS>=3 且 广告订单>=1', metric: 'ROAS' },
            { name: '预算即将耗尽', def: '预算花费比>=90%', metric: '预算花费比' },
            { name: 'CPC过高', def: 'CPC位于当前查询范围前20%', metric: 'CPC' }
        ],
        fields: [
            { name: '关键词', desc: '用户搜索词或投放关键词，用于流量来源分析。注意：同一关键词可能匹配多个广告活动' },
            { name: '中文翻译', desc: '关键词的中文翻译，仅用于展示和理解，不参与任何计算或筛选' },
            { name: '广告活动投放', desc: '关键词所属的广告活动/广告组名称，可用于活动维度的汇总和对比' },
            { name: '广告组', desc: '广告组名称，介于广告活动和关键词之间的投放层级' },
            { name: '投放类型', desc: '自动投放/手动投放/广泛匹配/词组匹配/精确匹配等' },
            { name: '曝光量', desc: '广告被展示的总次数。注意：同一用户多次刷新可能计入多次曝光' },
            { name: '点击', desc: '广告被点击的总次数。注意：同一用户多次点击均计入，不做去重' },
            { name: '点击率', desc: '广告从曝光到点击的转化率，公式：点击/曝光量×100%。注意：平台原始字段可能与系统计算不一致' },
            { name: 'CPC', desc: '平均单次点击成本，公式：花费/点击。该值越低说明获取流量的成本越低' },
            { name: '花费', desc: '广告投放的总消耗金额，币种与数据源平台设置一致' },
            { name: '广告销售额', desc: '由广告归因窗口内产生的销售额。注意：不同平台的归因窗口不同(7天/14天/30天点击归因)' },
            { name: '直接销售额', desc: '非广告归因的自然流量或直接访问产生的销售额' },
            { name: '广告订单', desc: '由广告归因窗口内产生的订单数量' },
            { name: '直接订单', desc: '非广告归因产生的订单数量' },
            { name: 'ACoS', desc: '广告销售成本比，公式：花费/广告销售额×100%。核心投产效率指标，越低越好' },
            { name: 'ROAS', desc: '广告支出回报率，公式：广告销售额/花费。ACoS的倒数，越高越好' },
            { name: 'CPA', desc: '单次广告订单获取成本，公式：花费/广告订单。该指标为金额，不显示为百分比' },
            { name: 'CVR', desc: '平台原始转化率字段。注意：不同平台定义不同，不可直接等同于系统计算的总转化率' },
            { name: '品牌新客订单', desc: '由品牌新客（首次购买该品牌）产生的订单数量' },
            { name: '品牌新客销售额', desc: '由品牌新客产生的销售额' },
            { name: '品牌新客CVR', desc: '品牌新客的转化率，沿用数据源平台的原始口径' },
            { name: '曝光份额', desc: '广告曝光量占同类广告总曝光量的比例（仅部分平台提供）' },
            { name: '点击份额', desc: '广告点击量占同类广告总点击量的比例（仅部分平台提供）' },
            { name: '广告预算', desc: '广告活动设置的日预算或总预算' },
            { name: '预算花费比', desc: '实际花费占预算的比例，用于监控预算执行率' }
        ],
        metrics: [
            { name: '总订单', formula: '广告订单 + 直接订单', format: '-' },
            { name: '总销售额', formula: '广告销售额 + 直接销售额', format: '-' },
            { name: '系统计算CTR', formula: '点击 / NULLIF(曝光量, 0) × 100', format: 'percentage' },
            { name: '总转化率', formula: '总订单 / NULLIF(点击, 0) × 100', format: 'percentage' },
            { name: 'TACoS', formula: '花费 / NULLIF(总销售额, 0) × 100', format: 'percentage' },
            { name: '系统计算ACoS', formula: '花费 / NULLIF(广告销售额, 0) × 100', format: 'percentage' },
            { name: '系统计算ROAS', formula: '广告销售额 / NULLIF(花费, 0)', format: 'number' },
            { name: '系统计算CPA', formula: '花费 / NULLIF(广告订单, 0)', format: 'number' },
            { name: '单均广告成本', formula: '花费 / NULLIF(总订单, 0)', format: 'number' },
            { name: '广告订单占比', formula: '广告订单 / NULLIF(总订单, 0) × 100', format: 'percentage' }
        ]
    },
    ecommerce: {
        name: '电商销售分析（标准）',
        domain: 'ecommerce',
        adoption: 0,
        scene: '电商平台的商品、SKU、品类、店铺维度的销售数据分析。覆盖淘宝/天猫、京东、拼多多、抖音电商、Shopee、Amazon等平台。核心分析方向：GMV/客单价趋势、商品动销率、库存周转、退货退款分析、促销效果评估。'
    },
    crm: {
        name: '客户运营分析（标准）',
        domain: 'crm',
        adoption: 0,
        scene: '客户关系管理、销售漏斗追踪、客户生命周期分析。覆盖Salesforce、HubSpot、纷享销客、销售易等CRM系统。核心分析方向：线索转化漏斗、客户分层(RFM)、销售人效、流失预警、复购分析。'
    },
    saas: {
        name: 'SaaS经营分析（标准）',
        domain: 'saas',
        adoption: 0,
        scene: 'SaaS/订阅制产品的核心经营指标分析。覆盖 Stripe、Chargebee、自研计费系统等。核心分析方向：MRR/ARR收入趋势、客户流失与留存。'
    }
};

let currentPreviewTemplate = null;

function previewTemplate(templateId) {
    currentPreviewTemplate = templateId;
    const data = templateData[templateId];
    if (!data) return;
    
    document.getElementById('previewTemplateName').textContent = data.name;
    document.getElementById('previewAdoptionCount').textContent = `采用 ${data.adoption} 次`;
    document.getElementById('previewScene').textContent = data.scene;
    
    document.getElementById('templatePreviewModal').classList.add('active');
}

function closeTemplatePreview() {
    document.getElementById('templatePreviewModal').classList.remove('active');
    currentPreviewTemplate = null;
}

function togglePreviewSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = section?.previousElementSibling;
    const arrow = header?.querySelector('.section-arrow');
    
    if (section) {
        section.classList.toggle('active');
        if (arrow) {
            arrow.style.transform = section.classList.contains('active') ? 'rotate(0deg)' : 'rotate(-90deg)';
        }
    }
}

function adoptTemplate(templateId) {
    const data = templateData[templateId];
    if (!data) return;
    
    showRulesPage('rules');
    loadTemplateIntoEditor(data);
    showToast(`已采用「${data.name}」模板`, 'success');
}

function adoptFromPreview() {
    if (!currentPreviewTemplate) return;
    const data = templateData[currentPreviewTemplate];
    if (!data) return;
    
    closeTemplatePreview();
    showRulesPage('rules');
    loadTemplateIntoEditor(data);
    showToast(`已采用「${data.name}」模板`, 'success');
}

function editAndAdopt() {
    if (!currentPreviewTemplate) return;
    const data = templateData[currentPreviewTemplate];
    if (!data) return;
    
    closeTemplatePreview();
    showRulesPage('rules');
    loadTemplateIntoEditor(data);
    showToast('已加载模板，可编辑后保存', 'info');
}

function loadTemplateIntoEditor(data) {
    if (data.defaultSettings) {
        const timeRange = data.defaultSettings.find(s => s.key === 'time_range');
        const limit = data.defaultSettings.find(s => s.key === 'limit');
        const sort = data.defaultSettings.find(s => s.key === 'sort_order');
        if (timeRange) document.getElementById('settingTimeRange').value = timeRange.value;
        if (limit) document.getElementById('settingLimit').value = limit.value;
        if (sort) document.getElementById('settingSort').value = sort.value;
    }
    
    if (data.terms) {
        const list = document.getElementById('termsList');
        list.innerHTML = '';
        data.terms.forEach(term => {
            const row = document.createElement('div');
            row.className = 'table-row-item';
            row.innerHTML = `
                <div style="width: 25%;"><input type="text" value="${term.name}" class="inline-input"></div>
                <div style="width: 45%;"><input type="text" value="${term.def}" class="inline-input"></div>
                <div style="width: 20%;"><input type="text" value="${term.metric}" class="inline-input"></div>
                <div style="width: 10%; text-align: center;">
                    <button class="row-delete-btn" onclick="this.closest('.table-row-item').remove()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(row);
        });
    }
    
    if (data.fields) {
        const list = document.getElementById('fieldList');
        list.innerHTML = '';
        data.fields.forEach(field => {
            const row = document.createElement('div');
            row.className = 'table-row-item';
            row.innerHTML = `
                <div style="width: 20%;"><input type="text" value="${field.name}" class="inline-input"></div>
                <div style="width: 70%;"><input type="text" value="${field.desc}" class="inline-input"></div>
                <div style="width: 10%; text-align: center;">
                    <button class="row-delete-btn" onclick="this.closest('.table-row-item').remove()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(row);
        });
    }
    
    if (data.metrics) {
        const list = document.getElementById('metricsList');
        list.innerHTML = '';
        data.metrics.forEach(metric => {
            const row = document.createElement('div');
            row.className = 'table-row-item';
            row.innerHTML = `
                <div style="width: 20%;"><input type="text" value="${metric.name}" class="inline-input"></div>
                <div style="width: 55%;"><input type="text" value="${metric.formula}" class="inline-input"></div>
                <div style="width: 15%;">
                    <select class="inline-select">
                        <option value="" ${metric.format === '-' ? 'selected' : ''}>-</option>
                        <option value="number" ${metric.format === 'number' ? 'selected' : ''}>number</option>
                        <option value="percentage" ${metric.format === 'percentage' ? 'selected' : ''}>percentage</option>
                        <option value="money" ${metric.format === 'money' ? 'selected' : ''}>money</option>
                    </select>
                </div>
                <div style="width: 10%; text-align: center;">
                    <button class="row-delete-btn" onclick="this.closest('.table-row-item').remove()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(row);
        });
    }
}

function toggleConnectionModal() {
    const modal = document.getElementById('connectionModal');
    if (modal) {
        modal.classList.toggle('active');
    }
}

function saveConnection() {
    const connName = document.getElementById('connName').value;
    const connHost = document.getElementById('connHost').value;
    const connPort = document.getElementById('connPort').value;
    const connDatabase = document.getElementById('connDatabase').value;
    const connUser = document.getElementById('connUser').value;
    
    if (!connName || !connHost || !connDatabase) {
        showToast('请填写必要的连接信息', 'error');
        return;
    }
    
    showToast('连接测试成功！', 'success');
    toggleConnectionModal();
    
    const badge = document.getElementById('connectionBadge');
    if (badge) {
        badge.textContent = `${connName} (已连接)`;
        badge.classList.add('connected');
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

let conversations = [];
let currentConversationId = null;

function initConversations() {
    conversations = [
        { 
            id: '1', 
            title: '查询近7天广告花费最高的关键词', 
            time: '2分钟前', 
            mock: true,
            history: [{
                question: '近7天广告花费最高的关键词',
                sql: 'SELECT keyword, SUM(spend) as total_spend FROM ad_keywords WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY keyword ORDER BY total_spend DESC LIMIT 10;',
                data: {
                    columns: ['关键词', '总花费(元)', '点击量', '转化数'],
                    rows: [
                        ['无线充电器', '2,845.67', 1234, 45],
                        ['蓝牙耳机', '2,345.23', 987, 38],
                        ['手机壳', '1,876.54', 2345, 89],
                        ['充电宝', '1,654.32', 1567, 56],
                        ['数据线', '1,432.10', 3456, 123],
                        ['手机支架', '1,234.56', 876, 32],
                        ['钢化膜', '987.65', 4567, 156],
                        ['手机镜头', '876.54', 654, 23],
                        ['自拍杆', '765.43', 1234, 45],
                        ['手机挂件', '654.32', 789, 28]
                    ]
                },
                analysis: '<div class="analysis-intro"><p>根据您的查询，我分析了近7天的广告关键词花费数据：</p></div><div class="analysis-section"><h5 class="analysis-subtitle"><i class="fas fa-lightbulb"></i> 核心发现</h5><ul class="analysis-list"><li><strong>"无线充电器"</strong>以2,845.67元的花费位居首位，占总花费的21%</li><li>前3个关键词贡献了超过<strong>50%</strong>的总花费</li><li><strong>"钢化膜"</strong>虽然花费较低（987.65元），但转化数最高（156次），ROI表现最优</li></ul></div><div class="analysis-section"><h5 class="analysis-subtitle"><i class="fas fa-chart-line"></i> 优化建议</h5><ol class="analysis-ordered-list"><li>继续加大对"无线充电器"和"蓝牙耳机"的投入</li><li>考虑优化"钢化膜"的出价策略，以获取更多流量</li><li>对于低转化关键词（如"手机镜头"），建议评估其投放效果</li></ol></div>'
            }]
        },
        { 
            id: '2', 
            title: '分析本月各渠道转化率', 
            time: '15分钟前', 
            mock: true,
            history: [{
                question: '本月各渠道转化率对比',
                sql: 'SELECT channel, COUNT(order_id) as orders, SUM(revenue) as revenue, COUNT(order_id) / COUNT(session_id) * 100 as conversion_rate FROM channel_data WHERE MONTH(date) = MONTH(CURDATE()) GROUP BY channel ORDER BY conversion_rate DESC;',
                data: {
                    columns: ['渠道', '订单数', '销售额(元)', '转化率(%)'],
                    rows: [
                        ['抖音', 1234, '45,678.90', '3.25'],
                        ['淘宝', 876, '32,123.45', '2.89'],
                        ['京东', 654, '28,901.23', '2.45'],
                        ['拼多多', 432, '18,765.43', '1.98'],
                        ['小红书', 234, '12,345.67', '2.67']
                    ]
                },
                analysis: '<div class="analysis-intro"><p>本月各渠道转化率分析报告：</p></div><div class="analysis-section"><h5 class="analysis-subtitle"><i class="fas fa-chart-bar"></i> 渠道表现</h5><ul class="analysis-list"><li><strong>抖音</strong>渠道表现最佳，转化率达到<span class="highlight-text">3.25%</span>，订单数领先</li><li>小红书虽然订单量较少，但转化率<span class="highlight-text">2.67%</span>表现不错，值得关注</li><li>拼多多转化率最低<span class="highlight-text">1.98%</span>，建议优化落地页</li></ul></div><div class="analysis-section"><h5 class="analysis-subtitle"><i class="fas fa-eye"></i> 趋势洞察</h5><p>整体来看，移动端渠道表现优于PC端，建议重点布局短视频平台。</p></div>'
            }]
        },
        { 
            id: '3', 
            title: '库存预警查询', 
            time: '1小时前', 
            mock: true,
            history: [{
                question: '库存预警查询',
                sql: 'SELECT sku, product_name, stock_quantity, safety_stock FROM inventory WHERE stock_quantity < safety_stock ORDER BY stock_quantity ASC;',
                data: {
                    columns: ['SKU', '商品名称', '当前库存', '安全库存'],
                    rows: [
                        ['ABC-123', '无线充电器Pro', 12, 50],
                        ['DEF-456', '蓝牙耳机Mini', 8, 30],
                        ['GHI-789', '充电宝20000mAh', 5, 40],
                        ['JKL-012', '手机壳透明款', 3, 25],
                        ['MNO-345', '数据线Type-C', 15, 60]
                    ]
                },
                analysis: '<div class="analysis-intro"><p>库存预警分析报告：</p></div><div class="analysis-section"><h5 class="analysis-subtitle"><i class="fas fa-exclamation-triangle"></i> 预警商品</h5><p>目前发现<strong>5个</strong>SKU库存低于安全库存线。</p></div><div class="analysis-section"><h5 class="analysis-subtitle"><i class="fas fa-fire"></i> 紧急程度</h5><ul class="analysis-list"><li><span class="danger-tag">紧急</span> SKU ABC-123（无线充电器Pro）仅剩12件，远低于安全库存50件</li><li><span class="warning-tag">中等</span> SKU DEF-456、GHI-789库存也需及时补货</li></ul></div><div class="analysis-section"><h5 class="analysis-subtitle"><i class="fas fa-clipboard-check"></i> 行动建议</h5><p>立即安排采购补货，避免断货影响销售。</p></div>'
            }]
        }
    ];
    currentConversationId = '1';
    renderConversationList();
    loadLastHistory();
}

function renderConversationList() {
    const convList = document.getElementById('convList');
    if (!convList) return;
    
    convList.innerHTML = conversations.map(conv => `
        <div class="conv-item ${conv.id === currentConversationId ? 'active' : ''}" onclick="selectConversation('${conv.id}')">
            <div class="conv-title">${conv.title}</div>
            <div class="conv-time">${conv.time} <span class="${conv.mock ? 'mock-badge' : 'real-badge'}">${conv.mock ? '模拟' : '真实'}</span></div>
        </div>
    `).join('');
}

function createNewConversation() {
    const newId = Date.now().toString();
    conversations.unshift({
        id: newId,
        title: '新对话',
        time: '刚刚',
        mock: true
    });
    currentConversationId = newId;
    renderConversationList();
    
    document.getElementById('queryInput').value = '';
    document.getElementById('sqlOutput').textContent = '-- 输入问题后，SQL将在这里显示';
    document.getElementById('analysisContent').textContent = '请输入查询问题，AI将为您分析结果。';
    
    const table = document.getElementById('resultTable');
    if (table) {
        table.innerHTML = '<thead></thead><tbody></tbody>';
    }
    
    resetProcessFlow();
}

function selectConversation(id) {
    currentConversationId = id;
    renderConversationList();
    loadLastHistory();
}

function loadLastHistory() {
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (!currentConv || !currentConv.history || currentConv.history.length === 0) {
        document.getElementById('queryInput').value = '';
        document.getElementById('sqlOutput').textContent = '-- 输入问题后，SQL将在这里显示';
        document.getElementById('analysisContent').innerHTML = '<p>请输入查询问题，AI将为您分析结果。</p>';
        
        const table = document.getElementById('resultTable');
        if (table) {
            table.innerHTML = '<thead></thead><tbody></tbody>';
        }
        
        resetProcessFlow();
        return;
    }
    
    const lastHistory = currentConv.history[currentConv.history.length - 1];
    document.getElementById('queryInput').value = lastHistory.question;
    document.getElementById('sqlOutput').textContent = lastHistory.sql;
    document.getElementById('analysisContent').innerHTML = lastHistory.analysis;
    
    if (lastHistory.data) {
        renderResultTable(lastHistory.data);
        switchTab('result');
    }
    
    const steps = document.querySelectorAll('.flow-step');
    steps.forEach((step, index) => {
        step.classList.remove('active');
        step.classList.add('completed');
    });
}

function resetProcessFlow() {
    const steps = document.querySelectorAll('.flow-step');
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
}

const USE_API = false;
const API_BASE_URL = '/api';

async function executeQuery() {
    const input = document.getElementById('queryInput').value.trim();
    if (!input) {
        showToast('请输入查询问题', 'error');
        return;
    }
    
    resetProcessFlow();
    
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (currentConv) {
        currentConv.title = input.length > 30 ? input.substring(0, 30) + '...' : input;
        currentConv.time = '刚刚';
        renderConversationList();
    }
    
    await step1NaturalLanguage(input);
    await delay(600);
    
    if (USE_API) {
        await executeQueryWithAPI(input, currentConv);
    } else {
        await executeQueryWithMock(input, currentConv);
    }
}

async function executeQueryWithAPI(input, currentConv) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: input })
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            
            document.getElementById('sqlOutput').textContent = data.sql;
            await step2GenerateSQL(input);
            await delay(800);
            
            if (data.result && data.result.length > 0) {
                const columns = Object.keys(data.result[0]);
                const rows = data.result.map(row => Object.values(row));
                renderResultTable({ columns, rows });
            }
            await step3ExecuteSQL(input);
            await delay(500);
            
            const analysisHtml = formatAnalysis(data.answer);
            document.getElementById('analysisContent').innerHTML = analysisHtml;
            await step4AIAnalysis(input);
            
            if (currentConv) {
                if (!currentConv.history) {
                    currentConv.history = [];
                }
                currentConv.history.push({
                    question: input,
                    sql: data.sql,
                    data: data.result,
                    analysis: analysisHtml
                });
            }
        } else {
            throw new Error(result.error || 'API调用失败');
        }
    } catch (error) {
        console.error('API error:', error);
        showToast('API调用失败，使用模拟数据', 'warning');
        await executeQueryWithMock(input, currentConv);
    }
}

async function executeQueryWithMock(input, currentConv) {
    const sql = generateSQL(input);
    await step2GenerateSQL(input);
    await delay(800);
    
    const mockData = generateMockData(input);
    await step3ExecuteSQL(input);
    await delay(500);
    
    const analysisHtml = generateAnalysis(input);
    await step4AIAnalysis(input);
    
    if (currentConv) {
        if (!currentConv.history) {
            currentConv.history = [];
        }
        currentConv.history.push({
            question: input,
            sql: sql,
            data: mockData,
            analysis: analysisHtml
        });
    }
}

function formatAnalysis(text) {
    if (!text) {
        return '<p>暂无分析结果</p>';
    }
    
    let html = '<div class="analysis-intro"><p>' + text.replace(/\n/g, '</p><p>') + '</p></div>';
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>');
    html = html.replace(/<li>/g, '<ul class="analysis-list"><li>').replace(/<\/li>(?!<li>)/g, '</li></ul>');
    
    return html;
}

async function step1NaturalLanguage(input) {
    const step1 = document.getElementById('step1');
    step1.classList.add('active');
    await delay(300);
    step1.classList.remove('active');
    step1.classList.add('completed');
}

async function step2GenerateSQL(input) {
    const step2 = document.getElementById('step2');
    step2.classList.add('active');
    
    const sql = generateSQL(input);
    const sqlOutput = document.getElementById('sqlOutput');
    sqlOutput.textContent = '';
    
    for (let i = 0; i < sql.length; i++) {
        sqlOutput.textContent += sql[i];
        await delay(20);
    }
    
    step2.classList.remove('active');
    step2.classList.add('completed');
}

async function step3ExecuteSQL(input) {
    const step3 = document.getElementById('step3');
    step3.classList.add('active');
    
    const mockData = generateMockData(input);
    renderResultTable(mockData);
    
    step3.classList.remove('active');
    step3.classList.add('completed');
    
    switchTab('result');
}

async function step4AIAnalysis(input) {
    const step4 = document.getElementById('step4');
    step4.classList.add('active');
    
    switchTab('analysis');
    
    const analysisHtml = generateAnalysis(input);
    const analysisContent = document.getElementById('analysisContent');
    analysisContent.innerHTML = analysisHtml;
    
    await delay(500);
    
    step4.classList.remove('active');
    step4.classList.add('completed');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateSQL(input) {
    if (input.includes('关键词') || input.includes('花费')) {
        return `SELECT keyword, SUM(spend) as total_spend, SUM(clicks) as clicks, SUM(conversions) as conversions
FROM ad_keywords
WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY keyword
ORDER BY total_spend DESC
LIMIT 10;`;
    } else if (input.includes('转化') || input.includes('渠道')) {
        return `SELECT channel, COUNT(order_id) as orders, SUM(revenue) as revenue, 
       COUNT(order_id) / COUNT(session_id) * 100 as conversion_rate
FROM channel_data
WHERE MONTH(date) = MONTH(CURDATE())
GROUP BY channel
ORDER BY conversion_rate DESC;`;
    } else if (input.includes('库存')) {
        return `SELECT sku, product_name, stock_quantity, safety_stock
FROM inventory
WHERE stock_quantity < safety_stock
ORDER BY stock_quantity ASC;`;
    } else if (input.includes('订单')) {
        return `SELECT product_name, COUNT(order_id) as order_count, SUM(quantity) as total_quantity
FROM orders
WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY product_name
ORDER BY order_count DESC
LIMIT 5;`;
    } else {
        return `SELECT * FROM your_table
WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
ORDER BY date DESC;`;
    }
}

function generateMockData(input) {
    if (input.includes('关键词') || input.includes('花费')) {
        return {
            columns: ['关键词', '总花费(元)', '点击量', '转化数'],
            rows: [
                ['无线充电器', '2,845.67', 1234, 45],
                ['蓝牙耳机', '2,345.23', 987, 38],
                ['手机壳', '1,876.54', 2345, 89],
                ['充电宝', '1,654.32', 1567, 56],
                ['数据线', '1,432.10', 3456, 123],
                ['手机支架', '1,234.56', 876, 32],
                ['钢化膜', '987.65', 4567, 156],
                ['手机镜头', '876.54', 654, 23],
                ['自拍杆', '765.43', 1234, 45],
                ['手机挂件', '654.32', 789, 28]
            ]
        };
    } else if (input.includes('转化') || input.includes('渠道')) {
        return {
            columns: ['渠道', '订单数', '销售额(元)', '转化率(%)'],
            rows: [
                ['抖音', 1234, '45,678.90', '3.25'],
                ['淘宝', 876, '32,123.45', '2.89'],
                ['京东', 654, '28,901.23', '2.45'],
                ['拼多多', 432, '18,765.43', '1.98'],
                ['小红书', 234, '12,345.67', '2.67']
            ]
        };
    } else if (input.includes('库存')) {
        return {
            columns: ['SKU', '商品名称', '当前库存', '安全库存'],
            rows: [
                ['ABC-123', '无线充电器Pro', 12, 50],
                ['DEF-456', '蓝牙耳机Mini', 8, 30],
                ['GHI-789', '充电宝20000mAh', 5, 40],
                ['JKL-012', '手机壳透明款', 3, 25],
                ['MNO-345', '数据线Type-C', 15, 60]
            ]
        };
    } else if (input.includes('订单')) {
        return {
            columns: ['商品名称', '订单数', '销售数量'],
            rows: [
                ['无线充电器', 156, 189],
                ['蓝牙耳机', 134, 145],
                ['手机壳', 98, 123],
                ['充电宝', 87, 98],
                ['数据线', 76, 156]
            ]
        };
    } else {
        return {
            columns: ['日期', '数值', '备注'],
            rows: [
                ['2024-01-01', '1234', '正常'],
                ['2024-01-02', '2345', '正常'],
                ['2024-01-03', '3456', '正常'],
                ['2024-01-04', '4567', '增长'],
                ['2024-01-05', '5678', '增长']
            ]
        };
    }
}

function renderResultTable(data) {
    const table = document.getElementById('resultTable');
    if (!table || !data) return;
    
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = `<tr>${data.columns.map(col => `<th>${col}</th>`).join('')}</tr>`;
    
    tbody.innerHTML = data.rows.map(row => `
        <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
    `).join('');
}

function generateAnalysis(input) {
    if (input.includes('关键词') || input.includes('花费')) {
        return `
            <div class="analysis-intro">
                <p>根据您的查询，我分析了近7天的广告关键词花费数据：</p>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-lightbulb"></i> 核心发现</h5>
                <ul class="analysis-list">
                    <li><strong>"无线充电器"</strong>以2,845.67元的花费位居首位，占总花费的21%</li>
                    <li>前3个关键词贡献了超过<strong>50%</strong>的总花费</li>
                    <li><strong>"钢化膜"</strong>虽然花费较低（987.65元），但转化数最高（156次），ROI表现最优</li>
                </ul>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-chart-line"></i> 优化建议</h5>
                <ol class="analysis-ordered-list">
                    <li>继续加大对"无线充电器"和"蓝牙耳机"的投入</li>
                    <li>考虑优化"钢化膜"的出价策略，以获取更多流量</li>
                    <li>对于低转化关键词（如"手机镜头"），建议评估其投放效果</li>
                </ol>
            </div>
        `;
    } else if (input.includes('转化') || input.includes('渠道')) {
        return `
            <div class="analysis-intro">
                <p>本月各渠道转化率分析报告：</p>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-chart-bar"></i> 渠道表现</h5>
                <ul class="analysis-list">
                    <li><strong>抖音</strong>渠道表现最佳，转化率达到<span class="highlight-text">3.25%</span>，订单数领先</li>
                    <li>小红书虽然订单量较少，但转化率<span class="highlight-text">2.67%</span>表现不错，值得关注</li>
                    <li>拼多多转化率最低<span class="highlight-text">1.98%</span>，建议优化落地页</li>
                </ul>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-eye"></i> 趋势洞察</h5>
                <p>整体来看，移动端渠道表现优于PC端，建议重点布局短视频平台。</p>
            </div>
        `;
    } else if (input.includes('库存')) {
        return `
            <div class="analysis-intro">
                <p>库存预警分析报告：</p>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-exclamation-triangle"></i> 预警商品</h5>
                <p>目前发现<strong>5个</strong>SKU库存低于安全库存线。</p>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-fire"></i> 紧急程度</h5>
                <ul class="analysis-list">
                    <li><span class="danger-tag">紧急</span> SKU ABC-123（无线充电器Pro）仅剩12件，远低于安全库存50件</li>
                    <li><span class="warning-tag">中等</span> SKU DEF-456、GHI-789库存也需及时补货</li>
                </ul>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-clipboard-check"></i> 行动建议</h5>
                <p>立即安排采购补货，避免断货影响销售。</p>
            </div>
        `;
    } else if (input.includes('订单')) {
        return `
            <div class="analysis-intro">
                <p>上周订单量分析：</p>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-fire"></i> 热销商品</h5>
                <ul class="analysis-list">
                    <li><strong>无线充电器</strong>以156单位居榜首，销售数量189件</li>
                    <li>蓝牙耳机和手机壳紧随其后</li>
                </ul>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-chart-line"></i> 趋势分析</h5>
                <p>整体订单量呈上升趋势，建议关注库存水平，确保热销商品供应充足。</p>
            </div>
        `;
    } else {
        return `
            <div class="analysis-intro">
                <p>数据分析报告已生成。</p>
                <p>根据您的查询，我已获取相关数据并进行分析。</p>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-table"></i> 数据概览</h5>
                <p>查询返回了<strong>5条</strong>记录，显示了近期的数据变化趋势。</p>
            </div>
            <div class="analysis-section">
                <h5 class="analysis-subtitle"><i class="fas fa-key"></i> 关键发现</h5>
                <p>数据呈现稳步增长态势，建议持续关注后续变化。</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initConversations();
    
    const queryInput = document.getElementById('queryInput');
    if (queryInput) {
        queryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                executeQuery();
            }
        });
    }
    
    document.getElementById('connectionModal')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            toggleConnectionModal();
        }
    });
});