/* ==================== 好日子 · Mock 数据 ==================== */

// 6 个常见事项
const EVENTS = [
  {
    key: "car",
    name: "提车",
    hint: "新车到手，好好验车",
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13l2-5a2 2 0 012-1h10a2 2 0 012 1l2 5"/><path d="M3 13v5a1 1 0 001 1h2a1 1 0 001-1v-1M17 13v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1"/><circle cx="7" cy="15" r="1.2"/><circle cx="17" cy="15" r="1.2"/></svg>',
    iconBgLift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l-4 0M5 12l0 5 0 0M19 12l0 5 0 0M3 17l18 0"/><path d="M5 12l2-5 10 0 2 5"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></svg>'
  },
  {
    key: "move",
    name: "搬家",
    hint: "乔迁之喜，顺顺利利",
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H12v6H4a1 1 0 01-1-1v-9z"/><path d="M9 21v-6h6v6"/></svg>'
  },
  {
    key: "decor",
    name: "装修开工",
    hint: "动土动工，要看日子",
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3l4 4-9 9-5-1 1-5 9-7z"/><path d="M13 5l6 6M3 21l4-4"/></svg>'
  },
  {
    key: "sign",
    name: "签约",
    hint: "大事落笔，合同签订",
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3l4 4-10 10H4v-4l10-10z"/><path d="M13 5l4 4M5 21l4-4"/></svg>'
  },
  {
    key: "open",
    name: "开业",
    hint: "生意开张，开门纳财",
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-5 9 5v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M8 21v-8h8v8M4 9h16"/></svg>'
  },
  {
    key: "house",
    name: "买房收房",
    hint: "不动产大事，验房收房",
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-6 8 6v9a1 1 0 01-1 1h-5v-7H10v7H5a1 1 0 01-1-1v-9z"/><circle cx="12" cy="16" r="1.2"/></svg>'
  }
];

