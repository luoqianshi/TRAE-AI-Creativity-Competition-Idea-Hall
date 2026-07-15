import { mkdirSync } from 'fs'
import { join } from 'path'

export function resolveElectronStoragePaths({
  appDataPath,
  appName = 'xoder',
  isDev = false
}) {
  const profileName = isDev ? `${appName}-dev` : appName

  return {
    profileName,
    userData: join(appDataPath, profileName),
    sessionData: join(appDataPath, `${profileName}-session`)
  }
}

export function configureElectronStorage(appLike, options = {}) {
  const appDataPath = options.appDataPath || appLike.getPath('appData')
  const paths = resolveElectronStoragePaths({
    appDataPath,
    appName: options.appName,
    isDev: options.isDev
  })

  mkdirSync(paths.userData, { recursive: true })
  mkdirSync(paths.sessionData, { recursive: true })

  appLike.setPath('userData', paths.userData)
  appLike.setPath('sessionData', paths.sessionData)

  return paths
}
