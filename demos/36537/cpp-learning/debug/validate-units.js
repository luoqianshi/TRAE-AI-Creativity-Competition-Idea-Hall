// 验证脚本 - 检查所有单元文件是否能正确加载
const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\wky81\\Desktop\\course\\C++\\cpp-learning';
const files = fs.readdirSync(dir).filter(f => f.match(/^unit\d+-data\.js$/));

console.log('=== 单元文件验证 ===');
console.log('找到 ' + files.length + ' 个单元文件\n');

let allPassed = true;
const loadedUnits = {};

for (const f of files) {
    try {
        // 读取文件并检查基本结构
        const content = fs.readFileSync(path.join(dir, f), 'utf8');
        
        // 检查基本结构
        if (!content.includes('const Unit')) {
            console.log('❌ ' + f + ': 缺少 const Unit 定义');
            allPassed = false;
            continue;
        }
        
        // 检查导出语句
        const unitNum = f.match(/unit(\d+)-data\.js/)[1];
        const exportPattern = 'window.Unit' + unitNum + 'Data';
        if (!content.includes(exportPattern)) {
            console.log('❌ ' + f + ': 缺少 ' + exportPattern + ' 导出');
            allPassed = false;
            continue;
        }
        
        // 检查 lessons 数组
        if (!content.includes('lessons:')) {
            console.log('❌ ' + f + ': 缺少 lessons 数组');
            allPassed = false;
            continue;
        }
        
        // 检查是否能被Node解析
        try {
            // 使用eval模拟浏览器环境
            const globalObj = {};
            const wrapped = '(function() { ' + content + ' return Unit' + unitNum + 'Data; })()';
            const result = eval(wrapped);
            
            if (result && result.id && result.title && result.lessons && Array.isArray(result.lessons)) {
                console.log('✅ ' + f + ': 加载成功 (单元' + result.id + ': ' + result.title + ', ' + result.lessons.length + '节课)');
                loadedUnits[result.id] = result;
            } else {
                console.log('❌ ' + f + ': 结构不完整');
                allPassed = false;
            }
        } catch (e) {
            console.log('❌ ' + f + ': 解析错误 - ' + e.message);
            allPassed = false;
        }
        
    } catch (e) {
        console.log('❌ ' + f + ': 读取错误 - ' + e.message);
        allPassed = false;
    }
}

console.log('\n=== 汇总 ===');
if (allPassed) {
    console.log('🎉 所有单元文件验证通过！');
    console.log('已加载 ' + Object.keys(loadedUnits).length + ' 个单元');
    
    // 按ID排序显示
    const sortedIds = Object.keys(loadedUnits).sort((a, b) => parseInt(a) - parseInt(b));
    sortedIds.forEach(id => {
        const unit = loadedUnits[id];
        console.log('  单元' + id + ': ' + unit.title + ' (' + unit.lessons.length + '节课)');
    });
} else {
    console.log('❌ 存在错误，请检查上述问题');
}
