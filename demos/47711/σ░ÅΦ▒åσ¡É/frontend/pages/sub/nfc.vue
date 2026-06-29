<template>
	<view class="page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title">{{ t('page.nfc') }}</text>
			<view class="nav-right"><LangSwitch /></view>
		</view>

		<scroll-view scroll-y class="content">
			<!-- 签到卡片 -->
			<view class="sign-card">
				<view class="sign-header">
					<text class="sign-emoji">📱</text>
					<text class="sign-title">{{ tt('触碰手办签到') }}</text>
				</view>

				<view class="calendar">
					<view v-for="d in 7" :key="d" class="cal-day" :class="{ signed: isRecentSigned(d), today: d === 7 }">
						<text class="cal-num">{{ getRecentDate(d) }}</text>
						<text class="cal-check" v-if="isRecentSigned(d)">✓</text>
					</view>
				</view>

				<view class="sign-btn-area">
					<view class="sign-btn" :class="{ done: todaySigned }" @click="handleSign">
						<text class="sign-btn-text">{{ todaySigned ? tt('今日已签到 ✓') : tt('立即签到') }}</text>
					</view>
					<text class="streak-text">{{ tt('已连续签到') }} {{ signRecords.streak }} {{ tt('天') }}</text>
				</view>

				<view class="fortune-box" v-if="signResult">
					<text class="fortune-label">{{ tt('今日签文') }}</text>
					<text class="fortune-text">{{ signResult }}</text>
				</view>
			</view>
			<view style="height: 60rpx;"></view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getSigninStatus, getTodayFortune, signIn } from '../../utils/apis/user.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()
const signRecords = ref({ dates: [], streak: 0 })
const todaySigned = ref(false)
const signResult = ref('')

async function loadData() {
	try {
		const [status, fortune] = await Promise.all([
			getSigninStatus(),
			getTodayFortune(),
		])
		signRecords.value = { dates: status.dates, streak: status.streak }
		todaySigned.value = status.todaySigned
		signResult.value = fortune.summary || ''
	} catch (error) {
		uni.showToast({ title: error.message || tt('加载失败'), icon: 'none' })
	}
}

onMounted(loadData)
onShow(loadData)

async function handleSign() {
	if (todaySigned.value) return
	try {
		const result = await signIn()
		signRecords.value = { dates: result.dates, streak: result.streak }
		todaySigned.value = true
		signResult.value = result.fortune.summary || ''
		uni.showToast({ title: result.alreadySigned ? tt('今日已签到') : `${tt('签到成功！经验 +')}${result.expGained}`, icon: 'none' })
	} catch (error) {
		uni.showToast({ title: error.message || tt('签到失败'), icon: 'none' })
	}
}

function isRecentSigned(dayIdx) {
	const date = new Date(); date.setDate(date.getDate() - (7 - dayIdx))
	return signRecords.value.dates.includes(date.toISOString().slice(0, 10))
}

function getRecentDate(dayIdx) {
	const date = new Date(); date.setDate(date.getDate() - (7 - dayIdx))
	return date.getDate()
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); }
.nav-bar { position: relative; display: flex; align-items: center; justify-content: center; padding-bottom: 20rpx; background: linear-gradient(180deg, rgba(167,139,250,0.12), transparent); }
.nav-left { position: absolute; left: 24rpx; bottom: 20rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.nav-right { position: absolute; right: 24rpx; bottom: 20rpx; }
.back-icon { font-size: 48rpx; color: #a78bfa; font-weight: 300; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #a78bfa; margin-top: 20rpx; }

.content { height: 100vh; padding: 0 30rpx; }

.sign-card { margin-top: 20rpx; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border-radius: 28rpx; padding: 32rpx; border: 2rpx solid rgba(255,255,255,0.9); }
.sign-header { display: flex; align-items: center; margin-bottom: 28rpx; }
.sign-emoji { font-size: 36rpx; margin-right: 12rpx; }
.sign-title { font-size: 32rpx; font-weight: 700; color: #374151; }

.calendar { display: flex; gap: 12rpx; justify-content: center; margin-bottom: 28rpx; }
.cal-day { width: 72rpx; height: 88rpx; border-radius: 18rpx; background: rgba(0,0,0,0.03); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2rpx solid rgba(0,0,0,0.04); }
.cal-day.signed { background: rgba(167,139,250,0.08); border-color: rgba(167,139,250,0.2); }
.cal-day.today { border-color: #a78bfa; box-shadow: 0 0 12rpx rgba(167,139,250,0.2); }
.cal-num { font-size: 26rpx; color: #374151; font-weight: 600; }
.cal-check { font-size: 22rpx; color: #a78bfa; }

.sign-btn-area { text-align: center; margin-bottom: 24rpx; }
.sign-btn { background: linear-gradient(135deg, #FFB6C1, #a78bfa); border-radius: 40rpx; padding: 24rpx; }
.sign-btn.done { background: rgba(0,0,0,0.08); }
.sign-btn-text { font-size: 30rpx; color: #fff; font-weight: 700; }
.sign-btn.done .sign-btn-text { color: #9ca3af; }
.streak-text { font-size: 22rpx; color: #9ca3af; margin-top: 12rpx; display: block; }

.fortune-box { background: rgba(167,139,250,0.04); border-radius: 16rpx; padding: 24rpx; margin-top: 8rpx; }
.fortune-label { font-size: 24rpx; color: #a78bfa; font-weight: 600; display: block; margin-bottom: 10rpx; }
.fortune-text { font-size: 26rpx; color: #6b7280; line-height: 1.7; display: block; }
</style>
