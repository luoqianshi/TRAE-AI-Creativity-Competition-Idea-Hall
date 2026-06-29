import SwiftUI

struct SplashScreenView: View {
    var body: some View {
        ZStack {
            Color.white
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                Spacer()
                
                // 开物标题 + 印章
                HStack(alignment: .top, spacing: 2) {
                    Text("开物")
                        .font(.custom("Songti SC Bold", size: 28))
                        .foregroundColor(.black)
                    Text("®")
                        .font(.system(size: 8))
                        .foregroundColor(.black)
                        .offset(y: 4)
                    VerticalSealStamp()
                        .padding(.leading, 6)
                        .padding(.top, 2)
                }
                
                Spacer()
                
                // 四句箴言（单列竖排）
                VStack(spacing: 48) {
                    VerticalText(text: "虽为人做")
                    VerticalText(text: "宛自天开")
                    VerticalText(text: "化文成物")
                    VerticalText(text: "物自有灵")
                }
                .padding(.bottom, 10)
                
                Spacer()
                Spacer()
                
                // 底部版权信息
                VStack(spacing: 2) {
                    Text("非物质文化遗产传承活化与学习平台")
                        .font(.system(size: 9))
                        .foregroundColor(.gray.opacity(0.65))
                    Text("2019-2026@UniMaker.com,all right reserved")
                        .font(.system(size: 8))
                        .foregroundColor(.gray.opacity(0.55))
                }
                .padding(.bottom, 35)
            }
        }
    }
}

// 竖排文字（传统竖排：从上到下）
private struct VerticalText: View {
    let text: String
    
    var body: some View {
        VStack(spacing: 3) {
            ForEach(text.map { String($0) }, id: \.self) { char in
                Text(char)
                    .font(.system(size: 12, weight: .light))
                    .foregroundColor(.black.opacity(0.75))
            }
        }
    }
}

// 竖长红色印章
private struct VerticalSealStamp: View {
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 1.5)
                .fill(Color.red)
                .frame(width: 12, height: 28)
            
            VStack(spacing: 1) {
                Text("天")
                    .font(.system(size: 6, weight: .bold))
                    .foregroundColor(.white)
                Text("命")
                    .font(.system(size: 6, weight: .bold))
                    .foregroundColor(.white)
            }
        }
    }
}
