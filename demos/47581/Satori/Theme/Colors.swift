import SwiftUI

struct Theme {
    struct Colors {
        static let bgDark = Color(red: 0.010, green: 0.025, blue: 0.050)
        static let bgMid = Color(red: 0.030, green: 0.100, blue: 0.200)
        static let bgLight = Color(red: 0.070, green: 0.200, blue: 0.350)
        static let bgGlow = Color(red: 0.150, green: 0.450, blue: 0.600)

        static let accent = Color(red: 0.700, green: 0.300, blue: 0.350)
        static let accentBright = Color(red: 0.800, green: 0.380, blue: 0.420)
        static let vermilion = Color(red: 1.000, green: 0.270, blue: 0.000)
        
        static func accent(_ isDark: Bool) -> Color {
            isDark ? Color(red: 0.700, green: 0.300, blue: 0.350) : Color(red: 0.580, green: 0.220, blue: 0.280)
        }
        
        static func accentBright(_ isDark: Bool) -> Color {
            isDark ? Color(red: 0.800, green: 0.380, blue: 0.420) : Color(red: 0.680, green: 0.280, blue: 0.340)
        }

        static let primary = Color.white
        static let secondary = Color(red: 0.720, green: 0.780, blue: 0.850)
        static let tertiary = Color(red: 0.550, green: 0.620, blue: 0.700)
        
        static let cardDark = Color.white.opacity(0.08)
        static let cardMid = Color.white.opacity(0.12)
        static let cardLight = Color.white.opacity(0.16)
        static let cardBorder = Color.white.opacity(0.15)
        static let divider = Color.white.opacity(0.10)
        
        static func primary(_ isDark: Bool) -> Color {
            isDark ? .white : .black
        }
        
        static func secondary(_ isDark: Bool) -> Color {
            isDark ? Color(red: 0.720, green: 0.780, blue: 0.850) : Color(red: 0.550, green: 0.550, blue: 0.570)
        }
        
        static func tertiary(_ isDark: Bool) -> Color {
            isDark ? Color(red: 0.550, green: 0.620, blue: 0.700) : Color(red: 0.700, green: 0.700, blue: 0.720)
        }
        
        static func cardDark(_ isDark: Bool) -> Color {
            isDark ? Color.white.opacity(0.08) : Color(red: 0.96, green: 0.96, blue: 0.97)
        }
        
        static func cardMid(_ isDark: Bool) -> Color {
            isDark ? Color.white.opacity(0.12) : Color(red: 0.94, green: 0.94, blue: 0.96)
        }
        
        static func cardLight(_ isDark: Bool) -> Color {
            isDark ? Color.white.opacity(0.16) : Color(red: 0.92, green: 0.92, blue: 0.94)
        }
        
        static func cardBorder(_ isDark: Bool) -> Color {
            isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08)
        }
        
        static func divider(_ isDark: Bool) -> Color {
            isDark ? Color.white.opacity(0.10) : Color.black.opacity(0.06)
        }
        
        static func bgPaper(_ isDark: Bool) -> Color {
            isDark ? bgDark : .white
        }
    }

    struct Fonts {
        static let largeTitle = Font.system(size: 34, weight: .bold)
        static let title = Font.system(size: 22, weight: .bold)
        static let title2 = Font.system(size: 19, weight: .semibold)
        static let headline = Font.system(size: 17, weight: .semibold)
        static let body = Font.system(size: 15, weight: .regular)
        static let caption = Font.system(size: 13, weight: .regular)
        static let small = Font.system(size: 11, weight: .regular)
    }

    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 24
        static let xxl: CGFloat = 32
    }

    struct Radius {
        static let sm: CGFloat = 8
        static let md: CGFloat = 14
        static let lg: CGFloat = 20
        static let xl: CGFloat = 28
    }
}
