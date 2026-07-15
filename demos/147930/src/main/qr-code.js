const ECC_CODEWORDS_PER_BLOCK_LOW = [
  -1,
  7,
  10,
  15,
  20,
  26,
  18,
  20,
  24,
  30,
  18,
  20,
  24,
  26,
  30,
  22,
  24,
  28,
  30,
  28,
  28,
  28,
  28,
  30,
  30,
  26,
  28,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30
]

const ECC_BLOCKS_LOW = [
  -1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  4,
  4,
  4,
  4,
  4,
  6,
  6,
  6,
  6,
  7,
  8,
  8,
  9,
  9,
  10,
  12,
  12,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  19,
  20,
  21,
  22,
  24,
  25
]

export function createQrSvg(text = '', options = {}) {
  const qr = createQrMatrix(text)
  const moduleSize = Math.max(1, Number(options.moduleSize || 5))
  const quietZone = Math.max(0, Number(options.quietZone ?? 4))
  const svgSize = (qr.size + quietZone * 2) * moduleSize
  const rects = []

  for (let y = 0; y < qr.size; y += 1) {
    for (let x = 0; x < qr.size; x += 1) {
      if (!qr.modules[y][x]) {
        continue
      }

      rects.push(
        `<rect x="${(x + quietZone) * moduleSize}" y="${(y + quietZone) * moduleSize}" width="${moduleSize}" height="${moduleSize}"/>`
      )
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}" role="img" aria-label="${escapeXml(
      options.ariaLabel || 'Xoder connection QR'
    )}" data-qr-standard="true" data-version="${qr.version}" data-error-correction="L" shape-rendering="crispEdges">`,
    '<rect width="100%" height="100%" fill="#ffffff"/>',
    `<g fill="#111111">${rects.join('')}</g>`,
    '</svg>'
  ].join('')
}

export function createQrMatrix(text = '') {
  const bytes = [...Buffer.from(String(text || 'xoder'), 'utf8')]
  const version = selectVersion(bytes.length)
  const size = version * 4 + 17
  const modules = createGrid(size, false)
  const isFunction = createGrid(size, false)

  drawFunctionPatterns(version, modules, isFunction, 0)
  const dataCodewords = createDataCodewords(bytes, version)
  const codewords = addErrorCorrectionAndInterleave(dataCodewords, version)
  drawCodewords(codewords, modules, isFunction)
  applyMask(0, modules, isFunction)
  drawFormatBits(modules, isFunction, 0)

  return {
    version,
    size,
    modules
  }
}

function selectVersion(byteLength) {
  for (let version = 1; version <= 40; version += 1) {
    const countBits = version < 10 ? 8 : 16

    if (byteLength >= 1 << countBits) {
      continue
    }

    const capacityBits = getNumDataCodewords(version) * 8
    const requiredBits = 4 + countBits + byteLength * 8

    if (requiredBits <= capacityBits) {
      return version
    }
  }

  throw new Error('Connection QR payload is too large.')
}

function createDataCodewords(bytes, version) {
  const bits = []
  const countBits = version < 10 ? 8 : 16
  const capacityBits = getNumDataCodewords(version) * 8

  appendBits(bits, 0x4, 4)
  appendBits(bits, bytes.length, countBits)

  for (const byte of bytes) {
    appendBits(bits, byte, 8)
  }

  appendBits(bits, 0, Math.min(4, capacityBits - bits.length))

  while (bits.length % 8 !== 0) {
    bits.push(0)
  }

  const data = []

  for (let index = 0; index < bits.length; index += 8) {
    data.push(Number.parseInt(bits.slice(index, index + 8).join(''), 2))
  }

  for (let pad = 0xec; data.length < getNumDataCodewords(version); pad ^= 0xfd) {
    data.push(pad)
  }

  return data
}

function appendBits(bits, value, length) {
  if (length < 0 || value >>> length !== 0) {
    throw new Error('QR bit value out of range.')
  }

  for (let index = length - 1; index >= 0; index -= 1) {
    bits.push((value >>> index) & 1)
  }
}

