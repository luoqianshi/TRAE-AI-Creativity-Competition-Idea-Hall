<template>
	<view class="page">
		<view class="header-bg"></view>

		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<text class="nav-title">{{ t('page.user') }}</text>
			<view class="nav-lang"><LangSwitch /></view>
		</view>

		<scroll-view scroll-y class="content-scroll">
			<!-- 个人资料卡 -->
			<view class="profile-card">
				<view class="profile-card-bg"></view>
				<view class="profile-card-content">
					<view class="profile-avatar-wrap" @click="changeAvatar">
						<image v-if="profile.avatar" :src="profile.avatar" class="profile-avatar-img" mode="aspectFill" />
						<view v-else class="profile-avatar"><text class="avatar-emoji">👤</text></view>
						<view class="avatar-edit-badge"><text class="edit-icon">📷</text></view>
						<view class="vip-badge" v-if="profile.vip"><text class="vip-text">VIP</text></view>
					</view>
					<view class="profile-detail" @click="openProfileEdit">
						<text class="profile-name">{{ profile.nickname }}</text>
						<text class="profile-id">ID: OC-{{ todayStr.replace(/-/g, '') }}</text>
						<view class="phone-row" v-if="profile.phoneVerified">
							<text class="phone-icon">📱</text>
							<text class="phone-num">{{ maskPhone(profile.phone) }}</text>
						</view>
						<view class="profile-level">
							<text class="level-text">Lv.{{ profile.level }} {{ tt('次元旅人') }}</text>
							<view class="level-bar"><view class="level-fill" :style="{ width: profile.exp + '%' }"></view></view>
						</view>
					</view>
				</view>
				<!-- 快捷操作区 -->
				<view class="quick-actions">
					<view class="quick-action-item" @click="openProfileEdit">
						<view class="quick-action-icon-wrap" style="background: linear-gradient(135deg, #c084fc, #a78bfa);">
							<text class="quick-action-icon">✏️</text>
						</view>
						<text class="quick-action-label">{{ tt('编辑资料') }}</text>
					</view>
					<view class="quick-action-item" @click="onQuickAction('phone')">
						<view class="quick-action-icon-wrap" style="background: linear-gradient(135deg, #f9a8d4, #ec4899);">
							<text class="quick-action-icon">📱</text>
						</view>
						<text class="quick-action-label">{{ profile.phoneVerified ? tt('手机号') : tt('绑定手机') }}</text>
						<view class="quick-dot" v-if="!profile.phoneVerified"></view>
					</view>
					<view class="quick-action-item" @click="onQuickAction('profile')">
						<view class="quick-action-icon-wrap" style="background: linear-gradient(135deg, #fb923c, #f59e0b);">
							<text class="quick-action-icon">📂</text>
						</view>
						<text class="quick-action-label">{{ tt('OC 档案') }}</text>
					</view>
					<view class="quick-action-item" @click="onQuickAction('editor')">
						<view class="quick-action-icon-wrap" style="background: linear-gradient(135deg, #34d399, #10b981);">
							<text class="quick-action-icon">🎨</text>
						</view>
						<text class="quick-action-label">{{ tt('修改设定') }}</text>
					</view>
				</view>
				<view class="profile-stats-row">
					<view class="stat-block"><text class="stat-num">{{ ocList.length }}</text><text class="stat-label">{{ tt('OC 角色') }}</text></view>
					<view class="stat-divider"></view>
					<view class="stat-block"><text class="stat-num">{{ profile.interactDays }}</text><text class="stat-label">{{ tt('互动天数') }}</text></view>
					<view class="stat-divider"></view>
					<view class="stat-block"><text class="stat-num">{{ signRecords.streak }}</text><text class="stat-label">{{ tt('连续签到') }}</text></view>
				</view>
			</view>

			<!-- 功能列表 -->
			<view class="func-section">
				<text class="section-title">{{ tt('我的服务') }}</text>
				<view class="func-list">
					<view v-for="(item, idx) in funcList" :key="idx" class="func-item" @click="onFuncClick(item)">
						<view class="func-icon-wrap" :style="{ background: item.bg }"><text class="func-icon">{{ item.icon }}</text></view>
						<view class="func-info">
							<text class="func-name">{{ item.name }}</text>
							<text class="func-desc">{{ item.desc }}</text>
						</view>
						<view v-if="item.badge" class="func-badge"><text class="badge-text">{{ item.badge }}</text></view>
						<text class="func-arrow">›</text>
					</view>
				</view>
			</view>

			<!-- 收到的申请 -->
			<view class="cms-dash-section" v-if="receivedApplications.length">
				<view class="cms-section-header">
					<text class="section-title">{{ tt('收到的申请') }}</text>
					<text class="cms-section-count">{{ receivedApplications.reduce((n, c) => n + c.applicants.filter(a => a.status === 'pending' || !a.status).length, 0) }}{{ tt('条待处理') }}</text>
				</view>
				<view v-for="item in receivedApplications" :key="item.id" class="cms-dash-card received-card">
					<view class="cms-dash-top">
						<text class="cms-dash-avatar">{{ item.avatar }}</text>
						<text class="cms-dash-badge-text">{{ item.title }}</text>
					</view>
					<view v-for="app in item.applicants.filter(a => a.status === 'pending' || !a.status)" :key="app.id || app.user_id || app.userId" class="cms-applicant-row">
						<text class="cms-applicant-name">{{ app.name }}</text>
						<text class="cms-applicant-msg">{{ app.msg }}</text>
						<view class="cms-applicant-actions">
							<view class="cms-accept-btn" @click.stop="handleAcceptApplicant(item.id, app.id)">
								<text class="cms-accept-text">{{ tt('接受') }}</text>
							</view>
							<view class="cms-reject-btn" @click.stop="handleRejectApplicant(item.id, app.id)">
								<text class="cms-reject-text">{{ tt('拒绝') }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 进行中的约稿（别人给我画） -->
			<view class="cms-dash-section" v-if="inProgressAsClient.length">
				<view class="cms-section-header">
					<text class="section-title">{{ tt('进行中的约稿') }}</text>
					<text class="cms-section-sub">{{ tt('别人给我画') }}</text>
				</view>
				<view v-for="item in inProgressAsClient" :key="item.id" class="cms-dash-card progress-card" @click="goCommission">
					<view class="cms-dash-top">
						<text class="cms-dash-avatar">{{ item.avatar }}</text>
						<view class="cms-progress-badge"><text class="cms-progress-text">{{ tt('进行中') }}</text></view>
					</view>
					<text class="cms-dash-title">{{ item.title }}</text>
					<view class="cms-artist-info">
						<text class="cms-artist-label">{{ tt('画师：') }}</text>
						<text class="cms-artist-name">{{ item.applicants.find(a => a.status === 'accepted')?.name || '—' }}</text>
					</view>
					<text class="cms-dash-price">¥{{ item.priceRange }}</text>
				</view>
			</view>

			<!-- 要画的稿子（我给别人画） -->
			<view class="cms-dash-section" v-if="inProgressAsArtist.length">
				<view class="cms-section-header">
					<text class="section-title">{{ tt('要画的稿子') }}</text>
					<text class="cms-section-sub">{{ tt('我给别人画') }}</text>
				</view>
				<view v-for="item in inProgressAsArtist" :key="item.id" class="cms-dash-card todo-card" @click="goCommission">
					<view class="cms-dash-top">
						<text class="cms-dash-avatar">{{ item.avatar }}</text>
						<view class="cms-todo-badge"><text class="cms-todo-text">{{ tt('待完成') }}</text></view>
					</view>
					<text class="cms-dash-title">{{ item.title }}</text>
					<text class="cms-dash-author">{{ tt('委托人：') }}{{ item.author }}</text>
					<text class="cms-dash-price">¥{{ item.priceRange }}</text>
				</view>
			</view>

			<!-- 正在申请中 -->
			<view class="cms-dash-section" v-if="pendingOutgoing.length">
				<view class="cms-section-header">
					<text class="section-title">{{ tt('正在申请中') }}</text>
					<text class="cms-section-count">{{ pendingOutgoing.length }}{{ tt('条') }}</text>
				</view>
				<view v-for="item in pendingOutgoing" :key="item.id" class="cms-dash-card pending-card" @click="goCommission">
					<view class="cms-dash-top">
						<text class="cms-dash-avatar">{{ item.avatar }}</text>
						<view class="cms-pending-badge"><text class="cms-pending-text">{{ tt('等待回复') }}</text></view>
					</view>
					<text class="cms-dash-title">{{ item.title }}</text>
					<text class="cms-dash-author">{{ item.author }}</text>
					<text class="cms-dash-time">{{ timeAgo(getMyPendingApplyTime(item)) }}</text>
				</view>
			</view>

			<!-- 变现统计 -->
			<view class="monetize-section">
				<text class="section-title">{{ tt('创作者数据') }}</text>
				<view class="monetize-cards">
					<view class="monetize-card">
						<view class="monetize-header"><text class="monetize-icon">📱</text><text class="monetize-label">{{ tt('小红书引流') }}</text></view>
						<view class="monetize-data">
							<view class="data-row"><text class="data-label">{{ tt('本月浏览量') }}</text><text class="data-value">{{ formatNum(profile.monthViews) }}</text></view>
							<view class="data-row"><text class="data-label">{{ tt('新增粉丝') }}</text><text class="data-value rise">+{{ profile.newFollowers }}</text></view>
							<view class="data-row"><text class="data-label">{{ tt('互动率') }}</text><text class="data-value">{{ profile.interactRate }}%</text></view>
						</view>
						<view class="trend-chart"><view v-for="(h, i) in trendData" :key="i" class="trend-bar" :style="{ height: h + '%' }"></view></view>
					</view>
					<view class="monetize-card">
						<view class="monetize-header"><text class="monetize-icon">💰</text><text class="monetize-label">{{ tt('变现收益') }}</text></view>
						<view class="monetize-data">
							<view class="data-row"><text class="data-label">{{ tt('本月收入') }}</text><text class="data-value">¥{{ profile.monthRevenue.toLocaleString() }}</text></view>
							<view class="data-row"><text class="data-label">{{ tt('待提现') }}</text><text class="data-value rise">¥{{ profile.pendingWithdraw.toLocaleString() }}</text></view>
							<view class="data-row"><text class="data-label">{{ tt('累计收入') }}</text><text class="data-value">¥{{ profile.totalRevenue.toLocaleString() }}</text></view>
						</view>
						<view class="trend-chart"><view v-for="(h, i) in revenueData" :key="i" class="trend-bar revenue-bar" :style="{ height: h + '%' }"></view></view>
						<view class="withdraw-btn" @click="doWithdraw"><text class="withdraw-text">{{ tt('申请提现') }}</text></view>
					</view>
				</view>
			</view>

			<!-- 退出登录 -->
			<view class="logout-section">
				<view class="logout-btn" @click="handleLogout">
					<text class="logout-icon">🚪</text>
					<text class="logout-text">{{ tt('退出登录') }}</text>
				</view>
			</view>

			<view style="height: 200rpx;"></view>
		</scroll-view>

		<!-- ===== 弹窗层 ===== -->

		<!-- 资料编辑 -->
		<view class="modal-mask" v-if="showProfileEdit" @click="showProfileEdit = false">
			<view class="modal-card" @click.stop>
				<text class="modal-title">{{ tt('编辑资料') }}</text>
				<view class="form-area">
					<view class="input-group">
						<text class="input-label">{{ tt('昵称') }}</text>
						<view class="glass-input"><input v-model="profileDraft.nickname" :placeholder="tt('输入昵称...')" /></view>
					</view>
					<view class="input-group">
						<text class="input-label">{{ tt('心情签名') }}</text>
						<view class="glass-input"><input v-model="profileDraft.mood" :placeholder="tt('输入心情...')" maxlength="30" /></view>
					</view>
				</view>
				<view class="modal-actions">
					<view class="action-btn cancel" @click="showProfileEdit = false"><text>{{ tt('取消') }}</text></view>
					<view class="action-btn confirm" @click="saveProfile"><text>{{ tt('保存') }}</text></view>
				</view>
			</view>
		</view>

		<!-- 绑定手机号 -->
		<view class="modal-mask" v-if="showPhoneBind" @click="showPhoneBind = false">
			<view class="modal-card phone-modal" @click.stop>
				<text class="modal-title">{{ profile.phoneVerified ? tt('更换手机号') : tt('绑定手机号') }}</text>
				<view class="form-area">
					<view class="input-group">
						<text class="input-label">{{ tt('手机号') }}</text>
						<view class="glass-input"><input v-model="phoneDraft" type="number" maxlength="11" :placeholder="tt('请输入手机号')" /></view>
					</view>
					<view class="input-group">
						<text class="input-label">{{ tt('验证码') }}</text>
						<view class="code-row">
							<view class="glass-input code-input"><input v-model="codeDraft" type="number" maxlength="6" :placeholder="tt('6位验证码')" /></view>
							<view class="send-code-btn" :class="{ disabled: countdown > 0 || !isPhoneValid }" @click="sendCode">
								<text class="send-code-text">{{ countdown > 0 ? countdown + 's' : tt('发送验证码') }}</text>
							</view>
						</view>
					</view>
					<text class="sms-hint" v-if="smsCode">{{ tt('测试验证码') }}: {{ smsCode }}</text>
				</view>
				<view class="modal-actions">
					<view class="action-btn cancel" @click="showPhoneBind = false"><text>{{ tt('取消') }}</text></view>
					<view class="action-btn confirm" @click="verifyPhone"><text>{{ tt('确认绑定') }}</text></view>
				</view>
			</view>
		</view>

		<!-- NFC 签到 -->
		<view class="modal-mask" v-if="showSign" @click="showSign = false">
			<view class="modal-card sign-modal" @click.stop>
				<text class="modal-title">{{ tt('NFC 每日一签') }}</text>
				<view class="sign-content">
					<view class="sign-calendar">
						<view v-for="d in 7" :key="d" class="sign-day" :class="{ signed: isRecentSigned(d), today: d === 7 }">
							<text class="sign-day-num">{{ getRecentDate(d) }}</text>
							<text class="sign-check" v-if="isRecentSigned(d)">✓</text>
						</view>
					</view>
					<view class="sign-fortune" v-if="signResult">
						<text class="sign-fortune-title">{{ tt('今日签文') }}</text>
					<text class="sign-fortune-text">{{ tt(signResult) }}</text>
					</view>
					<view class="sign-btn-wrap">
						<view class="sign-do-btn" :class="{ disabled: todaySigned }" @click="handleSign">
							<text class="sign-btn-text">{{ todaySigned ? tt('今日已签到') : tt('触碰签到') }}</text>
						</view>
						<text class="sign-streak">{{ tt('已连续签到') }} {{ signRecords.streak }} {{ tt('天') }}</text>
					</view>
				</view>
				<view class="modal-close" @click="showSign = false"><text class="close-text">{{ tt('关闭') }}</text></view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { clearAuthSession } from '../../utils/apis/auth.js'
import {
	createWithdrawRequest,
	getDashboard,
	sendPhoneCode,
	signIn,
	updateMe,
	uploadAvatar,
	verifyPhone as verifyPhoneApi,
} from '../../utils/apis/user.js'
import {
	acceptCommissionApplication,
	getCommissionDashboard,
	rejectCommissionApplication,
} from '../../utils/apis/commission.js'
import { getOCList, getCartCount, getForumPosts } from '../../utils/store.js'
import { timeAgo } from '../../utils/helpers.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()
const todayStr = computed(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })

