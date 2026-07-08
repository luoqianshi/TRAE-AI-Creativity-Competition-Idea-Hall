const STORAGE_KEY = 'recipes';
const VERSION_KEY = 'recipes_version';
const CURRENT_VERSION = '3.0';

const defaultRecipes = [
    { id: 'meat_001', name: '蒸五花肉', category: 'meat', ingredients: '五花肉,生姜,大葱,冰糖,生抽,老抽,料酒', description: '五花肉切块焯水，加入调料腌制30分钟，上蒸锅蒸40分钟' },
    { id: 'meat_002', name: '蒸排骨', category: 'meat', ingredients: '排骨,生姜,大葱,生抽,蚝油,料酒', description: '排骨焯水，加入调料腌制20分钟，上蒸锅蒸30分钟' },
    { id: 'meat_003', name: '蒸鸡丁', category: 'meat', ingredients: '鸡胸肉,花生米,生姜,大葱,生抽,料酒', description: '鸡丁腌制后与花生米混合，上蒸锅蒸15分钟' },
    { id: 'meat_004', name: '蒸肉丝', category: 'meat', ingredients: '猪肉丝,胡萝卜,青椒,木耳,生抽,料酒', description: '肉丝腌制后与配菜混合，上蒸锅蒸12分钟' },
    { id: 'meat_005', name: '蒸腊肉', category: 'meat', ingredients: '腊肉,青蒜苗,生姜', description: '腊肉切片，与青蒜苗生姜混合，上蒸锅蒸20分钟' },
    { id: 'meat_006', name: '蒸肉片', category: 'meat', ingredients: '猪肉片,豆芽,青蒜苗,生抽,料酒', description: '肉片腌制后铺在豆芽上，上蒸锅蒸15分钟' },
    { id: 'meat_007', name: '蒸牛肉末', category: 'meat', ingredients: '牛肉末,豆腐,豆瓣酱,花椒,葱,姜,蒜', description: '牛肉末与调料混合铺在豆腐上，上蒸锅蒸15分钟' },
    { id: 'meat_008', name: '蒸鸡蛋', category: 'meat', ingredients: '鸡蛋,温水,盐,葱花', description: '鸡蛋打散加温水和盐，过筛后上蒸锅蒸10分钟，撒葱花' },
    { id: 'meat_009', name: '蒸肉丝', category: 'meat', ingredients: '猪肉丝,青椒,红椒,姜,蒜,生抽', description: '肉丝腌制后与青椒红椒混合，上蒸锅蒸12分钟' },
    { id: 'meat_010', name: '蒸牛肉片', category: 'meat', ingredients: '牛肉片,洋葱,青椒,生抽,料酒,黑胡椒', description: '牛肉片腌制后与洋葱青椒混合，上蒸锅蒸15分钟' },
    { id: 'meat_011', name: '蒸牛柳', category: 'meat', ingredients: '牛柳,青椒,红椒,黑胡椒,生抽,蚝油', description: '牛柳腌制后与配菜混合，上蒸锅蒸12分钟' },
    { id: 'meat_012', name: '蒸羊肉片', category: 'meat', ingredients: '羊肉片,洋葱,孜然粉,辣椒粉,盐', description: '羊肉片与调料混合，上蒸锅蒸12分钟' },
    { id: 'meat_013', name: '清蒸鱼', category: 'meat', ingredients: '鲈鱼,生姜,大葱,蒸鱼豉油,料酒', description: '鱼处理干净，铺上葱姜，上蒸锅蒸10分钟，倒掉汤汁，淋上蒸鱼豉油' },
    { id: 'meat_014', name: '蒸草鱼', category: 'meat', ingredients: '草鱼,生姜,大葱,生抽,料酒', description: '鱼处理干净，铺上葱姜，上蒸锅蒸12分钟' },
    { id: 'meat_015', name: '蒸鱼片', category: 'meat', ingredients: '草鱼,酸菜,干辣椒,花椒,姜,蒜', description: '鱼切片腌制，酸菜铺底，放上鱼片，上蒸锅蒸15分钟' },
    { id: 'meat_016', name: '蒸麻辣鱼', category: 'meat', ingredients: '草鱼,干辣椒,花椒,豆瓣酱,姜,蒜', description: '鱼处理干净，铺上麻辣调料，上蒸锅蒸12分钟' },
    { id: 'meat_017', name: '蒸剁椒鱼头', category: 'meat', ingredients: '胖头鱼鱼头,剁椒,生姜,大葱,蒸鱼豉油', description: '鱼头处理干净，铺上剁椒和葱姜，上蒸锅蒸15分钟，淋上蒸鱼豉油' },
    { id: 'meat_018', name: '蒜蓉粉丝蒸虾', category: 'meat', ingredients: '大虾,粉丝,蒜蓉,生抽,蚝油', description: '粉丝泡软铺在盘底，虾开背铺在上面，淋上蒜蓉酱，上蒸锅蒸8分钟' },
    { id: 'meat_019', name: '蒸大虾', category: 'meat', ingredients: '大虾,生姜,大葱,料酒,生抽', description: '大虾处理干净，铺上葱姜，上蒸锅蒸8分钟' },
    { id: 'meat_020', name: '蒸油焖虾', category: 'meat', ingredients: '大虾,生姜,大葱,生抽,料酒,白糖', description: '大虾处理干净，加入调料腌制，上蒸锅蒸10分钟' },
    { id: 'meat_021', name: '蒸香辣蟹', category: 'meat', ingredients: '螃蟹,干辣椒,花椒,豆瓣酱,姜,蒜', description: '螃蟹处理干净，铺上香辣调料，上蒸锅蒸15分钟' },
    { id: 'meat_022', name: '清蒸蟹', category: 'meat', ingredients: '螃蟹,生姜,醋,生抽', description: '螃蟹洗净，上蒸锅蒸15分钟，蘸姜醋汁食用' },
    { id: 'meat_023', name: '蒸蒜香排骨', category: 'meat', ingredients: '排骨,大蒜,生抽,蚝油,料酒', description: '排骨腌制后与蒜末混合，上蒸锅蒸30分钟' },
    { id: 'meat_024', name: '蒸可乐鸡翅', category: 'meat', ingredients: '鸡翅,可乐,生姜,生抽,老抽,料酒', description: '鸡翅焯水，加入可乐和调料腌制，上蒸锅蒸25分钟' },
    { id: 'meat_025', name: '蒸红烧鸡翅', category: 'meat', ingredients: '鸡翅,生姜,大葱,生抽,老抽,料酒,冰糖', description: '鸡翅腌制后，上蒸锅蒸25分钟' },
    { id: 'meat_026', name: '蒸咖喱鸡', category: 'meat', ingredients: '鸡肉,土豆,胡萝卜,咖喱块,椰奶', description: '鸡肉与配菜混合，加入咖喱调料，上蒸锅蒸30分钟' },
    { id: 'meat_027', name: '蒸黄焖鸡', category: 'meat', ingredients: '鸡肉,土豆,青椒,香菇,姜,蒜', description: '鸡肉与配菜混合，加入调料，上蒸锅蒸30分钟' },
    { id: 'meat_028', name: '蒸啤酒鸭', category: 'meat', ingredients: '鸭肉,啤酒,生姜,大葱,生抽,老抽', description: '鸭肉焯水，加入啤酒和调料，上蒸锅蒸40分钟' },
    { id: 'meat_029', name: '蒸卤鸭', category: 'meat', ingredients: '鸭子,八角,桂皮,香叶,生抽,老抽,料酒', description: '鸭子焯水，加入卤料，上蒸锅蒸60分钟' },
    { id: 'meat_030', name: '蒸白切鸡', category: 'meat', ingredients: '三黄鸡,生姜,大葱,料酒,生抽,香油', description: '鸡处理干净，加入葱姜料酒，上蒸锅蒸30分钟' },
    { id: 'meat_031', name: '蒸烤鸡', category: 'meat', ingredients: '整鸡,盐,黑胡椒,大蒜,迷迭香', description: '鸡腌制后，上蒸锅蒸40分钟' },
    { id: 'meat_032', name: '蒸炸鸡', category: 'meat', ingredients: '鸡肉,面粉,淀粉,鸡蛋,盐,胡椒粉', description: '鸡肉裹上面糊后蒸熟，再油炸至金黄' },
    { id: 'meat_033', name: '蒸辣子鸡', category: 'meat', ingredients: '鸡肉,干辣椒,花椒,姜,蒜,葱', description: '鸡肉蒸熟后，与干辣椒花椒混合蒸10分钟' },
    { id: 'meat_034', name: '蒸牙签肉', category: 'meat', ingredients: '猪肉,牙签,孜然粉,辣椒粉,盐', description: '猪肉切块穿在牙签上，腌制后上蒸锅蒸15分钟' },
    { id: 'meat_035', name: '蒸肉串', category: 'meat', ingredients: '猪肉,竹签,生抽,料酒,孜然粉', description: '猪肉腌制后穿在竹签上，上蒸锅蒸20分钟' },
    { id: 'meat_036', name: '蒸猪肝', category: 'meat', ingredients: '猪肝,青椒,红椒,洋葱,姜,蒜', description: '猪肝切片腌制，与配菜混合，上蒸锅蒸10分钟' },
    { id: 'meat_037', name: '蒸腰花', category: 'meat', ingredients: '猪腰,青椒,红椒,姜,蒜', description: '猪腰切花腌制，与配菜混合，上蒸锅蒸10分钟' },
    { id: 'meat_038', name: '蒸牛肚', category: 'meat', ingredients: '牛肚,青椒,洋葱,姜,蒜,生抽', description: '牛肚切片，与配菜混合，上蒸锅蒸15分钟' },
    { id: 'meat_039', name: '蒸鸡杂', category: 'meat', ingredients: '鸡杂,青椒,洋葱,姜,蒜', description: '鸡杂清洗干净，与配菜混合，上蒸锅蒸12分钟' },
    { id: 'meat_040', name: '蒸鸡汤', category: 'meat', ingredients: '老母鸡,生姜,大葱,红枣,枸杞', description: '鸡肉焯水，加入姜片和清水，上蒸锅蒸120分钟' },
    { id: 'meat_041', name: '蒸排骨汤', category: 'meat', ingredients: '排骨,玉米,胡萝卜,生姜', description: '排骨焯水，加入配菜，上蒸锅蒸60分钟' },
    { id: 'meat_042', name: '蒸牛肉汤', category: 'meat', ingredients: '牛肉,生姜,大葱,白萝卜', description: '牛肉切块焯水，加入萝卜，上蒸锅蒸90分钟' },
    { id: 'meat_043', name: '蒸羊肉汤', category: 'meat', ingredients: '羊肉,生姜,大葱,白萝卜', description: '羊肉切块焯水，加入萝卜，上蒸锅蒸90分钟' },
    { id: 'meat_044', name: '蒸老鸭汤', category: 'meat', ingredients: '老鸭,生姜,大葱,冬瓜', description: '老鸭焯水，加入冬瓜，上蒸锅蒸120分钟' },
    { id: 'meat_045', name: '蒸猪蹄汤', category: 'meat', ingredients: '猪蹄,生姜,大葱,花生', description: '猪蹄焯水，加入花生，上蒸锅蒸120分钟' },
    { id: 'meat_046', name: '蒸鲫鱼汤', category: 'meat', ingredients: '鲫鱼,生姜,大葱,豆腐', description: '鱼处理干净，加入豆腐和清水，上蒸锅蒸30分钟' },
    { id: 'meat_047', name: '蒸鱼头汤', category: 'meat', ingredients: '鱼头,生姜,大葱,豆腐', description: '鱼头处理干净，加入豆腐和清水，上蒸锅蒸30分钟' },
    { id: 'meat_048', name: '蒸馄饨', category: 'meat', ingredients: '猪肉馅,馄饨皮,青菜,紫菜,香油', description: '肉馅包入馄饨皮，上蒸锅蒸8分钟，加入汤料' },
    { id: 'meat_049', name: '蒸饺子', category: 'meat', ingredients: '猪肉馅,饺子皮,白菜,韭菜', description: '肉馅和蔬菜混合，包入饺子皮，上蒸锅蒸12分钟' },
    { id: 'meat_050', name: '蒸包子', category: 'meat', ingredients: '猪肉馅,面粉,酵母,白菜', description: '面粉发酵后擀皮，包入肉馅，上蒸锅蒸15分钟' },
    { id: 'meat_051', name: '蒸烧卖', category: 'meat', ingredients: '糯米,猪肉馅,饺子皮,香菇', description: '糯米和肉馅混合，包入饺子皮，上蒸锅蒸15分钟' },
    { id: 'meat_052', name: '蒸春卷', category: 'meat', ingredients: '猪肉馅,春卷皮,蔬菜', description: '肉馅和蔬菜混合，包入春卷皮，上蒸锅蒸10分钟' },
    { id: 'meat_053', name: '蒸葱油饼', category: 'meat', ingredients: '面粉,葱花,盐,食用油', description: '面团擀开撒上葱花，卷起来，上蒸锅蒸10分钟' },
    { id: 'meat_054', name: '蒸煎饼', category: 'meat', ingredients: '面粉,鸡蛋,葱花,香菜', description: '面糊摊开，加入鸡蛋和配料，上蒸锅蒸8分钟' },
    { id: 'meat_055', name: '蒸手抓饼', category: 'meat', ingredients: '面饼,生菜,火腿肠,酱料', description: '面饼蒸熟，加入配菜和酱料' },
    { id: 'meat_056', name: '蒸披萨', category: 'meat', ingredients: '面饼,芝士,番茄酱,火腿,蔬菜', description: '面饼上涂抹番茄酱，撒上芝士和配料，上蒸锅蒸15分钟' },
    { id: 'meat_057', name: '蒸牛肉饼', category: 'meat', ingredients: '牛肉馅,面包,生菜,番茄,酱料', description: '牛肉馅做成饼，上蒸锅蒸15分钟，夹入面包' },
    { id: 'meat_058', name: '蒸三明治', category: 'meat', ingredients: '面包,火腿,鸡蛋,生菜,芝士', description: '火腿和鸡蛋蒸熟，夹入面包中' },
    { id: 'meat_059', name: '蒸热狗', category: 'meat', ingredients: '香肠,面包,番茄酱,芥末酱', description: '香肠蒸熟，夹入面包中，淋上酱料' },
    { id: 'meat_060', name: '蒸土豆', category: 'meat', ingredients: '土豆,盐', description: '土豆切条，上蒸锅蒸15分钟' },
    { id: 'meat_061', name: '蒸鸡块', category: 'meat', ingredients: '鸡肉,面粉,淀粉,盐,胡椒粉', description: '鸡肉切块，裹上面糊，上蒸锅蒸15分钟' },
    { id: 'meat_062', name: '蒸鸡肉丁', category: 'meat', ingredients: '鸡肉丁,面包糠,鸡蛋,盐', description: '鸡肉丁裹上面包糠，上蒸锅蒸12分钟' },
    { id: 'meat_063', name: '蒸牛排', category: 'meat', ingredients: '牛肉,盐,黑胡椒,橄榄油,大蒜', description: '牛肉用盐和黑胡椒腌制，上蒸锅蒸15分钟' },
    { id: 'meat_064', name: '蒸羊排', category: 'meat', ingredients: '羊排,孜然粉,辣椒粉,盐', description: '羊排腌制后，上蒸锅蒸25分钟' },
    { id: 'meat_065', name: '蒸猪排', category: 'meat', ingredients: '猪排,面粉,鸡蛋,面包糠,盐', description: '猪排裹上面包糠，上蒸锅蒸20分钟' },
    { id: 'meat_066', name: '蒸鸡排', category: 'meat', ingredients: '鸡胸肉,面包糠,盐,胡椒粉', description: '鸡胸肉裹上面包糠，上蒸锅蒸15分钟' },
    { id: 'meat_067', name: '蒸烤肠', category: 'meat', ingredients: '香肠,孜然粉,辣椒粉', description: '香肠上蒸锅蒸15分钟，撒上调料' },
    { id: 'meat_068', name: '蒸培根蛋', category: 'meat', ingredients: '培根,鸡蛋,盐,黑胡椒', description: '培根和鸡蛋一起上蒸锅蒸10分钟' },
    { id: 'meat_069', name: '蒸火腿蛋', category: 'meat', ingredients: '火腿,鸡蛋,葱花,盐', description: '火腿切粒与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'meat_070', name: '蒸虾仁蛋', category: 'meat', ingredients: '虾仁,鸡蛋,葱花,盐', description: '虾仁与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'meat_071', name: '蒸牛肉饭', category: 'meat', ingredients: '牛肉,米饭,洋葱,胡萝卜,生抽', description: '牛肉与配菜混合，上蒸锅蒸20分钟，与米饭拌匀' },
    { id: 'meat_072', name: '蒸鸡肉饭', category: 'meat', ingredients: '鸡肉,米饭,青椒,胡萝卜,生抽', description: '鸡肉与配菜混合，上蒸锅蒸20分钟，与米饭拌匀' },
    { id: 'meat_073', name: '蒸海鲜饭', category: 'meat', ingredients: '虾仁,鱿鱼,米饭,洋葱,生抽', description: '海鲜与配菜混合，上蒸锅蒸15分钟，与米饭拌匀' },
    { id: 'meat_074', name: '蒸蛋炒饭', category: 'meat', ingredients: '鸡蛋,米饭,葱花,盐', description: '鸡蛋与米饭混合，上蒸锅蒸10分钟' },
    { id: 'meat_075', name: '蒸酱油饭', category: 'meat', ingredients: '米饭,酱油,葱花,鸡蛋', description: '米饭用酱油拌匀，加入鸡蛋，上蒸锅蒸10分钟' },
    { id: 'meat_076', name: '蒸牛肉面', category: 'meat', ingredients: '牛肉,面条,青椒,洋葱,生抽', description: '牛肉与配菜蒸熟，与面条拌匀' },
    { id: 'meat_077', name: '蒸鸡肉面', category: 'meat', ingredients: '鸡肉,面条,青菜,生抽', description: '鸡肉与青菜蒸熟，与面条拌匀' },
    { id: 'meat_078', name: '蒸海鲜面', category: 'meat', ingredients: '虾仁,鱿鱼,面条,青椒,洋葱', description: '海鲜与配菜蒸熟，与面条拌匀' },
    { id: 'meat_079', name: '蒸炸酱面', category: 'meat', ingredients: '猪肉末,面条,黄瓜,豆瓣酱', description: '猪肉末与豆瓣酱蒸熟，淋在面条上' },
    { id: 'meat_080', name: '蒸牛肉面', category: 'meat', ingredients: '牛肉,面条,青菜,牛肉汤', description: '牛肉蒸熟，与面条和汤混合' },
    { id: 'meat_081', name: '蒸鸡汤面', category: 'meat', ingredients: '鸡肉,面条,青菜,鸡汤', description: '鸡肉蒸熟，与面条和汤混合' },
    { id: 'meat_082', name: '蒸排骨面', category: 'meat', ingredients: '排骨,面条,青菜,排骨汤', description: '排骨蒸熟，与面条和汤混合' },
    { id: 'meat_083', name: '蒸拌面', category: 'meat', ingredients: '面条,花生酱,生抽,葱花', description: '面条蒸熟，加入酱料拌匀' },
    { id: 'meat_084', name: '蒸米粉', category: 'meat', ingredients: '米粉,猪肉,蔬菜,生抽', description: '米粉与肉和蔬菜混合，上蒸锅蒸15分钟' },
    { id: 'meat_085', name: '蒸河粉', category: 'meat', ingredients: '河粉,牛肉,豆芽,青菜,生抽', description: '河粉与牛肉和蔬菜混合，上蒸锅蒸12分钟' },
    { id: 'meat_086', name: '蒸肠粉', category: 'meat', ingredients: '米浆,肉末,虾仁,葱花', description: '米浆蒸制成薄皮，加入馅料卷起' },
    { id: 'meat_087', name: '蒸桂林米粉', category: 'meat', ingredients: '米粉,叉烧,卤蛋,酸笋,卤水', description: '米粉蒸熟，加入叉烧和卤料' },
    { id: 'meat_088', name: '蒸螺蛳粉', category: 'meat', ingredients: '米粉,螺蛳肉,酸笋,腐竹,辣椒油', description: '米粉蒸熟，加入螺蛳汤和配菜' },
    { id: 'meat_089', name: '蒸过桥米线', category: 'meat', ingredients: '米线,鸡汤,生肉片,蔬菜', description: '米线与配料一起上蒸锅蒸15分钟' },
    { id: 'meat_090', name: '蒸鸭血粉丝', category: 'meat', ingredients: '鸭血,粉丝,鸭肠,鸭肝,高汤', description: '鸭血和粉丝一起上蒸锅蒸15分钟，加入鸭杂和高汤' },
    { id: 'meat_091', name: '蒸酸辣粉', category: 'meat', ingredients: '红薯粉,辣椒油,醋,肉末,豆芽', description: '红薯粉与配料一起上蒸锅蒸15分钟' },
    { id: 'meat_092', name: '蒸土豆粉', category: 'meat', ingredients: '土豆粉,肉酱,蔬菜,高汤', description: '土豆粉与配料一起上蒸锅蒸15分钟' },
    { id: 'meat_093', name: '蒸刀削面', category: 'meat', ingredients: '刀削面,西红柿,鸡蛋,青菜', description: '刀削面与配料一起上蒸锅蒸12分钟' },
    { id: 'meat_094', name: '蒸担担面', category: 'meat', ingredients: '面条,肉末,辣椒油,花生碎,葱花', description: '面条蒸熟，加入肉末和调料' },
    { id: 'meat_095', name: '蒸热干面', category: 'meat', ingredients: '面条,芝麻酱,生抽,葱花,酸豆角', description: '面条蒸熟，加入芝麻酱和配料' },
    { id: 'meat_096', name: '蒸拉面', category: 'meat', ingredients: '拉面,牛肉,青菜,牛肉汤', description: '拉面与牛肉一起上蒸锅蒸12分钟' },
    { id: 'meat_097', name: '蒸年糕', category: 'meat', ingredients: '年糕,牛肉,洋葱,青椒,韩式辣酱', description: '年糕与牛肉和蔬菜一起上蒸锅蒸15分钟' },
    { id: 'meat_098', name: '蒸石锅拌饭', category: 'meat', ingredients: '米饭,牛肉,蔬菜,鸡蛋,韩式辣酱', description: '米饭与牛肉和蔬菜一起上蒸锅蒸15分钟，打入鸡蛋' },
    { id: 'meat_099', name: '蒸寿司', category: 'meat', ingredients: '米饭,海苔,三文鱼,黄瓜,蟹棒', description: '米饭铺在海苔上，加入配料卷起来，上蒸锅蒸5分钟' },
    { id: 'meat_100', name: '蒸鱼片', category: 'meat', ingredients: '三文鱼,金枪鱼,酱油,芥末', description: '鱼片切好，上蒸锅蒸5分钟，蘸酱油和芥末食用' },
    { id: 'veg_001', name: '蒸蒜蓉西兰花', category: 'vegetable', ingredients: '西兰花,蒜蓉,盐,蚝油', description: '西兰花焯水，淋上蒜蓉酱，上蒸锅蒸5分钟' },
    { id: 'veg_002', name: '蒸土豆丝', category: 'vegetable', ingredients: '土豆,青椒,红椒,大蒜,醋,盐', description: '土豆切丝泡水，上蒸锅蒸8分钟，加醋和调料拌匀' },
    { id: 'veg_003', name: '蒸土豆', category: 'vegetable', ingredients: '土豆,洋葱,胡萝卜,盐,黑胡椒', description: '土豆切块，与洋葱胡萝卜混合，上蒸锅蒸15分钟' },
    { id: 'veg_004', name: '蒸黄瓜', category: 'vegetable', ingredients: '黄瓜,大蒜,辣椒油,醋,生抽,香油', description: '黄瓜切片，加入调料，上蒸锅蒸5分钟' },
    { id: 'veg_005', name: '蒸黄瓜片', category: 'vegetable', ingredients: '黄瓜,大蒜,香菜,醋,生抽,盐', description: '黄瓜切片，加入调料，上蒸锅蒸5分钟' },
    { id: 'veg_006', name: '蒸番茄', category: 'vegetable', ingredients: '番茄,白糖', description: '番茄切块，撒上白糖，上蒸锅蒸5分钟' },
    { id: 'veg_007', name: '蒸西红柿蛋', category: 'vegetable', ingredients: '西红柿,鸡蛋,葱花,盐,糖', description: '西红柿与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_008', name: '蒸地三鲜', category: 'vegetable', ingredients: '土豆,茄子,青椒,大蒜,生抽', description: '土豆茄子青椒切块，上蒸锅蒸15分钟，加入蒜末和调料' },
    { id: 'veg_009', name: '蒸豆角', category: 'vegetable', ingredients: '豆角,干辣椒,花椒,大蒜,盐', description: '豆角切段，加入调料，上蒸锅蒸12分钟' },
    { id: 'veg_010', name: '蒸酸辣土豆丝', category: 'vegetable', ingredients: '土豆,干辣椒,花椒,醋,盐', description: '土豆切丝，加入酸辣调料，上蒸锅蒸8分钟' },
    { id: 'veg_011', name: '蒸青椒土豆丝', category: 'vegetable', ingredients: '土豆,青椒,大蒜,盐', description: '土豆切丝，与青椒混合，上蒸锅蒸8分钟' },
    { id: 'veg_012', name: '蒸茄子', category: 'vegetable', ingredients: '茄子,大蒜,生抽,老抽,糖', description: '茄子切块，加入调料，上蒸锅蒸15分钟' },
    { id: 'veg_013', name: '蒸鱼香茄子', category: 'vegetable', ingredients: '茄子,大蒜,豆瓣酱,醋,糖', description: '茄子切块，加入鱼香调料，上蒸锅蒸15分钟' },
    { id: 'veg_014', name: '蒸凉拌茄子', category: 'vegetable', ingredients: '茄子,大蒜,辣椒油,醋,生抽', description: '茄子上蒸锅蒸15分钟，加入调料拌匀' },
    { id: 'veg_015', name: '蒸蒜蓉茄子', category: 'vegetable', ingredients: '茄子,蒜蓉,生抽,蚝油', description: '茄子上蒸锅蒸15分钟，铺上蒜蓉酱' },
    { id: 'veg_016', name: '蒸青菜', category: 'vegetable', ingredients: '青菜,大蒜,盐', description: '青菜洗净，上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_017', name: '蒸蒜蓉青菜', category: 'vegetable', ingredients: '青菜,蒜蓉,盐,蚝油', description: '青菜上蒸锅蒸5分钟，淋上蒜蓉酱' },
    { id: 'veg_018', name: '蒸菠菜', category: 'vegetable', ingredients: '菠菜,大蒜,盐', description: '菠菜洗净，上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_019', name: '蒸蒜蓉菠菜', category: 'vegetable', ingredients: '菠菜,蒜蓉,盐,生抽', description: '菠菜上蒸锅蒸5分钟，淋上蒜蓉酱' },
    { id: 'veg_020', name: '蒸油麦菜', category: 'vegetable', ingredients: '油麦菜,大蒜,盐', description: '油麦菜洗净，上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_021', name: '蒸蒜蓉油麦菜', category: 'vegetable', ingredients: '油麦菜,蒜蓉,盐,蚝油', description: '油麦菜上蒸锅蒸5分钟，加入蒜蓉和调料' },
    { id: 'veg_022', name: '蒸生菜', category: 'vegetable', ingredients: '生菜,大蒜,盐', description: '生菜洗净，上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_023', name: '蒸蚝油生菜', category: 'vegetable', ingredients: '生菜,蚝油,大蒜', description: '生菜上蒸锅蒸5分钟，淋上蚝油酱汁' },
    { id: 'veg_024', name: '蒸芹菜', category: 'vegetable', ingredients: '芹菜,大蒜,盐', description: '芹菜切段，上蒸锅蒸8分钟，加入大蒜和盐' },
    { id: 'veg_025', name: '蒸芹菜香干', category: 'vegetable', ingredients: '芹菜,香干,大蒜,盐', description: '芹菜和香干一起上蒸锅蒸8分钟' },
    { id: 'veg_026', name: '蒸藕片', category: 'vegetable', ingredients: '莲藕,青椒,红椒,大蒜,盐', description: '莲藕切片，与配菜混合，上蒸锅蒸10分钟' },
    { id: 'veg_027', name: '蒸凉拌藕片', category: 'vegetable', ingredients: '莲藕,醋,生抽,糖,香油', description: '莲藕切片，上蒸锅蒸8分钟，加入调料拌匀' },
    { id: 'veg_028', name: '蒸冬瓜', category: 'vegetable', ingredients: '冬瓜,大蒜,盐', description: '冬瓜切片，上蒸锅蒸10分钟，加入大蒜和盐' },
    { id: 'veg_029', name: '蒸红烧冬瓜', category: 'vegetable', ingredients: '冬瓜,生抽,老抽,糖', description: '冬瓜切片，加入调料，上蒸锅蒸12分钟' },
    { id: 'veg_030', name: '蒸南瓜', category: 'vegetable', ingredients: '南瓜,大蒜,盐', description: '南瓜切块，上蒸锅蒸15分钟，加入大蒜和盐' },
    { id: 'veg_031', name: '蒸红烧南瓜', category: 'vegetable', ingredients: '南瓜,生抽,糖', description: '南瓜切块，加入调料，上蒸锅蒸15分钟' },
    { id: 'veg_032', name: '蒸胡萝卜', category: 'vegetable', ingredients: '胡萝卜,大蒜,盐', description: '胡萝卜切丝，上蒸锅蒸8分钟，加入大蒜和盐' },
    { id: 'veg_033', name: '蒸胡萝卜土豆', category: 'vegetable', ingredients: '胡萝卜,土豆,大蒜,盐', description: '胡萝卜和土豆一起上蒸锅蒸12分钟' },
    { id: 'veg_034', name: '蒸洋葱', category: 'vegetable', ingredients: '洋葱,盐,黑胡椒', description: '洋葱切丝，上蒸锅蒸10分钟，加入盐和黑胡椒' },
    { id: 'veg_035', name: '蒸洋葱蛋', category: 'vegetable', ingredients: '洋葱,鸡蛋,盐', description: '洋葱与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_036', name: '蒸青椒', category: 'vegetable', ingredients: '青椒,大蒜,盐', description: '青椒切块，上蒸锅蒸8分钟，加入大蒜和盐' },
    { id: 'veg_037', name: '蒸青椒蛋', category: 'vegetable', ingredients: '青椒,鸡蛋,葱花,盐', description: '青椒与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_038', name: '蒸红椒', category: 'vegetable', ingredients: '红椒,大蒜,盐', description: '红椒切块，上蒸锅蒸8分钟，加入大蒜和盐' },
    { id: 'veg_039', name: '蒸彩椒蛋', category: 'vegetable', ingredients: '彩椒,鸡蛋,葱花,盐', description: '彩椒与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_040', name: '蒸蘑菇', category: 'vegetable', ingredients: '蘑菇,大蒜,盐', description: '蘑菇切片，上蒸锅蒸8分钟，加入大蒜和盐' },
    { id: 'veg_041', name: '蒸香菇青菜', category: 'vegetable', ingredients: '香菇,青菜,大蒜,盐', description: '香菇和青菜一起上蒸锅蒸8分钟' },
    { id: 'veg_042', name: '蒸金针菇蛋', category: 'vegetable', ingredients: '金针菇,鸡蛋,葱花,盐', description: '金针菇与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_043', name: '蒸木耳', category: 'vegetable', ingredients: '木耳,青椒,红椒,大蒜,盐', description: '木耳泡发，与配菜一起上蒸锅蒸8分钟' },
    { id: 'veg_044', name: '蒸木耳蛋', category: 'vegetable', ingredients: '木耳,鸡蛋,葱花,盐', description: '木耳与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_045', name: '蒸腐竹', category: 'vegetable', ingredients: '腐竹,青椒,红椒,大蒜,盐', description: '腐竹泡发，与配菜一起上蒸锅蒸10分钟' },
    { id: 'veg_046', name: '蒸腐竹木耳', category: 'vegetable', ingredients: '腐竹,木耳,青椒,大蒜,盐', description: '腐竹和木耳一起上蒸锅蒸10分钟' },
    { id: 'veg_047', name: '蒸豆干', category: 'vegetable', ingredients: '豆干,青椒,红椒,大蒜,盐', description: '豆干切片，与配菜一起上蒸锅蒸8分钟' },
    { id: 'veg_048', name: '蒸豆干芹菜', category: 'vegetable', ingredients: '豆干,芹菜,大蒜,盐', description: '豆干和芹菜一起上蒸锅蒸8分钟' },
    { id: 'veg_049', name: '蒸面筋', category: 'vegetable', ingredients: '面筋,青椒,红椒,大蒜,盐', description: '面筋切块，与配菜一起上蒸锅蒸10分钟' },
    { id: 'veg_050', name: '蒸豆腐', category: 'vegetable', ingredients: '豆腐,青椒,红椒,大蒜,盐', description: '豆腐切块，与配菜一起上蒸锅蒸10分钟' },
    { id: 'veg_051', name: '蒸麻婆豆腐', category: 'vegetable', ingredients: '豆腐,豆瓣酱,花椒,葱,姜,蒜', description: '豆腐加入麻婆调料，上蒸锅蒸15分钟' },
    { id: 'veg_052', name: '蒸红烧豆腐', category: 'vegetable', ingredients: '豆腐,生抽,老抽,糖', description: '豆腐加入调料，上蒸锅蒸12分钟' },
    { id: 'veg_053', name: '蒸凉拌豆腐', category: 'vegetable', ingredients: '豆腐,生抽,香油,葱花', description: '豆腐切块，上蒸锅蒸5分钟，淋上调料' },
    { id: 'veg_054', name: '蒸皮蛋豆腐', category: 'vegetable', ingredients: '豆腐,皮蛋,生抽,香油,葱花', description: '豆腐切块，上蒸锅蒸5分钟，放上皮蛋，淋上调料' },
    { id: 'veg_055', name: '蒸黄豆芽', category: 'vegetable', ingredients: '黄豆芽,干辣椒,花椒,盐', description: '黄豆芽加入调料，上蒸锅蒸10分钟' },
    { id: 'veg_056', name: '蒸绿豆芽', category: 'vegetable', ingredients: '绿豆芽,青椒,红椒,盐', description: '绿豆芽与配菜一起上蒸锅蒸8分钟' },
    { id: 'veg_057', name: '蒸凉拌豆芽', category: 'vegetable', ingredients: '豆芽,醋,生抽,香油,葱花', description: '豆芽上蒸锅蒸5分钟，加入调料拌匀' },
    { id: 'veg_058', name: '蒸酸菜', category: 'vegetable', ingredients: '酸菜,干辣椒,花椒,盐', description: '酸菜洗净，加入调料，上蒸锅蒸10分钟' },
    { id: 'veg_059', name: '蒸酸菜土豆', category: 'vegetable', ingredients: '酸菜,土豆,大蒜,盐', description: '酸菜和土豆一起上蒸锅蒸15分钟' },
    { id: 'veg_060', name: '蒸泡菜', category: 'vegetable', ingredients: '泡菜,洋葱,青椒,盐', description: '泡菜与洋葱青椒一起上蒸锅蒸8分钟' },
    { id: 'veg_061', name: '蒸海带丝', category: 'vegetable', ingredients: '海带丝,青椒,红椒,大蒜,盐', description: '海带丝泡发，与配菜一起上蒸锅蒸10分钟' },
    { id: 'veg_062', name: '蒸凉拌海带丝', category: 'vegetable', ingredients: '海带丝,醋,生抽,香油,葱花', description: '海带丝上蒸锅蒸8分钟，加入调料拌匀' },
    { id: 'veg_063', name: '蒸紫菜蛋', category: 'vegetable', ingredients: '紫菜,鸡蛋,葱花,盐', description: '紫菜与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_064', name: '蒸芦笋', category: 'vegetable', ingredients: '芦笋,大蒜,盐,黑胡椒', description: '芦笋切段，上蒸锅蒸8分钟，加入大蒜和调料' },
    { id: 'veg_065', name: '蒸秋葵', category: 'vegetable', ingredients: '秋葵,大蒜,盐', description: '秋葵切段，上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_066', name: '蒸凉拌秋葵', category: 'vegetable', ingredients: '秋葵,蒜蓉,生抽,蚝油', description: '秋葵上蒸锅蒸5分钟，淋上蒜蓉酱' },
    { id: 'veg_067', name: '蒸丝瓜', category: 'vegetable', ingredients: '丝瓜,大蒜,盐', description: '丝瓜切块，上蒸锅蒸10分钟，加入大蒜和盐' },
    { id: 'veg_068', name: '蒸丝瓜蛋', category: 'vegetable', ingredients: '丝瓜,鸡蛋,葱花,盐', description: '丝瓜与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_069', name: '蒸苦瓜', category: 'vegetable', ingredients: '苦瓜,大蒜,盐', description: '苦瓜切片，上蒸锅蒸10分钟，加入大蒜和盐' },
    { id: 'veg_070', name: '蒸苦瓜蛋', category: 'vegetable', ingredients: '苦瓜,鸡蛋,葱花,盐', description: '苦瓜与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_071', name: '蒸冬瓜木耳', category: 'vegetable', ingredients: '冬瓜,木耳,大蒜,盐', description: '冬瓜和木耳一起上蒸锅蒸12分钟' },
    { id: 'veg_072', name: '蒸冬瓜蛋', category: 'vegetable', ingredients: '冬瓜,鸡蛋,葱花,盐', description: '冬瓜与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_073', name: '蒸南瓜木耳', category: 'vegetable', ingredients: '南瓜,木耳,大蒜,盐', description: '南瓜和木耳一起上蒸锅蒸15分钟' },
    { id: 'veg_074', name: '蒸南瓜蛋', category: 'vegetable', ingredients: '南瓜,鸡蛋,葱花,盐', description: '南瓜与鸡蛋混合，上蒸锅蒸12分钟' },
    { id: 'veg_075', name: '蒸山药', category: 'vegetable', ingredients: '山药,青椒,红椒,大蒜,盐', description: '山药切片，与配菜一起上蒸锅蒸10分钟' },
    { id: 'veg_076', name: '蒸山药木耳', category: 'vegetable', ingredients: '山药,木耳,青椒,大蒜,盐', description: '山药和木耳一起上蒸锅蒸10分钟' },
    { id: 'veg_077', name: '蒸芋头', category: 'vegetable', ingredients: '芋头,大蒜,盐', description: '芋头切块，上蒸锅蒸15分钟，加入大蒜和盐' },
    { id: 'veg_078', name: '蒸荸荠', category: 'vegetable', ingredients: '荸荠,青椒,红椒,大蒜,盐', description: '荸荠切片，与配菜一起上蒸锅蒸8分钟' },
    { id: 'veg_079', name: '蒸菱角', category: 'vegetable', ingredients: '菱角,大蒜,盐', description: '菱角煮熟，与大蒜一起上蒸锅蒸5分钟' },
    { id: 'veg_080', name: '蒸百合', category: 'vegetable', ingredients: '百合,西芹,腰果,盐', description: '百合和西芹一起上蒸锅蒸8分钟，加入腰果' },
    { id: 'veg_081', name: '蒸莲子', category: 'vegetable', ingredients: '莲子,百合,冰糖', description: '莲子和百合一起上蒸锅蒸20分钟，加入冰糖' },
    { id: 'veg_082', name: '蒸银耳', category: 'vegetable', ingredients: '银耳,百合,冰糖', description: '银耳泡发，与百合一起上蒸锅蒸30分钟' },
    { id: 'veg_083', name: '蒸木耳菜', category: 'vegetable', ingredients: '木耳菜,大蒜,盐', description: '木耳菜上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_084', name: '蒸空心菜', category: 'vegetable', ingredients: '空心菜,大蒜,盐', description: '空心菜上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_085', name: '蒸蒜蓉空心菜', category: 'vegetable', ingredients: '空心菜,蒜蓉,盐,蚝油', description: '空心菜上蒸锅蒸5分钟，加入蒜蓉翻炒' },
    { id: 'veg_086', name: '蒸苋菜', category: 'vegetable', ingredients: '苋菜,大蒜,盐', description: '苋菜上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_087', name: '蒸茼蒿', category: 'vegetable', ingredients: '茼蒿,大蒜,盐', description: '茼蒿上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_088', name: '蒸芥蓝', category: 'vegetable', ingredients: '芥蓝,大蒜,盐', description: '芥蓝上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_089', name: '蒸豆苗', category: 'vegetable', ingredients: '豆苗,大蒜,盐', description: '豆苗上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_090', name: '蒸韭菜', category: 'vegetable', ingredients: '韭菜,大蒜,盐', description: '韭菜上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_091', name: '蒸韭菜蛋', category: 'vegetable', ingredients: '韭菜,鸡蛋,盐', description: '韭菜与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_092', name: '蒸韭菜豆干', category: 'vegetable', ingredients: '韭菜,豆干,大蒜,盐', description: '韭菜和豆干一起上蒸锅蒸8分钟' },
    { id: 'veg_093', name: '蒸香菜', category: 'vegetable', ingredients: '香菜,大蒜,盐', description: '香菜上蒸锅蒸3分钟，加入大蒜和盐' },
    { id: 'veg_094', name: '蒸茴香', category: 'vegetable', ingredients: '茴香,大蒜,盐', description: '茴香上蒸锅蒸5分钟，加入大蒜和盐' },
    { id: 'veg_095', name: '蒸薄荷', category: 'vegetable', ingredients: '薄荷,大蒜,盐', description: '薄荷上蒸锅蒸3分钟，加入大蒜和盐' },
    { id: 'veg_096', name: '蒸紫苏', category: 'vegetable', ingredients: '紫苏,大蒜,盐', description: '紫苏上蒸锅蒸3分钟，加入大蒜和盐' },
    { id: 'veg_097', name: '蒸香椿蛋', category: 'vegetable', ingredients: '香椿,鸡蛋,盐', description: '香椿与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_098', name: '蒸槐花蛋', category: 'vegetable', ingredients: '槐花,鸡蛋,盐', description: '槐花与鸡蛋混合，上蒸锅蒸10分钟' },
    { id: 'veg_099', name: '蒸榆钱', category: 'vegetable', ingredients: '榆钱,面粉,盐', description: '榆钱裹上面粉，上蒸锅蒸10分钟' },
    { id: 'veg_100', name: '蒸蒲公英', category: 'vegetable', ingredients: '蒲公英,大蒜,盐', description: '蒲公英洗净，上蒸锅蒸5分钟，加入大蒜和盐' }
].map(r => ({ ...r, image: '', createdAt: Date.now() }));

