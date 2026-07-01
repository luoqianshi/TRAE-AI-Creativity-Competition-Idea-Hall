// ============================================================
// TitleScreen - ui/title-screen.js
// 自动从 game.js 拆分
// ============================================================

const TitleScreen = {
    selectedIndex: 0,
    buttons: ['start-game', 'restart', 'option', 'license'],

    init() {
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('title-screen').classList.contains('active')) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.moveSelection(-1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveSelection(1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.confirm();
                    break;
            }
        });
    },

    moveSelection(delta) {
        this.selectedIndex = (this.selectedIndex + delta + this.buttons.length) % this.buttons.length;
        this.updateUI();
    },

    updateUI() {
        document.querySelectorAll('.title-btn').forEach((btn, index) => {
            const isSelected = index === this.selectedIndex;
            btn.classList.toggle('selected', isSelected);
            // 切换按钮背景图
            const bgImg = btn.querySelector('.btn-bg img');
            if (bgImg) {
                bgImg.src = isSelected
                    ? 'assets/ui/login-screen/login-btn-selected.png'
                    : 'assets/ui/login-screen/login-btn-default.png';
            }
        });
    },

    click(index) {
        this.selectedIndex = index;
        this.updateUI();
        this.confirm();
    },

    // 检查是否有存档
    hasSaveData() {
        const saveData = localStorage.getItem('world_tree_maze_save');
        if (!saveData) return false;
        try {
            const data = JSON.parse(saveData);
            // 检查是否有有效的存档数据
            return data && (data.characters || data.party || data.gold !== undefined);
        } catch {
            return false;
        }
    },

    confirm() {
        const action = this.buttons[this.selectedIndex];
        switch(action) {
            case 'start-game':
                // 智能判断：有存档则加载，无存档则新游戏
                if (this.hasSaveData()) {
                    Game.loadGame();
                } else {
                    Game.startNewGame();
                }
                break;
            case 'restart':
                // 重新开始：清档后新游戏
                this.confirmRestart();
                break;
            case 'option':
                Dialog.show('选项功能开发中...');
                break;
            case 'license':
                Dialog.show('<h3>许可信息</h3><p>黄金地下王国 - HD REMASTER</p><p>© 2024 黄金地下王国 Project</p>');
                break;
        }
    },

    confirmRestart() {
        if (this.hasSaveData()) {
            const html = `
                <div style="text-align:center;padding:20px">
                    <p style="font-size:1.1em;margin-bottom:15px">确定要重新开始吗？</p>
                    <p style="color:#ff6666;margin-bottom:20px">这将删除所有存档数据！</p>
                    <div style="display:flex;gap:15px;justify-content:center">
                        <button class="action-btn" onclick="TitleScreen.doRestart()" style="background:#c04040">确定删除</button>
                        <button class="action-btn" onclick="Dialog.close()" style="background:#3a4a5a">取消</button>
                    </div>
                </div>
            `;
            Dialog.show(html, null, { hideDefaultButton: true });
        } else {
            Game.startNewGame();
        }
    },

    doRestart() {
        Dialog.close();
        // 清除存档
        Game.clearSaveData();
        // 开始新游戏
        Game.startNewGame();
    }
};

export default TitleScreen;