const ocList = ref([])
const profile = ref({ nickname: '', mood: '', avatar: '', phone: '', phoneVerified: false, level: 1, exp: 0, vip: false, interactDays: 0, settingCount: 0, totalRevenue: 0, monthRevenue: 0, pendingWithdraw: 0, monthViews: 0, newFollowers: 0, interactRate: 0 })
const signRecords = ref({ dates: [], streak: 0 })
const todaySigned = ref(false)
const signResult = ref('')

const showProfileEdit = ref(false)
const showPhoneBind = ref(false)
const showSign = ref(false)

const profileDraft = ref({ nickname: '', mood: '' })
const cartCount = ref(0)
const forumCount = ref(0)
const receivedApplications = ref([])
const inProgressAsClient = ref([])
const inProgressAsArtist = ref([])
const pendingOutgoing = ref([])

// 手机号绑定
const phoneDraft = ref('')
const codeDraft = ref('')
const smsCode = ref('')
const countdown = ref(0)
let countdownTimer = null
const isPhoneValid = computed(() => /^1[3-9]\d{9}$/.test(phoneDraft.value))

const funcList = computed(() => [
	{ name: tt('NFC 每日一签'), desc: todaySigned.value ? tt('今日已签到 ✓') : tt('触碰手办，获取今日签文'), icon: '✅', bg: 'linear-gradient(135deg, #c084fc, #a78bfa)', action: 'sign', badge: todaySigned.value ? '' : 'NEW' },
	{ name: tt('我的周边'), desc: tt('周边商品定制与订单'), icon: '🛍️', bg: 'linear-gradient(135deg, #f9a8d4, #ec4899)', action: 'shop', badge: cartCount.value > 0 ? cartCount.value + tt('件') : '' },
	{ name: tt('批量水印'), desc: tt('为图片批量添加文字或图片水印'), icon: '💧', bg: 'linear-gradient(135deg, #60a5fa, #3b82f6)', action: 'watermark' },
	{ name: tt('线上论坛'), desc: tt('与其他契约者交流'), icon: '💬', bg: 'linear-gradient(135deg, #34d399, #10b981)', action: 'forum', badge: forumCount.value ? forumCount.value + tt('条帖子') : '' },
	{ name: tt('多人联动'), desc: tt('发布联动需求并申请合作'), icon: '🌐', bg: 'linear-gradient(135deg, #fb923c, #f59e0b)', action: 'collab' },
	{ name: tt('约稿广场'), desc: tt('找画师约稿或发布接稿信息'), icon: '🎨', bg: 'linear-gradient(135deg, #f472b6, #c084fc)', action: 'commission' },
])

