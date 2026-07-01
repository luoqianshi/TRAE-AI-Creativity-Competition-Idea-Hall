// ============================================================
// BattleMeeting - ui/battle-meeting.js
// 战斗会议 AVG 系统
// ============================================================

const BattleMeeting = {
    dialogues: [],
    currentDialogueIndex: 0,
    evolvableChars: [],
    currentCharIndex: 0,
    suggestions: {},
    currentSpeakerName: null,
    typeTimeout: null,

    // 开始战斗会议
    start() {
        this.evolvableChars = Battle.getEvolvableCharacters();
        if (this.evolvableChars.length === 0) {
            Dialog.show('<p style="color:#c0a060">队伍中尚未有角色达到战斗经验上限，继续在迷宫中探索积累经验吧。</p>');
            return;
        }

        // 生成对话内容
        this.dialogues = this.generateAllDialogues();
        this.currentDialogueIndex = 0;
        this.currentCharIndex = 0;
        this.currentSpeakerName = null;

        // 显示AVG界面
        Game.showScreen('battle-meeting-screen');
        this.setupPortraits();
        this.showCurrentDialogue();
    },

    // 设置立绘布局
    setupPortraits() {
        const leftImg = document.getElementById('avg-portrait-left-img');
        const rightImg = document.getElementById('avg-portrait-right-img');
        const leftContainer = document.getElementById('avg-portrait-left');
        const rightContainer = document.getElementById('avg-portrait-right');
        
        if (this.evolvableChars.length === 1) {
            // 单人模式 - 使用中央立绘
            leftContainer.style.display = 'none';
            rightContainer.style.display = 'none';
            
            // 创建中央立绘容器
            let centerContainer = document.getElementById('avg-portrait-center');
            if (!centerContainer) {
                centerContainer = document.createElement('div');
                centerContainer.id = 'avg-portrait-center';
                centerContainer.className = 'avg-portrait-center';
                document.querySelector('.avg-layout').insertBefore(centerContainer, document.querySelector('.avg-dialog-layer'));
            }
            centerContainer.innerHTML = `<img id="avg-portrait-center-img" src="" alt="">`;
            centerContainer.style.display = 'flex';
        } else {
            // 多人模式 - 左右立绘
            leftContainer.style.display = 'flex';
            rightContainer.style.display = 'flex';
            
            // 隐藏中央立绘
            const centerContainer = document.getElementById('avg-portrait-center');
            if (centerContainer) centerContainer.style.display = 'none';
            
            // 设置左右立绘（最多显示2个主要角色）
            if (this.evolvableChars[0]) {
                leftImg.src = this.evolvableChars[0].portrait || this.evolvableChars[0].icon;
                leftImg.style.display = 'block';
                leftContainer.dataset.charName = this.evolvableChars[0].name;
            }
            if (this.evolvableChars[1]) {
                rightImg.src = this.evolvableChars[1].portrait || this.evolvableChars[1].icon;
                rightImg.style.display = 'block';
                rightContainer.dataset.charName = this.evolvableChars[1].name;
            }
        }
    },

    // 更新立绘状态
    updatePortraitState(speakerName) {
        const leftContainer = document.getElementById('avg-portrait-left');
        const rightContainer = document.getElementById('avg-portrait-right');
        const centerContainer = document.getElementById('avg-portrait-center');
        
        if (this.evolvableChars.length === 1 && centerContainer) {
            // 单人模式
            const centerImg = document.getElementById('avg-portrait-center-img');
            if (speakerName === this.evolvableChars[0].name) {
                centerImg.src = this.evolvableChars[0].portrait || this.evolvableChars[0].icon;
                centerImg.style.display = 'block';
            }
        } else {
            // 多人模式 - 高亮发言者，其他变暗
            [leftContainer, rightContainer].forEach(container => {
                if (!container) return;
                const charName = container.dataset.charName;
                if (charName === speakerName) {
                    container.classList.remove('dimmed');
                    container.classList.add('speaking');
                } else {
                    container.classList.remove('speaking');
                    container.classList.add('dimmed');
                }
            });
        }
    },

    // 生成所有对话
    generateAllDialogues() {
        const allDialogues = [];

        // 开场
        allDialogues.push({
            speaker: '会议主持人',
            text: '各位冒险者，让我们回顾一下上次迷宫探索的战斗表现，互相交流一下心得吧。',
            showData: false
        });

        // 每个角色依次发言
        this.evolvableChars.forEach((char, index) => {
            const dialogues = this.generateCharDialogues(char, index);
            dialogues.forEach(d => {
                d.charIndex = index;
            });
            allDialogues.push(...dialogues);
        });

        // 团队协作讨论环节
        if (this.evolvableChars.length > 1) {
            allDialogues.push({
                speaker: '会议主持人',
                text: '接下来是团队协作讨论环节。请大家谈谈队友之间的配合情况。',
                showData: false
            });

            this.evolvableChars.forEach((char, index) => {
                const dialogue = this.generateTeamDiscussion(char, index);
                if (dialogue) {
                    dialogue.charIndex = index;
                    allDialogues.push(dialogue);
                }
            });
        }

        // 总结
        allDialogues.push({
            speaker: '会议主持人',
            text: '讨论结束。基于以上分析，我将为各位生成战术调整建议。请前往战术编辑界面查看并确认。',
            showData: false
        });

        // 生成AI建议
        this.generateSuggestions();

        return allDialogues;
    },

    // 判断角色是否为辅助型
    isSupportType(char) {
        // 通过 aiConfig 判断
        if (char.aiConfig && char.aiConfig.name === '辅助型') return true;
        // 通过职业 role 判断
        const cls = GameData.classes[char.classId];
        if (cls && cls.role === '辅助') return true;
        // 通过治疗数据判断
        if (char.battleData && char.battleData.totalHealingDone > char.battleData.totalDamageDealt * 0.3) return true;
        return false;
    },

    // 获取角色的 AI 类型名称
    getAITypeName(char) {
        if (char.aiConfig && char.aiConfig.name) return char.aiConfig.name;
        const cls = GameData.classes[char.classId];
        if (cls && cls.role) {
            const roleMap = { '攻击': '攻击型', '防御': '防御型', '辅助': '辅助型' };
            return roleMap[cls.role] || '平衡型';
        }
        return '平衡型';
    },

    // 生成单个角色的对话（单打独斗向：技能搭配/连携）
    generateCharDialogues(char, index) {
        const d = char.battleData;
        const dialogues = [];
        const winRate = d.battles > 0 ? Math.round(d.wins / d.battles * 100) : 0;
        const isSupport = this.isSupportType(char);
        const aiType = this.getAITypeName(char);

        // 角色根据职业有不同的说话风格
        const classStyle = this.getClassStyle(char.className);

        // 开场报告
        dialogues.push({
            speaker: char.name,
            text: `${classStyle.prefix}本次探索共参与${d.battles}场战斗，胜率${winRate}%。作为${aiType}，${isSupport ? '我的主要职责是支援队友' : '我主要负责输出伤害'}。`,
            showData: true,
            charName: char.name
        });

        // Phase 1: 性格评分报告
        if (window.PersonalityEngine && d.personalityWeights) {
            const personalityLabel = window.PersonalityEngine.getPersonalityLabel(d.personalityWeights);
            dialogues.push({
                speaker: char.name,
                text: `${classStyle.prefix}我的战斗风格倾向：${personalityLabel}。`,
                showData: true,
                charName: char.name
            });
        }

        // === 辅助型专属对话 ===
        if (isSupport) {
            // 治疗效率分析
            if (d.totalHealingDone > 0) {
                const healPerBattle = Math.round(d.totalHealingDone / Math.max(1, d.battles));
                dialogues.push({
                    speaker: char.name,
                    text: `${classStyle.prefix}平均每场战斗治疗了${healPerBattle}点伤害。${healPerBattle > 50 ? '治疗效果还不错，但要注意TP的消耗节奏。' : '治疗量偏低，可能需要在队友危急时更积极地使用治疗技能。'}`,
                    showData: false,
                    charName: char.name
                });
            }

            // 死亡分析（辅助型死亡是严重问题）
            if (d.deathCount > 0) {
                dialogues.push({
                    speaker: char.name,
                    text: `${classStyle.prefix}我在${d.deathCount}次战斗中被击倒……作为辅助，我的倒下意味着队友失去了治疗来源。${classStyle.deathAnalysis}`,
                    showData: false,
                    charName: char.name
                });
            }

            // 辅助技能使用分析
            const healSkills = Object.entries(d.actions.skills).filter(([name]) => {
                return name.includes('治疗') || name.includes('回复') || name.includes('治愈') || name.includes('护盾');
            });
            if (healSkills.length > 0) {
                const topHeal = healSkills.sort((a, b) => b[1] - a[1])[0];
                dialogues.push({
                    speaker: char.name,
                    text: `${classStyle.prefix}我最常使用的辅助技能是「${topHeal[0]}」，共使用了${topHeal[1]}次。${classStyle.skillAnalysis}`,
                    showData: false,
                    charName: char.name
                });
            }

            // 辅助型建议
            dialogues.push({
                speaker: char.name,
                text: `${classStyle.prefix}${classStyle.suggestion}`,
                showData: false,
                charName: char.name
            });
        } else {
            // === 攻击/防御型专属对话 ===

            // 问题分析
            if (d.deathCount > 0) {
                dialogues.push({
                    speaker: char.name,
                    text: `${classStyle.prefix}我在${d.deathCount}次战斗中被击倒。${classStyle.deathAnalysis}`,
                    showData: false,
                    charName: char.name
                });
            }

            const totalActions = d.actions.attack + d.actions.defend +
                Object.values(d.actions.skills).reduce((a, b) => a + b, 0);
            const defendRate = totalActions > 0 ? Math.round(d.actions.defend / totalActions * 100) : 0;

            if (defendRate < 10 && d.totalDamageTaken > d.totalDamageDealt * 0.5) {
                dialogues.push({
                    speaker: char.name,
                    text: `${classStyle.prefix}我的防御次数仅占${defendRate}%，但承受的伤害较高。建议在HP较低时增加防御判断的优先级。`,
                    showData: false,
                    charName: char.name
                });
            }

            // 技能使用分析 - 连携搭配
            const skillCounts = Object.entries(d.actions.skills);
            if (skillCounts.length > 0) {
                const topSkill = skillCounts.sort((a, b) => b[1] - a[1])[0];
                const comboAnalysis = this.getSkillComboAnalysis(char, skillCounts);
                dialogues.push({
                    speaker: char.name,
                    text: `${classStyle.prefix}我最常使用的技能是「${topSkill[0]}」，使用了${topSkill[1]}次。${comboAnalysis || classStyle.skillAnalysis}`,
                    showData: false,
                    charName: char.name
                });
            }

            // 关键时刻分析
            const criticalCount = d.criticalMoments.length;
            if (criticalCount > 0) {
                const lastCritical = d.criticalMoments[criticalCount - 1];
                dialogues.push({
                    speaker: char.name,
                    text: `${classStyle.prefix}在HP低于20%的关键时刻，我共做出${criticalCount}次决策。最近一次选择了${lastCritical.action}。${classStyle.criticalAnalysis}`,
                    showData: false,
                    charName: char.name
                });
            }

            // 攻击/防御型建议
            dialogues.push({
                speaker: char.name,
                text: `${classStyle.prefix}${classStyle.suggestion}`,
                showData: false,
                charName: char.name
            });
        }

        return dialogues;
    },

    // 技能连携分析
    getSkillComboAnalysis(char, skillCounts) {
        if (skillCounts.length < 2) return null;

        const sorted = skillCounts.sort((a, b) => b[1] - a[1]);
        const top = sorted[0];
        const second = sorted[1];
        const totalSkillUses = sorted.reduce((sum, [, count]) => sum + count, 0);
        const topRatio = Math.round(top[1] / totalSkillUses * 100);

        if (topRatio > 70) {
            return `过度依赖单一技能。建议搭配「${second[0]}」使用，形成${this.getComboSuggestion(char.className, top[0], second[0])}。`;
        } else if (sorted.length >= 2) {
            return `技能搭配较为均衡，「${top[0]}」和「${second[0]}」的配合${this.getComboSuggestion(char.className, top[0], second[0])}。`;
        }
        return null;
    },

    // 获取技能连携建议
    getComboSuggestion(className, skill1, skill2) {
        const combos = {
            '战士': `可以形成"先手控制→强力输出"的连携，先用控制技能削弱敌人，再接高伤害技能`,
            '法师': `建议先用降防/减益技能削弱敌人，再接高伤害魔法，能显著提升总输出`,
            '武士': `攻守兼备的搭配不错，可以考虑在防御后反击的节奏中穿插使用`,
            '巡猎': `远程压制+控制技能的组合很好，可以保持安全距离的同时持续输出`,
            '医师': `治疗和增益的搭配是核心，建议在战斗开始时先使用增益技能，再根据情况治疗`
        };
        return combos[className] || combos['战士'];
    },

    // 生成团队协作讨论对话
    generateTeamDiscussion(char, index) {
        const d = char.battleData;
        const isSupport = this.isSupportType(char);
        const classStyle = this.getClassStyle(char.className);
        const partySize = this.evolvableChars.length;

        // 找到一个队友来讨论
        const teammateIndex = (index + 1) % partySize;
        const teammate = this.evolvableChars[teammateIndex];
        if (!teammate) return null;

        const teammateIsSupport = this.isSupportType(teammate);
        const teammateAI = this.getAITypeName(teammate);

        if (isSupport) {
            // 辅助型评价队友
            if (teammateIsSupport) {
                return {
                    speaker: char.name,
                    text: `${classStyle.prefix}${teammate.name}也是辅助型，我们之间的治疗分工需要更明确。建议一人负责紧急治疗，另一人负责持续恢复，避免TP浪费在重复治疗上。`,
                    showData: false,
                    charName: char.name
                };
            } else {
                const teammateDeathRate = teammate.battleData ? (teammate.battleData.deathCount / Math.max(1, teammate.battleData.battles)) : 0;
                if (teammateDeathRate > 0.3) {
                    return {
                        speaker: char.name,
                        text: `${classStyle.prefix}${teammate.name}作为${teammateAI}经常被击倒……我需要更早地注意到队友的HP变化。建议将队友治疗的优先阈值从40%提高到50%，争取在危急之前出手。`,
                        showData: false,
                        charName: char.name
                    };
                } else {
                    return {
                        speaker: char.name,
                        text: `${classStyle.prefix}${teammate.name}的表现很稳健，作为${teammateAI}承担了大部分伤害。我的治疗节奏配合得还不错，但可以在${teammate.name}发动强力技能前预先施加护盾，提高连携效率。`,
                        showData: false,
                        charName: char.name
                    };
                }
            }
        } else {
            // 攻击/防御型评价辅助队友
            if (teammateIsSupport) {
                return {
                    speaker: char.name,
                    text: `${classStyle.prefix}${teammate.name}的治疗支援让我能更放心地进攻。不过有时候在关键时刻等不到治疗……建议${teammate.name}在敌人使用强力技能前就预先回复，而不是等到HP已经很低了才出手。`,
                    showData: false,
                    charName: char.name
                };
            } else {
                // 两个攻击型互相评价
                const myDPS = d.battles > 0 ? Math.round(d.totalDamageDealt / d.battles) : 0;
                const teammateDPS = teammate.battleData ? Math.round(teammate.battleData.totalDamageDealt / Math.max(1, teammate.battleData.battles)) : 0;
                if (myDPS > teammateDPS) {
                    return {
                        speaker: char.name,
                        text: `${classStyle.prefix}我和${teammate.name}都是${teammateAI}，但我的场均伤害更高一些。建议${teammate.name}可以尝试更多的技能连携搭配，而不是只用普通攻击。我们配合好的话，集火同一个目标效率会更高。`,
                        showData: false,
                        charName: char.name
                    };
                } else {
                    return {
                        speaker: char.name,
                        text: `${classStyle.prefix}${teammate.name}的输出能力比我强。我需要更好地配合${teammate.name}的节奏，比如在${teammate.name}使用强力技能后，我用控制技能补刀，形成连携。`,
                        showData: false,
                        charName: char.name
                    };
                }
            }
        }
    },

    // 获取职业说话风格
    getClassStyle(className) {
        const styles = {
            '战士': {
                prefix: '',
                deathAnalysis: '作为前线，我需要更好地评估何时该撤退防御。不能一味猛攻。',
                skillAnalysis: '强力技能的效果不错，但TP消耗需要更合理地控制。建议搭配防御技能使用。',
                criticalAnalysis: '危急时刻应该优先保证生存，而不是继续进攻。活着才能输出。',
                suggestion: '我建议调整策略：在HP低于30%时优先防御或使用回复道具，确保能持续作战。同时可以尝试"防御反击"的连携——先防御减少伤害，下一回合再全力输出。'
            },
            '法师': {
                prefix: '',
                deathAnalysis: '作为后排，被击倒说明敌人的攻击范围超出了预期。需要更注意站位和防御时机。',
                skillAnalysis: '魔法输出的效率尚可，但TP管理需要优化。建议在战斗前期保留TP，后期再全力爆发。',
                criticalAnalysis: '低HP时应优先使用回复手段，而非继续消耗TP输出。',
                suggestion: '从数据来看，我建议提高TP保留阈值，确保在关键时刻有足够的TP进行治疗或防御。同时可以搭配"降防→高伤害魔法"的连携，提升总输出效率。'
            },
            '武士': {
                prefix: '',
                deathAnalysis: '武士之道在于攻守平衡。被击倒说明我的判断出现了偏差，需要更灵活地切换攻防。',
                skillAnalysis: '技能使用频率合理，但可以根据战况更灵活地调整攻防节奏。',
                criticalAnalysis: '关键时刻的决策需要更加冷静，不能被战斗节奏带偏。',
                suggestion: '我建议增加一个条件：当队友HP低于40%时，优先使用辅助技能支援队友。攻守兼备才是武士的精髓——在队友安全的前提下再追求最大输出。'
            },
            '巡猎': {
                prefix: '',
                deathAnalysis: '作为高机动性角色，被击倒是不可接受的。需要更灵活地规避伤害，利用速度优势。',
                skillAnalysis: '远程攻击的命中率良好，但可以更积极地利用控制技能为队友创造输出空间。',
                criticalAnalysis: '低HP时应该优先脱离危险位置，利用高速度先手控制敌人。',
                suggestion: '我建议在敌人数量较多时，优先使用范围控制技能限制敌人行动，为队友创造安全输出环境。远程角色的价值不只是伤害——控制战场节奏同样重要。'
            },
            '医师': {
                prefix: '',
                deathAnalysis: '作为队伍的治疗核心，我的倒下意味着全队的生存危机。必须更重视自身安全。',
                skillAnalysis: '治疗技能的使用频率合理，但需要更精准地判断治疗时机——预防优于急救。',
                criticalAnalysis: '危急时刻应该优先自保，只有我活着才能继续治疗队友。',
                suggestion: '我建议将治疗策略从"急救"调整为"预防"：在队友HP降到60%时就开始治疗，而不是等到30%以下。同时可以先用增益技能提升队友的防御，从源头减少伤害。'
            }
        };
        return styles[className] || styles['战士'];
    },

    // Phase 1: GBDT+规则混合建议生成
    async generateSuggestions() {
        this.suggestions = {};

        for (const char of this.evolvableChars) {
            const d = char.battleData;
            const weights = d.personalityWeights ||
                (window.PersonalityEngine ? window.PersonalityEngine.getInitialWeights('balanced') : { attack: 0.33, defense: 0.33, cooperation: 0.34 });
            const totalBattles = d.battles;
            const mlWeight = this.calculateMLWeight(totalBattles);

            // 加载或创建GBDT模型组
            let modelGroup = null;
            if (window.MicroGBDT) {
                modelGroup = window.MicroGBDT.loadModelGroup(char.id);
                if (!modelGroup) {
                    const branchIds = (char.aiConfig.behaviorTree || []).map(b => b.id || b.name).filter(Boolean);
                    modelGroup = window.MicroGBDT.createModelGroup(char.id, branchIds);
                }
            }

            // 获取滚动窗口数据
            const windowData = window.BattleDataRecorder ? window.BattleDataRecorder.getWindowData(char) : [];

            // 增量训练GBDT模型
            if (modelGroup && windowData.length >= 5 && mlWeight > 0) {
                const params = window.MicroGBDT.getTrainingParams(totalBattles);
                if (window.MicroGBDT.shouldTrain(totalBattles, this._getLastTrainedCount(modelGroup) || 0)) {
                    for (const branchId of Object.keys(modelGroup.models)) {
                        const trainingData = window.BattleDataRecorder.toTrainingData(char, branchId);
                        if (trainingData.features.length >= 3) {
                            window.MicroGBDT.incrementalTrain(modelGroup.models[branchId], trainingData.features, trainingData.labels);
                        }
                    }
                }
            }

            // 生成调整建议
            const adjustments = [];

            // 保留原有的纯规则建议作为基础
            this.generateRuleBasedSuggestions(char, adjustments);

            // 如果mlWeight>0且有模型，追加GBDT分析建议
            if (mlWeight > 0 && modelGroup && windowData.length >= 5) {
                this.generateGBDTBasedSuggestions(char, modelGroup, weights, mlWeight, adjustments);
            }

            // 通过规则拦截器验证
            if (window.RuleInterceptor) {
                const validated = window.RuleInterceptor.validateSuggestions(weights, adjustments);
                this.suggestions[char.name] = { adjustments: validated, mlWeight };
            } else {
                this.suggestions[char.name] = { adjustments, mlWeight };
            }
        }
    },

    // 计算ML权重
    calculateMLWeight(totalBattleCount) {
        if (totalBattleCount <= 20) return 0;
        if (totalBattleCount <= 50) return Math.min(0.3, (totalBattleCount - 20) / 30 * 0.3);
        if (totalBattleCount <= 100) return Math.min(0.6, 0.3 + (totalBattleCount - 50) / 50 * 0.3);
        return 0.6;
    },

    // 获取模型组上次训练的战斗场次
    _getLastTrainedCount(modelGroup) {
        if (!modelGroup || !modelGroup.models) return 0;
        const counts = Object.values(modelGroup.models).map(m => m.lastTrainedBattleCount || 0);
        return counts.length > 0 ? Math.max(...counts) : 0;
    },

    // 原有纯规则建议（从旧generateSuggestions迁移）
    generateRuleBasedSuggestions(char, adjustments) {
        const d = char.battleData;
        const isSupport = this.isSupportType(char);

        if (d.deathCount > 0) {
            const currentHealThreshold = this.findConditionValue(char, 'emergency_defend', 'self_hp_below') || 25;
            if (currentHealThreshold <= 25) {
                adjustments.push({
                    type: 'threshold',
                    branchId: 'emergency_defend',
                    paramPath: 'condition.value',
                    targetNodeId: 'emergency_defend',
                    direction: 'increase',
                    currentValue: currentHealThreshold,
                    suggestedValue: isSupport ? 40 : 35,
                    reason: `死亡${d.deathCount}次，建议提高紧急治疗阈值`,
                    scoreImprovement: 0.1
                });
            }
        }

        if (isSupport) {
            const healSkillUse = Object.entries(d.actions.skills).filter(([name]) =>
                name.includes('治疗') || name.includes('回复') || name.includes('治愈')
            ).reduce((sum, [, count]) => sum + count, 0);
            const totalSkillUse = Object.values(d.actions.skills).reduce((a, b) => a + b, 0);
            if (totalSkillUse > 0 && healSkillUse / totalSkillUse < 0.5) {
                const currentAllyThreshold = this.findConditionValue(char, 'heal_ally', 'ally_hp_below') || 40;
                adjustments.push({
                    type: 'threshold',
                    branchId: 'heal_ally',
                    paramPath: 'condition.value',
                    targetNodeId: 'heal_ally',
                    direction: 'increase',
                    currentValue: currentAllyThreshold,
                    suggestedValue: 55,
                    reason: '作为辅助型，治疗技能使用比例偏低，建议提高队友治疗优先级',
                    scoreImprovement: 0.1
                });
            }
        } else {
            const totalActions = d.actions.attack + d.actions.defend +
                Object.values(d.actions.skills).reduce((a, b) => a + b, 0);
            const defendRate = totalActions > 0 ? d.actions.defend / totalActions : 0;
            if (defendRate < 0.1 && d.totalDamageTaken > 0) {
                adjustments.push({
                    type: 'branch_change',
                    branchId: null,
                    changeType: 'add',
                    targetNodeId: 'defend_low_hp',
                    direction: 'increase',
                    suggestedNode: {
                        id: 'defend_low_hp',
                        name: '防御姿态',
                        priority: 80,
                        condition: { type: 'self_hp_below', value: 40 },
                        skills: [{ id: 'defend', order: 1, type: 'defend' }],
                        enabled: true
                    },
                    reason: '防御频率过低，建议增加HP低于40%时的防御规则',
                    scoreImprovement: 0.1
                });
            }
        }
    },

    // GBDT分析建议
    generateGBDTBasedSuggestions(char, modelGroup, weights, mlWeight, adjustments) {
        if (!window.MicroGBDT || !window.BattleDataRecorder) return;

        const branches = char.aiConfig.behaviorTree || [];
        for (const branch of branches) {
            if (!branch.enabled || !branch.skills || branch.skills.length < 2) continue;

            const model = modelGroup.models[branch.id];
            if (!model) continue;

            // 对分支内每个技能计算混合评分
            const skillScores = branch.skills.map(skill => {
                const ruleScore = this.calculateSkillRuleScore(skill, weights);
                let mlScore = ruleScore;
                if (model.trees.length > 0) {
                    const features = this._extractFeaturesFromLatestDecision(char);
                    if (features) {
                        mlScore = window.MicroGBDT.predict(model, features);
                    }
                }
                const finalScore = ruleScore * (1 - mlWeight) + mlScore * mlWeight;
                return { skill, ruleScore, mlScore, finalScore };
            });

            // 检测顺位差异
            const sortedByScore = [...skillScores].sort((a, b) => b.finalScore - a.finalScore);
            for (let i = 0; i < sortedByScore.length; i++) {
                const currentOrder = branch.skills.findIndex(s => s.id === sortedByScore[i].skill.id) + 1;
                const suggestedOrder = i + 1;
                if (currentOrder !== suggestedOrder && currentOrder > 0) {
                    const scoreDiff = Math.abs(sortedByScore[i].finalScore - skillScores[currentOrder - 1]?.finalScore || 0);
                    if (scoreDiff > 0.1) {
                        adjustments.push({
                            type: 'skill_order',
                            branchId: branch.id,
                            paramPath: `skills[${currentOrder - 1}].order`,
                            targetNodeId: branch.id,
                            direction: currentOrder > suggestedOrder ? 'decrease' : 'increase',
                            currentValue: currentOrder,
                            suggestedValue: suggestedOrder,
                            skillId: sortedByScore[i].skill.id,
                            reason: `${sortedByScore[i].skill.id}的评分(${sortedByScore[i].finalScore.toFixed(2)})显著高于当前顺位技能，建议调整顺位`,
                            scoreImprovement: scoreDiff * 0.5
                        });
                    }
                }
            }
        }
    },

    // 计算技能的规则基础评分
    calculateSkillRuleScore(skill, weights) {
        if (!window.PersonalityEngine) return 0.5;
        return window.PersonalityEngine.calculateSkillPriority(skill.type || 'attack', weights) / 100;
    },

    // 从最新决策记录提取特征
    _extractFeaturesFromLatestDecision(char) {
        const windowData = window.BattleDataRecorder.getWindowData(char);
        if (windowData.length === 0) return null;
        const latestBattle = windowData[windowData.length - 1];
        if (!latestBattle.decisions || latestBattle.decisions.length === 0) return null;
        return latestBattle.decisions[latestBattle.decisions.length - 1].state;
    },

    // 在行为树中查找条件值
    findConditionValue(char, branchId, conditionType) {
        const branches = char.aiConfig.behaviorTree || [];
        const branch = branches.find(b => b.id === branchId);
        if (branch && branch.condition && branch.condition.type === conditionType) {
            return branch.condition.value;
        }
        return null;
    },



    // 显示当前对话
    showCurrentDialogue() {
        if (this.currentDialogueIndex >= this.dialogues.length) {
            this.onDialoguesEnd();
            return;
        }

        const dialogue = this.dialogues[this.currentDialogueIndex];
        const speakerEl = document.getElementById('avg-speaker');
        const textEl = document.getElementById('avg-text');
        const dataPanel = document.getElementById('avg-data-panel');
        const portraitImg = document.getElementById('avg-portrait-img');

        // 更新说话人
        speakerEl.textContent = `【${dialogue.speaker}】`;

        // 打字机效果
        this.typeText(textEl, dialogue.text);

        // 更新立绘状态
        this.updatePortraitState(dialogue.charName || null);

        // 数据面板
        if (dialogue.showData && dialogue.charName) {
            const char = this.evolvableChars.find(c => c.name === dialogue.charName);
            if (char) {
                const d = char.battleData;
                const winRate = d.battles > 0 ? Math.round(d.wins / d.battles * 100) : 0;
                const isSupport = this.isSupportType(char);
                dataPanel.innerHTML = `
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center">
                        <div>战斗 <span style="color:#e8d8a0">${d.battles}</span>场</div>
                        <div>胜率 <span style="color:#e8d8a0">${winRate}%</span></div>
                        <div>死亡 <span style="color:#e8d8a0">${d.deathCount}</span>次</div>
                        <div>输出 <span style="color:#60c060">${d.totalDamageDealt}</span></div>
                        <div>承受 <span style="color:#c06060">${d.totalDamageTaken}</span></div>
                        <div>治疗 <span style="color:#60a0c0">${d.totalHealingDone}</span></div>
                    </div>
                    <div style="margin-top:6px;text-align:center;color:#6a7a8a;font-size:11px">
                        AI类型: <span style="color:#c8a84e">${this.getAITypeName(char)}</span>
                        ${isSupport ? ' | 定位: <span style="color:#60a0c0">团队辅助</span>' : ' | 定位: <span style="color:#c06060">主力输出</span>'}
                    </div>`;
                dataPanel.style.display = 'block';
            }
        } else {
            dataPanel.style.display = 'none';
        }
    },

    // 打字机效果
    typeText(element, text) {
        // 清除之前的打字动画
        if (this.typeTimeout) {
            clearTimeout(this.typeTimeout);
        }
        element.textContent = '';
        let i = 0;
        const speed = 30;
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                this.typeTimeout = setTimeout(type, speed);
            }
        };
        type();
    },

    // 下一条对话
    nextDialog() {
        this.currentDialogueIndex++;
        if (this.currentDialogueIndex >= this.dialogues.length) {
            this.onDialoguesEnd();
        } else {
            this.showCurrentDialogue();
        }
    },

    // 跳过对话
    skipToEnd() {
        this.currentDialogueIndex = this.dialogues.length;
        this.onDialoguesEnd();
    },

    // 对话结束
    onDialoguesEnd() {
        // Phase 1: 固化检查
        if (window.ExperienceSolidifier) {
            this.evolvableChars.forEach(char => {
                const charSuggestions = this.suggestions[char.name];
                if (!charSuggestions) return;

                const solidificationResult = window.ExperienceSolidifier.checkSolidification(
                    char, charSuggestions.adjustments, char.battleData.suggestionTracking
                );

                if (solidificationResult.solidifications.length > 0) {
                    solidificationResult.solidifications.forEach(s => {
                        window.ExperienceSolidifier.applySolidification(char, s);
                    });
                    // 更新追踪数据
                    char.battleData.suggestionTracking = solidificationResult.updatedTracking;
                } else {
                    // 仅更新追踪
                    window.ExperienceSolidifier.updateSuggestionTracking(char, charSuggestions.adjustments);
                }
            });
        }

        // 进入AI编辑器
        AIEditor.open(this.evolvableChars, this.suggestions);
    }
};

export default BattleMeeting;
