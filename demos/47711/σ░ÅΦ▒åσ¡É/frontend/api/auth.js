import { request } from '../utils/api'

const PREFIX = '/auth'

export function register(data) {
	return registerWithSms(data)
}

export function registerWithSms(data) {
	return request({ url: `${PREFIX}/register`, method: 'POST', data })
}

export function login(data) {
	return request({ url: `${PREFIX}/login`, method: 'POST', data })
}

export function sendResetCode(data) {
	return sendSms(data?.phone, 'reset_password')
}

export function sendSms(phone, scene) {
	return request({
		url: `${PREFIX}/send-sms`,
		method: 'POST',
		data: { phone, scene }
	})
}

export function forgotPassword(data) {
	if (data?.phone && data?.code && data?.new_password) {
		return request({ url: `${PREFIX}/forgot-password`, method: 'POST', data })
	}
	return resetPasswordBySms(data?.phone, data?.code, data?.newPassword)
}

export function resetPasswordBySms(phone, code, newPassword) {
	return request({
		url: `${PREFIX}/forgot-password`,
		method: 'POST',
		data: { phone, code, new_password: newPassword }
	})
}
