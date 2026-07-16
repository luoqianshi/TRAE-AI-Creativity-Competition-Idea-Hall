// ========== 职业档案 Block 组件系统 ==========

const BLOCK_TYPES = {
  project: { label: '项目经历', icon: '&#128188;', color: '#4E46DC' },
  skill: { label: '技能', icon: '&#128295;', color: '#0DB8A8' },
  education: { label: '教育背景', icon: '&#127891;', color: '#E8990A' },
  certificate: { label: '证书奖项', icon: '&#127941;', color: '#DC5078' },
  review: { label: '工作复盘', icon: '&#128221;', color: '#6478B4' }
};

// 初始化 Block 编辑器
function initBlockEditor() {
  renderBlockList();
}

// 渲染 Block 列表
function renderBlockList() {
  const container = document.getElementById('blockList');
  if (!container) return;

  const blocks = getBlocks();

  if (blocks.length === 0) {
    container.innerHTML = `
      <div class="blocks-empty">
        <div class="blocks-empty-icon">&#128203;</div>
        <div class="blocks-empty-title">暂无档案内容</div>
        <div class="blocks-empty-desc">从左侧选择类型，手动添加你的职业经历</div>
      </div>
    `;
    return;
  }

  container.innerHTML = blocks.map(block => renderBlockItem(block)).join('');
}

