const Utils = {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  formatDate(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  formatTime(minutes) {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}小时`;
    return `${hours}小时${mins}分钟`;
  },

  levelFromExp(exp) {
    return Math.floor(exp / 100) + 1;
  },

  expForLevel(level) {
    return (level - 1) * 100;
  },

  expProgress(exp) {
    const level = this.levelFromExp(exp);
    const currentLevelExp = this.expForLevel(level);
    const nextLevelExp = this.expForLevel(level + 1);
    return ((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
  },

  getDifficultyLabel(difficulty) {
    const labels = {
      beginner: '入门',
      elementary: '初级',
      intermediate: '中级',
      advanced: '高级',
      master: '精通'
    };
    return labels[difficulty] || difficulty;
  },

  getDifficultyClass(difficulty) {
    return `badge-${difficulty}`;
  },

  getDifficultyLevels() {
    return [
      { key: 'beginner', label: '入门', icon: '🎯' },
      { key: 'elementary', label: '初级', icon: '📈' },
      { key: 'intermediate', label: '中级', icon: '💪' },
      { key: 'advanced', label: '高级', icon: '🏆' },
      { key: 'master', label: '精通', icon: '👑' }
    ];
  },

  getDifficultyScore(difficulty) {
    const scores = {
      beginner: 10,
      elementary: 20,
      intermediate: 40,
      advanced: 80,
      master: 150
    };
    return scores[difficulty] || 0;
  },

  calculateUserDifficultyScore(user, courses) {
    if (!user || !user.completedCourses || !courses) return 0;
    return user.completedCourses.reduce((total, courseId) => {
      const course = courses.find(c => c.id === courseId);
      return total + (course ? this.getDifficultyScore(course.difficulty) : 0);
    }, 0);
  },

  getCategoryEmoji(category) {
    const emojis = {
      handmade: '🧶',
      painting: '🎨',
      photo: '📷',
      food: '🍳',
      video: '🎬'
    };
    return emojis[category] || '✨';
  },

  getCategoryName(category) {
    const names = {
      handmade: '手工',
      painting: '绘画',
      photo: '摄影',
      food: '手作美食',
      video: '数码剪辑'
    };
    return names[category] || category;
  },

  getCategoryColor(category) {
    const colors = {
      handmade: { bg: '#FFE0D0', text: '#E67329' },
      painting: { bg: '#D0F0EE', text: '#26A69A' },
      photo: { bg: '#E0D4EF', text: '#7E57C2' },
      food: { bg: '#FFE4D0', text: '#EF6C00' },
      video: { bg: '#D4E8FF', text: '#1976D2' }
    };
    return colors[category] || { bg: '#F0F0F0', text: '#666' };
  },

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  celebrate() {
    const colors = ['#FF8C42', '#4ECDC4', '#9B89B3', '#FFD93D', '#FF6B6B'];
    const container = document.createElement('div');
    container.className = 'confetti';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.5}s`;
      piece.style.width = `${Math.random() * 8 + 6}px`;
      piece.style.height = `${Math.random() * 8 + 6}px`;
      container.appendChild(piece);
    }

    setTimeout(() => {
      container.remove();
    }, 3500);
  },

  toast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      padding: 12px 24px;
      border-radius: 999px;
      font-weight: 600;
      z-index: 9999;
      opacity: 0;
      transition: all 0.3s ease;
      color: white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    `;
    
    if (type === 'success') {
      toast.style.background = 'linear-gradient(135deg, #4ECDC4, #26A69A)';
    } else if (type === 'error') {
      toast.style.background = 'linear-gradient(135deg, #FF6B6B, #E53935)';
    } else {
      toast.style.background = 'linear-gradient(135deg, #FF8C42, #E67329)';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};
