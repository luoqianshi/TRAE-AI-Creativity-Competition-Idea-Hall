import { request } from '../api.js'

const AUTH_TOKEN_KEY = 'oc_auth_token'
const AUTH_USER_KEY = 'oc_auth_user'
const CURRENT_USER_KEY = 'oc_current_user'

function writeJsonStorage(key, value) {
	uni.setStorageSync(key, JSON.stringify(value))
}

function removeStorage(key) {
	try {
		uni.removeStorageSync(key)
	} catch (error) {
		console.warn(`remove ${key} failed`, error)
	}
}

function persistAuthSession(payload) {
	if (!payload?.access_token || !payload?.user?.username) return payload
	uni.setStorageSync(AUTH_TOKEN_KEY, payload.access_token)
	writeJsonStorage(AUTH_USER_KEY, payload.user)
	writeJsonStorage(CURRENT_USER_KEY, payload.user.username)
	return payload
}

export function clearAuthSession() {
	removeStorage(AUTH_TOKEN_KEY)
	removeStorage(AUTH_USER_KEY)
	removeStorage(CURRENT_USER_KEY)
}

export function getCurrentUsername() {
	try {
		const raw = uni.getStorageSync(CURRENT_USER_KEY)
		return raw ? JSON.parse(raw) : ''
	} catch (error) {
		return ''
	}
}

export async function register(data) {
	return registerWithSms(data)
}

export async function registerWithSms(data) {
	const res = await request({ url: '/auth/register', method: 'POST', data })
	return persistAuthSession(res)
}

export async function login(data) {
	const res = await request({ url: '/auth/login', method: 'POST', data })
	return persistAuthSession(res)
}

export function sendResetCode(data) {
	return sendSms(data?.phone, 'reset_password')
}

export function sendSms(phone, scene) {
	return request({
		url: '/auth/send-sms',
		method: 'POST',
		data: { phone, scene }
	})
}

export function forgotPassword(data) {
	if (data?.phone && data?.code && data?.new_password) {
		return request({ url: '/auth/forgot-password', method: 'POST', data })
	}
	return resetPasswordBySms(data?.phone, data?.code, data?.newPassword)
}

export function resetPasswordBySms(phone, code, newPassword) {
	return request({
		url: '/auth/forgot-password',
		method: 'POST',
		data: { phone, code, new_password: newPassword }
	})
}
