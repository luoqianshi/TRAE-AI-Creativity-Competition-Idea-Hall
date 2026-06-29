import { request } from '../api.js'

const PREFIX = '/forum'

export function getForumPosts(params = {}) {
	return request({
		url: `${PREFIX}/posts`,
		method: 'GET',
		data: params,
		auth: true
	})
}

export function createForumPost(data) {
	return request({
		url: `${PREFIX}/posts`,
		method: 'POST',
		data,
		auth: true
	})
}

export function getForumPostDetail(id) {
	return request({
		url: `${PREFIX}/posts/${id}`,
		method: 'GET',
		auth: true
	})
}

export function deleteForumPost(id) {
	return request({
		url: `${PREFIX}/posts/${id}`,
		method: 'DELETE',
		auth: true
	})
}

export function toggleForumPostLike(id) {
	return request({
		url: `${PREFIX}/posts/${id}/like`,
		method: 'POST',
		auth: true
	})
}

export function createForumComment(postId, data) {
	return request({
		url: `${PREFIX}/posts/${postId}/comments`,
		method: 'POST',
		data,
		auth: true
	})
}

export function toggleForumCommentLike(id) {
	return request({
		url: `${PREFIX}/comments/${id}/like`,
		method: 'POST',
		auth: true
	})
}
