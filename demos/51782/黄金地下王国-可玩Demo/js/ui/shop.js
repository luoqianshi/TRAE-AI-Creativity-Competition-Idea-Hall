// ============================================================
// Shop - ui/shop.js
// 自动从 game.js 拆分
// ============================================================

const Shop = {
    currentTab: 'items',
    selectedItem: null,

    open() {
        Game.showScreen('shop-screen');
        this.switchTab('items');
        this.updateGold();
    },

    switchTab(tab) {
        this.currentTab = tab;
        this.selectedItem = null;

        // 更新标签样式
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.includes(
                tab === 'items' ? '道具' : tab === 'weapons' ? '武器' : '防具'
            ));
        });

        this.renderItems();
    },

    renderItems() {
        const container = document.getElementById('shop-items');
        const items = GameData.shopItems[this.currentTab];
        let html = '';

        items.forEach((item, i) => {
            const canBuy = Game.state.gold >= item.price;
            html += `<div class="shop-item ${this.selectedItem === i ? 'selected' : ''}" onclick="Shop.selectItem(${i})">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.desc}</div>
                <div class="item-price">${item.price}G ${item.classReq ? '(' + GameData.classes[item.classReq].name + '专用)' : ''}</div>
            </div>`;
        });

        container.innerHTML = html;
    },

    selectItem(index) {
        this.selectedItem = index;
        this.renderItems();
    },

    buy() {
        if (this.selectedItem === null) {
            Dialog.show('请先选择要购买的物品。');
            return;
        }

        const item = GameData.shopItems[this.currentTab][this.selectedItem];

        if (Game.state.gold < item.price) {
            Dialog.show('金币不足！');
            return;
        }

        if (item.effect.type === 'equip') {
            // 装备直接装备到对应职业的角色
            const targetChar = Game.state.party.find(c => c.classId === item.classReq);
            if (!targetChar) {
                Dialog.show('队伍中没有可以使用该装备的职业！');
                return;
            }
            Game.state.gold -= item.price;
            targetChar.equipment[item.effect.slot] = item.id;
            if (item.effect.stat) {
                targetChar.bonusStats[item.effect.stat] = (targetChar.bonusStats[item.effect.stat] || 0) + item.effect.value;
            }
            Dialog.show(`购买了 ${item.name} 并装备给 ${targetChar.name}！`);
        } else {
            // 消耗品加入背包
            Game.state.gold -= item.price;
            const existing = Game.state.inventory.find(i => i.id === item.id);
            if (existing) {
                existing.count++;
            } else {
                Game.state.inventory.push({ id: item.id, name: item.name, count: 1 });
            }
            Dialog.show(`购买了 ${item.name}！`);
        }

        this.updateGold();
        this.selectedItem = null;
        this.renderItems();
    },

    sell() {
        if (Game.state.inventory.length === 0) {
            Dialog.show('没有可出售的道具。');
            return;
        }

        let html = '<h3 style="color:#e0c880;margin-bottom:10px">出售道具</h3>';
        Game.state.inventory.forEach((item, i) => {
            const itemData = Battle.findItemData(item.id);
            const sellPrice = itemData ? Math.floor(itemData.price / 2) : 10;
            html += `<div class="shop-item" onclick="Shop.sellItem(${i})" style="cursor:pointer">
                <div class="item-name">${item.name} x${item.count}</div>
                <div class="item-price">售价: ${sellPrice}G</div>
            </div>`;
        });

        Dialog.show(html);
    },

    sellItem(index) {
        const item = Game.state.inventory[index];
        const itemData = Battle.findItemData(item.id);
        const sellPrice = itemData ? Math.floor(itemData.price / 2) : 10;

        item.count--;
        Game.state.gold += sellPrice;

        if (item.count <= 0) {
            Game.state.inventory.splice(index, 1);
        }

        Dialog.close();
        this.updateGold();
        Dialog.show(`出售了 ${item.name}，获得 ${sellPrice}G！`);
    },

    leave() {
        Game.showScreen('town-screen');
        Town.update();
    },

    updateGold() {
        const el = document.getElementById('shop-gold');
        if (el) el.textContent = Game.state.gold;
    }
};

export default Shop;
