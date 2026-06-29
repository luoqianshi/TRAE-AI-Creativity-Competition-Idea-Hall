<template>
	<view class="page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack"><text class="back-icon">‹</text></view>
			<text class="nav-title">{{ t('page.watermark') }}</text>
			<view class="nav-right"><LangSwitch /></view>
		</view>

		<scroll-view scroll-y class="content">
			<!-- 选择图片 -->
			<view class="section">
				<text class="section-title">{{ tt('选择图片') }}</text>
				<view class="image-grid">
					<view v-for="(img, idx) in imageList" :key="idx" class="image-item">
						<image :src="img.path" class="thumb-img" mode="aspectFill" />
						<view class="remove-btn" @click="removeImage(idx)"><text class="remove-text">×</text></view>
					</view>
					<view class="image-add" @click="chooseImages" v-if="imageList.length < 9">
						<text class="add-icon">+</text>
						<text class="add-hint">{{ imageList.length > 0 ? imageList.length + '/9' : tt('添加图片') }}</text>
					</view>
				</view>
			</view>

			<!-- 水印类型 -->
			<view class="section">
				<text class="section-title">{{ tt('水印类型') }}</text>
				<view class="type-tabs">
					<view class="type-tab" :class="{ active: watermarkType === 'text' }" @click="watermarkType = 'text'">
						<text class="type-icon">🔤</text>
						<text class="type-label">{{ tt('文字水印') }}</text>
					</view>
					<view class="type-tab" :class="{ active: watermarkType === 'image' }" @click="watermarkType = 'image'">
						<text class="type-icon">🖼️</text>
						<text class="type-label">{{ tt('图片水印') }}</text>
					</view>
				</view>
			</view>

			<!-- 文字水印设置 -->
			<view class="section" v-if="watermarkType === 'text'">
				<text class="section-title">{{ tt('文字设置') }}</text>
				<view class="setting-card">
					<view class="input-group">
						<text class="input-label">{{ tt('水印内容') }}</text>
						<view class="glass-input"><input v-model="textConfig.content" :placeholder="tt('输入水印文字...')" maxlength="30" /></view>
					</view>
					<view class="input-group">
						<text class="input-label">{{ tt('字体大小') }} · {{ textConfig.fontSize }}</text>
						<slider :value="textConfig.fontSize" :min="12" :max="48" :step="2" activeColor="#a78bfa" @change="e => textConfig.fontSize = e.detail.value" />
					</view>
					<view class="input-group">
						<text class="input-label">{{ tt('水印颜色') }}</text>
						<view class="color-list">
							<view v-for="(c, i) in colorOptions" :key="i" class="color-dot"
								:class="{ active: textConfig.color === c }"
								:style="{ background: c }" @click="textConfig.color = c">
								<text class="color-check" v-if="textConfig.color === c">✓</text>
							</view>
						</view>
					</view>
					<view class="input-group">
						<text class="input-label">{{ tt('透明度') }} · {{ Math.round(textConfig.opacity * 100) }}%</text>
						<slider :value="textConfig.opacity * 100" :min="10" :max="100" :step="5" activeColor="#a78bfa" @change="e => textConfig.opacity = e.detail.value / 100" />
					</view>
				</view>
			</view>

			<!-- 图片水印设置 -->
			<view class="section" v-if="watermarkType === 'image'">
				<text class="section-title">{{ tt('图片水印设置') }}</text>
				<view class="setting-card">
					<view class="wm-image-pick" @click="chooseWmImage">
						<image v-if="imageConfig.path" :src="imageConfig.path" class="wm-preview-img" mode="aspectFit" />
						<view v-else class="wm-placeholder">
							<text class="wm-placeholder-icon">+</text>
							<text class="wm-placeholder-text">{{ tt('选择水印图片') }}</text>
						</view>
					</view>
					<view class="input-group">
						<text class="input-label">{{ tt('缩放') }} · {{ imageConfig.scale.toFixed(1) }}x</text>
						<slider :value="imageConfig.scale * 100" :min="20" :max="200" :step="10" activeColor="#a78bfa" @change="e => imageConfig.scale = e.detail.value / 100" />
					</view>
					<view class="input-group">
						<text class="input-label">{{ tt('透明度') }} · {{ Math.round(imageConfig.opacity * 100) }}%</text>
						<slider :value="imageConfig.opacity * 100" :min="10" :max="100" :step="5" activeColor="#a78bfa" @change="e => imageConfig.opacity = e.detail.value / 100" />
					</view>
				</view>
			</view>

			<!-- 水印模式 -->
			<view class="section">
				<text class="section-title">{{ tt('水印模式') }}</text>
				<view class="type-tabs">
					<view class="type-tab" :class="{ active: wmMode === 'tile' }" @click="wmMode = 'tile'">
						<text class="type-icon">🔲</text>
						<text class="type-label">{{ tt('全屏平铺') }}</text>
					</view>
					<view class="type-tab" :class="{ active: wmMode === 'fixed' }" @click="wmMode = 'fixed'">
						<text class="type-icon">📌</text>
						<text class="type-label">{{ tt('固定位置') }}</text>
					</view>
				</view>
			</view>

			<!-- 全屏平铺设置 -->
			<view class="section" v-if="wmMode === 'tile'">
				<text class="section-title">{{ tt('平铺设置') }}</text>
				<view class="setting-card">
					<view class="input-group">
						<text class="input-label">{{ tt('旋转角度') }} · {{ tileConfig.angle }}°</text>
						<slider :value="tileConfig.angle + 90" :min="0" :max="180" :step="5" activeColor="#a78bfa" @change="e => tileConfig.angle = e.detail.value - 90" />
					</view>
					<view class="input-group">
						<text class="input-label">{{ tt('间距') }}</text>
						<view class="spacing-options">
							<view v-for="(s, i) in spacingOptions" :key="i" class="spacing-opt"
								:class="{ active: tileConfig.spacing === s.value }" @click="tileConfig.spacing = s.value">
								<text class="spacing-label">{{ s.label }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 固定位置设置 -->
			<view class="section" v-if="wmMode === 'fixed'">
				<text class="section-title">{{ tt('水印位置') }}</text>
				<view class="setting-card">
					<view class="position-grid">
						<view v-for="(pos, i) in positionOptions" :key="i" class="position-cell"
							:class="{ active: fixedPosition === pos.value }" @click="fixedPosition = pos.value">
							<text class="position-dot">{{ fixedPosition === pos.value ? '●' : '○' }}</text>
							<text class="position-name">{{ pos.label }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 预览 -->
			<view class="section" v-if="imageList.length > 0">
				<text class="section-title">{{ tt('预览效果') }}</text>
				<view class="preview-card">
					<canvas canvas-id="previewCanvas" id="previewCanvas" class="preview-canvas"
						:style="{ width: previewWidth + 'rpx', height: previewHeight + 'rpx' }"></canvas>
				</view>
				<view class="preview-btn" @click="refreshPreview"><text class="preview-btn-text">{{ tt('刷新预览') }}</text></view>
			</view>

			<!-- 处理按钮 -->
			<view class="gen-btn" :class="{ disabled: !canProcess }" @click="startProcess">
		<text class="gen-btn-text">{{ processing ? tt('处理中...') : formatI18nText('开始处理 ({count} 张)', { count: imageList.length }) }}</text>
			</view>

			<!-- 进度 -->
			<view class="progress-section" v-if="processing">
				<view class="progress-bar-wrap">
					<view class="progress-fill" :style="{ width: processProgress + '%' }"></view>
				</view>
				<text class="progress-text">{{ processedCount }} / {{ imageList.length }}</text>
			</view>

			<!-- 处理结果 -->
			<view class="result-section" v-if="resultList.length > 0 && !processing">
				<text class="section-title">{{ tt('处理完成') }}</text>
				<view class="result-grid">
					<view v-for="(r, idx) in resultList" :key="idx" class="result-item" @click="previewResult(r)">
						<image :src="r" class="result-img" mode="aspectFill" />
					</view>
				</view>
				<view class="result-actions">
					<view class="action-btn save-btn" @click="saveAll">
						<text class="action-icon">💾</text>
						<text class="action-text">{{ tt('全部保存到相册') }}</text>
					</view>
				</view>
			</view>

			<!-- 预设 -->
			<view class="section" v-if="presets.length > 0">
				<text class="section-title">{{ tt('历史预设') }}</text>
				<view class="preset-list">
					<view v-for="(p, i) in presets" :key="i" class="preset-item" @click="applyPreset(p)">
						<view class="preset-icon-wrap"><text class="preset-icon">{{ p.type === 'text' ? '🔤' : '🖼️' }}</text></view>
						<view class="preset-info">
							<text class="preset-name">{{ p.type === 'text' ? tt(p.textContent) : tt('图片水印') }}</text>
							<text class="preset-desc">{{ p.mode === 'tile' ? tt('全屏平铺') : tt('固定位置') }} · {{ Math.round(p.opacity * 100) }}%</text>
						</view>
						<view class="preset-del" @click.stop="removePreset(i)"><text class="preset-del-text">×</text></view>
					</view>
				</view>
			</view>

			<!-- 离屏处理 Canvas -->
			<canvas canvas-id="processCanvas" id="processCanvas" class="offscreen-canvas"
				:style="{ width: canvasW + 'px', height: canvasH + 'px' }"></canvas>

			<view style="height: 120rpx;"></view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, reactive, nextTick, computed, onMounted } from 'vue'
import { request } from '../../utils/api.js'
import { getWatermarkPresets, saveWatermarkPresets, isLoggedIn } from '../../utils/store.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n, formatI18nText } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()
const WATERMARK_PRESET_API = '/watermarks/presets'
const MAX_PRESETS = 5

// --- 图片列表 ---
const imageList = ref([]) // [{ path, width, height }]

function chooseImages() {
	const remaining = 9 - imageList.value.length
	if (remaining <= 0) return
	uni.chooseImage({
		count: remaining,
		sizeType: ['original'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			const promises = res.tempFilePaths.map(path => {
				return new Promise(resolve => {
					uni.getImageInfo({
						src: path,
						success: info => resolve({ path, width: info.width, height: info.height }),
						fail: () => resolve({ path, width: 800, height: 600 })
					})
				})
			})
			Promise.all(promises).then(imgs => {
				imageList.value = imageList.value.concat(imgs).slice(0, 9)
			})
		}
	})
}

function removeImage(idx) {
	imageList.value.splice(idx, 1)
	resultList.value = []
}

// --- 水印类型 ---
const watermarkType = ref('text')

// --- 文字设置 ---
const textConfig = reactive({
	content: '',
	fontSize: 24,
	color: 'rgba(255,255,255,0.8)',
	opacity: 0.3,
})

const colorOptions = [
	'rgba(255,255,255,0.8)', 'rgba(0,0,0,0.8)',
	'#a78bfa', '#FFB6C1', '#38bdf8', '#34d399', '#f59e0b', '#ef4444',
]

// --- 图片水印设置 ---
const imageConfig = reactive({
	path: '',
	width: 0,
	height: 0,
	scale: 0.5,
	opacity: 0.3,
})

function chooseWmImage() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album'],
		success: (res) => {
			const p = res.tempFilePaths[0]
			uni.getImageInfo({
				src: p,
				success: info => {
					imageConfig.path = p
					imageConfig.width = info.width
					imageConfig.height = info.height
				},
				fail: () => {
					imageConfig.path = p
					imageConfig.width = 200
					imageConfig.height = 200
				}
			})
		}
	})
}

