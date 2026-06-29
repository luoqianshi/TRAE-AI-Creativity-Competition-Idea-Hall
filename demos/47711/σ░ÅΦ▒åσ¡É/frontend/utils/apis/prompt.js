import { request } from '../api.js'


export function getPrompts(params = {}) {
	return request({
		url: '/prompts',
		method: 'GET',
		data: params,
		auth: true
	})
}

export function createPrompt(data) {
	return request({
		url: '/prompts',
		method: 'POST',
		data,
		auth: true
	})
}

export function togglePromptLike(promptId) {
	return request({
		url: `/prompts/${promptId}/like`,
		method: 'POST',
		auth: true
	})
}

export function createPromptComment(promptId, data) {
	return request({
		url: `/prompts/${promptId}/comments`,
		method: 'POST',
		data,
		auth: true
	})
}
