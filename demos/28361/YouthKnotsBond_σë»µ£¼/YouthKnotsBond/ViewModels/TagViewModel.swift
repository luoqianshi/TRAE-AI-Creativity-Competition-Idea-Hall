import Foundation
import Combine

@MainActor
class TagViewModel: ObservableObject {
    @Published var allTags: [Tag] = []
    @Published var presetTags: [Tag] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let tagService = TagService.shared
    
    // MARK: - 加载所有标签
    func loadAllTags() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let tags = try await tagService.getAllTags()
            allTags = tags
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - 加载预设标签
    func loadPresetTags() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let tags = try await tagService.getPresetTags()
            presetTags = tags
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - 创建自定义标签
    func createTag(tagName: String) async -> Tag? {
        isLoading = true
        errorMessage = nil
        
        do {
            let tag = try await tagService.createTag(tagName: tagName)
            allTags.append(tag)
            isLoading = false
            return tag
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return nil
        }
    }
}
