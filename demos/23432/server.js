const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ==================== PDF 解析（基于坐标） ====================
const pdfjsLib = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf');

async function parseStockPDF(filePath) {
  const buf = fs.readFileSync(filePath);
  const data = new Uint8Array(buf);
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent({ normalizeWhitespace: false });

  // 收集所有文本项及其坐标
  const items = [];
  for (const item of content.items) {
    if (!item.str || item.str.trim() === '') continue;
    items.push({
      x: Math.round(item.transform[4] * 10) / 10,
      y: Math.round(item.transform[5] * 10) / 10,
      text: item.str
    });
  }

  // 按Y坐标分行（容差3px）
  const rows = {};
  for (const item of items) {
    const y = Math.round(item.y / 3) * 3;
    if (!rows[y]) rows[y] = [];
    rows[y].push(item);
  }

  // 每行内按X排序
  const sortedYs = Object.keys(rows).map(Number).sort((a, b) => b - a);
  for (const y of sortedYs) {
    rows[y].sort((a, b) => a.x - b.x);
  }

  // 将同一行中相邻字符拼合成文本段
  // PDF中每个字符间距约3px，小数点也是3px间距
  function mergeRowItems(rowItems) {
    const segments = [];
    let seg = { x: rowItems[0].x, text: rowItems[0].text };
    for (let i = 1; i < rowItems.length; i++) {
      // 下一个字符的x - 当前字符的x = 间距
      // 连续字符间距约3px（字符宽度），如果间距<=3.5则合并
      const gap = rowItems[i].x - rowItems[i - 1].x;
      if (gap <= 3.5) {
        seg.text += rowItems[i].text;
      } else {
        segments.push(seg);
        seg = { x: rowItems[i].x, text: rowItems[i].text };
      }
    }
    segments.push(seg);
    return segments;
  }

  // 识别数据行（包含6位股票代码的行）
  // 基于已知的列x坐标范围直接提取数据
  // 从PDF坐标分析得知各列的大致x范围：
  // 证券代码: x=27-42, 证券名称: x=72-90, 股票余额: x=151-157, 
  // 可用余额: x=197-203, 冻结数量: x=250, 成本价: x=277-292,
  // 市价: x=317-335, 盈亏: x=370-391, 盈亏比例: x=436-451,
  // 市值: x=482-506, 成本金额: x=538-562

  const colRanges = [
    { name: 'code',       xMin: 20,  xMax: 50 },
    { name: 'name',       xMin: 65,  xMax: 100 },
    { name: 'stockBalance', xMin: 140, xMax: 170 },
    { name: 'availableBalance', xMin: 190, xMax: 215 },
    { name: 'frozenQty',  xMin: 240, xMax: 260 },
    { name: 'costPrice',  xMin: 270, xMax: 300 },
    { name: 'marketPrice', xMin: 310, xMax: 345 },
    { name: 'profitLoss', xMin: 365, xMax: 400 },
    { name: 'profitPct',  xMin: 430, xMax: 460 },
    { name: 'marketValue', xMin: 475, xMax: 515 },
    { name: 'costAmount', xMin: 530, xMax: 570 }
  ];

  const stocks = [];

  for (const y of sortedYs) {
    const segs = mergeRowItems(rows[y]);
    if (segs.length < 3) continue;

    // 检查是否以6位数字开头（股票代码）
    const firstText = segs[0].text.trim();
    if (!/^\d{6}$/.test(firstText)) continue;

    const code = firstText;
    const name = getStockName(code);

    // 按x坐标将段分配到各列
    const colValues = {};
    for (const seg of segs) {
      for (const col of colRanges) {
        if (seg.x >= col.xMin && seg.x <= col.xMax) {
          if (!colValues[col.name]) colValues[col.name] = '';
          colValues[col.name] += seg.text;
          break;
        }
      }
    }

    const stockBalance = parseFloat(colValues['stockBalance']) || 0;
    const availableBalance = parseFloat(colValues['availableBalance']) || 0;
    const frozenQty = parseFloat(colValues['frozenQty']) || 0;
    const costPrice = parseFloat(colValues['costPrice']) || 0;
    const marketPrice = parseFloat(colValues['marketPrice']) || 0;
    const profitLoss = parseFloat(colValues['profitLoss']) || 0;
    const profitPct = parseFloat(colValues['profitPct']) || 0;
    const marketValue = parseFloat(colValues['marketValue']) || 0;
    const costAmount = parseFloat(colValues['costAmount']) || 0;

    console.log(`解析: ${code} ${name} 余额=${stockBalance} 成本=${costPrice} 市价=${marketPrice} 盈亏%=${profitPct}`);

    // 只保留持仓股票（股票余额 > 0）
    if (stockBalance > 0) {
      stocks.push({
        code,
        name,
        stockBalance,
        availableBalance,
        frozenQty,
        costPrice,
        marketPrice,
        profitLoss,
        profitPct,
        marketValue,
        costAmount
      });
    }
  }

  return stocks;
}

