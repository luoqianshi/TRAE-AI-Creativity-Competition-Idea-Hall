import { request } from './api.js'
import { formatI18nText, tt } from './i18n.js'

// 全局共享数据层 - 使用 uni.getStorageSync / setStorageSync 持久化
const STORAGE_KEYS = {
	OC_LIST: 'oc_list',
	WORLD_DATA: 'oc_world',
	RELATIONS: 'oc_relations',
	USER_PROFILE: 'oc_user_profile',
	CHAT_MESSAGES: 'oc_chat_messages',
	SIGN_RECORDS: 'oc_sign_records',
	FORTUNE_TODAY: 'oc_fortune_today',
	MEMORIES: 'oc_memories',
	CART_ITEMS: 'oc_cart_items',
	FORUM_POSTS: 'oc_forum_posts',
	ACTIVITIES: 'oc_activities',
	ACCOUNTS: 'oc_accounts',
	CURRENT_USER: 'oc_current_user',
	AUTH_TOKEN: 'oc_auth_token',
	AUTH_USER: 'oc_auth_user',
	WATERMARK_PRESETS: 'oc_watermark_presets',
	PROMPT_TEMPLATES: 'oc_prompt_templates',
	COMMISSIONS: 'oc_commissions',
}

const DEV_AUTH_ENABLED = false
const DEV_AUTH_USER = {
	id: 0,
	username: 'dev',
	phone: '13900000000',
	nickname: '开发者',
	phone_verified: true,
}

// ---------- 默认数据 ----------
const DEFAULT_OC_LIST = []

