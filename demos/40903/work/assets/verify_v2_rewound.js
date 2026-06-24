const d3 = require("d3");
const fs = require("fs");

const geo = JSON.parse(fs.readFileSync("assets/china-provinces-v2-rewound.json", "utf-8"));
const W = 1200, H = 868;
const projection = d3.geoMercator().fitExtent([[50, 70], [W - 50, H - 70]], geo);
const path = d3.geoPath(projection);

console.log("Features:", geo.features.length);
console.log("Bounds:", path.bounds(geo));

// Load poetry nodes
const data = fs.readFileSync("data.js", "utf-8");
eval(data.replace("window.POETRY_NODES = ", "var POETRY_NODES = ").replace(/window\./g, ""));

const nodes = POETRY_NODES.filter((n) => n.lat != null && n.lng != null);
nodes.forEach((node) => {
  const p = projection([node.lng, node.lat]);
  node.x = p[0];
  node.y = p[1];
});

console.log("\nSample nodes:");
["changsha-1925", "jinggangshan-1928", "loushanguan-1935", "yanan-1945", "nanjing-1949", "beijing-1949", "minshan-1935", "ruijin-1931", "ningdu-1931"].forEach((id) => {
  const n = nodes.find((x) => x.id === id);
  if (n) console.log("  " + id.padEnd(20), n.title, "-> x=" + n.x.toFixed(1), "y=" + n.y.toFixed(1), "loc=" + n.location);
});

// Centroids
console.log("\nProvince centroids:");
geo.features
  .filter((f) => String(f.properties.adcode) !== "100000_JD")
  .forEach((f) => {
    const c = path.centroid(f);
    console.log(f.properties.name.padEnd(14), "centroid:", c[0].toFixed(1), c[1].toFixed(1));
  });

// Generate SVG preview
let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#cfe5f2"/>
<g fill="rgba(251,229,195,0.8)" stroke="rgba(95,65,32,0.5)" stroke-width="0.8">
${geo.features.map((f) => String(f.properties.adcode) === "100000_JD" ? "" : `<path d="${path(f)}"/>`).join("\n")}
</g>
<g fill="none" stroke="rgba(216,102,138,0.9)" stroke-width="2" stroke-dasharray="5,6">
${(() => { const jd = geo.features.find((f) => String(f.properties.adcode) === "100000_JD"); return jd ? `<path d="${path(jd)}"/>` : ""; })()}
</g>
<g fill="#c0392b" stroke="white" stroke-width="1">
${nodes.map((n) => `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="4"/>`).join("\n")}
</g>
<g font-family="Microsoft YaHei" font-size="10" fill="rgba(40,40,40,0.7)" text-anchor="middle">
${nodes.map((n) => `<text x="${n.x.toFixed(1)}" y="${(n.y - 7).toFixed(1)}">${n.year}</text>`).join("\n")}
</g>
</svg>`;

fs.writeFileSync("assets/preview-v2.svg", svg);
console.log("\nSaved assets/preview-v2.svg");