function addErrorCorrectionAndInterleave(data, version) {
  const numBlocks = ECC_BLOCKS_LOW[version]
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK_LOW[version]
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)
  const generator = reedSolomonGenerator(blockEccLen)
  const blocks = []
  let offset = 0

  for (let blockIndex = 0; blockIndex < numBlocks; blockIndex += 1) {
    const dataLen = shortBlockLen - blockEccLen + (blockIndex < numShortBlocks ? 0 : 1)
    const blockData = data.slice(offset, offset + dataLen)
    offset += dataLen

    const ecc = reedSolomonRemainder(blockData, generator)

    if (blockIndex < numShortBlocks) {
      blockData.push(0)
    }

    blocks.push(blockData.concat(ecc))
  }

  const result = []

  for (let index = 0; index < blocks[0].length; index += 1) {
    for (const block of blocks) {
      if (index === shortBlockLen - blockEccLen && block.length === shortBlockLen) {
        continue
      }

      if (index < block.length) {
        result.push(block[index])
      }
    }
  }

  return result
}

function drawFunctionPatterns(version, modules, isFunction, mask) {
  const size = modules.length
  drawFinderPattern(modules, isFunction, 3, 3)
  drawFinderPattern(modules, isFunction, size - 4, 3)
  drawFinderPattern(modules, isFunction, 3, size - 4)

  const alignPositions = getAlignmentPatternPositions(version)

  for (const y of alignPositions) {
    for (const x of alignPositions) {
      if (isFunction[y]?.[x]) {
        continue
      }

      drawAlignmentPattern(modules, isFunction, x, y)
    }
  }

  for (let index = 8; index < size - 8; index += 1) {
    setFunctionModule(modules, isFunction, index, 6, index % 2 === 0)
    setFunctionModule(modules, isFunction, 6, index, index % 2 === 0)
  }

  drawFormatBits(modules, isFunction, mask)
  setFunctionModule(modules, isFunction, 8, size - 8, true)

  if (version >= 7) {
    drawVersionBits(version, modules, isFunction)
  }
}

function drawFinderPattern(modules, isFunction, centerX, centerY) {
  for (let y = -4; y <= 4; y += 1) {
    for (let x = -4; x <= 4; x += 1) {
      const distance = Math.max(Math.abs(x), Math.abs(y))
      const targetX = centerX + x
      const targetY = centerY + y

      if (!isInside(modules.length, targetX, targetY)) {
        continue
      }

      setFunctionModule(modules, isFunction, targetX, targetY, distance !== 2 && distance !== 4)
    }
  }
}

function drawAlignmentPattern(modules, isFunction, centerX, centerY) {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1) {
      const distance = Math.max(Math.abs(x), Math.abs(y))
      setFunctionModule(modules, isFunction, centerX + x, centerY + y, distance === 0 || distance === 2)
    }
  }
}

function drawFormatBits(modules, isFunction, mask) {
  const data = (1 << 3) | mask
  let remainder = data

  for (let index = 0; index < 10; index += 1) {
    remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) * 0x537)
  }

  const bits = ((data << 10) | remainder) ^ 0x5412
  const size = modules.length

  for (let index = 0; index <= 5; index += 1) {
    setFunctionModule(modules, isFunction, 8, index, getBit(bits, index))
  }

  setFunctionModule(modules, isFunction, 8, 7, getBit(bits, 6))
  setFunctionModule(modules, isFunction, 8, 8, getBit(bits, 7))
  setFunctionModule(modules, isFunction, 7, 8, getBit(bits, 8))

  for (let index = 9; index < 15; index += 1) {
    setFunctionModule(modules, isFunction, 14 - index, 8, getBit(bits, index))
  }

  for (let index = 0; index < 8; index += 1) {
    setFunctionModule(modules, isFunction, size - 1 - index, 8, getBit(bits, index))
  }

  for (let index = 8; index < 15; index += 1) {
    setFunctionModule(modules, isFunction, 8, size - 15 + index, getBit(bits, index))
  }
}

