/* ========== 水性墨水配方管理系统 - 工作台（多配方比对） ========== */

let selectedFormulaIds = [];

function renderWorkbenchPage() {
  const content = document.getElementById('content');
  const formulas = getFormulas();

  content.innerHTML = `
    <div class="toolbar flex items-center justify-between">
      <div class="flex gap-8 items-center">
        <span class="text-muted">选择要对比的配方</span>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-outline btn-sm" id="btn-clear-workbench" ${selectedFormulaIds.length === 0 ? 'disabled' : ''}>${ico('trash-can')} 清空选择</button>
        <button class="btn btn-success btn-sm" id="btn-export-workbench" ${selectedFormulaIds.length < 1 ? 'disabled' : ''}>${ico('download')} 导出比对Excel</button>
      </div>
    </div>

    <!-- Selection area -->
    <div class="card mb-16">
      <div class="card-header">
        <h3>${ico('microscope')} 已选配方</h3>
        <span class="text-muted">${selectedFormulaIds.length} / ${formulas.length}</span>
      </div>
      <div class="card-body">
        <div class="workbench-selection mb-8">
          ${selectedFormulaIds.length === 0
            ? '<span class="text-muted">从下方列表中选择配方开始比对</span>'
            : selectedFormulaIds.map(id => {
                const f = getFormulaById(id);
                if (!f) return '';
                return `<span class="formula-chip">${escHtml(f.name)} <span class="remove" onclick="removeFormulaFromWorkbench('${id}')">×</span></span>`;
              }).join('')
          }
        </div>
        ${formulas.length > 0 ? `
          <div class="flex gap-8 items-center">
            <select class="select" id="wb-add-select" style="max-width:300px;">
              <option value="">➕ 添加配方到工作台...</option>
              ${formulas.filter(f => !selectedFormulaIds.includes(f.id)).map(f =>
                `<option value="${f.id}">${f.color ? '[' + f.color + '] ' : ''}${escHtml(f.name)}${f.substrate ? ' · ' + escHtml(f.substrate) : ''}</option>`
              ).join('')}
            </select>
            <button class="btn btn-outline btn-sm" id="btn-add-to-wb">添加</button>
          </div>
        ` : ''}
      </div>
    </div>

    ${formulas.length > 0 ? `
      <div class="flex gap-6 mt-8 flex-wrap items-center">
        <span class="text-muted" style="font-size:0.75rem;">同色一键对比：</span>
        ${(() => {
          const allColors = [...new Set(formulas.map(f => f.color).filter(c => c && formulas.filter(g => g.color === c).length >= 2))];
          return allColors.sort((a,b) => a.localeCompare(b,'zh')).map(c => 
            '<button class="btn btn-sm color-quick-btn" onclick="(function(){const ids=getFormulas().filter(f=>f.color===\''+c+'\').map(f=>f.id);ids.forEach(id=>{if(!selectedFormulaIds.includes(id))addToWorkbench(id)});renderWorkbenchPage();})()"><span class="color-dot" style="background:'+(COLOR_MAP[c]||'#94a3b8')+';width:8px;height:8px;"></span> '+c+'色 ('+formulas.filter(f=>f.color===c).length+')</button>'
          ).join('');
        })()}
      </div>
    ` : ''}

    ${formulas.length === 0 ? `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="icon">${ico('microscope')}</div>
            <h4>暂无配方数据</h4>
            <p class="text-muted mt-8">请先在「配方管理」中创建配方</p>
          </div>
        </div>
      </div>
    ` : selectedFormulaIds.length === 0 ? `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="icon">${ico('chart-simple')}</div>
            <h4>请选择配方</h4>
            <p class="text-muted mt-8">在上方下拉菜单中选择要对比的配方</p>
          </div>
        </div>
      </div>
    ` : renderWorkbenchCompare(formulas)}
  `;

  // Event handlers
  const btnAdd = content.querySelector('#btn-add-to-wb');
  const select = content.querySelector('#wb-add-select');
  if (btnAdd && select) {
    btnAdd.onclick = () => {
      const id = select.value;
      if (id && !selectedFormulaIds.includes(id)) {
        selectedFormulaIds.push(id);
        renderWorkbenchPage();
      }
    };
  }

  const btnClear = content.querySelector('#btn-clear-workbench');
  if (btnClear) {
    btnClear.onclick = () => {
      selectedFormulaIds = [];
      renderWorkbenchPage();
    };
  }

  const btnExport = content.querySelector('#btn-export-workbench');
  if (btnExport) {
    btnExport.onclick = () => {
      if (selectedFormulaIds.length > 0) {
        exportWorkbenchExcel(selectedFormulaIds);
      }
    };
  }
}

