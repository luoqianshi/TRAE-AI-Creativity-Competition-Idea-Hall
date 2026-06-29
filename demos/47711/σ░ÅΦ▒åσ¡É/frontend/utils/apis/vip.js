import { request } from '../api.js'

export async function activateDemoVip(payload = {}) {
	return request({
		url: '/vip/activate-demo',
		method: 'POST',
		data: payload,
		auth: true
	})
}
