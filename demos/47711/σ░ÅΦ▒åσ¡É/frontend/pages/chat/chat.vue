<template>
	<view class="page">
		<view class="bg-blur"></view>

		<!-- 顶部导航 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }" v-if="hasOC">
			<view class="nav-content">
				<view class="chat-oc-info" @click="showOCPicker = true">
					<view class="oc-avatar-small" :style="{ background: currentOC.avatar ? 'transparent' : currentOC.gradient }">
						<image v-if="currentOC.avatar" :src="currentOC.avatar" class="oc-avatar-img" mode="aspectFill" />
						<text v-else class="oc-emoji">{{ currentOC.emoji }}</text>
					</view>
					<view class="oc-meta">
						<text class="oc-chat-name">{{ currentOC.name }}</text>
						<view class="online-status">
							<view class="status-dot"></view>
							<text class="status-text">{{ t('chat.online') }}</text>
						</view>
					</view>
				</view>
				<view class="nav-actions">
					<LangSwitch />
					<view class="nav-menu" @click.stop="showNavMenu = !showNavMenu">
						<text class="menu-icon">⋯</text>
					</view>
				</view>
			</view>
			<!-- 下拉菜单 -->
			<view class="nav-dropdown" v-if="showNavMenu" @click.stop>
				<view class="dropdown-item" @click="clearChat">
					<text class="dropdown-icon">🗑️</text>
					<text class="dropdown-text">{{ tt('清空聊天') }}</text>
				</view>
				<view class="dropdown-item" @click="shareChat">
					<text class="dropdown-icon">↗</text>
					<text class="dropdown-text">{{ tt('分享对话') }}</text>
				</view>
			</view>
		</view>

		<!-- 菜单遮罩 -->
		<view class="dropdown-mask" v-if="showNavMenu" @click="showNavMenu = false"></view>

		<!-- 聊天消息区 -->
		<scroll-view scroll-y class="chat-area" :scroll-into-view="scrollToId" scroll-with-animation v-if="hasOC">
			<view class="chat-date">
				<text class="date-text">—— {{ todayStr }} ——</text>
			</view>

			<view v-for="(msg, idx) in messages" :key="msg.id || idx" :id="'msg-' + idx" class="msg-row" :class="msg.type">
				<!-- OC 消息 -->
				<template v-if="msg.type === 'oc'">
					<view class="msg-avatar" :style="{ background: currentOC.avatar ? 'transparent' : currentOC.gradient }">
						<image v-if="currentOC.avatar" :src="currentOC.avatar" class="msg-avatar-img" mode="aspectFill" />
						<text v-else class="msg-avatar-emoji">{{ currentOC.emoji }}</text>
					</view>
					<view class="msg-bubble oc-bubble" @longpress="copyMsg(msg.text)">
						<image v-if="msg.image_url" :src="msg.image_url" mode="widthFix" class="msg-image" @click="previewImage(msg.image_url)" />
						<text v-if="msg.text" class="msg-text">{{ msg.text }}</text>
						<text v-if="msg.time" class="msg-time">{{ msg.time }}</text>
					</view>
				</template>

				<!-- 用户消息 -->
				<template v-if="msg.type === 'user'">
					<view class="msg-bubble user-bubble" @longpress="copyMsg(msg.text)">
						<image v-if="msg.image_url" :src="msg.image_url" mode="widthFix" class="msg-image" @click="previewImage(msg.image_url)" />
						<text v-if="msg.text" class="msg-text">{{ msg.text }}</text>
						<text v-if="msg.time" class="msg-time">{{ msg.time }}</text>
					</view>
					<view class="msg-avatar user-avatar-wrap">
						<text class="msg-avatar-emoji">👤</text>
					</view>
				</template>

				<!-- 系统消息 -->
				<template v-if="msg.type === 'system'">
					<view class="system-msg">
						<text class="system-text">{{ msg.text }}</text>
					</view>
				</template>
			</view>

			<!-- 正在输入 -->
			<view class="msg-row oc" v-if="isTyping">
				<view class="msg-avatar" :style="{ background: currentOC.avatar ? 'transparent' : currentOC.gradient }">
					<image v-if="currentOC.avatar" :src="currentOC.avatar" class="msg-avatar-img" mode="aspectFill" />
					<text v-else class="msg-avatar-emoji">{{ currentOC.emoji }}</text>
				</view>
				<view class="msg-bubble oc-bubble typing-bubble">
					<view class="typing-dots">
						<view class="dot" v-for="i in 3" :key="i"></view>
					</view>
				</view>
			</view>

			<view style="height: 40rpx;" :id="'msg-bottom'"></view>
		</scroll-view>

		<!-- 功能区 -->
		<view class="func-bar" v-if="hasOC">
			<view class="func-item" @click="voiceCall">
				<view class="func-icon-wrap" :class="{ 'voice-active': isCalling }">
					<text class="func-icon">🎙️</text>
					<view class="sound-waves" v-if="isCalling">
						<view class="wave" v-for="i in 3" :key="i"></view>
					</view>
				</view>
				<text class="func-label">{{ isCalling ? callTimeStr : tt('语音通话') }}</text>
			</view>
			<view class="func-item" @click="sendPhoto">
				<view class="func-icon-wrap">
					<text class="func-icon">📷</text>
				</view>
				<text class="func-label">{{ tt('分享照片') }}</text>
			</view>
			<view class="func-item" @click="openGiftShop">
				<view class="func-icon-wrap">
					<text class="func-icon">🎁</text>
				</view>
				<text class="func-label">{{ tt('送礼物') }}</text>
			</view>
		</view>

		<!-- 输入区域 -->
		<view class="input-bar" v-if="hasOC">
			<view class="input-wrap">
				<input v-model="inputText" :placeholder="tt('输入消息...')" placeholder-class="input-placeholder"
					@confirm="sendMessage" confirm-type="send" />
			</view>
			<view class="send-btn" :class="{ active: inputText.trim() }" @click="sendMessage">
				<text class="send-icon">➤</text>
			</view>
		</view>

		<!-- 付费提示 -->
		<view class="premium-bar" @click="showPremium = true" v-if="hasOC && !isVip">
			<text class="premium-icon">✨</text>
			<text class="premium-text">{{ tt('解锁「实时电话」功能，与 OC 深度连接') }}</text>
			<view class="premium-btn">
				<text class="premium-btn-text">{{ tt('开通') }}</text>
			</view>
		</view>

		<!-- 空状态：没有 OC -->
		<view class="empty-state" v-if="!hasOC">
			<view class="empty-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
				<text class="empty-nav-title">{{ t('page.chat') }}</text>
				<view class="empty-nav-lang"><LangSwitch /></view>
			</view>
			<view class="empty-body">
				<text class="empty-emoji">💬</text>
				<text class="empty-title">{{ tt('还没有可通话的角色') }}</text>
				<text class="empty-desc">{{ tt('先去编辑器创建一个 OC 角色，然后回来和 TA 聊天吧！') }}</text>
				<view class="empty-btn" @click="goToEditor">
					<text class="empty-btn-text">{{ tt('去创建角色') }}</text>
				</view>
			</view>
		</view>

		<!-- ===== 弹窗层 ===== -->

		<!-- OC 选择器 -->
		<view class="modal-mask" v-if="showOCPicker" @click="showOCPicker = false">
			<view class="modal-card" @click.stop>
				<text class="modal-title">{{ tt('选择聊天角色') }}</text>
				<view class="oc-pick-list">
					<view v-for="oc in ocList" :key="oc.id" class="oc-pick-item"
						:class="{ active: currentOC.id === oc.id }" @click="switchOC(oc)">
						<view class="pick-avatar" :style="{ background: oc.gradient }">
							<text class="pick-emoji">{{ oc.emoji }}</text>
						</view>
						<view class="pick-info">
							<text class="pick-name">{{ oc.name }}</text>
							<text class="pick-title">{{ oc.title }} | Lv.{{ oc.level }}</text>
						</view>
						<text v-if="currentOC.id === oc.id" class="pick-check">✓</text>
					</view>
				</view>
				<view class="modal-close" @click="showOCPicker = false">
					<text class="close-text">{{ tt('关闭') }}</text>
				</view>
			</view>
		</view>

		<!-- 礼物商店 -->
		<view class="modal-mask" v-if="showGift" @click="showGift = false">
			<view class="modal-card" @click.stop>
				<text class="modal-title">{{ tt('礼物商店') }}</text>
				<view class="gift-grid">
					<view v-for="gift in gifts" :key="gift.name" class="gift-item" @click="sendGift(gift)">
						<text class="gift-emoji">{{ gift.emoji }}</text>
						<text class="gift-name">{{ gift.name }}</text>
						<text class="gift-effect">{{ tt('亲密度') }} +{{ gift.intimacy }}</text>
					</view>
				</view>
				<view class="modal-close" @click="showGift = false">
					<text class="close-text">{{ tt('关闭') }}</text>
				</view>
			</view>
		</view>

		<!-- 付费弹窗 -->
		<view class="modal-mask" v-if="showPremium" @click="showPremium = false">
			<view class="modal-card premium-modal" @click.stop>
				<text class="modal-title">{{ tt('开通 VIP 契约') }}</text>
				<view class="premium-content">
					<view class="premium-feature" v-for="f in premiumFeatures" :key="f.name">
						<text class="pf-icon">{{ f.icon }}</text>
						<view class="pf-info">
							<text class="pf-name">{{ f.name }}</text>
							<text class="pf-desc">{{ f.desc }}</text>
						</view>
					</view>
				</view>
				<view class="premium-price-row">
					<view class="price-card" :class="{ active: selectedPlan === 0 }" @click="selectedPlan = 0">
						<text class="price-duration">{{ tt('月卡') }}</text>
						<text class="price-amount">¥28</text>
					</view>
					<view class="price-card" :class="{ active: selectedPlan === 1 }" @click="selectedPlan = 1">
						<text class="price-duration">{{ tt('季卡') }}</text>
						<text class="price-amount">¥68</text>
						<text class="price-save">{{ tt('省16元') }}</text>
					</view>
					<view class="price-card" :class="{ active: selectedPlan === 2 }" @click="selectedPlan = 2">
						<text class="price-duration">{{ tt('年卡') }}</text>
						<text class="price-amount">¥198</text>
						<text class="price-save">{{ tt('省138元') }}</text>
					</view>
				</view>
				<view class="premium-buy" @click="buyPremium">
					<text class="buy-text">{{ tt('立即开通') }}</text>
				</view>
			</view>
		</view>

		<!-- 通话中浮窗 -->
		<view class="call-overlay" v-if="isCalling" @click="voiceCall">
			<view class="call-card" @click.stop>
				<view class="call-avatar" :style="{ background: currentOC.avatar ? 'transparent' : currentOC.gradient }">
					<image v-if="currentOC.avatar" :src="currentOC.avatar" class="call-avatar-img" mode="aspectFill" />
					<text v-else class="call-emoji">{{ currentOC.emoji }}</text>
				</view>
				<text class="call-name">{{ currentOC.name }}</text>
			<text class="call-status">{{ tt('通话中') }} {{ callTimeStr }}</text>

				<!-- 音色切换 -->
				<view class="tone-current" @click="showTonePicker = !showTonePicker">
					<text class="tone-current-emoji">{{ voiceTones[selectedTone].emoji }}</text>
					<text class="tone-current-name">{{ voiceTones[selectedTone].name }}</text>
					<text class="tone-arrow">{{ showTonePicker ? '▴' : '▾' }}</text>
				</view>

				<!-- 音色选择面板 -->
				<scroll-view v-if="showTonePicker" scroll-x class="tone-picker" :show-scrollbar="false">
					<view class="tone-list">
						<view v-for="(tone, idx) in voiceTones" :key="idx" class="tone-card"
							:class="{ active: selectedTone === idx }" @click="selectTone(idx)">
							<text class="tone-card-emoji">{{ tone.emoji }}</text>
							<text class="tone-card-name">{{ tone.name }}</text>
							<text class="tone-card-desc">{{ tone.desc }}</text>
						</view>
					</view>
				</scroll-view>

				<view class="call-waves">
					<view v-for="i in 12" :key="i" class="cw-bar" :style="{ animationDelay: i * 0.08 + 's' }"></view>
				</view>
				<view class="call-end" @click.stop="voiceCall">
				<text class="call-end-text">{{ tt('挂断') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'
import { getOCList, saveOCList, getUserProfile, saveUserProfile, isLoggedIn } from '../../utils/store.js'
import {
	createChatSession,
	getSessionMessages,
	sendSessionGift,
	sendSessionImageMessage,
	sendSessionMessage,
	sendSessionVoiceCallLog,
} from '../../utils/apis/chat.js'
import { fetchMemories } from '../../utils/apis/memory.js'
import { activateDemoVip } from '../../utils/apis/vip.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()
const inputText = ref('')
const isTyping = ref(false)
const scrollToId = ref('')
const currentSession = ref(null)
const isBootstrapping = ref(false)

// 弹窗
const showOCPicker = ref(false)
const showGift = ref(false)
const showPremium = ref(false)
const isVip = ref(false)
const showNavMenu = ref(false)
const selectedPlan = ref(1)

// OC 数据
const ocList = ref([])
const hasOC = ref(false)
const currentOC = ref({ id: 0, name: '', emoji: '🌙', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', voiceLines: [] })
const messages = ref([])

// 通话
const isCalling = ref(false)
let callTimer = null
const callSeconds = ref(0)
const callTimeStr = computed(() => {
	const m = String(Math.floor(callSeconds.value / 60)).padStart(2, '0')
	const s = String(callSeconds.value % 60).padStart(2, '0')
	return `${m}:${s}`
})

// 音色
const voiceTones = computed(() => [
	{ name: tt('温柔甜美'), emoji: '🌸', desc: tt('轻柔温暖的声线') },
	{ name: tt('冷酷低沉'), emoji: '🌑', desc: tt('深沉有磁性的音色') },
	{ name: tt('活泼元气'), emoji: '⚡', desc: tt('充满活力的声音') },
	{ name: tt('沉稳磁性'), emoji: '🎙️', desc: tt('成熟稳重的嗓音') },
	{ name: tt('可爱软萌'), emoji: '🍬', desc: tt('甜甜的软糯音色') },
])
const selectedTone = ref(0)
const showTonePicker = ref(false)

function selectTone(idx) {
	selectedTone.value = idx
	showTonePicker.value = false
}

const todayStr = computed(() => {
	const d = new Date()
	return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})

// 礼物列表
const gifts = computed(() => [
	{ name: tt('樱花束'), emoji: '🌸', intimacy: 5, reply: tt('哇！好漂亮的樱花！谢谢你～ 🌸') },
	{ name: tt('星之碎片'), emoji: '⭐', intimacy: 10, reply: tt('星之碎片...这是很珍贵的东西呢，我会好好珍藏的！') },
	{ name: tt('魔法水晶'), emoji: '🔮', intimacy: 20, reply: tt('水晶球里映出了...你的笑脸！好神奇～') },
	{ name: tt('契约之戒'), emoji: '💍', intimacy: 50, reply: tt('这、这是...契约之戒！我...我好开心...！💕') },
	{ name: tt('巧克力'), emoji: '🍫', intimacy: 3, reply: tt('巧克力！甜甜的，就像你一样～') },
	{ name: tt('手写信'), emoji: '💌', intimacy: 15, reply: tt('你写了信给我？让我仔细读读...好感动呢！') },
])

const premiumFeatures = computed(() => [
	{ icon: '📞', name: tt('实时电话'), desc: tt('OC 主动来电，沉浸式语音互动') },
	{ icon: '🎨', name: tt('独享立绘'), desc: tt('解锁 OC 高清限定立绘') },
	{ icon: '💕', name: tt('亲密加速'), desc: tt('亲密度积累速度 x2') },
	{ icon: '🌟', name: tt('特殊剧情'), desc: tt('解锁隐藏剧情线和记忆') },
])

function getSelectedPlanCode() {
	if (selectedPlan.value === 0) return 'month'
	if (selectedPlan.value === 2) return 'year'
	return 'quarter'
}

function syncVipToLocal(flag) {
	isVip.value = flag === true
	const profile = getUserProfile()
	if (profile.vip !== isVip.value) {
		profile.vip = isVip.value
		saveUserProfile(profile)
	}
}

function updateCurrentOCFromSession(session) {
	if (!session) return
	const list = getOCList()
	const idx = list.findIndex(item => String(item.id) === String(session.oc_id))
	if (idx === -1) return

	const target = list[idx]
	const nextStats = { ...(target.stats || {}) }
	nextStats.intimacy = session.intimacy
	list[idx] = {
		...target,
		name: session.oc_name || target.name,
		emoji: session.oc_emoji || target.emoji,
		avatar: session.oc_avatar || target.avatar,
		gradient: session.oc_gradient || target.gradient,
		title: session.oc_title || target.title,
		level: session.level,
		stats: nextStats,
	}
	saveOCList(list)
	ocList.value = list

	const refreshed = list[idx]
	if (String(currentOC.value.id) === String(refreshed.id)) {
		currentOC.value = refreshed
	}
	uni.$emit('refreshIndex')
}

async function refreshMemories() {
	if (!isLoggedIn()) return
	try {
		await fetchMemories({ syncLocal: true })
		uni.$emit('refreshIndex')
	} catch (error) {
		console.warn('刷新记忆失败', error)
	}
}

function applyInteractionResult(result, { skipUserMessages = false } = {}) {
	if (!result) return
	if (result.session) {
		currentSession.value = result.session
		updateCurrentOCFromSession(result.session)
		syncVipToLocal(result.vip?.is_active ?? result.session.is_vip_active)
	}
	if (Array.isArray(result.messages) && result.messages.length) {
		const toAdd = skipUserMessages
			? result.messages.filter(m => m.type !== 'user')
			: result.messages
		if (toAdd.length) messages.value = [...messages.value, ...toAdd]
	}
	scrollToBottom()
	if (Array.isArray(result.memories) && result.memories.length) {
		refreshMemories()
	}
}

function buildSessionPayload(oc) {
	return {
		oc_id: String(oc.id),
		oc_name: oc.name,
		oc_emoji: oc.emoji || '',
		oc_avatar: oc.avatar || '',
		oc_gradient: oc.gradient || '',
		oc_title: oc.title || '',
		initial_intimacy: oc.stats?.intimacy || 0,
		initial_level: oc.level || 1,
	}
}

async function bootstrapCurrentSession() {
	if (!hasOC.value || !currentOC.value?.id) return
	if (!isLoggedIn()) {
		currentSession.value = null
		messages.value = [
			{ id: 'login-required', type: 'system', text: tt('登录后可同步服务端会话与记忆'), time: '', metadata: { event_type: 'login_required' } }
		]
		return
	}

	isBootstrapping.value = true
	try {
		const created = await createChatSession(buildSessionPayload(currentOC.value))
		currentSession.value = created.session
		updateCurrentOCFromSession(created.session)

		const result = await getSessionMessages(created.session.id)
		currentSession.value = result.session
		messages.value = result.items
		updateCurrentOCFromSession(result.session)
		syncVipToLocal(result.vip?.is_active ?? result.session.is_vip_active)
		scrollToBottom()
		refreshMemories()
	} catch (error) {
		currentSession.value = null
		messages.value = [
			{ id: 'load-error', type: 'system', text: tt(error.message || '加载聊天失败'), time: '', metadata: { event_type: 'load_error' } }
		]
		uni.showToast({ title: tt(error.message || '加载聊天失败'), icon: 'none' })
	} finally {
		isBootstrapping.value = false
	}
}

async function loadData() {
	syncVipToLocal(getUserProfile().vip === true)
	ocList.value = getOCList()
	if (ocList.value.length === 0) {
		hasOC.value = false
		currentSession.value = null
		messages.value = []
		return
	}
	hasOC.value = true
	// 尝试恢复上次聊天的 OC，否则选第一个
	const savedOCId = uni.getStorageSync('chatOCId')
	let oc = null
	if (savedOCId) oc = ocList.value.find(o => String(o.id) === String(savedOCId))
	if (!oc) oc = ocList.value[0]
	currentOC.value = oc
	uni.setStorageSync('chatOCId', oc.id)
	await bootstrapCurrentSession()
}

function scrollToBottom() {
	nextTick(() => {
		scrollToId.value = ''
		setTimeout(() => { scrollToId.value = 'msg-bottom' }, 50)
	})
}

onMounted(() => {
	// 监听编辑器保存事件，刷新 OC 数据
	uni.$on('refreshChat', loadData)
})

onShow(() => {
	loadData()
})

onUnmounted(() => {
	if (callTimer) clearInterval(callTimer)
	uni.$off('refreshChat', loadData)
})

// 切换 OC
async function switchOC(oc) {
	const freshList = getOCList()
	const freshOC = freshList.find(o => o.id === oc.id) || oc
	currentOC.value = freshOC
	uni.setStorageSync('chatOCId', freshOC.id)
	await bootstrapCurrentSession()
	showOCPicker.value = false
}

// 发送消息
async function sendMessage() {
	const text = inputText.value.trim()
	if (!text) return
	if (!isLoggedIn()) {
		uni.showToast({ title: tt('请先登录'), icon: 'none' })
		return
	}
	if (!currentSession.value?.id || isBootstrapping.value) return

	inputText.value = ''
	isTyping.value = true
	messages.value = [...messages.value, {
		type: 'user',
		text,
		created_at: new Date().toISOString(),
	}]
	scrollToBottom()
	try {
		const result = await sendSessionMessage(currentSession.value.id, text)
		applyInteractionResult(result, { skipUserMessages: true })
	} catch (error) {
		uni.showToast({ title: tt(error.message || '发送失败'), icon: 'none' })
	} finally {
		isTyping.value = false
	}
}

// 发送照片
function sendPhoto() {
	if (!isLoggedIn()) {
		uni.showToast({ title: tt('请先登录'), icon: 'none' })
		return
	}
	if (!currentSession.value?.id) return

	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			const tempPath = res.tempFilePaths[0]
			isTyping.value = true
			try {
				const result = await sendSessionImageMessage(currentSession.value.id, tempPath)
				applyInteractionResult(result)
			} catch (error) {
				uni.showToast({ title: tt(error.message || '发送失败'), icon: 'none' })
			} finally {
				isTyping.value = false
			}
		}
	})
}

// 语音通话
async function voiceCall() {
	if (isCalling.value) {
		// 挂断
		isCalling.value = false
		if (callTimer) { clearInterval(callTimer); callTimer = null }
		const duration = callSeconds.value
		callSeconds.value = 0
		if (!currentSession.value?.id) return
		try {
			const tone = voiceTones.value[selectedTone.value] || {}
			const result = await sendSessionVoiceCallLog(currentSession.value.id, {
				duration_seconds: Math.max(duration, 1),
				tone_name: tone.name || '',
				tone_emoji: tone.emoji || '',
			})
			applyInteractionResult(result)
		} catch (error) {
			uni.showToast({ title: tt(error.message || '通话记录保存失败'), icon: 'none' })
		}
	} else {
		if (!isLoggedIn()) {
			uni.showToast({ title: tt('请先登录'), icon: 'none' })
			return
		}
		if (!isVip.value) {
			showPremium.value = true
			return
		}
		if (!currentSession.value?.id) return
		// 发起通话
		isCalling.value = true
		callSeconds.value = 0
		showTonePicker.value = false
		callTimer = setInterval(() => { callSeconds.value++ }, 1000)
	}
}

// 礼物
function openGiftShop() { showGift.value = true }
async function sendGift(gift) {
	showGift.value = false
	if (!isLoggedIn()) {
		uni.showToast({ title: tt('请先登录'), icon: 'none' })
		return
	}
	if (!currentSession.value?.id) return

	try {
		const result = await sendSessionGift(currentSession.value.id, {
			gift_code: gift.code || gift.name,
			name: gift.name,
			emoji: gift.emoji,
			intimacy: gift.intimacy,
			reply_text: gift.reply,
		})
		applyInteractionResult(result)
	} catch (error) {
		uni.showToast({ title: tt(error.message || '送礼失败'), icon: 'none' })
	}
}

// 付费
async function buyPremium() {
	if (!isLoggedIn()) {
		uni.showToast({ title: tt('请先登录'), icon: 'none' })
		return
	}
	try {
		const res = await activateDemoVip({
			plan_code: getSelectedPlanCode(),
			session_id: currentSession.value?.id || null,
		})
		syncVipToLocal(res.vip?.is_active === true)
		showPremium.value = false
		uni.showToast({ title: tt('VIP 体验版已开通'), icon: 'none' })
		if (res.activation_message) {
			messages.value = [...messages.value, res.activation_message]
			scrollToBottom()
		}
	} catch (error) {
		uni.showToast({ title: tt(error.message || 'VIP 开通失败'), icon: 'none' })
	}
}

// 工具
function copyMsg(text) {
	if (!text) return
	uni.setClipboardData({
		data: text,
			success: () => uni.showToast({ title: tt('已复制'), icon: 'none' })
	})
}

function previewImage(src) {
	uni.previewImage({ urls: [src], current: src })
}

function clearChat() {
	showNavMenu.value = false
	uni.showToast({ title: tt('当前版本暂不支持清空服务端会话'), icon: 'none' })
}

function shareChat() {
	showNavMenu.value = false
	const recent = messages.value.filter(m => m.type !== 'system').slice(-5)
	if (!recent.length) {
		uni.showToast({ title: tt('暂无对话可分享'), icon: 'none' })
		return
	}
	const text = recent.map(m => `${m.type === 'user' ? tt('我') : currentOC.value.name}：${m.text || (m.image_url ? tt('[图片]') : '')}`).join('\n')
	uni.setClipboardData({
		data: `【与${currentOC.value.name}的对话】\n${text}\n—— ${tt('来自 OC Universe')}`,
		success: () => {
			setTimeout(() => {
				uni.showToast({ title: tt('复制成功'), icon: 'success' })
			}, 200)
		}
	})
}

function goToEditor() {
	uni.switchTab({ url: '/pages/editor/editor' })
}
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); display: flex; flex-direction: column; position: relative; }
.bg-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); z-index: 0; }

