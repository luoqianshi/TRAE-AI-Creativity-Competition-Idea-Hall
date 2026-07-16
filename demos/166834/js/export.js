/**
 * SVG 导出模块
 * 将页面上的甘特图 SVG 导出为 .svg 文件下载
 */

/**
 * 导出当前甘特图为 SVG 文件
 */
function exportSvg() {
    var svgEl = svgContainer.querySelector('svg');
    if (!svgEl) {
        alert('请先生成甘特图！');
        return;
    }
    var clone = svgEl.cloneNode(true);
    var serializer = new XMLSerializer();
    var svgStr = serializer.serializeToString(clone);
    var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + svgStr], { type: 'image/svg+xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '甘特图_' + new Date().toISOString().slice(0, 10) + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
