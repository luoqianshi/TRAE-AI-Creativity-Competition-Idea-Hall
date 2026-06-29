<template>
	<view class="modal-mask" @click="$emit('close')">
		<view class="modal-card publish-modal" @click.stop>
			<view class="publish-header">
				<text class="publish-cancel" @click="$emit('close')">{{ tt('取消') }}</text>
				<text class="publish-title">{{ tt('发布约稿') }}</text>
				<view class="publish-send" :class="{ active: canPublish }" @click="handleSubmit">
					<text class="publish-send-text">{{ tt('发布') }}</text>
				</view>
			</view>

			<scroll-view scroll-y class="publish-scroll">
				<!-- 类型选择 -->
				<view class="publish-section">
					<text class="publish-label">{{ tt('我要') }}</text>
					<view class="type-toggle">
						<view class="type-option" :class="{ active: form.type === 'artist' }" @click="form.type = 'artist'">
							<text class="type-icon">🎨</text>
							<text class="type-name">{{ tt('接稿（我是画师）') }}</text>
						</view>
						<view class="type-option" :class="{ active: form.type === 'seeker' }" @click="form.type = 'seeker'">
							<text class="type-icon">🔍</text>
							<text class="type-name">{{ tt('求稿（找画师）') }}</text>
						</view>
					</view>
				</view>

				<!-- 标题 -->
				<view class="publish-section">
					<text class="publish-label">{{ tt('标题') }}</text>
					<view class="publish-input">
						<input v-model="form.title" :placeholder="tt('例如：日系全身立绘 / 求约 OC 双人图')" maxlength="30" />
					</view>
				</view>

				<!-- 描述 -->
				<view class="publish-section">
					<text class="publish-label">{{ tt('详细描述') }}</text>
					<view class="publish-textarea">
						<textarea v-model="form.desc" :placeholder="tt('描述你的画风/需求、擅长领域、注意事项等...')"
							placeholder-class="apply-placeholder" :auto-height="true" maxlength="300" />
					</view>
					<text class="char-count">{{ form.desc.length }}/300</text>
				</view>

				<!-- 风格标签 -->
				<view class="publish-section">
					<text class="publish-label">{{ tt('风格标签（最多3个）') }}</text>
					<view class="style-tag-list">
						<view v-for="t in allStyles" :key="t" class="style-tag"
							:class="{ active: form.styles.includes(t) }" @click="toggleStyle(t)">
							<text>{{ tt(t) }}</text>
						</view>
					</view>
				</view>

				<!-- 价格区间 -->
				<view class="publish-section price-section">
					<text class="publish-label">{{ tt('价格区间 (¥)') }}</text>
					<view class="price-inputs">
						<view class="publish-input price-input"><input v-model="form.priceMin" type="number" :placeholder="tt('最低')" /></view>
						<text class="price-sep">~</text>
						<view class="publish-input price-input"><input v-model="form.priceMax" type="number" :placeholder="tt('最高')" /></view>
					</view>
				</view>

				<!-- 交付周期 -->
				<view class="publish-section">
					<text class="publish-label">{{ tt('交付周期') }}</text>
					<view class="publish-input">
						<input v-model="form.turnaround" :placeholder="tt('例如：7~15 天 / 不限')" />
					</view>
				</view>

				<view style="height: 40rpx;"></view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from '../../utils/i18n.js'

const { tt } = useI18n()

const allStyles = ['日系', '厚涂', '赛璐璐', '线稿', 'Q版', '萌系', '欧美', '概念设计', '水墨', '漫画', '表情包', '双人', '治愈', '战斗', '机甲', '奇幻']

const emit = defineEmits(['close', 'submit'])

const form = reactive({
	type: 'seeker',
	title: '',
	desc: '',
	styles: [],
	priceMin: '',
	priceMax: '',
	turnaround: '',
})

const canPublish = computed(() => {
	return form.title.trim() && form.desc.trim()
})

function toggleStyle(t) {
	const idx = form.styles.indexOf(t)
	if (idx >= 0) form.styles.splice(idx, 1)
	else if (form.styles.length < 3) form.styles.push(t)
}

function validatePrice(val) {
	if (!val) return true
	const num = Number(val)
	return !isNaN(num) && num >= 0
}