// --- 水印模式 ---
const wmMode = ref('tile')

// --- 全屏平铺设置 ---
const tileConfig = reactive({
	angle: -45,
	spacing: 'medium',
})

const spacingOptions = computed(() => [
	{ label: tt('密集'), value: 'dense' },
	{ label: tt('适中'), value: 'medium' },
	{ label: tt('稀疏'), value: 'sparse' },
])

// --- 固定位置 ---
const fixedPosition = ref('bottom-right')

const positionOptions = computed(() => [
	{ label: tt('左上'), value: 'top-left' },
	{ label: tt('中上'), value: 'top-center' },
	{ label: tt('右上'), value: 'top-right' },
	{ label: tt('左中'), value: 'center-left' },
	{ label: tt('居中'), value: 'center' },
	{ label: tt('右中'), value: 'center-right' },
	{ label: tt('左下'), value: 'bottom-left' },
	{ label: tt('中下'), value: 'bottom-center' },
	{ label: tt('右下'), value: 'bottom-right' },
])

// --- 预览 ---
const previewHeight = ref(620)
const previewWidth = ref(620)

function refreshPreview() {
	if (!imageList.value.length) return
	const img = imageList.value[0]
	const maxW = 310 // 预览 canvas 最大宽度 (620rpx / 2)
	const maxH = 400 // 预览 canvas 最大高度
	const ratio = img.width / img.height

	let drawW, drawH
	if (ratio >= maxW / maxH) {
		// 横图或方图：宽度撑满
		drawW = maxW
		drawH = Math.round(maxW / ratio)
	} else {
		// 竖图：高度撑满
		drawH = maxH
		drawW = Math.round(maxH * ratio)
	}

	previewHeight.value = drawH * 2 // rpx = px * 2
	previewWidth.value = drawW * 2

	nextTick(() => {
		drawWatermark('previewCanvas', img, drawW, drawH)
	})
}

