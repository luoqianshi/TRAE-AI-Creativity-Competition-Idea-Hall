import { request } from '../utils/api'

const PREFIX = '/commission'

export function commissionRequest({ url = '', method = 'GET', data = null, auth = true, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}
