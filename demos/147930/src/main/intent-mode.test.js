import test from 'node:test'
import assert from 'node:assert/strict'

test('intent mode labels stay stable for product copy', () => {
  const labels = {
    auto: '自动判断',
    chat: '聊天问答',
    code: '改代码'
  }

  assert.equal(labels.auto, '自动判断')
  assert.equal(labels.chat, '聊天问答')
  assert.equal(labels.code, '改代码')
})
