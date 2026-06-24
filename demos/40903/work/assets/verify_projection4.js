const d3 = require("d3");
const fs = require("fs");

const geo = JSON.parse(fs.readFileSync("assets/china-provinces.json", "utf-8"));
const W = 1200, H = 868;

// Test natural bounds without fitExtent
const proj1 = d3.geoMercator();
const path1 = d3.geoPath(proj1);
console.log("Default Mercator bounds:", path1.bounds(geo));

// Test with different scale
const proj2 = d3.geoMercator().scale(700);
const path2 = d3.geoPath(proj2);
console.log("Scale 700 bounds:", path2.bounds(geo));

// fitExtent version
const proj3 = d3.geoMercator().fitExtent([[50, 70], [W - 50, H - 70]], geo);
const path3 = d3.geoPath(proj3);
console.log("fitExtent bounds:", path3.bounds(geo));

// With more square box
const proj4 = d3.geoMercator().fitExtent([[100, 70], [W - 100, H - 70]], geo);
const path4 = d3.geoPath(proj4);
console.log("Square-ish fitExtent bounds:", path4.bounds(geo));
console.log("Scale after fitExtent:", proj4.scale());

// Check key positions with proj4
const samples = [
  ["哈尔滨", 45.8, 126.5],
  ["北京", 39.9, 116.4],
  ["上海", 31.23, 121.47],
  ["广州", 23.13, 113.26],
  ["乌鲁木齐", 43.8, 87.6],
  ["拉萨", 29.65, 91.1],
  ["昆明", 25.04, 102.68],
  ["海口", 20.0, 110.3],
  ["三亚", 18.25, 109.5]
];
samples.forEach(([name, lat, lng]) => {
  const p = proj4([lng, lat]);
  console.log(name, lat, lng, "->", p[0].toFixed(1), p[1].toFixed(1));
});
