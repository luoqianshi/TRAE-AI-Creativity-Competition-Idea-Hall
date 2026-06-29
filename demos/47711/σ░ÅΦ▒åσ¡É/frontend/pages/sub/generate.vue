<template>
	<view class="page">
		<!-- 顶部导航 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack"><text class="back-icon">‹</text></view>
			<text class="nav-title">{{ t('page.generate') }}</text>
			<view class="nav-right"><LangSwitch /></view>
		</view>

		<scroll-view scroll-y class="content">
			<!-- OC 选择 -->
			<view class="oc-select" @click="showPicker = true">
				<view class="oc-sel-avatar" :style="{ background: selectedOC.gradient }">
					<image v-if="isAvatarValid(selectedOC)" :src="selectedOC.avatar" class="oc-sel-avatar-img" mode="aspectFill" @error="onAvatarError(selectedOC.id)" />
					<text v-else class="oc-sel-emoji">{{ selectedOC.emoji }}</text>
				</view>
				<view class="oc-sel-info">
					<text class="oc-sel-name">{{ selectedOC.name }}</text>
					<text class="oc-sel-hint">Lv.{{ selectedOC.level }} · {{ selectedOC.title }}</text>
				</view>
				<text class="oc-sel-arrow">{{ tt('切换 ›') }}</text>
			</view>

			<!-- 类型切换 -->
			<view class="type-tabs">
				<view class="type-tab" :class="{ active: genType === 'image' }" @click="genType = 'image'">
					<text class="type-icon">🖼️</text>
					<text class="type-label">{{ tt('生成图片') }}</text>
				</view>
				<view class="type-tab" :class="{ active: genType === 'video' }" @click="genType = 'video'">
					<text class="type-icon">🎬</text>
					<text class="type-label">{{ tt('生成视频') }}</text>
				</view>
				<view class="type-tab" :class="{ active: genType === 'text' }" @click="genType = 'text'">
					<text class="type-icon">📝</text>
					<text class="type-label">{{ tt('生成文本') }}</text>
				</view>
			</view>

			<!-- 模板选择 -->
			<view class="template-section">
				<text class="section-title">{{ tt('选择模板') }}</text>
				<view class="template-grid">
					<view v-for="(tpl, idx) in templates" :key="idx" class="template-card"
						:class="{ active: selectedTpl === idx }" @click="selectedTpl = idx">
						<view class="tpl-preview" :style="{ background: tpl.bg }">
							<text class="tpl-emoji">{{ tpl.icon }}</text>
						</view>
						<text class="tpl-name">{{ tpl.name }}</text>
						<view class="tpl-check" v-if="selectedTpl === idx"><text class="check-icon">✓</text></view>
					</view>
				</view>
			</view>

			<!-- 描述输入 -->
			<view class="desc-section">
				<text class="section-title">{{ tt('描述你想要的画面') }}</text>
				<textarea class="desc-input" v-model="userDesc" :placeholder="tt('例如：在樱花树下微笑、赛博朋克风格站姿、手持魔法杖战斗中...')"
					maxlength="200" :adjust-position="true" />
				<text class="desc-count">{{ userDesc.length }}/200</text>
			</view>

			<!-- 提示词社区 -->
			<view class="community-section">
				<text class="section-title">{{ tt('提示词社区') }}</text>
				<scroll-view scroll-x class="tag-bar">
					<view class="tag-bar-inner">
						<view class="tag-item" :class="{ active: filterTag === '全部' }" @click="filterTag = '全部'">
							<text class="tag-text">{{ tt('全部') }}</text>
						</view>
						<view class="tag-item" :class="{ active: filterTag === '人物' }" @click="filterTag = '人物'">
							<text class="tag-text">{{ tt('人物') }}</text>
						</view>
						<view class="tag-item" :class="{ active: filterTag === '场景' }" @click="filterTag = '场景'">
							<text class="tag-text">{{ tt('场景') }}</text>
						</view>
						<view class="tag-item" :class="{ active: filterTag === '风格' }" @click="filterTag = '风格'">
							<text class="tag-text">{{ tt('风格') }}</text>
						</view>
						<view class="tag-item" :class="{ active: filterTag === '战斗' }" @click="filterTag = '战斗'">
							<text class="tag-text">{{ tt('战斗') }}</text>
						</view>
					</view>
				</scroll-view>
				<view class="prompt-list">
					<view v-for="item in filteredPrompts" :key="item.id" class="prompt-card" @click="openPromptDetail(item)">
						<view class="prompt-header">
							<view class="prompt-avatar"><text class="prompt-avatar-text">{{ item.avatar }}</text></view>
							<text class="prompt-author">{{ item.author }}</text>
							<view class="prompt-tags">
							<text v-for="t in item.tags" :key="t" class="prompt-tag">{{ tt(t) }}</text>
							</view>
						</view>
						<text class="prompt-text">{{ item.prompt }}</text>
						<view class="prompt-actions">
							<view class="prompt-act" @click.stop="toggleLike(item)">
								<text class="prompt-act-icon">{{ item.likedByMe ? '❤️' : '🤍' }}</text>
								<text class="prompt-act-num">{{ item.likeCount || '' }}</text>
							</view>
							<view class="prompt-act" @click.stop="openPromptDetail(item)">
								<text class="prompt-act-icon">💬</text>
								<text class="prompt-act-num">{{ item.commentCount || '' }}</text>
							</view>
							<view class="prompt-use-btn" @click.stop="usePrompt(item)">
								<text class="prompt-use-text">{{ tt('使用') }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 生成按钮 -->
			<view class="gen-btn" @click="startGenerate">
				<text class="gen-btn-text">{{ generating ? tt('生成中...') : tt('开始生成') }}</text>
			</view>

			<!-- 生成结果 -->
			<view class="result-section" v-if="resultReady">
				<text class="section-title">{{ tt('生成结果') }}</text>

				<!-- 图片结果 -->
				<view class="result-card" v-if="genType === 'image'">
					<image
						v-if="imageResult.image_url"
						:src="imageResult.image_url"
						mode="widthFix"
						class="generated-image"
					/>
					<canvas canvas-id="ocCanvas" id="ocCanvas" class="result-canvas"
						v-else
						:style="{ width: '620rpx', height: '880rpx' }"></canvas>
				</view>

					<!-- 视频结果（模拟动画） -->
					<view class="result-card video-card" v-if="genType === 'video'">
						<video
							v-if="resolvedVideoUrl"
							:src="resolvedVideoUrl"
							class="generated-video"
							controls
							autoplay
						muted
						loop
						object-fit="cover"
					/>
					<view v-else class="video-preview" :style="{ background: selectedOC.gradient }">
						<view class="video-particles">
							<view v-for="i in 12" :key="i" class="v-particle" :style="particleStyle(i)"></view>
						</view>
						<view class="video-center">
							<text class="video-emoji">🎬</text>
							<text class="video-name anim-fadein">{{ videoResult.title || selectedOC.name }}</text>
							<text class="video-title anim-fadein delay1">{{ videoResult.subtitle || selectedOC.title }}</text>
							<view class="video-stats anim-fadein delay2">
								<text class="vs-item">{{ tt('镜头') }} {{ videoResult.shot_list?.length || 0 }}</text>
								<text class="vs-item">{{ tt('风格') }} {{ videoResult.kind || 'video' }}</text>
							</view>
						</view>
						<view class="video-badge">
							<text class="badge-text">{{ tt('AI 分镜预览') }}</text>
						</view>
					</view>
					<view class="video-script">
						<text class="video-script-title">{{ tt('分镜') }}</text>
						<view v-for="shot in videoShots" :key="shot.shot" class="shot-item">
							<text class="shot-index">{{ shot.shot }}</text>
							<text class="shot-scene">{{ shot.scene }}</text>
						</view>
						<text class="video-script-text">{{ videoResult.video_prompt || '' }}</text>
						<text class="video-script-text" v-if="videoResult.status_hint">{{ videoResult.status_hint }}</text>
					</view>
				</view>

				<!-- 文本结果 -->
				<view class="result-card" v-if="genType === 'text'">
					<view class="text-result-box">
						<text class="text-result-content">{{ textResult }}</text>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="result-actions" v-if="genType !== 'text'">
					<view class="action-btn save-btn" @click="saveToAlbum">
						<text class="action-icon">💾</text>
						<text class="action-text">{{ tt('保存到相册') }}</text>
					</view>
					<view class="action-btn share-btn" @click="shareResult">
						<text class="action-icon">↗</text>
						<text class="action-text">{{ tt('分享') }}</text>
					</view>
				</view>
				<view class="result-actions" v-else>
					<view class="action-btn save-btn" @click="copyTextResult">
						<text class="action-icon">📋</text>
						<text class="action-text">{{ tt('复制文本') }}</text>
					</view>
				</view>
			</view>

			<!-- 生成中动画 -->
			<view class="generating-overlay" v-if="generating">
				<view class="gen-anim">
					<view class="gen-ring"></view>
					<view class="gen-ring ring2"></view>
					<view class="gen-ring ring3"></view>
					<text class="gen-emoji">{{ selectedOC.emoji }}</text>
				</view>
				<text class="gen-hint">{{ genType === 'image' ? tt('正在绘制 OC 展示图...') : (genType === 'video' ? tt('正在生成 OC 视频...') : tt('正在生成 OC 文本...')) }}</text>
				<view class="gen-progress-bar">
					<view class="gen-progress-fill" :style="{ width: genProgress + '%' }"></view>
				</view>
			</view>

			<view style="height: 60rpx;"></view>
		</scroll-view>

		<!-- OC 选择弹窗 -->
		<view class="modal-mask" v-if="showPicker" @click="showPicker = false">
			<view class="modal-card" @click.stop>
				<text class="modal-title">{{ tt('选择角色') }}</text>
				<view class="pick-list">
					<view v-for="oc in ocList" :key="oc.id" class="pick-item"
						:class="{ active: selectedOC.id === oc.id }" @click="selectOC(oc)">
						<view class="pick-avatar" :style="{ background: oc.gradient }">
							<image v-if="isAvatarValid(oc)" :src="oc.avatar" class="pick-avatar-img" mode="aspectFill" @error="onAvatarError(oc.id)" />
							<text v-else class="pick-emoji">{{ oc.emoji }}</text>
						</view>
						<view class="pick-info">
							<text class="pick-name">{{ oc.name }}</text>
							<text class="pick-sub">{{ oc.title }} · Lv.{{ oc.level }}</text>
						</view>
						<text v-if="selectedOC.id === oc.id" class="pick-check">✓</text>
					</view>
				</view>
				<view class="modal-close" @click="showPicker = false">
					<text class="close-text">{{ tt('关闭') }}</text>
				</view>
			</view>
		</view>

		<!-- 提示词详情弹窗 -->
		<view class="modal-mask" v-if="showPromptDetail" @click="showPromptDetail = false">
			<view class="modal-card detail-modal" @click.stop>
				<scroll-view scroll-y class="detail-scroll">
					<view class="detail-header">
						<view class="prompt-avatar"><text class="prompt-avatar-text">{{ detailPrompt.avatar }}</text></view>
						<text class="prompt-author">{{ detailPrompt.author }}</text>
						<view class="prompt-tags">
							<text v-for="t in detailPrompt.tags" :key="t" class="prompt-tag">{{ tt(t) }}</text>
						</view>
					</view>
					<text class="detail-prompt-text">{{ detailPrompt.prompt }}</text>
					<view class="detail-actions">
						<view class="prompt-act" @click="toggleLike(detailPrompt)">
							<text class="prompt-act-icon">{{ detailPrompt.likedByMe ? '❤️' : '🤍' }}</text>
							<text class="prompt-act-num">{{ detailPrompt.likeCount }}</text>
						</view>
						<view class="prompt-use-btn" @click="usePrompt(detailPrompt); showPromptDetail = false">
							<text class="prompt-use-text">{{ tt('使用此提示词') }}</text>
						</view>
					</view>
					<view class="detail-comments">
						<text class="detail-comments-title">{{ tt('评论') }} ({{ detailPrompt.commentCount }})</text>
						<view v-if="!detailPrompt.comments.length" class="detail-empty">
							<text class="detail-empty-text">{{ tt('暂无评论，快来抢沙发～') }}</text>
						</view>
						<view v-for="c in detailPrompt.comments" :key="c.id" class="comment-item">
							<view class="comment-avatar"><text class="comment-avatar-text">{{ c.avatar }}</text></view>
							<view class="comment-body">
								<text class="comment-author">{{ c.author }}</text>
								<text class="comment-content">{{ c.content }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="comment-bar">
					<view class="comment-input-wrap">
						<input class="comment-input" v-model="commentDraft" :placeholder="tt('写一条评论...')" />
					</view>
					<view class="comment-send" :class="{ active: commentDraft.trim() }" @click="submitComment">
						<text class="cs-text">{{ tt('发送') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, nextTick, computed, onMounted } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { getHomeDashboard } from '../../utils/apis/home.js'
import { createGenerationJob, getGenerationJob } from '../../utils/apis/generation.js'
import { getPrompts, togglePromptLike, createPromptComment } from '../../utils/apis/prompt.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()

const ocList = ref([])
const selectedOC = computed(() => {
	return selectedOCData.value.id
		? selectedOCData.value
		: { ...selectedOCData.value, name: tt('未选择'), title: tt('无') }
})
const selectedOCData = ref({ id: 0, name: '未选择', emoji: '❓', gradient: 'linear-gradient(135deg, #ccc, #999)', level: 1, title: '无', stats: { intimacy: 0, combat: 0, emotion: 0 }, barColor: '#ccc' })
const avatarFailed = ref(new Set())
function onAvatarError(id) { avatarFailed.value = new Set([...avatarFailed.value, id]) }
function isAvatarValid(oc) { return oc.avatar && !avatarFailed.value.has(oc.id) }
const genType = ref('image')
const selectedTpl = ref(0)
const showPicker = ref(false)
const generating = ref(false)
const genProgress = ref(0)
const resultReady = ref(false)
const userDesc = ref('')
const textResult = ref('')
const imageResult = ref({})
const videoResult = ref({})
const activePollToken = ref(0)

const resolvedVideoUrl = computed(() => extractVideoUrl(videoResult.value))

const templates = computed(() => [
	{ name: tt('角色卡'), icon: '🃏', bg: 'linear-gradient(135deg, #FFB6C1, #a78bfa)' },
	{ name: tt('社交分享'), icon: '📱', bg: 'linear-gradient(160deg, #f9a8d4, #c084fc)' },
	{ name: tt('战斗海报'), icon: '⚔️', bg: 'linear-gradient(135deg, #c084fc, #818cf8)' },
	{ name: tt('梦幻写真'), icon: '🌸', bg: 'linear-gradient(160deg, #FFB6C1, #c084fc, #818cf8)' },
])

const myName = ref(tt('匿名契约者'))
const myAvatar = ref('🌟')
const promptList = ref([])
const filterTag = ref('全部')
const showPromptDetail = ref(false)
const detailPrompt = ref({ id: 0, avatar: '', author: '', prompt: '', tags: [], likedByMe: false, likeCount: 0, commentCount: 0, comments: [] })
const commentDraft = ref('')

const filteredPrompts = computed(() => {
	if (filterTag.value === '全部') return promptList.value
	return promptList.value.filter(p => Array.isArray(p.tags) && p.tags.includes(filterTag.value))
})

function normalizePrompt(item) {
	const comments = Array.isArray(item.comments)
		? item.comments.map(c => ({
			id: c.id,
			avatar: c.author_avatar || '🌟',
			author: c.author_name || tt('匿名契约者'),
			content: c.content || '',
		}))
		: []
	return {
		id: item.id,
	avatar: item.author_avatar || '🌟',
	author: item.author_name || tt('匿名契约者'),
		prompt: item.prompt || '',
		tags: Array.isArray(item.tags) ? item.tags : [],
		likedByMe: !!item.liked_by_me,
		likeCount: Number(item.like_count || 0),
		commentCount: Number(item.comment_count || comments.length),
		comments,
	}
}

async function loadData() {
	try {
		const [dashboard, promptsRes] = await Promise.all([
			getHomeDashboard(),
			getPrompts(),
		])

		myName.value = dashboard.profile?.nickname || tt('匿名契约者')
		ocList.value = Array.isArray(dashboard.oc_list) ? dashboard.oc_list : []
		if (ocList.value.length) {
			const found = ocList.value.find(oc => oc.id === selectedOCData.value.id)
			selectedOCData.value = found || ocList.value[0]
		}

		promptList.value = Array.isArray(promptsRes.items)
			? promptsRes.items.map(normalizePrompt)
			: []
	} catch (error) {
		uni.showToast({ title: error.message || tt('加载失败'), icon: 'none' })
	}
}

onLoad((options) => {
	if (options?.type && ['image', 'video', 'text'].includes(options.type)) {
		genType.value = options.type
	}
	loadData()
})
onShow(loadData)

function goBack() { uni.navigateBack() }

function selectOC(oc) {
	selectedOCData.value = oc
	showPicker.value = false
	resultReady.value = false
	imageResult.value = {}
	videoResult.value = {}
}

function buildGenerationPrompt() {
	const tplName = templates.value[selectedTpl.value]?.name || tt('默认模板')
	const ocName = selectedOC.value?.name || tt('未选择角色')
	const desc = userDesc.value.trim()
	return [tplName, ocName, desc].filter(Boolean).join(' | ')
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function extractVideoUrl(payload = {}) {
	const keys = ['video_url', 'videoUrl', 'url', 'file_url', 'fileUrl', 'download_url', 'downloadUrl']
	const visited = new Set()

	function walk(value) {
		if (!value || typeof value !== 'object' || visited.has(value)) return ''
		visited.add(value)

		for (const key of keys) {
			const url = value[key]
			if (typeof url === 'string' && url.trim()) return url.trim()
		}

		if (Array.isArray(value)) {
			for (const item of value) {
				const nested = walk(item)
				if (nested) return nested
			}
			return ''
		}

		for (const item of Object.values(value)) {
			const nested = walk(item)
			if (nested) return nested
		}
		return ''
	}

	return walk(payload)
}

async function pollJob(jobId, token) {
	const maxAttempts = genType.value === 'video' ? 180 : 50
	const intervalMs = genType.value === 'video' ? 3000 : 1200
	for (let i = 0; i < maxAttempts; i += 1) {
		if (activePollToken.value !== token) return
		await sleep(intervalMs)
		const job = await getGenerationJob(jobId)
		if (activePollToken.value !== token) return

		if (job.status === 'queued' || job.status === 'running') {
			const progressCap = genType.value === 'video' ? 98 : 92
			const progressByTime = Math.floor((i + 1) / maxAttempts * progressCap)
			genProgress.value = Math.min(progressCap, Math.max(genProgress.value, progressByTime))
			continue
		}

		if (job.status === 'succeeded') {
			genProgress.value = 100
			generating.value = false
			resultReady.value = true
			if (job.job_type === 'image') {
				imageResult.value = job.output_payload || {}
				nextTick(() => drawCanvas())
				} else if (job.job_type === 'text') {
					textResult.value = job.output_payload?.content || ''
				} else if (job.job_type === 'video') {
					const output = job.output_payload || {}
					videoResult.value = extractVideoUrl(output)
						? output
						: {
							...output,
							status_hint: tt('视频已完成，但服务商未返回可播放地址'),
						}
				}
				return
			}

		if (job.status === 'not_implemented') {
			generating.value = false
			resultReady.value = false
			genProgress.value = 0
			uni.showToast({
				title: job.output_payload?.display_message || tt('该能力暂未实现'),
				icon: 'none',
			})
			return
		}

		generating.value = false
		resultReady.value = false
		genProgress.value = 0
		uni.showToast({ title: job.error_message || tt('生成失败'), icon: 'none' })
		return
	}
		generating.value = false
		if (genType.value === 'video') {
			resultReady.value = true
			genProgress.value = 98
			videoResult.value = {
				...videoResult.value,
				title: selectedOC.value.name,
				subtitle: tt('视频仍在生成中，请稍后重新进入页面查看'),
				status_hint: tt('视频仍在生成中，请稍后重新进入页面查看'),
				shot_list: videoResult.value.shot_list || [],
			}
			uni.showToast({ title: tt('视频仍在生成中，请稍后查看'), icon: 'none' })
			return
		}
		resultReady.value = false
		genProgress.value = 0
		uni.showToast({ title: tt('任务超时，请重试'), icon: 'none' })
	}

async function startGenerate() {
	if (generating.value) return
	if (!selectedOC.value.id) {
		uni.showToast({ title: tt('请先选择一个 OC'), icon: 'none' })
		return
	}

	generating.value = true
	genProgress.value = 8
	resultReady.value = false
	textResult.value = ''
	imageResult.value = {}
	videoResult.value = {}

	const token = Date.now()
	activePollToken.value = token

	try {
		const job = await createGenerationJob({
			job_type: genType.value,
			prompt: buildGenerationPrompt(),
			oc_id: selectedOC.value.id,
			template_name: templates.value[selectedTpl.value]?.name || '',
			input_payload: {
				user_desc: userDesc.value.trim(),
				template_index: selectedTpl.value,
				oc_name: selectedOC.value.name,
			},
		})

		if (job.status === 'not_implemented') {
			generating.value = false
			genProgress.value = 0
			uni.showToast({
				title: job.output_payload?.display_message || tt('该能力暂未实现'),
				icon: 'none',
			})
			return
		}

		await pollJob(job.id, token)
	} catch (error) {
		generating.value = false
		genProgress.value = 0
		resultReady.value = false
		uni.showToast({ title: error.message || tt('提交任务失败'), icon: 'none' })
	}
}

function drawCanvas() {
	const ctx = uni.createCanvasContext('ocCanvas')
	const oc = selectedOC.value
	const tpl = templates.value[selectedTpl.value]
	const poster = imageResult.value || {}
	const w = 310
	const h = 440

	const colors = [
		['#FFB6C1', '#a78bfa'],
		['#f9a8d4', '#c084fc'],
		['#c084fc', '#818cf8'],
		['#FFB6C1', '#818cf8'],
	]
	const palette = Array.isArray(poster.palette) && poster.palette.length >= 2 ? poster.palette : null
	const [c1, c2] = palette || colors[selectedTpl.value] || colors[0]
	const grd = ctx.createLinearGradient(0, 0, w, h)
	grd.addColorStop(0, c1)
	grd.addColorStop(1, c2)
	ctx.setFillStyle(grd)
	ctx.fillRect(0, 0, w, h)

	ctx.setGlobalAlpha(0.1)
	ctx.setFillStyle('#fff')
	ctx.beginPath()
	ctx.arc(60, 80, 100, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.arc(260, 350, 80, 0, Math.PI * 2)
	ctx.fill()
	ctx.setGlobalAlpha(1)

	ctx.setFillStyle('rgba(255,255,255,0.25)')
	ctx.beginPath()
	ctx.arc(w / 2, 140, 55, 0, Math.PI * 2)
	ctx.fill()
	ctx.setStrokeStyle('rgba(255,255,255,0.5)')
	ctx.setLineWidth(2)
	ctx.beginPath()
	ctx.arc(w / 2, 140, 55, 0, Math.PI * 2)
	ctx.stroke()

	ctx.setFontSize(40)
	ctx.setTextAlign('center')
	ctx.setFillStyle('#fff')
	ctx.fillText(poster.oc?.emoji || oc.emoji, w / 2, 155)

	ctx.setFontSize(22)
	ctx.setTextAlign('center')
	ctx.setFillStyle('#fff')
	ctx.fillText(poster.title || oc.name, w / 2, 225)

	ctx.setFontSize(12)
	ctx.setFillStyle('rgba(255,255,255,0.8)')
	ctx.fillText((poster.subtitle || oc.title) + ' | Lv.' + oc.level, w / 2, 250)

	const stats = [
		{ label: tt('亲密度'), val: poster.oc?.stats?.intimacy ?? oc.stats.intimacy },
		{ label: tt('战斗力'), val: poster.oc?.stats?.combat ?? oc.stats.combat },
		{ label: tt('情感值'), val: poster.oc?.stats?.emotion ?? oc.stats.emotion },
	]
	const barY = 280
	stats.forEach((s, i) => {
		const y = barY + i * 36
		ctx.setFontSize(11)
		ctx.setTextAlign('left')
		ctx.setFillStyle('rgba(255,255,255,0.9)')
		ctx.fillText(s.label, 40, y + 4)

		ctx.setFillStyle('rgba(255,255,255,0.2)')
		const barX = 100
		const barW = 160
		const barH = 10
		ctx.fillRect(barX, y - 6, barW, barH)

		ctx.setFillStyle('rgba(255,255,255,0.85)')
		ctx.fillRect(barX, y - 6, barW * s.val / 100, barH)

		ctx.setTextAlign('right')
		ctx.setFillStyle('rgba(255,255,255,0.7)')
		ctx.fillText(s.val, 290, y + 4)
	})

	ctx.setFontSize(10)
	ctx.setTextAlign('center')
	ctx.setFillStyle('rgba(255,255,255,0.4)')
	ctx.fillText((poster.poster_caption || (tt('OC Universe · ') + tpl.name)), w / 2, 420)

	ctx.draw()
}

function saveToAlbum() {
	if (genType.value === 'image' && imageResult.value?.image_url) {
		uni.downloadFile({
			url: imageResult.value.image_url,
			success: (res) => {
				if (res.statusCode !== 200 || !res.tempFilePath) {
					uni.showToast({ title: tt('保存失败'), icon: 'none' })
					return
				}
				uni.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: () => uni.showToast({ title: tt('已保存到相册'), icon: 'success' }),
					fail: () => uni.showToast({ title: tt('保存失败，请检查权限'), icon: 'none' })
				})
			},
			fail: () => uni.showToast({ title: tt('下载失败'), icon: 'none' })
		})
		return
	}
	if (genType.value === 'video') {
		const videoUrl = resolvedVideoUrl.value
		if (videoUrl) {
			uni.downloadFile({
				url: videoUrl,
				success: (res) => {
					if (res.statusCode !== 200 || !res.tempFilePath) {
						uni.showToast({ title: tt('保存失败'), icon: 'none' })
						return
					}
					uni.saveVideoToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => uni.showToast({ title: tt('已保存到相册'), icon: 'success' }),
						fail: () => uni.showToast({ title: tt('保存失败，请检查权限'), icon: 'none' })
					})
				},
				fail: () => uni.showToast({ title: tt('下载失败'), icon: 'none' })
			})
			return
		}
		uni.showToast({ title: tt('暂无可保存的视频地址'), icon: 'none' })
		return
	}
	if (genType.value === 'text') {
		copyTextResult()
		return
	}
	uni.canvasToTempFilePath({
		canvasId: 'ocCanvas',
		success: (res) => {
			uni.saveImageToPhotosAlbum({
				filePath: res.tempFilePath,
				success: () => uni.showToast({ title: tt('已保存到相册'), icon: 'success' }),
				fail: () => uni.showToast({ title: tt('保存失败，请检查权限'), icon: 'none' })
			})
		},
		fail: () => uni.showToast({ title: tt('生成图片失败'), icon: 'none' })
	})
}

function shareResult() {
	if (genType.value === 'image' && imageResult.value?.image_url) {
		uni.previewImage({ urls: [imageResult.value.image_url], current: imageResult.value.image_url })
		return
	}
	if (genType.value === 'video') {
		if (resolvedVideoUrl.value) {
			uni.showToast({ title: tt('视频已生成，可直接播放'), icon: 'none' })
			return
		}
		uni.showToast({ title: tt('暂无可预览的视频地址'), icon: 'none' })
		return
	}
	if (genType.value === 'text') {
		copyTextResult()
		return
	}
	uni.canvasToTempFilePath({
		canvasId: 'ocCanvas',
		success: (res) => {
			uni.previewImage({ urls: [res.tempFilePath], current: res.tempFilePath })
		},
		fail: () => uni.showToast({ title: tt('生成失败'), icon: 'none' })
	})
}

function copyTextResult() {
	if (!textResult.value) return
	uni.setClipboardData({
		data: textResult.value,
		success: () => uni.showToast({ title: tt('已复制文本'), icon: 'none' })
	})
}

function usePrompt(item) {
	userDesc.value = item.prompt
	uni.showToast({ title: tt('已填入描述框'), icon: 'none' })
}

async function toggleLike(item) {
	try {
		const res = await togglePromptLike(item.id)
		promptList.value = promptList.value.map(p => p.id === item.id
			? { ...p, likedByMe: !!res.liked, likeCount: Number(res.like_count || 0) }
			: p)
		if (showPromptDetail.value && detailPrompt.value.id === item.id) {
			detailPrompt.value = {
				...detailPrompt.value,
				likedByMe: !!res.liked,
				likeCount: Number(res.like_count || 0),
			}
		}
	} catch (error) {
		uni.showToast({ title: error.message || tt('操作失败'), icon: 'none' })
	}
}

function openPromptDetail(item) {
	detailPrompt.value = {
		...item,
		comments: Array.isArray(item.comments) ? [...item.comments] : [],
	}
	commentDraft.value = ''
	showPromptDetail.value = true
}

async function submitComment() {
	const text = commentDraft.value.trim()
	if (!text) return
	try {
		const c = await createPromptComment(detailPrompt.value.id, { content: text })
		const comment = {
			id: c.id,
			avatar: c.author_avatar || myAvatar.value,
			author: c.author_name || myName.value,
			content: c.content,
		}
		promptList.value = promptList.value.map(p => {
			if (p.id !== detailPrompt.value.id) return p
			return {
				...p,
				commentCount: Number(p.commentCount || 0) + 1,
				comments: [...(p.comments || []), comment],
			}
		})
		const latest = promptList.value.find(p => p.id === detailPrompt.value.id)
		if (latest) {
			detailPrompt.value = { ...latest, comments: [...latest.comments] }
		}
		commentDraft.value = ''
	} catch (error) {
		uni.showToast({ title: error.message || tt('评论失败'), icon: 'none' })
	}
}

function particleStyle(i) {
	const size = 8 + (i * 5) % 20
	const x = (i * 8.3 + 10) % 90
	const y = (i * 7.1 + 5) % 80
	const delay = (i * 0.4) % 3
	return {
		width: size + 'rpx',
		height: size + 'rpx',
		left: x + '%',
		top: y + '%',
		animationDelay: delay + 's',
	}
}

const videoShots = computed(() => {
	return Array.isArray(videoResult.value?.shot_list) ? videoResult.value.shot_list : []
})
</script>

<style>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #F3EEFF 40%, #F5F0FF 70%, #FFF5F8 100%); }

.nav-bar { position: relative; display: flex; align-items: center; justify-content: center; padding-bottom: 16rpx; background: rgba(237,231,246,0.95); backdrop-filter: blur(28px) saturate(1.5); border-bottom: 2rpx solid transparent; border-image: linear-gradient(90deg, rgba(167,139,250,0.01), rgba(192,132,252,0.18), rgba(167,139,250,0.01)) 1; }
.nav-left { position: absolute; left: 20rpx; bottom: 16rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 56rpx; color: #c084fc; font-weight: 400; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #374151; margin-top: 20rpx; letter-spacing: 2rpx; }
.nav-right { position: absolute; right: 24rpx; bottom: 16rpx; }

.content { height: 100vh; padding: 0; }

.oc-select { display: flex; align-items: center; margin: 24rpx 30rpx 0; padding: 24rpx; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border-radius: 28rpx; border: 2rpx solid rgba(255,182,193,0.2); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 8rpx 24rpx rgba(167,139,250,0.06), 0 16rpx 40rpx rgba(192,132,252,0.04); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.oc-select:active { transform: scale(0.97); box-shadow: 0 2rpx 6rpx rgba(167,139,250,0.03); }
.oc-sel-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.oc-sel-avatar-img { width: 80rpx; height: 80rpx; border-radius: 50%; }
.oc-sel-emoji { font-size: 36rpx; }
.oc-sel-info { flex: 1; margin-left: 20rpx; }
.oc-sel-name { font-size: 30rpx; font-weight: 700; color: #374151; display: block; letter-spacing: 1rpx; }
.oc-sel-hint { font-size: 22rpx; color: #9ca3af; display: block; margin-top: 4rpx; }
.oc-sel-arrow { font-size: 24rpx; color: #c084fc; font-weight: 600; }

/* 类型 Tab */
.type-tabs { display: flex; gap: 20rpx; margin: 24rpx 30rpx 0; }
.type-tab { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 28rpx 0; background: rgba(255,255,255,0.7); border-radius: 28rpx; border: 2rpx solid rgba(255,182,193,0.15); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.type-tab.active { background: linear-gradient(135deg, rgba(255,182,193,0.18), rgba(167,139,250,0.15)); border-color: rgba(192,132,252,0.4); box-shadow: 0 4rpx 16rpx rgba(192,132,252,0.15); }
.type-icon { font-size: 40rpx; display: block; }
.type-label { font-size: 26rpx; font-weight: 600; color: #9ca3af; margin-top: 8rpx; }
.type-tab.active .type-label { color: #c084fc; }

/* 模板 */
.template-section { margin: 30rpx 30rpx 0; }
.section-title { font-size: 30rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 20rpx; letter-spacing: 2rpx; }
.template-grid { display: flex; gap: 16rpx; }
.template-card { flex: 1; border-radius: 24rpx; overflow: hidden; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border: 2rpx solid rgba(255,182,193,0.15); position: relative; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 4rpx 16rpx rgba(167,139,250,0.05), 0 8rpx 24rpx rgba(192,132,252,0.03); }
.template-card.active { border-color: #c084fc; box-shadow: 0 4rpx 12rpx rgba(192,132,252,0.15), 0 8rpx 28rpx rgba(192,132,252,0.25), 0 12rpx 40rpx rgba(167,139,250,0.1); }
.template-card:active { transform: scale(0.97); box-shadow: 0 2rpx 6rpx rgba(167,139,250,0.03); }
.tpl-preview { height: 120rpx; display: flex; align-items: center; justify-content: center; }
.tpl-emoji { font-size: 40rpx; }
.tpl-name { font-size: 22rpx; color: #374151; font-weight: 600; display: block; text-align: center; padding: 12rpx 0; }
.tpl-check { position: absolute; top: 8rpx; right: 8rpx; width: 36rpx; height: 36rpx; border-radius: 50%; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); display: flex; align-items: center; justify-content: center; }
.check-icon { font-size: 20rpx; color: #fff; }

/* 描述输入 */
.desc-section { margin: 30rpx 30rpx 0; }
.desc-input { width: 100%; min-height: 160rpx; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.2); border-radius: 24rpx; border: 2rpx solid rgba(255,182,193,0.2); padding: 24rpx; font-size: 28rpx; color: #374151; line-height: 1.6; box-sizing: border-box; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.desc-input:focus { border-color: rgba(167,139,250,0.35); box-shadow: 0 0 0 6rpx rgba(167,139,250,0.08); }
.desc-count { display: block; text-align: right; font-size: 22rpx; color: #9ca3af; margin-top: 8rpx; }

/* 生成按钮 */
.gen-btn { margin: 30rpx 30rpx 0; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); border-radius: 40rpx; padding: 28rpx; text-align: center; box-shadow: 0 8rpx 32rpx rgba(192,132,252,0.35); position: relative; overflow: hidden; }
.gen-btn::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 40rpx 40rpx 0 0; }
.gen-btn:active { transform: scale(0.97); }
.gen-btn-text { font-size: 30rpx; color: #fff; font-weight: 700; letter-spacing: 4rpx; position: relative; z-index: 1; }

/* 生成中动画 */
.generating-overlay { margin-top: 40rpx; display: flex; flex-direction: column; align-items: center; padding: 40rpx 0; }
.gen-anim { position: relative; width: 160rpx; height: 160rpx; display: flex; align-items: center; justify-content: center; }
.gen-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 4rpx solid rgba(192,132,252,0.2); border-top-color: #a78bfa; animation: spin 1.2s linear infinite; }
.ring2 { width: 130rpx; height: 130rpx; top: 15rpx; left: 15rpx; border-top-color: #FFB6C1; animation-duration: 1.8s; animation-direction: reverse; }
.ring3 { width: 100rpx; height: 100rpx; top: 30rpx; left: 30rpx; border-top-color: #f9a8d4; animation-duration: 0.9s; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.gen-emoji { font-size: 48rpx; position: relative; z-index: 2; animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
.gen-hint { font-size: 26rpx; color: #c084fc; margin-top: 24rpx; }
.gen-progress-bar { width: 400rpx; height: 10rpx; background: rgba(192,132,252,0.12); border-radius: 5rpx; margin-top: 20rpx; overflow: hidden; }
.gen-progress-fill { height: 100%; background: linear-gradient(90deg, #FFB6C1, #a78bfa); border-radius: 5rpx; transition: width 0.2s; }

/* 结果 */
.result-section { margin: 30rpx 30rpx 0; }
.result-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border-radius: 28rpx; overflow: hidden; border: 2rpx solid rgba(255,182,193,0.2); display: flex; align-items: center; justify-content: center; padding: 20rpx; box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 8rpx 24rpx rgba(167,139,250,0.06), 0 16rpx 40rpx rgba(192,132,252,0.04); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.result-canvas { border-radius: 20rpx; }
.generated-image { width: 100%; border-radius: 20rpx; }
.text-result-box { width: 100%; max-height: 520rpx; overflow: hidden; }
.text-result-content { font-size: 28rpx; color: #374151; line-height: 1.7; white-space: pre-wrap; word-break: break-all; }

/* 视频预览 */
.video-card { padding: 0; }
.generated-video { width: 100%; height: 600rpx; border-radius: 28rpx; background: #000; }
.video-preview { width: 100%; height: 600rpx; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 28rpx; }
.video-particles { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.v-particle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.3); animation: vFloat 3s ease-in-out infinite alternate; }
@keyframes vFloat { 0% { transform: translateY(0) scale(1); opacity: 0.3; } 100% { transform: translateY(-40rpx) scale(1.3); opacity: 0.7; } }
.video-center { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; }
.video-emoji { font-size: 96rpx; animation: pulse 2s ease-in-out infinite; }
.video-name { font-size: 40rpx; font-weight: 800; color: #fff; margin-top: 20rpx; text-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2); letter-spacing: 2rpx; }
.video-title { font-size: 24rpx; color: rgba(255,255,255,0.85); margin-top: 8rpx; letter-spacing: 2rpx; }
.video-stats { display: flex; gap: 24rpx; margin-top: 24rpx; }
.vs-item { font-size: 22rpx; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.2); padding: 10rpx 22rpx; border-radius: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.anim-fadein { animation: fadeSlideUp 0.8s ease-out both; }
.delay1 { animation-delay: 0.3s; }
.delay2 { animation-delay: 0.6s; }
@keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(20rpx); } 100% { opacity: 1; transform: translateY(0); } }
.video-badge { position: absolute; bottom: 20rpx; right: 20rpx; background: rgba(0,0,0,0.25); border-radius: 12rpx; padding: 8rpx 18rpx; }
.badge-text { font-size: 20rpx; color: rgba(255,255,255,0.85); }
.video-script { padding: 22rpx 20rpx 4rpx; }
.video-script-title { font-size: 26rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 16rpx; }
.shot-item { display: flex; gap: 14rpx; align-items: flex-start; padding: 14rpx 0; border-bottom: 1rpx solid rgba(192,132,252,0.12); }
.shot-index { width: 36rpx; height: 36rpx; border-radius: 50%; background: linear-gradient(135deg, #f9a8d4, #c084fc); color: #fff; font-size: 20rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.shot-scene { flex: 1; font-size: 24rpx; line-height: 1.6; color: #4b5563; }
.video-script-text { display: block; font-size: 22rpx; color: #9ca3af; line-height: 1.7; margin-top: 14rpx; }

/* 操作按钮 */
.result-actions { display: flex; gap: 20rpx; margin-top: 20rpx; padding: 0; }
.action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 12rpx; padding: 24rpx; border-radius: 28rpx; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.action-btn:active { transform: scale(0.97); }
.save-btn { background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); box-shadow: 0 4rpx 20rpx rgba(192,132,252,0.3); position: relative; overflow: hidden; }
.save-btn::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 28rpx 28rpx 0 0; }
.save-btn .action-text { color: #fff; position: relative; z-index: 1; }
.share-btn { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border: 2rpx solid rgba(192,132,252,0.25); }
.share-btn .action-text { color: #c084fc; }
.action-icon { font-size: 32rpx; position: relative; z-index: 1; }
.action-text { font-size: 26rpx; font-weight: 600; }

/* 弹窗 */
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.35); z-index: 999; display: flex; align-items: center; justify-content: center; }
.modal-card { width: 85%; background: rgba(255,255,255,0.97); backdrop-filter: blur(40px) saturate(1.8); border-radius: 40rpx; overflow: hidden; }
.modal-title { font-size: 32rpx; font-weight: 700; color: #374151; display: block; text-align: center; padding: 32rpx 0 16rpx; letter-spacing: 2rpx; }
.modal-close { text-align: center; padding: 24rpx; border-top: 1rpx solid rgba(255,182,193,0.2); }
.close-text { font-size: 28rpx; color: #c084fc; font-weight: 600; }

.pick-list { padding: 0 24rpx 16rpx; }
.pick-item { display: flex; align-items: center; padding: 20rpx 16rpx; border-radius: 24rpx; margin-bottom: 12rpx; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.pick-item.active { background: linear-gradient(135deg, rgba(255,182,193,0.1), rgba(167,139,250,0.08)); }
.pick-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.pick-avatar-img { width: 72rpx; height: 72rpx; border-radius: 50%; }
.pick-emoji { font-size: 36rpx; }
.pick-info { flex: 1; margin-left: 20rpx; }
.pick-name { font-size: 28rpx; font-weight: 600; color: #374151; display: block; }
.pick-sub { font-size: 22rpx; color: #9ca3af; display: block; margin-top: 4rpx; }
.pick-check { font-size: 32rpx; color: #c084fc; font-weight: 700; }

/* 提示词社区 */
.community-section { margin: 30rpx 30rpx 0; }
.tag-bar { white-space: nowrap; margin-bottom: 20rpx; }
.tag-bar-inner { display: flex; gap: 16rpx; }
.tag-item { padding: 10rpx 28rpx; border-radius: 28rpx; background: rgba(255,255,255,0.7); border: 2rpx solid rgba(255,182,193,0.15); flex-shrink: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.tag-item.active { background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); border-color: transparent; box-shadow: 0 6rpx 24rpx rgba(192,132,252,0.35), 0 2rpx 8rpx rgba(167,139,250,0.15); }
.tag-text { font-size: 24rpx; color: #9ca3af; font-weight: 600; }
.tag-item.active .tag-text { color: #fff; }

.prompt-list { display: flex; flex-direction: column; gap: 16rpx; }
.prompt-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(1.3); border-radius: 24rpx; padding: 24rpx; border: 2rpx solid rgba(255,182,193,0.15); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 8rpx 24rpx rgba(167,139,250,0.06), 0 16rpx 40rpx rgba(192,132,252,0.04); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.prompt-card:active { transform: scale(0.97); box-shadow: 0 2rpx 6rpx rgba(167,139,250,0.03); }
.prompt-header { display: flex; align-items: center; margin-bottom: 12rpx; }
.prompt-avatar { width: 48rpx; height: 48rpx; border-radius: 50%; background: linear-gradient(135deg, rgba(255,182,193,0.3), rgba(167,139,250,0.3)); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.prompt-avatar-text { font-size: 24rpx; }
.prompt-author { font-size: 24rpx; font-weight: 600; color: #374151; margin-left: 12rpx; }
.prompt-tags { margin-left: auto; display: flex; gap: 8rpx; }
.prompt-tag { font-size: 20rpx; color: #c084fc; background: rgba(192,132,252,0.1); padding: 6rpx 16rpx; border-radius: 12rpx; box-shadow: 0 2rpx 6rpx rgba(167,139,250,0.06); }
.prompt-text { font-size: 26rpx; color: #4b5563; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.prompt-actions { display: flex; align-items: center; margin-top: 16rpx; gap: 24rpx; }
.prompt-act { display: flex; align-items: center; gap: 6rpx; }
.prompt-act-icon { font-size: 28rpx; }
.prompt-act-num { font-size: 22rpx; color: #9ca3af; }
.prompt-use-btn { margin-left: auto; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); padding: 10rpx 30rpx; border-radius: 24rpx; position: relative; overflow: hidden; }
.prompt-use-btn::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 24rpx 24rpx 0 0; }
.prompt-use-btn:active { transform: scale(0.95); }
.prompt-use-text { font-size: 22rpx; color: #fff; font-weight: 600; position: relative; z-index: 1; }

/* 提示词详情弹窗 */
.detail-modal { width: 90%; max-height: 80vh; display: flex; flex-direction: column; border-radius: 40rpx; }
.detail-scroll { flex: 1; padding: 28rpx; overflow: hidden; }
.detail-header { display: flex; align-items: center; margin-bottom: 20rpx; }
.detail-prompt-text { font-size: 30rpx; color: #374151; line-height: 1.8; margin-bottom: 20rpx; }
.detail-actions { display: flex; align-items: center; gap: 24rpx; padding-bottom: 24rpx; border-bottom: 1rpx solid rgba(255,182,193,0.2); }
.detail-comments { padding-top: 20rpx; }
.detail-comments-title { font-size: 28rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 16rpx; letter-spacing: 2rpx; }
.detail-empty { padding: 48rpx 0; text-align: center; }
.detail-empty-text { font-size: 26rpx; color: #c4b5d8; letter-spacing: 2rpx; }
.comment-item { display: flex; margin-bottom: 20rpx; }
.comment-avatar { width: 52rpx; height: 52rpx; border-radius: 50%; background: linear-gradient(135deg, rgba(192,132,252,0.15), rgba(255,182,193,0.15)); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.comment-avatar-text { font-size: 22rpx; }
.comment-body { flex: 1; margin-left: 16rpx; }
.comment-author { font-size: 24rpx; font-weight: 600; color: #374151; display: block; }
.comment-content { font-size: 26rpx; color: #4b5563; line-height: 1.5; margin-top: 4rpx; display: block; }
.comment-bar { display: flex; align-items: center; padding: 16rpx 24rpx; gap: 16rpx; border-top: 1rpx solid rgba(255,182,193,0.2); background: rgba(255,255,255,0.95); backdrop-filter: blur(20px) saturate(1.3); }
.comment-input-wrap { flex: 1; background: rgba(237,231,246,0.4); backdrop-filter: blur(20px) saturate(1.2); border-radius: 32rpx; padding: 0 24rpx; border: 2rpx solid rgba(167,139,250,0.06); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.comment-input-wrap:focus-within { border-color: rgba(167,139,250,0.25); box-shadow: 0 0 0 6rpx rgba(167,139,250,0.06); }
.comment-input { font-size: 26rpx; height: 64rpx; color: #374151; }
.comment-send { padding: 12rpx 28rpx; border-radius: 24rpx; background: rgba(192,132,252,0.15); position: relative; overflow: hidden; }
.comment-send.active { background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); }
.comment-send.active::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 24rpx 24rpx 0 0; }
.cs-text { font-size: 26rpx; color: #9ca3af; font-weight: 600; position: relative; z-index: 1; }
.comment-send.active .cs-text { color: #fff; }
</style>
