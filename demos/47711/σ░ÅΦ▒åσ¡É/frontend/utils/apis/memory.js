import { request } from '../api.js'

const STORAGE_KEYS = {
	CURRENT_USER: 'oc_current_user',
	MEMORIES: 'oc_memories'
}

function getUserKeyPrefix() {
	try {
		const raw = uni.getStorageSync(STORAGE_KEYS.CURRENT_USER)
		if (raw) return `${JSON.parse(raw)}:`
	} catch (e) { }
	return ''
}

export function replaceLocalMemories(items) {
	try {
		uni.setStorageSync(
			getUserKeyPrefix() + STORAGE_KEYS.MEMORIES,
			JSON.stringify(Array.isArray(items) ? items : [])
		)
	} catch (e) { }
}

export async function fetchMemories(options = {}) {
	const { syncLocal = true } = options
	const res = await request({
		url: '/memories',
		method: 'GET',
		auth: true
	})
	const items = Array.isArray(res.items) ? res.items : []
	if (syncLocal) replaceLocalMemories(items)
	return items
}