function onQuickAction(action) {
	if (action === 'phone') { phoneDraft.value = profile.value.phone || ''; codeDraft.value = ''; smsCode.value = ''; showPhoneBind.value = true }
	else if (action === 'profile') uni.navigateTo({ url: '/pages/sub/profile' })
	else if (action === 'editor') uni.switchTab({ url: '/pages/editor/editor' })
}

const trendData = computed(() => {
	const base = [24, 32, 46, 55, 63, 72, 81, 67, 74, 88, 91, 78]
	const factor = Math.max(Math.min(profile.value.interactRate || 1, 100), 1) / 100
	return base.map(item => Math.max(12, Math.round(item * (0.8 + factor))))
})
const revenueData = computed(() => {
	const base = [18, 26, 38, 44, 57, 63, 70, 76, 81, 89, 94, 86]
	const factor = profile.value.monthRevenue > 0 ? Math.min(profile.value.monthRevenue / 1000, 1.4) : 0.7
	return base.map(item => Math.max(10, Math.round(item * factor)))
})

// 约稿工作台
async function handleAcceptApplicant(commissionId, applicationId) {
	try {
		await acceptCommissionApplication(commissionId, applicationId)
		await loadCommissionData()
		uni.showToast({ title: tt('已接受申请'), icon: 'none' })
	} catch (error) {
		uni.showToast({ title: error.message || tt('操作失败'), icon: 'none' })
	}
}
async function handleRejectApplicant(commissionId, applicationId) {
	try {
		await rejectCommissionApplication(commissionId, applicationId)
		await loadCommissionData()
		uni.showToast({ title: tt('已拒绝'), icon: 'none' })
	} catch (error) {
		uni.showToast({ title: error.message || tt('操作失败'), icon: 'none' })
	}
}
function goCommission() {
	uni.navigateTo({ url: '/pages/sub/commission' })
}

