import { request } from '../api.js'


function toTimestamp(value) {
	if (!value) return Date.now()
	if (typeof value === 'number') return value
	const parsed = new Date(value).getTime()
	return Number.isNaN(parsed) ? Date.now() : parsed
}

function unwrapListPayload(payload) {
	if (Array.isArray(payload)) return payload
	if (Array.isArray(payload?.data)) return payload.data
	return []
}

function unwrapObjectPayload(payload) {
	if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
		if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
			return payload.data
		}
		return payload
	}
	return {}
}

function normalizeApplication(raw = {}) {
	const userId = Number(raw.user_id ?? raw.userId ?? 0)
	return {
		id: Number(raw.id || 0),
		user_id: userId,
		userId,
		name: raw.name || '',
		msg: raw.msg || '',
		time: toTimestamp(raw.time),
		status: raw.status || 'pending',
	}
}

function normalizeCommission(raw = {}) {
	const applicants = Array.isArray(raw.applicants) ? raw.applicants.map(normalizeApplication) : []
	return {
		id: Number(raw.id || 0),
		type: raw.type || 'seeker',
		avatar: raw.avatar || '👤',
		author: raw.author || '',
		title: raw.title || '',
		desc: raw.desc || '',
		styles: Array.isArray(raw.styles) ? raw.styles : [],
		priceRange: raw.priceRange || raw.price_range || '面议',
		turnaround: raw.turnaround || '待商议',
		samples: Array.isArray(raw.samples) ? raw.samples : [],
		status: raw.status || 'open',
		time: toTimestamp(raw.time || raw.created_at),
		applicants,
		ownedByMe: !!raw.ownedByMe,
		appliedByMe: !!raw.appliedByMe,
		myApplicationId: raw.myApplicationId ?? null,
	}
}

function normalizeCommissionList(rawList = []) {
	return rawList.map(normalizeCommission)
}

export async function getCommissions() {
	const res = await request({ url: '/commissions', auth: true })
	return normalizeCommissionList(unwrapListPayload(res))
}

export async function createCommission(data) {
	const res = await request({
		url: '/commissions',
		method: 'POST',
		data,
		auth: true,
	})
	return normalizeCommission(unwrapObjectPayload(res))
}

export async function getCommissionDetail(id) {
	const res = await request({ url: `/commissions/${id}`, auth: true })
	return normalizeCommission(unwrapObjectPayload(res))
}

export async function deleteCommission(id) {
	await request({
		url: `/commissions/${id}`,
		method: 'DELETE',
		auth: true,
	})
}

export async function applyCommission(id, data = {}) {
	const res = await request({
		url: `/commissions/${id}/apply`,
		method: 'POST',
		data,
		auth: true,
	})
	return normalizeCommission(unwrapObjectPayload(res))
}

export async function acceptCommissionApplication(id, applicationId) {
	const res = await request({
		url: `/commissions/${id}/applications/${applicationId}/accept`,
		method: 'POST',
		auth: true,
	})
	return normalizeCommission(unwrapObjectPayload(res))
}

export async function rejectCommissionApplication(id, applicationId) {
	const res = await request({
		url: `/commissions/${id}/applications/${applicationId}/reject`,
		method: 'POST',
		auth: true,
	})
	return normalizeCommission(unwrapObjectPayload(res))
}

export async function getCommissionDashboard() {
	const res = await request({
		url: '/me/commission-dashboard',
		auth: true,
	})
	const data = unwrapObjectPayload(res)
	return {
		receivedApplications: normalizeCommissionList(data.received_applications || []),
		inProgressAsClient: normalizeCommissionList(data.in_progress_as_client || []),
		inProgressAsArtist: normalizeCommissionList(data.in_progress_as_artist || []),
		pendingOutgoing: normalizeCommissionList(data.pending_outgoing || []),
	}
}

