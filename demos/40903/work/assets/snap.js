const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8771;
const ROOT = path.resolve(__dirname, "..");

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url).split("?")[0];
      let filePath = path.join(ROOT, urlPath);
      if (filePath.endsWith("/")) filePath = path.join(filePath, "index.html");
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME[ext] || "application/octet-stream";
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found: " + req.url);
          return;
        }
        res.writeHead(200, {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache"
        });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

(async () => {
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--use-gl=swiftshader",
      "--enable-webgl",
      "--disable-web-security"
    ]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1000 });
  page.on("console", (msg) => console.log("[console]", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("[pageerror]", err.message));
  page.on("requestfailed", (req) => console.log("[requestfailed]", req.url(), req.failure() && req.failure().errorText));
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 8000));
  try {
    await page.screenshot({ path: "assets/page.png", fullPage: true });
    const canvas = await page.$("#mapCanvas");
    if (canvas) {
      await canvas.screenshot({ path: "assets/canvas.png" });
    }
  } catch (e) {
    console.error("Screenshot failed:", e.message);
  }

  try {
    const info = await page.evaluate(() => {
      const first = window.POETRY_NODES[0];
      const section = document.getElementById("poemListSection");
      const list = document.getElementById("poemList");
      return {
        hasD3: typeof d3 !== "undefined",
        hasGeoJson: true,
        firstNode: { id: first.id, title: first.title, poemsCount: first.poems?.length },
        poemListDisplay: section ? getComputedStyle(section).display : "no-section",
        poemListChildCount: list ? list.children.length : -1
      };
    });
    console.log("PAGE INFO:", JSON.stringify(info, null, 2));
  } catch (e) {
    console.error("Evaluate failed:", e.message);
  }

  try { await browser.close(); } catch {}
  try { server.close(); } catch {}
})();
