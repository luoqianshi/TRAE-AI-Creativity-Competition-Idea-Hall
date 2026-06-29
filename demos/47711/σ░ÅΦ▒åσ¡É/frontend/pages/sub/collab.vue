<template>
	<view class="page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title">{{ t('page.collab') }}</text>
			<view class="nav-right nav-action-group">
				<LangSwitch />
				<view class="compose-btn" @click="openPublish">
					<text class="compose-icon">✏️</text>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="content">
			<view class="section-header">
				<text class="section-icon">🌐</text>
				<text class="section-title">{{ tt('正在寻找伙伴的契约者') }}</text>
			</view>

			<view v-if="listings.length === 0" class="empty-state">
				<text class="empty-icon">🪄</text>
				<text class="empty-text">{{ tt('还没有联动发布，来成为第一个发起人吧') }}</text>
			</view>

			<view v-for="item in listings" :key="item.id" class="listing-card">
				<view class="listing-avatar" :style="{ background: item.gradient }">
					<text class="listing-emoji">{{ item.emoji }}</text>
				</view>
				<view class="listing-info">
					<view class="listing-head">
						<text class="listing-name">{{ tt(item.ocName) }}</text>
						<text class="listing-status">{{ tt(item.status) }}</text>
					</view>
					<text class="listing-desc">{{ tt(item.desc) }}</text>
					<view class="listing-meta">
						<text class="meta-text">{{ tt(item.ownerName) }}</text>
						<text class="meta-dot">·</text>
						<text class="meta-text">{{ formatCreatedAt(item.createdAt) }}</text>
						<text class="meta-dot">·</text>
						<text class="meta-text">{{ formatI18nText('{count} 人申请', { count: item.applicationCount }) }}</text>
					</view>
					<view class="listing-tags">
						<text class="ltag" v-for="t in item.tags" :key="t">{{ tt(t) }}</text>
					</view>
					<view v-if="item.applications.length > 0" class="listing-applications">
						<text class="apply-chip" v-for="app in item.applications.slice(0, 2)" :key="app.id">{{ app.applicantName }}</text>
						<text v-if="item.applications.length > 2" class="apply-chip more">+{{ item.applications.length - 2 }}</text>
					</view>
				</view>
				<view class="listing-btn" :class="{ joined: item.applied, mine: item.ownedByMe }" @click="toggleJoin(item)">
					<text class="listing-btn-text">{{ buttonLabel(item) }}</text>
				</view>
			</view>

			<view class="empty-hint">
				<text class="hint-text">{{ tt('更多契约者正在路上...') }}</text>
			</view>
			<view style="height: 60rpx;"></view>
		</scroll-view>

		<view v-if="showPublish" class="modal-mask" @click="showPublish = false">
			<view class="modal-box form-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ tt('发布联动') }}</text>
					<view class="modal-close" @click="showPublish = false"><text>✕</text></view>
				</view>

				<view class="form-area">
					<view class="form-item">
						<text class="form-label">{{ tt('OC 名称') }}</text>
						<input v-model="publishForm.ocName" :placeholder="tt('例如：月华·Luna')" placeholder-class="form-placeholder" />
					</view>
					<view class="form-item">
						<text class="form-label">{{ tt('角色符号') }}</text>
						<input v-model="publishForm.emoji" maxlength="2" :placeholder="tt('例如：🌙')" placeholder-class="form-placeholder" />
					</view>
					<view class="form-item">
						<text class="form-label">{{ tt('联动说明') }}</text>
						<textarea v-model="publishForm.description" class="form-textarea" auto-height :placeholder="tt('写清楚你希望的联动方向、关系或剧情氛围')" placeholder-class="form-placeholder"></textarea>
					</view>
					<view class="form-item">
						<text class="form-label">{{ tt('标签') }}</text>
						<input v-model="publishForm.tagsText" :placeholder="tt('用逗号分隔，如：宿敌, 长线, 校园')" placeholder-class="form-placeholder" />
					</view>
				</view>

				<view class="form-submit" :class="{ disabled: !canPublish }" @click="submitPublish">
					<text class="form-submit-text">{{ tt('确认发布') }}</text>
				</view>
			</view>
		</view>

		<view v-if="showApply" class="modal-mask" @click="showApply = false">
			<view class="modal-box form-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ tt('发送联动申请') }}</text>
					<view class="modal-close" @click="showApply = false"><text>✕</text></view>
				</view>

				<view class="form-area">
					<view class="apply-target">
						<text class="apply-target-name">{{ applyTarget ? tt(applyTarget.ocName) : '' }}</text>
						<text class="apply-target-desc">{{ applyTarget ? tt(applyTarget.desc) : '' }}</text>
					</view>
					<view class="form-item">
						<text class="form-label">{{ tt('申请说明') }}</text>
						<textarea v-model="applyMessage" class="form-textarea" auto-height :placeholder="tt('选填，简单说明你的 OC 或想联动的方向')" placeholder-class="form-placeholder"></textarea>
					</view>
				</view>

				<view class="form-submit" @click="submitApply">
					<text class="form-submit-text">{{ tt('发送申请') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { applyCollab, cancelCollabApply, createCollab, listCollabs } from '../../api/collab.js'
import { isLoggedIn } from '../../utils/store.js'
import { timeAgo } from '../../utils/helpers.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n, formatI18nText } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()
const listings = ref([])
const showPublish = ref(false)
const showApply = ref(false)
const applyTarget = ref(null)
const applyMessage = ref('')
const publishForm = ref({
	ocName: '',
	emoji: '',
	description: '',
	tagsText: ''
})

const canPublish = computed(() => {
	return publishForm.value.ocName.trim() && publishForm.value.emoji.trim() && publishForm.value.description.trim().length >= 5
})

async function loadData() {
	try {
		listings.value = await listCollabs()
	} catch (error) {
		uni.showToast({ title: error.message || tt('联动列表加载失败'), icon: 'none' })
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

function formatCreatedAt(ts) {
	return ts ? timeAgo(ts) : tt('刚刚')
}

function buttonLabel(item) {
	if (item.ownedByMe) return tt('我的发布')
	if (item.applied) return tt('已申请')
	return tt('联动')
}

function openPublish() {
	if (!ensureLoggedIn()) return
	publishForm.value = {
		ocName: '',
		emoji: '',
		description: '',
		tagsText: ''
	}
	showPublish.value = true
}

async function submitPublish() {
	if (!canPublish.value) return
	const tags = publishForm.value.tagsText
		.split(/[，,]/)
		.map(item => item.trim())
		.filter(Boolean)
		.slice(0, 8)
	try {
		await createCollab({
			oc_name: publishForm.value.ocName.trim(),
			emoji: publishForm.value.emoji.trim(),
			description: publishForm.value.description.trim(),
			tags
		})
		showPublish.value = false
		uni.showToast({ title: tt('联动发布成功'), icon: 'none' })
		await loadData()
	} catch (error) {
		uni.showToast({ title: error.message || tt('发布失败'), icon: 'none' })
	}
}

function toggleJoin(item) {
	if (item.ownedByMe) return
	if (!ensureLoggedIn()) return
	if (item.applied) {
		confirmCancel(item)
		return
	}
	applyTarget.value = item
	applyMessage.value = ''
	showApply.value = true
}

async function submitApply() {
	if (!applyTarget.value) return
	try {
		await applyCollab(applyTarget.value.id, {
			message: applyMessage.value.trim()
		})
		showApply.value = false
		uni.showToast({ title: tt('已发送联动申请'), icon: 'none' })
		await loadData()
	} catch (error) {
		uni.showToast({ title: error.message || tt('申请失败'), icon: 'none' })
	}
}

function confirmCancel(item) {
	uni.showModal({
		title: tt('取消联动申请'),
		content: formatI18nText('确定撤回对「{name}」的联动申请吗？', { name: item.ocName }),
		async success(res) {
			if (res.confirm) {
				try {
					await cancelCollabApply(item.id)
					uni.showToast({ title: tt('已取消申请'), icon: 'none' })
					await loadData()
				} catch (error) {
					uni.showToast({ title: error.message || tt('取消失败'), icon: 'none' })
				}
			}
		}
	})
}

function goBack() {
	uni.navigateBack()
}
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); }
.nav-bar { position: relative; display: flex; align-items: center; justify-content: center; padding-bottom: 20rpx; background: linear-gradient(180deg, rgba(167,139,250,0.12), transparent); }
.nav-left { position: absolute; left: 24rpx; bottom: 20rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.nav-right { position: absolute; right: 24rpx; bottom: 20rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.nav-action-group { width: auto; gap: 12rpx; }
.compose-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: #a78bfa; font-weight: 300; }
.compose-icon { font-size: 30rpx; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #a78bfa; margin-top: 20rpx; }

.content { height: 100vh; padding: 0 30rpx; }
.section-header { display: flex; align-items: center; margin: 24rpx 0 20rpx; }
.section-icon { font-size: 32rpx; margin-right: 10rpx; }
.section-title { font-size: 30rpx; font-weight: 700; color: #374151; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0 80rpx; }
.empty-icon { font-size: 96rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 28rpx; color: #9ca3af; letter-spacing: 2rpx; }

.listing-card { display: flex; align-items: flex-start; background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); border-radius: 24rpx; padding: 24rpx; margin-bottom: 20rpx; border: 2rpx solid rgba(255,255,255,0.9); box-shadow: 0 8rpx 24rpx rgba(167,139,250,0.08); }
.listing-avatar { width: 88rpx; height: 88rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.listing-emoji { font-size: 40rpx; }
.listing-info { flex: 1; margin-left: 20rpx; min-width: 0; }
.listing-head { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }
.listing-name { font-size: 28rpx; font-weight: 700; color: #374151; display: block; }
.listing-status { font-size: 20rpx; padding: 6rpx 14rpx; background: rgba(52,211,153,0.1); color: #059669; border-radius: 999rpx; flex-shrink: 0; }
.listing-desc { font-size: 24rpx; color: #6b7280; display: block; margin-top: 8rpx; line-height: 1.6; }
.listing-meta { display: flex; align-items: center; flex-wrap: wrap; margin-top: 10rpx; }
.meta-text { font-size: 21rpx; color: #9ca3af; }
.meta-dot { font-size: 20rpx; color: #d1d5db; margin: 0 8rpx; }
.listing-tags { display: flex; gap: 8rpx; margin-top: 12rpx; flex-wrap: wrap; }
.ltag { font-size: 20rpx; padding: 4rpx 14rpx; background: rgba(167,139,250,0.06); border-radius: 10rpx; color: #a78bfa; }
.listing-applications { display: flex; gap: 8rpx; margin-top: 14rpx; flex-wrap: wrap; }
.apply-chip { font-size: 20rpx; padding: 6rpx 14rpx; border-radius: 999rpx; background: rgba(249,168,212,0.12); color: #db2777; }
.apply-chip.more { background: rgba(167,139,250,0.1); color: #7c3aed; }

.listing-btn { border: 2rpx solid #a78bfa; border-radius: 20rpx; padding: 10rpx 28rpx; margin-left: 16rpx; flex-shrink: 0; }
.listing-btn-text { font-size: 24rpx; color: #a78bfa; font-weight: 600; white-space: nowrap; }
.listing-btn.joined { background: rgba(167,139,250,0.08); }
.listing-btn.mine { border-color: #d1d5db; background: rgba(229,231,235,0.35); }
.listing-btn.mine .listing-btn-text { color: #9ca3af; }

.empty-hint { text-align: center; padding: 40rpx 0; }
.hint-text { font-size: 24rpx; color: #d1d5db; }

.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); z-index: 999; display: flex; align-items: flex-end; justify-content: center; }
.modal-box { width: 100%; background: rgba(255,255,255,0.97); backdrop-filter: blur(40px) saturate(1.8); border-radius: 40rpx 40rpx 0 0; max-height: 85vh; display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid rgba(0,0,0,0.05); }
.modal-title { font-size: 32rpx; font-weight: 700; color: #374151; letter-spacing: 2rpx; }
.modal-close { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: #9ca3af; }

.form-area { padding: 24rpx 32rpx; }
.form-item { margin-bottom: 24rpx; }
.form-label { font-size: 26rpx; font-weight: 600; color: #374151; margin-bottom: 12rpx; display: block; letter-spacing: 2rpx; }
.form-item input, .form-textarea { width: 100%; box-sizing: border-box; background: rgba(237,231,246,0.35); backdrop-filter: blur(20px) saturate(1.2); border: 2rpx solid rgba(167,139,250,0.12); border-radius: 20rpx; padding: 20rpx 24rpx; font-size: 28rpx; color: #374151; }
.form-textarea { min-height: 180rpx; }
.form-placeholder { color: #d1d5db; }
.apply-target { padding: 24rpx; border-radius: 24rpx; background: rgba(167,139,250,0.06); margin-bottom: 24rpx; }
.apply-target-name { display: block; font-size: 28rpx; color: #374151; font-weight: 700; }
.apply-target-desc { display: block; font-size: 24rpx; color: #6b7280; line-height: 1.6; margin-top: 10rpx; }

.form-submit { margin: 8rpx 32rpx 32rpx; height: 88rpx; border-radius: 44rpx; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.form-submit::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 44rpx 44rpx 0 0; }
.form-submit.disabled { opacity: 0.45; }
.form-submit-text { font-size: 30rpx; font-weight: 700; color: #fff; position: relative; z-index: 1; }
</style>
