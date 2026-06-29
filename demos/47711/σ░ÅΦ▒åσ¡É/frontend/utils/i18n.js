import { computed, ref } from 'vue'

const STORAGE_KEY = 'douzi_locale'
const DEFAULT_LOCALE = 'zh-CN'
const EN_LOCALE = 'en-US'
const SUPPORTED_LOCALES = [DEFAULT_LOCALE, EN_LOCALE]

const locale = ref(DEFAULT_LOCALE)

const messages = {
	[DEFAULT_LOCALE]: {
		common: {
			language: '语言',
			switchTo: 'EN',
		},
		page: {
			home: '我的次元',
			editor: '构造世界观',
			chat: '跨次元通话',
			user: '契约者中心',
			shop: '次元商城',
			forum: '线上论坛',
			activity: '活动报名',
			generate: '一键生成',
			watermark: '批量水印',
			collab: '多人联动广场',
			nfc: 'NFC 每日一签',
			profile: 'OC 档案',
			commission: '约稿广场',
		},
		home: {
			subtitle: '把设定、聊天和创作放在同一个小宇宙里',
		},
		chat: {
			online: '在线',
		},
		login: {
			appName: '小豆子',
			slogan: '把你的 OC 宇宙装进口袋',
			tabLogin: '登录',
			tabRegister: '注册',
			tabForgot: '找回密码',
			usernamePlaceholder: '请输入账号',
			passwordPlaceholder: '请输入密码',
			confirmPasswordPlaceholder: '请再次输入密码',
			phonePlaceholder: '请输入手机号',
			codePlaceholder: '请输入验证码',
			getCode: '获取验证码',
			newPasswordPlaceholder: '请输入新密码',
			confirmNewPasswordPlaceholder: '请再次输入新密码',
			forgotPassword: '忘记密码？',
			submitLogin: '登录',
			submitRegister: '注册',
			submitReset: '重置密码',
			hasAccount: '已有账号？去登录',
			rememberPassword: '想起密码？去登录',
			noAccount: '还没有账号？去注册',
		},
	},
	[EN_LOCALE]: {
		common: {
			language: 'Language',
			switchTo: '中',
		},
		page: {
			home: 'My Universe',
			editor: 'World Builder',
			chat: 'Dimensional Call',
			user: 'Profile',
			shop: 'Shop',
			forum: 'Forum',
			activity: 'Events',
			generate: 'Generate',
			watermark: 'Watermark',
			collab: 'Collab Plaza',
			nfc: 'NFC Check-in',
			profile: 'OC Archive',
			commission: 'Commissions',
		},
		home: {
			subtitle: 'Keep settings, chats, and creation in one tiny universe',
		},
		chat: {
			online: 'Online',
		},
		login: {
			appName: 'Xiao Douzi',
			slogan: 'Put your OC universe in your pocket',
			tabLogin: 'Login',
			tabRegister: 'Register',
			tabForgot: 'Reset',
			usernamePlaceholder: 'Username',
			passwordPlaceholder: 'Password',
			confirmPasswordPlaceholder: 'Confirm password',
			phonePlaceholder: 'Phone number',
			codePlaceholder: 'Verification code',
			getCode: 'Get code',
			newPasswordPlaceholder: 'New password',
			confirmNewPasswordPlaceholder: 'Confirm new password',
			forgotPassword: 'Forgot password?',
			submitLogin: 'Login',
			submitRegister: 'Register',
			submitReset: 'Reset password',
			hasAccount: 'Already have an account? Login',
			rememberPassword: 'Remembered it? Login',
			noAccount: 'No account yet? Register',
		},
		text: {
			'文': 'A',
			'登录': 'Login',
			'注册': 'Register',
			'找回密码': 'Reset password',
			'测试验证码': 'Test code',
			'验证码已发送': 'Code sent',
			'账号至少2个字符': 'Username must be at least 2 characters',
			'密码至少6位': 'Password must be at least 6 characters',
			'请输入正确手机号': 'Enter a valid phone number',
			'两次密码不一致': 'Passwords do not match',
			'注册成功': 'Registered successfully',
			'新密码至少6位': 'New password must be at least 6 characters',
			'密码已重置': 'Password reset',
			'发送失败': 'Send failed',
			'注册失败': 'Registration failed',
			'重置失败': 'Reset failed',
			'登录失败': 'Login failed',
			'请求失败': 'Request failed',
			'无法连接后端服务': 'Cannot connect to backend service',
			'文件上传失败': 'File upload failed',
			'开启你的次元': 'Open your universe',
			'创建第一个 OC 角色': 'Create your first OC',
			'立即创建': 'Create now',
			'运势': 'Fortune',
			'语音': 'Voice',
			'记忆': 'Memories',
			'AI 生成': 'AI Generate',
			'一键为你的 OC 生成专属图片与视频': 'Generate images and videos for your OC',
			'生成图片': 'Generate image',
			'生成视频': 'Generate video',
			'AI 创作': 'AI Writing',
			'探索更多': 'Explore',
			'约稿广场': 'Commissions',
			'OC 周边': 'OC Merch',
			'线上论坛': 'Forum',
			'助手': 'Assistant',
			'关闭': 'Close',
			'取消': 'Cancel',
			'保存': 'Save',
			'发送': 'Send',
			'清空': 'Clear',
			'复制': 'Copy',
			'重新生成': 'Regenerate',
			'亲密度': 'Bond',
			'战斗力': 'Power',
			'情感值': 'Emotion',
			'请先登录': 'Please log in first',
			'加载失败': 'Load failed',
			'保存失败': 'Save failed',
			'操作失败': 'Action failed',
			'删除失败': 'Delete failed',
			'发布成功': 'Published',
			'发布失败': 'Publish failed',
			'申请失败': 'Application failed',
			'已删除': 'Deleted',
			'进行中': 'Open',
			'已关闭': 'Closed',
			'待处理': 'Pending',
			'已接受': 'Accepted',
			'已拒绝': 'Rejected',
			'接受': 'Accept',
			'拒绝': 'Reject',
			'申请': 'Apply',
			'已申请': 'Applied',
			'发布': 'Post',
			'标题': 'Title',
			'详细描述': 'Description',
			'风格标签': 'Style tags',
			'价格区间': 'Price range',
			'交付周期': 'Turnaround',
			'请输入角色名': 'Enter a character name',
			'请输入角色名称': 'Enter a character name',
			'请先选择角色': 'Choose a character first',
			'角色已删除': 'Character deleted',
			'已保存': 'Saved',
			'已复制到剪贴板': 'Copied to clipboard',
			'未命名角色': 'Untitled OC',
			'未知称号': 'Unknown title',
			'暂无背景故事...': 'No backstory yet...',
			'已保存到相册': 'Saved to album',
			'图片生成失败': 'Image generation failed',
			'视频已完成，但服务商未返回可播放地址': 'The video is complete, but the provider did not return a playable URL',
			'视频仍在生成中，请稍后重新进入页面查看': 'The video is still generating. Please reopen this page later',
			'视频仍在生成中，请稍后查看': 'The video is still generating. Please check again later',
			'仍在生成，请稍后刷新查看': 'Still generating. Please refresh later',
			'任务超时，请重试': 'Task timed out. Please try again',
			'读取剪贴板失败': 'Failed to read clipboard',
			'没有数据可导入': 'No data to import',
			'无法识别的数据格式': 'Unrecognized data format',
			'导入失败': 'Import failed',
			'购物车': 'Cart',
			'加入购物车': 'Add to cart',
			'开始设计': 'Start design',
			'去结算': 'Checkout',
			'支付成功': 'Payment succeeded',
			'支付失败': 'Payment failed',
			'订单已创建': 'Order created',
			'订单号': 'Order number',
			'活动详情': 'Event details',
			'立即报名': 'Sign up',
			'已报名': 'Signed up',
			'已满': 'Full',
			'取消报名': 'Cancel signup',
			'报名成功！': 'Signed up!',
			'选择图片': 'Choose images',
			'添加图片': 'Add image',
			'文字水印': 'Text watermark',
			'图片水印': 'Image watermark',
			'预览效果': 'Preview',
			'刷新预览': 'Refresh preview',
			'处理中...': 'Processing...',
			'处理完成': 'Done',
			'全部保存到相册': 'Save all to album',
			'选择角色': 'Choose OC',
			'生成中...': 'Generating...',
			'开始生成': 'Generate',
			'生成结果': 'Result',
			'评论': 'Comments',
			'暂无评论，快来抢沙发～': 'No comments yet',
			'写一条评论...': 'Write a comment...',
		},
	},
}

