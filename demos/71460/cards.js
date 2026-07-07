const PRESET_CARDS = {
  "version": "1.0",
  "exportTime": "2026/7/5 01:28:18",
  "baseCards": [
    {
      "cardId": "gp_001",
      "cardType": "gamePlay",
      "name": "平台跳跃",
      "desc": "玩家操控角色在高低错落的平台之间移动、跳跃、二段跳，规避各类地形障碍，抵达关卡终点或完成指定闯关目标，属于轻量化通用基础玩法，可完美适配2D、3D各类游戏场景。",
      "tags": [
        "平台跳跃",
        "闯关",
        "移动探索",
        "轻量化玩法"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "gp_002",
      "cardType": "gamePlay",
      "name": "弹幕射击",
      "desc": "玩家操控飞行器或游戏角色，躲避高密度子弹弹幕，同时通过自动或手动发射弹幕清理敌方怪物，主打快速反应、节奏闯关、即时战斗的游戏体验。",
      "tags": [
        "弹幕",
        "射击",
        "反应闯关",
        "战斗玩法"
      ],
      "visual": {
        "fontStyle": "bold",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "gp_003",
      "cardType": "gamePlay",
      "name": "回合卡牌对战",
      "desc": "采用经典回合制轮流行动机制，玩家自由搭配手牌、释放技能、计算资源配比，与敌方单位博弈对抗，主打策略思考、数值搭配、战术运营的核心玩法。",
      "tags": [
        "回合制",
        "卡牌",
        "策略",
        "对战"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "gp_004",
      "cardType": "gamePlay",
      "name": "资源建造生存",
      "desc": "玩家在游戏场景内收集各类基础资源，解锁专属建造模块，自由搭建建筑、升级基地设施，维持角色生存状态，同时逐步解锁更多游戏内容与玩法。",
      "tags": [
        "资源收集",
        "建造",
        "生存",
        "养成"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "gp_005",
      "cardType": "gamePlay",
      "name": "肉鸽随机探索",
      "desc": "每局游戏开局地图、道具、增益buff均随机刷新，闯关失败后自动重置全部进度，玩家依靠随机词条自由搭配玩法，每局体验不同，拥有极高的重复游玩性。",
      "tags": [
        "roguelike",
        "随机",
        "探索",
        "高重复游玩"
      ],
      "visual": {
        "fontStyle": "art",
        "imgKey": "",
        "rarity": "rare"
      }
    },
    {
      "cardId": "sc_001",
      "cardType": "scene",
      "name": "2D维度场景",
      "desc": "全局采用二维平面美术与空间逻辑，无立体纵深视角，画面扁平化、风格统一，加载速度快，适配像素、卡通、赛博、复古等所有2D休闲、闯关、解谜小游戏。",
      "tags": [
        "2D",
        "平面视角",
        "轻量化",
        "二维美术"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "sc_002",
      "cardType": "scene",
      "name": "3D维度场景",
      "desc": "全局采用三维立体空间逻辑，拥有完整视角旋转、立体纵深、高低地形落差，支持光影、模型、立体交互，适配各类3D闯关、探索、射击、机甲类游戏。",
      "tags": [
        "3D",
        "立体视角",
        "空间纵深",
        "三维美术"
      ],
      "visual": {
        "fontStyle": "tech",
        "imgKey": "",
        "rarity": "rare"
      }
    },
    {
      "cardId": "sc_003",
      "cardType": "scene",
      "name": "像素地下城场景",
      "desc": "复古像素风格的地下迷宫场景，包含多层房间、隐秘暗道、地形陷阱、怪物固定刷新点，适配横版闯关、地下探险、密室解谜类游戏玩法。",
      "tags": [
        "地下城",
        "迷宫",
        "像素复古",
        "探险场景"
      ],
      "visual": {
        "fontStyle": "retro",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "sc_004",
      "cardType": "scene",
      "name": "赛博都市街巷场景",
      "desc": "潮流赛博朋克风格的城市街巷，自带霓虹灯光、高层楼宇、街边可交互物件，科技氛围感拉满，适配休闲闯关、跑酷、轻度射击玩法。",
      "tags": [
        "赛博朋克",
        "都市街巷",
        "科幻潮流",
        "灯光场景"
      ],
      "visual": {
        "fontStyle": "trendy",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "sc_005",
      "cardType": "scene",
      "name": "低模浮空岛屿场景",
      "desc": "低多边形卡通风格的浮空群岛场景，多座岛屿悬浮于空中，高低落差极大，搭配草地、岩石、浮空碎石等地形，适合跳跃、飞行、立体探索类玩法。",
      "tags": [
        "浮空岛屿",
        "低模美术",
        "立体地形",
        "空中场景"
      ],
      "visual": {
        "fontStyle": "cartoon",
        "imgKey": "",
        "rarity": "rare"
      }
    },
    {
      "cardId": "sc_006",
      "cardType": "scene",
      "name": "科幻机甲基地场景",
      "desc": "全金属科技风立体机甲基地，包含机械平台、升降装置、科技光源、机甲操作台等交互地形，适配机甲对战、科幻射击、立体闯关玩法。",
      "tags": [
        "科幻机甲",
        "工业基地",
        "机械地形",
        "科技场景"
      ],
      "visual": {
        "fontStyle": "hardcore",
        "imgKey": "",
        "rarity": "rare"
      }
    },
    {
      "cardId": "it_001",
      "cardType": "item",
      "name": "重力水晶",
      "desc": "功能性核心道具，角色拾取后可短暂改变全局重力规则，实现反向跳跃、空中浮空滞留、下坠减速等特殊操作，可大幅改变常规闯关移动机制。",
      "tags": [
        "重力操控",
        "机制道具",
        "闯关核心",
        "水晶道具"
      ],
      "visual": {
        "fontStyle": "magic",
        "imgKey": "",
        "rarity": "rare"
      }
    },
    {
      "cardId": "it_002",
      "cardType": "item",
      "name": "时空传送门",
      "desc": "空间交互类道具，使用后可在场景内生成临时传送光圈，支持角色定点瞬移、跨地形快速穿梭，规避复杂地形、怪物障碍，大幅提升闯关效率。",
      "tags": [
        "空间传送",
        "瞬移",
        "闯关辅助",
        "时空道具"
      ],
      "visual": {
        "fontStyle": "sci-fi",
        "imgKey": "",
        "rarity": "rare"
      }
    },
    {
      "cardId": "it_003",
      "cardType": "item",
      "name": "弹射飞镖",
      "desc": "多功能远程道具，投掷后可对敌方怪物造成伤害，也可命中特殊地形触发弹射机制、解锁隐藏机关，同时兼具战斗输出和解谜闯关双重功能。",
      "tags": [
        "远程攻击",
        "弹射机制",
        "解谜道具",
        "战斗辅助"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "it_004",
      "cardType": "item",
      "name": "万能建造模块",
      "desc": "地形改造类辅助道具，玩家可自由放置小型方块模块，搭建临时平台、桥梁、防护挡板，补齐地形缺口，自主改造闯关地形、开辟新路径。",
      "tags": [
        "地形改造",
        "自由建造",
        "平台搭建",
        "闯关辅助"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "it_005",
      "cardType": "item",
      "name": "时空回溯沙漏",
      "desc": "高容错保命道具，使用后可短暂回溯角色数秒内的位置、状态和操作记录，规避失误伤害、重置错误操作，大幅降低闯关难度，提升游戏体验。",
      "tags": [
        "时间回溯",
        "容错道具",
        "保命辅助",
        "高阶道具"
      ],
      "visual": {
        "fontStyle": "luxury",
        "imgKey": "",
        "rarity": "epic"
      }
    },
    {
      "cardId": "tc_001",
      "cardType": "tech",
      "name": "Three.js网页3D架构",
      "desc": "轻量化网页3D开发框架，无需厚重客户端支撑，可直接在浏览器内渲染3D模型、立体场景、光影特效，适配所有网页端轻量化3D小游戏开发。",
      "tags": [
        "网页3D",
        "Three.js",
        "轻量化引擎",
        "浏览器渲染"
      ],
      "visual": {
        "fontStyle": "tech",
        "imgKey": "",
        "rarity": "rare"
      }
    },
    {
      "cardId": "tc_002",
      "cardType": "tech",
      "name": "Unity全功能游戏架构",
      "desc": "全能商业游戏开发引擎，完美兼容2D、3D全场景开发，内置完整物理引擎、动画系统、特效系统，可开发高完成度、高画质的各类游戏作品。",
      "tags": [
        "Unity",
        "全功能引擎",
        "物理模拟",
        "高品质游戏"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "epic"
      }
    },
    {
      "cardId": "tc_003",
      "cardType": "tech",
      "name": "2D Canvas网页绘图架构",
      "desc": "浏览器原生2D绘图引擎，加载速度极快、零门槛轻量化、无多余性能消耗，适配所有2D像素、横版、休闲、解谜类轻量化网页小游戏。",
      "tags": [
        "2D",
        "Canvas",
        "原生网页",
        "超轻量化"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "tc_004",
      "cardType": "tech",
      "name": "Godot轻量开源架构",
      "desc": "免费开源轻量化游戏引擎，同时兼容2D、3D开发，运行高效、配置简洁，无版权限制，极度适合独立开发者快速制作创意小游戏。",
      "tags": [
        "Godot",
        "开源引擎",
        "轻量高效",
        "独立开发"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "common"
      }
    },
    {
      "cardId": "custom_1783009856061",
      "cardType": "gamePlay",
      "name": "极限竞速",
      "desc": "玩家驾驶赛车在场景中进行竞速，支持传统赛，计时赛等核心玩法。",
      "tags": [
        "竞速"
      ],
      "visual": {
        "fontStyle": "normal",
        "imgKey": "",
        "rarity": "rare"
      }
    }
  ],
  "fusionCards": [
    {
      "fusionCardId": "fusion_1783183579834",
      "cardType": "fusion",
      "name": "浮岛弹射建造者",
      "desc": "在低模浮空岛屿上，玩家通过弹射飞镖收集资源、激活机关，解锁建造模块搭建生存基地。利用立体地形跳跃探索，飞镖可弹射至多个岛屿触发隐藏区域，结合资源管理与建造生存，打造空中家园。",
      "sourceCardIds": [
        "gp_004",
        "sc_005",
        "it_003"
      ],
      "sourceCardNames": [
        "资源建造生存",
        "低模浮空岛屿场景",
        "弹射飞镖"
      ],
      "tags": [
        "资源收集",
        "弹射机制",
        "浮空岛屿",
        "生存建造",
        "建造",
        "生存"
      ],
      "isAIGenerated": true,
      "visual": {
        "fontStyle": "fusion_bold",
        "imgKey": "",
        "rarity": "epic"
      }
    },
    {
      "fusionCardId": "fusion_1783183296403",
      "cardType": "fusion",
      "name": "时空策略对决",
      "desc": "融合回合卡牌对战与3D立体场景，玩家在三维空间中利用时空传送门道具，灵活瞬移调整站位，结合策略卡牌释放技能，在浏览器中实现轻量化3D策略对战体验。",
      "sourceCardIds": [
        "gp_003",
        "sc_002",
        "it_002",
        "tc_001"
      ],
      "sourceCardNames": [
        "回合卡牌对战",
        "3D维度场景",
        "时空传送门",
        "Three.js网页3D架构"
      ],
      "tags": [
        "回合制",
        "3D策略",
        "时空传送",
        "网页轻量化",
        "卡牌",
        "策略"
      ],
      "visual": {
        "fontStyle": "fusion_bold",
        "imgKey": "",
        "rarity": "epic"
      }
    },
    {
      "fusionCardId": "fusion_1783183235945",
      "cardType": "fusion",
      "name": "重力跃迁平台",
      "desc": "在2D平面场景中，玩家操控角色利用平台跳跃和重力水晶，可随时改变重力方向，实现反向跳跃、浮空滞留等操作，规避地形障碍，完成高难度闯关挑战，带来全新移动解谜体验。",
      "sourceCardIds": [
        "gp_001",
        "sc_001",
        "it_001"
      ],
      "sourceCardNames": [
        "平台跳跃",
        "2D维度场景",
        "重力水晶"
      ],
      "tags": [
        "平台跳跃",
        "重力操控",
        "2D闯关",
        "机制融合",
        "闯关",
        "移动探索"
      ],
      "visual": {
        "fontStyle": "fusion_bold",
        "imgKey": "",
        "rarity": "epic"
      }
    },
    {
      "fusionCardId": "fusion_1783183208914",
      "cardType": "fusion",
      "name": "时空弹幕立方",
      "desc": "玩家在3D立体空间中操控飞行器，躲避来自四面八方的弹幕攻击，同时发射弹幕清理敌人。利用时空回溯沙漏能力，失误后可回溯数秒状态，大幅降低高难度弹幕闯关的挫败感，带来极致反应与策略并存的体验。",
      "sourceCardIds": [
        "gp_002",
        "sc_002",
        "it_005"
      ],
      "sourceCardNames": [
        "弹幕射击",
        "3D维度场景",
        "时空回溯沙漏"
      ],
      "tags": [
        "3D弹幕",
        "立体射击",
        "时空回溯",
        "高容错闯关",
        "弹幕",
        "射击"
      ],
      "visual": {
        "fontStyle": "fusion_bold",
        "imgKey": "",
        "rarity": "epic"
      }
    },
    {
      "fusionCardId": "fusion_1783010513918",
      "cardType": "fusion",
      "name": "随机建造冒险",
      "desc": "结合肉鸽随机探索与2D平面场景，每局地图、道具、增益随机生成，玩家利用万能建造模块自由搭建平台或桥梁，在Unity引擎支持下实现轻量化高重复游玩，每次闯关失败重置进度，体验独特路径与策略。",
      "sourceCardIds": [
        "gp_005",
        "sc_001",
        "it_004",
        "tc_002"
      ],
      "sourceCardNames": [
        "肉鸽随机探索",
        "2D维度场景",
        "万能建造模块",
        "Unity全功能游戏架构"
      ],
      "tags": [
        "roguelike",
        "2D建造",
        "随机探索",
        "高重复游玩",
        "随机",
        "探索"
      ],
      "visual": {
        "fontStyle": "fusion_bold",
        "imgKey": "",
        "rarity": "rare"
      }
    },
    {
      "fusionCardId": "fusion_1783009873626",
      "cardType": "fusion",
      "name": "地下城极限竞速",
      "desc": "融合像素地下城场景与竞速玩法，玩家驾驶赛车在多层迷宫赛道中飞驰，利用重力水晶道具实现反向跳跃或浮空穿越陷阱与怪物，在计时赛中争夺最快通关纪录，打造颠覆性地下探险竞速体验。",
      "sourceCardIds": [
        "custom_1783009856061",
        "sc_003",
        "it_001"
      ],
      "sourceCardNames": [
        "极限竞速",
        "像素地下城场景",
        "重力水晶"
      ],
      "tags": [
        "竞速",
        "地下城",
        "重力操控",
        "像素复古",
        "迷宫",
        "探险场景"
      ],
      "visual": {
        "fontStyle": "fusion_bold",
        "imgKey": "",
        "rarity": "rare"
      }
    }
  ]
};