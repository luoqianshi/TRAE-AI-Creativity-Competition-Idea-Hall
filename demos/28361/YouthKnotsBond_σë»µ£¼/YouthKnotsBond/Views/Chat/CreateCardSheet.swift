import SwiftUI

struct CreateCardSheet: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var cardVM: CardViewModel
    @EnvironmentObject var tagVM: TagViewModel
    
    let conversationId: Int
    let coreRecord: String
    let suggestedTags: [String]
    
    @State private var coreDescription: String
    @State private var additionalNotes = ""
    @State private var selectedTagIds: Set<Int> = []
    @State private var showAlert = false
    @State private var alertMessage = ""
    
    init(conversationId: Int, coreRecord: String, suggestedTags: [String]) {
        self.conversationId = conversationId
        self.coreRecord = coreRecord
        self.suggestedTags = suggestedTags
        _coreDescription = State(initialValue: coreRecord)
    }
    
    var body: some View {
        NavigationView {
            Form {
                // 核心问题描述
                Section {
                    TextEditor(text: $coreDescription)
                        .frame(minHeight: 100)
                } header: {
                    Text("核心问题描述")
                } footer: {
                    Text("简要描述孩子的问题，不超过500字")
                }
                
                // 建议标签
                if !suggestedTags.isEmpty {
                    Section("AI建议标签") {
                        ForEach(tagVM.presetTags.filter { tag in
                            suggestedTags.contains(tag.tagName)
                        }) { tag in
                            tagRow(tag)
                        }
                    }
                }
                
                // 所有预设标签
                Section("选择标签") {
                    ForEach(tagVM.presetTags) { tag in
                        tagRow(tag)
                    }
                }
                
                // 补充信息
                Section {
                    TextEditor(text: $additionalNotes)
                        .frame(minHeight: 80)
                } header: {
                    Text("补充信息（可选）")
                } footer: {
                    Text("可以添加孩子的年龄、具体情况等补充信息")
                }
            }
            .navigationTitle("创建问题卡片")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("保存") {
                        saveCard()
                    }
                    .disabled(coreDescription.isEmpty || selectedTagIds.isEmpty)
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
        }
    }
    
    // MARK: - 标签行
    private func tagRow(_ tag: Tag) -> some View {
        Button(action: {
            if selectedTagIds.contains(tag.id) {
                selectedTagIds.remove(tag.id)
            } else {
                selectedTagIds.insert(tag.id)
            }
        }) {
            HStack {
                Text(tag.tagName)
                    .foregroundColor(.primary)
                
                Spacer()
                
                if selectedTagIds.contains(tag.id) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.pink)
                } else {
                    Image(systemName: "circle")
                        .foregroundColor(.gray)
                }
            }
        }
    }
    
    // MARK: - 保存卡片
    private func saveCard() {
        Task {
            let success = await cardVM.createCard(
                conversationId: conversationId,
                coreDescription: coreDescription,
                tagIds: Array(selectedTagIds),
                additionalNotes: additionalNotes.isEmpty ? nil : additionalNotes
            )
            
            if success {
                alertMessage = "问题卡片创建成功！"
                showAlert = true
            } else {
                alertMessage = cardVM.errorMessage ?? "创建失败"
                showAlert = true
            }
        }
    }
}
