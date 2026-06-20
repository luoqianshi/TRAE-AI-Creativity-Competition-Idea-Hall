// OCR模块 - 使用Tesseract.js进行本地离线OCR识别
const OCR = {
    worker: null,
    isReady: false,
    
    // 初始化OCR引擎
    async init() {
        if (this.worker) return;
        
        try {
            this.worker = await Tesseract.createWorker('chi_sim', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        // 发送进度更新
                        const progress = Math.round(m.progress * 100);
                        this.onProgress?.(progress, `识别中... ${progress}%`);
                    } else if (m.status === 'loading language traineddata') {
                        this.onProgress?.(0, '加载语言包...');
                    } else if (m.status === 'initializing api') {
                        this.onProgress?.(10, '初始化OCR引擎...');
                    } else if (m.status === 'loading tesseract core') {
                        this.onProgress?.(20, '加载核心组件...');
                    }
                }
            });
            this.isReady = true;
        } catch (error) {
            console.error('OCR初始化失败:', error);
            throw new Error('OCR引擎初始化失败，请刷新页面重试');
        }
    },
    
    // 识别图片文字
    async recognizeImage(imageSource) {
        if (!this.worker) {
            await this.init();
        }
        
        try {
            const result = await this.worker.recognize(imageSource);
            return {
                success: true,
                text: result.data.text,
                confidence: result.data.confidence,
                words: result.data.words
            };
        } catch (error) {
            console.error('OCR识别失败:', error);
            return {
                success: false,
                message: '文字识别失败，请重试',
                text: '',
                confidence: 0
            };
        }
    },
    
    // 终止OCR
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isReady = false;
        }
    },
    
    // 进度回调
    onProgress(progress, message) {
        const progressBar = document.getElementById('ocr-progress-bar');
        const progressText = document.getElementById('ocr-progress-text');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = message;
        }
    }
};

// 导出模块
window.OCR = OCR;
