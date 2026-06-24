const fs = require("fs");
const d3 = require("d3");

const geo = JSON.parse(fs.readFileSync("assets/china-provinces-v2.json", "utf-8"));

function rewindFeature(feature) {
  const geom = feature.geometry;
  if (!geom) return feature;
  if (geom.type === "Polygon") {
    geom.coordinates = geom.coordinates.map((ring, i) => {
      // 外环 (i===0) 应为逆时针；内环 (i>0) 应为顺时针
      const area = d3.geoArea({ type: "Polygon", coordinates: [ring] });
      const isClockwise = area > Math.PI * 2; // 接近 4π 表示顺时针（D3 符号相反）
      if (i === 0) {
        return isClockwise ? ring.slice().reverse() : ring;
      } else {
        return isClockwise ? ring : ring.slice().reverse();
      }
    });
  } else if (geom.type === "MultiPolygon") {
    geom.coordinates = geom.coordinates.map((polygon) => {
      return polygon.map((ring, i) => {
        const area = d3.geoArea({ type: "Polygon", coordinates: [ring] });
        const isClockwise = area > Math.PI * 2;
        if (i === 0) {
          return isClockwise ? ring.slice().reverse() : ring;
        } else {
          return isClockwise ? ring : ring.slice().reverse();
        }
      });
    });
  }
  return feature;
}

geo.features = geo.features.map(rewindFeature);

fs.writeFileSync("assets/china-provinces-v2-rewound.json", JSON.stringify(geo));
console.log("Rewound GeoJSON saved.");

// Verify first feature
const f = geo.features[0];
console.log("First feature area after rewind:", d3.geoArea(f));
console.log("First feature centroid:", d3.geoCentroid(f));