// 日期推荐数据（以 2026 年 6 月为基准，今天为 6月22日）
// 每个事项包含 3 个推荐日期
const RECOMMENDATIONS = {
  car: {
    intro: "提车一般会参考出行、交易、交付这类事项，也会结合现实时间，比如 4S 店的安排、保险和临牌是否能当天办好。",
    dates: [
      {
        date: "2026-06-22",
        day: 22, month: 6, weekday: "周日",
        time: "上午 9:00 - 11:00",
        reason: "适合出行、交易，比较适合车辆交付和提车回家。",
        tags: ["出行", "交易", "纳财"],
        tag: "best",
        tagText: "最推荐",
        reminder: "提前确认保险和临牌是否办好，尽量上午去。"
      },
      {
        date: "2026-06-29",
        day: 29, month: 6, weekday: "周日",
        time: "上午 10:00 前后",
        reason: "整体也适合提车，周末时间更从容，方便家人一起。",
        tags: ["出行", "会友"],
        tag: "convenient",
        tagText: "最方便",
        reminder: "建议上午办理，留出充足的验车时间。"
      },
      {
        date: "2026-07-02",
        day: 2, month: 7, weekday: "周四",
        time: "上午",
        reason: "适合交易和办理手续，可作为备选方案。",
        tags: ["交易", "立券"],
        tag: "alt",
        tagText: "备选",
        reminder: "提前和 4S 店确认当天交付安排。"
      }
    ]
  },
  move: {
    intro: "搬家需要参考入宅、移徙这类事项，也建议结合家人时间、搬家公司档期、天气情况综合考虑。",
    dates: [
      {
        date: "2026-06-27",
        day: 27, month: 6, weekday: "周五",
        time: "上午 8:30 开始",
        reason: "适合入宅、移徙，时间充裕，周末可以接着整理。",
        tags: ["入宅", "移徙", "安床"],
        tag: "best",
        tagText: "最推荐",
        reminder: "提前确认电梯使用、搬家公司到达时间。"
      },
      {
        date: "2026-07-05",
        day: 5, month: 7, weekday: "周日",
        time: "上午 9:00 - 11:00",
        reason: "周末时间充足，适合全家一起参与。",
        tags: ["入宅", "会友"],
        tag: "convenient",
        tagText: "最方便",
        reminder: "建议提前一天把零碎物品打包好。"
      },
      {
        date: "2026-07-10",
        day: 10, month: 7, weekday: "周五",
        time: "上午",
        reason: "适合入宅和安床，作为备选日期。",
        tags: ["入宅", "安床"],
        tag: "alt",
        tagText: "备选",
        reminder: "确认新房水电燃气已开通。"
      }
    ]
  },
  decor: {
    intro: "装修开工参考动土、修造、安机械这类事项。建议避开传统上不适合动土的日子。",
    dates: [
      {
        date: "2026-06-26",
        day: 26, month: 6, weekday: "周四",
        time: "上午 9:00 开工",
        reason: "适合动土、修造，比较适合装修开工。",
        tags: ["动土", "修造", "安机械"],
        tag: "best",
        tagText: "最推荐",
        reminder: "建议提前和物业、设计方确认方案。"
      },
      {
        date: "2026-07-03",
        day: 3, month: 7, weekday: "周五",
        time: "上午",
        reason: "也适合动土，周五开工后周末可以安排材料进场。",
        tags: ["动土", "开市"],
        tag: "convenient",
        tagText: "最方便",
        reminder: "提前确认装修许可、楼下邻居时间。"
      },
      {
        date: "2026-07-08",
        day: 8, month: 7, weekday: "周三",
        time: "上午",
        reason: "适合修造、安门，可作为备选。",
        tags: ["修造", "安门"],
        tag: "alt",
        tagText: "备选",
        reminder: "动土日，建议准备一份简单的开工仪式。"
      }
    ]
  },
  sign: {
    intro: "签约通常参考立券、交易、纳财这类事项，建议选择双方都方便的工作日。",
    dates: [
      {
        date: "2026-06-24",
        day: 24, month: 6, weekday: "周二",
        time: "上午 9:00 - 11:00",
        reason: "适合立券、交易，比较适合正式签约。",
        tags: ["立券", "交易", "纳财"],
        tag: "best",
        tagText: "最推荐",
        reminder: "提前一天把合同发给对方确认。"
      },
      {
        date: "2026-06-30",
        day: 30, month: 6, weekday: "周一",
        time: "上午",
        reason: "月初时间，双方财务和法务都在工作节奏上。",
        tags: ["立券", "交易"],
        tag: "convenient",
        tagText: "最方便",
        reminder: "确认双方公章、授权书等齐备。"
      },
      {
        date: "2026-07-06",
        day: 6, month: 7, weekday: "周一",
        time: "下午",
        reason: "适合纳财、签约，可作为备选方案。",
        tags: ["纳财", "立券"],
        tag: "alt",
        tagText: "备选",
        reminder: "涉及大额付款，建议确认银行转账限额。"
      }
    ]
  },
  open: {
    intro: "开业参考开市、纳财、交易这类事项，建议选择周末或节假日前后，方便人流引流。",
    dates: [
      {
        date: "2026-06-28",
        day: 28, month: 6, weekday: "周日",
        time: "上午 10:18 开业",
        reason: "适合开市、纳财，周末人流量大，适合开业引流。",
        tags: ["开市", "纳财", "交易"],
        tag: "best",
        tagText: "最推荐",
        reminder: "建议提前做开业宣传，准备好推广活动。"
      },
      {
        date: "2026-07-04",
        day: 4, month: 7, weekday: "周六",
        time: "上午 9:58",
        reason: "周六开业，方便周末顾客光临。",
        tags: ["开市", "会友"],
        tag: "convenient",
        tagText: "最方便",
        reminder: "提前准备 POS 系统、会员卡、活动物料。"
      },
      {
        date: "2026-07-11",
        day: 11, month: 7, weekday: "周六",
        time: "上午",
        reason: "适合开市、纳财，可作为备选。",
        tags: ["开市", "纳财"],
        tag: "alt",
        tagText: "备选",
        reminder: "如涉及加盟授权，确认总部签约时间。"
      }
    ]
  },
  house: {
    intro: "买房收房、不动产登记，参考交易、纳财、立契这类事项，建议结合银行和不动产登记中心工作时间。",
    dates: [
      {
        date: "2026-06-25",
        day: 25, month: 6, weekday: "周三",
        time: "上午 9:00 开始",
        reason: "适合交易、立契、纳财，工作日办理方便。",
        tags: ["交易", "立契", "纳财"],
        tag: "best",
        tagText: "最推荐",
        reminder: "提前确认银行放款时间和登记中心预约。"
      },
      {
        date: "2026-07-01",
        day: 1, month: 7, weekday: "周二",
        time: "上午",
        reason: "月初财务方便打款，适合不动产交易。",
        tags: ["交易", "纳财"],
        tag: "convenient",
        tagText: "最方便",
        reminder: "月初银行转账量大，建议提前预约。"
      },
      {
        date: "2026-07-15",
        day: 15, month: 7, weekday: "周二",
        time: "下午",
        reason: "适合立契和交易，作为备选日期。",
        tags: ["立契", "交易"],
        tag: "alt",
        tagText: "备选",
        reminder: "提前安排验房师和律师陪同。"
      }
    ]
  }
};

