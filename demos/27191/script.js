class OCRApp {
    constructor() {
        this.apiBase = '/';  // 使用相对路径，支持部署到任意域名
        this.selectedFile = null;
        this.trainProcess = null;
        this.history = { recognize: [], train: [] };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadHistory();
        this.checkServerStatus();
    }

    bindEvents() {
        // 导航切换
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 上传区域
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        
        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });

        // 移除图片
        document.getElementById('removeImageBtn').addEventListener('click', () => {
            this.removeImage();
        });

        // 识别按钮
        document.getElementById('recognizeBtn').addEventListener('click', () => {
            this.recognizeImage();
        });

        // 训练按钮
        document.getElementById('startTrainBtn').addEventListener('click', () => {
            this.startTraining();
        });
        document.getElementById('stopTrainBtn').addEventListener('click', () => {
            this.stopTraining();
        });

        // 历史记录标签切换
        document.querySelectorAll('.history-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchHistoryTab(e.target.dataset.history);
            });
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    }

    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('请上传有效的图片文件', 'error');
            return;
        }

        this.selectedFile = file;
        
        // 显示预览
        const previewContainer = document.getElementById('previewContainer');
        const previewImage = document.getElementById('previewImage');
        const uploadArea = document.getElementById('uploadArea');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadArea.style.display = 'none';
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.selectedFile = null;
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('resultContainer').style.display = 'none';
    }

    async recognizeImage() {
        if (!this.selectedFile) {
            this.showToast('请先上传图片', 'warning');
            return;
        }

        const recognizeType = document.querySelector('input[name="recognizeType"]:checked').value;
        const detectMultiple = document.getElementById('detectMultiple').checked;

        this.showLoading('正在识别...');

        try {
            const formData = new FormData();
            formData.append('image', this.selectedFile);
            
            const params = new URLSearchParams({
                type: recognizeType,
                detect: detectMultiple
            });

            const response = await fetch(`${this.apiBase}/api/ocr?${params}`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            this.hideLoading();

            if (result.success) {
                this.displayResult(result.data);
                this.addToHistory('recognize', {
                    type: recognizeType,
                    fileName: this.selectedFile.name,
                    result: result.data,
                    timestamp: new Date().toISOString()
                });
            } else {
                this.showToast(result.message || '识别失败', 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showToast('识别失败，请检查服务是否正常运行', 'error');
            console.error('识别错误:', error);
        }
    }

    displayResult(data) {
        const resultContainer = document.getElementById('resultContainer');
        const resultCard = document.getElementById('resultCard');
        
        let html = '';
        
        if (data.success) {
            html = `
                <div class="result-text">${data.text || '未识别到内容'}</div>
                <div class="result-confidence">置信度: ${(data.confidence * 100).toFixed(2)}%</div>
                <div class="result-details">
                    <div class="detail-row">
                        <span class="detail-label">识别类型</span>
                        <span class="detail-value">${this.getTypeLabel(data.category)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">推理时间</span>
                        <span class="detail-value">${(data.inference_time * 1000).toFixed(0)}ms</span>
                    </div>
                    ${data.plate_number ? `
                    <div class="detail-row">
                        <span class="detail-label">车牌号</span>
                        <span class="detail-value">${data.plate_number}</span>
                    </div>
                    ` : ''}
                    ${data.province_name ? `
                    <div class="detail-row">
                        <span class="detail-label">省份</span>
                        <span class="detail-value">${data.province_name}</span>
                    </div>
                    ` : ''}
                    ${data.plate_type_name ? `
                    <div class="detail-row">
                        <span class="detail-label">车牌类型</span>
                        <span class="detail-value">${data.plate_type_name}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            
            document.getElementById('inferenceTime').textContent = (data.inference_time * 1000).toFixed(0);
        } else {
            html = `
                <div style="color: var(--error-color); font-size: 1.2rem; font-weight: 500;">
                    <i class="fas fa-exclamation-circle"></i>
                    ${data.error || '识别失败'}
                </div>
            `;
        }
        
        resultCard.innerHTML = html;
        resultContainer.style.display = 'block';
    }

    getTypeLabel(type) {
        const labels = {
            plate: '车牌识别',
            container: '集装箱识别',
            train: '火车号识别'
        };
        return labels[type] || type;
    }

    async startTraining() {
        const trainType = document.getElementById('trainType').value;
        const trainTarget = document.getElementById('trainTarget').value;
        const epochs = parseInt(document.getElementById('epochs').value);
        const batchSize = parseInt(document.getElementById('batchSize').value);
        const learningRate = parseFloat(document.getElementById('learningRate').value);
        const numSamples = parseInt(document.getElementById('numSamples').value);

        this.showLoading('正在初始化训练...');
        
        // 显示训练进度区域
        document.getElementById('trainProgress').style.display = 'block';
        document.getElementById('startTrainBtn').style.display = 'none';
        document.getElementById('stopTrainBtn').style.display = 'block';
        
        // 重置进度
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressText').textContent = '0%';
        document.getElementById('progressStatus').textContent = '初始化...';
        document.getElementById('trainLog').textContent = '';
        document.getElementById('trainLoss').textContent = '-';
        document.getElementById('trainAccuracy').textContent = '-';
        document.getElementById('valLoss').textContent = '-';
        document.getElementById('valAccuracy').textContent = '-';

        this.hideLoading();

        // 模拟训练过程（实际项目中应调用后端训练接口）
        this.simulateTraining(epochs, trainTarget);
    }

    simulateTraining(epochs, target) {
        let currentEpoch = 0;
        let trainLoss = 2.5;
        let valLoss = 2.6;
        let trainAcc = 0.1;
        let valAcc = 0.08;

        const trainInterval = setInterval(() => {
            currentEpoch++;
            
            if (currentEpoch > epochs) {
                clearInterval(trainInterval);
                document.getElementById('progressStatus').textContent = '训练完成';
                document.getElementById('startTrainBtn').style.display = 'block';
                document.getElementById('stopTrainBtn').style.display = 'none';
                
                this.addToHistory('train', {
                    type: target,
                    epochs,
                    finalAccuracy: valAcc,
                    timestamp: new Date().toISOString()
                });
                
                this.showToast('训练完成！', 'success');
                return;
            }

            // 模拟训练指标变化
            trainLoss = Math.max(0.1, trainLoss * 0.9);
            valLoss = Math.max(0.15, valLoss * 0.92);
            trainAcc = Math.min(0.99, trainAcc + 0.05 + Math.random() * 0.03);
            valAcc = Math.min(0.98, valAcc + 0.04 + Math.random() * 0.02);

            // 更新UI
            const progress = (currentEpoch / epochs) * 100;
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('progressText').textContent = `${progress.toFixed(0)}%`;
            document.getElementById('progressStatus').textContent = `训练中 - Epoch ${currentEpoch}/${epochs}`;
            
            document.getElementById('trainLoss').textContent = trainLoss.toFixed(4);
            document.getElementById('trainAccuracy').textContent = `${(trainAcc * 100).toFixed(2)}%`;
            document.getElementById('valLoss').textContent = valLoss.toFixed(4);
            document.getElementById('valAccuracy').textContent = `${(valAcc * 100).toFixed(2)}%`;
            
            // 添加日志
            const logContainer = document.getElementById('trainLog');
            logContainer.textContent += `[Epoch ${currentEpoch}] Train Loss: ${trainLoss.toFixed(4)}, Train Acc: ${(trainAcc * 100).toFixed(2)}%, Val Loss: ${valLoss.toFixed(4)}, Val Acc: ${(valAcc * 100).toFixed(2)}%\n`;
            logContainer.scrollTop = logContainer.scrollHeight;

        }, 800);

        this.trainProcess = { interval: trainInterval };
    }

    stopTraining() {
        if (this.trainProcess && this.trainProcess.interval) {
            clearInterval(this.trainProcess.interval);
            this.trainProcess = null;
        }
        
        document.getElementById('progressStatus').textContent = '训练已停止';
        document.getElementById('startTrainBtn').style.display = 'block';
        document.getElementById('stopTrainBtn').style.display = 'none';
        this.showToast('训练已停止', 'warning');
    }

    switchHistoryTab(type) {
        document.querySelectorAll('.history-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-history="${type}"]`).classList.add('active');
        this.displayHistory(type);
    }

    displayHistory(type) {
        const historyList = document.getElementById('historyList');
        const items = this.history[type] || [];

        if (items.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>暂无${type === 'recognize' ? '识别' : '训练'}记录</p>
                </div>
            `;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
        
        items.forEach((item, index) => {
            if (type === 'recognize') {
                html += `
                    <div style="background: rgba(30, 41, 59, 0.5); padding: 1rem; border-radius: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-weight: 500;">${item.fileName}</span>
                            <span style="color: var(--text-muted); font-size: 0.8rem;">${this.formatTime(item.timestamp)}</span>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <span style="color: var(--primary-color);">${this.getTypeLabel(item.type)}</span>
                            <span style="font-family: monospace;">${item.result.text || '未识别'}</span>
                            <span style="color: var(--text-muted);">置信度: ${(item.result.confidence * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div style="background: rgba(30, 41, 59, 0.5); padding: 1rem; border-radius: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-weight: 500;">${this.getTypeLabel(item.type)}训练</span>
                            <span style="color: var(--text-muted); font-size: 0.8rem;">${this.formatTime(item.timestamp)}</span>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <span>Epochs: ${item.epochs}</span>
                            <span style="color: var(--success-color);">准确率: ${(item.finalAccuracy * 100).toFixed(2)}%</span>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        historyList.innerHTML = html;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
    }

    addToHistory(type, item) {
        this.history[type].unshift(item);
        if (this.history[type].length > 20) {
            this.history[type].pop();
        }
        localStorage.setItem(`ocr_history_${type}`, JSON.stringify(this.history[type]));
    }

    loadHistory() {
        this.history.recognize = JSON.parse(localStorage.getItem('ocr_history_recognize') || '[]');
        this.history.train = JSON.parse(localStorage.getItem('ocr_history_train') || '[]');
    }

    async checkServerStatus() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            const data = await response.json();
            
            if (data.status === 'healthy') {
                document.querySelector('.status-dot').classList.add('online');
                document.querySelector('.status-indicator span:last-child').textContent = '服务在线';
            }
        } catch {
            document.querySelector('.status-dot').classList.remove('online');
            document.querySelector('.status-indicator span:last-child').textContent = '服务离线';
            this.showToast('无法连接到后端服务，请确保API服务已启动', 'error');
        }
    }

    showLoading(text) {
        document.getElementById('loadingOverlay').style.display = 'flex';
        document.getElementById('loadingText').textContent = text;
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        
        toast.className = `toast toast-${type} show`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        icon.className = `toast-icon ${icons[type]}`;
        toast.querySelector('.toast-message').textContent = message;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new OCRApp();
});
