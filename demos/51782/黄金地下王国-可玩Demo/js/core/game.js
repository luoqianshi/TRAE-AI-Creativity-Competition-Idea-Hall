// ============================================================
// Game - core/game.js
// 自动从 game.js 拆分
// ============================================================

const Game = {
    state: null,
    storageKeys: {
        save: 'world_tree_maze_save',
        map: 'world_tree_maze_map',
        floors: 'world_tree_maze_floors'
    },

    init() {
        GameData.initFloors();
        MazeRenderer.init();
        MapEditor.init();
        Maze.init();
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
        }
        // 切换界面时自动关闭弹窗
        Dialog.close();
    },

    startNewGame() {
        // 清除旧存档数据，确保全新开始
        this.clearSaveData();
        GameData.initFloors();
        const spawn = GameData.getFloorSpawn(0);
        CharacterCreation.party = [];
        // 初始化游戏状态（新游戏）
        Game.state = {
            party: [],
            roster: [],
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
            stairsDiscovered: {},
            maxFloorReached: 0
        };
        // 新游戏：进入冒险公会→创建角色流程
        Game.showScreen('guild-screen');
        // 确保公会界面重置到主菜单，再进入登记
        Guild.backToMain();
        Guild.showRegistration();
    },

    loadGame() {
        try {
            const saveData = localStorage.getItem(this.storageKeys.save);
            if (!saveData) {
                Dialog.show('没有找到存档数据。');
                return;
            }

            // 先恢复迷宫结构，再恢复玩家状态和地图记录。
            // 旧存档没有 floors 数据时，首次读档会生成一份并在下次保存后固定下来。
            const isLegacySaveWithoutFloors = !this.loadFloorsFromStorage();
            if (isLegacySaveWithoutFloors) {
                GameData.initFloors();
                this.saveFloorsToStorage();
                console.warn('[Game] 当前存档缺少迷宫结构数据，已生成并保存一份新的固定迷宫。旧探索地图可能与本次生成的迷宫不完全一致。');
            }
            GameData.ensureFloorSpawns();

            Game.state = JSON.parse(saveData);

            // 同步角色资源路径（立绘/icon更新后自动修复旧存档）
            this.syncCharacterAssets();

            // 加载地图数据
            if (isLegacySaveWithoutFloors) {
                // 旧存档没有实际迷宫结构，旧探索地图无法再与新生成迷宫对应。
                // 只在这类迁移场景清空旧地图，并把玩家放回当前楼层出生点，避免读档进墙或显示错图。
                const floor = Game.state.currentFloor || 0;
                const spawn = GameData.getFloorSpawn(floor);
                Game.state.currentFloor = floor;
                Game.state.playerX = spawn.x;
                Game.state.playerY = spawn.y;
                Game.state.playerDir = spawn.dir;
                Game.state.steps = 0;
                this.resetMapData();
                MapEditor.exploreAround(spawn.x, spawn.y, floor);
                this.saveToStorage();
                console.warn('[Game] 旧存档迁移：已清空旧探索地图，并重置到当前楼层出生点。');
            } else if (localStorage.getItem(this.storageKeys.map)) {
                const mapDataStr = localStorage.getItem(this.storageKeys.map);
                const mapData = JSON.parse(mapDataStr);
                this.restoreMapData(mapData);
            } else {
                this.resetMapData();
            }

            // 设置渲染器位置
            MazeRenderer.setPlayerPositionImmediate(
                Game.state.playerX,
                Game.state.playerY,
                Game.state.playerDir
            );

            Game.showScreen('town-screen');
            Town.update();
            Dialog.show('存档已加载！');
        } catch (e) {
            Dialog.show('读档失败...');
        }
    },

    saveGame() {
        Menu.saveGame();
    },

    saveToStorage() {
        if (!Game.state) return false;

        localStorage.setItem(this.storageKeys.save, JSON.stringify(Game.state));
        localStorage.setItem(this.storageKeys.map, JSON.stringify(this.getMapData()));
        this.saveFloorsToStorage();
        return true;
    },

    saveFloorsToStorage() {
        if (!GameData.floors) return false;
        GameData.ensureFloorSpawns();
        localStorage.setItem(this.storageKeys.floors, JSON.stringify(GameData.floors));
        return true;
    },

    loadFloorsFromStorage() {
        const floorsData = localStorage.getItem(this.storageKeys.floors);
        if (!floorsData) return false;

        try {
            const floors = JSON.parse(floorsData);
            if (!Array.isArray(floors) || floors.length === 0) {
                return false;
            }
            GameData.floors = floors;
            GameData.ensureFloorSpawns();
            return true;
        } catch (e) {
            console.warn('[Game] 迷宫结构数据读取失败，将重新生成。', e);
            return false;
        }
    },

    getMapData() {
        return {
            exploredMap: MapEditor.exploredMap,
            wallMap: MapEditor.wallMap,
            doorMap: MapEditor.doorMap,
            eventMap: MapEditor.eventMap,
            stairMap: MapEditor.stairMap,
            eventTypeMap: MapEditor.eventTypeMap,
            noteMap: MapEditor.noteMap
        };
    },

    restoreMapData(mapData) {
        MapEditor.exploredMap = mapData.exploredMap || {};
        MapEditor.wallMap = mapData.wallMap || {};
        MapEditor.doorMap = mapData.doorMap || {};
        MapEditor.eventMap = mapData.eventMap || {};
        MapEditor.stairMap = mapData.stairMap || {};
        MapEditor.eventTypeMap = mapData.eventTypeMap || {};
        MapEditor.noteMap = mapData.noteMap || {};
        MapEditor.bigMapViewport = null;
    },

    resetMapData() {
        this.restoreMapData({});
    },

    clearSaveData() {
        localStorage.removeItem(this.storageKeys.save);
        localStorage.removeItem(this.storageKeys.map);
        localStorage.removeItem(this.storageKeys.floors);
        this.resetMapData();
    },

    returnToTitle() {
        MazeRenderer.stop();
        Game.state = null;
        Game.showScreen('title-screen');
    },

    /**
     * 同步角色资源路径
     * 当 game-data.js 中的职业立绘/icon路径更新后，
     * 自动修复旧存档中角色的 portrait 和 icon 字段
     */
    syncCharacterAssets() {
        if (!Game.state) return;

        const allChars = [];
        if (Game.state.party) allChars.push(...Game.state.party);
        if (Game.state.roster) allChars.push(...Game.state.roster);

        for (const char of allChars) {
            if (!char.classId) continue;

            const classData = GameData.classes[char.classId];
            if (!classData || !classData.appearances) continue;

            const appearanceIndex = char.appearanceIndex !== undefined ? char.appearanceIndex : (char.appearance || 0);
            const appearance = classData.appearances[appearanceIndex];
            if (!appearance) continue;

            // 只更新指向旧路径的 portrait/icon
            const oldPaths = ['角色立绘/', 'assets/characters/'];
            const isOldPortrait = oldPaths.some(p => char.portrait && char.portrait.startsWith(p) && !char.portrait.includes('_icon'));
            const isOldIcon = oldPaths.some(p => char.icon && char.icon.startsWith(p) && !char.icon.includes('_icon'));

            if (isOldPortrait || isOldIcon) {
                char.portrait = appearance.portrait;
                char.icon = appearance.icon;
                console.log(`[Game] 同步角色资源: ${char.name} (${char.classId}_${appearanceIndex}) portrait=${appearance.portrait} icon=${appearance.icon}`);
            }
        }
    }
};

export default Game;