// 办好事清单分组数据
const CHECKLISTS = {
  car: {
    title: "提车计划",
    groups: [
      {
        name: "证件资料",
        items: [
          { text: "身份证（本人及共同购车人）", tags: [] },
          { text: "驾驶证", tags: [{ label: "需确认", type: "warn" }] },
          { text: "购车合同", tags: [] },
          { text: "付款凭证 / 银行打款回单", tags: [] },
          { text: "车辆发票（增值税专用发票）", tags: [] },
          { text: "车辆合格证", tags: [{ label: "关键资料", type: "key" }] }
        ]
      },
      {
        name: "手续确认",
        items: [
          {
            text: "确认保险当天生效",
            tags: [{ label: "关键提醒", type: "key" }],
            note: "保险未生效前不要开车上路，建议提前一天购买车险。",
            reminder: "提车当天出发前确认"
          },
          {
            text: "确认临牌是否办好",
            tags: [{ label: "需提前确认", type: "warn" }],
            note: "如需车管所办理，请提前确认当地车管所工作时间，避免周末或节假日无法办理。",
            reminder: "提车前 1 天确认"
          },
          {
            text: "确认贷款是否放款",
            tags: [{ label: "涉及银行", type: "bank" }],
            note: "涉及银行处理时间，建议提前和销售或银行确认放款进度。",
            reminder: "提车前 2 天确认"
          },
          { text: "确认尾款金额与贷款金额一致", tags: [{ label: "涉及银行", type: "bank" }] },
          { text: "确认 4S 店交付时间与地点", tags: [] }
        ]
      },
      {
        name: "车辆检查",
        items: [
          { text: "核对车架号、发动机号与资料一致", tags: [] },
          { text: "检查公里数是否正常（新车通常 < 50km）", tags: [{ label: "关键", type: "key" }] },
          { text: "检查车身外观、轮胎、玻璃是否有划痕破损", tags: [] },
          { text: "检查内饰、座椅、中控屏幕功能", tags: [] },
          { text: "检查随车工具、备胎、三脚架、反光背心", tags: [] },
          { text: "检查两把车钥匙是否都能正常使用", tags: [] }
        ]
      },
      {
        name: "当天建议",
        items: [
          { text: "尽量上午提车，时间更从容", tags: [] },
          { text: "检查完车辆后再签交接单", tags: [{ label: "重要", type: "key" }] },
          { text: "确认保险生效后再开车上路", tags: [] },
          { text: "拍照留存车辆信息（外观、车架号）", tags: [] }
        ]
      }
    ]
  },
  move: {
    title: "搬家计划",
    groups: [
      {
        name: "搬家前准备",
        items: [
          { text: "搬家公司时间确认（车型、费用、人数）", tags: [] },
          { text: "确认搬家公司保险（易碎品、大额物品）", tags: [{ label: "重要", type: "key" }] },
          { text: "新房钥匙、门禁卡、密码确认到手", tags: [] },
          { text: "水电燃气过户及开通预约", tags: [{ label: "需提前", type: "warn" }] },
          { text: "大件家具尺寸与新家门、电梯尺寸复核", tags: [] },
          { text: "贵重物品、证件单独打包并自行携带", tags: [] },
          { text: "标注易碎品、朝上方向等", tags: [] }
        ]
      },
      {
        name: "搬家当天",
        items: [
          { text: "提前与物业打好招呼，预留电梯和车位", tags: [] },
          { text: "清点装车物品，大件做简单记录", tags: [] },
          { text: "易碎品现场开箱检查", tags: [{ label: "关键", type: "key" }] },
          { text: "新家家具、电器摆放位置确认", tags: [] },
          { text: "水电燃气试开、空调热水器测试", tags: [] },
          { text: "结清旧家水电燃气、退押金", tags: [{ label: "涉及机构", type: "bank" }] }
        ]
      },
      {
        name: "入住后事项",
        items: [
          { text: "开通网络、办理宽带移机", tags: [] },
          { text: "身份证、银行卡地址更新（如需要）", tags: [] },
          { text: "熟悉周边超市、医院、地铁站", tags: [] },
          { text: "换锁或更换密码锁密码", tags: [{ label: "安全", type: "key" }] },
          { text: "整理废品、包装材料处理", tags: [] }
        ]
      }
    ]
  },
  decor: {
    title: "装修开工计划",
    groups: [
      {
        name: "开工前确认",
        items: [
          { text: "装修设计图、施工图最终确认", tags: [{ label: "关键", type: "key" }] },
          { text: "装修许可、物业备案手续完成", tags: [] },
          { text: "拆墙、打洞等红线范围确认（承重墙不拆）", tags: [{ label: "安全", type: "key" }] },
          { text: "装修合同、付款节点明细确认", tags: [{ label: "涉及合同", type: "bank" }] },
          { text: "邻居沟通（噪音、工期）", tags: [] },
          { text: "水电燃气总阀门位置确认", tags: [] }
        ]
      },
      {
        name: "开工当天",
        items: [
          { text: "施工方到场、设计师现场交底", tags: [] },
          { text: "监理或业主在场确认拆改范围", tags: [] },
          { text: "简单开工仪式（可选）", tags: [] },
          { text: "材料清单第一批次进场确认", tags: [] }
        ]
      },
      {
        name: "施工期间",
        items: [
          { text: "水电改造验收（打压测试）", tags: [{ label: "关键节点", type: "key" }] },
          { text: "防水工程验收（闭水测试 48h）", tags: [{ label: "关键节点", type: "key" }] },
          { text: "木工、瓦工完工质量检查", tags: [] },
          { text: "油漆施工期间现场通风", tags: [] },
          { text: "每阶段验收后再付款", tags: [{ label: "合同约定", type: "warn" }] }
        ]
      },
      {
        name: "收尾与入住",
        items: [
          { text: "整体竣工验收", tags: [] },
          { text: "空气质量检测（建议专业机构）", tags: [{ label: "健康", type: "key" }] },
          { text: "装修保修合同、材料清单留存", tags: [] },
          { text: "通风 1-3 个月后再入住", tags: [] }
        ]
      }
    ]
  },
  house: {
    title: "买房收房计划",
    groups: [
      {
        name: "交易前资料",
        items: [
          { text: "身份证、户口本、结婚证（如适用）", tags: [] },
          { text: "购房资格证明（如需要）", tags: [] },
          { text: "首付款资金到位确认", tags: [{ label: "涉及银行", type: "bank" }] },
          { text: "贷款审批通过确认", tags: [{ label: "关键", type: "key" }] },
          { text: "购房合同及附件完整", tags: [] }
        ]
      },
      {
        name: "过户与登记",
        items: [
          { text: "不动产登记中心预约时间", tags: [{ label: "需预约", type: "warn" }] },
          { text: "银行放款时间确认", tags: [{ label: "涉及银行", type: "bank" }] },
          { text: "税费计算与准备", tags: [] },
          { text: "双方到场签字确认", tags: [] },
          { text: "领取不动产权证书", tags: [{ label: "关键凭证", type: "key" }] }
        ]
      },
      {
        name: "验房收房",
        items: [
          { text: "专业验房师陪同（建议）", tags: [] },
          { text: "墙体、地面、顶面空鼓检查", tags: [] },
          { text: "门窗、防水、水电设施测试", tags: [{ label: "仔细检查", type: "warn" }] },
          { text: "面积实测核对", tags: [] },
          { text: "发现问题书面记录并要求整改", tags: [{ label: "重要", type: "key" }] }
        ]
      },
      {
        name: "收房后事项",
        items: [
          { text: "水电燃气过户", tags: [] },
          { text: "物业费、维修基金缴纳", tags: [{ label: "涉及物业", type: "warn" }] },
          { text: "房屋钥匙、门禁卡、遥控器清点", tags: [] },
          { text: "原始购房合同、票据安全保管", tags: [{ label: "重要凭证", type: "key" }] }
        ]
      }
    ]
  },
  sign: {
    title: "签约计划",
    groups: [
      {
        name: "签约前准备",
        items: [
          { text: "合同最终版本双方确认", tags: [{ label: "关键", type: "key" }] },
          { text: "关键条款：金额、时间、责任、违约", tags: [] },
          { text: "补充条款、附件清单完整", tags: [] },
          { text: "对方法人代表/授权代表身份确认", tags: [] },
          { text: "印章、授权书等准备", tags: [{ label: "重要", type: "warn" }] }
        ]
      },
      {
        name: "签约当天",
        items: [
          { text: "双方当面签字盖章", tags: [] },
          { text: "每份合同核对页码、签字齐全", tags: [{ label: "仔细", type: "key" }] },
          { text: "一式多份，各方留存", tags: [] },
          { text: "签约现场拍照留档（如需要）", tags: [] },
          { text: "付款条件、时间节点确认", tags: [{ label: "涉及财务", type: "bank" }] }
        ]
      },
      {
        name: "签约后",
        items: [
          { text: "合同原件安全保管", tags: [] },
          { text: "合同扫描件云盘备份", tags: [{ label: "建议", type: "warn" }] },
          { text: "关键日期（付款、验收、续约）设置提醒", tags: [] },
          { text: "合同执行对接人信息记录", tags: [] }
        ]
      }
    ]
  },
  open: {
    title: "开业计划",
    groups: [
      {
        name: "开业前准备",
        items: [
          { text: "营业执照、经营许可证齐全", tags: [{ label: "关键", type: "key" }] },
          { text: "POS 系统、收银设备测试", tags: [] },
          { text: "开业活动方案、物料准备", tags: [] },
          { text: "会员卡、优惠券、代金券等准备", tags: [] },
          { text: "员工培训、排班、分工确认", tags: [] },
          { text: "库存商品第一批次到位", tags: [{ label: "提前 3 天", type: "warn" }] }
        ]
      },
      {
        name: "开业当天",
        items: [
          { text: "开业仪式（如需要）安排", tags: [] },
          { text: "门店清洁、陈列到位", tags: [] },
          { text: "收银、会员、促销流程走一遍测试", tags: [{ label: "开店前", type: "key" }] },
          { text: "开业宣传（朋友圈、周边派单）", tags: [] },
          { text: "开业销售数据、客单价简单记录", tags: [] }
        ]
      },
      {
        name: "开业后",
        items: [
          { text: "第 1 周数据复盘", tags: [] },
          { text: "顾客反馈收集与改进", tags: [] },
          { text: "会员体系优化", tags: [] },
          { text: "营业执照、卫生许可等悬挂展示", tags: [{ label: "合规", type: "warn" }] }
        ]
      }
    ]
  }
};

