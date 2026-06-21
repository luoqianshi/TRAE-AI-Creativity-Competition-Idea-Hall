// 简单验证脚本
const fs = require('fs');

const files = ['unit1-data.js', 'unit2-data.js', 'unit3-data.js'];
const results = [];

for (const f of files) {
    try {
        const content = fs.readFileSync(f, 'utf8');
        if (content.includes('const Unit') && content.includes('window.Unit')) {
            results.push('OK: ' + f);
        } else {
            results.push('FAIL: ' + f);
        }
    } catch (e) {
        results.push('ERROR: ' + f + ' - ' + e.message);
    }
}

fs.writeFileSync('validation-results.txt', results.join('\n'));
console.log('Results written to validation-results.txt');