function getRecipes() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const version = localStorage.getItem(VERSION_KEY);
    
    if (stored && version === CURRENT_VERSION) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
            return parsed;
        }
    }
    
    saveRecipes(defaultRecipes);
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    return defaultRecipes;
}

function saveRecipes(recipes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const commonIngredients = ['土豆', '鸡蛋', '肉', '番茄', '黄瓜', '西兰花', '洋葱', '胡萝卜', '大蒜', '生姜', '青椒', '鱼'];

let recipes = getRecipes();
let currentFilter = 'all';
let searchQuery = '';
let currentDetailRecipe = null;
let selectedIngredients = [];

function renderIngredientsTags() {
    const container = document.getElementById('ingredientsTags');
    container.innerHTML = '';
    
    commonIngredients.forEach(ingredient => {
        const tag = document.createElement('button');
        tag.className = `ingredient-tag ${selectedIngredients.includes(ingredient) ? 'active' : ''}`;
        tag.textContent = ingredient;
        tag.addEventListener('click', () => toggleIngredient(ingredient));
        container.appendChild(tag);
    });
}

function toggleIngredient(ingredient) {
    const index = selectedIngredients.indexOf(ingredient);
    if (index === -1) {
        selectedIngredients.push(ingredient);
    } else {
        selectedIngredients.splice(index, 1);
    }
    renderIngredientsTags();
}

function renderRecipes() {
    const grid = document.getElementById('recipesGrid');
    const emptyState = document.getElementById('emptyState');
    
    let filtered = recipes;
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(r => r.category === currentFilter);
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(query) ||
            r.ingredients.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query)
        );
    }
    
    grid.innerHTML = '';
    
    if (filtered.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    filtered.forEach(recipe => {
        const card = document.createElement('div');
        card.className = `recipe-card ${recipe.category}`;
        card.onclick = () => openDetail(recipe);
        
        const categoryText = recipe.category === 'meat' ? '荤菜' : '素菜';
        
        card.innerHTML = `
            <div class="recipe-card-header">
                <span class="category-badge">${categoryText}</span>
            </div>
            <h3 class="recipe-name">${recipe.name}</h3>
            <p class="recipe-ingredients">食材：${recipe.ingredients}</p>
            <p class="recipe-desc">${recipe.description}</p>
        `;
        
        grid.appendChild(card);
    });
}

