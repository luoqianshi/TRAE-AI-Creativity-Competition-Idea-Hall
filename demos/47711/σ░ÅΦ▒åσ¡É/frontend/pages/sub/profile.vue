<template>
	<view class="page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack"><text class="back-icon">‹</text></view>
			<text class="nav-title">{{ t('page.profile') }}</text>
			<view class="nav-right"><LangSwitch /></view>
		</view>

		<!-- OC 选择器 -->
		<view class="oc-selector" v-if="ocList.length > 1">
			<scroll-view scroll-x :show-scrollbar="false">
				<view class="oc-chips">
					<view v-for="oc in ocList" :key="oc.id" class="oc-chip"
						:class="{ active: selectedOCId === oc.id }" @click="selectOC(oc.id)">
						<image v-if="oc.avatar" :src="oc.avatar" class="chip-avatar" mode="aspectFill" />
						<text v-else class="chip-emoji">{{ oc.emoji }}</text>
						<text class="chip-name">{{ oc.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<scroll-view scroll-y class="content" v-if="currentOC">
			<!-- 头像区域 -->
			<view class="profile-hero">
				<view class="hero-avatar" :style="{ background: currentOC.gradient }">
					<image v-if="currentOC.avatar" :src="currentOC.avatar" class="hero-avatar-img" mode="aspectFill" />
					<text v-else class="hero-emoji">{{ currentOC.emoji }}</text>
				</view>
				<text class="hero-name">{{ currentOC.name }}</text>
				<text class="hero-title">{{ currentOC.title }} | Lv.{{ currentOC.level }}</text>
			</view>

			<!-- 图片素材区 -->
			<view class="media-section">
				<view class="section-header">
					<text class="section-icon">🖼️</text>
					<text class="section-title">{{ tt('图片素材') }}</text>
					<text class="section-hint">{{ tt('可作为角色参考图') }}</text>
				</view>
				<view class="image-grid">
					<view v-for="(img, idx) in (currentOC.images || [])" :key="img.id" class="image-item"
						@click="previewImage(resolveMediaSrc(img))">
						<image
							v-if="resolveMediaSrc(img) && !brokenImages.has(img.id)"
							:src="resolveMediaSrc(img)"
							mode="aspectFill"
							class="grid-img"
							@error="markImageBroken(img.id)"
						/>
						<view v-else class="grid-img grid-img-placeholder">
							<text class="grid-img-placeholder-icon">🖼️</text>
							<text class="grid-img-placeholder-text">{{ tt('图片不可用') }}</text>
						</view>
						<view class="img-del" @click.stop="deleteImage(img.id)"><text class="del-x">×</text></view>
					</view>
					<view class="image-add" @click="addImage">
						<text class="add-icon">+</text>
						<text class="add-text">{{ tt('上传图片') }}</text>
					</view>
				</view>
			</view>

			<!-- 视频素材区 -->
			<view class="media-section">
				<view class="section-header">
					<text class="section-icon">🎬</text>
					<text class="section-title">{{ tt('视频素材') }}</text>
					<text class="section-hint">{{ tt('角色动态参考') }}</text>
				</view>
				<view class="video-list">
					<view v-for="vid in (currentOC.videos || [])" :key="vid.id" class="video-item">
						<video
							v-if="resolveMediaSrc(vid) && !brokenVideos.has(vid.id)"
							:src="resolveMediaSrc(vid)"
							class="video-player"
							controls
							:show-fullscreen-btn="true"
							object-fit="cover"
							@error="markVideoBroken(vid.id)"
						></video>
						<view v-else class="video-player video-placeholder">
							<text class="video-placeholder-icon">🎬</text>
							<text class="video-placeholder-text">{{ tt('视频不可用') }}</text>
						</view>
						<view class="video-del" @click="deleteVideo(vid.id)"><text class="del-x">×</text></view>
					</view>
					<view class="video-add" @click="addVideo">
						<text class="add-icon">+</text>
						<text class="add-text">{{ tt('上传视频') }}</text>
					</view>
				</view>
			</view>

			<!-- 底部提示 -->
			<view class="tip-section">
				<text class="tip-text">{{ tt('上传的图片和视频可作为角色立绘、表情包等生成的参考素材') }}</text>
			</view>

			<view style="height: 120rpx;"></view>
		</scroll-view>

		<!-- 空状态 -->
		<view class="empty-state" v-if="!currentOC">
			<text class="empty-emoji">📂</text>
			<text class="empty-title">{{ tt('还没有 OC 角色') }}</text>
			<text class="empty-desc">{{ tt('先去编辑器创建角色，再来管理档案吧') }}</text>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getOCList } from '../../utils/store.js'
import { deleteOCMedia, getOCMedia, uploadOCImage, uploadOCVideo } from '../../utils/apis/media.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt, formatI18nText } = useI18n()
const ocList = ref([])
const selectedOCId = ref(null)
const mediaMap = ref({})
const brokenImages = ref(new Set())
const brokenVideos = ref(new Set())

const currentOC = computed(() => {
	const oc = ocList.value.find(item => item.id === selectedOCId.value)
	if (!oc) return null
	const media = mediaMap.value[oc.id] || { images: [], videos: [] }
	return {
		...oc,
		images: media.images || [],
		videos: media.videos || []
	}
})

async function loadData() {
	ocList.value = getOCList()
	if (ocList.value.length > 0) {
		if (!selectedOCId.value || !ocList.value.find(o => o.id === selectedOCId.value)) {
			selectedOCId.value = ocList.value[0].id
		}
		await loadOCMedia(selectedOCId.value)
		return
	}
	mediaMap.value = {}
}

onMounted(loadData)
onShow(loadData)

async function selectOC(id) {
	selectedOCId.value = id
	await loadOCMedia(id)
}

async function loadOCMedia(ocId) {
	if (!ocId) return
	try {
		const media = await getOCMedia(ocId)
		mediaMap.value = {
			...mediaMap.value,
			[ocId]: {
				images: media.images || [],
				videos: media.videos || []
			}
		}
	} catch (error) {
		mediaMap.value = {
			...mediaMap.value,
			[ocId]: {
				images: [],
				videos: []
			}
		}
		uni.showToast({ title: tt(error.message || '加载素材失败'), icon: 'none' })
	}
}

function getImageInfo(path) {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src: path,
			success: resolve,
			fail: reject
		})
	})
}

