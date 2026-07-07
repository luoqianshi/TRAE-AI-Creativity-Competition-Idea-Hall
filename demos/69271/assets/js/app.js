/**
 * 片刻 Pianke Demo — 主应用逻辑 (Alpine.js)
 * 路由、状态管理、视图切换、手势交互
 */
function piankeApp() {
  return {
    // ===== 全局状态 =====
    route: 'home',
    routeParam: null,
    toast: { show: false, msg: '', type: 'info' },
    tab: 'home', // 底部导航：home/discover/camera/plaza/profile

    // ===== 数据 =====
    data: window.PK_DATA,
    get themes() { return this.data.themes; },
    get banners() { return this.data.banners; },
    get spots() { return this.data.spots; },
    get filters() { return this.data.filters; },
    get popularPoses() { return this.data.popularPoses; },
    get feed() { return this.data.feed; },
    get profileCover() { return this.data.profileCover; },

    // ===== 专题详情 =====
    currentTheme: null,
    themeTab: 'poses', // poses/spots/filters
    poseCategory: 'all',

    // ===== 幽灵相机 =====
    cameraReady: false,
    cameraError: null,
    currentPose: null,
    ghostOpacity: 0.4,
    ghostScale: 1,
    ghostX: 0,
    ghostY: 0,
    ghostImageLoaded: false,
    gridType: 'thirds', // thirds/golden/diagonal/none
    poseList: [], // 当前可切换的姿势列表
    poseIndex: 0,
    showTips: true,
    capturing: false,
    countdown: 0,
    timerFlash: false,

    // 手势状态
    dragging: false,
    dragStart: { x: 0, y: 0 },
    pinchDistance: 0,
    pinchStartScale: 1,

    // ===== 出片对比 =====
    lastCapture: null, // dataURL
    lastPose: null,
    selectedFilter: 'none',
    similarity: 0,
    savedShot: false,

    // ===== 发现/地图 =====
    selectedSpot: null,
    spotFilter: 'all',

    // ===== 我的 =====
    myShots: [],
    profileTab: 'shots', // shots/collections

    // ===== 搜索 =====
    searchOpen: false,
    searchKeyword: '',
    searchHistory: [],

    // ===== 视频跟拍 =====
    videoSpeed: 1,
    videoRecording: false,
    recordedVideoUrl: null,

    // ===== 帖子详情 =====
    postDetail: null,

    // ===== 生命周期 =====
    init() {
      this.loadShots();
      this.loadFeedLikes();
      this.loadSearchHistory();
      this.handleHashChange();
      window.addEventListener('hashchange', () => this.handleHashChange());

      // 键盘快捷键 + Esc 关闭弹层
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.selectedSpot = null;
          this.searchOpen = false;
          this.postDetail = null;
          return;
        }
        // 相机页快捷键
        if (this.route === 'camera') {
          if (e.code === 'Space') {
            e.preventDefault();
            this.takePhoto();
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prevPose();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.nextPose();
          } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            this.ghostScale = Math.min(3, this.ghostScale + 0.1);
          } else if (e.key === '-') {
            e.preventDefault();
            this.ghostScale = Math.max(0.3, this.ghostScale - 0.1);
          } else if (e.key === 'g' || e.key === 'G') {
            const grids = ['none', 'thirds', 'golden', 'diagonal'];
            const idx = grids.indexOf(this.gridType);
            this.gridType = grids[(idx + 1) % grids.length];
          }
        }
      });

      // 全局错误处理
      window.addEventListener('error', (e) => {
        console.error('全局错误:', e.error);
        this.showToast('页面出现错误，请刷新重试', 'error');
      });
      window.addEventListener('unhandledrejection', (e) => {
        console.error('未处理Promise:', e.reason);
        this.showToast('操作失败，请重试', 'error');
      });

      // 全局图片错误处理：AI 文生图失败时回退到 picsum（仅尝试一次）
      document.addEventListener('error', (e) => {
        const img = e.target;
        if (img.tagName !== 'IMG' || img.dataset.fbTried) return;
        // 优先用 data-fb 提供的回退地址
        if (img.dataset.fb) {
          img.dataset.fbTried = '1';
          img.src = img.dataset.fb;
          return;
        }
        // 否则用 src 哈希生成稳定 seed 的 picsum
        const seedStr = (img.src || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const seed = Math.abs(seedStr) % 100000;
        const w = img.clientWidth > 0 ? img.clientWidth : 400;
        const h = img.clientHeight > 0 ? img.clientHeight : 560;
        img.dataset.fbTried = '1';
        img.src = `https://picsum.photos/seed/pkfb${seed}/${Math.round(w)}/${Math.round(h)}`;
      }, true);

      // 预加载首页关键图片
      this.preloadImages();
    },

    preloadImages() {
      // 预加载 Banner
      this.banners.forEach(b => {
        const img = new Image();
        img.src = b.image;
      });
      // 预加载热门姿势参考图
      this.popularPoses.forEach(p => {
        const img = new Image();
        img.src = p.reference;
      });
    },

    // ===== 路由 =====
    handleHashChange() {
      const hash = location.hash.replace(/^#\/?/, '') || 'home';
      const parts = hash.split('/');
      const route = parts[0];
      const param = parts[1] || null;

      // 离开相机页时停止摄像头
      if (this.route === 'camera' && route !== 'camera') {
        window.PKCamera.stop();
        this.cameraReady = false;
      }
      if (this.route === 'video' && route !== 'video') {
        window.PKCamera.stop();
        this.cameraReady = false;
      }

      this.route = route;
      this.routeParam = param;

      // 同步底部 Tab
      if (['home', 'camera', 'discover', 'plaza', 'profile'].includes(route)) {
        this.tab = route;
      }

      // 路由初始化
      if (route === 'theme' && param) {
        this.openTheme(param);
      } else if (route === 'camera') {
        // 从 sessionStorage 读取指定姿势
        const poseJson = sessionStorage.getItem('cameraPose');
        if (poseJson) {
          this.currentPose = JSON.parse(poseJson);
          sessionStorage.removeItem('cameraPose');
        } else if (!this.currentPose) {
          this.currentPose = this.themes[0].poses[0];
        }
        this.poseList = this.themes.find(t => t.id === this.currentPose.themeId)?.poses || [this.currentPose];
        this.poseIndex = this.poseList.findIndex(p => p.id === this.currentPose.id);
        if (this.poseIndex < 0) this.poseIndex = 0;
        this.$nextTick(() => this.startCamera());
      } else if (route === 'compare') {
        this.loadCompareData();
      } else if (route === 'spot' && param) {
        const spot = this.spots.find(s => s.id === param);
        if (spot) this.selectedSpot = spot;
      }

      // 滚动到顶
      this.$nextTick(() => {
        const main = document.querySelector('.app-main');
        if (main) main.scrollTop = 0;
      });
    },

    go(path) {
      location.hash = '#/' + path;
    },

    // ===== 专题详情 =====
    openTheme(themeId) {
      const theme = this.themes.find(t => t.id === themeId);
      if (theme) {
        this.currentTheme = theme;
        this.themeTab = 'poses';
        this.poseCategory = 'all';
      }
    },

    filteredPoses() {
      if (!this.currentTheme) return [];
      if (this.poseCategory === 'all') return this.currentTheme.poses;
      return this.currentTheme.poses.filter(p => p.category === this.poseCategory);
    },

    poseCategories() {
      if (!this.currentTheme) return [];
      const cats = [...new Set(this.currentTheme.poses.map(p => p.category))];
      return ['all', ...cats];
    },

    // ===== 进入相机 =====
    enterCamera(pose) {
      this.currentPose = pose;
      sessionStorage.setItem('cameraPose', JSON.stringify(pose));
      this.go('camera');
    },

    // ===== 摄像头 =====
    async startCamera() {
      const video = this.$refs.cameraVideo;
      if (!video) {
        setTimeout(() => this.startCamera(), 100);
        return;
      }
      try {
        this.cameraError = null;
        await window.PKCamera.init(video);
        this.cameraReady = true;
      } catch (err) {
        this.cameraError = err.message === 'UNSUPPORTED'
          ? '当前浏览器不支持摄像头，请使用 Chrome/Safari 或在 HTTPS 环境打开。'
          : '摄像头启动失败，请检查权限或使用 HTTPS 环境打开本 Demo。';
      }
    },

    async flipCamera() {
      try {
        await window.PKCamera.flip();
        this.showToast('已切换摄像头', 'info');
      } catch (e) {
        this.showToast('切换失败', 'error');
      }
    },

    switchPose(idx) {
      this.ghostImageLoaded = false;
      this.poseIndex = idx;
      this.currentPose = this.poseList[idx];
      this.ghostScale = 1;
      this.ghostX = 0;
      this.ghostY = 0;
    },

    nextPose() {
      const i = (this.poseIndex + 1) % this.poseList.length;
      this.switchPose(i);
    },
    prevPose() {
      const i = (this.poseIndex - 1 + this.poseList.length) % this.poseList.length;
      this.switchPose(i);
    },

    // ===== 手势：拖拽参考图 + 双指缩放 =====
    getPinchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    },

    onPointerDown(e) {
      // 手势冲突修复：只有点击 ghost-img 才触发拖拽
      if (!e.target.classList.contains('ghost-img')) return;

      // 双指缩放检测（TouchEvent）
      if (e.touches && e.touches.length === 2) {
        this.pinchDistance = this.getPinchDistance(e.touches);
        this.pinchStartScale = this.ghostScale;
        this.dragging = false;
        return;
      }

      this.dragging = true;
      this.dragStart = { x: e.clientX - this.ghostX, y: e.clientY - this.ghostY };
    },

    onPointerMove(e) {
      // 双指缩放
      if (e.touches && e.touches.length === 2) {
        const dist = this.getPinchDistance(e.touches);
        if (this.pinchDistance > 0) {
          const ratio = dist / this.pinchDistance;
          this.ghostScale = Math.max(0.3, Math.min(3, this.pinchStartScale * ratio));
        }
        return;
      }

      if (!this.dragging) return;
      this.ghostX = e.clientX - this.dragStart.x;
      this.ghostY = e.clientY - this.dragStart.y;
    },

    onPointerUp() {
      this.dragging = false;
      this.pinchDistance = 0;
    },

    // 滚轮缩放（桌面端）
    onWheel(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      this.ghostScale = Math.max(0.3, Math.min(3, this.ghostScale + delta));
    },

    // ===== 拍照 =====
    async takePhoto() {
      if (this.capturing || !this.cameraReady) return;
      this.capturing = true;

      // 倒计时
      if (this.countdown > 0) {
        for (let i = this.countdown; i > 0; i--) {
          this.timerFlash = i;
          await this.sleep(1000);
        }
        this.timerFlash = 0;
      }

      // 闪光效果
      const flash = document.querySelector('.capture-flash');
      if (flash) {
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 300);
      }

      const dataUrl = window.PKCamera.capture();
      if (!dataUrl) {
        this.showToast('拍照失败', 'error');
        this.capturing = false;
        return;
      }

      this.lastCapture = dataUrl;
      this.lastPose = this.currentPose;
      this.similarity = Math.floor(85 + Math.random() * 11); // 85-95
      this.selectedFilter = 'none';
      this.savedShot = false;

      // 存入 sessionStorage 以便对比页加载（兼容刷新）
      try {
        sessionStorage.setItem('lastCapture', dataUrl);
        sessionStorage.setItem('lastPose', JSON.stringify(this.currentPose));
      } catch (e) { /* ignore quota */ }

      // 震动反馈
      if (navigator.vibrate) navigator.vibrate(50);

      this.capturing = false;
      this.go('compare');
    },

    sleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    },

    // ===== 出片对比 =====
    loadCompareData() {
      // 从 sessionStorage 读取拍照结果（兼容刷新）
      const cap = sessionStorage.getItem('lastCapture');
      const pose = sessionStorage.getItem('lastPose');
      if (cap) {
        this.lastCapture = cap;
        sessionStorage.removeItem('lastCapture');
      }
      if (pose) {
        this.lastPose = JSON.parse(pose);
        sessionStorage.removeItem('lastPose');
      }
      if (!this.lastCapture) {
        // 没有拍照数据，返回首页
        this.go('home');
        return;
      }
      this.similarity = Math.floor(85 + Math.random() * 11);
      this.selectedFilter = 'none';
      this.savedShot = false;
    },

    getFilterCss(id) {
      const f = this.filters.find(x => x.id === id);
      return f ? f.css : 'none';
    },

    applyFilter(id) {
      this.selectedFilter = id;
    },

    similarityLabel() {
      if (this.similarity >= 92) return '大师级';
      if (this.similarity >= 88) return '优秀';
      if (this.similarity >= 85) return '良好';
      return '继续努力';
    },

    // 动态生成对比页建议
    getCompareSuggestions() {
      const s = [];
      const pose = this.lastPose;
      const sim = this.similarity;

      // 建议1：基于相似度的构图评价
      if (sim < 85) {
        s.push('构图有较大提升空间，建议使用九宫格辅助线对齐主体');
      } else if (sim < 88) {
        s.push('构图基本到位，微调角度和位置会更完美');
      } else if (sim < 92) {
        s.push('构图不错，主体位置准确，继续保持');
      } else {
        s.push('构图精准，主体位置非常到位，大师级水平');
      }

      // 建议2：基于姿势焦段
      const focal = pose?.cameraParams?.focal || '50mm';
      const angle = pose?.cameraParams?.angle || 'eye_level';
      const angleMap = { low_angle: '低角度仰拍', eye_level: '平视', high_angle: '俯拍' };
      s.push(`建议使用 ${focal} 焦段，配合${angleMap[angle] || '平视'}角度拍摄`);

      // 建议3：基于难度
      const diff = pose?.difficulty || 1;
      if (diff >= 4) {
        s.push('该姿势难度较高，可开启定时拍摄并多次练习抓拍');
      } else if (sim < 88) {
        s.push('可尝试下方滤镜增强照片氛围感');
      } else {
        s.push('成片效果很好，记得保存并分享到广场');
      }

      // 建议4：基于构图类型
      const grid = pose?.gridType;
      if (grid === 'golden' && sim < 90) {
        s.push('黄金分割构图需注意主体放在画面 0.618 位置');
      } else if (grid === 'diagonal' && sim < 90) {
        s.push('对角线构图可利用画面线条引导视觉焦点');
      }

      return s.slice(0, 4);
    },

    // 保存到我的出片
    saveShot() {
      if (this.savedShot) {
        this.showToast('已经保存过啦', 'info');
        return;
      }
      const shot = {
        id: 'shot_' + Date.now(),
        poseId: this.lastPose?.id || '',
        poseTitle: this.lastPose?.title || '未知姿势',
        reference: this.lastPose?.reference || '',
        captured: this.lastCapture,
        filter: this.selectedFilter,
        similarity: this.similarity,
        createdAt: Date.now()
      };
      this.myShots.unshift(shot);
      this.saveShots();
      this.savedShot = true;
      this.showToast('已保存到「我的出片」', 'success');
    },

    async shareTo(platform) {
      // 保存到相册：直接下载图片
      if (platform === 'save') {
        if (this.lastCapture) {
          const link = document.createElement('a');
          link.href = this.lastCapture;
          link.download = `pianke_${Date.now()}.jpg`;
          link.click();
        }
        this.showToast('已保存到相册', 'success');
        return;
      }

      // 尝试使用 Web Share API（需 HTTPS）
      if (navigator.share && this.lastCapture) {
        try {
          const response = await fetch(this.lastCapture);
          const blob = await response.blob();
          const file = new File([blob], 'pianke-shot.jpg', { type: 'image/jpeg' });
          await navigator.share({
            title: '片刻 Pianke - 我的出片',
            text: `我用「片刻」拍出了 ${this.similarity}% 相似度的照片！`,
            files: [file]
          });
          this.showToast('分享成功', 'success');
          return;
        } catch (e) {
          // 用户取消或不支持，降级处理
        }
      }

      // 降级：复制文案到剪贴板
      const shareText = `我用「片刻」拍出了 ${this.similarity}% 相似度的「${this.lastPose?.title || '照片'}」！快来试试吧`;
      try {
        await navigator.clipboard.writeText(shareText);
      } catch (e) { /* ignore */ }

      const msgs = {
        wechat: '已复制文案，可粘贴到微信',
        moments: '已复制文案，可发朋友圈',
        xhs: '已复制小红书文案'
      };
      this.showToast(msgs[platform] || '分享成功', 'success');
    },

    // ===== 我的出片 =====
    loadShots() {
      try {
        const raw = localStorage.getItem('pianke_shots');
        this.myShots = raw ? JSON.parse(raw) : [];
      } catch (e) {
        this.myShots = [];
      }
    },

    saveShots() {
      try {
        localStorage.setItem('pianke_shots', JSON.stringify(this.myShots));
      } catch (e) {
        this.showToast('存储已满，请删除旧照片', 'error');
      }
    },

    deleteShot(id) {
      this.myShots = this.myShots.filter(s => s.id !== id);
      this.saveShots();
      this.showToast('已删除', 'info');
    },

    formatTime(ts) {
      const d = new Date(ts);
      const M = d.getMonth() + 1;
      const D = d.getDate();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${M}月${D}日 ${h}:${m}`;
    },

    // ===== 发现/地图 =====
    selectSpot(spot) {
      this.selectedSpot = spot;
    },

    navigateTo(spot) {
      this.showToast(`正在打开导航：${spot.name}`, 'info');
    },

    filteredSpots() {
      if (this.spotFilter === 'all') return this.spots;
      return this.spots.filter(s => s.tags.includes(this.spotFilter));
    },

    selectSpotCategory(cat) {
      this.spotFilter = cat;
    },

    // ===== 搜索 =====
    openSearch() {
      this.searchOpen = true;
      this.$nextTick(() => {
        const input = this.$refs.searchInput;
        if (input) input.focus();
      });
    },

    searchResults() {
      const q = this.searchKeyword.trim().toLowerCase();
      if (!q) return { poses: [], themes: [], spots: [] };
      const poses = this.themes.flatMap(t => t.poses).filter(p =>
        p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      ).slice(0, 8);
      const themes = this.themes.filter(t =>
        t.name.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
      );
      const spots = this.spots.filter(s =>
        s.name.toLowerCase().includes(q) || s.tags.some(tag => tag.toLowerCase().includes(q))
      );
      return { poses, themes, spots };
    },

    loadSearchHistory() {
      try {
        const raw = localStorage.getItem('pianke_search_history');
        this.searchHistory = raw ? JSON.parse(raw) : [];
      } catch (e) { this.searchHistory = []; }
    },

    saveSearchHistory() {
      try {
        localStorage.setItem('pianke_search_history', JSON.stringify(this.searchHistory.slice(0, 10)));
      } catch (e) { /* ignore */ }
    },

    addSearchHistory(keyword) {
      if (!keyword || !keyword.trim()) return;
      const k = keyword.trim();
      this.searchHistory = [k, ...this.searchHistory.filter(h => h !== k)].slice(0, 10);
      this.saveSearchHistory();
    },

    clearSearchHistory() {
      this.searchHistory = [];
      this.saveSearchHistory();
    },

    // ===== 视频跟拍 =====
    async startVideoCamera() {
      const video = this.$refs.videoCamera;
      if (!video) return;
      try {
        await window.PKCamera.init(video);
        this.cameraReady = true;
      } catch (err) {
        this.cameraError = err.message;
      }
    },

    setSpeed(s) {
      this.videoSpeed = s;
      const ref = this.$refs.refVideo;
      if (ref) ref.playbackRate = s;
    },

    async toggleRecording() {
      if (!this.videoRecording) {
        // 开始录制
        const started = window.PKCamera.startRecording();
        if (started) {
          this.videoRecording = true;
          this.showToast('开始录制', 'info');
        } else {
          this.showToast('录制启动失败', 'error');
        }
      } else {
        // 停止录制
        this.videoRecording = false;
        const url = await window.PKCamera.stopRecording();
        if (url) {
          this.recordedVideoUrl = url;
          this.showToast('录制完成，视频已生成', 'success');
          // 提供下载
          const link = document.createElement('a');
          link.href = url;
          link.download = `pianke_video_${Date.now()}.webm`;
          link.click();
        } else {
          this.showToast('已停止录制', 'info');
        }
      }
    },

    // ===== Toast =====
    showToast(msg, type = 'info') {
      this.toast = { show: true, msg, type };
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        this.toast.show = false;
      }, 2200);
    },

    // ===== 难度星星 =====
    difficultyStars(n) {
      return '★'.repeat(n) + '☆'.repeat(5 - n);
    },

    // ===== 标签颜色 =====
    themeColor(themeId) {
      const t = this.themes.find(x => x.id === themeId);
      return t ? t.color : '#534AB7';
    },

    // ===== 社区广场 =====
    toggleLike(post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      this.saveFeedLikes();
      if (post.liked) this.showToast('已点赞', 'success');
    },

    loadFeedLikes() {
      try {
        const raw = localStorage.getItem('pianke_feed_likes');
        const likes = raw ? JSON.parse(raw) : {};
        this.feed.forEach(post => {
          if (likes[post.id] !== undefined) {
            post.liked = likes[post.id];
          }
        });
      } catch (e) { /* ignore */ }
    },

    saveFeedLikes() {
      try {
        const likes = {};
        this.feed.forEach(post => { likes[post.id] = post.liked; });
        localStorage.setItem('pianke_feed_likes', JSON.stringify(likes));
      } catch (e) { /* ignore */ }
    },

    commentPost(post) {
      this.showToast('评论功能开发中', 'info');
    },

    sharePost(post) {
      this.showToast('已复制分享链接', 'success');
    },

    // 跳到帖子对应的姿势
    goToPoseFromPost(post) {
      // 根据 poseTitle 在主题里找
      const pose = this.themes.flatMap(t => t.poses).find(p => p.title === post.poseTitle);
      if (pose) {
        this.enterCamera(pose);
      } else {
        this.showToast('姿势已收录，去试试吧', 'info');
        this.go('home');
      }
    },

    // 打开帖子详情页
    openPostDetail(post) {
      // 根据 poseTitle 查找对应的姿势数据
      const pose = this.themes.flatMap(t => t.poses).find(p => p.title === post.poseTitle);
      this.postDetail = { ...post, pose: pose || null };
    },

    // 关闭帖子详情页
    closePostDetail() {
      this.postDetail = null;
    }
  };
}
