# iOS 内购实现指南

## 📋 前置准备

### 1. App Store Connect 配置

#### 1.1 创建App ID
1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. 进入 "我的App" → 点击 "+" → "新建App"
3. 填写信息：
   - 平台：iOS
   - 名称：解铃契
   - 主要语言：简体中文
   - 套装ID：创建新的（如：com.qingguoguang.youthknotsbond）
   - SKU：YOUTHKNOTSBOND001

#### 1.2 创建内购项目
1. 进入你的App → "功能" → "App内购买项目"
2. 点击 "+" 创建内购项目

**月度套餐（消耗型）**：
- 类型：消耗型项目
- 产品ID：`com.youthknotsbond.package.monthly`
- 价格：¥29
- 显示名称：月度套餐
- 描述：30天内50次AI对话咨询

**9元10次购买（消耗型）**：
- 类型：消耗型项目
- 产品ID：`com.youthknotsbond.single`
- 价格：¥1
- 显示名称：9元10次购买
- 描述：1次AI对话咨询

#### 1.3 获取共享密钥
1. App Store Connect → "用户和访问" → "共享密钥"
2. 生成并保存密钥（用于收据验证）
3. 添加到后端 `.env`：
```
APPLE_SHARED_SECRET=你的共享密钥
```

### 2. Xcode 配置

#### 2.1 启用内购功能
1. 打开 Xcode 项目
2. 选择 Target → "Signing & Capabilities"
3. 点击 "+ Capability" → 添加 "In-App Purchase"

#### 2.2 配置 StoreKit Configuration（测试用）
1. File → New → File → StoreKit Configuration File
2. 命名为 `Products.storekit`
3. 添加测试产品：
```json
{
  "identifier": "com.youthknotsbond.package.monthly",
  "type": "Consumable",
  "price": "29.00",
  "localizations": [
    {
      "locale": "zh_CN",
      "title": "月度套餐",
      "description": "30天内50次AI对话咨询"
    }
  ]
}
```

## 💻 代码实现

### 1. 创建 StoreKit Manager

创建文件：`YouthKnotsBond/Services/StoreKitManager.swift`

