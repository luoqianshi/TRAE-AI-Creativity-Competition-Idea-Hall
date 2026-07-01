// ============================================================
// GlobalATBSystem - managers/atb-system.js
// 自动从 game.js 拆分
// ============================================================

const GlobalATBSystem = {
    battleUnits: [],  // { unit, atb, speed, isPlayer, index }
    
    // ATB阈值（达到100即可行动）
    ATB_THRESHOLD: 100,
    
    // 基础速度系数（AGI转换为ATB填充速度）
    SPEED_BASE: 5,
    
    // 初始化战斗ATB
    // enemies: 敌人数组（来自Battle.enemies）
    initBattleATB(enemies) {
        this.battleUnits = [];
        
        // 添加玩家队伍成员
        Game.state.party.forEach((char, i) => {
            if (char.stats.HP > 0) {
                const agi = char.stats.AGI + (char.bonusStats?.AGI || 0);
                this.battleUnits.push({
                    unit: char,
                    atb: 0,  // 初始ATB为0
                    speed: this.calculateSpeed(agi),
                    isPlayer: true,
                    index: i,
                    name: char.name
                });
            }
        });
        
        // 添加敌人
        enemies.forEach((enemy, i) => {
            if (enemy.alive) {
                this.battleUnits.push({
                    unit: enemy,
                    atb: 0,  // 初始ATB为0
                    speed: this.calculateSpeed(enemy.agi),
                    isPlayer: false,
                    index: i,
                    name: enemy.name
                });
            }
        });
        
        console.log(`[GlobalATBSystem] 初始化ATB，共 ${this.battleUnits.length} 个单位`);
        this.logUnitsStatus();
    },
    
    // 计算ATB填充速度（基于AGI）
    calculateSpeed(agi) {
        // 速度 = 基础速度 + AGI * 系数
        // 确保每轮至少能填充一定量
        return Math.max(10, this.SPEED_BASE + agi * 0.5);
    },
    
    // 填充所有单位ATB
    fillAllATB() {
        this.battleUnits.forEach(bu => {
            // 检查单位是否存活
            if (this.isUnitAlive(bu)) {
                bu.atb = Math.min(this.ATB_THRESHOLD * 2, bu.atb + bu.speed);
            }
        });
    },
    
    // 检查单位是否存活
    isUnitAlive(bu) {
        if (bu.isPlayer) {
            return bu.unit.stats.HP > 0;
        } else {
            return bu.unit.alive;
        }
    },
    
    // 获取ATB就绪的单位（ATB >= 100）
    getReadyUnits() {
        return this.battleUnits
            .filter(bu => bu.atb >= this.ATB_THRESHOLD && this.isUnitAlive(bu))
            .sort((a, b) => b.atb - a.atb);  // 按ATB降序
    },
    
    // 检查是否有就绪单位
    hasReadyUnits() {
        return this.battleUnits.some(bu => bu.atb >= this.ATB_THRESHOLD && this.isUnitAlive(bu));
    },
    
    // 单位行动后消耗ATB
    consumeATB(unitIndex, isPlayer) {
        const bu = this.battleUnits.find(u => u.index === unitIndex && u.isPlayer === isPlayer);
        if (bu) {
            bu.atb -= this.ATB_THRESHOLD;
            console.log(`[GlobalATBSystem] ${bu.name} 行动后ATB: ${bu.atb.toFixed(1)}`);
        }
    },
    
    // 执行一轮ATB战斗
    // 一轮 = 填充一次ATB + 所有就绪单位行动完毕
    // 返回: { roundComplete: boolean, victory: boolean, defeat: boolean }
    async executeBattleRound() {
        console.log(`[GlobalATBSystem] 开始执行ATB战斗轮`);
        
        let actionsThisRound = 0;
        
        // 1. 填充所有单位ATB（每轮只填充一次）
        this.fillAllATB();
        
        // 2. 获取就绪单位
        let readyUnits = this.getReadyUnits();
        
        // 3. 执行所有就绪单位的行动
        while (readyUnits.length > 0 && actionsThisRound < 50) {
            // 检查是否暂停（道具窗口打开时）
            if (Battle.isPaused) {
                await new Promise(resolve => setTimeout(resolve, 200));
                readyUnits = this.getReadyUnits();
                continue;
            }
            
            for (const bu of readyUnits) {
                if (!this.isUnitAlive(bu)) continue;
                
                // 检查战斗是否结束
                const battleEnd = this.checkBattleEnd();
                if (battleEnd.victory || battleEnd.defeat) {
                    return { roundComplete: true, ...battleEnd };
                }
                
                // 执行单位行动
                await this.executeUnitAction(bu);
                actionsThisRound++;
                
                // 再次检查战斗是否结束
                const endCheck = this.checkBattleEnd();
                if (endCheck.victory || endCheck.defeat) {
                    return { roundComplete: true, ...endCheck };
                }
            }
            
            // 一波就绪单位行动完毕，再次填充检查是否有新单位就绪
            this.fillAllATB();
            readyUnits = this.getReadyUnits();
        }
        
        console.log(`[GlobalATBSystem] 一轮ATB完毕，共执行 ${actionsThisRound} 次行动`);
        
        // 一轮完毕，返回结果
        const result = this.checkBattleEnd();
        return { roundComplete: true, ...result };
    },
    
    // 执行单位行动
    async executeUnitAction(battleUnit) {
        const bu = battleUnit;
        console.log(`[GlobalATBSystem] ${bu.name} 行动 (ATB: ${bu.atb.toFixed(1)})`);

        // 如果战斗已结束（逃跑成功等情况），不执行行动
        if (!Battle.isBattleActive) {
            console.log(`[GlobalATBSystem] 战斗已结束，跳过行动`);
            return;
        }

        // 高亮当前行动者
        Battle.highlightActiveUnit(bu);

        // 短暂延迟让玩家注意到谁在行动
        await new Promise(resolve => setTimeout(resolve, 400));

        if (bu.isPlayer) {
            // 玩家角色：使用AI决策
            const char = bu.unit;
            const action = await Battle.decideAIAction(char);

            // 执行AI决策的行动
            await this.executePlayerAction(bu, action);
        } else {
            // 敌人：使用敌人AI
            await this.executeEnemyAction(bu);
        }

        // 取消高亮
        Battle.clearActiveUnitHighlight(bu);

        // 消耗ATB
        this.consumeATB(bu.index, bu.isPlayer);
    },
    
    // 执行玩家角色行动
    async executePlayerAction(battleUnit, action) {
        const char = battleUnit.unit;
        const actionType = action.action?.type || 'attack';
        
        console.log(`[GlobalATBSystem] ${char.name} 执行行动: ${actionType} (${action.selectedRule || 'AI决策'})`);
        
        // 根据行动类型执行
        switch (actionType) {
            case 'attack':
                await this.executeAttack(battleUnit, action);
                break;
            case 'use_skill':
                await this.executeSkill(battleUnit, action);
                break;
            case 'defend':
                char.isDefending = true;
                Battle.addLog(`${char.name} 采取了防御姿态！`, 'info');
                break;
            default:
                await this.executeAttack(battleUnit, action);
        }
        
        // 更新UI
        Battle.renderPartyStatus();
        Battle.renderEnemies();
    },
    
    // 执行普通攻击
    async executeAttack(battleUnit, action) {
        const char = battleUnit.unit;
        const targetStrategy = action.action?.targetStrategy || 'lowest_hp_enemy';
        
        // 选择目标
        const target = Battle.selectAITarget({ targetStrategy }, char);
        if (!target) {
            console.log(`[GlobalATBSystem] ${char.name} 没有可攻击的目标`);
            return;
        }
        
        // 执行攻击
        await Battle.executeAttackOnTarget(char, target, battleUnit.index);
    },
    
    // 执行技能
    async executeSkill(battleUnit, action) {
        const char = battleUnit.unit;
        const skillIndex = action.action?.skillIndex;
        
        if (skillIndex === undefined || !char.skills[skillIndex]) {
            console.log(`[GlobalATBSystem] ${char.name} 技能索引无效，改为普通攻击`);
            await this.executeAttack(battleUnit, action);
            return;
        }
        
        const skill = char.skills[skillIndex];
        
        // 检查TP
        if (char.stats.TP < skill.tpCost) {
            console.log(`[GlobalATBSystem] ${char.name} TP不足，改为普通攻击`);
            await this.executeAttack(battleUnit, action);
            return;
        }
        
        // 消耗TP
        char.stats.TP -= skill.tpCost;
        
        // 执行技能效果
        await Battle.executeSkillEffect(char, skill, battleUnit.index);
    },
    
    // 执行敌人行动
    async executeEnemyAction(battleUnit) {
        const enemy = battleUnit.unit;
        console.log(`[GlobalATBSystem] 敌人 ${enemy.name} 行动`);
        
        // 使用ATB专用的敌人行动方法（async，不调用processNextTurn）
        await Battle.enemyActionAsync(battleUnit.index);
    },
    
    // 检查战斗结束
    checkBattleEnd() {
        // 检查玩家全灭
        const allPlayersDead = Game.state.party.every(c => c.stats.HP <= 0);
        if (allPlayersDead) {
            return { victory: false, defeat: true };
        }

        // 检查敌人全灭（忽略逃跑的敌人）
        const aliveEnemies = Battle.enemies.filter(e => !e.isEscaped && e.alive);
        if (aliveEnemies.length === 0) {
            return { victory: true, defeat: false };
        }

        return { victory: false, defeat: false };
    },
    
    // 清理战斗ATB
    clearBattleATB() {
        this.battleUnits = [];
        console.log(`[GlobalATBSystem] 清理ATB数据`);
    },
    
    // 日志：输出单位状态
    logUnitsStatus() {
        console.log(`[GlobalATBSystem] 当前单位ATB状态:`);
        this.battleUnits.forEach(bu => {
            console.log(`  ${bu.name}: ATB=${bu.atb.toFixed(1)}, Speed=${bu.speed.toFixed(1)}, ${bu.isPlayer ? '玩家' : '敌人'}`);
        });
    },
    
    // 移除死亡单位
    removeDeadUnits() {
        this.battleUnits = this.battleUnits.filter(bu => this.isUnitAlive(bu));
    }
};

export default GlobalATBSystem;