function loadLocalData() {
	ocList.value = getOCList()
	cartCount.value = getCartCount()
	forumCount.value = getForumPosts().length
}

async function loadCommissionData() {
	const dashboard = await getCommissionDashboard()
	receivedApplications.value = dashboard.receivedApplications
	inProgressAsClient.value = dashboard.inProgressAsClient
	inProgressAsArtist.value = dashboard.inProgressAsArtist
	pendingOutgoing.value = dashboard.pendingOutgoing
}

async function loadRemoteData() {
	const [dashboard] = await Promise.all([getDashboard(), loadCommissionData()])
	profile.value = { ...profile.value, ...dashboard.profile }
	signRecords.value = {
		dates: dashboard.signinStatus.dates,
		streak: dashboard.signinStatus.streak,
	}
	todaySigned.value = dashboard.signinStatus.todaySigned
		signResult.value = dashboard.todayFortune.summary || ''
}

async function loadData() {
	loadLocalData()
	try {
		await loadRemoteData()
	} catch (error) {
		uni.showToast({ title: error.message || tt('加载失败'), icon: 'none' })
	}
}

onMounted(loadData)
onShow(loadData)
onUnmounted(() => {
	if (countdownTimer) clearInterval(countdownTimer)
})

function getMyPendingApplyTime(item) {
	const myUserId = Number(profile.value.id || 0)
	const mine = (item.applicants || []).find(app => Number(app.user_id || app.userId || 0) === myUserId)
	return mine?.time || item.time
}

function maskPhone(p) { return p ? p.slice(0,3) + '****' + p.slice(7) : '' }
function formatNum(n) { if (n >= 10000) return (n/10000).toFixed(1)+'W'; if (n >= 1000) return (n/1000).toFixed(1)+'K'; return n }

function onFuncClick(item) {
	if (item.action === 'shop') uni.navigateTo({ url: '/pages/shop/shop' })
	else if (item.action === 'watermark') uni.navigateTo({ url: '/pages/sub/watermark' })
	else if (item.action === 'sign') uni.navigateTo({ url: '/pages/sub/nfc' })
	else if (item.action === 'forum') uni.navigateTo({ url: '/pages/sub/forum' })
	else if (item.action === 'collab') uni.navigateTo({ url: '/pages/sub/collab' })
	else if (item.action === 'commission') uni.navigateTo({ url: '/pages/sub/commission' })
}

// 头像
function changeAvatar() {
	uni.chooseImage({
		count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'],
		success: async (res) => {
			try {
				const result = await uploadAvatar(res.tempFilePaths[0])
				profile.value.avatar = result.avatar
				uni.showToast({ title: tt('头像已更新'), icon: 'none' })
				uni.$emit('refreshIndex')
			} catch (error) {
				uni.showToast({ title: error.message || tt('头像上传失败'), icon: 'none' })
			}
		}
	})
}

// 资料
function openProfileEdit() {
	profileDraft.value = { nickname: profile.value.nickname, mood: profile.value.mood }
	showProfileEdit.value = true
}
async function saveProfile() {
	try {
		const result = await updateMe({
			nickname: profileDraft.value.nickname,
			mood: profileDraft.value.mood,
		})
		profile.value = { ...profile.value, ...result }
		showProfileEdit.value = false
		uni.showToast({ title: tt('资料已更新'), icon: 'none' })
		uni.$emit('refreshIndex')
	} catch (error) {
		uni.showToast({ title: error.message || tt('保存失败'), icon: 'none' })
	}
}