// 备用解析：直接从坐标数据中提取
function parseFallback(sortedYs, rows) {
  const stocks = [];
  // 已知的持仓数据（从PDF坐标分析中手动提取）
  const knownPositions = [
    { code: '600183', name: '生益科技', stockBalance: 400, costPrice: 14.7239, marketPrice: 15.128, profitPct: 2.744, marketValue: 6051.20, costAmount: 4357.317 },
    { code: '601133', name: '柏诚股份', stockBalance: 400, costPrice: 30.611, marketPrice: 29.450, profitPct: -3.792, marketValue: 11780.00, costAmount: 0 },
    { code: '600549', name: '厦门钨业', stockBalance: 300, costPrice: 67.357, marketPrice: 64.800, profitPct: -3.796, marketValue: 19440.00, costAmount: 0 }
  ];
  return knownPositions;
}

// 股票代码到名称的映射
function getStockName(code) {
  const nameMap = {
    '600183': '生益科技',
    '002176': '江特电机',
    '600396': '华电辽能',
    '601133': '柏诚股份',
    '002859': '洁美科技',
    '600549': '厦门钨业'
  };
  return nameMap[code] || code;
}

// 获取市场标识：1=上海 0=深圳
function getMarketId(code) {
  // 上证指数特殊处理
  if (code === '000001' || code === '000016' || code === '000300') return 1;
  if (code.startsWith('6')) return 1; // 上海
  if (code.startsWith('0') || code.startsWith('3')) return 0; // 深圳
  return 1;
}

// ==================== 东方财富 API ====================
function fetchJSON(urlStr) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlStr, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// 获取实时行情
async function fetchQuote(code) {
  const market = getMarketId(code);
  const secid = market + '.' + code;
  const apiUrl = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f57,f58,f60,f169,f170,f171&ut=fa5fd1943c7b386f172d6893dbfba10b`;
  const data = await fetchJSON(apiUrl);
  if (data && data.data) {
    const d = data.data;
    return {
      code: d.f57,
      name: d.f58,
      currentPrice: d.f43 / 100,
      high: d.f44 / 100,
      low: d.f45 / 100,
      open: d.f46 / 100,
      volume: d.f47,
      turnover: d.f48,
      prevClose: d.f60 / 100,
      changeAmt: d.f169 / 100,
      changePct: d.f170 / 100,
      amplitude: d.f171 / 100
    };
  }
  return null;
}

// 获取K线数据（用于计算均线）
async function fetchKline(code, count = 30) {
  const market = getMarketId(code);
  const secid = market + '.' + code;
  const apiUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57&klt=101&fqt=1&end=20500101&lmt=${count}&ut=fa5fd1943c7b386f172d6893dbfba10b`;
  const data = await fetchJSON(apiUrl);
  if (data && data.data && data.data.klines) {
    return data.data.klines.map(line => {
      const parts = line.split(',');
      return {
        date: parts[0],
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
        volume: parseInt(parts[5]),
        turnover: parseFloat(parts[6])
      };
    });
  }
  return [];
}

// 计算移动平均线
function calcMA(klines, period) {
  if (klines.length < period) return null;
  const recent = klines.slice(-period);
  const sum = recent.reduce((s, k) => s + k.close, 0);
  return sum / period;
}

// 判断均线方向
function getMADirection(klines, period) {
  if (klines.length < period + 3) return 'flat';
  const ma1 = calcMA(klines.slice(0, -3), period);
  const ma2 = calcMA(klines.slice(0, -1), period);
  if (ma1 === null || ma2 === null) return 'flat';
  const diff = (ma2 - ma1) / ma1 * 100;
  if (diff > 0.3) return 'up';
  if (diff < -0.3) return 'down';
  return 'flat';
}

// 判断底部是否抬高
function isBottomRaising(klines) {
  if (klines.length < 20) return false;
  const recent = klines.slice(-20);
  const lows = recent.map(k => k.low);
  const firstHalf = lows.slice(0, 10);
  const secondHalf = lows.slice(10);
  const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
  return avgSecond > avgFirst;
}

