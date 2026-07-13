class CharacterVideoManager {
  constructor() {
    this.characterMap = {
      chinese: { name: '腐生太白', id: 'fusheng_taibai' },
      math: { name: '杠杆阿基米德', id: 'ganggan_ajimide' },
      english: { name: '深渊李华', id: 'shenyuan_lihua' },
      history: { name: '鬼雄项羽', id: 'guixiong_xiangyu' },
      politics: { name: '腐儒韩非', id: 'furu_hanfei' },
      geography: { name: '迷途徐霞客', id: 'mitu_xuxiake' },
      physics: { name: '引力牛顿', id: 'yinli_newton' },
      chemistry: { name: '幽绿居里夫人', id: 'youlv_curie' },
      biology: { name: '畸变达尔文', id: 'jibian_darwin' }
    };

    this.videoBasePath = 'assets/Character/';
    
    this.videos = {
      intro: null,
      idle: null,
      wrong: null,
      correct: null,
      victory: null
    };

    this.audioContext = null;
    this.idleAudio = null;
    this.isPlayingIdleAudio = false;

    this.currentSubject = null;
    
    // 防重入标志：防止同一视频被重复调用
    this.isPlayingIntro = false;
    this.isPlayingWrong = false;
    this.isPlayingCorrect = false;
    this.isPlayingVictory = false;
    
    this.initVideoElements();
  }

  initVideoElements() {
    const introVideo = document.createElement('video');
    introVideo.id = 'character-intro-video';
    introVideo.className = 'character-video intro-video';
    introVideo.setAttribute('playsinline', '');
    introVideo.setAttribute('webkit-playsinline', '');
    introVideo.style.display = 'none';
    document.body.appendChild(introVideo);
    this.videos.intro = introVideo;

    const idleVideo = document.createElement('video');
    idleVideo.id = 'character-idle-video';
    idleVideo.className = 'character-video idle-video';
    idleVideo.setAttribute('playsinline', '');
    idleVideo.setAttribute('webkit-playsinline', '');
    idleVideo.setAttribute('loop', '');
    idleVideo.style.display = 'none';
    document.body.appendChild(idleVideo);
    this.videos.idle = idleVideo;

    const wrongVideo = document.createElement('video');
    wrongVideo.id = 'character-wrong-video';
    wrongVideo.className = 'character-video wrong-video';
    wrongVideo.setAttribute('playsinline', '');
    wrongVideo.setAttribute('webkit-playsinline', '');
    wrongVideo.style.display = 'none';
    document.body.appendChild(wrongVideo);
    this.videos.wrong = wrongVideo;

    const correctVideo = document.createElement('video');
    correctVideo.id = 'character-correct-video';
    correctVideo.className = 'character-video correct-video';
    correctVideo.setAttribute('playsinline', '');
    correctVideo.setAttribute('webkit-playsinline', '');
    correctVideo.style.display = 'none';
    document.body.appendChild(correctVideo);
    this.videos.correct = correctVideo;

    const victoryVideo = document.createElement('video');
    victoryVideo.id = 'character-victory-video';
    victoryVideo.className = 'character-video victory-video';
    victoryVideo.setAttribute('playsinline', '');
    victoryVideo.setAttribute('webkit-playsinline', '');
    victoryVideo.style.display = 'none';
    document.body.appendChild(victoryVideo);
    this.videos.victory = victoryVideo;
  }

  getVideoFilename(subjectId, videoType) {
    const cleanSubjectId = subjectId.replace(/^preview_/, '');
    const character = this.characterMap[cleanSubjectId];
    if (!character) return null;

    const name = character.name;
    let filename = '';

    switch (videoType) {
      case 'intro':
        filename = `${name}_进场.mp4`;
        break;
      case 'intro1':
        filename = `${name}_进场1.mp4`;
        break;
      case 'idle':
        filename = `${name}_待机.mp4`;
        break;
      case 'idle1':
        filename = `${name}_待机1.mp4`;
        break;
      case 'wrong':
        filename = `${name}_答题错误.mp4`;
        break;
      case 'wrong1':
        filename = `${name}_答题错误1.mp4`;
        break;
      case 'correct':
        filename = `${name}_答题正确.mp4`;
        break;
      case 'victory':
        filename = `${name}_通关.mp4`;
        break;
      case 'victory1':
        filename = `${name}_通关1.mp4`;
        break;
    }

    return this.videoBasePath + filename;
  }

  async loadVideo(videoType, subjectId) {
    const video = this.videos[videoType];
    if (!video || !subjectId) return false;

    const cleanSubjectId = subjectId.replace(/^preview_/, '');
    const character = this.characterMap[cleanSubjectId];
    if (!character) return false;

    let filename = this.getVideoFilename(subjectId, videoType);
    
    if (videoType === 'intro' && filename) {
      try {
        await this.checkFileExists(filename);
      } catch {
        filename = this.getVideoFilename(subjectId, 'intro1');
      }
    }

    if (videoType === 'idle' && filename) {
      try {
        await this.checkFileExists(filename);
      } catch {
        filename = this.getVideoFilename(subjectId, 'idle1');
      }
    }

    if (videoType === 'wrong' && filename) {
      try {
        await this.checkFileExists(filename);
      } catch {
        filename = this.getVideoFilename(subjectId, 'wrong1');
      }
    }

    if (videoType === 'victory' && filename) {
      try {
        await this.checkFileExists(filename);
      } catch {
        filename = this.getVideoFilename(subjectId, 'victory1');
      }
    }

    if (!filename) return false;

    return new Promise((resolve) => {
      video.onloadeddata = () => resolve(true);
      video.onerror = () => resolve(false);
      video.src = filename;
      video.load();
    });
  }

  async checkFileExists(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, true);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject();
        }
      };
      xhr.onerror = reject;
      xhr.send();
    });
  }

  async playIntro(subjectId, onComplete) {
    // 防重入：如果正在播放进场动画，直接返回
    if (this.isPlayingIntro) return;
    this.isPlayingIntro = true;
    
    this.currentSubject = subjectId;
    
    const success = await this.loadVideo('intro', subjectId);
    if (!success) {
      this.isPlayingIntro = false;
      if (onComplete) onComplete();
      return;
    }

    this.hideAllVideos();
    this.videos.intro.style.display = 'block';

    let isFinished = false;
    const video = this.videos.intro;

    const finishIntro = () => {
      if (isFinished) return;
      isFinished = true;
      this.isPlayingIntro = false;
      
      // 先移除所有事件监听器，再执行回调
      video.removeEventListener('click', clickSkip);
      document.removeEventListener('keydown', keySkip);
      
      video.pause();
      video.style.display = 'none';
      video.onended = null;
      
      if (onComplete) onComplete();
    };

    const clickSkip = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isFinished) finishIntro();
    };

    const keySkip = () => {
      if (!isFinished) finishIntro();
    };

    video.onended = () => {
      if (!isFinished) finishIntro();
    };
    
    video.addEventListener('click', clickSkip);
    document.addEventListener('keydown', keySkip);

    try {
      await video.play();
    } catch (e) {
      console.warn('Intro video autoplay blocked:', e);
      finishIntro();
    }
  }

  async startIdle(subjectId) {
    this.currentSubject = subjectId;
    
    const success = await this.loadVideo('idle', subjectId);
    if (!success) return;

    this.hideAllVideos();
    this.videos.idle.style.display = 'block';

    try {
      await this.videos.idle.play();
      this.startIdleAudio();
    } catch (e) {
      console.warn('Idle video autoplay blocked:', e);
    }
  }

  stopIdle() {
    if (this.videos.idle) {
      this.videos.idle.pause();
      this.videos.idle.style.display = 'none';
    }
    this.stopIdleAudio();
  }

  async playWrong(subjectId, onComplete) {
    if (this.isPlayingWrong) return;
    this.isPlayingWrong = true;
    
    const success = await this.loadVideo('wrong', subjectId);
    if (!success) {
      this.isPlayingWrong = false;
      if (onComplete) onComplete();
      return;
    }

    this.stopIdleAudio();

    this.videos.wrong.style.display = 'block';

    let isFinished = false;
    const video = this.videos.wrong;

    const finishWrong = () => {
      if (isFinished) return;
      isFinished = true;
      this.isPlayingWrong = false;
      
      video.removeEventListener('click', clickSkip);
      document.removeEventListener('keydown', keySkip);
      
      video.pause();
      video.style.display = 'none';
      video.onended = null;
      
      try {
        this.videos.idle.play();
      } catch (e) {}
      this.startIdleAudio();
      if (onComplete) onComplete();
    };

    const clickSkip = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isFinished) finishWrong();
    };

    const keySkip = () => {
      if (!isFinished) finishWrong();
    };

    video.onended = () => {
      if (!isFinished) finishWrong();
    };
    
    video.addEventListener('click', clickSkip);
    document.addEventListener('keydown', keySkip);

    try {
      await video.play();
    } catch (e) {
      console.warn('Wrong video autoplay blocked:', e);
      finishWrong();
    }
  }

  async playCorrect(subjectId, onComplete) {
    if (this.isPlayingCorrect) return;
    this.isPlayingCorrect = true;
    
    const success = await this.loadVideo('correct', subjectId);
    if (!success) {
      this.isPlayingCorrect = false;
      if (onComplete) onComplete();
      return;
    }

    this.stopIdleAudio();

    this.videos.correct.style.display = 'block';

    let isFinished = false;
    const video = this.videos.correct;

    const finishCorrect = () => {
      if (isFinished) return;
      isFinished = true;
      this.isPlayingCorrect = false;
      
      video.removeEventListener('click', clickSkip);
      document.removeEventListener('keydown', keySkip);
      
      video.pause();
      video.style.display = 'none';
      video.onended = null;
      
      this.startIdleAudio();
      if (onComplete) onComplete();
    };

    const clickSkip = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isFinished) finishCorrect();
    };

    const keySkip = () => {
      if (!isFinished) finishCorrect();
    };

    video.onended = () => {
      if (!isFinished) finishCorrect();
    };
    
    video.addEventListener('click', clickSkip);
    document.addEventListener('keydown', keySkip);

    try {
      await video.play();
    } catch (e) {
      console.warn('Correct video autoplay blocked:', e);
      finishCorrect();
    }
  }

  async playVictory(subjectId, onComplete) {
    if (this.isPlayingVictory) return;
    this.isPlayingVictory = true;
    
    const success = await this.loadVideo('victory', subjectId);
    if (!success) {
      this.isPlayingVictory = false;
      if (onComplete) onComplete();
      return;
    }

    this.stopIdle();
    this.videos.victory.style.display = 'block';

    let isFinished = false;
    const video = this.videos.victory;

    const finishVictory = () => {
      if (isFinished) return;
      isFinished = true;
      this.isPlayingVictory = false;
      
      video.removeEventListener('click', clickSkip);
      document.removeEventListener('keydown', keySkip);
      
      video.pause();
      video.style.display = 'none';
      video.onended = null;
      
      if (onComplete) onComplete();
    };

    const clickSkip = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isFinished) finishVictory();
    };

    const keySkip = () => {
      if (!isFinished) finishVictory();
    };

    video.onended = () => {
      if (!isFinished) finishVictory();
    };
    
    video.addEventListener('click', clickSkip);
    document.addEventListener('keydown', keySkip);

    try {
      await video.play();
    } catch (e) {
      console.warn('Victory video autoplay blocked:', e);
      finishVictory();
    }
  }

  hideAllVideos() {
    Object.values(this.videos).forEach(video => {
      if (video) {
        video.pause();
        video.style.display = 'none';
      }
    });
  }

  startIdleAudio() {
    if (this.isPlayingIdleAudio) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isPlayingIdleAudio = true;
      this.generateAmbientSound();
    } catch (e) {
      console.warn('Audio context not supported:', e);
    }
  }

  stopIdleAudio() {
    this.isPlayingIdleAudio = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  generateAmbientSound() {
    if (!this.audioContext || !this.isPlayingIdleAudio) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(165, this.audioContext.currentTime + 4);
    
    gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 4);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 4);

    setTimeout(() => {
      if (this.isPlayingIdleAudio) {
        this.generateAmbientSound();
      }
    }, 4000);
  }

  getCharacterImage(subjectId) {
    const character = this.characterMap[subjectId];
    if (!character) return null;
    
    const name = character.name;
    const imagePath = this.videoBasePath + `${name}.jpg`;
    return imagePath;
  }

  getCharacterName(subjectId) {
    const character = this.characterMap[subjectId];
    return character ? character.name : '';
  }

  setOnVideoError(callback) {
    this.onVideoError = callback;
  }
}