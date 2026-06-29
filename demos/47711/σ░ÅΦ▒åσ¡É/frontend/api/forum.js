import { request } from '../utils/api'

const PREFIX = '/forum'

export function forumRequest({ url = '', method = 'GET', data = null, auth = false, header = {} } = {}) {
	return request({ url: `${PREFIX}${url}`, method, data, auth, header })
}
