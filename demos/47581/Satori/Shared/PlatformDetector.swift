import SwiftUI

enum PlatformType {
    case iPhone
    case iPad
    case visionOS
    case mac
}

struct PlatformDetector {
    #if os(visionOS)
    static let current: PlatformType = .visionOS
    #elseif os(iOS)
    static let current: PlatformType = {
        if UIDevice.current.userInterfaceIdiom == .pad {
            return .iPad
        }
        return .iPhone
    }()
    #elseif os(macOS)
    static let current: PlatformType = .mac
    #else
    static let current: PlatformType = .iPhone
    #endif
    
    static var isVisionOS: Bool {
        current == .visionOS
    }
    
    static var isIPhone: Bool {
        current == .iPhone
    }
}
