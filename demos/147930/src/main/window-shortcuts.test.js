import test from 'node:test'
import assert from 'node:assert/strict'

import { shouldPreventWindowCloseShortcut } from './window-shortcuts.js'

test('prevents Ctrl+W from closing the main window', () => {
  assert.equal(
    shouldPreventWindowCloseShortcut({ type: 'keyDown', key: 'w', control: true }),
    true
  )
})

test('prevents Command+W from closing the main window', () => {
  assert.equal(
    shouldPreventWindowCloseShortcut({ type: 'keyDown', key: 'W', meta: true }),
    true
  )
})

test('does not intercept related but distinct keyboard input', () => {
  assert.equal(shouldPreventWindowCloseShortcut({ type: 'keyDown', key: 'w' }), false)
  assert.equal(
    shouldPreventWindowCloseShortcut({ type: 'keyDown', key: 'w', control: true, shift: true }),
    false
  )
  assert.equal(
    shouldPreventWindowCloseShortcut({ type: 'keyUp', key: 'w', control: true }),
    false
  )
})