function drawVersionBits(version, modules, isFunction) {
  let remainder = version

  for (let index = 0; index < 12; index += 1) {
    remainder = (remainder << 1) ^ (((remainder >>> 11) & 1) * 0x1f25)
  }

  const bits = (version << 12) | remainder
  const size = modules.length

  for (let index = 0; index < 18; index += 1) {
    const bit = getBit(bits, index)
    const a = size - 11 + (index % 3)
    const b = Math.floor(index / 3)

    setFunctionModule(modules, isFunction, a, b, bit)
    setFunctionModule(modules, isFunction, b, a, bit)
  }
}

function drawCodewords(codewords, modules, isFunction) {
  const size = modules.length
  let bitIndex = 0

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5
    }

    for (let vertical = 0; vertical < size; vertical += 1) {
      for (let column = 0; column < 2; column += 1) {
        const x = right - column
        const upward = ((right + 1) & 2) === 0
        const y = upward ? size - 1 - vertical : vertical

        if (isFunction[y][x]) {
          continue
        }

        if (bitIndex < codewords.length * 8) {
          modules[y][x] = getBit(codewords[Math.floor(bitIndex / 8)], 7 - (bitIndex % 8))
          bitIndex += 1
        }
      }
    }
  }
}

function applyMask(mask, modules, isFunction) {
  for (let y = 0; y < modules.length; y += 1) {
    for (let x = 0; x < modules.length; x += 1) {
      if (!isFunction[y][x] && getMaskBit(mask, x, y)) {
        modules[y][x] = !modules[y][x]
      }
    }
  }
}

function getMaskBit(mask, x, y) {
  if (mask === 0) {
    return (x + y) % 2 === 0
  }

  throw new Error(`Unsupported QR mask: ${mask}`)
}

function getAlignmentPatternPositions(version) {
  if (version === 1) {
    return []
  }

  const size = version * 4 + 17
  const count = Math.floor(version / 7) + 2
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2
  const result = [6]

  for (let position = size - 7; result.length < count; position -= step) {
    result.splice(1, 0, position)
  }

  return result
}

function getNumRawDataModules(version) {
  let result = (16 * version + 128) * version + 64

  if (version >= 2) {
    const count = getAlignmentPatternPositions(version).length
    result -= (25 * count - 10) * count - 55
  }

  if (version >= 7) {
    result -= 36
  }

  return result
}

function getNumDataCodewords(version) {
  return (
    Math.floor(getNumRawDataModules(version) / 8) -
    ECC_CODEWORDS_PER_BLOCK_LOW[version] * ECC_BLOCKS_LOW[version]
  )
}

function reedSolomonGenerator(degree) {
  const result = Array(degree).fill(0)
  result[degree - 1] = 1
  let root = 1

  for (let index = 0; index < degree; index += 1) {
    for (let j = 0; j < result.length; j += 1) {
      result[j] = gfMultiply(result[j], root)

      if (j + 1 < result.length) {
        result[j] ^= result[j + 1]
      }
    }

    root = gfMultiply(root, 0x02)
  }

  return result
}

function reedSolomonRemainder(data, generator) {
  const result = Array(generator.length).fill(0)

  for (const byte of data) {
    const factor = byte ^ result.shift()
    result.push(0)

    for (let index = 0; index < result.length; index += 1) {
      result[index] ^= gfMultiply(generator[index], factor)
    }
  }

  return result
}

function gfMultiply(left, right) {
  let result = 0

  for (let value = right; value !== 0; value >>>= 1) {
    if ((value & 1) !== 0) {
      result ^= left
    }

    left <<= 1

    if ((left & 0x100) !== 0) {
      left ^= 0x11d
    }
  }

  return result
}

function setFunctionModule(modules, isFunction, x, y, dark) {
  if (!isInside(modules.length, x, y)) {
    return
  }

  modules[y][x] = Boolean(dark)
  isFunction[y][x] = true
}

function isInside(size, x, y) {
  return x >= 0 && y >= 0 && x < size && y < size
}

function getBit(value, index) {
  return ((value >>> index) & 1) !== 0
}

function createGrid(size, value) {
  return Array.from({ length: size }, () => Array(size).fill(value))
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
