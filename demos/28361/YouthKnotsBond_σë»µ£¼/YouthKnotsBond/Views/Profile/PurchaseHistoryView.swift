import SwiftUI

struct PurchaseHistoryView: View {
    @Environment(\.dismiss) var dismiss
    @State private var orders: [PaymentOrder] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            Group {
                if isLoading {
                    ProgressView("加载中...")
                } else if let error = errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 50))
                            .foregroundColor(.orange)
                        Text(error)
                            .foregroundColor(.secondary)
                        Button("重试") {
                            loadOrders()
                        }
                        .buttonStyle(.bordered)
                    }
                } else if orders.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "cart")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)
                        Text("暂无购买记录")
                            .foregroundColor(.secondary)
                    }
                } else {
                    List(orders) { order in
                        OrderRow(order: order)
                    }
                }
            }
            .navigationTitle("购买记录")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("关闭") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                loadOrders()
            }
        }
    }
    
    private func loadOrders() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let response = try await PaymentService.shared.getOrders()
                orders = response.orders  // 修复：从response中取出orders数组
            } catch {
                errorMessage = "加载失败：\(error.localizedDescription)"
            }
            isLoading = false
        }
    }
}

struct OrderRow: View {
    let order: PaymentOrder
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 订单类型和状态
            HStack {
                Text(orderTypeText)
                    .font(.headline)
                
                Spacer()
                
                Text(statusText)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(statusColor.opacity(0.2))
                    .foregroundColor(statusColor)
                    .cornerRadius(8)
            }
            
            // 订单信息
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("订单号:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(order.orderNo)
                        .font(.caption)
                        .foregroundColor(.primary)
                }
                
                HStack {
                    Text("购买数量:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(order.count)次")
                        .font(.caption)
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    Text("金额:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("¥\(String(format: "%.2f", order.amount))")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.pink)
                }
                
                HStack {
                    Text("创建时间:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(order.createdAt, style: .date)
                        .font(.caption)
                        .foregroundColor(.primary)
                    Text(order.createdAt, style: .time)
                        .font(.caption)
                        .foregroundColor(.primary)
                }
                
                if let paidAt = order.paidAt {
                    HStack {
                        Text("支付时间:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(paidAt, style: .date)
                            .font(.caption)
                            .foregroundColor(.primary)
                        Text(paidAt, style: .time)
                            .font(.caption)
                            .foregroundColor(.primary)
                    }
                }
            }
        }
        .padding(.vertical, 8)
    }
    
    private var orderTypeText: String {
        switch order.orderType {
        case "package":
            return "月度套餐"
        case "single":
            return "9元10次购买"
        default:
            return "未知类型"
        }
    }
    
    private var statusText: String {
        switch order.status {
        case "paid":
            return "已支付"
        case "pending":
            return "待支付"
        case "cancelled":
            return "已取消"
        default:
            return order.status
        }
    }
    
    private var statusColor: Color {
        switch order.status {
        case "paid":
            return .green
        case "pending":
            return .orange
        case "cancelled":
            return .gray
        default:
            return .gray
        }
    }
}

#Preview {
    PurchaseHistoryView()
}