```swift
import StoreKit
import Foundation

@MainActor
class StoreKitManager: NSObject, ObservableObject {
    static let shared = StoreKitManager()
    
    @Published var products: [SKProduct] = []
    @Published var isPurchasing = false
    @Published var transactionState: SKPaymentTransactionState?
    
    private var productRequest: SKProductsRequest?
    private var purchaseCompletion: ((Bool, String?, String?) -> Void)?
    private var currentOrderNo: String?
    
    private override init() {
        super.init()
        SKPaymentQueue.default().add(self)
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
    
    // MARK: - 加载产品
    func loadProducts() {
        let productIDs: Set<String> = [
            "com.youthknotsbond.package.monthly",
            "com.youthknotsbond.single"
        ]
        
        productRequest = SKProductsRequest(productIdentifiers: productIDs)
        productRequest?.delegate = self
        productRequest?.start()
    }
    
    // MARK: - 购买产品
    func purchase(productID: String, orderNo: String, completion: @escaping (Bool, String?, String?) -> Void) {
        guard let product = products.first(where: { $0.productIdentifier == productID }) else {
            completion(false, "产品不存在", nil)
            return
        }
        
        guard SKPaymentQueue.canMakePayments() else {
            completion(false, "设备不支持内购", nil)
            return
        }
        
        isPurchasing = true
        currentOrderNo = orderNo
        purchaseCompletion = completion
        
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }
    
    // MARK: - 恢复购买
    func restorePurchases() {
        SKPaymentQueue.default().restoreCompletedTransactions()
    }
}

// MARK: - SKProductsRequestDelegate
extension StoreKitManager: SKProductsRequestDelegate {
    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        DispatchQueue.main.async {
            self.products = response.products
            print("✅ 加载到 \(response.products.count) 个产品")
            
            if !response.invalidProductIdentifiers.isEmpty {
                print("❌ 无效产品ID: \(response.invalidProductIdentifiers)")
            }
        }
    }
    
    func request(_ request: SKRequest, didFailWithError error: Error) {
        print("❌ 产品请求失败: \(error.localizedDescription)")
    }
}

// MARK: - SKPaymentTransactionObserver
extension StoreKitManager: SKPaymentTransactionObserver {
    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchasing:
                print("⏳ 购买中...")
                
            case .purchased:
                print("✅ 购买成功")
                handlePurchased(transaction)
                
            case .failed:
                print("❌ 购买失败: \(transaction.error?.localizedDescription ?? "")")
                handleFailed(transaction)
                
            case .restored:
                print("🔄 恢复购买")
                handleRestored(transaction)
                
            case .deferred:
                print("⏸️ 购买延迟")
                
            @unknown default:
                break
            }
        }
    }
    
    private func handlePurchased(_ transaction: SKPaymentTransaction) {
        guard let orderNo = currentOrderNo else {
            SKPaymentQueue.default().finishTransaction(transaction)
            return
        }
        
        // 获取收据
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            let transactionId = transaction.transactionIdentifier ?? ""
            
            // 调用后端验证
            Task {
                do {
                    let _ = try await PaymentService.shared.applePaymentCallback(
                        orderNo: orderNo,
                        transactionId: transactionId,
                        receiptData: receiptString
                    )
                    
                    await MainActor.run {
                        self.isPurchasing = false
                        self.purchaseCompletion?(true, nil, transactionId)
                        self.purchaseCompletion = nil
                        self.currentOrderNo = nil
                    }
                    
                    SKPaymentQueue.default().finishTransaction(transaction)
                } catch {
                    await MainActor.run {
                        self.isPurchasing = false
                        self.purchaseCompletion?(false, error.localizedDescription, nil)
                        self.purchaseCompletion = nil
                    }
                    
                    SKPaymentQueue.default().finishTransaction(transaction)
                }
            }
        } else {
            isPurchasing = false
            purchaseCompletion?(false, "无法获取收据", nil)
            purchaseCompletion = nil
            SKPaymentQueue.default().finishTransaction(transaction)
        }
    }
    
    private func handleFailed(_ transaction: SKPaymentTransaction) {
        let error = transaction.error as? SKError
        let message = error?.localizedDescription ?? "购买失败"
        
        isPurchasing = false
        purchaseCompletion?(false, message, nil)
        purchaseCompletion = nil
        currentOrderNo = nil
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    private func handleRestored(_ transaction: SKPaymentTransaction) {
        SKPaymentQueue.default().finishTransaction(transaction)
    }
}
```

### 2. 更新 PurchaseView

替换 `YouthKnotsBond/Views/Payment/PurchaseView.swift` 中的 StoreKitManager 部分：

```swift
// 删除旧的 StoreKitManager 类定义
// 使用新的 StoreKitManager.shared
```

## 🧪 测试步骤

### 1. 沙盒测试

#### 1.1 创建沙盒测试账号
1. App Store Connect → "用户和访问" → "沙盒技术测试员"
2. 点击 "+" 创建测试账号
3. 填写信息（使用虚拟邮箱）

#### 1.2 在设备上测试
1. 在真机上运行App（模拟器不支持内购）
2. 设置 → App Store → 沙盒账户 → 登录测试账号
3. 在App中购买，会弹出沙盒环境提示
4. 确认购买（不会真实扣费）

### 2. 验证流程

1. 点击购买按钮
2. 弹出Apple支付确认框
3. 确认购买
4. 后端收到回调
5. 验证收据
6. 更新用户次数
7. 前端显示购买成功

## 📝 注意事项

1. **测试环境**：
   - 必须使用真机测试
   - 使用沙盒测试账号
   - 不会真实扣费

2. **生产环境**：
   - 需要App审核通过
   - 内购项目需要审核通过
   - 使用真实Apple ID购买

3. **收据验证**：
   - 沙盒环境：`https://sandbox.itunes.apple.com/verifyReceipt`
   - 生产环境：`https://buy.itunes.apple.com/verifyReceipt`

4. **常见问题**：
   - 产品加载失败：检查产品ID是否正确
   - 无法购买：检查是否启用内购功能
   - 收据验证失败：检查共享密钥是否正确

## 🚀 部署清单

- [ ] App Store Connect 创建App
- [ ] 创建内购项目（月度套餐、9元10次购买）
- [ ] 获取共享密钥
- [ ] Xcode 启用内购功能
- [ ] 实现 StoreKitManager
- [ ] 创建沙盒测试账号
- [ ] 真机测试购买流程
- [ ] 提交App审核
- [ ] 提交内购项目审核

---

**更新时间**：2026年3月8日
