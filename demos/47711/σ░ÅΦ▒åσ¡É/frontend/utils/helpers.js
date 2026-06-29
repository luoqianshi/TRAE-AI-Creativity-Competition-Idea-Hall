import { tt } from './i18n.js'

/**
 * 相对时间格式化
 * @param {number} ts - 时间戳
 * @returns {string}
 */
export function timeAgo(ts) {
	const diff = Date.now() - ts
	if (diff < 60000) return tt('刚刚')
	if (diff < 3600000) return `${Math.floor(diff / 60000)} ${tt('分钟前')}`
	if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${tt('小时前')}`
	if (diff < 604800000) return `${Math.floor(diff / 86400000)} ${tt('天前')}`
	return new Date(ts).toLocaleDateString()
}

/**
 * 生成唯一 ID
 * @returns {string}
 */
export function generateId() {
	return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
