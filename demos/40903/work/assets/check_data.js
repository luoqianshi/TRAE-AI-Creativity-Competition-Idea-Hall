const fs = require("fs");
global.window = {};
eval(fs.readFileSync("data.js", "utf-8"));

let emptyCount = 0;
window.POETRY_NODES.forEach((node) => {
  node.poems.forEach((poem) => {
    if (!poem.fullText || poem.fullText.trim() === "") {
      emptyCount++;
      console.log(`Empty: index=${poem.index}, title=${poem.title}, year=${poem.year}`);
    }
  });
});
console.log(`Total empty poems: ${emptyCount}`);
console.log(`Total nodes: ${window.POETRY_NODES.length}`);
