// app_gen.js - 完整生成 app.js
// 用法: node app_gen.js

var fs = require('fs');

// 每次调用追加内容到 app.js
function append(code) {
  fs.appendFileSync('app.js', code, 'utf8');
}

function write(code) {
  fs.writeFileSync('app.js', code, 'utf8');
}

// ============================================================
// 第1部分：文件头 + API配置
// ============================================================
var part1 = '''
/*!
 * 感情急诊事务所 - 核心逻辑
 * 版本: 2026-06-29 v3.0
 */

// ==================== API 配置（内置，安全混淆） ====================
const _K_PARTS = [
  \';;::8<;88885;7;78:;:8>8=8\',
  \'76<646:95969494956:6<6794\',
  \'=?;:868;=;988979;:8;7>7;8:8=\',
  \'56e786375859:666h557867\',
];
const _K_OFFSETS = [5, 3, 7, 2];

function _decodeKey() {
  var rawParts = _K_PARTS.map(function(part, idx) {
    var offset = _K_OFFSETS[idx];
    var decoded = \'\';
    for (var i = 0; i < part.length; i++) {
      decoded += String.fromCharCode(part.charCodeAt(i) - offset);
    }
    return decoded;
  });
  var hexStr = rawParts.join(\'\');
  var result = \'\';
  for (var i = 0; i < hexStr.length; i += 2) {
    result += String.fromCharCode(parseInt(hexStr.substring(i, i + 2), 16));
  }
  return result;
}

const API_CONFIG = {
  baseUrl: \'https://open.bigmodel.cn/api/paas/v4\',
  apiKey: _decodeKey(),
  model: \'glm-4-flash\'
};
''';

write(part1);
console.log('Part 1 done');
