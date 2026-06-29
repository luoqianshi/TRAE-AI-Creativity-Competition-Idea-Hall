<template>
	<view class="page">
		<!-- 极光背景层 -->
		<view class="aurora-bg">
			<view class="aurora-orb orb-1"></view>
			<view class="aurora-orb orb-2"></view>
			<view class="aurora-orb orb-3"></view>
		</view>
		<!-- 粒子 -->
		<view class="particles">
			<view v-for="i in 15" :key="i" class="particle" :style="particleStyle(i)"></view>
		</view>

		<!-- 顶部导航 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-inner">
				<view class="nav-brand">
					<view class="brand-mark">
						<text class="brand-icon">✦</text>
					</view>
					<view class="brand-text">
						<text class="nav-title">{{ t('page.home') }}</text>
						<text class="nav-subtitle">{{ t('home.subtitle') }}</text>
					</view>
				</view>
				<LangSwitch />
			</view>
		</view>


		<!-- OC 虚拟人物模态框 -->
		<view class="oc-viewport" @click="ocList.length === 0 ? goCreateOC() : openOCPreview(currentOC)">
			<!-- 背景层 -->
			<view class="oc-vp-bg" :style="{ background: ocList.length ? currentOC.gradient : 'linear-gradient(160deg, #f0e6ff 0%, #e8dff5 50%, #f5f0ff 100%)' }"></view>
			<view class="oc-vp-overlay"></view>
			<view class="oc-vp-shine"></view>

			<!-- 空状态 -->
			<view v-if="ocList.length === 0" class="oc-vp-empty">
				<view class="empty-glow"></view>
				<text class="oc-empty-icon">✦</text>
				<text class="oc-empty-text">{{ tt('开启你的次元') }}</text>
				<text class="oc-empty-hint">{{ tt('创建第一个 OC 角色') }}</text>
				<view class="empty-btn">
					<text class="empty-btn-text">{{ tt('立即创建') }}</text>
				</view>
			</view>

			<!-- 虚拟人物立绘（全身/半身大图） -->
			<view v-else class="oc-vp-figure">
				<image v-if="isAvatarValid(currentOC)" :src="currentOC.avatar"
					class="oc-figure-img" mode="aspectFill" @error="onAvatarError(currentOC.id)" />
				<view v-else class="oc-figure-placeholder">
					<text class="oc-figure-emoji">{{ currentOC.emoji }}</text>
				</view>
				<!-- 角色名片（底部浮层） -->
				<view class="oc-vp-nameplate">
					<text class="oc-vp-name">{{ currentOC.name }}</text>
					<view class="oc-vp-subtitle-row">
						<text class="oc-vp-title">{{ currentOC.title }}</text>
						<view class="oc-vp-level">
							<text class="oc-vp-level-text">Lv.{{ currentOC.level }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 右侧悬浮按钮（模态框内部） -->
			<view class="oc-vp-actions">
				<view class="vp-action-btn" @click.stop="openFortune">
					<view class="vp-btn-icon" style="background: linear-gradient(135deg, #EDE9FE, #DDD6FE);">
						<text class="vp-icon">🔮</text>
					</view>
					<text class="vp-btn-label">{{ tt('运势') }}</text>
				</view>
				<view class="vp-action-btn" @click.stop="playVoiceLine">
					<view class="vp-btn-icon" style="background: linear-gradient(135deg, #FCE7F3, #FBCFE8);">
						<text class="vp-icon">🎵</text>
					</view>
					<text class="vp-btn-label">{{ tt('语音') }}</text>
				</view>
				<view class="vp-action-btn" @click.stop="openMemories">
					<view class="vp-btn-icon" style="background: linear-gradient(135deg, #EFF6FF, #DBEAFE);">
						<text class="vp-icon">📖</text>
					</view>
					<text class="vp-btn-label">{{ tt('记忆') }}</text>
				</view>
			</view>

			<!-- OC 切换指示器 -->
			<view v-if="ocList.length > 1" class="oc-vp-switcher">
				<view v-for="(oc, idx) in ocList" :key="'sw-'+oc.id"
					class="oc-switch-dot" :class="{ active: currentIndex === idx }"
					@click.stop="switchOC(idx)"></view>
			</view>
		</view>

		<!-- AI 生图 & 视频 -->
		<view class="section-wrap">
			<view class="section-header">
				<view class="section-title-row">
					<view class="section-accent"></view>
					<text class="section-title">{{ tt('AI 生成') }}</text>
				</view>
				<text class="section-desc">{{ tt('一键为你的 OC 生成专属图片与视频') }}</text>
			</view>
			<view class="gen-entry-row">
				<view class="gen-entry-card gen-card-image" @click="goGenerate('image')">
					<view class="gen-card-content">
						<view class="gen-card-icon-wrap">
							<text class="gen-card-icon">🖼️</text>
						</view>
						<text class="gen-card-name">{{ tt('生成图片') }}</text>
						<text class="gen-card-desc">{{ tt('AI 绘制 OC 立绘、场景插画') }}</text>
					</view>
				</view>
				<view class="gen-entry-card gen-card-video" @click="goGenerate('video')">
					<view class="gen-card-content">
						<view class="gen-card-icon-wrap">
							<text class="gen-card-icon">🎬</text>
						</view>
						<text class="gen-card-name">{{ tt('生成视频') }}</text>
						<text class="gen-card-desc">{{ tt('AI 制作动态立绘、短片') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- AI 创作 -->
		<view class="section-wrap">
			<view class="section-header">
				<view class="section-title-row">
					<view class="section-accent accent-blue"></view>
					<text class="section-title">{{ tt('AI 创作') }}</text>
				</view>
				<text class="section-desc">{{ tt('基于 OC 设定，自动生成精彩内容') }}</text>
			</view>
			<view class="ai-types">
				<view class="ai-type-card" v-for="item in aiTypes" :key="item.type" @click="openAISetup(item.type)">
					<view class="ai-card-inner" :style="{ background: item.grad }">
						<view class="ai-type-icon-wrap">
							<text class="ai-type-icon">{{ item.icon }}</text>
						</view>
						<view class="ai-type-info">
							<text class="ai-type-name">{{ item.name }}</text>
							<text class="ai-type-desc">{{ item.desc }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 功能入口：约稿广场 / OC 周边 / 线上论坛 -->
		<view class="section-wrap">
			<view class="section-header">
				<view class="section-title-row">
					<view class="section-accent accent-pink"></view>
					<text class="section-title">{{ tt('探索更多') }}</text>
				</view>
			</view>
			<view class="feature-grid">
				<!-- 约稿广场 -->
				<view class="feature-card" @click="goCommission">
					<view class="feature-card-bg feature-bg-commission"></view>
					<view class="feature-card-content">
						<view class="feature-icon-wrap feature-icon-commission">
							<text class="feature-icon">🎨</text>
						</view>
						<view class="feature-info">
							<text class="feature-name">{{ tt('约稿广场') }}</text>
							<text class="feature-desc">{{ tt('发布或接受约稿委托') }}</text>
						</view>
						<view class="feature-badge" v-if="commissionList.length">
							<text class="feature-badge-text">{{ commissionList.length }}</text>
						</view>
						<text class="feature-arrow">›</text>
					</view>
				</view>
				<!-- OC 周边 -->
				<view class="feature-card" @click="goShop">
					<view class="feature-card-bg feature-bg-shop"></view>
					<view class="feature-card-content">
						<view class="feature-icon-wrap feature-icon-shop">
							<text class="feature-icon">🛍️</text>
						</view>
						<view class="feature-info">
							<text class="feature-name">{{ tt('OC 周边') }}</text>
							<text class="feature-desc">{{ tt('定制专属角色周边商品') }}</text>
						</view>
						<view class="feature-badge" v-if="cartItems.length">
							<text class="feature-badge-text">{{ cartItems.length }}</text>
						</view>
						<text class="feature-arrow">›</text>
					</view>
				</view>
				<!-- 线上论坛 -->
				<view class="feature-card" @click="goForum">
					<view class="feature-card-bg feature-bg-forum"></view>
					<view class="feature-card-content">
						<view class="feature-icon-wrap feature-icon-forum">
							<text class="feature-icon">💬</text>
						</view>
						<view class="feature-info">
							<text class="feature-name">{{ tt('线上论坛') }}</text>
							<text class="feature-desc">{{ tt('与 OC 创作者交流分享') }}</text>
						</view>
						<text class="feature-arrow">›</text>
					</view>
				</view>
			</view>
		</view>

		<!-- AI 助手悬浮按钮 -->
		<view class="ai-assistant-fab" @click="openAssistant">
			<text class="ai-assistant-fab-icon">🤖</text>
			<text class="ai-assistant-fab-text">{{ tt('助手') }}</text>
		</view>

		<!-- 底部安全区 -->
		<view style="height: 180rpx;"></view>

		<!-- ===== 弹窗层 ===== -->

		<!-- 运势弹窗 -->
		<view class="modal-mask" v-if="showFortune" @click="showFortune = false">
			<view class="modal-card fortune-modal" @click.stop>
				<view class="fortune-header" :style="{ background: fortune.color + '15' }">
					<view class="fortune-glow" :style="{ background: fortune.color + '20' }"></view>
					<text class="fortune-big">{{ tt(fortune.level) }}</text>
				</view>
				<view class="fortune-body">
					<text class="fortune-desc">{{ tt(fortune.desc) }}</text>
					<view class="fortune-row">
						<text class="fortune-label">{{ tt('幸运色') }}</text>
						<view class="fortune-dot" :style="{ background: fortune.color }"></view>
						<text class="fortune-val">{{ tt(fortune.lucky) }}</text>
					</view>
					<view class="fortune-row">
						<text class="fortune-label">{{ tt('幸运数字') }}</text>
						<text class="fortune-val">{{ fortune.luckyNum }}</text>
					</view>
				</view>
				<view class="modal-close-btn" @click="showFortune = false">
					<text class="close-text">{{ tt('知道了') }}</text>
				</view>
			</view>
		</view>

		<!-- 语音弹窗 -->
		<view class="modal-mask" v-if="showVoice" @click="showVoice = false">
			<view class="modal-card voice-modal" @click.stop>
				<view class="voice-oc">
					<view class="voice-avatar" :style="{ background: currentOC.gradient }">
						<text class="voice-emoji">{{ currentOC.emoji }}</text>
					</view>
					<text class="voice-name">{{ currentOC.name }}</text>
				</view>
				<view class="voice-line-box">
					<text class="voice-quote">"</text>
					<text class="voice-text">{{ tt(voiceLine) }}</text>
					<text class="voice-quote">"</text>
				</view>
				<view class="voice-wave-bar">
					<view v-for="i in 20" :key="i" class="wave-stick"
						:style="{ animationDelay: i * 0.05 + 's', height: (Math.random() * 30 + 10) + 'rpx' }">
					</view>
				</view>
				<view class="modal-close-btn" @click="showVoice = false">
					<text class="close-text">{{ tt('关闭') }}</text>
				</view>
			</view>
		</view>

		<!-- 记忆弹窗 -->
		<view class="modal-mask" v-if="showMemory" @click="showMemory = false">
			<view class="modal-card memory-modal" @click.stop>
				<text class="modal-title">{{ tt('近期记忆') }}</text>
				<scroll-view scroll-y class="memory-list">
					<view v-for="mem in memories" :key="mem.id" class="memory-item">
						<text class="memory-emoji">{{ mem.emoji }}</text>
						<view class="memory-info">
							<text class="memory-text">{{ mem.text }}</text>
							<text class="memory-meta">{{ mem.oc }} · {{ mem.date }}</text>
						</view>
					</view>
					<view v-if="!memories.length" class="memory-empty">
						<text class="empty-text">{{ tt('还没有记忆...去和 OC 聊天创造回忆吧') }}</text>
					</view>
				</scroll-view>
				<view class="modal-close-btn" @click="showMemory = false">
					<text class="close-text">{{ tt('关闭') }}</text>
				</view>
			</view>
		</view>

		<!-- 心情编辑弹窗 -->
		<view class="modal-mask" v-if="showMoodEdit" @click="showMoodEdit = false">
			<view class="modal-card mood-modal" @click.stop>
				<text class="modal-title">{{ tt('编辑心情签名') }}</text>
				<view class="mood-input-wrap">
					<input v-model="moodDraft" :placeholder="tt('输入你的心情...')" placeholder-class="mood-placeholder"
						maxlength="30" />
				</view>
				<view class="mood-actions">
					<view class="mood-btn cancel" @click="showMoodEdit = false"><text>{{ tt('取消') }}</text></view>
					<view class="mood-btn confirm" @click="saveMood"><text>{{ tt('保存') }}</text></view>
				</view>
			</view>
		</view>

		<!-- AI 设定弹窗 -->
		<view class="modal-mask" v-if="showAISetup" @click="showAISetup = false">
			<view class="modal-card ai-setup-modal" @click.stop>
				<view class="ai-modal-header">
					<text class="ai-modal-type">{{ aiTypeLabel }}</text>
				</view>
				<scroll-view scroll-y class="ai-setup-body" :show-scrollbar="false">
					<view class="ai-setup-section">
						<text class="ai-setup-label">{{ tt('选择角色') }}</text>
						<scroll-view scroll-x class="ai-oc-scroll" :show-scrollbar="false">
							<view class="ai-oc-list">
								<view v-for="oc in ocList" :key="oc.id" class="ai-oc-chip"
									:class="{ active: aiSelectedOC && aiSelectedOC.id === oc.id }"
									@click="aiSelectedOC = oc">
									<view class="ai-oc-avatar"
										:style="{ background: isAvatarValid(oc) ? 'transparent' : oc.gradient }">
										<image v-if="isAvatarValid(oc)" :src="oc.avatar" class="ai-oc-avatar-img"
											mode="aspectFill" @error="onAvatarError(oc.id)" />
										<text v-else class="ai-oc-emoji">{{ oc.emoji }}</text>
									</view>
									<text class="ai-oc-name">{{ oc.name }}</text>
								</view>
							</view>
						</scroll-view>
					</view>
					<view class="ai-setup-section">
						<text class="ai-setup-label">{{ tt('创作要求（可选）') }}</text>
						<view class="ai-req-wrap">
							<textarea v-model="aiRequirement"
							 :placeholder="tt('例如：写一段关于雨夜冒险的故事、要求温馨治愈风格...')"
								placeholder-class="ai-req-placeholder" :auto-height="true" maxlength="200" />
						</view>
						<text class="ai-req-count">{{ aiRequirement.length }}/200</text>
					</view>
				</scroll-view>
				<view class="ai-setup-actions">
					<view class="ai-setup-cancel" @click="showAISetup = false">
						<text class="ai-cancel-text">{{ tt('取消') }}</text>
					</view>
					<view class="ai-setup-go" @click="doAIGenerate">
						<text class="ai-go-text">{{ tt('开始创作') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- AI 结果弹窗 -->
		<view class="modal-mask" v-if="showAI" @click="showAI = false">
			<view class="modal-card ai-modal" @click.stop>
				<view class="ai-modal-header">
					<text class="ai-modal-type">{{ aiTypeLabel }}</text>
					<text class="ai-modal-oc">{{ aiSelectedOC ? aiSelectedOC.emoji + ' ' + aiSelectedOC.name : ''
						}}</text>
				</view>
				<view class="ai-loading" v-if="aiLoading">
					<view class="ai-dots">
						<view class="ai-dot" v-for="i in 4" :key="i"
							:style="{ animationDelay: i * 0.15 + 's' }"></view>
					</view>
					<text class="ai-loading-text">{{ tt('AI 正在创作中...') }}</text>
				</view>
				<view class="ai-result-outer" v-else>
					<scroll-view scroll-y class="ai-result-scroll">
						<text class="ai-result-text">{{ aiResult }}</text>
					</scroll-view>
				</view>
				<view class="ai-modal-actions">
					<view class="ai-action" @click="copyAIResult"><text class="ai-action-text">{{ tt('复制') }}</text></view>
					<view class="ai-action" @click="regenAI"><text class="ai-action-text">{{ tt('重新生成') }}</text></view>
					<view class="ai-action close-action" @click="showAI = false"><text
							class="ai-action-text">{{ tt('关闭') }}</text></view>
				</view>
			</view>
		</view>

		<!-- AI 助手弹窗 -->
		<view class="modal-mask" v-if="showAssistant" @click="closeAssistant">
			<view class="modal-card assistant-modal" @click.stop>
				<view class="assistant-header">
					<view class="assistant-header-left">
						<text class="assistant-title">{{ tt('功能助手') }}</text>
						<text class="assistant-subtitle">{{ tt('问我怎么使用这个 App 的功能') }}</text>
					</view>
					<text class="assistant-clear-btn" @click="clearAssistantChat">{{ tt('清空') }}</text>
				</view>
				<scroll-view scroll-y class="assistant-scroll" :scroll-top="assistantScrollTop">
					<view
						v-for="(item, idx) in assistantMessages"
						:key="idx"
						class="assistant-message"
						:class="{ mine: item.role === 'user' }"
					>
						<text class="assistant-message-text">{{ item.role === 'assistant' ? tt(item.text) : item.text }}</text>
					</view>
					<view class="assistant-message" v-if="assistantLoading">
						<text class="assistant-message-text">{{ tt('正在思考中...') }}</text>
					</view>
				</scroll-view>
				<view class="assistant-input-bar">
					<input
						v-model="assistantInput"
						class="assistant-input"
					 :placeholder="tt('例如：怎么快速开始创建 OC？')"
						confirm-type="send"
						@confirm="sendAssistantMessage"
						maxlength="1000"
						autocomplete="off"
					/>
					<view class="assistant-send-btn" @click="sendAssistantMessage">
						<text class="assistant-send-text">{{ tt('发送') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- OC 预览弹窗 -->
		<view class="modal-mask" v-if="showOCPreview" @click="showOCPreview = false">
			<view class="modal-card oc-preview-modal" @click.stop>
				<!-- 紧凑横向头部 -->
				<view class="oc-preview-header" :style="{ background: previewOC.gradient }">
					<view class="oc-preview-avatar">
						<image v-if="isAvatarValid(previewOC)" :src="previewOC.avatar"
							class="oc-preview-avatar-img" mode="aspectFill"
							@error="onAvatarError(previewOC.id)" />
						<text v-else class="oc-preview-emoji">{{ previewOC.emoji }}</text>
					</view>
					<view class="oc-preview-info">
						<text class="oc-preview-name">{{ previewOC.name }}</text>
						<text class="oc-preview-title">{{ previewOC.title }} · Lv.{{ previewOC.level }}</text>
					</view>
				</view>
				<!-- 三列属性卡片 -->
				<view class="oc-preview-stats-grid">
				<view class="preview-stat-card" v-for="s in previewStats" :key="s.label">
						<text class="preview-stat-num">{{ s.value }}</text>
						<view class="preview-stat-bar-mini">
							<view class="preview-stat-fill-mini"
								:style="{ width: Math.max(s.value, 3) + '%', background: previewOC.barColor || '#A78BFA' }"></view>
						</view>
						<text class="preview-stat-name">{{ s.label }}</text>
					</view>
				</view>
				<!-- 可滚动内容区 -->
				<scroll-view scroll-y class="oc-preview-body">
					<view class="oc-preview-tags" v-if="previewOC.tags && previewOC.tags.length">
						<text v-for="tag in previewOC.tags" :key="tag" class="oc-preview-tag">{{ tag }}</text>
					</view>
					<text class="oc-preview-story" v-if="previewOC.story">{{ previewOC.story }}</text>
					<text class="oc-preview-story empty" v-else>{{ tt('还没有写背景故事...') }}</text>
				</scroll-view>
				<!-- 底部操作 -->
				<view class="oc-preview-actions">
					<view class="oc-preview-btn chat" @click="goChat(previewOC)">
						<text class="preview-btn-text">{{ tt('去聊天') }}</text>
					</view>
					<view class="oc-preview-btn edit" @click="goEdit(previewOC)">
						<text class="preview-btn-text">{{ tt('去编辑') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getHomeDashboard } from '../../utils/apis/home.js'
import { assistantChat, textGenerate } from '../../utils/apis/generation.js'
import { updateMe } from '../../utils/apis/user.js'
import { setTargetEditorTab } from '../../utils/store.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()
const pressedCard = ref(-1)
const currentIndex = ref(0)

const aiTypes = computed(() => [
	{ type: 'story', icon: '📜', name: tt('世界观故事'), desc: tt('根据世界观和角色生成冒险故事'), grad: 'linear-gradient(135deg, #7C3AED08, #A78BFA12)' },
	{ type: 'diary', icon: '📔', name: tt('角色日记'), desc: tt('以 OC 视角写一篇今日日记'), grad: 'linear-gradient(135deg, #EC489908, #F472B612)' },
	{ type: 'dialogue', icon: '💬', name: tt('角色对话'), desc: tt('生成 OC 之间的互动对话'), grad: 'linear-gradient(135deg, #3B82F608, #60A5FA12)' },
	{ type: 'poem', icon: '🌙', name: tt('诗歌散文'), desc: tt('以角色的情感写一段散文'), grad: 'linear-gradient(135deg, #F59E0B08, #FBBF2412)' },
])

const ocList = ref([])
const profile = ref({ nickname: '', mood: '', avatar: '', level: 1 })
const memories = ref([])
const cartItems = ref([])
const commissionList = ref([])

const avatarFailed = ref(new Set())
function onAvatarError(id) {
	avatarFailed.value = new Set([...avatarFailed.value, id])
}
function isAvatarValid(oc) {
	return oc.avatar && !avatarFailed.value.has(oc.id)
}

const showFortune = ref(false)
const showVoice = ref(false)
const showMemory = ref(false)
const showMoodEdit = ref(false)
const moodDraft = ref('')

const fortune = ref({ level: '', desc: '', color: '#FFB6C1', lucky: '', luckyNum: 0 })
const fortuneDrawn = ref(false)

const voiceLine = ref('')

const currentOC = ref({ name: '', emoji: '🌙', gradient: '', voiceLines: [] })
const assistantSeedText = '你好，我是功能助手。你可以问我：怎么创建 OC、怎么用 AI 创作、怎么发布约稿。'

async function loadData() {
	avatarFailed.value = new Set()
	try {
		const dashboard = await getHomeDashboard()
		profile.value = {
			nickname: dashboard.profile?.nickname || '',
			mood: dashboard.profile?.mood || '',
			avatar: dashboard.profile?.avatar || '',
			level: Number(dashboard.profile?.level || 1),
		}
		ocList.value = Array.isArray(dashboard.oc_list) ? dashboard.oc_list : []
		memories.value = Array.isArray(dashboard.memories) ? dashboard.memories : []
		cartItems.value = Array.isArray(dashboard.cart_summary?.items)
			? dashboard.cart_summary.items
			: []
		commissionList.value = Array.isArray(dashboard.commission_preview)
			? dashboard.commission_preview
			: []
		if (ocList.value.length) {
			currentOC.value = ocList.value[0]
		}
		if (dashboard.fortune_today) {
			fortune.value = {
				level: dashboard.fortune_today.level || '',
				desc: dashboard.fortune_today.desc || '',
				color: dashboard.fortune_today.color || '#A78BFA',
				lucky: dashboard.fortune_today.lucky || '',
				luckyNum: Number(dashboard.fortune_today.luckyNum || 0),
			}
			fortuneDrawn.value = true
		} else {
			fortuneDrawn.value = false
		}
	} catch (error) {
		ocList.value = []
		memories.value = []
		cartItems.value = []
		commissionList.value = []
		fortuneDrawn.value = false
		uni.showToast({ title: error.message || tt('首页加载失败'), icon: 'none' })
	}
}

onMounted(loadData)
onShow(loadData)
uni.$on('refreshIndex', () => {
	loadData()
})

function onSwiperChange(e) {
	currentIndex.value = e.detail.current
	if (ocList.value[currentIndex.value]) {
		currentOC.value = ocList.value[currentIndex.value]
	}
}

function particleStyle(i) {
	const size = 4 + (i * 7 + 3) % 9
	const left = (i * 5.3 + 2.7) % 100
	const delay = (i * 0.37) % 6
	const duration = 4 + (i * 0.53) % 4
	return {
		width: size + 'rpx',
		height: size + 'rpx',
		left: left + '%',
		animationDelay: delay + 's',
		animationDuration: duration + 's'
	}
}

const showOCPreview = ref(false)
const previewOC = ref({ name: '', emoji: '🌙', gradient: '', barColor: '', stats: { intimacy: 0, combat: 0, emotion: 0 }, tags: [], story: '', level: 1, title: '' })
const previewStats = ref([])

function openOCPreview(oc) {
	previewOC.value = oc
	previewStats.value = [
		{ label: tt('亲密度'), value: oc.stats.intimacy },
		{ label: tt('战斗力'), value: oc.stats.combat },
		{ label: tt('情感值'), value: oc.stats.emotion },
	]
	showOCPreview.value = true
}

function goChat(oc) {
	showOCPreview.value = false
	uni.setStorageSync('chatOCId', oc.id)
	uni.switchTab({ url: '/pages/chat/chat' })
}

function goEdit(oc) {
	showOCPreview.value = false
	uni.setStorageSync('viewOCId', oc.id)
	uni.switchTab({ url: '/pages/editor/editor' })
}

function goCreateOC() {
	uni.switchTab({ url: '/pages/editor/editor' })
}

function goEditorTab(tabIndex) {
	if (!ocList.value.length) {
		uni.showToast({ title: tt('请先创建一个 OC'), icon: 'none' })
		return
	}
	setTargetEditorTab(tabIndex)
	uni.switchTab({ url: '/pages/editor/editor' })
}
function goGenerate(type = 'image') {
	uni.navigateTo({ url: `/pages/sub/generate?type=${type}` })
}

function goShop() {
	uni.navigateTo({ url: '/pages/shop/shop' })
}
function goCommission() {
	uni.navigateTo({ url: '/pages/sub/commission' })
}
function goForum() {
	uni.navigateTo({ url: '/pages/sub/forum' })
}

function openFortune() {
	if (!fortuneDrawn.value) return
	showFortune.value = true
}

function playVoiceLine() {
	const oc = currentOC.value
	if (oc.voiceLines && oc.voiceLines.length) {
		voiceLine.value = oc.voiceLines[Math.floor(Math.random() * oc.voiceLines.length)]
	} else {
		voiceLine.value = '......(沉默)'
	}
	showVoice.value = true
}

function openMemories() {
	showMemory.value = true
}

function editMood() {
	moodDraft.value = profile.value.mood
	showMoodEdit.value = true
}

async function saveMood() {
	const value = moodDraft.value.trim()
	if (!value) {
		showMoodEdit.value = false
		return
	}
	try {
		const me = await updateMe({ mood: value })
		profile.value = {
			...profile.value,
			mood: me.mood || value,
		}
		uni.showToast({ title: tt('已保存'), icon: 'success' })
	} catch (error) {
		uni.showToast({ title: error.message || tt('保存失败'), icon: 'none' })
	}
	showMoodEdit.value = false
}

const showAISetup = ref(false)
const showAI = ref(false)
const aiLoading = ref(false)
const aiResult = ref('')
const aiTypeLabel = ref('')
const aiSelectedOC = ref(null)
const aiRequirement = ref('')
let lastAIType = ''

function openAISetup(type) {
	if (!ocList.value.length) {
		uni.showToast({ title: tt('请先创建一个 OC'), icon: 'none' })
		return
	}
	lastAIType = type
	const labels = { story: tt('世界观故事'), diary: tt('角色日记'), dialogue: tt('角色对话'), poem: tt('诗歌散文') }
	aiTypeLabel.value = labels[type] || tt('创作')
	aiSelectedOC.value = currentOC.value
	aiRequirement.value = ''
	showAISetup.value = true
}

async function doAIGenerate() {
	if (!aiSelectedOC.value) {
		uni.showToast({ title: tt('请选择一个角色'), icon: 'none' })
		return
	}
	showAISetup.value = false
	showAI.value = true
	aiLoading.value = true
	aiResult.value = ''
	try {
		const res = await textGenerate({
			mode: lastAIType,
			oc_id: aiSelectedOC.value.id,
			requirement: aiRequirement.value.trim(),
		})
		aiResult.value = res.content || ''
	} catch (error) {
		aiResult.value = ''
		uni.showToast({ title: error.message || tt('创作失败'), icon: 'none' })
	} finally {
		aiLoading.value = false
	}
}

function regenAI() {
	doAIGenerate()
}

function copyAIResult() {
	uni.setClipboardData({
		data: aiResult.value,
		success: () => setTimeout(() => uni.showToast({ title: tt('复制成功'), icon: 'success' }), 200)
	})
}

const showAssistant = ref(false)
const assistantLoading = ref(false)
const assistantInput = ref('')
const assistantScrollTop = ref(0)
const assistantMessages = ref([
	{ role: 'assistant', text: assistantSeedText }
])

function bumpAssistantScroll() {
	setTimeout(() => {
		assistantScrollTop.value = assistantScrollTop.value + 10000
	}, 20)
}

function openAssistant() {
	showAssistant.value = true
	bumpAssistantScroll()
}

function closeAssistant() {
	showAssistant.value = false
}

function clearAssistantChat() {
	uni.showModal({
		title: tt('清空聊天记录'),
		content: tt('确认清空所有聊天记录吗？'),
		confirmText: tt('清空'),
		confirmColor: '#EF4444',
		success: ({ confirm }) => {
			if (confirm) {
				assistantMessages.value = [
					{ role: 'assistant', text: assistantSeedText }
				]
			}
		}
	})
}

async function sendAssistantMessage() {
	const message = assistantInput.value.trim()
	if (!message || assistantLoading.value) return

	assistantMessages.value.push({ role: 'user', text: message })
	assistantInput.value = ''
	bumpAssistantScroll()
	assistantLoading.value = true
	try {
		const res = await assistantChat({ message })
		assistantMessages.value.push({
			role: 'assistant',
			text: res.content || tt('我暂时没有拿到回复，你可以换个问题试试。')
		})
	} catch (error) {
		assistantMessages.value.push({
			role: 'assistant',
			text: tt('AI 助手暂时不可用，请稍后再试。')
		})
		uni.showToast({ title: error.message || tt('助手请求失败'), icon: 'none' })
	} finally {
		assistantLoading.value = false
		bumpAssistantScroll()
	}
}
</script>

<style scoped>
/* ========== 基础页面 ========== */
.page {
	min-height: 100vh;
	position: relative;
	overflow-x: hidden;
	background: #F8F6FC;
}

/* ========== 极光背景 ========== */
.aurora-bg {
	position: fixed;
	top: 0; left: 0; width: 100%; height: 100%;
	pointer-events: none;
	z-index: 0;
	overflow: hidden;
}
.aurora-orb {
	position: absolute;
	border-radius: 50%;
	filter: blur(120rpx);
	opacity: 0.5;
}
.orb-1 {
	width: 500rpx; height: 500rpx;
	background: radial-gradient(circle, rgba(167,139,250,0.35), transparent 70%);
	top: -80rpx; right: -100rpx;
	animation: orbFloat1 12s ease-in-out infinite;
}
.orb-2 {
	width: 400rpx; height: 400rpx;
	background: radial-gradient(circle, rgba(244,114,182,0.25), transparent 70%);
	top: 30%; left: -80rpx;
	animation: orbFloat2 15s ease-in-out infinite;
}
.orb-3 {
	width: 350rpx; height: 350rpx;
	background: radial-gradient(circle, rgba(96,165,250,0.2), transparent 70%);
	bottom: 20%; right: -60rpx;
	animation: orbFloat3 18s ease-in-out infinite;
}
@keyframes orbFloat1 {
	0%, 100% { transform: translate(0, 0) scale(1); }
	33% { transform: translate(-40rpx, 60rpx) scale(1.1); }
	66% { transform: translate(30rpx, -30rpx) scale(0.95); }
}
@keyframes orbFloat2 {
	0%, 100% { transform: translate(0, 0) scale(1); }
	50% { transform: translate(50rpx, -40rpx) scale(1.08); }
}
@keyframes orbFloat3 {
	0%, 100% { transform: translate(0, 0) scale(1); }
	50% { transform: translate(-30rpx, 30rpx) scale(1.05); }
}

/* ========== 粒子 ========== */
.particles {
	position: fixed;
	top: 0; left: 0; width: 100%; height: 100%;
	pointer-events: none;
	z-index: 1;
	overflow: hidden;
}
.particle {
	position: absolute;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(167,139,250,0.5), rgba(244,114,182,0.3), transparent 70%);
	animation: floatUp 6s ease-in-out infinite;
	bottom: -20rpx;
	filter: blur(1px);
}
@keyframes floatUp {
	0% { transform: translateY(0) scale(1); opacity: 0; }
	10% { opacity: 0.7; }
	50% { opacity: 0.35; }
	90% { opacity: 0.1; }
	100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
}

/* ========== 导航栏 ========== */
.nav-bar {
	position: relative;
	z-index: 10;
	padding-bottom: 4rpx;
}
.nav-inner {
	padding: 20rpx 40rpx 24rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
}
.nav-brand {
	display: flex;
	align-items: center;
	gap: 20rpx;
}
.brand-mark {
	width: 64rpx; height: 64rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #A78BFA, #C084FC, #F472B6);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 6rpx 24rpx rgba(167,139,250,0.3);
}
.brand-icon {
	font-size: 30rpx;
	color: #fff;
}
.brand-text {
	display: flex;
	flex-direction: column;
	min-width: 0;
}
.nav-title {
	font-size: 38rpx;
	font-weight: 800;
	color: #1F2937;
	letter-spacing: 4rpx;
	line-height: 1.2;
}
.nav-subtitle {
	font-size: 20rpx;
	color: #9CA3AF;
	letter-spacing: 2rpx;
	font-weight: 400;
	margin-top: 2rpx;
}

/* ========== 个人资料 ========== */
.profile-section {
	position: relative;
	z-index: 10;
	padding: 8rpx 32rpx 16rpx;
}
.profile-card {
	display: flex;
	align-items: center;
	padding: 24rpx 28rpx;
	border-radius: 28rpx;
	background: rgba(255,255,255,0.65);
	backdrop-filter: blur(24px) saturate(1.4);
	border: 1rpx solid rgba(255,255,255,0.8);
	box-shadow: 0 4rpx 24rpx rgba(167,139,250,0.06), 0 1rpx 3rpx rgba(0,0,0,0.03);
}
.avatar-wrap {
	position: relative;
	width: 96rpx; height: 96rpx;
	flex-shrink: 0;
}
.avatar-ring {
	position: absolute;
	top: -4rpx; left: -4rpx;
	width: 104rpx; height: 104rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #A78BFA, #F472B6, #60A5FA);
	opacity: 0.6;
	animation: ringRotate 6s linear infinite;
}
@keyframes ringRotate {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
.avatar {
	position: relative;
	z-index: 2;
	width: 96rpx; height: 96rpx;
	border-radius: 50%;
	border: 4rpx solid #fff;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
}
.online-dot {
	position: absolute;
	z-index: 3;
	bottom: 4rpx; right: 4rpx;
	width: 20rpx; height: 20rpx;
	border-radius: 50%;
	background: #34D399;
	border: 4rpx solid #fff;
	box-shadow: 0 0 0 2rpx rgba(52,211,153,0.2);
}
.profile-info {
	margin-left: 24rpx;
	flex: 1;
	overflow: hidden;
}
.nickname {
	font-size: 30rpx;
	font-weight: 700;
	color: #1F2937;
	display: block;
	letter-spacing: 1rpx;
}
.mood-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-top: 6rpx;
}
.mood-dot {
	font-size: 24rpx;
	color: #C084FC;
	font-weight: 700;
}
.mood {
	font-size: 24rpx;
	color: #9CA3AF;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* ========== OC 虚拟人物视口 ========== */
.oc-viewport {
	position: relative;
	z-index: 10;
	height: 780rpx;
	margin: 20rpx 32rpx 0;
	border-radius: 36rpx;
	overflow: hidden;
	box-shadow:
		0 24rpx 64rpx rgba(0,0,0,0.15),
		0 8rpx 24rpx rgba(167,139,250,0.12);
}
.oc-vp-bg {
	position: absolute;
	inset: 0;
	z-index: 0;
}
.oc-vp-overlay {
	position: absolute;
	inset: 0;
	z-index: 1;
	background: linear-gradient(180deg,
		rgba(255,255,255,0.15) 0%,
		transparent 30%,
		transparent 55%,
		rgba(0,0,0,0.25) 100%);
}
.oc-vp-shine {
	position: absolute;
	top: -50%; left: -50%;
	width: 200%; height: 200%;
	background: linear-gradient(135deg, transparent 42%, rgba(255,255,255,0.08) 50%, transparent 58%);
	animation: shine 6s ease-in-out infinite;
	z-index: 2;
	pointer-events: none;
}

/* 空状态 */
.oc-vp-empty {
	position: relative;
	z-index: 5;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.empty-glow {
	position: absolute;
	top: 50%; left: 50%;
	transform: translate(-50%, -50%);
	width: 400rpx; height: 400rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(167,139,250,0.15), transparent 70%);
}
.oc-empty-icon {
	font-size: 72rpx;
	color: #C084FC;
	margin-bottom: 24rpx;
	position: relative;
}
.oc-empty-text {
	font-size: 36rpx;
	font-weight: 700;
	color: #374151;
	position: relative;
}
.oc-empty-hint {
	font-size: 26rpx;
	color: #9CA3AF;
	margin-top: 8rpx;
	position: relative;
}
.empty-btn {
	margin-top: 40rpx;
	padding: 20rpx 56rpx;
	border-radius: 40rpx;
	background: linear-gradient(135deg, #A78BFA, #C084FC);
	position: relative;
	box-shadow: 0 8rpx 24rpx rgba(167,139,250,0.3);
}
.empty-btn-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #fff;
	letter-spacing: 2rpx;
}

/* 虚拟人物立绘 */
.oc-vp-figure {
	position: relative;
	z-index: 3;
	width: 100%;
	height: 100%;
}
.oc-figure-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.oc-figure-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(160deg, rgba(167,139,250,0.08), rgba(192,132,252,0.08));
}
.oc-figure-emoji {
	font-size: 200rpx;
	opacity: 0.9;
}

/* 底部角色名片 */
.oc-vp-nameplate {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 6;
	padding: 48rpx 32rpx 32rpx;
	background: linear-gradient(180deg, transparent, rgba(0,0,0,0.55));
}
.oc-vp-name {
	font-size: 40rpx;
	font-weight: 800;
	color: #fff;
	text-shadow: 0 2rpx 16rpx rgba(0,0,0,0.4);
	letter-spacing: 4rpx;
	display: block;
}
.oc-vp-subtitle-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-top: 8rpx;
}
.oc-vp-title {
	font-size: 24rpx;
	color: rgba(255,255,255,0.8);
	letter-spacing: 2rpx;
}
.oc-vp-level {
	padding: 4rpx 16rpx;
	border-radius: 16rpx;
	background: rgba(255,255,255,0.2);
	backdrop-filter: blur(8px);
	border: 1rpx solid rgba(255,255,255,0.25);
}
.oc-vp-level-text {
	font-size: 20rpx;
	color: rgba(255,255,255,0.9);
	font-weight: 600;
}

/* 右侧悬浮按钮（模态框内部） */
.oc-vp-actions {
	position: absolute;
	right: 16rpx;
	top: 50%;
	transform: translateY(-50%);
	z-index: 8;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}
.vp-action-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6rpx;
	padding: 16rpx 12rpx;
	border-radius: 22rpx;
	background: rgba(255,255,255,0.75);
	backdrop-filter: blur(20px) saturate(1.4);
	border: 1rpx solid rgba(255,255,255,0.85);
	box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
	transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.vp-action-btn:active {
	transform: scale(0.9);
	background: rgba(255,255,255,0.9);
}
.vp-btn-icon {
	width: 56rpx; height: 56rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.vp-icon {
	font-size: 28rpx;
}
.vp-btn-label {
	font-size: 20rpx;
	font-weight: 600;
	color: #374151;
	letter-spacing: 1rpx;
}

/* OC 切换指示器（模态框内底部） */
.oc-vp-switcher {
	position: absolute;
	bottom: 20rpx;
	left: 50%;
	transform: translateX(-50%);
	z-index: 8;
	display: flex;
	gap: 10rpx;
}
.oc-switch-dot {
	width: 12rpx; height: 12rpx;
	border-radius: 6rpx;
	background: rgba(255,255,255,0.35);
	transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.oc-switch-dot.active {
	width: 32rpx;
	background: rgba(255,255,255,0.9);
	box-shadow: 0 2rpx 8rpx rgba(255,255,255,0.4);
}

/* 装饰星星 */
.card-star {
	position: absolute;
	z-index: 4;
	pointer-events: none;
}
.star-char {
	color: rgba(255,255,255,0.35);
}
.star-1 { top: 28rpx; right: 36rpx; }
.star-1 .star-char { font-size: 24rpx; animation: starTwinkle 3s ease-in-out infinite; }
.star-2 { top: 60rpx; right: 80rpx; }
.star-2 .star-char { font-size: 16rpx; animation: starTwinkle 3s ease-in-out infinite 0.8s; }
.star-3 { bottom: 100rpx; left: 28rpx; }
.star-3 .star-char { font-size: 28rpx; animation: starTwinkle 4s ease-in-out infinite 1.2s; }
@keyframes starTwinkle {
	0%, 100% { opacity: 0.25; transform: scale(0.8); }
	50% { opacity: 0.7; transform: scale(1.1); }
}
@keyframes shine {
	0% { transform: translateX(-100%) translateY(-100%); }
	100% { transform: translateX(100%) translateY(100%); }
}

/* (旧头像/轮播/属性面板样式已移除，使用新的 oc-viewport 布局) */

/* ========== 通用 section ========== */
.section-wrap {
	position: relative;
	z-index: 10;
	padding: 36rpx 32rpx 0;
}
.section-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 24rpx;
}
.section-title-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}
.section-accent {
	width: 6rpx; height: 32rpx;
	border-radius: 3rpx;
	background: linear-gradient(180deg, #A78BFA, #C084FC);
}
.section-accent.accent-pink {
	background: linear-gradient(180deg, #F472B6, #EC4899);
}
.section-accent.accent-blue {
	background: linear-gradient(180deg, #60A5FA, #3B82F6);
}
.section-title {
	font-size: 30rpx;
	font-weight: 800;
	color: #1F2937;
	letter-spacing: 2rpx;
}
.section-desc {
	font-size: 22rpx;
	color: #9CA3AF;
	display: block;
	margin-top: 6rpx;
	margin-left: 18rpx;
}
.section-more {
	display: flex;
	align-items: center;
	gap: 4rpx;
	padding: 8rpx 4rpx;
}
.more-text {
	font-size: 24rpx;
	color: #A78BFA;
	font-weight: 500;
}
.more-arrow {
	font-size: 28rpx;
	color: #A78BFA;
	font-weight: 300;
}

/* ========== AI 生成入口 ========== */
.gen-entry-row {
	display: flex;
	gap: 16rpx;
}
.gen-entry-card {
	flex: 1;
	border-radius: 24rpx;
	background: rgba(255,255,255,0.65);
	backdrop-filter: blur(20px) saturate(1.3);
	border: 1rpx solid rgba(255,255,255,0.75);
	overflow: hidden;
	box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03);
	transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
.gen-entry-card:active { transform: scale(0.97); }
.gen-card-content {
	display: flex; flex-direction: column;
	align-items: center;
	padding: 28rpx 16rpx 24rpx;
	gap: 12rpx;
}
.gen-card-icon-wrap {
	width: 72rpx; height: 72rpx;
	border-radius: 22rpx;
	display: flex; align-items: center; justify-content: center;
}
.gen-card-image .gen-card-icon-wrap {
	background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(167,139,250,0.08));
}
.gen-card-video .gen-card-icon-wrap {
	background: linear-gradient(135deg, rgba(236,72,153,0.12), rgba(249,115,22,0.08));
}
.gen-card-icon { font-size: 34rpx; }
.gen-card-name {
	font-size: 26rpx; font-weight: 700;
	color: #1F2937; display: block;
}
.gen-card-desc {
	font-size: 20rpx; color: #9CA3AF;
	display: block; text-align: center; line-height: 1.4;
}

/* ========== OC 创作 - 编辑器功能入口 ========== */
.editor-entry-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}
.editor-entry-card {
	width: calc(50% - 8rpx);
	border-radius: 24rpx;
	background: rgba(255,255,255,0.65);
	backdrop-filter: blur(20px) saturate(1.3);
	border: 1rpx solid rgba(255,255,255,0.75);
	overflow: hidden;
	transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03);
}
.editor-entry-card:last-child:nth-child(odd) {
	width: 100%;
}
.editor-entry-card:active {
	transform: scale(0.97);
}
.editor-entry-inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 28rpx 16rpx 24rpx;
	gap: 12rpx;
}
.editor-entry-icon-wrap {
	width: 72rpx; height: 72rpx;
	border-radius: 22rpx;
	background: linear-gradient(135deg, rgba(167,139,250,0.12), rgba(244,114,182,0.08));
	display: flex;
	align-items: center;
	justify-content: center;
}
.editor-entry-icon {
	font-size: 34rpx;
}
.editor-entry-info {
	text-align: center;
}
.editor-entry-name {
	font-size: 26rpx;
	font-weight: 700;
	color: #1F2937;
	display: block;
}
.editor-entry-desc {
	font-size: 20rpx;
	color: #9CA3AF;
	display: block;
	margin-top: 4rpx;
	line-height: 1.4;
}

/* ========== AI 创作 ========== */
.ai-types {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}
.ai-type-card {
	border-radius: 24rpx;
	background: rgba(255,255,255,0.65);
	backdrop-filter: blur(20px) saturate(1.3);
	border: 1rpx solid rgba(255,255,255,0.75);
	overflow: hidden;
	transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03);
}
.ai-type-card:active {
	transform: scale(0.98);
}
.ai-card-inner {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 28rpx;
}
.ai-type-icon-wrap {
	width: 76rpx; height: 76rpx;
	border-radius: 22rpx;
	background: linear-gradient(135deg, rgba(167,139,250,0.1), rgba(244,114,182,0.08));
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.ai-type-icon {
	font-size: 36rpx;
}
.ai-type-info {
	flex: 1;
}
.ai-type-name {
	font-size: 28rpx;
	font-weight: 700;
	color: #1F2937;
	display: block;
}
.ai-type-desc {
	font-size: 22rpx;
	color: #9CA3AF;
	display: block;
	margin-top: 6rpx;
	line-height: 1.4;
}

/* ========== 功能入口网格 ========== */
.feature-grid {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}
.feature-card {
	position: relative;
	border-radius: 24rpx;
	background: rgba(255,255,255,0.7);
	backdrop-filter: blur(20px) saturate(1.3);
	border: 1rpx solid rgba(255,255,255,0.75);
	overflow: hidden;
	transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03);
}
.feature-card:active { transform: scale(0.98); }
.feature-card-bg {
	position: absolute;
	top: 0; right: 0;
	width: 200rpx; height: 100%;
	opacity: 0.06;
	pointer-events: none;
}
.feature-bg-commission { background: linear-gradient(135deg, transparent 30%, #EC4899); }
.feature-bg-shop { background: linear-gradient(135deg, transparent 30%, #3B82F6); }
.feature-bg-forum { background: linear-gradient(135deg, transparent 30%, #10B981); }
.feature-card-content {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 28rpx;
	position: relative;
	z-index: 1;
}
.feature-icon-wrap {
	width: 76rpx; height: 76rpx;
	border-radius: 22rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.feature-icon-commission { background: linear-gradient(135deg, rgba(244,114,182,0.12), rgba(236,72,153,0.08)); }
.feature-icon-shop { background: linear-gradient(135deg, rgba(96,165,250,0.12), rgba(59,130,246,0.08)); }
.feature-icon-forum { background: linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.08)); }
.feature-icon { font-size: 36rpx; }
.feature-info { flex: 1; min-width: 0; }
.feature-name {
	font-size: 28rpx;
	font-weight: 700;
	color: #1F2937;
	display: block;
}
.feature-desc {
	font-size: 22rpx;
	color: #9CA3AF;
	display: block;
	margin-top: 4rpx;
}
.feature-badge {
	width: 36rpx; height: 36rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #A78BFA, #C084FC);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	box-shadow: 0 4rpx 12rpx rgba(167,139,250,0.25);
}
.feature-badge-text {
	font-size: 20rpx;
	font-weight: 700;
	color: #fff;
}
.feature-arrow {
	font-size: 36rpx;
	color: #D1D5DB;
	font-weight: 300;
	flex-shrink: 0;
}

/* ========== AI 助手悬浮按钮 ========== */
.ai-assistant-fab {
	position: fixed;
	right: 30rpx;
	bottom: 140rpx;
	width: 112rpx;
	height: 112rpx;
	border-radius: 56rpx;
	background: linear-gradient(135deg, #3B82F6, #7C3AED);
	box-shadow: 0 16rpx 36rpx rgba(59, 130, 246, 0.28);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	z-index: 90;
}
.ai-assistant-fab:active {
	transform: scale(0.95);
}
.ai-assistant-fab-icon {
	font-size: 30rpx;
	line-height: 1;
}
.ai-assistant-fab-text {
	font-size: 18rpx;
	color: #fff;
	font-weight: 700;
	margin-top: 5rpx;
	letter-spacing: 1rpx;
}

/* ========== AI 助手弹窗 ========== */
.assistant-modal {
	max-height: 78vh;
	display: flex;
	flex-direction: column;
}
.assistant-header {
	padding: 30rpx 30rpx 16rpx;
	background: linear-gradient(180deg, rgba(59,130,246,0.08), rgba(124,58,237,0.04));
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.assistant-header-left {
	display: flex;
	flex-direction: column;
}
.assistant-clear-btn {
	font-size: 24rpx;
	color: #9CA3AF;
	padding: 8rpx 12rpx;
}
.assistant-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #1F2937;
	display: block;
}
.assistant-subtitle {
	font-size: 22rpx;
	color: #6B7280;
	display: block;
	margin-top: 8rpx;
}
.assistant-scroll {
	flex: 1;
	min-height: 0;
	padding: 16rpx 22rpx;
	-webkit-overflow-scrolling: touch;
}
.assistant-message {
	max-width: 88%;
	padding: 16rpx 18rpx;
	border-radius: 16rpx;
	margin-bottom: 14rpx;
	background: rgba(99, 102, 241, 0.08);
}
.assistant-message.mine {
	margin-left: auto;
	background: rgba(59, 130, 246, 0.16);
}
.assistant-message-text {
	font-size: 25rpx;
	color: #1F2937;
	line-height: 1.6;
	white-space: pre-wrap;
	word-break: break-all;
}
.assistant-input-bar {
	display: flex;
	align-items: center;
	gap: 14rpx;
	padding: 18rpx 22rpx 24rpx;
	border-top: 1rpx solid rgba(0,0,0,0.05);
	flex-shrink: 0;
}
.assistant-input {
	flex: 1;
	height: 72rpx;
	border-radius: 14rpx;
	background: rgba(0,0,0,0.03);
	padding: 0 18rpx;
	font-size: 26rpx;
	color: #1F2937;
}
.assistant-send-btn {
	height: 72rpx;
	padding: 0 24rpx;
	border-radius: 14rpx;
	background: linear-gradient(135deg, #3B82F6, #7C3AED);
	display: flex;
	align-items: center;
	justify-content: center;
}
.assistant-send-text {
	font-size: 24rpx;
	color: #fff;
	font-weight: 700;
}

/* ========== 弹窗通用 ========== */
.modal-mask {
	position: fixed;
	top: 0; left: 0; width: 100%; height: 100%;
	background: rgba(15,10,30,0.45);
	backdrop-filter: blur(12px) saturate(1.2);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	box-sizing: border-box;
}
.modal-card {
	width: 100%;
	max-width: 620rpx;
	max-height: 85vh;
	background: rgba(255,255,255,0.97);
	backdrop-filter: blur(40px) saturate(1.8);
	border-radius: 36rpx;
	overflow: hidden;
	box-shadow:
		0 32rpx 80rpx rgba(0,0,0,0.12),
		0 8rpx 24rpx rgba(167,139,250,0.06);
	border: 1rpx solid rgba(255,255,255,0.6);
	display: flex;
	flex-direction: column;
}
.modal-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #1F2937;
	display: block;
	text-align: center;
	padding: 36rpx 32rpx 20rpx;
	flex-shrink: 0;
}
.modal-close-btn {
	text-align: center;
	padding: 28rpx;
	border-top: 1rpx solid rgba(0,0,0,0.04);
	flex-shrink: 0;
}
.close-text {
	font-size: 28rpx;
	color: #A78BFA;
	font-weight: 600;
}

/* ========== 运势弹窗 ========== */
.fortune-modal {
	max-height: 80vh;
}
.fortune-header {
	text-align: center;
	padding: 48rpx 32rpx 28rpx;
	position: relative;
	overflow: hidden;
	flex-shrink: 0;
}
.fortune-glow {
	position: absolute;
	top: 50%; left: 50%;
	transform: translate(-50%, -50%);
	width: 300rpx; height: 300rpx;
	border-radius: 50%;
	filter: blur(40rpx);
}
.fortune-big {
	font-size: 72rpx;
	font-weight: 800;
	color: #7C3AED;
	position: relative;
	text-shadow: 0 4rpx 16rpx rgba(124,58,237,0.15);
}
.fortune-body {
	padding: 24rpx 40rpx 28rpx;
	flex: 1;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
}
.fortune-desc {
	font-size: 28rpx; color: #6B7280;
	line-height: 1.8; display: block;
	margin-bottom: 28rpx;
}
.fortune-row {
	display: flex; align-items: center;
	margin-bottom: 16rpx;
}
.fortune-label { font-size: 24rpx; color: #9CA3AF; width: 130rpx; flex-shrink: 0; }
.fortune-dot {
	width: 24rpx; height: 24rpx;
	border-radius: 50%;
	margin-right: 12rpx;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}
.fortune-val { font-size: 26rpx; font-weight: 600; color: #374151; }

/* ========== 语音弹窗 ========== */
.voice-modal {
	max-height: 80vh;
}
.voice-oc {
	display: flex; flex-direction: column;
	align-items: center; padding: 40rpx 32rpx 20rpx;
	flex-shrink: 0;
}
.voice-avatar {
	width: 96rpx; height: 96rpx; border-radius: 50%;
	display: flex; align-items: center; justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1);
}
.voice-emoji { font-size: 44rpx; }
.voice-name { font-size: 28rpx; font-weight: 700; color: #1F2937; margin-top: 14rpx; }
.voice-line-box {
	padding: 16rpx 40rpx 24rpx; text-align: center;
	flex: 1;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
}
.voice-quote { font-size: 48rpx; color: #E5E7EB; font-family: Georgia, serif; }
.voice-text { font-size: 28rpx; color: #6B7280; line-height: 1.8; display: block; margin: 8rpx 0; }
.voice-wave-bar {
	display: flex; justify-content: center;
	gap: 6rpx; padding: 0 40rpx 24rpx;
	align-items: flex-end; height: 60rpx;
	flex-shrink: 0;
}
.wave-stick {
	width: 5rpx;
	background: linear-gradient(180deg, #A78BFA, #C084FC);
	border-radius: 3rpx;
	animation: waveAnim 0.8s ease-in-out infinite alternate;
}
@keyframes waveAnim { 0% { height: 10rpx; } 100% { height: 40rpx; } }

/* ========== 记忆弹窗 ========== */
.memory-modal {
	max-height: 80vh;
}
.memory-list {
	flex: 1;
	min-height: 0;
	max-height: none;
	padding: 0 28rpx;
	-webkit-overflow-scrolling: touch;
}
.memory-item {
	display: flex; align-items: flex-start;
	padding: 20rpx 12rpx;
	border-bottom: 1rpx solid rgba(0,0,0,0.03);
}
.memory-emoji { font-size: 36rpx; margin-right: 16rpx; flex-shrink: 0; margin-top: 4rpx; }
.memory-info { flex: 1; min-width: 0; }
.memory-text { font-size: 26rpx; color: #374151; display: block; line-height: 1.6; word-break: break-all; }
.memory-meta { font-size: 22rpx; color: #9CA3AF; display: block; margin-top: 8rpx; }
.memory-empty { padding: 60rpx 0; text-align: center; }
.empty-text { font-size: 26rpx; color: #D1D5DB; }

/* ========== 心情弹窗 ========== */
.mood-modal {
	max-height: 70vh;
}
.mood-input-wrap {
	margin: 16rpx 32rpx 24rpx;
	background: rgba(0,0,0,0.02);
	border-radius: 16rpx;
	padding: 22rpx 24rpx;
	border: 1rpx solid rgba(0,0,0,0.04);
	transition: border-color 0.3s;
	flex-shrink: 0;
}
.mood-input-wrap input { font-size: 28rpx; color: #374151; }
.mood-placeholder { color: #D1D5DB; }
.mood-actions {
	display: flex;
	border-top: 1rpx solid rgba(0,0,0,0.04);
	flex-shrink: 0;
}
.mood-btn { flex: 1; text-align: center; padding: 28rpx 0; font-size: 28rpx; }
.mood-btn.cancel text { color: #9CA3AF; }
.mood-btn.confirm text { color: #7C3AED; font-weight: 600; }
.mood-btn:not(:last-child) { border-right: 1rpx solid rgba(0,0,0,0.04); }

/* ========== AI 弹窗 ========== */
.ai-setup-modal {
	max-height: 82vh;
}
.ai-modal {
	max-height: 82vh;
}
.ai-modal-header {
	text-align: center;
	padding: 32rpx 32rpx 20rpx;
	background: linear-gradient(180deg, rgba(167,139,250,0.06), transparent);
	flex-shrink: 0;
}
.ai-modal-type { font-size: 30rpx; font-weight: 700; color: #1F2937; display: block; }
.ai-modal-oc { font-size: 24rpx; color: #A78BFA; display: block; margin-top: 8rpx; }

.ai-setup-body {
	flex: 1;
	min-height: 0;
	-webkit-overflow-scrolling: touch;
}
.ai-setup-section {
	padding: 16rpx 32rpx;
}
.ai-setup-label { font-size: 26rpx; font-weight: 600; color: #6B7280; display: block; margin-bottom: 16rpx; }
.ai-oc-scroll { white-space: nowrap; }
.ai-oc-list { display: inline-flex; gap: 16rpx; }
.ai-oc-chip {
	display: inline-flex; flex-direction: column;
	align-items: center; width: 120rpx;
	padding: 16rpx 8rpx; border-radius: 20rpx;
	background: rgba(0,0,0,0.02);
	border: 2rpx solid rgba(0,0,0,0.03);
	flex-shrink: 0; transition: all 0.25s;
}
.ai-oc-chip.active {
	background: linear-gradient(135deg, rgba(167,139,250,0.1), rgba(244,114,182,0.08));
	border-color: rgba(167,139,250,0.35);
	box-shadow: 0 2rpx 12rpx rgba(167,139,250,0.1);
}
.ai-oc-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.ai-oc-avatar-img { width: 64rpx; height: 64rpx; border-radius: 50%; }
.ai-oc-emoji { font-size: 28rpx; }
.ai-oc-name {
	font-size: 22rpx; color: #374151; font-weight: 600;
	margin-top: 8rpx; overflow: hidden; text-overflow: ellipsis;
	white-space: nowrap; max-width: 100rpx; text-align: center;
}
.ai-oc-chip.active .ai-oc-name { color: #7C3AED; }
.ai-req-wrap {
	background: rgba(0,0,0,0.02);
	border-radius: 16rpx;
	padding: 22rpx 24rpx;
	border: 1rpx solid rgba(0,0,0,0.04);
}
.ai-req-wrap textarea {
	font-size: 28rpx; color: #374151;
	line-height: 1.6;
	min-height: 100rpx;
	max-height: 200rpx;
	width: 100%;
}
.ai-req-placeholder { color: #D1D5DB; }
.ai-req-count { font-size: 22rpx; color: #D1D5DB; display: block; text-align: right; margin-top: 8rpx; }
.ai-setup-actions {
	display: flex;
	border-top: 1rpx solid rgba(0,0,0,0.04);
	flex-shrink: 0;
}
.ai-setup-cancel { flex: 1; text-align: center; padding: 28rpx 0; }
.ai-cancel-text { font-size: 28rpx; color: #9CA3AF; }
.ai-setup-go {
	flex: 1; text-align: center; padding: 28rpx 0;
	background: linear-gradient(135deg, rgba(167,139,250,0.06), rgba(244,114,182,0.04));
}
.ai-go-text { font-size: 28rpx; color: #7C3AED; font-weight: 700; }
.ai-loading {
	display: flex; flex-direction: column;
	align-items: center; padding: 60rpx 0;
	flex: 1;
}
.ai-dots { display: flex; gap: 12rpx; }
.ai-dot {
	width: 14rpx; height: 14rpx; border-radius: 50%;
	background: linear-gradient(135deg, #A78BFA, #C084FC);
	animation: aiDotPulse 1.2s ease-in-out infinite;
}
@keyframes aiDotPulse { 0%, 100% { transform: scale(0.5); opacity: 0.3; } 50% { transform: scale(1); opacity: 1; } }
.ai-loading-text { font-size: 24rpx; color: #A78BFA; margin-top: 20rpx; }
.ai-result-outer {
	flex: 1;
	min-height: 0;
	overflow: hidden;
}
.ai-result-scroll {
	height: 52vh;
	max-height: 52vh;
	padding: 24rpx 32rpx;
	-webkit-overflow-scrolling: touch;
	box-sizing: border-box;
}
.ai-result-text { font-size: 28rpx; color: #374151; line-height: 1.8; display: block; white-space: pre-wrap; word-break: break-all; }
.ai-modal-actions {
	display: flex;
	border-top: 1rpx solid rgba(0,0,0,0.04);
	flex-shrink: 0;
}
.ai-action { flex: 1; text-align: center; padding: 26rpx 0; }
.ai-action:not(:last-child) { border-right: 1rpx solid rgba(0,0,0,0.04); }
.ai-action-text { font-size: 28rpx; color: #7C3AED; font-weight: 600; }
.close-action .ai-action-text { color: #9CA3AF; }

/* ========== OC 预览弹窗 ========== */
.oc-preview-modal {
	width: 100%;
	max-width: 640rpx;
	max-height: 82vh;
	border-radius: 36rpx;
	overflow: hidden;
}

/* 紧凑横向头部 */
.oc-preview-header {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 28rpx 28rpx 24rpx;
	flex-shrink: 0;
}
.oc-preview-avatar {
	width: 88rpx; height: 88rpx; border-radius: 50%;
	background: rgba(255,255,255,0.15);
	display: flex; align-items: center; justify-content: center;
	border: 3rpx solid rgba(255,255,255,0.4);
	overflow: hidden;
	box-shadow: 0 6rpx 24rpx rgba(0,0,0,0.15);
	flex-shrink: 0;
}
.oc-preview-avatar-img { width: 88rpx; height: 88rpx; border-radius: 50%; }
.oc-preview-emoji { font-size: 42rpx; }
.oc-preview-info {
	flex: 1;
	min-width: 0;
}
.oc-preview-name {
	font-size: 32rpx; font-weight: 800; color: #fff;
	text-shadow: 0 2rpx 12rpx rgba(0,0,0,0.25);
	letter-spacing: 2rpx;
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.oc-preview-title {
	font-size: 22rpx; color: rgba(255,255,255,0.8);
	margin-top: 6rpx; letter-spacing: 1rpx;
	display: block;
}

/* 三列属性卡片 */
.oc-preview-stats-grid {
	display: flex;
	gap: 12rpx;
	padding: 0 24rpx 20rpx;
	flex-shrink: 0;
}
.preview-stat-card {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16rpx 8rpx 14rpx;
	border-radius: 18rpx;
	background: rgba(167,139,250,0.04);
	border: 1rpx solid rgba(167,139,250,0.08);
}
.preview-stat-num {
	font-size: 36rpx;
	font-weight: 800;
	color: #7C3AED;
	line-height: 1.1;
	font-variant-numeric: tabular-nums;
}
.preview-stat-bar-mini {
	width: 80%;
	height: 6rpx;
	background: rgba(167,139,250,0.08);
	border-radius: 3rpx;
	overflow: hidden;
	margin: 10rpx 0 8rpx;
}
.preview-stat-fill-mini {
	height: 100%;
	border-radius: 3rpx;
	transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.preview-stat-name {
	font-size: 20rpx;
	color: #9CA3AF;
	font-weight: 500;
}

/* 可滚动内容区 */
.oc-preview-body {
	flex: 1;
	min-height: 0;
	max-height: none;
	padding: 0 28rpx 20rpx;
	-webkit-overflow-scrolling: touch;
}
.oc-preview-tags {
	display: flex; flex-wrap: wrap; gap: 10rpx;
	margin-bottom: 16rpx;
}
.oc-preview-tag {
	font-size: 22rpx; color: #8B5CF6;
	padding: 6rpx 18rpx;
	background: rgba(139,92,246,0.06);
	border-radius: 14rpx;
	border: 1rpx solid rgba(139,92,246,0.1);
}
.oc-preview-story {
	font-size: 26rpx; color: #6B7280;
	line-height: 1.8; display: block;
}
.oc-preview-story.empty { color: #C9B8E8; font-style: italic; }

/* 底部操作栏 */
.oc-preview-actions {
	display: flex;
	border-top: 1rpx solid rgba(0,0,0,0.04);
	flex-shrink: 0;
}
.oc-preview-btn {
	flex: 1; text-align: center;
	padding: 26rpx 0;
	transition: background 0.2s;
}
.oc-preview-btn:active { background: rgba(167,139,250,0.03); }
.oc-preview-btn:not(:last-child) { border-right: 1rpx solid rgba(0,0,0,0.04); }
.oc-preview-btn.chat .preview-btn-text { color: #7C3AED; font-size: 28rpx; font-weight: 700; }
.oc-preview-btn.edit .preview-btn-text { color: #EC4899; font-size: 28rpx; font-weight: 700; }
</style>
