// ============================================================
// MazeRenderer - core/maze-renderer.js
// 自动从 game.js 拆分
// ============================================================

const MazeRenderer = {
    canvas: null,
    ctx: null,
    animFrame: null,
    // 平滑动画相关
    currentAngle: 0,     // 当前渲染角度（弧度）
    targetAngle: 0,      // 目标角度
    currentX: 0,         // 当前渲染X位置（像素）
    currentY: 0,         // 当前渲染Y位置（像素）
    targetX: 0,
    targetY: 0,
    isAnimating: false,
    bobPhase: 0,         // 行走摆动相位
    isMoving: false,
    wallTexture: null,    // 墙壁纹理缓存
    floorTexture: null,
    treeBgImage: null,    // 树海背景图
    zBuffer: null,         // 1D深度缓冲（每条ray的perpWallDist）
    spriteTextures: {},   // sprite纹理缓存 { barrel: Image, pillar: Image }
    sprites: [],           // 当前楼层的sprite列表

    init() {
        this.canvas = document.getElementById('viewport-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 640;
        this.canvas.height = 480;
        this.zBuffer = new Float64Array(640);
        this.generateWallTexture();
        this.generateFloorTexture();
        this.loadTreeBg();
        this.loadSpriteTextures();
    },

    // 加载sprite纹理（从PNG文件加载，canvas预渲染）
    loadSpriteTextures() {
        const types = [
            { key: 'barrel', file: 'barrel_hd.png' },
            { key: 'pillar', file: 'pillar_hd.png' },
            { key: 'stair', file: 'stairs_hd.png' }
        ];
        for (const { key, file } of types) {
            const img = new Image();
            img.onload = () => {
                const tc = document.createElement('canvas');
                tc.width = img.width;
                tc.height = img.height;
                const tctx = tc.getContext('2d');
                tctx.drawImage(img, 0, 0);
                this.spriteTextures[key] = {
                    width: img.width,
                    height: img.height,
                    canvas: tc
                };
            };
            img.src = `assets/sprites/${file}`;
        }
        // Boss纹理按需加载（在buildSprites中延迟加载）
    },

    // 加载树海背景图
    loadTreeBg() {
        const img = new Image();
        img.onload = () => { this.treeBgImage = img; };
        img.src = 'assets/ui/maze-tree-bg.jpg';
    },

    // 生成砖石纹理
    generateWallTexture() {
        const tc = document.createElement('canvas');
        tc.width = 64;
        tc.height = 64;
        const tctx = tc.getContext('2d');

        // 基础颜色
        tctx.fillStyle = '#5a4a3a';
        tctx.fillRect(0, 0, 64, 64);

        // 砖石纹理
        const brickH = 16;
        const brickW = 32;
        for (let row = 0; row < 4; row++) {
            const offset = (row % 2) * (brickW / 2);
            for (let col = -1; col < 3; col++) {
                const bx = col * brickW + offset;
                const by = row * brickH;
                // 砖块颜色变化
                const r = 70 + Math.random() * 30;
                const g = 55 + Math.random() * 20;
                const b = 40 + Math.random() * 15;
                tctx.fillStyle = `rgb(${r},${g},${b})`;
                tctx.fillRect(bx + 1, by + 1, brickW - 2, brickH - 2);

                // 砖块高光
                tctx.fillStyle = `rgba(255,255,255,0.05)`;
                tctx.fillRect(bx + 1, by + 1, brickW - 2, 2);
                tctx.fillRect(bx + 1, by + 1, 2, brickH - 2);
            }
        }

        // 灰缝
        tctx.strokeStyle = '#3a2a1a';
        tctx.lineWidth = 1;
        for (let row = 0; row <= 4; row++) {
            tctx.beginPath();
            tctx.moveTo(0, row * brickH);
            tctx.lineTo(64, row * brickH);
            tctx.stroke();
        }

        this.wallTexture = tc;
    },

    // 生成地面纹理
    generateFloorTexture() {
        const tc = document.createElement('canvas');
        tc.width = 64;
        tc.height = 64;
        const tctx = tc.getContext('2d');

        tctx.fillStyle = '#2a3a2a';
        tctx.fillRect(0, 0, 64, 64);

        // 石板纹理
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 64;
            const y = Math.random() * 64;
            const s = Math.random() * 3;
            const v = 30 + Math.random() * 20;
            tctx.fillStyle = `rgba(${v},${v + 10},${v},0.3)`;
            tctx.fillRect(x, y, s, s);
        }

        // 石板线
        tctx.strokeStyle = '#1a2a1a';
        tctx.lineWidth = 1;
        tctx.strokeRect(0, 0, 32, 32);
        tctx.strokeRect(32, 0, 32, 32);
        tctx.strokeRect(0, 32, 32, 32);
        tctx.strokeRect(32, 32, 32, 32);

        this.floorTexture = tc;
    },

    // 方向转弧度
    dirToAngle(dir) {
        return (dir * Math.PI) / 2;
    },

    // 设置玩家位置（用于动画）
    setPlayerPosition(x, y, dir) {
        this.targetX = x;
        this.targetY = y;
        this.targetAngle = this.dirToAngle(dir);
    },

    // 立即设置位置（无动画）
    setPlayerPositionImmediate(x, y, dir) {
        this.currentX = x;
        this.currentY = y;
        this.targetX = x;
        this.targetY = y;
        this.currentAngle = this.dirToAngle(dir);
        this.targetAngle = this.currentAngle;
    },

    // 触发行走动画
    triggerMoveAnimation() {
        this.isMoving = true;
        setTimeout(() => { this.isMoving = false; }, 300);
    },

    // 渲染帧
    render() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // 平滑插值
        const lerpSpeed = 0.5;
        this.currentX += (this.targetX - this.currentX) * lerpSpeed;
        this.currentY += (this.targetY - this.currentY) * lerpSpeed;

        // 角度插值（处理环绕）
        let angleDiff = this.targetAngle - this.currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.currentAngle += angleDiff * lerpSpeed;

        // 行走摆动（大幅减弱）
        if (this.isMoving) {
            this.bobPhase += 0.15;
        } else {
            this.bobPhase *= 0.9;
        }
        const bobOffset = Math.sin(this.bobPhase) * 1.5;

        // 获取当前迷宫数据
        const gameState = Game.state;
        if (!gameState || !gameState.currentFloor && gameState.currentFloor !== 0) {
            // 没有迷宫数据时绘制默认画面
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#4a8a50';
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('黄金地下王国', W / 2, H / 2);
            return;
        }

        const floorData = GameData.floors[gameState.currentFloor];
        const grid = floorData.grid;
        // 玩家坐标偏移0.5到格子中心（格子坐标是整数，raycasting需要中心位置）
        const playerX = this.currentX + 0.5;
        const playerY = this.currentY + 0.5;
        const angle = this.currentAngle;
        // sprite渲染用目标位置（格子级精确），避免移动lerp导致缩放异常
        const spritePlayerX = this.targetX + 0.5;
        const spritePlayerY = this.targetY + 0.5;
        const spriteAngle = this.targetAngle;

        // 清空画布
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        // 绘制天花板背景（树海）
        if (this.treeBgImage) {
            // 绘制树海背景图在天花板区域（上半部分），底部淡出与墙壁过渡
            const bgY = -H * 0.15; // 轻微上移让树冠更多显示
            ctx.drawImage(this.treeBgImage, 0, bgY, W, H * 0.8);
            // 底部渐变遮罩，使背景平滑过渡到墙壁
            const fadeGrad = ctx.createLinearGradient(0, H * 0.35, 0, H / 2);
            fadeGrad.addColorStop(0, 'rgba(0,0,0,0)');
            fadeGrad.addColorStop(1, 'rgba(10,15,20,0.85)');
            ctx.fillStyle = fadeGrad;
            ctx.fillRect(0, H * 0.35, W, H * 0.15);
        } else {
            // 加载完成前使用渐变
            const ceilGrad = ctx.createLinearGradient(0, 0, 0, H / 2);
            ceilGrad.addColorStop(0, '#0a0a0a');
            ceilGrad.addColorStop(1, '#1a1a2a');
            ctx.fillStyle = ceilGrad;
            ctx.fillRect(0, 0, W, H / 2);
        }

        // 绘制地面渐变
        const floorGrad = ctx.createLinearGradient(0, H / 2, 0, H);
        floorGrad.addColorStop(0, '#1a2a1a');
        floorGrad.addColorStop(1, '#0a1a0a');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, H / 2, W, H / 2);

        // 绘制地面网格线（透视效果）
        ctx.strokeStyle = 'rgba(40,60,40,0.3)';
        ctx.lineWidth = 1;
        const horizon = H / 2 + bobOffset;
        for (let i = 0; i < 12; i++) {
            const t = i / 12;
            const y = horizon + (H - horizon) * (t * t);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // 脚下特殊地面效果（楼梯/宝箱/Boss）
        const currentCell = grid[Math.round(playerY)]?.[Math.round(playerX)];
        if (currentCell === 4) {
            // 脚下是楼梯 - 地面蓝色发光脉动
            const stairPulse = 0.3 + Math.sin(Date.now() / 400) * 0.15;
            const stairGlow = ctx.createRadialGradient(W / 2, H * 0.85, 0, W / 2, H * 0.85, W * 0.4);
            stairGlow.addColorStop(0, `rgba(60, 140, 255, ${stairPulse})`);
            stairGlow.addColorStop(0.5, `rgba(40, 100, 200, ${stairPulse * 0.5})`);
            stairGlow.addColorStop(1, 'rgba(20, 60, 120, 0)');
            ctx.fillStyle = stairGlow;
            ctx.fillRect(0, H / 2, W, H / 2);
        }
        // 纵向地面线
        for (let i = -6; i <= 6; i++) {
            const xBase = W / 2 + i * 80;
            ctx.beginPath();
            ctx.moveTo(W / 2, horizon);
            ctx.lineTo(xBase, H);
            ctx.stroke();
        }

        // Raycasting渲染墙壁
        const fov = Math.PI / 2; // 90度视场角（更宽的视野，能看到走廊两侧墙壁）
        const numRays = 320;
        const rayStep = fov / numRays;
        const maxDepth = 8;

        // 方向向量
        const dirX = Math.sin(angle);
        const dirY = -Math.cos(angle);

        // 相机平面（垂直于方向）
        const planeX = Math.cos(angle) * Math.tan(fov / 2);
        const planeY = Math.sin(angle) * Math.tan(fov / 2);

        for (let i = 0; i < numRays; i++) {
            const cameraX = 2 * i / numRays - 1; // -1 到 1
            const rayDirX = dirX + planeX * cameraX;
            const rayDirY = dirY + planeY * cameraX;

            // DDA算法
            let mapX = Math.floor(playerX);
            let mapY = Math.floor(playerY);

            const deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
            const deltaDistY = Math.abs(1 / (rayDirY || 0.00001));

            let stepX, stepY;
            let sideDistX, sideDistY;

            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (playerX - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1 - playerX) * deltaDistX;
            }
            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (playerY - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1 - playerY) * deltaDistY;
            }

            let hit = false;
            let side = 0; // 0=x方向墙壁, 1=y方向墙壁
            let depth = 0;

            for (let d = 0; d < maxDepth * 2; d++) {
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }

                // 检查是否碰到墙壁
                if (mapX < 0 || mapX >= floorData.width || mapY < 0 || mapY >= floorData.height) {
                    hit = true;
                    depth = maxDepth;
                    break;
                }

                if (grid[mapY][mapX] === 1) {
                    hit = true;
                    break;
                }
                // 门也算墙（视觉上）
                if (grid[mapY][mapX] === 2) {
                    hit = true;
                    break;
                }
            }

            // 计算墙壁距离
            let perpWallDist;
            if (side === 0) {
                perpWallDist = (mapX - playerX + (1 - stepX) / 2) / (rayDirX || 0.00001);
            } else {
                perpWallDist = (mapY - playerY + (1 - stepY) / 2) / (rayDirY || 0.00001);
            }

            if (perpWallDist < 0.1) perpWallDist = 0.1;
            depth = perpWallDist;

            // 计算墙壁高度
            const lineHeight = Math.floor(H / perpWallDist);
            const drawStart = Math.max(0, Math.floor(-lineHeight / 2 + H / 2 + bobOffset));
            const drawEnd = Math.min(H, Math.floor(lineHeight / 2 + H / 2 + bobOffset));

            // 墙壁颜色（根据距离和侧面）
            const fogFactor = Math.max(0, 1 - depth / maxDepth);
            const sideDim = side === 1 ? 0.7 : 1.0;

            // 判断墙壁类型
            let wallR = 90, wallG = 74, wallB = 58;
            if (mapX >= 0 && mapX < floorData.width && mapY >= 0 && mapY < floorData.height) {
                const cellType = grid[mapY][mapX];
                if (cellType === 2) {
                    // 门 - 棕色
                    wallR = 120; wallG = 80; wallB = 30;
                }
            }

            const r = Math.floor(wallR * fogFactor * sideDim);
            const g = Math.floor(wallG * fogFactor * sideDim);
            const b = Math.floor(wallB * fogFactor * sideDim);

            // 绘制墙壁条纹
            const stripWidth = Math.ceil(W / numRays) + 1;
            const stripX = Math.floor(i * W / numRays);

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(stripX, drawStart, stripWidth, drawEnd - drawStart);

            // 墙壁纹理效果（砖石线）
            if (fogFactor > 0.3) {
                ctx.strokeStyle = `rgba(0,0,0,${0.2 * fogFactor})`;
                ctx.lineWidth = 1;
                // 水平砖缝
                const brickSize = lineHeight / 4;
                for (let by = drawStart; by < drawEnd; by += brickSize) {
                    ctx.beginPath();
                    ctx.moveTo(stripX, by);
                    ctx.lineTo(stripX + stripWidth, by);
                    ctx.stroke();
                }
                // 垂直砖缝
                const vBrickSize = stripWidth;
                const offset = (Math.floor(perpWallDist * 2) % 2) * vBrickSize / 2;
                ctx.beginPath();
                ctx.moveTo(stripX + offset, drawStart);
                ctx.lineTo(stripX + offset, drawEnd);
                ctx.stroke();
            }

            // 墙壁顶部和底部边缘高光
            if (fogFactor > 0.2) {
                ctx.fillStyle = `rgba(200,200,200,${0.05 * fogFactor})`;
                ctx.fillRect(stripX, drawStart, stripWidth, 2);
                ctx.fillStyle = `rgba(0,0,0,${0.1 * fogFactor})`;
                ctx.fillRect(stripX, drawEnd - 2, stripWidth, 2);
            }

            // 记录1D ZBuffer（逐像素记录，而非逐ray）
            for (let px = stripX; px < stripX + stripWidth && px < W; px++) {
                this.zBuffer[px] = perpWallDist;
            }
        }

        // ========== 标准Sprite Casting（Lode算法）==========
        this.castSprites(ctx, W, H, spritePlayerX, spritePlayerY, spriteAngle, bobOffset, dirX, dirY, planeX, planeY);

        // 绘制前方物体（宝箱、Boss点标记 - 保留旧逻辑）
        this.drawFloorObjects(ctx, W, H, playerX, playerY, angle, bobOffset, grid, floorData);

        // 绘制环境光效果
        const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.7);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        // 火把光效
        const torchFlicker = 0.8 + Math.random() * 0.2;
        const torchLight = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.4);
        torchLight.addColorStop(0, `rgba(255,200,100,${0.05 * torchFlicker})`);
        torchLight.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = torchLight;
        ctx.fillRect(0, 0, W, H);

        // 继续动画循环
        this.animFrame = requestAnimationFrame(() => this.render());
    },

    // 视线检测（Bresenham射线）：从(x0,y0)到(x1,y1)是否有墙壁阻挡
    hasLineOfSight(x0, y0, x1, y1, floorData) {
        const grid = floorData.grid;
        const w = floorData.width;
        const h = floorData.height;

        // Bresenham直线算法
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = x0 < x1 ? 1 : -1;
        let sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        let cx = Math.floor(x0);
        let cy = Math.floor(y0);
        const ex = Math.floor(x1);
        const ey = Math.floor(y1);

        while (cx !== ex || cy !== ey) {
            const e2 = 2 * err;
            let nx = cx, ny = cy;
            if (e2 > -dy) { err -= dy; nx = cx + sx; }
            if (e2 < dx) { err += dx; ny = cy + sy; }

            // 检查中间格子是否是墙
            if (nx !== cx && ny !== cy) {
                // 对角移动：两个相邻格子都不是墙才通过
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && grid[ny][nx] === 1 &&
                    cx >= 0 && cx < w && ny >= 0 && ny < h && grid[ny][cx] === 1) {
                    return false;
                }
            }

            cx = nx;
            cy = ny;

            // 检查当前格子是否是墙
            if (cx >= 0 && cx < w && cy >= 0 && cy < h && grid[cy][cx] === 1) {
                return false;
            }
        }
        return true;
    },

    // 绘制FOE（FOE已改为sprite渲染，此函数保留以兼容调用链）
    drawFOEs(ctx, W, H, px, py, angle, horizon, floorData) {
        // FOE已通过 castSprites 渲染，此处不再重复绘制
        return;
    },

    // 绘制地面上的物体
    // 构建当前楼层的sprite列表（木桶+石柱+楼梯）
    buildSprites() {
        this.sprites = [];
        const gameState = Game.state;
        const currentFloor = gameState.currentFloor;
        const floorData = GameData.floors[currentFloor];
        if (!gameState || !floorData) return;

        const grid = floorData.grid;
        const W = floorData.width;
        const H = floorData.height;

        const rooms = floorData.rooms || [];
        const roomEntrances = [];
        const pillarSprites = [];

        // --- 先收集每个房间的通道入口，用于后续过滤木桶 ---
        for (const room of rooms) {
            roomEntrances.push(...this.findRoomEntrances(room, grid, W, H));
        }

        // --- 在楼梯房间的通道入口两侧放石柱（暗示这是楼梯房间）---
        for (const room of rooms) {
            const bounds = this.getRoomBounds(room);
            const rLeft = bounds.left;
            const rRight = bounds.right;
            const rTop = bounds.top;
            const rBottom = bounds.bottom;

            // 检查房间内是否有楼梯格子 cell===4
            let hasStair = false;
            for (let ry = rTop; ry <= rBottom && !hasStair; ry++) {
                for (let rx = rLeft; rx <= rRight && !hasStair; rx++) {
                    if (grid[ry] && grid[ry][rx] === 4) hasStair = true;
                }
            }
            if (!hasStair) continue;

            const entrances = this.findRoomEntrances(room, grid, W, H);
            for (const entrance of entrances) {
                if (entrance.onLeft || entrance.onRight) {
                    const insideX = entrance.onLeft ? rLeft : rRight;
                    const adjY1 = entrance.y - 1, adjY2 = entrance.y + 1;
                    for (const ay of [adjY1, adjY2]) {
                        if (ay >= rTop && ay <= rBottom && grid[ay][insideX] === 0) {
                            const pillar = { x: insideX + 0.5, y: ay + 0.5, type: 'pillar' };
                            pillarSprites.push(pillar);
                            this.sprites.push(pillar);
                        }
                    }
                } else {
                    const insideY = entrance.onTop ? rTop : rBottom;
                    const adjX1 = entrance.x - 1, adjX2 = entrance.x + 1;
                    for (const ax of [adjX1, adjX2]) {
                        if (ax >= rLeft && ax <= rRight && grid[insideY][ax] === 0) {
                            const pillar = { x: ax + 0.5, y: insideY + 0.5, type: 'pillar' };
                            pillarSprites.push(pillar);
                            this.sprites.push(pillar);
                        }
                    }
                }
            }
        }

        // --- 在每个房间角落（贴墙边）放木桶 ---
        for (const room of rooms) {
            const bounds = this.getRoomBounds(room);
            const rLeft = bounds.left;
            const rRight = bounds.right;
            const rTop = bounds.top;
            const rBottom = bounds.bottom;
            const halfW = Math.floor(room.w / 2);
            const halfH = Math.floor(room.h / 2);

            // 四个真角落 + 每面墙的中点
            const edgeCandidates = [
                [rLeft, rTop], [rRight, rTop], [rLeft, rBottom], [rRight, rBottom],  // 四角
                [rLeft + Math.floor(halfW), rTop],                                    // 上墙中
                [rLeft + Math.floor(halfW), rBottom],                                 // 下墙中
                [rLeft, rTop + Math.floor(halfH)],                                    // 左墙中
                [rRight, rTop + Math.floor(halfH)]                                    // 右墙中
            ];
            for (const [cx, cy] of edgeCandidates) {
                if (cx >= 1 && cx < W - 1 && cy >= 1 && cy < H - 1) {
                    const cell = grid[cy][cx];
                    if (cell === 0) {
                        const barrelX = cx + 0.5;
                        const barrelY = cy + 0.5;
                        if (this.isNearSprite(barrelX, barrelY, pillarSprites, 1.1)) continue;
                        if (this.isNearRoomEntrance(barrelX, barrelY, roomEntrances, 1.0)) continue;
                        this.sprites.push({ x: barrelX, y: barrelY, type: 'barrel' });
                    }
                }
            }
        }

        // --- 在Boss房间放置Boss sprite（独立遍历，不依赖楼梯）---
        {
            const bossId = GameData.floorBosses[currentFloor];
            if (bossId && !gameState.bossDefeated[currentFloor]) {
                const bossData = GameData.monsters[bossId];
                if (bossData && bossData.image) {
                    if (!this.spriteTextures['boss_' + currentFloor]) {
                        this._loadTexture('boss_' + currentFloor, bossData.image);
                    }
                    // 找含 cell===5 的房间，Boss sprite放Boss格子正上方
                    for (const room of rooms) {
                        const halfW = Math.floor(room.w / 2);
                        const halfH = Math.floor(room.h / 2);
                        const rLeft = room.cx - halfW;
                        const rRight = room.cx + halfW - 1;
                        const rTop = room.cy - halfH;
                        const rBottom = room.cy + halfH - 1;
                        let bossX = -1, bossY = -1;
                        for (let ry = rTop; ry <= rBottom && bossX < 0; ry++) {
                            for (let rx = rLeft; rx <= rRight && bossX < 0; rx++) {
                                if (grid[ry] && grid[ry][rx] === 5) { bossX = rx; bossY = ry; }
                            }
                        }
                        if (bossX < 0) continue;
                        // Boss sprite放在cell=5正上方（与触发位置精确一致）
                        this.sprites.push({ x: bossX + 0.5, y: bossY + 0.5, type: 'boss_' + currentFloor });
                        break;
                    }
                }
            }
        }
    },

    getRoomBounds(room) {
        const halfW = Math.floor(room.w / 2);
        const halfH = Math.floor(room.h / 2);
        return {
            left: room.cx - halfW,
            right: room.cx + halfW - 1,
            top: room.cy - halfH,
            bottom: room.cy + halfH - 1
        };
    },

    findRoomEntrances(room, grid, width, height) {
        const bounds = this.getRoomBounds(room);
        const entrances = [];

        // 找房间周围的通道入口：房间外周是通道，且贴着房间边界。
        for (let x = bounds.left - 1; x <= bounds.right + 1; x++) {
            for (let y = bounds.top - 1; y <= bounds.bottom + 1; y++) {
                if (x < 0 || x >= width || y < 0 || y >= height) continue;
                const onLeft = x === bounds.left - 1;
                const onRight = x === bounds.right + 1;
                const onTop = y === bounds.top - 1;
                const onBottom = y === bounds.bottom + 1;
                if (!(onLeft || onRight || onTop || onBottom)) continue;
                if (grid[y][x] !== 0) continue;

                entrances.push({
                    x,
                    y,
                    onLeft,
                    onRight,
                    onTop,
                    onBottom
                });
            }
        }

        return entrances;
    },

    isNearSprite(x, y, sprites, minDistance) {
        const minDistSq = minDistance * minDistance;
        return sprites.some(sprite => {
            const dx = sprite.x - x;
            const dy = sprite.y - y;
            return dx * dx + dy * dy <= minDistSq;
        });
    },

    isNearRoomEntrance(x, y, entrances, minDistance) {
        const minDistSq = minDistance * minDistance;
        return entrances.some(entrance => {
            const dx = (entrance.x + 0.5) - x;
            const dy = (entrance.y + 0.5) - y;
            return dx * dx + dy * dy <= minDistSq;
        });
    },

    // 按需加载纹理（Boss/FOE通用）
    _loadTexture(key, imagePath) {
        const img = new Image();
        img.onload = () => {
            const tc = document.createElement('canvas');
            tc.width = img.width;
            tc.height = img.height;
            const tctx = tc.getContext('2d');
            tctx.drawImage(img, 0, 0);
            this.spriteTextures[key] = {
                width: img.width,
                height: img.height,
                canvas: tc
            };
        };
        img.src = imagePath;
    },

    // 生成FOE红色光球纹理（程序化canvas，带脉动发光效果）
    _generateFoeBallTexture() {
        const size = 128;
        const tc = document.createElement('canvas');
        tc.width = size;
        tc.height = size;
        const tctx = tc.getContext('2d');
        const cx = size / 2, cy = size / 2, r = size / 2;

        // 外发光
        const glow = tctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
        glow.addColorStop(0, 'rgba(255, 150, 100, 1)');
        glow.addColorStop(0.4, 'rgba(255, 80, 40, 0.9)');
        glow.addColorStop(0.7, 'rgba(200, 40, 20, 0.5)');
        glow.addColorStop(1, 'rgba(255, 60, 30, 0)');
        tctx.fillStyle = glow;
        tctx.beginPath();
        tctx.arc(cx, cy, r, 0, Math.PI * 2);
        tctx.fill();

        // 高光
        const highlight = tctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r * 0.6);
        highlight.addColorStop(0, 'rgba(255, 220, 180, 0.8)');
        highlight.addColorStop(1, 'rgba(255, 100, 50, 0)');
        tctx.fillStyle = highlight;
        tctx.beginPath();
        tctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
        tctx.fill();

        this.spriteTextures['_foe_ball'] = { width: size, height: size, canvas: tc };
    },

    // ========== 标准Sprite Casting（Lode算法）==========
    castSprites(ctx, W, H, playerX, playerY, angle, bobOffset, dirX, dirY, planeX, planeY) {
        // 每次进入迷宫或切换楼层时构建sprite列表
        if (this.sprites.length === 0 || this._lastFloor !== Game.state.currentFloor) {
            this._lastFloor = Game.state.currentFloor;
            this.buildSprites();
        }

        const allSprites = [];

        // --- 收集楼梯sprite ---
        const currentFloor = Game.state.currentFloor;
        const discoveredStairs = Game.state.stairsDiscovered;
        if (discoveredStairs) {
            const prefix = currentFloor + '_';
            for (const key of Object.keys(discoveredStairs)) {
                if (discoveredStairs[key] && key.startsWith(prefix)) {
                    const parts = key.split('_');
                    const sx = parseInt(parts[1]);
                    const sy = parseInt(parts[2]);
                    allSprites.push({ x: sx + 0.5, y: sy + 0.5, type: 'stair' });
                }
            }
        }

        // --- 收集已放置的sprite ---
        const inBattle = Game.state.battleState && Game.state.battleState.active;
        for (const sp of this.sprites) {
            // 跳过已击败的Boss sprite
            if (sp.type.startsWith('boss_') && Game.state.bossDefeated[currentFloor]) continue;
            // 战斗中隐藏Boss/FOE sprite，退出战斗后再显示
            if (inBattle && (sp.type.startsWith('boss_') || sp.type === '_foe_ball')) continue;
            allSprites.push(sp);
        }

        // --- 收集FOE明雷sprite（红色光球，非怪物图片） ---
        const hiddenMonsters = Game.state.hiddenMonsters;
        if (hiddenMonsters) {
            // 确保红色光球纹理已生成（全局共享，只需一次）
            if (!this.spriteTextures['_foe_ball']) {
                this._generateFoeBallTexture();
            }
            for (const hm of hiddenMonsters) {
                if (!hm.isAlive || hm.isInBattle || !hm.isFOE) continue;
                allSprites.push({ x: hm.currentX + 0.5, y: hm.currentY + 0.5, type: '_foe_ball' });
            }
        }

        if (allSprites.length === 0) return;

        // Step 1: 按距离排序（远→近）
        allSprites.sort((a, b) => {
            const da = (a.x - playerX) ** 2 + (a.y - playerY) ** 2;
            const db = (b.x - playerX) ** 2 + (b.y - playerY) ** 2;
            return db - da;
        });

        // Step 2: 逆相机矩阵
        const invDet = 1.0 / (planeX * dirY - dirX * planeY);

        // Step 3: 对每个sprite投影并绘制
        for (const sp of allSprites) {
            const spriteX = sp.x - playerX;
            const spriteY = sp.y - playerY;

            // 世界坐标距离限制（Boss不限距离靠雾效自然衰减，楼梯/FOE最大8格，木桶/石柱约5格）
            const worldDist = Math.sqrt(spriteX * spriteX + spriteY * spriteY);
            if (sp.type === 'stair' || sp.type === '_foe_ball') {
                if (worldDist > 8) continue;
            } else if (!sp.type.startsWith('boss_')) {
                if (worldDist > 5) continue;
            }

            // 逆矩阵变换到相机空间
            const transformX = invDet * (dirY * spriteX - dirX * spriteY);
            const transformY = invDet * (-planeY * spriteX + planeX * spriteY);

            // 在相机背后，不绘制
            if (transformY <= 0.1) continue;

            // 计算屏幕X位置
            const spriteScreenX = Math.floor((W / 2) * (1 + transformX / transformY));

            // 世界空间尺寸（以格子为单位）：1.0 = 一格高 = 满屏
            // 木桶约0.4格，石柱约0.7格，楼梯约1.2格
            let worldSize = 0.4;
            if (sp.type === 'pillar') worldSize = 0.7;
            if (sp.type === 'stair') worldSize = 1.2;
            if (sp.type.startsWith('boss_')) worldSize = 1.5;
            if (sp.type === '_foe_ball') worldSize = 0.8;

            // 计算屏幕尺寸：transformY=1时满屏，乘以worldSize得到实际像素高度
            const spriteHeight = Math.abs(Math.floor(H * worldSize / transformY));
            const spriteWidth = spriteHeight; // 纹理1:1比例

            const drawH = spriteHeight;
            const drawW = spriteWidth;

            // 垂直位置：底部对齐地面
            // 墙壁底部 = H/2 + H/(2*perpWallDist)，sprite与同距离墙壁底部对齐
            const wallBottom = Math.floor(H / 2 + H / (2 * transformY) + bobOffset);
            const drawEndY = Math.min(H, wallBottom);
            const drawStartY = Math.max(0, drawEndY - drawH);

            const drawStartX = Math.max(0, Math.floor(-drawW / 2 + spriteScreenX));
            const drawEndX = Math.min(W, Math.floor(drawW / 2 + spriteScreenX));

            if (drawEndX <= drawStartX || drawEndY <= drawStartY) continue;

            // 统一用 drawImage 缩放输出（木桶/石柱/楼梯）
            const tex = this.spriteTextures[sp.type];
            if (!tex || !tex.canvas) continue;

            // 雾效（用globalAlpha模拟）
            const fog = Math.max(0, Math.min(1, 1 - transformY / 10));

            // 完整sprite屏幕宽度（用于纹理归一化采样）
            const fullSpriteW = Math.floor(drawW / 2 + spriteScreenX) - Math.floor(-drawW / 2 + spriteScreenX);
            // 可见区域在完整sprite内的起始偏移（列号）
            const clipOffsetX = drawStartX - Math.floor(-drawW / 2 + spriteScreenX);
            const sw = drawEndX - drawStartX;
            const sh = drawEndY - drawStartY;

            if (fullSpriteW <= 0 || sw <= 0) continue;

            // 按可见列分组，减少drawImage调用
            // 纹理采样始终基于完整sprite宽度归一化，仅clip目标位置
            let colStart = -1;
            for (let col = 0; col <= sw; col++) {
                const visible = col < sw && transformY < this.zBuffer[drawStartX + col];
                if (visible) {
                    if (colStart < 0) colStart = col;
                } else {
                    if (colStart >= 0) {
                        ctx.save();
                        ctx.globalAlpha = fog;
                        // 源矩形：在纹理上按完整宽度归一化采样
                        const srcX = (clipOffsetX + colStart) * tex.width / fullSpriteW;
                        const srcW = (col - colStart) * tex.width / fullSpriteW;
                        ctx.drawImage(tex.canvas,
                            srcX, 0, srcW, tex.height,
                            drawStartX + colStart, drawStartY, col - colStart, sh);
                        ctx.restore();
                        colStart = -1;
                    }
                }
            }
        }
    },

    drawFloorObjects(ctx, W, H, px, py, angle, bobOffset, grid, floorData) {
        const horizon = H / 2 + bobOffset;
        const dirX = Math.sin(angle);
        const dirY = -Math.cos(angle);

        // 绘制FOE（房间中的暗雷怪物）- 大红球
        this.drawFOEs(ctx, W, H, px, py, angle, horizon, floorData);

        // === 楼梯已由 castSprites 处理，此处只绘制宝箱和Boss ===
        for (let dist = 1; dist <= 5; dist++) {
            const checkX = Math.round(px + dirX * dist);
            const checkY = Math.round(py + dirY * dist);
            if (checkX < 0 || checkX >= floorData.width || checkY < 0 || checkY >= floorData.height) continue;
            const cell = grid[checkY][checkX];
            if (cell !== 3) continue;

            const dx = checkX + 0.5 - px;
            const dy = checkY + 0.5 - py;
            const invDet = 1.0 / (Math.cos(angle) * Math.tan(Math.PI / 6) * Math.sin(angle) + Math.sin(angle) * Math.cos(angle));
            const transformX = invDet * (Math.cos(angle) * dx - Math.sin(angle) * dy);
            const transformY = invDet * (-Math.sin(angle) * dx * Math.tan(Math.PI / 6) + Math.cos(angle) * dy);
            if (transformY <= 0.2) continue;

            const spriteScreenX = Math.floor(W / 2 * (1 + transformX / transformY));
            const spriteHeight = Math.abs(Math.floor(H / transformY)) * 0.5;
            const spriteWidth = spriteHeight * 0.6;
            const drawStartY = Math.floor(horizon + H / 4 / transformY - spriteHeight / 2);
            const drawStartX = Math.floor(spriteScreenX - spriteWidth / 2);
            const fog = Math.max(0, 1 - dist / 6);
            if (spriteWidth <= 0 || spriteHeight <= 0 || !isFinite(spriteWidth) || !isFinite(spriteHeight)) continue;

            // 宝箱 - 金色
            ctx.fillStyle = `rgba(200,160,40,${fog})`;
            ctx.fillRect(drawStartX, drawStartY, spriteWidth, spriteHeight);
            ctx.fillStyle = `rgba(255,220,80,${fog * 0.5})`;
            ctx.fillRect(drawStartX + spriteWidth * 0.1, drawStartY + spriteHeight * 0.1, spriteWidth * 0.8, spriteHeight * 0.3);
            ctx.fillStyle = `rgba(180,140,20,${fog})`;
            ctx.fillRect(drawStartX + spriteWidth * 0.35, drawStartY + spriteHeight * 0.3, spriteWidth * 0.3, spriteHeight * 0.15);
        }
    },

    start() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.render();
    },

    stop() {
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
            this.animFrame = null;
        }
    }
};

export default MazeRenderer;
