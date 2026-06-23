import SwiftUI

struct PrivacyPolicyView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("隐私政策")
                        .font(.title)
                        .fontWeight(.bold)
                        .padding(.bottom, 10)
                    
                    Group {
                        sectionTitle("引言")
                        sectionContent("""
                        解铃契（以下简称"我们"）非常重视用户的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您仔细阅读本政策，以便更好地了解我们的隐私保护措施。
                        """)
                        
                        sectionTitle("一、我们收集的信息")
                        sectionContent("""
                        1. 账号信息：手机号、昵称
                        2. 使用信息：对话内容、问题记录、标签信息
                        3. 设备信息：设备型号、操作系统版本、唯一设备标识符
                        4. 日志信息：IP地址、访问时间、操作记录
                        5. 支付信息：订单号、支付时间、支付金额（不包含银行卡信息）
                        """)
                        
                        sectionTitle("二、信息的使用目的")
                        sectionContent("""
                        我们收集和使用您的个人信息用于以下目的：
                        1. 提供、维护和改进解铃契服务
                        2. 处理您的咨询请求，提供AI对话服务
                        3. 记录和追踪您的问题，生成时间轴
                        4. 处理支付和订单管理
                        5. 保障服务安全，防止欺诈行为
                        6. 遵守法律法规要求
                        """)
                        
                        sectionTitle("三、信息的存储")
                        sectionContent("""
                        1. 存储地点：您的个人信息将存储在中国境内的服务器上。
                        2. 存储期限：
                           - 账号信息：账号存续期间
                           - 对话记录：7天（未归档）或永久（已归档）
                           - 问题卡片：永久保存
                           - 支付记录：根据法律要求保存
                        3. 数据安全：我们采用加密技术和访问控制措施保护您的数据安全。
                        """)
                    }
                    
                    Group {
                        sectionTitle("四、信息的共享")
                        sectionContent("""
                        我们承诺不会出售您的个人信息。在以下情况下，我们可能会共享您的信息：
                        1. 获得您的明确同意
                        2. 根据法律法规要求
                        3. 与关联公司共享（仅限于提供服务所必需）
                        4. 与第三方服务提供商共享（如支付服务、云存储服务）
                        
                        我们会要求第三方服务提供商采取保密措施，保护您的个人信息安全。
                        """)
                        
                        sectionTitle("五、您的权利")
                        sectionContent("""
                        您对自己的个人信息享有以下权利：
                        1. 访问权：您可以随时查看您的个人信息
                        2. 更正权：您可以更正不准确的个人信息
                        3. 删除权：您可以要求删除您的个人信息
                        4. 撤回同意权：您可以撤回对个人信息处理的同意
                        5. 注销权：您可以注销账号
                        
                        如需行使上述权利，请联系我们：hanqi@qingguoguang.com
                        """)
                        
                        sectionTitle("六、未成年人保护")
                        sectionContent("""
                        解铃契主要面向家长用户。如果您是未成年人，请在监护人的陪同下使用我们的服务。我们不会主动收集未成年人的个人信息。
                        """)
                        
                        sectionTitle("七、第三方服务")
                        sectionContent("""
                        解铃契使用以下第三方服务：
                        1. 阿里云：提供AI对话服务和短信服务
                        2. Apple支付：处理应用内购买
                        
                        这些第三方服务有各自的隐私政策，我们建议您仔细阅读。
                        """)
                        
                        sectionTitle("八、隐私政策的变更")
                        sectionContent("""
                        我们可能会不时更新本隐私政策。更新后的政策将在应用内公布，并在您继续使用服务时生效。重大变更时，我们会通过显著方式通知您。
                        """)
                        
                        sectionTitle("九、联系我们")
                        sectionContent("""
                        如您对本隐私政策有任何疑问、意见或建议，请通过以下方式联系我们：
                        
                        邮箱：hanqi@qingguoguang.com
                        
                        我们将在15个工作日内回复您的请求。
                        """)
                        
                        Text("生效日期：2026年3月7日")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding(.top, 20)
                    }
                }
                .padding()
            }
            .navigationTitle("隐私政策")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("关闭") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func sectionTitle(_ title: String) -> some View {
        Text(title)
            .font(.headline)
            .padding(.top, 10)
    }
    
    private func sectionContent(_ content: String) -> some View {
        Text(content)
            .font(.body)
            .foregroundColor(.secondary)
            .fixedSize(horizontal: false, vertical: true)
    }
}
