// ============================================================
// MapEditor - core/map-editor.js
// 自动从 game.js 拆分
// ============================================================

const MapEditor = {
    currentTool: 'wall',
    isDrawing: false,
    exploredMap: {},   // { "floor_x_y": true }
    wallMap: {},       // { "floor_x_y": true }
    doorMap: {},       // { "floor_x_y": true }
    eventMap: {},      // { "floor_x_y": true }
    stairMap: {},      // { "floor_x_y": true } - 楼梯标记
    eventTypeMap: {},  // { "floor_x_y": "treasure"|"boss" } - 事件类型
    noteMap: {},       // { "floor_x_y": "备注文字" }
    bigMapViewport: null, // 右上大地图当前视口缓存，用于战斗中只更新玩家标记

    init() {
        // DOM渲染，无需canvas初始化
    },

    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
    },

    getGridPos(e) {
        // DOM渲染版本：暂不支持鼠标绘制
        return null;
    },

    onMouseDown(e) {
        // 暂不支持
    },

    onMouseMove(e) {
        // 暂不支持
    },

    onMouseUp() {
        // 暂不支持
    },

    applyTool(e) {
        // 暂不支持鼠标绘制，工具栏仅用于显示
    },

    // 探索周围格子
    exploreAround(x, y, floor) {
        const floorData = GameData.floors[floor];
        if (!floorData) return;

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < floorData.width && ny >= 0 && ny < floorData.height) {
                    const key = `${floor}_${nx}_${ny}`;
                    this.exploredMap[key] = true;

                    // 自动标记墙壁
                    if (floorData.grid[ny][nx] === 1) {
                        this.wallMap[key] = true;
                    }
                    // 自动标记门
                    if (floorData.grid[ny][nx] === 2) {
                        this.doorMap[key] = true;
                    }
                }
            }
        }
    },

    render() {
        const gameState = Game.state;
        if (!gameState) return;

        const floor = gameState.currentFloor;
        const playerX = gameState.playerX;
        const playerY = gameState.playerY;

        // 战斗中保留右上大地图网格，只更新玩家标记；非战斗完整重绘大地图。
        const inBattle = gameState.battleState && gameState.battleState.active;
        if (inBattle) {
            this.updateBigMapPlayerMarker(floor, playerX, playerY);
        } else {
            this.renderBigMap(floor, playerX, playerY);
        }

        // 右下局部小地图始终完整刷新，保证战斗中移动/转向即时反馈。
        this.renderSmallMap(floor, playerX, playerY);

        // 战斗中确保地图面板不被战斗UI隐藏
        if (inBattle) {
            const mapPanel = document.querySelector('.map-panel');
            if (mapPanel && getComputedStyle(mapPanel).display === 'none') {
                mapPanel.style.display = 'flex';
            }
        }
    },

    // 渲染大地图（已探索区域）
    renderBigMap(floor, playerX, playerY) {
        const container = document.getElementById('big-map-grid');
        if (!container) return;

        container.innerHTML = '';
        this.bigMapViewport = null;

        // 计算已探索区域边界
        const keys = Object.keys(this.exploredMap).filter(k => k.startsWith(floor + '_'));
        if (keys.length === 0) return;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        keys.forEach(key => {
            const [_, x, y] = key.split('_').map(Number);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        // 扩展边界包含玩家位置
        minX = Math.min(minX, playerX) - 2;
        maxX = Math.max(maxX, playerX) + 2;
        minY = Math.min(minY, playerY) - 2;
        maxY = Math.max(maxY, playerY) + 2;

        const gridWidth = maxX - minX + 1;
        const gridHeight = maxY - minY + 1;
        const cellSize = Math.min((container.offsetWidth) / gridWidth, (container.offsetHeight) / gridHeight);
        if (cellSize <= 0 || !isFinite(cellSize)) return;

        this.bigMapViewport = {
            floor,
            minX,
            maxX,
            minY,
            maxY,
            cellSize
        };

        // 绘制网格
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const key = `${floor}_${x}_${y}`;
                const cell = document.createElement('div');
                cell.className = 'map-grid-cell';

                if (this.exploredMap[key]) {
                    if (this.wallMap[key]) {
                        cell.classList.add('wall');
                    } else if (this.doorMap[key]) {
                        cell.classList.add('door');
                    } else if (this.eventMap[key]) {
                        cell.classList.add('event');
                    } else {
                        cell.classList.add('explored');
                    }
                }

                cell.style.left = ((x - minX) * cellSize) + 'px';
                cell.style.top = ((y - minY) * cellSize) + 'px';
                cell.style.width = cellSize + 'px';
                cell.style.height = cellSize + 'px';
                container.appendChild(cell);
            }
        }

        this.updateBigMapPlayerMarker(floor, playerX, playerY);
    },

    // 只更新右上大地图玩家位置标记（用于战斗中移动/转向）
    updateBigMapPlayerMarker(floor, playerX, playerY) {
        const container = document.getElementById('big-map-grid');
        if (!container) return;

        const viewport = this.bigMapViewport;
        if (!viewport || viewport.floor !== floor) {
            this.renderBigMap(floor, playerX, playerY);
            return;
        }

        // 如果战斗中移动超出当前大地图视口，进行一次完整重绘，避免玩家标记跑出可视范围。
        if (
            playerX < viewport.minX ||
            playerX > viewport.maxX ||
            playerY < viewport.minY ||
            playerY > viewport.maxY
        ) {
            this.renderBigMap(floor, playerX, playerY);
            return;
        }

        const oldMarker = container.querySelector('.map-player-marker');
        if (oldMarker) {
            oldMarker.remove();
        }

        const playerMarker = document.createElement('div');
        const playerDir = Game.state.playerDir || 0;
        playerMarker.className = `map-player-marker dir-${playerDir}`;
        playerMarker.style.left = ((playerX - viewport.minX) * viewport.cellSize + viewport.cellSize / 2) + 'px';
        playerMarker.style.top = ((playerY - viewport.minY) * viewport.cellSize + viewport.cellSize / 2) + 'px';
        container.appendChild(playerMarker);
    },

    // 渲染小地图（周围5x5区域）
    renderSmallMap(floor, playerX, playerY) {
        const container = document.getElementById('small-map-grid');
        if (!container) {
            console.warn('[MapEditor] small-map-grid 不存在');
            return;
        }

        // 确保整个链路上的容器都没有被隐藏
        let parent = container.parentElement;
        while (parent) {
            const computedStyle = window.getComputedStyle(parent);
            if (computedStyle.display === 'none' || parent.style.display === 'none' || parent.classList.contains('hidden')) {
                parent.style.display = computedStyle.display === 'none' ? '' : parent.style.display;
                console.warn('[MapEditor] 修复被隐藏的父容器:', parent.className, parent.id, '原display:', computedStyle.display);
            }
            parent = parent.parentElement;
        }
        container.innerHTML = '';

        const viewRadius = 2; // 5x5 = 2+1+2
        // 固定80x80px，不依赖父容器弹性尺寸（战斗期间 zoom-in 可能使父容器塌缩为0）
        const cellSize = 16;
        container.style.width = '80px';
        container.style.height = '80px';
        container.style.display = 'block';

        // 确保cellSize有效
        if (cellSize <= 0 || !isFinite(cellSize)) {
            console.warn('[MapEditor] Invalid cellSize:', cellSize);
            return;
        }

        for (let dy = -viewRadius; dy <= viewRadius; dy++) {
            for (let dx = -viewRadius; dx <= viewRadius; dx++) {
                const gx = playerX + dx;
                const gy = playerY + dy;
                const key = `${floor}_${gx}_${gy}`;

                const cell = document.createElement('div');
                cell.className = 'map-grid-cell';

                if (this.exploredMap[key]) {
                    if (this.wallMap[key]) {
                        cell.classList.add('wall');
                    } else if (this.doorMap[key]) {
                        cell.classList.add('door');
                    } else if (this.eventMap[key]) {
                        cell.classList.add('event');
                    } else {
                        cell.classList.add('explored');
                    }
                }

                cell.style.left = ((dx + viewRadius) * cellSize) + 'px';
                cell.style.top = ((dy + viewRadius) * cellSize) + 'px';
                cell.style.width = cellSize + 'px';
                cell.style.height = cellSize + 'px';
                container.appendChild(cell);
            }
        }

        // 玩家位置标记（中央，带方向）
        const playerMarker = document.createElement('div');
        const playerDir = Game.state.playerDir || 0;
        playerMarker.className = `map-player-marker dir-${playerDir}`;
        playerMarker.style.left = (2 * cellSize + cellSize / 2) + 'px';
        playerMarker.style.top = (2 * cellSize + cellSize / 2) + 'px';
        container.appendChild(playerMarker);

        // 绘制FOE箭头（在小地图边缘指示方向）
        this.drawFOEArrows(container, cellSize, playerX, playerY, floor);
        // 强制重排——确保 flex 压缩/zoom-in 期间内容可见
        void container.offsetHeight;
    },

    // 在小地图上绘制FOE（只显示在小地图范围内的FOE）
    drawFOEArrows(container, cellSize, playerX, playerY, floor) {
        const hiddenMonsters = Game.state.hiddenMonsters;
        if (!hiddenMonsters) return;

        // 只显示存活的FOE
        const foes = hiddenMonsters.filter(m => m.isAlive && !m.isInBattle && m.isFOE);
        const viewRadius = 2;

        for (const foe of foes) {
            // 计算FOE相对于玩家的位置
            const dx = foe.currentX - playerX;
            const dy = foe.currentY - playerY;

            // 只显示在小地图范围内的FOE（红点）
            if (Math.abs(dx) <= viewRadius && Math.abs(dy) <= viewRadius) {
                const foeMarker = document.createElement('div');
                foeMarker.className = 'map-foe-marker';
                foeMarker.style.left = ((dx + viewRadius) * cellSize + cellSize * 0.25) + 'px';
                foeMarker.style.top = ((dy + viewRadius) * cellSize + cellSize * 0.25) + 'px';
                foeMarker.style.width = (cellSize * 0.5) + 'px';
                foeMarker.style.height = (cellSize * 0.5) + 'px';
                container.appendChild(foeMarker);
            }
            // 不在范围内的FOE不显示箭头（避免混乱）
        }
    },

    // 清除地图数据（换层时调用）
    clearFloorData(floor) {
        // 不清除，保留所有楼层的地图数据
    }
};

export default MapEditor;
