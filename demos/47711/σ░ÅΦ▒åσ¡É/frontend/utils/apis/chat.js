import { getApiBaseUrl, request, upload } from '../api.js'

function getAssetBaseUrl() {
	return getApiBaseUrl().replace(/\/api\/v1$/, '')
}

export function normalizeAssetUrl(url) {
	if (!url) return ''
	if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('file:')) {
		return url
	}
	if (url.startsWith('/')) {
		return `${getAssetBaseUrl()}${url}`
	}
	return `${getAssetBaseUrl()}/${url.replace(/^\/+/, '')}`
}

function normalizeMessage(message = {}) {
	return {
		...message,
		image_url: normalizeAssetUrl(message.image_url || '')
	}
}

function normalizeSession(session = {}) {
	return {
		...session,
		oc_id: session.oc_id != null ? String(session.oc_id) : ''
	}
}

function normalizeInteraction(result = {}) {
	return {
		...result,
		session: result.session ? normalizeSession(result.session) : null,
		messages: Array.isArray(result.messages) ? result.messages.map(normalizeMessage) : [],
		memories: Array.isArray(result.memories) ? result.memories : []
	}
}

export async function getChatSessions() {
	const res = await request({
		url: '/chat/sessions',
		method: 'GET',
		auth: true
	})
	return {
		items: Array.isArray(res.items) ? res.items.map(normalizeSession) : [],
		vip: res.vip || null
	}
}

export async function createChatSession(payload) {
	const res = await request({
		url: '/chat/sessions',
		method: 'POST',
		data: payload,
		auth: true
	})
	return {
		session: normalizeSession(res.session)
	}
}

export async function getSessionMessages(sessionId) {
	const res = await request({
		url: `/chat/sessions/${sessionId}/messages`,
		method: 'GET',
		auth: true
	})
	return {
		session: normalizeSession(res.session),
		items: Array.isArray(res.items) ? res.items.map(normalizeMessage) : [],
		vip: res.vip || null
	}
}

export async function sendSessionMessage(sessionId, text) {
	const res = await request({
		url: `/chat/sessions/${sessionId}/messages`,
		method: 'POST',
		data: { text },
		auth: true
	})
	return normalizeInteraction(res)
}

export async function sendSessionImageMessage(sessionId, filePath) {
	const res = await upload({
		url: `/chat/sessions/${sessionId}/image-message`,
		filePath,
		name: 'file',
		auth: true
	})
	return normalizeInteraction(res)
}

export async function sendSessionGift(sessionId, payload) {
	const res = await request({
		url: `/chat/sessions/${sessionId}/gift`,
		method: 'POST',
		data: payload,
		auth: true
	})
	return normalizeInteraction(res)
}

export async function sendSessionVoiceCallLog(sessionId, payload) {
	const res = await request({
		url: `/chat/sessions/${sessionId}/voice-call-log`,
		method: 'POST',
		data: payload,
		auth: true
	})
	return normalizeInteraction(res)
}
