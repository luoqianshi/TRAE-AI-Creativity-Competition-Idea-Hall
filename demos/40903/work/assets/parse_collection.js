const fs = require("fs");

const input = fs.readFileSync("全集.md", "utf-8");
const lines = input.split(/\r?\n/);

// 地点坐标表
const LOCATION_COORDS = {
  "湖南长沙": { lat: 28.228, lng: 112.938 },
  "湖南韶山": { lat: 27.93, lng: 112.53 },
  "湖南浏阳": { lat: 28.146, lng: 113.726 },
  "湖南湘潭": { lat: 27.829, lng: 112.944 },
  "湖南宁乡": { lat: 28.253, lng: 112.55 },
  "湖南岳阳": { lat: 29.357, lng: 113.129 },
  "湖南衡阳": { lat: 26.896, lng: 112.572 },
  "湖南常德": { lat: 29.032, lng: 111.699 },
  "湖南益阳": { lat: 28.571, lng: 112.355 },
  "湖南株洲": { lat: 27.828, lng: 113.134 },
  "湖南九嶷山": { lat: 25.34, lng: 112.01 },
  "湖北武汉": { lat: 30.592, lng: 114.305 },
  "江西井冈山": { lat: 26.57, lng: 114.16 },
  "江西南昌": { lat: 28.68, lng: 115.89 },
  "江西瑞金": { lat: 26.10, lng: 116.04 },
  "江西瑞金大柏地": { lat: 26.10, lng: 116.04 },
  "江西广昌": { lat: 26.84, lng: 116.33 },
  "江西宁都": { lat: 26.47, lng: 116.01 },
  "江西吉安": { lat: 26.57, lng: 115.13 },
  "江西会昌": { lat: 25.6, lng: 115.78 },
  "江西余江": { lat: 28.21, lng: 116.82 },
  "江西庐山": { lat: 29.58, lng: 115.97 },
  "福建上杭": { lat: 25.05, lng: 116.42 },
  "福建龙岩": { lat: 25.1, lng: 117.03 },
  "福建长汀": { lat: 25.83, lng: 116.36 },
  "福建宁化": { lat: 26.26, lng: 116.65 },
  "福建厦门": { lat: 24.479, lng: 118.089 },
  "贵州遵义": { lat: 27.725, lng: 106.927 },
  "贵州遵义娄山关": { lat: 27.99, lng: 106.84 },
  "贵州山地": { lat: 27.0, lng: 106.0 },
  "四川成都": { lat: 30.67, lng: 104.07 },
  "四川岷山": { lat: 32.9, lng: 103.82 },
  "四川重庆": { lat: 29.56, lng: 106.55 },
  "宁夏六盘山": { lat: 35.33, lng: 106.25 },
  "陕西延安": { lat: 36.585, lng: 109.49 },
  "陕西清涧": { lat: 37.1, lng: 110.1 },
  "陕西黄陵": { lat: 35.58, lng: 109.26 },
  "陕北保安": { lat: 36.82, lng: 108.77 },
  "陕北吴起": { lat: 36.92, lng: 107.48 },
  "甘肃会宁": { lat: 35.69, lng: 105.05 },
  "江苏南京": { lat: 32.06, lng: 118.796 },
  "浙江杭州": { lat: 30.274, lng: 120.155 },
  "浙江德清": { lat: 30.54, lng: 119.96 },
  "浙江莫干山": { lat: 30.63, lng: 119.83 },
  "河北北戴河": { lat: 39.825, lng: 119.486 },
  "北京": { lat: 39.904, lng: 116.407 },
  "北平": { lat: 39.904, lng: 116.407 },
  "上海": { lat: 31.23, lng: 121.47 },
  "天津": { lat: 39.125, lng: 117.19 },
  "广东广州": { lat: 23.13, lng: 113.26 },
  "云南昆明": { lat: 25.04, lng: 102.71 },
  "河南许昌": { lat: 34.04, lng: 113.85 },
  "河南郑州": { lat: 34.75, lng: 113.62 },
  "山东济南": { lat: 36.65, lng: 117.0 },
  "安徽合肥": { lat: 31.82, lng: 117.23 },
  "河北石家庄": { lat: 38.04, lng: 114.51 },
  "河北西柏坡": { lat: 38.32, lng: 113.93 },
};

