export function parseXoderDeepLink(value = '') {
  const raw = String(value || '').trim()

  if (!raw.toLowerCase().startsWith('xoder://')) {
    return null
  }

  try {
    const url = new URL(raw)
    const taskMatch = url.pathname.match(/^\/task\/([^/]+)$/)
    const taskId =
      url.hostname.toLowerCase() === 'task'
        ? decodeURIComponent(url.pathname.replace(/^\//, ''))
        : taskMatch
          ? decodeURIComponent(taskMatch[1])
          : ''

    return {
      url: raw,
      action: url.hostname || 'open',
      taskId
    }
  } catch {
    return {
      url: raw,
      action: 'open',
      taskId: ''
    }
  }
}
