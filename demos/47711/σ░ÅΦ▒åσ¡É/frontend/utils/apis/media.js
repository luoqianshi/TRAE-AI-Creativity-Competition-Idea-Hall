import { getApiBaseUrl, request, upload } from '../api.js'

const BACKEND_BASE_URL = getApiBaseUrl().replace(/\/api\/v1\/?$/, '')

function resolveMediaUrl(url = '') {
	if (!url) return ''
	if (/^https?:\/\//i.test(url)) return url
	if (url.startsWith('/')) return `${BACKEND_BASE_URL}${url}`
	return `${BACKEND_BASE_URL}/${url}`
}

function normalizeMediaAsset(item = {}) {
	return {
		...item,
		path: resolveMediaUrl(item.url),
	}
}

function buildMediaFormData(options = {}) {
	const formData = {}
	const fields = ['biz_type', 'biz_id', 'file_type', 'mime_type', 'width', 'height', 'duration']
	fields.forEach(key => {
		const value = options[key]
		if (value !== undefined && value !== null && value !== '') {
			formData[key] = value
		}
	})
	return formData
}

export function getMediaUploadPolicy() {
	return request({
		url: '/media/policy',
		method: 'GET',
		auth: true
	})
}

export function uploadMedia({
	filePath,
	bizType,
	bizId,
	fileType,
	mimeType = '',
	width,
	height,
	duration
}) {
	return upload({
		url: '/media/upload',
		filePath,
		name: 'file',
		formData: buildMediaFormData({
			biz_type: bizType,
			biz_id: bizId,
			file_type: fileType,
			mime_type: mimeType,
			width,
			height,
			duration
		}),
		auth: true
	}).then(normalizeMediaAsset)
}

export function deleteMedia(mediaId) {
	return request({
		url: `/media/${mediaId}`,
		method: 'DELETE',
		auth: true
	})
}

export function getOCMedia(ocId) {
	return request({
		url: `/ocs/${ocId}/media`,
		method: 'GET',
		auth: true
	}).then((payload) => ({
		...payload,
		images: (payload.images || []).map(normalizeMediaAsset),
		videos: (payload.videos || []).map(normalizeMediaAsset)
	}))
}

export function uploadOCImage(ocId, options) {
	return upload({
		url: `/ocs/${ocId}/images`,
		filePath: options.filePath,
		name: 'file',
		formData: buildMediaFormData({
			mime_type: options.mimeType,
			width: options.width,
			height: options.height
		}),
		auth: true
	}).then(normalizeMediaAsset)
}

export function uploadOCVideo(ocId, options) {
	return upload({
		url: `/ocs/${ocId}/videos`,
		filePath: options.filePath,
		name: 'file',
		formData: buildMediaFormData({
			mime_type: options.mimeType,
			width: options.width,
			height: options.height,
			duration: options.duration
		}),
		auth: true
	}).then(normalizeMediaAsset)
}

export function deleteOCMedia(ocId, mediaId) {
	return request({
		url: `/ocs/${ocId}/media/${mediaId}`,
		method: 'DELETE',
		auth: true
	})
}

export { resolveMediaUrl, normalizeMediaAsset }
