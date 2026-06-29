<template>
	<view class="page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack"><text class="back-icon">‹</text></view>
			<text class="nav-title">{{ t('page.forum') }}</text>
			<view class="nav-right nav-action-group">
				<LangSwitch />
				<view class="compose-btn" @click="openCompose"><text class="compose-icon">✏️</text></view>
			</view>
		</view>

		<view class="tab-row">
			<view
				v-for="(t, i) in tabs"
				:key="t"
				class="tab-chip"
				:class="{ active: activeTab === i }"
				@click="changeTab(i)"
			>
				<text class="tab-label">{{ tt(t) }}</text>
			</view>
		</view>

		<scroll-view scroll-y class="feed" @scrolltolower="loadMore">
			<view v-if="!posts.length && loadedOnce" class="empty-state">
				<text class="empty-icon">{{ loadError ? '🔒' : '📭' }}</text>
				<text class="empty-title">{{ loadError || tt('还没有帖子，快来发第一条吧！') }}</text>
			</view>

			<view v-for="post in posts" :key="post.id" class="post-card">
				<view class="post-header">
					<view class="post-avatar-wrap">
						<image
							v-if="isImageAvatar(post.author_avatar)"
							:src="post.author_avatar"
							class="post-avatar-img"
							mode="aspectFill"
						/>
						<text v-else class="post-avatar">{{ avatarText(post.author_avatar, post.author_name) }}</text>
					</view>
					<view class="post-meta">
						<text class="post-author">{{ post.author_name }}</text>
						<text class="post-time">{{ timeAgo(toTimestamp(post.created_at)) }}</text>
					</view>
					<view class="post-menu" v-if="post.can_delete" @click.stop="deletePost(post)">
						<text class="menu-dot">···</text>
					</view>
				</view>

				<text class="post-content" @click="openDetail(post)">{{ post.content }}</text>

				<view class="post-tags" v-if="post.tags.length">
					<text v-for="tag in post.tags" :key="tag" class="ptag"># {{ tag }}</text>
				</view>

				<view class="post-actions">
					<view class="action-item" @click="toggleLike(post)">
						<text class="action-icon">{{ post.liked_by_me ? '❤️' : '🤍' }}</text>
						<text class="action-num">{{ post.like_count || '' }}</text>
					</view>
					<view class="action-item" @click="openDetail(post)">
						<text class="action-icon">💬</text>
						<text class="action-num">{{ post.comment_count || '' }}</text>
					</view>
					<view class="action-item" @click="sharePost(post)">
						<text class="action-icon">↗</text>
					</view>
				</view>
			</view>

			<view class="feed-end">
				<text class="feed-end-text">{{ feedEndText }}</text>
			</view>
			<view style="height: 40rpx;"></view>
		</scroll-view>

		<view class="modal-mask" v-if="showCompose" @click="showCompose = false">
			<view class="modal-card compose-modal" @click.stop>
				<view class="compose-header">
					<text class="compose-cancel" @click="showCompose = false">{{ tt('取消') }}</text>
					<text class="compose-title">{{ tt('发布新帖') }}</text>
					<view class="compose-send" :class="{ active: composeDraft.trim() }" @click="submitPost">
						<text class="compose-send-text">{{ tt('发布') }}</text>
					</view>
				</view>
				<view class="compose-body">
					<textarea
						v-model="composeDraft"
					 :placeholder="tt('分享你的 OC 故事、创作心得、联动需求...')"
						placeholder-class="compose-placeholder"
						:auto-height="true"
						maxlength="500"
						focus
					/>
					<text class="compose-count">{{ composeDraft.length }}/500</text>
				</view>
				<view class="compose-tags">
					<text class="compose-tags-label">{{ tt('选择标签') }}</text>
					<view class="compose-tag-list">
						<view
							v-for="tag in allTags"
							:key="tag"
							class="compose-tag"
							:class="{ active: selectedTags.includes(tag) }"
							@click="toggleTag(tag)"
						>
							<text>{{ tt(tag) }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="modal-mask" v-if="showDetail" @click="showDetail = false">
			<view class="modal-card detail-modal" @click.stop>
				<scroll-view scroll-y class="detail-scroll">
					<view class="detail-post">
						<view class="post-header">
							<view class="post-avatar-wrap">
								<image
									v-if="isImageAvatar(detailPost.author_avatar)"
									:src="detailPost.author_avatar"
									class="post-avatar-img"
									mode="aspectFill"
								/>
								<text v-else class="post-avatar">{{ avatarText(detailPost.author_avatar, detailPost.author_name) }}</text>
							</view>
							<view class="post-meta">
								<text class="post-author">{{ detailPost.author_name }}</text>
								<text class="post-time">{{ timeAgo(toTimestamp(detailPost.created_at)) }}</text>
							</view>
							<view class="post-menu" v-if="detailPost.can_delete" @click.stop="deletePost(detailPost)">
								<text class="menu-dot">···</text>
							</view>
						</view>
						<text class="detail-content">{{ detailPost.content }}</text>
						<view class="post-tags" v-if="detailPost.tags.length">
							<text v-for="tag in detailPost.tags" :key="tag" class="ptag"># {{ tag }}</text>
						</view>
						<view class="post-actions detail-actions">
							<view class="action-item" @click="toggleLike(detailPost)">
								<text class="action-icon">{{ detailPost.liked_by_me ? '❤️' : '🤍' }}</text>
								<text class="action-num">{{ detailPost.like_count || '' }}</text>
							</view>
							<view class="action-item">
								<text class="action-icon">💬</text>
								<text class="action-num">{{ detailPost.comment_count || '' }}</text>
							</view>
						</view>
					</view>

					<view class="comments-section">
						<text class="comments-title">{{ tt('评论') }} ({{ detailPost.comment_count }})</text>
						<view v-if="detailLoading" class="detail-loading">
							<text class="detail-loading-text">{{ tt('正在加载评论...') }}</text>
						</view>
						<template v-else>
							<view v-for="comment in detailPost.comments" :key="comment.id" class="comment-item">
								<view class="comment-left">
									<view class="comment-avatar-wrap">
										<image
											v-if="isImageAvatar(comment.author_avatar)"
											:src="comment.author_avatar"
											class="comment-avatar-img"
											mode="aspectFill"
										/>
										<text v-else class="comment-avatar">{{ avatarText(comment.author_avatar, comment.author_name) }}</text>
									</view>
								</view>
								<view class="comment-body">
									<view class="comment-top">
										<text class="comment-author">{{ comment.author_name }}</text>
										<text class="comment-time">{{ timeAgo(toTimestamp(comment.created_at)) }}</text>
									</view>
									<text class="comment-text">{{ comment.content }}</text>
									<view class="comment-actions">
										<view class="comment-like" @click="toggleCommentLike(comment)">
											<text>{{ comment.liked_by_me ? '❤️' : '🤍' }}</text>
											<text class="cl-num">{{ comment.like_count || '' }}</text>
										</view>
										<text class="comment-reply-btn" @click="replyTo(comment)">{{ tt('回复') }}</text>
									</view>
								</view>
							</view>
							<view v-if="!detailPost.comments.length" class="no-comments">
								<text class="no-comments-text">{{ tt('还没有评论，说点什么吧~') }}</text>
							</view>
						</template>
					</view>
					<view style="height: 120rpx;"></view>
				</scroll-view>

				<view class="comment-bar">
					<view class="comment-input-wrap">
						<input
							v-model="commentDraft"
							:placeholder="commentPlaceholder"
							placeholder-class="compose-placeholder"
							@confirm="submitComment"
							confirm-type="send"
						/>
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
import { computed, onMounted, ref, watch } from 'vue'
import { timeAgo } from '../../utils/helpers.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'
import { getAuthUser, getUserProfile, isLoggedIn } from '../../utils/store.js'
import {
	createForumComment,
	createForumPost,
	deleteForumPost as deleteForumPostApi,
	getForumPostDetail,
	getForumPosts,
	toggleForumCommentLike as toggleForumCommentLikeApi,
	toggleForumPostLike as toggleForumPostLikeApi,
} from '../../utils/apis/forum.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()
const PAGE_SIZE = 10

const tabs = ['全部', '创作分享', '求联动', '世界观', '周边', '闲聊']
const allTags = ['创作分享', '立绘', '求联动', '世界观', '设定分享', '周边', '手办', '文旅活动', '线下', '日常', '闲聊']

const activeTab = ref(0)
const posts = ref([])
const currentPage = ref(0)
const hasMore = ref(true)
const loading = ref(false)
const loadingMore = ref(false)
const loadedOnce = ref(false)
const loadError = ref('')

const showCompose = ref(false)
const composeDraft = ref('')
const selectedTags = ref([])

const showDetail = ref(false)
const detailLoading = ref(false)
const detailPost = ref(createEmptyPost())
const commentDraft = ref('')
const replyTarget = ref(null)

const commentPlaceholder = computed(() => {
	return replyTarget.value ? `${tt('回复')} ${replyTarget.value.author_name}...` : tt('写评论...')
})

const activeTag = computed(() => {
	return activeTab.value === 0 ? '' : tabs[activeTab.value]
})

const feedEndText = computed(() => {
	if (!loadedOnce.value || (loading.value && !posts.value.length)) return tt('正在加载帖子...')
	if (loadError.value && !posts.value.length) return loadError.value
	if (!posts.value.length) return tt('还没有帖子，快来发第一条吧！')
	if (loadingMore.value) return tt('正在加载更多...')
	return hasMore.value ? tt('上拉加载更多') : tt('— 已经到底了 —')
})

function createEmptyPost() {
	return {
		id: 0,
		user_id: 0,
		author_name: '',
		author_avatar: '',
		content: '',
		tags: [],
		created_at: '',
		updated_at: '',
		like_count: 0,
		comment_count: 0,
		liked_by_me: false,
		can_delete: false,
		comments: [],
	}
}

function toTimestamp(value) {
	if (!value) return Date.now()
	const timestamp = typeof value === 'number' ? value : Date.parse(value)
	return Number.isNaN(timestamp) ? Date.now() : timestamp
}

function isImageAvatar(value) {
	if (!value) return false
	return /^(https?:|data:|blob:|wxfile:|file:|\/|_doc\/|content:|[A-Za-z]:\\)/.test(value)
}

function avatarText(avatar, name) {
	if (avatar && !isImageAvatar(avatar)) return avatar
	return (name || '').trim().slice(0, 1) || '👤'
}

function normalizeComment(raw = {}) {
	return {
		id: raw.id || 0,
		post_id: raw.post_id || 0,
		user_id: raw.user_id || 0,
		author_name: raw.author_name || '',
		author_avatar: raw.author_avatar || '',
		content: raw.content || '',
		created_at: raw.created_at || '',
		updated_at: raw.updated_at || '',
		like_count: Number(raw.like_count || 0),
		liked_by_me: !!raw.liked_by_me,
	}
}

function normalizePost(raw = {}) {
	return {
		id: raw.id || 0,
		user_id: raw.user_id || 0,
		author_name: raw.author_name || '',
		author_avatar: raw.author_avatar || '',
		content: raw.content || '',
		tags: Array.isArray(raw.tags) ? raw.tags : [],
		created_at: raw.created_at || '',
		updated_at: raw.updated_at || '',
		like_count: Number(raw.like_count || 0),
		comment_count: Number(raw.comment_count || 0),
		liked_by_me: !!raw.liked_by_me,
		can_delete: !!raw.can_delete,
		comments: Array.isArray(raw.comments) ? raw.comments.map(normalizeComment) : [],
	}
}

function ensureLoggedIn(showToast = true) {
	if (isLoggedIn()) return true
	if (showToast) {
		uni.showToast({ title: tt('请先登录'), icon: 'none' })
	}
	return false
}

function buildAuthorSnapshot() {
	const profile = getUserProfile()
	const authUser = getAuthUser()
	return {
		author_name: (profile.nickname || authUser?.username || tt('新契约者')).trim(),
		author_avatar: (profile.avatar || '').trim() || null,
	}
}

function patchListPost(postId, updater) {
	posts.value = posts.value.map(post => {
		if (post.id !== postId) return post
		return updater(post)
	})
}

function syncPostSummary(post) {
	patchListPost(post.id, current => ({
		...current,
		content: post.content,
		tags: post.tags,
		created_at: post.created_at,
		updated_at: post.updated_at,
		like_count: post.like_count,
		comment_count: post.comment_count,
		liked_by_me: post.liked_by_me,
		can_delete: post.can_delete,
		author_name: post.author_name,
		author_avatar: post.author_avatar,
	}))
}

async function fetchPosts(reset = false) {
	if (!ensureLoggedIn(false)) {
		posts.value = []
		currentPage.value = 0
		hasMore.value = false
		loadedOnce.value = true
		loadError.value = tt('请先登录后查看论坛')
		return
	}
	if (loading.value || loadingMore.value) return
	if (!reset && !hasMore.value) return

	const targetPage = reset ? 1 : currentPage.value + 1
	loadError.value = ''
	if (reset) loading.value = true
	else loadingMore.value = true

	try {
		const response = await getForumPosts({
			page: targetPage,
			size: PAGE_SIZE,
			...(activeTag.value ? { tag: activeTag.value } : {}),
		})
		const items = Array.isArray(response.items) ? response.items.map(normalizePost) : []
		posts.value = reset ? items : [...posts.value, ...items]
		currentPage.value = targetPage
		hasMore.value = targetPage < Number(response.pagination?.total_pages || 0)
		loadedOnce.value = true
	} catch (error) {
		loadError.value = error.message || tt('加载失败')
		if (reset) {
			posts.value = []
			currentPage.value = 0
			hasMore.value = false
		}
		loadedOnce.value = true
		uni.showToast({ title: loadError.value, icon: 'none' })
	} finally {
		loading.value = false
		loadingMore.value = false
	}
}

async function fetchDetail(postId) {
	if (!ensureLoggedIn(false)) return
	detailLoading.value = true
	try {
		const response = await getForumPostDetail(postId)
		detailPost.value = normalizePost(response)
		syncPostSummary(detailPost.value)
	} catch (error) {
		uni.showToast({ title: error.message || tt('加载详情失败'), icon: 'none' })
	} finally {
		detailLoading.value = false
	}
}

function changeTab(index) {
	if (activeTab.value === index) return
	activeTab.value = index
}

function openCompose() {
	if (!ensureLoggedIn()) return
	composeDraft.value = ''
	selectedTags.value = []
	showCompose.value = true
}

function toggleTag(tag) {
	const index = selectedTags.value.indexOf(tag)
	if (index >= 0) {
		selectedTags.value.splice(index, 1)
		return
	}
	if (selectedTags.value.length >= 3) {
		uni.showToast({ title: tt('最多选择 3 个标签'), icon: 'none' })
		return
	}
	selectedTags.value.push(tag)
}

async function submitPost() {
	if (!ensureLoggedIn()) return
	const content = composeDraft.value.trim()
	if (!content) return

	try {
		await createForumPost({
			content,
			tags: [...selectedTags.value],
			...buildAuthorSnapshot(),
		})
		showCompose.value = false
		composeDraft.value = ''
		selectedTags.value = []
		uni.showToast({ title: tt('发布成功'), icon: 'none' })
		await fetchPosts(true)
	} catch (error) {
		uni.showToast({ title: error.message || tt('发布失败'), icon: 'none' })
	}
}

async function openDetail(post) {
	if (!ensureLoggedIn()) return
	detailPost.value = normalizePost(post)
	commentDraft.value = ''
	replyTarget.value = null
	showDetail.value = true
	await fetchDetail(post.id)
}

async function toggleLike(post) {
	if (!ensureLoggedIn()) return
	try {
		const response = await toggleForumPostLikeApi(post.id)
		patchListPost(post.id, current => ({
			...current,
			liked_by_me: !!response.liked,
			like_count: Number(response.like_count || 0),
		}))
		if (detailPost.value.id === post.id) {
			detailPost.value = {
				...detailPost.value,
				liked_by_me: !!response.liked,
				like_count: Number(response.like_count || 0),
			}
		}
	} catch (error) {
		uni.showToast({ title: error.message || tt('操作失败'), icon: 'none' })
	}
}

function deletePost(post) {
	if (!post.can_delete) return
	uni.showModal({
		title: tt('删除帖子'),
		content: tt('确定删除这条帖子？'),
		confirmColor: '#ef4444',
		success: async res => {
			if (!res.confirm) return
			try {
				await deleteForumPostApi(post.id)
				posts.value = posts.value.filter(item => item.id !== post.id)
				if (detailPost.value.id === post.id) {
					showDetail.value = false
					detailPost.value = createEmptyPost()
				}
				uni.showToast({ title: tt('已删除'), icon: 'none' })
			} catch (error) {
				uni.showToast({ title: error.message || tt('删除失败'), icon: 'none' })
			}
		},
	})
}

async function toggleCommentLike(comment) {
	if (!ensureLoggedIn()) return
	try {
		const response = await toggleForumCommentLikeApi(comment.id)
		detailPost.value = {
			...detailPost.value,
			comments: detailPost.value.comments.map(item => {
				if (item.id !== comment.id) return item
				return {
					...item,
					liked_by_me: !!response.liked,
					like_count: Number(response.like_count || 0),
				}
			}),
		}
	} catch (error) {
		uni.showToast({ title: error.message || tt('操作失败'), icon: 'none' })
	}
}

function replyTo(comment) {
	replyTarget.value = comment
}

async function submitComment() {
	if (!ensureLoggedIn()) return
	const text = commentDraft.value.trim()
	if (!text || !detailPost.value.id) return

	const prefix = replyTarget.value ? `${tt('回复')} @${replyTarget.value.author_name}：` : ''
	try {
		const response = await createForumComment(detailPost.value.id, {
			content: `${prefix}${text}`,
			...buildAuthorSnapshot(),
		})
		const comment = normalizeComment(response)
		detailPost.value = {
			...detailPost.value,
			comment_count: detailPost.value.comment_count + 1,
			comments: [...detailPost.value.comments, comment],
		}
		syncPostSummary(detailPost.value)
		commentDraft.value = ''
		replyTarget.value = null
		uni.showToast({ title: tt('评论成功'), icon: 'none' })
	} catch (error) {
		uni.showToast({ title: error.message || tt('评论失败'), icon: 'none' })
	}
}

function sharePost(post) {
	uni.setClipboardData({
		data: `【${post.author_name}】${post.content.slice(0, 50)}... —— ${tt('来自论坛')}`,
		success: () => uni.showToast({ title: tt('已复制分享文案'), icon: 'none' }),
	})
}

function loadMore() {
	if (loading.value || loadingMore.value || !hasMore.value) return
	fetchPosts(false)
}

function goBack() {
	uni.navigateBack()
}

watch(activeTab, () => {
	fetchPosts(true)
})

onMounted(() => {
	fetchPosts(true)
})
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); }

