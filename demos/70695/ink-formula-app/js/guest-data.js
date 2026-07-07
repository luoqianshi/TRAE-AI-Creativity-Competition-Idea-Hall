/* ========== 水性黑配方管理系统 - 游客模式演示数据 ========== */

// SVG image generator for demo images (no external API needed)
function _guestSvgPlaceholder(color1, color2, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:${color1};stop-opacity:1"/>
    <stop offset="100%" style="stop-color:${color2};stop-opacity:1"/>
  </linearGradient></defs>
  <rect width="400" height="400" fill="url(#bg)" rx="8"/>
  <rect x="40" y="80" width="320" height="200" fill="white" rx="4" opacity="0.9"/>
  <text x="200" y="195" text-anchor="middle" font-size="24" font-weight="bold" fill="#333" font-family="sans-serif">${label}</text>
  <text x="200" y="225" text-anchor="middle" font-size="12" fill="#888" font-family="sans-serif">Guest Demo Data</text>
</svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

// ========== Random Demo Materials ==========
function initGuestMaterials() {
  const demos = [
    // 溶剂 — 用 E/S 系列
    { id: genId(), name: '去离子水', code: '', category: '溶剂', specs: '电导率 ≤1μS/cm, 超纯', manufacturer: '自制', customInfo: { 'pH':'6.8-7.2','制备方式':'RO+EDI','储存':'密封避光' } },
    { id: genId(), name: '无水乙醇', code: 'E-101', category: '溶剂', specs: '99.9% 色谱纯', manufacturer: '国药集团', customInfo: { '沸点':'78.3℃','CAS':'64-17-5','储存':'防火防爆' } },
    { id: genId(), name: '正丙醇', code: 'E-102', category: '溶剂', specs: '99.5% 工业级', manufacturer: '浙江巨化', customInfo: { '沸点':'97.2℃','CAS':'71-23-8','蒸气压':'2.0 kPa' } },
    { id: genId(), name: '丙三醇', code: 'E-103', category: '溶剂', specs: '99.0% 医药级', manufacturer: '丰益国际', customInfo: { '粘度':'1412 mPa·s','保湿性':'优秀','CAS':'56-81-5' } },
    { id: genId(), name: '二丙二醇甲醚', code: 'S-201', category: '溶剂', specs: '99% 电子级', manufacturer: '三菱化学', customInfo: { '沸点':'190℃','CAS':'34590-94-8','HLB溶剂':'是' } },
    { id: genId(), name: '二乙二醇丁醚', code: 'S-202', category: '溶剂', specs: '98.5% 工业级', manufacturer: '壳牌', customInfo: { '沸点':'230℃','蒸发速率':'0.004（BuAc=1）','CAS':'112-34-5' } },
    // 助剂 — C/D/E 系列
    { id: genId(), name: 'BYK-028 消泡剂', code: 'C-101', category: '助剂', specs: '含硅消泡剂, 100%', manufacturer: '毕克化学', customInfo: { '添加量':'0.05-0.3%','相容性':'良好','储存':'5-35℃' } },
    { id: genId(), name: 'TEGO Foamex 810 消泡剂', code: 'C-102', category: '助剂', specs: '聚醚硅氧烷乳液', manufacturer: '赢创', customInfo: { '添加量':'0.1-0.5%','活性物':'20%','pH范围':'4-10' } },
    { id: genId(), name: 'Surfynol 440 润湿剂', code: 'D-101', category: '助剂', specs: '双子型表面活性剂', manufacturer: '赢创', customInfo: { 'HLB':'8-10','动态张力':'极低','添加量':'0.2-1.5%' } },
    { id: genId(), name: 'Dynol 604 润湿剂', code: 'D-102', category: '助剂', specs: '高效基材润湿', manufacturer: '赢创', customInfo: { 'HLB':'6-8','适用pH':'3-10','泡沫倾向':'低' } },
    { id: genId(), name: 'TEGO Dispers 760W 分散剂', code: 'D-201', category: '助剂', specs: '高分子量嵌段共聚物', manufacturer: '赢创', customInfo: { '固含':'35%','胺值':'20 mgKOH/g','适用颜料':'有机/炭黑' } },
    { id: genId(), name: 'Solsperse 46000 分散剂', code: 'D-202', category: '助剂', specs: '100% 活性物', manufacturer: '路博润', customInfo: { '添加量':'颜料量15-40%','适用体系':'水性/UV','储存':'常温密封' } },
    { id: genId(), name: 'DMEA pH调节剂', code: 'E-301', category: '助剂', specs: 'N,N-二甲基乙醇胺', manufacturer: '巴斯夫', customInfo: { '纯度':'99.5%','pKa':'8.8','添加量':'0.05-0.2%' } },
    { id: genId(), name: '氨水 25%', code: 'E-302', category: '助剂', specs: '25% 水溶液', manufacturer: '天津大沽', customInfo: { 'pH调节范围':'8-10.5','挥发性':'中','储存':'密封阴凉' } },
    { id: genId(), name: 'Rheolate 150 增稠剂', code: 'E-401', category: '助剂', specs: '疏水改性碱溶胀型', manufacturer: '海名斯', customInfo: { '固含':'30%','pH有效范围':'7-9.5','增稠效率':'高' } },
    { id: genId(), name: 'Acrysol RM-8W 增稠剂', code: 'E-402', category: '助剂', specs: '非离子聚氨酯型', manufacturer: '陶氏化学', customInfo: { '固含':'17.5%','ICI粘度':'低剪增稠','流变性':'牛顿型' } },
    // 树脂 — P/Q 系列
    { id: genId(), name: 'Joncryl 631 丙烯酸乳液', code: 'P-101', category: '树脂', specs: '固含46%, Tg 105℃', manufacturer: '巴斯夫', customInfo: { 'MFFT':'90℃','酸值':'55','pH':'8.5','成膜助剂':'需要' } },
    { id: genId(), name: 'NeoCryl A-1125 丙烯酸乳液', code: 'P-102', category: '树脂', specs: '固含45%, 核壳结构', manufacturer: '帝斯曼', customInfo: { 'Tg':'60℃','MFFT':'35℃','耐醇性':'优','pH':'7.5-9' } },
    { id: genId(), name: 'Bayhydrol UH 2606 聚氨酯', code: 'Q-201', category: '树脂', specs: '固含35%, 脂肪族PUD', manufacturer: '科思创', customInfo: { '100%模量':'15 MPa','断裂伸长率':'500%','耐黄变':'优异' } },
    { id: genId(), name: 'Alberdingk U 800 聚氨酯', code: 'Q-202', category: '树脂', specs: '固含40%, 阴离子PUD', manufacturer: '欧宝迪', customInfo: { '硬度':'中等','弹性手感':'优秀','成膜温度':'<5℃' } },
    { id: genId(), name: 'Dynapol LH 833 共聚酯', code: 'Q-301', category: '树脂', specs: '固含40%, 高附着', manufacturer: '赢创', customInfo: { 'Tg':'30℃','耐水煮':'优秀','适用基材':'PET/BOPP' } },
    { id: genId(), name: 'Vinamul 88438 乙烯-醋酸乙烯', code: 'Q-401', category: '树脂', specs: '固含55%, EVA乳液', manufacturer: '塞拉尼斯', customInfo: { 'Tg':'0℃','MFFT':'<0℃','柔性':'极佳','低温柔韧':'优秀' } },
    // 色浆 — CP100/MP200/YP300/KP400 系列
    { id: genId(), name: '酞菁绿 PG-7 色浆', code: 'CP100', category: '色浆', specs: '颜料含量32%, 耐光8级', manufacturer: '迪爱生', customInfo: { '耐温':'220℃','遮盖力':'高','粒径 D50':'≤0.3μm' } },
    { id: genId(), name: '永固紫 PV-23 色浆', code: 'MP200', category: '色浆', specs: '颜料含量25%, 耐光7级', manufacturer: '科莱恩', customInfo: { '耐温':'200℃','着色力':'极高','适用':'UV/水性' } },
    { id: genId(), name: '氧化铁红 PR-101 色浆', code: 'MP201', category: '色浆', specs: '颜料含量60%, 耐光8级', manufacturer: '朗盛', customInfo: { '耐温':'300℃','遮盖力':'极强','密度':'5.0 g/cm³' } },
    { id: genId(), name: '联苯胺黄 PY-83 色浆', code: 'YP300', category: '色浆', specs: '颜料含量30%, 耐光7级', manufacturer: '科莱恩', customInfo: { '耐温':'180℃','透明度':'高','迁移性':'低' } },
    { id: genId(), name: '异吲哚啉酮黄 PY-110', code: 'YP301', category: '色浆', specs: '颜料含量28%, 耐光8级', manufacturer: '巴斯夫', customInfo: { '耐温':'250℃','耐候性':'极佳','适用':'户外' } },
    { id: genId(), name: 'P.Bk7 高色素炭黑', code: 'KP400', category: '色浆', specs: '颜料含量35%, 黑度My值≤190', manufacturer: '卡博特', customInfo: { '比表面积':'260 m²/g','DBP':'65 ml/100g','导电性':'低' } },
    { id: genId(), name: '钛白粉 R-996 色浆', code: 'KP401', category: '色浆', specs: '颜料含量70%, 金红石型', manufacturer: '龙蟒佰利联', customInfo: { '白度':'≥97%','遮盖力':'极高','pH':'6.5-8.0','粒径':'0.23μm' } },
  ];

  const existing = loadData(STORAGE_KEY_MATERIALS);
  if (existing.length > 0) return;
  saveData(STORAGE_KEY_MATERIALS, demos);
}

// ========== Demo Formulas ==========
function initGuestFormulas() {
  const imgBase = _guestSvgPlaceholder;

  const now = new Date().toISOString();
  const formulas = [
    {
      id: genId(),
      name: '演示·水性柔版绿墨 FLEX-GR-01',
      ingredients: [
        { materialId: null, name: '去离子水', code: '', category: '溶剂', ratio: '22%', mass: '22.0g' },
        { materialId: null, name: '无水乙醇', code: 'E-101', category: '溶剂', ratio: '8%', mass: '8.0g' },
        { materialId: null, name: '丙三醇', code: 'E-103', category: '溶剂', ratio: '5%', mass: '5.0g' },
        { materialId: null, name: 'BYK-028 消泡剂', code: 'C-101', category: '助剂', ratio: '0.25%', mass: '0.25g' },
        { materialId: null, name: 'Dynol 604 润湿剂', code: 'D-102', category: '助剂', ratio: '0.6%', mass: '0.6g' },
        { materialId: null, name: 'TEGO Dispers 760W 分散剂', code: 'D-201', category: '助剂', ratio: '1.5%', mass: '1.5g' },
        { materialId: null, name: 'DMEA pH调节剂', code: 'E-301', category: '助剂', ratio: '0.15%', mass: '0.15g' },
        { materialId: null, name: 'Joncryl 631 丙烯酸乳液', code: 'P-101', category: '树脂', ratio: '30%', mass: '30.0g' },
        { materialId: null, name: 'Bayhydrol UH 2606 聚氨酯', code: 'Q-201', category: '树脂', ratio: '12%', mass: '12.0g' },
        { materialId: null, name: '酞菁绿 PG-7 色浆', code: 'CP100', category: '色浆', ratio: '20.5%', mass: '20.5g' },
      ],
      properties: {
        viscosity: { value: '35', unit: 'mPa·s', method: 'Brookfield, 25℃, 30rpm' },
        surfaceTension: { value: '29.8', unit: 'mN/m', method: '铂金板法, 25℃' },
        spectrophotometer: { L: '48.6', a: '-32.5', b: '15.8', 'ΔE': '1.2' }
      },
      imageModules: [
        { id: genId(), label: '色块', dataUrl: imgBase('#10b981', '#34d399', 'Green Block') },
        { id: genId(), label: '网点', dataUrl: imgBase('#059669', '#6ee7b7', 'Dot Test') },
      ],
      remarks: '【演示数据】柔版印刷测试，300线/inch版材。\ngreen色彩饱和度优秀，P-101与Q-201树脂复配提供良好附着力。\n干燥条件：60℃热风3秒，表干良好。',
      evaluation: '【演示评价】★★★★☆\n绿色色域广，适合包装印刷。树脂复配兼顾硬度和柔韧性。\n改进：可尝试提升CP100至22%进一步增强饱和度。',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: now
    },
    {
      id: genId(),
      name: '演示·水性凹版紫墨 GRAV-VT-02',
      ingredients: [
        { materialId: null, name: '去离子水', code: '', category: '溶剂', ratio: '18%', mass: '18.0g' },
        { materialId: null, name: '正丙醇', code: 'E-102', category: '溶剂', ratio: '15%', mass: '15.0g' },
        { materialId: null, name: '二丙二醇甲醚', code: 'S-201', category: '溶剂', ratio: '5%', mass: '5.0g' },
        { materialId: null, name: 'TEGO Foamex 810 消泡剂', code: 'C-102', category: '助剂', ratio: '0.2%', mass: '0.2g' },
        { materialId: null, name: 'Surfynol 440 润湿剂', code: 'D-101', category: '助剂', ratio: '0.4%', mass: '0.4g' },
        { materialId: null, name: 'Solsperse 46000 分散剂', code: 'D-202', category: '助剂', ratio: '1.8%', mass: '1.8g' },
        { materialId: null, name: '氨水 25%', code: 'E-302', category: '助剂', ratio: '0.1%', mass: '0.1g' },
        { materialId: null, name: 'Rheolate 150 增稠剂', code: 'E-401', category: '助剂', ratio: '0.3%', mass: '0.3g' },
        { materialId: null, name: 'NeoCryl A-1125 丙烯酸乳液', code: 'P-102', category: '树脂', ratio: '25%', mass: '25.0g' },
        { materialId: null, name: 'Dynapol LH 833 共聚酯', code: 'Q-301', category: '树脂', ratio: '15%', mass: '15.0g' },
        { materialId: null, name: '永固紫 PV-23 色浆', code: 'MP200', category: '色浆', ratio: '19.2%', mass: '19.2g' },
      ],
      properties: {
        viscosity: { value: '22', unit: 's', method: '涂4杯, 25℃' },
        surfaceTension: { value: '30.5', unit: 'mN/m', method: '铂金板法, 25℃' },
        spectrophotometer: { L: '35.8', a: '12.6', b: '-22.4', 'ΔE': '0.7' }
      },
      imageModules: [
        { id: genId(), label: '色块', dataUrl: imgBase('#7c3aed', '#a78bfa', 'Violet Block') },
        { id: genId(), label: '刮样', dataUrl: imgBase('#6d28d9', '#c4b5fd', 'Drawdown') },
      ],
      remarks: '【演示数据】凹版打样：250线电雕版，速度100m/min。\nQ-301聚酯树脂提供极佳PET附着力和耐水煮性。\n永固紫着色力强，19.2%即达到目标色浓度。',
      evaluation: '【演示评价】★★★★★\nPET凹版用经典配方。Q-301与P-102搭配兼顾耐水煮和醇溶性。\n成本控制良好，属批量生产级成熟配方。',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: genId(),
      name: '演示·水性丝印白墨 SCR-WT-03',
      ingredients: [
        { materialId: null, name: '去离子水', code: '', category: '溶剂', ratio: '15%', mass: '15.0g' },
        { materialId: null, name: '丙三醇', code: 'E-103', category: '溶剂', ratio: '8%', mass: '8.0g' },
        { materialId: null, name: '二乙二醇丁醚', code: 'S-202', category: '溶剂', ratio: '4%', mass: '4.0g' },
        { materialId: null, name: 'BYK-028 消泡剂', code: 'C-101', category: '助剂', ratio: '0.35%', mass: '0.35g' },
        { materialId: null, name: 'Surfynol 440 润湿剂', code: 'D-101', category: '助剂', ratio: '1.0%', mass: '1.0g' },
        { materialId: null, name: 'TEGO Dispers 760W 分散剂', code: 'D-201', category: '助剂', ratio: '0.8%', mass: '0.8g' },
        { materialId: null, name: 'DMEA pH调节剂', code: 'E-301', category: '助剂', ratio: '0.2%', mass: '0.2g' },
        { materialId: null, name: 'Acrysol RM-8W 增稠剂', code: 'E-402', category: '助剂', ratio: '0.5%', mass: '0.5g' },
        { materialId: null, name: 'Alberdingk U 800 聚氨酯', code: 'Q-202', category: '树脂', ratio: '25%', mass: '25.0g' },
        { materialId: null, name: 'Vinamul 88438 EVA', code: 'Q-401', category: '树脂', ratio: '15%', mass: '15.0g' },
        { materialId: null, name: '钛白粉 R-996 色浆', code: 'KP401', category: '色浆', ratio: '30.15%', mass: '30.15g' },
      ],
      properties: {
        viscosity: { value: '12000', unit: 'mPa·s', method: 'Brookfield, 25℃, 6rpm' },
        surfaceTension: { value: '36.0', unit: 'mN/m', method: '铂金板法, 25℃' },
        spectrophotometer: { L: '95.2', a: '-0.8', b: '1.5', 'ΔE': '0.5' }
      },
      imageModules: [
        { id: genId(), label: '色块', dataUrl: imgBase('#f1f5f9', '#e2e8f0', 'White Block') },
        { id: genId(), label: '实印', dataUrl: imgBase('#cbd5e1', '#94a3b8', 'Printed Sample') },
      ],
      remarks: '【演示数据】丝网印刷：180目网版，手工+气动双模式。\n钛白粉R-996遮盖力优异，单次刮印即可覆盖黑色底材。\nU800赋予弹性手感，Q-401提升柔软度和低温柔韧性。',
      evaluation: '【演示评价】★★★★★\n高遮盖力白墨标杆配方。Q-202+Q-401树脂搭配Tg互补。\n适用于深色织物/皮革丝印，手感柔软不僵硬。',
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: genId(),
      name: '演示·水性柔版红墨 FLEX-RD-04',
      ingredients: [
        { materialId: null, name: '去离子水', code: '', category: '溶剂', ratio: '20%', mass: '20.0g' },
        { materialId: null, name: '无水乙醇', code: 'E-101', category: '溶剂', ratio: '10%', mass: '10.0g' },
        { materialId: null, name: '二丙二醇甲醚', code: 'S-201', category: '溶剂', ratio: '4%', mass: '4.0g' },
        { materialId: null, name: 'BYK-028 消泡剂', code: 'C-101', category: '助剂', ratio: '0.2%', mass: '0.2g' },
        { materialId: null, name: 'Dynol 604 润湿剂', code: 'D-102', category: '助剂', ratio: '0.5%', mass: '0.5g' },
        { materialId: null, name: 'Solsperse 46000 分散剂', code: 'D-202', category: '助剂', ratio: '1.2%', mass: '1.2g' },
        { materialId: null, name: 'NeoCryl A-1125 丙烯酸乳液', code: 'P-102', category: '树脂', ratio: '28%', mass: '28.0g' },
        { materialId: null, name: 'Joncryl 631 丙烯酸乳液', code: 'P-101', category: '树脂', ratio: '10%', mass: '10.0g' },
        { materialId: null, name: '氧化铁红 PR-101 色浆', code: 'MP201', category: '色浆', ratio: '26.1%', mass: '26.1g' },
      ],
      properties: {
        viscosity: { value: '40', unit: 'mPa·s', method: 'Brookfield, 25℃, 30rpm' },
        surfaceTension: { value: '32.1', unit: 'mN/m', method: '张力计, 25℃' },
        spectrophotometer: { L: '42.3', a: '48.7', b: '22.5', 'ΔE': '1.5' }
      },
      imageModules: [
        { id: genId(), label: '色块', dataUrl: imgBase('#dc2626', '#ef4444', 'Red Block') },
        { id: genId(), label: '网点', dataUrl: imgBase('#b91c1c', '#fca5a5', 'Dot Test') },
      ],
      remarks: '【演示数据】柔版印刷用铁红墨，MP201遮盖力极强。\n铁红色浆成本优势明显，但需注意密度较大(5.0)，存放需搅拌。',
      evaluation: '【演示评价】★★★★☆\n性价比极高的铁红配方。遮盖力一流，适合大面积实地印刷。\n注意：储存超3天需重新搅拌分散。',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: now
    }
  ];

  const existing = loadData(STORAGE_KEY_FORMULAS);
  if (existing.length > 0) return;
  saveData(STORAGE_KEY_FORMULAS, formulas);
}

// ========== Initialize All Guest Data ==========
function initGuestData() {
  initGuestMaterials();
  initGuestFormulas();
}
