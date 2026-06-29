import Foundation

struct MockData {
    static let craftsmen: [Craftsman] = [
        Craftsman(
            name: "李明远",
            title: "国家级非物质文化遗产传承人",
            category: "瓷器",
            avatar: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20elderly%20male%20craftsman%20portrait%20traditional%20clothes%20warm%20lighting&image_size=portrait_4_3",
            bio: "从事青花瓷制作四十余年，作品多次获国家级奖项",
            experience: 42,
            location: "江西景德镇",
            works: ["青花缠枝莲纹瓶", "釉里红三鱼纹盘"]
        ),
        Craftsman(
            name: "王绣娘",
            title: "省级工艺美术大师",
            category: "刺绣",
            avatar: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20middle%20aged%20female%20craftswoman%20portrait%20traditional%20cheongsam%20elegant&image_size=portrait_4_3",
            bio: "苏绣世家第四代传人，精通双面绣技艺",
            experience: 30,
            location: "江苏苏州",
            works: ["双面绣牡丹图", "苏绣百鸟朝凤"]
        ),
        Craftsman(
            name: "张木匠",
            title: "非遗代表性传承人",
            category: "木雕",
            avatar: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20middle%20aged%20male%20woodcarver%20craftsman%20strong%20hands%20workshop&image_size=portrait_4_3",
            bio: "专注东阳木雕三十余年，擅长人物花鸟浮雕",
            experience: 35,
            location: "浙江东阳"
        )
    ]
    
    static let heritageItems: [HeritageItem] = [
        HeritageItem(
            name: "青花缠枝莲纹梅瓶",
            category: .porcelain,
            images: ["https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20blue%20and%20white%20porcelain%20vase%20with%20lotus%20pattern%20traditional%20chinese%20ceramic%20dark%20background&image_size=landscape_4_3"],
            description: "以青花绘制缠枝莲纹，釉色温润，器型优美",
            history: "青花瓷始于唐代，盛于元明，清代康雍乾时期达到巅峰",
            craftsman: craftsmen[0],
            price: 3680.00
        ),
        HeritageItem(
            name: "双面绣牡丹图",
            category: .embroidery,
            images: ["https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20double%20sided%20embroidery%20peony%20flower%20su%20embroidery%20silk%20art%20dark%20background&image_size=landscape_4_3"],
            description: "采用双面绣技法，两面图案完全一致，针脚细密",
            history: "苏绣起源于2000多年前，双面绣技艺成熟于宋代",
            craftsman: craftsmen[1],
            price: 5800.00
        ),
        HeritageItem(
            name: "东阳木雕松鹤延年挂屏",
            category: .woodCarving,
            images: ["https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20dongyang%20wood%20carving%20pine%20tree%20crane%20traditional%20chinese%20furniture%20dark%20background&image_size=landscape_4_3"],
            description: "以香樟木为材，浮雕松鹤图案，寓意吉祥",
            history: "东阳木雕始于唐代，是中国四大木雕之一",
            craftsman: craftsmen[2],
            price: 2880.00
        ),
        HeritageItem(
            name: "手工剪纸窗花套装",
            category: .paperCut,
            images: ["https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20traditional%20paper%20cutting%20art%20red%20paper%20auspicious%20patterns%20dark%20background&image_size=landscape_4_3"],
            description: "传统手工剪纸，包含吉祥图案八幅",
            history: "剪纸艺术距今已有1500多年历史，2009年列入世界非遗",
            price: 168.00
        ),
        HeritageItem(
            name: "手工蓝印花布",
            category: .textile,
            images: ["https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20traditional%20blue%20printed%20cotton%20fabric%20indigo%20dye%20pattern%20dark%20background&image_size=landscape_4_3"],
            description: "采用传统靛蓝染色工艺，图案典雅，色彩持久",
            history: "蓝印花布始于唐宋，盛行于明清",
            price: 298.00
        ),
        HeritageItem(
            name: "剔红花卉纹盒",
            category: .lacquer,
            images: ["https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20red%20lacquer%20box%20carved%20flowers%20traditional%20craft%20dark%20background&image_size=landscape_4_3"],
            description: "剔红工艺，髹漆百余道，雕刻精美花卉图案",
            history: "漆器工艺始于商周，剔红技法成熟于明代永乐年间",
            price: 8800.00
        )
    ]
    
    static let products: [Product] = [
        Product(name: "青花缠枝莲纹梅瓶", description: "景德镇手作青花瓷", price: 3680.00, category: "瓷器", craftsmanName: "李明远", image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20blue%20white%20porcelain%20vase%20lotus%20pattern%20product%20photo&image_size=square"),
        Product(name: "双面绣牡丹图", description: "苏绣精品，手工制作", price: 5800.00, category: "刺绣", craftsmanName: "王绣娘", image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20embroidery%20peony%20flower%20silk%20art%20product%20photo&image_size=square"),
        Product(name: "东阳木雕挂屏", description: "松鹤延年，寓意吉祥", price: 2880.00, category: "木雕", craftsmanName: "张木匠", image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20wood%20carving%20crane%20pine%20wall%20art%20product%20photo&image_size=square"),
        Product(name: "手工剪纸套装", description: "吉祥图案八幅", price: 168.00, category: "剪纸", image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20paper%20cutting%20art%20red%20patterns%20product%20photo&image_size=square"),
        Product(name: "蓝印花布方巾", description: "传统染色工艺", price: 298.00, category: "织染绣", image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20blue%20printed%20fabric%20cloth%20product%20photo&image_size=square"),
        Product(name: "剔红花卉纹盒", description: "百道髹漆工艺", price: 8800.00, category: "漆器", image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20red%20lacquer%20box%20carved%20flowers%20product%20photo&image_size=square")
    ]
}