.nav-bar { position: relative; display: flex; align-items: center; justify-content: center; padding-bottom: 16rpx; background: rgba(237,231,246,0.95); backdrop-filter: blur(28px) saturate(1.5); border-bottom: 2rpx solid transparent; border-image: linear-gradient(90deg, rgba(167,139,250,0.01), rgba(192,132,252,0.18), rgba(167,139,250,0.01)) 1; }
.nav-left { position: absolute; left: 20rpx; bottom: 16rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 52rpx; color: #c084fc; font-weight: 300; }
.nav-title { font-size: 34rpx; font-weight: 800; color: #374151; margin-top: 20rpx; letter-spacing: 2rpx; }
.nav-right { position: absolute; right: 24rpx; bottom: 16rpx; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.nav-action-group { width: auto; gap: 12rpx; }
.compose-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.compose-icon { font-size: 32rpx; }

.tab-row { display: flex; padding: 16rpx 24rpx; gap: 12rpx; overflow-x: auto; white-space: nowrap; }
.tab-chip { padding: 10rpx 28rpx; border-radius: 28rpx; background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); border: 1rpx solid rgba(255,255,255,0.6); flex-shrink: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.tab-chip.active { background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); border-color: transparent; box-shadow: 0 6rpx 24rpx rgba(192,132,252,0.35), 0 2rpx 8rpx rgba(167,139,250,0.15); }
.tab-label { font-size: 24rpx; color: #6b7280; font-weight: 600; }
.tab-chip.active .tab-label { color: #fff; }

.feed { height: calc(100vh - 200rpx); padding: 0; }
.empty-state { padding: 120rpx 40rpx; text-align: center; }
.empty-icon { display: block; font-size: 88rpx; margin-bottom: 20rpx; }
.empty-title { font-size: 28rpx; color: #9ca3af; line-height: 1.7; display: block; }

.post-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px) saturate(1.3); border-radius: 28rpx; padding: 28rpx; margin: 0 24rpx 20rpx; border: 1rpx solid rgba(255,255,255,0.6); box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.04), 0 8rpx 24rpx rgba(167,139,250,0.06), 0 16rpx 40rpx rgba(192,132,252,0.04); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.post-card:active { transform: scale(0.97); box-shadow: 0 2rpx 6rpx rgba(167,139,250,0.03), 0 4rpx 12rpx rgba(167,139,250,0.04); }

.post-header { display: flex; align-items: center; margin-bottom: 16rpx; }
.post-avatar-wrap { width: 68rpx; height: 68rpx; border-radius: 50%; background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(255,182,193,0.2)); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.post-avatar-img { width: 68rpx; height: 68rpx; border-radius: 50%; }
.post-avatar { font-size: 32rpx; }
.post-meta { flex: 1; margin-left: 16rpx; }
.post-author { font-size: 28rpx; font-weight: 700; color: #374151; display: block; letter-spacing: 1rpx; }
.post-time { font-size: 22rpx; color: #b4a0d6; display: block; margin-top: 2rpx; }
.post-menu { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.post-menu:active { background: rgba(0,0,0,0.04); }
.menu-dot { font-size: 28rpx; color: #b4a0d6; letter-spacing: 2rpx; }

.post-content { font-size: 28rpx; color: #374151; line-height: 1.7; display: block; white-space: pre-wrap; word-break: break-all; }
.post-tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 16rpx; }
.ptag { font-size: 22rpx; color: #c084fc; padding: 6rpx 18rpx; background: rgba(167,139,250,0.06); border-radius: 12rpx; box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.06); }

.post-actions { display: flex; gap: 40rpx; margin-top: 20rpx; padding-top: 16rpx; border-top: 1rpx solid rgba(0,0,0,0.03); }
.detail-actions { border-bottom: 1rpx solid rgba(0,0,0,0.04); padding-bottom: 20rpx; }
.action-item { display: flex; align-items: center; gap: 8rpx; }
.action-item:active { opacity: 0.6; }
.action-icon { font-size: 28rpx; }
.action-num { font-size: 24rpx; color: #9ca3af; }

.feed-end { text-align: center; padding: 48rpx 24rpx; }
.feed-end-text { font-size: 24rpx; color: #c4b5d8; letter-spacing: 2rpx; }

.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: flex-end; justify-content: center; }
.modal-card { width: 100%; background: rgba(255,255,255,0.97); backdrop-filter: blur(40px) saturate(1.8); border-radius: 40rpx 40rpx 0 0; overflow: hidden; max-height: 85vh; }

.compose-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid rgba(0,0,0,0.04); }
.compose-cancel { font-size: 28rpx; color: #9ca3af; }
.compose-title { font-size: 30rpx; font-weight: 700; color: #374151; letter-spacing: 2rpx; }
.compose-send { background: rgba(167,139,250,0.15); border-radius: 20rpx; padding: 10rpx 32rpx; position: relative; overflow: hidden; }
.compose-send.active { background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); }
.compose-send.active::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 20rpx 20rpx 0 0; }
.compose-send-text { font-size: 26rpx; color: #a78bfa; font-weight: 600; position: relative; z-index: 1; }
.compose-send.active .compose-send-text { color: #fff; }

.compose-body { padding: 24rpx 32rpx 0; position: relative; }
.compose-body textarea { font-size: 30rpx; color: #374151; line-height: 1.7; min-height: 240rpx; width: 100%; background: rgba(237,231,246,0.3); backdrop-filter: blur(20px) saturate(1.2); border-radius: 20rpx; padding: 20rpx; box-sizing: border-box; border: 2rpx solid rgba(167,139,250,0.08); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.compose-body textarea:focus { border-color: rgba(167,139,250,0.3); box-shadow: 0 0 0 6rpx rgba(167,139,250,0.08); }
.compose-placeholder { color: #d1d5db; }
.compose-count { position: absolute; bottom: 8rpx; right: 40rpx; font-size: 22rpx; color: #d1d5db; }

.compose-tags { padding: 16rpx 32rpx 32rpx; }
.compose-tags-label { font-size: 24rpx; color: #9ca3af; display: block; margin-bottom: 12rpx; letter-spacing: 2rpx; }
.compose-tag-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.compose-tag { padding: 10rpx 26rpx; border-radius: 20rpx; background: rgba(0,0,0,0.03); border: 2rpx solid rgba(0,0,0,0.04); font-size: 24rpx; color: #6b7280; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.compose-tag.active { background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.3); color: #a78bfa; font-weight: 600; box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.1); }

.detail-modal { max-height: 90vh; display: flex; flex-direction: column; }
.detail-scroll { flex: 1; overflow-y: auto; }
.detail-post { padding: 28rpx 32rpx; }
.detail-content { font-size: 30rpx; color: #374151; line-height: 1.8; display: block; white-space: pre-wrap; word-break: break-all; margin-bottom: 16rpx; }
.detail-loading { padding: 32rpx 0 8rpx; text-align: center; }
.detail-loading-text { font-size: 24rpx; color: #b4a0d6; }

.comments-section { padding: 0 32rpx; }
.comments-title { font-size: 28rpx; font-weight: 700; color: #374151; display: block; margin-bottom: 20rpx; letter-spacing: 2rpx; }
.comment-item { display: flex; margin-bottom: 24rpx; }
.comment-left { margin-right: 16rpx; flex-shrink: 0; }
.comment-avatar-wrap { width: 56rpx; height: 56rpx; border-radius: 50%; background: rgba(167,139,250,0.1); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.comment-avatar-img { width: 56rpx; height: 56rpx; border-radius: 50%; }
.comment-avatar { font-size: 28rpx; line-height: 56rpx; text-align: center; }
.comment-body { flex: 1; }
.comment-top { display: flex; align-items: center; gap: 12rpx; margin-bottom: 6rpx; }
.comment-author { font-size: 26rpx; font-weight: 600; color: #374151; }
.comment-time { font-size: 20rpx; color: #d1d5db; }
.comment-text { font-size: 28rpx; color: #4b5563; line-height: 1.6; display: block; white-space: pre-wrap; word-break: break-all; }
.comment-actions { display: flex; align-items: center; gap: 28rpx; margin-top: 10rpx; }
.comment-like { display: flex; align-items: center; gap: 6rpx; font-size: 22rpx; }
.cl-num { font-size: 22rpx; color: #9ca3af; }
.comment-reply-btn { font-size: 22rpx; color: #a78bfa; font-weight: 600; }

.no-comments { padding: 56rpx 0; text-align: center; }
.no-comments-text { font-size: 28rpx; color: #c4b5d8; letter-spacing: 2rpx; }

.comment-bar { display: flex; align-items: center; padding: 16rpx 24rpx; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px) saturate(1.3); border-top: 1rpx solid rgba(0,0,0,0.04); padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); }
.comment-input-wrap { flex: 1; background: rgba(237,231,246,0.35); backdrop-filter: blur(20px) saturate(1.2); border-radius: 32rpx; padding: 16rpx 24rpx; border: 2rpx solid rgba(167,139,250,0.06); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.comment-input-wrap:focus-within { border-color: rgba(167,139,250,0.25); box-shadow: 0 0 0 6rpx rgba(167,139,250,0.06); }
.comment-input-wrap input { font-size: 28rpx; color: #374151; }
.comment-send { margin-left: 16rpx; padding: 12rpx 28rpx; border-radius: 24rpx; background: rgba(0,0,0,0.04); position: relative; overflow: hidden; }
.comment-send.active { background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); }
.comment-send.active::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent); border-radius: 24rpx 24rpx 0 0; }
.cs-text { font-size: 26rpx; color: #9ca3af; font-weight: 600; position: relative; z-index: 1; }
.comment-send.active .cs-text { color: #fff; }
</style>
