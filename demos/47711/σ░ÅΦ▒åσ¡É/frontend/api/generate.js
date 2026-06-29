import { request } from '../utils/api'

const PREFIX = '/generate'

export function generateRequest({ url = '', method = 'GET', data = null, auth = true, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}
