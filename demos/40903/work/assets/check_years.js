const fs = require("fs");
global.window = {};
eval(fs.readFileSync("data.js", "utf-8"));

const allPoems = [];
window.POETRY_NODES.forEach((node) => {
  (node.poems || [node]).forEach((p) => {
    allPoems.push({ title: p.title, year: p.year, node: node.location });
  });
});

const years = allPoems.map((p) => Number(p.year)).filter((y) => !isNaN(y));
console.log("Total poems:", allPoems.length);
console.log("Min year:", Math.min(...years));
console.log("Max year:", Math.max(...years));
console.log("Nodes count:", window.POETRY_NODES.length);

const maxYearPoems = allPoems.filter((p) => Number(p.year) === Math.max(...years));
console.log("Max year poems:", maxYearPoems.map((p) => `${p.year} ${p.title}`));

const minYearPoems = allPoems.filter((p) => Number(p.year) === Math.min(...years));
console.log("Min year poems:", minYearPoems.map((p) => `${p.year} ${p.title}`));
