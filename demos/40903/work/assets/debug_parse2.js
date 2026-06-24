const fs = require("fs");
const input = fs.readFileSync("全集.md", "utf-8");
const lines = input.split(/\r?\n/);

function parseCatalog(text) {
  const catalog = [];
  const lines = text.split(/\r?\n/);
  let inCatalog = false;
  for (const line of lines) {
    if (line.trim() === "目 录") {
      inCatalog = true;
      continue;
    }
    if (!inCatalog) continue;
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const title = match[2].trim();
      if (num >= 1 && num <= 200 && title.length > 2 && title.length < 40) {
        catalog.push({ num, title });
      }
    } else if (catalog.length > 0 && line.trim() !== "" && !/^\d+$/.test(line.trim())) {
      break;
    }
  }
  return catalog;
}

const catalog = parseCatalog(input);
console.log("Catalog first 5:", catalog.slice(0, 5));
console.log("Catalog last 5:", catalog.slice(-5));

let catIndex = 0;
let current = null;
let inBody = false;
let matched = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const catItem = catalog[catIndex];
  if (!catItem) break;

  const titlePattern = new RegExp(`^${catItem.num}[^\\d\\w]*${catItem.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (titlePattern.test(line)) {
    if (current) {
      console.log(`Pushing ${current.index}: body lines=${current.body.length}, note lines=${current.note.length}`);
      if (matched >= 3) process.exit(0);
    }
    current = {
      index: catItem.num,
      title: catItem.title,
      year: "",
      body: [],
      note: [],
      inNote: false
    };
    inBody = true;
    catIndex++;
    matched++;
    continue;
  }

  if (!current || !inBody) continue;

  if (!current.year && /^\d{4}/.test(line) && line.length < 50) {
    const yearMatch = line.match(/(\d{4})/);
    if (yearMatch) current.year = yearMatch[1];
    continue;
  }

  if (line === "注释：") {
    current.inNote = true;
    continue;
  }

  if (current.inNote) {
    if (line) current.note.push(line);
  } else {
    if (line) current.body.push(line);
  }
}
