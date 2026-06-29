import { request } from '../utils/api'

const PREFIX = '/user'

export function userRequest({ url = '', method = 'GET', data = null, auth = true, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}
