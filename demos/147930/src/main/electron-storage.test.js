import test from 'node:test'
import assert from 'node:assert/strict'
import { access, mkdtemp, rm } from 'node:fs/promises'
import { join, normalize } from 'node:path'
import { tmpdir } from 'node:os'

import { configureElectronStorage, resolveElectronStoragePaths } from './electron-storage.js'

test('resolveElectronStoragePaths keeps dev storage separate from production', () => {
  const production = resolveElectronStoragePaths({
    appDataPath: 'C:/Users/test/AppData/Roaming',
    appName: 'xoder'
  })
  const development = resolveElectronStoragePaths({
    appDataPath: 'C:/Users/test/AppData/Roaming',
    appName: 'xoder',
    isDev: true
  })

  assert.equal(production.userData, normalize('C:/Users/test/AppData/Roaming/xoder'))
  assert.equal(
    production.sessionData,
    normalize('C:/Users/test/AppData/Roaming/xoder-session')
  )
  assert.equal(development.userData, normalize('C:/Users/test/AppData/Roaming/xoder-dev'))
  assert.equal(
    development.sessionData,
    normalize('C:/Users/test/AppData/Roaming/xoder-dev-session')
  )
})

test('configureElectronStorage creates directories before overriding Electron paths', async () => {
  const appDataPath = await mkdtemp(join(tmpdir(), 'xoder-app-data-'))

  try {
    const pathCalls = []
    const appLike = {
      getPath(name) {
        assert.equal(name, 'appData')
        return appDataPath
      },
      setPath(name, value) {
        pathCalls.push([name, value])
      }
    }

    const paths = configureElectronStorage(appLike, {
      appName: 'xoder',
      isDev: true
    })

    await access(paths.userData)
    await access(paths.sessionData)
    assert.deepEqual(pathCalls, [
      ['userData', paths.userData],
      ['sessionData', paths.sessionData]
    ])
  } finally {
    await rm(appDataPath, { recursive: true, force: true })
  }
})
