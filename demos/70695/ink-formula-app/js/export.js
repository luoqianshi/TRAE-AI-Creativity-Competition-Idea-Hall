/* ========== 水性墨水配方管理系统 - Excel导出模块 ========== */

// Uses SheetJS (xlsx) loaded via CDN
function exportFormulaExcel(formulaId) {
  const formula = getFormulaById(formulaId);
  if (!formula) { showToast('配方不存在', 'error'); return; }

  const ings = formula.ingredients || [];
  const props = formula.properties || {};

  // Build sheet data
  // Row 1: Headers - 原料 | 配比 | 质量
  // Row 2..N: Each ingredient
  // Row N+1: empty separator
  // Row N+2: 粘度
  // Row N+3: 表面张力
  // Row N+4: 光度计

  const rows = [];
  rows.push(['原料', '分类', '配比', '质量']);

  // Group ingredients by category
  const catOrder = ['溶剂', '助剂', '树脂', '色浆'];
  catOrder.forEach(cat => {
    const catIngs = ings.filter(i => i.category === cat);
    catIngs.forEach(ing => {
      rows.push([ing.name || '', ing.category || '', ing.ratio || '', ing.mass || '']);
    });
  });

  // Add separator
  rows.push([]);
  rows.push(['--- 物性数据 ---', '', '', '']);

  const vis = props.viscosity || {};
  rows.push(['粘度', `${vis.value || '-'} ${vis.unit || 'mPa·s'}`, vis.method || '', '']);

  const st = props.surfaceTension || {};
  rows.push(['表面张力', `${st.value || '-'} ${st.unit || 'mN/m'}`, st.method || '', '']);

  const spec = props.spectrophotometer || {};
  rows.push(['光度计 L*', spec.L || '-', '', '']);
  rows.push(['光度计 a*', spec.a || '-', '', '']);
  rows.push(['光度计 b*', spec.b || '-', '', '']);
  rows.push(['ΔE', spec['\u0394E'] || '-', '', '']);

  // Create workbook
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Style: set column widths
  ws['!cols'] = [
    { wch: 22 },  // 原料
    { wch: 12 },  // 分类
    { wch: 14 },  // 配比
    { wch: 14 },  // 质量
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '配方');

  // Generate filename
  const safeName = formula.name.replace(/[\\/:*?"<>|]/g, '_');
  XLSX.writeFile(wb, `${safeName}.xlsx`);

  showToast('Excel 已导出', 'success');
}

function exportWorkbenchExcel(formulaIds) {
  const formulas = formulaIds.map(id => getFormulaById(id)).filter(Boolean);
  if (formulas.length === 0) { showToast('没有可导出的配方', 'error'); return; }

  // Collect all unique ingredient names
  const allIngNames = new Set();
  formulas.forEach(f => {
    (f.ingredients || []).forEach(ing => allIngNames.add(ing.name));
  });

  // Headers: 项目 | Formula1 | Formula2 | ...
  const headers = ['项目', ...formulas.map(f => f.name)];

  // Rows: for each ingredient, show ratio or mass
  const ratioRows = [['--- 配比 ---', ...formulas.map(() => '')]];
  const massRows = [['--- 质量 ---', ...formulas.map(() => '')]];

  allIngNames.forEach(name => {
    const ratioRow = [name];
    const massRow = [name];
    formulas.forEach(f => {
      const ing = (f.ingredients || []).find(i => i.name === name);
      ratioRow.push(ing?.ratio || '-');
      massRow.push(ing?.mass || '-');
    });
    ratioRows.push(ratioRow);
    massRows.push(massRow);
  });

  // Property rows
  const propRows = [
    [],
    ['--- 物性数据 ---', ...formulas.map(() => '')],
  ];

  propRows.push(['粘度', ...formulas.map(f => {
    const v = (f.properties || {}).viscosity || {};
    return v.value ? `${v.value} ${v.unit || 'mPa·s'}` : '-';
  })]);

  propRows.push(['表面张力', ...formulas.map(f => {
    const v = (f.properties || {}).surfaceTension || {};
    return v.value ? `${v.value} ${v.unit || 'mN/m'}` : '-';
  })]);

  propRows.push(['光度计 L*', ...formulas.map(f => (f.properties || {}).spectrophotometer?.L || '-')]);
  propRows.push(['光度计 a*', ...formulas.map(f => (f.properties || {}).spectrophotometer?.a || '-')]);
  propRows.push(['光度计 b*', ...formulas.map(f => (f.properties || {}).spectrophotometer?.b || '-')]);
  propRows.push(['ΔE', ...formulas.map(f => (f.properties || {}).spectrophotometer?.['\u0394E'] || '-')]);

  // Build sheet
  const allRows = [headers, [], ...ratioRows, [], ...massRows, ...propRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths
  ws['!cols'] = [
    { wch: 22 },
    ...formulas.map(() => ({ wch: 20 }))
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '配方比对');
  XLSX.writeFile(wb, `配方比对_${new Date().toISOString().slice(0,10)}.xlsx`);

  showToast('比对 Excel 已导出', 'success');
}
