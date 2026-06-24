// 用 node-canvas 模拟浏览器渲染，输出 PNG 验证
// 由于环境可能没有 node-canvas, 这里用 SVG 输出更可靠
const d3 = require("d3");
const fs = require("fs");

const geo = JSON.parse(fs.readFileSync("assets/china-provinces.json", "utf-8"));
const data = fs.readFileSync("data.js", "utf-8");
eval(data.replace("window.POETRY_NODES = ", "var POETRY_NODES = ").replace(/window\./g, ""));

const W = 1200, H = 868;
const projection = d3.geoMercator().fitExtent([[50, 70], [W - 50, H - 70]], geo);
const path = d3.geoPath(projection);

// 给节点重新计算 x/y
POETRY_NODES.forEach((node) => {
  if (node.lat != null && node.lng != null) {
    const p = projection([node.lng, node.lat]);
    if (p) {
      node.x = p[0];
      node.y = p[1];
    }
  }
});

let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#ddc695"/>
<g fill="rgba(214,188,142,0.55)" stroke="rgba(95,65,32,0.7)" stroke-width="1.1">
${geo.features.map(f => `<path d="${path(f)}"/>`).join("\n")}
</g>
<g fill="rgba(192,57,43,0.7)" stroke="white" stroke-width="1">
${POETRY_NODES.map(n => `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="5"/><title>${n.title} (${n.location})</title>`).join("\n")}
</g>
<g font-family="Microsoft YaHei" font-size="11" fill="rgba(72,48,24,0.7)" text-anchor="middle">
${POETRY_NODES.map(n => `<text x="${n.x.toFixed(1)}" y="${(n.y-8).toFixed(1)}">${n.year}</text>`).join("\n")}
</g>
</svg>`;

fs.writeFileSync("assets/preview.svg", svg);
console.log("Saved assets/preview.svg");
console.log("Path bounds:", path.bounds(geo));
console.log("Node count:", POETRY_NODES.length);
console.log("Sample nodes:");
["changsha-1925", "jinggangshan-1928", "loushanguan-1935", "liupanshan-1935", "nanjing-1949", "beijing-1949"].forEach(id => {
  const n = POETRY_NODES.find(x => x.id === id);
  if (n) console.log("  " + id, "->", n.x.toFixed(1), n.y.toFixed(1), n.title);
});
