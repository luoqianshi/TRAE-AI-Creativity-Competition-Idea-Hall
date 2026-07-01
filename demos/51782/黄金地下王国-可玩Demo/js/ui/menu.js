// ============================================================
// Menu - ui/menu.js
// 自动从 game.js 拆分
// ============================================================

const Menu = {
    currentCharIndex: 0,

    openFromMaze() {
        Game.showScreen('menu-screen');
        this.renderPartyList();
    },

    renderPartyList() {
        const container = document.getElementById('menu-party-list');
        if (!Game.state) return;

        let html = '';
        Game.state.party.forEach(char => {
            const hpPercent = char.maxStats.HP > 0 ? Math.floor(char.stats.HP / char.maxStats.HP * 100) : 0;
            const tpPercent = char.maxStats.TP > 0 ? Math.floor(char.stats.TP / char.maxStats.TP * 100) : 0;
            const hpColor = hpPercent > 50 ? '#40c040' : hpPercent > 25 ? '#c0c040' : '#c04040';
            const tpColor = '#4080c0';
            html += `<div class="menu-char">
                <img src="${char.icon || char.portrait}" alt="${char.className}">
                <div class="menu-char-info">
                    <div class="name">Lv.${char.level} ${char.name} <span style="color:#888;font-size:12px;font-weight:normal">${char.className}</span></div>
                    <div class="hp-tp">
                        <span style="color:${hpColor}">HP ${char.stats.HP}/${char.maxStats.HP}</span>
                        <span style="color:${tpColor}">TP ${char.stats.TP}/${char.maxStats.TP}</span>
                    </div>
                    <div style="margin-top:4px;height:4px;background:#1a2a3a;border-radius:2px;overflow:hidden">
                        <div style="width:${hpPercent}%;height:100%;background:${hpColor};border-radius:2px;transition:width 0.3s"></div>
                    </div>
                </div>
            </div>`;
        });
        html += `<div style="color:#c0a860;margin-top:10px;font-size:14px">💰 金币: ${Game.state.gold}G</div>`;
        container.innerHTML = html;
    },

    showStatus() {
        if (!Game.state || Game.state.party.length === 0) {
            Dialog.show('<p style="color:#606080">队伍中没有角色。</p>');
            return;
        }
        this.currentCharIndex = 0;
        this.openStatusScreen();
    },

    openStatusScreen() {
        const party = Game.state.party;
        if (party.length === 0) return;

        // 渲染底部缩略图
        const thumbsContainer = document.getElementById('char-thumbnails');
        let thumbsHtml = '';
        party.forEach((char, i) => {
            thumbsHtml += `<img src="${char.icon || char.portrait}" class="char-thumb ${i === this.currentCharIndex ? 'active' : ''}" onclick="Menu.selectCharacter(${i})" alt="${char.name}">`;
        });
        thumbsContainer.innerHTML = thumbsHtml;

        // 显示当前角色
        this.renderCharacterStatus(party[this.currentCharIndex]);

        Game.showScreen('character-status-screen');
    },

    selectCharacter(index) {
        this.currentCharIndex = index;
        // 更新缩略图高亮
        document.querySelectorAll('.char-thumb').forEach((el, i) => {
            el.classList.toggle('active', i === index);
        });
        // 更新角色详情
        this.renderCharacterStatus(Game.state.party[index]);
    },

    renderCharacterStatus(char) {
        document.getElementById('char-portrait-img').src = char.portrait || char.icon;
        document.getElementById('char-name').textContent = char.name;
        document.getElementById('char-class').textContent = char.className;
        document.getElementById('char-level').textContent = `Lv.${char.level}`;
        document.getElementById('char-exp').textContent = `EXP: ${char.exp}/${char.expToNext}`;

        // HP/TP 条
        const hpPercent = char.maxStats.HP > 0 ? Math.floor(char.stats.HP / char.maxStats.HP * 100) : 0;
        const tpPercent = char.maxStats.TP > 0 ? Math.floor(char.stats.TP / char.maxStats.TP * 100) : 0;
        document.getElementById('hp-bar').style.width = hpPercent + '%';
        document.getElementById('tp-bar').style.width = tpPercent + '%';
        document.getElementById('hp-value').textContent = `${char.stats.HP}/${char.maxStats.HP}`;
        document.getElementById('tp-value').textContent = `${char.stats.TP}/${char.maxStats.TP}`;

        // 属性值 (STR=攻击, VIT=防御, AGI=速度, LUC=幸运)
        document.getElementById('atk-value').textContent = char.stats.STR || '-';
        document.getElementById('def-value').textContent = char.stats.VIT || '-';
        document.getElementById('spd-value').textContent = char.stats.AGI || '-';
        document.getElementById('luk-value').textContent = char.stats.LUC || '-';

        // 技能列表
        const skillsContainer = document.getElementById('char-skills');
        if (char.skills && char.skills.length > 0) {
            skillsContainer.innerHTML = char.skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('');
        } else {
            skillsContainer.innerHTML = '<span style="color:#606080">暂无技能</span>';
        }
    },

    closeStatusScreen() {
        // 如果是从公会界面打开的，返回到公会界面
        if (Guild._returnToGuild) {
            Guild._returnToGuild = false;
            Game.showScreen('guild-screen');
            return;
        }
        Game.showScreen('menu-screen');
    },

    showInventory() {
        let html = '<h3 style="color:#a0a0e0;margin-bottom:10px">道具一览</h3>';
        if (Game.state.inventory.length === 0) {
            html += '<p style="color:#606080">没有道具。</p>';
        } else {
            Game.state.inventory.forEach(item => {
                const data = Battle.findItemData(item.id);
                html += `<div style="padding:6px;border-bottom:1px solid #2a2a4a">
                    <span style="color:#c0c0e0">${item.name}</span>
                    <span style="color:#8080a0"> x${item.count}</span>
                    ${data ? '<span style="color:#606080;font-size:0.85em"> - ' + data.desc + '</span>' : ''}
                </div>`;
            });
        }
        Dialog.show(html);
    },

    saveGame() {
        try {
            if (Game.saveToStorage()) {
                Dialog.show('游戏已保存！');
            } else {
                Dialog.show('没有可保存的游戏数据。');
            }
        } catch (e) {
            console.error('保存失败:', e);
            Dialog.show('保存失败...');
        }
    },

    returnToMaze() {
        Game.showScreen('maze-screen');
        MazeRenderer.start();
        MapEditor.render();
        Maze.updateHUD();
    },

    returnToTown() {
        Maze.returnToTown();
    }
};

export default Menu;