function openDetail(recipe) {
    currentDetailRecipe = recipe;
    
    document.getElementById('detailName').textContent = recipe.name;
    
    const badge = document.getElementById('detailCategoryBadge');
    badge.textContent = recipe.category === 'meat' ? '荤菜' : '素菜';
    badge.className = `category-badge ${recipe.category === 'meat' ? 'meat' : 'vegetable'}`;
    
    document.getElementById('detailIngredients').textContent = recipe.ingredients;
    document.getElementById('detailDescription').textContent = recipe.description;
    
    document.getElementById('detailModal').classList.add('active');
}

function closeDetail() {
    document.getElementById('detailModal').classList.remove('active');
    currentDetailRecipe = null;
}

function resetData() {
    if (confirm('确定要重置数据吗？这将恢复为200个预置菜谱，所有自定义菜谱将丢失！')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VERSION_KEY);
        recipes = defaultRecipes;
        saveRecipes(recipes);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        renderRecipes();
        renderIngredientsTags();
        renderResultItem(document.getElementById('meatResult'), null);
        renderResultItem(document.getElementById('vegResult'), null);
        document.getElementById('searchInput').value = '';
        searchQuery = '';
        selectedIngredients = [];
        alert('数据已重置为200个预置菜谱！');
    }
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = '添加菜谱';
    document.getElementById('recipeForm').reset();
    document.getElementById('recipeId').value = '';
    document.getElementById('recipeModal').classList.add('active');
}

