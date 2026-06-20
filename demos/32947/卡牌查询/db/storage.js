/**
 * 对象存储抽象层
 *
 * 统一对外提供 uploadBuffer / deleteByUrl 接口,
 * 内部根据配置自动选择后端:
 *   1. aliyunOSS 已配置 → 阿里云 OSS
 *   2. 都没配置 → 本地磁盘 (uploads/)
 */
const fs = require('fs');
const path = require('path');

const OSS = require('./aliyun-oss');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function getBackend() {
  if (OSS.isEnabled()) return 'aliyun-oss';
  return 'local';
}

/**
 * 上传文件 buffer 到云端
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimeType
 * @returns {Promise<{url: string, key?: string, backend: string}>}
 */
async function uploadBuffer(buffer, originalName, mimeType) {
  if (OSS.isEnabled()) {
    const r = await OSS.uploadBuffer(buffer, originalName, mimeType);
    return { url: r.url, key: r.key, backend: 'aliyun-oss' };
  }
  // fallback: 本地
  ensureUploadDir();
  const ext = (() => {
    const m = (originalName || '').match(/\.[a-z0-9]+$/i);
    if (m) return m[0].toLowerCase();
    if (/png/i.test(mimeType || '')) return '.png';
    if (/webp/i.test(mimeType || '')) return '.webp';
    if (/gif/i.test(mimeType || '')) return '.gif';
    return '.jpg';
  })();
  const base = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const filename = base + ext;
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return { url: `/uploads/${filename}`, backend: 'local' };
}

/**
 * 通过 URL 删除文件
 * @param {string} url
 */
async function deleteByUrl(url) {
  if (!url) return;
  if (OSS.isEnabled()) {
    await OSS.deleteByUrl(url);
    return;
  }
  // fallback: 本地
  try {
    const filename = path.basename(new URL(url, 'http://localhost').pathname);
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (e) { /* ignore */ }
}

module.exports = { getBackend, uploadBuffer, deleteByUrl, UPLOAD_DIR };
