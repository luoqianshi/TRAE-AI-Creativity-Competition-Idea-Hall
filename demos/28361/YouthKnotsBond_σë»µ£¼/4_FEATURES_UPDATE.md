# 4个功能更新总结

## 1️⃣ 月度套餐购买逻辑修复

### 问题
- 购买2次月度套餐后，次数没有累加（应该是100次，实际只有50次）
- 到期时间没有顺延（应该是60天后，实际只有30天后）

### 原因
后端支付回调逻辑使用的是**覆盖**而不是**累加**：
```javascript
// 错误的逻辑
await connection.query(
  'UPDATE users SET package_remaining_count = ? WHERE id = ?',
  [order.count, order.user_id]  // 直接设置为50，而不是累加
);
```

### 解决方案
**文件**：`backend/src/controllers/paymentController.js`

```javascript
// 正确的逻辑
// 1. 获取当前次数和到期时间
const [currentUser] = await connection.query(
  'SELECT package_remaining_count, package_expire_time FROM users WHERE id = ?',
  [order.user_id]
);

// 2. 累加次数
const currentCount = currentUser[0].package_remaining_count || 0;
const newCount = currentCount + order.count;  // 50 + 50 = 100

// 3. 计算新的到期时间
let newExpireTime;
const currentExpireTime = currentUser[0].package_expire_time;

if (currentExpireTime && new Date(currentExpireTime) > new Date()) {
  // 如果当前套餐未过期，在原有基础上延长30天
  newExpireTime = new Date(currentExpireTime);
  newExpireTime.setDate(newExpireTime.getDate() + 30);
} else {
  // 如果已过期或没有套餐，从现在开始计算30天
  newExpireTime = new Date();
  newExpireTime.setDate(newExpireTime.getDate() + 30);
}

// 4. 更新数据库
await connection.query(
  'UPDATE users SET package_remaining_count = ?, package_expire_time = ? WHERE id = ?',
  [newCount, newExpireTime, order.user_id]
);
```

### 测试步骤
1. 购买第1次月度套餐
   - 次数：50
   - 到期：2026-04-08（30天后）

2. 购买第2次月度套餐
   - 次数：100（50 + 50）✅
   - 到期：2026-05-08（60天后）✅

---

## 2️⃣ 网络权限优化

### 问题
- 用户输入手机号和验证码后，才弹出网络权限选择
- 导致登录失败，显示"似乎已经断开与互联网的连接"

### 原因
iOS系统在**首次网络请求**时才会弹出权限提示，而登录接口是第一次网络请求。

### 解决方案
**文件**：`YouthKnotsBond/YouthKnotsBondApp.swift`

在App启动时立即发起一个网络请求，触发系统权限弹窗：

```swift
init() {
    // 在App启动时立即触发网络权限请求
    triggerNetworkPermission()
}

private func triggerNetworkPermission() {
    Task {
        guard let url = URL(string: "https://youthknotsbond.qingguoguang.com/api/health") else { return }
        
        var request = URLRequest(url: url)
        request.timeoutInterval = 5
        
        do {
            let _ = try await URLSession.shared.data(for: request)
            print("✅ 网络权限已授予")
        } catch {
            print("⚠️ 网络请求失败（可能是权限问题）")
        }
    }
}
```

### 效果
- 用户打开App → 立即弹出网络权限选择
- 用户选择"允许" → 后续所有网络请求正常
- 避免在登录时才弹出，导致登录失败

---

## 3️⃣ 欢迎语显示优化

### 问题
- 欢迎语显示不完整，有删除符号（...）

### 原因
- 外层使用了 `HStack`，导致文本被压缩
- 没有使用 `fixedSize` 确保文本完整显示

### 解决方案
**文件**：`YouthKnotsBond/Views/Chat/ChatView.swift`

```swift
// 修改前
var welcomeMessage: some View {
    HStack {  // ❌ 外层HStack会压缩内容
        VStack(alignment: .leading, spacing: 12) {
            Text("家长您好呀~我是解铃契...")
                .font(.body)
        }
        Spacer()
    }
}

// 修改后
var welcomeMessage: some View {
    VStack(alignment: .leading, spacing: 12) {  // ✅ 直接使用VStack
        Text("家长您好呀~我是解铃契，专门帮你一起理解孩子的小情绪~有什么育儿困惑都可以跟我说~")
            .font(.body)
            .fixedSize(horizontal: false, vertical: true)  // ✅ 确保文本完整显示
    }
    .padding()
    .background(Color(.systemGray6))
    .cornerRadius(16)
}
```

