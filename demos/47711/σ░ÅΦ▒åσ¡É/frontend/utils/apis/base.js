import { request, upload } from '../api.js'

function joinUrl(prefix, path = '') {
	const normalizedPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`
	if (!path) return normalizedPrefix
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	return `${normalizedPrefix}${normalizedPath}`
}

export function createDomainApi(prefix, defaults = {}) {
	const { auth = false, header = {} } = defaults

	return {
		request({ url = '', method = 'GET', data = null, auth: customAuth, header: customHeader = {} } = {}) {
			return request({
				url: joinUrl(prefix, url),
				method,
				data,
				auth: typeof customAuth === 'boolean' ? customAuth : auth,
				header: { ...header, ...customHeader }
			})
		},
		get(url = '', data = null, options = {}) {
			return this.request({ url, method: 'GET', data, ...options })
		},
		post(url = '', data = null, options = {}) {
			return this.request({ url, method: 'POST', data, ...options })
		},
		put(url = '', data = null, options = {}) {
			return this.request({ url, method: 'PUT', data, ...options })
		},
		delete(url = '', data = null, options = {}) {
			return this.request({ url, method: 'DELETE', data, ...options })
		},
		upload(filePath, formData = {}, options = {}) {
			const { name = 'file', auth: customAuth, header: customHeader = {}, url = '/upload' } = options
			return upload({
				url: joinUrl(prefix, url),
				filePath,
				name,
				formData,
				auth: typeof customAuth === 'boolean' ? customAuth : auth,
				header: { ...header, ...customHeader }
			})
		}
	}
}
