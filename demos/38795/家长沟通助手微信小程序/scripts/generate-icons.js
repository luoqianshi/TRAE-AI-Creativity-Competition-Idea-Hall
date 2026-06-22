const fs = require('fs')
const path = require('path')

const iconsDir = path.join(__dirname, '../images')

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

const createPNG = (width, height, r, g, b, a) => {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8
  ihdrData[9] = 6
  ihdrData[10] = 0
  ihdrData[11] = 0
  ihdrData[12] = 0
  
  const ihdrChunk = createChunk('IHDR', ihdrData)
  
  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0)
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, a)
    }
  }
  
  const zlib = require('zlib')
  const compressedData = zlib.deflateSync(Buffer.from(rawData))
  const idatChunk = createChunk('IDAT', compressedData)
  const iendChunk = createChunk('IEND', Buffer.alloc(0))
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

const createChunk = (type, data) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  
  const typeBuffer = Buffer.from(type)
  const crcData = Buffer.concat([typeBuffer, data])
  const crc = crc32(crcData)
  
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc >>> 0, 0)
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer])
}

const crc32 = (buffer) => {
  let crc = 0xFFFFFFFF
  const table = []
  
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }
  
  for (let i = 0; i < buffer.length; i++) {
    crc = table[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8)
  }
  
  return crc ^ 0xFFFFFFFF
}

const icons = [
  { name: 'icon-new.png', color: [138, 138, 138, 255] },
  { name: 'icon-new-active.png', color: [30, 136, 229, 255] },
  { name: 'icon-template.png', color: [138, 138, 138, 255] },
  { name: 'icon-template-active.png', color: [30, 136, 229, 255] },
  { name: 'icon-history.png', color: [138, 138, 138, 255] },
  { name: 'icon-history-active.png', color: [30, 136, 229, 255] }
]

icons.forEach(icon => {
  const png = createPNG(81, 81, icon.color[0], icon.color[1], icon.color[2], icon.color[3])
  fs.writeFileSync(path.join(iconsDir, icon.name), png)
  console.log(`Created: ${icon.name}`)
})

console.log('All icons created successfully!')
