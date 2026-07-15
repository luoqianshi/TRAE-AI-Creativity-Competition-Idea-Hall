import test from 'node:test'
import assert from 'node:assert/strict'

import { parseXoderDeepLink } from './deep-link.js'

test('parses task deep links with a host-based task route', () => {
  assert.deepEqual(parseXoderDeepLink('xoder://task/task_123'), {
    url: 'xoder://task/task_123',
    action: 'task',
    taskId: 'task_123'
  })
})

test('parses task deep links with a path-based task route', () => {
  assert.deepEqual(parseXoderDeepLink('xoder:///task/task%2F123'), {
    url: 'xoder:///task/task%2F123',
    action: 'open',
    taskId: 'task/123'
  })
})

test('ignores unsupported deep link schemes', () => {
  assert.equal(parseXoderDeepLink('https://example.com/task/task_123'), null)
})