function hasUniStorage() {
	return typeof uni !== 'undefined' && uni && typeof uni.getStorageSync === 'function'
}

function normalizeLocale(value) {
	if (SUPPORTED_LOCALES.includes(value)) return value
	if (typeof value === 'string' && value.toLowerCase().startsWith('en')) return EN_LOCALE
	return DEFAULT_LOCALE
}

function readStoredLocale() {
	if (!hasUniStorage()) return DEFAULT_LOCALE
	try {
		return normalizeLocale(uni.getStorageSync(STORAGE_KEY))
	} catch (e) {
		return DEFAULT_LOCALE
	}
}

function saveLocale(value) {
	if (!hasUniStorage()) return
	try {
		uni.setStorageSync(STORAGE_KEY, value)
	} catch (e) { }
}

function getPathValue(source, path) {
	return String(path).split('.').reduce((current, segment) => {
		if (!current || typeof current !== 'object') return undefined
		return current[segment]
	}, source)
}

export function initLocale() {
	locale.value = readStoredLocale()
	return locale.value
}

export function getLocale() {
	return locale.value
}

export function setLocale(value) {
	const nextLocale = normalizeLocale(value)
	locale.value = nextLocale
	saveLocale(nextLocale)
	return nextLocale
}

export function toggleLocale() {
	return setLocale(locale.value === DEFAULT_LOCALE ? EN_LOCALE : DEFAULT_LOCALE)
}

export function t(key) {
	const currentMessages = messages[locale.value] || messages[DEFAULT_LOCALE]
	return getPathValue(currentMessages, key) || getPathValue(messages[DEFAULT_LOCALE], key) || key
}

export function tt(text) {
	if (text === null || text === undefined) return ''
	if (typeof text !== 'string') return text
	if (locale.value === DEFAULT_LOCALE) return text
	return messages[EN_LOCALE].text[text] || t(text)
}

export function formatI18nText(template, vars = {}) {
	return tt(template).replace(/\{(\w+)\}/g, (match, key) => {
		return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
	})
}

export function useI18n() {
	return {
		locale,
		currentLocale: computed(() => locale.value),
		t,
		tt,
		formatI18nText,
		setLocale,
		toggleLocale,
	}
}

initLocale()
