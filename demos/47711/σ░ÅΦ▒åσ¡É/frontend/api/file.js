import { request, upload } from '../utils/api'

const PREFIX = '/file'

export function fileRequest({ url = '', method = 'GET', data = null, auth = true, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}

export function uploadDomainFile(filePath, formData = {}, name = 'file') {
	return upload({
		url: `${PREFIX}/upload`,
		filePath,
		name,
		formData,
		auth: true
	})
}
