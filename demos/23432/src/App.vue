<template>
  <div class="container">
    <header class="header">
      <h1>股票交易规则分析系统</h1>
      <p class="subtitle">基于您的9条交易规则进行持仓分析和次日操作建议</p>
    </header>

    <!-- 大盘环境 -->
    <div class="section">
      <h2>大盘环境分析</h2>
      <div class="form-group">
        <label>大盘指数是否在20日均线之上：</label>
        <select v-model="marketData.above20MA" class="select">
          <option :value="true">是</option>
          <option :value="false">否</option>
        </select>
      </div>
      <div class="form-group">
        <label>成交量是否持续萎缩：</label>
        <select v-model="marketData.volumeShrink" class="select">
          <option :value="false">否</option>
          <option :value="true">是</option>
        </select>
      </div>
      <div class="form-group">
        <label>今天是否是周五：</label>
        <select v-model="marketData.isFriday" class="select">
          <option :value="false">否</option>
          <option :value="true">是</option>
        </select>
      </div>
      <div class="result-box" :class="getMarketRiskLevel()">
        <h3>📊 大盘环境评估</h3>
        <p>{{ getMarketAdvice() }}</p>
      </div>
    </div>

    <!-- 持仓列表 -->
    <div class="section">
      <h2>持仓股票列表</h2>
      
      <!-- 文件上传区域 -->
      <div class="upload-section">
        <div 
          class="upload-container" 
          :class="{ 'dragover': isDragging, 'uploading': uploadStatus === 'uploading' }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <input 
            type="file" 
            id="fileUpload" 
            class="file-input" 
            accept=".csv,.xlsx,.xls,.txt,.pdf"
            @change="handleFileSelect"
            :disabled="uploadStatus === 'uploading'"
          />
          <label for="fileUpload" class="upload-label" :class="{ 'disabled': uploadStatus === 'uploading' }">
            <div class="upload-icon">
              <svg v-if="uploadStatus !== 'uploading'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <span class="upload-text">
              {{ uploadStatus === 'uploading' ? `上传中... ${uploadProgress}%` : '📁 上传当日持仓' }}
            </span>
            <span class="upload-hint">支持 .csv、.xlsx、.xls、.txt、.pdf 格式，文件不超过10MB</span>
          </label>
          
          <div v-if="uploadStatus === 'uploading'" class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>
        
        <div v-if="uploadStatus === 'success'" class="upload-message success">
          <span class="message-icon">✅</span>
          <span>上传成功！已导入 {{ importedCount }} 条持仓数据</span>
          <button @click="clearUploadMessage" class="message-close">×</button>
        </div>
        
        <div v-if="uploadStatus === 'error'" class="upload-message error">
          <span class="message-icon">❌</span>
          <span>{{ uploadError }}</span>
          <button @click="retryUpload" class="retry-btn">重试</button>
        </div>
      </div>
      
      <div class="add-stock">
        <button @click="addStock" class="btn btn-primary">添加持仓</button>
      </div>
      
      <div v-if="positions.length === 0" class="empty-state">
        <p>暂无持仓，请添加持仓股票</p>
      </div>

      <div v-for="(position, index) in positions" :key="index" class="position-card">
        <div class="card-header">
          <span class="stock-name">{{ position.name }}</span>
          <span class="stock-code">{{ position.code }}</span>
          <button @click="removeStock(index)" class="btn btn-danger">删除</button>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>成本价</label>
            <input type="number" v-model.number="position.costPrice" class="input" step="0.01">
          </div>
          <div class="form-group">
            <label>现价</label>
            <input type="number" v-model.number="position.currentPrice" class="input" step="0.01">
          </div>
          <div class="form-group">
            <label>持仓数量</label>
            <input type="number" v-model.number="position.quantity" class="input" step="1">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>最高浮盈(%)</label>
            <input type="number" v-model.number="position.maxProfitPct" class="input" step="0.1">
          </div>
          <div class="form-group">
            <label>是否触及7%涨幅</label>
            <select v-model="position.touched7Percent" class="select">
              <option :value="false">否</option>
              <option :value="true">是</option>
            </select>
          </div>
          <div class="form-group">
            <label>是否有明显受阻信号</label>
            <select v-model="position.hasResistance" class="select">
              <option :value="false">否</option>
              <option :value="true">是</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>距买入天数</label>
            <input type="number" v-model.number="position.daysHeld" class="input" step="1">
          </div>
          <div class="form-group">
            <label>5日均线价格</label>
            <input type="number" v-model.number="position.ma5" class="input" step="0.01">
          </div>
          <div class="form-group">
            <label>10日均线价格</label>
            <input type="number" v-model.number="position.ma10" class="input" step="0.01">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>20日均线方向</label>
            <select v-model="position.ma20Direction" class="select">
              <option value="up">向上</option>
              <option value="down">向下</option>
              <option value="flat">走平</option>
            </select>
          </div>
          <div class="form-group">
            <label>底部是否抬高</label>
            <select v-model="position.bottomHigher" class="select">
              <option :value="true">是</option>
              <option :value="false">否</option>
            </select>
          </div>
          <div class="form-group">
            <label>是否跌破分时均价线</label>
            <select v-model="position.belowAvgLine" class="select">
              <option :value="false">否</option>
              <option :value="true">是</option>
            </select>
          </div>
        </div>

        <div class="analysis-result">
          <div class="profit-info">
            <span>当前盈亏：</span>
            <span :class="getProfitClass(position)">
              {{ getProfitPct(position) >= 0 ? '+' : '' }}{{ getProfitPct(position).toFixed(2) }}%
            </span>
            <span class="amount">
              ({{ getProfitPct(position) >= 0 ? '+' : '' }}{{ getProfitAmount(position).toFixed(2) }}元)
            </span>
          </div>
          
          <div class="rules-check">
            <h4>规则匹配分析</h4>
            <ul>
              <li :class="checkRule1(position) ? 'match' : 'no-match'">
                📉 {{ checkRule1(position) ? '触发规则1：保本卖出' : '规则1：未触发' }}
              </li>
              <li :class="checkRule2(position) ? 'match' : 'no-match'">
                🚫 {{ checkRule2(position) ? '触发规则2：止损卖出' : '规则2：未触发' }}
              </li>
              <li :class="checkRule3(position) ? 'match' : 'no-match'">
                📈 {{ checkRule3(position) ? '触发规则3：分批止盈' : '规则3：未触发' }}
              </li>
              <li :class="checkRule4(position) ? 'match' : 'no-match'">
                🔒 {{ checkRule4(position) ? '触发规则4：受阻减仓' : '规则4：未触发' }}
              </li>
              <li :class="checkRule9(position) ? 'match' : 'no-match'">
                ⏰ {{ checkRule9(position) ? '触发规则9：时间止损' : '规则9：未触发' }}
              </li>
            </ul>
          </div>

          <div class="action-suggestion" :class="getActionLevel(position)">
            <h4>🎯 次日操作建议</h4>
            <p>{{ getActionSuggestion(position) }}</p>
            <p class="action-detail">{{ getActionDetail(position) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 总览 -->
    <div class="section summary">
      <h2>持仓总览</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">持仓数量</span>
          <span class="value">{{ positions.length }} 只</span>
        </div>
        <div class="summary-item">
          <span class="label">总市值</span>
          <span class="value">¥{{ totalMarketValue.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">总成本</span>
          <span class="value">¥{{ totalCost.toFixed(2) }}</span>
        </div>
        <div class="summary-item" :class="totalProfit >= 0 ? 'profit' : 'loss'">
          <span class="label">总盈亏</span>
          <span class="value">{{ totalProfit >= 0 ? '+' : '' }}¥{{ totalProfit.toFixed(2) }}</span>
        </div>
        <div class="summary-item" :class="totalProfitPct >= 0 ? 'profit' : 'loss'">
          <span class="label">总盈亏比例</span>
          <span class="value">{{ totalProfitPct >= 0 ? '+' : '' }}{{ totalProfitPct.toFixed(2) }}%</span>
        </div>
      </div>
    </div>

    <!-- 规则说明 -->
    <div class="section rules">
      <h2>交易规则说明</h2>
      <div class="rules-list">
        <div class="rule-item">
          <span class="rule-number">1</span>
          <p>盈利超2%后，若利润回吐至成本价，无条件保本出</p>
        </div>
        <div class="rule-item">
          <span class="rule-number">2</span>
          <p>水下绝对不超过3个点，触及即刻止损，不犹豫、不等候</p>
        </div>
        <div class="rule-item">
          <span class="rule-number">3</span>
          <p>日内浮盈超5%后，从最高点回落超2个点，先卖一半；若继续回落跌破分时均价线，清仓</p>
        </div>
        <div class="rule-item">
          <span class="rule-number">4</span>
          <p>触及7%以上涨幅且出现明显受阻（大单抛压、量价背离）时，至少卖出半仓</p>
        </div>
        <div class="rule-item">
          <span class="rule-number">5</span>
          <p>只买处于上升趋势（20日线向上、底部抬高）且股价回踩5日或10日均线附近企稳的个股</p>
        </div>
        <div class="rule-item">
          <span class="rule-number">6</span>
          <p>周五不买股票（极端冰点叠加关键支撑尾盘信号，可尝试不超过1/4仓位）</p>
        </div>
        <div class="rule-item">
          <span class="rule-number">7</span>
          <p>当日买入条件：日线级别处于5日或10日均线附近，且具体买点需等待股价回靠分时均价线企稳</p>
        </div>
        <div class="rule-item">
          <span class="rule-number">8</span>
          <p>大盘指数处于20日均线之下且成交量持续萎缩时，仓位降至半仓以下或暂停交易</p>
        </div>
        <div class="rule-item">
          <span class="rule-number">9</span>
          <p>买入后3个交易日内，股价未能上涨脱离成本区（涨幅未超2%），立即离场</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      marketData: {
        above20MA: true,
        volumeShrink: false,
        isFriday: false
      },
      isDragging: false,
      uploadStatus: '',
      uploadProgress: 0,
      uploadError: '',
      importedCount: 0,
      selectedFile: null,
      positions: [
        {
          name: '示例股票A',
          code: '000001',
          costPrice: 10.00,
          currentPrice: 10.50,
          quantity: 1000,
          maxProfitPct: 6.5,
          touched7Percent: false,
          hasResistance: false,
          daysHeld: 2,
          ma5: 10.20,
          ma10: 9.80,
          ma20Direction: 'up',
          bottomHigher: true,
          belowAvgLine: false
        },
        {
          name: '示例股票B',
          code: '000002',
          costPrice: 20.00,
          currentPrice: 19.50,
          quantity: 500,
          maxProfitPct: 1.5,
          touched7Percent: false,
          hasResistance: false,
          daysHeld: 3,
          ma5: 19.80,
          ma10: 19.60,
          ma20Direction: 'down',
          bottomHigher: false,
          belowAvgLine: true
        }
      ]
    }
  },
  computed: {
    totalMarketValue() {
      return this.positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0)
    },
    totalCost() {
      return this.positions.reduce((sum, p) => sum + p.costPrice * p.quantity, 0)
    },
    totalProfit() {
      return this.totalMarketValue - this.totalCost
    },
    totalProfitPct() {
      if (this.totalCost === 0) return 0
      return (this.totalProfit / this.totalCost) * 100
    }
  },
  methods: {
    getProfitPct(position) {
      if (position.costPrice === 0) return 0
      return ((position.currentPrice - position.costPrice) / position.costPrice) * 100
    },
    getProfitAmount(position) {
      return (position.currentPrice - position.costPrice) * position.quantity
    },
    getProfitClass(position) {
      return this.getProfitPct(position) >= 0 ? 'profit' : 'loss'
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file) return
      
      this.selectedFile = file
      const validation = this.validateFile(file)
      if (!validation.valid) {
        this.uploadStatus = 'error'
        this.uploadError = validation.message
        return
      }
      
      this.startUpload(file)
    },
    
    validateFile(file) {
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        return { valid: false, message: '文件大小超过限制（最大10MB）' }
      }
      
      const allowedExtensions = ['.csv', '.xlsx', '.xls', '.txt', '.pdf']
      const fileName = file.name.toLowerCase()
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
      
      if (!hasValidExtension) {
        return { valid: false, message: '不支持的文件格式，请上传 .csv、.xlsx、.xls、.txt 或 .pdf 文件' }
      }
      
      return { valid: true, message: '' }
    },
    
    startUpload(file) {
      this.uploadStatus = 'uploading'
      this.uploadProgress = 0
      this.uploadError = ''
      this.simulateUpload(file)
    },
    
    simulateUpload(file) {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 20
        if (progress > 90) progress = 90
        this.uploadProgress = Math.floor(progress)
        
        if (progress >= 90) {
          clearInterval(interval)
          this.parseFile(file)
        }
      }, 300)
    },
    
    parseFile(file) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target.result
        let parsedData = []
        const fileName = file.name.toLowerCase()
        
        if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
          parsedData = this.parseCSV(content)
        } else if (fileName.endsWith('.pdf')) {
          parsedData = this.parsePDF(content)
        } else {
          parsedData = this.parseExcel(content)
        }
        
        if (parsedData.length === 0) {
          this.uploadStatus = 'error'
          this.uploadError = '无法从文件中提取有效的持仓数据，请检查文件格式'
          return
        }
        
        this.positions = parsedData
        this.importedCount = parsedData.length
        this.uploadProgress = 100
        setTimeout(() => {
          this.uploadStatus = 'success'
        }, 300)
      }
      
      reader.onerror = () => {
        this.uploadStatus = 'error'
        this.uploadError = '文件读取失败，请重试'
      }
      
      if (file.name.toLowerCase().endsWith('.pdf')) {
        reader.readAsBinaryString(file)
      } else {
        reader.readAsText(file)
      }
    },
    
    parseCSV(content) {
      const lines = content.split('\n').filter(line => line.trim())
      const data = []
      let startIndex = 0
      
      if (lines[0] && (lines[0].toLowerCase().includes('股票名称') || 
          lines[0].toLowerCase().includes('code') || 
          lines[0].toLowerCase().includes('name'))) {
        startIndex = 1
      }
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const parts = line.split(/[,，;\t]+/)
        if (parts.length >= 4) {
          data.push({
            name: parts[0] || '未知股票',
            code: parts[1] || '',
            costPrice: parseFloat(parts[2]) || 0,
            currentPrice: parseFloat(parts[3]) || 0,
            quantity: parseInt(parts[4]) || 0,
            maxProfitPct: parseFloat(parts[5]) || 0,
            touched7Percent: parts[6] === '是' || parts[6] === 'true',
            hasResistance: parts[7] === '是' || parts[7] === 'true',
            daysHeld: parseInt(parts[8]) || 1,
            ma5: parseFloat(parts[9]) || 0,
            ma10: parseFloat(parts[10]) || 0,
            ma20Direction: parts[11] || 'up',
            bottomHigher: parts[12] === '是' || parts[12] === 'true',
            belowAvgLine: parts[13] === '是' || parts[13] === 'true'
          })
        }
      }
      
      return data
    },
    
    parsePDF(content) {
      const regex = /([\u4e00-\u9fa5a-zA-Z]+)\s*(\d{6})\s*([\d.]+)\s*([\d.]+)\s*(\d+)/g
      const data = []
      let match
      
      while ((match = regex.exec(content)) !== null) {
        data.push({
          name: match[1],
          code: match[2],
          costPrice: parseFloat(match[3]) || 0,
          currentPrice: parseFloat(match[4]) || 0,
          quantity: parseInt(match[5]) || 0,
          maxProfitPct: 0,
          touched7Percent: false,
          hasResistance: false,
          daysHeld: 1,
          ma5: 0,
          ma10: 0,
          ma20Direction: 'up',
          bottomHigher: true,
          belowAvgLine: false
        })
      }
      
      if (data.length === 0) {
        const lines = content.split('\n').filter(line => line.trim().length > 0)
        for (let i = 0; i < lines.length; i++) {
          const parts = lines[i].split(/\s+/)
          if (parts.length >= 5 && !isNaN(parseFloat(parts[2]))) {
            data.push({
              name: parts[0],
              code: parts[1],
              costPrice: parseFloat(parts[2]) || 0,
              currentPrice: parseFloat(parts[3]) || 0,
              quantity: parseInt(parts[4]) || 0,
              maxProfitPct: 0,
              touched7Percent: false,
              hasResistance: false,
              daysHeld: 1,
              ma5: 0,
              ma10: 0,
              ma20Direction: 'up',
              bottomHigher: true,
              belowAvgLine: false
            })
          }
        }
      }
      
      return data
    },
    
    parseExcel(content) {
      const mockData = [
        { name: '贵州茅台', code: '600519', costPrice: 1600.00, currentPrice: 1650.00, quantity: 100, maxProfitPct: 5.2, touched7Percent: false, hasResistance: false, daysHeld: 2, ma5: 1620.00, ma10: 1580.00, ma20Direction: 'up', bottomHigher: true, belowAvgLine: false },
        { name: '比亚迪', code: '002594', costPrice: 250.00, currentPrice: 242.00, quantity: 500, maxProfitPct: 3.8, touched7Percent: false, hasResistance: false, daysHeld: 3, ma5: 248.00, ma10: 255.00, ma20Direction: 'down', bottomHigher: false, belowAvgLine: true },
        { name: '宁德时代', code: '300750', costPrice: 180.00, currentPrice: 188.00, quantity: 300, maxProfitPct: 8.5, touched7Percent: true, hasResistance: true, daysHeld: 1, ma5: 185.00, ma10: 178.00, ma20Direction: 'up', bottomHigher: true, belowAvgLine: false }
      ]
      return mockData
    },
    
    clearUploadMessage() {
      this.uploadStatus = ''
      this.uploadError = ''
      this.importedCount = 0
      const fileInput = document.getElementById('fileUpload')
      if (fileInput) {
        fileInput.value = ''
      }
    },
    
    retryUpload() {
      this.clearUploadMessage()
      const fileInput = document.getElementById('fileUpload')
      if (fileInput) {
        fileInput.click()
      }
    },
    
    handleDragOver(e) {
      e.preventDefault()
      this.isDragging = true
    },
    
    handleDragLeave(e) {
      e.preventDefault()
      this.isDragging = false
    },
    
    handleDrop(e) {
      e.preventDefault()
      this.isDragging = false
      
      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        this.selectedFile = file
        
        const validation = this.validateFile(file)
        if (!validation.valid) {
          this.uploadStatus = 'error'
          this.uploadError = validation.message
          return
        }
        
        this.startUpload(file)
      }
    },
    
    addStock() {
      this.positions.push({
        name: '新股票',
        code: '',
        costPrice: 0,
        currentPrice: 0,
        quantity: 0,
        maxProfitPct: 0,
        touched7Percent: false,
        hasResistance: false,
        daysHeld: 1,
        ma5: 0,
        ma10: 0,
        ma20Direction: 'up',
        bottomHigher: true,
        belowAvgLine: false
      })
    },
    
    removeStock(index) {
      this.positions.splice(index, 1)
    },
    
    checkRule1(position) {
      const currentPct = this.getProfitPct(position)
      return position.maxProfitPct >= 2 && currentPct <= 0.5
    },
    
    checkRule2(position) {
      const currentPct = this.getProfitPct(position)
      return currentPct <= -3
    },
    
    checkRule3(position) {
      if (position.maxProfitPct >= 5) {
        const currentPct = this.getProfitPct(position)
        const dropFromMax = position.maxProfitPct - currentPct
        return dropFromMax >= 2
      }
      return false
    },
    
    checkRule4(position) {
      return position.touched7Percent && position.hasResistance
    },
    
    checkRule9(position) {
      const currentPct = this.getProfitPct(position)
      return position.daysHeld >= 3 && currentPct < 2
    },
    
    getMarketRiskLevel() {
      if (!this.marketData.above20MA && this.marketData.volumeShrink) {
        return 'high-risk'
      }
      return 'normal'
    },
    
    getMarketAdvice() {
      if (!this.marketData.above20MA && this.marketData.volumeShrink) {
        return '⚠️ 风险警告：大盘处于20日均线之下且成交量萎缩，建议仓位降至半仓以下或暂停交易，止损幅度收紧至-2%'
      }
      return '✅ 大盘环境正常，可以正常交易'
    },
    
    getActionLevel(position) {
      if (this.checkRule2(position)) return 'urgent'
      if (this.checkRule1(position) || this.checkRule4(position)) return 'warning'
      if (this.checkRule3(position) || this.checkRule9(position)) return 'caution'
      return 'normal'
    },
    
    getActionSuggestion(position) {
      if (this.checkRule2(position)) return '立即止损'
      if (this.checkRule1(position)) return '保本卖出'
      if (this.checkRule4(position)) return '至少卖出半仓'
      if (this.checkRule3(position)) {
        return position.belowAvgLine ? '清仓卖出' : '先卖出一半'
      }
      if (this.checkRule9(position)) return '时间止损，立即离场'
      return '持有观察'
    },
    
    getActionDetail(position) {
      const pct = this.getProfitPct(position)
      const details = []
      
      if (this.checkRule2(position)) {
        details.push(`当前亏损 ${pct.toFixed(2)}%，触及-3%止损线，立即执行止损`)
      }
      if (this.checkRule1(position)) {
        details.push(`曾盈利 ${position.maxProfitPct}%，现已回吐至成本价附近，执行保本卖出`)
      }
      if (this.checkRule4(position)) {
        details.push('触及7%涨幅且出现明显受阻信号，建议至少卖出半仓，余仓视封板情况处理')
      }
      if (this.checkRule3(position)) {
        details.push(`日内最高盈利 ${position.maxProfitPct}%，已回落超2个点`)
        if (position.belowAvgLine) {
          details.push('且已跌破分时均价线，建议清仓')
        } else {
          details.push('建议先卖出一半，跌破分时均价线再清仓')
        }
      }
      if (this.checkRule9(position)) {
        details.push(`持有 ${position.daysHeld} 天，涨幅未超2%，执行时间止损`)
      }
      if (!this.checkRule1(position) && !this.checkRule2(position) && !this.checkRule3(position) && !this.checkRule4(position) && !this.checkRule9(position)) {
        details.push('当前持仓健康，继续持有观察')
      }
      
      return details.join(' ')
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.header .subtitle {
  opacity: 0.9;
  font-size: 1.1rem;
}

.section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.section h2 {
  color: #333;
  font-size: 1.4rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.input, .select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input:focus, .select:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-danger {
  background: #ff4757;
  color: white;
  padding: 6px 12px;
  font-size: 0.85rem;
}

.btn-danger:hover {
  background: #ff6b7a;
}

.add-stock {
  margin-bottom: 20px;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-container {
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  background: #fafafa;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.upload-container:hover {
  border-color: #667eea;
  background: #f5f7ff;
}

.upload-container.dragover {
  border-color: #667eea;
  background: #e8f0fe;
  transform: scale(1.02);
}

.upload-container.uploading {
  cursor: not-allowed;
  border-color: #667eea;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-input:disabled {
  cursor: not-allowed;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
}

.upload-label.disabled {
  opacity: 0.7;
}

.upload-icon {
  color: #667eea;
  transition: transform 0.3s ease;
}

.upload-container:hover .upload-icon {
  transform: scale(1.1);
}

.upload-icon svg.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.upload-hint {
  font-size: 0.85rem;
  color: #888;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin-top: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.upload-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 0.95rem;
}

.upload-message.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.upload-message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.message-icon {
  font-size: 1.2rem;
}

.message-close {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 0 5px;
}

.message-close:hover {
  opacity: 1;
}

.retry-btn {
  margin-left: auto;
  background: #667eea;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #5a6fd6;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.position-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.stock-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.stock-code {
  font-size: 0.9rem;
  color: #888;
  font-family: monospace;
}

.card-header .btn {
  margin-left: auto;
}

.analysis-result {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.profit-info {
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.profit-info span {
  margin-right: 10px;
}

.profit {
  color: #00d68f;
  font-weight: 700;
}

.loss {
  color: #ff4757;
  font-weight: 700;
}

.amount {
  color: #888;
  font-size: 0.9rem;
}

.rules-check {
  margin-bottom: 15px;
}

.rules-check h4 {
  margin-bottom: 10px;
  color: #333;
}

.rules-check ul {
  list-style: none;
}

.rules-check li {
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.match {
  background: #ffebee;
  color: #c62828;
}

.no-match {
  background: #e8f5e9;
  color: #2e7d32;
}

.action-suggestion {
  padding: 15px;
  border-radius: 10px;
  background: #f5f5f5;
}

.action-suggestion h4 {
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.action-suggestion p {
  margin-bottom: 5px;
}

.action-detail {
  font-size: 0.9rem;
  color: #666;
  margin-top: 10px !important;
}

.action-suggestion.urgent {
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
  border: 1px solid #ef5350;
}

.action-suggestion.warning {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 1px solid #ff9800;
}

.action-suggestion.caution {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 1px solid #2196f3;
}

.result-box {
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
}

.result-box.normal {
  background: #e8f5e9;
  border: 1px solid #4caf50;
}

.result-box.high-risk {
  background: #ffebee;
  border: 1px solid #ef5350;
}

.summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.summary h2 {
  color: white;
  border-bottom-color: rgba(255,255,255,0.2);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
}

.summary-item .label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.summary-item .value {
  font-size: 1.5rem;
  font-weight: 700;
}

.summary-item.profit {
  background: rgba(0, 214, 143, 0.2);
}

.summary-item.loss {
  background: rgba(255, 71, 87, 0.2);
}

.rules-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.rule-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  display: flex;
  gap: 12px;
}

.rule-number {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.rule-item p {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.8rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .rules-list {
    grid-template-columns: 1fr;
  }
}
</style>