/* 导航栏 - 增强毛玻璃 */
.nav-bar { position: relative; z-index: 100; background: rgba(255,255,255,0.78); backdrop-filter: blur(36px) saturate(1.6); border-bottom: 1rpx solid rgba(167,139,250,0.1); box-shadow: 0 2rpx 16rpx rgba(167,139,250,0.04); }
.nav-content { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 30rpx 20rpx; }
.chat-oc-info { display: flex; align-items: center; }
.nav-actions { display: flex; align-items: center; gap: 14rpx; flex-shrink: 0; }
.oc-avatar-small { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6rpx 20rpx rgba(167,139,250,0.15); overflow: hidden; border: 2rpx solid rgba(255,255,255,0.5); }
.oc-avatar-img { width: 80rpx; height: 80rpx; border-radius: 50%; }
.oc-emoji { font-size: 40rpx; }
.oc-meta { margin-left: 20rpx; }
.oc-chat-name { font-size: 32rpx; font-weight: 700; color: #374151; display: block; letter-spacing: 1rpx; }
.online-status { display: flex; align-items: center; margin-top: 6rpx; }
.status-dot { width: 14rpx; height: 14rpx; border-radius: 50%; background: #4ade80; margin-right: 8rpx; box-shadow: 0 0 10rpx rgba(74,222,128,0.5); animation: onlinePulse 2.5s ease-in-out infinite; }
@keyframes onlinePulse { 0%, 100% { box-shadow: 0 0 8rpx rgba(74,222,128,0.4); } 50% { box-shadow: 0 0 16rpx rgba(74,222,128,0.6); } }
.status-text { font-size: 22rpx; color: #b4a0d6; }
.nav-menu { width: 64rpx; height: 64rpx; border-radius: 50%; background: rgba(167,139,250,0.06); display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.nav-menu:active { background: rgba(167,139,250,0.12); }
.menu-icon { font-size: 36rpx; color: #a78bfa; }

.dropdown-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 99; }
.nav-dropdown { position: absolute; top: 100%; right: 30rpx; background: rgba(255,255,255,0.97); backdrop-filter: blur(24px); border-radius: 20rpx; box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.12); overflow: hidden; z-index: 101; min-width: 240rpx; }
.dropdown-item { display: flex; align-items: center; padding: 24rpx 28rpx; gap: 16rpx; }
.dropdown-item:active { background: rgba(167,139,250,0.06); }
.dropdown-item:not(:last-child) { border-bottom: 1rpx solid rgba(0,0,0,0.04); }
.dropdown-icon { font-size: 28rpx; }
.dropdown-text { font-size: 26rpx; color: #374151; font-weight: 500; white-space: nowrap; }

/* 聊天区域 */
.chat-area { position: relative; z-index: 5; flex: 1; padding: 20rpx 0; height: calc(100vh - 520rpx); }
.chat-date { text-align: center; margin: 20rpx 0 30rpx; }
.date-text { font-size: 22rpx; color: #d1d5db; }

.msg-row { display: flex; align-items: flex-start; margin-bottom: 24rpx; padding: 0 24rpx; }
.msg-row.oc { justify-content: flex-start; }
.msg-row.user { justify-content: flex-end; }
.msg-row.system { justify-content: center; }

.msg-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 16rpx; overflow: hidden; }
.msg-avatar-img { width: 72rpx; height: 72rpx; border-radius: 50%; }
.user-avatar-wrap { background: linear-gradient(135deg, #667eea, #764ba2); margin-right: 0; margin-left: 16rpx; }
.msg-avatar-emoji { font-size: 32rpx; }

.msg-bubble { max-width: 65%; padding: 22rpx 30rpx; border-radius: 28rpx; position: relative; }
.oc-bubble { background: rgba(255,255,255,0.75); backdrop-filter: blur(28px) saturate(1.3); border: 1rpx solid rgba(255,255,255,0.8); border-radius: 12rpx 32rpx 32rpx 32rpx; box-shadow: 0 6rpx 28rpx rgba(167,139,250,0.06), inset 0 1rpx 0 rgba(255,255,255,0.95); }
.user-bubble { background: linear-gradient(135deg, rgba(249,168,212,0.85), rgba(192,132,252,0.78)); backdrop-filter: blur(16px); border: 1rpx solid rgba(255,255,255,0.35); border-radius: 32rpx 12rpx 32rpx 32rpx; box-shadow: 0 6rpx 28rpx rgba(192,132,252,0.22), inset 0 1rpx 0 rgba(255,255,255,0.25); }
.msg-text { font-size: 28rpx; color: #374151; line-height: 1.7; display: block; }
.user-bubble .msg-text { color: #fff; text-shadow: 0 1rpx 2rpx rgba(0,0,0,0.06); }
.msg-time { font-size: 20rpx; color: #c9b8e8; display: block; margin-top: 8rpx; text-align: right; }
.user-bubble .msg-time { color: rgba(255,255,255,0.6); }
.msg-image { width: 100%; border-radius: 16rpx; max-width: 400rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08); }

.system-msg { background: rgba(192,132,252,0.06); border-radius: 20rpx; padding: 10rpx 28rpx; border: 1rpx solid rgba(192,132,252,0.08); }
.system-text { font-size: 22rpx; color: #c084fc; font-weight: 500; }

.typing-bubble { padding: 20rpx 32rpx; }
.typing-dots { display: flex; gap: 8rpx; align-items: center; }
.dot { width: 14rpx; height: 14rpx; border-radius: 50%; background: #d1d5db; animation: typingBounce 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-10rpx); } }

/* 功能区 - 精致化 */
.func-bar { position: relative; z-index: 10; display: flex; justify-content: center; gap: 48rpx; padding: 20rpx 0; background: rgba(255,255,255,0.55); backdrop-filter: blur(24px) saturate(1.4); border-top: 1rpx solid rgba(255,255,255,0.6); box-shadow: 0 -2rpx 12rpx rgba(167,139,250,0.03); }
.func-item { display: flex; flex-direction: column; align-items: center; }
.func-icon-wrap { width: 88rpx; height: 88rpx; border-radius: 50%; background: rgba(192,132,252,0.08); border: 2rpx solid rgba(192,132,252,0.08); display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.func-icon-wrap:active { transform: scale(0.9); background: rgba(192,132,252,0.15); }
.voice-active { background: rgba(255,100,100,0.15); box-shadow: 0 0 24rpx rgba(255,100,100,0.25); border-color: rgba(255,100,100,0.2); }
.func-icon { font-size: 36rpx; }
.func-label { font-size: 20rpx; color: #b4a0d6; margin-top: 8rpx; font-weight: 500; }

.sound-waves { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.wave { position: absolute; border: 3rpx solid rgba(167,139,250,0.5); border-radius: 50%; animation: waveExpand 1.5s ease-out infinite; }
.wave:nth-child(1) { width: 80rpx; height: 80rpx; top: -40rpx; left: -40rpx; }
.wave:nth-child(2) { width: 120rpx; height: 120rpx; top: -60rpx; left: -60rpx; animation-delay: 0.3s; }
.wave:nth-child(3) { width: 160rpx; height: 160rpx; top: -80rpx; left: -80rpx; animation-delay: 0.6s; }
@keyframes waveExpand { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(1.2); opacity: 0; } }

/* 输入区 - 增强精致度 */
.input-bar { position: relative; z-index: 10; display: flex; align-items: center; padding: 16rpx 24rpx; background: rgba(255,255,255,0.85); backdrop-filter: blur(28px) saturate(1.5); }
.input-wrap { flex: 1; background: rgba(167,139,250,0.04); border-radius: 36rpx; padding: 18rpx 28rpx; border: 2rpx solid rgba(167,139,250,0.08); transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.input-wrap:focus-within { border-color: rgba(192,132,252,0.2); background: rgba(255,255,255,0.6); box-shadow: 0 0 0 6rpx rgba(192,132,252,0.06); }
.input-wrap input { font-size: 28rpx; color: #374151; }
.input-placeholder { color: #c9b8e8; }
.send-btn { width: 76rpx; height: 76rpx; border-radius: 50%; background: rgba(167,139,250,0.06); display: flex; align-items: center; justify-content: center; margin-left: 16rpx; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.send-btn.active { background: linear-gradient(135deg, #f9a8d4, #c084fc); box-shadow: 0 6rpx 24rpx rgba(192,132,252,0.4); }
.send-btn:active { transform: scale(0.9); }
.send-icon { font-size: 32rpx; color: #c9b8e8; }
.send-btn.active .send-icon { color: #fff; }

/* 付费提示条 */
.premium-bar { position: relative; z-index: 10; display: flex; align-items: center; padding: 16rpx 30rpx; background: linear-gradient(90deg, rgba(255,182,193,0.12), rgba(167,139,250,0.12)); padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); }
.premium-icon { font-size: 28rpx; margin-right: 12rpx; }
.premium-text { flex: 1; font-size: 22rpx; color: #a78bfa; }
.premium-btn { background: linear-gradient(135deg, #FFB6C1, #a78bfa); border-radius: 20rpx; padding: 8rpx 24rpx; }
.premium-btn-text { font-size: 22rpx; color: #fff; font-weight: 600; }

/* 弹窗通用 - 增强毛玻璃质感 */
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,10,30,0.4); backdrop-filter: blur(8px); z-index: 999; display: flex; align-items: center; justify-content: center; }
.modal-card { width: 85%; background: rgba(255,255,255,0.92); backdrop-filter: blur(40px) saturate(1.8); border-radius: 40rpx; overflow: hidden; box-shadow: 0 24rpx 80rpx rgba(167,139,250,0.15), 0 0 1rpx rgba(255,255,255,0.8); border: 1rpx solid rgba(255,255,255,0.6); }
.modal-title { font-size: 32rpx; font-weight: 800; color: #374151; display: block; text-align: center; padding: 32rpx 0 16rpx; letter-spacing: 1rpx; }
.modal-close { text-align: center; padding: 24rpx; border-top: 1rpx solid rgba(167,139,250,0.08); }
.close-text { font-size: 28rpx; color: #c084fc; font-weight: 600; }

/* OC 选择器 */
.oc-pick-list { padding: 0 24rpx 16rpx; }
.oc-pick-item { display: flex; align-items: center; padding: 20rpx 16rpx; border-radius: 20rpx; margin-bottom: 12rpx; transition: background 0.2s; }
.oc-pick-item.active { background: rgba(167,139,250,0.06); }
.pick-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.pick-emoji { font-size: 36rpx; }
.pick-info { flex: 1; margin-left: 20rpx; }
.pick-name { font-size: 28rpx; font-weight: 600; color: #374151; display: block; }
.pick-title { font-size: 22rpx; color: #9ca3af; display: block; margin-top: 4rpx; }
.pick-check { font-size: 32rpx; color: #a78bfa; font-weight: 700; }

/* 礼物 */
.gift-grid { display: flex; flex-wrap: wrap; padding: 0 24rpx 24rpx; gap: 16rpx; }
.gift-item { width: calc(33.33% - 12rpx); text-align: center; padding: 20rpx 8rpx; background: linear-gradient(135deg, rgba(249,168,212,0.04), rgba(192,132,252,0.04)); border-radius: 20rpx; border: 2rpx solid rgba(192,132,252,0.06); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.gift-item:active { background: linear-gradient(135deg, rgba(249,168,212,0.18), rgba(192,132,252,0.15)); border-color: rgba(192,132,252,0.25); box-shadow: 0 4rpx 16rpx rgba(192,132,252,0.12); transform: scale(0.96); }
.gift-emoji { font-size: 48rpx; display: block; }
.gift-name { font-size: 24rpx; color: #374151; display: block; margin-top: 8rpx; font-weight: 600; }
.gift-effect { font-size: 20rpx; color: #10b981; display: block; margin-top: 4rpx; }

/* 付费弹窗 - 精致化 */
.premium-content { padding: 0 32rpx; }
.premium-feature { display: flex; align-items: center; padding: 18rpx 0; }
.pf-icon { font-size: 36rpx; margin-right: 16rpx; }
.pf-info { flex: 1; }
.pf-name { font-size: 28rpx; font-weight: 700; color: #374151; display: block; }
.pf-desc { font-size: 22rpx; color: #b4a0d6; display: block; margin-top: 4rpx; }
.premium-price-row { display: flex; padding: 24rpx 32rpx; gap: 16rpx; }
.price-card { flex: 1; text-align: center; padding: 24rpx 8rpx; border-radius: 24rpx; border: 2rpx solid rgba(167,139,250,0.08); background: linear-gradient(180deg, rgba(167,139,250,0.02), rgba(249,168,212,0.02)); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; }
.price-card.active { border-color: rgba(192,132,252,0.4); background: linear-gradient(135deg, rgba(249,168,212,0.08), rgba(192,132,252,0.1)); box-shadow: 0 6rpx 24rpx rgba(192,132,252,0.14); }
.price-duration { font-size: 24rpx; color: #6b7280; display: block; }
.price-amount { font-size: 36rpx; font-weight: 800; color: #374151; display: block; margin-top: 8rpx; }
.price-save { font-size: 18rpx; color: #10b981; display: block; margin-top: 6rpx; font-weight: 600; }
.premium-buy { margin: 0 32rpx 32rpx; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); border-radius: 44rpx; padding: 28rpx; text-align: center; box-shadow: 0 8rpx 36rpx rgba(192,132,252,0.3); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.premium-buy:active { transform: scale(0.97); box-shadow: 0 4rpx 20rpx rgba(192,132,252,0.25); }
.buy-text { font-size: 30rpx; color: #fff; font-weight: 700; text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.1); }

/* 通话浮窗 */
.call-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.65); backdrop-filter: blur(12px) saturate(1.2); z-index: 998; display: flex; align-items: center; justify-content: center; }
.call-card { display: flex; flex-direction: column; align-items: center; padding: 60rpx 40rpx; width: 100%; }
.call-avatar { width: 160rpx; height: 160rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 50rpx rgba(192,132,252,0.25), 0 0 20rpx rgba(255,255,255,0.15); overflow: hidden; border: 3rpx solid rgba(255,255,255,0.2); }
.call-avatar-img { width: 160rpx; height: 160rpx; border-radius: 50%; }
.call-emoji { font-size: 72rpx; }
.call-name { font-size: 36rpx; font-weight: 700; color: #fff; margin-top: 24rpx; }
.call-status { font-size: 26rpx; color: rgba(255,255,255,0.7); margin-top: 12rpx; }

/* 音色切换 */
.tone-current { display: flex; align-items: center; gap: 12rpx; margin-top: 28rpx; padding: 14rpx 32rpx; border-radius: 32rpx; background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); border: 1rpx solid rgba(255,255,255,0.2); }
.tone-current-emoji { font-size: 28rpx; }
.tone-current-name { font-size: 24rpx; color: rgba(255,255,255,0.9); font-weight: 600; }
.tone-arrow { font-size: 22rpx; color: rgba(255,255,255,0.5); }
.tone-picker { width: 100%; max-width: 650rpx; margin-top: 20rpx; white-space: nowrap; }
.tone-list { display: inline-flex; gap: 16rpx; padding: 0 20rpx; }
.tone-card { display: inline-flex; flex-direction: column; align-items: center; width: 160rpx; padding: 24rpx 16rpx; border-radius: 24rpx; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 2rpx solid rgba(255,255,255,0.15); flex-shrink: 0; transition: all 0.3s; }
.tone-card.active { background: linear-gradient(135deg, rgba(255,182,193,0.35), rgba(167,139,250,0.35)); border-color: rgba(255,255,255,0.5); box-shadow: 0 0 20rpx rgba(167,139,250,0.3); }
.tone-card-emoji { font-size: 40rpx; }
.tone-card-name { font-size: 22rpx; color: #fff; font-weight: 600; margin-top: 10rpx; white-space: nowrap; }
.tone-card-desc { font-size: 18rpx; color: rgba(255,255,255,0.55); margin-top: 6rpx; white-space: nowrap; }

.call-waves { display: flex; gap: 6rpx; margin-top: 40rpx; align-items: center; height: 60rpx; }
.cw-bar { width: 6rpx; background: rgba(255,255,255,0.6); border-radius: 3rpx; animation: cwAnim 0.6s ease-in-out infinite alternate; }
@keyframes cwAnim { 0% { height: 10rpx; } 100% { height: 50rpx; } }
.call-end { margin-top: 60rpx; width: 120rpx; height: 120rpx; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #dc2626); display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 36rpx rgba(239,68,68,0.45); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.call-end-text { font-size: 28rpx; color: #fff; font-weight: 600; }

/* 空状态 - 优雅设计 */
.empty-state { position: relative; z-index: 10; min-height: 100vh; display: flex; flex-direction: column; }
.empty-nav { position: relative; text-align: center; padding-bottom: 24rpx; background: linear-gradient(180deg, rgba(192,132,252,0.1), transparent); }
.empty-nav-title { display: block; font-size: 38rpx; font-weight: 800; color: #a78bfa; margin-top: 20rpx; letter-spacing: 6rpx; }
.empty-nav-lang { position: absolute; right: 30rpx; bottom: 12rpx; }
.empty-body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 60rpx; }
.empty-emoji { font-size: 96rpx; margin-bottom: 28rpx; }
.empty-title { font-size: 34rpx; font-weight: 800; color: #374151; margin-bottom: 16rpx; }
.empty-desc { font-size: 26rpx; color: #b4a0d6; text-align: center; line-height: 1.7; margin-bottom: 48rpx; }
.empty-btn { background: linear-gradient(135deg, #f9a8d4, #c084fc); border-radius: 44rpx; padding: 26rpx 72rpx; box-shadow: 0 8rpx 32rpx rgba(192,132,252,0.25); transition: all 0.2s; }
.empty-btn:active { transform: scale(0.96); box-shadow: 0 4rpx 16rpx rgba(192,132,252,0.2); }
.empty-btn-text { font-size: 30rpx; color: #fff; font-weight: 700; text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.1); }
</style>
