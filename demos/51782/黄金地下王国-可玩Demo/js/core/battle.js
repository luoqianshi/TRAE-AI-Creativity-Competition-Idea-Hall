// ============================================================
// Battle - core/battle.js
// 自动从 game.js 拆分
// ============================================================

const Battle = {
    enemies: [],
    turnOrder: [],
    currentTurnIndex: 0,
    currentCharIndex: 0, // 当前选择行动的角色索引
    isPlayerTurn: false,
    isBattleActive: false,
    isPaused: false, // ATB暂停标志（道具窗口打开时）
    pendingAction: null,
    battleLog: [],
    turnCount: 0, // 回合计数
    currentHiddenMonsterId: null, // 当前战斗的暗雷怪物ID（用于战斗结束后处理）
    _newEnemyAdded: false, // 新敌人加入战斗标志（需要锁定移动直到执行一轮）

    init() {
        // 战斗系统初始化
        // 初始化AI设置
        if (!Game.state.aiSettings) {
            Game.state.aiSettings = {
                battleSpeed: 1,
                showDecisionLog: true
            };
        }
    },

    // 设置战斗速度
    setBattleSpeed(speed) {
        const speedValue = parseInt(speed);
        if (!Game.state.aiSettings) {
            Game.state.aiSettings = {};
        }
        Game.state.aiSettings.battleSpeed = speedValue;
        console.log(`战斗速度设置为: ${speedValue === 0 ? '跳过' : speedValue + 'x'}`);
    },

    // 开始战斗（传统场景切换方式，暂时保留）
    startBattle(monsterIds, isBoss = false) {
        console.log(`[Battle] startBattle 被调用，怪物: ${monsterIds.join(', ')}`);
        this.isBattleActive = true;
        this.sceneBattleMode = false;  // 标记为传统战斗模式
        this.battleLog = [];
        this.enemies = [];

        // 创建敌人实例
        monsterIds.forEach((id, i) => {
            const data = GameData.monsters[id];
            this.enemies.push({
                id: id,
                name: data.name,
                image: data.image,
                hp: data.hp,
                maxHp: data.hp,
                atk: data.atk,
                def: data.def,
                agi: data.agi,
                exp: data.exp,
                gold: data.gold,
                isBoss: data.isBoss || false,
                bodySize: data.bodySize || 'medium',
                skills: data.skills.map(s => ({ ...s })),
                statusEffects: [],
                alive: true,
                index: i
            });
        });

        // 重置队伍战斗状态
        Game.state.party.forEach(char => {
            char.isDefending = false;
            char.statusEffects = char.statusEffects || [];
        });

        // 重置回合计数
        this.turnCount = 0;

        // 初始化ATB系统
        GlobalATBSystem.initBattleATB(this.enemies);

        // 更新战斗状态
        Game.state.battleState = {
            active: true,
            enemies: this.enemies.map(e => e.id),
            engagedMonsterIds: this.currentHiddenMonsterId ? [this.currentHiddenMonsterId] : [],
            turnCount: 0
        };

        // 切换到战斗画面
        Game.showScreen('battle-screen');

        // 渲染
        this.renderEnemies();
        this.renderPartyStatus();
        this.addLog(`遭遇了${this.enemies.map(e => e.name).join('、')}！`, 'info');

        // 记录战斗开始数据
        this.recordBattleStart();

        // 开始第一回合
        this.startTurn();
    },

    // 场景内战斗入口（无场景切换）
    startInSceneBattle(monsterIds, hiddenMonsterId = null) {
        console.log(`[Battle] startInSceneBattle 被调用，怪物: ${monsterIds.join(', ')}`);

        // 如果已在战斗中，将新敌人加入当前战斗
        if (this.isBattleActive && this.sceneBattleMode) {
            this.addEnemiesToCurrentBattle(monsterIds, hiddenMonsterId);
            return;
        }
        
        this.isBattleActive = true;
        this.sceneBattleMode = true;  // 标记为场景内战斗模式
        // 取消之前的UI隐藏计时器，防止上一场战斗的hideBattleUI吞噬新战斗UI
        if (this._hideUITimer) { clearTimeout(this._hideUITimer); this._hideUITimer = null; }
        this.battleLog = [];
        this.enemies = [];
        this.currentHiddenMonsterId = hiddenMonsterId;

        // 锁定玩家移动，直到首回合战斗结束
        Maze.moveCooldown = true;

        // 创建敌人实例
        monsterIds.forEach((id, i) => {
            const data = GameData.monsters[id];
            this.enemies.push({
                id: id,
                name: data.name,
                image: data.image,
                hp: data.hp,
                maxHp: data.hp,
                atk: data.atk,
                def: data.def,
                agi: data.agi,
                exp: data.exp,
                gold: data.gold,
                isBoss: data.isBoss || false,
                bodySize: data.bodySize || 'medium',
                skills: data.skills.map(s => ({ ...s })),
                statusEffects: [],
                alive: true,
                index: i
            });
        });

        // 重置队伍战斗状态
        Game.state.party.forEach(char => {
            char.isDefending = false;
            char.statusEffects = char.statusEffects || [];
        });

        // 重置回合计数
        this.turnCount = 0;

        // 初始化ATB系统
        GlobalATBSystem.initBattleATB(this.enemies);

        // 更新战斗状态
        Game.state.battleState = {
            active: true,
            enemies: this.enemies.map(e => e.id),
            engagedMonsterIds: hiddenMonsterId ? [hiddenMonsterId] : [],
            turnCount: 0
        };

        // 不切换场景，显示场景内战斗UI
        this.showBattleUIInScene();

        // 记录战斗开始数据
        this.recordBattleStart();

        // 延迟1.5秒再启动ATB战斗循环，让玩家看清遭遇了什么
        setTimeout(() => {
            if (this.isBattleActive) {
                this.executeATBBattle();
            }
        }, 1500);
    },

    // 将新敌人加入当前进行中的战斗
    addEnemiesToCurrentBattle(monsterIds, hiddenMonsterId) {
        console.log(`[Battle] 战斗中加入新敌人: ${monsterIds.join(', ')}`);

        // 锁定移动，直到新敌人加入后执行一轮行动
        Maze.moveCooldown = true;
        if (Maze._cooldownTimer) {
            clearTimeout(Maze._cooldownTimer);
            Maze._cooldownTimer = null;
        }
        // 取消之前的UI隐藏计时器（新敌人加入，继续战斗）
        if (this._hideUITimer) { clearTimeout(this._hideUITimer); this._hideUITimer = null; }
        this._newEnemyAdded = true;

        // 创建新敌人实例，index 接续现有敌人
        monsterIds.forEach((id) => {
            const data = GameData.monsters[id];
            const newIndex = this.enemies.length;
            this.enemies.push({
                id: id,
                name: data.name,
                image: data.image,
                hp: data.hp,
                maxHp: data.hp,
                atk: data.atk,
                def: data.def,
                agi: data.agi,
                exp: data.exp,
                gold: data.gold,
                isBoss: data.isBoss || false,
                bodySize: data.bodySize || 'medium',
                skills: data.skills.map(s => ({ ...s })),
                statusEffects: [],
                alive: true,
                index: newIndex
            });

            // 将新敌人加入 ATB 系统
            GlobalATBSystem.battleUnits.push({
                unit: this.enemies[newIndex],
                atb: 0,
                speed: GlobalATBSystem.calculateSpeed(data.agi),
                isPlayer: false,
                index: newIndex,
                name: data.name
            });
        });

        // 更新 engagedMonsterIds
        if (hiddenMonsterId && Game.state.battleState) {
            if (!Game.state.battleState.engagedMonsterIds.includes(hiddenMonsterId)) {
                Game.state.battleState.engagedMonsterIds.push(hiddenMonsterId);
            }
        }

        // 刷新敌人显示（追加而非重建）
        this.showEnemiesInScene();

        // 战斗日志提示
        const newNames = monsterIds.map(id => GameData.monsters[id].name);
        this.showBattleLog(`${newNames.join('、')} 加入了战斗！`, '');
    },

    // 显示场景内战斗UI
    showBattleUIInScene() {
        console.log('[Battle] 显示场景内战斗UI');
        
        // 1. 镜头拉近动画
        const viewport = document.getElementById('maze-viewport');
        viewport.classList.add('zoom-in', 'in-battle');
        
        // 2. 显示敌人UI
        this.showEnemiesInScene();
        
        // 3. 显示战斗日志
        setTimeout(() => {
            const logBar = document.getElementById('battle-log-bar');
            logBar.classList.add('visible');
            this.showBattleLog(`遭遇了${this.enemies.map(e => e.name).join('、')}！`, '');
        }, 200);
        
        // 4. 显示队伍面板
        setTimeout(() => {
            this.showPartyPanel();
        }, 300);
    },

    // 在场景中央显示敌人（世界树迷宫风格：无框图片，前后排错开）
    showEnemiesInScene() {
        const container = document.getElementById('battle-enemies');
        let html = '';

        // 将敌人分配到前排和后排
        const frontRow = [];
        const backRow = [];
        this.enemies.forEach((enemy, i) => {
            // 前3个放前排，其余放后排
            if (i < 3) {
                frontRow.push({ enemy, index: i });
            } else {
                backRow.push({ enemy, index: i });
            }
        });

        // 前排敌人（更大、更靠下）
        frontRow.forEach(({ enemy, index: i }) => {
            const imgUrl = enemy.image || '';
            const sizeClass = enemy.bodySize ? `size-${enemy.bodySize}` : '';
            const unitSizeClass = enemy.bodySize ? `enemy-${enemy.bodySize}` : '';
            const anchorOffset = enemy.bodySize === 'giant' ? 320 : 120;
            // 前排水平居中分布，错开偏移（图片放大后间距也加大）
            const offset = (i - (frontRow.length - 1) / 2) * 200;
            
            html += `<div class="battle-enemy-unit enemy-front ${unitSizeClass}" id="scene-enemy-${i}" data-index="${i}" style="left: calc(50% + ${offset}px - ${anchorOffset}px)">
                <img class="e-sprite ${sizeClass}" src="${imgUrl}" alt="${enemy.name}">
            </div>`;
        });

        // 后排敌人（更小、更靠上、偏右错开）
        backRow.forEach(({ enemy, index: i }) => {
            const imgUrl = enemy.image || '';
            const sizeClass = enemy.bodySize ? `size-${enemy.bodySize}` : '';
            const unitSizeClass = enemy.bodySize ? `enemy-${enemy.bodySize}` : '';
            const anchorOffset = enemy.bodySize === 'giant' ? 250 : 90;
            const backIndex = i - frontRow.length;
            const offset = (backIndex - (backRow.length - 1) / 2) * 160 + 40;
            
            html += `<div class="battle-enemy-unit enemy-back ${unitSizeClass}" id="scene-enemy-${i}" data-index="${i}" style="left: calc(50% + ${offset}px - ${anchorOffset}px)">
                <img class="e-sprite ${sizeClass}" src="${imgUrl}" alt="${enemy.name}">
            </div>`;
        });

        container.innerHTML = html;
        container.classList.add('visible');
    },

    // 根据敌人ID获取图标
    getEnemyIcon(enemyId) {
        const iconMap = {
            // B1F
            'emerald_slime': '🟢',
            'forest_bat': '🦇',
            'scissor_beetle': '🪲',
            'forest_mouse': '🐁',
            // B2F
            'poison_swallowtail': '🦋',
            'mandrake': '🌿',
            'findhorn_deer': '🦌',
            'mad_stag_foe': '🦌',
            // B3F
            'rot_root_treant': '🌳',
            'bone_warrior': '💀',
            'raging_bull_foe': '🐂',
            'ancient_dragon_boss': '🐉'
        };
        return iconMap[enemyId] || '👾';
    },

    // 显示队伍状态面板
    showPartyPanel() {
        const panel = document.getElementById('party-status-panel');
        panel.classList.add('visible');
        this.updatePartyPanel();
    },

    // 更新队伍状态面板
    updatePartyPanel() {
        const frontRow = document.getElementById('party-front-row');
        const backRow = document.getElementById('party-back-row');
        
        let frontHtml = '';
        let backHtml = '';
        
        Game.state.party.forEach((char, i) => {
            const isDead = char.stats.HP <= 0;
            const hpPct = Math.max(0, (char.stats.HP / char.maxStats.HP) * 100);
            const tpPct = Math.max(0, (char.stats.TP / char.maxStats.TP) * 100);
            const isActive = i === this.currentCharIndex && this.isPlayerTurn;
            
            // 使用assets/ui/icon/下的icon（根据classId和appearanceIndex匹配）
            const classId = char.classId || 'warrior';
            let appearanceIndex = char.appearanceIndex;
            if (appearanceIndex === undefined || appearanceIndex === null) {
                // 从portrait/icon路径中提取外观索引，如 "warrior_3.png" → 3
                const src = char.portrait || char.icon || '';
                const match = src.match(/_(\d+)\.\w+$/);
                appearanceIndex = match ? parseInt(match[1]) : 0;
                // 保存回角色数据
                char.appearanceIndex = appearanceIndex;
            }
            const iconUrl = `assets/ui/icon/${classId}_${appearanceIndex}_icon.png`;
            
            const unitHtml = `<div class="party-unit ${isDead ? 'dead' : ''} ${isActive ? 'active-turn' : ''}">
                <div class="p-portrait" style="background-image: url('${iconUrl}')"></div>
                <div class="p-content">
                    <div class="p-name">${char.name}</div>
                    <div class="p-bars">
                        <div class="p-bar p-hp-bar">
                            <div class="p-hp-fill" style="width:${hpPct}%"></div>
                        </div>
                        <div class="p-bar p-tp-bar">
                            <div class="p-tp-fill" style="width:${tpPct}%"></div>
                        </div>
                    </div>
                </div>
            </div>`;
            
            if (i < 3) {
                frontHtml += unitHtml;
            } else {
                backHtml += unitHtml;
            }
        });
        
        frontRow.innerHTML = frontHtml;
        backRow.innerHTML = backHtml;
    },

    // 隐藏所有战斗UI
    hideBattleUI() {
        console.log('[Battle] 隐藏战斗UI');
        
        // 1. 移除镜头拉近
        const viewport = document.getElementById('maze-viewport');
        if (viewport) viewport.classList.remove('zoom-in', 'in-battle');
        
        // 2. 隐藏敌人
        const enemiesContainer = document.getElementById('battle-enemies');
        if (enemiesContainer) {
            enemiesContainer.classList.remove('visible');
            enemiesContainer.innerHTML = '';
        }
        
        // 3. 清理飘血层
        const floatLayer = document.getElementById('damage-float-layer');
        if (floatLayer) floatLayer.innerHTML = '';
        
        // 4. 隐藏战斗日志
        const logBar = document.getElementById('battle-log-bar');
        if (logBar) logBar.classList.remove('visible');
        
        // 5. 隐藏队伍面板
        const panel = document.getElementById('party-status-panel');
        if (panel) panel.classList.remove('visible');
        
        // 6. 隐藏AI决策文本
        const aiText = document.getElementById('ai-decision-text');
        if (aiText) aiText.classList.remove('visible');
    },

    // 显示战斗日志（最多两行）
    showBattleLog(line1, line2) {
        const el1 = document.getElementById('battle-log-line1');
        const el2 = document.getElementById('battle-log-line2');
        if (el1) el1.textContent = line1;
        if (el2) el2.textContent = line2;
    },

    // 显示AI决策文本
    showAIDecisionText(text) {
        const aiText = document.getElementById('ai-decision-text');
        if (!aiText) return;
        aiText.textContent = text;
        aiText.classList.add('visible');
    },

    // 隐藏AI决策文本
    hideAIDecisionText() {
        const aiText = document.getElementById('ai-decision-text');
        aiText.classList.remove('visible');
    },

    // 高亮当前行动者（玩家角色框浮雕凸起 / 敌人边缘光闪动）
    highlightActiveUnit(battleUnit) {
        if (battleUnit.isPlayer) {
            // 玩家角色：高亮对应的队伍面板角色框
            const allUnits = document.querySelectorAll('.party-unit');
            if (allUnits[battleUnit.index]) {
                allUnits[battleUnit.index].classList.add('active-unit');
            }
        } else {
            // 敌人：添加边缘光闪动
            const enemyUnit = document.getElementById(`scene-enemy-${battleUnit.index}`);
            if (enemyUnit) {
                enemyUnit.classList.add('enemy-active');
            }
        }
    },

    // 取消行动者高亮
    clearActiveUnitHighlight(battleUnit) {
        if (battleUnit.isPlayer) {
            const allUnits = document.querySelectorAll('.party-unit');
            if (allUnits[battleUnit.index]) {
                allUnits[battleUnit.index].classList.remove('active-unit');
            }
        } else {
            const enemyUnit = document.getElementById(`scene-enemy-${battleUnit.index}`);
            if (enemyUnit) {
                enemyUnit.classList.remove('enemy-active');
            }
        }
    },

    // 场景内敌人受击动画
    shakeEnemyInScene(index) {
        const enemyUnit = document.getElementById(`scene-enemy-${index}`);
        if (enemyUnit) {
            enemyUnit.classList.add('shake');
            setTimeout(() => enemyUnit.classList.remove('shake'), 300);
        }
    },

    // 玩家角色框受击抖动
    shakePlayerUnit(charIndex) {
        const allUnits = document.querySelectorAll('.party-unit');
        if (allUnits[charIndex]) {
            allUnits[charIndex].classList.add('hit-shake');
            setTimeout(() => allUnits[charIndex].classList.remove('hit-shake'), 300);
        }
    },

    // 显示飘血数字
    showDamageNumber(targetType, targetIndex, value, type = 'damage') {
        const layer = document.getElementById('damage-float-layer');
        if (!layer) return;

        let targetEl = null;
        if (targetType === 'enemy') {
            targetEl = document.getElementById(`scene-enemy-${targetIndex}`);
        } else if (targetType === 'player') {
            const allUnits = document.querySelectorAll('.party-unit');
            targetEl = allUnits[targetIndex] || null;
        }
        if (!targetEl) return;

        const viewport = document.getElementById('maze-viewport');
        const vpRect = viewport.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        const el = document.createElement('div');
        el.className = `damage-number ${type}`;
        el.textContent = type === 'heal' ? `+${value}` : `-${value}`;

        // 计算相对于 viewport 的位置（居中于目标上方）
        const left = targetRect.left - vpRect.left + targetRect.width / 2;
        const top = targetRect.top - vpRect.top;

        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.transform = 'translateX(-50%)';

        layer.appendChild(el);

        // 动画结束后移除
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1200);
    },

    // 显示物理砍击斜线特效
    showSlashEffect(enemyIndex) {
        const enemyUnit = document.getElementById(`scene-enemy-${enemyIndex}`);
        if (!enemyUnit) return;

        // 确保敌人容器有 position: relative
        const pos = window.getComputedStyle(enemyUnit).position;
        if (pos === 'static') {
            enemyUnit.style.position = 'relative';
        }

        // 创建特效元素
        const slash = document.createElement('div');
        slash.className = 'hit-slash-effect';
        enemyUnit.appendChild(slash);

        // 动画结束后移除
        setTimeout(() => {
            if (slash.parentNode) {
                slash.parentNode.removeChild(slash);
            }
        }, 400);
    },

    // 更新场景内敌人显示（硬核DRPG不显示血条）
    updateEnemiesInScene() {
        this.enemies.forEach((enemy, i) => {
            const enemyUnit = document.getElementById(`scene-enemy-${i}`);
            if (enemyUnit) {
                if (!enemy.alive) {
                    enemyUnit.classList.add('dead');
                    // 0.2s 后从 DOM 中移除（配合 CSS 0.15s transition）
                    setTimeout(() => {
                        if (enemyUnit.parentNode) {
                            enemyUnit.parentNode.removeChild(enemyUnit);
                        }
                    }, 200);
                } else {
                    enemyUnit.classList.remove('dead');
                }
            }
        });
    },

    // 使用ATB系统执行完整战斗
    // 返回: { victory: boolean, rounds: number }
    async executeATBBattle() {
        console.log(`[Battle] 开始ATB战斗`);
        
        let totalRounds = 0;
        const maxRounds = 100;  // 防止无限循环
        
        while (this.isBattleActive && totalRounds < maxRounds) {
            totalRounds++;
            Game.state.battleState.turnCount = totalRounds;
            console.log(`[Battle] === 第 ${totalRounds} 轮ATB战斗 ===`);
            
            // 执行一轮ATB战斗
            const result = await GlobalATBSystem.executeBattleRound();
            
            // 一轮完毕后的处理
            if (result.roundComplete) {
                // 首轮回合结束后，或新敌人加入后一轮结束时，解除玩家移动锁定
                if (totalRounds === 1 || this._newEnemyAdded) {
                    this._newEnemyAdded = false;
                    Maze.moveCooldown = false;
                }
                // 每轮结束刷新地图状态；战斗中右上大地图只更新玩家标记，右下局部地图完整刷新
                MapEditor.render();
                
                // 注意：步数只应在玩家实际移动时增加，不在ATB战斗中增加
                // Game.state.steps++;
                
                // 交战外的迷宫单位行动一步
                this.moveOutsideMonsters();
                
                // 检查战斗结果
                if (result.victory) {
                    console.log(`[Battle] 战斗胜利！共 ${totalRounds} 轮`);
                    // ATB路径需要在此处处理暗雷怪物（GlobalATBSystem.checkBattleEnd不处理）
                    if (this.currentHiddenMonsterId) {
                        HiddenMonsterManager.onBattleEnd(this.currentHiddenMonsterId, true);
                        this.currentHiddenMonsterId = null;
                    }
                    this.onVictory();
                    return { victory: true, rounds: totalRounds };
                } else if (result.defeat) {
                    console.log(`[Battle] 战斗失败！共 ${totalRounds} 轮`);
                    this.onDefeat();
                    return { victory: false, rounds: totalRounds };
                }
            }
        }
        
        // 超过最大轮数，视为失败
        console.log(`[Battle] 战斗超过最大轮数 ${maxRounds}`);
        return { victory: false, rounds: totalRounds };
    },

    // 交战外的迷宫单位行动
    moveOutsideMonsters() {
        // 获取当前交战中的怪物ID列表
        const engagedIds = Game.state.battleState.engagedMonsterIds || [];
        
        // 让交战外的暗雷怪物行动
        Game.state.hiddenMonsters.forEach(monster => {
            // 跳过已死亡或正在交战的怪物
            if (!monster.isAlive || monster.isInBattle) return;
            // 跳过交战中的怪物
            if (engagedIds.includes(monster.id)) return;
            
            // 这个怪物在交战外，让它行动一步
            // 使用HiddenMonsterManager的移动逻辑
            const playerX = Game.state.playerX;
            const playerY = Game.state.playerY;
            const distToPlayer = HiddenMonsterManager.getDistance(
                monster.currentX, monster.currentY,
                playerX, playerY
            );
            
            // 检查是否在追击范围内
            if (distToPlayer <= monster.chaseRange && distToPlayer > 0) {
                const moveDir = HiddenMonsterManager.getMoveDirection(
                    monster.currentX, monster.currentY,
                    playerX, playerY
                );
                const newX = monster.currentX + moveDir.dx;
                const newY = monster.currentY + moveDir.dy;
                if (HiddenMonsterManager.canMoveTo(newX, newY)) {
                    monster.currentX = newX;
                    monster.currentY = newY;
                    console.log(`[Battle] 交战外怪物 ${monster.id} 移动到 (${newX}, ${newY})`);
                }
            }
        });
    },

    // 战斗失败处理
    onDefeat() {
        this.isBattleActive = false;
        GlobalATBSystem.clearBattleATB();
        
        // 保持移动锁定（全灭后不允许移动，直到返回城镇）
        Maze.moveCooldown = true;
        if (Maze._cooldownTimer) {
            clearTimeout(Maze._cooldownTimer);
            Maze._cooldownTimer = null;
        }
        
        // 记录战斗失败数据
        this.recordBattleLoss();
        this.addLog('队伍全灭了...', 'damage');
        
        // 处理暗雷怪物
        if (this.currentHiddenMonsterId) {
            HiddenMonsterManager.onBattleEnd(this.currentHiddenMonsterId, false);
            this.currentHiddenMonsterId = null;
        }
        
        // 重置战斗状态
        Game.state.battleState = {
            active: false,
            enemies: [],
            engagedMonsterIds: [],
            turnCount: 0
        };
        
        // 检查是否在场景内战斗模式（使用变量判断）
        const isInSceneBattle = this.sceneBattleMode === true;
        
        setTimeout(() => {
            // 惩罚：损失一半经验、70%金币，复活返回城镇
            Game.state.party.forEach(c => {
                c.exp = Math.floor(c.exp / 2);
            });
            const lostGold = Math.floor(Game.state.gold * 0.7);
            Game.state.gold -= lostGold;
            // 复活所有角色（HP/TP恢复为1）
            Game.state.party.forEach(c => {
                c.stats.HP = 1;
                c.stats.TP = 1;
            });
            // 保存惩罚后的状态
            Game.saveGame();
            
            if (isInSceneBattle) {
                // 场景内战斗：先隐藏战斗UI
                this.hideBattleUI();
            }
            
            // 显示全灭弹窗
            const goContent = document.querySelector('.gameover-content');
            goContent.innerHTML = `
                <h1>全灭...</h1>
                <p>你的队伍被迷宫中的怪物击败了...</p>
                <p style="color:#e07070;margin:10px 0">损失经验：一半 | 损失金币：${lostGold}G</p>
                <button class="menu-btn" onclick="Maze.returnToTown()">返回城镇</button>
            `;
            Game.showScreen('gameover-screen');
        }, 1500);
    },

    // 开始新回合
    startTurn() {
        // 构建行动顺序（按AGI排序）
        this.turnOrder = [];

        // 玩家角色
        Game.state.party.forEach((char, i) => {
            if (char.stats.HP > 0) {
                this.turnOrder.push({
                    type: 'player',
                    index: i,
                    agi: char.stats.AGI + (char.bonusStats ? char.bonusStats.AGI : 0),
                    acted: false
                });
            }
        });

        // 敌人
        this.enemies.forEach((enemy, i) => {
            if (enemy.alive) {
                this.turnOrder.push({
                    type: 'enemy',
                    index: i,
                    agi: enemy.agi,
                    acted: false
                });
            }
        });

        // 按AGI降序排序
        this.turnOrder.sort((a, b) => b.agi - a.agi);

        this.currentTurnIndex = 0;
        this.turnCount++;
        this.processNextTurn();
    },

    // 处理下一个行动
    processNextTurn() {
        // 检查战斗是否结束
        if (this.checkBattleEnd()) return;

        if (this.currentTurnIndex >= this.turnOrder.length) {
            // 回合结束，处理状态效果，开始新回合
            this.processStatusEffects();
            this.startTurn();
            return;
        }

        const turn = this.turnOrder[this.currentTurnIndex];
        this.currentTurnIndex++;

        if (turn.type === 'player') {
            this.isPlayerTurn = true;
            this.currentCharIndex = turn.index;
            this.highlightActiveChar(turn.index);
            // 自动战斗：直接执行AI决策
            setTimeout(() => this.executeAIAction(turn.index), 500);
        } else {
            this.isPlayerTurn = false;
            this.enableCommands(false);
            // 敌人AI行动
            setTimeout(() => this.enemyAction(turn.index), 500);
        }
    },

    // AI决策系统 - 根据角色AI配置决定行动
    // 支持两种格式：
    // - 旧格式（扁平节点列表）：每个节点有 action
    // - 新格式（分支结构）：每个分支有 skills 数组
    async decideAIAction(char) {
        if (!char.aiConfig) {
            char.aiConfig = JSON.parse(JSON.stringify(GameData.aiPresets.balanced));
        }

        const aiConfig = char.aiConfig;
        const battleState = this.getBattleState();
        const thinkingLogs = [];

        // 检测行为树格式：新格式分支有 skills 数组
        const isBranchFormat = aiConfig.behaviorTree.length > 0 && aiConfig.behaviorTree[0].skills !== undefined;

        if (isBranchFormat) {
            // === 新格式：分支结构遍历 ===
            // 按优先级排序
            const sortedBranches = [...aiConfig.behaviorTree].sort((a, b) => (b.priority || 0) - (a.priority || 0));

            for (const branch of sortedBranches) {
                if (!branch.enabled) continue;

                const conditionMet = this.checkAICondition(branch.condition, char, battleState);
                thinkingLogs.push({
                    ruleName: branch.name || branch.id,
                    condition: this.formatCondition(branch.condition),
                    result: conditionMet
                });

                if (conditionMet) {
                    // 遍历分支内技能（按顺位排序）
                    const sortedSkills = [...(branch.skills || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

                    for (const skill of sortedSkills) {
                        const skillAction = this.resolveSkillAction(skill);
                        if (this.canExecuteAIAction(skillAction, char)) {
                            // 保存决策上下文供 BattleDataRecorder 使用
                            this._lastDecisionState = this.extractGBDTFeatures(char, battleState);
                            this._lastTriggeredBranch = branch.id;
                            this._lastAvailableSkills = sortedSkills.map(s => s.id);

                            return {
                                action: skillAction,
                                thinkingLogs: thinkingLogs,
                                selectedRule: `${branch.name || branch.id} > ${skill.id}(顺位${skill.order})`,
                                triggeredBranch: branch.id,
                                branchSkills: sortedSkills.map(s => s.id),
                                stateSnapshot: this._lastDecisionState
                            };
                        }
                    }
                }
            }
        } else {
            // === 旧格式：扁平节点遍历（兼容旧存档） ===
            for (const node of aiConfig.behaviorTree) {
                if (!node.enabled) continue;

                const conditionMet = this.checkAICondition(node.condition, char, battleState);
                thinkingLogs.push({
                    ruleName: node.name,
                    condition: this.formatCondition(node.condition),
                    result: conditionMet
                });

                if (conditionMet) {
                    if (this.canExecuteAIAction(node.action, char)) {
                        this._lastDecisionState = this.extractGBDTFeatures(char, battleState);
                        this._lastTriggeredBranch = node.id;
                        this._lastAvailableSkills = [node.action.type];

                        return {
                            action: node.action,
                            thinkingLogs: thinkingLogs,
                            selectedRule: node.name,
                            triggeredBranch: node.id,
                            branchSkills: [node.action.type],
                            stateSnapshot: this._lastDecisionState
                        };
                    } else if (node.action.fallback) {
                        return {
                            action: { type: node.action.fallback },
                            thinkingLogs: thinkingLogs,
                            selectedRule: `${node.name}(备选)`,
                            triggeredBranch: node.id,
                            branchSkills: [node.action.fallback],
                            stateSnapshot: this._lastDecisionState
                        };
                    }
                }
            }
        }

        // 默认行动：普通攻击
        this._lastDecisionState = this.extractGBDTFeatures(char, battleState);
        this._lastTriggeredBranch = 'default';
        this._lastAvailableSkills = ['normal_attack'];

        return {
            action: { type: 'attack', targetStrategy: 'lowest_hp_enemy' },
            thinkingLogs: thinkingLogs,
            selectedRule: '默认攻击',
            triggeredBranch: 'default',
            branchSkills: ['normal_attack'],
            stateSnapshot: this._lastDecisionState
        };
    },

    // 将分支内技能节点解析为行动对象
    resolveSkillAction(skill) {
        switch (skill.type) {
            case 'attack':
                return { type: 'attack', targetStrategy: skill.targetStrategy || 'lowest_hp_enemy' };
            case 'defend':
                return { type: 'defend' };
            case 'use_skill':
                return { type: 'use_skill', skillIndex: skill.skillIndex, targetStrategy: skill.targetStrategy || 'lowest_hp_enemy' };
            case 'use_item':
                return { type: 'use_item', itemId: skill.itemId };
            default:
                return { type: 'attack', targetStrategy: 'lowest_hp_enemy' };
        }
    },

    // 提取GBDT特征向量（10维）
    extractGBDTFeatures(char, battleState) {
        const aliveAllies = (battleState.allies || []).filter(a => a.hp > 0);
        const aliveEnemies = (battleState.enemies || []).filter(e => e.alive);
        const avgEnemyHp = aliveEnemies.length > 0
            ? aliveEnemies.reduce((sum, e) => sum + (e.hpPercent || 0), 0) / aliveEnemies.length
            : 0;
        const lowestAllyHp = aliveAllies.length > 1
            ? Math.min(...aliveAllies.filter(a => a.name !== char.name).map(a => a.hp / a.maxHp * 100))
            : 100;

        return {
            self_hp_percent: char.stats.HP / char.maxStats.HP,
            teammate_lowest_hp_percent: lowestAllyHp / 100,
            enemy_count: aliveEnemies.length,
            self_tp: char.stats.TP,
            boss_present: aliveEnemies.some(e => e.isBoss) ? 1 : 0,
            turn_count: battleState.turnCount || 1,
            self_tp_percent: char.maxStats.TP > 0 ? char.stats.TP / char.maxStats.TP : 0,
            alive_allies_count: aliveAllies.length,
            alive_enemies_count: aliveEnemies.length,
            enemy_avg_hp_percent: avgEnemyHp / 100
        };
    },

    // 检查AI条件
    checkAICondition(condition, char, battleState) {
        if (!condition || condition.type === 'always') return true;

        const charMaxHP = char.maxStats.HP;
        const charHP = char.stats.HP;
        const charTP = char.stats.TP;

        switch (condition.type) {
            case 'self_hp_below':
                return (charHP / charMaxHP * 100) < condition.value;
            case 'self_hp_above':
                return (charHP / charMaxHP * 100) > condition.value;
            case 'self_tp_above':
                return charTP >= condition.value;
            case 'self_tp_below':
                return charTP < condition.value;
            case 'ally_hp_below':
                return battleState.allies.some(ally =>
                    ally.hp > 0 && (ally.hp / ally.maxHp * 100) < condition.value
                );
            case 'enemy_count_above':
                return battleState.enemies.filter(e => e.alive).length >= condition.value;
            case 'turn_above':
                return battleState.turnCount >= condition.value;
            default:
                return false;
        }
    },

    // 格式化条件显示
    formatCondition(condition) {
        if (!condition || condition.type === 'always') return '无条件';
        const typeDef = GameData.aiConditionTypes[condition.type];
        if (!typeDef) return condition.type;
        return `${typeDef.name} ${condition.value}${typeDef.unit}`;
    },

    // 检查AI行动是否可行
    canExecuteAIAction(action, char) {
        switch (action.type) {
            case 'attack':
                return true;
            case 'defend':
                return true;
            case 'flee':
                return true;
            case 'use_skill':
                // 检查TP是否足够
                const skill = char.skills[action.skillIndex];
                return skill && char.stats.TP >= skill.tpCost;
            case 'use_item':
                // Phase 4: AI不再自动使用道具
                // 道具由玩家通过道具弹窗手动使用
                return false;
            default:
                return false;
        }
    },

    // 获取战斗状态
    getBattleState() {
        return {
            enemies: this.enemies.map(e => ({
                ...e,
                hpPercent: e.hp / e.maxHp * 100
            })),
            allies: Game.state.party.map(c => ({
                name: c.name,
                hp: c.stats.HP,
                maxHp: c.maxStats.HP,
                tp: c.stats.TP,
                maxTp: c.maxStats.TP
            })),
            turnCount: this.turnCount || 1
        };
    },

    // 根据目标策略选择目标
    selectAITarget(action, char) {
        const targetStrategy = action.targetStrategy || 'lowest_hp_enemy';
        const aliveEnemies = this.enemies.filter(e => e.alive);

        if (aliveEnemies.length === 0) return null;

        switch (targetStrategy) {
            case 'lowest_hp_enemy':
                return aliveEnemies.reduce((min, e) => e.hp < min.hp ? e : min);
            case 'highest_threat':
                // 威胁度 = 攻击力 * HP百分比
                return aliveEnemies.reduce((max, e) =>
                    (e.atk * e.hp / e.maxHp) > (max.atk * max.hp / max.maxHp) ? e : max
                );
            case 'random_enemy':
                return aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            case 'lowest_hp_ally':
                const aliveAllies = Game.state.party.filter(c => c.stats.HP > 0);
                return aliveAllies.reduce((min, c) =>
                    c.stats.HP < min.stats.HP ? c : min
                );
            case 'self':
                return char;
            default:
                return aliveEnemies[0];
        }
    },

    // 玩家选择指令
    command(cmd) {
        if (!this.isPlayerTurn || !this.isBattleActive) return;

        const char = Game.state.party[this.currentCharIndex];

        switch (cmd) {
            case 'attack':
                this.pendingAction = { type: 'attack', charIndex: this.currentCharIndex };
                this.selectTarget('single_enemy');
                break;
            case 'skill':
                this.showSkillMenu();
                break;
            case 'defend':
                char.isDefending = true;
                this.addLog(`${char.name} 采取了防御姿态！`, 'info');
                this.enableCommands(false);
                setTimeout(() => this.processNextTurn(), 300);
                break;
            case 'item':
                this.showItemMenu();
                break;
            case 'flee':
                this.tryFlee();
                break;
        }
    },

    // 选择目标
    selectTarget(mode) {
        if (mode === 'single_enemy') {
            // 选择一个活着的敌人
            const aliveEnemies = this.enemies.filter(e => e.alive);
            if (aliveEnemies.length === 1) {
                this.executePlayerAction(aliveEnemies[0].index);
            } else {
                // 显示目标选择
                this.showTargetSelection();
            }
        }
    },

    // 显示目标选择UI
    showTargetSelection() {
        const enemyDisplay = document.getElementById('enemy-display');
        const enemyUnits = enemyDisplay.querySelectorAll('.enemy-unit');

        enemyUnits.forEach((unit, i) => {
            if (this.enemies[i] && this.enemies[i].alive) {
                unit.style.cursor = 'pointer';
                unit.style.border = '2px solid transparent';
                unit.onclick = () => {
                    // 清除所有点击事件
                    enemyUnits.forEach(u => {
                        u.style.cursor = 'default';
                        u.style.border = '2px solid #4a3a2a';
                        u.onclick = null;
                    });
                    this.executePlayerAction(i);
                };
                // 高亮提示
                unit.style.border = '2px solid #f0c040';
            }
        });

        this.addLog('请点击选择攻击目标。', 'info');
    },

    // 执行玩家行动
    executePlayerAction(targetIndex) {
        const action = this.pendingAction;
        const char = Game.state.party[action.charIndex];

        if (action.type === 'attack') {
            const enemy = this.enemies[targetIndex];
            const totalStr = char.stats.STR + (char.bonusStats ? char.bonusStats.STR : 0);
            const damage = Math.max(1, Math.floor(
                (char.stats.STR * 1.5 + totalStr * 0.5) - enemy.def * 0.5 + Math.random() * 5
            ));
            this.dealDamageToEnemy(targetIndex, damage);
            this.addLog(`${char.name} 攻击了 ${enemy.name}，造成 ${damage} 点伤害！`, 'damage');
            this.shakeEnemy(targetIndex);
        } else if (action.type === 'skill') {
            const skill = action.skill;
            char.stats.TP -= skill.tpCost;

            if (skill.type === 'physical') {
                if (skill.target === 'all') {
                    // 全体攻击
                    this.enemies.forEach((enemy, i) => {
                        if (enemy.alive) {
                            const totalStr = char.stats.STR + (char.bonusStats ? char.bonusStats.STR : 0);
                            const dmg = Math.max(1, Math.floor(
                                (char.stats.STR * skill.power + totalStr * 0.3) - enemy.def * 0.4 + Math.random() * 3
                            ));
                            this.dealDamageToEnemy(i, dmg);
                            this.addLog(`${char.name} 使用 ${skill.name} 对 ${enemy.name} 造成 ${dmg} 点伤害！`, 'damage');
                        }
                    });
                } else {
                    const enemy = this.enemies[targetIndex];
                    const totalStr = char.stats.STR + (char.bonusStats ? char.bonusStats.STR : 0);
                    const dmg = Math.max(1, Math.floor(
                        (char.stats.STR * skill.power + totalStr * 0.3) - enemy.def * 0.4 + Math.random() * 3
                    ));
                    this.dealDamageToEnemy(targetIndex, dmg);
                    this.addLog(`${char.name} 使用 ${skill.name} 对 ${enemy.name} 造成 ${dmg} 点伤害！`, 'damage');
                    this.shakeEnemy(targetIndex);

                    // 附加状态效果
                    if (skill.status === 'poison' && enemy.alive) {
                        enemy.statusEffects.push({ type: 'poison', turns: 3, damage: 5 });
                        this.addLog(`${enemy.name} 中毒了！`, 'info');
                    }
                }
            } else if (skill.type === 'magic') {
                const enemy = this.enemies[targetIndex];
                const totalInt = char.stats.INT + (char.bonusStats ? char.bonusStats.INT : 0);
                const dmg = Math.max(1, Math.floor(
                    (char.stats.INT * skill.power + totalInt * 0.5) - enemy.def * 0.3 + Math.random() * 5
                ));
                this.dealDamageToEnemy(targetIndex, dmg);
                this.addLog(`${char.name} 使用 ${skill.name} 对 ${enemy.name} 造成 ${dmg} 点魔法伤害！`, 'damage');
                this.shakeEnemy(targetIndex);
            } else if (skill.type === 'heal') {
                if (skill.target === 'all_ally') {
                    Game.state.party.forEach((ally, ai) => {
                        if (ally.stats.HP > 0) {
                            const healAmt = Math.floor(char.stats.INT * skill.power + 10);
                            ally.stats.HP = Math.min(ally.maxStats.HP, ally.stats.HP + healAmt);
                            this.showDamageNumber('player', ai, healAmt, 'heal');
                            this.addLog(`${ally.name} 恢复了 ${healAmt} 点HP！`, 'heal');
                        }
                    });
                } else {
                    // 选择治疗的队友（简化：治疗HP最低的队友）
                    let target = null;
                    let targetIdx = -1;
                    let lowestRatio = 1;
                    Game.state.party.forEach((ally, ai) => {
                        if (ally.stats.HP > 0) {
                            const ratio = ally.stats.HP / ally.maxStats.HP;
                            if (ratio < lowestRatio) {
                                lowestRatio = ratio;
                                target = ally;
                                targetIdx = ai;
                            }
                        }
                    });
                    if (target) {
                        const healAmt = Math.floor(char.stats.INT * skill.power + 10);
                        target.stats.HP = Math.min(target.maxStats.HP, target.stats.HP + healAmt);
                        this.showDamageNumber('player', targetIdx, healAmt, 'heal');
                        this.addLog(`${char.name} 使用 ${skill.name}，${target.name} 恢复了 ${healAmt} 点HP！`, 'heal');
                    }
                }
            } else if (skill.type === 'buff') {
                char.isDefending = true;
                char.statusEffects.push({ type: 'def_up', turns: 3 });
                this.addLog(`${char.name} 使用 ${skill.name}，防御力提升了！`, 'info');
            } else if (skill.type === 'debuff') {
                this.enemies.forEach(enemy => {
                    if (enemy.alive) {
                        enemy.statusEffects.push({ type: 'speed_down', turns: 3 });
                    }
                });
                this.addLog(`${char.name} 使用 ${skill.name}，全体敌人的速度降低了！`, 'info');
            }
        } else if (action.type === 'item') {
            const item = action.item;
            // 使用道具效果
            if (item.effect.type === 'heal_hp') {
                const target = Game.state.party[action.charIndex];
                const healed = Math.min(item.effect.value, target.maxStats.HP - target.stats.HP);
                target.stats.HP += healed;
                this.showDamageNumber('player', action.charIndex, healed, 'heal');
                this.addLog(`${target.name} 使用了 ${item.name}，恢复了 ${healed} 点HP！`, 'heal');
            } else if (item.effect.type === 'heal_tp') {
                const target = Game.state.party[action.charIndex];
                const healed = Math.min(item.effect.value, target.maxStats.TP - target.stats.TP);
                target.stats.TP += healed;
                this.addLog(`${target.name} 使用了 ${item.name}，恢复了 ${healed} 点TP！`, 'heal');
            } else if (item.effect.type === 'full_restore') {
                const target = Game.state.party[action.charIndex];
                target.stats.HP = target.maxStats.HP;
                target.stats.TP = target.maxStats.TP;
                this.addLog(`${target.name} 使用了 ${item.name}，完全恢复了！`, 'heal');
            } else if (item.effect.type === 'cure_poison') {
                const target = Game.state.party[action.charIndex];
                target.statusEffects = target.statusEffects.filter(s => s.type !== 'poison');
                this.addLog(`${target.name} 的中毒被治愈了！`, 'heal');
            }

            // 减少道具数量
            const inv = Game.state.inventory.find(i => i.id === item.id);
            if (inv) {
                inv.count--;
                if (inv.count <= 0) {
                    Game.state.inventory = Game.state.inventory.filter(i => i.count > 0);
                }
            }
        }

        this.pendingAction = null;
        this.enableCommands(false);
        this.renderEnemies();
        this.renderPartyStatus();

        setTimeout(() => this.processNextTurn(), 600);
    },

    // === ATB系统辅助方法 ===
    
    // 执行对目标的攻击（供GlobalATBSystem使用）
    async executeAttackOnTarget(char, target, charIndex) {
        const enemy = target;
        const totalStr = char.stats.STR + (char.bonusStats?.STR || 0);
        const damage = Math.max(1, Math.floor(
            (char.stats.STR * 1.5 + totalStr * 0.5) - enemy.def * 0.5 + Math.random() * 5
        ));
        this.dealDamageToEnemy(enemy.index, damage);
        this.addLog(`${char.name} 攻击了 ${enemy.name}，造成 ${damage} 点伤害！`, 'damage');
        this.shakeEnemy(enemy.index);
        this.showSlashEffect(enemy.index);
        this.recordAction(charIndex, 'attack');
        
        // 短暂延迟让动画播放
        await this.delay(300);
    },

    // 执行技能效果（供GlobalATBSystem使用）
    async executeSkillEffect(char, skill, charIndex) {
        this.recordAction(charIndex, 'skill', skill.name);
        
        if (skill.type === 'physical') {
            if (skill.target === 'all') {
                // 全体攻击
                this.enemies.forEach((enemy, i) => {
                    if (enemy.alive) {
                        const totalStr = char.stats.STR + (char.bonusStats?.STR || 0);
                        const dmg = Math.max(1, Math.floor(
                            (char.stats.STR * skill.power + totalStr * 0.3) - enemy.def * 0.4 + Math.random() * 3
                        ));
                        this.dealDamageToEnemy(i, dmg);
                        this.addLog(`${char.name} 使用 ${skill.name} 对 ${enemy.name} 造成 ${dmg} 点伤害！`, 'damage');
                    }
                });
            } else {
                // 单体攻击 - 选择目标
                const target = this.selectAITarget({ targetStrategy: 'lowest_hp_enemy' }, char);
                if (target) {
                    const totalStr = char.stats.STR + (char.bonusStats?.STR || 0);
                    const dmg = Math.max(1, Math.floor(
                        (char.stats.STR * skill.power + totalStr * 0.3) - target.def * 0.4 + Math.random() * 3
                    ));
                    this.dealDamageToEnemy(target.index, dmg);
                    this.addLog(`${char.name} 使用 ${skill.name} 对 ${target.name} 造成 ${dmg} 点伤害！`, 'damage');
                    this.shakeEnemy(target.index);

                    // 附加状态效果
                    if (skill.status === 'poison' && target.alive) {
                        target.statusEffects.push({ type: 'poison', turns: 3, damage: 5 });
                        this.addLog(`${target.name} 中毒了！`, 'info');
                    }
                }
            }
        } else if (skill.type === 'magic') {
            const target = this.selectAITarget({ targetStrategy: 'lowest_hp_enemy' }, char);
            if (target) {
                const totalInt = char.stats.INT + (char.bonusStats?.INT || 0);
                const dmg = Math.max(1, Math.floor(
                    (char.stats.INT * skill.power + totalInt * 0.5) - target.def * 0.3 + Math.random() * 5
                ));
                this.dealDamageToEnemy(target.index, dmg);
                this.addLog(`${char.name} 使用 ${skill.name} 对 ${target.name} 造成 ${dmg} 点魔法伤害！`, 'damage');
                this.shakeEnemy(target.index);
            }
        } else if (skill.type === 'heal') {
            if (skill.target === 'all_ally') {
                Game.state.party.forEach((ally, ai) => {
                    if (ally.stats.HP > 0) {
                        const healAmt = Math.floor(char.stats.INT * skill.power + 10);
                        ally.stats.HP = Math.min(ally.maxStats.HP, ally.stats.HP + healAmt);
                        this.showDamageNumber('player', ai, healAmt, 'heal');
                        this.addLog(`${ally.name} 恢复了 ${healAmt} 点HP！`, 'heal');
                    }
                });
            } else {
                // 选择治疗的队友（HP最低的队友）
                let healTarget = null;
                let healTargetIdx = -1;
                let lowestRatio = 1;
                Game.state.party.forEach((ally, ai) => {
                    if (ally.stats.HP > 0) {
                        const ratio = ally.stats.HP / ally.maxStats.HP;
                        if (ratio < lowestRatio) {
                            lowestRatio = ratio;
                            healTarget = ally;
                            healTargetIdx = ai;
                        }
                    }
                });
                if (healTarget) {
                    const healAmt = Math.floor(char.stats.INT * skill.power + 10);
                    healTarget.stats.HP = Math.min(healTarget.maxStats.HP, healTarget.stats.HP + healAmt);
                    this.showDamageNumber('player', healTargetIdx, healAmt, 'heal');
                    this.addLog(`${char.name} 使用 ${skill.name}，${healTarget.name} 恢复了 ${healAmt} 点HP！`, 'heal');
                }
            }
        } else if (skill.type === 'buff') {
            char.isDefending = true;
            char.statusEffects.push({ type: 'def_up', turns: 3 });
            this.addLog(`${char.name} 使用 ${skill.name}，防御力提升了！`, 'info');
        } else if (skill.type === 'debuff') {
            this.enemies.forEach(enemy => {
                if (enemy.alive) {
                    enemy.statusEffects.push({ type: 'speed_down', turns: 3 });
                }
            });
            this.addLog(`${char.name} 使用 ${skill.name}，全体敌人的速度降低了！`, 'info');
        }
        
        // 短暂延迟让动画播放
        await this.delay(300);
    },

    // 执行AI行动（自动战斗）
    async executeAIAction(charIndex) {
        const char = Game.state.party[charIndex];
        if (!char || char.stats.HP <= 0) {
            this.processNextTurn();
            return;
        }

        // 显示AI思考过程
        const decision = await this.decideAIAction(char);

        // 根据战斗速度决定是否显示思考过程
        const battleSpeed = Game.state.aiSettings?.battleSpeed || 1;
        if (battleSpeed === 1) {
            await this.showAIThinking(decision.thinkingLogs, decision.selectedRule, char.name);
        }

        // 执行决策的行动
        const action = decision.action;
        let target = null;

        switch (action.type) {
            case 'attack':
                this.recordAction(charIndex, 'attack');
                target = this.selectAITarget(action, char);
                if (target) {
                    this.pendingAction = { type: 'attack', charIndex: charIndex };
                    this.executePlayerAction(target.index);
                }
                break;

            case 'defend':
                this.recordAction(charIndex, 'defend');
                char.isDefending = true;
                this.addLog(`${char.name} 采取了防御姿态！`, 'info');
                this.renderPartyStatus();
                setTimeout(() => this.processNextTurn(), 600);
                break;

            case 'use_skill':
                const skill = char.skills[action.skillIndex];
                if (skill) {
                    this.recordAction(charIndex, 'skill', skill.name);
                    this.pendingAction = { type: 'skill', skill: skill, charIndex: charIndex };
                    if (skill.target === 'all' || skill.target === 'all_ally') {
                        this.executePlayerAction(0);
                    } else {
                        target = this.selectAITarget(action, char);
                        if (target) {
                            this.executePlayerAction(target.index || 0);
                        }
                    }
                }
                break;

            case 'use_item':
                // Phase 4: AI不再自动使用道具，改为防御
                // 玩家通过道具弹窗手动使用道具
                this.recordAction(charIndex, 'defend');
                char.isDefending = true;
                this.addLog(`${char.name} 采取了防御姿态！`, 'info');
                this.renderPartyStatus();
                setTimeout(() => this.processNextTurn(), 600);
                break;

            case 'flee':
                this.tryFlee();
                break;

            default:
                // 默认攻击
                target = this.selectAITarget({ targetStrategy: 'lowest_hp_enemy' }, char);
                if (target) {
                    this.pendingAction = { type: 'attack', charIndex: charIndex };
                    this.executePlayerAction(target.index);
                }
        }
    },

    // 显示AI思考过程（游戏化文本）
    async showAIThinking(logs, selectedRule, charName) {
        const indicator = document.querySelector('.auto-battle-indicator');
        if (!indicator) return;

        // 逐行显示思考过程（游戏化包装）
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            const isSelected = log.ruleName === selectedRule;
            
            // 将技术性条件转换为游戏化文本
            const gameText = this.formatGameText(log, isSelected, charName);
            indicator.innerHTML = gameText;
            
            await this.delay(isSelected ? 500 : 300);
        }

        // 显示最终决策
        indicator.innerHTML = `<span style="color:#e8d8a0">${charName}</span> 决定使用 <span style="color:#60c060">${selectedRule}</span>！`;
        await this.delay(600);

        // 清空显示
        indicator.innerHTML = '';
    },

    // 将技术性条件转换为游戏化文本
    formatGameText(log, isSelected, charName) {
        const condition = log.condition;
        const result = log.result;
        
        // 游戏化文本模板（匹配中文条件名）
        const templates = {
            '自身HP低于': {
                met: `<span style="color:#c06060">${charName}</span> 感到体力不支...危险！`,
                notMet: `<span style="color:#8a9aaa">${charName}</span> 状态良好`
            },
            '自身HP高于': {
                met: `<span style="color:#60c060">${charName}</span> 体力充沛！`,
                notMet: `<span style="color:#8a9aaa">${charName}</span> HP不足`
            },
            '自身TP高于': {
                met: `<span style="color:#60a0c0">${charName}</span> 蓄力完成！`,
                notMet: `<span style="color:#8a9aaa">${charName}</span> 能量不足`
            },
            '自身TP低于': {
                met: `<span style="color:#c0a060">${charName}</span> 能量见底...`,
                notMet: `<span style="color:#8a9aaa">${charName}</span> TP充足`
            },
            '队友HP低于': {
                met: `<span style="color:#c0a060">${charName}</span> 发现队友陷入危机！`,
                notMet: `<span style="color:#8a9aaa">${charName}</span> 队友状态稳定`
            },
            '敌人数量≥': {
                met: `<span style="color:#c06060">${charName}</span> 发现敌人众多！`,
                notMet: `<span style="color:#8a9aaa">${charName}</span> 敌人数量可控`
            },
            '回合数≥': {
                met: `<span style="color:#c0a060">${charName}</span> 战斗进入持久战...`,
                notMet: `<span style="color:#8a9aaa">${charName}</span> 战斗刚开始`
            },
            '无条件': {
                met: `<span style="color:#e8d8a0">${charName}</span> 准备行动！`,
                notMet: ''
            }
        };

        // 匹配条件类型
        let matchedTemplate = null;
        for (const [key, template] of Object.entries(templates)) {
            if (condition.startsWith(key)) {
                matchedTemplate = template;
                break;
            }
        }
        
        if (matchedTemplate) {
            const text = result ? matchedTemplate.met : matchedTemplate.notMet;
            return text;
        }

        // 默认回退
        return `<span style="color:#8a9aaa">${charName}</span> ${result ? '✓' : '✗'} ${condition}`;
    },

    // 延迟辅助函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 敌人AI行动
    // ATB系统使用的敌人行动（async，不调用processNextTurn）
    async enemyActionAsync(enemyIndex) {
        const enemy = this.enemies[enemyIndex];
        if (!enemy.alive) {
            return;
        }

        // 检查速度降低效果
        const speedDown = enemy.statusEffects.find(s => s.type === 'speed_down');
        if (speedDown && Math.random() < 0.3) {
            this.addLog(`${enemy.name} 因陷阱效果无法行动！`, 'info');
            await new Promise(resolve => setTimeout(resolve, 300));
            return;
        }

        // 选择技能（随机）
        const skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
        const isAoe = skill.target === 'all';

        if (isAoe) {
            // 全体攻击
            Game.state.party.forEach((char, ci) => {
                if (char.stats.HP > 0) {
                    let dmg = Math.max(1, Math.floor(
                        enemy.atk * skill.power - (char.stats.VIT + (char.bonusStats ? char.bonusStats.VIT : 0)) * 0.5 + Math.random() * 5
                    ));
                    if (char.isDefending) dmg = Math.floor(dmg * 0.4);
                    char.stats.HP -= dmg;
                    this.recordDamageTaken(ci, dmg);
                    this.showDamageNumber('player', ci, dmg, 'damage');
                    this.addLog(`${enemy.name} 使用 ${skill.name} 对 ${char.name} 造成 ${dmg} 点伤害！`, 'damage');

                    if (skill.drain) {
                        enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(dmg * 0.3));
                    }
                }
            });
            this.shakeScreen();

            // 全体攻击：所有被命中玩家角色框抖动
            Game.state.party.forEach((char, ci) => {
                if (char.stats.HP > 0) {
                    this.shakePlayerUnit(ci);
                }
            });
        } else {
            // 单体攻击（随机选择活着的角色）
            const aliveChars = Game.state.party.filter(c => c.stats.HP > 0);
            if (aliveChars.length === 0) {
                return;
            }
            const target = aliveChars[Math.floor(Math.random() * aliveChars.length)];
            const targetIndex = Game.state.party.indexOf(target);

            let dmg;
            if (skill.type === 'magic') {
                dmg = Math.max(1, Math.floor(
                    enemy.atk * skill.power - (target.stats.INT + (target.bonusStats ? target.bonusStats.INT : 0)) * 0.3 + Math.random() * 5
                ));
            } else {
                dmg = Math.max(1, Math.floor(
                    enemy.atk * skill.power - (target.stats.VIT + (target.bonusStats ? target.bonusStats.VIT : 0)) * 0.5 + Math.random() * 5
                ));
            }

            if (target.isDefending) dmg = Math.floor(dmg * 0.4);

            target.stats.HP -= dmg;
            this.recordDamageTaken(targetIndex, dmg);
            this.showDamageNumber('player', targetIndex, dmg, 'damage');
            this.addLog(`${enemy.name} 使用 ${skill.name} 对 ${target.name} 造成 ${dmg} 点伤害！`, 'damage');

            if (skill.drain) {
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(dmg * 0.3));
            }

            this.shakeScreen();

            // 单体攻击：被命中玩家角色框抖动
            this.shakePlayerUnit(targetIndex);
        }

        // 检查角色死亡
        Game.state.party.forEach(char => {
            if (char.stats.HP <= 0) {
                char.stats.HP = 0;
                if (!char.statusEffects.find(s => s.type === 'dead')) {
                    char.statusEffects.push({ type: 'dead' });
                    this.addLog(`${char.name} 倒下了...`, 'damage');
                }
            }
        });

        this.renderEnemies();
        this.renderPartyStatus();

        // ATB系统使用：等待动画完成后返回，不调用processNextTurn
        await new Promise(resolve => setTimeout(resolve, 600));
    },

    // 旧回合制使用的敌人行动（保持兼容）
    enemyAction(enemyIndex) {
        const enemy = this.enemies[enemyIndex];
        if (!enemy.alive) {
            this.processNextTurn();
            return;
        }

        // 检查速度降低效果
        const speedDown = enemy.statusEffects.find(s => s.type === 'speed_down');
        if (speedDown && Math.random() < 0.3) {
            this.addLog(`${enemy.name} 因陷阱效果无法行动！`, 'info');
            setTimeout(() => this.processNextTurn(), 300);
            return;
        }

        // 选择技能（随机）
        const skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
        const isAoe = skill.target === 'all';

        if (isAoe) {
            // 全体攻击
            Game.state.party.forEach((char, ci) => {
                if (char.stats.HP > 0) {
                    let dmg = Math.max(1, Math.floor(
                        enemy.atk * skill.power - (char.stats.VIT + (char.bonusStats ? char.bonusStats.VIT : 0)) * 0.5 + Math.random() * 5
                    ));
                    if (char.isDefending) dmg = Math.floor(dmg * 0.4);
                    char.stats.HP -= dmg;
                    this.recordDamageTaken(ci, dmg);
                    this.showDamageNumber('player', ci, dmg, 'damage');
                    this.addLog(`${enemy.name} 使用 ${skill.name} 对 ${char.name} 造成 ${dmg} 点伤害！`, 'damage');

                    if (skill.drain) {
                        enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(dmg * 0.3));
                    }
                }
            });
            this.shakeScreen();
        } else {
            // 单体攻击（随机选择活着的角色）
            const aliveChars = Game.state.party.filter(c => c.stats.HP > 0);
            if (aliveChars.length === 0) {
                this.processNextTurn();
                return;
            }
            const target = aliveChars[Math.floor(Math.random() * aliveChars.length)];
            const targetIndex = Game.state.party.indexOf(target);

            let dmg;
            if (skill.type === 'magic') {
                dmg = Math.max(1, Math.floor(
                    enemy.atk * skill.power - (target.stats.INT + (target.bonusStats ? target.bonusStats.INT : 0)) * 0.3 + Math.random() * 5
                ));
            } else {
                dmg = Math.max(1, Math.floor(
                    enemy.atk * skill.power - (target.stats.VIT + (target.bonusStats ? target.bonusStats.VIT : 0)) * 0.5 + Math.random() * 5
                ));
            }

            if (target.isDefending) dmg = Math.floor(dmg * 0.4);

            target.stats.HP -= dmg;
            this.recordDamageTaken(targetIndex, dmg);
            this.showDamageNumber('player', targetIndex, dmg, 'damage');
            this.addLog(`${enemy.name} 使用 ${skill.name} 对 ${target.name} 造成 ${dmg} 点伤害！`, 'damage');

            if (skill.drain) {
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(dmg * 0.3));
            }

            this.shakeScreen();
        }

        // 检查角色死亡
        Game.state.party.forEach(char => {
            if (char.stats.HP <= 0) {
                char.stats.HP = 0;
                if (!char.statusEffects.find(s => s.type === 'dead')) {
                    char.statusEffects.push({ type: 'dead' });
                    this.addLog(`${char.name} 倒下了...`, 'damage');
                }
            }
        });

        this.renderEnemies();
        this.renderPartyStatus();

        setTimeout(() => this.processNextTurn(), 600);
    },

    // 处理状态效果
    processStatusEffects() {
        // 中毒伤害
        this.enemies.forEach((enemy, ei) => {
            if (!enemy.alive) return;
            enemy.statusEffects = enemy.statusEffects.filter(effect => {
                effect.turns--;
                if (effect.type === 'poison') {
                    const poisonDmg = effect.damage;
                    enemy.hp -= poisonDmg;
                    this.showDamageNumber('enemy', ei, poisonDmg, 'damage');
                    this.addLog(`${enemy.name} 受到中毒伤害 ${poisonDmg} 点！`, 'damage');
                    if (enemy.hp <= 0) {
                        enemy.hp = 0;
                        enemy.alive = false;
                        this.addLog(`${enemy.name} 被毒倒了！`, 'info');
                    }
                }
                return effect.turns > 0;
            });
        });

        // 玩家中毒
        Game.state.party.forEach((char, ci) => {
            if (char.stats.HP <= 0) return;
            char.statusEffects = char.statusEffects.filter(effect => {
                effect.turns--;
                if (effect.type === 'poison') {
                    char.stats.HP -= 3;
                    this.showDamageNumber('player', ci, 3, 'damage');
                    this.addLog(`${char.name} 受到中毒伤害 3 点！`, 'damage');
                    if (char.stats.HP <= 0) {
                        char.stats.HP = 0;
                    }
                }
                return effect.turns > 0;
            });
        });
    },

    // 对敌人造成伤害
    dealDamageToEnemy(index, damage) {
        const enemy = this.enemies[index];
        enemy.hp -= damage;

        // 飘血显示
        if (damage > 0) {
            this.showDamageNumber('enemy', index, damage, 'damage');
        }

        // 记录当前角色的伤害输出
        if (this.isPlayerTurn && this.currentCharIndex >= 0) {
            const char = Game.state.party[this.currentCharIndex];
            if (char && char.battleData) {
                char.battleData.totalDamageDealt += damage;
            }
        }

        if (enemy.hp <= 0) {
            enemy.hp = 0;
            enemy.alive = false;
            this.addLog(`${enemy.name} 被击败了！`, 'info');
        }
    },

    // 记录角色行动数据
    recordAction(charIndex, actionType, detail) {
        const char = Game.state.party[charIndex];
        if (!char || !char.battleData) return;

        const data = char.battleData;

        switch (actionType) {
            case 'attack':
                data.actions.attack++;
                break;
            case 'defend':
                data.actions.defend++;
                break;
            case 'flee':
                data.actions.flee++;
                break;
            case 'skill':
                data.actions.skills[detail] = (data.actions.skills[detail] || 0) + 1;
                break;
            case 'item':
                data.actions.items[detail] = (data.actions.items[detail] || 0) + 1;
                break;
        }

        // 记录关键时刻（HP<20%时的决策）
        const hpPercent = char.stats.HP / char.maxStats.HP * 100;
        if (hpPercent < 20) {
            data.criticalMoments.push({
                turn: this.turnCount,
                hpPercent: hpPercent,
                action: actionType,
                detail: detail || ''
            });
        }

        // Phase 1: 逐决策完整快照记录（供GBDT训练使用）
        data.totalDecisions = (data.totalDecisions || 0) + 1;
        if (window.BattleDataRecorder && this._lastDecisionState) {
            window.BattleDataRecorder.recordDecision(char, {
                turn: this.turnCount || 1,
                state: this._lastDecisionState,
                triggered_branch: this._lastTriggeredBranch || 'unknown',
                available_skills: this._lastAvailableSkills || [],
                chosen_skill: detail || actionType,
                chosen_order: 1,
                result: { damage_dealt: 0, healing_done: 0, survived: char.stats.HP > 0, next_turn_hp_percent: char.stats.HP / char.maxStats.HP },
                personality_snapshot: window.PersonalityEngine
                    ? window.PersonalityEngine.calculateDecisionScores({
                        actionType: actionType,
                        damageDealt: 0,
                        healingDone: 0,
                        buffCount: 0,
                        controlCount: 0,
                        isBossDamage: false,
                        totalTeamDamage: 1,
                        totalTeamHealing: 1,
                        turnCount: this.turnCount || 1,
                        totalTurns: 1,
                        survived: char.stats.HP > 0,
                        deathThisBattle: false,
                        hasDamageAvoided: false
                    })
                    : { attack_score: 0, defense_score: 0, cooperation_score: 0 }
            });
        }
    },

    // 记录角色受到伤害
    recordDamageTaken(charIndex, damage) {
        const char = Game.state.party[charIndex];
        if (char && char.battleData) {
            char.battleData.totalDamageTaken += damage;
        }
    },

    // 记录治疗量
    recordHealing(charIndex, amount) {
        const char = Game.state.party[charIndex];
        if (char && char.battleData) {
            char.battleData.totalHealingDone += amount;
        }
    },

    // 确保角色有 battleData（兼容旧存档）
    ensureBattleData(char) {
        if (!char.battleData) {
            char.battleData = {
                battleExp: 0,
                expToEvolve: 100,
                battles: 0,
                wins: 0,
                losses: 0,
                totalDamageDealt: 0,
                totalDamageTaken: 0,
                totalHealingDone: 0,
                deathCount: 0,
                actions: { attack: 0, defend: 0, flee: 0, skills: {}, items: {} },
                enemyTypes: {},
                criticalMoments: [],
                // Phase 1 新增字段
                personalityWeights: null,
                solidifiedExperiences: [],
                trainingHistory: [],
                battleDataWindow: [],
                suggestionTracking: {},
                totalDecisions: 0
            };
        } else {
            // 兼容旧存档：补充缺失的新字段
            if (!char.battleData.personalityWeights) char.battleData.personalityWeights = null;
            if (!char.battleData.solidifiedExperiences) char.battleData.solidifiedExperiences = [];
            if (!char.battleData.trainingHistory) char.battleData.trainingHistory = [];
            if (!char.battleData.battleDataWindow) char.battleData.battleDataWindow = [];
            if (!char.battleData.suggestionTracking) char.battleData.suggestionTracking = {};
            if (!char.battleData.enemyTypes) char.battleData.enemyTypes = {};
            if (char.battleData.totalDecisions === undefined) char.battleData.totalDecisions = 0;
        }
        if (!char.aiConfig) {
            char.aiConfig = JSON.parse(JSON.stringify(GameData.aiPresets.balanced));
        }
        // 初始化性格权重（如果尚未设置）
        if (!char.battleData.personalityWeights && window.PersonalityEngine) {
            const presetName = char.aiConfig?.name || 'balanced';
            char.battleData.personalityWeights = window.PersonalityEngine.getInitialWeights(presetName);
        }
    },

    // 更新战斗开始时的数据
    recordBattleStart() {
        Game.state.party.forEach(char => {
            this.ensureBattleData(char);
            char.battleData.battles++;
            // Phase 1: 开始逐场战斗记录
            if (window.BattleDataRecorder) {
                window.BattleDataRecorder.startBattleRecord(char);
            }
        });
        // 记录遭遇的敌人类型
        this.enemies.forEach(enemy => {
            Game.state.party.forEach(char => {
                if (char.battleData) {
                    char.battleData.enemyTypes[enemy.id] = (char.battleData.enemyTypes[enemy.id] || 0) + 1;
                }
            });
        });
    },

    // 记录战斗胜利
    recordBattleWin() {
        Game.state.party.forEach(char => {
            this.ensureBattleData(char);
            if (char.stats.HP > 0) {
                char.battleData.wins++;
                this.calculateBattleExp(char);
            }
            // Phase 1: 结束逐场战斗记录
            if (window.BattleDataRecorder) {
                window.BattleDataRecorder.endBattleRecord(char, 'win');
            }
        });
    },

    // 计算战斗经验值
    calculateBattleExp(char) {
        const d = char.battleData;
        if (!d) return;

        // 经验值来源：
        // - 每场战斗：+5
        // - 胜利加成：+3
        // - 每次行动：+1
        // - 伤害输出：每50点+1
        // - 存活奖励：+5
        // - 死亡惩罚：-10

        let exp = 0;

        // 基础战斗经验
        exp += d.battles * 5;

        // 胜利加成
        exp += d.wins * 3;

        // 行动经验
        const totalActions = d.actions.attack + d.actions.defend + d.actions.flee +
            Object.values(d.actions.skills).reduce((a, b) => a + b, 0) +
            Object.values(d.actions.items).reduce((a, b) => a + b, 0);
        exp += totalActions;

        // 伤害输出经验
        exp += Math.floor(d.totalDamageDealt / 50);

        // 存活奖励
        const survivalRate = d.battles > 0 ? (d.battles - d.deathCount) / d.battles : 1;
        if (survivalRate >= 0.8) {
            exp += 5;
        }

        // 死亡惩罚
        exp -= d.deathCount * 10;

        // 确保不为负，硬卡上限
        d.battleExp = Math.max(0, exp);
        if (d.expToEvolve && d.expToEvolve > 0) {
            d.battleExp = Math.min(d.battleExp, d.expToEvolve);
        }
    },

    // 记录战斗失败
    recordBattleLoss() {
        Game.state.party.forEach(char => {
            if (char.battleData) {
                char.battleData.losses++;
                if (char.stats.HP <= 0) {
                    char.battleData.deathCount++;
                }
            }
        });
        // Phase 1: 结束逐场战斗记录
        if (window.BattleDataRecorder) {
            Game.state.party.forEach(char => {
                this.ensureBattleData(char);
                window.BattleDataRecorder.endBattleRecord(char, 'lose');
            });
        }
    },

    // 检查是否可以进化
    canEvolve(char) {
        if (!char || !char.battleData) return false;
        const d = char.battleData;
        return d.battleExp >= d.expToEvolve;
    },

    // 获取战斗经验进度
    getBattleExpProgress(char) {
        if (!char) return { current: 0, max: 100, percent: 0 };
        this.ensureBattleData(char);
        const d = char.battleData;
        const percent = Math.min(100, Math.round(d.battleExp / d.expToEvolve * 100));
        return { current: d.battleExp, max: d.expToEvolve, percent };
    },

    // 获取队伍中可进化的角色
    getEvolvableCharacters() {
        return Game.state.party.filter(char => {
            return this.canEvolve(char);
        });
    },

    // 尝试逃跑
    tryFlee() {
        const fleeChance = 0.4 + (Game.state.party[0].stats.AGI / 50);
        if (Math.random() < fleeChance) {
            this.addLog('成功逃跑了！', 'info');
            this.isBattleActive = false;
            
            // 处理暗雷怪物（玩家逃跑，怪物返回出生点）
            if (this.currentHiddenMonsterId) {
                HiddenMonsterManager.onBattleEnd(this.currentHiddenMonsterId, false);
                this.currentHiddenMonsterId = null;
            }
            
            // 检查是否在场景内战斗
            const isInSceneBattle = document.getElementById('battle-enemies').classList.contains('visible');
            
            setTimeout(() => {
                if (isInSceneBattle) {
                    // 场景内战斗：只需隐藏战斗UI，不需要切换画面
                    this.hideBattleUI();
                } else {
                    // 传统战斗：切换回迷宫画面
                    Game.showScreen('maze-screen');
                    MazeRenderer.start();
                    MapEditor.render();
                }
            }, 1000);
        } else {
            this.addLog('逃跑失败！', 'damage');
            this.enableCommands(false);
            setTimeout(() => this.processNextTurn(), 500);
        }
    },

    // 检查战斗结束
    checkBattleEnd() {
        // 玩家全灭
        const allDead = Game.state.party.every(c => c.stats.HP <= 0);
        if (allDead) {
            // 统一由 onDefeat() 处理全灭逻辑
            this.onDefeat();
            return true;
        }

        // 敌人全灭
        const allEnemiesDead = this.enemies.every(e => !e.alive);
        if (allEnemiesDead) {
            this.isBattleActive = false;
            
            // 处理暗雷怪物（玩家胜利，怪物死亡）
            if (this.currentHiddenMonsterId) {
                HiddenMonsterManager.onBattleEnd(this.currentHiddenMonsterId, true);
                this.currentHiddenMonsterId = null;
            }
            
            this.onVictory();
            return true;
        }

        return false;
    },

    // 胜利处理
    onVictory() {
        // 先记录是否为场景内战斗，再重置标志
        const isInSceneBattle = this.sceneBattleMode === true;
        console.log(`[Battle] onVictory: sceneBattleMode=${this.sceneBattleMode}, isInSceneBattle=${isInSceneBattle}`);
        
        // 清理ATB系统
        GlobalATBSystem.clearBattleATB();
        
        // 重置战斗标志
        this.isBattleActive = false;
        this.sceneBattleMode = false;
        
        // 解除移动锁定（战斗中遭遇新敌人时会被重新锁定）
        Maze.moveCooldown = false;
        if (Maze._cooldownTimer) {
            clearTimeout(Maze._cooldownTimer);
            Maze._cooldownTimer = null;
        }
        
        // 重置战斗状态
        Game.state.battleState = {
            active: false,
            enemies: [],
            engagedMonsterIds: [],
            turnCount: 0
        };
        
        // 注意：暗雷怪物已在 checkBattleEnd() 中处理，此处无需重复调用
        this.currentHiddenMonsterId = null;
        
        // 记录战斗胜利数据
        this.recordBattleWin();

        let totalExp = 0;
        let totalGold = 0;

        this.enemies.forEach(enemy => {
            totalExp += enemy.exp;
            totalGold += enemy.gold;

            // Boss击败标记
            if (enemy.isBoss) {
                const floor = Game.state.currentFloor;
                Game.state.bossDefeated[floor] = true;
            }
        });

        Game.state.gold += totalGold;

        // 经验分配
        const levelUpMessages = [];
        Game.state.party.forEach(char => {
            if (char.stats.HP > 0) {
                char.exp += totalExp;
                while (char.exp >= char.expToNext) {
                    char.exp -= char.expToNext;
                    this.levelUp(char);
                    levelUpMessages.push(`${char.name} 升级到 Lv.${char.level}！`);
                }
            }
        });

        // 根据是否为场景内战斗执行不同处理
        
        if (isInSceneBattle) {
            // 场景内战斗：显示战斗日志并隐藏UI
            this.showBattleLog(`战斗胜利！获得 ${totalExp} EXP, ${totalGold} G`, levelUpMessages.join(' '));

            // 确保战斗日志栏可见，并添加胜利样式
            const logBar = document.getElementById('battle-log-bar');
            logBar.classList.add('visible', 'victory');

            // 更新HUD
            Maze.updateHUD();

            // 取消之前的隐藏计时器，避免与新战斗冲突
            if (this._hideUITimer) { clearTimeout(this._hideUITimer); this._hideUITimer = null; }
            // 延迟后隐藏战斗UI（增加到2.5秒让玩家看清结算）
            this._hideUITimer = setTimeout(() => {
                this._hideUITimer = null;
                logBar.classList.remove('victory');
                this.hideBattleUI();
                // 更新地图
                MapEditor.render();
            }, 2500);
        } else {
            // 传统战斗：显示胜利画面
            let rewardsHtml = `<p>获得 ${totalExp} 经验值</p>`;
            rewardsHtml += `<p>获得 ${totalGold} 金币</p>`;
            if (levelUpMessages.length > 0) {
                rewardsHtml += '<p style="color:#f0c040;margin-top:10px">' + levelUpMessages.join('<br>') + '</p>';
            }

            document.getElementById('victory-rewards').innerHTML = rewardsHtml;

            setTimeout(() => {
                Game.showScreen('victory-screen');
            }, 1000);
        }
    },

    // 升级
    levelUp(char) {
        char.level++;
        char.expToNext = Math.floor(char.expToNext * 1.5);

        // 获取成长率，优先使用角色自身的，否则从职业数据获取
        const growth = char.growthRates || GameData.classes[char.classId]?.growthRates || {
            HP: 5, TP: 3, STR: 1, INT: 1, VIT: 1, AGI: 1, LUC: 1
        };
        char.maxStats.HP += growth.HP;
        char.maxStats.TP += growth.TP;
        char.stats.STR += growth.STR;
        char.stats.INT += growth.INT;
        char.stats.VIT += growth.VIT;
        char.stats.AGI += growth.AGI;
        char.stats.LUC += growth.LUC;

        // 升级恢复
        char.stats.HP = char.maxStats.HP;
        char.stats.TP = char.maxStats.TP;

        // 检查新技能
        const classData = GameData.classes[char.classId];
        classData.skills.forEach(skill => {
            if (skill.level === char.level && !char.skills.find(s => s.id === skill.id)) {
                char.skills.push({ ...skill });
            }
        });
    },

    // 返回迷宫
    returnToMaze() {
        Game.showScreen('maze-screen');
        MazeRenderer.start();
        MapEditor.render();
        Maze.updateHUD();
    },

    returnToTown() {
        Maze.returnToTown();
    },

    // 渲染敌人
    renderEnemies() {
        // 检查是否在场景内战斗模式
        const isInSceneBattle = document.getElementById('battle-enemies').classList.contains('visible');
        
        if (isInSceneBattle) {
            // 场景内战斗：更新场景内敌人显示
            this.updateEnemiesInScene();
        } else {
            // 传统战斗：渲染敌人显示
            const container = document.getElementById('enemy-display');
            let html = '';

            this.enemies.forEach((enemy, i) => {
                if (!enemy.alive) return;
                const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
                html += `<div class="enemy-unit" id="enemy-${i}">
                    <div class="enemy-name">${enemy.name}${enemy.isBoss ? ' (BOSS)' : ''}</div>
                    <img src="${enemy.image}" alt="${enemy.name}">
                    <div class="enemy-hp-bar">
                        <div class="enemy-hp-fill" style="width:${hpPct}%"></div>
                    </div>
                    <div class="enemy-hp-text">HP: ${enemy.hp}/${enemy.maxHp}</div>
                </div>`;
            });

            container.innerHTML = html;
        }
    },

    // 渲染队伍状态
    renderPartyStatus() {
        // 检查是否在场景内战斗模式
        const isInSceneBattle = document.getElementById('battle-enemies').classList.contains('visible');
        
        if (isInSceneBattle) {
            // 场景内战斗：更新场景内队伍面板
            this.updatePartyPanel();
        } else {
            // 传统战斗：渲染队伍状态
            const container = document.getElementById('party-battle-status');
            let html = '';

            Game.state.party.forEach((char, i) => {
                const isDead = char.stats.HP <= 0;
                const hpPct = Math.max(0, (char.stats.HP / char.maxStats.HP) * 100);
                const tpPct = Math.max(0, (char.stats.TP / char.maxStats.TP) * 100);
                const isActive = i === this.currentCharIndex && this.isPlayerTurn;

            html += `<div class="battle-char ${isDead ? 'dead' : ''} ${isActive ? 'active-turn' : ''}">
                <img src="${char.icon || char.portrait}" alt="${char.name}">
                <span class="bc-name">${char.name}</span>
                <div style="flex:1">
                    <div class="bc-hp">
                        <div class="bc-hp-fill" style="width:${hpPct}%"></div>
                    </div>
                    <div class="bc-tp">
                        <div class="bc-tp-fill" style="width:${tpPct}%"></div>
                    </div>
                </div>
                <span class="bc-hp-text">HP:${char.stats.HP}/${char.maxStats.HP} TP:${char.stats.TP}/${char.maxStats.TP}</span>
            </div>`;
            });

            container.innerHTML = html;
        }
    },

    // 高亮当前行动角色
    highlightActiveChar(index) {
        this.renderPartyStatus();
    },

    // 启用/禁用指令按钮
    enableCommands(enabled) {
        document.querySelectorAll('.battle-cmd').forEach(btn => {
            btn.disabled = !enabled;
        });
    },

    // 显示技能菜单
    showSkillMenu() {
        const char = Game.state.party[this.currentCharIndex];
        const container = document.getElementById('skill-list');
        let html = '';

        char.skills.forEach((skill, i) => {
            const canUse = char.stats.TP >= skill.tpCost;
            html += `<button class="skill-item" ${canUse ? '' : 'disabled'} onclick="Battle.selectSkill(${i})">
                <div>
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-desc">${skill.desc}</span>
                </div>
                <span class="skill-cost">TP:${skill.tpCost}</span>
            </button>`;
        });

        container.innerHTML = html;
        document.getElementById('skill-submenu').style.display = 'block';
    },

    // 选择技能
    selectSkill(index) {
        const char = Game.state.party[this.currentCharIndex];
        const skill = char.skills[index];

        if (char.stats.TP < skill.tpCost) {
            Dialog.show('TP不足！');
            return;
        }

        document.getElementById('skill-submenu').style.display = 'none';

        this.pendingAction = { type: 'skill', charIndex: this.currentCharIndex, skill: skill };

        if (skill.target === 'all' || skill.target === 'all_ally') {
            // 全体技能直接执行
            this.executePlayerAction(0);
        } else if (skill.target === 'self') {
            this.executePlayerAction(0);
        } else if (skill.target === 'single_ally') {
            this.executePlayerAction(0);
        } else {
            this.selectTarget('single_enemy');
        }
    },

    // 关闭技能菜单
    closeSkillMenu() {
        document.getElementById('skill-submenu').style.display = 'none';
    },

    // 显示道具菜单
    showItemMenu() {
        const container = document.getElementById('skill-list');
        let html = '';

        if (Game.state.inventory.length === 0) {
            html = '<p style="color:#8080a0;padding:10px">没有可用的道具。</p>';
        } else {
            Game.state.inventory.forEach((item, i) => {
                const itemData = this.findItemData(item.id);
                html += `<button class="skill-item" onclick="Battle.selectItem(${i})">
                    <div>
                        <span class="skill-name">${item.name} x${item.count}</span>
                        <span class="skill-desc">${itemData ? itemData.desc : ''}</span>
                    </div>
                </button>`;
            });
        }

        container.innerHTML = html;
        document.getElementById('skill-submenu').style.display = 'block';
        document.querySelector('#skill-submenu h3').textContent = '选择道具';
    },

    // 选择道具
    selectItem(index) {
        document.getElementById('skill-submenu').style.display = 'none';
        document.querySelector('#skill-submenu h3').textContent = '选择技能';

        const item = Game.state.inventory[index];
        const itemData = this.findItemData(item.id);

        this.pendingAction = {
            type: 'item',
            charIndex: this.currentCharIndex,
            item: { ...item, effect: itemData ? itemData.effect : {} }
        };

        this.executePlayerAction(0);
    },

    // 查找道具数据
    findItemData(itemId) {
        for (const category of Object.values(GameData.shopItems)) {
            const item = category.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    },

    // 添加战斗日志
    addLog(message, type = '') {
        this.battleLog.push({ message, type });
        if (this.battleLog.length > 50) this.battleLog.shift();

        // 检查是否在场景内战斗模式
        const isInSceneBattle = document.getElementById('battle-enemies').classList.contains('visible');
        
        if (isInSceneBattle) {
            // 场景内战斗：使用队列机制避免日志被快速覆盖
            this.queueBattleLog(message);
        } else {
            // 传统战斗：更新战斗日志容器
            const logContainer = document.getElementById('battle-log');
            const entry = document.createElement('div');
            entry.className = `log-entry ${type ? 'log-' + type : ''}`;
            entry.textContent = message;
            logContainer.appendChild(entry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    },

    // 战斗日志队列（避免快速连续调用导致日志被覆盖）
    logQueue: [],
    isProcessingLog: false,

    queueBattleLog(message) {
        this.logQueue.push(message);
        if (!this.isProcessingLog) {
            this.processLogQueue();
        }
    },

    async processLogQueue() {
        this.isProcessingLog = true;
        
        while (this.logQueue.length > 0) {
            const message = this.logQueue.shift();
            const line2El = document.getElementById('battle-log-line1');
            const line2 = line2El ? line2El.textContent : '';
            this.showBattleLog(message, line2);
            
            // 等待一段时间让用户看到日志
            await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        this.isProcessingLog = false;
    },

    // 敌人闪烁动画
    shakeEnemy(index) {
        // 检查是否在场景内战斗模式
        const isInSceneBattle = document.getElementById('battle-enemies').classList.contains('visible');
        
        if (isInSceneBattle) {
            // 场景内战斗
            this.shakeEnemyInScene(index);
        } else {
            // 传统战斗
            const el = document.getElementById(`enemy-${index}`);
            if (el) {
                el.classList.add('flash-red');
                setTimeout(() => el.classList.remove('flash-red'), 300);
            }
        }
    },

    // 屏幕震动
    shakeScreen() {
        // 检查是否在场景内战斗模式
        const isInSceneBattle = document.getElementById('battle-enemies').classList.contains('visible');
        
        if (isInSceneBattle) {
            // 场景内战斗：震动viewport
            const viewport = document.getElementById('maze-viewport');
            if (viewport) {
                viewport.classList.add('shake');
                setTimeout(() => viewport.classList.remove('shake'), 300);
            }
        } else {
            // 传统战斗
            const scene = document.querySelector('.battle-scene');
            if (scene) {
                scene.classList.add('shake');
                setTimeout(() => scene.classList.remove('shake'), 300);
            }
        }
    }
};

export default Battle;
