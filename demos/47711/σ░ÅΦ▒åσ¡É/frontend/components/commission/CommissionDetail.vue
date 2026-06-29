<template>
	<view class="modal-mask" @click="$emit('close')">
		<view class="modal-card detail-modal" @click.stop>
			<scroll-view scroll-y class="detail-scroll">
				<view class="detail-header">
					<view class="detail-avatar-wrap">
						<image v-if="isImageAvatar(item.avatar)" :src="item.avatar" mode="aspectFill" class="detail-avatar-img" />
						<text v-else class="detail-avatar">{{ item.avatar }}</text>
					</view>
					<view class="detail-info">
						<view class="detail-name-row">
							<text class="detail-author">{{ item.author }}</text>
							<view class="card-type-badge" :class="item.type">
								<text class="badge-label">{{ item.type === 'artist' ? tt('接稿') : tt('求稿') }}</text>
							</view>
						</view>
						<text class="detail-time">{{ timeAgo(item.time) }}</text>
					</view>
				</view>

				<text class="detail-title">{{ tt(item.title) }}</text>
				<text class="detail-desc">{{ tt(item.desc) }}</text>

				<view class="detail-samples">
					<view v-for="si in 3" :key="si" class="detail-sample-slot">
						<image v-if="item.samples && item.samples[si - 1]" :src="item.samples[si - 1]" mode="aspectFill" class="detail-sample-img" />
						<view v-else class="detail-sample-empty">
							<text class="detail-sample-icon">🖼️</text>
							<text class="detail-sample-text">{{ tt('例图') }}{{ si }}</text>
						</view>
					</view>
				</view>

				<view class="detail-info-grid">
					<view class="info-block">
						<text class="info-label">{{ tt('风格标签') }}</text>
						<view class="info-tags">
							<text v-for="s in item.styles" :key="s" class="card-tag">{{ tt(s) }}</text>
						</view>
					</view>
					<view class="info-block">
						<text class="info-label">{{ tt('价格区间') }}</text>
						<text class="info-value price">¥{{ item.priceRange }}</text>
					</view>
					<view class="info-block">
						<text class="info-label">{{ tt('交付周期') }}</text>
						<text class="info-value">{{ tt(item.turnaround) }}</text>
					</view>
				</view>

				<view class="applicants-section" v-if="item.applicants && item.applicants.length">
					<text class="section-label">{{ tt('申请记录') }} ({{ item.applicants.length }})</text>
					<view v-for="app in item.applicants" :key="app.id || app.user_id || app.userId" class="applicant-item">
						<view class="applicant-avatar"><text>👤</text></view>
						<view class="applicant-info">
							<view class="applicant-name-row">
								<text class="applicant-name">{{ app.name }}</text>
								<view class="applicant-status-badge" :class="app.status || 'pending'">
									<text class="applicant-status-text">{{ app.status === 'accepted' ? tt('已接受') : app.status === 'rejected' ? tt('已拒绝') : tt('待处理') }}</text>
								</view>
							</view>
							<text class="applicant-msg">{{ tt(app.msg) }}</text>
							<text class="applicant-time">{{ timeAgo(app.time) }}</text>
							<view v-if="isOwner && (!app.status || app.status === 'pending')" class="applicant-actions">
								<view class="accept-btn" @click.stop="emit('accept', app.id)">
									<text class="accept-btn-text">{{ tt('接受') }}</text>
								</view>
								<view class="reject-btn" @click.stop="emit('reject', app.id)">
									<text class="reject-btn-text">{{ tt('拒绝') }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view v-if="isOwner" class="delete-wrap">
					<view class="delete-btn" @click="$emit('delete')"><text class="delete-text">{{ tt('删除此约稿') }}</text></view>
				</view>

				<view style="height: 140rpx;"></view>
			</scroll-view>

			<view class="detail-bar" v-if="!isOwner && item.status === 'open'">
				<view class="apply-input-wrap">
					<input v-model="localMsg" :placeholder="tt('写一句自我介绍或留言...')" placeholder-class="apply-placeholder" />
				</view>
				<view class="apply-btn" :class="{ active: !hasApplied }" @click="handleApply">
					<text class="apply-text">{{ hasApplied ? tt('已申请') : tt('申请') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { timeAgo } from '../../utils/helpers.js'
import { useI18n } from '../../utils/i18n.js'

const { tt } = useI18n()

const props = defineProps({
	item: { type: Object, required: true },
	myId: { type: [String, Number], required: true },
	isOwner: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'apply', 'delete', 'accept', 'reject'])

const localMsg = ref('')

const hasApplied = computed(() => {
	if (!props.item.applicants) return false
	const currentUserId = Number(props.myId || 0)
	return props.item.applicants.some(a => Number(a.user_id || a.userId || 0) === currentUserId)
})

function handleApply() {
	if (hasApplied.value) {
		uni.showToast({ title: tt('你已经申请过了'), icon: 'none' })
		return
	}
	emit('apply', localMsg.value.trim() || tt('你好，我对这个约稿感兴趣！'))
	localMsg.value = ''
}

function isImageAvatar(avatar) {
	if (!avatar) return false
	const value = String(avatar)
	return /^https?:\/\//.test(value) || value.startsWith('/')
}
</script>

<style scoped>
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: flex-end; justify-content: center; }
.modal-card { width: 100%; background: #fff; border-radius: 32rpx 32rpx 0 0; overflow: hidden; max-height: 90vh; }

.detail-modal { display: flex; flex-direction: column; }
.detail-scroll { flex: 1; overflow-y: auto; padding: 28rpx 32rpx 0; }

.detail-header { display: flex; align-items: center; margin-bottom: 20rpx; }
.detail-avatar-wrap { width: 88rpx; height: 88rpx; border-radius: 50%; background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(255,182,193,0.2)); display: flex; align-items: center; justify-content: center; }
.detail-avatar { font-size: 44rpx; }
.detail-avatar-img { width: 88rpx; height: 88rpx; border-radius: 50%; }
.detail-info { flex: 1; margin-left: 20rpx; }
.detail-name-row { display: flex; align-items: center; gap: 10rpx; }
.detail-author { font-size: 32rpx; font-weight: 700; color: #374151; }
.detail-time { font-size: 22rpx; color: #9ca3af; display: block; margin-top: 4rpx; }

.card-type-badge { padding: 4rpx 14rpx; border-radius: 10rpx; }
.card-type-badge.artist { background: rgba(167,139,250,0.12); }
.card-type-badge.seeker { background: rgba(255,182,193,0.2); }
.badge-label { font-size: 20rpx; font-weight: 600; }
.card-type-badge.artist .badge-label { color: #a78bfa; }
.card-type-badge.seeker .badge-label { color: #f472b6; }

.detail-title { font-size: 34rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 12rpx; }
.detail-desc { font-size: 28rpx; color: #6b7280; line-height: 1.7; display: block; white-space: pre-wrap; margin-bottom: 24rpx; }

.detail-samples { display: flex; gap: 14rpx; margin-bottom: 24rpx; }
.detail-sample-slot { flex: 1; aspect-ratio: 1; border-radius: 18rpx; overflow: hidden; }
.detail-sample-img { width: 100%; height: 100%; }
.detail-sample-empty { width: 100%; height: 0; padding-bottom: 100%; position: relative; background: rgba(167,139,250,0.04); border: 2rpx dashed rgba(167,139,250,0.2); border-radius: 18rpx; }
.detail-sample-icon { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); font-size: 36rpx; opacity: 0.35; }
.detail-sample-text { position: absolute; top: 60%; left: 50%; transform: translate(-50%, -50%); font-size: 20rpx; color: #c4b5fd; }

.detail-info-grid { display: flex; flex-direction: column; gap: 16rpx; padding: 20rpx; background: rgba(167,139,250,0.04); border-radius: 20rpx; margin-bottom: 24rpx; }
.info-block { display: flex; align-items: center; justify-content: space-between; }
.info-label { font-size: 24rpx; color: #9ca3af; flex-shrink: 0; }
.info-tags { display: flex; gap: 8rpx; flex-wrap: wrap; justify-content: flex-end; }
.card-tag { font-size: 22rpx; color: #a78bfa; padding: 4rpx 16rpx; background: rgba(167,139,250,0.06); border-radius: 12rpx; }
.info-value { font-size: 26rpx; font-weight: 600; color: #374151; }
.info-value.price { color: #a78bfa; }

.applicants-section { margin-bottom: 24rpx; }
.section-label { font-size: 28rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 16rpx; }
.applicant-item { display: flex; align-items: flex-start; padding: 16rpx 0; border-bottom: 1rpx solid rgba(0,0,0,0.03); }
.applicant-avatar { width: 56rpx; height: 56rpx; border-radius: 50%; background: rgba(167,139,250,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 16rpx; font-size: 28rpx; }
.applicant-info { flex: 1; }
.applicant-name-row { display: flex; align-items: center; gap: 10rpx; }
.applicant-name { font-size: 26rpx; font-weight: 600; color: #374151; }
.applicant-status-badge { padding: 2rpx 12rpx; border-radius: 8rpx; }
.applicant-status-badge.pending { background: rgba(167,139,250,0.1); }
.applicant-status-badge.accepted { background: rgba(52,211,153,0.1); }
.applicant-status-badge.rejected { background: rgba(0,0,0,0.04); }
.applicant-status-text { font-size: 18rpx; font-weight: 600; }
.applicant-status-badge.pending .applicant-status-text { color: #a78bfa; }
.applicant-status-badge.accepted .applicant-status-text { color: #10b981; }
.applicant-status-badge.rejected .applicant-status-text { color: #9ca3af; }
.applicant-msg { font-size: 24rpx; color: #6b7280; display: block; margin-top: 4rpx; line-height: 1.5; }
.applicant-time { font-size: 20rpx; color: #d1d5db; display: block; margin-top: 6rpx; }
.applicant-actions { display: flex; gap: 12rpx; margin-top: 10rpx; }
.accept-btn { padding: 10rpx 28rpx; border-radius: 16rpx; background: linear-gradient(135deg, #FFB6C1, #a78bfa); }
.accept-btn:active { opacity: 0.8; }
.accept-btn-text { font-size: 24rpx; color: #fff; font-weight: 600; }
.reject-btn { padding: 10rpx 28rpx; border-radius: 16rpx; background: rgba(0,0,0,0.04); }
.reject-btn:active { background: rgba(0,0,0,0.08); }
.reject-btn-text { font-size: 24rpx; color: #9ca3af; font-weight: 600; }

.delete-wrap { text-align: center; padding: 20rpx 0; }
.delete-btn { padding: 18rpx; border-radius: 24rpx; background: rgba(239,68,68,0.06); }
.delete-btn:active { background: rgba(239,68,68,0.12); }
.delete-text { font-size: 26rpx; color: #ef4444; font-weight: 600; }

.detail-bar { display: flex; align-items: center; padding: 16rpx 24rpx; background: #fff; border-top: 1rpx solid rgba(0,0,0,0.04); padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); }
.apply-input-wrap { flex: 1; background: rgba(0,0,0,0.03); border-radius: 32rpx; padding: 16rpx 24rpx; }
.apply-input-wrap input { font-size: 28rpx; color: #374151; }
.apply-placeholder { color: #d1d5db; }
.apply-btn { margin-left: 16rpx; padding: 14rpx 32rpx; border-radius: 24rpx; background: rgba(0,0,0,0.04); flex-shrink: 0; }
.apply-btn.active { background: linear-gradient(135deg, #FFB6C1, #a78bfa); }
.apply-text { font-size: 26rpx; color: #9ca3af; font-weight: 600; }
.apply-btn.active .apply-text { color: #fff; }
</style>
