import { getApiBaseUrl, request, upload } from '../api.js'

const AUTH_USER_KEY = 'oc_auth_user'
const CURRENT_USER_KEY = 'oc_current_user'
const PROFILE_KEY = 'oc_user_profile'
const PREFIX = '/me'
const API_ORIGIN = getApiBaseUrl().replace(/\/api\/v1$/, '')

function toAbsoluteUrl(url) {
	if (!url) return ''
	if (/^https?:\/\//.test(url)) return url
	if (url.startsWith('/')) return `${API_ORIGIN}${url}`
	return `${API_ORIGIN}/${url}`
}

function getCurrentUsername() {
	try {
		const raw = uni.getStorageSync(CURRENT_USER_KEY)
		return raw ? JSON.parse(raw) : ''
	} catch (error) {
		return ''
	}
}

function syncProfileCache(profile) {
	const username = profile?.username || getCurrentUsername()
	if (!username) return
	uni.setStorageSync(`${username}:${PROFILE_KEY}`, JSON.stringify(profile))
	uni.setStorageSync(AUTH_USER_KEY, JSON.stringify(profile))
}

function normalizeProfile(data) {
	if (!data) return data
	const profile = {
		id: data.id,
		username: data.username,
		nickname: data.nickname || data.username || '新契约者',
		mood: data.mood || '',
		avatar: toAbsoluteUrl(data.avatar),
		phone: data.phone || '',
		phoneVerified: !!data.phone_verified,
		level: Number(data.level || 1),
		exp: Number(data.exp || 0),
		vip: !!data.vip,
		interactDays: Number(data.interact_days || 0),
		settingCount: Number(data.setting_count || 0),
		totalRevenue: Number(data.total_revenue || 0),
		monthRevenue: Number(data.month_revenue || 0),
		pendingWithdraw: Number(data.pending_withdraw || 0),
		monthViews: Number(data.month_views || 0),
		newFollowers: Number(data.new_followers || 0),
		interactRate: Number(data.interact_rate || 0),
		createdAt: data.created_at || '',
		updatedAt: data.updated_at || '',
	}
	syncProfileCache(profile)
	return profile
}

function normalizeSigninStatus(data) {
	return {
		todaySigned: !!data?.signed_today,
		streak: Number(data?.streak || 0),
		dates: Array.isArray(data?.recent_dates) ? data.recent_dates : [],
		latestDate: data?.latest_date || '',
	}
}

function normalizeFortune(data) {
	return {
		title: data?.title || '',
		summary: data?.summary || '',
		luckyColor: data?.lucky_color || '',
		luckyNumber: Number(data?.lucky_number || 0),
		score: Number(data?.score || 0),
		date: data?.date || '',
	}
}

export async function getMe() {
	const res = await request({ url: PREFIX, auth: true })
	return normalizeProfile(res)
}

export async function updateMe(data) {
	const res = await request({ url: PREFIX, method: 'PATCH', data, auth: true })
	return normalizeProfile(res)
}

export async function uploadAvatar(filePath) {
	const res = await upload({
		url: `${PREFIX}/avatar`,
		filePath,
		name: 'file',
		auth: true,
	})
	return {
		avatar: toAbsoluteUrl(res.avatar),
	}
}

export function sendPhoneCode(data) {
	return request({ url: `${PREFIX}/phone/send-code`, method: 'POST', data, auth: true }).then((res) => ({
		debugCode: res.debug_code || '',
	}))
}

export async function verifyPhone(data) {
	const res = await request({ url: `${PREFIX}/phone/verify`, method: 'POST', data, auth: true })
	return normalizeProfile(res)
}

export async function getSigninStatus() {
	const res = await request({ url: `${PREFIX}/signin/status`, auth: true })
	return normalizeSigninStatus(res)
}

export async function signIn() {
	const res = await request({ url: `${PREFIX}/signin`, method: 'POST', auth: true })
	return {
		alreadySigned: !!res.already_signed,
		streak: Number(res.streak || 0),
		dates: Array.isArray(res.recent_dates) ? res.recent_dates : [],
		expGained: Number(res.exp_gained || 0),
		level: Number(res.level || 1),
		exp: Number(res.exp || 0),
		fortune: normalizeFortune(res.fortune),
	}
}

export async function getTodayFortune() {
	const res = await request({ url: `${PREFIX}/fortune/today`, auth: true })
	return normalizeFortune(res)
}

export async function getDashboard() {
	const res = await request({ url: `${PREFIX}/dashboard`, auth: true })
	return {
		profile: normalizeProfile(res.profile),
		signinStatus: normalizeSigninStatus(res.signin_status),
		todayFortune: normalizeFortune(res.today_fortune),
	}
}

export async function createWithdrawRequest(data = {}) {
	const res = await request({
		url: `${PREFIX}/withdraw-requests`,
		method: 'POST',
		data,
		auth: true,
	})
	return {
		request: res.request,
		pendingWithdraw: Number(res.pending_withdraw || 0),
	}
}
