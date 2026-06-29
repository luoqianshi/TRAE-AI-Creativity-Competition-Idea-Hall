import { request } from '../utils/api'

const PREFIX = ''

export function ocRequest({ url = '', method = 'GET', data = null, auth = true, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}

export function fetchOCs() {
	return ocRequest({ url: '/ocs' })
}

export function createOC(data) {
	return ocRequest({ url: '/ocs', method: 'POST', data })
}

export function fetchOCDetail(id) {
	return ocRequest({ url: `/ocs/${id}` })
}

export function updateOC(id, data) {
	return ocRequest({ url: `/ocs/${id}`, method: 'PATCH', data })
}

export function deleteOCById(id) {
	return ocRequest({ url: `/ocs/${id}`, method: 'DELETE' })
}

export function fetchWorld() {
	return ocRequest({ url: '/world' })
}

export function saveWorld(data) {
	return ocRequest({ url: '/world', method: 'PUT', data })
}

export function fetchRelations(params = {}) {
	return ocRequest({ url: buildRelationsUrl(params) })
}

export function createRelation(data) {
	return ocRequest({ url: '/relations', method: 'POST', data })
}

export function updateRelation(id, data) {
	return ocRequest({ url: `/relations/${id}`, method: 'PATCH', data })
}

export function deleteRelation(id) {
	return ocRequest({ url: `/relations/${id}`, method: 'DELETE' })
}

function buildRelationsUrl(params = {}) {
	const query = []
	if (params.ocId) query.push(`oc_id=${encodeURIComponent(params.ocId)}`)
	return query.length ? `/relations?${query.join('&')}` : '/relations'
}