// 渲染单个 Block
function renderBlockItem(block) {
  const typeInfo = BLOCK_TYPES[block.type] || BLOCK_TYPES.project;

  return `
    <div class="block-item" data-id="${block.id}" data-type="${block.type}">
      <div class="block-header">
        <span class="block-icon" style="color:${typeInfo.color}">${typeInfo.icon}</span>
        <span class="block-type-label">${typeInfo.label}</span>
        <div class="block-actions">
          <button onclick="editBlock('${block.id}')" title="编辑">&#9998;</button>
          <button onclick="deleteBlock('${block.id}')" title="删除">&times;</button>
        </div>
      </div>
      <div class="block-content">
        ${renderBlockContent(block)}
      </div>
      ${block.tags?.length ? `
        <div class="block-tags">
          ${block.tags.map(t => `<span class="block-tag">${t}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// 根据类型渲染 Block 内容
function renderBlockContent(block) {
  switch (block.type) {
    case 'project':
      return `
        <div class="block-project">
          <div class="block-project-name">${block.name || '未命名项目'}</div>
          <div class="block-project-role">${block.role || ''}</div>
          <div class="block-project-time">${block.startDate || ''} ~ ${block.endDate || '至今'}</div>
          <div class="block-project-desc">${block.description || ''}</div>
          ${block.star && (block.star.s || block.star.t || block.star.a || block.star.r) ? `
            <div class="block-project-star">
              <div class="block-project-star-header">
                <span class="block-project-star-icon">⭐</span>
                <span class="block-project-star-title">STAR 成果</span>
              </div>
              <div class="block-project-star-grid">
                ${block.star.s ? `
                  <div class="block-project-star-item">
                    <div class="block-project-star-label">S</div>
                    <div class="block-project-star-content">${block.star.s}</div>
                  </div>
                ` : ''}
                ${block.star.t ? `
                  <div class="block-project-star-item">
                    <div class="block-project-star-label">T</div>
                    <div class="block-project-star-content">${block.star.t}</div>
                  </div>
                ` : ''}
                ${block.star.a ? `
                  <div class="block-project-star-item">
                    <div class="block-project-star-label">A</div>
                    <div class="block-project-star-content">${block.star.a}</div>
                  </div>
                ` : ''}
                ${block.star.r ? `
                  <div class="block-project-star-item">
                    <div class="block-project-star-label">R</div>
                    <div class="block-project-star-content">${block.star.r}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          ${block.achievements?.length ? `
            <div class="block-project-achievements">
              ${block.achievements.map(a => `<div class="achievement-tag">${a}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    case 'skill':
      return `
        <div class="block-skill">
          <div class="block-skill-name">${block.name || '未命名技能'}</div>
          <div class="block-skill-level">
            <div class="skill-level-bar">
              <div class="skill-level-fill" style="width:${(block.level || 3) * 20}%;background:${getLevelColor(block.level || 3)}"></div>
            </div>
            <span class="skill-level-label">${getLevelLabel(block.level || 3)}</span>
          </div>
          <div class="block-skill-desc">${block.description || ''}</div>
        </div>
      `;
    case 'education':
      return `
        <div class="block-education">
          <div class="block-edu-school">${block.school || ''}</div>
          <div class="block-edu-major">${block.major || ''} ${block.degree ? `· ${block.degree}` : ''}</div>
          <div class="block-edu-time">${block.startDate || ''} ~ ${block.endDate || ''}</div>
        </div>
      `;
    case 'certificate':
      return `
        <div class="block-certificate">
          <div class="block-cert-name">${block.name || ''}</div>
          <div class="block-cert-org">${block.organization || ''}</div>
          <div class="block-cert-date">${block.date || ''}</div>
        </div>
      `;
    case 'review':
      return `
        <div class="block-review">
          <div class="block-review-title">${block.title || '工作复盘'}</div>
          <div class="block-review-date">${block.date || ''}</div>
          <div class="block-review-content">${block.content?.substring(0, 200) || ''}...</div>
        </div>
      `;
    default:
      return `<div class="block-generic">${block.content || ''}</div>`;
  }
}

// 获取熟练度颜色
function getLevelColor(level) {
  const colors = ['#DC5078', '#E8990A', '#F0A028', '#0DB8A8', '#4E46DC'];
  return colors[Math.min(level - 1, 4)] || colors[2];
}

// 获取熟练度标签
function getLevelLabel(level) {
  const labels = ['入门', '熟悉', '掌握', '精通', '专家'];
  return labels[Math.min(level - 1, 4)] || '掌握';
}

// 显示添加 Block 表单
function showAddBlockForm(type) {
  const modal = document.getElementById('blockFormModal');
  if (!modal) return;

  const typeInfo = BLOCK_TYPES[type];
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3><span style="color:${typeInfo.color}">${typeInfo.icon}</span> 添加${typeInfo.label}</h3>
        <button class="modal-close" onclick="closeBlockForm()">&times;</button>
      </div>
      <div class="modal-body">
        ${getBlockFormFields(type)}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeBlockForm()">取消</button>
        <button class="btn-primary" onclick="saveBlock('${type}')">保存</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

// 辅助函数：安全地获取 HTML 属性值
function escValue(val) {
  if (!val) return '';
  return String(val).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 获取 Block 表单字段（支持预填充现有数据）
function getBlockFormFields(type, existingBlock) {
  const b = existingBlock || {};
  const tagsValue = b.tags && b.tags.length > 0 ? escValue(b.tags.join(', ')) : '';

  const commonFields = `
    <div class="form-group">
      <label class="form-label">标签（用逗号分隔）</label>
      <input type="text" class="form-input" id="blockTags" value="${tagsValue}" placeholder="例如：前端, React, 电商">
    </div>
  `;

  switch (type) {
    case 'project':
      const achievementsValue = b.achievements ? escValue(Array.isArray(b.achievements) ? b.achievements.join('\n') : b.achievements) : '';
      return `
        <div class="form-group">
          <label class="form-label">项目名称 *</label>
          <input type="text" class="form-input" id="projectName" value="${escValue(b.name)}" placeholder="例如：电商平台重构">
        </div>
        <div class="form-group">
          <label class="form-label">担任角色</label>
          <input type="text" class="form-input" id="projectRole" value="${escValue(b.role)}" placeholder="例如：前端负责人">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">开始时间</label>
            <input type="month" class="form-input" id="projectStart" value="${escValue(b.startDate)}">
          </div>
          <div class="form-group">
            <label class="form-label">结束时间</label>
            <input type="month" class="form-input" id="projectEnd" value="${escValue(b.endDate)}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">项目描述</label>
          <textarea class="form-textarea" id="projectDesc" rows="3" placeholder="描述项目背景、你的职责...">${escValue(b.description)}</textarea>
        </div>
        <div class="form-star-section">
          <div class="form-star-header">
            <span class="form-star-icon">⭐</span>
            <span class="form-star-title">STAR 结构化成果</span>
            <span class="form-star-desc">使用STAR法则清晰展示你的贡献</span>
          </div>
          <div class="form-star-grid">
            <div class="form-star-item">
              <div class="form-star-label">S</div>
              <div class="form-star-label-full">Situation（背景）</div>
              <textarea class="form-textarea" id="projectStarS" rows="2" placeholder="描述项目所处的背景和挑战">${escValue(b.star?.s || '')}</textarea>
            </div>
            <div class="form-star-item">
              <div class="form-star-label">T</div>
              <div class="form-star-label-full">Task（任务）</div>
              <textarea class="form-textarea" id="projectStarT" rows="2" placeholder="你负责的具体任务和目标">${escValue(b.star?.t || '')}</textarea>
            </div>
            <div class="form-star-item">
              <div class="form-star-label">A</div>
              <div class="form-star-label-full">Action（行动）</div>
              <textarea class="form-textarea" id="projectStarA" rows="3" placeholder="你采取了哪些具体行动">${escValue(b.star?.a || '')}</textarea>
            </div>
            <div class="form-star-item">
              <div class="form-star-label">R</div>
              <div class="form-star-label-full">Result（结果）</div>
              <textarea class="form-textarea" id="projectStarR" rows="3" placeholder="取得了什么成果，尽量量化">${escValue(b.star?.r || '')}</textarea>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">其他成果（每行一条）</label>
          <textarea class="form-textarea" id="projectAchievements" rows="2" placeholder="例如：
- 页面加载速度提升40%
- 用户转化率提升15%">${achievementsValue}</textarea>
        </div>
        ${commonFields}
      `;
    case 'skill':
      const skillLevel = b.level || 3;
      return `
        <div class="form-group">
          <label class="form-label">技能名称 *</label>
          <input type="text" class="form-input" id="skillName" value="${escValue(b.name)}" placeholder="例如：React">
        </div>
        <div class="form-group">
          <label class="form-label">熟练度</label>
          <div class="skill-level-selector">
            ${[1, 2, 3, 4, 5].map(l => `
              <button type="button" class="skill-level-option ${l === skillLevel ? 'active' : ''}" data-level="${l}" onclick="selectSkillLevel(${l})">
                ${'★'.repeat(l)}
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="skillLevel" value="${skillLevel}">
        </div>
        <div class="form-group">
          <label class="form-label">技能描述</label>
          <textarea class="form-textarea" id="skillDesc" rows="2" placeholder="描述你在该技能上的经验...">${escValue(b.description)}</textarea>
        </div>
        ${commonFields}
      `;
    case 'education':
      return `
        <div class="form-group">
          <label class="form-label">学校 *</label>
          <input type="text" class="form-input" id="eduSchool" value="${escValue(b.school)}" placeholder="例如：北京大学">
        </div>
        <div class="form-group">
          <label class="form-label">专业</label>
          <input type="text" class="form-input" id="eduMajor" value="${escValue(b.major)}" placeholder="例如：计算机科学">
        </div>
        <div class="form-group">
          <label class="form-label">学位</label>
          <select class="form-select" id="eduDegree">
            <option value="">请选择</option>
            <option value="本科" ${b.degree === '本科' ? 'selected' : ''}>本科</option>
            <option value="硕士" ${b.degree === '硕士' ? 'selected' : ''}>硕士</option>
            <option value="博士" ${b.degree === '博士' ? 'selected' : ''}>博士</option>
            <option value="大专" ${b.degree === '大专' ? 'selected' : ''}>大专</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">入学时间</label>
            <input type="month" class="form-input" id="eduStart" value="${escValue(b.startDate)}">
          </div>
          <div class="form-group">
            <label class="form-label">毕业时间</label>
            <input type="month" class="form-input" id="eduEnd" value="${escValue(b.endDate)}">
          </div>
        </div>
        ${commonFields}
      `;
    case 'certificate':
      return `
        <div class="form-group">
          <label class="form-label">证书名称 *</label>
          <input type="text" class="form-input" id="certName" value="${escValue(b.name)}" placeholder="例如：PMP项目管理认证">
        </div>
        <div class="form-group">
          <label class="form-label">颁发机构</label>
          <input type="text" class="form-input" id="certOrg" value="${escValue(b.organization)}" placeholder="例如：PMI">
        </div>
        <div class="form-group">
          <label class="form-label">获得时间</label>
          <input type="month" class="form-input" id="certDate" value="${escValue(b.date)}">
        </div>
        ${commonFields}
      `;
    case 'review':
      return `
        <div class="form-group">
          <label class="form-label">复盘标题</label>
          <input type="text" class="form-input" id="reviewTitle" value="${escValue(b.title)}" placeholder="例如：Q3季度工作复盘">
        </div>
        <div class="form-group">
          <label class="form-label">复盘日期</label>
          <input type="date" class="form-input" id="reviewDate" value="${escValue(b.date)}">
        </div>
        <div class="form-group">
          <label class="form-label">复盘内容</label>
          <textarea class="form-textarea" id="reviewContent" rows="6" placeholder="使用STAR法则记录：
Situation（背景）
Task（任务）
Action（行动）
Result（结果）">${escValue(b.content)}</textarea>
        </div>
        ${commonFields}
      `;
    default:
      return '';
  }
}

// 选择技能熟练度
function selectSkillLevel(level) {
  document.querySelectorAll('.skill-level-option').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
  });
  document.getElementById('skillLevel').value = level;
}

// 保存 Block（支持创建和编辑）
function saveBlock(type, editId) {
  const block = editId
    ? { id: editId, type, createdAt: getBlocks().find(b => b.id === editId)?.createdAt, updatedAt: new Date().toISOString() }
    : { id: generateId(), type, createdAt: new Date().toISOString() };

  switch (type) {
    case 'project':
      block.name = document.getElementById('projectName')?.value;
      block.role = document.getElementById('projectRole')?.value;
      block.startDate = document.getElementById('projectStart')?.value;
      block.endDate = document.getElementById('projectEnd')?.value;
      block.description = document.getElementById('projectDesc')?.value;
      block.achievements = document.getElementById('projectAchievements')?.value?.split('\n').filter(a => a.trim());
      block.star = {
        s: document.getElementById('projectStarS')?.value?.trim(),
        t: document.getElementById('projectStarT')?.value?.trim(),
        a: document.getElementById('projectStarA')?.value?.trim(),
        r: document.getElementById('projectStarR')?.value?.trim()
      };
      break;
    case 'skill':
      block.name = document.getElementById('skillName')?.value;
      block.level = parseInt(document.getElementById('skillLevel')?.value || 3);
      block.description = document.getElementById('skillDesc')?.value;
      break;
    case 'education':
      block.school = document.getElementById('eduSchool')?.value;
      block.major = document.getElementById('eduMajor')?.value;
      block.degree = document.getElementById('eduDegree')?.value;
      block.startDate = document.getElementById('eduStart')?.value;
      block.endDate = document.getElementById('eduEnd')?.value;
      block.name = block.school; // 兼容现有逻辑
      break;
    case 'certificate':
      block.name = document.getElementById('certName')?.value;
      block.organization = document.getElementById('certOrg')?.value;
      block.date = document.getElementById('certDate')?.value;
      break;
    case 'review':
      block.title = document.getElementById('reviewTitle')?.value;
      block.date = document.getElementById('reviewDate')?.value;
      block.content = document.getElementById('reviewContent')?.value;
      block.name = block.title; // 兼容现有逻辑
      break;
  }

  // 标签
  const tagsStr = document.getElementById('blockTags')?.value;
  if (tagsStr) block.tags = tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t);

  // 验证必填项
  if (!validateBlock(block)) return;

  if (editId) {
    // 更新现有 Block
    const blocks = getBlocks();
    const idx = blocks.findIndex(b => b.id === editId);
    if (idx !== -1) {
      blocks[idx] = block;
      localStorage.setItem('careerBlocks', JSON.stringify(blocks));
    }
  } else {
    // 新建 Block
    const blocks = getBlocks();
    blocks.push(block);
    localStorage.setItem('careerBlocks', JSON.stringify(blocks));
  }

  closeBlockForm();
  renderBlockList();
}

// 验证 Block
function validateBlock(block) {
  if (!block.name && block.type !== 'review') {
    alert('请填写名称');
    return false;
  }
  return true;
}

// 编辑 Block
function editBlock(id) {
  const blocks = getBlocks();
  const block = blocks.find(b => b.id === id);
  if (!block) return;

  const modal = document.getElementById('blockFormModal');
  if (!modal) return;

  const typeInfo = BLOCK_TYPES[block.type];
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3><span style="color:${typeInfo.color}">${typeInfo.icon}</span> 编辑${typeInfo.label}</h3>
        <button class="modal-close" onclick="closeBlockForm()">&times;</button>
      </div>
      <div class="modal-body">
        ${getBlockFormFields(block.type, block)}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeBlockForm()">取消</button>
        <button class="btn-primary" onclick="saveBlock('${block.type}', '${block.id}')">保存</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

// 更新现有 Block
function updateBlock(block, id) {
  const blocks = getBlocks();
  const idx = blocks.findIndex(b => b.id === id);
  if (idx === -1) return;

  // 保留原始创建时间和ID
  block.id = id;
  block.createdAt = blocks[idx].createdAt;
  block.updatedAt = new Date().toISOString();

  blocks[idx] = block;
  localStorage.setItem('careerBlocks', JSON.stringify(blocks));
}

// Block 类型信息（用于表单渲染）
const BLOCK_TYPES_INFO = BLOCK_TYPES;

// 删除 Block
function deleteBlock(id) {
  if (!confirm('确定要删除这条记录吗？')) return;
  const blocks = getBlocks().filter(b => b.id !== id);
  localStorage.setItem('careerBlocks', JSON.stringify(blocks));
  renderBlockList();
}

// 关闭表单
function closeBlockForm() {
  const modal = document.getElementById('blockFormModal');
  if (modal) modal.style.display = 'none';
}

// 获取所有 Blocks
function getBlocks() {
  return JSON.parse(localStorage.getItem('careerBlocks') || '[]');
}

// 获取特定类型的 Blocks
function getBlocksByType(type) {
  return getBlocks().filter(b => b.type === type);
}

// 获取与技能相关的 Blocks
function getBlocksBySkill(skillName) {
  return getBlocks().filter(b =>
    (b.tags || []).includes(skillName) ||
    b.name === skillName
  );
}