const LOCATION_KEYWORDS = {
  "长沙": "湖南长沙", "湘江": "湖南长沙", "橘子洲": "湖南长沙", "湖南一师": "湖南长沙",
  "韶山": "湖南韶山", "浏阳": "湖南浏阳", "文家市": "湖南浏阳",
  "湘潭": "湖南湘潭", "宁乡": "湖南宁乡", "保安寺": "湖南湘潭",
  "岳阳": "湖南岳阳", "衡阳": "湖南衡阳", "常德": "湖南常德",
  "益阳": "湖南益阳", "株洲": "湖南株洲", "九嶷山": "湖南九嶷山",
  "武汉": "湖北武汉", "武昌": "湖北武汉", "黄鹤楼": "湖北武汉", "汉口": "湖北武汉",
  "井冈山": "江西井冈山", "南昌": "江西南昌", "洪都": "江西南昌",
  "瑞金": "江西瑞金", "大柏地": "江西瑞金大柏地", "广昌": "江西广昌",
  "宁都": "江西宁都", "吉安": "江西吉安", "东固": "江西吉安", "会昌": "江西会昌",
  "余江": "江西余江", "庐山": "江西庐山", "仙人洞": "江西庐山",
  "上杭": "福建上杭", "龙岩": "福建龙岩", "长汀": "福建长汀", "汀州": "福建长汀",
  "宁化": "福建宁化", "厦门": "福建厦门",
  "遵义": "贵州遵义", "娄山关": "贵州遵义娄山关", "贵州": "贵州山地", "贵阳": "贵州山地",
  "成都": "四川成都", "岷山": "四川岷山", "重庆": "四川重庆",
  "六盘山": "宁夏六盘山",
  "延安": "陕西延安", "清涧": "陕西清涧", "黄陵": "陕西黄陵", "黄帝陵": "陕西黄陵",
  "保安": "陕北保安", "吴起": "陕北吴起", "会宁": "甘肃会宁",
  "南京": "江苏南京", "杭州": "浙江杭州", "钱塘": "浙江杭州", "德清": "浙江德清",
  "莫干山": "浙江莫干山", "北戴河": "河北北戴河",
  "北京": "北京", "北平": "北京", "上海": "上海", "天津": "天津", "大沽口": "天津",
  "广州": "广东广州", "昆明": "云南昆明", "许昌": "河南许昌", "郑州": "河南郑州",
  "济南": "山东济南", "合肥": "安徽合肥", "石家庄": "河北石家庄", "西柏坡": "河北西柏坡",
};

// 1. 从目录提取标题列表
function parseCatalog(text) {
  const catalog = [];
  const lines = text.split(/\r?\n/);
  let inCatalog = false;
  for (const line of lines) {
    // 目录开始标志
    if (line.trim() === "目 录") {
      inCatalog = true;
      continue;
    }
    if (!inCatalog) continue;
    // 目录结束：遇到空行后紧接着非数字行，或已到 132
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const title = match[2].trim();
      if (num >= 1 && num <= 200 && title.length > 2 && title.length < 40) {
        catalog.push({ num, title });
      }
    } else if (catalog.length > 0 && line.trim() !== "" && !/^\d+$/.test(line.trim())) {
      // 目录结束
      break;
    }
  }
  return catalog;
}

// 2. 按正文中的"序号、标题"行直接分割
function parseBody(text, catalog) {
  const poems = [];
  const lines = text.split(/\r?\n/);
  let current = null;
  let inBody = false;
  // 用目录建立序号->标题的映射，正文标题优先，缺失时回退目录
  const catalogMap = new Map(catalog.map((c) => [c.num, c.title]));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 匹配正文标题行："100、七绝·贾谊"
    const titleMatch = line.match(/^(\d+)、(.+)$/);
    if (titleMatch) {
      const num = parseInt(titleMatch[1], 10);
      const title = titleMatch[2].trim();
      // 只接受在目录范围内的序号，避免目录行被重复解析（目录行没有顿号）
      if (catalogMap.has(num)) {
        if (current) {
          finalizePoem(current);
          poems.push(current);
        }
        current = {
          index: num,
          title,
          year: "",
          body: [],
          note: [],
          inNote: false
        };
        inBody = true;
        continue;
      }
    }

    if (!current || !inBody) continue;

    // 年份行
    if (!current.year && /^\d{4}/.test(line) && line.length < 50) {
      const yearMatch = line.match(/(\d{4})/);
      if (yearMatch) current.year = yearMatch[1];
      continue;
    }

    if (line === "注释：") {
      current.inNote = true;
      continue;
    }

    if (current.inNote) {
      if (line) current.note.push(line);
    } else {
      if (line) current.body.push(line);
    }
  }

  if (current) {
    finalizePoem(current);
    poems.push(current);
  }

  return poems;
}