function openEditModal(recipe) {
    document.getElementById('modalTitle').textContent = '编辑菜谱';
    document.getElementById('recipeId').value = recipe.id;
    document.getElementById('recipeName').value = recipe.name;
    document.querySelector(`input[name="category"][value="${recipe.category}"]`).checked = true;
    document.getElementById('recipeIngredients').value = recipe.ingredients;
    document.getElementById('recipeDescription').value = recipe.description;
    document.getElementById('recipeModal').classList.add('active');
}

function closeModal() {
    document.getElementById('recipeModal').classList.remove('active');
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('recipeId').value;
    const name = document.getElementById('recipeName').value;
    const category = document.querySelector('input[name="category"]:checked').value;
    const ingredients = document.getElementById('recipeIngredients').value;
    const description = document.getElementById('recipeDescription').value;
    
    if (id) {
        const index = recipes.findIndex(r => r.id === id);
        if (index !== -1) {
            recipes[index] = {
                ...recipes[index],
                name,
                category,
                ingredients,
                description
            };
        }
    } else {
        recipes.unshift({
            id: generateId(),
            name,
            category,
            ingredients,
            description,
            image: '',
            createdAt: Date.now()
        });
    }
    
    saveRecipes(recipes);
    renderRecipes();
    closeModal();
}

