/* Generic B2B Outreach Message Generator */
(function() {
  'use strict';

  // --- Role detection ---
  function detectRole(title) {
    const t = (title || '').toLowerCase();
    if (/procurement|purchas|buyer|sourc|supply chain|vendor/.test(t)) return 'procurement';
    if (/production|manufactur|plant|operat|factory|workshop/.test(t)) return 'production';
    if (/r&d|research|development|formulation|technical|scientist|engineer/.test(t)) return 'rnd';
    if (/qa|quality|qc|compliance|regulatory|audit/.test(t)) return 'qa';
    if (/ceo|managing director|president|director|vp|vice president|founder|owner/.test(t)) return 'ceo';
    if (/sales|market|business development/.test(t)) return 'sales';
    return 'general';
  }

  // --- Industry detection ---
  function detectIndustry(industry) {
    const i = (industry || '').toLowerCase();
    if (/cosmetic|personal care|beauty|skincare|makeup/.test(i)) return 'cosmetics';
    if (/pharma|medical|drug|healthcare|medicine/.test(i)) return 'pharmaceutical';
    if (/food|beverage|drink|confectionery|snack|dairy|baked/.test(i)) return 'food';
    if (/industrial|chemical|paint|coating|lubricant|detergent/.test(i)) return 'industrial';
    return 'general';
  }

  // --- Role profiles ---
  const ROLE_PROFILES = {
    procurement: {
      titleZh: '采购经理',
      focus: '供应稳定性、价格竞争力、交货周期、供应商服务',
      cares: '稳定供应、有竞争力的价格、质量一致性、灵活付款条款、长期合作',
      challenges: '供应商断供风险、价格波动、交货延迟、质量不达标、供应商沟通效率低',
      messageFocus: 'stable supply, competitive pricing, flexible packaging, reliable lead times',
      cta: 'share a quotation or arrange a sample shipment for evaluation',
      tone: 'direct, efficiency-focused, partnership-oriented'
    },
    production: {
      titleZh: '生产主管',
      focus: '生产稳定性、质量一致性、包装适配性、技术支持',
      cares: '稳定生产、批次一致性、合适的包装规格、现场技术支持、及时交付',
      challenges: '原料批次差异导致产线调整、供应不稳定影响排产、包装不匹配仓储条件、质量投诉',
      messageFocus: 'consistent specification, stable supply, flexible packaging, technical support',
      cta: 'share a spec sheet or discuss packaging and delivery options',
      tone: 'practical, operational, reliability-focused'
    },
    rnd: {
      titleZh: '研发经理',
      focus: '产品性能、规格参数、应用场景、认证证书',
      cares: '产品规格一致性、应用性能、国际认证、可追溯性、创新潜力',
      challenges: '供应商规格波动影响配方稳定性、新原料验证周期长、证书不全影响合规、样品质量与批量不一致',
      messageFocus: 'specification consistency, certified grade, application support, full certificates',
      cta: 'share a spec sheet, COA, or arrange a sample for formulation testing',
      tone: 'technical, curious, innovation-oriented'
    },
    qa: {
      titleZh: '质量经理',
      focus: 'COA完整性、质量合规、可追溯性、审计支持',
      cares: '完整的COA、质量合规、可追溯性、供应商审计、变更控制',
      challenges: '供应商COA不完整、质量波动、缺乏溯源文件、审计时不配合、变更通知不及时',
      messageFocus: 'complete COA, full traceability, international compliance, audit readiness',
      cta: 'share our COA, quality certificates, and traceability documentation',
      tone: 'precise, compliance-focused, detail-oriented'
    },
    ceo: {
      titleZh: '总经理/CEO',
      focus: '商业合作、长期战略、竞争优势、供应链安全',
      cares: '长期合作伙伴关系、供应链安全、竞争优势、成本优化、企业社会责任',
      challenges: '供应商依赖风险、成本上升、供应链中断、缺乏战略合作伙伴',
      messageFocus: 'strategic partnership, long-term cooperation, supply security, competitive advantage',
      cta: 'explore a strategic partnership and discuss long-term supply arrangements',
      tone: 'strategic, respectful, big-picture'
    },
    sales: {
      titleZh: '销售/业务经理',
      focus: '客户需求、产品差异化、市场趋势',
      cares: '产品差异化优势、稳定供应支持销售承诺、价格竞争力、技术支持',
      challenges: '无法满足客户对原料溯源要求、供应不稳定影响客户交付、缺乏差异化卖点',
      messageFocus: 'product differentiation, stable supply, technical support, competitive positioning',
      cta: 'discuss how our product can support your customer value proposition',
      tone: 'collaborative, market-oriented'
    },
    general: {
      titleZh: '管理人员',
      focus: '综合运营效率、供应商可靠性、成本控制',
      cares: '稳定供应、合理价格、质量达标、服务响应',
      challenges: '供应商管理复杂、成本压力、质量风险',
      messageFocus: 'stable supply, quality assurance, competitive pricing, responsive service',
      cta: 'share more details about our products and discuss potential cooperation',
      tone: 'professional, balanced'
    }
  };

  // --- Industry profiles ---
  const INDUSTRY_PROFILES = {
    cosmetics: {
      nameZh: '化妆品/个护',
      application: '保湿剂、乳化剂、溶剂，广泛用于护肤品、彩妆、洗护产品',
      valueProp: '高纯度植物来源原料，契合清洁美容趋势，批次稳定保障配方一致性'
    },
    pharmaceutical: {
      nameZh: '制药',
      application: '辅料、溶剂、保湿剂，用于口服液、软膏、胶囊等制剂',
      valueProp: '药典级高纯原料，完整COA与可追溯性，符合GMP及国际药典标准'
    },
    food: {
      nameZh: '食品',
      application: '保湿剂、甜味剂、质地改良剂，用于烘焙、糖果、果脯、饮料等',
      valueProp: '食品级原料，植物来源，稳定供应保障产线连续性'
    },
    industrial: {
      nameZh: '工业',
      application: '树脂、涂料、防冻液、润滑剂、聚氨酯等工业原料',
      valueProp: '多规格可选，稳定大宗供应，灵活包装与物流方案'
    },
    general: {
      nameZh: '综合',
      application: '制药、食品、化妆品、工业等多领域应用',
      valueProp: '高品质原料，产地直供，稳定供应、竞争价格、全程技术支持'
    }
  };

  // --- Channel config ---
  const CHANNELS = {
    'linkedin-connect': { name: 'LinkedIn 加好友申请', maxChars: 280, hasSubject: false, lang: 'en' },
    'linkedin-first': { name: 'LinkedIn 首次私信', wordRange: [80, 150], hasSubject: false, lang: 'en' },
    'linkedin-followup': { name: 'LinkedIn 跟进消息', wordRange: [80, 120], hasSubject: false, lang: 'en' },
    'email-first': { name: '开发信（首次邮件）', wordRange: [150, 220], hasSubject: true, lang: 'en' },
    'email-followup': { name: '跟进邮件', wordRange: [120, 180], hasSubject: true, lang: 'en' },
    'whatsapp-first': { name: 'WhatsApp 首次消息', wordRange: [40, 80], hasSubject: false, lang: 'en' },
    'whatsapp-followup': { name: 'WhatsApp 跟进', wordRange: [30, 60], hasSubject: false, lang: 'en' },
    'tradeshow-invite': { name: '展会会议邀请', wordRange: [80, 140], hasSubject: true, lang: 'en' },
    'tradeshow-followup': { name: '展会后跟进', wordRange: [100, 160], hasSubject: true, lang: 'en' },
    'coldcall': { name: ' Cold Call 开场白', wordRange: [80, 130], hasSubject: false, lang: 'en' },
    'wechat': { name: '微信问候', wordRange: [60, 120], hasSubject: false, lang: 'zh' }
  };

  // --- Helpers for dynamic company/product ---
  function companyName(data) { return data.myCompany || 'our company'; }
  function productName(data) { return data.myProduct || 'our product'; }
  function originPhrase(data) {
    if (data.productOrigin) return 'based in ' + data.productOrigin;
    return '';
  }
  function productDesc(data) {
    const parts = [productName(data)];
    if (data.productOrigin) parts.push('based in ' + data.productOrigin);
    if (data.certifications) parts.push('certified to ' + data.certifications);
    return parts.join(', ');
  }
  function productShort(data) {
    return data.myProduct || 'our product line';
  }

  // --- Utility ---
  function wordCountEn(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }
  function charCount(text) { return text.length; }

  // --- Greeting / Sign-off ---
  function buildGreeting(channel, firstName, myName) {
    if (channel === 'wechat') return firstName + '，您好！';
    if (channel === 'coldcall') return 'Hi ' + firstName + ', this is ' + myName + ' from ' + companyName({myCompany: document.getElementById('myCompany').value}) + '.';
    return 'Hi ' + firstName + ',';
  }
  function buildSignOff(channel, myName, data) {
    if (channel === 'wechat') return '此致，\n' + myName;
    if (channel === 'coldcall') return '';
    return 'Best,\n' + myName;
  }

  // --- Generators ---
  function generateAnalysis(data) {
    const role = ROLE_PROFILES[data.roleKey] || ROLE_PROFILES.general;
    const ind = INDUSTRY_PROFILES[data.industryKey] || INDUSTRY_PROFILES.general;
    return {
      role: role.titleZh,
      industry: ind.nameZh,
      responsibilities: '负责' + role.focus + '。',
      influence: data.roleKey === 'procurement' || data.roleKey === 'ceo' ? '直接参与或主导采购决策。' : '对原料选型、供应商评估有重要建议权，采购部门通常采纳其技术推荐。',
      cares: role.cares,
      challenges: role.challenges,
      application: ind.application
    };
  }

  function generateStrategy(data) {
    const strategies = {
      procurement: '从供应安全和成本优势切入，强调长期合作与灵活条款。避免过度技术细节，聚焦商务价值。',
      production: '从生产稳定性和批次一致性切入，用实际案例说明原料波动对产线的影响。提供技术支持和灵活包装方案。',
      rnd: '从技术规格和创新应用切入，强调纯度、完整COA、应用支持。以样品测试和合规格交流为低压力CTA。',
      qa: '从合规性和可追溯性切入，提供完整的质量文件包（COA、证书、审计支持）。强调批次一致性和变更控制。',
      ceo: '从战略合作和供应链安全切入，强调长期伙伴关系、稳定供应、可持续来源。',
      sales: '从产品差异化和客户价值切入，强调植物来源、高品质如何帮助其服务客户。',
      general: '从综合供应能力和服务优势切入，强调稳定供应、竞争价格、灵活合作模式。'
    };
    return strategies[data.roleKey] || strategies.general;
  }

  function generateValueProp(data) {
    const ind = INDUSTRY_PROFILES[data.industryKey] || INDUSTRY_PROFILES.general;
    const advs = data.advantages ? '核心优势：' + data.advantages + '。' : '';
    const base = (data.myCompany || '我们') + '供应' + (data.productOrigin ? data.productOrigin + '产' : '') + (data.myProduct || '高品质原料') + '，' + advs;
    return base + '针对' + ind.nameZh + '行业：' + ind.valueProp;
  }

  function generateSubject(data) {
    const co = data.company;
    const prod = productShort(data);
    const subjects = [
      prod + ' Supply from ' + (data.productOrigin || 'our facility') + ' — Inquiry for ' + co,
      (data.myCompany || 'Our Company') + ' ' + prod + ' Supply — Potential Partnership with ' + co,
      'Stable Supply of ' + prod + ' for ' + co,
      'Exploring ' + prod + ' Supply Cooperation — ' + co + ' & ' + (data.myCompany || 'Us'),
      (data.productOrigin || 'Premium') + ' Origin ' + prod + ' — Spec Sheet & Sample Offer'
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  function generateMessage(data) {
    const role = ROLE_PROFILES[data.roleKey] || ROLE_PROFILES.general;
    const ind = INDUSTRY_PROFILES[data.industryKey] || INDUSTRY_PROFILES.general;
    const ch = CHANNELS[data.channelKey];
    const fn = data.firstName;
    const mn = data.myName;
    const co = data.company;
    const country = data.country;
    const comp = companyName(data);
    const prod = productName(data);
    const origin = data.productOrigin;
    const prodDesc = productDesc(data);

    const greeting = buildGreeting(data.channelKey, fn, mn);
    const signOff = buildSignOff(data.channelKey, mn, data);

    // LinkedIn Connect
    if (data.channelKey === 'linkedin-connect') {
      return `Hi ${fn}, I'm ${mn} from ${comp} — we supply ${prodDesc}. Noticed your role at ${co} and thought there might be value in connecting. Would love to explore how we can support your team with stable supply and consistent quality. Best, ${mn}`;
    }

    // WeChat
    if (data.channelKey === 'wechat') {
      return `${fn}，您好！\n\n我是 ${comp} 的 ${mn}，我们主营${origin ? origin + '产' : ''}${prod}。看到您在 ${co} 负责${role.titleZh === '生产主管' ? '生产管理' : (role.titleZh === '研发经理' ? '研发工作' : '相关业务')}，想简要介绍一下我们的供应能力。\n\n我们长期为亚洲多家企业提供稳定原料供应，具备竞争价格与灵活包装方案。如您有原料评估需求，我很乐意发送规格书或安排样品。\n\n此致，\n${mn}`;
    }

    // Hooks
    const hooks = {
      procurement: [
        `I'm ${mn} with ${comp}, a supplier of ${prodDesc}. I came across ${co} and your role in procurement, and wanted to reach out regarding stable ${prod} supply.`,
        `I'm ${mn} from ${comp} — we specialize in supplying ${prodDesc} to manufacturers across Asia. Given ${co}'s scale, I wondered if securing an additional reliable source might be on your radar.`
      ],
      production: [
        `I'm ${mn} with ${comp}, a supplier of ${prodDesc}. I saw you're supervising production at ${co} — impressive operation. I wanted to reach out because we help production teams secure consistent supply with reliable specs.`,
        `I'm ${mn} from ${comp}. We supply ${prodDesc} to manufacturers in Asia. I noticed your production role at ${co} and thought our stable supply track record might interest you.`
      ],
      rnd: [
        `I'm ${mn} with ${comp}, a supplier of ${prodDesc}. I came across your profile and was impressed by your work in ${ind.nameZh} R&D at ${co}. I'd love to connect regarding our specifications and potential application support.`,
        `I'm ${mn} from ${comp}. We produce ${prodDesc} with strict batch-to-batch consistency. Given your formulation focus at ${co}, I thought you might find our spec profile useful.`
      ],
      qa: [
        `I'm ${mn} with ${comp}, a supplier of ${prodDesc}. I noticed your QA role at ${co} and wanted to introduce our quality system — complete COA, full traceability, and international compliance documentation.`,
        `I'm ${mn} from ${comp}. We supply ${prodDesc} with comprehensive quality documentation. Given your focus on compliance at ${co}, I thought our certificate package might be worth reviewing.`
      ],
      ceo: [
        `I'm ${mn} with ${comp}, a supplier of ${prodDesc}. I've been following ${co}'s growth and wanted to reach out personally to explore a potential strategic partnership.`,
        `I'm ${mn} from ${comp}. We are a leading producer of ${prodDesc}, and I admire what ${co} has built. I'd welcome the opportunity to discuss how a long-term supply partnership could support your growth.`
      ],
      sales: [
        `I'm ${mn} with ${comp}, a supplier of ${prodDesc}. I came across ${co} and your business development role, and thought there might be synergy in exploring our supply for your customers.`,
        `I'm ${mn} from ${comp}. We supply ${prodDesc} with stable quality and competitive terms. Given your market focus at ${co}, I wondered if our product could add value to your customer offerings.`
      ],
      general: [
        `I'm ${mn} with ${comp}, a supplier of ${prodDesc}. I came across ${co} and wanted to reach out to introduce our supply capabilities.`,
        `I'm ${mn} from ${comp}. We specialize in ${prodDesc}, serving manufacturers across Asia. I'd love to explore whether there might be a fit with ${co}'s operations.`
      ]
    };

    const valueParas = {
      procurement: `We currently supply several ${ind.nameZh === '综合' ? 'manufacturing' : ind.nameZh} companies in Asia with ${prod}, offering stable volume, consistent specification, and flexible packaging. ${origin ? 'Our ' + origin + ' origin gives us strong supply chain security and competitive positioning.' : 'Our production capabilities ensure reliable delivery and cost competitiveness.'} I know how important supplier reliability is when you're managing multiple vendor relationships and cost targets.`,
      production: `We work with several ${ind.nameZh === '综合' ? 'manufacturing' : ind.nameZh} companies in Southeast Asia, helping production teams secure consistent ${prod} supply with reliable specification and flexible packaging. I know how critical raw material consistency is to keeping lines running smoothly, especially when you're supplying quality-sensitive markets.`,
      rnd: `We're currently working with several ${ind.nameZh === '综合' ? 'cosmetics and pharma' : ind.nameZh} formulators in Asia to supply ${prod} with consistent specification and full technical support. Given ${co}'s innovation focus, I wondered if there might be room to explore how our material could fit into your formulation pipeline.`,
      qa: `We maintain strict batch-to-batch quality control, with complete COA documentation, full traceability, and compliance with international standards. Our ${prod} is produced under certified processes${origin ? ' in ' + origin : ''}, and we support customer audits and quality reviews proactively.`,
      ceo: `${comp} offers ${prod} with stable supply, competitive pricing, and full technical support. We're looking to build long-term partnerships with growth-oriented companies like ${co}, and I believe our ${origin || 'production base'} could add supply security to your operations.`,
      sales: `Our ${prod} offers a compelling story for customers seeking high-quality, reliably sourced ingredients. With stable supply and competitive terms, we can support your commercial commitments without the supply anxiety that affects many buyers.`,
      general: `We supply ${prod} with stable volume, consistent quality, and flexible packaging options. ${origin ? 'Our ' + origin + ' origin ensures proximity to feedstock and reliable logistics.' : 'Our established production ensures reliable delivery.'} I'd welcome the chance to learn more about ${co}'s requirements and explore how we might support your business.`
    };

    const ctas = {
      procurement: `I'd be happy to share a quotation or arrange a sample shipment for your evaluation. No pressure — just keen to see if there's a potential fit.`,
      production: `I'd be happy to share our spec sheet or discuss packaging and delivery options that suit your production schedule. No pressure at all — just thought it could be useful.`,
      rnd: `I'd be happy to share a spec sheet or arrange a sample for your formulation testing. No pressure — just keen to learn if there's potential to collaborate.`,
      qa: `I'd welcome the chance to share our COA, quality certificates, and traceability documentation. Even a brief review would help me understand your compliance requirements.`,
      ceo: `I'd welcome the opportunity to schedule a brief call at your convenience to explore how a partnership might work. No pressure — just a conversation to explore mutual interest.`,
      sales: `I'd be happy to share our product profile and discuss how our ${prod} can support your customer value proposition. Let me know if a brief call would work.`,
      general: `I'd be happy to share more details about our products and discuss potential cooperation. No pressure — just exploring whether there might be a good fit.`
    };

    const h = hooks[data.roleKey] || hooks.general;
    const hookText = h[Math.floor(Math.random() * h.length)];
    const valText = valueParas[data.roleKey] || valueParas.general;
    const ctaText = ctas[data.roleKey] || ctas.general;

    if (data.channelKey === 'whatsapp-first') {
      return `${greeting}\n\n${hookText}\n\n${valText.split('.')[0]}.${valText.split('.')[1] || ''}\n\n${ctaText}\n\n${signOff}`;
    }
    if (data.channelKey === 'whatsapp-followup') {
      return `${greeting} Just following up on my message. ${ctaText.replace('I\'d be happy to', 'Happy to').replace('No pressure', 'No rush')} ${signOff}`;
    }
    if (data.channelKey === 'coldcall') {
      return `${greeting} We supply ${prodDesc} to ${ind.nameZh === '综合' ? 'manufacturers' : ind.nameZh} companies across Asia. I'm calling because we've been working with firms similar to ${co}, helping them secure stable supply with consistent quality and competitive pricing. I'd love to send you our spec sheet — would that be of interest?`;
    }
    if (data.channelKey === 'tradeshow-invite') {
      return `${greeting}\n\n${hookText}\n\n${valText}\n\nI'll be attending [Trade Show Name] in [City] on [Dates] and would welcome the chance to meet in person. It would be great to learn more about ${co}'s operations and discuss how ${comp} might support your needs.\n\nWould you be available for a brief meeting?\n\n${signOff}`;
    }
    if (data.channelKey === 'tradeshow-followup') {
      return `${greeting}\n\nIt was a pleasure meeting you at [Trade Show Name]. Thank you for taking the time to discuss ${co}'s requirements.\n\nAs promised, I'm following up with our company profile and product specifications. ${valText}\n\n${ctaText}\n\n${signOff}`;
    }
    if (data.channelKey === 'email-first') {
      return `${greeting}\n\n${hookText}\n\n${valText}\n\nGiven ${co}'s presence in ${country || 'your market'}, I believe our supply could offer both logistical advantages and supply security. ${ctaText}\n\n${signOff}`;
    }
    if (data.channelKey === 'email-followup') {
      return `${greeting}\n\nI hope this email finds you well. I wanted to follow up on my message from last week regarding supply for ${co}.\n\nI recently helped a ${ind.nameZh === '综合' ? 'manufacturing' : ind.nameZh} company in the region resolve a supply consistency challenge by switching to a supplier with tighter quality control. The improvement in their production stability was significant.\n\nIf ${co} is ever reviewing suppliers, I'd welcome the chance to share our COA and discuss your specification requirements.\n\n${signOff}`;
    }
    if (data.channelKey === 'linkedin-followup') {
      return `${greeting}\n\nJust following up on my note from last week. I know how busy things can get.\n\nI recently helped a ${ind.nameZh === '综合' ? 'manufacturing' : ind.nameZh} company in the region resolve a ${data.roleKey === 'rnd' ? 'batch-to-batch formulation consistency' : (data.roleKey === 'qa' ? 'quality documentation' : 'supply consistency')} issue by switching to a supplier with tighter control and full traceability.\n\n${ctaText}\n\n${signOff}`;
    }
    // linkedin-first default
    return `${greeting}\n\n${hookText}\n\n${valText}\n\n${ctaText}\n\n${signOff}`;
  }

  function generateFollowUp(data) {
    const role = ROLE_PROFILES[data.roleKey] || ROLE_PROFILES.general;
    const ind = INDUSTRY_PROFILES[data.industryKey] || INDUSTRY_PROFILES.general;
    const fn = data.firstName;
    const mn = data.myName;
    const co = data.company;
    const comp = companyName(data);
    const prod = productName(data);

    if (data.channelKey === 'wechat') {
      return `${fn}，您好！\n\n跟进一下上周的消息。我们最近帮助一家${ind.nameZh === '综合' ? '制造业' : ind.nameZh}企业解决了原料批次波动的问题，切换为新的供应商后，产线稳定性显著提升。\n\n如果 ${co} 正在评估供应商，我很乐意分享我们的 COA 和质量文件。期待您的回复。\n\n此致，\n${mn}`;
    }
    return `Hi ${fn},\n\nJust following up on my note from last week. I know how busy ${role.titleZh === '生产主管' ? 'production schedules' : (role.titleZh === '研发经理' ? 'R&D schedules' : 'schedules')} can get, especially at a company like ${co}.\n\nI recently helped a ${ind.nameZh === '综合' ? 'manufacturing' : ind.nameZh} company in the region resolve a ${data.roleKey === 'rnd' ? 'batch-to-batch formulation consistency' : (data.roleKey === 'qa' ? 'quality documentation gap' : 'supply consistency')} issue by switching to a supplier with tighter quality control and full traceability. The improvement in their ${data.roleKey === 'rnd' ? 'formulation stability' : (data.roleKey === 'qa' ? 'audit readiness' : 'production stability')} was significant.\n\nIf ${co} is ever reviewing suppliers, I'd welcome the chance to share our COA and discuss which specification parameters matter most to your team.\n\nBest,\n${mn}`;
  }

  // --- Main generate function ---
  function generateAll() {
    const form = document.getElementById('outreachForm');
    if (!form) return;
    const getVal = (id) => (form.querySelector('#' + id) || {}).value || '';

    const data = {
      name: getVal('contactName').trim(),
      title: getVal('jobTitle').trim(),
      company: getVal('company').trim(),
      country: getVal('country').trim(),
      industry: getVal('industry').trim(),
      channelKey: getVal('channel'),
      currentSupplier: getVal('currentSupplier').trim(),
      notes: getVal('notes').trim(),
      myName: getVal('myName').trim() || 'Rosa',
      myCompany: getVal('myCompany').trim(),
      myProduct: getVal('myProduct').trim(),
      productOrigin: getVal('productOrigin').trim(),
      certifications: getVal('certifications').trim(),
      advantages: getVal('advantages').trim(),
      linkedinUrl: getVal('linkedinUrl').trim(),
      website: getVal('website').trim()
    };

    if (!data.name || !data.title || !data.company) {
      alert('请至少填写联系人姓名、职位和公司名称。');
      return;
    }

    data.firstName = data.name.split(' ')[0];
    data.roleKey = detectRole(data.title);
    data.industryKey = detectIndustry(data.industry);

    const analysis = generateAnalysis(data);
    const strategy = generateStrategy(data);
    const valueProp = generateValueProp(data);
    const message = generateMessage(data);
    const followUp = generateFollowUp(data);
    const subject = generateSubject(data);
    const ch = CHANNELS[data.channelKey] || CHANNELS['linkedin-first'];

    document.getElementById('out-section').style.display = 'block';
    const empty = document.getElementById('empty-state');
    if (empty) empty.style.display = 'none';
    document.getElementById('out-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.getElementById('out-analysis').innerHTML = `
      <p><strong>识别角色：</strong>${analysis.role}</p>
      <p><strong>识别行业：</strong>${analysis.industry}</p>
      <p><strong>职责判断：</strong>${analysis.responsibilities}</p>
      <p><strong>采购影响力：</strong>${analysis.influence}</p>
      <p><strong>核心关注点：</strong>${analysis.cares}</p>
      <p><strong>可能面临的挑战：</strong>${analysis.challenges}</p>
      <p><strong>应用场景：</strong>${analysis.application}</p>
    `;
    document.getElementById('out-strategy').textContent = strategy;
    document.getElementById('out-value').textContent = valueProp;
    document.getElementById('out-message').textContent = message;
    document.getElementById('out-message-meta').textContent = `渠道：${ch.name} | 识别角色：${analysis.role} | 识别行业：${analysis.industry}`;

    const subjectEl = document.getElementById('out-subject-wrap');
    if (ch.hasSubject) {
      subjectEl.style.display = 'block';
      document.getElementById('out-subject').textContent = subject;
    } else {
      subjectEl.style.display = 'none';
    }

    const role = ROLE_PROFILES[data.roleKey] || ROLE_PROFILES.general;
    document.getElementById('out-cta').textContent = role.cta;
    document.getElementById('out-timing').textContent = '7–10 天后若无回复，发送第二次跟进消息。';
    document.getElementById('out-followup').textContent = followUp;

    const wc = ch.maxChars ? charCount(message) + ' 字符' : wordCountEn(message) + ' 词';
    document.getElementById('out-stats').textContent = `字数统计：${wc}`;
  }

  function copyText(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
      const btn = el.parentElement.querySelector('.copy-btn');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '已复制!';
        setTimeout(() => btn.textContent = orig, 1500);
      }
    });
  }

  window.generateAll = generateAll;
  window.copyText = copyText;
})();
