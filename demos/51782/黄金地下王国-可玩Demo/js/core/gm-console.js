/**
 * GM Console - 内置测试指令系统
 * 通过浏览器 F12 控制台调用 GmConsole.xxx() 使用
 */
const GmConsole = {
    // ========== 金币 ==========
    addGold(amount) {
        if (!Game.state) return { success: false, reason: '游戏未初始化' };
        Game.state.gold = (Game.state.gold || 0) + amount;
        console.log(`[GM] 金币 +${amount}，当前: ${Game.state.gold}`);
        return { success: true, gold: Game.state.gold };
    },

    // ========== 经验 ==========
    addBattleExp(charIndex, amount) {
        if (!Game.state || !Game.state.party) return { success: false, reason: '队伍不存在' };
        const char = Game.state.party[charIndex !== undefined ? charIndex : 0];
        if (!char) return { success: false, reason: `角色索引 ${charIndex} 不存在` };
        if (!char.battleData) {
            if (window.Battle) Battle.ensureBattleData(char);
        }
        char.battleData.battleExp = (char.battleData.battleExp || 0) + amount;
        console.log(`[GM] ${char.name} 战斗经验 +${amount}，当前: ${char.battleData.battleExp}`);
        return { success: true, name: char.name, battleExp: char.battleData.battleExp };
    },

    // ========== 治疗 ==========
    healParty() {
        if (!Game.state || !Game.state.party) return { success: false, reason: '队伍不存在' };
        Game.state.party.forEach(char => {
            char.hp = char.maxHp || char.stats?.HP || 999;
            char.tp = char.maxTp || char.stats?.TP || 99;
        });
        console.log(`[GM] 全队HP/TP已恢复`);
        return { success: true, healed: Game.state.party.length };
    },

    // ========== 迷宫移动 ==========
    moveForward() {
        if (!Maze || !Game.state) return { success: false, reason: '迷宫未初始化' };
        const px = Game.state.playerX;
        const py = Game.state.playerY;
        const dir = Game.state.playerDir;
        Maze.moveForward();
        const moved = Game.state.playerX !== px || Game.state.playerY !== py;
        console.log(`[GM] moveForward: ${moved ? '成功' : '失败（撞墙）'}`);
        return { success: moved, x: Game.state.playerX, y: Game.state.playerY, dir: Game.state.playerDir };
    },

    moveBackward() {
        if (!Maze || !Game.state) return { success: false, reason: '迷宫未初始化' };
        const px = Game.state.playerX;
        const py = Game.state.playerY;
        Maze.moveBackward();
        const moved = Game.state.playerX !== px || Game.state.playerY !== py;
        console.log(`[GM] moveBackward: ${moved ? '成功' : '失败（撞墙）'}`);
        return { success: moved, x: Game.state.playerX, y: Game.state.playerY, dir: Game.state.playerDir };
    },

    turnLeft() {
        if (!Maze || !Game.state) return { success: false, reason: '迷宫未初始化' };
        const oldDir = Game.state.playerDir;
        Maze.turnLeft();
        console.log(`[GM] turnLeft: 成功，方向 ${oldDir} → ${Game.state.playerDir}`);
        return { success: true, dir: Game.state.playerDir };
    },

    turnRight() {
        if (!Maze || !Game.state) return { success: false, reason: '迷宫未初始化' };
        const oldDir = Game.state.playerDir;
        Maze.turnRight();
        console.log(`[GM] turnRight: 成功，方向 ${oldDir} → ${Game.state.playerDir}`);
        return { success: true, dir: Game.state.playerDir };
    },

    strafeLeft() {
        if (!Maze || !Game.state) return { success: false, reason: '迷宫未初始化' };
        const px = Game.state.playerX;
        const py = Game.state.playerY;
        Maze.strafeLeft();
        const moved = Game.state.playerX !== px || Game.state.playerY !== py;
        console.log(`[GM] strafeLeft: ${moved ? '成功' : '失败（撞墙）'}`);
        return { success: moved, x: Game.state.playerX, y: Game.state.playerY };
    },

    strafeRight() {
        if (!Maze || !Game.state) return { success: false, reason: '迷宫未初始化' };
        const px = Game.state.playerX;
        const py = Game.state.playerY;
        Maze.strafeRight();
        const moved = Game.state.playerX !== px || Game.state.playerY !== py;
        console.log(`[GM] strafeRight: ${moved ? '成功' : '失败（撞墙）'}`);
        return { success: moved, x: Game.state.playerX, y: Game.state.playerY };
    },

    // ========== 传送 ==========
    teleport(x, y) {
        if (!Maze || !Game.state || !MazeRenderer) return { success: false, reason: '迷宫未初始化' };
        const floorData = GameData.floors[Game.state.currentFloor];
        if (!floorData) return { success: false, reason: '楼层数据不存在' };
        if (x < 0 || x >= floorData.width || y < 0 || y >= floorData.height) {
            return { success: false, reason: `坐标超出范围 (0~${floorData.width-1}, 0~${floorData.height-1})` };
        }
        Game.state.playerX = x;
        Game.state.playerY = y;
        MazeRenderer.setPlayerPositionImmediate(x, y, Game.state.playerDir);
        if (window.MapEditor) MapEditor.render();
        console.log(`[GM] teleport: 已传送到 (${x}, ${y})`);
        return { success: true, x, y };
    },

    // ========== 战斗 ==========
    startBattle(monsterIds, isBoss = false) {
        if (!Battle) return { success: false, reason: 'Battle模块未加载' };
        Battle.startBattle(monsterIds, isBoss);
        console.log(`[GM] 开始战斗: ${monsterIds.join(', ')}${isBoss ? ' (Boss)' : ''}`);
        return { success: true, monsters: monsterIds };
    },

    startSceneBattle(monsterIds) {
        if (!Battle) return { success: false, reason: 'Battle模块未加载' };
        Battle.startInSceneBattle(monsterIds, null);
        console.log(`[GM] 开始场景战斗: ${monsterIds.join(', ')}`);
        return { success: true, monsters: monsterIds };
    },

    // ========== 查看信息 ==========
    getPos() {
        if (!Game.state) return { success: false, reason: '游戏未初始化' };
        return {
            success: true,
            floor: Game.state.currentFloor,
            x: Game.state.playerX,
            y: Game.state.playerY,
            dir: Game.state.playerDir,
            dirName: ['北', '东', '南', '西'][Game.state.playerDir] || '未知'
        };
    },

    getGold() {
        if (!Game.state) return { success: false, reason: '游戏未初始化' };
        return { success: true, gold: Game.state.gold || 0 };
    },

    repairMapExploration() {
        if (!Game || !Game.state) return { success: false, reason: '游戏未初始化' };
        if (!MapEditor) return { success: false, reason: 'MapEditor未加载' };

        const floor = Game.state.currentFloor || 0;
        const x = Game.state.playerX;
        const y = Game.state.playerY;

        Game.resetMapData();
        MapEditor.exploreAround(x, y, floor);
        MapEditor.render();
        Game.saveToStorage();

        console.log(`[GM] 已清空旧地图探索数据，并围绕当前位置重新探索: floor=${floor}, x=${x}, y=${y}`);
        return { success: true, floor, x, y, message: '已清空旧地图探索数据，角色/队伍/迷宫结构已保留。' };
    },

    listMonsters() {
        if (!GameData || !GameData.monsters) return { success: false, reason: '怪物数据未加载' };
        const list = Object.entries(GameData.monsters).map(([id, m]) => ({
            id, name: m.name, hp: m.hp, isFoe: !!m.isFoe, isBoss: !!m.isBoss, floor: this._findMonsterFloor(id)
        }));
        console.table(list);
        return { success: true, monsters: list };
    },

    _findMonsterFloor(id) {
        for (const [floor, ids] of Object.entries(GameData.floorMonsters)) {
            if (ids.includes(id)) return parseInt(floor);
        }
        for (const [floor, ids] of Object.entries(GameData.floorFoes || {})) {
            if (ids.includes(id)) return parseInt(floor);
        }
        for (const [floor, bossId] of Object.entries(GameData.floorBosses || {})) {
            if (bossId === id) return parseInt(floor);
        }
        return -1;
    },

    // ========== 楼层切换 ==========
    goToFloor(floor) {
        if (!Game || !Game.state) return { success: false, reason: '游戏未初始化' };
        if (floor === undefined || floor === null) return { success: false, reason: '请指定楼层号' };
        const spawn = GameData.getFloorSpawn(floor);
        Game.state.currentFloor = floor;
        Game.state.playerX = spawn.x;
        Game.state.playerY = spawn.y;
        Game.state.playerDir = spawn.dir;
        if (MazeRenderer) MazeRenderer.setPlayerPositionImmediate(spawn.x, spawn.y, spawn.dir);
        if (MapEditor) {
            MapEditor.exploreAround(spawn.x, spawn.y, floor);
            MapEditor.render();
        }
        if (HiddenMonsterManager) HiddenMonsterManager.spawnAllMonsters(floor);
        console.log(`[GM] 切换到 ${floor}F`);
        return { success: true, floor, x: spawn.x, y: spawn.y, dir: spawn.dir };
    },

    // ========== 界面快捷操作 ==========
    enterTown() {
        if (!Game) return { success: false, reason: 'Game未加载' };
        Game.showScreen('town-screen');
        if (window.Town) Town.update();
        console.log('[GM] 进入城镇');
        return { success: true, screen: 'town-screen' };
    },

    enterGuild() {
        if (!Guild) return { success: false, reason: 'Guild未加载' };
        Guild.enter();
        console.log('[GM] 进入冒险者公会');
        return { success: true, screen: 'guild-screen' };
    },

    createCharacter(classId, name, appearanceIndex = 0) {
        if (!GameData || !CharacterCreation) return { success: false, reason: '模块未加载' };
        const classData = GameData.classes[classId];
        if (!classData) return { success: false, reason: `职业 ${classId} 不存在` };
        if (!name) name = classData.name + '_' + Math.floor(Math.random() * 1000);

        const char = CharacterCreation.createCharacter(name, classId, classData, appearanceIndex);
        CharacterCreation.party.push(char);
        Game.state.roster.push(char);
        console.log(`[GM] 创建角色: ${char.name} (${char.className})`);
        return { success: true, character: { name: char.name, classId, className: char.className, level: char.level } };
    },

    addToParty(charIndex) {
        if (!Game.state || !Game.state.roster) return { success: false, reason: '仓库不存在' };
        const char = Game.state.roster[charIndex];
        if (!char) return { success: false, reason: `角色索引 ${charIndex} 不存在` };
        if (Game.state.party.length >= 5) return { success: false, reason: '队伍已满（5人上限）' };
        Game.state.party.push(char);
        console.log(`[GM] ${char.name} 加入队伍，当前 ${Game.state.party.length}/5`);
        return { success: true, partySize: Game.state.party.length };
    },

    removeFromParty(charIndex) {
        if (!Game.state || !Game.state.party) return { success: false, reason: '队伍不存在' };
        const char = Game.state.party[charIndex];
        if (!char) return { success: false, reason: `角色索引 ${charIndex} 不存在` };
        Game.state.party.splice(charIndex, 1);
        console.log(`[GM] ${char.name} 从队伍移除，当前 ${Game.state.party.length}/5`);
        return { success: true, partySize: Game.state.party.length };
    },

    enterMaze(floor = 0) {
        if (!Game || !Game.state) return { success: false, reason: '游戏未初始化' };
        if (Game.state.party.length === 0) return { success: false, reason: '队伍为空，请先创建角色并加入队伍' };
        const spawn = GameData.getFloorSpawn(floor);
        Game.state.currentFloor = floor;
        Game.state.playerX = spawn.x;
        Game.state.playerY = spawn.y;
        Game.state.playerDir = spawn.dir;
        if (MazeRenderer) MazeRenderer.setPlayerPositionImmediate(spawn.x, spawn.y, spawn.dir);
        if (MapEditor) MapEditor.exploreAround(spawn.x, spawn.y, floor);
        if (HiddenMonsterManager) HiddenMonsterManager.spawnAllMonsters(floor);
        Game.showScreen('maze-screen');
        if (MazeRenderer) MazeRenderer.start();
        console.log(`[GM] 进入迷宫 ${floor}F`);
        return { success: true, floor, x: spawn.x, y: spawn.y, dir: spawn.dir };
    },

    exitMaze() {
        if (!Game) return { success: false, reason: 'Game未加载' };
        if (MazeRenderer) MazeRenderer.stop();
        Game.showScreen('town-screen');
        if (window.Town) Town.update();
        console.log('[GM] 离开迷宫回到城镇');
        return { success: true, screen: 'town-screen' };
    },

    quickSetup(classIds = ['warrior', 'mage', 'samurai']) {
        if (!GameData || !CharacterCreation) return { success: false, reason: '模块未加载' };
        // 清空旧数据
        Game.state.party = [];
        Game.state.roster = [];
        CharacterCreation.party = [];

        const created = [];
        classIds.forEach((cid, i) => {
            const classData = GameData.classes[cid];
            if (!classData) return;
            const name = classData.name + (i + 1);
            const char = CharacterCreation.createCharacter(name, cid, classData, 0);
            CharacterCreation.party.push(char);
            Game.state.roster.push(char);
            Game.state.party.push(char);
            created.push({ name: char.name, classId: cid, className: char.className });
        });

        // 进入迷宫B1F
        const mazeResult = this.enterMaze(0);
        console.log(`[GM] 快速设置完成: ${created.map(c => c.name).join(', ')}`);
        return { success: true, created, maze: mazeResult };
    },

    // ========== 全队升满/究极强化 ==========
    maxPower() {
        if (!Game.state || !Game.state.party) return { success: false, reason: '队伍不存在' };
        Game.state.party.forEach(char => {
            char.level = 99;
            char.exp = 999999;
            char.hp = 9999;
            char.maxHp = 9999;
            char.tp = 999;
            char.maxTp = 999;
            const s = char.stats || {};
            s.STR = 99; s.INT = 99; s.VIT = 99; s.AGI = 99; s.LUK = 99;
            char.stats = s;
            if (char.battleData) {
                char.battleData.battles = 100;
                char.battleData.wins = 90;
                char.battleData.totalDecisions = 500;
            }
        });
        console.log(`[GM] 全队已强化至极限`);
        return { success: true };
    }
};

export default GmConsole;
