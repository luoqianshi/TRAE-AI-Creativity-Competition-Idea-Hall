// ============================================================
// AIEditor - ui/ai-editor.js
// 自动从 game.js 拆分
// ============================================================

const AIEditor = {
    chars: [],
    suggestions: {},
    currentCharIndex: 0,
    originalConfigs: {},

    // 打开编辑器
    open(chars, suggestions) {
        this.chars = chars || Battle.getEvolvableCharacters();
        this.suggestions = suggestions || {};
        this.currentCharIndex = 0;

        // 备份原始配置
        this.originalConfigs = {};
        this.chars.forEach(char => {
            this.originalConfigs[char.name] = JSON.parse(JSON.stringify(char.aiConfig));
        });

        Game.showScreen('ai-editor-screen');
        this.renderCharList();
        this.renderEditor();
    },

    // 关闭编辑器
    close() {
        Game.showScreen('guild-screen');
        Guild.updateBattleMeetingButton();
    },

    // 渲染角色列表
    renderCharList() {
        const container = document.getElementById('ai-editor-char-list');
        if (!container) return;
        let html = '';
        this.chars.forEach((char, i) => {
            html += `<img src="${char.icon || char.portrait}" class="ai-editor-char-thumb ${i === this.currentCharIndex ? 'active' : ''}" onclick="AIEditor.selectChar(${i})" alt="${char.name}" title="${char.name}">`;
        });
        container.innerHTML = html;
    },

    // 选择角色
    selectChar(index) {
        this.currentCharIndex = index;
        document.querySelectorAll('.ai-editor-char-thumb').forEach((el, i) => {
            el.classList.toggle('active', i === index);
        });
        this.renderEditor();
    },

    // 渲染编辑器主区域
    renderEditor() {
        const char = this.chars[this.currentCharIndex];
        if (!char) return;

        const titleEl = document.getElementById('ai-editor-title');
        titleEl.textContent = `AI战术编辑 - ${char.name}`;

        const mainEl = document.getElementById('ai-editor-main');
        const aiConfig = char.aiConfig || GameData.aiPresets.balanced;
        const charSuggestions = this.suggestions[char.name]?.adjustments || [];

        let html = '';

        // 预设模板栏
        html += '<div class="ai-editor-preset-bar">';
        Object.entries(GameData.aiPresets).forEach(([key, preset]) => {
            const isActive = aiConfig.name === preset.name;
            html += `<button class="ai-preset-btn ${isActive ? 'active' : ''}" onclick="AIEditor.applyPreset('${key}')">${preset.icon} ${preset.name}</button>`;
        });
        html += '</div>';

        // 规则列表标题
        html += '<div style="color:#8a9aaa;font-size:13px;margin-bottom:10px">━━ 战术指令列表（从上到下的优先级）━━</div>';

        // 规则列表
        html += '<div class="ai-rule-list">';
        const tree = aiConfig.behaviorTree || [];
        tree.forEach((node, i) => {
            const conditionText = node.condition ?
                `${GameData.aiConditionTypes[node.condition.type]?.name || node.condition.type} ${node.condition.value}${GameData.aiConditionTypes[node.condition.type]?.unit || ''}` :
                '无条件';
            const actionText = this.formatAction(node.action);

            // 检查是否有建议（匹配targetNodeId或branchId）
            const suggestionIdx = charSuggestions.findIndex(s => s.targetNodeId === node.id || s.branchId === node.id);
            const suggestion = suggestionIdx >= 0 ? charSuggestions[suggestionIdx] : null;
            const isBlocked = suggestion && suggestion.validated && suggestion.validated.severity === 'blocked';
            const isApplied = suggestion && suggestion.applied;

            html += `<div class="ai-rule-card">
                <div class="ai-rule-header">
                    <span class="ai-rule-drag">≡</span>
                    <span class="ai-rule-name">${i + 1}. ${node.name}</span>
                    <div class="ai-rule-actions">
                        ${suggestion && !isBlocked && !isApplied ? `<button class="ai-rule-action-btn suggest" onclick="AIEditor.applySuggestion('${char.name}',${suggestionIdx})" title="${suggestion.reason || '采纳建议'}">采纳建议</button>` : ''}
                        ${isApplied ? `<span style="color:#60c060;font-size:0.85em">已采纳</span>` : ''}
                        ${isBlocked ? `<span style="color:#f85149;font-size:0.85em">已拦截</span>` : ''}
                        <button class="ai-rule-action-btn" onclick="AIEditor.toggleRule('${char.name}',${i})">${node.enabled ? '✅' : '⬜'}</button>
                        <button class="ai-rule-action-btn" onclick="AIEditor.deleteRule('${char.name}',${i})">🗑️</button>
                    </div>
                </div>
                <div class="ai-rule-detail">
                    <span class="condition">当 ${conditionText}</span> → <span class="action">执行 ${actionText}</span>
                    ${node.action.fallback ? `<br><span style="color:#666">备选：${node.action.fallback}</span>` : ''}
                    ${suggestion ? (() => {
                        let suggestHtml = `<div class="suggestion-reason">${suggestion.reason || '建议优化AI配置'}</div>`;
                        // Phase 1: 性格倾向标签
                        if (suggestion.direction) {
                            const dir = suggestion.direction;
                            const tagColors = { increase: '#f85149', decrease: '#58a6ff', aggressive: '#f85149', conservative: '#58a6ff', balanced: '#f0c040' };
                            const tagLabels = { increase: '激进', decrease: '保守', aggressive: '激进', conservative: '保守', balanced: '均衡' };
                            const color = tagColors[dir] || '#f0c040';
                            const label = tagLabels[dir] || '均衡';
                            suggestHtml += ` <span style="color:${color};font-size:0.85em;font-weight:600">【${label}】</span>`;
                        }
                        // Phase 1: 当前值→建议值对比
                        if (suggestion.currentValue !== undefined && suggestion.suggestedValue !== undefined) {
                            suggestHtml += `<div style="font-size:0.85em;color:#8b949e">${suggestion.currentValue} → <span style="color:#f0c040">${suggestion.suggestedValue}</span></div>`;
                        }
                        // Phase 1: 拦截状态
                        if (suggestion.validated && suggestion.validated.severity !== 'ok') {
                            const sevColors = { downgrade: '#d29922', blocked: '#f85149' };
                            const sevLabels = { downgrade: '已降级', blocked: '已拦截' };
                            suggestHtml += ` <span style="color:${sevColors[suggestion.validated.severity]};font-size:0.8em">[${sevLabels[suggestion.validated.severity]}]</span>`;
                        }
                        return `<br><span style="color:#c8a84e">` + suggestHtml + `</span>`;
                    })() : ''}
                </div>
            </div>`;
        });
        html += '</div>';

        // 添加新规则按钮
        html += '<button class="ai-add-rule-btn" onclick="AIEditor.addRule()">➕ 添加新指令</button>';

        mainEl.innerHTML = html;
    },

    // 格式化行动显示
    formatAction(action) {
        switch (action.type) {
            case 'attack':
                return `攻击【${GameData.aiTargetStrategies[action.targetStrategy]?.name || action.targetStrategy}】`;
            case 'defend':
                return '防御';
            case 'flee':
                return '逃跑';
            case 'use_skill':
                return `使用技能`;
            case 'use_item':
                return `使用道具`;
            default:
                return action.type;
        }
    },

    // 应用预设模板
    applyPreset(presetKey) {
        const char = this.chars[this.currentCharIndex];
        if (!char) return;
        const preset = GameData.aiPresets[presetKey];
        if (!preset) return;

        char.aiConfig = JSON.parse(JSON.stringify(preset));
        this.renderEditor();
    },

    // 切换规则启用状态
    toggleRule(charName, ruleIndex) {
        const char = this.chars.find(c => c.name === charName);
        if (!char || !char.aiConfig?.behaviorTree[ruleIndex]) return;
        char.aiConfig.behaviorTree[ruleIndex].enabled = !char.aiConfig.behaviorTree[ruleIndex].enabled;
        this.renderEditor();
    },

    // 删除规则
    deleteRule(charName, ruleIndex) {
        const char = this.chars.find(c => c.name === charName);
        if (!char || !char.aiConfig?.behaviorTree) return;
        char.aiConfig.behaviorTree.splice(ruleIndex, 1);
        this.renderEditor();
    },

    // 添加新规则
    addRule() {
        const char = this.chars[this.currentCharIndex];
        if (!char || !char.aiConfig) return;

        const newRule = {
            id: 'custom_' + Date.now(),
            name: '新指令',
            priority: 50,
            type: 'condition',
            condition: { type: 'self_hp_below', value: 50 },
            action: { type: 'attack', targetStrategy: 'lowest_hp_enemy' },
            enabled: true
        };

        char.aiConfig.behaviorTree.push(newRule);
        this.renderEditor();
    },

    // 采纳建议
    applySuggestion(charName, suggestionIndex) {
        const char = this.chars.find(c => c.name === charName);
        if (!char || !char.aiConfig) return;

        const charSuggestions = this.suggestions[charName];
        if (!charSuggestions || !charSuggestions.adjustments) return;

        const suggestion = charSuggestions.adjustments[suggestionIndex];
        if (!suggestion || suggestion.validated && suggestion.validated.severity === 'blocked') return;

        const adjustedValue = suggestion.validated ? suggestion.validated.adjustedValue : suggestion.suggestedValue;

        switch (suggestion.type) {
            case 'threshold':
                // 修改条件阈值
                this.applyThresholdSuggestion(char, suggestion, adjustedValue);
                break;
            case 'skill_order':
                // 调整技能顺位
                this.applySkillOrderSuggestion(char, suggestion, adjustedValue);
                break;
            case 'branch_change':
                // 新增分支
                if (suggestion.changeType === 'add' && suggestion.suggestedNode) {
                    char.aiConfig.behaviorTree.push(suggestion.suggestedNode);
                }
                break;
            case 'modify_condition':
            default:
                // 旧格式兼容：修改条件值
                this.applyThresholdSuggestion(char, suggestion, adjustedValue);
                break;
        }

        // Phase 1: 采纳建议时微调性格权重
        if (window.PersonalityEngine && suggestion.direction && char.battleData.personalityWeights) {
            char.battleData.personalityWeights = window.PersonalityEngine.adjustWeights(
                char.battleData.personalityWeights, suggestion.direction
            );
        }

        // 标记建议已采纳
        suggestion.applied = true;

        this.renderEditor();
    },

    applyThresholdSuggestion(char, suggestion, value) {
        const branches = char.aiConfig.behaviorTree || [];
        const branch = branches.find(b => b.id === (suggestion.branchId || suggestion.targetNodeId));
        if (branch && branch.condition && suggestion.paramPath === 'condition.value') {
            branch.condition.value = value;
        }
    },

    applySkillOrderSuggestion(char, suggestion, newOrder) {
        const branches = char.aiConfig.behaviorTree || [];
        const branch = branches.find(b => b.id === suggestion.branchId);
        if (branch && branch.skills && suggestion.skillId) {
            const skill = branch.skills.find(s => s.id === suggestion.skillId);
            if (skill) {
                skill.order = newOrder;
            }
        }
    },

    // 重置配置
    resetConfig() {
        const char = this.chars[this.currentCharIndex];
        if (!char) return;
        const original = this.originalConfigs[char.name];
        if (original) {
            char.aiConfig = JSON.parse(JSON.stringify(original));
            this.renderEditor();
        }
    },

    // 保存配置
    saveConfig() {
        this.chars.forEach(char => {
            const d = char.battleData;
            if (!d) return;

            // Phase 1: 保存GBDT模型组到localStorage
            if (window.MicroGBDT) {
                const modelGroup = window.MicroGBDT.loadModelGroup(char.id);
                if (modelGroup) {
                    window.MicroGBDT.saveModelGroup(modelGroup);
                }
            }

            // 重置滚动窗口（保留固化经验和性格权重）
            if (window.BattleDataRecorder) {
                window.BattleDataRecorder.resetWindow(char);
            }

            // 重置战斗经验值（开始新一轮积累）
            d.battleExp = 0;
            // 进化后翻倍上限
            d.expToEvolve = (d.expToEvolve || 100) * 2;
            d.battles = 0;
            d.wins = 0;
            d.losses = 0;
            d.totalDamageDealt = 0;
            d.totalDamageTaken = 0;
            d.totalHealingDone = 0;
            d.deathCount = 0;
            d.actions = { attack: 0, defend: 0, flee: 0, skills: {}, items: {} };
            d.criticalMoments = [];
            d.totalDecisions = 0;
            d.suggestionTracking = {};

            // 记录训练历史
            if (!d.trainingHistory) d.trainingHistory = [];
            d.trainingHistory.push({
                battleCount: 0,
                mlWeight: this.suggestions && this.suggestions[char.name] ? this.suggestions[char.name].mlWeight : 0,
                timestamp: Date.now()
            });

            // 注意：不重置 personalityWeights、solidifiedExperiences
        });

        Game.saveGame();
        Dialog.show('<p style="color:#60c060">AI战术配置已保存！GBDT模型已持久化，性格经验已保留。</p>');
        this.close();
    }
};

export default AIEditor;
