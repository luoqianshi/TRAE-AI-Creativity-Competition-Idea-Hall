const speakText = (text) => {
    if (!window.speechSynthesis) {
        alert('您的浏览器不支持语音合成功能');
        return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
    };
    
    window.speechSynthesis.speak(utterance);
};

const speakPinyin = (pinyin) => {
    if (!window.speechSynthesis) {
        alert('您的浏览器不支持语音合成功能');
        return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(pinyin);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
};

const speakSentence = (sentence) => {
    if (!window.speechSynthesis) {
        alert('您的浏览器不支持语音合成功能');
        return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
};

const stopSpeech = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
};

const isSpeechSupported = () => {
    return !!window.speechSynthesis;
};

const getAvailableVoices = () => {
    if (!window.speechSynthesis) return [];
    
    return window.speechSynthesis.getVoices().filter(voice => 
        voice.lang.startsWith('zh') || voice.lang.startsWith('zh-CN')
    );
};

window.speakText = speakText;
window.speakPinyin = speakPinyin;
window.speakSentence = speakSentence;
