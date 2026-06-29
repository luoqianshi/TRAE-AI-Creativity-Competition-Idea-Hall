<template>
	<view class="page">
		<view class="lang-top" :style="{ paddingTop: statusBarHeight + 16 + 'px' }">
			<LangSwitch />
		</view>

		<!-- 粒子背景 -->
		<view class="particles">
			<view v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></view>
		</view>

		<!-- 内容区 -->
		<view class="content" :style="{ paddingTop: statusBarHeight + 60 + 'px' }">
			<!-- Logo -->
			<view class="logo-area">
				<view class="logo-circle">
					<text class="logo-emoji">🌙</text>
				</view>
				<text class="app-name">{{ t('login.appName') }}</text>
				<text class="app-slogan">{{ t('login.slogan') }}</text>
			</view>

			<!-- 登录/注册切换 Tab -->
			<view class="tab-row">
				<view class="tab-item" :class="{ active: mode === 'login' }" @click="mode = 'login'">
					<text class="tab-text">{{ t('login.tabLogin') }}</text>
				</view>
				<view class="tab-item" :class="{ active: mode === 'register' }" @click="mode = 'register'">
					<text class="tab-text">{{ t('login.tabRegister') }}</text>
				</view>
				<view class="tab-item" :class="{ active: mode === 'forgot' }" @click="mode = 'forgot'">
					<text class="tab-text">{{ t('login.tabForgot') }}</text>
				</view>
				<view class="tab-indicator" :style="{ left: tabLeft }"></view>
			</view>

			<!-- 账号登录表单 -->
			<view class="form-area" v-if="mode === 'login'">
				<view class="input-wrap">
					<text class="input-icon">👤</text>
					<input v-model="username" :placeholder="t('login.usernamePlaceholder')" placeholder-class="placeholder" maxlength="20" />
				</view>
				<view class="input-wrap">
					<text class="input-icon">🔒</text>
					<input v-model="password" :password="!showPwd" :placeholder="t('login.passwordPlaceholder')" placeholder-class="placeholder" maxlength="20" />
					<view class="pwd-toggle" @click="showPwd = !showPwd">
						<text class="pwd-icon">{{ showPwd ? '👁️' : '🙈' }}</text>
					</view>
				</view>
			</view>

			<!-- 注册表单 -->
			<view class="form-area" v-if="mode === 'register'">
				<view class="input-wrap">
					<text class="input-icon">👤</text>
					<input v-model="username" :placeholder="t('login.usernamePlaceholder')" placeholder-class="placeholder" maxlength="20" />
				</view>
				<view class="input-wrap">
					<text class="input-icon">📱</text>
					<input v-model="phone" type="number" :placeholder="t('login.phonePlaceholder')" placeholder-class="placeholder" maxlength="11" />
				</view>
				<view class="input-wrap sms-row">
					<text class="input-icon">🔑</text>
					<input v-model="smsInput" type="number" :placeholder="t('login.codePlaceholder')" placeholder-class="placeholder" maxlength="6" />
					<view class="sms-btn" :class="{ disabled: countdown > 0 || !canSendSms }" @click="handleSendCode">
						<text class="sms-btn-text">{{ countdown > 0 ? countdown + 's' : t('login.getCode') }}</text>
					</view>
				</view>
				<text class="sms-hint" v-if="smsDebugCode">{{ tt('测试验证码') }}: {{ smsDebugCode }}</text>
				<view class="input-wrap">
					<text class="input-icon">🔒</text>
					<input v-model="password" :password="!showPwd" :placeholder="t('login.passwordPlaceholder')" placeholder-class="placeholder" maxlength="20" />
					<view class="pwd-toggle" @click="showPwd = !showPwd">
						<text class="pwd-icon">{{ showPwd ? '👁️' : '🙈' }}</text>
					</view>
				</view>
				<view class="input-wrap">
					<text class="input-icon">🔒</text>
					<input v-model="confirmPwd" :password="!showPwd" :placeholder="t('login.confirmPasswordPlaceholder')" placeholder-class="placeholder" maxlength="20" />
				</view>
			</view>

			<!-- 忘记密码表单 -->
			<view class="form-area" v-if="mode === 'forgot'">
				<view class="input-wrap">
					<text class="input-icon">📱</text>
					<input v-model="phone" type="number" :placeholder="t('login.phonePlaceholder')" placeholder-class="placeholder" maxlength="11" />
				</view>
				<view class="input-wrap sms-row">
					<text class="input-icon">🔑</text>
					<input v-model="smsInput" type="number" :placeholder="t('login.codePlaceholder')" placeholder-class="placeholder" maxlength="6" />
					<view class="sms-btn" :class="{ disabled: countdown > 0 || !canSendSms }" @click="handleSendCode">
						<text class="sms-btn-text">{{ countdown > 0 ? countdown + 's' : t('login.getCode') }}</text>
					</view>
				</view>
				<text class="sms-hint" v-if="smsDebugCode">{{ tt('测试验证码') }}: {{ smsDebugCode }}</text>
				<view class="input-wrap">
					<text class="input-icon">🔒</text>
					<input v-model="password" :password="!showPwd" :placeholder="t('login.newPasswordPlaceholder')" placeholder-class="placeholder" maxlength="20" />
					<view class="pwd-toggle" @click="showPwd = !showPwd">
						<text class="pwd-icon">{{ showPwd ? '👁️' : '🙈' }}</text>
					</view>
				</view>
				<view class="input-wrap">
					<text class="input-icon">🔒</text>
					<input v-model="confirmPwd" :password="!showPwd" :placeholder="t('login.confirmNewPasswordPlaceholder')" placeholder-class="placeholder" maxlength="20" />
				</view>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-btn" :class="{ disabled: !canSubmit }" @click="handleSubmit">
				<text class="submit-text">{{ submitLabel }}</text>
			</view>

			<!-- 底部提示 -->
			<view class="bottom-tip">
				<text class="tip-text" @click="toggleMode">
					{{ bottomTip }}
				</text>
				<text v-if="mode === 'login'" class="minor-tip" @click="mode = 'forgot'">{{ t('login.forgotPassword') }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { login, registerWithSms, resetPasswordBySms, sendSms } from '../../utils/apis/auth.js'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()

const mode = ref('login')
const username = ref('')
const password = ref('')
const confirmPwd = ref('')
const showPwd = ref(false)

const phone = ref('')
const smsInput = ref('')
const smsDebugCode = ref('')
const countdown = ref(0)
let countdownTimer = null

const isPhoneValid = computed(() => /^1[3-9]\d{9}$/.test(phone.value))
const canSendSms = computed(() => isPhoneValid.value && (mode.value === 'register' || mode.value === 'forgot'))

const tabLeft = computed(() => {
	if (mode.value === 'login') return '4rpx'
	if (mode.value === 'register') return 'calc((100% - 8rpx) / 3 + 4rpx)'
	return 'calc((100% - 8rpx) * 2 / 3 + 4rpx)'
})

const submitLabel = computed(() => {
	if (mode.value === 'login') return t('login.submitLogin')
	if (mode.value === 'register') return t('login.submitRegister')
	return t('login.submitReset')
})

const bottomTip = computed(() => {
	if (mode.value === 'register') return t('login.hasAccount')
	if (mode.value === 'forgot') return t('login.rememberPassword')
	return t('login.noAccount')
})

const canSubmit = computed(() => {
	if (mode.value === 'login') {
		return username.value.trim() && password.value
	}
	if (mode.value === 'register') {
		return username.value.trim() && isPhoneValid.value && smsInput.value.length === 6 && password.value && confirmPwd.value
	}
	return isPhoneValid.value && smsInput.value.length === 6 && password.value && confirmPwd.value
})

watch(mode, () => {
	smsInput.value = ''
	smsDebugCode.value = ''
	if (countdownTimer) {
		clearInterval(countdownTimer)
		countdownTimer = null
	}
	countdown.value = 0
})

async function handleSendCode() {
	if (countdown.value > 0 || !canSendSms.value) return
	const scene = mode.value === 'register' ? 'register_login' : 'reset_password'
	try {
		const res = await sendSms(phone.value, scene)
		smsDebugCode.value = res?.debug_code || ''
		if (smsDebugCode.value) {
			smsInput.value = smsDebugCode.value
		}
		uni.showToast({ title: tt('验证码已发送'), icon: 'none' })
		countdown.value = 60
		countdownTimer = setInterval(() => {
			countdown.value--
			if (countdown.value <= 0) {
				clearInterval(countdownTimer)
				countdownTimer = null
			}
		}, 1000)
		return
	} catch (error) {
		uni.showToast({ title: tt(error.message || '发送失败'), icon: 'none' })
	}
}

onUnmounted(() => {
	if (countdownTimer) clearInterval(countdownTimer)
})

function particleStyle(i) {
	const size = 4 + (i * 7 + 3) % 9
	const left = (i * 5.3 + 2.7) % 100
	const delay = (i * 0.37) % 6
	const duration = 4 + (i * 0.53) % 4
	return { width: size + 'rpx', height: size + 'rpx', left: left + '%', animationDelay: delay + 's', animationDuration: duration + 's' }
}

function toggleMode() {
	mode.value = mode.value === 'login' ? 'register' : 'login'
}

function clearPasswordFields() {
	password.value = ''
	confirmPwd.value = ''
	smsInput.value = ''
}

async function handleSubmit() {
	if (!canSubmit.value) return

	const user = username.value.trim()
	const pwd = password.value

	if (mode.value === 'register') {
		if (user.length < 2) {
			uni.showToast({ title: tt('账号至少2个字符'), icon: 'none' }); return
		}
		if (pwd.length < 6) {
			uni.showToast({ title: tt('密码至少6位'), icon: 'none' }); return
		}
		if (!isPhoneValid.value) {
			uni.showToast({ title: tt('请输入正确手机号'), icon: 'none' }); return
		}
		if (pwd !== confirmPwd.value) {
			uni.showToast({ title: tt('两次密码不一致'), icon: 'none' }); return
		}
		try {
			await registerWithSms({
				username: user,
				phone: phone.value,
				password: pwd,
				sms_code: smsInput.value,
			})
			uni.showToast({ title: tt('注册成功'), icon: 'none' })
			setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 500)
		} catch (error) {
			uni.showToast({ title: tt(error.message || '注册失败'), icon: 'none' })
		}
		return
	}

	if (mode.value === 'forgot') {
		if (pwd.length < 6) {
			uni.showToast({ title: tt('新密码至少6位'), icon: 'none' }); return
		}
		if (pwd !== confirmPwd.value) {
			uni.showToast({ title: tt('两次密码不一致'), icon: 'none' }); return
		}
		try {
			await resetPasswordBySms(phone.value, smsInput.value, pwd)
			uni.showToast({ title: tt('密码已重置'), icon: 'none' })
			mode.value = 'login'
			clearPasswordFields()
		} catch (error) {
			uni.showToast({ title: tt(error.message || '重置失败'), icon: 'none' })
		}
		return
	}

	try {
		await login({ username: user, password: pwd })
		uni.switchTab({ url: '/pages/index/index' })
	} catch (error) {
		uni.showToast({ title: tt(error.message || '登录失败'), icon: 'none' })
	}
}
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%); position: relative; overflow: hidden; }
.lang-top { position: fixed; top: 0; right: 32rpx; z-index: 30; }

