class NovelAnalyzer {
  constructor() {
    this.textEditor = document.getElementById('textEditor');
    this.analyzeBtn = document.getElementById('analyzeBtn');
    this.rewriteBtn = document.getElementById('rewriteBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.textStatus = document.getElementById('textStatus');
    this.loadingIndicator = document.getElementById('loadingIndicator');
    this.worldviewContent = document.getElementById('worldviewContent');
    this.charactersGrid = document.getElementById('charactersGrid');
    this.styleTags = document.getElementById('styleTags');
    this.rewriteInput = document.getElementById('rewriteInput');
    
    this.confidenceSection = document.getElementById('confidenceSection');
    this.confidenceBar = document.getElementById('confidenceBar');
    this.confidencePercentage = document.getElementById('confidencePercentage');
    this.confidenceMessage = document.getElementById('confidenceMessage');
    
    this.originalText = '';
    this.currentAnalysis = null;
    this.currentConfidence = 0;
    this.sessionId = null;
    this.isRewriting = false;
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    this.textEditor.addEventListener('input', () => this.handleTextChange());
    this.analyzeBtn.addEventListener('click', () => this.analyzeText());
    this.rewriteBtn.addEventListener('click', () => this.rewriteText());
    this.resetBtn.addEventListener('click', () => this.resetAll());
    
    this.originalText = this.textEditor.value.trim();
  }
  
  handleTextChange() {
    const currentText = this.textEditor.value.trim();
    const isModified = currentText !== this.originalText;
    
    if (isModified) {
      this.textStatus.textContent = '已修改';
      this.textStatus.className = 'status status-modified';
      this.rewriteBtn.disabled = true;
    } else {
      this.textStatus.textContent = '未修改';
      this.textStatus.className = 'status status-idle';
      this.rewriteBtn.disabled = !this.currentAnalysis;
    }
  }
  
  async analyzeText() {
    const text = this.textEditor.value.trim();
    
    if (text.length < 100) {
      alert('请输入至少100字符的文本');
      return;
    }
    
    this.showLoading(true, '分析中...');
    this.analyzeBtn.disabled = true;
    
    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, sessionId: this.sessionId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.currentAnalysis = result.data;
        this.currentConfidence = result.confidence || 0;
        this.sessionId = result.sessionId;
        this.renderAnalysis(result.data);
        this.renderConfidence(result.confidence, result.statusMessage);
        this.originalText = text;
        this.textStatus.textContent = '分析完成';
        this.textStatus.className = 'status status-idle';
        this.rewriteBtn.disabled = false;
      } else {
        alert('分析失败: ' + result.error);
      }
    } catch (error) {
      console.error('分析错误:', error);
      alert('分析失败，请检查服务器是否正常运行');
    } finally {
      this.showLoading(false);
      this.analyzeBtn.disabled = false;
    }
  }
  
  renderConfidence(confidence, message) {
    this.confidenceSection.style.display = 'block';
    
    this.confidenceBar.style.width = `${confidence}%`;
    
    let barClass = 'medium';
    let messageClass = 'warning';
    if (confidence >= 90) {
      barClass = 'high';
      messageClass = 'success';
    } else if (confidence < 60) {
      barClass = 'low';
      messageClass = 'error';
    }
    
    this.confidenceBar.className = `confidence-bar ${barClass}`;
    this.confidencePercentage.textContent = `${confidence}%`;
    this.confidenceMessage.textContent = message;
    this.confidenceMessage.className = `confidence-message ${messageClass}`;
  }
  
  async rewriteText() {
    if (this.isRewriting) return;
    
    const originalText = this.textEditor.value.trim();
    const userModification = this.rewriteInput.value.trim();
    
    if (!userModification) {
      alert('请输入续写要求');
      return;
    }
    
    if (!this.currentAnalysis) {
      alert('请先分析文本');
      return;
    }
    
    this.isRewriting = true;
    this.rewriteBtn.disabled = true;
    this.analyzeBtn.disabled = true;
    
    this.showLoading(true, '重构剧情中...');
    
    this.createRewriteResultSection();
    
    try {
      const response = await fetch('/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText,
          userModification,
          worldModel: this.currentAnalysis,
          sessionId: this.sessionId
        })
      });
      
      this.handleStreamResponse(response);
    } catch (error) {
      console.error('续写错误:', error);
      alert('续写失败，请检查服务器是否正常运行');
      this.isRewriting = false;
      this.showLoading(false);
      this.rewriteBtn.disabled = false;
      this.analyzeBtn.disabled = false;
    }
  }
  
  handleStreamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let resultContent = '';
    let resultContainer = document.getElementById('rewriteResultContent');
    let cursor = document.getElementById('typewriterCursor');
    
    const processChunk = async () => {
      try {
        const { done, value } = await reader.read();
        
        if (done) {
          this.isRewriting = false;
          this.showLoading(false);
          this.rewriteBtn.disabled = false;
          this.analyzeBtn.disabled = false;
          if (cursor) cursor.remove();
          return;
        }
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            try {
              const jsonStr = line.substring(5).trim();
              const data = JSON.parse(jsonStr);
              
              if (data.error) {
                alert('续写失败: ' + data.error);
                this.isRewriting = false;
                this.showLoading(false);
                this.rewriteBtn.disabled = false;
                this.analyzeBtn.disabled = false;
                return;
              }
              
              if (data.content === '[DONE]') {
                this.isRewriting = false;
                this.showLoading(false);
                this.rewriteBtn.disabled = false;
                this.analyzeBtn.disabled = false;
                if (cursor) cursor.remove();
                return;
              }
              
              if (data.content) {
                resultContent += data.content;
                resultContainer.innerHTML = this.escapeHtml(resultContent);
                resultContainer.scrollTop = resultContainer.scrollHeight;
              }
            } catch (e) {
              console.warn('解析错误:', e.message);
            }
          }
        }
        
        await processChunk();
      } catch (error) {
        console.error('流处理错误:', error);
        this.isRewriting = false;
        this.showLoading(false);
        this.rewriteBtn.disabled = false;
        this.analyzeBtn.disabled = false;
      }
    };
    
    processChunk();
  }
  
  createRewriteResultSection() {
    const panelContent = document.querySelector('.panel-left .panel-content');
    let resultSection = document.getElementById('rewriteResultSection');
    
    if (resultSection) {
      resultSection.remove();
    }
    
    resultSection = document.createElement('div');
    resultSection.id = 'rewriteResultSection';
    resultSection.className = 'rewrite-result-section';
    
    resultSection.innerHTML = `
      <h3 class="rewrite-result-title">
        <span>✨</span>
        续写结果
      </h3>
      <div id="rewriteResultContent" class="rewrite-result-content">
        <span id="typewriterCursor" class="typewriter-cursor"></span>
      </div>
    `;
    
    panelContent.parentNode.insertBefore(resultSection, panelContent.nextSibling);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  showLoading(show, text = '分析中...') {
    this.loadingIndicator.style.display = show ? 'flex' : 'none';
    this.loadingIndicator.querySelector('span').textContent = text;
    this.analyzeBtn.style.display = show ? 'none' : 'inline-flex';
    this.rewriteBtn.style.display = show ? 'none' : 'inline-flex';
  }
  
  renderAnalysis(data) {
    this.renderWorldview(data.Worldview);
    this.renderCharacters(data.Characters);
    this.renderStyleProfile(data.StyleProfile);
    this.renderPlotNode(data.CurrentPlotNode);
  }
  
  renderWorldview(worldview) {
    if (!worldview) {
      this.worldviewContent.innerHTML = '<div class="placeholder">暂无世界观设定</div>';
      return;
    }
    
    this.worldviewContent.innerHTML = `
      <div class="worldview-grid">
        <div class="worldview-item">
          <span class="worldview-label">流派</span>
          <span class="worldview-value">${worldview.genre || '未知'}</span>
        </div>
        <div class="worldview-item">
          <span class="worldview-label">力量体系</span>
          <span class="worldview-value">${worldview.power_system || '未知'}</span>
        </div>
        <div class="worldview-item">
          <span class="worldview-label">时代背景</span>
          <span class="worldview-value">${worldview.setting || '未知'}</span>
        </div>
        <div class="worldview-item">
          <span class="worldview-label">整体基调</span>
          <span class="worldview-value">${worldview.tone || '未知'}</span>
        </div>
      </div>
    `;
  }
  
  renderCharacters(characters) {
    if (!characters || characters.length === 0) {
      this.charactersGrid.innerHTML = '<div class="placeholder">暂无人物信息</div>';
      return;
    }
    
    this.charactersGrid.innerHTML = characters.map(char => `
      <div class="character-card">
        <div class="character-header">
          <div class="character-name">${char.name || '未知'}</div>
          <div class="character-role-badge">${char.role || '未知'}</div>
        </div>
        <div class="character-traits">
          ${char.personality_core && char.personality_core.length > 0 
            ? char.personality_core.map(trait => `<span class="trait-tag">${trait}</span>`).join('')
            : '<span class="trait-tag unknown">暂无性格特征</span>'}
        </div>
        ${char.speech_style && char.speech_style !== '未知' ? `
          <div class="character-speech">
            <span class="speech-label">语言风格：</span>
            <span class="speech-value">${char.speech_style}</span>
          </div>
        ` : ''}
        ${char.key_relationships && char.key_relationships !== '未知' ? `
          <div class="character-relationships">
            <span class="relation-label">关系：</span>
            <span class="relation-value">${char.key_relationships}</span>
          </div>
        ` : ''}
      </div>
    `).join('');
  }
  
  renderStyleProfile(style) {
    if (!style) {
      this.styleTags.innerHTML = '<div class="placeholder">暂无文风分析</div>';
      return;
    }
    
    const styleItems = [
      { label: '用词特点', value: style.vocabulary },
      { label: '比喻习惯', value: style.metaphor_pattern },
      { label: '句式结构', value: style.sentence_structure },
      { label: '内心戏占比', value: style.inner_monologue_ratio }
    ];
    
    this.styleTags.innerHTML = styleItems.map(item => `
      <div class="style-item">
        <span class="style-label">${item.label}</span>
        <span class="style-value">${item.value || '未知'}</span>
      </div>
    `).join('');
  }
  
  renderPlotNode(plot) {
    const plotSection = document.getElementById('plotSection');
    if (plotSection) {
      plotSection.remove();
    }
    
    if (!plot) return;
    
    const worldPanel = document.querySelector('.world-panel');
    const section = document.createElement('div');
    section.id = 'plotSection';
    section.className = 'world-section';
    
    section.innerHTML = `
      <h3 class="section-title">
        <span class="section-icon">📖</span>
        当前剧情节点
      </h3>
      <div class="plot-content">
        <div class="plot-item">
          <span class="plot-label">主要冲突</span>
          <span class="plot-value">${plot.conflict || '未知'}</span>
        </div>
        <div class="plot-item">
          <span class="plot-label">是否转折</span>
          <span class="plot-value ${plot.turning_point ? 'turning-yes' : 'turning-no'}">
            ${plot.turning_point ? '是' : '否'}
          </span>
        </div>
        ${plot.potential_decisions && plot.potential_decisions.length > 0 ? `
          <div class="plot-decisions">
            <span class="plot-label">潜在选择</span>
            <div class="decision-list">
              ${plot.potential_decisions.map((decision, index) => `
                <span class="decision-item">${index + 1}. ${decision}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    worldPanel.appendChild(section);
  }
  
  resetAll() {
    this.textEditor.value = '';
    this.rewriteInput.value = '';
    this.originalText = '';
    this.currentAnalysis = null;
    this.currentConfidence = 0;
    this.sessionId = null;
    this.isRewriting = false;
    this.textStatus.textContent = '未修改';
    this.textStatus.className = 'status status-idle';
    this.confidenceSection.style.display = 'none';
    this.worldviewContent.innerHTML = '<div class="placeholder">点击"分析文本"按钮开始分析</div>';
    this.charactersGrid.innerHTML = '<div class="placeholder">等待分析结果...</div>';
    this.styleTags.innerHTML = '<div class="placeholder">等待分析结果...</div>';
    this.rewriteBtn.disabled = true;
    
    const plotSection = document.getElementById('plotSection');
    if (plotSection) plotSection.remove();
    
    const resultSection = document.getElementById('rewriteResultSection');
    if (resultSection) resultSection.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NovelAnalyzer();
});