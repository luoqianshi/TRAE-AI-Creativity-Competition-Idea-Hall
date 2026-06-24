const fs = require("fs");
const topojson = require("topojson-server");
const topoClient = require("topojson-client");
const d3 = require("d3");

const geo = JSON.parse(fs.readFileSync("assets/china-provinces-v2-rewound.json", "utf-8"));

// 过滤：仅省级（不含九段线）
const provinces = {
  type: "FeatureCollection",
  features: geo.features.filter((f) => String(f.properties.adcode) !== "100000_JD")
};

// 转成 Topology
const topology = topojson.topology({ provinces: provinces });

// 内部边界 mesh(a,b) => a !== b
const mesh = topoClient.mesh(topology, topology.objects.provinces, (a, b) => a !== b);

// 外边界 outline: a === b（注意 topojson.mesh 中 a===b 表示只出现一次的弧）
const outline = topoClient.mesh(topology, topology.objects.provinces, (a, b) => a === b);

// 九段线保留原 GeoJSON
const nineDash = geo.features.find((f) => String(f.properties.adcode) === "100000_JD");

const output = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { type: "mesh" }, geometry: mesh },
    { type: "Feature", properties: { type: "outline" }, geometry: outline },
    ...(nineDash ? [nineDash] : [])
  ]
};

fs.writeFileSync("assets/china-mesh.json", JSON.stringify(output));
console.log("Saved china-mesh.json");

// 验证
const W = 1200, H = 868;
const projection = d3.geoMercator().fitExtent([[50, 70], [W - 50, H - 70]], geo);
const path = d3.geoPath(projection);
console.log("Mesh path length sample:", output.features[0].geometry.coordinates.length);
console.log("Outline path length sample:", output.features[1].geometry.coordinates.length);