function getVideoMimeType(path) {
	const ext = (path.split('.').pop() || '').toLowerCase()
	const mimeMap = {
		mp4: 'video/mp4',
		mov: 'video/quicktime',
		m4v: 'video/x-m4v',
		webm: 'video/webm',
		avi: 'video/x-msvideo',
		mkv: 'video/x-matroska'
	}
	return mimeMap[ext] || 'video/mp4'
}

function resolveMediaSrc(item) {
	const raw = item?.path || item?.url || item?.src || item?.thumbnail || ''
	if (!raw) return ''
	if (/^https?:\/\//i.test(raw)) return raw
	return raw
}

function markImageBroken(id) {
	brokenImages.value = new Set([...brokenImages.value, id])
}

function markVideoBroken(id) {
	brokenVideos.value = new Set([...brokenVideos.value, id])
}

function addImage() {
	if (!selectedOCId.value) return
	const remaining = Math.max(0, 9 - (currentOC.value?.images?.length || 0))
	if (remaining <= 0) {
		uni.showToast({ title: tt('最多上传 9 张图片'), icon: 'none' })
		return
	}
	uni.chooseImage({
		count: remaining,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			let successCount = 0
			let failCount = 0
			uni.showLoading({ title: tt('上传中'), mask: true })
			try {
				for (const path of res.tempFilePaths) {
					try {
						const info = await getImageInfo(path)
						await uploadOCImage(selectedOCId.value, {
							filePath: path,
							mimeType: info.type ? `image/${String(info.type).toLowerCase()}` : '',
							width: info.width,
							height: info.height
						})
						successCount += 1
					} catch (error) {
						failCount += 1
					}
				}
				await loadOCMedia(selectedOCId.value)
			} finally {
				uni.hideLoading()
			}
			if (successCount > 0) {
				uni.showToast({
					title: failCount > 0 ? formatI18nText('已上传 {count} 张', { count: successCount }) : tt('图片上传成功'),
					icon: 'none'
				})
				return
			}
			uni.showToast({ title: tt('图片上传失败'), icon: 'none' })
		}
	})
}

