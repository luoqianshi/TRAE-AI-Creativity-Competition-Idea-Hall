const d3 = require("d3");
const fs = require("fs");

const geo = JSON.parse(fs.readFileSync("assets/china-provinces.json", "utf-8"));

// Find lat/lng extent of all features
let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;

function processCoords(coords) {
  if (typeof coords[0] === "number") {
    const [lng, lat] = coords;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    return;
  }
  coords.forEach(processCoords);
}

geo.features.forEach((f) => {
  processCoords(f.geometry.coordinates);
});

console.log("Lat range:", minLat.toFixed(2), "to", maxLat.toFixed(2), "delta=" + (maxLat - minLat).toFixed(2));
console.log("Lng range:", minLng.toFixed(2), "to", maxLng.toFixed(2), "delta=" + (maxLng - minLng).toFixed(2));

// Mercator y values
const yMin = Math.log(Math.tan(Math.PI / 4 + minLat * Math.PI / 360));
const yMax = Math.log(Math.tan(Math.PI / 4 + maxLat * Math.PI / 360));
console.log("Mercator y range:", yMin.toFixed(3), "to", yMax.toFixed(3), "delta=" + (yMax - yMin).toFixed(3));

// Compute scale
const W = 1200, H = 868;
const dataW = maxLng - minLng;
const dataH = yMax - yMin;
console.log("Data W (lng):", dataW.toFixed(2));
console.log("Data H (mercator y):", dataH.toFixed(3));

// fitExtent computes scale
const scaleW = (W - 100) / dataW;
const scaleH = (H - 140) / dataH;
console.log("Scale (constrained by W):", scaleW.toFixed(2));
console.log("Scale (constrained by H):", scaleH.toFixed(2));

// Test projection after fitExtent
const projection = d3.geoMercator().fitExtent([[50, 70], [W - 50, H - 70]], geo);
const path = d3.geoPath(projection);

const bounds = path.bounds(geo);
console.log("Projected bounds:", bounds);

// Project some extremes
const tests = [
  ["Heilongjiang N", 53.5, 122.5],
  ["Hainan S", 18.2, 109.5],
  ["Xinjiang W", 39.0, 73.0],
  ["Heilongjiang E", 47.0, 134.5]
];

tests.forEach(([name, lat, lng]) => {
  const p = projection([lng, lat]);
  console.log(name, "->", p[0].toFixed(1), p[1].toFixed(1));
});
