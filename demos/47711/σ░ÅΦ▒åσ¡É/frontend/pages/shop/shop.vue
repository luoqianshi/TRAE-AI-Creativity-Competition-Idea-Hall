<template>
	<view class="page">
		<!-- 粒子背景 -->
		<view class="particles">
			<view v-for="i in 15" :key="i" class="particle" :style="particleStyle(i)"></view>
		</view>

		<!-- 顶部导航 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack">
				<text class="nav-back">←</text>
			</view>
			<text class="nav-title">{{ t('page.shop') }}</text>
			<view class="nav-actions">
				<LangSwitch />
				<view class="nav-right" @click="showCartPanel = true">
					<text class="cart-icon">🛒</text>
					<view v-if="cartCount > 0" class="cart-badge">
						<text class="badge-text">{{ cartCount }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 商品列表 -->
		<scroll-view scroll-y class="product-scroll" :style="{ paddingTop: (statusBarHeight + 50) + 'px' }">
			<view class="shop-banner">
				<text class="banner-emoji">🛍️</text>
				<text class="banner-title">{{ tt('OC 周边定制') }}</text>
				<text class="banner-desc">{{ tt('让你的角色走进现实世界') }}</text>
			</view>

			<view class="product-grid">
				<view v-for="p in products" :key="p.id" class="product-card" @click="openDetail(p)">
					<view class="product-emoji-wrap">
						<text class="product-emoji">{{ p.emoji }}</text>
					</view>
					<text class="product-name">{{ tt(p.name) }}</text>
					<view class="product-bottom">
						<text class="product-price">¥{{ p.price }}</text>
						<view class="add-btn" @click.stop="openDetail(p)">
							<text class="add-btn-text">+</text>
						</view>
					</view>
				</view>
			</view>

			<view style="height: 200rpx;"></view>
		</scroll-view>

		<!-- 底部购物车栏 -->
		<view class="cart-bar" v-if="cartCount > 0 && !showDesigner && !showPreview">
			<view class="cart-bar-left" @click="showCartPanel = true">
				<text class="cart-bar-icon">🛒</text>
				<view class="cart-bar-badge">
					<text class="badge-text">{{ cartCount }}</text>
				</view>
				<text class="cart-bar-total">¥{{ cartTotal }}</text>
			</view>
			<view class="cart-bar-btn" @click="checkout">
				<text class="cart-bar-btn-text">{{ tt('去结算') }}</text>
			</view>
		</view>

		<!-- ===== Step 1: 商品详情弹窗 ===== -->
		<view class="modal-mask" v-if="showDetail" @click="showDetail = false">
			<view class="modal-card detail-modal" @click.stop>
				<view class="detail-top" :style="{ background: 'linear-gradient(135deg, rgba(255,182,193,0.3), rgba(167,139,250,0.3))' }">
					<text class="detail-emoji">{{ detailProduct.emoji }}</text>
				</view>
				<view class="detail-body">
					<text class="detail-name">{{ tt(detailProduct.name) }}</text>
					<text class="detail-desc">{{ tt(detailProduct.desc) }}</text>
					<view class="detail-price-row">
						<text class="detail-price">¥{{ detailProduct.price }}</text>
						<text class="detail-status">{{ tt(detailProduct.status) }}</text>
					</view>
				</view>
				<view class="detail-actions">
					<view class="detail-btn cancel" @click="showDetail = false"><text>{{ tt('取消') }}</text></view>
					<view class="detail-btn confirm" @click="enterDesigner">
						<text>{{ detailProduct.isVipDemo ? tt('加入购物车') : tt('开始设计') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== Step 2: 设计编辑器（全屏） ===== -->
		<view class="designer-layer" v-if="showDesigner">
			<view class="designer-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
				<view class="designer-nav-left" @click="exitDesigner">
					<text class="nav-back">←</text>
				</view>
				<text class="designer-nav-title">{{ tt(detailProduct.name) }}</text>
				<view class="designer-nav-right"></view>
			</view>

			<view class="designer-body">
				<!-- 设计画布 -->
				<view class="canvas-wrapper">
					<text class="canvas-label">{{ tt(detailProduct.printArea.label) }}</text>
					<view class="canvas-area" :class="'shape-' + detailProduct.printArea.shape"
						:style="{ width: detailProduct.printArea.width + 'rpx', height: detailProduct.printArea.height + 'rpx' }">
						<!-- 底部网格参考线 -->
						<view class="canvas-grid"></view>
						<!-- 商品 emoji 水印 -->
						<text class="canvas-watermark">{{ detailProduct.emoji }}</text>

						<!-- 可拖拽/缩放图片 -->
						<movable-area v-if="designImage" class="movable-zone"
							:style="{ width: detailProduct.printArea.width + 'rpx', height: detailProduct.printArea.height + 'rpx' }">
							<movable-view direction="all" :x="designX" :y="designY"
								:scale="true" :scale-min="0.3" :scale-max="3" :scale-value="designScale"
								@change="onMoveChange" @scale="onScaleChange"
								class="movable-img-wrap"
								:style="{ width: imgDisplaySize + 'rpx', height: imgDisplaySize + 'rpx' }">
								<image :src="designImage" mode="aspectFit" class="design-img"
									:style="{ width: imgDisplaySize + 'rpx', height: imgDisplaySize + 'rpx' }"></image>
							</movable-view>
						</movable-area>

						<!-- 空状态提示 -->
						<view v-if="!designImage" class="canvas-empty" @click="chooseImage">
							<text class="canvas-empty-icon">📷</text>
							<text class="canvas-empty-text">{{ tt('点击上传 OC 图片') }}</text>
						</view>
					</view>
				</view>

				<!-- 操作提示 -->
				<view class="design-tips" v-if="designImage">
					<text class="tip-text">{{ tt('👆 拖拽移动 · 双指缩放') }}</text>
				</view>

				<!-- 底部操作栏 -->
				<view class="designer-toolbar">
					<view class="toolbar-btn upload-btn" @click="chooseImage">
						<text class="toolbar-btn-icon">📷</text>
						<text class="toolbar-btn-text">{{ designImage ? tt('换一张') : tt('上传图片') }}</text>
					</view>
					<view class="toolbar-btn save-btn" :class="{ disabled: !designImage }" @click="saveDesign">
						<text class="toolbar-btn-icon">💾</text>
						<text class="toolbar-btn-text">{{ tt('保存设计') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== Step 3: 预览确认（全屏） ===== -->
		<view class="preview-layer" v-if="showPreview">
			<view class="preview-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
				<view class="designer-nav-left" @click="backToDesigner">
					<text class="nav-back">←</text>
				</view>
				<text class="designer-nav-title">{{ tt('预览效果') }}</text>
				<view class="designer-nav-right"></view>
			</view>

			<view class="preview-body">
				<view class="preview-product-name">
					<text class="preview-emoji">{{ detailProduct.emoji }}</text>
					<text class="preview-name-text">{{ tt(detailProduct.name) }}</text>
				</view>

				<!-- 预览画布（不可拖拽） -->
				<view class="preview-canvas-wrapper">
					<view class="canvas-area preview-canvas" :class="'shape-' + detailProduct.printArea.shape"
						:style="{ width: detailProduct.printArea.width + 'rpx', height: detailProduct.printArea.height + 'rpx' }">
						<view class="canvas-grid"></view>
						<view class="preview-img-container"
							:style="{
								transform: 'translate(' + finalX + 'px,' + finalY + 'px) scale(' + finalScale + ')',
								width: imgDisplaySize + 'rpx',
								height: imgDisplaySize + 'rpx'
							}">
							<image :src="designImage" mode="aspectFit" class="design-img"
								:style="{ width: imgDisplaySize + 'rpx', height: imgDisplaySize + 'rpx' }"></image>
						</view>
					</view>
				</view>

				<view class="preview-info">
					<view class="preview-price-row">
						<text class="preview-price">¥{{ detailProduct.price }}</text>
						<text class="preview-status">{{ tt(detailProduct.status) }}</text>
					</view>
				</view>

				<!-- 底部操作 -->
				<view class="preview-actions">
					<view class="preview-action-btn back-btn" @click="backToDesigner">
						<text class="action-btn-text">{{ tt('返回修改') }}</text>
					</view>
					<view class="preview-action-btn add-cart-btn" @click="addDesignToCart">
						<text class="action-btn-text-white">{{ tt('加入购物车') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== 购物车弹窗 ===== -->
		<view class="modal-mask" v-if="showCartPanel" @click="showCartPanel = false">
			<view class="modal-card cart-modal" @click.stop>
				<view class="cart-header">
					<text class="cart-title">{{ tt('购物车') }}</text>
					<text class="cart-clear" @click="clearAllCart" v-if="cart.length">{{ tt('清空') }}</text>
				</view>
				<scroll-view scroll-y class="cart-list">
					<view v-for="item in cart" :key="item.cartId" class="cart-item">
						<view class="cart-item-thumb" v-if="item.design && item.design.imagePath">
							<image :src="item.design.imagePath" mode="aspectFill" class="thumb-img"></image>
						</view>
						<text v-else class="cart-item-emoji">{{ item.emoji }}</text>
						<view class="cart-item-info">
						<text class="cart-item-name">{{ tt(item.name) }}</text>
							<text class="cart-item-price">¥{{ item.price }}</text>
						</view>
						<view class="cart-qty-ctrl">
							<view class="qty-btn" @click="changeQty(item, -1)"><text>-</text></view>
							<text class="qty-num">{{ item.qty }}</text>
							<view class="qty-btn" @click="changeQty(item, 1)"><text>+</text></view>
						</view>
						<view class="cart-item-del" @click="removeItem(item)">
							<text class="del-text">✕</text>
						</view>
					</view>
					<view v-if="!cart.length" class="cart-empty">
						<text class="empty-text">{{ tt('购物车空空如也~') }}</text>
					</view>
				</scroll-view>
				<view class="cart-footer" v-if="cart.length">
					<text class="cart-footer-total">{{ tt('合计：') }}¥{{ cartTotal }}</text>
					<view class="cart-footer-btn" @click="checkout">
						<text class="cart-footer-btn-text">{{ tt('去结算') }}</text>
					</view>
				</view>
				<view class="modal-close" @click="showCartPanel = false">
					<text class="close-text">{{ tt('关闭') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n, formatI18nText } from '../../utils/i18n.js'
import { getCurrentUsername } from '../../utils/apis/auth.js'
import {
	addCartItem,
	clearCart,
	deleteCartItem,
	getCart,
	getProducts,
	updateCartItem,
} from '../../utils/apis/shop.js'
import { createOrder, payOrderDemo } from '../../utils/apis/order.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()

const products = ref([])
const cart = ref([])
const loadingProducts = ref(false)
const syncingCart = ref(false)
const submittingOrder = ref(false)

// 弹窗控制
const showDetail = ref(false)
const showCartPanel = ref(false)
const showDesigner = ref(false)
const showPreview = ref(false)
const detailProduct = ref({})

// 设计器状态
const designImage = ref('')
const designX = ref(0)
const designY = ref(0)
const designScale = ref(1)
const finalX = ref(0)
const finalY = ref(0)
const finalScale = ref(1)
const imgDisplaySize = ref(240)

const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
const cartTotal = computed(() => Number(cart.value.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)))

function legacyCartKey() {
	const username = getCurrentUsername()
	return username ? `${username}:oc_cart_items` : 'oc_cart_items'
}

function syncLegacyCartStorage() {
	const legacyItems = cart.value.map(item => ({
		cartId: item.cartId,
		productId: item.productId,
		name: item.name,
		emoji: item.emoji,
		price: item.price,
		qty: item.qty,
		design: item.design || null,
	}))
	uni.setStorageSync(legacyCartKey(), JSON.stringify(legacyItems))
}

async function loadProducts() {
	if (loadingProducts.value) return
	loadingProducts.value = true
	try {
		products.value = await getProducts()
	} catch (error) {
		uni.showToast({ title: error.message || tt('商品加载失败'), icon: 'none' })
	} finally {
		loadingProducts.value = false
	}
}

async function loadCart() {
	if (syncingCart.value) return
	syncingCart.value = true
	try {
		const payload = await getCart()
		cart.value = payload.items
		syncLegacyCartStorage()
	} catch (error) {
		cart.value = []
		syncLegacyCartStorage()
		uni.showToast({ title: error.message || tt('购物车加载失败'), icon: 'none' })
	} finally {
		syncingCart.value = false
	}
}

async function refreshData() {
	await Promise.all([loadProducts(), loadCart()])
}

function particleStyle(i) {
	const size = 4 + (i * 7 + 3) % 9
	const left = (i * 5.3 + 2.7) % 100
	const delay = (i * 0.37) % 6
	const duration = 4 + (i * 0.53) % 4
	return { width: size + 'rpx', height: size + 'rpx', left: left + '%', animationDelay: delay + 's', animationDuration: duration + 's' }
}

function goBack() {
	uni.navigateBack()
}

// === Step 1: 商品详情 ===
function openDetail(p) {
	detailProduct.value = p
	showDetail.value = true
}

// === Step 2: 设计编辑器 ===
async function enterDesigner() {
	if (detailProduct.value.isVipDemo) {
		showDetail.value = false
		try {
			await addCurrentProductToCart()
			uni.showToast({ title: tt('已加入购物车'), icon: 'none' })
		} catch (error) {
			uni.showToast({ title: error.message || tt('加入购物车失败'), icon: 'none' })
		}
		return
	}
	showDetail.value = false
	// 重置设计状态
	designImage.value = ''
	designX.value = 20
	designY.value = 20
	designScale.value = 1
	finalX.value = 0
	finalY.value = 0
	finalScale.value = 1
	// 根据 printArea 设置合适的初始图片大小
	const area = detailProduct.value.printArea
	imgDisplaySize.value = Math.min(area.width, area.height) - 40
	showDesigner.value = true
}

function exitDesigner() {
	showDesigner.value = false
}

function chooseImage() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			designImage.value = res.tempFilePaths[0]
			// 重置位置
			designX.value = 20
			designY.value = 20
			designScale.value = 1
		}
	})
}

function onMoveChange(e) {
	if (e.detail.source === 'touch' || e.detail.source === 'friction' || e.detail.source === '') {
		finalX.value = e.detail.x
		finalY.value = e.detail.y
	}
}

function onScaleChange(e) {
	finalScale.value = e.detail.scale
}

// === 保存设计 → 进入预览 ===
function saveDesign() {
	if (!designImage.value) return
	uni.showToast({ title: tt('设计已保存'), icon: 'none', duration: 1000 })
	setTimeout(() => { showPreview.value = true }, 400)
}

function backToDesigner() {
	showPreview.value = false
}

async function addCurrentProductToCart(design = null) {
	const payload = await addCartItem({
		productId: detailProduct.value.id,
		quantity: 1,
		design,
	})
	cart.value = payload.items
	syncLegacyCartStorage()
}

async function addDesignToCart() {
	const design = detailProduct.value.isVipDemo ? null : {
		imagePath: designImage.value,
		x: finalX.value,
		y: finalY.value,
		scale: finalScale.value,
	}
	try {
		await addCurrentProductToCart(design)
	} catch (error) {
		uni.showToast({ title: error.message || tt('加入购物车失败'), icon: 'none' })
		return
	}
	showPreview.value = false
	showDesigner.value = false
	uni.showToast({ title: tt('已加入购物车'), icon: 'none' })
}

// === 购物车操作 ===
async function changeQty(item, delta) {
	const nextQty = item.qty + delta
	if (nextQty <= 0) {
		await removeItem(item)
		return
	}
	try {
		const payload = await updateCartItem(item.cartId, { quantity: nextQty })
		cart.value = payload.items
		syncLegacyCartStorage()
	} catch (error) {
		uni.showToast({ title: error.message || tt('更新数量失败'), icon: 'none' })
	}
}

async function removeItem(item) {
	try {
		const payload = await deleteCartItem(item.cartId)
		cart.value = payload.items
		syncLegacyCartStorage()
	} catch (error) {
		uni.showToast({ title: error.message || tt('删除失败'), icon: 'none' })
	}
}

async function clearAllCart() {
	try {
		await clearCart()
		cart.value = []
		syncLegacyCartStorage()
	} catch (error) {
		uni.showToast({ title: error.message || tt('清空失败'), icon: 'none' })
	}
}

async function checkout() {
	if (!cart.value.length || submittingOrder.value) return
	submittingOrder.value = true
	try {
		const createdOrder = await createOrder({ source: 'cart', note: '' })
		await loadCart()
		showCartPanel.value = false
		await payOrderDemo(createdOrder.id, {
			action: 'start',
			paymentProvider: 'demo-gateway',
			callbackPayload: { scene: 'shop_checkout' },
		})
		uni.showModal({
			title: tt('订单已创建'),
			content: formatI18nText('{label} {orderNo}\n{question}', {
				label: tt('订单号'),
				orderNo: createdOrder.orderNo,
				question: tt('是否模拟支付成功？'),
			}),
			confirmText: tt('支付成功'),
			cancelText: tt('支付失败'),
			success: async (res) => {
				try {
					if (res.confirm) {
						await payOrderDemo(createdOrder.id, {
							action: 'callback_success',
							paymentProvider: 'demo-gateway',
							callbackPayload: { event: 'demo_success_callback', from: 'shop.vue' },
						})
						uni.showToast({ title: tt('支付成功（演示）'), icon: 'none' })
					} else {
						await payOrderDemo(createdOrder.id, {
							action: 'callback_fail',
							paymentProvider: 'demo-gateway',
							callbackPayload: { event: 'demo_fail_callback', from: 'shop.vue' },
						})
						uni.showToast({ title: tt('支付失败（演示）'), icon: 'none' })
					}
				} catch (error) {
					uni.showToast({ title: error.message || tt('支付状态更新失败'), icon: 'none' })
				}
			},
		})
	} catch (error) {
		uni.showToast({ title: error.message || tt('下单失败'), icon: 'none' })
	} finally {
		submittingOrder.value = false
	}
}

onMounted(refreshData)
onShow(refreshData)
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); position: relative; overflow: hidden; }

