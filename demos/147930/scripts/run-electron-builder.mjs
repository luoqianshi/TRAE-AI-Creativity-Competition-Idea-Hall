import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const staleMirrorEnvNames = [
  'IOJS_ORG_MIRROR',
  'NODEJS_ORG_MIRROR',
  'NODIST_IOJS_MIRROR',
  'NODIST_NODE_MIRROR',
  'NVM_IOJS_ORG_MIRROR',
  'NVM_NODEJS_ORG_MIRROR',
  'NVMW_IOJS_ORG_MIRROR',
  'NVMW_NODEJS_ORG_MIRROR',
  'NVMW_NPM_MIRROR'
]

const env = { ...process.env }

staleMirrorEnvNames.forEach((name) => {
  delete env[name]
})

Object.assign(env, {
  ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/',
  npm_config_electron_mirror: 'https://npmmirror.com/mirrors/electron/',
  NPM_CONFIG_ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/',
  ELECTRON_BUILDER_BINARIES_MIRROR: 'https://npmmirror.com/mirrors/electron-builder-binaries/',
  npm_config_electron_builder_binaries_mirror: 'https://npmmirror.com/mirrors/electron-builder-binaries/',
  NPM_CONFIG_ELECTRON_BUILDER_BINARIES_MIRROR: 'https://npmmirror.com/mirrors/electron-builder-binaries/'
})

const builderCli = join(process.cwd(), 'node_modules', 'electron-builder', 'cli.js')
const result = spawnSync(process.execPath, [builderCli, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env,
  shell: false,
  stdio: 'inherit'
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(result.status ?? 1)
