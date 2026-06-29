import Foundation

enum Category: String, Codable, CaseIterable, Identifiable {
    case textile = "织染绣"
    case porcelain = "瓷器"
    case woodCarving = "木雕"
    case paperCut = "剪纸"
    case embroidery = "刺绣"
    case lacquer = "漆器"
    case bronze = "青铜器"
    case jade = "玉器"
    
    var id: String { rawValue }
    
    var icon: String {
        switch self {
        case .textile: return "leaf"
        case .porcelain: return "cup.and.saucer.fill"
        case .woodCarving: return "tree"
        case .paperCut: return "scissors"
        case .embroidery: return "sparkles"
        case .lacquer: return "circle.hexagongrid.fill"
        case .bronze: return "bell"
        case .jade: return "gem"
        }
    }
    
    var descriptionText: String {
        switch self {
        case .textile: return "传统织染绣技艺，色彩绚丽，图案精美"
        case .porcelain: return "千年窑火，匠心制瓷，温润如玉"
        case .woodCarving: return "方寸之间，刀工精湛，栩栩如生"
        case .paperCut: return "一纸一剪，剪出万千祝福与故事"
        case .embroidery: return "针针丝线，绣出锦绣河山"
        case .lacquer: return "髹漆工艺，光可鉴人，历久弥新"
        case .bronze: return "青铜铸造，厚重典雅，国之重器"
        case .jade: return "精雕细琢，温润而泽，君子之器"
        }
    }
}