// --- Canvas 尺寸（离屏） ---
const canvasW = ref(10)
const canvasH = ref(10)

// --- 核心绘制函数 ---
function drawWatermark(canvasId, img, w, h) {
	return new Promise((resolve) => {
		const ctx = uni.createCanvasContext(canvasId)
		ctx.clearRect(0, 0, w, h)
		ctx.drawImage(img.path, 0, 0, w, h)

		if (watermarkType.value === 'text') {
			drawTextWatermark(ctx, w, h)
		} else {
			drawImageWatermark(ctx, w, h, resolve)
			return
		}
		ctx.draw(false, () => {
			setTimeout(() => resolve(), 100)
		})
	})
}

function drawTextWatermark(ctx, w, h) {
	const text = textConfig.content || tt('水印')
	const fontSize = Math.max(10, textConfig.fontSize * (w / 500))
	ctx.setFontSize(fontSize)
	ctx.setFillStyle(textConfig.color)
	ctx.setGlobalAlpha(textConfig.opacity)
	ctx.setTextAlign('center')

	if (wmMode.value === 'tile') {
		const gap = { dense: 1.8, medium: 3, sparse: 5 }[tileConfig.spacing] || 3
		const textW = fontSize * text.length * 0.6
		const stepX = Math.max(textW + fontSize * 2, textW * gap)
		const stepY = Math.max(fontSize * 3, fontSize * gap * 1.5)
		const angle = tileConfig.angle * Math.PI / 180
		const diagonal = Math.sqrt(w * w + h * h)

		for (let y = -diagonal; y < diagonal * 2; y += stepY) {
			for (let x = -diagonal; x < diagonal * 2; x += stepX) {
				ctx.save()
				ctx.translate(x, y)
				ctx.rotate(angle)
				ctx.fillText(text, 0, 0)
				ctx.restore()
			}
		}
	} else {
		const pos = getFixedXY(w, h, fontSize * text.length * 0.6, fontSize)
		ctx.fillText(text, pos.x, pos.y)
	}
	ctx.setGlobalAlpha(1)
}

