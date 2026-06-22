(function() {
    var style = getComputedStyle(document.documentElement);
    var accent = style.getPropertyValue('--accent').trim();
    var accent2 = style.getPropertyValue('--accent2').trim();
    var ink = style.getPropertyValue('--ink').trim();
    var muted = style.getPropertyValue('--muted').trim();
    var rule = style.getPropertyValue('--rule').trim();
    var bg2 = style.getPropertyValue('--bg2').trim();

    // --- Chart: Radar - 杨天南选股模型多维度评估 ---
    var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
    chartRadar.setOption({
        animation: false,
        tooltip: {
            trigger: 'item',
            appendToBody: true,
            backgroundColor: bg2,
            borderColor: rule,
            textStyle: { color: ink }
        },
        radar: {
            indicator: [
                { name: 'ROE\n盈利能力', max: 30 },
                { name: '毛利率\n盈利质量', max: 50 },
                { name: '净利率\n成本控制', max: 25 },
                { name: 'PE估值\n好价格', max: 50 },
                { name: '营收增长\n成长性', max: 30 },
                { name: '利润增长\n成长性', max: 30 },
                { name: '负债率\n财务健康', max: 100 },
                { name: '现金流\n盈利质量', max: 100 }
            ],
            shape: 'polygon',
            splitNumber: 4,
            axisName: {
                color: muted,
                fontSize: 12
            },
            splitLine: {
                lineStyle: { color: rule }
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: [bg2, 'transparent']
                }
            },
            axisLine: {
                lineStyle: { color: rule }
            }
        },
        series: [{
            type: 'radar',
            data: [
                {
                    value: [15, 30, 10, 30, 10, 10, 60, 80],
                    name: '杨天南模型阈值',
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {
                        color: accent,
                        width: 2
                    },
                    areaStyle: {
                        color: accent + '33'
                    },
                    itemStyle: {
                        color: accent
                    }
                },
                {
                    value: [20, 40, 15, 20, 20, 18, 45, 90],
                    name: '示例优质企业',
                    symbol: 'diamond',
                    symbolSize: 6,
                    lineStyle: {
                        color: accent2,
                        width: 2,
                        type: 'dashed'
                    },
                    areaStyle: {
                        color: accent2 + '22'
                    },
                    itemStyle: {
                        color: accent2
                    }
                }
            ]
        }],
        legend: {
            bottom: 0,
            textStyle: { color: muted },
            data: ['杨天南模型阈值', '示例优质企业']
        }
    });
    window.addEventListener('resize', function() { chartRadar.resize(); });
})();
