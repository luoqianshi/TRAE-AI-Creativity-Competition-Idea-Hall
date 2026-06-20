// API 配置
const CONFIG = {
    apiKey: 'agent-fcc4413ad249f30f549d61c6a3d0488b',
    baseUrl: 'https://ai.hnyyjx.com/chat/api',
    appId: '019e1627-1e03-7ae2-929a-55cae4b9fbad'
};

// DOM 元素
const floatingMode = document.getElementById('floatingMode');
const expandedMode = document.getElementById('expandedMode');
const floatingMicBtn = document.getElementById('floatingMicBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const closeBtn = document.getElementById('closeBtn');
const recordBtn = document.getElementById('recordBtn');
const recordBtnText = document.getElementById('recordBtnText');
const pasteBtn = document.getElementById('pasteBtn');
const clearBtn = document.getElementById('clearBtn');
const recognitionText = document.getElementById('recognitionText');
const responseText = document.getElementById('responseText');
const statusBar = document.getElementById('statusBar');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

// 状态变量
let isRecording = false;
let isExpanded = false;
let recognition = null;
let chatId = null;
let currentAIResponse = '';
let recognizedText = '';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();
    initEventListeners();
    createChatSession();
});

// 初始化事件监听
function initEventListeners() {
    floatingMicBtn.addEventListener('click', toggleExpand);
    minimizeBtn.addEventListener('click', toggleExpand);
    closeBtn.addEventListener('click', () => {
        window.electronAPI.quitApp();
    });
    recordBtn.addEventListener('click', toggleRecording);
    pasteBtn.addEventListener('click', pasteResponse);
    clearBtn.addEventListener('click', clearAll);
}

// 切换展开/收起
async function toggleExpand() {
    isExpanded = await window.electronAPI.toggleWindow();
    
    if (isExpanded) {
        floatingMode.style.display = 'none';
        expandedMode.classList.add('active');
    } else {
        expandedMode.classList.remove('active');
        floatingMode.style.display = 'flex';
    }
}

// 初始化语音识别
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.lang = 'zh-CN';
        recognition.continuous = false;  // 单次识别，自动结束
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecording = true;
            recognizedText = '';
            updateRecordingUI(true);
            setStatus('正在聆听...请说话');
            console.log('语音识别已启动');
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                recognizedText = finalTranscript;
                updateRecognitionText(finalTranscript);
            } else if (interimTranscript) {
                updateRecognitionText(interimTranscript);
            }
            
            console.log('识别结果 - final:', finalTranscript, 'interim:', interimTranscript);
        };

        recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            stopRecording();
            
            if (event.error === 'not-allowed') {
                setStatus('麦克风权限被拒绝', 'error');
            } else if (event.error === 'no-speech') {
                setStatus('未检测到语音，请重试', 'error');
            } else {
                setStatus('语音识别失败: ' + event.error, 'error');
            }
        };

        recognition.onend = () => {
            console.log('语音识别结束, recognizedText:', recognizedText);
            stopRecording();
            
            // 如果有识别内容，自动发送
            if (recognizedText && recognizedText.trim()) {
                console.log('准备发送到 AI:', recognizedText);
                sendToAI(recognizedText);
            }
        };
    } else {
        setStatus('浏览器不支持语音识别', 'error');
    }
}

