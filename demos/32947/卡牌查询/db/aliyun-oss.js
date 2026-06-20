/**
 * 阿里云 OSS 对象存储客户端
 *
 * 启用方法:在 config.local.js 中填写 aliyunOSS 配置块
 *   - accessKeyId:   RAM 用户的 AccessKey ID
 *   - accessKeySecret: RAM 用户的 AccessKey Secret
 *   - bucket:        存储桶名(不含 -oss 之类后缀)
 *   - region:        地域代码 (如 oss-cn-hangzhou)
 *   - endpoint:      可选,自定义 endpoint,留空用默认
 *   - cdnDomain:     可选,自定义 CDN 加速域名
 *   - secure:        是否使用 HTTPS 访问生成 URL,默认 true
 *   - keyPrefix:     文件名前缀,默认 'card-grading/'
 */
const OSS = require('ali-oss');
const local = require('../config.local');

let client = null;
let config = null;
let enabled = false;

function init() {
  const cfg = local.aliyunOSS || {};
  const accessKeyId = (cfg.accessKeyId || '').trim();
  const accessKeySecret = (cfg.accessKeySecret || '').trim();
  const bucket = (cfg.bucket || '').trim();
  const region = (cfg.region || '').trim();

  if (!accessKeyId || !accessKeySecret || !bucket || !region) {
    enabled = false;
    client = null;
    config = null;
    return;
  }
  try {
    client = new OSS({
      accessKeyId,
      accessKeySecret,
      bucket,
      region,
      endpoint: (cfg.endpoint || '').trim() || undefined,
      secure: cfg.secure !== false,
      timeout: 30000
    });
    config = {
      bucket,
      region,
      cdnDomain: (cfg.cdnDomain || '').trim().replace(/\/+$/, ''),
      keyPrefix: (cfg.keyPrefix || 'card-grading/').trim().replace(/^\/+|\/+$/g, '') + '/'
    };
    enabled = true;
  } catch (e) {
    console.error('[AliyunOSS] 客户端创建失败:', e.message);
    enabled = false;
    client = null;
    config = null;
  }
}

init();

function isEnabled() { return enabled; }
function getConfig() { return config; }

/**
 * 上传 buffer 到 OSS
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimeType
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadBuffer(buffer, originalName, mimeType) {
  if (!enabled) throw new Error('Aliyun OSS 未启用');
  const ext = (() => {
    const m = (originalName || '').match(/\.[a-z0-9]+$/i);
    if (m) return m[0].toLowerCase();
    if (/png/i.test(mimeType || '')) return '.png';
    if (/webp/i.test(mimeType || '')) return '.webp';
    if (/gif/i.test(mimeType || '')) return '.gif';
    return '.jpg';
  })();
  const base = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const key = config.keyPrefix + base + ext;

  await client.put(key, buffer, {
    mime: mimeType || undefined,
    headers: { 'Cache-Control': 'public, max-age=604800' }
  });

  return { url: buildUrl(key), key };
}

function buildUrl(key) {
  if (config.cdnDomain) {
    const d = config.cdnDomain;
    return /^https?:\/\//i.test(d) ? `${d}/${key}` : `https://${d}/${key}`;
  }
  return client.signatureUrl(key, { expires: 3600 * 24 * 365 * 10 });
}

/**
 * 通过 URL 删除对象
 */
async function deleteByUrl(url) {
  if (!enabled) return;
  if (!url) return;
  const key = urlToKey(url);
  if (!key) return;
  try {
    await client.delete(key);
  } catch (e) {
    console.warn('[AliyunOSS] 删除失败:', key, e.message);
  }
}

function urlToKey(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    let p = u.pathname.replace(/^\/+/, '');
    if (config.cdnDomain && u.hostname.endsWith(new URL('https://' + config.cdnDomain).hostname)) {
      return decodeURIComponent(p);
    }
    const expectedHost = `${config.bucket}.${config.region}.aliyuncs.com`;
    if (u.hostname === expectedHost || u.hostname.endsWith('.aliyuncs.com')) {
      return decodeURIComponent(p);
    }
    if (p.startsWith(config.keyPrefix)) return decodeURIComponent(p);
    return decodeURIComponent(p);
  } catch (e) {
    return '';
  }
}

module.exports = { init, isEnabled, uploadBuffer, deleteByUrl, buildUrl };
