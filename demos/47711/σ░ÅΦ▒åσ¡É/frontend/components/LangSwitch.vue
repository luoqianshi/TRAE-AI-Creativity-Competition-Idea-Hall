<template>
	<view class="lang-switch" @click.stop="toggleLocale" :aria-label="t('common.language')">
		<text class="lang-icon">{{ tt('文') }}</text>
		<text class="lang-text">{{ t('common.switchTo') }}</text>
	</view>
</template>

<script setup>
import { useI18n } from '../utils/i18n.js'

const { t, tt, toggleLocale } = useI18n()
</script>

<style scoped>
.lang-switch {
	min-width: 88rpx;
	height: 56rpx;
	padding: 0 16rpx;
	border-radius: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	background: rgba(255,255,255,0.78);
	border: 2rpx solid rgba(167,139,250,0.22);
	box-shadow: 0 6rpx 22rpx rgba(167,139,250,0.12);
	backdrop-filter: blur(18px) saturate(1.35);
	box-sizing: border-box;
	transition: transform 0.2s, background 0.2s;
}
.lang-switch:active {
	transform: scale(0.96);
	background: rgba(255,255,255,0.92);
}
.lang-icon {
	font-size: 22rpx;
	font-weight: 800;
	line-height: 1;
	color: #a78bfa;
}
.lang-text {
	font-size: 22rpx;
	font-weight: 800;
	line-height: 1;
	color: #6d5dfc;
	white-space: nowrap;
}
</style>
