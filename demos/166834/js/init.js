/**
 * 初始化 + 事件绑定模块
 * 负责页面初始化（加载示例数据）和所有 DOM 事件绑定
 */

/**
 * 初始化应用：加载示例数据并绑定事件
 */
function init() {
    // 加载示例数据
    GanttState.rows = [
        { id: GanttState.nextId++, name: '需求阶段', parentId: null, start: '2026-07-01', end: '2026-07-31', isManual: false },
        { id: GanttState.nextId++, name: '用户故事编写', parentId: 1, start: '2026-07-01', end: '2026-07-10', isManual: false },
        { id: GanttState.nextId++, name: '需求评审', parentId: 1, start: '2026-07-11', end: '2026-07-20', isManual: false },
        { id: GanttState.nextId++, name: '与产品对齐', parentId: 1, start: '2026-07-21', end: '2026-07-31', isManual: false },
        { id: GanttState.nextId++, name: '开发阶段', parentId: null, start: '2026-08-01', end: '2026-08-31', isManual: false },
        { id: GanttState.nextId++, name: '前端开发', parentId: 5, start: '2026-08-01', end: '2026-08-15', isManual: false },
        { id: GanttState.nextId++, name: '后端开发', parentId: 5, start: '2026-08-10', end: '2026-08-25', isManual: false }
    ];

    renderTable();
    updateStats();
    generateGantt();

    // ---- 事件绑定 ----

    // CSV 导入：打开弹窗
    var importModal = document.getElementById('importModal');
    document.getElementById('openImportBtn').addEventListener('click', function() {
        importModal.classList.add('show');
    });

    // 关闭弹窗
    document.getElementById('closeImportBtn').addEventListener('click', function() {
        importModal.classList.remove('show');
    });

    // 点击遮罩关闭弹窗
    importModal.addEventListener('click', function(e) {
        if (e.target === importModal) importModal.classList.remove('show');
    });

    // 弹窗内选择文件后导入
    document.getElementById('csvFileInput').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (file) {
            importCSV(file);
            importModal.classList.remove('show');
        }
        this.value = '';
    });

    // 生成甘特图
    document.getElementById('renderBtn').addEventListener('click', function() {
        generateGantt();
    });

    // 导出 SVG
    document.getElementById('exportSvgBtn').addEventListener('click', function() {
        exportSvg();
    });

    // 导出 CSV
    document.getElementById('exportCsvBtn').addEventListener('click', function() {
        exportCSV();
    });

    // 清空数据
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (GanttState.rows.length === 0) return;
        if (confirm('确定清空所有数据吗？')) {
            GanttState.rows = [];
            GanttState.nextId = 1;
            renderTable();
            updateStats();
            emptyState.style.display = 'block';
            svgContainer.style.display = 'none';
            svgContainer.innerHTML = '';
            clearError();
        }
    });

    // 新增根节点
    document.getElementById('addRootBtn').addEventListener('click', function() {
        addRootNode();
    });

    // 模式切换
    modeDateBtn.addEventListener('click', function() { if (GanttState.mode !== 'date') setMode('date'); });
    modeOrdinalBtn.addEventListener('click', function() { if (GanttState.mode !== 'ordinal') setMode('ordinal'); });

    // 序数模式轴范围
    rangeMinInput.addEventListener('change', function() { if (GanttState.mode === 'ordinal') generateGantt(); });
    rangeMaxInput.addEventListener('change', function() { if (GanttState.mode === 'ordinal') generateGantt(); });

    // 序数模式单位
    ordinalUnitInput.addEventListener('change', function() { if (GanttState.mode === 'ordinal') generateGantt(); });
    ordinalUnitInput.addEventListener('input', function() { if (GanttState.mode === 'ordinal') generateGantt(); });

    // 初始状态：序数模式控件禁用
    rangeMinInput.disabled = true;
    rangeMaxInput.disabled = true;
    ordinalUnitInput.disabled = true;

    // 显示配置勾选框事件
    ['cfgSeq', 'cfgName', 'cfgStart', 'cfgEnd', 'cfgDuration'].forEach(function(id) {
        document.getElementById(id).addEventListener('change', function() {
            var key = id.replace('cfg', '').toLowerCase();
            // 映射 id 后缀到 displayConfig 的 key
            var keyMap = { seq: 'seq', name: 'name', start: 'start', end: 'end', duration: 'duration' };
            GanttState.displayConfig[keyMap[key]] = this.checked;
            generateGantt();
        });
    });
}

// 页面加载后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