/* 粒子 */
.particles { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
.particle { position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(255,182,193,0.6), rgba(192,132,252,0.4), rgba(174,198,207,0.3)); filter: blur(2px); animation: floatUp 6s ease-in-out infinite; bottom: -20rpx; }
@keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.3; } 100% { transform: translateY(-100vh) scale(0.3); opacity: 0; } }

/* 导航栏 */
.nav-bar { position: fixed; top: 0; left: 0; width: 100%; box-sizing: border-box; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding-bottom: 16rpx; background: linear-gradient(180deg, rgba(237,231,246,0.95), rgba(237,231,246,0.8)); backdrop-filter: blur(24px) saturate(1.6); border-bottom: 2rpx solid transparent; border-image: linear-gradient(90deg, rgba(255,182,193,0.3), rgba(192,132,252,0.3), rgba(167,139,250,0.2)) 1; }
.nav-left { width: 80rpx; flex-shrink: 0; padding: 20rpx 30rpx; }
.nav-back { font-size: 36rpx; color: #c084fc; }
.nav-title { font-size: 34rpx; font-weight: 800; color: #c084fc; letter-spacing: 2rpx; }
.nav-actions { display: flex; align-items: center; gap: 8rpx; padding-right: 18rpx; }
.nav-right { position: relative; padding: 20rpx 30rpx; }
.cart-icon { font-size: 40rpx; }
.cart-badge { position: absolute; top: 10rpx; right: 18rpx; min-width: 32rpx; height: 32rpx; border-radius: 16rpx; background: #f43f5e; display: flex; align-items: center; justify-content: center; padding: 0 8rpx; }
.badge-text { font-size: 20rpx; color: #fff; font-weight: 600; }

/* 商品滚动区域 */
.product-scroll { height: 100vh; position: relative; z-index: 1; }

/* Banner */
.shop-banner { margin: 24rpx 30rpx; padding: 40rpx; border-radius: 36rpx; background: linear-gradient(135deg, rgba(255,182,193,0.35), rgba(192,132,252,0.35), rgba(167,139,250,0.25)); backdrop-filter: blur(24px) saturate(1.4); border: 2rpx solid rgba(255,255,255,0.6); box-shadow: 0 8rpx 32rpx rgba(192,132,252,0.12); text-align: center; }
.banner-emoji { font-size: 72rpx; display: block; }
.banner-title { font-size: 38rpx; font-weight: 800; color: #374151; display: block; margin-top: 12rpx; letter-spacing: 2rpx; }
.banner-desc { font-size: 24rpx; color: #b4a0d6; display: block; margin-top: 8rpx; }

/* 商品网格 */
.product-grid { display: flex; flex-wrap: wrap; padding: 0 20rpx; gap: 24rpx; }
.product-card { width: calc(50% - 32rpx); background: rgba(255,255,255,0.75); backdrop-filter: blur(20px) saturate(1.3); border-radius: 28rpx; padding: 24rpx; border: 1rpx solid rgba(255,255,255,0.6); box-shadow: 0 10rpx 40rpx rgba(192,132,252,0.1), 0 2rpx 8rpx rgba(0,0,0,0.03); transition: transform 0.25s ease, box-shadow 0.25s ease; }
.product-card:active { transform: scale(0.96); box-shadow: 0 4rpx 16rpx rgba(192,132,252,0.18); }
.product-emoji-wrap { width: 100%; height: 180rpx; border-radius: 24rpx; background: linear-gradient(135deg, rgba(255,182,193,0.15), rgba(167,139,250,0.15)); display: flex; align-items: center; justify-content: center; }
.product-emoji { font-size: 64rpx; }
.product-name { font-size: 26rpx; font-weight: 600; color: #374151; display: block; margin-top: 16rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 12rpx; }
.product-price { font-size: 30rpx; font-weight: 700; color: #c084fc; }
.add-btn { width: 52rpx; height: 52rpx; border-radius: 50%; background: linear-gradient(135deg, #f9a8d4, #c084fc); display: flex; align-items: center; justify-content: center; box-shadow: 0 10rpx 36rpx rgba(192,132,252,0.3); transition: transform 0.2s ease, box-shadow 0.2s ease; }
.add-btn:active { transform: scale(0.9); }
.add-btn-text { font-size: 32rpx; color: #fff; font-weight: 600; line-height: 1; }

/* 底部购物车栏 */
.cart-bar { position: fixed; bottom: 0; left: 0; width: 100%; box-sizing: border-box; padding: 16rpx 30rpx calc(16rpx + env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.75); backdrop-filter: blur(28px) saturate(1.5); border-top: 1rpx solid rgba(255,255,255,0.5); box-shadow: 0 -4rpx 24rpx rgba(192,132,252,0.08); z-index: 50; }
.cart-bar-left { display: flex; align-items: center; position: relative; }
.cart-bar-icon { font-size: 48rpx; }
.cart-bar-badge { position: absolute; top: -8rpx; left: 36rpx; min-width: 32rpx; height: 32rpx; border-radius: 16rpx; background: #f43f5e; display: flex; align-items: center; justify-content: center; padding: 0 8rpx; }
.cart-bar-total { font-size: 32rpx; font-weight: 700; color: #374151; margin-left: 24rpx; }
.cart-bar-btn { padding: 16rpx 48rpx; border-radius: 44rpx; background: linear-gradient(135deg, #FFB6C1, #a78bfa); box-shadow: 0 10rpx 32rpx rgba(255,182,193,0.4), 0 4rpx 12rpx rgba(192,132,252,0.2); }
.cart-bar-btn:active { transform: scale(0.95); }
.cart-bar-btn-text { font-size: 28rpx; color: #fff; font-weight: 600; }

/* ===== 弹窗通用 ===== */
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.35); z-index: 999; display: flex; align-items: center; justify-content: center; }
.modal-card { width: 85%; max-width: 650rpx; background: rgba(255,255,255,0.95); backdrop-filter: blur(40px) saturate(1.8); border-radius: 36rpx; overflow: hidden; box-shadow: 0 24rpx 80rpx rgba(0,0,0,0.12), 0 8rpx 32rpx rgba(192,132,252,0.1), 0 2rpx 8rpx rgba(0,0,0,0.04); }
.modal-close { text-align: center; padding: 24rpx; border-top: 1rpx solid rgba(0,0,0,0.06); }
.close-text { font-size: 28rpx; color: #c084fc; font-weight: 600; }

/* 商品详情弹窗 */
.detail-top { height: 240rpx; display: flex; align-items: center; justify-content: center; }
.detail-emoji { font-size: 96rpx; }
.detail-body { padding: 28rpx 36rpx; }
.detail-name { font-size: 32rpx; font-weight: 700; color: #374151; display: block; }
.detail-desc { font-size: 26rpx; color: #b4a0d6; display: block; margin-top: 12rpx; line-height: 1.6; }
.detail-price-row { display: flex; align-items: center; justify-content: space-between; margin-top: 20rpx; }
.detail-price { font-size: 36rpx; font-weight: 800; color: #c084fc; }
.detail-status { font-size: 24rpx; color: #c084fc; background: rgba(167,139,250,0.1); padding: 6rpx 16rpx; border-radius: 12rpx; }
.detail-actions { display: flex; border-top: 1rpx solid rgba(0,0,0,0.06); }
.detail-btn { flex: 1; text-align: center; padding: 28rpx 0; font-size: 28rpx; }
.detail-btn.cancel text { color: #b4a0d6; }
.detail-btn.confirm text { color: #c084fc; font-weight: 600; }
.detail-btn:not(:last-child) { border-right: 1rpx solid rgba(0,0,0,0.06); }

/* ===== 设计编辑器 ===== */
.designer-layer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 35%, #F0F4FF 65%, #FFF5F5 85%, #F5F0FF 100%); z-index: 500; display: flex; flex-direction: column; }
.designer-nav { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding-bottom: 16rpx; background: linear-gradient(180deg, rgba(237,231,246,0.98), rgba(237,231,246,0.85)); backdrop-filter: blur(24px) saturate(1.5); }
.designer-nav-left { padding: 20rpx 30rpx; }
.designer-nav-title { font-size: 32rpx; font-weight: 700; color: #c084fc; flex: 1; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.designer-nav-right { width: 80rpx; }
.designer-body { flex: 1; display: flex; flex-direction: column; align-items: center; padding-bottom: env(safe-area-inset-bottom); overflow: hidden; }

/* 画布区域 */
.canvas-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding: 20rpx; }
.canvas-label { font-size: 24rpx; color: #b4a0d6; margin-bottom: 16rpx; letter-spacing: 2rpx; }
.canvas-area { position: relative; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border: 3rpx dashed rgba(167,139,250,0.4); overflow: hidden; box-shadow: 0 12rpx 40rpx rgba(0,0,0,0.08); }
.shape-rect { border-radius: 16rpx; }
.shape-round-rect { border-radius: 32rpx; }
.shape-circle { border-radius: 50%; }
.canvas-grid { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(167,139,250,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.06) 1px, transparent 1px); background-size: 40rpx 40rpx; pointer-events: none; z-index: 0; }
.canvas-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 120rpx; opacity: 0.06; pointer-events: none; z-index: 0; }

/* movable 拖拽区域 */
.movable-zone { position: absolute; top: 0; left: 0; z-index: 10; }
.movable-img-wrap { z-index: 10; }
.design-img { display: block; pointer-events: none; }

/* 空状态 */
.canvas-empty { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 5; }
.canvas-empty-icon { font-size: 64rpx; display: block; }
.canvas-empty-text { font-size: 26rpx; color: #c084fc; margin-top: 16rpx; }

/* 提示文字 */
.design-tips { padding: 16rpx 0; }
.tip-text { font-size: 24rpx; color: #b4a0d6; }

/* 底部工具栏 */
.designer-toolbar { flex-shrink: 0; display: flex; gap: 24rpx; padding: 24rpx 40rpx 40rpx; width: 100%; }
.toolbar-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10rpx; padding: 24rpx; border-radius: 28rpx; transition: transform 0.2s; }
.toolbar-btn:active { transform: scale(0.96); }
.upload-btn { background: rgba(255,255,255,0.85); backdrop-filter: blur(16px) saturate(1.3); border: 2rpx solid rgba(167,139,250,0.3); }
.save-btn { background: linear-gradient(135deg, #FFB6C1, #a78bfa); box-shadow: 0 10rpx 32rpx rgba(255,182,193,0.35); }
.save-btn.disabled { opacity: 0.4; }
.toolbar-btn-icon { font-size: 32rpx; }
.toolbar-btn-text { font-size: 28rpx; font-weight: 600; color: #374151; }
.save-btn .toolbar-btn-text { color: #fff; }

/* ===== 预览层 ===== */
.preview-layer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 35%, #F0F4FF 65%, #FFF5F5 85%, #F5F0FF 100%); z-index: 600; display: flex; flex-direction: column; }
.preview-nav { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding-bottom: 16rpx; background: linear-gradient(180deg, rgba(237,231,246,0.98), rgba(237,231,246,0.85)); backdrop-filter: blur(24px) saturate(1.5); }
.preview-body { flex: 1; display: flex; flex-direction: column; align-items: center; padding-bottom: env(safe-area-inset-bottom); overflow: hidden; }
.preview-product-name { display: flex; align-items: center; gap: 12rpx; padding: 20rpx 0; }
.preview-emoji { font-size: 40rpx; }
.preview-name-text { font-size: 30rpx; font-weight: 700; color: #374151; }

.preview-canvas-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; padding: 20rpx; }
.preview-canvas { position: relative; border-style: solid; border-color: rgba(167,139,250,0.25); border-width: 3rpx; box-shadow: 0 12rpx 48rpx rgba(192,132,252,0.1), 0 4rpx 16rpx rgba(0,0,0,0.05); }
.preview-img-container { position: absolute; top: 0; left: 0; transform-origin: 0 0; pointer-events: none; z-index: 10; }

.preview-info { padding: 16rpx 40rpx; width: 100%; }
.preview-price-row { display: flex; align-items: center; justify-content: space-between; }
.preview-price { font-size: 44rpx; font-weight: 800; color: #c084fc; letter-spacing: 1rpx; }
.preview-status { font-size: 24rpx; color: #c084fc; background: rgba(167,139,250,0.1); padding: 6rpx 16rpx; border-radius: 12rpx; }

.preview-actions { flex-shrink: 0; display: flex; gap: 24rpx; padding: 16rpx 40rpx 40rpx; width: 100%; }
.preview-action-btn { flex: 1; text-align: center; padding: 26rpx; border-radius: 32rpx; transition: transform 0.2s; }
.preview-action-btn:active { transform: scale(0.96); }
.back-btn { background: rgba(255,255,255,0.85); backdrop-filter: blur(16px) saturate(1.3); border: 2rpx solid rgba(167,139,250,0.3); }
.add-cart-btn { background: linear-gradient(135deg, #FFB6C1, #a78bfa); box-shadow: 0 10rpx 32rpx rgba(255,182,193,0.4); }
.action-btn-text { font-size: 28rpx; font-weight: 600; color: #374151; }
.action-btn-text-white { font-size: 28rpx; font-weight: 600; color: #fff; }

/* ===== 购物车弹窗 ===== */
.cart-modal { max-height: 70vh; display: flex; flex-direction: column; }
.cart-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 36rpx 16rpx; }
.cart-title { font-size: 32rpx; font-weight: 700; color: #374151; }
.cart-clear { font-size: 24rpx; color: #f43f5e; }
.cart-list { flex: 1; max-height: 500rpx; padding: 0 24rpx; }
.cart-item { display: flex; align-items: center; padding: 24rpx 12rpx; border-bottom: 1rpx solid rgba(0,0,0,0.04); gap: 8rpx; }
.cart-item-thumb { width: 76rpx; height: 76rpx; border-radius: 18rpx; overflow: hidden; margin-right: 16rpx; flex-shrink: 0; background: linear-gradient(135deg, rgba(255,182,193,0.15), rgba(167,139,250,0.15)); }
.thumb-img { width: 76rpx; height: 76rpx; }
.cart-item-emoji { font-size: 40rpx; margin-right: 16rpx; flex-shrink: 0; }
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-name { font-size: 26rpx; color: #374151; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cart-item-price { font-size: 24rpx; color: #c084fc; font-weight: 600; display: block; margin-top: 4rpx; }
.cart-qty-ctrl { display: flex; align-items: center; gap: 12rpx; margin: 0 16rpx; }
.qty-btn { width: 48rpx; height: 48rpx; border-radius: 50%; background: rgba(255,182,193,0.2); backdrop-filter: blur(8px) saturate(1.2); display: flex; align-items: center; justify-content: center; border: 1rpx solid rgba(255,255,255,0.4); }
.qty-btn text { font-size: 28rpx; color: #374151; font-weight: 600; }
.qty-num { font-size: 26rpx; font-weight: 600; color: #374151; min-width: 32rpx; text-align: center; }
.cart-item-del { padding: 8rpx; }
.del-text { font-size: 24rpx; color: #d1d5db; }
.cart-empty { padding: 80rpx 0; text-align: center; }
.empty-text { font-size: 26rpx; color: #d1d5db; }
.cart-footer { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 36rpx; border-top: 1rpx solid rgba(0,0,0,0.06); }
.cart-footer-total { font-size: 30rpx; font-weight: 700; color: #374151; }
.cart-footer-btn { padding: 14rpx 40rpx; border-radius: 36rpx; background: linear-gradient(135deg, #FFB6C1, #a78bfa); box-shadow: 0 8rpx 24rpx rgba(255,182,193,0.3); }
.cart-footer-btn-text { font-size: 26rpx; color: #fff; font-weight: 600; }
</style>