function drawImageWatermark(ctx, w, h, resolve) {
	if (!imageConfig.path) {
		ctx.draw(false, () => setTimeout(() => resolve(), 100))
		return
	}
	const wmW = imageConfig.width * imageConfig.scale * (w / 500)
	const wmH = imageConfig.height * imageConfig.scale * (w / 500)
	ctx.setGlobalAlpha(imageConfig.opacity)

	if (wmMode.value === 'tile') {
		const gap = { dense: 1.5, medium: 2.5, sparse: 4 }[tileConfig.spacing] || 2.5
		const stepX = Math.max(wmW * 1.5, wmW * gap)
		const stepY = Math.max(wmH * 1.5, wmH * gap)
		const angle = tileConfig.angle * Math.PI / 180
		const diagonal = Math.sqrt(w * w + h * h)

		for (let y = -diagonal; y < diagonal * 2; y += stepY) {
			for (let x = -diagonal; x < diagonal * 2; x += stepX) {
				ctx.save()
				ctx.translate(x, y)
				ctx.rotate(angle)
				ctx.drawImage(imageConfig.path, -wmW / 2, -wmH / 2, wmW, wmH)
				ctx.restore()
			}
		}
	} else {
		const pos = getFixedXY(w, h, wmW, wmH)
		ctx.drawImage(imageConfig.path, pos.x - wmW / 2, pos.y - wmH / 2, wmW, wmH)
	}
	ctx.setGlobalAlpha(1)
	ctx.draw(false, () => setTimeout(() => resolve(), 100))
}

