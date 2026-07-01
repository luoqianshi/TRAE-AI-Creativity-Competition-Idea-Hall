// ============================================================
// Maze - core/maze.js
// 自动从 game.js 拆分
// ============================================================

const Maze = {
    moveCooldown: false,

    init() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!Game.state) return;

            // 如果对话框打开，按E键关闭对话框
            const dialogBox = document.getElementById('dialog-box');
            if (dialogBox && dialogBox.style.display === 'flex') {
                if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
                    e.preventDefault();
                    Dialog.close();
                }
                return; // 对话框打开时，其他按键不响应
            }

            const currentScreen = document.querySelector('.screen.active');
            if (!currentScreen || currentScreen.id !== 'maze-screen') return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.moveForward();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.moveBackward();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.turnLeft();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.turnRight();
                    break;
                case 'e':
                case 'E':
                    e.preventDefault();
                    this.interact();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    this.openMenu();
                    break;
                case 'i':
                case 'I':
                    e.preventDefault();
                    ItemQuickUse.openItemPopup();
                    break;
            }
        });
    },

    // 方向偏移量
    getDirOffset(dir) {
        const offsets = [
            { dx: 0, dy: -1 },  // 北
            { dx: 1, dy: 0 },   // 东
            { dx: 0, dy: 1 },   // 南
            { dx: -1, dy: 0 }   // 西
        ];
        return offsets[dir];
    },

    // 检查是否可以通行
    canMove(x, y) {
        const floorData = GameData.floors[Game.state.currentFloor];
        if (!floorData) return false;
        if (x < 0 || x >= floorData.width || y < 0 || y >= floorData.height) return false;
        const cell = floorData.grid[y][x];
        return cell !== 1; // 墙壁不可通行
    },

    moveForward() {
        if (this.moveCooldown) {
            // console.log('[Maze] moveForward: 冷却中，无法移动');
            return;
        }
        const state = Game.state;
        const offset = this.getDirOffset(state.playerDir);
        const newX = state.playerX + offset.dx;
        const newY = state.playerY + offset.dy;

        if (this.canMove(newX, newY)) {
            console.log(`[Maze] 前进: (${state.playerX},${state.playerY}) -> (${newX},${newY}), 方向:${state.playerDir}, 步数:${state.steps + 1}`);
            state.playerX = newX;
            state.playerY = newY;
            state.steps++;
            MazeRenderer.setPlayerPosition(newX, newY, state.playerDir);
            MazeRenderer.triggerMoveAnimation();
            MapEditor.exploreAround(newX, newY, state.currentFloor);
            MapEditor.render();
            this.updateHUD();

            // 检查步数刷新暗雷怪物
            HiddenMonsterManager.checkRefresh();
            // 暗雷怪物行动
            HiddenMonsterManager.moveAllMonsters();

            // Phase 4: 如果在战斗中，检查是否逃脱
            if (Game.state.battleState && Game.state.battleState.active) {
                if (this.checkEscape()) {
                    this.setMoveCooldown();
                    return; // 逃脱成功，不再检查遭遇
                }
            }

            // 检查遭遇（如果触发遭遇，moveCooldown 由战斗系统控制，不执行后面的 setMoveCooldown）
            if (this.checkEncounter()) {
                return;
            }
            // 检查脚下事件（楼梯等，每次踏入新格子都触发）
            this.checkUnderfoot();
            this.checkFloorEvent();
        } else {
            // 撞墙反馈
            this.bumpAnimation();
        }
        this.setMoveCooldown();
    },

    moveBackward() {
        if (this.moveCooldown) return;
        const state = Game.state;
        const offset = this.getDirOffset(state.playerDir);
        const newX = state.playerX - offset.dx;
        const newY = state.playerY - offset.dy;

        if (this.canMove(newX, newY)) {
            state.playerX = newX;
            state.playerY = newY;
            state.steps++;
            MazeRenderer.setPlayerPosition(newX, newY, state.playerDir);
            MazeRenderer.triggerMoveAnimation();
            MapEditor.exploreAround(newX, newY, state.currentFloor);
            MapEditor.render();
            this.updateHUD();

            // 检查步数刷新暗雷怪物
            HiddenMonsterManager.checkRefresh();
            // 暗雷怪物行动
            HiddenMonsterManager.moveAllMonsters();

            // Phase 4: 如果在战斗中，检查是否逃脱
            if (Game.state.battleState && Game.state.battleState.active) {
                if (this.checkEscape()) {
                    this.setMoveCooldown();
                    return; // 逃脱成功，不再检查遭遇
                }
            }
            
            // 检查遭遇
            if (this.checkEncounter()) {
                return;
            }
            
            // 检查脚下事件（楼梯等，每次踏入新格子都触发）
            this.checkUnderfoot();
            // 检查地面事件（远处楼梯/Boss等）
            this.checkFloorEvent();
        }
        this.setMoveCooldown();
    },

    turnLeft() {
        if (this.moveCooldown) return;
        const state = Game.state;
        state.playerDir = (state.playerDir + 3) % 4; // 逆时针
        MazeRenderer.setPlayerPosition(state.playerX, state.playerY, state.playerDir);
        MapEditor.render();
        this.setMoveCooldown();
    },

    turnRight() {
        if (this.moveCooldown) return;
        const state = Game.state;
        state.playerDir = (state.playerDir + 1) % 4; // 顺时针
        MazeRenderer.setPlayerPosition(state.playerX, state.playerY, state.playerDir);
        MapEditor.render();
        this.setMoveCooldown();
    },

    // 左平移（保持朝向，向左移动）
    strafeLeft() {
        if (this.moveCooldown) return;
        const state = Game.state;
        const dir = state.playerDir;
        // 左平移 = 当前朝向的左边一格
        const leftDir = (dir + 3) % 4; // 逆时针90度
        const dx = [0, 1, 0, -1][leftDir];
        const dy = [-1, 0, 1, 0][leftDir];
        this.tryMove(dx, dy);
    },

    // 右平移（保持朝向，向右移动）
    strafeRight() {
        if (this.moveCooldown) return;
        const state = Game.state;
        const dir = state.playerDir;
        // 右平移 = 当前朝向的右边一格
        const rightDir = (dir + 1) % 4; // 顺时针90度
        const dx = [0, 1, 0, -1][rightDir];
        const dy = [-1, 0, 1, 0][rightDir];
        this.tryMove(dx, dy);
    },

    // 尝试移动到指定位置
    tryMove(dx, dy) {
        const state = Game.state;
        const newX = state.playerX + dx;
        const newY = state.playerY + dy;

        if (this.canMove(newX, newY)) {
            state.playerX = newX;
            state.playerY = newY;
            state.steps++;
            MazeRenderer.setPlayerPosition(state.playerX, state.playerY, state.playerDir);
            MapEditor.render();
            this.updateHUD();
            
            // 检查步数刷新暗雷怪物
            HiddenMonsterManager.checkRefresh();
            // 暗雷怪物行动
            HiddenMonsterManager.moveAllMonsters();
            
            // Phase 4: 如果在战斗中，检查是否逃脱
            if (Game.state.battleState && Game.state.battleState.active) {
                if (this.checkEscape()) {
                    this.setMoveCooldown();
                    return; // 逃脱成功，不再检查遭遇
                }
            }
            
            // 检查遭遇
            if (this.checkEncounter()) {
                return;
            }
            // 检查脚下事件（楼梯等，每次踏入新格子都触发）
            this.checkUnderfoot();
            // 检查地面事件（远处楼梯/Boss等）
            this.checkFloorEvent();
            this.setMoveCooldown();
        } else {
            this.bumpAnimation();
            this.setMoveCooldown();
        }
    },

    setMoveCooldown() {
        this.moveCooldown = true;
        if (this._cooldownTimer) {
            clearTimeout(this._cooldownTimer);
        }
        this._cooldownTimer = setTimeout(() => { this.moveCooldown = false; }, 250);
    },

    bumpAnimation() {
        const viewport = document.querySelector('.maze-viewport');
        if (viewport) {
            viewport.classList.add('shake');
            setTimeout(() => viewport.classList.remove('shake'), 100);
        }
    },

    // 前进/后退的微动效果（更柔和）
    moveAnimation() {
        const viewport = document.querySelector('.maze-viewport');
        if (viewport) {
            viewport.classList.add('move-nudge');
            setTimeout(() => viewport.classList.remove('move-nudge'), 80);
        }
    },

    // 遇敌检查（仅检查暗雷怪物），返回是否触发了遭遇
    checkEncounter() {
        // 只检查暗雷怪物遭遇（随机遭遇机制已移除）
        const hiddenMonster = HiddenMonsterManager.checkEncounter();
        if (hiddenMonster) {
            this.triggerHiddenMonsterEncounter(hiddenMonster);
            return true;
        } else {
            this.updateRadar();
            return false;
        }
    },

    // 触发暗雷怪物遭遇
    triggerHiddenMonsterEncounter(hiddenMonster) {
        // 设置行动锁定，防止延迟期间玩家移动脱离战斗
        // 复用 moveCooldown 机制：清除现有 timer，锁定到战斗开始
        this.moveCooldown = true;
        if (this._cooldownTimer) {
            clearTimeout(this._cooldownTimer);
        }

        // 标记怪物进入战斗
        HiddenMonsterManager.triggerBattle(hiddenMonster);
        
        // 显示遭遇警告
        const alert = document.getElementById('encounter-alert');
        alert.style.display = 'block';
        setTimeout(() => { alert.style.display = 'none'; }, 600);

        // 不停止迷宫渲染，保持场景可见
        // MazeRenderer.stop();

        // 生成战斗（使用暗雷怪物的ID）
        setTimeout(() => {
            // moveCooldown 由 Battle.startInSceneBattle 接管锁定
            // 战斗首轮回合结束后才会解除
            
            // FOE只有1只，普通暗雷1-2只同类
            const numEnemies = hiddenMonster.isFOE ? 1 : (1 + Math.floor(Math.random() * 2));
            const enemies = [];
            for (let i = 0; i < numEnemies; i++) {
                enemies.push(hiddenMonster.monsterId);
            }
            
            // 使用场景内战斗（无切换）
            Battle.startInSceneBattle(enemies, hiddenMonster.id);
        }, 800);
    },

    // 检查地面事件（楼梯/Boss - 检测前方2格范围内）
    checkFloorEvent() {
        const state = Game.state;
        const floorData = GameData.floors[state.currentFloor];
        if (!floorData) return;

        const dirOffsets = this.getDirOffset(state.playerDir);

        // 检查前方1-2格
        for (let dist = 1; dist <= 2; dist++) {
            const checkX = state.playerX + dirOffsets.dx * dist;
            const checkY = state.playerY + dirOffsets.dy * dist;

            if (checkX < 0 || checkX >= floorData.width || checkY < 0 || checkY >= floorData.height) continue;

            const cell = floorData.grid[checkY][checkX];
            const eventKey = `${state.currentFloor}_${checkX}_${checkY}`;

            if (cell === 4 && !state.stairsDiscovered[eventKey]) {
                // 远处发现楼梯：仅标记（用于sprite渲染），不弹提示
                if (state.currentFloor < 2) {
                    state.stairsDiscovered[eventKey] = true;
                }
                return;
            }

            if (cell === 5 && !state.bossDefeated[state.currentFloor]) {
                // Boss点 - 使用场景内实时战斗
                Dialog.show(
                    '前方散发着强大的气息...<br>Boss战即将开始！',
                    () => {
                        Battle.startInSceneBattle(['ancient_dragon_boss']);
                    }
                );
                return;
            }
        }

        // 检查脚下（宝箱、门等需要站在上面的交互物）
        const cellUnderfoot = floorData.grid[state.playerY][state.playerX];
        if (cellUnderfoot === 3) {
            // 宝箱在脚下时由 interact() 处理
        }
    },

    // 检查脚下事件（移动后调用，每次踏入新格子都会检查）
    checkUnderfoot() {
        const state = Game.state;
        const floorData = GameData.floors[state.currentFloor];
        if (!floorData) return;

        const cell = floorData.grid[state.playerY][state.playerX];

        // 踏入楼梯格子：弹确认框
        if (cell === 4 && state.currentFloor < 2) {
            Dialog.show(
                `发现了通往 B${state.currentFloor + 2}F 的楼梯。<br>是否现在进入下一层？`,
                () => {
                    // 确认：立即下楼
                    this.goDownStairs();
                }
            );
        }
    },

    // 调查
    interact() {
        const state = Game.state;
        const floorData = GameData.floors[state.currentFloor];
        const cell = floorData.grid[state.playerY][state.playerX];
        const eventKey = `${state.currentFloor}_${state.playerX}_${state.playerY}`;

        if (cell === 3) {
            // 宝箱
            if (state.treasuresOpened[eventKey]) {
                Dialog.show('宝箱已经被打开了。');
                return;
            }

            const treasure = GameData.treasureTable[Math.floor(Math.random() * GameData.treasureTable.length)];
            state.treasuresOpened[eventKey] = true;

            if (treasure.type === 'gold') {
                state.gold += treasure.value;
                Dialog.show(treasure.msg + `<br>当前金币: ${state.gold}G`);
            } else if (treasure.type === 'item') {
                const existing = state.inventory.find(i => i.id === treasure.id);
                if (existing) {
                    existing.count++;
                } else {
                    const itemData = Battle.findItemData(treasure.id);
                    state.inventory.push({ id: treasure.id, name: itemData ? itemData.name : treasure.id, count: 1 });
                }
                Dialog.show(treasure.msg);
            }

            // 宝箱变为已开启（通道）
            floorData.grid[state.playerY][state.playerX] = 0;
        } else if (cell === 2) {
            Dialog.show('这里有一扇门。门没有上锁，可以通行。');
        } else if (cell === 4) {
            // 楼梯 - 站在楼梯上按E键下楼
            if (state.currentFloor < 2) {
                this.goDownStairs();
            }
        } else if (cell === 5) {
            this.checkFloorEvent();
        } else {
            Dialog.show('这里没有什么特别的...');
        }
    },

    // 下楼
    goDownStairs() {
        const state = Game.state;
        if (state.currentFloor >= 2) return;

        state.currentFloor++;
        state.maxFloorReached = Math.max(state.maxFloorReached || 0, state.currentFloor);
        const spawn = GameData.getFloorSpawn(state.currentFloor);
        state.playerX = spawn.x;
        state.playerY = spawn.y;
        state.playerDir = spawn.dir;
        state.steps = 0;

        MazeRenderer.setPlayerPositionImmediate(spawn.x, spawn.y, spawn.dir);
        MapEditor.exploreAround(spawn.x, spawn.y, state.currentFloor);
        MapEditor.render();
        this.updateHUD();
        Game.saveToStorage();
        Dialog.show(`到达了 B${state.currentFloor + 1}F！`);
    },

    // 打开菜单
    openMenu() {
        Menu.openFromMaze();
    },

    // 更新HUD
    updateHUD() {
        const state = Game.state;
        if (!state) return;

        document.getElementById('hud-floor').textContent = `B${state.currentFloor + 1}F`;
        document.getElementById('hud-steps').textContent = `步数: ${state.steps}`;
        this.updateRadar();
    },

    // 更新雷达（基于最近怪物真实距离）
    updateRadar() {
        const radarDot = document.getElementById('radar-dot');
        const radarLabel = document.getElementById('radar-label');
        if (!radarDot) return;

        // 获取最近怪物距离
        const nearestDist = HiddenMonsterManager.getNearestMonsterDistance();

        if (nearestDist < 0) {
            // 没有怪物（全部击败或未生成）
            radarDot.className = 'radar-dot';
            if (radarLabel) {
                radarLabel.className = 'radar-label';
                radarLabel.textContent = '安全';
            }
        } else if (nearestDist <= 2) {
            // 极近距离 - 危险
            radarDot.className = 'radar-dot danger';
            if (radarLabel) {
                radarLabel.className = 'radar-label danger';
                radarLabel.textContent = '危险!';
            }
        } else if (nearestDist <= 5) {
            // 中等距离 - 注意
            radarDot.className = 'radar-dot warning';
            if (radarLabel) {
                radarLabel.className = 'radar-label warning';
                radarLabel.textContent = '注意';
            }
        } else {
            // 远距离 - 安全
            radarDot.className = 'radar-dot';
            if (radarLabel) {
                radarLabel.className = 'radar-label';
                radarLabel.textContent = '安全';
            }
        }
    },

    returnToTown() {
        MazeRenderer.stop();
        // 解除移动锁定（从全灭/菜单等界面返回时）
        this.moveCooldown = false;
        if (this._cooldownTimer) {
            clearTimeout(this._cooldownTimer);
            this._cooldownTimer = null;
        }
        Game.showScreen('town-screen');
        Town.update();
    },

    // ===== Phase 4: 逃跑机制 =====
    // 检查玩家是否脱离所有交战怪物的追击范围
    checkEscape() {
        const battleState = Game.state.battleState;
        if (!battleState || !battleState.active) return false;

        const playerX = Game.state.playerX;
        const playerY = Game.state.playerY;
        const engagedIds = battleState.engagedMonsterIds || [];

        if (engagedIds.length === 0) {
            // 没有交战的暗雷怪物，可能是随机遭遇，直接逃脱
            this.processEscapeSuccess();
            return true;
        }

        // 检查所有交战怪物是否都在追击范围外
        let allOutOfRange = true;
        for (const monsterId of engagedIds) {
            const monster = Game.state.hiddenMonsters.find(m => m.id === monsterId);
            if (monster && monster.isAlive && monster.isInBattle) {
                const distance = HiddenMonsterManager.getDistance(
                    monster.currentX, monster.currentY,
                    playerX, playerY
                );
                // 如果怪物仍在追击范围内，无法逃脱
                if (distance <= monster.chaseRange) {
                    allOutOfRange = false;
                    break;
                }
            }
        }

        if (allOutOfRange) {
            this.processEscapeSuccess();
            return true;
        }

        return false;
    },

    // 处理逃脱成功
    processEscapeSuccess() {
        console.log('[Maze] 逃脱成功！');

        // 先读取交战怪物ID（必须在重置前读取！）
        const engagedIds = Game.state.battleState.engagedMonsterIds || [];

        // 隐藏战斗UI
        Battle.hideBattleUI();

        // 重置战斗状态
        Game.state.battleState = {
            active: false,
            enemies: [],
            engagedMonsterIds: [],
            turnCount: 0
        };

        // 交战中的暗雷怪物返回出生点
        engagedIds.forEach(monsterId => {
            HiddenMonsterManager.onBattleEnd(monsterId, false);
        });

        // 结束战斗
        Battle.isBattleActive = false;
        Battle.sceneBattleMode = false;

        // 使用 battle-log-bar 显示逃脱提示（顶部提示框）
        const logBar = document.getElementById('battle-log-bar');
        if (logBar) {
            logBar.innerHTML = '<span class="escape-text">逃脱战斗成功</span>';
            logBar.classList.add('visible', 'escape');
            setTimeout(() => {
                logBar.classList.remove('escape');
                logBar.classList.remove('visible');
                logBar.innerHTML = '';
            }, 2000);
        }
    }
};

export default Maze;
