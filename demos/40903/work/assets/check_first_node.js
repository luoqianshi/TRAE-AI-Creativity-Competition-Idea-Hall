const fs = require("fs");
global.window = {};
eval(fs.readFileSync("data.js", "utf-8"));

const first = window.POETRY_NODES[0];
console.log("First node:", first.id, first.title, first.location);
console.log("Poems count:", first.poems?.length);
console.log("Poems:", first.poems?.map((p) => p.title));
