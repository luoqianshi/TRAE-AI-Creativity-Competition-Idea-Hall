import Foundation

// MARK: - 用户模型
struct User: Codable, Identifiable {
    let id: Int
    let phone: String
    var nickname: String?
    var totalUsageCount: Int
    var packageExpireTime: Date?
    var packageRemainingCount: Int
    var singleRemainingCount: Int
    var isFirstTime: Bool
    let createdAt: Date
    
    // 计算总剩余次数
    var remainingCount: Int {
        return packageRemainingCount + singleRemainingCount
    }
    
    // 套餐是否过期
    var isPackageExpired: Bool {
        guard let expireTime = packageExpireTime else { return true }
        return expireTime < Date()
    }
    
    enum CodingKeys: String, CodingKey {
        case id, phone, nickname
        case totalUsageCount = "total_usage_count"
        case packageExpireTime = "package_expire_time"
        case packageRemainingCount = "package_remaining_count"
        case singleRemainingCount = "single_remaining_count"
        case isFirstTime = "is_first_time"
        case createdAt = "created_at"
    }
    
    // 自定义解码，处理数字转布尔值
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(Int.self, forKey: .id)
        phone = try container.decode(String.self, forKey: .phone)
        nickname = try container.decodeIfPresent(String.self, forKey: .nickname)
        totalUsageCount = try container.decode(Int.self, forKey: .totalUsageCount)
        packageExpireTime = try container.decodeIfPresent(Date.self, forKey: .packageExpireTime)
        packageRemainingCount = try container.decode(Int.self, forKey: .packageRemainingCount)
        singleRemainingCount = try container.decode(Int.self, forKey: .singleRemainingCount)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        
        // 处理 is_first_time: 可能是 Bool 或 Int
        if let boolValue = try? container.decode(Bool.self, forKey: .isFirstTime) {
            isFirstTime = boolValue
        } else if let intValue = try? container.decode(Int.self, forKey: .isFirstTime) {
            isFirstTime = intValue != 0
        } else {
            isFirstTime = false
        }
    }
}

// MARK: - 对话模型
struct Conversation: Codable, Identifiable {
    let id: Int
    let userId: Int
    let userInput: String
    let agentReply: String
    let coreRecord: String?
    let sessionId: String?
    let isArchived: Bool
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case userInput = "user_input"
        case agentReply = "agent_reply"
        case coreRecord = "core_record"
        case sessionId = "session_id"
        case isArchived = "is_archived"
        case createdAt = "created_at"
    }
    
    // 自定义解码，处理数字转布尔值
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(Int.self, forKey: .id)
        userId = try container.decode(Int.self, forKey: .userId)
        userInput = try container.decode(String.self, forKey: .userInput)
        agentReply = try container.decode(String.self, forKey: .agentReply)
        coreRecord = try container.decodeIfPresent(String.self, forKey: .coreRecord)
        sessionId = try container.decodeIfPresent(String.self, forKey: .sessionId)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        
        // 处理 is_archived: 可能是 Bool 或 Int
        if let boolValue = try? container.decode(Bool.self, forKey: .isArchived) {
            isArchived = boolValue
        } else if let intValue = try? container.decode(Int.self, forKey: .isArchived) {
            isArchived = intValue != 0
        } else {
            isArchived = false
        }
    }
}

// MARK: - 问题卡片模型
struct ProblemCard: Codable, Identifiable {
    let id: Int
    let userId: Int
    let conversationId: Int?
    let coreDescription: String
    let coreSummary: String?
    let keySuggestions: String?
    let userInputSnapshot: String?
    let agentReplySnapshot: String?
    var additionalNotes: String?
    var tags: [Tag]
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case conversationId = "conversation_id"
        case coreDescription = "core_description"
        case coreSummary = "core_summary"
        case keySuggestions = "key_suggestions"
        case userInputSnapshot = "user_input_snapshot"
        case agentReplySnapshot = "agent_reply_snapshot"
        case additionalNotes = "additional_notes"
        case tags
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - 标签模型
struct Tag: Codable, Identifiable {
    let id: Int
    let tagName: String
    let usageCount: Int
    let isPreset: Bool
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case tagName = "tag_name"
        case usageCount = "usage_count"
        case isPreset = "is_preset"
        case createdAt = "created_at"
    }
    
    // 自定义解码，处理数字转布尔值
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(Int.self, forKey: .id)
        tagName = try container.decode(String.self, forKey: .tagName)
        usageCount = try container.decode(Int.self, forKey: .usageCount)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        
        // 处理 is_preset: 可能是 Bool 或 Int
        if let boolValue = try? container.decode(Bool.self, forKey: .isPreset) {
            isPreset = boolValue
        } else if let intValue = try? container.decode(Int.self, forKey: .isPreset) {
            isPreset = intValue != 0
        } else {
            isPreset = false
        }
    }
}

