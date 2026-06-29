<script>
	import { ensureDevAuthSession, isLoggedIn } from './utils/store.js'
	import { initLocale } from './utils/i18n.js'
	export default {
		onLaunch: function() {
			console.log('App Launch')
			initLocale()
			ensureDevAuthSession()
			// 已登录则直接跳到主页
			if (isLoggedIn()) {
				uni.switchTab({ url: '/pages/index/index' })
			}
		},
		onShow: function() {
			console.log('App Show')
			initLocale()
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局公共样式 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB',
			'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif;
		background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%);
		color: #374151;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-rendering: optimizeLegibility;
		font-feature-settings: 'kern' 1, 'liga' 1;
		letter-spacing: 0.2px;
	}

	/* 全局 box-sizing 防止 padding 撑破容器 */
	view, text, scroll-view, swiper, input, textarea, image {
		box-sizing: border-box;
	}

	/* 全局平滑过渡 */
	view, text {
		-webkit-user-select: none;
		user-select: none;
	}

	/* 滚动条美化 */
	::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
	}

	/* 全局过渡动画基础 */
	input, textarea {
		transition: border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* 全局输入框聚焦发光 */
	input:focus, textarea:focus {
		outline: none;
	}

	/* 全局弹窗进入动画 */
	.modal-mask {
		animation: modalFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.modal-card, .modal-box {
		animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes modalFadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes modalSlideUp {
		from { opacity: 0; transform: translateY(40rpx) scale(0.95); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	/* 全局卡片悬浮效果基础 */
	.glass-card-hover:active {
		transform: scale(0.97);
		transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
</style>
