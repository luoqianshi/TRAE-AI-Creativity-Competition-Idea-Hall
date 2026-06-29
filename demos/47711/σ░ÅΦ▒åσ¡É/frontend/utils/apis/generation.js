import { request } from '../api.js'


export function textGenerate(data) {
	return request({
		url: '/ai/text-generate',
		method: 'POST',
		data,
		auth: true
	})
}

export function assistantChat(data) {
	return request({
		url: '/ai/assistant/chat',
		method: 'POST',
		data,
		auth: true
	})
}

export function createGenerationJob(data) {
	return request({
		url: '/generation/jobs',
		method: 'POST',
		data,
		auth: true
	})
}

export function getGenerationJob(jobId) {
	return request({
		url: `/generation/jobs/${jobId}`,
		method: 'GET',
		auth: true
	})
}
