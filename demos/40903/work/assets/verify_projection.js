// 验证投影是否正常工作
const d3 = require("d3");
const fs = require("fs");

const geo = JSON.parse(fs.readFileSync("assets/china-provinces.json", "utf-8"));
const W = 1200, H = 868;
const projection = d3.geoMercator().fitExtent(
  [[50, 70], [W - 50, H - 70]],
  geo
);

// 测试几个关键点
const tests = [
  { name: "北京", lat: 39.904, lng: 116.407, expect: "center-north" },
  { name: "长沙", lat: 28.228, lng: 112.938, expect: "center-south" },
  { name: "延安", lat: 36.585, lng: 109.49, expect: "center-northwest" },
  { name: "井冈山", lat: 26.57, lng: 114.16, expect: "center-south" },
  { name: "瑞金", lat: 25.88, lng: 116.03, expect: "east-south" },
  { name: "上海", lat: 31.23, lng: 121.47, expect: "east" },
  { name: "六盘山(宁夏)", lat: 35.67, lng: 106.21, expect: "center-northwest" },
  { name: "乌鲁木齐(参考)", lat: 43.8, lng: 87.6, expect: "west-north" },
  { name: "哈尔滨(参考)", lat: 45.8, lng: 126.5, expect: "east-north" },
  { name: "海口(参考)", lat: 20.0, lng: 110.3, expect: "south" }
];

console.log("Canvas size:", W, "x", H);
console.log("---");
tests.forEach((t) => {
  const p = projection([t.lng, t.lat]);
  console.log(t.name.padEnd(16), "lat=" + t.lat, "lng=" + t.lng, "-> x=" + (p ? p[0].toFixed(1) : "NaN"), "y=" + (p ? p[1].toFixed(1) : "NaN"));
});
