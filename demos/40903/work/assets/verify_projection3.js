const d3 = require("d3");
const fs = require("fs");

const geo = JSON.parse(fs.readFileSync("assets/china-provinces.json", "utf-8"));
const W = 1200, H = 868;
const projection = d3.geoMercator().fitExtent([[50, 70], [W - 50, H - 70]], geo);
const path = d3.geoPath(projection);

const tests = [
  ["China minLat 3.4", 3.4, 110],
  ["China maxLat 53.5", 53.5, 122.5],
  ["China minLng 73.5", 39, 73.5],
  ["China maxLng 135.1", 47, 135.1],
  ["Beijing", 39.904, 116.407],
  ["Sanya (Hainan)", 18.25, 109.5],
  ["Mohe (north tip)", 53.5, 122.5]
];

console.log("Canvas:", W, "x", H);
console.log("Path bounds:", path.bounds(geo));
console.log("---");
tests.forEach(([name, lat, lng]) => {
  const p = projection([lng, lat]);
  console.log(name.padEnd(22), "lat=" + lat, "lng=" + lng, "-> x=" + p[0].toFixed(1), "y=" + p[1].toFixed(1));
});

// Calculate pixel ranges
const w = Math.max(...tests.map(t => projection([t[2], t[1]])[0]));
const e = Math.min(...tests.map(t => projection([t[2], t[1]])[0]));
const n = Math.max(...tests.map(t => projection([t[2], t[1]])[1]));
const s = Math.min(...tests.map(t => projection([t[2], t[1]])[1]));
console.log("---");
console.log("Among test points, x range:", e.toFixed(1), "to", w.toFixed(1), "delta=" + (w-e).toFixed(1));
console.log("Among test points, y range:", n.toFixed(1), "to", s.toFixed(1), "delta=" + (n-s).toFixed(1));
