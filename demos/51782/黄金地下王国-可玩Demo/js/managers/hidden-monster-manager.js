// ============================================================
// HiddenMonsterManager - managers/hidden-monster-manager.js
// 自动从 game.js 拆分
// ============================================================

const HiddenMonsterManager = {
    monsterCountPerFloor: {
        0: 8,   // B1F
        1: 10,  // B2F
        2: 12   // B3F
    },

    // 默认追击范围
    defaultChaseRange: 5,

    // 生成唯一ID
    generateId() {
        return 'hidden_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // 判断位置是否在房间内
    isInRoom(x, y, rooms) {
        for (const room of rooms) {
            const halfW = Math.floor(room.w / 2);
            const halfH = Math.floor(room.h / 2);
            if (x >= room.cx - halfW && x <= room.cx + halfW &&
                y >= room.cy - halfH && y <= room.cy + halfH) {
                return room;
            }
        }
        return null;
    },

    // 判断是否为走廊位置（四周有墙阻挡）
    isCorridor(x, y, grid, width, height) {
        // 统计上下左右四个方向的开放空间
        let openDirs = 0;
        if (y > 0 && grid[y-1][x] !== 1) openDirs++;
        if (y < height-1 && grid[y+1][x] !== 1) openDirs++;
        if (x > 0 && grid[y][x-1] !== 1) openDirs++;
        if (x < width-1 && grid[y][x+1] !== 1) openDirs++;
        // 走廊通常只有2个方向开放（进来和出去）
        return openDirs === 2;
    },

    // 迷宫进入时生成所有暗雷怪物
    spawnAllMonsters(floor) {
        const floorData = GameData.floors[floor];
        if (!floorData) return;

        // 清空当前暗雷怪物列表
        Game.state.hiddenMonsters = [];
        Game.state.lastRefreshSteps = Game.state.steps;

        // 获取该层可用的怪物ID列表
        const monsterPool = GameData.floorMonsters[floor];
        if (!monsterPool || monsterPool.length === 0) return;

        // 获取该层应生成的怪物数量
        const monsterCount = this.monsterCountPerFloor[floor] || 8;
        const rooms = floorData.rooms || [];

        // 获取所有可通行的位置
        const corridorPositions = [];
        const roomPositions = [];
        
        for (let y = 0; y < floorData.height; y++) {
            for (let x = 0; x < floorData.width; x++) {
                const cell = floorData.grid[y][x];
                if (cell === 1) continue; // 墙壁跳过
                
                // 排除起始位置附近
                const distFromStart = Math.abs(x - 2) + Math.abs(y - 2);
                if (distFromStart <= 3) continue;

                // 判断是走廊还是房间
                const room = this.isInRoom(x, y, rooms);
                if (room) {
                    roomPositions.push({ x, y, room });
                } else {
                    corridorPositions.push({ x, y });
                }
            }
        }

        // 随机选择怪物数量
        const corridorMonsterCount = Math.floor(monsterCount * 0.4); // 40%走廊怪物
        const roomMonsterCount = monsterCount - corridorMonsterCount;

        // 洗牌
        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        };
        shuffle(corridorPositions);
        shuffle(roomPositions);

        // 生成走廊怪物（普通暗雷，固定不动）
        for (let i = 0; i < corridorMonsterCount && i < corridorPositions.length; i++) {
            const pos = corridorPositions[i];
            const monsterId = monsterPool[Math.floor(Math.random() * monsterPool.length)];
            const monsterData = GameData.monsters[monsterId];
            Game.state.hiddenMonsters.push({
                id: this.generateId(),
                monsterId: monsterId,
                spawnX: pos.x,
                spawnY: pos.y,
                currentX: pos.x,
                currentY: pos.y,
                chaseRange: 1, // 走廊怪物最小追击范围，防止一步逃脱
                isFOE: monsterData?.isFoe || false,
                isAlive: true,
                isInBattle: false
            });
        }

        // 生成房间怪物（追击范围覆盖整个房间）
        for (let i = 0; i < roomMonsterCount && i < roomPositions.length; i++) {
            const pos = roomPositions[i];
            const monsterId = monsterPool[Math.floor(Math.random() * monsterPool.length)];
            const monsterData = GameData.monsters[monsterId];
            // 追击范围设为房间对角线长度，确保覆盖整个房间
            const roomChaseRange = Math.ceil(Math.sqrt(pos.room.w * pos.room.w + pos.room.h * pos.room.h));
            Game.state.hiddenMonsters.push({
                id: this.generateId(),
                monsterId: monsterId,
                spawnX: pos.x,
                spawnY: pos.y,
                currentX: pos.x,
                currentY: pos.y,
                chaseRange: roomChaseRange, // 房间怪物追击范围覆盖整个房间
                isFOE: monsterData?.isFoe || false,
                isAlive: true,
                isInBattle: false
            });
        }

        // --- 生成FOE明雷怪物（位于楼梯房间附近走廊） ---
        const foePool = GameData.floorFoes[floor];
        if (foePool && foePool.length > 0) {
            // 找出楼梯所在房间
            let stairRoom = null;
            for (const room of rooms) {
                const halfW = Math.floor(room.w / 2);
                const halfH = Math.floor(room.h / 2);
                const rLeft = room.cx - halfW;
                const rRight = room.cx + halfW - 1;
                const rTop = room.cy - halfH;
                const rBottom = room.cy + halfH - 1;
                let hasStair = false;
                for (let ry = rTop; ry <= rBottom && !hasStair; ry++) {
                    for (let rx = rLeft; rx <= rRight && !hasStair; rx++) {
                        if (floorData.grid[ry] && floorData.grid[ry][rx] === 4) hasStair = true;
                    }
                }
                if (hasStair) { stairRoom = room; break; }
            }

            // 为每个FOE选位置：放在楼梯房间附近的走廊空地上
            const foeCount = foePool.length;
            for (let fi = 0; fi < foeCount; fi++) {
                const foeId = foePool[fi];
                const foeData = GameData.monsters[foeId];
                if (!foeData) continue;

                // 选走廊位置（不在任何房间内的空地）
                let foePos = null;
                if (stairRoom && corridorPositions.length > 0) {
                    // 优先选靠近楼梯房间的走廊位置
                    const halfW = Math.floor(stairRoom.w / 2);
                    const halfH = Math.floor(stairRoom.h / 2);
                    const nearby = corridorPositions.filter(p => {
                        const dx = Math.abs(p.x - stairRoom.cx);
                        const dy = Math.abs(p.y - stairRoom.cy);
                        return dx <= halfW + 3 && dy <= halfH + 3;
                    });
                    if (nearby.length > fi) {
                        foePos = nearby[fi];
                    }
                }
                // 回退：任意走廊位置
                if (!foePos && corridorPositions.length > fi) {
                    foePos = corridorPositions[fi];
                }
                if (!foePos) continue;

                Game.state.hiddenMonsters.push({
                    id: this.generateId(),
                    monsterId: foeId,
                    spawnX: foePos.x,
                    spawnY: foePos.y,
                    currentX: foePos.x,
                    currentY: foePos.y,
                    chaseRange: 3,
                    isFOE: true,
                    isAlive: true,
                    isInBattle: false
                });

                // 从走廊位置列表中移除已用的位置
                const idx = corridorPositions.findIndex(p => p.x === foePos.x && p.y === foePos.y);
                if (idx >= 0) corridorPositions.splice(idx, 1);
            }

            console.log(`[HiddenMonsterManager] 在 ${floor}F 生成了 ${foeCount} 个FOE明雷怪物`);
        }

        console.log(`[HiddenMonsterManager] 在 ${floor}F 生成了 ${Game.state.hiddenMonsters.length} 个暗雷怪物（走廊:${corridorMonsterCount}, 房间:${roomMonsterCount}）`);
    },

    // 步数刷新检查（每100步刷新一次，战斗中不刷新）
    checkRefresh() {
        // 战斗中不刷新怪物，避免交战怪物引用丢失
        if (Game.state.battleState && Game.state.battleState.active) {
            return;
        }
        
        const stepsSinceRefresh = Game.state.steps - Game.state.lastRefreshSteps;
        if (stepsSinceRefresh >= 200) {
            console.log(`[HiddenMonsterManager] 步数达到 ${Game.state.steps}，刷新暗雷怪物`);
            this.spawnAllMonsters(Game.state.currentFloor);
        }
    },

    // 计算两点之间的曼哈顿距离
    getDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    },

    // 获取从当前位置到目标位置的移动方向
    getMoveDirection(fromX, fromY, toX, toY) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        
        // 优先移动距离较大的轴
        if (Math.abs(dx) >= Math.abs(dy)) {
            return { dx: dx > 0 ? 1 : -1, dy: 0 };
        } else {
            return { dx: 0, dy: dy > 0 ? 1 : -1 };
        }
    },

    // 检查位置是否可通行
    canMoveTo(x, y) {
        const floorData = GameData.floors[Game.state.currentFloor];
        if (!floorData) return false;
        if (x < 0 || x >= floorData.width || y < 0 || y >= floorData.height) return false;
        const cell = floorData.grid[y][x];
        return cell !== 1; // 墙壁不可通行
    },

    // 检查位置是否被其他怪物占据
    isPositionOccupied(x, y, excludeMonster) {
        return Game.state.hiddenMonsters.some(m => 
            m.isAlive && 
            !m.isInBattle && 
            m !== excludeMonster &&
            m.currentX === x && 
            m.currentY === y
        );
    },

    // 玩家移动后，所有暗雷怪物行动
    moveAllMonsters() {
        const playerX = Game.state.playerX;
        const playerY = Game.state.playerY;

        Game.state.hiddenMonsters.forEach(monster => {
            // 跳过已死亡的怪物
            if (!monster.isAlive) return;

            const distToPlayer = this.getDistance(
                monster.currentX, monster.currentY,
                playerX, playerY
            );

            if (monster.isInBattle) {
                // 交战中的怪物：追击玩家
                if (distToPlayer <= monster.chaseRange && distToPlayer > 0) {
                    const moveDir = this.getMoveDirection(
                        monster.currentX, monster.currentY,
                        playerX, playerY
                    );
                    
                    const newX = monster.currentX + moveDir.dx;
                    const newY = monster.currentY + moveDir.dy;
                    
                    if (this.canMoveTo(newX, newY) && 
                        !this.isPositionOccupied(newX, newY, monster)) {
                        monster.currentX = newX;
                        monster.currentY = newY;
                        console.log(`[HiddenMonsterManager] 追击: ${monster.monsterId} (${monster.currentX - moveDir.dx},${monster.currentY - moveDir.dy}) -> (${newX},${newY}), 距离玩家:${distToPlayer}`);
                    }
                }
                return; // 交战怪物只追击，不返回出生点
            }

            // 非交战怪物：正常巡逻/追击/返回逻辑
            if (distToPlayer <= monster.chaseRange && distToPlayer > 0) {
                // 在追击范围内，向玩家移动
                const moveDir = this.getMoveDirection(
                    monster.currentX, monster.currentY,
                    playerX, playerY
                );
                
                const newX = monster.currentX + moveDir.dx;
                const newY = monster.currentY + moveDir.dy;
                
                // 检查是否可通行且不被其他怪物占据（FOE可走到玩家位置触发战斗）
                if (this.canMoveTo(newX, newY) && 
                    !this.isPositionOccupied(newX, newY, monster)) {
                    monster.currentX = newX;
                    monster.currentY = newY;
                }
            } else if (distToPlayer > monster.chaseRange) {
                // 超出追击范围，返回出生点
                const distToSpawn = this.getDistance(
                    monster.currentX, monster.currentY,
                    monster.spawnX, monster.spawnY
                );
                
                if (distToSpawn > 0) {
                    const moveDir = this.getMoveDirection(
                        monster.currentX, monster.currentY,
                        monster.spawnX, monster.spawnY
                    );
                    
                    const newX = monster.currentX + moveDir.dx;
                    const newY = monster.currentY + moveDir.dy;
                    
                    // 检查是否可通行且不被其他怪物占据（返回出生点时允许穿过玩家位置）
                    if (this.canMoveTo(newX, newY) && 
                        !this.isPositionOccupied(newX, newY, monster)) {
                        monster.currentX = newX;
                        monster.currentY = newY;
                    }
                }
            }
        });
    },

    // 检查遭遇（玩家位置与暗雷怪物位置重叠）
    checkEncounter() {
        const playerX = Game.state.playerX;
        const playerY = Game.state.playerY;

        for (const monster of Game.state.hiddenMonsters) {
            // 跳过已死亡或正在战斗中的怪物
            if (!monster.isAlive || monster.isInBattle) continue;

            // 检查玩家是否与怪物位置重叠
            if (monster.currentX === playerX && monster.currentY === playerY) {
                console.log(`[HiddenMonsterManager] 遭遇暗雷怪物: ${monster.monsterId}`);
                return monster;
            }
        }

        return null;
    },

    // 触发战斗（返回遭遇的怪物对象，供 Maze.triggerEncounter 使用）
    triggerBattle(monster) {
        if (!monster) return false;

        // 标记怪物进入战斗状态
        monster.isInBattle = true;
        
        // 返回怪物ID，用于生成战斗
        return monster;
    },

    // 战斗结束后处理
    onBattleEnd(monsterId, isVictory) {
        const monster = Game.state.hiddenMonsters.find(m => m.id === monsterId);
        if (!monster) return;

        if (isVictory) {
            // 玩家胜利，怪物死亡
            monster.isAlive = false;
            monster.isInBattle = false;
            console.log(`[HiddenMonsterManager] 怪物 ${monster.monsterId} 已被击败`);
        } else {
            // 玩家逃跑或失败，怪物返回出生点
            monster.isInBattle = false;
            monster.currentX = monster.spawnX;
            monster.currentY = monster.spawnY;
            console.log(`[HiddenMonsterManager] 怪物 ${monster.monsterId} 返回出生点`);
        }
    },

    // 获取当前位置附近的存活暗雷怪物数量（用于雷达显示）
    getNearbyMonsterCount(range = 5) {
        const playerX = Game.state.playerX;
        const playerY = Game.state.playerY;
        
        return Game.state.hiddenMonsters.filter(monster => {
            if (!monster.isAlive || monster.isInBattle) return false;
            const dist = this.getDistance(
                monster.currentX, monster.currentY,
                playerX, playerY
            );
            return dist <= range;
        }).length;
    },

    // 获取最近的暗雷怪物距离（用于雷达危险度显示）
    getNearestMonsterDistance() {
        const playerX = Game.state.playerX;
        const playerY = Game.state.playerY;
        
        let minDist = Infinity;
        Game.state.hiddenMonsters.forEach(monster => {
            if (!monster.isAlive || monster.isInBattle) return;
            const dist = this.getDistance(
                monster.currentX, monster.currentY,
                playerX, playerY
            );
            if (dist < minDist) {
                minDist = dist;
            }
        });
        
        return minDist === Infinity ? -1 : minDist;
    }
};

export default HiddenMonsterManager;
