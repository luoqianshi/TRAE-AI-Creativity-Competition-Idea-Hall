<template>
	<view class="page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title">{{ t('page.profile') }}</text>
			<view class="nav-right"><LangSwitch /></view>
		</view>

		<scroll-view scroll-y class="content">
			<view v-if="oc" class="detail-card">
				<view class="detail-banner" :style="{ background: oc.gradient }">
					<image v-if="oc.avatar" :src="oc.avatar" class="detail-avatar-img" mode="aspectFill" />
					<text v-else class="detail-emoji">{{ oc.emoji }}</text>
					<text class="detail-name">{{ oc.name }}</text>
					<text class="detail-title">{{ oc.title }} | Lv.{{ oc.level }}</text>
				</view>

				<view class="detail-section">
					<text class="section-label">{{ tt('属性') }}</text>
					<view class="stat-row" v-for="(val, key) in oc.stats" :key="key">
						<text class="stat-name">{{ statLabels[key] || key }}</text>
						<view class="stat-bar"><view class="stat-fill" :style="{ width: val + '%', background: oc.barColor }"></view></view>
						<text class="stat-num">{{ val }}</text>
					</view>
				</view>

				<view class="detail-section" v-if="oc.story">
					<text class="section-label">{{ tt('背景故事') }}</text>
					<text class="story-text">{{ oc.story }}</text>
				</view>

				<view class="detail-section" v-if="oc.tags && oc.tags.length">
					<text class="section-label">{{ tt('标签') }}</text>
					<view class="tag-row">
						<text class="tag" v-for="t in oc.tags" :key="t">{{ t }}</text>
					</view>
				</view>

				<view class="detail-section" v-if="oc.voiceLines && oc.voiceLines.length">
					<text class="section-label">{{ tt('语音台词') }}</text>
					<view class="voice-item" v-for="(line, i) in oc.voiceLines" :key="i">
						<text class="voice-idx">{{ i + 1 }}.</text>
						<text class="voice-line">"{{ line }}"</text>
					</view>
				</view>
			</view>

			<view v-else class="empty">
				<text class="empty-text">{{ tt('未找到该角色') }}</text>
			</view>
			<view style="height: 60rpx;"></view>
		</scroll-view>
	</view>
</template>

<script setup>
// Deprecated page: not registered in pages.json; current OC browse flow stays in index preview and editor entry.
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchOCDetail } from '../../api/oc.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()
const oc = ref(null)
const statLabels = { intimacy: tt('亲密度'), combat: tt('战斗力'), emotion: tt('情感值') }

onLoad(async (options) => {
	const id = Number(options?.id)
	if (!id) return

	try {
		const res = await fetchOCDetail(id)
		const data = res.data || res
		oc.value = {
			...data,
			stats: {
				intimacy: Number(data?.stats?.intimacy || 0),
				combat: Number(data?.stats?.combat || 0),
				emotion: Number(data?.stats?.emotion || 0),
			},
			tags: Array.isArray(data?.tags) ? data.tags : [],
			voiceLines: Array.isArray(data?.voiceLines) ? data.voiceLines : [],
		}
	} catch (error) {
		oc.value = null
		uni.showToast({ title: tt(error.message || '加载角色失败'), icon: 'none' })
	}
})

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
.detail-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border-radius: 28rpx; overflow: hidden; margin-top: 20rpx; border: 2rpx solid rgba(255,255,255,0.9); }
.detail-banner { padding: 48rpx 32rpx; display: flex; flex-direction: column; align-items: center; }
.detail-emoji { font-size: 80rpx; }
.detail-avatar-img { width: 160rpx; height: 160rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.4); }
.detail-name { font-size: 40rpx; font-weight: 800; color: #fff; margin-top: 16rpx; text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2); }
.detail-title { font-size: 24rpx; color: rgba(255,255,255,0.85); margin-top: 8rpx; }

.detail-section { padding: 28rpx 32rpx; border-top: 1rpx solid rgba(0,0,0,0.04); }
.section-label { font-size: 26rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 16rpx; }

.stat-row { display: flex; align-items: center; margin-bottom: 14rpx; }
.stat-name { font-size: 24rpx; color: #6b7280; width: 100rpx; }
.stat-bar { flex: 1; height: 14rpx; background: rgba(0,0,0,0.04); border-radius: 7rpx; overflow: hidden; }
.stat-fill { height: 100%; border-radius: 7rpx; }
.stat-num { font-size: 22rpx; color: #9ca3af; width: 56rpx; text-align: right; }

.story-text { font-size: 26rpx; color: #6b7280; line-height: 1.8; display: block; white-space: pre-wrap; }
.tag-row { display: flex; flex-wrap: wrap; gap: 10rpx; }
.tag { font-size: 22rpx; padding: 6rpx 18rpx; background: linear-gradient(135deg, rgba(167,139,250,0.08), rgba(255,182,193,0.12)); border-radius: 14rpx; color: #a78bfa; }

.voice-item { display: flex; align-items: flex-start; margin-bottom: 12rpx; }
.voice-idx { font-size: 22rpx; color: #a78bfa; width: 40rpx; margin-top: 4rpx; }
.voice-line { font-size: 26rpx; color: #6b7280; line-height: 1.6; flex: 1; }

.empty { padding: 120rpx 0; text-align: center; }
.empty-text { font-size: 28rpx; color: #d1d5db; }
</style>