function deleteRecipe(id) {
    if (confirm('确定要删除这个菜谱吗？')) {
        recipes = recipes.filter(r => r.id !== id);
        saveRecipes(recipes);
        renderRecipes();
        closeDetail();
    }
}

function filterByIngredients(list) {
    if (selectedIngredients.length === 0) {
        return list;
    }
    return list.filter(r => {
        return selectedIngredients.some(ing => 
            r.ingredients.includes(ing) || r.name.includes(ing)
        );
    });
}

function renderResultItem(element, recipe) {
    if (!recipe) {
        element.querySelector('.dish-name').textContent = '--';
        element.querySelector('.dish-ingredients').textContent = '食材：--';
        element.querySelector('.dish-description').textContent = '做法：--';
        return;
    }
    element.querySelector('.dish-name').textContent = recipe.name;
    element.querySelector('.dish-ingredients').textContent = '食材：' + recipe.ingredients;
    element.querySelector('.dish-description').textContent = '做法：' + recipe.description;
}

function randomSelect() {
    const allMeatRecipes = recipes.filter(r => r.category === 'meat');
    const allVegRecipes = recipes.filter(r => r.category === 'vegetable');
    
    let filteredMeatRecipes = filterByIngredients(allMeatRecipes);
    let filteredVegRecipes = filterByIngredients(allVegRecipes);
    
    if (filteredMeatRecipes.length === 0) {
        filteredMeatRecipes = allMeatRecipes;
    }
    
    if (filteredVegRecipes.length === 0) {
        filteredVegRecipes = allVegRecipes;
    }
    
    if (filteredMeatRecipes.length === 0 && filteredVegRecipes.length === 0) {
        alert('菜谱库为空！');
        return;
    }
    
    const randomMeat = filteredMeatRecipes[Math.floor(Math.random() * filteredMeatRecipes.length)];
    const randomVeg = filteredVegRecipes[Math.floor(Math.random() * filteredVegRecipes.length)];
    
    renderResultItem(document.getElementById('meatResult'), randomMeat);
    renderResultItem(document.getElementById('vegResult'), randomVeg);
    
    const result = document.getElementById('randomResult');
    result.classList.remove('animate');
    void result.offsetWidth;
    result.classList.add('animate');
}

