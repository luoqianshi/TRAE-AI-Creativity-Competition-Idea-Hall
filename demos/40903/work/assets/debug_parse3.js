const fs = require("fs");
const input = fs.readFileSync("全集.md", "utf-8");
const lines = input.split(/\r?\n/);

let catIndex = 0;
let current = null;
let inBody = false;
const catalog = [{ num: 1, title: "儿歌·应舞狮" }, { num: 2, title: "五古·吟天井" }];

for (let i = 300; i < 340; i++) {
  const line = lines[i].trim();
  const catItem = catalog[catIndex];
  if (!catItem) break;

  const titlePattern = new RegExp(`^${catItem.num}[^\\d\\w]*${catItem.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  const isTitle = titlePattern.test(line);

  if (isTitle) {
    console.log(`${i + 1}: TITLE "${line}" -> catIndex=${catIndex}`);
    current = { index: catItem.num, title: catItem.title, year: "", body: [], note: [], inNote: false };
    inBody = true;
    catIndex++;
    continue;
  }

  if (!current || !inBody) {
    console.log(`${i + 1}: SKIP "${line}"`);
    continue;
  }

  if (!current.year && /^\d{4}/.test(line) && line.length < 50) {
    const yearMatch = line.match(/(\d{4})/);
    if (yearMatch) {
      current.year = yearMatch[1];
      console.log(`${i + 1}: YEAR "${line}" -> ${current.year}`);
      continue;
    }
  }

  if (line === "注释：") {
    current.inNote = true;
    console.log(`${i + 1}: NOTE START`);
    continue;
  }

  if (current.inNote) {
    if (line) {
      current.note.push(line);
      console.log(`${i + 1}: NOTE "${line}"`);
    } else {
      console.log(`${i + 1}: NOTE EMPTY`);
    }
  } else {
    if (line) {
      current.body.push(line);
      console.log(`${i + 1}: BODY "${line}"`);
    } else {
      console.log(`${i + 1}: BODY EMPTY`);
    }
  }
}

console.log("Final current:", current);