// 切换录音
function toggleRecording() {
    if (!recognition) return;
    
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

// 开始录音
function startRecording() {
    recognizedText = '';
    updateRecognitionText('');
    recognition.start();
}

// 停止录音
function stopRecording() {
    if (recognition && isRecording) {
        try {
            recognition.stop();
        } catch (e) {
            console.log('停止录音异常:', e);
        }
    }
    
    isRecording = false;
    updateRecordingUI(false);
}

// 更新录音UI
function updateRecordingUI(recording) {
    if (recording) {
        recordBtn.classList.add('recording');
        recordBtnText.textContent = '正在识别...';
        floatingMicBtn.classList.add('recording');
    } else {
        recordBtn.classList.remove('recording');
        recordBtnText.textContent = '开始录音';
        floatingMicBtn.classList.remove('recording');
    }
}

// 更新识别文字
function updateRecognitionText(text) {
    if (!text || !text.trim()) {
        recognitionText.textContent = '点击下方录音按钮开始说话...';
        recognitionText.classList.add('placeholder');
    } else {
        recognitionText.textContent = text;
        recognitionText.classList.remove('placeholder');
    }
}

// 创建聊天会话
async function createChatSession() {
    try {
        setStatus('连接中...');
        const response = await fetch(`${CONFIG.baseUrl}/open`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CONFIG.apiKey}`,
                'Accept': '*/*'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.code === 200) {
            chatId = data.data;
            setStatus('已连接', 'success');
            console.log('会话创建成功:', chatId);
        } else {
            throw new Error(data.message || '创建会话失败');
        }
    } catch (error) {
        console.error('创建会话失败:', error);
        setStatus('连接失败: ' + error.message, 'error');
    }
}

// 发送到 AI
async function sendToAI(text) {
    if (!text || !text.trim()) {
        console.log('文本为空，不发送');
        return;
    }
    
    if (!chatId) {
        setStatus('会话未建立，正在重连...', 'error');
        await createChatSession();
        return;
    }

    console.log('发送到 AI:', text);
    showLoading('AI 正在思考...');

    try {
        const response = await fetch(`${CONFIG.baseUrl}/chat_message/${chatId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            body: JSON.stringify({
                message: text.trim(),
                stream: true,
                re_chat: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';

        responseText.textContent = '';
        responseText.classList.remove('placeholder');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n');
            buffer = events.pop() || '';

            for (const line of events) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data:')) continue;
                
                const jsonStr = trimmed.replace(/^data:\s*/, '');
                if (!jsonStr) continue;

                try {
                    const data = JSON.parse(jsonStr);
                    if (data.content) {
                        fullResponse += data.content;
                        responseText.textContent = fullResponse;
                    }
                } catch (e) {
                    console.warn('解析失败:', jsonStr);
                }
            }
        }

        currentAIResponse = fullResponse;
        pasteBtn.disabled = false;
        hideLoading();
        setStatus('获取回复成功，正在粘贴...', 'success');
        console.log('AI 回复:', fullResponse);
        
        // 自动复制到剪贴板并粘贴到激活窗口
        try {
            await window.electronAPI.copyToClipboard(fullResponse);
            await window.electronAPI.pasteToActive();
            setStatus('已粘贴到激活窗口', 'success');
        } catch (error) {
            console.error('粘贴失败:', error);
            setStatus('复制成功，但粘贴失败', 'error');
        }
        
    } catch (error) {
        console.error('发送消息失败:', error);
        hideLoading();
        setStatus('请求失败: ' + error.message, 'error');
    }
}

// 粘贴响应
async function pasteResponse() {
    if (!currentAIResponse) return;
    
    try {
        await window.electronAPI.copyToClipboard(currentAIResponse);
        setStatus('已复制到剪贴板，请按 Ctrl+V 粘贴', 'success');
        
        // 显示提示后自动收起窗口
        setTimeout(() => {
            if (isExpanded) {
                toggleExpand();
            }
        }, 1500);
        
    } catch (error) {
        console.error('复制失败:', error);
        setStatus('复制失败', 'error');
    }
}

// 清空内容
function clearAll() {
    recognitionText.textContent = '点击下方录音按钮开始说话...';
    recognitionText.classList.add('placeholder');
    responseText.textContent = 'AI 回复将显示在这里...';
    responseText.classList.add('placeholder');
    currentAIResponse = '';
    recognizedText = '';
    pasteBtn.disabled = true;
    setStatus('已清空');
}

// 显示加载状态
function showLoading(text = '处理中...') {
    loadingText.textContent = text;
    loadingOverlay.classList.add('active');
}

// 隐藏加载状态
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// 更新状态栏
function setStatus(text, type = '') {
    statusBar.textContent = text;
    statusBar.className = 'status-bar';
    if (type) {
        statusBar.classList.add(type);
    }
}