function randomFromFilter() {
    let filtered = recipes;
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(r => r.category === currentFilter);
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(query) ||
            r.ingredients.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query)
        );
    }
    
    filtered = filterByIngredients(filtered);
    
    if (filtered.length === 0) {
        alert('没有找到匹配的菜谱！');
        return;
    }
    
    const randomRecipe = filtered[Math.floor(Math.random() * filtered.length)];
    
    if (randomRecipe.category === 'meat') {
        renderResultItem(document.getElementById('meatResult'), randomRecipe);
        renderResultItem(document.getElementById('vegResult'), null);
    } else {
        renderResultItem(document.getElementById('meatResult'), null);
        renderResultItem(document.getElementById('vegResult'), randomRecipe);
    }
    
    const result = document.getElementById('randomResult');
    result.classList.remove('animate');
    void result.offsetWidth;
    result.classList.add('animate');
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    renderRecipes();
    renderIngredientsTags();
    
    document.getElementById('randomBtn').addEventListener('click', randomSelect);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderRecipes();
        });
    });
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderRecipes();
    });
    
    document.getElementById('addBtn').addEventListener('click', openAddModal);
    
    document.getElementById('randomFromFilterBtn').addEventListener('click', randomFromFilter);
    
    document.getElementById('resetBtn').addEventListener('click', resetData);
    
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    
    document.getElementById('recipeForm').addEventListener('submit', handleFormSubmit);
    
    document.getElementById('closeDetail').addEventListener('click', closeDetail);
    
    document.getElementById('editDetailBtn').addEventListener('click', () => {
        if (currentDetailRecipe) {
            closeDetail();
            openEditModal(currentDetailRecipe);
        }
    });
    
    document.getElementById('deleteDetailBtn').addEventListener('click', () => {
        if (currentDetailRecipe) {
            deleteRecipe(currentDetailRecipe.id);
        }
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});