import StoreKit
import Foundation
import Combine

@MainActor
class StoreKitManager: NSObject, ObservableObject {
    static let shared = StoreKitManager()
    
    @Published var products: [SKProduct] = []
    @Published var isPurchasing = false
    @Published var transactionState: SKPaymentTransactionState?
    
    private var productRequest: SKProductsRequest?
    private var purchaseCompletion: ((Bool, String?) -> Void)?
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
    func purchase(productID: String, orderNo: String, completion: @escaping (Bool, String?) -> Void) {
        guard let product = products.first(where: { $0.productIdentifier == productID }) else {
            completion(false, "产品不存在")
            return
        }
        
        guard SKPaymentQueue.canMakePayments() else {
            completion(false, "设备不支持内购")
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
        self.products = response.products
        print("✅ 加载到 \(response.products.count) 个产品")
        
        for product in response.products {
            print("产品: \(product.localizedTitle) - \(product.priceLocale.currencySymbol ?? "")\(product.price)")
        }
        
        if !response.invalidProductIdentifiers.isEmpty {
            print("❌ 无效产品ID: \(response.invalidProductIdentifiers)")
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
                    
                    self.isPurchasing = false
                    self.purchaseCompletion?(true, nil)
                    self.purchaseCompletion = nil
                    self.currentOrderNo = nil
                    
                    SKPaymentQueue.default().finishTransaction(transaction)
                } catch {
                    self.isPurchasing = false
                    self.purchaseCompletion?(false, error.localizedDescription)
                    self.purchaseCompletion = nil
                    
                    SKPaymentQueue.default().finishTransaction(transaction)
                }
            }
        } else {
            self.isPurchasing = false
            self.purchaseCompletion?(false, "无法获取收据")
            self.purchaseCompletion = nil
            SKPaymentQueue.default().finishTransaction(transaction)
        }
    }
    
    private func handleFailed(_ transaction: SKPaymentTransaction) {
        let error = transaction.error as? SKError
        var message = "购买失败"
        
        if let error = error {
            switch error.code {
            case .paymentCancelled:
                message = "购买已取消"
            case .paymentInvalid:
                message = "购买无效"
            case .paymentNotAllowed:
                message = "不允许购买"
            default:
                message = error.localizedDescription
            }
        }
        
        self.isPurchasing = false
        self.purchaseCompletion?(false, message)
        self.purchaseCompletion = nil
        self.currentOrderNo = nil
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    private func handleRestored(_ transaction: SKPaymentTransaction) {
        SKPaymentQueue.default().finishTransaction(transaction)
    }
}
