/**
 * 乡音桥 - 方言翻译助手
 * 核心功能：语音录制、方言识别、翻译、语音合成
 */

class XiangyinBridge {
    constructor() {
        this.currentScene = 'medical';
        this.currentDirection = 'dialect-to-mandarin';
        this.currentDialect = 'cantonese';
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.history = JSON.parse(localStorage.getItem('xyq_history') || '[]');
        
        // 场景对应的常用短语
        this.scenePhrases = {
            medical: [
                '我头疼',
                '我胃不舒服',
                '请帮我挂号',
                '我要取药',
                '我过敏',
                '血压多少',
                '什么时候复查'
            ],
            shopping: [
                '这个多少钱',
                '太贵了',
                '便宜点',
                '我要买这个',
                '有优惠吗',
                '可以退货吗',
                '帮我包起来'
            ],
            family: [
                '你吃饭了吗',
                '最近怎么样',
                '注意身体',
                '我想你了',
                '什么时候回来',
                '天气冷了多穿点',
                '保重身体'
            ],
            daily: [
                '请问厕所在哪',
                '现在几点',
                '谢谢帮助',
                '我不明白',
                '请再说一遍',
                '我迷路了',
                '需要帮助'
            ]
        };
        
        // 模拟翻译数据（实际项目中应调用后端 API）
        this.mockTranslations = {
            '我头疼': { dialect: '我个头赤赤痛', dialectType: 'cantonese' },
            '我胃不舒服': { dialect: '我个胃唔舒服', dialectType: 'cantonese' },
            '请帮我挂号': { dialect: '唔该帮我挂个号', dialectType: 'cantonese' },
            '我要取药': { dialect: '我要攞药', dialectType: 'cantonese' },
            '这个多少钱': { dialect: '呢个几钱啊', dialectType: 'cantonese' },
            '太贵了': { dialect: '太贵喇', dialectType: 'cantonese' },
            '你吃饭了吗': { dialect: '你食咗饭未啊', dialectType: 'cantonese' },
            '最近怎么样': { dialect: '最近点啊', dialectType: 'cantonese' },
            '我想你了': { dialect: '我挂住你', dialectType: 'cantonese' },
            '请问厕所在哪': { dialect: '请问厕系边度', dialectType: 'cantonese' },
            '谢谢帮助': { dialect: '多谢帮忙', dialectType: 'cantonese' },
            '我不明白': { dialect: '我唔明', dialectType: 'cantonese' }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderPhrases();
        this.renderHistory();
        this.initSpeechSynthesis();
    }
    
    bindEvents() {
        // 场景选择
        document.querySelectorAll('.scene-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentScene = btn.dataset.scene;
                this.renderPhrases();
            });
        });
        
        // 翻译方向
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDirection = btn.dataset.dir;
                this.updateVoiceHint();
            });
        });
        
        // 方言选择
        document.getElementById('dialectSelect').addEventListener('change', (e) => {
            this.currentDialect = e.target.value;
        });
        
        // 录音按钮
        const recordBtn = document.getElementById('recordBtn');
        recordBtn.addEventListener('mousedown', () => this.startRecording());
        recordBtn.addEventListener('mouseup', () => this.stopRecording());
        recordBtn.addEventListener('mouseleave', () => {
            if (this.isRecording) this.stopRecording();
        });
        
        // 触摸事件（移动端）
        recordBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startRecording();
        });
        recordBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopRecording();
        });
        
        // 播放按钮
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', () => this.playAudio(btn.dataset.type));
        });
    }
    
    updateVoiceHint() {
        const hint = document.getElementById('voiceHint');
        if (this.currentDirection === 'dialect-to-mandarin') {
            hint.textContent = '按住下方按钮，用方言说出您想说的话';
        } else {
            hint.textContent = '按住下方按钮，用普通话说出您想说的话';
        }
    }
    
    renderPhrases() {
        const grid = document.getElementById('phraseGrid');
        const phrases = this.scenePhrases[this.currentScene] || [];
        
        grid.innerHTML = phrases.map(phrase => 
            `<button class="phrase-btn" data-phrase="${phrase}">${phrase}</button>`
        ).join('');
        
        grid.querySelectorAll('.phrase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.translatePhrase(btn.dataset.phrase);
            });
        });
    }
    
    async startRecording() {
        if (this.isRecording) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (e) => {
                this.audioChunks.push(e.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // UI 更新
            document.getElementById('recordBtn').classList.add('recording');
            document.getElementById('recordingIndicator').classList.remove('hidden');
            document.querySelector('.record-label').textContent = '松开结束';
            
        } catch (err) {
            console.error('录音失败:', err);
            alert('无法访问麦克风，请检查权限设置');
        }
    }
    
    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;
        
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        this.isRecording = false;
        
        // UI 更新
        document.getElementById('recordBtn').classList.remove('recording');
        document.getElementById('recordingIndicator').classList.add('hidden');
        document.querySelector('.record-label').textContent = '按住说话';
    }
    
    async processRecording() {
        // 模拟语音识别过程
        // 实际项目中应调用语音识别 API（如百度语音、讯飞等）
        
        // 模拟随机识别结果
        const mockTexts = [
            '我头有点疼',
            '这个多少钱',
            '我想回家',
            '请帮我一下',
            '我不舒服'
        ];
        const recognizedText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
        
        this.showResult(recognizedText);
    }
    
    translatePhrase(phrase) {
        this.showResult(phrase);
    }
    
    showResult(originalText) {
        // 模拟翻译
        let translatedText = '';
        
        if (this.currentDirection === 'dialect-to-mandarin') {
            // 方言 -> 普通话：显示普通话翻译
            // 实际项目中应调用翻译 API
            translatedText = this.mockTranslateToMandarin(originalText);
        } else {
            // 普通话 -> 方言：显示方言翻译
            translatedText = this.mockTranslateToDialect(originalText);
        }
        
        // 显示结果
        document.getElementById('originalText').textContent = originalText;
        document.getElementById('translatedText').textContent = translatedText;
        document.getElementById('resultSection').classList.remove('hidden');
        
        // 保存到历史记录
        this.addToHistory(originalText, translatedText);
        
        // 自动播放翻译结果
        setTimeout(() => {
            this.speak(translatedText, this.currentDirection === 'mandarin-to-dialect' ? this.currentDialect : 'zh-CN');
        }, 500);
    }
    
    mockTranslateToMandarin(dialectText) {
        // 模拟方言到普通话翻译
        const translations = {
            '我个头赤赤痛': '我头疼',
            '我个胃唔舒服': '我胃不舒服',
            '唔该帮我挂个号': '请帮我挂号',
            '我要攞药': '我要取药',
            '呢个几钱啊': '这个多少钱',
            '太贵喇': '太贵了',
            '你食咗饭未啊': '你吃饭了吗',
            '最近点啊': '最近怎么样',
            '我挂住你': '我想你了'
        };
        return translations[dialectText] || dialectText;
    }
    
    mockTranslateToDialect(mandarinText) {
        // 模拟普通话到方言翻译
        const mock = this.mockTranslations[mandarinText];
        if (mock && mock.dialectType === this.currentDialect) {
            return mock.dialect;
        }
        // 如果没有对应方言，返回模拟结果
        const dialectMap = {
            'cantonese': '（粤语）',
            'sichuan': '（四川话）',
            'hunan': '（湖南话）',
            'hubei': '（湖北话）',
            'henan': '（河南话）',
            'shandong': '（山东话）',
            'northeast': '（东北话）',
            'shanghainese': '（上海话）',
            'fujian': '（福建话）',
            'jiangxi': '（江西话）'
        };
        return `[${mandarinText}]${dialectMap[this.currentDialect] || ''}`;
    }
    
    addToHistory(original, translated) {
        const item = {
            original,
            translated,
            direction: this.currentDirection,
            dialect: this.currentDialect,
            scene: this.currentScene,
            time: new Date().toLocaleString('zh-CN')
        };
        
        this.history.unshift(item);
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        localStorage.setItem('xyq_history', JSON.stringify(this.history));
        this.renderHistory();
    }
    
    renderHistory() {
        const list = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            list.innerHTML = '<p class="empty-hint">暂无翻译记录</p>';
            return;
        }
        
        list.innerHTML = this.history.slice(0, 5).map(item => `
            <div class="history-item" data-original="${item.original}" data-translated="${item.translated}">
                <div class="history-original">${item.original}</div>
                <div class="history-translated">${item.translated}</div>
                <div class="history-time">${item.time}</div>
            </div>
        `).join('');
        
        list.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('originalText').textContent = item.dataset.original;
                document.getElementById('translatedText').textContent = item.dataset.translated;
                document.getElementById('resultSection').classList.remove('hidden');
            });
        });
    }
    
    // 语音合成
    initSpeechSynthesis() {
        if (!window.speechSynthesis) {
            console.warn('浏览器不支持语音合成');
        }
    }
    
    speak(text, lang = 'zh-CN') {
        if (!window.speechSynthesis) return;
        
        // 取消之前的语音
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9; // 稍慢，适合老人
        utterance.pitch = 1;
        utterance.volume = 1;
        
        window.speechSynthesis.speak(utterance);
    }
    
    playAudio(type) {
        const text = type === 'original' 
            ? document.getElementById('originalText').textContent
            : document.getElementById('translatedText').textContent;
        
        const lang = type === 'original' && this.currentDirection === 'dialect-to-mandarin'
            ? this.currentDialect 
            : 'zh-CN';
        
        this.speak(text, lang);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new XiangyinBridge();
});

// 注册 Service Worker（支持离线使用）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker 注册成功'))
            .catch(err => console.log('Service Worker 注册失败:', err));
    });
}