function finalizePoem(poem) {
  poem.fullText = poem.body.join("\n").trim();
  poem.noteText = poem.note.join("\n").trim();
  const firstLine = poem.body.find((l) => l.trim() && !l.includes("残句") && !l.includes("缺") && !l.includes("（")) || poem.body[0] || "";
  poem.quote = firstLine.trim();
}

function inferLocation(poem) {
  const searchText = poem.title + " " + poem.noteText;
  for (const [keyword, location] of Object.entries(LOCATION_KEYWORDS)) {
    if (poem.title.includes(keyword)) return location;
  }
  for (const [keyword, location] of Object.entries(LOCATION_KEYWORDS)) {
    if (searchText.includes(keyword)) return location;
  }

  const year = parseInt(poem.year, 10);
  if (year <= 1918) return "湖南长沙";
  if (year >= 1919 && year <= 1920) return "北京";
  if (year >= 1921 && year <= 1927) return "湖南长沙";
  if (year >= 1927 && year <= 1934) return "江西井冈山";
  if (year >= 1934 && year <= 1936) return "贵州山地";
  if (year >= 1936 && year <= 1948) return "陕西延安";
  if (year >= 1949) return "北京";
  return "北京";
}

function getRegion(location) {
  if (location.includes("湖南") || location.includes("湖北")) return "华中";
  if (location.includes("江西") || location.includes("福建") || location.includes("浙江") || location.includes("江苏")) return "华东";
  if (location.includes("贵州") || location.includes("四川") || location.includes("云南") || location.includes("重庆")) return "西南";
  if (location.includes("陕西") || location.includes("甘肃") || location.includes("宁夏")) return "西北";
  if (location.includes("北京") || location.includes("天津") || location.includes("河北") || location.includes("河南") || location.includes("山东")) return "华北";
  if (location.includes("广东") || location.includes("广西")) return "华南";
  if (location.includes("上海")) return "华东";
  return "全国";
}

function getType(title) {
  if (title.includes("儿歌") || title.includes("歌谣")) return "谣";
  if (title.includes("祭文")) return "文";
  if (title.includes("词") && !title.includes("诗词")) return "词";
  if (title.includes("七律")) return "诗";
  if (title.includes("七绝")) return "诗";
  if (title.includes("五律")) return "诗";
  if (title.includes("五古")) return "诗";
  if (title.includes("七古")) return "诗";
  if (title.includes("杂言诗")) return "诗";
  if (title.includes("四言诗") || title.includes("四言韵语")) return "诗";
  if (title.includes("五言诗") || title.includes("五言韵语")) return "诗";
  if (title.includes("新体诗")) return "诗";
  if (title.includes("七言诗")) return "诗";
  return "诗词";
}

const catalog = parseCatalog(input);
console.log(`Catalog parsed: ${catalog.length} items`);

const poems = parseBody(input, catalog);
console.log(`Body parsed: ${poems.length} poems`);

// 检查缺失
const foundIndexes = new Set(poems.map((p) => p.index));
const missing = catalog.filter((c) => !foundIndexes.has(c.num));
  if (missing.length) {
    console.log("Missing poems:", missing.map((c) => `${c.num}:${c.title}`).slice(0, 10));
  }

// 按地点分组
const locationGroups = new Map();
poems.forEach((poem) => {
  const location = inferLocation(poem);
  if (!locationGroups.has(location)) locationGroups.set(location, []);
  locationGroups.get(location).push(poem);
});

const nodes = [];
let nodeId = 0;
locationGroups.forEach((poemsAtLocation, location) => {
  const coords = LOCATION_COORDS[location] || LOCATION_COORDS["北京"];
  const poemsData = poemsAtLocation.map((poem) => ({
    index: poem.index,
    title: poem.title,
    type: getType(poem.title),
    year: poem.year || "不详",
    quote: poem.quote,
    background: poem.noteText.slice(0, 200) + (poem.noteText.length > 200 ? "……" : ""),
    fullText: poem.fullText
  }));

  nodes.push({
    id: `loc-${nodeId++}`,
    title: poemsData[0].title,
    type: poemsData[0].type,
    year: poemsData[0].year,
    location,
    region: getRegion(location),
    scene: location,
    lat: coords.lat,
    lng: coords.lng,
    quote: poemsData[0].quote,
    background: poemsData[0].background,
    fullText: poemsData[0].fullText,
    poems: poemsData
  });
});

nodes.sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

const output = `window.POETRY_NODES = ${JSON.stringify(nodes, null, 2)};\n`;
fs.writeFileSync("data.js", output, "utf-8");

console.log(`Generated ${nodes.length} location nodes`);
console.log("Locations:", Array.from(locationGroups.keys()).sort().join(", "));