/* 粒子 - 多层光晕+柔化 */
.particles { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
.particle { position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(192,132,252,0.5), rgba(255,182,193,0.35), transparent 70%); animation: floatUp 6s ease-in-out infinite; bottom: -20rpx; filter: blur(2px); }
@keyframes floatUp { 0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; } 10% { opacity: 0.7; } 50% { opacity: 0.4; transform: translateY(-50vh) scale(0.7) rotate(90deg); } 100% { transform: translateY(-100vh) scale(0.2) rotate(180deg); opacity: 0; } }

.content { position: relative; z-index: 10; padding: 0 56rpx; }

/* Logo - 多层光晕+高级呼吸动画 */
.logo-area { text-align: center; margin-bottom: 72rpx; animation: fadeSlideDown 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes fadeSlideDown { 0% { opacity: 0; transform: translateY(-60rpx) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
.logo-circle { width: 180rpx; height: 180rpx; margin: 0 auto; border-radius: 50%; background: linear-gradient(145deg, rgba(255,182,193,0.4), rgba(192,132,252,0.4)); backdrop-filter: blur(32px) saturate(1.5); border: 2rpx solid rgba(255,255,255,0.75); display: flex; align-items: center; justify-content: center; box-shadow: 0 20rpx 60rpx rgba(167,139,250,0.22), 0 0 100rpx rgba(192,132,252,0.1), 0 0 40rpx rgba(249,168,212,0.08), inset 0 2rpx 12rpx rgba(255,255,255,0.6); animation: logoPulse 5s ease-in-out infinite; position: relative; }
.logo-circle::before { content: ''; position: absolute; inset: -8rpx; border-radius: 50%; background: linear-gradient(135deg, rgba(249,168,212,0.15), rgba(192,132,252,0.15)); filter: blur(16rpx); z-index: -1; animation: logoPulse 5s ease-in-out infinite reverse; }
@keyframes logoPulse { 0%, 100% { box-shadow: 0 20rpx 60rpx rgba(167,139,250,0.22), 0 0 100rpx rgba(192,132,252,0.1), inset 0 2rpx 12rpx rgba(255,255,255,0.6); transform: scale(1); } 50% { box-shadow: 0 24rpx 72rpx rgba(167,139,250,0.3), 0 0 120rpx rgba(192,132,252,0.16), inset 0 2rpx 12rpx rgba(255,255,255,0.7); transform: scale(1.03); } }
.logo-emoji { font-size: 80rpx; filter: drop-shadow(0 4rpx 12rpx rgba(167,139,250,0.3)); }
.app-name { display: block; font-size: 52rpx; font-weight: 800; color: #374151; margin-top: 28rpx; letter-spacing: 8rpx; background: linear-gradient(135deg, #374151, #6b7280); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.app-slogan { display: block; font-size: 24rpx; color: #b4a0d6; margin-top: 14rpx; letter-spacing: 4rpx; font-weight: 300; }

/* Tab 切换 - 高级毛玻璃指示器 */
.tab-row { position: relative; display: flex; margin-bottom: 44rpx; background: rgba(255,255,255,0.5); backdrop-filter: blur(20px) saturate(1.4); border-radius: 28rpx; overflow: hidden; border: 2rpx solid rgba(255,255,255,0.65); box-shadow: 0 6rpx 24rpx rgba(167,139,250,0.06), inset 0 1rpx 0 rgba(255,255,255,0.9); animation: fadeSlideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both; }
@keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(40rpx); } 100% { opacity: 1; transform: translateY(0); } }
.tab-item { flex: 1; text-align: center; padding: 26rpx 0; z-index: 2; transition: color 0.35s; }
.tab-text { font-size: 26rpx; font-weight: 600; color: #b4a0d6; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.tab-item.active .tab-text { color: #fff; text-shadow: 0 1rpx 8rpx rgba(0,0,0,0.12); font-weight: 700; }
.tab-indicator { position: absolute; top: 4rpx; left: 4rpx; width: calc((100% - 8rpx) / 3); height: calc(100% - 8rpx); background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); border-radius: 24rpx; transition: left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 1; box-shadow: 0 6rpx 28rpx rgba(192,132,252,0.35), inset 0 1rpx 0 rgba(255,255,255,0.3); }

/* 表单 - 精致输入框 */
.form-area { display: flex; flex-direction: column; gap: 24rpx; margin-bottom: 44rpx; animation: fadeSlideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s both; }
.input-wrap { display: flex; align-items: center; background: rgba(255,255,255,0.6); backdrop-filter: blur(28px) saturate(1.3); border-radius: 28rpx; padding: 0 32rpx; height: 104rpx; border: 2rpx solid rgba(255,255,255,0.7); box-shadow: 0 4rpx 24rpx rgba(167,139,250,0.04), inset 0 2rpx 0 rgba(255,255,255,0.85); transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.input-wrap:focus-within { border-color: rgba(192,132,252,0.45); box-shadow: 0 6rpx 32rpx rgba(167,139,250,0.12), 0 0 0 6rpx rgba(192,132,252,0.05), inset 0 2rpx 0 rgba(255,255,255,0.9); background: rgba(255,255,255,0.82); transform: translateY(-2rpx); }
.input-icon { font-size: 32rpx; margin-right: 22rpx; flex-shrink: 0; filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.05)); }
.input-wrap input { flex: 1; font-size: 28rpx; color: #374151; font-weight: 500; }
.placeholder { color: #c9b8e8; font-weight: 400; }
.pwd-toggle { padding: 12rpx; flex-shrink: 0; border-radius: 50%; transition: background 0.2s; }
.pwd-toggle:active { background: rgba(167,139,250,0.06); }
.pwd-icon { font-size: 28rpx; }

/* 提交按钮 - 高级渐变+光泽扫光 */
.submit-btn { height: 104rpx; border-radius: 52rpx; background: linear-gradient(135deg, #f9a8d4, #c084fc, #a78bfa); display: flex; align-items: center; justify-content: center; box-shadow: 0 16rpx 48rpx rgba(192,132,252,0.3), 0 6rpx 16rpx rgba(249,168,212,0.15); transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); animation: fadeSlideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both; position: relative; overflow: hidden; }
.submit-btn::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.2), transparent); border-radius: 52rpx 52rpx 0 0; pointer-events: none; }
.submit-btn::after { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); transition: left 0.6s; }
.submit-btn:active { transform: scale(0.96) translateY(2rpx); box-shadow: 0 8rpx 28rpx rgba(192,132,252,0.25); }
.submit-btn:active::after { left: 150%; }
.submit-btn.disabled { opacity: 0.35; box-shadow: none; transform: none; }
.submit-text { font-size: 32rpx; font-weight: 700; color: #fff; letter-spacing: 8rpx; text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); }

/* 底部提示 */
.bottom-tip { text-align: center; margin-top: 40rpx; animation: fadeSlideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s both; }
.tip-text { font-size: 26rpx; color: #a78bfa; font-weight: 500; transition: all 0.25s; letter-spacing: 1rpx; }
.tip-text:active { color: #c084fc; transform: scale(0.97); }
.minor-tip { display: block; margin-top: 16rpx; font-size: 24rpx; color: #c9b8e8; }
.minor-tip:active { color: #a78bfa; }

/* 验证码行 */
.sms-row { padding-right: 16rpx; }
.sms-btn { flex-shrink: 0; padding: 16rpx 32rpx; border-radius: 22rpx; background: linear-gradient(135deg, #f9a8d4, #c084fc); box-shadow: 0 6rpx 20rpx rgba(192,132,252,0.25); transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.sms-btn:active { transform: scale(0.95); }
.sms-btn.disabled { opacity: 0.35; box-shadow: none; }
.sms-btn-text { font-size: 24rpx; color: #fff; font-weight: 600; white-space: nowrap; letter-spacing: 1rpx; }
.sms-hint { font-size: 24rpx; color: #a78bfa; display: block; text-align: center; margin-top: -8rpx; }
</style>