// MARK: - 时间轴节点模型
struct TimelineNode: Codable, Identifiable {
    let id: Int
    let coreDescription: String
    let coreSummary: String?
    let keySuggestions: String?
    let userInputSnapshot: String?
    let agentReplySnapshot: String?
    let additionalNotes: String?
    let createdAt: Date
    let tags: [Tag]
    let nodeType: String
    let nodeColor: String
    let nodeLabel: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case coreDescription = "core_description"
        case coreSummary = "core_summary"
        case keySuggestions = "key_suggestions"
        case userInputSnapshot = "user_input_snapshot"
        case agentReplySnapshot = "agent_reply_snapshot"
        case additionalNotes = "additional_notes"
        case createdAt = "created_at"
        case tags, nodeType, nodeColor, nodeLabel
    }
}

// MARK: - 支付订单模型
struct PaymentOrder: Codable, Identifiable {
    let id: Int
    let userId: Int
    let orderNo: String
    let orderType: String
    let amount: Double
    let count: Int
    let appleTransactionId: String?
    let status: String
    let paidAt: Date?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case orderNo = "order_no"
        case orderType = "order_type"
        case amount, count
        case appleTransactionId = "apple_transaction_id"
        case status
        case paidAt = "paid_at"
        case createdAt = "created_at"
    }
    
    // 自定义解码，处理日期格式和数字类型
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(Int.self, forKey: .id)
        userId = try container.decode(Int.self, forKey: .userId)
        orderNo = try container.decode(String.self, forKey: .orderNo)
        orderType = try container.decode(String.self, forKey: .orderType)
        
        // 处理amount：可能是String或Double
        if let amountDouble = try? container.decode(Double.self, forKey: .amount) {
            amount = amountDouble
        } else if let amountString = try? container.decode(String.self, forKey: .amount) {
            amount = Double(amountString) ?? 0.0
        } else {
            amount = 0.0
        }
        
        count = try container.decode(Int.self, forKey: .count)
        appleTransactionId = try container.decodeIfPresent(String.self, forKey: .appleTransactionId)
        status = try container.decode(String.self, forKey: .status)
        
        // 解码日期
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        if let paidAtString = try container.decodeIfPresent(String.self, forKey: .paidAt) {
            paidAt = dateFormatter.date(from: paidAtString)
        } else {
            paidAt = nil
        }
        
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        createdAt = dateFormatter.date(from: createdAtString) ?? Date()
    }
}

// MARK: - 订单列表响应
struct OrderListResponse: Codable {
    let orders: [PaymentOrder]
    let pagination: Pagination
}

// MARK: - API响应模型
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let message: String?
    let code: String?
}

// MARK: - 登录响应
struct LoginResponse: Codable {
    let token: String
    let user: User
}

// MARK: - 对话响应
struct ChatResponse: Codable {
    let conversationId: Int
    let reply: String
    let coreRecord: String
    let suggestedTags: [String]
    let remainingCount: Int
    let packageRemainingCount: Int
    let singleRemainingCount: Int
    
    enum CodingKeys: String, CodingKey {
        case conversationId, reply, coreRecord, suggestedTags
        case remainingCount, packageRemainingCount, singleRemainingCount
    }
}

// MARK: - 对话历史响应
struct ConversationHistory: Codable {
    let conversations: [Conversation]
    let pagination: Pagination
}

// MARK: - 卡片列表响应
struct CardListResponse: Codable {
    let cards: [ProblemCard]
    let pagination: Pagination
}

// MARK: - 分页信息
struct Pagination: Codable {
    let page: Int
    let pageSize: Int
    let total: Int
}

// MARK: - 套餐信息
struct PackageInfo: Codable {
    let freeTrialCount: Int
    let package: PackageDetail
    let single: SingleDetail
}

struct PackageDetail: Codable {
    let price: Int
    let count: Int
    let validDays: Int
    let productId: String
}

struct SingleDetail: Codable {
    let price: Int
    let count: Int
    let productId: String
}

// MARK: - 创建订单响应
struct CreateOrderResponse: Codable {
    let orderId: Int
    let orderNo: String
    let orderType: String
    let amount: Double
    let count: Int
    let productId: String
}

// MARK: - 支付结果
struct PaymentResult: Codable {
    let packageRemainingCount: Int
    let singleRemainingCount: Int
    let packageExpireTime: Date?
}

// MARK: - 空数据
struct EmptyData: Codable {}


