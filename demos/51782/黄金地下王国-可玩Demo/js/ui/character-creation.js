// ============================================================
// CharacterCreation - ui/character-creation.js
// 自动从 game.js 拆分
// ============================================================

const CharacterCreation = {
    selectedClass: 'warrior',
    party: [],

    init() {
        this.selectClass('warrior');
        this.updatePartySlots();
    },

    selectClass(classId) {
        this.selectedClass = classId;
        const classData = GameData.classes[classId];

        // 更新按钮状态
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.class === classId);
        });

        // 更新立绘
        document.getElementById('preview-img').src = classData.portrait;

        // 更新信息
        document.getElementById('class-title').textContent = classData.name;
        document.getElementById('class-desc').textContent = classData.desc;

        // 更新属性预览
        const stats = classData.baseStats;
        const statNames = { HP: 'HP', TP: 'TP', STR: '力量', INT: '智力', VIT: '体力', AGI: '速度', LUC: '运气' };
        const statColors = {
            HP: '#e04040', TP: '#4060e0', STR: '#e08040', INT: '#a040e0',
            VIT: '#40a040', AGI: '#e0c040', LUC: '#40c0c0'
        };
        const statMax = { HP: 60, TP: 40, STR: 16, INT: 16, VIT: 12, AGI: 14, LUC: 12 };

        let html = '';
        for (const [key, name] of Object.entries(statNames)) {
            const val = stats[key];
            const max = statMax[key];
            const pct = Math.min(100, (val / max) * 100);
            const color = statColors[key];
            html += `<div class="stat-bar-mini">
                <span class="stat-label">${name}</span>
                <div class="stat-fill"><div class="stat-fill-inner" style="width:${pct}%;background:${color}"></div></div>
                <span style="color:${color};font-size:0.8em">${val}</span>
            </div>`;
        }

        // 显示技能列表
        html += '<div style="margin-top:10px;color:#8090b0;font-size:0.85em">';
        html += '<strong style="color:#a0b8d0">技能:</strong><br>';
        classData.skills.forEach(skill => {
            html += `${skill.name} (TP:${skill.tpCost}) - ${skill.desc}<br>`;
        });
        html += '</div>';

        document.getElementById('stat-preview').innerHTML = html;
    },

    addCharacter() {
        if (this.party.length >= 5) {
            Dialog.show('队伍已满！最多只能有5名成员。');
            return;
        }

        const nameInput = document.getElementById('char-name');
        const name = nameInput.value.trim();
        if (!name) {
            Dialog.show('请输入角色名称！');
            return;
        }

        // 检查重名
        if (this.party.some(c => c.name === name)) {
            Dialog.show('已存在同名角色！');
            return;
        }

        const classData = GameData.classes[this.selectedClass];
        const character = this.createCharacter(name, this.selectedClass, classData, Guild.selectedAppearance);

        this.party.push(character);
        nameInput.value = '';
        this.updatePartySlots();

        Dialog.show(`${name}（${classData.name}）加入了队伍！`);
    },

    createCharacter(name, classId, classData, appearanceIndex = 0) {
        const stats = { ...classData.baseStats };
        const appearance = classData.appearances ? classData.appearances[appearanceIndex] : null;
        return {
            name: name,
            classId: classId,
            className: classData.name,
            appearanceIndex: appearanceIndex,
            portrait: appearance ? appearance.portrait : classData.portrait,
            icon: appearance ? appearance.icon : classData.icon,
            level: 1,
            exp: 0,
            expToNext: 20,
            stats: stats,
            maxStats: { ...stats },
            growthRates: { ...classData.growthRates },
            skills: classData.skills.filter(s => s.level <= 1).map(s => ({ ...s })),
            equipment: { weapon: null, armor: null },
            isDefending: false,
            statusEffects: [],
            bonusStats: { STR: 0, INT: 0, VIT: 0, AGI: 0, LUC: 0 },

            // AI战斗配置（默认平衡型）
            aiConfig: JSON.parse(JSON.stringify(GameData.aiPresets.balanced)),

            // 战斗数据收集
            battleData: {
                battleExp: 0,           // 战斗经验值（用于AI进化）
                expToEvolve: 100,       // 进化所需经验值
                battles: 0,
                wins: 0,
                losses: 0,
                totalDamageDealt: 0,
                totalDamageTaken: 0,
                totalHealingDone: 0,
                deathCount: 0,
                actions: { attack: 0, defend: 0, flee: 0, skills: {}, items: {} },
                enemyTypes: {},
                criticalMoments: []
            }
        };
    },

    removeCharacter(index) {
        if (index >= 0 && index < this.party.length) {
            const char = this.party[index];
            this.party.splice(index, 1);
            this.updatePartySlots();
            Dialog.show(`${char.name} 离开了队伍。`);
        }
    },

    updatePartySlots() {
        const container = document.getElementById('party-slots');
        let html = '';

        for (let i = 0; i < 5; i++) {
            if (i < this.party.length) {
                const char = this.party[i];
                html += `<div class="party-slot">
                    <img src="${char.icon || char.portrait}" alt="${char.className}">
                    <div class="slot-info">
                        <span class="slot-name">Lv.${char.level} ${char.name}</span>
                        <span class="slot-class">${char.className} | HP:${char.maxStats.HP} TP:${char.maxStats.TP}</span>
                    </div>
                    <button class="slot-remove" onclick="CharacterCreation.removeCharacter(${i})">x</button>
                </div>`;
            } else {
                html += `<div class="party-slot" style="opacity:0.3;justify-content:center;color:#506080">
                    <span>-- 空 --</span>
                </div>`;
            }
        }

        container.innerHTML = html;

        // 更新开始按钮
        const startBtn = document.getElementById('start-btn');
        startBtn.disabled = this.party.length === 0;
    },

    startAdventure() {
        if (this.party.length === 0) {
            Dialog.show('至少需要1名队员才能开始冒险！');
            return;
        }

        // 为每个角色添加唯一ID
        this.party.forEach(c => {
            if (!c.id) {
                c.id = 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            }
        });

        // 初始化游戏状态
        GameData.initFloors();
        const spawn = GameData.getFloorSpawn(0);
        Game.state = {
            party: this.party.map(c => JSON.parse(JSON.stringify(c))),
            roster: this.party.map(c => JSON.parse(JSON.stringify(c))), // 初始角色同时存入仓库
            gold: 100,
            inventory: [
                { id: 'heal_potion', name: '回复药', count: 3 },
                { id: 'tp_potion', name: 'TP回复药', count: 1 }
            ],
            currentFloor: 0,
            playerX: spawn.x,
            playerY: spawn.y,
            playerDir: spawn.dir,
            steps: 0,
            exploredTiles: {},
            bossDefeated: [false, false, false],
            treasuresOpened: {},
            stairsDiscovered: {},      // 已发现的楼梯（避免重复提示）
            // 暗雷怪物系统数据
            hiddenMonsters: [],      // 当前楼层的暗雷怪物实例列表
            lastRefreshSteps: 0,     // 上次刷新暗雷怪物时的步数
            // 战斗状态管理（ATB系统）
            battleState: {
                active: false,           // 是否正在战斗中
                enemies: [],             // 当前战斗的敌人列表
                engagedMonsterIds: [],   // 交战中的暗雷怪物ID列表
                turnCount: 0             // 当前战斗轮数
            }
        };

        // 设置初始位置
        MazeRenderer.setPlayerPositionImmediate(spawn.x, spawn.y, spawn.dir);
        MapEditor.exploreAround(spawn.x, spawn.y, 0);
        Game.saveToStorage();

        // 切换到城镇
        Game.showScreen('town-screen');
        Town.update();
    }
};

export default CharacterCreation;
