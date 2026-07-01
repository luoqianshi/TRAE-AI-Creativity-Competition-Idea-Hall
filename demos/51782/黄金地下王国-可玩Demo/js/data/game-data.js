// ============================================================
// GameData - data/game-data.js
// 自动从 game.js 拆分
// ============================================================

const GameData = {
    // 职业数据
    classes: {
        warrior: {
            name: '战士',
            nameEn: 'Warrior',
            position: '前卫',
            role: '攻击',
            desc: '身披重甲的前线战士，擅长近战攻击和防御。拥有高HP和防御力，是队伍的坚实盾牌。',
            portrait: 'assets/characters/warrior_0.png',
            icon: 'assets/ui/icon/warrior_0_icon.png',
            appearances: [
                { id: 'warrior_0', portrait: 'assets/characters/warrior_0.png', icon: 'assets/ui/icon/warrior_0_icon.png', desc: '战士外观1', gender: 'M' },
                { id: 'warrior_1', portrait: 'assets/characters/warrior_1.png', icon: 'assets/ui/icon/warrior_1_icon.png', desc: '战士外观2', gender: 'F' },
                { id: 'warrior_2', portrait: 'assets/characters/warrior_2.png', icon: 'assets/ui/icon/warrior_2_icon.png', desc: '战士外观3', gender: 'M' },
                { id: 'warrior_3', portrait: 'assets/characters/warrior_3.png', icon: 'assets/ui/icon/warrior_3_icon.png', desc: '战士外观4', gender: 'F' },
                { id: 'warrior_4', portrait: 'assets/characters/warrior_4.png', icon: 'assets/ui/icon/warrior_4_icon.png', desc: '战士外观5', gender: 'M' }
            ],
            baseStats: { HP: 45, TP: 20, STR: 12, INT: 4, VIT: 10, AGI: 6, LUC: 5 },
            growthRates: { HP: 8, TP: 3, STR: 2, INT: 1, VIT: 2, AGI: 1, LUC: 1 },
            skills: [
                { id: 'slash', name: '斩击', desc: '对单体敌人造成物理伤害', tpCost: 3, type: 'physical', power: 1.5, target: 'single', level: 1 },
                { id: 'iron_wall', name: '铁壁', desc: '提升自身防御力3回合', tpCost: 5, type: 'buff', target: 'self', level: 3 },
                { id: 'whirlwind', name: '旋风斩', desc: '对全体敌人造成物理伤害', tpCost: 10, type: 'physical', power: 1.2, target: 'all', level: 5 }
            ]
        },
        mage: {
            name: '法师',
            nameEn: 'Mage',
            position: '后卫',
            role: '魔法',
            locked: false,
            desc: '掌握元素魔法的智者，擅长远程魔法攻击。虽然身体脆弱，但魔法威力强大。',
            portrait: 'assets/characters/mage_0.png',
            icon: 'assets/ui/icon/mage_0_icon.png',
            appearances: [
                { id: 'mage_0', portrait: 'assets/characters/mage_0.png', icon: 'assets/ui/icon/mage_0_icon.png', desc: '紫袍男法师', gender: 'F' },
                { id: 'mage_1', portrait: 'assets/characters/mage_1.png', icon: 'assets/ui/icon/mage_1_icon.png', desc: '蓝帽女法师', gender: 'F' },
                { id: 'mage_2', portrait: 'assets/characters/mage_2.png', icon: 'assets/ui/icon/mage_2_icon.png', desc: '白发老法师', gender: 'M' },
                { id: 'mage_3', portrait: 'assets/characters/mage_3.png', icon: 'assets/ui/icon/mage_3_icon.png', desc: '绿衣少年法师', gender: 'F' },
                { id: 'mage_4', portrait: 'assets/characters/mage_4.png', icon: 'assets/ui/icon/mage_4_icon.png', desc: '红衣少女法师', gender: 'M' }
            ],
            baseStats: { HP: 28, TP: 35, STR: 4, INT: 14, VIT: 4, AGI: 7, LUC: 6 },
            growthRates: { HP: 4, TP: 5, STR: 1, INT: 3, VIT: 1, AGI: 1, LUC: 1 },
            skills: [
                { id: 'fireball', name: '火球术', desc: '发射火球造成火属性魔法伤害', tpCost: 5, type: 'magic', element: 'fire', power: 2.0, target: 'single', level: 1 },
                { id: 'ice', name: '冰霜术', desc: '释放寒冰造成冰属性魔法伤害', tpCost: 5, type: 'magic', element: 'ice', power: 2.0, target: 'single', level: 3 },
                { id: 'thunder', name: '雷击术', desc: '召唤雷电造成雷属性魔法伤害', tpCost: 8, type: 'magic', element: 'thunder', power: 2.5, target: 'single', level: 5 }
            ]
        },
        medic: {
            name: '医师',
            nameEn: 'Medic',
            position: '后卫',
            role: '恢复',
            desc: '精通医术的治愈专家，擅长恢复和辅助魔法。是队伍中不可或缺的后援力量。',
            portrait: '',
            icon: '',
            appearances: [
                { id: 'medic_0', portrait: '', icon: '', desc: '医师外观1' },
                { id: 'medic_1', portrait: '', icon: '', desc: '医师外观2' },
                { id: 'medic_2', portrait: '', icon: '', desc: '医师外观3' },
                { id: 'medic_3', portrait: '', icon: '', desc: '医师外观4' }
            ],
            baseStats: { HP: 32, TP: 30, STR: 5, INT: 10, VIT: 7, AGI: 5, LUC: 8 },
            growthRates: { HP: 5, TP: 4, STR: 1, INT: 2, VIT: 1, AGI: 1, LUC: 2 },
            skills: [
                { id: 'heal', name: '治疗术', desc: '恢复一名队友的HP', tpCost: 4, type: 'heal', power: 3.0, target: 'single_ally', level: 1 },
                { id: 'group_heal', name: '群体治疗', desc: '恢复全体队友的HP', tpCost: 10, type: 'heal', power: 2.0, target: 'all_ally', level: 3 },
                { id: 'holy_light', name: '神圣之光', desc: '以圣光攻击敌人', tpCost: 8, type: 'magic', element: 'light', power: 2.2, target: 'single', level: 5 }
            ]
        },
        ranger: {
            name: '游侠',
            nameEn: 'Ranger',
            position: '后卫',
            role: '侦察',
            desc: '敏捷的远程攻击者，擅长精准射击和陷阱战术。速度和运气是其最大优势。',
            portrait: '',
            icon: '',
            appearances: [
                { id: 'ranger_0', portrait: '', icon: '', desc: '绿衣男游侠' },
                { id: 'ranger_1', portrait: '', icon: '', desc: '红发女游侠' },
                { id: 'ranger_2', portrait: '', icon: '', desc: '黑衣暗游侠' },
                { id: 'ranger_3', portrait: '', icon: '', desc: '精灵游侠' }
            ],
            baseStats: { HP: 30, TP: 25, STR: 9, INT: 6, VIT: 5, AGI: 12, LUC: 10 },
            growthRates: { HP: 5, TP: 4, STR: 2, INT: 1, VIT: 1, AGI: 2, LUC: 2 },
            skills: [
                { id: 'precise_shot', name: '精准射击', desc: '对单体造成高伤害物理攻击', tpCost: 5, type: 'physical', power: 2.0, target: 'single', level: 1 },
                { id: 'poison_arrow', name: '毒箭', desc: '附加中毒效果的攻击', tpCost: 4, type: 'physical', power: 1.2, target: 'single', level: 3, status: 'poison' },
                { id: 'trap', name: '陷阱设置', desc: '设置陷阱降低敌人速度', tpCost: 6, type: 'debuff', target: 'all', level: 5 }
            ]
        },
        paladin: {
            name: '圣骑士',
            nameEn: 'Paladin',
            position: '前卫',
            role: '防御',
            desc: '以信仰为盾的圣战士，兼具防御与治愈能力，是队伍最可靠的前线守护者。',
            portrait: '',
            icon: '',
            appearances: [
                { id: 'paladin_0', portrait: '', icon: '', desc: '银甲男圣骑士' },
                { id: 'paladin_1', portrait: '', icon: '', desc: '金甲女圣骑士' },
                { id: 'paladin_2', portrait: '', icon: '', desc: '黑甲圣骑士' },
                { id: 'paladin_3', portrait: '', icon: '', desc: '少年见习圣骑士' }
            ],
            baseStats: { HP: 42, TP: 18, STR: 10, INT: 5, VIT: 12, AGI: 4, LUC: 6 },
            growthRates: { HP: 7, TP: 2, STR: 2, INT: 1, VIT: 3, AGI: 1, LUC: 1 },
            skills: [
                { id: 'holy_slash', name: '圣光斩', desc: '以圣光之力斩击单体敌人', tpCost: 4, type: 'physical', element: 'light', power: 1.8, target: 'single', level: 1 },
                { id: 'divine_shield', name: '神圣护盾', desc: '为自身附加神圣护盾，提升防御力', tpCost: 6, type: 'buff', target: 'self', level: 3 },
                { id: 'great_heal', name: '大治愈', desc: '恢复全体队友的HP', tpCost: 12, type: 'heal', power: 2.5, target: 'all_ally', level: 5 }
            ]
        },
        dancer: {
            name: '舞者',
            nameEn: 'Dancer',
            position: '前卫',
            role: '辅助',
            desc: '以优雅舞姿迷惑敌人的舞者，速度极快，能同时攻敌和辅助队友。',
            portrait: '',
            icon: '',
            appearances: [
                { id: 'dancer_0', portrait: '', icon: '', desc: '红裙女舞者' },
                { id: 'dancer_1', portrait: '', icon: '', desc: '蓝衣男舞者' },
                { id: 'dancer_2', portrait: '', icon: '', desc: '紫衣精灵舞者' },
                { id: 'dancer_3', portrait: '', icon: '', desc: '金饰异域舞者' }
            ],
            baseStats: { HP: 30, TP: 28, STR: 7, INT: 8, VIT: 5, AGI: 13, LUC: 10 },
            growthRates: { HP: 5, TP: 4, STR: 1, INT: 2, VIT: 1, AGI: 3, LUC: 2 },
            skills: [
                { id: 'whirl_kick', name: '旋风踢', desc: '以旋转踢击攻击单体敌人', tpCost: 4, type: 'physical', power: 1.6, target: 'single', level: 1 },
                { id: 'seduction_dance', name: '诱惑之舞', desc: '以舞蹈迷惑全体敌人，降低速度', tpCost: 8, type: 'debuff', target: 'all', level: 3 },
                { id: 'healing_dance', name: '治愈之舞', desc: '以舞蹈之力恢复一名队友的HP', tpCost: 6, type: 'heal', power: 2.5, target: 'single_ally', level: 5 }
            ]
        },
        hexer: {
            name: '咒术师',
            nameEn: 'Hexer',
            position: '后卫',
            role: '减益',
            desc: '操纵诅咒与恐惧的暗术师，擅长削弱敌人，是控制战局的关键角色。',
            portrait: '',
            icon: '',
            appearances: [
                { id: 'hexer_0', portrait: '', icon: '', desc: '黑袍男咒术师' },
                { id: 'hexer_1', portrait: '', icon: '', desc: '紫眼女咒术师' },
                { id: 'hexer_2', portrait: '', icon: '', desc: '骷髅面具咒术师' },
                { id: 'hexer_3', portrait: '', icon: '', desc: '少年暗咒术师' }
            ],
            baseStats: { HP: 26, TP: 32, STR: 3, INT: 13, VIT: 4, AGI: 6, LUC: 8 },
            growthRates: { HP: 3, TP: 5, STR: 1, INT: 3, VIT: 1, AGI: 1, LUC: 2 },
            skills: [
                { id: 'curse', name: '诅咒', desc: '对单体敌人施加诅咒，降低全属性', tpCost: 5, type: 'debuff', target: 'single', level: 1 },
                { id: 'fear', name: '恐惧', desc: '令全体敌人陷入恐惧状态', tpCost: 10, type: 'debuff', target: 'all', level: 3 },
                { id: 'doom', name: '厄运', desc: '对单体敌人施加强力厄运诅咒', tpCost: 12, type: 'debuff', power: 2.0, target: 'single', level: 5 }
            ]
        },
        alchemist: {
            name: '炼金术师',
            nameEn: 'Alchemist',
            position: '后卫',
            role: '道具',
            desc: '精通炼金术的学者，能调配各种药剂攻击敌人或恢复队友。',
            portrait: '',
            icon: '',
            appearances: [
                { id: 'alchemist_0', portrait: '', icon: '', desc: '眼镜男炼金术师' },
                { id: 'alchemist_1', portrait: '', icon: '', desc: '绿发女炼金术师' },
                { id: 'alchemist_2', portrait: '', icon: '', desc: '白须老炼金术师' },
                { id: 'alchemist_3', portrait: '', icon: '', desc: '少年见习炼金术师' }
            ],
            baseStats: { HP: 28, TP: 34, STR: 4, INT: 12, VIT: 5, AGI: 7, LUC: 7 },
            growthRates: { HP: 4, TP: 5, STR: 1, INT: 3, VIT: 1, AGI: 1, LUC: 1 },
            skills: [
                { id: 'bomb', name: '投掷炸弹', desc: '投掷炼金炸弹，对全体敌人造成火属性伤害', tpCost: 8, type: 'magic', element: 'fire', power: 1.5, target: 'all', level: 1 },
                { id: 'mix_heal', name: '调和', desc: '调配恢复药剂，恢复全体队友的HP', tpCost: 10, type: 'heal', power: 2.0, target: 'all_ally', level: 3 },
                { id: 'analyze', name: '分析', desc: '分析敌人弱点，对全体敌人施加减益', tpCost: 6, type: 'debuff', target: 'all', level: 5 }
            ]
        },
        prince: {
            name: '王子',
            nameEn: 'Prince',
            position: '前卫',
            role: '强化',
            desc: '天生的领袖，能以号令之力强化全队，使队伍战斗力大幅提升。',
            portrait: '',
            icon: '',
            appearances: [
                { id: 'prince_0', portrait: '', icon: '', desc: '金冠男王子' },
                { id: 'prince_1', portrait: '', icon: '', desc: '银冠女王子' },
                { id: 'prince_2', portrait: '', icon: '', desc: '红袍少年王子' },
                { id: 'prince_3', portrait: '', icon: '', desc: '异国王子' }
            ],
            baseStats: { HP: 35, TP: 25, STR: 8, INT: 9, VIT: 8, AGI: 6, LUC: 8 },
            growthRates: { HP: 6, TP: 3, STR: 2, INT: 2, VIT: 2, AGI: 1, LUC: 1 },
            skills: [
                { id: 'royal_order', name: '王令', desc: '以王之号令提升全体队友攻击力', tpCost: 6, type: 'buff', target: 'all_ally', level: 1 },
                { id: 'heal_order', name: '治疗号令', desc: '号令治愈之力，恢复全体队友的HP', tpCost: 10, type: 'heal', power: 2.0, target: 'all_ally', level: 3 },
                { id: 'rally', name: '鼓舞', desc: '鼓舞全队士气，提升全体属性', tpCost: 12, type: 'buff', target: 'all_ally', level: 5 }
            ]
        },
        samurai: {
            name: '武士',
            nameEn: 'Samurai',
            position: '前卫',
            role: '攻击',
            locked: false,
            desc: '追求极致剑道的东方武士，攻击力极高，以一击必杀为信条。',
            portrait: 'assets/characters/samurai_0.png',
            icon: 'assets/ui/icon/samurai_0_icon.png',
            appearances: [
                { id: 'samurai_0', portrait: 'assets/characters/samurai_0.png', icon: 'assets/ui/icon/samurai_0_icon.png', desc: '黑甲男武士', gender: 'M' },
                { id: 'samurai_1', portrait: 'assets/characters/samurai_1.png', icon: 'assets/ui/icon/samurai_1_icon.png', desc: '红衣女武士', gender: 'M' },
                { id: 'samurai_2', portrait: 'assets/characters/samurai_2.png', icon: 'assets/ui/icon/samurai_2_icon.png', desc: '白发老武士', gender: 'F' },
                { id: 'samurai_3', portrait: 'assets/characters/samurai_3.png', icon: 'assets/ui/icon/samurai_3_icon.png', desc: '少年见习武士', gender: 'F' },
                { id: 'samurai_4', portrait: 'assets/characters/samurai_4.png', icon: 'assets/ui/icon/samurai_4_icon.png', desc: '浪人武士', gender: 'F' }
            ],
            baseStats: { HP: 40, TP: 22, STR: 13, INT: 3, VIT: 8, AGI: 8, LUC: 5 },
            growthRates: { HP: 7, TP: 3, STR: 3, INT: 1, VIT: 2, AGI: 2, LUC: 1 },
            skills: [
                { id: 'quick_draw', name: '居合斩', desc: '以极速拔刀斩击单体，造成巨大伤害', tpCost: 5, type: 'physical', power: 2.5, target: 'single', level: 1 },
                { id: 'counter', name: '逆风', desc: '进入反击姿态，自动反击攻击者', tpCost: 6, type: 'buff', target: 'self', level: 3 },
                { id: 'flash', name: '一闪', desc: '以闪电般的速度斩击全体敌人', tpCost: 12, type: 'physical', power: 1.5, target: 'all', level: 5 }
            ]
        },
        hunter: {
            name: '猎人',
            nameEn: 'Hunter',
            position: '后卫',
            role: '侦察',
            desc: '经验丰富的猎手，擅长追踪和精准打击，陷阱与箭术并用的全能型角色。',
            portrait: '角色立绘/hunter_0.jpg',
            icon: 'assets/ui/icon/hunter_0_icon.png',
            appearances: [
                { id: 'hunter_0', portrait: '角色立绘/hunter_0.jpg', icon: 'assets/ui/icon/hunter_0_icon.png', desc: '胡须男猎人' },
                { id: 'hunter_1', portrait: '角色立绘/hunter_1.jpg', icon: 'assets/ui/icon/hunter_1_icon.png', desc: '皮帽女猎人' },
                { id: 'hunter_2', portrait: '', icon: '', desc: '矮人猎人' },
                { id: 'hunter_3', portrait: '', icon: '', desc: '少年猎人' }
            ],
            baseStats: { HP: 32, TP: 24, STR: 8, INT: 6, VIT: 6, AGI: 11, LUC: 9 },
            growthRates: { HP: 5, TP: 4, STR: 2, INT: 1, VIT: 1, AGI: 2, LUC: 2 },
            skills: [
                { id: 'aimed_shot', name: '精准射击', desc: '瞄准弱点射击单体敌人，造成高伤害', tpCost: 5, type: 'physical', power: 2.2, target: 'single', level: 1 },
                { id: 'snare', name: '陷阱', desc: '设置陷阱使全体敌人减速', tpCost: 6, type: 'debuff', target: 'all', level: 3 },
                { id: 'pursuit', name: '追踪', desc: '追踪猎物弱点，对单体造成致命伤害', tpCost: 10, type: 'physical', power: 2.8, target: 'single', level: 5 }
            ]
        },
        hoplite: {
            name: '枪兵',
            nameEn: 'Hoplite',
            position: '前卫',
            role: '防御',
            desc: '手持长枪与重盾的重装步兵，拥有全职业最高的防御力和HP。',
            portrait: '',
            icon: '',
            appearances: [
                { id: 'hoplite_0', portrait: '', icon: '', desc: '重甲男枪兵' },
                { id: 'hoplite_1', portrait: '', icon: '', desc: '女枪兵' },
                { id: 'hoplite_2', portrait: '', icon: '', desc: '矮人枪兵' },
                { id: 'hoplite_3', portrait: '', icon: '', desc: '少年见习枪兵' }
            ],
            baseStats: { HP: 48, TP: 15, STR: 9, INT: 3, VIT: 13, AGI: 3, LUC: 5 },
            growthRates: { HP: 9, TP: 2, STR: 2, INT: 1, VIT: 3, AGI: 1, LUC: 1 },
            skills: [
                { id: 'shield_bash', name: '盾击', desc: '以盾牌猛击单体敌人，有几率造成眩晕', tpCost: 4, type: 'physical', power: 1.4, target: 'single', level: 1 },
                { id: 'phalanx', name: '铁壁', desc: '组成防御阵型，提升全体队友防御力', tpCost: 8, type: 'buff', target: 'all_ally', level: 3 },
                { id: 'hold_fort', name: '坚守', desc: '坚守阵地，大幅提升自身防御力', tpCost: 10, type: 'buff', target: 'self', level: 5 }
            ]
        },
        monk: {
            name: '武僧',
            nameEn: 'Monk',
            position: '前卫',
            role: '格斗',
            desc: '以肉体为武器的格斗专家，擅长徒手格斗和气功。通过修行获得超凡的力量和速度。',
            portrait: '',
            icon: '',
            appearances: [
                { id: 'monk_0', portrait: '', icon: '', desc: '武僧外观1' },
                { id: 'monk_1', portrait: '', icon: '', desc: '武僧外观2' },
                { id: 'monk_2', portrait: '', icon: '', desc: '武僧外观3' },
                { id: 'monk_3', portrait: '', icon: '', desc: '武僧外观4' }
            ],
            baseStats: { HP: 38, TP: 25, STR: 11, INT: 5, VIT: 7, AGI: 10, LUC: 6 },
            growthRates: { HP: 6, TP: 3, STR: 2, INT: 1, VIT: 2, AGI: 2, LUC: 1 },
            skills: [
                { id: 'palm_strike', name: '掌击', desc: '以掌击攻击单体敌人，有几率造成眩晕', tpCost: 3, type: 'physical', power: 1.6, target: 'single', level: 1 },
                { id: 'chakra', name: '气功', desc: '聚集气功，提升自身攻击力', tpCost: 5, type: 'buff', target: 'self', level: 3 },
                { id: 'flying_kick', name: '飞踢', desc: '跃起对单体敌人造成强力踢击', tpCost: 8, type: 'physical', power: 2.5, target: 'single', level: 5 }
            ]
        }
    },

    // AI行为树预设模板
    // Phase 4: 移除自动使用道具，改为防御
    aiPresets: {
        aggressive: {
            name: '攻击型',
            icon: '⚔️',
            description: '优先输出，积极进攻',
            behaviorTree: [
                {
                    id: 'emergency_defend',
                    name: '紧急防御',
                    priority: 100,
                    type: 'condition',
                    condition: { type: 'self_hp_below', value: 20 },
                    action: { type: 'defend' },
                    enabled: true
                },
                {
                    id: 'power_attack',
                    name: '强力技能',
                    priority: 50,
                    type: 'condition',
                    condition: { type: 'self_tp_above', value: 15 },
                    action: { type: 'use_skill', skillIndex: 0, targetStrategy: 'lowest_hp_enemy' },
                    enabled: true
                },
                {
                    id: 'basic_attack',
                    name: '普通攻击',
                    priority: 10,
                    type: 'action',
                    action: { type: 'attack', targetStrategy: 'lowest_hp_enemy' },
                    enabled: true
                }
            ]
        },
        defensive: {
            name: '防御型',
            icon: '🛡️',
            description: '优先生存，谨慎作战',
            behaviorTree: [
                {
                    id: 'emergency_defend',
                    name: '紧急防御',
                    priority: 100,
                    type: 'condition',
                    condition: { type: 'self_hp_below', value: 30 },
                    action: { type: 'defend' },
                    enabled: true
                },
                {
                    id: 'defend_low_hp',
                    name: '防御姿态',
                    priority: 80,
                    type: 'condition',
                    condition: { type: 'self_hp_below', value: 50 },
                    action: { type: 'defend' },
                    enabled: true
                },
                {
                    id: 'basic_attack',
                    name: '普通攻击',
                    priority: 10,
                    type: 'action',
                    action: { type: 'attack', targetStrategy: 'lowest_hp_enemy' },
                    enabled: true
                }
            ]
        },
        balanced: {
            name: '平衡型',
            icon: '⚖️',
            description: '攻守兼备，灵活应对',
            behaviorTree: [
                {
                    id: 'emergency_defend',
                    name: '紧急防御',
                    priority: 100,
                    type: 'condition',
                    condition: { type: 'self_hp_below', value: 25 },
                    action: { type: 'defend' },
                    enabled: true
                },
                {
                    id: 'power_attack',
                    name: '强力技能',
                    priority: 50,
                    type: 'condition',
                    condition: { type: 'self_tp_above', value: 20 },
                    action: { type: 'use_skill', skillIndex: 0, targetStrategy: 'lowest_hp_enemy' },
                    enabled: true
                },
                {
                    id: 'basic_attack',
                    name: '普通攻击',
                    priority: 10,
                    type: 'action',
                    action: { type: 'attack', targetStrategy: 'lowest_hp_enemy' },
                    enabled: true
                }
            ]
        },
        support: {
            name: '辅助型',
            icon: '💚',
            description: '优先治疗队友，支援作战',
            behaviorTree: [
                {
                    id: 'emergency_defend',
                    name: '紧急防御',
                    priority: 100,
                    type: 'condition',
                    condition: { type: 'self_hp_below', value: 20 },
                    action: { type: 'defend' },
                    enabled: true
                },
                {
                    id: 'heal_ally',
                    name: '队友救援',
                    priority: 90,
                    type: 'condition',
                    condition: { type: 'ally_hp_below', value: 40 },
                    action: { type: 'use_skill', skillIndex: 1, targetStrategy: 'lowest_hp_ally' },
                    enabled: true
                },
                {
                    id: 'basic_attack',
                    name: '普通攻击',
                    priority: 10,
                    type: 'action',
                    action: { type: 'attack', targetStrategy: 'lowest_hp_enemy' },
                    enabled: true
                }
            ]
        }
    },

    // 性格权重模板
    personalityTemplates: {
        reckless:  { attack: 0.7, defense: 0.2, cooperation: 0.1, name: '鲁莽', desc: '纯进攻型，冲在最前面' },
        cautious:  { attack: 0.2, defense: 0.7, cooperation: 0.1, name: '小心', desc: '纯防御型，谨慎作战' },
        backstage: { attack: 0.1, defense: 0.2, cooperation: 0.7, name: '幕后', desc: '纯辅助型，支援队友' },
        balanced:  { attack: 0.33, defense: 0.33, cooperation: 0.34, name: '均衡', desc: '攻守兼备，灵活应对' }
    },

    // AI预设与性格模板的映射
    aiPresetToPersonality: {
        aggressive: 'reckless',
        defensive: 'cautious',
        balanced: 'balanced',
        support: 'backstage'
    },

    // AI条件类型定义
    aiConditionTypes: {
        self_hp_below: { name: '自身HP低于', unit: '%', min: 0, max: 100 },
        self_hp_above: { name: '自身HP高于', unit: '%', min: 0, max: 100 },
        self_tp_above: { name: '自身TP高于', unit: '', min: 0, max: 999 },
        self_tp_below: { name: '自身TP低于', unit: '', min: 0, max: 999 },
        ally_hp_below: { name: '队友HP低于', unit: '%', min: 0, max: 100 },
        enemy_count_above: { name: '敌人数量≥', unit: '', min: 1, max: 10 },
        turn_above: { name: '回合数≥', unit: '', min: 1, max: 50 },
        always: { name: '无条件', unit: '', min: 0, max: 0 }
    },

    // AI行动类型定义
    aiActionTypes: {
        attack: { name: '攻击', targetTypes: ['lowest_hp_enemy', 'highest_threat', 'random_enemy'] },
        use_skill: { name: '使用技能', requiresSkill: true },
        use_item: { name: '使用道具', requiresItem: true },
        defend: { name: '防御' },
        flee: { name: '逃跑' }
    },

    // 目标策略
    aiTargetStrategies: {
        lowest_hp_enemy: { name: 'HP最低的敌人' },
        highest_threat: { name: '威胁最高的敌人' },
        random_enemy: { name: '随机敌人' },
        lowest_hp_ally: { name: 'HP最低的队友' },
        self: { name: '自身' }
    },

    // 怪物数据
    monsters: {
        // B1F 怪物
        emerald_slime: {
            name: '翡翠史莱姆', image: 'assets/monsters/emerald_slime.png',
            hp: 60, atk: 8, def: 3, agi: 3, exp: 10, gold: 5, bodySize: 'small',
            skills: [{ name: '体撞', power: 1.0, type: 'physical' }]
        },
        forest_bat: {
            name: '树海蝙蝠', image: 'assets/monsters/forest_bat.png',
            hp: 50, atk: 10, def: 2, agi: 8, exp: 12, gold: 8, bodySize: 'medium_small',
            skills: [{ name: '超声波', power: 1.2, type: 'physical' }]
        },
        scissor_beetle: {
            name: '剪刀甲虫', image: 'assets/monsters/scissor_beetle.png',
            hp: 70, atk: 12, def: 5, agi: 6, exp: 15, gold: 10, bodySize: 'medium_small',
            skills: [{ name: '剪刀斩', power: 1.3, type: 'physical' }]
        },
        forest_mouse: {
            name: '森林鼠', image: 'assets/monsters/forest_mouse.png',
            hp: 30, atk: 5, def: 1, agi: 10, exp: 5, gold: 3, bodySize: 'small',
            skills: [{ name: '撕咬', power: 0.8, type: 'physical' }]
        },
        // B2F 怪物
        poison_swallowtail: {
            name: '毒吹凤蝶', image: 'assets/monsters/poison_swallowtail.png',
            hp: 80, atk: 14, def: 4, agi: 7, exp: 20, gold: 12, bodySize: 'medium_small',
            skills: [{ name: '毒鳞粉', power: 1.1, type: 'magic', element: 'poison' }]
        },
        mandrake: {
            name: '曼德拉草', image: 'assets/monsters/mandrake.png',
            hp: 90, atk: 10, def: 6, agi: 3, exp: 18, gold: 10, bodySize: 'medium_small',
            skills: [
                { name: '尖叫', power: 1.2, type: 'magic', element: 'sonic' },
                { name: '根须缠绕', power: 1.0, type: 'physical', effect: 'bind' }
            ]
        },
        findhorn_deer: {
            name: '芬德角鹿', image: 'assets/monsters/findhorn_deer.png',
            hp: 100, atk: 12, def: 5, agi: 8, exp: 22, gold: 15, bodySize: 'medium',
            skills: [{ name: '角突', power: 1.3, type: 'physical' }]
        },
        // B2F FOE
        mad_stag_foe: {
            name: '狂乱角鹿', image: 'assets/monsters/mad_stag_foe.png',
            hp: 240, atk: 25, def: 12, agi: 10, exp: 80, gold: 50, isFoe: true, bodySize: 'large',
            skills: [
                { name: '狂乱冲撞', power: 1.6, type: 'physical' },
                { name: '角突', power: 1.3, type: 'physical' }
            ]
        },
        // B3F 怪物
        rot_root_treant: {
            name: '腐根树人', image: 'assets/monsters/rot_root_treant.png',
            hp: 160, atk: 18, def: 12, agi: 2, exp: 40, gold: 25, bodySize: 'medium',
            skills: [
                { name: '树枝鞭打', power: 1.4, type: 'physical' },
                { name: '生命吸取', power: 1.1, type: 'magic', drain: true }
            ]
        },
        bone_warrior: {
            name: '骸骨战士', image: 'assets/monsters/bone_warrior.png',
            hp: 100, atk: 15, def: 8, agi: 5, exp: 25, gold: 15, bodySize: 'medium',
            skills: [
                { name: '骨刃斩', power: 1.3, type: 'physical' },
                { name: '诅咒', power: 1.0, type: 'magic' }
            ]
        },
        // B3F FOE
        raging_bull_foe: {
            name: '狂暴野牛', image: 'assets/monsters/raging_bull_foe.png',
            hp: 300, atk: 30, def: 15, agi: 8, exp: 100, gold: 60, isFoe: true, bodySize: 'large',
            skills: [
                { name: '狂暴冲锋', power: 1.7, type: 'physical' },
                { name: '木质化皮肤', power: 1.0, type: 'buff', effect: 'def_up' }
            ]
        },
        // B3F Boss
        ancient_dragon_boss: {
            name: '远古巨龙', image: 'assets/monsters/ancient_dragon_boss.png',
            hp: 600, atk: 30, def: 20, agi: 6, exp: 200, gold: 150, isBoss: true, bodySize: 'giant',
            skills: [
                { name: '龙爪', power: 1.5, type: 'physical' },
                { name: '龙息', power: 2.0, type: 'magic', element: 'fire' },
                { name: '尾击', power: 1.3, type: 'physical', target: 'all' }
            ]
        }
    },

    // 每层怪物出现列表
    floorMonsters: {
        0: ['emerald_slime', 'forest_bat', 'scissor_beetle', 'forest_mouse'],
        1: ['forest_bat', 'scissor_beetle', 'poison_swallowtail', 'mandrake', 'findhorn_deer'],
        2: ['rot_root_treant', 'bone_warrior']
    },

    // FOE怪物出现配置（按楼层）
    floorFoes: {
        1: ['mad_stag_foe'],
        2: ['raging_bull_foe']
    },

    // Boss配置（按楼层）
    floorBosses: {
        2: 'ancient_dragon_boss'
    },

    // 商店物品
    shopItems: {
        items: [
            { id: 'heal_potion', name: '回复药', desc: '恢复50点HP', price: 30, effect: { type: 'heal_hp', value: 50 } },
            { id: 'high_heal_potion', name: '高级回复药', desc: '恢复150点HP', price: 100, effect: { type: 'heal_hp', value: 150 } },
            { id: 'tp_potion', name: 'TP回复药', desc: '恢复30点TP', price: 50, effect: { type: 'heal_tp', value: 30 } },
            { id: 'elixir', name: '万能药', desc: '完全恢复HP和TP', price: 500, effect: { type: 'full_restore' } },
            { id: 'antidote', name: '解毒药', desc: '治愈中毒状态', price: 20, effect: { type: 'cure_poison' } }
        ],
        weapons: [
            { id: 'iron_sword', name: '铁剑', desc: '攻击力+5', price: 200, effect: { type: 'equip', slot: 'weapon', stat: 'STR', value: 5 }, classReq: 'warrior' },
            { id: 'steel_sword', name: '钢剑', desc: '攻击力+10', price: 500, effect: { type: 'equip', slot: 'weapon', stat: 'STR', value: 10 }, classReq: 'warrior' },
            { id: 'oak_staff', name: '橡木法杖', desc: '智力+5', price: 200, effect: { type: 'equip', slot: 'weapon', stat: 'INT', value: 5 }, classReq: 'mage' },
            { id: 'crystal_staff', name: '水晶法杖', desc: '智力+10', price: 500, effect: { type: 'equip', slot: 'weapon', stat: 'INT', value: 10 }, classReq: 'mage' },
            { id: 'holy_symbol', name: '神圣法器', desc: '智力+4,运气+3', price: 250, effect: { type: 'equip', slot: 'weapon', stat: 'INT', value: 4 }, classReq: 'medic' },
            { id: 'longbow', name: '长弓', desc: '攻击力+6,速度+2', price: 300, effect: { type: 'equip', slot: 'weapon', stat: 'STR', value: 6 }, classReq: 'ranger' }
        ],
        armors: [
            { id: 'chain_mail', name: '锁子甲', desc: '防御力+5', price: 250, effect: { type: 'equip', slot: 'armor', stat: 'VIT', value: 5 }, classReq: 'warrior' },
            { id: 'plate_armor', name: '板甲', desc: '防御力+10', price: 600, effect: { type: 'equip', slot: 'armor', stat: 'VIT', value: 10 }, classReq: 'warrior' },
            { id: 'mage_robe', name: '法师长袍', desc: '防御力+3,智力+2', price: 200, effect: { type: 'equip', slot: 'armor', stat: 'VIT', value: 3 }, classReq: 'mage' },
            { id: 'priest_robe', name: '医师法衣', desc: '防御力+4', price: 220, effect: { type: 'equip', slot: 'armor', stat: 'VIT', value: 4 }, classReq: 'medic' },
            { id: 'leather_armor', name: '皮甲', desc: '防御力+4,速度+2', price: 200, effect: { type: 'equip', slot: 'armor', stat: 'VIT', value: 4 }, classReq: 'ranger' }
        ]
    },

    // 迷宫数据 (3层, 每层20x20)
    // 0=通道, 1=墙壁, 2=门, 3=宝箱事件, 4=楼梯, 5=Boss点
    floors: [],

    // 宝箱奖励表
    treasureTable: [
        { type: 'gold', value: 50, msg: '发现了50金币！' },
        { type: 'gold', value: 100, msg: '发现了100金币！' },
        { type: 'gold', value: 200, msg: '发现了200金币！' },
        { type: 'item', id: 'heal_potion', msg: '发现了回复药！' },
        { type: 'item', id: 'high_heal_potion', msg: '发现了高级回复药！' },
        { type: 'item', id: 'tp_potion', msg: '发现了TP回复药！' },
        { type: 'item', id: 'elixir', msg: '发现了万能药！' }
    ],

    // 初始化迷宫数据
    initFloors() {
        this.floors = [
            this.generateFloor(0),  // B1F
            this.generateFloor(1),  // B2F
            this.generateFloor(2)   // B3F
        ];
    },

    // 补齐旧存档楼层的出生点数据
    ensureFloorSpawns() {
        if (!Array.isArray(this.floors)) return;
        this.floors.forEach(floor => {
            if (floor && !floor.spawn) {
                floor.spawn = this.calculateFloorSpawn(floor.grid, floor.rooms || []);
                if (floor.grid?.[floor.spawn.y]?.[floor.spawn.x] === 1) {
                    floor.grid[floor.spawn.y][floor.spawn.x] = 0;
                }
            }
        });
    },

    // 获取指定楼层出生点，旧数据缺失时现场补算
    getFloorSpawn(floorIndex) {
        const floor = this.floors?.[floorIndex];
        if (!floor) return { x: 2, y: 2, dir: 0 };
        if (!floor.spawn) {
            floor.spawn = this.calculateFloorSpawn(floor.grid, floor.rooms || []);
        }
        return floor.spawn;
    },

    // 计算出生点：起始房间中心，朝向第一个通道出口
    calculateFloorSpawn(grid, rooms = []) {
        const startRoom = rooms.find(room => room.type === 'start') || rooms[0];
        if (!startRoom) {
            return this.findFirstPassableSpawn(grid);
        }

        let x = startRoom.cx;
        let y = startRoom.cy;
        if (grid?.[y]?.[x] === 1) {
            const fallback = this.findPassableInRoom(grid, startRoom);
            x = fallback.x;
            y = fallback.y;
        }

        return {
            x,
            y,
            dir: this.findRoomExitDir(grid, startRoom)
        };
    },

    findPassableInRoom(grid, room) {
        const bounds = this.getRoomBounds(room);
        for (let y = bounds.top; y <= bounds.bottom; y++) {
            for (let x = bounds.left; x <= bounds.right; x++) {
                if (grid?.[y]?.[x] !== 1) return { x, y };
            }
        }
        return this.findFirstPassableSpawn(grid);
    },

    findFirstPassableSpawn(grid) {
        for (let y = 0; y < (grid?.length || 0); y++) {
            for (let x = 0; x < (grid[y]?.length || 0); x++) {
                if (grid[y][x] !== 1) return { x, y, dir: 1 };
            }
        }
        return { x: 2, y: 2, dir: 1 };
    },

    getRoomBounds(room) {
        return {
            left: room.cx - Math.floor(room.w / 2),
            right: room.cx + Math.floor(room.w / 2),
            top: room.cy - Math.floor(room.h / 2),
            bottom: room.cy + Math.floor(room.h / 2)
        };
    },

    findRoomExitDir(grid, room) {
        const bounds = this.getRoomBounds(room);
        const candidates = [
            { dir: 1, dx: 1, dy: 0, cells: this.getVerticalEdgeCells(bounds.right + 1, bounds.top, bounds.bottom) },
            { dir: 2, dx: 0, dy: 1, cells: this.getHorizontalEdgeCells(bounds.bottom + 1, bounds.left, bounds.right) },
            { dir: 0, dx: 0, dy: -1, cells: this.getHorizontalEdgeCells(bounds.top - 1, bounds.left, bounds.right) },
            { dir: 3, dx: -1, dy: 0, cells: this.getVerticalEdgeCells(bounds.left - 1, bounds.top, bounds.bottom) }
        ];

        for (const candidate of candidates) {
            for (const cell of candidate.cells) {
                if (grid?.[cell.y]?.[cell.x] !== undefined && grid[cell.y][cell.x] !== 1) {
                    return candidate.dir;
                }
            }
        }

        return 1; // 极端情况下默认面向东方，避免继续面壁朝北
    },

    getVerticalEdgeCells(x, top, bottom) {
        const cells = [];
        for (let y = top; y <= bottom; y++) {
            cells.push({ x, y });
        }
        return cells;
    },

    getHorizontalEdgeCells(y, left, right) {
        const cells = [];
        for (let x = left; x <= right; x++) {
            cells.push({ x, y });
        }
        return cells;
    },

    // 生成迷宫 - 世界树风格：1格窄走廊 + 大型房间
    generateFloor(floorIndex) {
        const W = 41, H = 41;
        // 初始化全部为墙壁
        const grid = [];
        for (let y = 0; y < H; y++) {
            grid[y] = [];
            for (let x = 0; x < W; x++) {
                grid[y][x] = 1;
            }
        }

        // ========== 1. 生成房间 ==========
        // 房间定义：(中心X, 中心Y, 宽度, 高度)
        const rooms = [];
        const roomCount = 6 + floorIndex * 2;
        
        // 起始房间（玩家出生点在 (2,2)，房间中心设为 (4,4) 确保包含出生点）
        rooms.push({ cx: 4, cy: 4, w: 5, h: 5, type: 'start' });
        
        // 随机生成其他房间
        for (let i = 0; i < roomCount; i++) {
            const rw = 4 + Math.floor(Math.random() * 5); // 4-8格宽
            const rh = 4 + Math.floor(Math.random() * 5); // 4-8格高
            const rcx = 3 + Math.floor(Math.random() * (W - 6));
            const rcy = 3 + Math.floor(Math.random() * (H - 6));
            
            // 检查是否与现有房间重叠
            let overlaps = false;
            for (const room of rooms) {
                if (Math.abs(rcx - room.cx) < (rw + room.w) / 2 + 2 &&
                    Math.abs(rcy - room.cy) < (rh + room.h) / 2 + 2) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                rooms.push({ cx: rcx, cy: rcy, w: rw, h: rh, type: 'normal' });
            }
        }

        // 雕刻房间
        for (const room of rooms) {
            for (let dy = -Math.floor(room.h / 2); dy <= Math.floor(room.h / 2); dy++) {
                for (let dx = -Math.floor(room.w / 2); dx <= Math.floor(room.w / 2); dx++) {
                    const gx = room.cx + dx;
                    const gy = room.cy + dy;
                    if (gx >= 1 && gx < W - 1 && gy >= 1 && gy < H - 1) {
                        grid[gy][gx] = 0;
                    }
                }
            }
        }

        // ========== 2. 用走廊连接所有房间 ==========
        // 按距离排序房间，依次连接
        rooms.sort((a, b) => (a.cx + a.cy) - (b.cx + b.cy));
        
        // 连接相邻房间（用L型走廊）
        for (let i = 0; i < rooms.length - 1; i++) {
            const r1 = rooms[i];
            const r2 = rooms[i + 1];
            
            // 从r1中心到r2中心画走廊
            let x = r1.cx;
            let y = r1.cy;
            
            // 先水平移动
            while (x !== r2.cx) {
                if (x >= 1 && x < W - 1 && y >= 1 && y < H - 1) {
                    grid[y][x] = 0;
                }
                x += (r2.cx > x) ? 1 : -1;
            }
            
            // 再垂直移动
            while (y !== r2.cy) {
                if (x >= 1 && x < W - 1 && y >= 1 && y < H - 1) {
                    grid[y][x] = 0;
                }
                y += (r2.cy > y) ? 1 : -1;
            }
        }

        // ========== 3. 额外连接一些房间增加环路 ==========
        const extraConnections = 3 + floorIndex;
        for (let i = 0; i < extraConnections; i++) {
            const r1 = rooms[Math.floor(Math.random() * rooms.length)];
            const r2 = rooms[Math.floor(Math.random() * rooms.length)];
            if (r1 === r2) continue;
            
            let x = r1.cx;
            let y = r1.cy;
            
            // 随机方向先水平或垂直
            if (Math.random() < 0.5) {
                while (x !== r2.cx) {
                    if (x >= 1 && x < W - 1 && y >= 1 && y < H - 1) grid[y][x] = 0;
                    x += (r2.cx > x) ? 1 : -1;
                }
                while (y !== r2.cy) {
                    if (x >= 1 && x < W - 1 && y >= 1 && y < H - 1) grid[y][x] = 0;
                    y += (r2.cy > y) ? 1 : -1;
                }
            } else {
                while (y !== r2.cy) {
                    if (x >= 1 && x < W - 1 && y >= 1 && y < H - 1) grid[y][x] = 0;
                    y += (r2.cy > y) ? 1 : -1;
                }
                while (x !== r2.cx) {
                    if (x >= 1 && x < W - 1 && y >= 1 && y < H - 1) grid[y][x] = 0;
                    x += (r2.cx > x) ? 1 : -1;
                }
            }
        }

        // ========== 4. 设置楼梯 ==========
        if (floorIndex < 2) {
            // 找离起点最远的房间放置楼梯
            const lastRoom = rooms[rooms.length - 1];
            const stairX = lastRoom.cx;
            const stairY = lastRoom.cy;
            grid[stairY][stairX] = 4; // 楼梯
        }

        // B3F设置Boss点
        if (floorIndex === 2) {
            const lastRoom = rooms[rooms.length - 1];
            grid[lastRoom.cy][lastRoom.cx] = 5; // Boss点
        }

        const spawn = this.calculateFloorSpawn(grid, rooms);
        grid[spawn.y][spawn.x] = 0;

        // ========== 5. 放置宝箱 ==========
        const treasureCount = 3 + floorIndex * 2;
        let placed = 0;
        for (const room of rooms) {
            if (placed >= treasureCount) break;
            // 在房间内随机位置放宝箱
            const tx = room.cx + Math.floor(Math.random() * room.w) - Math.floor(room.w / 2);
            const ty = room.cy + Math.floor(Math.random() * room.h) - Math.floor(room.h / 2);
            if (grid[ty] && grid[ty][tx] === 0 && !(tx === spawn.x && ty === spawn.y)) {
                grid[ty][tx] = 3; // 宝箱
                placed++;
            }
        }

        // ========== 6. 记录房间信息用于怪物生成 ==========
        const floorData = { width: W, height: H, grid: grid, rooms: rooms, spawn };
        return floorData;
    }
};

export default GameData;