function getFixedXY(w, h, objW, objH) {
	const margin = 20
	const positions = {
		'top-left': { x: margin + objW / 2, y: margin + objH / 2 },
		'top-center': { x: w / 2, y: margin + objH / 2 },
		'top-right': { x: w - margin - objW / 2, y: margin + objH / 2 },
		'center-left': { x: margin + objW / 2, y: h / 2 },
		'center': { x: w / 2, y: h / 2 },
		'center-right': { x: w - margin - objW / 2, y: h / 2 },
		'bottom-left': { x: margin + objW / 2, y: h - margin - objH / 2 },
		'bottom-center': { x: w / 2, y: h - margin - objH / 2 },
		'bottom-right': { x: w - margin - objW / 2, y: h - margin - objH / 2 },
	}
	return positions[fixedPosition.value] || positions['bottom-right']
}

// --- 批量处理 ---
const processing = ref(false)
const processProgress = ref(0)
const processedCount = ref(0)
const resultList = ref([])

const canProcess = computed(() => {
	if (imageList.value.length === 0) return false
	if (processing.value) return false
	if (watermarkType.value === 'text' && !textConfig.content) return false
	if (watermarkType.value === 'image' && !imageConfig.path) return false
	return true
})

async function startProcess() {
	if (!canProcess.value) {
		if (imageList.value.length === 0) uni.showToast({ title: tt('请先选择图片'), icon: 'none' })
		else if (watermarkType.value === 'text' && !textConfig.content) uni.showToast({ title: tt('请输入水印文字'), icon: 'none' })
		else if (watermarkType.value === 'image' && !imageConfig.path) uni.showToast({ title: tt('请选择水印图片'), icon: 'none' })
		return
	}

	processing.value = true
	processedCount.value = 0
	processProgress.value = 0
	resultList.value = []

	await saveCurrentPreset()

	for (let i = 0; i < imageList.value.length; i++) {
		const img = imageList.value[i]
		canvasW.value = img.width
		canvasH.value = img.height

		await nextTick()
		await new Promise(r => setTimeout(r, 50))

		await drawWatermark('processCanvas', img, img.width, img.height)

		const tempPath = await new Promise((resolve, reject) => {
			uni.canvasToTempFilePath({
				canvasId: 'processCanvas',
				width: img.width,
				height: img.height,
				destWidth: img.width,
				destHeight: img.height,
				success: res => resolve(res.tempFilePath),
				fail: err => reject(err)
			})
		}).catch(() => null)

		if (tempPath) resultList.value.push(tempPath)
		processedCount.value = i + 1
		processProgress.value = Math.round(((i + 1) / imageList.value.length) * 100)
	}

	processing.value = false
	uni.showToast({ title: formatI18nText('处理完成 {count} 张', { count: resultList.value.length }), icon: 'none' })
}

// --- 保存 ---
function saveAll() {
	let saved = 0
	let failed = 0
	const total = resultList.value.length
	resultList.value.forEach(path => {
		uni.saveImageToPhotosAlbum({
			filePath: path,
			success: () => { saved++; if (saved + failed === total) uni.showToast({ title: formatI18nText('已保存 {saved} 张到相册', { saved }), icon: 'success' }) },
			fail: () => { failed++; if (saved + failed === total) uni.showToast({ title: formatI18nText('保存 {saved} 张，{failed} 张失败', { saved, failed }), icon: 'none' }) }
		})
	})
}

function previewResult(path) {
	uni.previewImage({ urls: resultList.value, current: path })
}

// --- 预设 ---
const presets = ref([])

function normalizePreset(raw = {}) {
	return {
		type: raw.type === 'image' ? 'image' : 'text',
		mode: raw.mode === 'fixed' ? 'fixed' : 'tile',
		textContent: raw.textContent ?? raw.text_content ?? '',
		fontSize: Number(raw.fontSize ?? raw.font_size ?? 24),
		color: raw.color || 'rgba(255,255,255,0.8)',
		opacity: Number(raw.opacity ?? 0.3),
		angle: Number(raw.angle ?? -45),
		spacing: raw.spacing || 'medium',
		position: raw.position || 'bottom-right',
		scale: Number(raw.scale ?? 0.5),
		time: raw.time || (raw.updated_at ? new Date(raw.updated_at).getTime() : Date.now()),
	}
}

function normalizePresetList(list = []) {
	return (Array.isArray(list) ? list : [])
		.map(normalizePreset)
		.filter(item => item.type === 'image' || !!item.textContent)
		.slice(0, MAX_PRESETS)
}

