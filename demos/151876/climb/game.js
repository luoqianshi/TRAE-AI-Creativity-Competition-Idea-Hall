/**
 * ============================================================
 *  山峰攀登游戏 - 游戏逻辑
 *  纯原生 JS 实现，无框架依赖
 * ============================================================
 */

(function () {
    "use strict";

    // ────────── DOM 元素引用 ──────────
    const $ = (sel) => document.querySelector(sel);

    const dom = {
        heightDisplay: $("#heightDisplay"),
        heightProgressFill: $("#heightProgressFill"),
        energyBarFill: $("#energyBarFill"),
        energyText: $("#energyText"),
        energyHint: $("#energyHint"),
        goldDisplay: $("#goldDisplay"),
        trophyCount: $("#trophyCount"),
        levelDisplay: $("#levelDisplay"),
        levelLabel: $("#levelLabel"),
        pickaxeLevel: $("#pickaxeLevel"),
        pickaxeEffect: $("#pickaxeEffect"),
        pickaxeBtn: $("#pickaxeBtn"),
        pickaxeBtnText: $("#pickaxeBtnText"),
        balloonOwnership: $("#balloonOwnership"),
        balloonBtn: $("#balloonBtn"),
        balloonBtnText: $("#balloonBtnText"),
        climbBtn: $("#climbBtn"),
        climbHint: $("#climbHint"),
        climbPopup: $("#climbPopup"),
        victoryOverlay: $("#victoryOverlay"),
        victoryTotalClimbs: $("#victoryTotalClimbs"),
        victoryItemsUsed: $("#victoryItemsUsed"),
        victoryGold: $("#victoryGold"),
    };

    // ────────── 游戏常量 ──────────
    const MAX_HEIGHT = 10000; // 山顶高度（10关 × 1000米）
    const LEVEL_HEIGHT = 1000; // 每关高度
    const MAX_ENERGY = 100; // 最大能量
    const CLIMB_ENERGY_COST = 5; // 每次攀爬消耗能量
    const ENERGY_REGEN_RATE = 1; // 每秒恢复能量
    const ENERGY_REGEN_INTERVAL = 1000; // 恢复间隔（ms）
    const CLIMB_COOLDOWN_MS = 350; // 攀爬冷却时间
    const FALL_DURATION_MS = 1500; // 滑落动画时长
    const MAX_PICKAXE_LEVEL = 20; // 镐子最大等级
    const BALLOON_PRICE = 120; // 气球价格

    // ────────── 游戏状态 ──────────
    const state = {
        height: 0,
        energy: 100,
        maxEnergy: 100,
        lastCheckLevel: 0,
        gold: 0,
        trophyCount: 0,

        // 道具
        pickaxeLevel: 1, // 镐子当前等级（1-20）
        hasBalloon: false,

        // 里程碑追踪
        lastRewardHeight: 0,

        // 统计
        totalClimbs: 0,
        itemsUsed: 0,

        // 状态标志
        isClimbing: false, // 正在攀爬动画中
        isFalling: false, // 正在滑落中
        isGameOver: false, // 游戏已结束（胜利）

        // 能量恢复定时器
        regenTimerId: null,
    };

    // ────────── 工具函数 ──────────
    /** 随机整数 [min, max] 含两端 */
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /** 随机浮点数 [min, max) */
    function randFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /** 计算镐子升级费用 */
    function getPickaxeUpgradeCost(level) {
        return 30 + (level - 1) * 15;
    }

    /** 计算里程碑金币奖励 */
    function getMilestoneReward(height) {
        if (height <= 2000) return 10;
        if (height <= 5000) return 25;
        return 50;
    }

    // ────────── 音效系统（Web Audio API 合成，无需外部文件） ──────────
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function ensureAudioCtx() {
        if (!audioCtx) {
            audioCtx = new AudioCtx();
        }
        return audioCtx;
    }

    function playTone(freq, duration, type, volume, rampDown) {
        try {
            const ctx = ensureAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(volume || 0.15, ctx.currentTime);
            if (rampDown) {
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            }
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // 静默忽略音频错误
        }
    }

    /** 攀爬音效：短促上升音 */
    function playClimbSound() {
        playTone(400, 0.12, "triangle", 0.1, true);
        setTimeout(function () {
            playTone(600, 0.08, "triangle", 0.08, true);
        }, 60);
    }

    /** 购买/升级音效：叮咚 */
    function playBuySound() {
        playTone(800, 0.1, "sine", 0.12, true);
        setTimeout(function () {
            playTone(1200, 0.15, "sine", 0.1, true);
        }, 80);
    }

    /** 滑落音效：下降滑音 */
    function playFallSound() {
        try {
            const ctx = ensureAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 1.0);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 1.2);
        } catch (e) {
            // 静默忽略
        }
    }

    /** 胜利音效：欢快旋律 */
    function playVictorySound() {
        var notes = [523, 659, 784, 1047];
        notes.forEach(function (freq, i) {
            setTimeout(function () {
                playTone(freq, 0.25, "sine", 0.12, true);
            }, i * 120);
        });
    }

    /** 金币奖励音效 */
    function playCoinSound() {
        playTone(1000, 0.06, "sine", 0.08, true);
        setTimeout(function () {
            playTone(1400, 0.08, "sine", 0.06, true);
        }, 50);
    }

    /** 过关升级特效 */
    function spawnLevelUpEffect() {
        // 播放升级音效
        playTone(600, 0.1, 'sine', 0.12, true);
        setTimeout(function() {
            playTone(800, 0.1, 'sine', 0.12, true);
            setTimeout(function() {
                playTone(1000, 0.15, 'sine', 0.12, true);
            }, 80);
        }, 80);
    }

    // ────────── 粒子特效 ──────────
    function spawnParticles(x, y, count, color) {
        for (var i = 0; i < count; i++) {
            var particle = document.createElement("div");
            var size = randInt(3, 8);
            var angle = randFloat(0, Math.PI * 2);
            var speed = randFloat(30, 80);
            var dx = Math.cos(angle) * speed;
            var dy = Math.sin(angle) * speed - 20; // 偏上

            particle.style.cssText =
                "position:fixed;" +
                "left:" + x + "px;" +
                "top:" + y + "px;" +
                "width:" + size + "px;" +
                "height:" + size + "px;" +
                "background:" + (color || "#f0a030") + ";" +
                "border-radius:50%;" +
                "pointer-events:none;" +
                "z-index:50;" +
                "opacity:1;";

            document.body.appendChild(particle);

            var startTime = performance.now();
            var duration = randFloat(400, 700);

            function animateParticle(now) {
                var elapsed = now - startTime;
                var progress = elapsed / duration;
                if (progress >= 1) {
                    if (particle.parentNode) particle.parentNode.removeChild(particle);
                    return;
                }
                var curX = x + dx * progress;
                var curY = y + dy * progress + 50 * progress * progress; // 重力
                particle.style.transform = "translate(" + (curX - x) + "px," + (curY - y) + "px)";
                particle.style.opacity = 1 - progress;
                requestAnimationFrame(animateParticle);
            }

            requestAnimationFrame(animateParticle);
        }
    }

    /** 攀爬粒子：从攀爬按钮周围迸发 */
    function spawnClimbParticles() {
        var btn = dom.climbBtn;
        if (!btn) return;
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        spawnParticles(cx, cy, 8, "#f0a030");
    }

    /** 胜利粒子：金色大量粒子 */
    function spawnVictoryParticles() {
        spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 30, "#ffd700");
        setTimeout(function () {
            spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 20, "#ffd700");
        }, 400);
    }

    // ────────── 持久化（localStorage） ──────────
    function loadTrophyCount() {
        try {
            const saved = localStorage.getItem("climbGame_trophyCount");
            if (saved !== null && saved !== undefined) {
                const n = parseInt(saved, 10);
                if (!isNaN(n) && n >= 0) return n;
            }
        } catch (e) {
            // localStorage 不可用
        }
        return 0;
    }

    function saveTrophyCount(count) {
        try {
            localStorage.setItem("climbGame_trophyCount", String(count));
        } catch (e) {
            // 忽略
        }
    }

    // ────────── UI 更新 ──────────
    function updateUI() {
        updateHeightUI();
        updateEnergyUI();
        updateGoldUI();
        updateTrophyUI();
        updatePickaxeUI();
        updateBalloonUI();
        updateClimbButtonUI();
    }

    function updateHeightUI() {
        dom.heightDisplay.textContent = Math.floor(state.height);

        // 显示当前关卡
        const currentLevel = Math.min(Math.floor(state.height / LEVEL_HEIGHT) + 1, 10);

        // 每过两关，能量上限+100
        if (currentLevel > state.lastCheckLevel) {
            state.maxEnergy = 100 + Math.floor((currentLevel - 1) / 2) * 100;
            state.lastCheckLevel = currentLevel;
            updateEnergyUI();
            spawnLevelUpEffect();
        }

        if (dom.levelDisplay) {
            dom.levelDisplay.textContent = currentLevel;
        }
        if (dom.levelLabel) {
            dom.levelLabel.textContent = '第 ' + currentLevel + ' 关';
        }

        // 进度条
        const progress = Math.min((state.height / MAX_HEIGHT) * 100, 100);
        dom.heightProgressFill.style.width = progress + "%";

        // 滑落时添加抖动 class
        if (state.isFalling) {
            dom.heightDisplay.classList.add("falling");
        } else {
            dom.heightDisplay.classList.remove("falling");
        }

        // 同步 3D 视图高度
        if (window.game3d) window.game3d.updatePlayerHeight(state.height);
    }

    function updateEnergyUI() {
        dom.energyBarFill.style.width = (state.energy / state.maxEnergy * 100) + "%";
        dom.energyText.textContent = state.energy + " / " + state.maxEnergy;

        // 颜色分级
        dom.energyBarFill.classList.remove("energy-mid", "energy-low");
        if (state.energy <= state.maxEnergy * 0.25) {
            dom.energyBarFill.classList.add("energy-low");
        } else if (state.energy <= state.maxEnergy * 0.5) {
            dom.energyBarFill.classList.add("energy-mid");
        }

        // 提示文本
        if (state.isFalling) {
            dom.energyHint.textContent = "正在滑落中...";
        } else if (state.isGameOver) {
            dom.energyHint.textContent = "";
        } else if (state.energy < state.maxEnergy) {
            dom.energyHint.textContent =
                "攀爬消耗 5 点能量 | 静止时每秒恢复 " + ENERGY_REGEN_RATE + " 点";
        } else {
            dom.energyHint.textContent = "攀爬消耗 5 点能量";
        }
    }

    function updateGoldUI() {
        dom.goldDisplay.textContent = state.gold;
    }

    function updateTrophyUI() {
        dom.trophyCount.textContent = state.trophyCount;
    }

    function updatePickaxeUI() {
        dom.pickaxeLevel.textContent =
            "等级 " + state.pickaxeLevel + " / " + MAX_PICKAXE_LEVEL;

        const minExtra = state.pickaxeLevel * 5;
        const maxExtra = state.pickaxeLevel * 10;
        dom.pickaxeEffect.textContent =
            "效果：+" + minExtra + "~" + maxExtra + " 米/次";

        if (state.pickaxeLevel >= MAX_PICKAXE_LEVEL) {
            dom.pickaxeBtnText.textContent = "已满级";
            dom.pickaxeBtn.disabled = true;
        } else {
            const cost = getPickaxeUpgradeCost(state.pickaxeLevel);
            dom.pickaxeBtnText.textContent =
                "升级 · " + cost + " 金币";
            dom.pickaxeBtn.disabled =
                state.gold < cost || state.isFalling || state.isGameOver;
        }
    }

    function updateBalloonUI() {
        if (state.hasBalloon) {
            dom.balloonOwnership.textContent = "已拥有";
            dom.balloonBtnText.textContent = "已拥有";
            dom.balloonBtn.disabled = true;
        } else {
            dom.balloonOwnership.textContent = "未拥有";
            dom.balloonBtnText.textContent =
                "购买 · " + BALLOON_PRICE + " 金币";
            dom.balloonBtn.disabled =
                state.gold < BALLOON_PRICE ||
                state.isFalling ||
                state.isGameOver;
        }
    }

    function updateClimbButtonUI() {
        if (state.isFalling) {
            dom.climbBtn.disabled = true;
            dom.climbHint.textContent = "滑落中，无法攀爬";
            return;
        }
        if (state.isGameOver) {
            dom.climbBtn.disabled = true;
            dom.climbHint.textContent = "已登顶！";
            return;
        }
        if (state.isClimbing) {
            dom.climbBtn.disabled = true;
            dom.climbHint.textContent = "冷却中...";
            return;
        }
        if (state.energy < CLIMB_ENERGY_COST) {
            dom.climbBtn.disabled = true;
            dom.climbHint.textContent = "能量不足，等待恢复...";
            return;
        }
        dom.climbBtn.disabled = false;
        dom.climbHint.textContent = "按空格键攀爬";
    }

    // ────────── 视觉特效 ──────────
    /** 显示攀爬高度飘出效果 */
    function showClimbPopup(gainedHeight) {
        dom.climbPopup.textContent = "+" + gainedHeight;
        // 移除旧动画
        dom.climbPopup.classList.remove("show");
        // 强制回流
        void dom.climbPopup.offsetWidth;
        dom.climbPopup.classList.add("show");
    }

    /** 显示金币飘出效果 */
    function showGoldPopup(amount, x, y) {
        const el = document.createElement("div");
        el.className = "gold-popup";
        el.textContent = "+" + amount + " 🪙";
        // 使用固定定位，相对于视口
        el.style.left = x + "px";
        el.style.top = y + "px";
        document.body.appendChild(el);

        // 动画结束后移除
        el.addEventListener("animationend", function () {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }

    /** 获取金币图标的屏幕坐标 */
    function getGoldIconPosition() {
        const goldIcon = document.querySelector(".gold-icon");
        if (goldIcon) {
            const rect = goldIcon.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top,
            };
        }
        // fallback
        return { x: window.innerWidth / 2, y: 200 };
    }

    // ────────── 能量系统 ──────────
    function startEnergyRegen() {
        stopEnergyRegen();
        // 只在非滑落、非胜利状态下恢复
        if (state.isFalling || state.isGameOver) return;
        if (state.energy >= state.maxEnergy) return;

        state.regenTimerId = setInterval(function () {
            // 检查状态是否允许恢复
            if (state.isFalling || state.isGameOver) {
                stopEnergyRegen();
                return;
            }
            if (state.energy >= state.maxEnergy) {
                stopEnergyRegen();
                return;
            }
            state.energy = Math.min(state.energy + ENERGY_REGEN_RATE, state.maxEnergy);
            updateEnergyUI();
            updateClimbButtonUI();
            updatePickaxeUI();
            updateBalloonUI();
        }, ENERGY_REGEN_INTERVAL);
    }

    function stopEnergyRegen() {
        if (state.regenTimerId !== null) {
            clearInterval(state.regenTimerId);
            state.regenTimerId = null;
        }
    }

    // ────────── 攀爬逻辑 ──────────
    function calculateClimbHeight() {
        // 基础高度
        const base = randInt(10, 30);

        // 镐子效果：等级 * (5~10)
        const pickaxeExtra = state.pickaxeLevel * randInt(5, 10);

        // 气球效果
        const balloonExtra = state.hasBalloon ? randInt(25, 40) : 0;

        return base + pickaxeExtra + balloonExtra;
    }

    function climb() {
        // 防止重复点击
        if (state.isClimbing || state.isFalling || state.isGameOver) return;
        if (state.energy < CLIMB_ENERGY_COST) return;

        // 开始攀爬
        state.isClimbing = true;
        stopEnergyRegen(); // 攀爬时停止恢复
        updateClimbButtonUI();

        // 首次攀爬时退出全景模式
        if (window.game3d) window.game3d.exitPanorama();

        // 消耗能量
        state.energy -= CLIMB_ENERGY_COST;

        // 计算攀爬高度
        const gainedHeight = calculateClimbHeight();
        state.height += gainedHeight;

        // 超出部分截断
        if (state.height > MAX_HEIGHT) {
            state.height = MAX_HEIGHT;
        }

        // 统计
        state.totalClimbs++;
        if (state.pickaxeLevel > 1 || state.hasBalloon) {
            state.itemsUsed++;
        }

        // 显示飘出效果
        showClimbPopup(gainedHeight);

        // 音效与粒子
        playClimbSound();
        spawnClimbParticles();

        // 3D 攀爬动画
        if (window.game3d) window.game3d.playClimbAnimation();

        // 检查里程碑奖励
        checkMilestoneReward();

        // 更新 UI
        updateUI();

        // 冷却期结束后的处理
        setTimeout(function () {
            state.isClimbing = false;

            // 检查能量是否耗尽
            if (state.energy <= 0) {
                triggerFall();
                return;
            }

            // 检查是否登顶
            if (state.height >= MAX_HEIGHT) {
                triggerVictory();
                return;
            }

            // 恢复能量恢复
            updateClimbButtonUI();
            startEnergyRegen();
        }, CLIMB_COOLDOWN_MS);
    }

    // ────────── 里程碑奖励 ──────────
    function checkMilestoneReward() {
        const currentMilestone = Math.floor(state.height / 100);
        const lastMilestone = Math.floor(state.lastRewardHeight / 100);

        if (currentMilestone > lastMilestone) {
            // 有新的里程碑
            for (let m = lastMilestone + 1; m <= currentMilestone; m++) {
                const milestoneHeight = m * 100;
                const reward = getMilestoneReward(milestoneHeight);
                state.gold += reward;

                // 金币飘出效果
                const pos = getGoldIconPosition();
                showGoldPopup(reward, pos.x, pos.y);
                playCoinSound();
            }
            state.lastRewardHeight = Math.floor(state.height / 100) * 100;
        }
    }

    // ────────── 滑落逻辑 ──────────
    function triggerFall() {
        state.isFalling = true;
        stopEnergyRegen();
        playFallSound();

        // 3D 滑落动画
        if (window.game3d) window.game3d.playFallAnimation(state.height, FALL_DURATION_MS);

        updateUI();

        const startHeight = state.height;
        const startTime = performance.now();

        function animateFall(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / FALL_DURATION_MS, 1);

            // 缓出曲线，让滑落到后面变慢
            const eased = 1 - Math.pow(1 - progress, 3);
            state.height = Math.max(startHeight * (1 - eased), 0);

            updateHeightUI();

            // 同步 3D 视图高度（每帧）
            if (window.game3d) window.game3d.updatePlayerHeight(state.height);

            if (progress < 1) {
                requestAnimationFrame(animateFall);
            } else {
                // 滑落完成
                state.height = 0;
                state.energy = state.maxEnergy;
                state.lastRewardHeight = 0;
                state.isFalling = false;

                updateUI();
                startEnergyRegen();
            }
        }

        requestAnimationFrame(animateFall);
    }

    // ────────── 胜利逻辑 ──────────
    function triggerVictory() {
        state.isGameOver = true;
        state.height = MAX_HEIGHT;
        stopEnergyRegen();
        updateUI();

        // 奖杯计数 +1
        state.trophyCount++;
        saveTrophyCount(state.trophyCount);

        // 填充胜利弹窗数据
        dom.victoryTotalClimbs.textContent = state.totalClimbs;
        dom.victoryItemsUsed.textContent = state.itemsUsed;
        dom.victoryGold.textContent = state.gold;

        // 显示弹窗
        dom.victoryOverlay.classList.add("show");
        document.body.classList.add("victory");

        // 胜利音效和粒子
        playVictorySound();
        spawnVictoryParticles();
    }

    // ────────── 道具操作 ──────────
    function upgradePickaxe() {
        if (state.isFalling || state.isGameOver) return;
        if (state.pickaxeLevel >= MAX_PICKAXE_LEVEL) return;

        const cost = getPickaxeUpgradeCost(state.pickaxeLevel);
        if (state.gold < cost) return;

        state.gold -= cost;
        state.pickaxeLevel++;
        playBuySound();
        updateUI();
    }

    function buyBalloon() {
        if (state.isFalling || state.isGameOver) return;
        if (state.hasBalloon) return;
        if (state.gold < BALLOON_PRICE) return;

        state.gold -= BALLOON_PRICE;
        state.hasBalloon = true;
        playBuySound();
        updateUI();
    }

    // ────────── 重新开始 ──────────
    function restart() {
        // 隐藏弹窗
        dom.victoryOverlay.classList.remove("show");
        document.body.classList.remove("victory");

        // 重置状态
        state.height = 0;
        state.energy = 100;
        state.maxEnergy = 100;
        state.lastCheckLevel = 0;
        state.gold = 0;
        state.pickaxeLevel = 1;
        state.hasBalloon = false;
        state.lastRewardHeight = 0;
        state.totalClimbs = 0;
        state.itemsUsed = 0;
        state.isClimbing = false;
        state.isFalling = false;
        state.isGameOver = false;

        // 重新加载奖杯数
        state.trophyCount = loadTrophyCount();

        // 重置 3D 人物位置
        if (window.game3d) window.game3d.updatePlayerHeight(0);

        // 更新 UI
        updateUI();
        startEnergyRegen();
    }

    // ────────── 键盘事件 ──────────
    function handleKeyDown(e) {
        // 空格键攀爬
        if (e.code === "Space" || e.key === " " || e.keyCode === 32) {
            e.preventDefault();
            climb();
        }
    }

    // ────────── 初始化 ──────────
    function init() {
        // 加载奖杯计数
        state.trophyCount = loadTrophyCount();

        // 初始 UI 渲染
        updateUI();

        // 启动能量恢复
        startEnergyRegen();

        // 监听键盘
        document.addEventListener("keydown", handleKeyDown);
    }

    // ────────── 公开 API ──────────
    window.game = {
        climb: climb,
        upgradePickaxe: upgradePickaxe,
        buyBalloon: buyBalloon,
        restart: restart,
    };

    // 启动游戏
    init();
})();