### 效果
- 欢迎语完整显示，不再被截断
- 预设问题也完整显示

---

## 4️⃣ 卡片删除功能

### 后端实现

#### 1. 添加删除方法
**文件**：`backend/src/controllers/cardController.js`

```javascript
exports.deleteCard = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userId = req.userId;
    const { cardId } = req.params;
    
    // 验证卡片所有权
    const [cards] = await connection.query(
      'SELECT * FROM problem_cards WHERE id = ? AND user_id = ?',
      [cardId, userId]
    );
    
    if (cards.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '卡片不存在或无权删除'
      });
    }
    
    // 删除卡片（会自动删除关联的标签，因为设置了 ON DELETE CASCADE）
    await connection.query(
      'DELETE FROM problem_cards WHERE id = ?',
      [cardId]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  } finally {
    connection.release();
  }
};
```

#### 2. 添加路由
**文件**：`backend/src/routes/card.js`

```javascript
// 删除卡片
router.delete('/:cardId', authMiddleware, cardController.deleteCard);
```

### iOS端实现

#### 1. CardService 添加方法
**文件**：`YouthKnotsBond/Services/CardService.swift`

```swift
func deleteCard(cardId: Int) async throws {
    let _: APIResponse<EmptyData> = try await api.request(
        endpoint: "/cards/\(cardId)",
        method: "DELETE"
    )
}
```

#### 2. CardViewModel 添加方法
**文件**：`YouthKnotsBond/ViewModels/CardViewModel.swift`

```swift
func deleteCard(cardId: Int) async -> Bool {
    do {
        try await cardService.deleteCard(cardId: cardId)
        
        // 从列表中移除
        cards.removeAll { $0.id == cardId }
        
        return true
    } catch {
        errorMessage = error.localizedDescription
        return false
    }
}
```

#### 3. CardListView 添加滑动删除
**文件**：`YouthKnotsBond/Views/Card/CardListView.swift`

```swift
ForEach(cardVM.cards) { card in
    CardRowView(card: card)
        .onTapGesture {
            selectedCard = card
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive) {
                deleteCard(card)
            } label: {
                Label("删除", systemImage: "trash")
            }
        }
}

private func deleteCard(_ card: ProblemCard) {
    Task {
        let success = await cardVM.deleteCard(cardId: card.id)
        if !success {
            print("删除失败: \(cardVM.errorMessage ?? "")")
        }
    }
}
```

### 数据库级联删除

由于数据库设置了 `ON DELETE CASCADE`，删除卡片时会自动删除：
- `card_tags` 表中的关联标签
- 时间轴中的记录（因为时间轴读取的就是 `problem_cards` 表）

```sql
-- schema.sql 中的设置
FOREIGN KEY (card_id) REFERENCES problem_cards(id) ON DELETE CASCADE
```

### 使用方式
1. 进入"卡片"页面
2. 在任意卡片上**向左滑动**
3. 点击红色"删除"按钮
4. 卡片立即从列表中消失
5. 时间轴中的对应记录也会消失

---

## 🚀 部署步骤

### 1. 运行部署脚本
```bash
cd /Users/macbook/Desktop/YouthKnotsBond
bash deploy_4_features.sh
```

密码：`my_key`

### 2. iOS端构建
```
Command + Shift + K  (清理)
Command + B          (构建)
Command + R          (运行)
```

---

## 🧪 测试清单

### 测试1：月度套餐累加
- [ ] 购买第1次月度套餐
- [ ] 查看次数：50，到期时间：30天后
- [ ] 购买第2次月度套餐
- [ ] 查看次数：100，到期时间：60天后 ✅

### 测试2：网络权限
- [ ] 删除App重新安装
- [ ] 打开App
- [ ] 应该立即弹出网络权限选择 ✅
- [ ] 选择"允许"
- [ ] 登录应该正常 ✅

### 测试3：欢迎语
- [ ] 进入对话页面
- [ ] 查看欢迎语是否完整显示 ✅
- [ ] 预设问题是否完整显示 ✅

### 测试4：卡片删除
- [ ] 进入卡片页面
- [ ] 在卡片上向左滑动
- [ ] 点击"删除"按钮
- [ ] 卡片立即消失 ✅
- [ ] 进入时间轴，对应记录也消失 ✅

---

**更新时间**：2026年3月9日
**状态**：✅ 已完成
