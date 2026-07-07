(function() {
    var style = getComputedStyle(document.documentElement);
    var accent = style.getPropertyValue('--accent').trim();
    var accent2 = style.getPropertyValue('--accent2').trim();
    var ink = style.getPropertyValue('--ink').trim();
    var muted = style.getPropertyValue('--muted').trim();
    var rule = style.getPropertyValue('--rule').trim();
    var bg2 = style.getPropertyValue('--bg2').trim();
    var green = style.getPropertyValue('--green').trim();
    var blue = style.getPropertyValue('--blue').trim();
    var purple = style.getPropertyValue('--purple').trim();
    var red = style.getPropertyValue('--red').trim();

    // --- Chart: Knowledge Distribution ---
    var chartKnowledge = echarts.init(document.getElementById('chart-knowledge'), null, { renderer: 'svg' });
    chartKnowledge.setOption({
        animation: false,
        tooltip: {
            trigger: 'item',
            appendToBody: true,
            formatter: '{b}: {c}% ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: 0,
            textStyle: { color: muted, fontSize: 11 }
        },
        color: [accent, accent2, blue, green, purple, red, '#FFB300'],
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 8,
                borderColor: bg2,
                borderWidth: 3
            },
            label: {
                show: true,
                formatter: '{b}\n{c}%',
                color: ink,
                fontSize: 11
            },
            labelLine: {
                lineStyle: { color: rule }
            },
            data: [
                { value: 24, name: '语文' },
                { value: 20, name: '数学' },
                { value: 16, name: '英语' },
                { value: 14, name: '科学' },
                { value: 12, name: '词语' },
                { value: 9, name: '安全' },
                { value: 5, name: '拼音' }
            ]
        }]
    });
    window.addEventListener('resize', function() { chartKnowledge.resize(); });

    // --- Chart: Learning Efficiency Comparison ---
    var chartEfficiency = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
    chartEfficiency.setOption({
        animation: false,
        tooltip: {
            trigger: 'axis',
            appendToBody: true,
            axisPointer: { type: 'shadow' }
        },
        legend: {
            data: ['传统学习方式', '童趣乐园 AI'],
            bottom: 0,
            textStyle: { color: muted, fontSize: 11 }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['知识点掌握', '复习效率', '学习时长', '留存率', '趣味性'],
            axisLine: { lineStyle: { color: rule } },
            axisLabel: { color: muted, fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLine: { show: false },
            splitLine: { lineStyle: { color: rule, type: 'dashed' } },
            axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }
        },
        color: [muted, accent],
        series: [
            {
                name: '传统学习方式',
                type: 'bar',
                barWidth: '30%',
                data: [45, 35, 80, 40, 30],
                itemStyle: { borderRadius: [4, 4, 0, 0] }
            },
            {
                name: '童趣乐园 AI',
                type: 'bar',
                barWidth: '30%',
                data: [85, 90, 35, 92, 88],
                itemStyle: { borderRadius: [4, 4, 0, 0] }
            }
        ]
    });
    window.addEventListener('resize', function() { chartEfficiency.resize(); });
})();
