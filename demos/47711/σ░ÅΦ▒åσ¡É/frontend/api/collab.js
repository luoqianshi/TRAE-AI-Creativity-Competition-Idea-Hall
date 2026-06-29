import { request } from '../utils/api'

const PREFIX = '/collabs'
const CARD_GRADIENTS = [
	'linear-gradient(135deg,#f97316,#ef4444)',
	'linear-gradient(135deg,#667eea,#764ba2)',
	'linear-gradient(135deg,#34d399,#059669)',
	'linear-gradient(135deg,#ec4899,#be185d)'
]

function buildGradient(id) {
	return CARD_GRADIENTS[Math.abs(Number(id) || 0) % CARD_GRADIENTS.length]
}

function normalizeApplication(item = {}) {
	return {
		id: item.id,
		userId: item.user_id,
		applicantName: item.applicant_name || '',
		message: item.message || '',
		applyTime: item.apply_time ? new Date(item.apply_time).getTime() : 0
	}
}

function normalizeCollab(item = {}) {
	return {
		id: item.id,
		ownerUserId: item.owner_user_id ?? null,
		ownerName: item.owner_name || '',
		ocName: item.oc_name || '',
		emoji: item.emoji || '🌟',
		desc: item.description || '',
		status: item.status || '招募中',
		tags: Array.isArray(item.tags) ? item.tags : [],
		applicationCount: item.application_count || 0,
		applied: !!item.applied,
		ownedByMe: !!item.owned_by_me,
		createdAt: item.created_at ? new Date(item.created_at).getTime() : 0,
		applications: Array.isArray(item.applications) ? item.applications.map(normalizeApplication) : [],
		gradient: buildGradient(item.id)
	}
}

function extractList(res) {
	const list = Array.isArray(res?.data) ? res.data : []
	return list.map(normalizeCollab)
}

function extractDetail(res) {
	return normalizeCollab(res?.data || res)
}

export function collabRequest({ url = '', method = 'GET', data = null, auth = false, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}

export async function listCollabs() {
	const res = await collabRequest({ auth: true })
	return extractList(res)
}

export async function createCollab(data) {
	const res = await collabRequest({ method: 'POST', data, auth: true })
	return extractDetail(res)
}

export async function applyCollab(id, data = {}) {
	const res = await collabRequest({ url: `/${id}/apply`, method: 'POST', data, auth: true })
	return extractDetail(res)
}

export async function cancelCollabApply(id) {
	const res = await collabRequest({ url: `/${id}/apply`, method: 'DELETE', auth: true })
	return extractDetail(res)
}
