// ============================================================
// Town - ui/town.js
// 自动从 game.js 拆分
// ============================================================

const Town = {
    init() {
        // 城镇系统初始化
    },

    update() {
        this.updatePartyStatus();
    },

    updatePartyStatus() {
        const container = document.getElementById('town-party-status');
        if (!Game.state) return;

        // 一行两列布局
        let html = '<div class="town-party-grid">';
        Game.state.party.forEach(char => {
            html += `<div class="town-party-item">
                ${char.name} Lv.${char.level} | HP:${char.stats.HP}/${char.maxStats.HP} TP:${char.stats.TP}/${char.maxStats.TP}
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    },

    enterGuild() {
        Guild.enter();
    },

    enterShop() {
        Shop.open();
    },

    enterInn() {
        const cost = 20 + Game.state.party.length * 10;
        const hasEnoughGold = Game.state.gold >= cost;
        
        let html = '<h3 style="color:#7ab8e0;margin-bottom:15px">🏨 旅馆</h3>';
        html += '<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:15px">';
        
        // 功能1：休息恢复
        html += `<div style="background:rgba(30,40,50,0.6);padding:12px;border-radius:8px;border:1px solid #3a4a5a">`;
        html += `<p style="color:#c0d0e0;margin-bottom:8px">💰 恢复全部HP/TP需要 <strong style="color:#f0c040">${cost}G</strong></p>`;
        html += `<p style="color:#8090a0;font-size:0.9em">当前金币: ${Game.state.gold}G</p>`;
        if (!hasEnoughGold) {
            html += `<p style="color:#f0a0a0;font-size:0.85em">⚠️ 金币不足，休息时只恢复HP，不恢复TP</p>`;
        }
        html += `<button class="action-btn" style="margin-top:8px" onclick="Town.innRest()">休息</button>`;
        html += `</div>`;
        
        // 功能2：保存游戏
        html += `<div style="background:rgba(30,40,50,0.6);padding:12px;border-radius:8px;border:1px solid #3a4a5a">`;
        html += `<p style="color:#c0d0e0;margin-bottom:8px">💾 保存游戏进度</p>`;
        html += `<p style="color:#8090a0;font-size:0.9em">将当前进度保存到本地</p>`;
        html += `<button class="action-btn" style="margin-top:8px" onclick="Town.innSave()">保存游戏</button>`;
        html += `</div>`;
        
        html += '</div>';
        html += `<button class="action-btn" style="background:#3a4a5a" onclick="Dialog.close()">离开</button>`;
        
        Dialog.show(html, null, { hideDefaultButton: true });
    },

    innRest() {
        const cost = 20 + Game.state.party.length * 10;
        const hasEnoughGold = Game.state.gold >= cost;
        
        if (hasEnoughGold) {
            // 金币足够：恢复全部HP/TP
            Game.state.gold -= cost;
            Game.state.party.forEach(char => {
                char.stats.HP = char.maxStats.HP;
                char.stats.TP = char.maxStats.TP;
                char.statusEffects = [];
            });
            this.updatePartyStatus();
            Dialog.show('在旅馆休息了一晚，HP和TP完全恢复了！');
        } else {
            // 金币不足：只恢复HP，不恢复TP
            Game.state.party.forEach(char => {
                char.stats.HP = char.maxStats.HP;
                char.statusEffects = [];
            });
            this.updatePartyStatus();
            Dialog.show('金币不足，只恢复了HP。建议赚取更多金币后再来休息！');
        }
    },

    innSave() {
        this.autoSave();
        Dialog.show('游戏已保存！');
    },

    enterLabyrinth() {
        let html = '<h3 style="color:#7ab8e0;margin-bottom:15px">黄金地下王国入口</h3>';
        html += '<p style="color:#a0b0c0;margin-bottom:10px">选择要探索的楼层：</p>';
        html += '<div style="display:flex;flex-direction:column;gap:8px">';

        const floorNames = ['B1F - 浅层', 'B2F - 中层', 'B3F - 深层'];
        const floorDescs = ['史莱姆和蝙蝠出没的区域', '蝙蝠、骷髅和树人栖息的区域', '强大的骷髅和树人，深处有Boss'];

        for (let i = 0; i < 3; i++) {
            const unlocked = i <= (Game.state.maxFloorReached || 0);
            const bossStatus = Game.state.bossDefeated[i] ? ' (Boss已击败)' : '';
            html += `<button class="action-btn ${unlocked ? '' : 'action-btn-locked'}" style="text-align:left;padding:10px" 
                onclick="Town.enterFloor(${i})">
                ${floorNames[i]}${bossStatus}<br>
                <span style="font-size:0.85em;color:#8090b0">${floorDescs[i]}</span>
            </button>`;
        }

        html += '</div>';
        Dialog.show(html);
    },

    enterFloor(floorIndex) {
        if (floorIndex > (Game.state.maxFloorReached || 0)) {
            Dialog.show('上一层还未探索完毕，请先完成当前楼层的探索。');
            return;
        }
        Dialog.close();
        Game.state.currentFloor = floorIndex;
        const spawn = GameData.getFloorSpawn(floorIndex);

        // 设置玩家位置到该层起点
        Game.state.playerX = spawn.x;
        Game.state.playerY = spawn.y;
        Game.state.playerDir = spawn.dir;
        Game.state.steps = 0;

        // 生成该层的暗雷怪物
        HiddenMonsterManager.spawnAllMonsters(floorIndex);

        MazeRenderer.setPlayerPositionImmediate(spawn.x, spawn.y, spawn.dir);
        MapEditor.exploreAround(spawn.x, spawn.y, floorIndex);

        // 自动存档
        this.autoSave();

        Game.showScreen('maze-screen');
        MazeRenderer.start();
        MapEditor.render();
        Maze.updateHUD();
    },

    // 自动存档（静默保存，不显示提示）
    autoSave() {
        try {
            Game.saveToStorage();
        } catch (e) {
            console.error('自动存档失败:', e);
        }
    }
};

export default Town;
