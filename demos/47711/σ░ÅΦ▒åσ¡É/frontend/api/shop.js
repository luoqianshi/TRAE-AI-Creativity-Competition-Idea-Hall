import { request } from '../utils/api'

const PREFIX = '/shop'

export function shopRequest({ url = '', method = 'GET', data = null, auth = false, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}
