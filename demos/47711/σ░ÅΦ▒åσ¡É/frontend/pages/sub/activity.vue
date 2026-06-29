<template>
	<view class="page">
		<!-- 顶部导航 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack"><text class="back-icon">‹</text></view>
			<text class="nav-title">{{ t('page.activity') }}</text>
			<view class="nav-right"><LangSwitch /></view>
		</view>

		<!-- Tab 切换 -->
		<view class="tab-row">
			<view class="tab-chip" :class="{ active: activeTab === 0 }" @click="activeTab = 0">
				<text class="tab-label">{{ tt('全部活动') }}</text>
			</view>
			<view class="tab-chip" :class="{ active: activeTab === 1 }" @click="activeTab = 1">
				<text class="tab-label">{{ tt('我的报名') }}</text>
			</view>
		</view>

		<!-- 活动列表 -->
		<scroll-view scroll-y class="feed">
			<view v-if="displayList.length === 0" class="empty-state">
				<text class="empty-icon">{{ activeTab === 0 ? '📭' : '📋' }}</text>
				<text class="empty-text">{{ activeTab === 0 ? tt('暂无活动') : tt('还没有报名任何活动') }}</text>
			</view>

			<view v-for="act in displayList" :key="act.id" class="act-card" @click="openDetail(act)">
				<!-- 头部：emoji + 标题 + 状态 -->
				<view class="act-header">
					<view class="act-emoji-wrap"><text class="act-emoji">{{ act.emoji }}</text></view>
					<view class="act-title-area">
						<text class="act-title">{{ tt(act.title) }}</text>
						<view class="act-tags">
							<text v-for="tag in act.tags" :key="tag" class="act-tag"># {{ tt(tag) }}</text>
						</view>
					</view>
					<view class="act-status" :class="statusClass(act.status)">
						<text class="act-status-text">{{ tt(act.status) }}</text>
					</view>
				</view>

				<!-- 信息行 -->
				<view class="act-info">
					<view class="info-item"><text class="info-icon">📅</text><text class="info-text">{{ act.date }} {{ act.time }}</text></view>
					<view class="info-item"><text class="info-icon">📍</text><text class="info-text">{{ tt(act.location) }}</text></view>
				</view>

				<!-- 底部：报名人数 + 按钮 -->
					<view class="act-footer">
						<view class="act-signups">
							<view class="signup-avatars">
								<view v-for="(_, i) in signupDots(act)" :key="i" class="signup-dot"></view>
							</view>
						<text class="signup-count">{{ act.signupCount }} / {{ act.maxParticipants }} {{ tt('人') }}</text>
						</view>
					<view class="act-btn" :class="{ joined: isJoined(act), disabled: act.status !== '报名中' || (!isJoined(act) && act.signupCount >= act.maxParticipants) }" @click.stop="onBtnClick(act)">
						<text class="act-btn-text">{{ btnLabel(act) }}</text>
					</view>
				</view>

				<!-- 我的报名 Tab 额外显示报名时间 -->
				<view v-if="activeTab === 1" class="my-signup-info">
					<text class="my-signup-time">{{ tt('报名时间：') }}{{ formatTime(getMySignupTime(act)) }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 活动详情弹窗 -->
		<view v-if="showDetail" class="modal-mask" @click="showDetail = false">
			<view class="modal-box detail-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ tt('活动详情') }}</text>
					<view class="modal-close" @click="showDetail = false"><text>✕</text></view>
				</view>

				<scroll-view scroll-y class="detail-scroll">
					<!-- 活动头部 -->
					<view class="detail-hero" :style="{ background: heroGradient }">
						<text class="detail-emoji">{{ detailAct.emoji }}</text>
						<text class="detail-title">{{ tt(detailAct.title) }}</text>
						<view class="detail-status" :class="statusClass(detailAct.status)">
							<text class="act-status-text">{{ tt(detailAct.status) }}</text>
						</view>
					</view>

					<!-- 活动信息 -->
					<view class="detail-section">
						<view class="detail-info-item">
							<text class="detail-label">{{ tt('时间') }}</text>
							<text class="detail-value">{{ detailAct.date }} {{ detailAct.time }}</text>
						</view>
						<view class="detail-info-item">
							<text class="detail-label">{{ tt('地点') }}</text>
							<text class="detail-value">{{ tt(detailAct.location) }}</text>
						</view>
						<view class="detail-info-item">
							<text class="detail-label">{{ tt('主办方') }}</text>
							<view class="detail-organizer">
								<text class="org-avatar">{{ detailAct.organizerAvatar }}</text>
								<text class="detail-value">{{ tt(detailAct.organizer) }}</text>
							</view>
						</view>
						<view class="detail-info-item">
							<text class="detail-label">{{ tt('名额') }}</text>
							<text class="detail-value">{{ detailAct.signupCount }} / {{ detailAct.maxParticipants }} {{ tt('人') }}</text>
						</view>
					</view>

					<!-- 活动介绍 -->
					<view class="detail-section">
						<text class="section-title">{{ tt('活动介绍') }}</text>
						<text class="detail-desc">{{ tt(detailAct.description) }}</text>
					</view>

					<!-- 已报名人员 -->
					<view class="detail-section">
						<text class="section-title">{{ tt('已报名') }} ({{ detailAct.signupCount }})</text>
						<view v-if="detailAct.signups.length === 0" class="no-signups">
							<text class="no-signups-text">{{ tt('暂无人报名，快来第一个报名吧！') }}</text>
						</view>
						<view v-for="(s, i) in detailAct.signups" :key="i" class="signup-item">
							<view class="signup-avatar-wrap"><text class="signup-avatar-text">{{ s.name[0] }}</text></view>
							<view class="signup-info">
								<text class="signup-name">{{ s.name }}</text>
								<text class="signup-phone">{{ s.phone }}</text>
								<text class="signup-note" v-if="s.note">{{ tt(s.note) }}</text>
							</view>
							<text class="signup-time-text">{{ timeAgo(s.signupTime) }}</text>
						</view>
					</view>
				</scroll-view>

				<!-- 底部按钮 -->
				<view class="detail-footer">
					<view class="detail-btn" :class="{ cancel: isJoined(detailAct), disabled: (detailAct.status !== '报名中' || detailAct.signupCount >= detailAct.maxParticipants) && !isJoined(detailAct) }" @click="onDetailBtnClick">
						<text class="detail-btn-text">{{ detailBtnLabel }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 报名表单弹窗 -->
		<view v-if="showForm" class="modal-mask" @click="showForm = false">
			<view class="modal-box form-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ tt('填写报名信息') }}</text>
					<view class="modal-close" @click="showForm = false"><text>✕</text></view>
				</view>

				<view class="form-area">
					<view class="form-item">
						<text class="form-label">{{ tt('姓名') }}</text>
						<input v-model="formName" :placeholder="tt('请输入姓名')" placeholder-class="form-placeholder" />
					</view>
					<view class="form-item">
						<text class="form-label">{{ tt('手机号') }}</text>
						<input v-model="formPhone" type="number" :placeholder="tt('请输入手机号')" placeholder-class="form-placeholder" maxlength="11" />
					</view>
					<view class="form-item">
						<text class="form-label">{{ tt('备注') }}</text>
						<input v-model="formNote" :placeholder="tt('选填，如特殊需求')" placeholder-class="form-placeholder" />
					</view>
				</view>

				<view class="form-submit" :class="{ disabled: !canSubmitForm }" @click="submitForm">
					<text class="form-submit-text">{{ tt('确认报名') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
	createActivitySignup,
	deleteActivitySignup,
	getActivityDetail,
	listActivities,
	listMyActivitySignups
} from '../../api/activity.js'
import { getAuthUser, getUserProfile, isLoggedIn } from '../../utils/store.js'
import { timeAgo } from '../../utils/helpers.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt, formatI18nText } = useI18n()
const activeTab = ref(0)
const activities = ref([])
const myActivities = ref([])
const showDetail = ref(false)
const detailAct = ref(createEmptyActivity())
const showForm = ref(false)
const formName = ref('')
const formPhone = ref('')
const formNote = ref('')
const formActId = ref(null)

function createEmptyActivity() {
	return {
		id: null,
		emoji: '',
		title: '',
		description: '',
		date: '',
		time: '',
		location: '',
		maxParticipants: 0,
		tags: [],
		organizer: '',
		organizerAvatar: '',
		status: '报名中',
		signupCount: 0,
		isJoined: false,
		mySignupTime: 0,
		signups: []
	}
}

const displayList = computed(() => {
	if (activeTab.value === 0) return activities.value
	return myActivities.value
})

function isJoined(act) {
	return !!act?.isJoined
}

function statusClass(status) {
	if (status === '报名中') return 'status-open'
	if (status === '进行中') return 'status-ongoing'
	return 'status-ended'
}

function btnLabel(act) {
	if (isJoined(act)) return tt('已报名')
	if (act.status !== '报名中') return tt(act.status)
	if (act.signupCount >= act.maxParticipants) return tt('已满')
	return tt('立即报名')
}

function signupDots(act) {
	return new Array(Math.min(act?.signupCount || 0, 5)).fill(null)
}

const heroGradient = computed(() => {
	const gradients = [
		'linear-gradient(135deg, rgba(255,182,193,0.3), rgba(167,139,250,0.3))',
		'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(96,165,250,0.3))',
		'linear-gradient(135deg, rgba(251,146,60,0.3), rgba(239,68,68,0.3))',
	]
	return gradients[(detailAct.value.id || 0) % gradients.length]
})

const detailBtnLabel = computed(() => {
	if (isJoined(detailAct.value)) return tt('取消报名')
	if (detailAct.value.status !== '报名中') return tt(detailAct.value.status)
	if (detailAct.value.signupCount >= detailAct.value.maxParticipants) return tt('已满')
	return tt('立即报名')
})

const canSubmitForm = computed(() => {
	return formName.value.trim() && /^1[3-9]\d{9}$/.test(formPhone.value)
})

async function loadData() {
	try {
		const [allActivities, mySignups] = await Promise.all([
			listActivities(),
			isLoggedIn() ? listMyActivitySignups() : Promise.resolve([])
		])
		activities.value = allActivities
		myActivities.value = mySignups
		if (showDetail.value && detailAct.value.id) {
			detailAct.value = await getActivityDetail(detailAct.value.id)
		}
	} catch (error) {
		uni.showToast({ title: tt(error.message || '活动加载失败'), icon: 'none' })
	}
}

loadData()
onShow(loadData)

function ensureLoggedIn() {
	if (isLoggedIn()) return true
	uni.showToast({ title: tt('请先登录'), icon: 'none' })
	setTimeout(() => {
		uni.navigateTo({ url: '/pages/login/login' })
	}, 500)
	return false
}

async function openDetail(act) {
	try {
		detailAct.value = await getActivityDetail(act.id)
		showDetail.value = true
	} catch (error) {
		uni.showToast({ title: tt(error.message || '活动详情加载失败'), icon: 'none' })
	}
}

function onBtnClick(act) {
	if (isJoined(act)) {
		confirmCancel(act)
		return
	}
	if (!ensureLoggedIn()) return
	if (act.status !== '报名中' || act.signupCount >= act.maxParticipants) return
	openForm(act.id)
}

function onDetailBtnClick() {
	if (isJoined(detailAct.value)) {
		confirmCancel(detailAct.value)
		return
	}
	if (!ensureLoggedIn()) return
	if (detailAct.value.status !== '报名中') return
	openForm(detailAct.value.id)
}

function openForm(actId) {
	formActId.value = actId
	const profile = getUserProfile()
	const authUser = getAuthUser()
	formName.value = profile.nickname || authUser?.username || ''
	formPhone.value = profile.phone || authUser?.phone || ''
	formNote.value = ''
	showForm.value = true
}

async function submitForm() {
	if (!canSubmitForm.value) return
	try {
		await createActivitySignup(formActId.value, {
			name: formName.value.trim(),
			phone: formPhone.value.trim(),
			note: formNote.value.trim()
		})
		uni.showToast({ title: tt('报名成功！'), icon: 'none' })
		showForm.value = false
		showDetail.value = false
		await loadData()
	} catch (error) {
		uni.showToast({ title: tt(error.message || '报名失败'), icon: 'none' })
	}
}

function confirmCancel(act) {
	uni.showModal({
		title: tt('取消报名'),
		content: formatI18nText('确定取消「{title}」的报名吗？', { title: act.title }),
		async success(r) {
			if (r.confirm) {
				try {
					await deleteActivitySignup(act.id)
					uni.showToast({ title: tt('已取消报名'), icon: 'none' })
					showDetail.value = false
					await loadData()
				} catch (error) {
					uni.showToast({ title: tt(error.message || '取消失败'), icon: 'none' })
				}
			}
		}
	})
}

function getMySignupTime(act) {
	return act?.mySignupTime || 0
}

function formatTime(ts) {
	if (!ts) return ''
	const d = new Date(ts)
	return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function goBack() {
	uni.navigateBack()
}
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); overflow-x: hidden; box-sizing: border-box; width: 100%; }

/* 导航栏 */
.nav-bar { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; height: 88rpx; padding: 0 24rpx; background: rgba(237,231,246,0.95); backdrop-filter: blur(28px) saturate(1.5); border-bottom: 2rpx solid transparent; border-image: linear-gradient(90deg, rgba(167,139,250,0.01), rgba(192,132,252,0.18), rgba(167,139,250,0.01)) 1; }
.nav-left, .nav-right { width: 108rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: #a78bfa; font-weight: 300; }
.nav-title { font-size: 32rpx; font-weight: 700; color: #374151; letter-spacing: 2rpx; }

/* Tab */
.tab-row { display: flex; padding: 20rpx 28rpx; }
.tab-chip { padding: 12rpx 32rpx; border-radius: 28rpx; background: rgba(255,255,255,0.7); border: 2rpx solid rgba(167,139,250,0.1); margin-right: 16rpx; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.tab-chip.active { background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); border-color: transparent; box-shadow: 0 6rpx 24rpx rgba(192,132,252,0.35), 0 2rpx 8rpx rgba(167,139,250,0.15); }
.tab-label { font-size: 26rpx; color: #6b7280; font-weight: 500; }
.tab-chip.active .tab-label { color: #fff; font-weight: 600; }

/* Feed */
.feed { height: calc(100vh - 260rpx); padding: 0 28rpx 28rpx; box-sizing: border-box; width: 100%; }

/* 空状态 */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 140rpx 0; }
.empty-icon { font-size: 100rpx; margin-bottom: 28rpx; }
.empty-text { font-size: 30rpx; color: #9ca3af; letter-spacing: 2rpx; }

/* 活动卡片 */
.act-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border-radius: 28rpx; padding: 28rpx; margin-bottom: 20rpx; border: 2rpx solid rgba(255,255,255,0.9); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 8rpx 24rpx rgba(167,139,250,0.06), 0 16rpx 40rpx rgba(192,132,252,0.04); overflow: hidden; box-sizing: border-box; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.act-card:active { transform: scale(0.97); box-shadow: 0 2rpx 6rpx rgba(167,139,250,0.03), 0 4rpx 12rpx rgba(167,139,250,0.04); }

.act-header { display: flex; align-items: flex-start; }
.act-emoji-wrap { width: 80rpx; height: 80rpx; border-radius: 24rpx; background: linear-gradient(135deg, rgba(255,182,193,0.2), rgba(167,139,250,0.2)); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 20rpx; }
.act-emoji { font-size: 40rpx; }
.act-title-area { flex: 1; overflow: hidden; }
.act-title { font-size: 30rpx; font-weight: 700; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: 1rpx; }
.act-tags { display: flex; flex-wrap: wrap; margin-top: 8rpx; }
.act-tag { font-size: 22rpx; color: #a78bfa; padding: 4rpx 14rpx; background: rgba(167,139,250,0.06); border-radius: 8rpx; margin-right: 8rpx; box-shadow: 0 2rpx 6rpx rgba(167,139,250,0.06); }

.act-status { padding: 8rpx 18rpx; border-radius: 12rpx; flex-shrink: 0; margin-left: 16rpx; }
.status-open { background: rgba(52,211,153,0.1); }
.status-open .act-status-text { color: #059669; font-size: 22rpx; font-weight: 600; }
.status-ongoing { background: rgba(251,146,60,0.1); }
.status-ongoing .act-status-text { color: #d97706; font-size: 22rpx; font-weight: 600; }
.status-ended { background: rgba(156,163,175,0.1); }
.status-ended .act-status-text { color: #9ca3af; font-size: 22rpx; font-weight: 600; }

.act-info { margin: 16rpx 0; }
.info-item { display: flex; align-items: center; margin-bottom: 6rpx; }
.info-icon { font-size: 24rpx; margin-right: 8rpx; }
.info-text { font-size: 24rpx; color: #6b7280; }

.act-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 16rpx; padding-top: 16rpx; border-top: 1rpx solid rgba(167,139,250,0.06); }
.act-signups { display: flex; align-items: center; }
.signup-avatars { display: flex; margin-right: 8rpx; }
.signup-dot { width: 24rpx; height: 24rpx; border-radius: 50%; background: linear-gradient(135deg, #f9a8d4, #a78bfa); margin-left: -6rpx; border: 2rpx solid #fff; }
.signup-dot:first-child { margin-left: 0; }
.signup-count { font-size: 24rpx; color: #9ca3af; }

.act-btn { padding: 12rpx 32rpx; border-radius: 20rpx; border: 2rpx solid #a78bfa; position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.act-btn-text { font-size: 24rpx; color: #a78bfa; font-weight: 600; position: relative; z-index: 1; }
.act-btn.joined { background: rgba(167,139,250,0.08); }
.act-btn.joined .act-btn-text { color: #a78bfa; }
.act-btn.disabled { border-color: #d1d5db; }
.act-btn.disabled .act-btn-text { color: #d1d5db; }

.my-signup-info { margin-top: 12rpx; padding-top: 12rpx; border-top: 1rpx dashed rgba(167,139,250,0.1); }
.my-signup-time { font-size: 22rpx; color: #9ca3af; }

/* 弹窗通用 */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); z-index: 999; display: flex; align-items: flex-end; justify-content: center; }
.modal-box { width: 100%; background: rgba(255,255,255,0.97); backdrop-filter: blur(40px) saturate(1.8); border-radius: 40rpx 40rpx 0 0; max-height: 85vh; display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid rgba(0,0,0,0.05); }
.modal-title { font-size: 32rpx; font-weight: 700; color: #374151; letter-spacing: 2rpx; }
.modal-close { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: #9ca3af; }

/* 详情弹窗 */
.detail-scroll { flex: 1; overflow-y: auto; }
.detail-hero { padding: 40rpx 32rpx; text-align: center; }
.detail-emoji { font-size: 80rpx; display: block; margin-bottom: 16rpx; }
.detail-title { font-size: 36rpx; font-weight: 800; color: #374151; display: block; margin-bottom: 16rpx; letter-spacing: 2rpx; }
.detail-status { display: inline-block; padding: 8rpx 26rpx; border-radius: 16rpx; }

.detail-section { padding: 24rpx 32rpx; }
.section-title { font-size: 28rpx; font-weight: 700; color: #374151; margin-bottom: 16rpx; display: block; letter-spacing: 2rpx; }
.detail-info-item { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 0; border-bottom: 1rpx solid rgba(0,0,0,0.03); }
.detail-label { font-size: 26rpx; color: #9ca3af; flex-shrink: 0; }
.detail-value { font-size: 26rpx; color: #374151; font-weight: 500; }
.detail-organizer { display: flex; align-items: center; }
.org-avatar { font-size: 28rpx; margin-right: 8rpx; }
.detail-desc { font-size: 28rpx; color: #6b7280; line-height: 1.7; }

.no-signups { padding: 40rpx 0; text-align: center; }
.no-signups-text { font-size: 28rpx; color: #c4b5d8; letter-spacing: 2rpx; }

.signup-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid rgba(0,0,0,0.03); }
.signup-avatar-wrap { width: 56rpx; height: 56rpx; border-radius: 50%; background: linear-gradient(135deg, rgba(255,182,193,0.3), rgba(167,139,250,0.3)); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 16rpx; }
.signup-avatar-text { font-size: 24rpx; font-weight: 700; color: #a78bfa; }
.signup-info { flex: 1; overflow: hidden; }
.signup-name { font-size: 26rpx; font-weight: 600; color: #374151; display: block; }
.signup-phone { font-size: 22rpx; color: #a78bfa; margin-top: 4rpx; display: block; }
.signup-note { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; display: block; }
.signup-time-text { font-size: 22rpx; color: #d1d5db; flex-shrink: 0; margin-left: 12rpx; }

.detail-footer { padding: 20rpx 32rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid rgba(0,0,0,0.05); }
.detail-btn { height: 88rpx; border-radius: 44rpx; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.detail-btn::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 44rpx 44rpx 0 0; }
.detail-btn:active { opacity: 0.85; transform: scale(0.97); }
.detail-btn.cancel { background: rgba(239,68,68,0.08); }
.detail-btn.cancel::before { display: none; }
.detail-btn.cancel .detail-btn-text { color: #ef4444; }
.detail-btn.disabled { background: rgba(156,163,175,0.1); }
.detail-btn.disabled::before { display: none; }
.detail-btn.disabled .detail-btn-text { color: #9ca3af; }
.detail-btn-text { font-size: 30rpx; font-weight: 700; color: #fff; position: relative; z-index: 1; }

/* 报名表单弹窗 */
.form-area { padding: 24rpx 32rpx; }
.form-item { margin-bottom: 24rpx; }
.form-label { font-size: 26rpx; font-weight: 600; color: #374151; margin-bottom: 12rpx; display: block; letter-spacing: 2rpx; }
.form-item input { background: rgba(237,231,246,0.35); backdrop-filter: blur(20px) saturate(1.2); border: 2rpx solid rgba(167,139,250,0.12); border-radius: 20rpx; padding: 20rpx 24rpx; font-size: 28rpx; color: #374151; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.form-item input:focus { border-color: rgba(167,139,250,0.35); box-shadow: 0 0 0 6rpx rgba(167,139,250,0.08); }
.form-placeholder { color: #d1d5db; }

.form-submit { margin: 8rpx 32rpx 32rpx; height: 88rpx; border-radius: 44rpx; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.form-submit::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 44rpx 44rpx 0 0; }
.form-submit:active { opacity: 0.85; transform: scale(0.97); }
.form-submit.disabled { opacity: 0.45; }
.form-submit-text { font-size: 30rpx; font-weight: 700; color: #fff; position: relative; z-index: 1; }
</style>
