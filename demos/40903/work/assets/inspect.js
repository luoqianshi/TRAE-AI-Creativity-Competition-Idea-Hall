const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1000 });
  page.on("pageerror", (err) => console.log("[pageerror]", err.message));
  await page.goto("http://127.0.0.1:8765/index.html", { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 4000));

  // Inspect canvas color distribution: which pixels are non-background
  const stats = await page.evaluate(() => {
    const c = document.getElementById("mapCanvas");
    const ctx = c.getContext("2d");
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const data = img.data;
    // Count distinct color clusters
    const bgLike = { r: 221, g: 198, b: 149 }; // parchment
    const provinceLike = { r: 214, g: 188, b: 142 };
    let totalNonEmpty = 0, parchment = 0, province = 0, nodeLike = 0, labelLike = 0, ancient = 0;
    // Scan pixels
    for (let y = 0; y < c.height; y += 4) {
      for (let x = 0; x < c.width; x += 4) {
        const i = (y * c.width + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        if (r > 100 && g < 100 && b < 100) nodeLike++;
        if (r > 90 && g < 80 && b < 80) ancient++;
        if (Math.abs(r-221) < 8 && Math.abs(g-198) < 8 && Math.abs(b-149) < 8) parchment++;
        if (Math.abs(r-214) < 10 && Math.abs(g-188) < 10 && Math.abs(b-142) < 10) province++;
        totalNonEmpty++;
      }
    }
    // Find province color extent (non-parchment)
    let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
    for (let y = 0; y < c.height; y += 2) {
      for (let x = 0; x < c.width; x += 2) {
        const i = (y * c.width + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        // Pixels that are different from background parchment
        if (Math.abs(r-221) > 8 || Math.abs(g-198) > 8 || Math.abs(b-149) > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return {
      canvas: { w: c.width, h: c.height },
      sampled: totalNonEmpty,
      parchment, province, nodeLike, ancient,
      contentBox: { minX, maxX, minY, maxY, w: maxX-minX, h: maxY-minY }
    };
  });
  console.log(JSON.stringify(stats, null, 2));
  await browser.close();
})();
