/**
 * FamTaste Demo V2 - 完整 Mock 数据层
 * 设计文档引用: design-v2.md §6 数据结构 / PRD v1.0 §数据模型
 *
 * 提供 Demo 所需的全量模拟数据，使用 window.FamTaste.Data 命名空间导出
 * 包含：家庭档案、成员(5人)、菜谱库(8道)、复刻时间线(18条)、避坑指南、膳食规划、购物清单、库存
 */

(() => {
	/* ================================================================
	   家庭档案
	   ================================================================ */
	const family = {
		id: "f001",
		name: "张家小厨",
		created_at: "2026-01-15",
	};

	/* ================================================================
	   家庭成员（含过敏/口味偏好）
	   ================================================================ */
	const members = [
		{
			id: "m001",
			nickname: "奶奶",
			identity: "grandma",
			role: "admin",
			avatar: "\u{1F475}",
			preferences: { spicy: "low", sweet: "high", salt: "medium" },
			restrictions: { allergies: ["花生"], dislikes: ["香菜"] },
		},
		{
			id: "m002",
			nickname: "爸爸",
			identity: "dad",
			role: "member",
			avatar: "\u{1F468}",
			preferences: { spicy: "medium", sweet: "low", salt: "heavy" },
			restrictions: { allergies: [], dislikes: ["胡萝卜"] },
		},
		{
			id: "m003",
			nickname: "妈妈",
			identity: "mom",
			role: "member",
			avatar: "\u{1F469}",
			preferences: { spicy: "none", sweet: "medium", salt: "light" },
			restrictions: { allergies: ["海鲜"], dislikes: [] },
		},
		{
			id: "m004",
			nickname: "我",
			identity: "me",
			role: "member",
			avatar: "\u{1F60A}",
			preferences: { spicy: "medium", sweet: "medium", salt: "medium" },
			restrictions: { allergies: [], dislikes: [] },
		},
		{
			id: "m005",
			nickname: "爷爷",
			identity: "grandpa",
			role: "member",
			avatar: "\u{1F474}",
			preferences: { spicy: "high", sweet: "low", salt: "heavy" },
			restrictions: { allergies: [], dislikes: ["苦瓜"] },
		},
	];

	/* ================================================================
	   完整菜谱库（8道）
	   每道包含：id/title/author_id/author_nickname/cover_image/
	            cuisine_type/meal_time/difficulty/cooking_time/tags/
	            current_version/origin_story/secret_tips/versions[]
	   ================================================================ */
	const recipes = [
		// ----- r001 糖醋排骨（奶奶）-----
		{
			id: "r001",
			title: "糖醋排骨",
			author_id: "m001",
			author_nickname: "奶奶",
			cover_image: "placeholder-sweet-sour-ribs.svg",
			cuisine_type: "家常菜",
			meal_time: "dinner",
			difficulty: "medium",
			cooking_time: 45,
			tags: ["复刻研究", "家传菜", "过年必做"],
			current_version: 3,
			origin_story:
				"这道糖醋排骨是奶奶年轻时跟隔壁王阿姨学的，后来成了我们家过年必做的硬菜。奶奶总说：'糖醋的秘诀不在配方，在火候。'可惜她从来没用量杯，全凭手感。现在我们想把这种感觉记下来，让每个人都能复刻出家的味道。",
			secret_tips:
				"炒糖色一定要用最小火，看到冰糖融化成琥珀色就立刻下排骨——慢一秒就焦了。还有，醋一定要最后出锅前才淋，早放就挥发没了。",
			versions: [
				{
					version: 1,
					created_at: "2026-05-01",
					result: "failed",
					ingredients: [
						{ name: "排骨", amount: "500g" },
						{ name: "冰糖", amount: "30g" },
						{ name: "酱油", amount: "2勺" },
						{ name: "醋", amount: "1勺" },
						{ name: "姜片", amount: "3片" },
					],
					steps: [
						"排骨洗净切段，冷水下锅焯水去血沫",
						"热锅冷油，下冰糖炒糖色至焦糖色",
						"下排骨翻炒上色",
						"加入酱油、醋、姜片翻炒均匀",
						"加水没过排骨，大火烧开转小火焖30分钟",
						"大火收汁，出锅装盘",
					],
					notes: "第一次按网上教程来的，糖色好像炒过了，有点苦。",
				},
				{
					version: 2,
					created_at: "2026-05-08",
					result: "okay",
					ingredients: [
						{ name: "排骨", amount: "500g" },
						{ name: "冰糖", amount: "25g" },
						{ name: "酱油", amount: "2勺" },
						{ name: "醋", amount: "1勺" },
						{ name: "姜片", amount: "3片" },
					],
					steps: [
						"排骨洗净切段，冷水下锅焯水去血沫",
						"热锅冷油，下冰糖炒糖色至琥珀色",
						"下排骨翻炒上色",
						"加入酱油、姜片翻炒均匀",
						"加水没过排骨，大火烧开转小火焖30分钟",
						"大火收汁，出锅前加醋提味",
						"装盘上桌",
					],
					notes: "减少了冰糖量，最后出锅前才加醋。甜度好多了，但还是有点苦底。",
				},
				{
					version: 3,
					created_at: "2026-05-15",
					result: "perfect",
					ingredients: [
						{ name: "排骨", amount: "450g" },
						{ name: "冰糖", amount: "20g" },
						{ name: "生抽", amount: "1勺" },
						{ name: "老抽", amount: "半勺" },
						{ name: "醋", amount: "1勺" },
						{ name: "姜片", amount: "3片" },
						{ name: "八角", amount: "1个" },
						{ name: "白芝麻", amount: "适量" },
					],
					steps: [
						"排骨冷水下锅，加料酒和姜片，焯水3分钟去血沫，捞出洗净备用",
						"热锅放少许油，中小火下冰糖，慢慢炒至琥珀色（约45秒）",
						"迅速下排骨翻炒，使每块排骨均匀裹上糖色",
						"加入生抽、老抽调色调味，放入姜片和八角炒香",
						"加热水没过排骨，大火烧开后转小火焖25分钟",
						"转大火收汁，沿锅边淋入香醋",
						"出锅撒白芝麻，装盘上桌",
					],
					notes:
						"这次换了生抽老抽配比，炒糖色改小火慢慢炒，加了八角提香。终于做出奶奶那个味道了！",
				},
			],
		},

		// ----- r002 红烧肉（爸爸）-----
		{
			id: "r002",
			title: "红烧肉",
			author_id: "m002",
			author_nickname: "爸爸",
			cover_image: "placeholder-braised-pork.svg",
			cuisine_type: "家常菜",
			meal_time: "dinner",
			difficulty: "hard",
			cooking_time: 90,
			tags: ["家传菜", "宴客菜", "硬菜"],
			current_version: 2,
			origin_story:
				"爸爸的红烧肉是跟爷爷学的，爷爷说这是太奶奶传下来的方子。小时候每次爸爸做红烧肉，整个楼道都是香味。后来爸爸工作忙很少下厨，今年过年他说要重新把这道菜捡起来——结果第一次做翻车了，肥肉部分咬不动。现在我们帮他记录复刻过程。",
			secret_tips:
				"五花肉一定要选三层肥两层瘦的那种，太肥腻太瘦柴都不行。焯水后用冷水冲一下，这样炖出来的肉皮才会Q弹。",
			versions: [
				{
					version: 1,
					created_at: "2026-04-20",
					result: "failed",
					ingredients: [
						{ name: "五花肉", amount: "600g" },
						{ name: "冰糖", amount: "40g" },
						{ name: "生抽", amount: "3勺" },
						{ name: "老抽", amount: "1勺" },
						{ name: "料酒", amount: "2勺" },
						{ name: "葱姜", amount: "适量" },
						{ name: "八角", amount: "2个" },
						{ name: "桂皮", amount: "1小块" },
					],
					steps: [
						"五花肉切3cm见方块，冷水下锅焯水5分钟",
						"热锅少油，下冰糖炒糖色至深棕色",
						"下五花肉块翻炒至表面金黄",
						"加入生抽、老抽、料酒炒匀",
						"放葱段、姜片、八角、桂皮",
						"加热水没过肉块，大火烧开转小火炖60分钟",
						"大火收汁10分钟，出锅装盘",
					],
					notes:
						"糖色又炒深了……而且炖的时间不够，肥肉部分还是硬的。妈妈说像在嚼橡皮筋。",
				},
				{
					version: 2,
					created_at: "2026-05-03",
					result: "perfect",
					ingredients: [
						{ name: "五花肉", amount: "500g" },
						{ name: "冰糖", amount: "35g" },
						{ name: "生抽", amount: "2勺" },
						{ name: "老抽", amount: "半勺" },
						{ name: "料酒", amount: "2勺" },
						{ name: "葱姜", amount: "适量" },
						{ name: "八角", amount: "2个" },
						{ name: "桂皮", amount: "1小块" },
						{ name: "香叶", amount: "2片" },
					],
					steps: [
						"五花肉切3cm见方块，冷水下锅加料酒焯水5分钟，捞出用冷水冲洗去浮沫",
						"热锅不放油，直接下五花肉中小火煸炒出油脂（约8分钟）",
						"盛出多余猪油，留底油，下冰糖小火炒至枣红色",
						"迅速下肉块翻炒上色",
						"加生抽、老抽、料酒翻炒均匀",
						"加热水（最好用开水）没过肉块2cm，放香料包",
						"大火烧开转小火盖盖炖75分钟",
						"开盖转大火收汁15分钟，不停翻炒防粘锅",
						"汤汁浓稠挂壁即可出锅",
					],
					notes:
						"这次先煸出猪油再炒糖色，炖足75分钟。入口即化！爷爷尝了说'有当年太奶奶的味道了'。全家一致通过。",
				},
			],
		},

		// ----- r003 葱油拌面（妈妈）-----
		{
			id: "r003",
			title: "葱油拌面",
			author_id: "m003",
			author_nickname: "妈妈",
			cover_image: "placeholder-scallion-noodles.svg",
			cuisine_type: "快手菜",
			meal_time: "lunch",
			difficulty: "easy",
			cooking_time: 15,
			tags: ["快手菜", "早餐", "深夜食堂"],
			current_version: 1,
			origin_story:
				"妈妈的葱油拌面是我从小吃到大的 comfort food。她说这是她上大学时在上海实习学的，一碗阳春面的进阶版。每次我不开心或者加班回来晚了，她就会煮一碗——葱油的香气飘出来，什么烦恼都没了。",
			secret_tips:
				"炸葱油一定要用小火慢炸，葱白先下葱绿后下，炸到葱绿变深黄但还没黑的时候关火，余温会让它刚好到位。面条要用细圆面，挂汁效果最好。",
			versions: [
				{
					version: 1,
					created_at: "2026-04-10",
					result: "okay",
					ingredients: [
						{ name: "小葱", amount: "6根" },
						{ name: "植物油", amount: "80ml" },
						{ name: "生抽", amount: "2勺" },
						{ name: "老抽", amount: "半勺" },
						{ name: "白糖", amount: "1小勺" },
						{ name: "细面条", amount: "1人份" },
					],
					steps: [
						"小葱洗净，葱白切段，葱绿切长段分开装",
						"锅中倒油，小火先下葱白炸2分钟",
						"再下葱绿继续炸至深黄色（约3分钟），关火余温焖1分钟",
						"碗中放生抽、老抽、白糖，倒入热葱油调成葱油酱汁",
						"另起锅煮面，面条熟后捞出过凉水沥干",
						"面条浇上葱油酱汁，撒上炸好的葱段，拌匀即可",
					],
					notes:
						"第一次独立做，味道有八成像妈妈的。葱炸得稍微有点过火，下次注意火候。",
				},
			],
		},

		// ----- r004 番茄鸡蛋汤（我）-----
		{
			id: "r004",
			title: "番茄鸡蛋汤",
			author_id: "m004",
			author_nickname: "我",
			cover_image: "placeholder-tomato-egg-soup.svg",
			cuisine_type: "快手菜",
			meal_time: "dinner",
			difficulty: "easy",
			cooking_time: 12,
			tags: ["复刻研究", "家常菜", "开胃"],
			current_version: 4,
			origin_story:
				"这道番茄鸡蛋汤看似简单，但我居然失败了三次。第一次蛋花散不成形，第二次番茄没炒出汁水寡淡无味，第三次盐放多了咸得没法喝。第四次我终于悟了——这碗汤的灵魂在于番茄要先炒出红油，蛋液要边倒边搅。有时候最简单的菜最难做好。",
			secret_tips:
				"番茄一定要先用油炒到软烂出红油再加水，这一步不能省。蛋液从高处细细淋入沸腾处，立刻关火，蛋花才会漂亮蓬松。",
			versions: [
				{
					version: 1,
					created_at: "2026-03-15",
					result: "failed",
					ingredients: [
						{ name: "番茄", amount: "2个" },
						{ name: "鸡蛋", amount: "2个" },
						{ name: "盐", amount: "适量" },
						{ name: "葱花", amount: "少许" },
					],
					steps: [
						"番茄切块，鸡蛋打散",
						"锅中加水烧开，放入番茄煮3分钟",
						"淋入蛋液，加盐调味",
						"撒葱花出锅",
					],
					notes: "蛋花全散了，像蛋花汤变成了蛋絮汤。而且番茄一点味道都没有。",
				},
				{
					version: 2,
					created_at: "2026-03-22",
					result: "failed",
					ingredients: [
						{ name: "番茄", amount: "2个" },
						{ name: "鸡蛋", amount: "2个" },
						{ name: "盐", amount: "适量" },
						{ name: "葱花", amount: "少许" },
						{ name: "油", amount: "少许" },
					],
					steps: [
						"番茄切块，鸡蛋打散",
						"热锅放油，下番茄炒软出汁",
						"加水烧开",
						"淋入蛋液，加盐调味",
						"撒葱花出锅",
					],
					notes:
						"好多了！番茄有味道了。但是盐手抖放多了……咸到怀疑人生。需要买个控盐瓶。",
				},
				{
					version: 3,
					created_at: "2026-04-05",
					result: "okay",
					ingredients: [
						{ name: "番茄", amount: "2个" },
						{ name: "鸡蛋", amount: "2个" },
						{ name: "盐", amount: "1小勺" },
						{ name: "葱花", amount: "少许" },
						{ name: "油", amount: "1勺" },
						{ name: "香油", amount: "几滴" },
					],
					steps: [
						"番茄切块，鸡蛋打散加少许盐",
						"热锅放油，下番茄炒至出红油软烂",
						"加热水烧开煮2分钟",
						"加盐调味",
						"蛋液从高处细细淋入，用筷子轻轻划散",
						"关火滴香油，撒葱花出锅",
					],
					notes:
						"终于能喝了！味道不错，就是蛋花还不够蓬松，感觉倒蛋液的技巧还需要练。",
				},
				{
					version: 4,
					created_at: "2026-04-18",
					result: "perfect",
					ingredients: [
						{ name: "番茄", amount: "2个（中等大小）" },
						{ name: "鸡蛋", amount: "2个" },
						{ name: "盐", amount: "2/3小勺" },
						{ name: "白糖", amount: "1/4小勺" },
						{ name: "葱花", amount: "少许" },
						{ name: "食用油", amount: "1勺" },
						{ name: "香油", amount: "3-4滴" },
					],
					steps: [
						"番茄顶部划十字，开水烫去皮后切成小块",
						"鸡蛋打入碗中，加1滴油和少许盐，充分打散（至少打30秒起泡）",
						"热锅凉油，中火下番茄块翻炒，边炒边按压",
						"炒至番茄完全软烂出红油（约3分钟），加少许白糖提鲜",
						"倒入热水（约400ml），大火烧开转小火煮2分钟让味道融合",
						"加盐调味（比预想的少一点，汤要清淡）",
						"转中大火保持微沸状态，将蛋液从筷子间细细呈线条状淋入",
						"蛋液凝固后立即关火（不超过5秒）",
						"滴入香油，撒葱花，即可盛碗",
					],
					notes:
						"完美！番茄炒出了浓郁的红色汤汁，蛋花薄如蝉翼漂浮在汤面上。妈妈喝了一碗说'比我做的好喝'——这可能是最高评价了。",
				},
			],
		},

		// ----- r005 蒜蓉蒸虾（妈妈）-----
		{
			id: "r005",
			title: "蒜蓉蒸虾",
			author_id: "m003",
			author_nickname: "妈妈",
			cover_image: "placeholder-garlic-shrimp.svg",
			cuisine_type: "粤菜",
			meal_time: "dinner",
			difficulty: "medium",
			cooking_time: 20,
			tags: ["粤菜", "宴客菜", "海鲜"],
			current_version: 2,
			origin_story:
				"妈妈是广东人，蒜蓉蒸虾是她拿手的粤式蒸菜。她说蒸菜讲究的是火候和时间的精准把控——多一分钟老，少一分钟生。这道菜是我们家招待客人的保留节目，每次端上桌大家都会先抢光。",
			secret_tips:
				"蒜蓉要分两次放——一半铺底一半撒面，这样上下都有味道。蒸的时候一定要水开后再上锅，计时严格控制在8分钟，多30秒虾肉就老了。",
			versions: [
				{
					version: 1,
					created_at: "2026-04-25",
					result: "okay",
					ingredients: [
						{ name: "大虾", amount: "8只" },
						{ name: "大蒜", amount: "1整头" },
						{ name: "生抽", amount: "1勺" },
						{ name: "蚝油", amount: "半勺" },
						{ name: "食用油", amount: "2勺" },
						{ name: "葱花", amount: "少许" },
					],
					steps: [
						"大虾去虾线开背，洗净沥干",
						"大蒜剁成蒜蓉",
						"热锅下油，小火炸蒜蓉至金黄",
						"蒜蓉中加入生抽、蚝油拌匀",
						"虾摆盘，铺上蒜蓉酱",
						"蒸锅水开后上锅蒸10分钟",
						"出锅撒葱花，淋热油激香",
					],
					notes:
						"味道不错但虾蒸久了有点老。下次缩短时间到8分钟试试。蒜蓉可以更香一些。",
				},
				{
					version: 2,
					created_at: "2026-05-12",
					result: "okay",
					ingredients: [
						{ name: "大虾", amount: "8只" },
						{ name: "大蒜", amount: "1整头" },
						{ name: "生抽", amount: "1勺" },
						{ name: "蚝油", amount: "半勺" },
						{ name: "白糖", amount: "少许" },
						{ name: "食用油", amount: "2勺" },
						{ name: "葱花", amount: "少许" },
						{ name: "小米辣", amount: "1个（可选）" },
					],
					steps: [
						"大虾去虾线开背，用刀拍平虾身使其能平躺在盘中",
						"大蒜剁成极细的蒜蓉（约米粒大小）",
						"取一半蒜蓉用冷油浸泡备用（生蒜蓉）",
						"热锅下油，小火炸另一半蒜蓉至浅金黄（约2分钟）",
						"将生熟蒜蓉混合，加生抽、蚝油、少许白糖拌匀",
						"虾摆盘，每个虾身上先铺一层蒜蓉酱",
						"蒸锅水开后上锅，严格蒸8分钟",
						"出锅撒葱花和小米辣圈",
						"烧热油至冒烟，淋在葱花上激香",
					],
					notes:
						"生熟蒜蓉混合的方法是跟酒楼师傅学的，确实更香了。虾肉Q弹，火候刚好。离完美还差一点点——蒜蓉的咸淡还可以再调。",
				},
			],
		},

		// ----- r006 酸辣土豆丝（爷爷）-----
		{
			id: "r006",
			title: "酸辣土豆丝",
			author_id: "m005",
			author_nickname: "爷爷",
			cover_image: "placeholder-potato-strips.svg",
			cuisine_type: "川菜",
			meal_time: "lunch",
			difficulty: "medium",
			cooking_time: 15,
			tags: ["川菜", "复刻研究", "下饭菜"],
			current_version: 3,
			origin_story:
				"爷爷年轻时候在四川待过几年，最爱吃的就是酸辣土豆丝。他说正宗的要做到'三透'——酸透、辣透、脆透。回老家后他一直想复刻这个味道，可惜试了好几次都差那么点意思。现在轮到我帮爷爷记录和迭代了。",
			secret_tips:
				"土豆丝切好后必须用水泡去淀粉，至少泡15分钟中间换一次水，这样炒出来才脆。醋要分两次加——第一次炝锅激发酸香，第二次出锅前提味。",
			versions: [
				{
					version: 1,
					created_at: "2026-04-28",
					result: "failed",
					ingredients: [
						{ name: "土豆", amount: "2个" },
						{ name: "干辣椒", amount: "5个" },
						{ name: "花椒", amount: "1小撮" },
						{ name: "醋", amount: "2勺" },
						{ name: "盐", amount: "适量" },
						{ name: "蒜末", amount: "适量" },
					],
					steps: [
						"土豆切丝",
						"热锅下干辣椒和花椒爆香",
						"下土豆丝大火翻炒",
						"加醋和盐调味",
						"炒至断生出锅",
					],
					notes:
						"土豆丝黏成一团了……完全没有脆感。爷爷说忘了泡水去淀粉，这是大忌。",
				},
				{
					version: 2,
					created_at: "2026-05-06",
					result: "failed",
					ingredients: [
						{ name: "土豆", amount: "2个" },
						{ name: "干辣椒", amount: "5个" },
						{ name: "花椒", amount: "1小撮" },
						{ name: "醋", amount: "2勺" },
						{ name: "盐", amount: "适量" },
						{ name: "蒜末", amount: "适量" },
						{ name: "青椒丝", amount: "少许" },
					],
					steps: [
						"土豆切丝，用清水泡10分钟",
						"热锅下油，干辣椒和花椒小火爆香",
						"下土豆丝大火快速翻炒",
						"加青椒丝同炒",
						"沿锅边烹入醋",
						"加盐调味，翻炒均匀出锅",
					],
					notes:
						"泡水后确实不黏了，但火候还是不对——炒太久了变成土豆泥口感了。而且醋放早了酸味不够突出。",
				},
				{
					version: 3,
					created_at: "2026-05-14",
					result: "failed",
					ingredients: [
						{ name: "黄心土豆", amount: "2个（大的）" },
						{ name: "干辣椒", amount: "6个" },
						{ name: "花椒", amount: "20粒左右" },
						{ name: "米醋", amount: "1.5勺" },
						{ name: "陈醋", amount: "半勺" },
						{ name: "盐", amount: "适量" },
						{ name: "蒜末", amount: "4瓣量" },
						{ name: "葱丝", amount: "少许" },
						{ name: "白芝麻", amount: "少许" },
					],
					steps: [
						"选黄心土豆（淀粉含量低更脆），切细丝（约2mm粗）",
						"立即放入清水中浸泡15分钟，中途换水一次",
						"捞出沥干水分（可用厨房纸吸干）",
						"干辣椒剪段，蒜切末",
						"热锅宽油（比平时炒菜多一倍），油温七成热",
						"下干辣椒和花椒小火炸10秒出香味",
						"转大火，迅速下土豆丝翻炒（全程大火约90秒）",
						"沿锅边淋入米醋（第一次醋，炝锅用）",
						"加蒜末、葱丝继续翻炒30秒",
						"加盐调味，再沿锅边淋少许陈醋（第二次醋，提味）",
						"撒白芝麻，翻匀立刻出锅（全程不超过2分半钟）",
					],
					notes:
						"这次技术上有进步——土豆丝脆度够了，酸辣也到位了。但爷爷说还差一个关键：刀工。我的土豆丝粗细不匀，导致受热不一致。需要练切功。虽然结果仍标为 failed（未达到爷爷心中的'完美标准'），但已经非常接近了。",
				},
			],
		},

		// ----- r007 清蒸鲈鱼（奶奶）-----
		{
			id: "r007",
			title: "清蒸鲈鱼",
			author_id: "m001",
			author_nickname: "奶奶",
			cover_image: "placeholder-steamed-fish.svg",
			cuisine_type: "粤菜",
			meal_time: "dinner",
			difficulty: "hard",
			cooking_time: 25,
			tags: ["粤菜", "宴客菜", "健康"],
			current_version: 2,
			origin_story:
				"奶奶做的清蒸鲈鱼在我们家族里是有名号的。她说蒸鱼有三个关键：鱼要新鲜、姜要去腥、豉油要现蒸。以前每年年夜饭桌上这条鱼是第一个被清空的菜。现在奶奶年纪大了站不了太久，这道菜的传承任务就交到了我们手上。",
			secret_tips:
				"鱼肚子里一定要塞满姜片和葱段，这是去腥的关键。蒸好后要把盘里的腥水倒掉再重新铺葱姜——很多人忽略这一步，所以总有一股腥味。",
			versions: [
				{
					version: 1,
					created_at: "2026-05-20",
					result: "okay",
					ingredients: [
						{ name: "鲈鱼", amount: "1条（约500g）" },
						{ name: "姜丝", amount: "适量" },
						{ name: "葱丝", amount: "适量" },
						{ name: "蒸鱼豉油", amount: "2勺" },
						{ name: "食用油", amount: "2勺" },
						{ name: "料酒", amount: "1勺" },
					],
					steps: [
						"鲈鱼处理干净，两面划几刀",
						"鱼身抹料酒，铺上姜丝",
						"蒸锅水开后上锅蒸12分钟",
						"取出倒掉蒸出的水",
						"铺上新鲜葱丝",
						"淋上蒸鱼豉油",
						"烧热油淋在葱上",
					],
					notes:
						"鱼稍微蒸过了一点点，最厚的部位肉有点紧。另外葱丝应该用滚水烫一下会更翠绿好看。味道整体不错，及格以上。",
				},
				{
					version: 2,
					created_at: "2026-06-02",
					result: "okay",
					ingredients: [
						{ name: "鲈鱼", amount: "1条（450-500g）" },
						{ name: "大葱", amount: "半根" },
						{ name: "姜", amount: "1小块" },
						{ name: "蒸鱼豉油", amount: "2勺" },
						{ name: "食用油", amount: "2勺" },
						{ name: "料酒", amount: "1勺" },
						{ name: "红椒丝", amount: "少许（装饰）" },
					],
					steps: [
						"鲈鱼处理干净，两面各斜划三刀（深至鱼骨但不切断）",
						"鱼身内外均匀抹薄薄一层料酒和盐（少量）",
						"姜片塞入鱼腹，鱼身底部垫两段大葱（架空便于蒸汽循环）",
						"鱼身上面铺姜片",
						"蒸锅水大开（非常重要！），上锅蒸8分钟（500g以内）",
						"关火虚蒸2分钟（不揭盖）",
						"取出鱼，倒掉盘中全部蒸鱼水（关键步骤！）",
						"摘去旧的姜葱，重新铺上烫过的葱丝和红椒丝",
						"均匀淋上蒸鱼豉油",
						"油烧热至微微冒烟，均匀淋在葱椒上",
					],
					notes:
						"这次控制了时间和倒掉了腥水，鱼肉嫩滑多了。葱丝用热水烫过后颜色很漂亮。奶奶尝了说'有八分像了'，剩下的两分大概就是那种说不清道不明的'手感'吧。",
				},
			],
		},

		// ----- r008 阳春面（我）-----
		{
			id: "r008",
			title: "阳春面",
			author_id: "m004",
			author_nickname: "我",
			cover_image: "placeholder-yangchun-noodles.svg",
			cuisine_type: "快手菜",
			meal_time: "breakfast",
			difficulty: "easy",
			cooking_time: 10,
			tags: ["快手菜", "早餐", "治愈系"],
			current_version: 1,
			origin_story:
				"阳春面是我学会的第一道正经面食。名字听着雅致——'阳春'二字指的是农历三月，寓意清汤配青葱如春日般清爽。其实它是最朴素的一碗面：猪油、酱油、高汤、细面、葱花。但越是简单越考验基本功。我现在每天早上给自己煮一碗，开启一天的好心情。",
			secret_tips:
				"灵魂在于那一勺猪油——不能用植物油替代。猪油化开后和酱油融合产生的香气是任何其他油给不了的。如果没有现成的猪油，可以用肥猪肉自己熬一小罐备着。",
			versions: [
				{
					version: 1,
					created_at: "2026-05-25",
					result: "perfect",
					ingredients: [
						{ name: "细圆面条", amount: "1人份（干面约80g）" },
						{ name: "猪油", amount: "1小勺" },
						{ name: "生抽", amount: "1.5勺" },
						{ name: "老抽", amount: "少许（调色）" },
						{ name: "鸡汤或骨汤", amount: "1碗（约300ml）" },
						{ name: "小葱", amount: "1根" },
						{ name: "盐", amount: "少许" },
					],
					steps: [
						"碗中放猪油、生抽、老抽和少许盐，调匀成底料",
						"烧一壶开水煮面备用",
						"另起锅加热高汤（或用浓汤宝+热水调制）至微沸",
						"舀两勺热高汤冲入底料碗中，化开猪油和调料",
						"面条煮至八成熟（约2-3分钟，中间还有一点白芯）",
						"捞出面条直接放入汤碗中",
						"倒入热高汤至九分满（不要淹没面条太多）",
						"撒上切碎的小葱花，趁热食用",
					],
					notes:
						"一次成功！可能因为之前做了很多次葱油拌面积累了经验。猪油+生抽+热汤的组合果然是经典中的经典。以后这就是我的固定早餐了。",
				},
			],
		},
	];

	/* ================================================================
	   复刻时间线（按日期倒序，覆盖所有菜谱的所有版本）
	   至少 15 条记录
	   ================================================================ */
	const replicaTimeline = [
		// r007 清蒸鲈鱼 v2
		{
			date: "2026-06-02",
			recipe_id: "r007",
			recipe_title: "清蒸鲈鱼",
			version: 2,
			result: "okay",
			notes: "控制了时间+倒掉腥水，奶奶说有八分像了",
			author: "我",
		},
		// r007 清蒸鲈鱼 v1
		{
			date: "2026-05-20",
			recipe_id: "r007",
			recipe_title: "清蒸鲈鱼",
			version: 1,
			result: "okay",
			notes: "鱼稍微蒸过了，葱丝应该烫一下更好看",
			author: "我",
		},
		// r008 阳春面 v1
		{
			date: "2026-05-25",
			recipe_id: "r008",
			recipe_title: "阳春面",
			version: 1,
			result: "perfect",
			notes: "一次成功！猪油+生抽+热汤的经典组合",
			author: "我",
		},
		// r005 蒜蓉蒸虾 v2
		{
			date: "2026-05-12",
			recipe_id: "r005",
			recipe_title: "蒜蓉蒸虾",
			version: 2,
			result: "okay",
			notes: "生熟蒜蓉混合方法学自酒楼师傅，虾肉Q弹",
			author: "妈妈",
		},
		// r006 酸辣土豆丝 v3
		{
			date: "2026-05-14",
			recipe_id: "r006",
			recipe_title: "酸辣土豆丝",
			version: 3,
			result: "failed",
			notes: "脆度和酸辣到位了，但刀工还需练习——粗细不匀导致受热不一",
			author: "我",
		},
		// r001 糖醋排骨 v3 -- 完美！
		{
			date: "2026-05-15",
			recipe_id: "r001",
			recipe_title: "糖醋排骨",
			version: 3,
			result: "perfect",
			notes: "终于做出奶奶的味道了！生抽老抽配比+小火炒糖色+八角提香",
			author: "我",
		},
		// r006 酸辣土豆丝 v2
		{
			date: "2026-05-06",
			recipe_id: "r006",
			recipe_title: "酸辣土豆丝",
			version: 2,
			result: "failed",
			notes: "泡水后不黏了，但炒太久变成土豆泥口感，醋放早了",
			author: "我",
		},
		// r002 红烧肉 v2 -- 完美！
		{
			date: "2026-05-03",
			recipe_id: "r002",
			recipe_title: "红烧肉",
			version: 2,
			result: "perfect",
			notes: "先煸猪油再炒糖色，炖足75分钟。爷爷说有太奶奶的味道了！",
			author: "爸爸",
		},
		// r005 蒜蓉蒸虾 v1
		{
			date: "2026-04-25",
			recipe_id: "r005",
			recipe_title: "蒜蓉蒸虾",
			version: 1,
			result: "okay",
			notes: "味道不错但蒸久了虾肉偏老，下次缩到8分钟",
			author: "妈妈",
		},
		// r006 酸辣土豆丝 v1
		{
			date: "2026-04-28",
			recipe_id: "r006",
			recipe_title: "酸辣土豆丝",
			version: 1,
			result: "failed",
			notes: "土豆丝黏成一团！爷爷说忘了泡水去淀粉是大忌",
			author: "我",
		},
		// r004 番茄鸡蛋汤 v4 -- 完美！
		{
			date: "2026-04-18",
			recipe_id: "r004",
			recipe_title: "番茄鸡蛋汤",
			version: 4,
			result: "perfect",
			notes: "完美！蛋花薄如蝉翼，妈妈说比她做的好喝",
			author: "我",
		},
		// r004 番茄鸡蛋汤 v3
		{
			date: "2026-04-05",
			recipe_id: "r004",
			recipe_title: "番茄鸡蛋汤",
			version: 3,
			result: "okay",
			notes: "终于能喝了！蛋花还不够蓬松，倒蛋液技巧需练",
			author: "我",
		},
		// r003 葱油拌面 v1
		{
			date: "2026-04-10",
			recipe_id: "r003",
			recipe_title: "葱油拌面",
			version: 1,
			result: "okay",
			notes: "第一次独立做，有八成像妈妈的。葱炸得稍过火",
			author: "我",
		},
		// r004 番茄鸡蛋汤 v2
		{
			date: "2026-03-22",
			recipe_id: "r004",
			recipe_title: "番茄鸡蛋汤",
			version: 2,
			result: "failed",
			notes: "番茄有味道了但盐手抖放多了……咸到怀疑人生",
			author: "我",
		},
		// r002 红烧肉 v1
		{
			date: "2026-04-20",
			recipe_id: "r002",
			recipe_title: "红烧肉",
			version: 1,
			result: "failed",
			notes: "糖色炒深了且炖时不够，肥肉像橡皮筋",
			author: "爸爸",
		},
		// r004 番茄鸡蛋汤 v1
		{
			date: "2026-03-15",
			recipe_id: "r004",
			recipe_title: "番茄鸡蛋汤",
			version: 1,
			result: "failed",
			notes: "蛋花全散了像蛋絮汤，番茄一点味道没有",
			author: "我",
		},
		// r001 糖醋排骨 v2
		{
			date: "2026-05-08",
			recipe_id: "r001",
			recipe_title: "糖醋排骨",
			version: 2,
			result: "okay",
			notes: "减少冰糖+出锅前加醋，甜度改善但仍带苦底",
			author: "我",
		},
		// r001 糖醋排骨 v1
		{
			date: "2026-05-01",
			recipe_id: "r001",
			recipe_title: "糖醋排骨",
			version: 1,
			result: "failed",
			notes: "第一次按网上教程，糖色炒过了发苦",
			author: "我",
		},
	];

	/* ================================================================
	   AI 避坑指南（按菜谱 ID 索引）
	   每道有 >=2 个版本的菜都有对应指南
	   ================================================================ */
	const pitfallGuides = {
		r001: {
			generated_at: "2026-05-15",
			total_attempts: 3,
			summary:
				"经过 3 次复刻迭代，糖醋排骨的核心难点在于糖色控制和调味层次搭配。",
			findings: [
				{
					pattern: "糖色炒制",
					problem: "v1/v2 都出现发苦问题",
					cause: "大火炒糖色超过30秒易焦化产生苦味",
					solution:
						"改用中小火，延长至40-45秒，炒至琥珀色而非深棕色。看到泡泡变小、颜色从透明→金黄→琥珀时立刻下肉",
					confidence: "高",
				},
				{
					pattern: "糖量控制",
					problem: "v1 冰糖30g偏甜且有苦底",
					cause: "糖量与排骨比例不当，过量糖焦化加剧苦味",
					solution:
						"冰糖控制在20g左右（每500g排骨），配合生抽老抽调色替代纯酱油，减少糖的负担",
					confidence: "高",
				},
				{
					pattern: "醋的投放时机",
					problem: "v1 醋和酱油一起加导致酸味挥发",
					cause: "醋酸易挥发，高温长时间加热后损失殆尽",
					solution:
						"醋必须在出锅前最后一步沿锅边淋入，利用余温激发醋香而不被蒸发",
					confidence: "高",
				},
				{
					pattern: "香料增层",
					problem: "v3 新增八角后风味明显提升",
					cause: "单一调味缺乏层次感，八角提供复合芳香",
					solution:
						"建议加1颗八角同焖，出锅撒白芝麻增香。香料不宜多，1-2种即可",
					confidence: "中",
				},
			],
		},

		r002: {
			generated_at: "2026-05-03",
			total_attempts: 2,
			summary: "红烧肉的难点在于肥肉口感——需要足够的煸炒和炖煮时间来分解脂肪。",
			findings: [
				{
					pattern: "预处理-煸油",
					problem: "v1 肥肉嚼不动如橡皮筋",
					cause: "仅焯水未煸炒，皮下脂肪未溶出，长时间炖煮也无法软化结缔组织",
					solution:
						"焯水后先不放油，直接中小火煸五花肉8分钟逼出大部分猪油，再进行后续步骤",
					confidence: "高",
				},
				{
					pattern: "糖色深度",
					problem: "v1 糖色炒到深棕色导致苦味",
					cause: "红烧肉本身炖煮时间长，深色糖色在长时间加热中持续焦化",
					solution:
						"糖色炒至枣红色即可（比糖醋排骨的琥珀色略深），不要等到深棕。后续老抽会继续加深色泽",
					confidence: "高",
				},
				{
					pattern: "炖煮时长",
					problem: "v1 炖60分钟不够",
					cause: "五花肉的胶原蛋白和脂肪需要足够时间转化为明胶",
					solution:
						"建议炖煮75-90分钟（视肉块大小），用开水而非冷水加锅盖小火慢炖",
					confidence: "高",
				},
				{
					pattern: "收汁技巧",
					problem: "v2 收汁阶段需要持续关注",
					cause: "糖分浓缩后期极易粘锅糊底",
					solution:
						"最后15分钟开盖大火收汁，需不停翻炒。汤汁浓稠至挂在铲子上缓慢滴落即可",
					confidence: "中",
				},
			],
		},

		r004: {
			generated_at: "2026-04-18",
			total_attempts: 4,
			summary:
				"番茄鸡蛋汤经历了 4 次迭代，看似最简单的菜却暴露了多个基础烹饪盲区。",
			findings: [
				{
					pattern: "番茄预处理",
					problem: "v1 直接水煮番茄无味道",
					cause:
						"番茄的风味物质（番茄红素、谷氨酸）是脂溶性的，需要油炒才能释放",
					solution:
						"番茄必须去皮后用油炒至软烂出红油（约3分钟），这是整碗汤风味的基础",
					confidence: "高",
				},
				{
					pattern: "蛋花成型",
					problem: "v1 蛋液倒入后散乱不成花",
					cause: "蛋液未被充分打散，且倒入方式不当",
					solution:
						"蛋液加少许油和盐打30秒以上至起细腻泡沫；从筷子缝隙或勺背高处细线状淋入沸腾中心",
					confidence: "高",
				},
				{
					pattern: "盐量控制",
					problem: "v2 盐放多了无法补救",
					cause: "液体类菜品盐的感知浓度高于固体菜，且无法通过加料稀释",
					solution:
						"汤类盐量应为预期的一半左右（本例2/3小勺足够），遵循'可少不可多'原则",
					confidence: "高",
				},
				{
					pattern: "双醋策略",
					problem: "v3 开始探索酸甜平衡",
					cause: "纯番茄酸味有时过于尖锐，需要糖来中和",
					solution:
						"加少许白糖（1/4小勺）提鲜平衡酸度，这是专业厨房常用的'底味调和'手法",
					confidence: "中",
				},
				{
					pattern: "关火时机",
					problem: "v4 掌握了最佳时机",
					cause: "蛋花在过度加热后会变老收缩失去蓬松感",
					solution:
						"蛋液淋入后最多5秒内关火，利用余温使蛋花定型。这是蛋花漂亮的终极秘诀",
					confidence: "高",
				},
			],
		},

		r005: {
			generated_at: "2026-05-12",
			total_attempts: 2,
			summary: "蒜蓉蒸虾的核心在于蒜蓉的处理方式和精确的蒸制时间控制。",
			findings: [
				{
					pattern: "蒜蓉处理-生熟混合",
					problem: "v1 单一蒜蓉香味不足",
					cause: "全熟蒜蓉只有焦香，全生蒜蓉只有辛辣，单一方式层次单薄",
					solution:
						"一半蒜蓉冷油浸泡保持生蒜辛辣，另一半小火炸至金黄产生焦香，两者混合后风味立体",
					confidence: "高",
				},
				{
					pattern: "蒸制时间",
					problem: "v1 蒸10分钟虾肉偏老",
					cause: "虾肉蛋白质在高温下快速老化，超过8分钟明显变韧",
					solution:
						"严格控制8分钟（500g以内的大虾），宁可略欠不可过头。蒸好后虚蒸1分钟再开盖",
					confidence: "高",
				},
				{
					pattern: "激油温度",
					problem: "激油环节决定最终香气爆发力",
					cause: "油温不足则葱椒不出香，过高则容易焦苦",
					solution:
						"油烧至开始微微冒烟（约200°C）时淋下，能瞬间激发葱椒香气并给蒜蓉二次加热",
					confidence: "中",
				},
			],
		},

		r006: {
			generated_at: "2026-05-14",
			total_attempts: 3,
			summary:
				"酸辣土豆丝历经 3 次失败迭代，至今仍未达到'完美'标准——刀工是最后的瓶颈。",
			findings: [
				{
					pattern: "淀粉去除",
					problem: "v1 土豆丝黏成一团",
					cause: "土豆富含淀粉，接触热油后淀粉糊化产生粘性",
					solution:
						"切后立即清水浸泡15分钟并换水一次，彻底洗去表面淀粉。下锅前务必沥干/吸干水分",
					confidence: "高",
				},
				{
					pattern: "火候与速度",
					problem: "v2 炒太久变土豆泥",
					cause: "土豆丝细软，超过2分钟必然软烂失脆",
					solution:
						"全程大火，从下锅到出锅控制在2-2.5分钟内。提前备好所有调料，中途不加东西",
					confidence: "高",
				},
				{
					pattern: "双醋技法",
					problem: "v2 酸味不够突出",
					cause: "醋一次性加入在高温中快速挥发",
					solution:
						"采用'一炝一提'法：第一次沿锅边烹入激发酸香（炝锅），第二次出锅前提味（提鲜）",
					confidence: "高",
				},
				{
					pattern: "刀工均一性",
					problem: "v3 最终瓶颈——粗细不匀",
					cause: "手工切土豆丝难以保证每根粗细一致，导致受热程度不同",
					solution:
						"长期方案：练习切工，目标粗细约2mm且均匀。短期可用擦丝器代替（但口感略差于手切）",
					confidence: "中",
				},
				{
					pattern: "选材差异",
					problem: "不同品种土豆效果差异大",
					cause: "黄心土豆淀粉含量低于白心土豆，更适合做酸辣土豆丝",
					solution:
						"优先选择黄心土豆（外表偏黄肉质偏黄），其淀粉含量低、口感更脆",
					confidence: "中",
				},
			],
		},

		r007: {
			generated_at: "2026-06-02",
			total_attempts: 2,
			summary: "清蒸鲈鱼的要点在于蒸制时间精准控制和去腥水的关键操作。",
			findings: [
				{
					pattern: "蒸制时间",
					problem: "v1 蒸12分钟鱼肉偏紧",
					cause: "鱼最厚部位需要更多热量穿透，但整体过热导致边缘过老",
					solution:
						"500g以内的鲈鱼蒸8分钟+虚蒸2分钟=最佳。超500g可适当延长至9-10分钟",
					confidence: "高",
				},
				{
					pattern: "去腥水",
					problem: "v1 未倒掉蒸鱼水导致残留腥味",
					cause:
						"蒸制过程中鱼体内的血水和胺类物质溶于水中留在盘底，带有强烈腥味",
					solution:
						"蒸好后必须倒掉盘中全部汤汁（关键！），然后重新铺葱姜淋豉油。这一步不可省略",
					confidence: "高",
				},
				{
					pattern: "葱绿处理",
					problem: "v1 葱丝蒸后发黄影响卖相",
					cause: "绿色蔬菜叶绿素在高温蒸汽下快速降解变黄",
					solution:
						"葱丝/红椒丝在出锅后才铺上，或者用热水焯烫3秒后再铺。保持翠绿配色",
					confidence: "中",
				},
				{
					pattern: "架空蒸制",
					problem: "v2 改善了蒸汽循环",
					cause: "鱼贴盘底导致底部受热不均且积水",
					solution: "鱼身底下垫两段大葱或姜片架空，利于蒸汽360度环绕均匀受热",
					confidence: "中",
				},
			],
		},
	};

	/* ================================================================
	   膳食规划（当前周完整7天 x 4餐 = 28格子）
	   部分填充展示可编辑状态
	   ================================================================ */
	const mealPlan = {
		"2026-W25": {
			monday: {
				breakfast: {
					recipe_id: "r008",
					recipe_title: "阳春面",
					note: "快手早餐",
					editable: true,
				},
				lunch: {
					recipe_id: "r006",
					recipe_title: "酸辣土豆丝",
					note: "配米饭",
					editable: true,
				},
				dinner: {
					recipe_id: "r001",
					recipe_title: "糖醋排骨",
					note: "周末加菜",
					editable: true,
				},
				snack: null,
			},
			tuesday: {
				breakfast: {
					recipe_id: "r003",
					recipe_title: "葱油拌面",
					note: "",
					editable: true,
				},
				lunch: null,
				dinner: {
					recipe_id: "r004",
					recipe_title: "番茄鸡蛋汤",
					note: "配馒头",
					editable: true,
				},
				snack: null,
			},
			wednesday: {
				breakfast: null,
				lunch: {
					recipe_id: "r005",
					recipe_title: "蒜蓉蒸虾",
					note: "妈妈做",
					editable: true,
				},
				dinner: {
					recipe_id: "r002",
					recipe_title: "红烧肉",
					note: "爸爸掌勺",
					editable: true,
				},
				snack: null,
			},
			thursday: {
				breakfast: {
					recipe_id: "r008",
					recipe_title: "阳春面",
					note: "",
					editable: true,
				},
				lunch: null,
				dinner: {
					recipe_id: "r007",
					recipe_title: "清蒸鲈鱼",
					note: "奶奶的拿手菜",
					editable: true,
				},
				snack: null,
			},
			friday: {
				breakfast: null,
				lunch: {
					recipe_id: "r003",
					recipe_title: "葱油拌面",
					note: "加班简餐",
					editable: true,
				},
				dinner: null,
				snack: null,
			},
			saturday: {
				breakfast: {
					recipe_id: "r008",
					recipe_title: "阳春面",
					note: "周末懒觉后的早餐",
					editable: true,
				},
				lunch: {
					recipe_id: "r001",
					recipe_title: "糖醋排骨",
					note: "家人聚餐",
					editable: true,
				},
				dinner: {
					recipe_id: "r005",
					recipe_title: "蒜蓉蒸虾",
					note: "",
					editable: true,
				},
				snack: {
					recipe_id: "r004",
					recipe_title: "番茄鸡蛋汤",
					note: "夜宵",
					editable: true,
				},
			},
			sunday: {
				breakfast: null,
				lunch: {
					recipe_id: "r007",
					recipe_title: "清蒸鲈鱼",
					note: "周日家宴主菜",
					editable: true,
				},
				dinner: {
					recipe_id: "r002",
					recipe_title: "红烧肉",
					note: "剩菜回锅",
					editable: true,
				},
				snack: null,
			},
		},
	};

	/* ================================================================
	   购物清单
	   从膳食规划食材中自动生成部分 + 手动添加
	   ================================================================ */
	const shoppingList = {
		id: "sl001",
		name: "本周采购（第25周）",
		items: [
			{
				id: "si001",
				name: "排骨",
				quantity: "600g",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "糖醋排骨+红烧肉共用",
			},
			{
				id: "si002",
				name: "五花肉",
				quantity: "500g",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "红烧肉用",
			},
			{
				id: "si003",
				name: "鲈鱼",
				quantity: "2条",
				unit: "",
				checked: true,
				checked_by: "爸爸",
				price: 56,
				note: "已买，清蒸用",
			},
			{
				id: "si004",
				name: "大虾",
				quantity: "16只",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "蒜蓉蒸虾，两天份",
			},
			{
				id: "si005",
				name: "土豆",
				quantity: "4个",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "酸辣土豆丝",
			},
			{
				id: "si006",
				name: "番茄",
				quantity: "6个",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "番茄鸡蛋汤",
			},
			{
				id: "si007",
				name: "鸡蛋",
				quantity: "10个",
				unit: "",
				checked: true,
				checked_by: "妈妈",
				price: 18,
				note: "常备",
			},
			{
				id: "si008",
				name: "细面条",
				quantity: "2把",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "阳春面+葱油拌面",
			},
			{
				id: "si009",
				name: "小葱",
				quantity: "10根",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "大量消耗品",
			},
			{
				id: "si010",
				name: "大蒜",
				amount: "2头",
				quantity: "2头",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "蒜蓉蒸虾+凉拌菜",
			},
			{
				id: "si011",
				name: "冰糖",
				quantity: "100g",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "糖醋排骨+红烧肉",
			},
			{
				id: "si012",
				name: "生姜",
				quantity: "1块",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "常备调料",
			},
			{
				id: "si013",
				name: "生抽",
				quantity: "1瓶",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "快用完了",
			},
			{
				id: "si014",
				name: "猪油",
				quantity: "1小罐",
				unit: "",
				checked: false,
				checked_by: null,
				price: null,
				note: "阳春面必备",
			},
		],
	};

	/* ================================================================
	   库存（冰箱食材）
	   8-12 种常见食材，含过期预警
	   ================================================================ */
	const inventory = [
		{
			id: "inv001",
			name: "排骨",
			quantity: "500g",
			location: "fridge",
			expire_date: "2026-06-19",
			image_path: null,
		},
		{
			id: "inv002",
			name: "鸡蛋",
			quantity: "10个",
			location: "fridge",
			expire_date: "2026-06-25",
			image_path: null,
		},
		{
			id: "inv003",
			name: "番茄",
			quantity: "3个",
			location: "fridge",
			expire_date: "2026-06-18",
			image_path: null,
		}, // 快过期
		{
			id: "inv004",
			name: "鲈鱼",
			quantity: "1条",
			location: "fridge",
			expire_date: "2026-06-17",
			image_path: null,
		}, // 今天到期！
		{
			id: "inv005",
			name: "大葱",
			quantity: "3根",
			location: "fridge",
			expire_date: "2026-06-20",
			image_path: null,
		},
		{
			id: "inv006",
			name: "生姜",
			quantity: "1块",
			location: "pantry",
			expire_date: "2026-07-15",
			image_path: null,
		},
		{
			id: "inv007",
			name: "大蒜",
			quantity: "1头",
			location: "pantry",
			expire_date: "2026-07-10",
			image_path: null,
		},
		{
			id: "inv008",
			name: "土豆",
			quantity: "3个",
			location: "pantry",
			expire_date: "2026-07-01",
			image_path: null,
		},
		{
			id: "inv009",
			name: "冷冻饺子",
			quantity: "1袋（12个）",
			location: "freezer",
			expire_date: "2026-08-15",
			image_path: null,
		},
		{
			id: "inv010",
			name: "五花肉",
			quantity: "300g",
			location: "freezer",
			expire_date: "2026-07-20",
			image_path: null,
		},
		{
			id: "inv011",
			name: "老抽",
			quantity: "半瓶",
			location: "pantry",
			expire_date: "2026-12-31",
			image_path: null,
		},
		{
			id: "inv012",
			name: "细面条",
			quantity: "1把",
			location: "pantry",
			expire_date: "2026-08-01",
			image_path: null,
		},
	];

	/* ================================================================
	   导出到全局命名空间
	   ================================================================ */
	window.FamTaste = window.FamTaste || {};
	window.FamTaste.Data = {
		family: family,
		members: members,
		recipes: recipes,
		replicaTimeline: replicaTimeline,
		pitfallGuides: pitfallGuides,
		mealPlan: mealPlan,
		shoppingList: shoppingList,
		inventory: inventory,
	};

	/* ================================================================
	   调试输出：数据概要
	   ================================================================ */
	console.log("[FamTaste] Mock 数据层 V2 加载完成");
	console.log("========================================");
	console.log(`  家庭: ${family.name} (${family.id})`);
	console.log(`  成员: ${members.length} 人`);
	console.log(`    ${members.map((m) => m.nickname).join(" / ")}`);
	console.log(`  菜谱: ${recipes.length} 道`);
	recipes.forEach((r) => {
		console.log(
			`    [${r.id}] ${r.title} — ${r.author_nickname} / ${r.cuisine_type} / v${r.current_version} (${r.versions[r.versions.length - 1].result})`,
		);
	});
	console.log(`  复刻时间线: ${replicaTimeline.length} 条记录`);
	console.log(`  避坑指南: ${Object.keys(pitfallGuides).length} 道菜`);
	console.log(
		`  膳食规划: 第${Object.keys(mealPlan)[0]}周 (${Object.keys(mealPlan["2026-W25"]).length} 天)`,
	);
	console.log(
		`  购物清单: ${shoppingList.items.length} 项 (${shoppingList.items.filter((i) => i.checked).length} 已购)`,
	);
	console.log(`  库存: ${inventory.length} 种食材`);
	// 库存预警
	const _today = "2026-06-17";
	const expiringSoon = inventory.filter(
		(item) => item.expire_date <= "2026-06-20",
	);
	if (expiringSoon.length > 0) {
		console.log(`  ⚠ 库存预警: ${expiringSoon.length} 种食材即将过期`);
		expiringSoon.forEach((item) => {
			console.log(`    → ${item.name} (到期: ${item.expire_date})`);
		});
	}
	console.log("========================================");
})();
