import { request } from '../api.js'


export function getHomeDashboard() {
	return request({
		url: '/home/dashboard',
		method: 'GET',
		auth: true
	})
}