function handleSubmit() {
	if (!canPublish.value) return

	if (!validatePrice(form.priceMin) || !validatePrice(form.priceMax)) {
		uni.showToast({ title: tt('请输入有效的价格'), icon: 'none' })
		return
	}

	const min = Number(form.priceMin)
	const max = Number(form.priceMax)
	if (form.priceMin && form.priceMax && min > max) {
		uni.showToast({ title: tt('最低价不能高于最高价'), icon: 'none' })
		return
	}

	const priceMin = form.priceMin || '面议'
	const priceMax = form.priceMax || '面议'
	const priceRange = priceMin === '面议' && priceMax === '面议' ? '面议' : priceMin + ' ~ ' + priceMax

	emit('submit', {
		type: form.type,
		title: form.title.trim(),
		desc: form.desc.trim(),
		styles: [...form.styles],
		priceRange,
		turnaround: form.turnaround.trim() || '待商议',
	})

	resetForm()
}

function resetForm() {
	form.type = 'seeker'
	form.title = ''
	form.desc = ''
	form.styles = []
	form.priceMin = ''
	form.priceMax = ''
	form.turnaround = ''
}

defineExpose({ resetForm })
</script>

<style scoped>
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: flex-end; justify-content: center; }
.modal-card { width: 100%; background: #fff; border-radius: 32rpx 32rpx 0 0; overflow: hidden; max-height: 90vh; }

.publish-modal { display: flex; flex-direction: column; }
.publish-scroll { flex: 1; overflow-y: auto; }

.publish-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid rgba(0,0,0,0.04); background: #fff; z-index: 10; flex-shrink: 0; }
.publish-cancel { font-size: 28rpx; color: #9ca3af; }
.publish-title { font-size: 30rpx; font-weight: 700; color: #374151; }
.publish-send { background: rgba(167,139,250,0.15); border-radius: 20rpx; padding: 10rpx 32rpx; }
.publish-send.active { background: linear-gradient(135deg, #FFB6C1, #a78bfa); }
.publish-send-text { font-size: 26rpx; color: #a78bfa; font-weight: 600; }
.publish-send.active .publish-send-text { color: #fff; }

.publish-section { padding: 16rpx 32rpx; }
.publish-label { font-size: 26rpx; font-weight: 600; color: #6b7280; display: block; margin-bottom: 12rpx; }
.publish-input { background: rgba(0,0,0,0.03); border-radius: 16rpx; padding: 20rpx 24rpx; border: 2rpx solid rgba(0,0,0,0.04); }
.publish-input input { font-size: 28rpx; color: #374151; }
.publish-textarea { background: rgba(0,0,0,0.03); border-radius: 16rpx; padding: 20rpx 24rpx; border: 2rpx solid rgba(0,0,0,0.04); }
.publish-textarea textarea { font-size: 28rpx; color: #374151; line-height: 1.6; min-height: 160rpx; width: 100%; }
.apply-placeholder { color: #d1d5db; }
.char-count { font-size: 22rpx; color: #d1d5db; display: block; text-align: right; margin-top: 8rpx; }

.type-toggle { display: flex; gap: 16rpx; }
.type-option { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 24rpx 16rpx; border-radius: 20rpx; background: rgba(0,0,0,0.02); border: 2rpx solid rgba(0,0,0,0.04); transition: all 0.2s; }
.type-option.active { background: linear-gradient(135deg, rgba(255,182,193,0.12), rgba(167,139,250,0.1)); border-color: rgba(167,139,250,0.3); }
.type-icon { font-size: 40rpx; margin-bottom: 8rpx; }
.type-name { font-size: 24rpx; color: #6b7280; font-weight: 600; }
.type-option.active .type-name { color: #a78bfa; }

.style-tag-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.style-tag { padding: 8rpx 24rpx; border-radius: 20rpx; background: rgba(0,0,0,0.03); border: 2rpx solid rgba(0,0,0,0.04); font-size: 24rpx; color: #6b7280; transition: all 0.2s; }
.style-tag.active { background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.3); color: #a78bfa; font-weight: 600; }

.price-section .price-inputs { display: flex; align-items: center; gap: 12rpx; }
.price-input { flex: 1; }
.price-sep { font-size: 28rpx; color: #9ca3af; flex-shrink: 0; }
</style>
