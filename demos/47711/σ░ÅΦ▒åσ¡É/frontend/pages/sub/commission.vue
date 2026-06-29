<template>
	<view class="page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack"><text class="back-icon">‹</text></view>
			<text class="nav-title">{{ t('page.commission') }}</text>
			<view class="nav-right nav-action-group">
				<LangSwitch />
				<view class="compose-btn" @click="showPublish = true"><text class="compose-icon">✏️</text></view>
			</view>
		</view>

		<!-- Tab 切换 -->
		<view class="tab-row">
			<view v-for="(t, i) in tabs" :key="i" class="tab-chip" :class="{ active: activeTab === i }" @click="activeTab = i">
				<text class="tab-label">{{ tt(t) }}</text>
			</view>
		</view>

		<!-- 列表 -->
		<scroll-view scroll-y class="feed">
			<CommissionCard
				v-for="item in filteredList"
				:key="item.id"
				:item="item"
				@click="openDetail(item)"
			/>

			<view class="feed-end">
				<text class="feed-end-text">{{ filteredList.length ? tt('— 已经到底了 —') : tt('还没有约稿信息，快来发布第一条吧！') }}</text>
			</view>
			<view style="height: 40rpx;"></view>
		</scroll-view>

		<!-- 详情弹窗 -->
		<CommissionDetail
			v-if="showDetail"
			:item="detailItem"
			:my-id="myId"
			:is-owner="!!detailItem.ownedByMe"
			@close="showDetail = false"
			@apply="submitApply"
			@delete="handleDelete"
			@accept="handleAccept"
			@reject="handleReject"
		/>

		<!-- 发布弹窗 -->
		<CommissionPublish
			v-if="showPublish"
			@close="showPublish = false"
			@submit="submitPublish"
		/>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMe } from '../../utils/apis/user.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'
import {
	acceptCommissionApplication,
	applyCommission,
	createCommission,
	deleteCommission,
	getCommissionDetail,
	getCommissions,
	rejectCommissionApplication,
} from '../../utils/apis/commission.js'
import CommissionCard from '../../components/commission/CommissionCard.vue'
import CommissionDetail from '../../components/commission/CommissionDetail.vue'
import CommissionPublish from '../../components/commission/CommissionPublish.vue'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()

const me = ref({ id: 0, nickname: '新契约者' })
const myId = computed(() => Number(me.value.id || 0))

const tabs = ['全部', '找画师', '画师接稿']
const activeTab = ref(0)

const commissions = ref([])
const showDetail = ref(false)
const showPublish = ref(false)
const detailItem = ref({})

async function loadMe() {
	try {
		me.value = await getMe()
	} catch (error) {
		// 允许未登录查看列表，操作时会由后端鉴权
		me.value = { id: 0, nickname: '新契约者' }
	}
}

async function loadData() {
	try {
		commissions.value = await getCommissions()
	} catch (error) {
		uni.showToast({ title: tt(error.message || '加载失败'), icon: 'none' })
	}
}
onShow(() => {
	loadMe()
	loadData()
})

loadMe()
loadData()

const filteredList = computed(() => {
	if (activeTab.value === 0) return commissions.value
	if (activeTab.value === 1) return commissions.value.filter(c => c.type === 'seeker')
	return commissions.value.filter(c => c.type === 'artist')
})

async function openDetail(item) {
	try {
		detailItem.value = await getCommissionDetail(item.id)
		showDetail.value = true
	} catch (error) {
		uni.showToast({ title: tt(error.message || '加载详情失败'), icon: 'none' })
	}
}

async function submitApply(msg) {
	try {
		detailItem.value = await applyCommission(detailItem.value.id, { msg })
		await loadData()
		uni.showToast({ title: tt('申请已发送'), icon: 'none' })
	} catch (error) {
		uni.showToast({ title: tt(error.message || '申请失败'), icon: 'none' })
	}
}

function handleDelete() {
	uni.showModal({
		title: tt('删除约稿'),
		content: tt('确定删除这条约稿信息？'),
		confirmColor: '#ef4444',
		success: async res => {
			if (res.confirm) {
				try {
					await deleteCommission(detailItem.value.id)
					showDetail.value = false
					await loadData()
					uni.showToast({ title: tt('已删除'), icon: 'none' })
				} catch (error) {
					uni.showToast({ title: tt(error.message || '删除失败'), icon: 'none' })
				}
			}
		}
	})
}

async function handleAccept(applicationId) {
	try {
		detailItem.value = await acceptCommissionApplication(detailItem.value.id, applicationId)
		await loadData()
		uni.showToast({ title: tt('已接受申请'), icon: 'none' })
	} catch (error) {
		uni.showToast({ title: tt(error.message || '操作失败'), icon: 'none' })
	}
}

async function handleReject(applicationId) {
	try {
		detailItem.value = await rejectCommissionApplication(detailItem.value.id, applicationId)
		await loadData()
		uni.showToast({ title: tt('已拒绝'), icon: 'none' })
	} catch (error) {
		uni.showToast({ title: tt(error.message || '操作失败'), icon: 'none' })
	}
}

async function submitPublish(formData) {
	try {
		await createCommission({
			type: formData.type,
			title: formData.title,
			desc: formData.desc,
			styles: formData.styles,
			priceRange: formData.priceRange,
			turnaround: formData.turnaround,
			samples: [],
		})
		showPublish.value = false
		await loadData()
		uni.showToast({ title: tt('发布成功'), icon: 'none' })
	} catch (error) {
		uni.showToast({ title: tt(error.message || '发布失败'), icon: 'none' })
	}
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); }

/* 导航 */
.nav-bar { position: relative; display: flex; align-items: center; justify-content: center; padding-bottom: 16rpx; background: rgba(237,231,246,0.95); backdrop-filter: blur(28px) saturate(1.5); border-bottom: 2rpx solid transparent; border-image: linear-gradient(90deg, rgba(167,139,250,0.01), rgba(192,132,252,0.18), rgba(167,139,250,0.01)) 1; flex-shrink: 0; }
.nav-left { position: absolute; left: 20rpx; bottom: 16rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 52rpx; color: #a78bfa; font-weight: 300; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #374151; margin-top: 20rpx; letter-spacing: 2rpx; }
.nav-right { position: absolute; right: 24rpx; bottom: 16rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.nav-action-group { width: auto; gap: 12rpx; }
.compose-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.compose-icon { font-size: 32rpx; }

/* Tab */
.tab-row { display: flex; padding: 16rpx 24rpx; gap: 12rpx; flex-shrink: 0; }
.tab-chip { padding: 10rpx 28rpx; border-radius: 28rpx; background: rgba(255,255,255,0.7); border: 2rpx solid rgba(0,0,0,0.04); flex-shrink: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.tab-chip.active { background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); border-color: transparent; box-shadow: 0 6rpx 24rpx rgba(192,132,252,0.35), 0 2rpx 8rpx rgba(167,139,250,0.15); }
.tab-label { font-size: 24rpx; color: #6b7280; font-weight: 600; }
.tab-chip.active .tab-label { color: #fff; }

/* 列表 */
.feed { flex: 1; padding: 0; }

.feed-end { text-align: center; padding: 48rpx 24rpx; }
.feed-end-text { font-size: 24rpx; color: #c4b5d8; letter-spacing: 2rpx; }
</style>
