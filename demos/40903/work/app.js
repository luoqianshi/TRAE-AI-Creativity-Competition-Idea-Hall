import { PoetryMap2D } from "./map2d.js?v=3";

const timelineList = document.getElementById("timelineList");
const nodeCount = document.getElementById("nodeCount");
const yearRange = document.getElementById("yearRange");

const detailTitle = document.getElementById("detailTitle");
const detailType = document.getElementById("detailType");
const detailYear = document.getElementById("detailYear");
const detailLocation = document.getElementById("detailLocation");
const detailBackground = document.getElementById("detailBackground");
const detailQuote = document.getElementById("detailQuote");
const detailFullText = document.getElementById("detailFullText");
const detailTags = document.getElementById("detailTags");
const poemListSection = document.getElementById("poemListSection");
const poemList = document.getElementById("poemList");

const nodes = [...window.POETRY_NODES].sort((a, b) => Number(a.year) - Number(b.year));
const allPoems = nodes.flatMap((node) => node.poems?.length ? node.poems : [node]);
const totalPoems = allPoems.length;
const years = allPoems.map((poem) => Number(poem.year)).filter((y) => !isNaN(y));

nodeCount.textContent = String(totalPoems);
yearRange.textContent = `${Math.min(...years)} - ${Math.max(...years)}`;

let activeNodeId = nodes[0]?.id;
let activePoemIndex = 0;
let map = null;

function getActiveNode() {
  return nodes.find((item) => item.id === activeNodeId) || nodes[0];
}

function createTag(text) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = text;
  return span;
}

function renderPoem(poem) {
  detailTitle.textContent = poem.title;
  detailType.textContent = poem.type;
  detailYear.textContent = poem.year;
}

function renderDetail() {
  const node = getActiveNode();
  const poems = node.poems && node.poems.length > 0 ? node.poems : [node];
  const poem = poems[Math.min(activePoemIndex, poems.length - 1)];

  renderPoem(poem);
  detailLocation.textContent = `${node.location} · ${node.scene}`;
  detailBackground.textContent = poem.background || node.background;
  detailQuote.textContent = poem.quote;
  detailFullText.textContent = poem.fullText;
  detailTags.innerHTML = "";
  [node.region, node.location, node.scene, `${poem.type}作`, `${poem.year}年`].forEach((tagText) => {
    detailTags.appendChild(createTag(tagText));
  });

  // 同一地点多首诗词时展示可切换列表
  if (poems.length > 1) {
    poemListSection.style.display = "block";
    document.getElementById("poemListCount").textContent = `（共 ${poems.length} 首）`;
    poemList.innerHTML = "";
    poems.forEach((p, idx) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = `poem-list-item${idx === activePoemIndex ? " active" : ""}`;
      item.innerHTML = `
        <span class="poem-list-year">${p.year}</span>
        <span class="poem-list-title">${p.title}</span>
        <span class="poem-list-type">${p.type}</span>
      `;
      item.addEventListener("click", () => {
        activePoemIndex = idx;
        renderDetail();
      });
      poemList.appendChild(item);
    });
  } else {
    poemListSection.style.display = "none";
    poemList.innerHTML = "";
  }
}

function renderTimeline() {
  timelineList.innerHTML = "";
  nodes.forEach((node) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `timeline-item${node.id === activeNodeId ? " active" : ""}`;
    const poemCount = node.poems?.length || 1;
    const countBadge = poemCount > 1 ? `<span class="poem-count">${poemCount}首</span>` : "";
    item.innerHTML = `
      <span class="year">${node.year}</span>
      <h3>${node.title}</h3>
      <p>${node.location} · ${node.scene}${countBadge}</p>
    `;
    item.addEventListener("click", () => {
      activeNodeId = node.id;
      activePoemIndex = 0;
      renderDetail();
      renderTimeline();
      if (map) map.focusNode(node);
    });
    timelineList.appendChild(item);
  });
}

function handleNodeClick(node) {
  activeNodeId = node.id;
  activePoemIndex = 0;
  renderDetail();
  renderTimeline();
  if (map) map.focusNode(node);
}

const mapCanvas = document.getElementById("mapCanvas");
const loadingTip = document.createElement("div");
loadingTip.className = "map-loading";
loadingTip.textContent = "正在铺展诗词山水长卷…";
mapCanvas.parentElement.appendChild(loadingTip);

map = new PoetryMap2D("mapCanvas", { onNodeClick: handleNodeClick });
map
  .loadData("./assets/china-provinces-v2-rewound.json", "./assets/china-mesh.json")
  .then(() => {
    map.setNodes(nodes);
    renderDetail();
    renderTimeline();
    if (map) map.focusNode(getActiveNode());
    loadingTip.remove();
  })
  .catch((err) => {
    console.error("地图初始化失败：", err);
    loadingTip.textContent = "地图加载失败，请检查网络与浏览器兼容性。";
  });
