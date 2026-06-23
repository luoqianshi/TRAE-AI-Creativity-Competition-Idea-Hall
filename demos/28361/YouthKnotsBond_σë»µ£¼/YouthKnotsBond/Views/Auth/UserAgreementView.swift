import SwiftUI

struct UserAgreementView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("用户协议")
                        .font(.title)
                        .fontWeight(.bold)
                        .padding(.bottom, 10)
                    
                    Group {
                        sectionTitle("一、协议的接受")
                        sectionContent("""
                        欢迎使用解铃契！本协议是您与解铃契（以下简称"我们"）之间关于您使用解铃契服务所订立的协议。请您仔细阅读本协议，您点击"同意"或使用解铃契服务，即表示您已充分理解并同意接受本协议的全部内容。
                        """)
                        
                        sectionTitle("二、服务说明")
                        sectionContent("""
                        1. 解铃契是一款专注于亲子沟通的育儿助手应用，通过AI智能助手为家长提供育儿咨询服务。
                        2. 我们提供的服务包括但不限于：AI对话咨询、问题记录、时间轴追踪等功能。
                        3. 我们有权根据业务发展需要，对服务内容进行调整、升级或终止。
                        """)
                        
                        sectionTitle("三、用户账号")
                        sectionContent("""
                        1. 您需要使用手机号注册并登录解铃契。
                        2. 您应妥善保管账号信息，对账号下的所有行为负责。
                        3. 如发现账号被盗用，请立即联系我们。
                        4. 禁止将账号转让、出售或出借给他人使用。
                        """)
                        
                        sectionTitle("四、使用规范")
                        sectionContent("""
                        您在使用解铃契服务时，应遵守以下规范：
                        1. 不得发布违法、违规、虚假、侵权或不良信息。
                        2. 不得利用服务从事危害国家安全、社会公共利益的行为。
                        3. 不得干扰或破坏服务的正常运行。
                        4. 不得利用技术手段恶意使用服务。
                        """)
                    }
                    
                    Group {
                        sectionTitle("五、付费服务")
                        sectionContent("""
                        1. 解铃契提供免费试用和付费服务。
                        2. 新用户可免费体验1次对话服务。
                        3. 付费套餐：29元/50次/30天，过期未使用次数将清零。
                        4. 9元10次购买：9元/10次，永久有效。
                        5. 付费服务一经购买，不支持退款（法律法规另有规定的除外）。
                        """)
                        
                        sectionTitle("六、知识产权")
                        sectionContent("""
                        1. 解铃契的所有内容（包括但不限于文字、图片、软件、程序等）的知识产权归我们所有。
                        2. 未经我们书面许可，您不得擅自使用、复制、修改、传播解铃契的任何内容。
                        3. 您在使用服务过程中产生的内容，授权我们用于改进服务质量。
                        """)
                        
                        sectionTitle("七、免责声明")
                        sectionContent("""
                        1. 解铃契提供的AI咨询服务仅供参考，不构成专业医疗、心理或法律建议。
                        2. 如遇紧急情况，请及时寻求专业机构帮助。
                        3. 我们不对因不可抗力、网络故障等原因导致的服务中断承担责任。
                        4. 我们不对用户因使用或无法使用服务而产生的任何损失承担责任。
                        """)
                        
                        sectionTitle("八、协议变更")
                        sectionContent("""
                        我们有权根据需要修改本协议，修改后的协议将在应用内公布。如您继续使用服务，即视为接受修改后的协议。
                        """)
                        
                        sectionTitle("九、联系我们")
                        sectionContent("""
                        如您对本协议有任何疑问，请通过以下方式联系我们：
                        邮箱：hanqi@qingguoguang.com
                        """)
                        
                        Text("生效日期：2026年3月7日")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding(.top, 20)
                    }
                }
                .padding()
            }
            .navigationTitle("用户协议")
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
