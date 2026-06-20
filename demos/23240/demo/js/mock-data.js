/* ================================================================
 * 银行服务治理平台 - 模拟数据 mock-data.js
 * 提供首页驾驶舱及各子页面 Demo 演示数据
 * ================================================================ */

(function (global) {
    'use strict';

    const mockData = {};

    /* ---------- 首页驾驶舱统计数据 ---------- */
    mockData.dashboard = {
        stats: [
            { label: '接入系统总数',     value: 186, foot: '较上月 +12', trend: 'up',   icon: 'fa-server',   style: 'primary' },
            { label: '接口总数',         value: 3482, foot: '较上月 +184', trend: 'up',   icon: 'fa-plug',   style: 'cyan' },
            { label: '文件服务总数',     value: 1256, foot: '较上月 +68', trend: 'up',   icon: 'fa-file-text-o', style: 'purple' },
            { label: '今日调用量',       value: '1.86', unit: '万', foot: '较昨日 +8.6%', trend: 'up', icon: 'fa-line-chart', style: 'green' },
            { label: '待审核申请',     value: 48, foot: '紧急 12', trend: 'down', icon: 'fa-file-text', style: 'orange' },
            { label: 'SLA 达标率',       value: '99.2', unit: '%', foot: '目标 ≥ 99%', trend: 'up', icon: 'fa-check-circle', style: 'green' }
        ],

        // 接口分级分布
        levelDistribution: [
            { label: 'A级（核心）', value: 186, percent: 15 },
            { label: 'B级（重要）', value: 518, percent: 42 },
            { label: 'C级（一般）', value: 456, percent: 37 },
            { label: 'D级（低优）', value: 82,  percent: 6  }
        ],

        // 近 7 天接口调用量
        weeklyCalls: [
            { label: '周一', value: 18500 },
            { label: '周二', value: 21200 },
            { label: '周三', value: 19800 },
            { label: '周四', value: 22400 },
            { label: '周五', value: 26800 },
            { label: '周六', value: 12600 },
            { label: '周日', value: 10400 }
        ],

        // 各业务域接口数量
        domainStats: [
            { name: '零售业务', count: 862,  rate: 98 },
            { name: '对公业务', count: 584,  rate: 86 },
            { name: '信贷业务', count: 428,  rate: 72 },
            { name: '风险控制', count: 386,  rate: 64 },
            { name: '运营支撑', count: 520,  rate: 92 },
            { name: '数据服务', count: 702,  rate: 88 }
        ],

        // 最新审核动态
        recentActivity: [
            { time: '10:32', title: '账户查询接口 v2.3 变更申请', status: '待审核', user: '李经理', level: 'A' },
            { time: '10:18', title: '客户对账单文件服务 新增', status: '审批中', user: '王开发', level: 'B' },
            { time: '09:55', title: '贷款余额接口 下线申请', status: '已通过', user: '赵主管', level: 'A' },
            { time: '09:42', title: '交易流水查询 v3.0 变更', status: '待审核', user: '陈工程师', level: 'B' },
            { time: '09:15', title: '客户信息文件服务 合规检查未通过', status: '已驳回', user: '刘运营', level: 'A' },
            { time: '08:58', title: '信用卡账单文件 新接入', status: '审批中', user: '周产品', level: 'C' }
        ],

        // 预警信息
        alerts: [
            { level: 'danger',  title: '核心账户查询接口响应超时', desc: '近 30 分钟平均响应 1850ms，超阈值', time: '5 分钟前' },
            { level: 'warning', title: '客户对账单文件延迟',     desc: '文件预计送达超过 SLA 约定 15 分钟',     time: '22 分钟前' },
            { level: 'warning', title: '文件命名不符合规范',       desc: '检测到 5 个文件未按新规范命名',     time: '1 小时前' },
            { level: 'info',    title: '版本灰度发布进行中',       desc: '信用评分接口 v3.2 正在灰度 (10%)',     time: '2 小时前' }
        ]
    };

    /* ---------- 通用：接口列表 ---------- */
    mockData.interfaceList = [
        { code: 'API-CUS-0001', name: '客户基本信息查询',       type: 'API',     level: 'A', system: '核心业务系统',     owner: '张经理', calls: '82.6', sla: '99.8', status: '运行中' },
        { code: 'API-ACC-0012', name: '账户余额查询',           type: 'API',     level: 'A', system: '核心业务系统',     owner: '李主管', calls: '126.3', sla: '99.7', status: '运行中' },
        { code: 'API-LOAN-0023', name: '贷款信息查询',             type: 'API',     level: 'B', system: '信贷管理系统',     owner: '王经理', calls: '42.1', sla: '99.2', status: '运行中' },
        { code: 'FILE-TRX-0045', name: '日终交易流水文件',         type: '文件',   level: 'B', system: '交易清算系统',     owner: '赵主管', calls: '2.4',   sla: '98.5', status: '运行中' },
        { code: 'FILE-STMT-0056', name: '月度客户对账单文件',       type: '文件',   level: 'A', system: '信用卡核心',         owner: '陈产品', calls: '1.8',   sla: '99.0', status: '运行中' },
        { code: 'API-CRD-0068', name: '信用评分查询',             type: 'API',     level: 'B', system: '风险管理系统',     owner: '刘工程师', calls: '58.2', sla: '99.5', status: '运行中' },
        { code: 'API-RISK-0078', name: '反洗钱名单校验',           type: 'API',     level: 'A', system: '风控系统',         owner: '孙经理', calls: '36.9', sla: '99.9', status: '运行中' },
        { code: 'FILE-REG-0089', name: '监管报送文件',             type: '文件',   level: 'A', system: '监管报送平台',     owner: '周合规', calls: '0.8',   sla: '100',  status: '运行中' },
        { code: 'API-ORG-0091', name: '机构信息查询',           type: 'API',     level: 'C', system: '组织架构系统',     owner: '吴主管', calls: '12.6', sla: '99.6', status: '运行中' },
        { code: 'FILE-BILL-0102', name: '电子回单文件',             type: '文件',   level: 'B', system: '电子渠道',           owner: '郑经理', calls: '28.5', sla: '98.8', status: '运行中' }
    ];

    /* ---------- 通用：申请列表 ---------- */
    mockData.applicationList = [
        { no: 'APP2026060400123', type: '变更', title: '客户基本信息查询 v2.3', applicant: '李经理', time: '2026-06-04 10:32', status: '待审核', level: 'A' },
        { no: 'APP202606040098',  type: '新增', title: '客户对账单文件服务',   applicant: '王开发', time: '2026-06-04 10:18', status: '审批中', level: 'B' },
        { no: 'APP202606030215',  type: '下线', title: '贷款余额查询接口',     applicant: '赵主管', time: '2026-06-03 15:42', status: '已通过', level: 'A' },
        { no: 'APP202606030189',  type: '变更', title: '交易流水查询 v3.0',      applicant: '陈工程师', time: '2026-06-03 14:25', status: '待审核', level: 'B' },
        { no: 'APP202606020156',  type: '新增', title: '信用评分模型调用',    applicant: '刘运营', time: '2026-06-02 16:08', status: '已驳回', level: 'A' },
        { no: 'APP202606020134',  type: '变更', title: '监管报送文件 v2.1',     applicant: '周产品', time: '2026-06-02 09:32', status: '审批中', level: 'B' },
        { no: 'APP202606010098',  type: '新增', title: '客户信息文件服务',        applicant: '孙经理', time: '2026-06-01 11:20', status: '已通过', level: 'C' },
        { no: 'APP202606010072',  type: '调用', title: '机构信息查询接口',      applicant: '吴主管', time: '2026-06-01 09:45', status: '已通过', level: 'C' }
    ];

    /* ---------- 通用：SLA数据 ---------- */
    mockData.slaData = [
        { name: '客户基本信息查询',      calls: 826000, avg: 186, fail: 0.2,  sla: 99.8, target: 99.5, level: 'A' },
        { name: '账户余额查询',          calls: 1263000, avg: 152, fail: 0.3,  sla: 99.7, target: 99.5, level: 'A' },
        { name: '贷款信息查询',          calls: 421000,  avg: 245, fail: 0.8,  sla: 99.2, target: 99.0, level: 'B' },
        { name: '日终交易流水文件',     calls: 24000,  avg: '-', fail: 1.5,  sla: 98.5, target: 98.0, level: 'B' },
        { name: '月度客户对账单文件',   calls: 18000,  avg: '-', fail: 1.0,  sla: 99.0, target: 99.0, level: 'A' },
        { name: '信用评分查询',        calls: 582000,  avg: 320, fail: 0.5,  sla: 99.5, target: 99.0, level: 'B' }
    ];

    /* ---------- 通用：系统清单 ---------- */
    mockData.systems = [
        { code: 'SYS-CORE', name: '核心业务系统',       dept: '核心研发部', owner: '张总监', interfaces: 286, files: 86, status: '运行中' },
        { code: 'SYS-CREDIT', name: '信贷管理系统', dept: '信贷研发部', owner: '李总监', interfaces: 148, files: 42, status: '运行中' },
        { code: 'SYS-RISK', name: '风险管理系统',     dept: '风险管理部', owner: '王总监', interfaces: 96,  files: 28, status: '运行中' },
        { code: 'SYS-ACC', name: '会计总账系统',         dept: '财务研发部', owner: '赵总监', interfaces: 78,  files: 35, status: '运行中' },
        { code: 'SYS-ORG', name: '组织架构系统',       dept: '人力资源部', owner: '陈总监', interfaces: 42,  files: 12, status: '运行中' },
        { code: 'SYS-CRM', name: '客户关系管理',     dept: '零售业务部', owner: '刘总监', interfaces: 112, files: 24, status: '运行中' }
    ];

    /* ---------- 通用：数据字典字段 ---------- */
    mockData.fields = [
        { code: 'CUST_ID',     name: '客户编号',     type: 'VARCHAR(20)', length: 20, nullable: '否', refCount: 1286 },
        { code: 'ACC_NO',        name: '账号',         type: 'VARCHAR(32)', length: 32, nullable: '否', refCount: 2156 },
        { code: 'CUST_NAME',   name: '客户名称',     type: 'VARCHAR(100)', length: 100, nullable: '否', refCount: 892 },
        { code: 'ID_TYPE',     name: '证件类型',       type: 'CHAR(1)', length: 1, nullable: '否', refCount: 586 },
        { code: 'ID_NO',       name: '证件号码',       type: 'VARCHAR(20)', length: 20, nullable: '否', refCount: 782 },
        { code: 'CURRENCY',    name: '币种代码',       type: 'CHAR(3)', length: 3, nullable: '是', refCount: 428 },
        { code: 'AMOUNT',      name: '金额',         type: 'DECIMAL(18,2)', length: 18, nullable: '否', refCount: 1825 },
        { code: 'TRAN_DATE',   name: '交易日期',       type: 'DATE', length: 10, nullable: '否', refCount: 986 }
    ];

    /* ---------- 通用：审核规则 ---------- */
    mockData.rules = [
        { code: 'RULE-NAME-001', name: '接口命名规范校验',        category: '命名规范', severity: '高', status: '已启用', executions: 12864, passRate: 98.6 },
        { code: 'RULE-NAME-002', name: '文件命名规范校验',       category: '命名规范', severity: '高', status: '已启用', executions: 8456,  passRate: 97.2 },
        { code: 'RULE-FIELD-003', name: '字段字典引用检查',      category: '数据标准', severity: '中', status: '已启用', executions: 6845,  passRate: 95.8 },
        { code: 'RULE-SEC-004',  name: '敏感字段脱敏检查',        category: '安全规范', severity: '高', status: '已启用', executions: 5468,  passRate: 99.1 },
        { code: 'RULE-SLA-005',  name: 'SLA响应时间校验',       category: '服务质量', severity: '中', status: '已启用', executions: 4892,  passRate: 96.4 },
        { code: 'RULE-DEP-006',  name: '接口依赖完整性校验',        category: '完整性',   severity: '高', status: '已启用', executions: 3652,  passRate: 94.6 }
    ];

    /* ---------- 数据字典：分类及字段（category.html） ---------- */
    mockData.dictCategories = [
        { id: 'basic', name: '基础数据类', count: 268, fields: [
            { code: 'CUST_ID',   name: '客户编号',     type: 'VARCHAR', length: 20, nullable: '否', refCount: 1286, source: '人行标准' },
            { code: 'ACC_NO',    name: '账号',         type: 'VARCHAR', length: 32, nullable: '否', refCount: 2156, source: '行内标准' },
            { code: 'CARD_NO',   name: '卡号',         type: 'VARCHAR', length: 19, nullable: '是', refCount: 682,  source: '国家标准' },
            { code: 'ORG_CODE',  name: '机构代码',     type: 'VARCHAR', length: 8,  nullable: '否', refCount: 528,  source: '继承字段' },
            { code: 'USER_ID',   name: '用户编号',     type: 'VARCHAR', length: 20, nullable: '否', refCount: 418,  source: '行内标准' }
        ]},
        { id: 'biz',  name: '业务数据类', count: 186, fields: [
            { code: 'LOAN_NO',    name: '贷款编号',     type: 'VARCHAR', length: 30, nullable: '否', refCount: 568, source: '行内标准' },
            { code: 'PROD_CODE',  name: '产品代码',     type: 'VARCHAR', length: 12, nullable: '否', refCount: 386, source: '业务部门' },
            { code: 'BIZ_TYPE',   name: '业务类型',     type: 'CHAR',    length: 2,  nullable: '否', refCount: 682, source: '行业标准' },
            { code: 'CHANNEL',    name: '渠道代码',     type: 'VARCHAR', length: 10, nullable: '否', refCount: 458, source: '业务部门' }
        ]},
        { id: 'trx',  name: '交易数据类', count: 312, fields: [
            { code: 'TRX_NO',     name: '交易流水号',   type: 'VARCHAR', length: 32, nullable: '否', refCount: 1862, source: '行内标准' },
            { code: 'TRX_AMT',    name: '交易金额',     type: 'DECIMAL', length: '18,2', nullable: '否', refCount: 1528, source: '行内标准' },
            { code: 'TRX_DATE',   name: '交易日期',     type: 'DATE',    length: 10, nullable: '否', refCount: 1186, source: '行业标准' },
            { code: 'TRX_TIME',   name: '交易时间',     type: 'TIME',    length: 8,  nullable: '否', refCount: 1186, source: '行业标准' },
            { code: 'CCY_CODE',   name: '币种代码',     type: 'CHAR',    length: 3,  nullable: '否', refCount: 982,  source: '国家标准' }
        ]},
        { id: 'file', name: '文件数据类', count: 128, fields: [
            { code: 'FILE_NAME',  name: '文件名',       type: 'VARCHAR', length: 200, nullable: '否', refCount: 168, source: '行内标准' },
            { code: 'FILE_SIZE',  name: '文件大小',     type: 'BIGINT',  length: 20, nullable: '否', refCount: 128, source: '行内标准' },
            { code: 'FILE_MD5',   name: '文件MD5',      type: 'VARCHAR', length: 32, nullable: '否', refCount: 128, source: '行内标准' }
        ]},
        { id: 'enum', name: '字典枚举类', count: 86, fields: [
            { code: 'ID_TYPE',    name: '证件类型',     type: 'CHAR',    length: 2, nullable: '否', refCount: 586, source: '国家标准' },
            { code: 'ACC_STATUS', name: '账户状态',     type: 'CHAR',    length: 1, nullable: '否', refCount: 486, source: '行内标准' },
            { code: 'TRX_STATUS', name: '交易状态',     type: 'CHAR',    length: 1, nullable: '否', refCount: 628, source: '业务部门' },
            { code: 'GENDER',     name: '性别',         type: 'CHAR',    length: 1, nullable: '是', refCount: 328, source: '行业标准' }
        ]}
    ];

    /* ---------- 标准字段（field-list.html） ---------- */
    mockData.standardFields = [
        { code: 'CUST_ID',     name: '客户编号',       type: 'VARCHAR', length: 20, category: '基础数据类', refCount: 1286, status: '启用', source: '人行标准' },
        { code: 'ACC_NO',      name: '账号',           type: 'VARCHAR', length: 32, category: '基础数据类', refCount: 2156, status: '启用', source: '行内标准' },
        { code: 'CARD_NO',     name: '卡号',           type: 'VARCHAR', length: 19, category: '基础数据类', refCount: 682,  status: '启用', source: '国家标准' },
        { code: 'CUST_NAME',   name: '客户名称',       type: 'VARCHAR', length: 100, category: '基础数据类', refCount: 892, status: '启用', source: '行内标准' },
        { code: 'ID_TYPE',     name: '证件类型',       type: 'CHAR',    length: 2,  category: '字典枚举类', refCount: 586, status: '启用', source: '国家标准' },
        { code: 'ID_NO',       name: '证件号码',       type: 'VARCHAR', length: 20, category: '基础数据类', refCount: 782, status: '启用', source: '国家标准' },
        { code: 'GENDER',      name: '性别',           type: 'CHAR',    length: 1,  category: '字典枚举类', refCount: 328, status: '启用', source: '行业标准' },
        { code: 'BIRTH_DATE',  name: '出生日期',       type: 'DATE',    length: 10, category: '基础数据类', refCount: 286, status: '启用', source: '行业标准' },
        { code: 'CURRENCY',    name: '币种代码',       type: 'CHAR',    length: 3,  category: '字典枚举类', refCount: 428, status: '启用', source: '国家标准' },
        { code: 'AMOUNT',      name: '金额',           type: 'DECIMAL', length: '18,2', category: '交易数据类', refCount: 1825, status: '启用', source: '行内标准' },
        { code: 'BALANCE',     name: '账户余额',       type: 'DECIMAL', length: '18,2', category: '业务数据类', refCount: 958,  status: '启用', source: '行内标准' },
        { code: 'TRX_DATE',    name: '交易日期',       type: 'DATE',    length: 10, category: '交易数据类', refCount: 1186, status: '启用', source: '行业标准' },
        { code: 'TRX_TIME',    name: '交易时间',       type: 'TIME',    length: 8,  category: '交易数据类', refCount: 1186, status: '启用', source: '行业标准' },
        { code: 'TRX_NO',      name: '交易流水号',     type: 'VARCHAR', length: 32, category: '交易数据类', refCount: 1862, status: '启用', source: '行内标准' },
        { code: 'CHANNEL',     name: '渠道代码',       type: 'VARCHAR', length: 10, category: '业务数据类', refCount: 458,  status: '启用', source: '业务部门' },
        { code: 'ORG_CODE',    name: '机构代码',       type: 'VARCHAR', length: 8,  category: '基础数据类', refCount: 528,  status: '停用', source: '继承字段' }
    ];

    /* ---------- 枚举类型与枚举值（enum-mgmt.html） ---------- */
    mockData.enumTypes = [
        { code: 'IF_TYPE',    name: '接口类型',        values: [
            { code: 'IF01', value: '01', desc: '查询类接口',    order: 1, status: '启用' },
            { code: 'IF02', value: '02', desc: '转账类接口',    order: 2, status: '启用' },
            { code: 'IF03', value: '03', desc: '对账类接口',    order: 3, status: '启用' },
            { code: 'IF04', value: '04', desc: '文件传输接口',  order: 4, status: '启用' },
            { code: 'IF05', value: '05', desc: '管理类接口',    order: 5, status: '启用' },
            { code: 'IF06', value: '06', desc: '报表类接口',    order: 6, status: '启用' },
            { code: 'IF07', value: '07', desc: '审批类接口',    order: 7, status: '停用' }
        ]},
        { code: 'IF_LEVEL',   name: '分级级别',        values: [
            { code: 'A', value: 'A', desc: '核心级（影响资金/客户核心数据）', order: 1, status: '启用' },
            { code: 'B', value: 'B', desc: '重要级（影响关键业务）',        order: 2, status: '启用' },
            { code: 'C', value: 'C', desc: '一般级（普通业务接口）',        order: 3, status: '启用' },
            { code: 'D', value: 'D', desc: '低优级（内部/辅助接口）',       order: 4, status: '启用' }
        ]},
        { code: 'AUDIT_STATUS', name: '审核状态',      values: [
            { code: 'PENDING',  value: '0', desc: '待审核',   order: 1, status: '启用' },
            { code: 'APPROVED', value: '1', desc: '已通过',   order: 2, status: '启用' },
            { code: 'REJECTED', value: '2', desc: '已驳回',   order: 3, status: '启用' },
            { code: 'CANCEL',   value: '9', desc: '已撤销',   order: 4, status: '启用' }
        ]},
        { code: 'FILE_FMT',   name: '文件格式',        values: [
            { code: 'CSV',   value: 'CSV',   desc: '逗号分隔值文本文件',   order: 1, status: '启用' },
            { code: 'TXT',   value: 'TXT',   desc: '固定长度文本文件',     order: 2, status: '启用' },
            { code: 'XML',   value: 'XML',   desc: '可扩展标记语言',       order: 3, status: '启用' },
            { code: 'JSON',  value: 'JSON',  desc: 'JavaScript对象表示',   order: 4, status: '启用' },
            { code: 'XLSX',  value: 'XLSX',  desc: 'Excel电子表格',        order: 5, status: '启用' },
            { code: 'PDF',   value: 'PDF',   desc: '便携文档格式',         order: 6, status: '停用' }
        ]},
        { code: 'CCY_CODE',   name: '币种代码',        values: [
            { code: 'CNY', value: 'CNY', desc: '人民币',     order: 1, status: '启用' },
            { code: 'USD', value: 'USD', desc: '美元',       order: 2, status: '启用' },
            { code: 'EUR', value: 'EUR', desc: '欧元',       order: 3, status: '启用' },
            { code: 'HKD', value: 'HKD', desc: '港币',       order: 4, status: '启用' },
            { code: 'JPY', value: 'JPY', desc: '日元',       order: 5, status: '启用' }
        ]},
        { code: 'ACC_STATUS', name: '账户状态',        values: [
            { code: '1', value: '1', desc: '正常',       order: 1, status: '启用' },
            { code: '2', value: '2', desc: '冻结',       order: 2, status: '启用' },
            { code: '3', value: '3', desc: '挂失',       order: 3, status: '启用' },
            { code: '4', value: '4', desc: '销户',       order: 4, status: '启用' },
            { code: '5', value: '5', desc: '睡眠',       order: 5, status: '停用' }
        ]}
    ];

    /* ---------- 字段引用分析（reference.html） ---------- */
    mockData.fieldRefAnalysis = [
        {
            field: { code: 'CUST_ID', name: '客户编号', type: 'VARCHAR(20)', nullable: '否' },
            stats: { apis: 286, files: 128, systems: 38 },
            refs: [
                { kind: 'API',  system: '信贷管理系统',     name: '客户基本信息查询接口',   location: '请求参数 / 响应体',       use: '输入', level: 'A' },
                { kind: 'API',  system: '风险管理系统',     name: '客户风险评级查询',       location: '请求参数',                 use: '输入', level: 'A' },
                { kind: 'API',  system: '客户关系管理',     name: '客户画像查询',           location: '请求参数 / 响应体',       use: '输入', level: 'B' },
                { kind: 'API',  system: '核心业务系统',     name: '客户综合信息查询',       location: '请求参数 / 响应体',       use: '输入', level: 'A' },
                { kind: '文件', system: '监管报送平台',     name: '客户信息报送文件',       location: '字段 #1 (CUST_ID)',       use: '输出', level: 'A' },
                { kind: '文件', system: '会计总账系统',     name: '客户科目余额文件',       location: '字段 #2 (CUST_ID)',       use: '输出', level: 'B' },
                { kind: '文件', system: '信用卡核心',       name: '信用卡客户账单文件',     location: '字段 #1 (CUST_ID)',       use: '输出', level: 'B' },
                { kind: 'API',  system: '信用卡核心',       name: '信用卡额度查询',         location: '请求参数',                 use: '输入', level: 'B' },
                { kind: 'API',  system: '反洗钱系统',       name: '客户交易监控查询',       location: '请求参数 / 响应体',       use: '输入', level: 'A' },
                { kind: '文件', system: '反洗钱系统',       name: '可疑交易报告文件',       location: '字段 #3 (CUST_ID)',       use: '输出', level: 'A' }
            ]
        }
    ];

    /* ---------- L1-L3 分类树（list.html 级联筛选、其他页面共用） ---------- */
    mockData.categoryTree = [
        {
            code: 'L1-DEP', name: '个人存款', children: [
                {
                    code: 'L2-DEP-01', name: '存款交易执行', children: [
                        { code: 'L3-DEP-001', name: '身份核验' },
                        { code: 'L3-DEP-003', name: '转账' },
                        { code: 'L3-DEP-004', name: '余额查询' },
                        { code: 'L3-DEP-005', name: '交易明细查询' }
                    ]
                },
                {
                    code: 'L2-DEP-02', name: '客户开户计划', children: [
                        { code: 'L3-DEP-002', name: '开户' }
                    ]
                }
            ]
        },
        {
            code: 'L1-CUS', name: '客户管理', children: [
                {
                    code: 'L2-CUS-01', name: '客户信息维护', children: [
                        { code: 'L3-CUS-006', name: '客户信息维护' }
                    ]
                }
            ]
        },
        {
            code: 'L1-PAY', name: '支付清算', children: [
                {
                    code: 'L2-PAY-01', name: '跨行支付执行', children: [
                        { code: 'L3-PAY-007', name: '大额支付' },
                        { code: 'L3-PAY-008', name: '小额批量支付' }
                    ]
                }
            ]
        },
        {
            code: 'L1-CARD', name: '银行卡', children: [
                {
                    code: 'L2-CARD-01', name: '卡片交易授权', children: [
                        { code: 'L3-CARD-009', name: '消费授权' },
                        { code: 'L3-CARD-010', name: 'ATM取现' }
                    ]
                }
            ]
        },
        {
            code: 'L1-EBANK', name: '电子银行', children: [
                {
                    code: 'L2-EBANK-01', name: '电子渠道交易', children: [
                        { code: 'L3-EBANK-011', name: '网银转账' }
                    ]
                }
            ]
        },
        {
            code: 'L1-RISK', name: '风险管理', children: [
                {
                    code: 'L2-RISK-01', name: '风险事件监控', children: [
                        { code: 'L3-RISK-012', name: '反洗钱名单校验' }
                    ]
                }
            ]
        },
        { code: 'L1-LOAN', name: '对公存款', children: [] },
        { code: 'L1-OP',   name: '运营管理', children: [] }
    ];

    // L1 业务领域 -> 编码 映射（供 stats.html 等静态页面使用）
    mockData.l1CodeByName = {};
    mockData.categoryTree.forEach(function (l1) { mockData.l1CodeByName[l1.name] = l1.code; });

    /* ---------- 接口清单（list.html） ---------- */
    // 每条接口挂载 l1 / l2 / l3 分类编码与完整 path 路径；用于级联筛选与表格展示。
    (function () {
        var l1 = 'L1-CUS',  l2 = 'L2-CUS-01',  l3 = 'L3-CUS-006';
        var l1Dep = 'L1-DEP', l2DepExe = 'L2-DEP-01', l2DepOpn = 'L2-DEP-02';
        var l1Pay = 'L1-PAY', l2Pay = 'L2-PAY-01';
        var l1Card = 'L1-CARD', l2Card = 'L2-CARD-01';
        var l1Ebank = 'L1-EBANK', l2Ebank = 'L2-EBANK-01';
        var l1Risk = 'L1-RISK', l2Risk = 'L2-RISK-01';
        var row = function (obj, l1c, l2c, l3c, pathStr) {
            obj.l1 = l1c; obj.l2 = l2c; obj.l3 = l3c; obj.path = pathStr;
        };
        mockData.interfaceListFull = [
            { code: 'API-CUS-0001', name: '客户基本信息查询',       kind: 'API',  system: '核心业务系统', level: 'A', consumers: 28, status: '运行中',   changed: '2026-05-20 14:32' },
            { code: 'API-ACC-0012', name: '账户余额查询',           kind: 'API',  system: '核心业务系统', level: 'A', consumers: 35, status: '运行中',   changed: '2026-05-18 10:08' },
            { code: 'API-LOAN-0023', name: '贷款信息查询',         kind: 'API',  system: '信贷管理系统', level: 'B', consumers: 12, status: '运行中',   changed: '2026-04-28 17:45' },
            { code: 'FILE-TRX-0045', name: '日终交易流水文件',      kind: '文件', system: '核心业务系统', level: 'B', consumers: 12, status: '运行中',   changed: '2026-04-12 15:20' },
            { code: 'FILE-STMT-0056', name: '月度客户对账单文件',   kind: '文件', system: '信用卡核心',     level: 'A', consumers: 8,  status: '运行中',   changed: '2026-03-15 09:22' },
            { code: 'API-CRD-0068', name: '信用评分查询',           kind: 'API',  system: '风险管理系统', level: 'B', consumers: 15, status: '运行中',   changed: '2026-05-22 16:05' },
            { code: 'API-RISK-0078', name: '反洗钱名单校验',        kind: 'API',  system: '风控系统',     level: 'A', consumers: 22, status: '运行中',   changed: '2026-05-10 11:18' },
            { code: 'FILE-REG-0089', name: '监管报送文件',          kind: '文件', system: '监管报送平台', level: 'A', consumers: 6,  status: '异常',     changed: '2026-06-03 08:12' },
            { code: 'API-ORG-0091', name: '机构信息查询',           kind: 'API',  system: '组织架构系统', level: 'C', consumers: 18, status: '运行中',   changed: '2026-02-18 15:30' },
            { code: 'FILE-BILL-0102', name: '电子回单文件',         kind: '文件', system: '电子渠道',     level: 'B', consumers: 10, status: '运行中',   changed: '2026-05-05 09:45' },
            { code: 'API-PAY-0115', name: '支付转账接口',           kind: 'API',  system: '支付清算系统', level: 'A', consumers: 42, status: '运行中',   changed: '2026-05-30 18:22' },
            { code: 'API-CRD-0128', name: '信用卡额度调整',        kind: 'API',  system: '信用卡核心',     level: 'A', consumers: 8,  status: '待审核',   changed: '2026-06-02 11:50' },
            { code: 'FILE-ACC-0142', name: '账户开户文件',          kind: '文件', system: '核心业务系统', level: 'B', consumers: 5,  status: '运行中',   changed: '2026-01-20 13:15' },
            { code: 'FILE-TAX-0156', name: '税务申报文件',          kind: '文件', system: '财务系统',     level: 'C', consumers: 3,  status: '已停用',   changed: '2025-12-10 14:08' },
            { code: 'API-DEP-0168', name: '存款利率查询',           kind: 'API',  system: '核心业务系统', level: 'C', consumers: 10, status: '运行中',   changed: '2026-04-02 10:18' },
            // —— 新增演示数据 ——
            { code: 'API-DEP-0172', name: '存款存入登记',           kind: 'API',  system: '核心业务系统', level: 'A', consumers: 18, status: '运行中',   changed: '2026-05-28 09:10' },
            { code: 'API-DEP-0185', name: '取款交易处理',           kind: 'API',  system: '核心业务系统', level: 'A', consumers: 25, status: '运行中',   changed: '2026-05-25 14:42' },
            { code: 'FILE-DEP-0198', name: '利息结算文件',          kind: '文件', system: '核心业务系统', level: 'B', consumers: 6,  status: '运行中',   changed: '2026-03-31 22:30' },
            { code: 'API-PAY-0212', name: '大额支付报文处理',       kind: 'API',  system: '支付清算系统', level: 'A', consumers: 20, status: '运行中',   changed: '2026-06-01 08:55' },
            { code: 'API-PAY-0225', name: '小额批量支付打包',       kind: 'API',  system: '支付清算系统', level: 'B', consumers: 15, status: '运行中',   changed: '2026-05-15 16:22' },
            { code: 'FILE-PAY-0238', name: '清算差错处理文件',       kind: '文件', system: '支付清算系统', level: 'A', consumers: 5,  status: '异常',     changed: '2026-05-29 23:55' },
            { code: 'API-PAY-0245', name: '支付渠道状态查询',       kind: 'API',  system: '渠道管理平台', level: 'C', consumers: 12, status: '运行中',   changed: '2026-05-12 11:30' },
            { code: 'API-LOAN-0252', name: '贷款申请提交',          kind: 'API',  system: '信贷管理系统', level: 'B', consumers: 10, status: '待审核',   changed: '2026-06-04 09:40' },
            { code: 'API-LOAN-0265', name: '贷款发放登记',          kind: 'API',  system: '信贷管理系统', level: 'B', consumers: 8,  status: '运行中',   changed: '2026-05-20 15:25' },
            { code: 'FILE-LOAN-0278', name: '贷后预警监控文件',     kind: '文件', system: '风控系统',     level: 'A', consumers: 4,  status: '运行中',   changed: '2026-05-18 20:15' },
            { code: 'API-CUS-0285', name: '客户信息字段更新',       kind: 'API',  system: '客户信息系统', level: 'B', consumers: 20, status: '运行中',   changed: '2026-05-08 13:55' },
            { code: 'FILE-CUS-0292', name: '客户画像数据文件',       kind: '文件', system: '客户信息系统', level: 'B', consumers: 7,  status: '运行中',   changed: '2026-04-30 21:00' },
            { code: 'API-EBK-0302', name: '电子渠道交易流水查询',    kind: 'API',  system: '电子渠道',     level: 'B', consumers: 16, status: '运行中',   changed: '2026-05-11 10:20' },
            { code: 'FILE-EBK-0315', name: '渠道接入参数配置文件',    kind: '文件', system: '电子渠道',     level: 'C', consumers: 3,  status: '已停用',   changed: '2026-01-25 17:45' },
            { code: 'API-CRD-0322', name: '信用卡发卡状态查询',      kind: 'API',  system: '信用卡核心',     level: 'B', consumers: 14, status: '运行中',   changed: '2026-05-26 12:10' },
            { code: 'API-CORP-0335', name: '对公账户信息查询',       kind: 'API',  system: '对公业务系统', level: 'B', consumers: 11, status: '运行中',   changed: '2026-05-02 09:00' },
            { code: 'FILE-CORP-0348', name: '对公结算流水文件',       kind: '文件', system: '对公业务系统', level: 'A', consumers: 9,  status: '运行中',   changed: '2026-04-25 18:40' },
            { code: 'FILE-OPS-0355', name: '运营报表数据文件',       kind: '文件', system: '运营管理系统', level: 'C', consumers: 4,  status: '运行中',   changed: '2026-06-05 07:30' },
            { code: 'API-OPS-0362', name: '网点运营数据查询',       kind: 'API',  system: '运营管理系统', level: 'C', consumers: 6,  status: '运行中',   changed: '2026-05-30 14:25' },
            { code: 'API-RISK-0375', name: '风险事件监控告警',       kind: 'API',  system: '风控系统',     level: 'A', consumers: 14, status: '待审核',   changed: '2026-06-01 19:10' }
        ];
        // 前15条原有 row() 调用保持不变
        row(mockData.interfaceListFull[ 0], l1,       l2,          'L3-CUS-006',  '客户管理 / 客户信息维护 / 客户信息维护 / 基本信息查询');
        row(mockData.interfaceListFull[ 1], l1Dep,   l2DepExe,    'L3-DEP-004',  '个人存款 / 存款交易执行 / 余额查询 / 账户余额查询');
        row(mockData.interfaceListFull[ 2], l1Dep,   l2DepOpn,    'L3-DEP-002',  '个人存款 / 客户开户计划 / 开户 / 贷款信息查询');
        row(mockData.interfaceListFull[ 3], l1Pay,   l2Pay,       'L3-PAY-008',  '支付清算 / 跨行支付执行 / 小额批量支付 / 日终交易流水');
        row(mockData.interfaceListFull[ 4], l1Card,  l2Card,      'L3-CARD-009', '银行卡 / 卡片交易授权 / 消费授权 / 客户账单');
        row(mockData.interfaceListFull[ 5], l1Risk,  l2Risk,      'L3-RISK-012', '风险管理 / 风险事件监控 / 反洗钱名单校验 / 信用评分');
        row(mockData.interfaceListFull[ 6], l1Risk,  l2Risk,      'L3-RISK-012', '风险管理 / 风险事件监控 / 反洗钱名单校验 / 名单校验');
        row(mockData.interfaceListFull[ 7], 'L1-LOAN','L2-LOAN-01','L3-LOAN-020', '对公存款 / 监管报送 / 监管文件 / 监管报送');
        row(mockData.interfaceListFull[ 8], 'L1-OP', 'L2-OP-01',  'L3-OP-030',   '运营管理 / 组织架构 / 机构信息 / 机构查询');
        row(mockData.interfaceListFull[ 9], l1Ebank, l2Ebank,     'L3-EBANK-011','电子银行 / 电子渠道交易 / 网银转账 / 电子回单');
        row(mockData.interfaceListFull[10], l1Pay,   l2Pay,       'L3-PAY-007',  '支付清算 / 跨行支付执行 / 大额支付 / 支付转账');
        row(mockData.interfaceListFull[11], l1Card,  l2Card,      'L3-CARD-009', '银行卡 / 卡片交易授权 / 消费授权 / 额度调整');
        row(mockData.interfaceListFull[12], l1Dep,   l2DepOpn,    'L3-DEP-002',  '个人存款 / 客户开户计划 / 开户 / 账户开户');
        row(mockData.interfaceListFull[13], 'L1-OP', 'L2-OP-02',  'L3-OP-031',   '运营管理 / 财务结算 / 税务申报 / 税务文件');
        row(mockData.interfaceListFull[14], l1Dep,   l2DepExe,    'L3-DEP-004',  '个人存款 / 存款交易执行 / 余额查询 / 存款利率查询');
        // 新增数据 row() 调用
        row(mockData.interfaceListFull[15], l1Dep,   l2DepExe,    'L3-DEP-001',  '个人存款 / 存款交易执行 / 存款存入 / 存款登记');
        row(mockData.interfaceListFull[16], l1Dep,   l2DepExe,    'L3-DEP-002',  '个人存款 / 存款交易执行 / 取款交易 / 取款处理');
        row(mockData.interfaceListFull[17], l1Dep,   l2DepOpn,    'L3-DEP-004',  '个人存款 / 客户开户计划 / 利息结算 / 利息文件');
        row(mockData.interfaceListFull[18], l1Pay,   l2Pay,       'L3-PAY-001',  '支付清算 / 支付指令处理 / 大额支付 / 报文处理');
        row(mockData.interfaceListFull[19], l1Pay,   l2Pay,       'L3-PAY-002',  '支付清算 / 支付指令处理 / 小额批量支付 / 打包处理');
        row(mockData.interfaceListFull[20], l1Pay,   l2Pay,       'L3-PAY-004',  '支付清算 / 清算对账 / 差错处理 / 差错文件');
        row(mockData.interfaceListFull[21], l1Pay,   l2Pay,       'L3-PAY-005',  '支付清算 / 支付渠道管理 / 渠道状态 / 状态查询');
        row(mockData.interfaceListFull[22], l1Risk,  l2Risk,      'L3-LOAN-01',  '风险管理 / 贷款申请审批 / 贷款申请 / 申请提交');
        row(mockData.interfaceListFull[23], l1Risk,  l2Risk,      'L3-LOAN-03',  '风险管理 / 贷款发放 / 贷款发放 / 发放登记');
        row(mockData.interfaceListFull[24], l1Risk,  l2Risk,      'L3-LOAN-04',  '风险管理 / 贷后管理 / 贷后预警 / 预警文件');
        row(mockData.interfaceListFull[25], l1,       l2,          'L3-CUS-002',  '客户管理 / 客户信息维护 / 客户信息更新 / 字段更新');
        row(mockData.interfaceListFull[26], l1,       l2,          'L3-CUS-003',  '客户管理 / 客户画像分析 / 画像数据 / 画像文件');
        row(mockData.interfaceListFull[27], l1Ebank, l2Ebank,     'L3-EBK-01',   '电子银行 / 电子渠道交易 / 交易流水 / 流水查询');
        row(mockData.interfaceListFull[28], l1Ebank, l2Ebank,     'L3-EBK-02',   '电子银行 / 渠道服务接入 / 接入参数 / 参数配置');
        row(mockData.interfaceListFull[29], l1Card,  l2Card,      'L3-CRD-01',   '银行卡 / 发卡管理 / 发卡状态 / 状态查询');
        row(mockData.interfaceListFull[30], 'L1-LOAN','L2-LOAN-02','L3-COR-01',   '对公存款 / 对公账户管理 / 账户查询 / 账户信息');
        row(mockData.interfaceListFull[31], 'L1-LOAN','L2-LOAN-02','L3-COR-02',   '对公存款 / 对公结算服务 / 结算流水 / 结算文件');
        row(mockData.interfaceListFull[32], 'L1-OP', 'L2-OP-02',  'L3-OPS-01',   '运营管理 / 运营风险监控 / 运营报表 / 报表文件');
        row(mockData.interfaceListFull[33], 'L1-OP', 'L2-OP-01',  'L3-OPS-01',   '运营管理 / 网点运营支持 / 网点数据 / 数据查询');
        row(mockData.interfaceListFull[34], l1Risk,  l2Risk,      'L3-LOAN-04',  '风险管理 / 风险事件监控 / 风险告警 / 告警查询');
    })();

    /* ---------- API 详情（api-detail.html） ---------- */
    mockData.apiDetail = {
        reqFields: [
            { name: 'custId',   type: 'String',    len: 20,  req: '是', dict: 'CUST_ID / 客户编号',      desc: '查询目标客户的客户编号' },
            { name: 'accNo',    type: 'String',    len: 32,  req: '否', dict: 'ACC_NO / 账号',           desc: '可选账号过滤，不传则返回全部账户' },
            { name: 'channel',  type: 'String',    len: 10,  req: '是', dict: 'CHANNEL / 渠道代码',      desc: '调用方渠道代码，用于控制与审计' },
            { name: 'reqTime',  type: 'DateTime',  len: 19,  req: '是', dict: '-',                        desc: '请求发起时间 yyyy-MM-dd HH:mm:ss' },
            { name: 'sign',     type: 'String',    len: 64,  req: '是', dict: '-',                        desc: '请求签名（SHA256）' }
        ],
        respFields: [
            { name: 'custId',     type: 'String',  len: 20,   req: '是', dict: 'CUST_ID / 客户编号',    desc: '客户编号' },
            { name: 'custName',   type: 'String',  len: 100,  req: '是', dict: 'CUST_NAME / 客户名称',  desc: '客户姓名（脱敏显示）' },
            { name: 'idType',     type: 'String',  len: 2,    req: '是', dict: 'ID_TYPE / 证件类型',    desc: '证件类型代码' },
            { name: 'idNo',       type: 'String',  len: 20,   req: '是', dict: 'ID_NO / 证件号码',      desc: '证件号码（脱敏显示）' },
            { name: 'gender',     type: 'String',  len: 1,    req: '是', dict: 'GENDER / 性别',         desc: 'M/F' },
            { name: 'birthDate',  type: 'Date',    len: 10,   req: '是', dict: 'BIRTH_DATE / 出生日期', desc: 'yyyy-MM-dd' },
            { name: 'orgCode',    type: 'String',  len: 8,    req: '是', dict: 'ORG_CODE / 机构代码',   desc: '开户机构代码' },
            { name: 'regDate',    type: 'Date',    len: 10,   req: '是', dict: '-',                      desc: '客户注册日期' },
            { name: 'respCode',   type: 'String',  len: 6,    req: '是', dict: '-',                      desc: '响应码（0000 成功）' },
            { name: 'respMsg',    type: 'String',  len: 200,  req: '否', dict: '-',                      desc: '响应描述' }
        ],
        consumers: [
            { system: '信贷管理系统',   owner: '李经理', calls: '3,268',  time: '每日 09:00~18:00', status: '运行中' },
            { system: '风险管理系统',   owner: '王主管', calls: '12,580', time: '实时',              status: '运行中' },
            { system: '客户关系管理',   owner: '赵运营', calls: '2,180',  time: '每日 10:00~20:00', status: '运行中' },
            { system: '信用卡核心',     owner: '张产品', calls: '5,620',  time: '实时',              status: '运行中' },
            { system: '反洗钱系统',     owner: '孙合规', calls: '868',    time: '批量查询',          status: '运行中' },
            { system: '会计总账系统',   owner: '周财务', calls: '1,250',  time: '每日 23:00',        status: '运行中' }
        ],
        versions: [
            { ver: 'v2.3', desc: '新增证件类型字段、响应字段脱敏',                      owner: '张经理', time: '2025-10-15 09:00', cur: '是', status: '运行中' },
            { ver: 'v2.2', desc: '增加渠道代码参数、优化查询性能（TP99 230ms→180ms）', owner: '张经理', time: '2025-06-10 09:00', cur: '否', status: '已下线' },
            { ver: 'v2.1', desc: '新增客户画像扩展字段',                               owner: '李主管', time: '2025-03-22 10:00', cur: '否', status: '已下线' },
            { ver: 'v2.0', desc: 'RESTful 化重构，替代旧 SOAP 接口',                   owner: '李主管', time: '2024-11-08 09:00', cur: '否', status: '已下线' },
            { ver: 'v1.0', desc: '首个正式版本',                                       owner: '王总监', time: '2023-05-18 09:00', cur: '否', status: '已下线' }
        ],
        audits: [
            { time: '2025-10-15 09:00', title: 'v2.3 版本上线审核',      desc: '新增证件类型字段、响应字段脱敏、性能优化；通过安全合规与架构评审。', user: '李经理 / 架构评审组', role: '审核人', status: '通过' },
            { time: '2025-09-28 14:22', title: '接口分级确认（A 级核心）', desc: '经治理委员会确认，该接口影响客户核心数据，保持 A 级。',            user: '治理委员会', role: '评审组', status: '通过' },
            { time: '2025-06-10 09:00', title: 'v2.2 版本变更审核',      desc: '增加渠道代码参数、优化查询性能；通过业务线与合规联合审核。',        user: '张经理', role: '审核人', status: '通过' },
            { time: '2025-03-22 10:00', title: 'v2.1 新增字段审核',      desc: '客户画像字段新增，字段均引用标准数据字典，数据分类为敏感数据。',      user: '王主管', role: '审核人', status: '通过' }
        ]
    };

    /* ---------- 文件服务详情（file-detail.html） ---------- */
    mockData.fileDetail = {
        structure: [
            { name: 'TRX_NO',      type: 'VARCHAR', len: 32,    order: 1,  req: '是', desc: '交易流水号',               dict: 'TRX_NO' },
            { name: 'TRX_DATE',    type: 'DATE',    len: 10,    order: 2,  req: '是', desc: '交易日期 yyyy-MM-dd',       dict: 'TRX_DATE' },
            { name: 'TRX_TIME',    type: 'TIME',    len: 8,     order: 3,  req: '是', desc: '交易时间 HH:mm:ss',         dict: 'TRX_TIME' },
            { name: 'ACC_NO_DR',   type: 'VARCHAR', len: 32,    order: 4,  req: '是', desc: '借方账号',                   dict: 'ACC_NO' },
            { name: 'ACC_NO_CR',   type: 'VARCHAR', len: 32,    order: 5,  req: '是', desc: '贷方账号',                   dict: 'ACC_NO' },
            { name: 'CUST_ID',     type: 'VARCHAR', len: 20,    order: 6,  req: '是', desc: '客户编号',                   dict: 'CUST_ID' },
            { name: 'CCY',         type: 'CHAR',    len: 3,     order: 7,  req: '是', desc: '币种代码',                   dict: 'CCY_CODE' },
            { name: 'AMOUNT',      type: 'DECIMAL', len: '18,2', order: 8, req: '是', desc: '交易金额',                   dict: 'AMOUNT' },
            { name: 'BIZ_TYPE',    type: 'CHAR',    len: 2,     order: 9,  req: '是', desc: '业务类型',                   dict: 'BIZ_TYPE' },
            { name: 'CHANNEL',     type: 'VARCHAR', len: 10,    order: 10, req: '是', desc: '渠道代码',                   dict: 'CHANNEL' },
            { name: 'ORG_CODE',    type: 'VARCHAR', len: 8,     order: 11, req: '是', desc: '机构代码',                   dict: 'ORG_CODE' },
            { name: 'TRX_STATUS',  type: 'CHAR',    len: 1,     order: 12, req: '是', desc: '交易状态 0-成功 1-失败',      dict: 'TRX_STATUS' },
            { name: 'REMARK',      type: 'VARCHAR', len: 200,   order: 13, req: '否', desc: '备注',                       dict: '-' },
            { name: 'OPERATOR',    type: 'VARCHAR', len: 20,    order: 14, req: '否', desc: '操作员',                     dict: '-' },
            { name: 'REC_TIME',    type: 'DATETIME',len: 19,    order: 15, req: '是', desc: '记录时间 yyyy-MM-dd HH:mm:ss', dict: '-' }
        ],
        transfers: [
            { time: '2026-06-04 02:00:12', name: 'TRX_DAILY_20260604_01.csv.gz', size: '286.4 MB', rows: '1,286,420', status: '成功', cost: '7m 42s' },
            { time: '2026-06-03 02:00:08', name: 'TRX_DAILY_20260603_01.csv.gz', size: '292.8 MB', rows: '1,312,586', status: '成功', cost: '8m 10s' },
            { time: '2026-06-02 02:00:15', name: 'TRX_DAILY_20260602_01.csv.gz', size: '275.2 MB', rows: '1,238,942', status: '成功', cost: '7m 28s' },
            { time: '2026-06-01 02:00:22', name: 'TRX_DAILY_20260601_01.csv.gz', size: '258.6 MB', rows: '1,162,180', status: '成功', cost: '6m 58s' },
            { time: '2026-05-31 02:05:48', name: 'TRX_DAILY_20260531_01.csv.gz', size: '302.4 MB', rows: '1,358,820', status: '失败', cost: '12m 36s（自动重试）' },
            { time: '2026-05-30 02:00:11', name: 'TRX_DAILY_20260530_01.csv.gz', size: '288.2 MB', rows: '1,294,320', status: '成功', cost: '7m 50s' },
            { time: '2026-05-29 02:00:19', name: 'TRX_DAILY_20260529_01.csv.gz', size: '281.0 MB', rows: '1,262,480', status: '成功', cost: '7m 35s' },
            { time: '2026-05-28 02:00:14', name: 'TRX_DAILY_20260528_01.csv.gz', size: '279.8 MB', rows: '1,258,962', status: '成功', cost: '7m 30s' }
        ],
        audits: [
            { time: '2025-08-20 09:00', title: 'v1.8 版本上线',        desc: '新增 CHANNEL / ORG_CODE 字段；统一编码 UTF-8；完善 MD5 校验与 PGP 加密。', user: '赵主管', role: '提供方负责人', status: '通过' },
            { time: '2025-07-10 14:30', title: '传输协议升级审核',     desc: '由旧 FTP 切换为 SFTP + 共享目录双模式，通过安全合规评审。',                 user: '安全合规组', role: '审核人', status: '通过' },
            { time: '2025-04-12 15:20', title: '文件命名规范审核',     desc: '采用新命名规则 TRX_DAILY_{YYYYMMDD}_{SEQ}.csv.gz，符合全行文件规范。',        user: '数据治理组', role: '审核人', status: '通过' },
            { time: '2026-04-01 10:00', title: 'SLA 98.5% 达标确认',   desc: '近 3 个月传输成功率均达 98.5% 以上，满足 SLA 承诺，无需变更。',                user: '运维组', role: '监控人', status: '通过' }
        ]
    };

    /* ---------- 文件服务总览（file-overview.html） ---------- */
    mockData.fileOverview = {
        systems: [
            { name: '核心业务系统', count: 286, today: 1286, err: 2, sla: 99.6 },
            { name: '信贷管理系统', count: 168, today: 586,  err: 0, sla: 99.2 },
            { name: '风险管理系统', count: 128, today: 428,  err: 1, sla: 98.8 },
            { name: '会计总账系统', count: 96,  today: 358,  err: 0, sla: 99.8 },
            { name: '信用卡核心',   count: 152, today: 486,  err: 1, sla: 98.5 },
            { name: '电子渠道',     count: 108, today: 382,  err: 2, sla: 97.8 },
            { name: '监管报送平台', count: 86,  today: 148,  err: 1, sla: 96.2 },
            { name: '客户关系管理', count: 68,  today: 82,   err: 0, sla: 99.5 },
            { name: '组织架构系统', count: 42,  today: 58,   err: 0, sla: 100.0 },
            { name: '支付清算系统', count: 122, today: 48,   err: 1, sla: 98.2 }
        ],
        formats: [
            { name: 'CSV',   count: 528, pct: 42 },
            { name: 'TXT',   count: 327, pct: 26 },
            { name: 'Excel', count: 176, pct: 14 },
            { name: 'XML',   count: 125, pct: 10 },
            { name: '其他',  count: 100, pct: 8  }
        ],
        protocols: [
            { name: 'SFTP',      count: 2394, pct: 62 },
            { name: '共享目录',  count: 1002, pct: 26 },
            { name: '其他',      count: 466,  pct: 12 }
        ]
    };

    /* ---------- 五级建模分类体系 ---------- */
    // L1 业务领域 / L2 价值流（plan/do/check/act 三段式） / L3 业务活动 / L4 任务 / 接口映射
    mockData.classification = {
        // L1 业务领域
        l1: [
            { code: 'L1-DEP',  name: '个人存款',  desc: '覆盖个人储蓄、活期、定期存款相关业务' },
            { code: 'L1-CORP', name: '对公存款',  desc: '企业客户存款、对公账户管理相关业务' },
            { code: 'L1-PAY',  name: '支付清算',  desc: '跨行支付、清算结算、大额小额支付系统' },
            { code: 'L1-CARD', name: '银行卡',    desc: '借记卡、信用卡发卡与用卡全生命周期管理' },
            { code: 'L1-EBANK',name: '电子银行',  desc: '网上银行、手机银行、微信银行等电子渠道' },
            { code: 'L1-RISK', name: '风险管理',  desc: '信用风险、市场风险、操作风险及反洗钱' },
            { code: 'L1-CUS',  name: '客户管理',  desc: '客户信息、客户画像、客户关系维护' },
            { code: 'L1-OPS',  name: '运营管理',  desc: '内部运营流程、网点运营、后勤支持' }
        ],
        // L2 价值流
        l2: [
            { code: 'L2-DEP-01', parent: 'L1-DEP',   name: '账户开立',       stage: '计划/Plan' },
            { code: 'L2-DEP-02', parent: 'L1-DEP',   name: '存款交易执行',    stage: '执行/Do' },
            { code: 'L2-DEP-03', parent: 'L1-DEP',   name: '账户余额管理',    stage: '检查/Check' },
            { code: 'L2-DEP-04', parent: 'L1-DEP',   name: '存款产品营销',    stage: '优化/Act' },
            { code: 'L2-PAY-01', parent: 'L1-PAY',   name: '支付指令处理',    stage: '执行/Do' },
            { code: 'L2-PAY-02', parent: 'L1-PAY',   name: '清算对账',       stage: '检查/Check' },
            { code: 'L2-PAY-03', parent: 'L1-PAY',   name: '支付渠道管理',    stage: '优化/Act' },
            { code: 'L2-LOAN-01',parent: 'L1-RISK',  name: '贷款申请审批',    stage: '计划/Plan' },
            { code: 'L2-LOAN-02',parent: 'L1-RISK',  name: '贷款发放',       stage: '执行/Do' },
            { code: 'L2-LOAN-03',parent: 'L1-RISK',  name: '贷后管理',       stage: '检查/Check' },
            { code: 'L2-CUS-01', parent: 'L1-CUS',   name: '客户信息维护',    stage: '执行/Do' },
            { code: 'L2-CUS-02', parent: 'L1-CUS',   name: '客户画像分析',    stage: '检查/Check' },
            { code: 'L2-EBK-01', parent: 'L1-EBANK', name: '渠道服务接入',    stage: '计划/Plan' },
            { code: 'L2-EBK-02', parent: 'L1-EBANK', name: '电子渠道交易',    stage: '执行/Do' },
            { code: 'L2-CRD-01', parent: 'L1-CARD',  name: '发卡管理',       stage: '计划/Plan' },
            { code: 'L2-CRD-02', parent: 'L1-CARD',  name: '卡片交易与授权',  stage: '执行/Do' },
            { code: 'L2-COR-01', parent: 'L1-CORP',  name: '对公账户管理',    stage: '执行/Do' },
            { code: 'L2-COR-02', parent: 'L1-CORP',  name: '对公结算服务',    stage: '优化/Act' },
            { code: 'L2-OPS-01', parent: 'L1-OPS',   name: '网点运营支持',    stage: '执行/Do' },
            { code: 'L2-OPS-02', parent: 'L1-OPS',   name: '运营风险监控',    stage: '检查/Check' }
        ],
        // L3 业务活动
        l3: [
            { code: 'L3-DEP-001', parent: 'L2-DEP-02', name: '存款存入',    level: 'B' },
            { code: 'L3-DEP-002', parent: 'L2-DEP-02', name: '取款交易',    level: 'A' },
            { code: 'L3-DEP-003', parent: 'L2-DEP-02', name: '转账汇出',    level: 'A' },
            { code: 'L3-DEP-004', parent: 'L2-DEP-02', name: '利息结算',    level: 'B' },
            { code: 'L3-DEP-005', parent: 'L2-DEP-03', name: '余额查询',    level: 'B' },
            { code: 'L3-DEP-006', parent: 'L2-DEP-01', name: '开户办理',    level: 'B' },
            { code: 'L3-PAY-001', parent: 'L2-PAY-01', name: '大额支付',    level: 'A' },
            { code: 'L3-PAY-002', parent: 'L2-PAY-01', name: '小额批量支付', level: 'B' },
            { code: 'L3-PAY-003', parent: 'L2-PAY-02', name: '日终清算对账', level: 'A' },
            { code: 'L3-PAY-004', parent: 'L2-PAY-02', name: '差错处理',    level: 'B' },
            { code: 'L3-PAY-005', parent: 'L2-PAY-03', name: '支付渠道维护', level: 'C' },
            { code: 'L3-LOAN-01', parent: 'L2-LOAN-01',name: '贷款申请提交', level: 'B' },
            { code: 'L3-LOAN-02', parent: 'L2-LOAN-01',name: '信用评分查询', level: 'A' },
            { code: 'L3-LOAN-03', parent: 'L2-LOAN-02',name: '贷款发放登记', level: 'B' },
            { code: 'L3-LOAN-04', parent: 'L2-LOAN-03',name: '贷后预警',    level: 'A' },
            { code: 'L3-LOAN-05', parent: 'L2-LOAN-01',name: '反洗钱名单校验', level: 'A' },
            { code: 'L3-CUS-01',  parent: 'L2-CUS-01', name: '客户基本信息查询', level: 'A' },
            { code: 'L3-CUS-02',  parent: 'L2-CUS-01', name: '客户信息更新', level: 'B' },
            { code: 'L3-CUS-03',  parent: 'L2-CUS-02', name: '客户画像分析', level: 'B' },
            { code: 'L3-CUS-04',  parent: 'L2-CUS-01', name: '机构信息查询', level: 'C' },
            { code: 'L3-EBK-01',  parent: 'L2-EBK-02', name: '电子渠道交易流水', level: 'B' },
            { code: 'L3-EBK-02',  parent: 'L2-EBK-01', name: '渠道接入配置', level: 'C' },
            { code: 'L3-CRD-01',  parent: 'L2-CRD-01', name: '信用卡额度调整', level: 'A' },
            { code: 'L3-CRD-02',  parent: 'L2-CRD-02', name: '电子回单生成', level: 'B' },
            { code: 'L3-COR-01',  parent: 'L2-COR-01', name: '对公账户查询', level: 'B' },
            { code: 'L3-COR-02',  parent: 'L2-COR-02', name: '监管报送',    level: 'A' },
            { code: 'L3-OPS-01',  parent: 'L2-OPS-02', name: '运营数据报表', level: 'C' }
        ],
        // L4 任务 - 接口挂载的最小业务单元
        l4: [
            { code: 'L4-DEP-0101', parent: 'L3-DEP-005', name: '账户余额查询' },
            { code: 'L4-DEP-0102', parent: 'L3-DEP-001', name: '存款存入登记' },
            { code: 'L4-DEP-0103', parent: 'L3-DEP-002', name: '取款交易处理' },
            { code: 'L4-DEP-0104', parent: 'L3-DEP-004', name: '利息计算与结算' },
            { code: 'L4-DEP-0105', parent: 'L3-DEP-003', name: '转账指令发起' },
            { code: 'L4-DEP-0106', parent: 'L3-DEP-006', name: '账户开立登记' },
            { code: 'L4-PAY-0101', parent: 'L3-PAY-001', name: '大额支付报文处理' },
            { code: 'L4-PAY-0102', parent: 'L3-PAY-002', name: '小额批量支付打包' },
            { code: 'L4-PAY-0103', parent: 'L3-PAY-003', name: '日终交易流水文件' },
            { code: 'L4-PAY-0104', parent: 'L3-PAY-004', name: '清算差错处理' },
            { code: 'L4-PAY-0105', parent: 'L3-PAY-005', name: '支付渠道状态维护' },
            { code: 'L4-LOAN-0101',parent: 'L3-LOAN-02', name: '信用评分查询' },
            { code: 'L4-LOAN-0102',parent: 'L3-LOAN-05', name: '反洗钱名单校验' },
            { code: 'L4-LOAN-0103',parent: 'L3-LOAN-01', name: '贷款申请提交' },
            { code: 'L4-LOAN-0104',parent: 'L3-LOAN-03', name: '贷款发放登记' },
            { code: 'L4-LOAN-0105',parent: 'L3-LOAN-04', name: '贷后预警监控' },
            { code: 'L4-CUS-0101', parent: 'L3-CUS-01',  name: '客户基本信息查询' },
            { code: 'L4-CUS-0102', parent: 'L3-CUS-02',  name: '客户信息字段更新' },
            { code: 'L4-CUS-0103', parent: 'L3-CUS-03',  name: '客户画像数据生成' },
            { code: 'L4-CUS-0104', parent: 'L3-CUS-04',  name: '机构信息查询' },
            { code: 'L4-EBK-0101', parent: 'L3-EBK-01',  name: '电子渠道交易流水' },
            { code: 'L4-EBK-0102', parent: 'L3-EBK-02',  name: '渠道接入参数配置' },
            { code: 'L4-CRD-0101', parent: 'L3-CRD-01',  name: '信用卡额度调整' },
            { code: 'L4-CRD-0102', parent: 'L3-CRD-02',  name: '电子回单文件生成' },
            { code: 'L4-COR-0101', parent: 'L3-COR-01',  name: '对公账户信息查询' },
            { code: 'L4-COR-0102', parent: 'L3-COR-02',  name: '监管报送文件' },
            { code: 'L4-OPS-0101', parent: 'L3-OPS-01',  name: '运营报表生成' }
        ],
        // 接口与 L4 任务的映射关系（key: l4Code, value: 接口 code 数组）
        interfaceMapping: {
            'L4-DEP-0101': ['API-CUS-0001', 'API-ACC-0012'],
            'L4-DEP-0102': ['API-DEP-0168', 'API-DEP-0172'],
            'L4-DEP-0103': ['API-DEP-0185'],
            'L4-DEP-0104': ['FILE-ACC-0142', 'FILE-DEP-0198'],
            'L4-DEP-0105': ['API-PAY-0115'],
            'L4-DEP-0106': ['API-CUS-0001'],
            'L4-PAY-0101': ['API-PAY-0115', 'API-PAY-0212'],
            'L4-PAY-0102': ['API-PAY-0225'],
            'L4-PAY-0103': ['FILE-TRX-0045'],
            'L4-PAY-0104': ['FILE-PAY-0238'],
            'L4-PAY-0105': ['API-ORG-0091', 'API-PAY-0245'],
            'L4-LOAN-0101': ['API-CRD-0068'],
            'L4-LOAN-0102': ['API-RISK-0078'],
            'L4-LOAN-0103': ['API-LOAN-0023', 'API-LOAN-0252'],
            'L4-LOAN-0104': ['API-LOAN-0265'],
            'L4-LOAN-0105': ['API-RISK-0078', 'FILE-LOAN-0278', 'API-RISK-0375'],
            'L4-CUS-0101': ['API-CUS-0001'],
            'L4-CUS-0102': ['API-CUS-0285'],
            'L4-CUS-0103': ['FILE-CUS-0292'],
            'L4-CUS-0104': ['API-ORG-0091'],
            'L4-EBK-0101': ['FILE-TRX-0045', 'API-EBK-0302'],
            'L4-EBK-0102': ['API-ORG-0091', 'FILE-EBK-0315'],
            'L4-CRD-0101': ['API-CRD-0128', 'API-CRD-0322'],
            'L4-CRD-0102': ['FILE-BILL-0102'],
            'L4-COR-0101': ['API-ACC-0012', 'API-CORP-0335'],
            'L4-COR-0102': ['FILE-REG-0089', 'FILE-CORP-0348'],
            'L4-OPS-0101': ['FILE-TRX-0045', 'FILE-OPS-0355', 'API-OPS-0362']
        }
    };

    // 给 interfaceListFull 补充五级分类字段
    // 让每个接口都带上 l1Code/l2Code/l3Code/l4Code 及完整路径
    (function () {
        var mapping = {
            'API-CUS-0001':   { l1: 'L1-CUS',   l2: 'L2-CUS-01',  l3: 'L3-CUS-01',  l4: 'L4-CUS-0101' },
            'API-ACC-0012':   { l1: 'L1-DEP',   l2: 'L2-DEP-03',  l3: 'L3-DEP-005', l4: 'L4-DEP-0101' },
            'API-LOAN-0023':  { l1: 'L1-RISK',  l2: 'L2-LOAN-02', l3: 'L3-LOAN-03', l4: 'L4-LOAN-0104' },
            'FILE-TRX-0045':  { l1: 'L1-PAY',   l2: 'L2-PAY-02',  l3: 'L3-PAY-003', l4: 'L4-PAY-0103' },
            'FILE-STMT-0056': { l1: 'L1-CARD',  l2: 'L2-CRD-02',  l3: 'L3-CRD-02',  l4: 'L4-CRD-0102' },
            'API-CRD-0068':   { l1: 'L1-RISK',  l2: 'L2-LOAN-01', l3: 'L3-LOAN-02', l4: 'L4-LOAN-0101' },
            'API-RISK-0078':  { l1: 'L1-RISK',  l2: 'L2-LOAN-01', l3: 'L3-LOAN-05', l4: 'L4-LOAN-0102' },
            'FILE-REG-0089':  { l1: 'L1-CORP',  l2: 'L2-COR-02',  l3: 'L3-COR-02',  l4: 'L4-COR-0102' },
            'API-ORG-0091':   { l1: 'L1-CUS',   l2: 'L2-CUS-01',  l3: 'L3-CUS-04',  l4: 'L4-CUS-0104' },
            'FILE-BILL-0102': { l1: 'L1-CARD',  l2: 'L2-CRD-02',  l3: 'L3-CRD-02',  l4: 'L4-CRD-0102' },
            'API-PAY-0115':   { l1: 'L1-PAY',   l2: 'L2-PAY-01',  l3: 'L3-PAY-001', l4: 'L4-PAY-0105' },
            'API-CRD-0128':   { l1: 'L1-CARD',  l2: 'L2-CRD-01',  l3: 'L3-CRD-01',  l4: 'L4-CRD-0101' },
            'FILE-ACC-0142':  { l1: 'L1-DEP',   l2: 'L2-DEP-02',  l3: 'L3-DEP-004', l4: 'L4-DEP-0104' },
            'FILE-TAX-0156':  { l1: 'L1-OPS',   l2: 'L2-OPS-01',  l3: 'L3-OPS-01',  l4: 'L4-OPS-0101' },
            'API-DEP-0168':   { l1: 'L1-DEP',   l2: 'L2-DEP-02',  l3: 'L3-DEP-002', l4: 'L4-DEP-0102' },
            // —— 新增接口映射 ——
            'API-DEP-0172':   { l1: 'L1-DEP',   l2: 'L2-DEP-01',  l3: 'L3-DEP-001', l4: 'L4-DEP-0102' },
            'API-DEP-0185':   { l1: 'L1-DEP',   l2: 'L2-DEP-01',  l3: 'L3-DEP-002', l4: 'L4-DEP-0103' },
            'FILE-DEP-0198':  { l1: 'L1-DEP',   l2: 'L2-DEP-02',  l3: 'L3-DEP-004', l4: 'L4-DEP-0104' },
            'API-PAY-0212':   { l1: 'L1-PAY',   l2: 'L2-PAY-01',  l3: 'L3-PAY-001', l4: 'L4-PAY-0101' },
            'API-PAY-0225':   { l1: 'L1-PAY',   l2: 'L2-PAY-01',  l3: 'L3-PAY-002', l4: 'L4-PAY-0102' },
            'FILE-PAY-0238':  { l1: 'L1-PAY',   l2: 'L2-PAY-02',  l3: 'L3-PAY-004', l4: 'L4-PAY-0104' },
            'API-PAY-0245':   { l1: 'L1-PAY',   l2: 'L2-PAY-03',  l3: 'L3-PAY-005', l4: 'L4-PAY-0105' },
            'API-LOAN-0252':  { l1: 'L1-RISK',  l2: 'L2-LOAN-01', l3: 'L3-LOAN-01', l4: 'L4-LOAN-0103' },
            'API-LOAN-0265':  { l1: 'L1-RISK',  l2: 'L2-LOAN-02', l3: 'L3-LOAN-03', l4: 'L4-LOAN-0104' },
            'FILE-LOAN-0278': { l1: 'L1-RISK',  l2: 'L2-LOAN-03', l3: 'L3-LOAN-04', l4: 'L4-LOAN-0105' },
            'API-CUS-0285':   { l1: 'L1-CUS',   l2: 'L2-CUS-01',  l3: 'L3-CUS-02',  l4: 'L4-CUS-0102' },
            'FILE-CUS-0292':  { l1: 'L1-CUS',   l2: 'L2-CUS-02',  l3: 'L3-CUS-03',  l4: 'L4-CUS-0103' },
            'API-EBK-0302':   { l1: 'L1-EBANK', l2: 'L2-EBK-02',  l3: 'L3-EBK-01',  l4: 'L4-EBK-0101' },
            'FILE-EBK-0315':  { l1: 'L1-EBANK', l2: 'L2-EBK-01',  l3: 'L3-EBK-02',  l4: 'L4-EBK-0102' },
            'API-CRD-0322':   { l1: 'L1-CARD',  l2: 'L2-CRD-01',  l3: 'L3-CRD-01',  l4: 'L4-CRD-0101' },
            'API-CORP-0335':  { l1: 'L1-CORP',  l2: 'L2-COR-01',  l3: 'L3-COR-01',  l4: 'L4-COR-0101' },
            'FILE-CORP-0348': { l1: 'L1-CORP',  l2: 'L2-COR-02',  l3: 'L3-COR-02',  l4: 'L4-COR-0102' },
            'FILE-OPS-0355':  { l1: 'L1-OPS',   l2: 'L2-OPS-02',  l3: 'L3-OPS-01',  l4: 'L4-OPS-0101' },
            'API-OPS-0362':   { l1: 'L1-OPS',   l2: 'L2-OPS-01',  l3: 'L3-OPS-01',  l4: 'L4-OPS-0101' },
            'API-RISK-0375':  { l1: 'L1-RISK',  l2: 'L2-LOAN-01', l3: 'L3-LOAN-04', l4: 'L4-LOAN-0105' }
        };
        var names = {};
        mockData.classification.l1.forEach(function (x) { names[x.code] = x.name; });
        mockData.classification.l2.forEach(function (x) { names[x.code] = x.name; });
        mockData.classification.l3.forEach(function (x) { names[x.code] = x.name; });
        mockData.classification.l4.forEach(function (x) { names[x.code] = x.name; });
        mockData.classification._names = names;

        // 给每个接口补充分类字段
        mockData.interfaceListFull.forEach(function (item) {
            var m = mapping[item.code];
            if (m) {
                item.l1Code = m.l1;
                item.l2Code = m.l2;
                item.l3Code = m.l3;
                item.l4Code = m.l4;
                item.l1Name = names[m.l1];
                item.l2Name = names[m.l2];
                item.l3Name = names[m.l3];
                item.l4Name = names[m.l4];
                item.path = names[m.l1] + ' / ' + names[m.l2] + ' / ' + names[m.l3] + ' / ' + names[m.l4];
            } else {
                item.l1Name = '未分类';
                item.l2Name = '';
                item.l3Name = '';
                item.l4Name = '';
                item.path = '未分类';
            }
        });
    })();

    global.GovernanceMockData = mockData;

})(window);