function removeFormulaFromWorkbench(id) {
  selectedFormulaIds = selectedFormulaIds.filter(fid => fid !== id);
  renderWorkbenchPage();
}

function renderWorkbenchCompare(allFormulas) {
  const formulas = selectedFormulaIds.map(id => getFormulaById(id)).filter(Boolean);
  if (formulas.length === 0) return '';

  // ========== Color Grouping ==========
  const colorGroups = {};
  formulas.forEach(f => {
    const c = f.color || '未分类';
    if (!colorGroups[c]) colorGroups[c] = [];
    colorGroups[c].push(f);
  });

  // Determine if there are same-color groups (for R&D comparison)
  const hasSameColorGroups = Object.values(colorGroups).some(g => g.length >= 2);

  // ========== Build R&D Scorecard for Same-Color Groups ==========
  function renderColorGroupScorecard(groupColor, groupFormulas) {
    if (groupFormulas.length < 2) return '';
    // Score each formula on ΔE (lower = better), eval rating
    const scored = groupFormulas.map(f => {
      const dE = parseFloat((f.properties || {}).spectrophotometer?.['\u0394E'] || '99');
      const evalMatch = (f.evaluation || '').match(/★+[☆★]/);
      const starCount = evalMatch ? (evalMatch[0].match(/★/g) || []).length : 0;
      return { formula: f, dE, stars: starCount };
    });
    scored.sort((a, b) => a.dE - b.dE || b.stars - a.stars); // lower ΔE = better

    return `
      <div class="color-scorecard mb-20">
        <div class="scorecard-header">
          <span class="color-dot" style="background:${COLOR_MAP[groupColor] || '#94a3b8'};"></span>
          <strong>${groupColor}色 · 研发比选</strong>
          <span class="text-muted">（${groupFormulas.length} 个候选配方）</span>
        </div>
        <div class="scorecard-grid">
          ${scored.map((item, i) => {
            const badge = i === 0 ? '<span class="recommend-badge">🏆 推荐</span>' : '';
            const f = item.formula;
            return `
              <div class="scorecard-item ${i === 0 ? 'recommended' : ''}">
                <div class="sc-rank">#${i + 1} ${badge}</div>
                <div class="sc-name">${escHtml(f.name)}</div>
                <div class="sc-details">
                  ${f.substrate ? `<span>基材: ${escHtml(f.substrate)}</span>` : ''}
                  <span>ΔE: <strong>${item.dE === 99 ? '-' : item.dE}</strong></span>
                  ${f.properties?.viscosity?.value ? `<span>粘度: ${f.properties.viscosity.value} ${f.properties.viscosity.unit || 'mPa·s'}</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ========== Single color group comparison table ==========
  function renderColorGroupTable(groupFormulas) {
    if (groupFormulas.length < 2) return '';
    
    const catOrder = ['溶剂', '助剂', '树脂', '色浆'];
    const ingByCat = {};
    catOrder.forEach(c => { ingByCat[c] = new Set(); });
    groupFormulas.forEach(f => {
      (f.ingredients || []).forEach(ing => {
        if (ingByCat[ing.category]) ingByCat[ing.category].add(ing.name);
      });
    });

    return `
      <div class="card mb-20">
        <div class="card-header"><h3>成分差异对比</h3></div>
        <div class="table-wrap workbench-compare-table">
          <table>
            <thead>
              <tr>
                <th>原料</th>
                ${groupFormulas.map(f => `<th>${escHtml(f.name)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${catOrder.map(cat => {
                const names = [...ingByCat[cat]];
                if (names.length === 0) return '';
                // Find which ingredient ratios differ across formulas
                const diffNames = names.filter(name => {
                  const vals = groupFormulas.map(f => {
                    const ing = (f.ingredients || []).find(i => i.name === name);
                    return ing?.ratio || '-';
                  });
                  return new Set(vals).size > 1; // at least one formula differs
                });
                const sameNames = names.filter(n => !diffNames.includes(n));
                
                let html = `<tr style="background:#f8fafc;"><td colspan="${groupFormulas.length + 1}" style="font-weight:700;font-size:0.8rem;padding:6px 12px;">
                  <span class="tag tag-${CATEGORY_COLORS[cat]}">${cat}</span>
                </td></tr>`;

                // Show differing ingredients first (highlighted)
                diffNames.forEach(name => {
                  const firstIng = groupFormulas.reduce((found, f) => found || (f.ingredients || []).find(i => i.name === name), null);
                  const displayLabel = firstIng ? matDisplayLabel(firstIng) : escHtml(name);
                  const codeSuffix = isAdmin() && firstIng?.code ? ` <span style="font-size:0.68rem;color:var(--primary);font-family:var(--font-mono);">[${escHtml(firstIng.code)}]</span>` : '';
                  html += `
                  <tr class="diff-row">
                    <td style="padding-left:16px;">${displayLabel}${codeSuffix} <span class="diff-dot">●</span></td>
                    ${groupFormulas.map(f => {
                      const ing = (f.ingredients || []).find(i => i.name === name);
                      return `<td class="diff-cell">${ing ? ing.ratio || '-' : '<span class="text-muted">-</span>'}</td>`;
                    }).join('')}
                  </tr>`;
                });

                // Show same ingredients (collapsed)
                sameNames.forEach(name => {
                  const firstIng = groupFormulas.reduce((found, f) => found || (f.ingredients || []).find(i => i.name === name), null);
                  const displayLabel = firstIng ? matDisplayLabel(firstIng) : escHtml(name);
                  const codeSuffix = isAdmin() && firstIng?.code ? ` <span style="font-size:0.68rem;color:var(--primary);font-family:var(--font-mono);">[${escHtml(firstIng.code)}]</span>` : '';
                  html += `
                  <tr>
                    <td style="padding-left:16px;">${displayLabel}${codeSuffix}</td>
                    ${groupFormulas.map(f => {
                      const ing = (f.ingredients || []).find(i => i.name === name);
                      return `<td>${ing ? ing.ratio || '-' : '<span class="text-muted">-</span>'}</td>`;
                    }).join('')}
                  </tr>`;
                });
                return html;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ========== Render Full Comparison ==========
  let html = '';

  // Color-grouped R&D summary
  if (hasSameColorGroups) {
    html += `
      <div class="card mb-16" style="background:linear-gradient(135deg,#fefce8,#f0fdf4);">
        <div class="card-header"><h3>🎯 同色配方比选</h3></div>
        <div class="card-body">
          ${Object.entries(colorGroups).filter(([c, g]) => g.length >= 2).map(([c, g]) => renderColorGroupScorecard(c, g)).join('')}
        </div>
      </div>
    `;
  }

  // Detail comparison tables (one per color group)
  Object.entries(colorGroups).forEach(([color, groupFormulas]) => {
    if (groupFormulas.length < 2) return;
    html += `
      <div class="color-group-section mb-24">
        <div class="color-group-header">
          <span class="color-dot" style="background:${COLOR_MAP[color] || '#94a3b8'};"></span>
          <h3>${color}色配方 — 横向对比</h3>
        </div>
        ${renderColorGroupTable(groupFormulas)}

        <!-- 物性数据对比 -->
        <div class="card mb-16">
          <div class="card-header"><h3>物性数据</h3></div>
          <div class="table-wrap workbench-compare-table">
            <table>
              <thead>
                <tr>
                  <th>项目</th>
                  ${groupFormulas.map(f => `<th>${escHtml(f.name)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                <tr><td>粘度</td>
                  ${groupFormulas.map(f => {
                    const v = (f.properties || {}).viscosity || {};
                    return `<td>${v.value ? v.value + ' ' + (v.unit || 'mPa·s') : '-'}</td>`;
                  }).join('')}
                </tr>
                <tr><td>表面张力</td>
                  ${groupFormulas.map(f => {
                    const v = (f.properties || {}).surfaceTension || {};
                    return `<td>${v.value ? v.value + ' ' + (v.unit || 'mN/m') : '-'}</td>`;
                  }).join('')}
                </tr>
                <tr style="${groupFormulas.some(f => (f.properties || {}).spectrophotometer?.['\u0394E'] && parseFloat(f.properties.spectrophotometer['\u0394E']) < 2) ? 'background:#f0fdf4;' : ''}">
                  <td><strong>ΔE (色差)</strong></td>
                  ${groupFormulas.map(f => {
                    const dE = (f.properties || {}).spectrophotometer?.['\u0394E'];
                    const val = dE ? dE : '-';
                    const cls = dE && parseFloat(dE) < 1 ? 'style="color:#16a34a;font-weight:700;"' : '';
                    return `<td ${cls}>${val}</td>`;
                  }).join('')}
                </tr>
                <tr><td>光度计 L*</td>
                  ${groupFormulas.map(f => `<td>${(f.properties || {}).spectrophotometer?.L || '-'}</td>`).join('')}
                </tr>
                <tr><td>光度计 a*</td>
                  ${groupFormulas.map(f => `<td>${(f.properties || {}).spectrophotometer?.a || '-'}</td>`).join('')}
                </tr>
                <tr><td>光度计 b*</td>
                  ${groupFormulas.map(f => `<td>${(f.properties || {}).spectrophotometer?.b || '-'}</td>`).join('')}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        ${groupFormulas.some(f => f.evaluation) ? `
        <div class="card mb-16">
          <div class="card-header"><h3>⭐ 配方评价</h3></div>
          <div class="table-wrap workbench-compare-table">
            <table>
              <thead><tr><th>项目</th>${groupFormulas.map(f => `<th>${escHtml(f.name)}</th>`).join('')}</tr></thead>
              <tbody><tr><td>评价</td>
                ${groupFormulas.map(f => `<td style="white-space:pre-wrap;font-size:0.82rem;max-width:250px;">${escHtml(f.evaluation || '-')}</td>`).join('')}
              </tr></tbody>
            </table>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  });

  // ========== Mixed-Color Groups (single formulas from different colors) ==========
  const singleColorFormulas = Object.entries(colorGroups).filter(([c, g]) => g.length === 1).flatMap(([c, g]) => g);
  if (singleColorFormulas.length >= 2) {
    html += `
      <div class="color-group-section mb-24">
        <div class="color-group-header">
          <span class="color-dot" style="background:#94a3b8;"></span>
          <h3>跨色配方参考对比</h3>
          <span class="text-muted">（${singleColorFormulas.length} 个不同颜色配方）</span>
        </div>
        ${renderColorGroupTable(singleColorFormulas)}
        <div class="card">
          <div class="card-header"><h3>物性数据</h3></div>
          <div class="table-wrap workbench-compare-table">
            <table>
              <thead><tr><th>项目</th>${singleColorFormulas.map(f => `<th>${escHtml(f.name)}</th>`).join('')}</tr></thead>
              <tbody>
                <tr><td>颜色</td>${singleColorFormulas.map(f => `<td>${f.color || '-'}</td>`).join('')}</tr>
                <tr><td>粘度</td>${singleColorFormulas.map(f => {const v=(f.properties||{}).viscosity||{};return `<td>${v.value?v.value+' '+(v.unit||'mPa·s'):'-'}</td>`}).join('')}</tr>
                <tr><td>表面张力</td>${singleColorFormulas.map(f => {const v=(f.properties||{}).surfaceTension||{};return `<td>${v.value?v.value+' '+(v.unit||'mN/m'):'-'}</td>`}).join('')}</tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ========== Global Image Comparison ==========
  const allImgLabels = new Set();
  formulas.forEach(f => { (f.imageModules || []).forEach(img => allImgLabels.add(img.label)); });
  const hasImages = allImgLabels.size > 0;
  if (hasImages) {
    html += `
      <div class="card">
        <div class="card-header"><h3>图片对比</h3></div>
        <div class="card-body">
          ${[...allImgLabels].map(label => `
            <div class="mb-16">
              <h4 style="font-size:0.85rem;margin-bottom:8px;color:var(--text-secondary)">${escHtml(label)}</h4>
              <div class="workbench-image-grid">
                ${formulas.map(f => {
                  const img = (f.imageModules || []).find(i => i.label === label);
                  if (!img) return `<div class="img-item"><div class="lbl">${escHtml(f.name)}</div><div style="aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;background:#f1f5f9;color:#cbd5e1;">无图片</div></div>`;
                  return `
                    <div class="img-item">
                      <div class="lbl">${escHtml(f.name)}</div>
                      <img src="${img.dataUrl}" alt="${escHtml(label)}" style="cursor:zoom-in;" onclick="showImagePreview('${img.dataUrl.replace(/'/g, "\\'")}')">
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return html;
}
