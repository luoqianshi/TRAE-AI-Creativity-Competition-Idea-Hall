import iconTheme from './aicoding-file-icons/icons/aicoding-seti-icon-theme.json'

const iconDefinitions = iconTheme.iconDefinitions || {}
const lightTheme = iconTheme.light || {}
const fallbackIconName = lightTheme.file || iconTheme.file || '_default'
const fallbackIcon = resolveIconDefinition(fallbackIconName)

const EXTENSION_LANGUAGE_IDS = {
  bat: 'bat',
  c: 'c',
  cc: 'cpp',
  cmd: 'bat',
  cpp: 'cpp',
  cs: 'csharp',
  css: 'css',
  go: 'go',
  h: 'c',
  hpp: 'cpp',
  htm: 'html',
  html: 'html',
  java: 'java',
  js: 'javascript',
  json: 'json',
  jsonc: 'jsonc',
  jsx: 'javascriptreact',
  less: 'less',
  lua: 'lua',
  md: 'markdown',
  mjs: 'javascript',
  php: 'php',
  ps1: 'powershell',
  py: 'python',
  pyc: 'python',
  pyd: 'python',
  pyi: 'python',
  pyo: 'python',
  pyw: 'python',
  pyx: 'python',
  pxd: 'python',
  rb: 'ruby',
  rs: 'rust',
  sass: 'sass',
  scss: 'scss',
  sh: 'shellscript',
  sql: 'sql',
  ts: 'typescript',
  tsx: 'typescriptreact',
  vue: 'vue',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml'
}

export function getFileIconDescriptor(node) {
  if (!node || node.kind === 'directory') {
    return null
  }

  const fileName = String(node.name || '').toLowerCase()
  const iconName =
    getIconName('fileNames', fileName) ||
    getIconName('fileExtensions', fileName) ||
    getExtensionIconName(fileName) ||
    getLanguageIconName(fileName)

  return resolveIconDefinition(iconName) || fallbackIcon
}

export function getFileIconDescriptorForName(name) {
  const fileName = getBaseFileName(name)

  return getFileIconDescriptor({
    name: fileName,
    kind: 'file'
  })
}

function getBaseFileName(value) {
  const text = String(value || '').trim()
  const parts = text.split(/[\\/]/).filter(Boolean)

  return parts.at(-1) || text
}

function getExtensionIconName(fileName) {
  const candidates = getExtensionCandidates(fileName)

  for (const candidate of candidates) {
    const iconName = getIconName('fileExtensions', candidate)

    if (iconName) {
      return iconName
    }
  }

  return ''
}

function getLanguageIconName(fileName) {
  const extension = getLastExtension(fileName)
  const languageId = EXTENSION_LANGUAGE_IDS[extension]

  return languageId ? getIconName('languageIds', languageId) : ''
}

function getExtensionCandidates(fileName) {
  const parts = fileName.split('.').filter(Boolean)

  if (parts.length === 0) {
    return []
  }

  const candidates = []

  for (let index = 0; index < parts.length; index += 1) {
    candidates.push(parts.slice(index).join('.'))
  }

  return candidates
}

function getLastExtension(fileName) {
  const parts = fileName.split('.').filter(Boolean)

  return parts.length > 1 ? parts.at(-1) : ''
}

function getIconName(mapName, key) {
  return lightTheme[mapName]?.[key] || iconTheme[mapName]?.[key] || ''
}

function resolveIconDefinition(iconName) {
  const definition =
    iconDefinitions[iconName] ||
    iconDefinitions[String(iconName || '').replace(/_light$/, '')] ||
    iconDefinitions._default

  if (!definition?.fontCharacter) {
    return null
  }

  return {
    character: decodeFontCharacter(definition.fontCharacter),
    color: definition.fontColor || '#8d929b'
  }
}

function decodeFontCharacter(value) {
  const match = String(value).match(/^\\([a-fA-F0-9]{4,6})$/)

  if (!match) {
    return value
  }

  return String.fromCodePoint(Number.parseInt(match[1], 16))
}