function toPresetPayload(preset) {
	const normalized = normalizePreset(preset)
	return {
		type: normalized.type,
		mode: normalized.mode,
		text_content: normalized.type === 'text' ? normalized.textContent : null,
		font_size: normalized.fontSize,
		color: normalized.color,
		opacity: normalized.opacity,
		angle: normalized.angle,
		spacing: normalized.spacing,
		position: normalized.position,
		scale: normalized.scale,
	}
}

function extractPresetList(response) {
	return normalizePresetList(Array.isArray(response?.data) ? response.data : [])
}

async function syncPresetList(nextList, { silent = false } = {}) {
	const normalized = normalizePresetList(nextList)
	presets.value = normalized
	saveWatermarkPresets(normalized)

	if (!isLoggedIn()) return normalized

	try {
		const response = await request({
			url: WATERMARK_PRESET_API,
			method: 'PUT',
			data: { presets: normalized.map(toPresetPayload) },
			auth: true,
		})
		const synced = extractPresetList(response)
		presets.value = synced
		saveWatermarkPresets(synced)
		return synced
	} catch (error) {
		if (!silent) {
			uni.showToast({ title: error.message || tt('预设仅保存在本地'), icon: 'none' })
		}
		return normalized
	}
}

async function loadPresetList() {
	const localPresets = normalizePresetList(getWatermarkPresets())
	presets.value = localPresets

	if (!isLoggedIn()) return

	try {
		const response = await request({ url: WATERMARK_PRESET_API, auth: true })
		const remotePresets = extractPresetList(response)
		if (remotePresets.length > 0) {
			presets.value = remotePresets
			saveWatermarkPresets(remotePresets)
			return
		}
		if (localPresets.length > 0) {
			await syncPresetList(localPresets, { silent: true })
		}
	} catch (error) {
		// keep local cache as silent fallback
	}
}

onMounted(() => {
	loadPresetList()
})

async function saveCurrentPreset() {
	const preset = {
		type: watermarkType.value,
		mode: wmMode.value,
		textContent: textConfig.content,
		fontSize: textConfig.fontSize,
		color: textConfig.color,
		opacity: watermarkType.value === 'text' ? textConfig.opacity : imageConfig.opacity,
		angle: tileConfig.angle,
		spacing: tileConfig.spacing,
		position: fixedPosition.value,
		scale: imageConfig.scale,
		time: Date.now(),
	}
	const list = presets.value.filter(p => !(p.type === preset.type && p.textContent === preset.textContent && p.mode === preset.mode))
	list.unshift(preset)
	if (list.length > MAX_PRESETS) list.length = MAX_PRESETS
	await syncPresetList(list, { silent: true })
}

function applyPreset(p) {
	watermarkType.value = p.type
	wmMode.value = p.mode
	if (p.type === 'text') {
		textConfig.content = p.textContent || ''
		textConfig.fontSize = p.fontSize || 24
		textConfig.color = p.color || 'rgba(255,255,255,0.8)'
		textConfig.opacity = p.opacity || 0.3
	} else {
		imageConfig.opacity = p.opacity || 0.3
		imageConfig.scale = p.scale || 0.5
	}
	tileConfig.angle = p.angle ?? -45
	tileConfig.spacing = p.spacing || 'medium'
	fixedPosition.value = p.position || 'bottom-right'
	uni.showToast({ title: tt('已应用预设'), icon: 'none' })
}

