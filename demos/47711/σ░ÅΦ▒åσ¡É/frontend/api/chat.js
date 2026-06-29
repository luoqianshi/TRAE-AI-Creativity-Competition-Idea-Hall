import { request } from '../utils/api'

const PREFIX = '/chat'

export function chatRequest({ url = '', method = 'GET', data = null, auth = true, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}