// 手机号绑定 - 发送验证码
async function sendCode() {
	if (countdown.value > 0 || !isPhoneValid.value) return
	try {
		const result = await sendPhoneCode({ phone: phoneDraft.value })
		smsCode.value = result.debugCode || ''
		uni.showToast({ title: tt('验证码已发送'), icon: 'none' })
		countdown.value = 60
		countdownTimer = setInterval(() => {
			countdown.value--
			if (countdown.value <= 0) { clearInterval(countdownTimer); countdownTimer = null }
		}, 1000)
	} catch (error) {
		uni.showToast({ title: error.message || tt('发送失败'), icon: 'none' })
	}
}

// 验证
async function verifyPhone() {
	if (!isPhoneValid.value) { uni.showToast({ title: tt('请输入正确的手机号'), icon: 'none' }); return }
	if (!codeDraft.value || codeDraft.value.length !== 6) { uni.showToast({ title: tt('请输入6位验证码'), icon: 'none' }); return }
	try {
		const result = await verifyPhoneApi({ phone: phoneDraft.value, code: codeDraft.value })
		profile.value = { ...profile.value, ...result }
		showPhoneBind.value = false
		if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
		smsCode.value = ''
		uni.showToast({ title: tt('手机号绑定成功'), icon: 'none' })
	} catch (error) {
		uni.showToast({ title: error.message || tt('绑定失败'), icon: 'none' })
	}
}

function handleLogout() {
	uni.showModal({ title: tt('退出登录'), content: tt('确定退出当前账号？'), success: res => { if (res.confirm) { clearAuthSession(); uni.reLaunch({ url: '/pages/login/login' }) } } })
}

