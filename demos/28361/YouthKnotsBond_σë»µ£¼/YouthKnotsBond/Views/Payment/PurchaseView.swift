import SwiftUI
import StoreKit
import Combine

struct PurchaseView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var storeKit = StoreKitManager.shared
    
    @State private var selectedType: PurchaseType = .package
    @State private var singleCount = 1
    @State private var showAlert = false
    @State private var alertMessage = ""
    @State private var currentOrderNo = ""
    
    enum PurchaseType {
        case package
        case single
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // 当前剩余次数
                    remainingCountCard
                    
                    // 套餐选项
                    VStack(spacing: 16) {
                        // 月度套餐
                        PackageCard(
                            title: "月度套餐",
                            subtitle: "30天内50次对话",
                            price: "¥29",
                            originalPrice: "¥50",
                            badge: "推荐",
                            isSelected: selectedType == .package,
                            features: [
                                "50次AI对话咨询",
                                "30天有效期",
                                "优先使用套餐次数",
                                "过期未用次数清零"
                            ],
                            onTap: { selectedType = .package }
                        )
                        
                        // 9元10次购买
                        SinglePurchaseCard(
                            isSelected: selectedType == .single,
                            count: $singleCount,
                            onTap: { selectedType = .single }
                        )
                    }
                    
                    // 购买按钮
                    Button(action: purchase) {
                        if storeKit.isPurchasing {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Text("立即购买")
                                .font(.headline)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.pink)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                    .disabled(storeKit.isPurchasing)
                    
                    
                    
                    // 说明文字
                    purchaseNotice
                }
                .padding()
            }
            .navigationTitle("购买服务")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("关闭") {
                        dismiss()
                    }
                }
            }
            .alert("提示", isPresented: $showAlert) {
                Button("确定") {
                    if alertMessage.contains("成功") {
                        dismiss()
                    }
                }
            } message: {
                Text(alertMessage)
            }
            .onAppear {
                storeKit.loadProducts()
            }
        }
    }
    
    // MARK: - 剩余次数卡片
    private var remainingCountCard: some View {
        VStack(spacing: 12) {
            Text("当前剩余次数")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text("\(authViewModel.user?.remainingCount ?? 0)")
                .font(.system(size: 48, weight: .bold))
                .foregroundColor(.pink)
            
            if let user = authViewModel.user {
                HStack(spacing: 20) {
                    VStack {
                        Text("套餐")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(user.packageRemainingCount)")
                            .font(.title3)
                            .fontWeight(.semibold)
                    }
                    
                    Divider()
                        .frame(height: 30)
                    
                    VStack {
                        Text("9元10次")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(user.singleRemainingCount)")
                            .font(.title3)
                            .fontWeight(.semibold)
                    }
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }
    
    // MARK: - 购买说明
    private var purchaseNotice: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("购买说明：")
                .font(.caption)
                .fontWeight(.semibold)
            
            VStack(alignment: .leading, spacing: 4) {
                noticeRow("月度套餐：29元50次，30天有效期，过期未使用次数清零")
                noticeRow("9元10次：永久有效，不限时间，可多次购买，次数累加")
                noticeRow("优先使用套餐次数，套餐用完或过期后使用永久次数")
                noticeRow("购买即表示同意《服务协议》")
            }
        }
        .font(.caption)
        .foregroundColor(.secondary)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private func noticeRow(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 4) {
            Text("•")
            Text(text)
        }
    }
    
    // MARK: - 购买
    private func purchase() {
        Task {
            do {
                // 1. 创建订单（单次购买固定1组=9元10次）
                let orderType = selectedType == .package ? "package" : "single"
                let response = try await PaymentService.shared.createOrder(
                    orderType: orderType,
                    count: 1  // 固定1组，后端会转换为10次
                )
                
                currentOrderNo = response.orderNo
                
                // 2. 发起内购
                storeKit.purchase(
                    productID: response.productId,
                    orderNo: response.orderNo
                ) { success, error in
                    if success {
                        let msg = self.selectedType == .package ? "购买成功！已获得50次套餐服务" : "购买成功！已获得10次永久次数"
                        alertMessage = msg
                        showAlert = true
                        
                        // 刷新用户信息
                        Task {
                            try? await authViewModel.refreshUserInfo()
                        }
                    } else {
                        alertMessage = error ?? "购买失败"
                        showAlert = true
                    }
                }
            } catch {
                alertMessage = error.localizedDescription
                showAlert = true
            }
        }
    }
    
    
    
    // MARK: - 套餐卡片
    struct PackageCard: View {
        let title: String
        let subtitle: String
        let price: String
        let originalPrice: String
        let badge: String
        let isSelected: Bool
        let features: [String]
        let onTap: () -> Void
        
        var body: some View {
            VStack(alignment: .leading, spacing: 16) {
                // 标题和徽章
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(title)
                            .font(.headline)
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Text(badge)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.orange)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
                
                // 价格
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(price)
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.pink)
                    
                    Text(originalPrice)
                        .font(.caption)
                        .strikethrough()
                        .foregroundColor(.secondary)
                }
                
                // 特性列表
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(features, id: \.self) { feature in
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                                .font(.caption)
                            Text(feature)
                                .font(.caption)
                        }
                    }
                }
                
                if isSelected {
                    HStack {
                        Spacer()
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.pink)
                        Text("已选择")
                            .font(.caption)
                            .foregroundColor(.pink)
                    }
                }
            }
            .padding()
            .background(isSelected ? Color.pink.opacity(0.1) : Color(.systemBackground))
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? Color.pink : Color.clear, lineWidth: 2)
            )
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
            .onTapGesture(perform: onTap)
        }
    }
    
    // MARK: - 9元10次购买卡片
    struct SinglePurchaseCard: View {
        let isSelected: Bool
        @Binding var count: Int
        let onTap: () -> Void
        
        var body: some View {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("9元10次")
                            .font(.headline)
                        Text("永久有效，不限时间")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        HStack(alignment: .firstTextBaseline, spacing: 2) {
                            Text("¥9")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.pink)
                            Text("/10次")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                // 特性列表
                VStack(alignment: .leading, spacing: 8) {
                    ForEach([
                        "10次AI对话咨询",
                        "永久有效，不过期",
                        "套餐用完后自动使用",
                        "可多次购买，次数累加"
                    ], id: \.self) { feature in
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                                .font(.caption)
                            Text(feature)
                                .font(.caption)
                        }
                    }
                }
                
                if isSelected {
                    HStack {
                        Spacer()
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.pink)
                        Text("已选择")
                            .font(.caption)
                            .foregroundColor(.pink)
                    }
                }
            }
            .padding()
            .background(isSelected ? Color.pink.opacity(0.1) : Color(.systemBackground))
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? Color.pink : Color.clear, lineWidth: 2)
            )
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
            .onTapGesture(perform: onTap)
        }
    }
}