// 看好日 - 好日子列表（展示近期好日子）
const BROWSE_DAYS = [
  {
    date: "2026-06-22",
    day: 22, month: 6, weekday: "周日",
    time: "上午 9:00 - 11:00",
    suitable: ["提车", "签约", "出行", "开业"],
    avoid: ["搬家", "装修开工"],
    desc: "适合办理交付、签字、出门办事类事项。",
    tradYi: ["出行", "交易", "纳财"],
    tradJi: ["动土", "入宅", "安葬"],
    level: "best",
    levelText: "推荐办理"
  },
  {
    date: "2026-06-25",
    day: 25, month: 6, weekday: "周三",
    time: "上午",
    suitable: ["签约", "交易", "付款"],
    avoid: ["动土", "搬家"],
    desc: "适合处理沟通、合作、合同类事项。",
    tradYi: ["立券", "交易", "纳财"],
    tradJi: ["动土", "伐木"],
    level: "ok",
    levelText: "可以安排"
  },
  {
    date: "2026-06-27",
    day: 27, month: 6, weekday: "周五",
    time: "上午 8:30 开始",
    suitable: ["搬家", "入宅", "安床"],
    avoid: ["动土", "远行"],
    desc: "周五开始搬家，周末方便接着整理和入住。",
    tradYi: ["入宅", "移徙", "安床"],
    tradJi: ["动土", "破土"],
    level: "good",
    levelText: "不错的日子"
  },
  {
    date: "2026-06-28",
    day: 28, month: 6, weekday: "周六",
    time: "上午 10:00 前后",
    suitable: ["开业", "出行", "会友"],
    avoid: ["动土"],
    desc: "周末时间更方便，适合需要家人一起参与的事项。",
    tradYi: ["开市", "纳财", "会友"],
    tradJi: ["动土"],
    level: "good",
    levelText: "不错的日子"
  },
  {
    date: "2026-06-29",
    day: 29, month: 6, weekday: "周日",
    time: "上午",
    suitable: ["提车", "出行", "学习进修"],
    avoid: ["装修开工"],
    desc: "适合出门办事、办理交通工具相关的事情。",
    tradYi: ["出行", "交易", "入学"],
    tradJi: ["动土", "修造"],
    level: "best",
    levelText: "推荐办理"
  },
  {
    date: "2026-07-02",
    day: 2, month: 7, weekday: "周四",
    time: "上午",
    suitable: ["签约", "交易", "立券"],
    avoid: ["搬家"],
    desc: "适合合同签订、款项往来等商业事项。",
    tradYi: ["立券", "交易", "纳财"],
    tradJi: ["入宅", "移徙"],
    level: "ok",
    levelText: "可以安排"
  },
  {
    date: "2026-07-04",
    day: 4, month: 7, weekday: "周六",
    time: "上午",
    suitable: ["开业", "纳财", "出行"],
    avoid: ["动土"],
    desc: "适合新店开业、开市和日常出行。",
    tradYi: ["开市", "纳财", "出行"],
    tradJi: ["动土", "伐木"],
    level: "good",
    levelText: "不错的日子"
  }
];

