const d3 = require("d3");
const fs = require("fs");

const geo = JSON.parse(fs.readFileSync("assets/china-provinces-v2.json", "utf-8"));
const W = 1200, H = 868;
const projection = d3.geoMercator().fitExtent([[50, 70], [W - 50, H - 70]], geo);
const path = d3.geoPath(projection);

console.log("Features:", geo.features.length);
console.log("Bounds:", path.bounds(geo));

const samples = [
  ["北京", 39.904, 116.407],
  ["天津", 39.084, 117.201],
  ["上海", 31.23, 121.47],
  ["重庆", 29.563, 106.551],
  ["哈尔滨", 45.8, 126.5],
  ["乌鲁木齐", 43.825, 87.616],
  ["拉萨", 29.65, 91.1],
  ["昆明", 25.04, 102.68],
  ["广州", 23.13, 113.26],
  ["海口", 20.0, 110.3],
  ["三亚", 18.25, 109.5],
  ["长沙", 28.228, 112.938],
  ["井冈山", 26.57, 114.16],
  ["遵义/娄山关", 27.725, 106.927],
  ["延安", 36.6, 109.49],
  ["六盘山", 35.67, 106.21],
  ["南京", 32.06, 118.796],
  ["瑞金", 25.88, 116.02]
];
samples.forEach(([name, lat, lng]) => {
  const p = projection([lng, lat]);
  console.log(name.padEnd(16), lat.toFixed(2), lng.toFixed(2), "-> x=" + p[0].toFixed(1), "y=" + p[1].toFixed(1));
});

// Province centroids
console.log("\nProvince centroids:");
geo.features
  .filter((f) => String(f.properties.adcode) !== "100000_JD")
  .forEach((f) => {
    const c = path.centroid(f);
    console.log(f.properties.name.padEnd(12), "centroid:", c[0].toFixed(1), c[1].toFixed(1));
  });
