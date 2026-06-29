import { tt } from './i18n.js'

// HBuilder 本机/H5 调试可直接访问 127.0.0.1。
// 如果是真机调试，需要改成电脑在局域网中的 IP。
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
const AUTH_TOKEN_KEY = 'oc_auth_token'

function getAuthToken() {
	try {
		return uni.getStorageSync(AUTH_TOKEN_KEY) || ''
	} catch (e) {
		return ''
	}
}

function buildUrl(url) {
	if (!url) return API_BASE_URL
	return `${API_BASE_URL}${url}`
}

function normalizeSuccessPayload(payload) {
	if (!payload || typeof payload !== 'object') return payload
	if (!Object.prototype.hasOwnProperty.call(payload, 'code')) return payload
	if (payload.code !== 0) {
		throw new Error(tt(payload.message || '请求失败'))
	}

	const data = payload.data
	if (data && typeof data === 'object' && !Array.isArray(data)) {
		return {
			...data,
			message: payload.message,
			code: payload.code
		}
	}

	return {
		data,
		message: payload.message,
		code: payload.code
	}
}

function extractErrorMessage(payload) {
	if (!payload || typeof payload !== 'object') return '请求失败'
	if (payload.message) return payload.message
	if (payload.detail) return payload.detail
	if (Array.isArray(payload.data) && payload.data.length > 0) {
		return payload.data[0]?.msg || '请求参数校验失败'
	}
	return '请求失败'
}

function buildHeaders(header = {}, auth = false) {
	if (!auth) return header
	const token = getAuthToken()
	if (!token) return header
	return {
		Authorization: `Bearer ${token}`,
		...header
	}
}

export function request({ url, method = 'GET', data = null, header = {}, auth = false }) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: buildUrl(url),
			method,
			data,
			header: buildHeaders(header, auth),
			success: (res) => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					try {
						resolve(normalizeSuccessPayload(res.data))
					} catch (error) {
						reject(error)
					}
					return
				}
				const message = extractErrorMessage(res.data)
				reject(new Error(tt(message || '请求失败')))
			},
			fail: (err) => {
				reject(new Error(tt(err?.errMsg || '无法连接后端服务')))
			}
		})
	})
}

export function upload({
	url,
	filePath,
	name = 'file',
	formData = {},
	header = {},
	auth = false
}) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: buildUrl(url),
			filePath,
			name,
			formData,
			header: buildHeaders(header, auth),
			success: (res) => {
				try {
					const payload = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
					resolve(normalizeSuccessPayload(payload))
				} catch (error) {
					reject(error)
				}
			},
			fail: (err) => {
				reject(new Error(tt(err?.errMsg || '文件上传失败')))
			}
		})
	})
}

export function getApiBaseUrl() {
	return API_BASE_URL
}

export function getAuthTokenValue() {
	return getAuthToken()
}

export function unwrapApiResponse(payload) {
	return normalizeSuccessPayload(payload)
}
