import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  getStaticMessagesForQuest,
  staticEmployees,
  staticQuests,
  staticRightPanel,
  staticWorkspaces
} from '../renderer/src/static-data.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const sourceRoot = join(currentDir, '..')

test('preload exposes only the new agent runtime API, not legacy dynamic APIs', async () => {
  const preloadSource = await readFile(join(sourceRoot, 'preload', 'index.js'), 'utf8')

  for (const forbidden of [
    'conversation:',
    'workbench:',
    'desktopNode:',
    'model:',
    'conversation:send',
    'workbench:get-snapshot',
    'desktopNode:get-state',
    'model:get-config'
  ]) {
    assert.equal(preloadSource.includes(forbidden), false, `${forbidden} should not be exposed`)
  }

  assert.equal(preloadSource.includes('agent-runtime:start'), true)
  assert.equal(preloadSource.includes('agentRuntime'), true)
})

test('main process registers the new runtime bridge without legacy handlers', async () => {
  const mainSource = await readFile(join(sourceRoot, 'main', 'index.js'), 'utf8')

  for (const forbidden of [
    'conversation:send',
    'conversation:stop',
    'conversation:get-trace',
    'workbench:get-snapshot',
    'desktopNode:get-state',
    'desktopNode:sync-now',
    'model:save-config'
  ]) {
    assert.equal(mainSource.includes(forbidden), false, `${forbidden} should not be registered`)
  }

  assert.equal(mainSource.includes('registerAgentRuntimeIpc'), true)
})

test('static fixtures render core Xoder surfaces', () => {
  assert.ok(staticWorkspaces.length > 0)
  assert.ok(staticQuests.length > 0)
  assert.ok(staticEmployees.length > 0)
  assert.ok(staticRightPanel.progressTasks.length > 0)
  assert.ok(staticRightPanel.artifacts.length > 0)

  const firstQuest = staticQuests[0]
  const messages = getStaticMessagesForQuest(firstQuest.id)

  assert.ok(messages.some((message) => message.role === 'user'))
  assert.ok(messages.some((message) => message.role === 'assistant'))
})
