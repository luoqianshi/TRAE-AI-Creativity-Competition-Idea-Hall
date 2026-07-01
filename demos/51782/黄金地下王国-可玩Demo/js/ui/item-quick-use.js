// ============================================================
// ItemQuickUse - ui/item-quick-use.js
// 自动从 game.js 拆分
// ============================================================

const ItemQuickUse = {
    isPaused: false,
    isOpen: false,
    selectedCharIndex: 0,
    keydownHandler: null, // 保存键盘事件处理器引用

    // 打开道具窗口
    openItemPopup() {
        if (this.isOpen) return;
        
        console.log('[ItemQuickUse] 打开道具窗口');
        this.isOpen = true;
        
        // 暂停ATB
        this.pauseATB();
        
        // 显示道具窗口
        this.showItemPopup();
    },

    // 关闭道具窗口
    closeItemPopup() {
        if (!this.isOpen) return;
        
        console.log('[ItemQuickUse] 关闭道具窗口');
        this.isOpen = false;
        
        // 隐藏道具窗口
        this.hideItemPopup();
        
        // 恢复ATB
        this.resumeATB();
    },

    // 显示道具窗口
    showItemPopup() {
        const overlay = document.getElementById('item-popup-overlay');
        if (!overlay) return;
        
        // 生成道具列表
        this.renderItemList();
        
        // 显示弹窗
        overlay.style.display = 'flex';
        
        // 添加键盘事件监听（保存引用以便移除）
        this.keydownHandler = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.keydownHandler);
    },

    // 隐藏道具窗口
    hideItemPopup() {
        const overlay = document.getElementById('item-popup-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // 移除键盘事件监听（使用保存的引用）
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
    },

    // 渲染道具列表
    renderItemList() {
        const listContainer = document.getElementById('item-popup-list');
        if (!listContainer) return;
        
        const inventory = Game.state.inventory || [];
        
        if (inventory.length === 0) {
            listContainer.innerHTML = '<div class="item-empty">没有可用的道具</div>';
            return;
        }
        
        let html = '';
        inventory.forEach((item, index) => {
            if (item.count > 0) {
                const itemData = this.getItemData(item.id);
                html += `<div class="item-popup-item" onclick="ItemQuickUse.useItem('${item.id}', ${index})">
                    <span class="item-icon">${this.getItemIcon(item.id)}</span>
                    <span class="item-name">${item.name || itemData?.name || item.id}</span>
                    <span class="item-desc">${itemData?.desc || ''}</span>
                    <span class="item-count">x${item.count}</span>
                </div>`;
            }
        });
        
        listContainer.innerHTML = html;
    },

    // 获取道具数据
    getItemData(itemId) {
        // 从商店物品中查找
        const allItems = [
            ...(GameData.shopItems?.items || []),
            ...(GameData.shopItems?.weapons || []),
            ...(GameData.shopItems?.armors || [])
        ];
        return allItems.find(i => i.id === itemId);
    },

    // 获取道具图标
    getItemIcon(itemId) {
        const iconMap = {
            'heal_potion': '💊',
            'high_heal_potion': '💊',
            'tp_potion': '⚡',
            'elixir': '✨',
            'antidote': '🌿',
            'escape_scroll': '📜',
            'teleport_stone': '💎'
        };
        return iconMap[itemId] || '📦';
    },

    // 使用道具
    useItem(itemId, inventoryIndex) {
        console.log(`[ItemQuickUse] 使用道具: ${itemId}`);
        
        const inventory = Game.state.inventory;
        const item = inventory.find(i => i.id === itemId && i.count > 0);
        
        if (!item) {
            console.log('[ItemQuickUse] 道具不存在或数量为0');
            return;
        }
        
        const itemData = this.getItemData(itemId);
        if (!itemData || !itemData.effect) {
            console.log('[ItemQuickUse] 道具数据无效');
            return;
        }
        
        // 执行道具效果
        const result = this.executeItemEffect(itemData.effect);
        
        if (result.success) {
            // 减少道具数量
            item.count--;
            if (item.count <= 0) {
                const idx = inventory.findIndex(i => i.id === itemId);
                if (idx >= 0) {
                    inventory.splice(idx, 1);
                }
            }
            
            // 显示效果提示
            this.showEffectMessage(result.message);
            
            // 更新UI
            if (Game.state.battleState && Game.state.battleState.active) {
                Battle.updatePartyPanel();
            }
            
            // 关闭窗口
            this.closeItemPopup();
        } else {
            this.showEffectMessage(result.message);
        }
    },

    // 执行道具效果
    executeItemEffect(effect) {
        const party = Game.state.party;
        
        switch (effect.type) {
            case 'heal_hp':
                // 选择HP最低的存活角色
                const healTarget = party
                    .filter(c => c.stats.HP > 0)
                    .sort((a, b) => (a.stats.HP / a.maxStats.HP) - (b.stats.HP / b.maxStats.HP))[0];
                
                if (healTarget) {
                    const healAmount = Math.min(effect.value, healTarget.maxStats.HP - healTarget.stats.HP);
                    healTarget.stats.HP += healAmount;
                    return {
                        success: true,
                        message: `${healTarget.name} 恢复了 ${healAmount} HP！`
                    };
                }
                return { success: false, message: '没有可以恢复的角色' };
                
            case 'heal_tp':
                const tpTarget = party
                    .filter(c => c.stats.HP > 0)
                    .sort((a, b) => (a.stats.TP / a.maxStats.TP) - (b.stats.TP / b.maxStats.TP))[0];
                
                if (tpTarget) {
                    const healAmount = Math.min(effect.value, tpTarget.maxStats.TP - tpTarget.stats.TP);
                    tpTarget.stats.TP += healAmount;
                    return {
                        success: true,
                        message: `${tpTarget.name} 恢复了 ${healAmount} TP！`
                    };
                }
                return { success: false, message: '没有可以恢复的角色' };
                
            case 'full_restore':
                party.forEach(c => {
                    if (c.stats.HP > 0) {
                        c.stats.HP = c.maxStats.HP;
                        c.stats.TP = c.maxStats.TP;
                    }
                });
                return {
                    success: true,
                    message: '全体角色完全恢复！'
                };
                
            case 'cure_poison':
                const poisonTarget = party.find(c => 
                    c.stats.HP > 0 && 
                    c.statusEffects && 
                    c.statusEffects.some(s => s.type === 'poison')
                );
                
                if (poisonTarget) {
                    poisonTarget.statusEffects = poisonTarget.statusEffects.filter(s => s.type !== 'poison');
                    return {
                        success: true,
                        message: `${poisonTarget.name} 的中毒状态已解除！`
                    };
                }
                return { success: false, message: '没有中毒的角色' };
                
            default:
                return { success: false, message: '未知道具效果' };
        }
    },

    // 显示效果提示
    showEffectMessage(message) {
        const aiText = document.getElementById('ai-decision-text');
        if (aiText) {
            aiText.textContent = message;
            aiText.classList.add('visible');
            setTimeout(() => {
                aiText.classList.remove('visible');
            }, 2000);
        }
    },

    // 暂停ATB
    pauseATB() {
        this.isPaused = true;
        console.log('[ItemQuickUse] ATB已暂停');
        
        // 通知战斗系统暂停
        if (Battle && Battle.isBattleActive) {
            Battle.isPaused = true;
        }
    },

    // 恢复ATB
    resumeATB() {
        this.isPaused = false;
        console.log('[ItemQuickUse] ATB已恢复');
        
        // 通知战斗系统恢复
        if (Battle && Battle.isBattleActive) {
            Battle.isPaused = false;
        }
    },

    // 键盘事件处理
    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.closeItemPopup();
        }
    },

    // 检查是否有可用道具
    hasUsableItems() {
        const inventory = Game.state.inventory || [];
        return inventory.some(item => item.count > 0);
    }
};

export default ItemQuickUse;