function deleteImage(imageId) {
	uni.showModal({
		title: tt('删除图片'),
		content: tt('确定删除这张图片？'),
		success: async (res) => {
			if (res.confirm) {
				try {
					await deleteOCMedia(selectedOCId.value, imageId)
					await loadOCMedia(selectedOCId.value)
					uni.showToast({ title: tt('图片已删除'), icon: 'none' })
				} catch (error) {
					uni.showToast({ title: tt(error.message || '删除失败'), icon: 'none' })
				}
			}
		}
	})
}

function addVideo() {
	if (!selectedOCId.value) return
	uni.chooseVideo({
		sourceType: ['album', 'camera'],
		compressed: true,
		maxDuration: 60,
		success: async (res) => {
			uni.showLoading({ title: tt('上传中'), mask: true })
			try {
				await uploadOCVideo(selectedOCId.value, {
					filePath: res.tempFilePath,
					mimeType: getVideoMimeType(res.tempFilePath),
					width: res.width,
					height: res.height,
					duration: res.duration
				})
				await loadOCMedia(selectedOCId.value)
				uni.showToast({ title: tt('视频上传成功'), icon: 'none' })
			} catch (error) {
				uni.showToast({ title: tt(error.message || '视频上传失败'), icon: 'none' })
			} finally {
				uni.hideLoading()
			}
		}
	})
}

function deleteVideo(videoId) {
	uni.showModal({
		title: tt('删除视频'),
		content: tt('确定删除这个视频？'),
		success: async (res) => {
			if (res.confirm) {
				try {
					await deleteOCMedia(selectedOCId.value, videoId)
					await loadOCMedia(selectedOCId.value)
					uni.showToast({ title: tt('视频已删除'), icon: 'none' })
				} catch (error) {
					uni.showToast({ title: tt(error.message || '删除失败'), icon: 'none' })
				}
			}
		}
	})
}

function previewImage(src) {
	const urls = (currentOC.value?.images || [])
		.map(i => resolveMediaSrc(i))
		.filter(Boolean)
	uni.previewImage({ urls, current: src || urls[0] || '' })
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); }

