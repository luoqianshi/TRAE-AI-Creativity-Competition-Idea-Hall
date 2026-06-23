import Foundation
import Combine

@MainActor
class ConversationViewModel: ObservableObject {
    @Published var conversations: [Conversation] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentReply: String?
    @Published var suggestedTags: [String] = []
    @Published var coreRecord: String?
    @Published var lastConversationId: Int?
    
    private let conversationService = ConversationService.shared
    
    // MARK: - 发起对话
    func sendMessage(_ message: String, sessionId: String = "default") async {
        guard message.count <= 300 else {
            errorMessage = "输入内容不能超过300字"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await conversationService.chat(message: message, sessionId: sessionId)
            
            // 更新UI
            currentReply = response.reply
            coreRecord = response.coreRecord
            suggestedTags = response.suggestedTags
            lastConversationId = response.conversationId
            
            // 刷新对话历史
            await loadHistory(sessionId: sessionId)
            
        } catch let error as NetworkError {
            if case .serverError(let message, _) = error {
                errorMessage = message
            } else {
                errorMessage = error.localizedDescription
            }
        } catch {
            errorMessage = "发送失败，请重试"
        }
        
        isLoading = false
    }
    
    // MARK: - 加载对话历史
    func loadHistory(sessionId: String = "default", page: Int = 1) async {
        do {
            let history = try await conversationService.getHistory(
                sessionId: sessionId,
                page: page
            )
            conversations = history.conversations
        } catch {
            errorMessage = "加载历史失败"
        }
    }
    
    // MARK: - 清空当前回复
    func clearCurrentReply() {
        currentReply = nil
        coreRecord = nil
        suggestedTags = []
        lastConversationId = nil
    }
}
