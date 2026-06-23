import Foundation
import Combine

@MainActor
class CardViewModel: ObservableObject {
    @Published var cards: [ProblemCard] = []
    @Published var selectedCard: ProblemCard?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentPage = 1
    @Published var hasMorePages = true
    
    private let cardService = CardService.shared
    private let pageSize = 20
    
    // MARK: - 创建问题卡片
    func createCard(
        conversationId: Int,
        coreDescription: String,
        tagIds: [Int],
        additionalNotes: String? = nil
    ) async -> Bool {
        isLoading = true
        errorMessage = nil
        
        do {
            let card = try await cardService.createCard(
                conversationId: conversationId,
                coreDescription: coreDescription,
                tagIds: tagIds,
                additionalNotes: additionalNotes
            )
            
            // 添加到列表开头
            cards.insert(card, at: 0)
            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }
    
    // MARK: - 加载卡片列表
    func loadCards(tagId: Int? = nil, refresh: Bool = false) async {
        if refresh {
            currentPage = 1
            cards = []
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await cardService.getCards(
                tagId: tagId,
                page: currentPage,
                pageSize: pageSize
            )
            
            if refresh {
                cards = response.cards
            } else {
                cards.append(contentsOf: response.cards)
            }
            
            hasMorePages = response.pagination.page * response.pagination.pageSize < response.pagination.total
            currentPage += 1
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - 更新卡片（补充信息）
    func updateCard(cardId: Int, additionalNotes: String) async -> Bool {
        isLoading = true
        errorMessage = nil
        
        do {
            let updatedCard = try await cardService.updateCard(
                cardId: cardId,
                additionalNotes: additionalNotes
            )
            
            // 更新列表中的卡片
            if let index = cards.firstIndex(where: { $0.id == cardId }) {
                cards[index] = updatedCard
            }
            
            selectedCard = updatedCard
            isLoading = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return false
        }
    }
    
    // MARK: - 添加标签
    func addTag(cardId: Int, tagId: Int) async -> Bool {
        do {
            let updatedCard = try await cardService.addTag(cardId: cardId, tagId: tagId)
            
            if let index = cards.firstIndex(where: { $0.id == cardId }) {
                cards[index] = updatedCard
            }
            
            selectedCard = updatedCard
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
    
    // MARK: - 删除标签
    func removeTag(cardId: Int, tagId: Int) async -> Bool {
        do {
            let updatedCard = try await cardService.removeTag(cardId: cardId, tagId: tagId)
            
            if let index = cards.firstIndex(where: { $0.id == cardId }) {
                cards[index] = updatedCard
            }
            
            selectedCard = updatedCard
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
    
    // MARK: - 加载卡片详情
    func loadCardDetail(cardId: Int) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let card = try await cardService.getCardDetail(cardId: cardId)
            selectedCard = card
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - 删除卡片
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
}
