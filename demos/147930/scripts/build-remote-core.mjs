import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDir, '..')
const outputRoot = join(projectRoot, 'dist', 'remote-core')
const sourceRoot = join(outputRoot, 'src')

async function main() {
  const packageJson = JSON.parse(await readFile(join(projectRoot, 'package.json'), 'utf8'))

  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(sourceRoot, { recursive: true })

  await cp(join(projectRoot, 'src', 'remote-control'), join(sourceRoot, 'remote-control'), {
    recursive: true
  })
  await cp(join(projectRoot, 'src', 'main', 'agent-runtime'), join(sourceRoot, 'main', 'agent-runtime'), {
    recursive: true
  })
  await cp(join(projectRoot, 'src', 'main', 'digital-employee'), join(sourceRoot, 'main', 'digital-employee'), {
    recursive: true
  })
  await cp(join(projectRoot, 'node_modules', 'ws'), join(outputRoot, 'node_modules', 'ws'), {
    recursive: true
  })
  await cp(join(projectRoot, 'deploy', 'remote-core'), join(outputRoot, 'deploy'), {
    recursive: true
  })

  await writeFile(join(outputRoot, 'package.json'), `${JSON.stringify(createRuntimePackage(packageJson), null, 2)}\n`)
  await writeFile(join(outputRoot, 'README.md'), createReadme(packageJson.version))

  console.log(`remote-core package created at ${outputRoot}`)
}

function createRuntimePackage(packageJson) {
  return {
    name: 'xoder-remote-core',
    version: packageJson.version || '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      start: 'node src/remote-control/cloud-server.js',
      daemon: 'node src/remote-control/local-daemon.js'
    },
    dependencies: {
      ws: packageJson.dependencies?.ws || '^8.18.3'
    },
    engines: {
      node: '>=20'
    }
  }
}

function createReadme(version) {
  return `# Xoder Remote Core

Version: ${version || '1.0.0'}

This package is the deployable Remote Core runtime for Xoder.

## Install

\`\`\`bash
npm install --omit=dev
\`\`\`

## Cloud Service

\`\`\`bash
XODER_REMOTE_CONFIG=/etc/xoder/remote-core.config.json \\
npm start
\`\`\`

Runtime settings live outside this package. Copy
\`deploy/remote-core.config.example.json\` to
\`/etc/xoder/remote-core.config.json\`, then edit that JSON file whenever you
need to change token, task defaults, model, public URL, or event history limits.
No rebuild is required for those changes.

The cloud API also supports live config inspection and updates:

\`\`\`bash
curl -H "x-xoder-token: YOUR_TOKEN" https://api.example.com/api/config
curl -X PATCH -H "x-xoder-token: YOUR_TOKEN" -H "content-type: application/json" \\
  -d '{"taskDefaults":{"permissions":{"approvalMode":"auto"}}}' \\
  https://api.example.com/api/config
\`\`\`

For a public deployment, set \`cloud.host\` to \`0.0.0.0\`, put the service behind
Nginx, and set \`publicBaseUrl\` to the HTTPS URL used by clients. Built-in TLS
is also supported through \`cloud.tls.enabled\`, \`keyPath\`, and \`certPath\`; the
service fails fast with \`TLS_CONFIG_INVALID\` when certificate files are missing.
Runtime configuration remains outside this package, so token, TLS paths,
security switches, task defaults, and event history limits can change without
another build.

## Local Daemon

\`\`\`powershell
npm run daemon -- --config C:\\ProgramData\\Xoder\\remote-daemon.config.json
\`\`\`

Copy \`deploy/remote-daemon.config.example.json\` to the local computer and edit
cloud URL, token, device identity, and optional device token there. The daemon
does not need to bind a single workspace when \`workspaceMode\` is \`dynamic\`;
mobile or web clients browse the device disk, create a remote window with the
selected folder, then send tasks by \`windowId\`. Use \`default\` only for a fixed
workspace deployment.

## Deploy Templates

- \`deploy/env.example\`
- \`deploy/remote-core.config.example.json\`
- \`deploy/remote-daemon.config.example.json\`
- \`deploy/xoder-remote-core.service\`
- \`deploy/nginx-xoder-remote.conf\`

The cloud service only relays API/WebSocket traffic. The local daemon performs all project and agent execution.
`
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
