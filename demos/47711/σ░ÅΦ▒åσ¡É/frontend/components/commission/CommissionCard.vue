<template>
	<view class="commission-card" @click="$emit('click')">
		<view class="card-header">
			<view class="card-avatar-wrap">
				<image v-if="isImageAvatar(item.avatar)" :src="item.avatar" mode="aspectFill" class="card-avatar-img" />
				<text v-else class="card-avatar">{{ item.avatar }}</text>
			</view>
			<view class="card-meta">
				<view class="card-name-row">
					<text class="card-author">{{ item.author }}</text>
					<view class="card-type-badge" :class="item.type">
						<text class="badge-label">{{ item.type === 'artist' ? tt('接稿') : tt('求稿') }}</text>
					</view>
				</view>
				<text class="card-time">{{ timeAgo(item.time) }}</text>
			</view>
			<view class="card-status" :class="item.status">
				<text class="status-text">{{ item.status === 'open' ? tt('进行中') : tt('已关闭') }}</text>
			</view>
		</view>

		<text class="card-title">{{ tt(item.title) }}</text>
		<text class="card-desc">{{ tt(item.desc) }}</text>

		<view class="card-samples">
			<view v-for="si in 3" :key="si" class="card-sample-slot">
				<image v-if="item.samples && item.samples[si - 1]" :src="item.samples[si - 1]" mode="aspectFill" class="card-sample-img" />
				<view v-else class="card-sample-empty">
					<text class="card-sample-icon">🖼️</text>
				</view>
			</view>
		</view>

		<view class="card-tags">
			<text v-for="s in item.styles" :key="s" class="card-tag">{{ tt(s) }}</text>
		</view>

		<view class="card-footer">
			<view class="footer-item">
				<text class="footer-icon">💰</text>
				<text class="footer-text">¥{{ item.priceRange }}</text>
			</view>
			<view class="footer-item">
				<text class="footer-icon">⏱️</text>
				<text class="footer-text">{{ tt(item.turnaround) }}</text>
			</view>
			<view class="footer-item">
				<text class="footer-icon">📩</text>
				<text class="footer-text">{{ item.applicants ? item.applicants.length : 0 }} {{ tt('人申请') }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { timeAgo } from '../../utils/helpers.js'
import { useI18n } from '../../utils/i18n.js'

const { tt } = useI18n()

defineProps({
	item: { type: Object, required: true },
})

defineEmits(['click'])

function isImageAvatar(avatar) {
	if (!avatar) return false
	const value = String(avatar)
	return /^https?:\/\//.test(value) || value.startsWith('/')
}
</script>

<style scoped>
.commission-card { background: rgba(255,255,255,0.88); backdrop-filter: blur(16px); border-radius: 24rpx; padding: 28rpx; margin: 0 24rpx 20rpx; border: 2rpx solid rgba(255,255,255,0.9); box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03); transition: transform 0.2s; }
.commission-card:active { transform: scale(0.98); }

.card-header { display: flex; align-items: center; margin-bottom: 16rpx; }
.card-avatar-wrap { width: 72rpx; height: 72rpx; border-radius: 50%; background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(255,182,193,0.2)); display: flex; align-items: center; justify-content: center; }
.card-avatar { font-size: 36rpx; }
.card-avatar-img { width: 72rpx; height: 72rpx; border-radius: 50%; }
.card-meta { flex: 1; margin-left: 16rpx; }
.card-name-row { display: flex; align-items: center; gap: 10rpx; }
.card-author { font-size: 28rpx; font-weight: 700; color: #374151; }
.card-type-badge { padding: 4rpx 14rpx; border-radius: 10rpx; }
.card-type-badge.artist { background: rgba(167,139,250,0.12); }
.card-type-badge.seeker { background: rgba(255,182,193,0.2); }
.badge-label { font-size: 20rpx; font-weight: 600; }
.card-type-badge.artist .badge-label { color: #a78bfa; }
.card-type-badge.seeker .badge-label { color: #f472b6; }
.card-time { font-size: 22rpx; color: #9ca3af; display: block; margin-top: 4rpx; }
.card-status { padding: 6rpx 16rpx; border-radius: 12rpx; margin-left: 12rpx; flex-shrink: 0; }
.card-status.open { background: rgba(52,211,153,0.1); }
.card-status.closed { background: rgba(0,0,0,0.04); }
.status-text { font-size: 20rpx; font-weight: 600; }
.card-status.open .status-text { color: #10b981; }
.card-status.closed .status-text { color: #9ca3af; }

.card-title { font-size: 30rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 10rpx; }
.card-desc { font-size: 26rpx; color: #6b7280; line-height: 1.6; display: block; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.card-samples { display: flex; gap: 12rpx; margin-top: 16rpx; }
.card-sample-slot { flex: 1; aspect-ratio: 1; border-radius: 16rpx; overflow: hidden; }
.card-sample-img { width: 100%; height: 100%; }
.card-sample-empty { width: 100%; height: 0; padding-bottom: 100%; position: relative; background: rgba(167,139,250,0.04); border: 2rpx dashed rgba(167,139,250,0.2); border-radius: 16rpx; }
.card-sample-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 32rpx; opacity: 0.35; }

.card-tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 16rpx; }
.card-tag { font-size: 22rpx; color: #a78bfa; padding: 4rpx 16rpx; background: rgba(167,139,250,0.06); border-radius: 12rpx; }

.card-footer { display: flex; gap: 24rpx; margin-top: 20rpx; padding-top: 16rpx; border-top: 1rpx solid rgba(0,0,0,0.03); }
.footer-item { display: flex; align-items: center; gap: 6rpx; }
.footer-icon { font-size: 22rpx; }
.footer-text { font-size: 22rpx; color: #6b7280; }
</style>