// 可选配色方案（新建 OC 时选用）
const OC_THEMES = [
	{ name: '暗夜紫', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', barColor: '#a78bfa' },
	{ name: '樱花粉', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', barColor: '#f472b6' },
	{ name: '天空蓝', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', barColor: '#38bdf8' },
	{ name: '薰衣草', gradient: 'linear-gradient(135deg, #c084fc 0%, #a78bfa 100%)', barColor: '#c084fc' },
	{ name: '玫瑰金', gradient: 'linear-gradient(135deg, #FFB6C1 0%, #c084fc 100%)', barColor: '#f9a8d4' },
	{ name: '星空靛', gradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', barColor: '#818cf8' },
]

const DEFAULT_WORLD_DATA = {
	name: '',
	desc: '',
	powerSystem: '',
}

const DEFAULT_RELATIONS = []

const DEFAULT_USER_PROFILE = {
	nickname: '新契约者',
	mood: '初次来到这个世界...',
	avatar: '',
	phone: '',
	phoneVerified: false,
	level: 1,
	exp: 0,
	vip: false,
	ocCount: 3,
	interactDays: 0,
	settingCount: 0,
	totalRevenue: 0,
	monthRevenue: 0,
	pendingWithdraw: 0,
	monthViews: 0,
	newFollowers: 0,
	interactRate: 0,
}

const FORTUNES = [
	{ level: '大吉', desc: '你的 OC 今天活力满满！创作灵感将如泉涌般到来！', color: '#f59e0b', lucky: '金色', luckyNum: 7 },
	{ level: '中吉', desc: 'OC 与你心灵相通，适合展开深度对话～', color: '#10b981', lucky: '绿色', luckyNum: 3 },
	{ level: '小吉', desc: '平静的一天，适合整理 OC 的设定和背景故事。', color: '#60a5fa', lucky: '蓝色', luckyNum: 5 },
	{ level: '吉', desc: '今天宜交友，分享你的 OC 给更多人认识吧！', color: '#a78bfa', lucky: '紫色', luckyNum: 9 },
	{ level: '末吉', desc: '虽然灵感不多，但和 OC 聊天能获得意外惊喜哦～', color: '#fb923c', lucky: '橙色', luckyNum: 2 },
	{ level: '大大吉', desc: '超级幸运日！无论做什么都会顺利，快去创作吧！', color: '#ec4899', lucky: '粉色', luckyNum: 8 },
]

const RELATION_TYPES = ['挚友', '宿敌', '师徒', '恋人', '同伴', '家人', '契约者', '同盟', '暧昧', '执念', '前任', '血缘', '对手', '主从']
const RELATION_COLORS = ['#f472b6', '#38bdf8', '#fb923c', '#ec4899', '#a78bfa', '#34d399', '#f59e0b', '#6366f1', '#f9a8d4', '#7c3aed', '#9ca3af', '#dc2626', '#0ea5e9', '#8b5cf6']
const RELATION_EMOJIS = ['🌸', '💎', '🔥', '💕', '⭐', '🏠', '📜', '🤝', '💗', '🔮', '💔', '🩸', '⚔️', '👑']

// ---------- 商品目录 ----------
const SHOP_PRODUCTS = [
	{ id: 1, name: '定制 OC 亚克力立牌', emoji: '🏷️', price: 68, desc: '高清印刷，还原你的 OC 形象', status: '去购买', printArea: { width: 280, height: 380, shape: 'rect', label: '立牌正面' } },
	{ id: 2, name: 'OC 主题手机壳', emoji: '📱', price: 128, desc: '硬壳/软壳可选，支持全型号', status: '去购买', printArea: { width: 260, height: 480, shape: 'round-rect', label: '手机壳背面' } },
	{ id: 3, name: '限定版 OC 抱枕', emoji: '🛏️', price: 198, desc: '45cm 双面印刷，柔软亲肤', status: '预售中', printArea: { width: 360, height: 360, shape: 'rect', label: '抱枕正面' } },
	{ id: 4, name: 'OC 角色 NFC 手办', emoji: '🎭', price: 328, desc: '内置 NFC 芯片，触碰解锁专属语音', status: '去购买', printArea: { width: 240, height: 320, shape: 'rect', label: '手办底座' } },
	{ id: 5, name: '定制签名海报', emoji: '🖼️', price: 48, desc: 'A3 尺寸铜版纸，含角色签名', status: '去购买', printArea: { width: 300, height: 420, shape: 'rect', label: '海报区域' } },
	{ id: 6, name: 'OC 主题马克杯', emoji: '☕', price: 58, desc: '陶瓷变色杯，遇热显现角色立绘', status: '去购买', printArea: { width: 400, height: 240, shape: 'rect', label: '杯身展开面' } },
	{ id: 7, name: '角色主题文具套装', emoji: '✏️', price: 38, desc: '含笔记本、贴纸、书签、中性笔', status: '去购买', printArea: { width: 300, height: 360, shape: 'rect', label: '笔记本封面' } },
	{ id: 8, name: 'OC 定制钥匙扣', emoji: '🔑', price: 28, desc: '金属材质，双面浮雕工艺', status: '去购买', printArea: { width: 200, height: 200, shape: 'circle', label: '钥匙扣正面' } },
]

// ---------- 存取方法 ----------
// 全局存取（账号列表、当前登录用户等不区分账号的数据）
function globalLoad(key, defaultVal) {
	try {
		const raw = uni.getStorageSync(key)
		if (raw) return JSON.parse(raw)
	} catch (e) { }
	return JSON.parse(JSON.stringify(defaultVal))
}

function globalSave(key, val) {
	uni.setStorageSync(key, JSON.stringify(val))
}

// 获取当前用户前缀，用于隔离不同账号的数据
function getUserKeyPrefix() {
	try {
		const raw = uni.getStorageSync(STORAGE_KEYS.CURRENT_USER)
		if (raw) return JSON.parse(raw) + ':'
	} catch (e) { }
	return ''
}

// 用户级存取（OC、聊天、签到等随账号隔离的数据）
function load(key, defaultVal) {
	return globalLoad(getUserKeyPrefix() + key, defaultVal)
}

function save(key, val) {
	globalSave(getUserKeyPrefix() + key, val)
}

// ---------- OC 列表 ----------
export function getOCList() {
	return load(STORAGE_KEYS.OC_LIST, DEFAULT_OC_LIST)
}
export function saveOCList(list) {
	save(STORAGE_KEYS.OC_LIST, list)
}
export function getOCById(id) {
	return getOCList().find(oc => oc.id === id) || null
}
export function updateOC(updated) {
	const list = getOCList()
	const idx = list.findIndex(oc => oc.id === updated.id)
	if (idx >= 0) list[idx] = updated
	else list.push(updated)
	saveOCList(list)
}
export function deleteOC(id) {
	const list = getOCList().filter(oc => oc.id !== id)
	saveOCList(list)
	// 同时清理该 OC 的聊天记录
	try { uni.removeStorageSync(getUserKeyPrefix() + STORAGE_KEYS.CHAT_MESSAGES + '_' + id) } catch (e) { }
}

// ---------- OC 素材管理 ----------
export function addOCImage(ocId, path) {
	const list = getOCList()
	const oc = list.find(o => o.id === ocId)
	if (!oc) return list
	if (!oc.images) oc.images = []
	oc.images.push({ id: Date.now(), path, desc: '' })
	saveOCList(list)
	return list
}
export function removeOCImage(ocId, imageId) {
	const list = getOCList()
	const oc = list.find(o => o.id === ocId)
	if (!oc || !oc.images) return list
	oc.images = oc.images.filter(i => i.id !== imageId)
	saveOCList(list)
	return list
}
export function addOCVideo(ocId, path) {
	const list = getOCList()
	const oc = list.find(o => o.id === ocId)
	if (!oc) return list
	if (!oc.videos) oc.videos = []
	oc.videos.push({ id: Date.now(), path, desc: '' })
	saveOCList(list)
	return list
}
export function removeOCVideo(ocId, videoId) {
	const list = getOCList()
	const oc = list.find(o => o.id === ocId)
	if (!oc || !oc.videos) return list
	oc.videos = oc.videos.filter(v => v.id !== videoId)
	saveOCList(list)
	return list
}

// ---------- 世界观 ----------
export function getWorldData() {
	return load(STORAGE_KEYS.WORLD_DATA, DEFAULT_WORLD_DATA)
}
export function saveWorldData(data) {
	save(STORAGE_KEYS.WORLD_DATA, data)
}

// ---------- 关系网 ----------
export function getRelations() {
	return load(STORAGE_KEYS.RELATIONS, DEFAULT_RELATIONS)
}
export function saveRelations(list) {
	save(STORAGE_KEYS.RELATIONS, list)
}

// ---------- 用户档案 ----------
export function getUserProfile() {
	return load(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE)
}
export function saveUserProfile(profile) {
	save(STORAGE_KEYS.USER_PROFILE, profile)
}

// ---------- 聊天消息 ----------
export function getChatMessages(ocId) {
	const key = STORAGE_KEYS.CHAT_MESSAGES + '_' + ocId
	return load(key, [])
}
export function saveChatMessages(ocId, msgs) {
	const key = STORAGE_KEYS.CHAT_MESSAGES + '_' + ocId
	save(key, msgs)
}

// ---------- 今日运势 ----------
export function getTodayFortune() {
	const today = new Date().toISOString().slice(0, 10)
	const stored = load(STORAGE_KEYS.FORTUNE_TODAY, null)
	if (stored && stored.date === today) return stored
	return null
}
export function drawFortune() {
	const today = new Date().toISOString().slice(0, 10)
	const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0)
	const fortune = { ...FORTUNES[seed % FORTUNES.length], date: today }
	save(STORAGE_KEYS.FORTUNE_TODAY, fortune)
	return fortune
}

// ---------- 签到 ----------
export function getSignRecords() {
	return load(STORAGE_KEYS.SIGN_RECORDS, { dates: [], streak: 0 })
}
export function doSign() {
	const today = new Date().toISOString().slice(0, 10)
	const records = getSignRecords()
	if (records.dates.includes(today)) return { alreadySigned: true, ...records }
	records.dates.push(today)
	// 连签计算
	const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
	records.streak = records.dates.includes(yesterday) ? records.streak + 1 : 1
	save(STORAGE_KEYS.SIGN_RECORDS, records)
	return { alreadySigned: false, ...records }
}
export function isSignedToday() {
	const today = new Date().toISOString().slice(0, 10)
	return getSignRecords().dates.includes(today)
}

// ---------- 记忆（互动记录） ----------
export function getMemories() {
	return load(STORAGE_KEYS.MEMORIES, [])
}
export function addMemory(text, ocName, emoji) {
	const mems = getMemories()
	mems.unshift({
		id: Date.now(),
		date: new Date().toISOString().slice(0, 10),
		text,
		oc: ocName,
		emoji
	})
	if (mems.length > 50) mems.length = 50
	save(STORAGE_KEYS.MEMORIES, mems)
}

// ---------- 商城 & 购物车 ----------
export function getShopProducts() {
	return SHOP_PRODUCTS
}
export function getCart() {
	return load(STORAGE_KEYS.CART_ITEMS, [])
}
export function addToCart(product, design) {
	const cart = getCart()
	cart.push({
		cartId: Date.now(),
		productId: product.id,
		name: product.name,
		emoji: product.emoji,
		price: product.price,
		qty: 1,
		design: design || null,
	})
	save(STORAGE_KEYS.CART_ITEMS, cart)
	return cart
}
export function removeFromCart(cartId) {
	const cart = getCart().filter(item => item.cartId !== cartId)
	save(STORAGE_KEYS.CART_ITEMS, cart)
	return cart
}
export function updateCartQty(cartId, qty) {
	const cart = getCart()
	const item = cart.find(i => i.cartId === cartId)
	if (item) {
		if (qty <= 0) return removeFromCart(cartId)
		item.qty = qty
	}
	save(STORAGE_KEYS.CART_ITEMS, cart)
	return cart
}
export function getCartCount() {
	return getCart().reduce((sum, item) => sum + item.qty, 0)
}

// ---------- 智能回复 ----------
const REPLY_MAP = [
	{ keywords: ['你好', '嗨', 'hi', '早', '晚上好', '下午好'], replies: ['你好呀～今天过得开心吗？', '嗨嗨！见到你好开心！', '你来啦～等你好久了呢！'] },
	{ keywords: ['名字', '叫什么', '你是谁'], replies: ['我是{name}呀，你的专属伙伴！', '嘻嘻，叫我{name}就好～', '{name}在此，随时听候！'] },
	{ keywords: ['喜欢', '爱', '最爱'], replies: ['我也好喜欢你！💕', '听到你这么说，心跳好快...', '嘿嘿，这是我们之间的秘密哦～'] },
	{ keywords: ['开心', '快乐', '高兴', '哈哈'], replies: ['你开心我就开心！一起笑吧 😄', '哈哈哈，快乐是会传染的呢～', '继续保持好心情哦！'] },
	{ keywords: ['难过', '伤心', '不开心', '哭', '烦'], replies: ['抱抱你...有我在呢，不要难过了 🫂', '想哭就哭出来吧，我会一直陪着你。', '没关系的，一切都会好起来的～'] },
	{ keywords: ['吃', '饭', '零食', '美食', '饿'], replies: ['要一起吃点什么吗？我知道一家超棒的店！', '说到吃的，我的眼睛就亮了！🍰', '饿了吗？我给你准备了小蛋糕哦～'] },
	{ keywords: ['天气', '下雨', '晴', '冷', '热'], replies: ['今天的天气很适合出门散步呢～', '不管什么天气，和你在一起就很好！', '要多注意保暖/防晒哦，我会担心的。'] },
	{ keywords: ['睡', '困', '晚安', '休息'], replies: ['晚安～做个好梦，梦里见哦 🌙', '要早点休息呀，明天还有新的冒险等着我们！', '我会在梦里守护你的...晚安～'] },
	{ keywords: ['谢谢', '感谢', '多谢'], replies: ['不用谢～能帮到你我很开心！', '嘻嘻，我们之间不用这么客气啦～', '能为你做事是我的荣幸！'] },
	{ keywords: ['战斗', '打', '冒险', '任务'], replies: ['准备好了吗？我会全力以赴的！⚔️', '有我在，你就放心冲吧！', '冒险的号角已经吹响！出发！'] },
]

const GENERIC_REPLIES = [
	'嗯嗯，我在认真听呢～继续说吧！',
	'原来是这样呀...你的想法好有趣！',
	'哇，你总是能想到我想不到的事情呢～',
	'让我想想...这个确实需要好好考虑。🤔',
	'不管怎样，有你在就很安心呢！',
	'嗯...下次我们可以一起试试看！',
	'说起来，最近有什么有趣的事吗？',
	'呐呐，你觉得我们下次去哪里冒险好呢？',
]

export function getSmartReply(input, ocName) {
	const text = input.toLowerCase()
	for (const rule of REPLY_MAP) {
		if (rule.keywords.some(k => text.includes(k))) {
			const reply = rule.replies[Math.floor(Math.random() * rule.replies.length)]
			return reply.replace(/{name}/g, ocName)
		}
	}
	return GENERIC_REPLIES[Math.floor(Math.random() * GENERIC_REPLIES.length)]
}

// ---------- 编辑器 Tab 跳转（跨 tabBar 页面传参） ----------
let _targetEditorTab = -1
export function setTargetEditorTab(idx) { _targetEditorTab = idx }
export function consumeTargetEditorTab() {
	const t = _targetEditorTab
	_targetEditorTab = -1
	return t
}

// ---------- 导出常量 ----------
export { RELATION_TYPES, RELATION_COLORS, RELATION_EMOJIS, FORTUNES, OC_THEMES }

// ---------- 论坛 ----------
const DEFAULT_FORUM_POSTS = [
	{ id: 101, avatar: '🌸', author: '樱花落满衣', time: Date.now() - 7200000, content: '今天给我的 OC 画了新立绘！大家觉得怎么样？第一次尝试厚涂风格，感觉还行？🎨', tags: ['立绘', '创作分享'], likes: [], comments: [
		{ id: 1001, avatar: '⚡', author: '雷霆万钧', content: '好漂亮啊！光影处理得很好！', time: Date.now() - 6000000, likes: [] },
		{ id: 1002, avatar: '🦊', author: '狐狸的尾巴', content: '厚涂风格和你的角色气质很搭呢～', time: Date.now() - 5000000, likes: [] },
	]},
	{ id: 102, avatar: '⚡', author: '雷霆万钧', time: Date.now() - 18000000, content: '分享一下我花了两周写的力量体系设定！\n\n五行元素互相克制，但融合后可以产生新属性。比如火+水=蒸汽系，拥有腐蚀和隐匿能力。\n\n大家觉得平衡性怎么样？', tags: ['世界观', '设定分享'], likes: [], comments: [
		{ id: 1003, avatar: '🌙', author: '星之守望者', content: '蒸汽系这个设计很有创意！不过腐蚀+隐匿是不是太强了？', time: Date.now() - 15000000, likes: [] },
		{ id: 1004, avatar: '💎', author: '蓝色多瑙河', content: '建议加个限制条件，比如融合需要消耗双倍魔力', time: Date.now() - 14000000, likes: [] },
		{ id: 1005, avatar: '⚡', author: '雷霆万钧', content: '有道理！我再平衡一下数值', time: Date.now() - 12000000, likes: [] },
	]},
	{ id: 103, avatar: '🌙', author: '星之守望者', time: Date.now() - 86400000, content: '有没有人想联动？我的 OC 是暗属性的剑士，性格孤僻但内心温柔。寻找光属性的伙伴来写一段宿命对决的故事线！🗡️', tags: ['求联动', '暗属性'], likes: [], comments: [
		{ id: 1006, avatar: '🌸', author: '樱花落满衣', content: '我有个光属性的治愈师！可以试试对立又互补的关系～', time: Date.now() - 80000000, likes: [] },
	]},
	{ id: 104, avatar: '🦊', author: '狐狸的尾巴', time: Date.now() - 86400000, content: '做了一个 NFC 手办开箱视频！质感真的超出预期，底座的发光效果太赞了。触碰一下就能听到我家孩子说话，感动哭 😭', tags: ['周边', '手办'], likes: [], comments: [
		{ id: 1007, avatar: '💎', author: '蓝色多瑙河', content: '求链接！这个我也想要！', time: Date.now() - 82000000, likes: [] },
		{ id: 1008, avatar: '🌸', author: '樱花落满衣', content: '发光底座太帅了吧！！', time: Date.now() - 80000000, likes: [] },
	]},
	{ id: 105, avatar: '💎', author: '蓝色多瑙河', time: Date.now() - 259200000, content: '契约者们！下个月的西湖文旅活动大家报名了吗？听说会有 OC 主题的实景解谜，还有限定徽章可以拿！在西湖边和自己的 OC 合影想想就激动～', tags: ['文旅活动', '线下'], likes: [], comments: [
		{ id: 1009, avatar: '🌙', author: '星之守望者', content: '已经报名了！从北京飞过去！', time: Date.now() - 240000000, likes: [] },
		{ id: 1010, avatar: '🦊', author: '狐狸的尾巴', content: '本地人表示可以当向导哈哈', time: Date.now() - 230000000, likes: [] },
		{ id: 1011, avatar: '⚡', author: '雷霆万钧', content: '限定徽章必须拿到！', time: Date.now() - 220000000, likes: [] },
	]},
]

export function getForumPosts() {
	return load(STORAGE_KEYS.FORUM_POSTS, DEFAULT_FORUM_POSTS)
}
export function saveForumPosts(posts) {
	save(STORAGE_KEYS.FORUM_POSTS, posts)
}
export function addForumPost(post) {
	const posts = getForumPosts()
	posts.unshift(post)
	saveForumPosts(posts)
	return posts
}
export function toggleForumLike(postId, userId) {
	const posts = getForumPosts()
	const post = posts.find(p => p.id === postId)
	if (!post) return posts
	const idx = post.likes.indexOf(userId)
	if (idx >= 0) post.likes.splice(idx, 1)
	else post.likes.push(userId)
	saveForumPosts(posts)
	return posts
}
export function toggleCommentLike(postId, commentId, userId) {
	const posts = getForumPosts()
	const post = posts.find(p => p.id === postId)
	if (!post) return posts
	const comment = post.comments.find(c => c.id === commentId)
	if (!comment) return posts
	const idx = comment.likes.indexOf(userId)
	if (idx >= 0) comment.likes.splice(idx, 1)
	else comment.likes.push(userId)
	saveForumPosts(posts)
	return posts
}
export function addForumComment(postId, comment) {
	const posts = getForumPosts()
	const post = posts.find(p => p.id === postId)
	if (!post) return posts
	post.comments.push(comment)
	saveForumPosts(posts)
	return posts
}
export function deleteForumPost(postId) {
	const posts = getForumPosts().filter(p => p.id !== postId)
	saveForumPosts(posts)
	return posts
}

// ---------- 提示词社区 ----------
const DEFAULT_PROMPT_TEMPLATES = [
	{ id: 201, avatar: '🎨', author: '画境师', prompt: '身穿白色长裙，站在月光下的湖边，微风吹起发丝，表情温柔而忧伤', tags: ['人物'], likes: ['u1', 'u2', 'u3'], comments: [
		{ id: 3001, avatar: '🌸', author: '樱花落满衣', content: '用这个生成了一张超美的图！', time: Date.now() - 3600000, likes: [] },
	]},
	{ id: 202, avatar: '⚔️', author: '战场诗人', prompt: '手持双刃剑，在燃烧的废墟中与巨龙对峙，披风被气浪掀起，目光坚毅', tags: ['战斗'], likes: ['u1', 'u4'], comments: [] },
	{ id: 203, avatar: '🏰', author: '造梦者', prompt: '坐在巨大的齿轮钟塔顶端，俯瞰蒸汽朋克风格的城市黄昏，齿轮缓缓转动', tags: ['场景'], likes: ['u2', 'u3', 'u5', 'u6'], comments: [
		{ id: 3002, avatar: '⚡', author: '雷霆万钧', content: '蒸汽朋克永远的神！', time: Date.now() - 7200000, likes: [] },
	]},
	{ id: 204, avatar: '🌸', author: '樱花落满衣', prompt: '日系赛璐璐风格，樱花花瓣飞舞的校园天台，阳光逆光效果，制服少女回眸', tags: ['风格'], likes: ['u1'], comments: [] },
	{ id: 205, avatar: '🦄', author: '彩虹骑士', prompt: '身着铠甲的精灵骑士，骑在独角兽上穿越彩虹桥，云层在脚下翻涌', tags: ['人物'], likes: ['u3', 'u5'], comments: [
		{ id: 3003, avatar: '🌙', author: '星之守望者', content: '奇幻感拉满了', time: Date.now() - 5000000, likes: [] },
	]},
	{ id: 206, avatar: '🌧️', author: '雨中漫步', prompt: '雨中的霓虹都市街头，撑着透明伞回头微笑，地面倒映城市灯光，氛围感十足', tags: ['场景'], likes: ['u1', 'u2', 'u4', 'u6', 'u7'], comments: [
		{ id: 3004, avatar: '💎', author: '蓝色多瑙河', content: '氛围感绝了，直接用了', time: Date.now() - 4000000, likes: [] },
		{ id: 3005, avatar: '🦊', author: '狐狸的尾巴', content: '加上"积水反射霓虹灯"效果更好', time: Date.now() - 3500000, likes: [] },
	]},
	{ id: 207, avatar: '🎋', author: '墨云间', prompt: '水墨画风格，在云海之上的仙山对弈，仙鹤在旁，松树苍劲，意境悠远', tags: ['风格'], likes: ['u2', 'u3'], comments: [] },
	{ id: 208, avatar: '🔮', author: '暗影法师', prompt: '召唤暗影魔法，紫色魔法阵在脚下旋转展开，黑色羽翼张开，能量粒子飞散', tags: ['战斗'], likes: ['u1', 'u4', 'u5'], comments: [
		{ id: 3006, avatar: '⚡', author: '雷霆万钧', content: '魔法阵细节描述得好，生成效果很棒', time: Date.now() - 2000000, likes: [] },
	]},
	{ id: 209, avatar: '🍰', author: '甜心厨娘', prompt: '穿着围裙在温馨的小厨房里做蛋糕，面粉沾在鼻尖，笑容甜美，暖色调光线', tags: ['人物'], likes: ['u2', 'u6'], comments: [] },
	{ id: 210, avatar: '🎸', author: '星野旅人', prompt: '星空下的篝火旁弹吉他，身边是茂密的森林和萤火虫，夜色温柔宁静', tags: ['场景'], likes: ['u1', 'u3', 'u5', 'u7'], comments: [
		{ id: 3007, avatar: '🌸', author: '樱花落满衣', content: '好治愈的画面，收藏了', time: Date.now() - 1000000, likes: [] },
	]},
	{ id: 211, avatar: '🐉', author: '龙吟九天', prompt: '驾驭冰龙翱翔在暴风雪中，冰晶碎片环绕全身，龙鳞泛着蓝光', tags: ['战斗'], likes: ['u4', 'u5'], comments: [] },
	{ id: 212, avatar: '🌺', author: '花间集', prompt: '和风花魁造型，手持纸伞漫步红叶回廊，金鱼在脚边的小溪中游动', tags: ['风格'], likes: ['u1', 'u2', 'u3', 'u6'], comments: [] },
]

export function getPromptTemplates() {
	return load(STORAGE_KEYS.PROMPT_TEMPLATES, DEFAULT_PROMPT_TEMPLATES)
}
export function savePromptTemplates(list) {
	save(STORAGE_KEYS.PROMPT_TEMPLATES, list)
}
export function togglePromptLike(promptId, userId) {
	const list = getPromptTemplates()
	const item = list.find(p => p.id === promptId)
	if (!item) return list
	const idx = item.likes.indexOf(userId)
	if (idx >= 0) item.likes.splice(idx, 1)
	else item.likes.push(userId)
	savePromptTemplates(list)
	return list
}
export function addPromptComment(promptId, comment) {
	const list = getPromptTemplates()
	const item = list.find(p => p.id === promptId)
	if (!item) return list
	item.comments.push(comment)
	savePromptTemplates(list)
	return list
}

// ---------- 活动报名 ----------
const DEFAULT_ACTIVITIES = [
	{
		id: 1001, emoji: '🎭', title: 'OC 角色扮演线下聚会',
		description: '带上你的 OC 设定集，和其他创作者面对面交流！现场有角色扮演环节、即兴剧本杀、OC 画师速写摊位。',
		date: '2026-05-01', time: '14:00', location: '上海·静安区创意园 3F',
		maxParticipants: 30, tags: ['线下', 'Cosplay'],
		organizer: '次元组委会', organizerAvatar: '🌸',
		signups: [
			{ userId: 'demo1', name: '星辰', phone: '138****1234', note: '带两个OC', signupTime: Date.now() - 86400000 },
			{ userId: 'demo2', name: '月落', phone: '139****5678', note: '', signupTime: Date.now() - 43200000 },
		],
		status: '报名中'
	},
	{
		id: 1002, emoji: '🎨', title: 'OC 立绘创作大赛',
		description: '以"星与海"为主题，为你的 OC 绘制一幅立绘参赛。设有最佳画技奖、最佳设定奖、人气奖，奖品丰厚！',
		date: '2026-05-15', time: '10:00', location: '线上·Discord 频道',
		maxParticipants: 100, tags: ['线上', '比赛'],
		organizer: '画师联盟', organizerAvatar: '🎨',
		signups: [
			{ userId: 'demo3', name: '墨染', phone: '137****9012', note: '参加最佳设定奖', signupTime: Date.now() - 172800000 },
		],
		status: '报名中'
	},
	{
		id: 1003, emoji: '⚔️', title: 'OC 跨次元对战锦标赛',
		description: '提交你 OC 的战斗数据和技能设定，系统自动匹配对手进行回合制对战。淘汰赛制，冠军获得限定称号！',
		date: '2026-04-20', time: '19:00', location: '线上·APP内',
		maxParticipants: 64, tags: ['线上', '对战'],
		organizer: '竞技场管理员', organizerAvatar: '⚔️',
		signups: [],
		status: '报名中'
	},
	{
		id: 1004, emoji: '📖', title: 'OC 世界观共创工作坊',
		description: '三天线上工作坊，由资深设定师带领，共同为一个全新世界观搭建框架。参与者的 OC 可作为 NPC 写入世界观。',
		date: '2026-04-10', time: '20:00', location: '线上·腾讯会议',
		maxParticipants: 20, tags: ['线上', '创作'],
		organizer: '设定研究所', organizerAvatar: '📖',
		signups: [
			{ userId: 'demo1', name: '星辰', phone: '138****1234', note: '', signupTime: Date.now() - 604800000 },
			{ userId: 'demo4', name: '白夜', phone: '136****3456', note: '带了三个世界观', signupTime: Date.now() - 518400000 },
			{ userId: 'demo5', name: '千雪', phone: '135****7890', note: '', signupTime: Date.now() - 432000000 },
		],
		status: '已结束'
	},
]
export function getActivities() { return load(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES) }
export function saveActivities(list) { save(STORAGE_KEYS.ACTIVITIES, list) }
export function signupActivity(activityId, form) {
	const list = getActivities()
	const act = list.find(a => a.id === activityId)
	if (!act) return { ok: false, msg: tt('活动不存在') }
	if (act.status !== '报名中') return { ok: false, msg: tt('活动已截止报名') }
	if (act.signups.length >= act.maxParticipants) return { ok: false, msg: tt('报名已满') }
	if (act.signups.find(s => s.userId === form.userId)) return { ok: false, msg: tt('你已报名该活动') }
	act.signups.push({ ...form, signupTime: Date.now() })
	saveActivities(list)
	return { ok: true }
}
export function cancelSignup(activityId, userId) {
	const list = getActivities()
	const act = list.find(a => a.id === activityId)
	if (!act) return { ok: false, msg: tt('活动不存在') }
	act.signups = act.signups.filter(s => s.userId !== userId)
	saveActivities(list)
	return { ok: true }
}

function persistAuth(authData) {
	const user = authData?.user
	if (!user?.username) return

	globalSave(STORAGE_KEYS.CURRENT_USER, user.username)
	globalSave(STORAGE_KEYS.AUTH_USER, user)
	globalSave(STORAGE_KEYS.AUTH_TOKEN, authData.access_token || '')

	const profile = load(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE)
	save(STORAGE_KEYS.USER_PROFILE, {
		...profile,
		nickname: profile.nickname && profile.nickname !== DEFAULT_USER_PROFILE.nickname ? profile.nickname : user.username,
		phone: user.phone,
		phoneVerified: !!user.phone,
	})
}

export function ensureDevAuthSession() {
	if (!DEV_AUTH_ENABLED) return

	globalSave(STORAGE_KEYS.CURRENT_USER, DEV_AUTH_USER.username)
	globalSave(STORAGE_KEYS.AUTH_USER, DEV_AUTH_USER)
	try {
		uni.removeStorageSync(STORAGE_KEYS.AUTH_TOKEN)
	} catch (e) { }
}

// ---------- 账号系统 ----------
export async function register(username, phone, password, smsCode) {
	try {
		const res = await request({
			url: '/auth/register',
			method: 'POST',
			data: { username, phone, password, sms_code: smsCode }
		})
		persistAuth(res)
		return { ok: true, msg: res.message, user: res.user }
	} catch (error) {
		return { ok: false, msg: tt(error.message || '注册失败') }
	}
}
export async function login(username, password) {
	try {
		const res = await request({
			url: '/auth/login',
			method: 'POST',
			data: { username, password }
		})
		persistAuth(res)
		return { ok: true, msg: res.message, user: res.user }
	} catch (error) {
		return { ok: false, msg: tt(error.message || '登录失败') }
	}
}
export async function sendPasswordResetCode(usernameOrPhone, maybePhone) {
	const phone = maybePhone || usernameOrPhone
	try {
		const res = await request({
			url: '/auth/send-sms',
			method: 'POST',
			data: { phone, scene: 'reset_password' }
		})
		return { ok: true, msg: res.message }
	} catch (error) {
		return { ok: false, msg: tt(error.message || '发送验证码失败') }
	}
}
export async function forgotPassword(usernameOrPhone, phoneOrCode, codeOrPassword, maybePassword) {
	const phone = maybePassword ? phoneOrCode : usernameOrPhone
	const code = maybePassword ? codeOrPassword : phoneOrCode
	const newPassword = maybePassword || codeOrPassword
	try {
		const res = await request({
			url: '/auth/forgot-password',
			method: 'POST',
			data: { phone, code, new_password: newPassword }
		})
		return { ok: true, msg: res.message }
	} catch (error) {
		return { ok: false, msg: tt(error.message || '重置密码失败') }
	}
}
export function logout() {
	try { uni.removeStorageSync(STORAGE_KEYS.CURRENT_USER) } catch (e) { }
	try { uni.removeStorageSync(STORAGE_KEYS.AUTH_TOKEN) } catch (e) { }
	try { uni.removeStorageSync(STORAGE_KEYS.AUTH_USER) } catch (e) { }
}
export function isLoggedIn() {
	if (DEV_AUTH_ENABLED) {
		ensureDevAuthSession()
		return true
	}
	try {
		const rawUser = uni.getStorageSync(STORAGE_KEYS.CURRENT_USER)
		const rawToken = uni.getStorageSync(STORAGE_KEYS.AUTH_TOKEN)
		return !!rawUser && !!rawToken
	} catch (e) { return false }
}
export function getCurrentUser() {
	try {
		const raw = uni.getStorageSync(STORAGE_KEYS.CURRENT_USER)
		if (raw) return JSON.parse(raw)
	} catch (e) { }
	return null
}
export function getAuthUser() {
	try {
		const raw = uni.getStorageSync(STORAGE_KEYS.AUTH_USER)
		if (raw) return JSON.parse(raw)
	} catch (e) { }
	return null
}

// ---------- 水印预设 ----------
export function getWatermarkPresets() {
	return load(STORAGE_KEYS.WATERMARK_PRESETS, [])
}
export function saveWatermarkPresets(presets) {
	save(STORAGE_KEYS.WATERMARK_PRESETS, presets)
}

// ---------- 约稿（Commission） ----------
const DEFAULT_COMMISSIONS = [
	{
		id: 2001, type: 'artist',
		avatar: '🎨', author: '落樱画师',
		title: '日系半身像 / 全身立绘',
		desc: '擅长日系赛璐璐和厚涂风格，色彩鲜明，细节精致。可画 OC 立绘、头像、Q版，附带简单背景。',
		styles: ['日系', '赛璐璐', '厚涂'],
		priceRange: '80 ~ 500',
		turnaround: '7~15 天',
		samples: [],
		status: 'open',
		time: Date.now() - 3600000,
		applicants: [
			{ userId: 'demo1', name: '星辰', msg: '想约一张我家 OC 的全身立绘，暗夜风格', time: Date.now() - 1800000, status: 'pending' },
		],
	},
	{
		id: 2002, type: 'artist',
		avatar: '✏️', author: '墨线匠人',
		title: '黑白线稿 / 漫画分镜',
		desc: '专注黑白线稿与漫画分镜，适合想要干净利落线条风格的约稿。也接设定图和表情包。',
		styles: ['线稿', '漫画', '表情包'],
		priceRange: '30 ~ 200',
		turnaround: '3~7 天',
		samples: [],
		status: 'open',
		time: Date.now() - 86400000,
		applicants: [],
	},
	{
		id: 2003, type: 'artist',
		avatar: '🌈', author: '彩虹调色盘',
		title: '欧美风 / 概念设计',
		desc: '偏欧美概念设计风格，擅长机甲、奇幻盔甲、武器设定。如果你的 OC 是战斗型的，找我没错！',
		styles: ['欧美', '概念设计', '机甲'],
		priceRange: '150 ~ 800',
		turnaround: '10~20 天',
		samples: [],
		status: 'open',
		time: Date.now() - 172800000,
		applicants: [
			{ userId: 'demo2', name: '月落', msg: '想约一套完整的 OC 装备设定图', time: Date.now() - 100000000, status: 'pending' },
			{ userId: 'demo3', name: '墨染', msg: '机甲形态的 OC 设定，预算充足', time: Date.now() - 80000000, status: 'pending' },
		],
	},
	{
		id: 2004, type: 'seeker',
		avatar: '⭐', author: '星之守望者',
		title: '求约一张 OC 双人图',
		desc: '想找画师画一张我和朋友的 OC 双人互动图，希望是温馨治愈的风格。预算 200~400，不急，画师慢慢画就好～',
		styles: ['双人', '治愈', '日系'],
		priceRange: '200 ~ 400',
		turnaround: '不限',
		samples: [],
		status: 'open',
		time: Date.now() - 7200000,
		applicants: [
			{ userId: 'demo_artist1', name: '落樱画师', msg: '可以接！我擅长温馨风格，可以看看我的作品集', time: Date.now() - 5000000, status: 'accepted' },
		],
	},
	{
		id: 2005, type: 'seeker',
		avatar: '🔥', author: '烈焰使者',
		title: '急求战斗姿态立绘',
		desc: '我的 OC 是火属性战士，需要一张帅气的战斗姿态全身立绘。希望画面有火焰特效，背景燃烧废墟。预算充足，求速出！',
		styles: ['战斗', '特效', '厚涂'],
		priceRange: '300 ~ 600',
		turnaround: '5 天内',
		samples: [],
		status: 'open',
		time: Date.now() - 43200000,
		applicants: [],
	},
	{
		id: 2006, type: 'artist',
		avatar: '🌙', author: '月下绘梦',
		title: 'Q版 / 头像 / 表情包',
		desc: '专画 Q 版和可爱向！表情包一套 9 张起，头像精修含背景，萌系风格拿手。排队中，约稿请排号～',
		styles: ['Q版', '萌系', '表情包'],
		priceRange: '20 ~ 150',
		turnaround: '5~10 天',
		samples: [],
		status: 'open',
		time: Date.now() - 259200000,
		applicants: [
			{ userId: 'demo4', name: '白夜', msg: '想约一套 OC 表情包，9 张', time: Date.now() - 200000000, status: 'pending' },
		],
	},
]

export function getCommissions() {
	return load(STORAGE_KEYS.COMMISSIONS, DEFAULT_COMMISSIONS)
}
export function saveCommissions(list) {
	save(STORAGE_KEYS.COMMISSIONS, list)
}
export function addCommission(item) {
	const list = getCommissions()
	list.unshift(item)
	saveCommissions(list)
	return list
}
export function applyCommission(commissionId, application) {
	const list = getCommissions()
	const item = list.find(c => c.id === commissionId)
	if (!item) return list
	if (!item.applicants) item.applicants = []
	if (item.applicants.find(a => a.userId === application.userId)) return list
	item.applicants.push({ ...application, status: 'pending' })
	saveCommissions(list)
	return list
}
export function deleteCommission(commissionId) {
	const list = getCommissions().filter(c => c.id !== commissionId)
	saveCommissions(list)
	return list
}
export function acceptApplicant(commissionId, userId) {
	const list = getCommissions()
	const item = list.find(c => c.id === commissionId)
	if (!item || !item.applicants) return list
	const applicant = item.applicants.find(a => a.userId === userId)
	if (!applicant) return list
	applicant.status = 'accepted'
	item.applicants.forEach(a => { if (a.userId !== userId) a.status = 'rejected' })
	saveCommissions(list)
	return list
}
export function rejectApplicant(commissionId, userId) {
	const list = getCommissions()
	const item = list.find(c => c.id === commissionId)
	if (!item || !item.applicants) return list
	const applicant = item.applicants.find(a => a.userId === userId)
	if (!applicant) return list
	applicant.status = 'rejected'
	saveCommissions(list)
	return list
}

// ---------- 导入 / 导出 ----------
export function exportOCData(ocId) {
	const oc = getOCById(ocId)
	if (!oc) return null
	return {
		version: '1.0',
		app: '我的次元',
		exportTime: new Date().toISOString(),
		type: 'single',
		oc,
		world: getWorldData(),
		relations: getRelations(),
		chatMessages: getChatMessages(ocId),
	}
}

export function exportAllData() {
	const ocList = getOCList()
	const chatMessages = {}
	ocList.forEach(oc => {
		const msgs = getChatMessages(oc.id)
		if (msgs.length > 0) chatMessages[oc.id] = msgs
	})
	return {
		version: '1.0',
		app: '我的次元',
		exportTime: new Date().toISOString(),
		type: 'all',
		ocList,
		world: getWorldData(),
		relations: getRelations(),
		chatMessages,
	}
}

export function importOCData(jsonData) {
	if (!jsonData || !jsonData.version || !jsonData.oc) {
		return { ok: false, msg: tt('无效的导入数据：缺少必要字段') }
	}
	const oc = jsonData.oc
	if (!oc.name || !oc.emoji) {
		return { ok: false, msg: tt('角色数据不完整：缺少名称或表情') }
	}
	const list = getOCList()
	// ID 冲突检测，生成新 ID
	if (list.find(o => o.id === oc.id)) {
		oc.id = Date.now()
	}
	list.push(oc)
	saveOCList(list)
	// 导入聊天记录
	if (jsonData.chatMessages && jsonData.chatMessages.length > 0) {
		saveChatMessages(oc.id, jsonData.chatMessages)
	}
	// 合并世界观（仅当本地为空时覆盖）
	const localWorld = getWorldData()
	if (jsonData.world && !localWorld.name && jsonData.world.name) {
		saveWorldData(jsonData.world)
	}
	// 合并关系
	if (jsonData.relations && jsonData.relations.length > 0) {
		const localRels = getRelations()
		const existingNames = new Set(localRels.map(r => r.name))
		const newRels = jsonData.relations.filter(r => !existingNames.has(r.name))
		if (newRels.length > 0) {
			saveRelations([...localRels, ...newRels])
		}
	}
	return { ok: true, msg: formatI18nText('「{name}」导入成功！', { name: oc.name }), importedOC: oc }
}

export function importAllData(jsonData) {
	if (!jsonData || !jsonData.version || !jsonData.ocList) {
		return { ok: false, msg: tt('无效的备份数据：缺少必要字段') }
	}
	const list = getOCList()
	const existingIds = new Set(list.map(o => o.id))
	let count = 0
	jsonData.ocList.forEach(oc => {
		if (existingIds.has(oc.id)) {
			oc.id = Date.now() + count
		}
		list.push(oc)
		existingIds.add(oc.id)
		// 导入聊天记录
		if (jsonData.chatMessages && jsonData.chatMessages[oc.id]) {
			saveChatMessages(oc.id, jsonData.chatMessages[oc.id])
		}
		count++
	})
	saveOCList(list)
	// 合并世界观
	const localWorld = getWorldData()
	if (jsonData.world && !localWorld.name && jsonData.world.name) {
		saveWorldData(jsonData.world)
	}
	// 合并关系
	if (jsonData.relations && jsonData.relations.length > 0) {
		const localRels = getRelations()
		const existingNames = new Set(localRels.map(r => r.name))
		const newRels = jsonData.relations.filter(r => !existingNames.has(r.name))
		if (newRels.length > 0) {
			saveRelations([...localRels, ...newRels])
		}
	}
	return { ok: true, msg: formatI18nText('成功导入 {count} 个角色！', { count }), count }
}

// ---------- 重置所有数据（新账号） ----------
export function resetAll() {
	const prefix = getUserKeyPrefix()
	// 先获取当前 OC 列表以清理对应聊天记录
	const currentList = getOCList()
	// 清除当前用户的所有数据
	const userKeys = [
		STORAGE_KEYS.OC_LIST, STORAGE_KEYS.WORLD_DATA, STORAGE_KEYS.RELATIONS,
		STORAGE_KEYS.USER_PROFILE, STORAGE_KEYS.SIGN_RECORDS, STORAGE_KEYS.FORTUNE_TODAY,
		STORAGE_KEYS.MEMORIES, STORAGE_KEYS.CART_ITEMS, STORAGE_KEYS.FORUM_POSTS,
		STORAGE_KEYS.ACTIVITIES, STORAGE_KEYS.WATERMARK_PRESETS, STORAGE_KEYS.COMMISSIONS,
	]
	userKeys.forEach(key => {
		try { uni.removeStorageSync(prefix + key) } catch (e) { }
	})
	currentList.forEach(oc => {
		try { uni.removeStorageSync(prefix + STORAGE_KEYS.CHAT_MESSAGES + '_' + oc.id) } catch (e) { }
	})
	// 清除全局登录状态
	try { uni.removeStorageSync(STORAGE_KEYS.CURRENT_USER) } catch (e) { }
	try { uni.removeStorageSync(STORAGE_KEYS.AUTH_TOKEN) } catch (e) { }
	try { uni.removeStorageSync(STORAGE_KEYS.AUTH_USER) } catch (e) { }
	try { uni.removeStorageSync('chatOCId') } catch (e) { }
	try { uni.removeStorageSync('viewOCId') } catch (e) { }
}