.nav-bar { position: relative; display: flex; align-items: center; justify-content: center; padding-bottom: 20rpx; background: rgba(237,231,246,0.95); backdrop-filter: blur(28px) saturate(1.5); border-bottom: 2rpx solid transparent; border-image: linear-gradient(90deg, rgba(167,139,250,0.01), rgba(192,132,252,0.18), rgba(167,139,250,0.01)) 1; }
.nav-left { position: absolute; left: 24rpx; bottom: 20rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.nav-right { position: absolute; right: 24rpx; bottom: 20rpx; }
.back-icon { font-size: 48rpx; color: #a78bfa; font-weight: 300; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #374151; margin-top: 20rpx; letter-spacing: 2rpx; }

/* OC 选择器 */
.oc-selector { padding: 16rpx 24rpx; }
.oc-chips { display: inline-flex; gap: 16rpx; white-space: nowrap; }
.oc-chip { display: inline-flex; align-items: center; gap: 10rpx; padding: 12rpx 24rpx; background: rgba(255,255,255,0.6); border-radius: 28rpx; border: 2rpx solid rgba(255,255,255,0.8); flex-shrink: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.oc-chip.active { background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.3); box-shadow: 0 4rpx 16rpx rgba(192,132,252,0.2); }
.chip-avatar { width: 40rpx; height: 40rpx; border-radius: 50%; }
.chip-emoji { font-size: 28rpx; }
.chip-name { font-size: 24rpx; color: #6b7280; font-weight: 600; }
.oc-chip.active .chip-name { color: #a78bfa; }

.content { height: calc(100vh - 120rpx); padding: 0 28rpx; }

/* 头像区域 */
.profile-hero { display: flex; flex-direction: column; align-items: center; padding: 36rpx 0; }
.hero-avatar { width: 200rpx; height: 200rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 24rpx rgba(167,139,250,0.15), 0 16rpx 48rpx rgba(192,132,252,0.2), 0 24rpx 64rpx rgba(167,139,250,0.1); overflow: hidden; }
.hero-avatar-img { width: 200rpx; height: 200rpx; }
.hero-emoji { font-size: 96rpx; }
.hero-name { font-size: 38rpx; font-weight: 800; color: #374151; margin-top: 20rpx; letter-spacing: 2rpx; }
.hero-title { font-size: 24rpx; color: #9ca3af; margin-top: 8rpx; letter-spacing: 2rpx; }

/* 素材区域 */
.media-section { margin-top: 28rpx; background: rgba(255,255,255,0.75); backdrop-filter: blur(20px) saturate(1.3); border-radius: 28rpx; padding: 28rpx; border: 2rpx solid rgba(255,255,255,0.8); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 8rpx 24rpx rgba(167,139,250,0.06), 0 16rpx 40rpx rgba(192,132,252,0.04); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.section-header { display: flex; align-items: center; margin-bottom: 24rpx; }
.section-icon { font-size: 32rpx; margin-right: 10rpx; }
.section-title { font-size: 30rpx; font-weight: 700; color: #374151; letter-spacing: 2rpx; }
.section-hint { font-size: 22rpx; color: #9ca3af; margin-left: auto; }

/* 图片网格 */
.image-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-item { position: relative; width: calc(33.33% - 12rpx); padding-bottom: calc(33.33% - 12rpx); height: 0; border-radius: 20rpx; overflow: hidden; }
.grid-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.grid-img-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(192,132,252,0.08), rgba(244,114,182,0.08)); }
.grid-img-placeholder-icon { font-size: 42rpx; }
.grid-img-placeholder-text { font-size: 20rpx; color: #a78bfa; margin-top: 8rpx; }
.img-del { position: absolute; top: 8rpx; right: 8rpx; width: 40rpx; height: 40rpx; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2; }
.del-x { font-size: 28rpx; color: #fff; }
.image-add { width: calc(33.33% - 12rpx); padding-bottom: calc(33.33% - 12rpx); height: 0; border-radius: 20rpx; border: 2rpx dashed rgba(167,139,250,0.3); position: relative; background: rgba(167,139,250,0.04); }
.image-add .add-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -70%); font-size: 48rpx; color: #a78bfa; }
.image-add .add-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, 30%); font-size: 22rpx; color: #a78bfa; white-space: nowrap; }

/* 视频列表 */
.video-list { display: flex; flex-direction: column; gap: 20rpx; }
.video-item { position: relative; border-radius: 24rpx; overflow: hidden; }
.video-player { width: 100%; height: 360rpx; border-radius: 24rpx; background: #000; }
.video-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(17,24,39,0.8), rgba(88,28,135,0.7)); }
.video-placeholder-icon { font-size: 48rpx; color: #fff; }
.video-placeholder-text { font-size: 22rpx; color: rgba(255,255,255,0.85); margin-top: 8rpx; }
.video-del { position: absolute; top: 12rpx; right: 12rpx; width: 48rpx; height: 48rpx; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10; }
.video-add { border-radius: 24rpx; border: 2rpx dashed rgba(167,139,250,0.3); padding: 40rpx; display: flex; flex-direction: column; align-items: center; background: rgba(167,139,250,0.04); }

/* 提示 */
.tip-section { text-align: center; padding: 36rpx 40rpx; }
.tip-text { font-size: 24rpx; color: #9ca3af; line-height: 1.6; letter-spacing: 1rpx; }

/* 空状态 */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 200rpx 60rpx; }
.empty-emoji { font-size: 112rpx; margin-bottom: 28rpx; }
.empty-title { font-size: 36rpx; font-weight: 700; color: #374151; margin-bottom: 16rpx; letter-spacing: 2rpx; }
.empty-desc { font-size: 28rpx; color: #9ca3af; text-align: center; letter-spacing: 1rpx; line-height: 1.6; }
</style>