async function removePreset(idx) {
	const nextList = presets.value.filter((_, index) => index !== idx)
	await syncPresetList(nextList)
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #F3EEFF 40%, #F5F0FF 70%, #FFF5F8 100%); }

.nav-bar { position: relative; display: flex; align-items: center; justify-content: center; padding-bottom: 16rpx; background: rgba(237,231,246,0.95); backdrop-filter: blur(28px) saturate(1.5); border-bottom: 2rpx solid transparent; border-image: linear-gradient(90deg, rgba(167,139,250,0.01), rgba(192,132,252,0.18), rgba(167,139,250,0.01)) 1; }
.nav-left { position: absolute; left: 20rpx; bottom: 16rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 56rpx; color: #c084fc; font-weight: 400; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #374151; margin-top: 20rpx; letter-spacing: 2rpx; }
.nav-right { position: absolute; right: 24rpx; bottom: 16rpx; }

.content { height: 100vh; padding: 0; }

.section { padding: 24rpx 30rpx 0; }
.section-title { font-size: 30rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 16rpx; letter-spacing: 2rpx; }

/* 图片选择 */
.image-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-item { width: 200rpx; height: 200rpx; border-radius: 24rpx; overflow: hidden; position: relative; }
.thumb-img { width: 100%; height: 100%; }
.remove-btn { position: absolute; top: 8rpx; right: 8rpx; width: 40rpx; height: 40rpx; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
.remove-text { color: #fff; font-size: 28rpx; font-weight: 700; }
.image-add { width: 200rpx; height: 200rpx; border-radius: 24rpx; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border: 3rpx dashed rgba(167,139,250,0.4); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.add-icon { font-size: 56rpx; color: #a78bfa; line-height: 1; }
.add-hint { font-size: 22rpx; color: #9ca3af; margin-top: 8rpx; }

/* 类型切换 */
.type-tabs { display: flex; gap: 20rpx; }
.type-tab { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 24rpx 0; background: rgba(255,255,255,0.7); border-radius: 28rpx; border: 2rpx solid rgba(255,182,193,0.15); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.type-tab.active { background: linear-gradient(135deg, rgba(255,182,193,0.18), rgba(167,139,250,0.15)); border-color: rgba(192,132,252,0.4); box-shadow: 0 4rpx 16rpx rgba(192,132,252,0.15); }
.type-icon { font-size: 36rpx; display: block; }
.type-label { font-size: 24rpx; font-weight: 600; color: #9ca3af; margin-top: 8rpx; }
.type-tab.active .type-label { color: #c084fc; }

/* 设置卡 */
.setting-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border-radius: 28rpx; padding: 24rpx; border: 2rpx solid rgba(255,182,193,0.2); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 8rpx 24rpx rgba(167,139,250,0.06), 0 16rpx 40rpx rgba(192,132,252,0.04); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.input-group { margin-bottom: 24rpx; }
.input-group:last-child { margin-bottom: 0; }
.input-label { font-size: 26rpx; font-weight: 600; color: #6b7280; margin-bottom: 12rpx; display: block; }
.glass-input { background: rgba(237,231,246,0.35); backdrop-filter: blur(20px) saturate(1.2); border-radius: 16rpx; padding: 20rpx 24rpx; border: 2rpx solid rgba(167,139,250,0.08); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.glass-input:focus-within { border-color: rgba(167,139,250,0.3); box-shadow: 0 0 0 6rpx rgba(167,139,250,0.08); }
.glass-input input { font-size: 28rpx; color: #374151; }

/* 颜色选择 */
.color-list { display: flex; gap: 20rpx; flex-wrap: wrap; }
.color-dot { width: 56rpx; height: 56rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3rpx solid rgba(0,0,0,0.06); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.color-dot.active { border-color: #a78bfa; box-shadow: 0 0 16rpx rgba(167,139,250,0.4); transform: scale(1.15); }
.color-check { font-size: 24rpx; color: #374151; font-weight: 700; }

/* 水印图片选择 */
.wm-image-pick { width: 100%; height: 200rpx; border-radius: 24rpx; overflow: hidden; margin-bottom: 24rpx; background: rgba(237,231,246,0.25); backdrop-filter: blur(20px) saturate(1.2); border: 3rpx dashed rgba(167,139,250,0.3); display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.wm-preview-img { width: 100%; height: 100%; }
.wm-placeholder { display: flex; flex-direction: column; align-items: center; }
.wm-placeholder-icon { font-size: 48rpx; color: #a78bfa; }
.wm-placeholder-text { font-size: 24rpx; color: #9ca3af; margin-top: 8rpx; }

/* 间距选择 */
.spacing-options { display: flex; gap: 16rpx; }
.spacing-opt { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 20rpx; background: rgba(0,0,0,0.03); border: 2rpx solid rgba(0,0,0,0.04); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.spacing-opt.active { background: linear-gradient(135deg, rgba(255,182,193,0.18), rgba(167,139,250,0.15)); border-color: rgba(192,132,252,0.4); box-shadow: 0 4rpx 12rpx rgba(192,132,252,0.12); }
.spacing-label { font-size: 26rpx; color: #6b7280; font-weight: 600; }
.spacing-opt.active .spacing-label { color: #c084fc; }

/* 9宫格位置 */
.position-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
.position-cell { text-align: center; padding: 20rpx 0; border-radius: 20rpx; background: rgba(0,0,0,0.03); border: 2rpx solid rgba(0,0,0,0.04); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.position-cell.active { background: linear-gradient(135deg, rgba(255,182,193,0.18), rgba(167,139,250,0.15)); border-color: rgba(192,132,252,0.4); box-shadow: 0 4rpx 12rpx rgba(192,132,252,0.12); }
.position-dot { font-size: 24rpx; color: #c084fc; display: block; }
.position-name { font-size: 22rpx; color: #6b7280; display: block; margin-top: 4rpx; }
.position-cell.active .position-name { color: #c084fc; font-weight: 600; }

/* 预览 */
.preview-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border-radius: 28rpx; overflow: hidden; border: 2rpx solid rgba(255,182,193,0.2); display: flex; align-items: center; justify-content: center; padding: 20rpx; box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 8rpx 24rpx rgba(167,139,250,0.06), 0 16rpx 40rpx rgba(192,132,252,0.04); }
.preview-canvas { border-radius: 20rpx; }
.preview-btn { margin-top: 16rpx; text-align: center; padding: 16rpx; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border-radius: 24rpx; border: 2rpx solid rgba(192,132,252,0.25); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.preview-btn:active { transform: scale(0.97); }
.preview-btn-text { font-size: 26rpx; color: #c084fc; font-weight: 600; }

/* 处理按钮 */
.gen-btn { margin: 30rpx 30rpx 0; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); border-radius: 40rpx; padding: 28rpx; text-align: center; box-shadow: 0 8rpx 32rpx rgba(192,132,252,0.35); position: relative; overflow: hidden; }
.gen-btn::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 40rpx 40rpx 0 0; }
.gen-btn:active { transform: scale(0.97); }
.gen-btn.disabled { opacity: 0.5; }
.gen-btn-text { font-size: 30rpx; color: #fff; font-weight: 700; letter-spacing: 4rpx; position: relative; z-index: 1; }

/* 进度 */
.progress-section { margin: 24rpx 30rpx 0; text-align: center; }
.progress-bar-wrap { width: 100%; height: 12rpx; background: rgba(192,132,252,0.12); border-radius: 6rpx; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #FFB6C1, #a78bfa); border-radius: 6rpx; transition: width 0.3s; }
.progress-text { font-size: 24rpx; color: #a78bfa; margin-top: 12rpx; display: block; }

/* 结果 */
.result-section { padding: 24rpx 30rpx 0; }
.result-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.result-item { width: 200rpx; height: 200rpx; border-radius: 24rpx; overflow: hidden; }
.result-img { width: 100%; height: 100%; }
.result-actions { margin-top: 20rpx; }
.action-btn { display: flex; align-items: center; justify-content: center; gap: 12rpx; padding: 24rpx; border-radius: 28rpx; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.action-btn:active { transform: scale(0.97); }
.save-btn { background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); box-shadow: 0 4rpx 20rpx rgba(192,132,252,0.3); position: relative; overflow: hidden; }
.save-btn::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 28rpx 28rpx 0 0; }
.save-btn .action-text { color: #fff; position: relative; z-index: 1; }
.action-icon { font-size: 32rpx; position: relative; z-index: 1; }
.action-text { font-size: 26rpx; font-weight: 600; }

/* 预设 */
.preset-list { display: flex; flex-direction: column; gap: 12rpx; }
.preset-item { display: flex; align-items: center; padding: 20rpx; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border-radius: 24rpx; border: 2rpx solid rgba(255,182,193,0.15); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 4rpx 16rpx rgba(167,139,250,0.05), 0 8rpx 24rpx rgba(192,132,252,0.03); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.preset-item:active { transform: scale(0.97); }
.preset-icon-wrap { width: 56rpx; height: 56rpx; border-radius: 16rpx; background: linear-gradient(135deg, rgba(255,182,193,0.2), rgba(167,139,250,0.15)); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.preset-icon { font-size: 28rpx; }
.preset-info { flex: 1; margin-left: 16rpx; }
.preset-name { font-size: 26rpx; font-weight: 600; color: #374151; display: block; }
.preset-desc { font-size: 22rpx; color: #9ca3af; display: block; margin-top: 4rpx; }
.preset-del { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; }
.preset-del-text { font-size: 32rpx; color: #d1d5db; }

/* 离屏 Canvas */
.offscreen-canvas { position: fixed; left: -9999px; top: -9999px; }
</style>