// 日历标注（用于月历视图的简单提示）
const CALENDAR_MARKS = {
  "2026-06-22": "good",
  "2026-06-25": "good",
  "2026-06-27": "good",
  "2026-06-28": "good",
  "2026-06-29": "good",
  "2026-06-23": "bad",
  "2026-06-26": "good",
  "2026-07-02": "good",
  "2026-07-04": "good",
  "2026-07-05": "good",
  "2026-07-10": "good",
  "2026-07-11": "good",
  "2026-07-15": "good"
};

// 本地存储：计划
const STORAGE_KEY = "HZR_PLANS_V1";

function loadPlans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // 默认演示数据
  return [
    {
      id: "plan_car_demo",
      eventKey: "car",
      title: "提车计划",
      date: "2026-06-22",
      dateText: "6月22日 周日",
      time: "上午 9:00 - 11:00",
      status: "preparing",
      statusText: "准备中",
      summary: "适合出行、交易，适合车辆交付和提车回家。",
      tag: "推荐办理",
      checklist: CHECKLISTS.car.groups.map(g => ({
        groupName: g.name,
        items: g.items.map((it, idx) => ({
          id: `${g.name}_${idx}`,
          text: it.text,
          checked: (g.name === "证件资料" && idx < 2) || (g.name === "车辆检查" && idx === 0) ? true : false,
          tags: it.tags || [],
          note: it.note || "",
          reminder: it.reminder || ""
        }))
      }))
    },
    {
      id: "plan_move_demo",
      eventKey: "move",
      title: "搬家计划",
      date: "2026-07-03",
      dateText: "7月3日 周五",
      time: "上午 8:30",
      status: "waiting",
      statusText: "待准备",
      summary: "提前确认物业、电梯和搬家公司时间。",
      tag: "可以安排",
      checklist: CHECKLISTS.move.groups.map(g => ({
        groupName: g.name,
        items: g.items.map((it, idx) => ({
          id: `${g.name}_${idx}`,
          text: it.text,
          checked: (g.name === "搬家前准备" && idx < 5) ? true : false,
          tags: it.tags || [],
          note: it.note || "",
          reminder: it.reminder || ""
        }))
      }))
    },
    {
      id: "plan_house_demo",
      eventKey: "house",
      title: "买房收房",
      date: "2026-07-15",
      dateText: "7月15日 周三",
      time: "下午 2:00",
      status: "todo",
      statusText: "待确认",
      summary: "提前确认银行、不动产登记和验房安排。",
      tag: "作为备选",
      checklist: CHECKLISTS.house.groups.map(g => ({
        groupName: g.name,
        items: g.items.map((it, idx) => ({
          id: `${g.name}_${idx}`,
          text: it.text,
          checked: false,
          tags: it.tags || [],
          note: it.note || "",
          reminder: it.reminder || ""
        }))
      }))
    }
  ];
}

function savePlans(plans) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {}
}
