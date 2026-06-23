/**
 * 游戏次数限制模块
 * 管理每日游戏次数、胜利奖励和分享奖励
 */
class GameLimit {
    constructor() {
        this.DAILY_LIMIT = 5; // 每日免费次数
        this.STORAGE_KEY = 'reversi_game_data';
        this.initializeData();
    }

    /**
     * 初始化或加载游戏数据
     */
    initializeData() {
        const today = this.getTodayString();
        const stored = localStorage.getItem(this.STORAGE_KEY);

        if (stored) {
            this.data = JSON.parse(stored);

            // 检查是否是新的一天，如果是则重置
            if (this.data.date !== today) {
                this.resetDaily();
            }
        } else {
            this.resetDaily();
        }
    }

    /**
     * 获取今天的日期字符串 (YYYY-MM-DD)
     */
    getTodayString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    /**
     * 重置每日数据
     */
    resetDaily() {
        this.data = {
            date: this.getTodayString(),
            gamesPlayed: 0,
            bonusGames: 0,
            sharedToday: false
        };
        this.saveData();
    }

    /**
     * 保存数据到 localStorage
     */
    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    /**
     * 获取剩余游戏次数
     */
    getRemainingGames() {
        const total = this.DAILY_LIMIT + this.data.bonusGames;
        const remaining = total - this.data.gamesPlayed;
        return Math.max(0, remaining);
    }

    /**
     * 检查是否可以开始新游戏
     */
    canStartGame() {
        return this.getRemainingGames() > 0;
    }

    /**
     * 开始一局游戏（消耗一次机会）
     */
    startGame() {
        if (this.canStartGame()) {
            this.data.gamesPlayed++;
            this.saveData();
            return true;
        }
        return false;
    }

    /**
     * 胜利奖励（+1 次游戏机会）
     */
    awardVictory() {
        this.data.bonusGames++;
        this.saveData();
        console.log('胜利奖励：+1 次游戏机会');
    }

    /**
     * 分享奖励（+1 次游戏机会，每天只能领取一次）
     */
    awardShare() {
        if (!this.data.sharedToday) {
            this.data.bonusGames++;
            this.data.sharedToday = true;
            this.saveData();
            console.log('分享奖励：+1 次游戏机会');
            return true;
        }
        return false;
    }

    /**
     * 检查今天是否已经分享过
     */
    hasSharedToday() {
        return this.data.sharedToday;
    }

    /**
     * 获取游戏统计信息
     */
    getStats() {
        return {
            remaining: this.getRemainingGames(),
            played: this.data.gamesPlayed,
            bonus: this.data.bonusGames,
            sharedToday: this.data.sharedToday
        };
    }
}

// 导出 GameLimit 类
export default GameLimit;