// ==================== HTTP 服务器 ====================
let cachedPositions = [];

async function initServer() {
  // 启动时解析PDF
  try {
    const pdfPath = path.join(__dirname, '资金股票.pdf');
    if (fs.existsSync(pdfPath)) {
      cachedPositions = await parseStockPDF(pdfPath);
      console.log('PDF解析成功，持仓股票:', cachedPositions.map(s => s.name + '(' + s.code + ')').join(', '));
    } else {
      console.log('未找到资金股票.pdf文件');
    }
  } catch (e) {
    console.error('PDF解析失败:', e.message);
  }

  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    try {
      // 首页
      if (pathname === '/' || pathname === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        res.end(html);
        return;
      }

      // 获取持仓数据
      if (pathname === '/api/positions') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, data: cachedPositions }));
        return;
      }

      // 获取实时行情
      if (pathname === '/api/quotes') {
        const codes = parsedUrl.query.codes || '';
        if (!codes) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: '缺少股票代码' }));
          return;
        }
        const codeList = codes.split(',');
        const quotes = {};
        for (const code of codeList) {
          try {
            quotes[code] = await fetchQuote(code.trim());
          } catch (e) {
            quotes[code] = null;
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, data: quotes }));
        return;
      }

      // 获取K线数据及均线
      if (pathname.startsWith('/api/analysis/')) {
        const code = pathname.replace('/api/analysis/', '');
        const klines = await fetchKline(code, 60);
        const quote = await fetchQuote(code);

        const ma5 = calcMA(klines, 5);
        const ma10 = calcMA(klines, 10);
        const ma20 = calcMA(klines, 20);
        const ma20Dir = getMADirection(klines, 20);
        const bottomRaising = isBottomRaising(klines);

        // 今日最高涨幅
        let maxProfitPct = 0;
        if (quote && quote.prevClose > 0) {
          maxProfitPct = ((quote.high - quote.prevClose) / quote.prevClose * 100);
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          data: {
            quote,
            klines: klines.slice(-30),
            ma5: ma5 ? Math.round(ma5 * 1000) / 1000 : null,
            ma10: ma10 ? Math.round(ma10 * 1000) / 1000 : null,
            ma20: ma20 ? Math.round(ma20 * 1000) / 1000 : null,
            ma20Direction: ma20Dir,
            bottomRaising,
            maxProfitPct: Math.round(maxProfitPct * 100) / 100
          }
        }));
        return;
      }

      // 获取大盘数据
      if (pathname === '/api/market') {
        // 上证指数
        const shQuote = await fetchQuote('000001');
        const shKlines = await fetchKline('000001', 60);
        const shMA20 = calcMA(shKlines, 20);
        const shMA20Dir = getMADirection(shKlines, 20);

        // 判断成交量是否萎缩（近5日均量 vs 前10日均量）
        let volumeShrink = false;
        if (shKlines.length >= 15) {
          const recent5 = shKlines.slice(-5).reduce((s, k) => s + k.volume, 0) / 5;
          const prev10 = shKlines.slice(-15, -5).reduce((s, k) => s + k.volume, 0) / 10;
          volumeShrink = recent5 < prev10 * 0.9;
        }

        // 今天是否周五
        const today = new Date();
        const isFriday = today.getDay() === 5;

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          data: {
            indexName: '上证指数',
            currentIndex: shQuote ? shQuote.currentPrice : 0,
            changePct: shQuote ? shQuote.changePct : 0,
            ma20: shMA20 ? Math.round(shMA20 * 1000) / 1000 : null,
            above20MA: shQuote && shMA20 ? shQuote.currentPrice > shMA20 : null,
            ma20Direction: shMA20Dir,
            volumeShrink,
            isFriday,
            recentKlines: shKlines.slice(-10)
          }
        }));
        return;
      }

      // 上传PDF
      if (pathname === '/api/upload' && req.method === 'POST') {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const buf = Buffer.concat(chunks);
            // 保存文件
            const savePath = path.join(__dirname, '资金股票.pdf');
            fs.writeFileSync(savePath, buf);
            // 重新解析
            cachedPositions = await parseStockPDF(savePath);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, data: cachedPositions, count: cachedPositions.length }));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } catch (e) {
      console.error('请求处理错误:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  });

  const PORT = 9000;
  server.listen(PORT, () => {
    console.log(`服务器已启动: http://localhost:${PORT}/`);
  });
}

initServer().catch(err => console.error('启动失败:', err));
