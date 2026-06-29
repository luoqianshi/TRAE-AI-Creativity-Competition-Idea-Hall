import { request } from '../utils/api'

const PREFIX = '/activities'

function normalizeActivitySignup(item = {}) {
	return {
		id: item.id,
		userId: item.user_id ?? null,
		name: item.name || '',
		phone: item.phone || '',
		note: item.note || '',
		signupTime: item.signup_time ? new Date(item.signup_time).getTime() : 0
	}
}

function normalizeActivity(item = {}) {
	return {
		id: item.id,
		emoji: item.emoji || '🎭',
		title: item.title || '',
		description: item.description || '',
		date: item.date || '',
		time: item.time || '',
		location: item.location || '',
		maxParticipants: item.max_participants || 0,
		tags: Array.isArray(item.tags) ? item.tags : [],
		organizer: item.organizer || '',
		organizerAvatar: item.organizer_avatar || '',
		status: item.status || '报名中',
		signupCount: item.signup_count || 0,
		isJoined: !!item.is_signed_up,
		mySignupTime: item.my_signup_time ? new Date(item.my_signup_time).getTime() : 0,
		signups: Array.isArray(item.signups) ? item.signups.map(normalizeActivitySignup) : []
	}
}

function extractList(res) {
	const list = Array.isArray(res?.data) ? res.data : []
	return list.map(normalizeActivity)
}

function extractDetail(res) {
	return normalizeActivity(res?.data || res)
}

export function activityRequest({ url = '', method = 'GET', data = null, auth = false, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}

export async function listActivities() {
	const res = await activityRequest({ auth: true })
	return extractList(res)
}

export async function getActivityDetail(id) {
	const res = await activityRequest({ url: `/${id}`, auth: true })
	return extractDetail(res)
}

export async function createActivitySignup(id, data) {
	const res = await activityRequest({ url: `/${id}/signup`, method: 'POST', data, auth: true })
	return extractDetail(res)
}

export async function deleteActivitySignup(id) {
	const res = await activityRequest({ url: `/${id}/signup`, method: 'DELETE', auth: true })
	return extractDetail(res)
}

export async function listMyActivitySignups() {
	const res = await activityRequest({ url: '/my-signups', auth: true })
	return extractList(res)
}