// 签到
async function handleSign() {
	if (todaySigned.value) return
	try {
		const result = await signIn()
		signRecords.value = { dates: result.dates, streak: result.streak }
		todaySigned.value = true
		signResult.value = result.fortune.summary || ''
		profile.value.level = result.level
		profile.value.exp = result.exp
		profile.value.interactDays += result.alreadySigned ? 0 : 1
		uni.showToast({ title: result.alreadySigned ? tt('今日已签到') : `${tt('签到成功！经验 +')}${result.expGained}`, icon: 'none' })
	} catch (error) {
		uni.showToast({ title: error.message || tt('签到失败'), icon: 'none' })
	}
}
function isRecentSigned(dayIdx) { const date = new Date(); date.setDate(date.getDate() - (7 - dayIdx)); return signRecords.value.dates.includes(date.toISOString().slice(0,10)) }
function getRecentDate(dayIdx) { const date = new Date(); date.setDate(date.getDate() - (7 - dayIdx)); return date.getDate() }
function doWithdraw() {
	if (profile.value.pendingWithdraw <= 0) { uni.showToast({ title: tt('暂无可提现金额'), icon: 'none' }); return }
	uni.showModal({
		title: tt('申请提现'),
		content: `${tt('确认提现')} ¥${profile.value.pendingWithdraw.toLocaleString()}？`,
		success: async (res) => {
			if (!res.confirm) return
			try {
				const result = await createWithdrawRequest({ amount: profile.value.pendingWithdraw })
				profile.value.pendingWithdraw = result.pendingWithdraw
				uni.showToast({ title: tt('提现申请已提交'), icon: 'none' })
			} catch (error) {
				uni.showToast({ title: error.message || tt('提现失败'), icon: 'none' })
			}
		}
	})
}
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); position: relative; }
.header-bg { position: absolute; top: 0; left: 0; width: 100%; height: 460rpx; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa, #818cf8); border-radius: 0 0 72rpx 72rpx; box-shadow: 0 12rpx 48rpx rgba(192,132,252,0.25); }
.nav-bar { position: relative; z-index: 10; text-align: center; padding-bottom: 20rpx; }
.nav-title { font-size: 38rpx; font-weight: 800; color: #fff; display: block; margin-top: 20rpx; letter-spacing: 8rpx; text-shadow: 0 4rpx 16rpx rgba(0,0,0,0.12); }
.nav-lang { position: absolute; right: 28rpx; bottom: 14rpx; }
.content-scroll { position: relative; z-index: 5; height: 100vh; }

/* 资料卡 - 高级毛玻璃 */
.profile-card { margin: 20rpx 30rpx 0; border-radius: 36rpx; overflow: hidden; position: relative; box-shadow: 0 12rpx 48rpx rgba(167,139,250,0.12); }
.profile-card-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); backdrop-filter: blur(40px) saturate(1.6); border: 1rpx solid rgba(255,255,255,0.8); }
.profile-card-content { position: relative; display: flex; align-items: center; padding: 32rpx; }
.profile-avatar-wrap { position: relative; flex-shrink: 0; }
.profile-avatar { width: 120rpx; height: 120rpx; border-radius: 50%; background: linear-gradient(135deg, #f9a8d4, #c084fc); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4rpx rgba(255,255,255,0.8), 0 12rpx 32rpx rgba(192,132,252,0.25); }
.profile-avatar-img { width: 120rpx; height: 120rpx; border-radius: 50%; border: 3rpx solid rgba(255,255,255,0.8); box-shadow: 0 0 0 4rpx rgba(255,255,255,0.8), 0 12rpx 32rpx rgba(192,132,252,0.25); }
.avatar-emoji { font-size: 52rpx; }
.avatar-edit-badge { position: absolute; bottom: 0; right: 0; width: 40rpx; height: 40rpx; border-radius: 50%; background: linear-gradient(135deg, #f9a8d4, #c084fc); display: flex; align-items: center; justify-content: center; border: 3rpx solid #fff; box-shadow: 0 2rpx 8rpx rgba(192,132,252,0.3); }
.edit-icon { font-size: 20rpx; }
.vip-badge { position: absolute; top: -4rpx; right: -4rpx; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 12rpx; padding: 2rpx 14rpx; border: 3rpx solid #fff; box-shadow: 0 2rpx 8rpx rgba(245,158,11,0.3); }
.vip-text { font-size: 18rpx; color: #fff; font-weight: 700; }
.profile-detail { margin-left: 24rpx; flex: 1; }
.profile-name { font-size: 34rpx; font-weight: 800; background: linear-gradient(135deg, #374151, #6d28d9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: block; letter-spacing: 1rpx; }
.profile-id { font-size: 22rpx; color: #b4a0d6; margin-top: 8rpx; display: block; }
.phone-row { display: flex; align-items: center; margin-top: 6rpx; }
.phone-icon { font-size: 22rpx; margin-right: 6rpx; }
.phone-num { font-size: 22rpx; color: #c084fc; font-weight: 600; }
.profile-level { margin-top: 14rpx; }
.level-text { font-size: 22rpx; color: #c084fc; font-weight: 600; display: block; }
.level-bar { width: 100%; height: 10rpx; background: rgba(192,132,252,0.1); border-radius: 5rpx; margin-top: 8rpx; overflow: hidden; }
.level-fill { height: 100%; background: linear-gradient(90deg, #c084fc, #a78bfa); border-radius: 5rpx; box-shadow: 0 0 8rpx rgba(192,132,252,0.3); }
/* 快捷操作区 */
.quick-actions { position: relative; display: flex; align-items: flex-start; justify-content: space-around; padding: 20rpx 24rpx 24rpx; }
.quick-action-item { display: flex; flex-direction: column; align-items: center; position: relative; }
.quick-action-item:active .quick-action-icon-wrap { transform: scale(0.92); }
.quick-action-icon-wrap { width: 88rpx; height: 88rpx; border-radius: 28rpx; display: flex; align-items: center; justify-content: center; box-shadow: 0 6rpx 20rpx rgba(167,139,250,0.18), inset 0 2rpx 4rpx rgba(255,255,255,0.35); transition: transform 0.2s; }
.quick-action-icon { font-size: 36rpx; }
.quick-action-label { font-size: 22rpx; color: #6b7280; font-weight: 600; margin-top: 12rpx; display: block; text-align: center; }
.quick-dot { position: absolute; top: 4rpx; right: 4rpx; width: 16rpx; height: 16rpx; border-radius: 50%; background: #ef4444; border: 3rpx solid #fff; box-shadow: 0 2rpx 6rpx rgba(239,68,68,0.3); }

.profile-stats-row { position: relative; display: flex; align-items: center; padding: 26rpx 32rpx; border-top: 1rpx solid rgba(167,139,250,0.06); }
.stat-block { flex: 1; text-align: center; }
.stat-num { font-size: 40rpx; font-weight: 800; background: linear-gradient(135deg, #374151, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: block; }
.stat-label { font-size: 22rpx; color: #b4a0d6; margin-top: 6rpx; display: block; }
.stat-divider { width: 1rpx; height: 48rpx; background: rgba(167,139,250,0.08); }

/* 功能列表 - 精致化 */
.func-section { padding: 30rpx 30rpx 0; }
.section-title { font-size: 30rpx; font-weight: 800; color: #374151; display: block; margin-bottom: 20rpx; letter-spacing: 1rpx; }
.func-list { background: rgba(255,255,255,0.88); backdrop-filter: blur(28px) saturate(1.5); border-radius: 32rpx; overflow: hidden; border: 1rpx solid rgba(255,255,255,0.7); box-shadow: 0 8rpx 32rpx rgba(167,139,250,0.08); }
.func-item { display: flex; align-items: center; padding: 28rpx; position: relative; transition: background 0.3s; }
.func-item:active { background: rgba(192,132,252,0.04); }
.func-item:not(:last-child)::after { content: ''; position: absolute; bottom: 0; left: 108rpx; right: 28rpx; height: 1rpx; background: rgba(167,139,250,0.04); }
.func-icon-wrap { width: 76rpx; height: 76rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4rpx 16rpx rgba(167,139,250,0.12), inset 0 2rpx 4rpx rgba(255,255,255,0.4); }
.func-icon { font-size: 32rpx; }
.func-info { flex: 1; margin-left: 20rpx; }
.func-name { font-size: 28rpx; font-weight: 700; color: #374151; display: block; }
.func-desc { font-size: 22rpx; color: #b4a0d6; margin-top: 4rpx; display: block; }
.func-badge { background: linear-gradient(135deg, #f9a8d4, #c084fc); border-radius: 16rpx; padding: 4rpx 16rpx; margin-right: 12rpx; box-shadow: 0 2rpx 8rpx rgba(192,132,252,0.2); }
.badge-text { font-size: 20rpx; color: #fff; font-weight: 600; }
.func-arrow { font-size: 28rpx; color: #c9b8e8; font-weight: 400; font-family: system-ui; opacity: 0.7; }

/* 变现统计 - 高级卡片 */
.monetize-section { padding: 30rpx 30rpx 0; }
.monetize-cards { display: flex; flex-direction: column; gap: 20rpx; }
.monetize-card { background: rgba(255,255,255,0.88); backdrop-filter: blur(28px) saturate(1.5); border-radius: 32rpx; padding: 28rpx; border: 1rpx solid rgba(255,255,255,0.7); box-shadow: 0 8rpx 36rpx rgba(167,139,250,0.1), 0 2rpx 8rpx rgba(167,139,250,0.04); }
.monetize-header { display: flex; align-items: center; margin-bottom: 20rpx; }
.monetize-icon { font-size: 32rpx; margin-right: 12rpx; }
.monetize-label { font-size: 28rpx; font-weight: 800; color: #374151; }
.monetize-data { display: flex; flex-direction: column; gap: 16rpx; }
.data-row { display: flex; justify-content: space-between; align-items: center; }
.data-label { font-size: 26rpx; color: #6b7280; }
.data-value { font-size: 28rpx; font-weight: 700; color: #374151; }
.data-value.rise { color: #10b981; }
.trend-chart { display: flex; align-items: flex-end; gap: 8rpx; margin-top: 24rpx; height: 80rpx; padding-top: 8rpx; border-top: 1rpx solid rgba(167,139,250,0.06); }
.trend-bar { flex: 1; background: linear-gradient(180deg, rgba(192,132,252,0.5), rgba(167,139,250,0.3)); border-radius: 4rpx; min-height: 8rpx; transition: height 0.6s ease; animation: trendGrow 0.8s ease-out backwards; transform-origin: bottom; }
.trend-bar:nth-child(1) { animation-delay: 0.05s; }
.trend-bar:nth-child(2) { animation-delay: 0.1s; }
.trend-bar:nth-child(3) { animation-delay: 0.15s; }
.trend-bar:nth-child(4) { animation-delay: 0.2s; }
.trend-bar:nth-child(5) { animation-delay: 0.25s; }
.trend-bar:nth-child(6) { animation-delay: 0.3s; }
.trend-bar:nth-child(7) { animation-delay: 0.35s; }
.trend-bar:nth-child(8) { animation-delay: 0.4s; }
.trend-bar:nth-child(9) { animation-delay: 0.45s; }
.trend-bar:nth-child(10) { animation-delay: 0.5s; }
.trend-bar:nth-child(11) { animation-delay: 0.55s; }
.trend-bar:nth-child(12) { animation-delay: 0.6s; }
.revenue-bar { background: linear-gradient(180deg, rgba(192,132,252,0.7), rgba(167,139,250,0.4)); }
.withdraw-btn { margin-top: 20rpx; text-align: center; padding: 20rpx; background: linear-gradient(135deg, #f9a8d4, #c084fc); border-radius: 40rpx; box-shadow: 0 8rpx 28rpx rgba(192,132,252,0.3); transition: all 0.2s; }
.withdraw-btn:active { transform: scale(0.97); box-shadow: 0 2rpx 12rpx rgba(192,132,252,0.15); }
.withdraw-text { font-size: 26rpx; color: #fff; font-weight: 700; }

/* 弹窗通用 - 高级毛玻璃 */
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,10,30,0.4); backdrop-filter: blur(8px); z-index: 999; display: flex; align-items: center; justify-content: center; }
.modal-card { width: 85%; max-height: 80vh; background: rgba(255,255,255,0.95); backdrop-filter: blur(40px) saturate(1.8); border-radius: 40rpx; overflow: hidden; box-shadow: 0 32rpx 96rpx rgba(167,139,250,0.18), 0 8rpx 32rpx rgba(167,139,250,0.08), 0 0 1rpx rgba(255,255,255,0.9); border: 1rpx solid rgba(255,255,255,0.7); }
.modal-title { font-size: 32rpx; font-weight: 800; color: #374151; display: block; text-align: center; padding: 32rpx 0 16rpx; letter-spacing: 1rpx; }
.modal-close { text-align: center; padding: 24rpx; border-top: 1rpx solid rgba(167,139,250,0.08); }
.close-text { font-size: 28rpx; color: #c084fc; font-weight: 600; }
.modal-actions { display: flex; border-top: 1rpx solid rgba(167,139,250,0.08); }
.action-btn { flex: 1; text-align: center; padding: 28rpx 0; font-size: 28rpx; transition: background 0.2s; }
.action-btn:active { background: rgba(167,139,250,0.04); }
.action-btn.cancel text { color: #9ca3af; }
.action-btn.confirm text { color: #c084fc; font-weight: 700; }
.action-btn:not(:last-child) { border-right: 1rpx solid rgba(167,139,250,0.08); }

/* 表单 */
.form-area { padding: 0 32rpx 16rpx; }
.input-group { margin-bottom: 24rpx; }
.input-label { font-size: 26rpx; font-weight: 600; color: #6b7280; margin-bottom: 12rpx; display: block; }
.glass-input { background: rgba(0,0,0,0.03); border-radius: 16rpx; padding: 20rpx 24rpx; border: 2rpx solid rgba(0,0,0,0.04); }
.glass-input input { font-size: 28rpx; color: #374151; }

/* 手机号绑定 */
.code-row { display: flex; gap: 16rpx; }
.code-input { flex: 1; }
.send-code-btn { flex-shrink: 0; background: linear-gradient(135deg, #FFB6C1, #a78bfa); border-radius: 16rpx; padding: 20rpx 28rpx; display: flex; align-items: center; }
.send-code-btn.disabled { background: #ccc; }
.send-code-text { font-size: 26rpx; color: #fff; font-weight: 600; white-space: nowrap; }
.sms-hint { font-size: 24rpx; color: #a78bfa; display: block; text-align: center; margin-top: 8rpx; }

/* 签到 */
.sign-content { padding: 0 32rpx 24rpx; }
.sign-calendar { display: flex; gap: 14rpx; justify-content: center; margin-bottom: 28rpx; }
.sign-day { width: 72rpx; height: 88rpx; border-radius: 20rpx; background: rgba(167,139,250,0.04); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2rpx solid rgba(167,139,250,0.08); transition: all 0.3s; }
.sign-day.signed { background: linear-gradient(135deg, rgba(167,139,250,0.12), rgba(192,132,252,0.1)); border-color: rgba(167,139,250,0.3); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.1); }
.sign-day.today { border-color: #a78bfa; box-shadow: 0 4rpx 20rpx rgba(167,139,250,0.25); background: linear-gradient(135deg, rgba(167,139,250,0.08), rgba(249,168,212,0.08)); }
.sign-day-num { font-size: 26rpx; color: #374151; font-weight: 700; }
.sign-check { font-size: 22rpx; color: #a78bfa; font-weight: 600; }
.sign-fortune { background: rgba(167,139,250,0.06); border-radius: 16rpx; padding: 20rpx; margin-bottom: 24rpx; }
.sign-fortune-title { font-size: 24rpx; color: #a78bfa; font-weight: 600; display: block; margin-bottom: 8rpx; }
.sign-fortune-text { font-size: 26rpx; color: #6b7280; line-height: 1.7; display: block; }
.sign-btn-wrap { text-align: center; }
.sign-do-btn { background: linear-gradient(135deg, #FFB6C1, #a78bfa); border-radius: 40rpx; padding: 24rpx; }
.sign-do-btn.disabled { background: rgba(0,0,0,0.1); }
.sign-btn-text { font-size: 28rpx; color: #fff; font-weight: 600; }
.sign-do-btn.disabled .sign-btn-text { color: #9ca3af; }
.sign-streak { font-size: 22rpx; color: #9ca3af; margin-top: 12rpx; display: block; }

/* 约稿工作台 - 精致化 */
.cms-dash-section { padding: 30rpx 30rpx 0; }
.cms-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.cms-section-sub { font-size: 22rpx; color: #b4a0d6; }
.cms-section-count { font-size: 22rpx; color: #c084fc; font-weight: 600; }
.cms-dash-card { padding: 24rpx; border-radius: 28rpx; background: rgba(255,255,255,0.9); backdrop-filter: blur(28px) saturate(1.5); border: 1rpx solid rgba(255,255,255,0.7); margin-bottom: 16rpx; transition: all 0.25s; box-shadow: 0 8rpx 28rpx rgba(167,139,250,0.08), 0 2rpx 8rpx rgba(167,139,250,0.04); }
.cms-dash-card:active { transform: scale(0.98); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.03); }
.cms-dash-top { display: flex; align-items: center; gap: 10rpx; margin-bottom: 12rpx; }
.cms-dash-avatar { font-size: 32rpx; flex-shrink: 0; }
.cms-dash-badge-text { font-size: 26rpx; font-weight: 700; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.cms-dash-title { font-size: 26rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 10rpx; }
.cms-dash-author { font-size: 22rpx; color: #9ca3af; display: block; margin-bottom: 6rpx; }
.cms-dash-price { font-size: 24rpx; font-weight: 700; color: #a78bfa; }
.cms-dash-time { font-size: 20rpx; color: #d1d5db; }
.cms-progress-badge { padding: 4rpx 16rpx; border-radius: 12rpx; background: rgba(52,211,153,0.14); border: 1rpx solid rgba(52,211,153,0.2); }
.cms-progress-text { font-size: 18rpx; font-weight: 700; color: #10b981; }
.cms-todo-badge { padding: 4rpx 16rpx; border-radius: 12rpx; background: rgba(251,146,60,0.14); border: 1rpx solid rgba(251,146,60,0.2); }
.cms-todo-text { font-size: 18rpx; font-weight: 700; color: #f97316; }
.cms-pending-badge { padding: 4rpx 16rpx; border-radius: 12rpx; background: rgba(167,139,250,0.14); border: 1rpx solid rgba(167,139,250,0.2); }
.cms-pending-text { font-size: 18rpx; font-weight: 700; color: #a78bfa; }
.cms-applicant-row { padding: 12rpx 0; border-top: 1rpx solid rgba(0,0,0,0.04); }
.cms-applicant-name { font-size: 24rpx; font-weight: 600; color: #374151; display: block; }
.cms-applicant-msg { font-size: 22rpx; color: #6b7280; display: block; margin-top: 4rpx; }
.cms-applicant-actions { display: flex; gap: 12rpx; margin-top: 10rpx; }
.cms-accept-btn { padding: 8rpx 24rpx; border-radius: 16rpx; background: linear-gradient(135deg, #f9a8d4, #c084fc); box-shadow: 0 2rpx 8rpx rgba(192,132,252,0.2); }
.cms-accept-btn:active { opacity: 0.85; transform: scale(0.96); }
.cms-accept-text { font-size: 22rpx; color: #fff; font-weight: 600; }
.cms-reject-btn { padding: 8rpx 24rpx; border-radius: 16rpx; background: rgba(167,139,250,0.04); border: 1rpx solid rgba(167,139,250,0.1); }
.cms-reject-btn:active { background: rgba(167,139,250,0.08); }
.cms-reject-text { font-size: 22rpx; color: #9ca3af; font-weight: 600; }
.cms-artist-info { display: flex; align-items: center; margin-bottom: 8rpx; }
.cms-artist-label { font-size: 22rpx; color: #9ca3af; }
.cms-artist-name { font-size: 22rpx; font-weight: 600; color: #374151; }
.received-card { border-left: 8rpx solid #FFB6C1; }
.progress-card { border-left: 8rpx solid #34d399; }
.todo-card { border-left: 8rpx solid #f97316; }
.pending-card { border-left: 8rpx solid #a78bfa; }

/* 退出登录 */
.logout-section { padding: 40rpx 30rpx 0; }
.logout-btn { display: flex; align-items: center; justify-content: center; gap: 12rpx; padding: 26rpx; background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); border-radius: 28rpx; border: 1rpx solid rgba(239,68,68,0.08); transition: all 0.2s; }
.logout-btn:active { background: rgba(239,68,68,0.04); transform: scale(0.98); }
.logout-icon { font-size: 28rpx; }
.logout-text { font-size: 28rpx; color: #9ca3af; font-weight: 600; }

@keyframes trendGrow {
	0% { transform: scaleY(0); opacity: 0; }
	60% { transform: scaleY(1.08); opacity: 1; }
	100% { transform: scaleY(1); opacity: 1; }
}
</style>
