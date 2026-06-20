// Extract PDF text with position info to reconstruct table structure
const fs = require('fs');
const pdfjsLib = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf');

async function extractPDF() {
  const buf = fs.readFileSync('d:\\api\\资金股票.pdf');
  const data = new Uint8Array(buf);
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent({ normalizeWhitespace: false });

  // Collect all items with positions
  const items = [];
  for (const item of content.items) {
    if (!item.str || item.str.trim() === '') continue;
    items.push({
      x: Math.round(item.transform[4] * 10) / 10,
      y: Math.round(item.transform[5] * 10) / 10,
      text: item.str,
      width: item.width
    });
  }

  // Group by Y (round to nearest 3px)
  const rows = {};
  for (const item of items) {
    const y = Math.round(item.y / 3) * 3;
    if (!rows[y]) rows[y] = [];
    rows[y].push(item);
  }

  // Sort by Y (top to bottom) and within each row by X (left to right)
  const sortedYs = Object.keys(rows).map(Number).sort((a, b) => b - a);
  for (const y of sortedYs) {
    rows[y].sort((a, b) => a.x - b.x);
  }

  // Print each row with x positions for debugging
  for (const y of sortedYs) {
    const parts = rows[y].map(r => `[x=${r.x}]${r.text}`).join(' ');
    console.log(`Y=${y}: ${parts}`);
  }
}

extractPDF().catch(err => console.error('ERROR:', err.message));
