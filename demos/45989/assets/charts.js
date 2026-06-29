// assets/charts.js — ECharts charts for Gaokao AI report
(function() {
    var style = getComputedStyle(document.documentElement);
    var accent = style.getPropertyValue('--accent').trim();
    var accent2 = style.getPropertyValue('--accent2').trim();
    var ink = style.getPropertyValue('--ink').trim();
    var muted = style.getPropertyValue('--muted').trim();
    var rule = style.getPropertyValue('--rule').trim();
    var bg2 = style.getPropertyValue('--bg2').trim();
    var green = style.getPropertyValue('--green').trim();
    var red = style.getPropertyValue('--red').trim();

    // --- Chart 1: Data per year ---
    var chart1 = echarts.init(document.getElementById('chart-data-years'), null, { renderer: 'svg' });
    chart1.setOption({
        tooltip: { trigger: 'axis', appendToBody: true },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: ['2022', '2023', '2024', '2025'],
            axisLabel: { color: muted }, axisLine: { lineStyle: { color: rule } } },
        yAxis: { type: 'value', name: '专业记录数',
            axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
        series: [{
            type: 'bar', data: [69, 85, 904, 92],
            itemStyle: { color: accent, borderRadius: [6,6,0,0] },
            barWidth: '50%', animation: false,
            label: { show: true, position: 'top', color: ink, fontWeight: 'bold' }
        }]
    });
    window.addEventListener('resize', function() { chart1.resize(); });

    // --- Chart 2: Law major comparison ---
    var chart2 = echarts.init(document.getElementById('chart-law-compare'), null, { renderer: 'svg' });
    var lawMarks = [
        ['中国政法大学', 675, 989, false],
        ['武汉大学', 675, 950, false],
        ['华东政法大学', 668, 1337, false],
        ['中山大学', 661, 1489, false],
        ['吉林大学', 663, 1681, false],
        ['中南财经政法', 658, 2140, false],
        ['西南政法大学', 658, 2140, false],
        ['西北政法大学', 635, 4579, false],
        ['安徽大学(211)', 619, 7577, false],
        ['海南大学(211)', 625, 7500, false],
        ['宁夏大学(211)', 608, 9938, false],
    ];

    chart2.setOption({
        tooltip: {
            trigger: 'axis',
            appendToBody: true,
            formatter: function(p) { return p[0].name + '<br/>法学最低分: ' + p[0].value + '分'; }
        },
        grid: { left: '3%', right: '8%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: { type: 'value', name: '最低分',
            axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
        yAxis: {
            type: 'category', data: lawMarks.map(function(m) { return m[0]; }),
            axisLabel: { color: ink, fontSize: 11 }, axisLine: { lineStyle: { color: rule } },
            inverse: true
        },
        series: [{
            type: 'bar', data: lawMarks.map(function(m) {
                return { value: m[1], itemStyle: { color: m[1] >= 660 ? red : (m[1] >= 640 ? accent2 : accent), borderRadius: [0,6,6,0] } };
            }),
            barWidth: '55%', animation: false,
            label: { show: true, position: 'right', color: ink, fontSize: 11,
                formatter: function(p) { return p.value + '分 / ' + lawMarks[p.dataIndex][2] + '名'; }
            },
            markLine: {
                silent: true, symbol: 'none',
                lineStyle: { color: accent, type: 'dashed', width: 2 },
                label: { formatter: '587分(位次~13497)', color: accent, fontSize: 11 },
                data: [{ xAxis: 587 }]
            }
        }]
    });
    window.addEventListener('resize', function() { chart2.resize(); });

    // --- Mermaid ---
    mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose',
        themeVariables: {
            primaryColor: '#1e3a5f', primaryTextColor: '#e2e8f0',
            primaryBorderColor: '#3b82f6', lineColor: '#3b82f6',
            secondaryColor: '#1e293b', tertiaryColor: '#0f172a',
            fontSize: '14px'
        }
    });
})();
