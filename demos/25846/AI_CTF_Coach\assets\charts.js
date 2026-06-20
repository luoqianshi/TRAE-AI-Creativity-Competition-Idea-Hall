(function() {
    var style = getComputedStyle(document.documentElement);
    var accent = style.getPropertyValue('--accent').trim();
    var accent2 = style.getPropertyValue('--accent2').trim();
    var ink = style.getPropertyValue('--ink').trim();
    var muted = style.getPropertyValue('--muted').trim();
    var rule = style.getPropertyValue('--rule').trim();
    var bg2 = style.getPropertyValue('--bg2').trim();

    // --- Chart: AI Hint Flow (Sankey-style flowchart using graph) ---
    var chartHintFlow = echarts.init(document.getElementById('chart-hint-flow'), null, { renderer: 'svg' });
    
    var hintFlowOption = {
        animation: false,
        tooltip: {
            trigger: 'item',
            appendToBody: true,
            formatter: function(params) {
                if (params.dataType === 'node') {
                    return '<strong>' + params.name + '</strong><br/>' + (params.data.desc || '');
                }
                return params.name;
            }
        },
        series: [{
            type: 'graph',
            layout: 'none',
            symbolSize: 80,
            roam: false,
            label: {
                show: true,
                fontSize: 13,
                fontWeight: 'bold',
                color: ink,
                formatter: function(params) {
                    return params.data.name;
                }
            },
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: [0, 12],
            edgeLabel: {
                show: true,
                fontSize: 11,
                color: muted,
                formatter: function(params) {
                    return params.data.label || '';
                }
            },
            data: [
                { 
                    name: '学员\n遇到难题', 
                    x: 100, 
                    y: 200, 
                    symbolSize: 90,
                    itemStyle: { color: accent },
                    desc: '学员在解题过程中卡住，点击求助按钮'
                },
                { 
                    name: 'AI 分析\n当前进度', 
                    x: 300, 
                    y: 200, 
                    symbolSize: 90,
                    itemStyle: { color: accent2 },
                    desc: 'AI 分析学员的尝试记录、当前页面状态、已用时间'
                },
                { 
                    name: '第一级\n思路引导', 
                    x: 500, 
                    y: 80, 
                    symbolSize: 85,
                    itemStyle: { color: '#00e5a0' },
                    desc: '"这道题涉及信息收集，建议先查看页面源代码和 HTTP 响应头"'
                },
                { 
                    name: '第二级\n关键线索', 
                    x: 500, 
                    y: 200, 
                    symbolSize: 85,
                    itemStyle: { color: '#ffb800' },
                    desc: '"注意 URL 中的 id 参数，可能存在 SQL 注入点"'
                },
                { 
                    name: '第三级\n具体方向', 
                    x: 500, 
                    y: 320, 
                    symbolSize: 85,
                    itemStyle: { color: '#ff6b6b' },
                    desc: '"尝试使用单引号闭合，观察报错信息，使用报错注入提取数据"'
                },
                { 
                    name: '学员\n继续尝试', 
                    x: 700, 
                    y: 200, 
                    symbolSize: 90,
                    itemStyle: { color: accent },
                    desc: '学员根据提示继续尝试解题'
                }
            ],
            links: [
                { 
                    source: '学员\n遇到难题', 
                    target: 'AI 分析\n当前进度',
                    lineStyle: { color: accent, width: 2 },
                    label: '点击求助'
                },
                { 
                    source: 'AI 分析\n当前进度', 
                    target: '第一级\n思路引导',
                    lineStyle: { color: '#00e5a0', width: 2 },
                    label: '首次求助'
                },
                { 
                    source: 'AI 分析\n当前进度', 
                    target: '第二级\n关键线索',
                    lineStyle: { color: '#ffb800', width: 2 },
                    label: '多次尝试失败'
                },
                { 
                    source: 'AI 分析\n当前进度', 
                    target: '第三级\n具体方向',
                    lineStyle: { color: '#ff6b6b', width: 2 },
                    label: '长时间未解出'
                },
                { 
                    source: '第一级\n思路引导', 
                    target: '学员\n继续尝试',
                    lineStyle: { color: '#00e5a0', width: 2, type: 'dashed' }
                },
                { 
                    source: '第二级\n关键线索', 
                    target: '学员\n继续尝试',
                    lineStyle: { color: '#ffb800', width: 2, type: 'dashed' }
                },
                { 
                    source: '第三级\n具体方向', 
                    target: '学员\n继续尝试',
                    lineStyle: { color: '#ff6b6b', width: 2, type: 'dashed' }
                }
            ],
            lineStyle: {
                opacity: 0.9,
                width: 2,
                curveness: 0.1
            }
        }]
    };
    
    chartHintFlow.setOption(hintFlowOption);
    window.addEventListener('resize', function() { chartHintFlow.resize(); });
})();
