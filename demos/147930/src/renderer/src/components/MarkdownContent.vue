<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const renderedMarkdown = computed(() => renderMarkdown(props.text))

function renderMarkdown(value) {
  const lines = String(value || '').replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  let list = null
  let quote = []
  let code = null

  const flushParagraph = () => {
    if (!paragraph.length) {
      return
    }
    blocks.push(`<p>${renderInline(paragraph.join(' '))}</p>`)
    paragraph = []
  }

  const flushList = () => {
    if (!list) {
      return
    }
    const tag = list.ordered ? 'ol' : 'ul'
    blocks.push(`<${tag}>${list.items.map((item) => renderListItem(item)).join('')}</${tag}>`)
    list = null
  }

  const flushQuote = () => {
    if (!quote.length) {
      return
    }
    blocks.push(`<blockquote>${quote.map((item) => `<p>${renderInline(item)}</p>`).join('')}</blockquote>`)
    quote = []
  }

  const flushOpenBlocks = () => {
    flushParagraph()
    flushList()
    flushQuote()
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const fenceMatch = line.match(/^```([a-z0-9_+-]*)\s*$/iu)

    if (fenceMatch) {
      if (code) {
        blocks.push(
          `<pre><code${code.language ? ` class="language-${escapeAttribute(code.language)}"` : ''}>${escapeHtml(code.lines.join('\n'))}</code></pre>`
        )
        code = null
        continue
      }

      flushOpenBlocks()
      code = {
        language: fenceMatch[1] || '',
        lines: []
      }
      continue
    }

    if (code) {
      code.lines.push(line)
      continue
    }

    const trimmed = line.trim()

    if (!trimmed) {
      flushOpenBlocks()
      continue
    }

    const nextLine = lines[index + 1]?.trim() || ''
    if (isTableRow(trimmed) && isTableSeparatorLine(nextLine)) {
      flushOpenBlocks()
      const headers = splitTableCells(trimmed)
      const alignments = parseTableAlignments(nextLine, headers.length)
      const rows = []
      index += 2

      while (index < lines.length) {
        const rowLine = lines[index].trim()

        if (!rowLine || !isTableRow(rowLine) || isTableSeparatorLine(rowLine)) {
          index -= 1
          break
        }

        rows.push(splitTableCells(rowLine))
        index += 1
      }

      if (index >= lines.length) {
        index = lines.length
      }

      blocks.push(renderTable(headers, alignments, rows))
      continue
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/u)
    if (heading) {
      flushOpenBlocks()
      const level = heading[1].length
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      continue
    }

    if (/^(-{3,}|\*{3,})$/u.test(trimmed)) {
      flushOpenBlocks()
      blocks.push('<hr>')
      continue
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/u)
    if (quoteMatch) {
      flushParagraph()
      flushList()
      quote.push(quoteMatch[1])
      continue
    }

    const orderedListItem = trimmed.match(/^\d+\.\s+(.+)$/u)
    if (orderedListItem) {
      flushParagraph()
      flushQuote()
      if (!list || !list.ordered) {
        flushList()
        list = { ordered: true, items: [] }
      }
      list.items.push(orderedListItem[1])
      continue
    }

    const unorderedListItem = trimmed.match(/^[-*+]\s+(.+)$/u)
    if (unorderedListItem) {
      flushParagraph()
      flushQuote()
      if (!list || list.ordered) {
        flushList()
        list = { ordered: false, items: [] }
      }
      list.items.push(unorderedListItem[1])
      continue
    }

    flushList()
    flushQuote()
    paragraph.push(trimmed)
  }

  if (code) {
    blocks.push(
      `<pre><code${code.language ? ` class="language-${escapeAttribute(code.language)}"` : ''}>${escapeHtml(code.lines.join('\n'))}</code></pre>`
    )
  }

  flushOpenBlocks()
  return blocks.join('')
}

function renderListItem(item) {
  const task = String(item || '').match(/^\[([ xX])\]\s+(.+)$/u)

  if (task) {
    const checked = task[1].toLowerCase() === 'x'
    return `<li class="task-list-item"><input type="checkbox" disabled${checked ? ' checked' : ''}>${renderInline(task[2])}</li>`
  }

  return `<li>${renderInline(item)}</li>`
}

function renderTable(headers, alignments, rows) {
  const columnCount = Math.max(headers.length, ...rows.map((row) => row.length), 1)
  const normalizedHeaders = normalizeTableCells(headers, columnCount)
  const normalizedRows = rows.map((row) => normalizeTableCells(row, columnCount))
  const head = normalizedHeaders
    .map((cell, index) => `<th${renderAlignAttribute(alignments[index])}>${renderInline(cell)}</th>`)
    .join('')
  const body = normalizedRows
    .map(
      (row) =>
        `<tr>${row
          .map((cell, index) => `<td${renderAlignAttribute(alignments[index])}>${renderInline(cell)}</td>`)
          .join('')}</tr>`
    )
    .join('')

  return `<div class="markdown-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
}

function normalizeTableCells(cells, columnCount) {
  const normalized = cells.slice(0, columnCount)

  while (normalized.length < columnCount) {
    normalized.push('')
  }

  return normalized
}

function renderAlignAttribute(alignment) {
  return alignment ? ` style="text-align:${alignment}"` : ''
}

function isTableRow(line) {
  if (!String(line || '').includes('|')) {
    return false
  }

  return splitTableCells(line).length >= 2
}

function isTableSeparatorLine(line) {
  if (!isTableRow(line)) {
    return false
  }

  return splitTableCells(line).every((cell) => /^:?-{3,}:?$/u.test(cell.replace(/\s+/gu, '')))
}

function parseTableAlignments(line, columnCount) {
  const cells = normalizeTableCells(splitTableCells(line), columnCount)

  return cells.map((cell) => {
    const normalized = cell.replace(/\s+/gu, '')
    const left = normalized.startsWith(':')
    const right = normalized.endsWith(':')

    if (left && right) {
      return 'center'
    }

    if (right) {
      return 'right'
    }

    return ''
  })
}

function splitTableCells(line) {
  const normalized = String(line || '')
    .trim()
    .replace(/^\|/u, '')
    .replace(/\|$/u, '')
  const cells = []
  let current = ''
  let escaped = false

  for (const character of normalized) {
    if (escaped) {
      current += character === '|' ? character : `\\${character}`
      escaped = false
      continue
    }

    if (character === '\\') {
      escaped = true
      continue
    }

    if (character === '|') {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += character
  }

  if (escaped) {
    current += '\\'
  }

  cells.push(current.trim())
  return cells
}

function renderInline(value) {
  const codeSpans = []
  const textWithCodeTokens = String(value || '').replace(/`([^`]+)`/gu, (_, code) => {
    const token = `\u0000CODE${codeSpans.length}\u0000`
    codeSpans.push(`<code>${escapeHtml(code)}</code>`)
    return token
  })
  let html = escapeHtml(textWithCodeTokens)

  html = html
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/gu, (_, label, href) => renderLink(label, href, true))
    .replace(/\*\*([^*]+)\*\*/gu, '<strong>$1</strong>')
    .replace(/__([^_]+)__/gu, '<strong>$1</strong>')
    .replace(/~~([^~]+)~~/gu, '<del>$1</del>')
    .replace(/\*([^*\s][^*]*?)\*/gu, '<em>$1</em>')
    .replace(/_([^_\s][^_]*?)_/gu, '<em>$1</em>')

  codeSpans.forEach((code, index) => {
    html = html.replace(`\u0000CODE${index}\u0000`, code)
  })

  return html
}

function renderLink(label, href, labelIsEscaped = false) {
  const safeHref = sanitizeHref(href)
  if (!safeHref) {
    return labelIsEscaped ? label : escapeHtml(label)
  }
  return `<a href="${escapeAttribute(safeHref)}" target="_blank" rel="noreferrer">${labelIsEscaped ? label : escapeHtml(label)}</a>`
}

function sanitizeHref(value) {
  const href = String(value || '').trim()
  if (/^(https?:|mailto:)/iu.test(href)) {
    return href
  }
  return ''
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/gu, '&#96;')
}
</script>

<template>
  <div
    class="markdown-content"
    :class="{ 'is-compact': compact }"
    v-html="renderedMarkdown"
  />
</template>
