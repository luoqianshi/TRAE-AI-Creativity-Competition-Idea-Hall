const Storage = {
  KEYS: {
    USERS: 'quxiang_users',
    CURRENT_USER: 'quxiang_current_user',
    COURSES: 'quxiang_courses',
    WORKS: 'quxiang_works',
    PROGRESS: 'quxiang_progress',
    BADGES: 'quxiang_badges',
    INITIALIZED: 'quxiang_initialized',
    VERSION: 'quxiang_version'
  },

  CURRENT_VERSION: '2.5',

  init() {
    const savedVersion = localStorage.getItem(this.KEYS.VERSION);
    if (savedVersion !== this.CURRENT_VERSION) {
      this.setCourses(MockData.courses);
      this.setWorks(MockData.works);
      this.setBadges(MockData.badges);
      if (!savedVersion) {
        this.setUsers([]);
        this.setProgress({});
      }
      localStorage.setItem(this.KEYS.INITIALIZED, 'true');
      localStorage.setItem(this.KEYS.VERSION, this.CURRENT_VERSION);
    }
  },

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },

  getUsers() {
    return this.get(this.KEYS.USERS) || [];
  },

  setUsers(users) {
    this.set(this.KEYS.USERS, users);
  },

  getCurrentUser() {
    const userId = this.get(this.KEYS.CURRENT_USER);
    if (!userId) return null;
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  },

  setCurrentUser(userId) {
    this.set(this.KEYS.CURRENT_USER, userId);
  },

  clearCurrentUser() {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
  },

  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
  },

  updateUser(userId, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.setUsers(users);
      return users[index];
    }
    return null;
  },

  findUserByUsername(username) {
    const users = this.getUsers();
    return users.find(u => u.username === username) || null;
  },

  getCourses() {
    return this.get(this.KEYS.COURSES) || [];
  },

  setCourses(courses) {
    this.set(this.KEYS.COURSES, courses);
  },

  getCourseById(courseId) {
    const courses = this.getCourses();
    return courses.find(c => c.id === courseId) || null;
  },

  getCoursesByCategory(category) {
    const courses = this.getCourses();
    if (!category || category === 'all') return courses;
    return courses.filter(c => c.category === category);
  },

  getCoursesByDifficulty(difficulty) {
    const courses = this.getCourses();
    if (!difficulty || difficulty === 'all') return courses;
    return courses.filter(c => c.difficulty === difficulty);
  },

  getWorks() {
    return this.get(this.KEYS.WORKS) || [];
  },

  setWorks(works) {
    this.set(this.KEYS.WORKS, works);
  },

  addWork(work) {
    const works = this.getWorks();
    works.unshift(work);
    this.setWorks(works);
  },

  getWorksByUser(userId) {
    const works = this.getWorks();
    return works.filter(w => w.userId === userId);
  },

  getWorksByCategory(category) {
    const works = this.getWorks();
    if (!category || category === 'all') return works;
    return works.filter(w => w.category === category);
  },

  getWorkById(workId) {
    const works = this.getWorks();
    return works.find(w => w.id === workId) || null;
  },

  updateWork(workId, updates) {
    const works = this.getWorks();
    const index = works.findIndex(w => w.id === workId);
    if (index !== -1) {
      works[index] = { ...works[index], ...updates };
      this.setWorks(works);
      return works[index];
    }
    return null;
  },

  likeWork(workId) {
    const work = this.getWorkById(workId);
    if (work) {
      return this.updateWork(workId, { likes: work.likes + 1 });
    }
    return null;
  },

  addComment(workId, comment) {
    const work = this.getWorkById(workId);
    if (work) {
      const comments = [...work.comments, comment];
      return this.updateWork(workId, { comments });
    }
    return null;
  },

  getProgress() {
    return this.get(this.KEYS.PROGRESS) || {};
  },

  setProgress(progress) {
    this.set(this.KEYS.PROGRESS, progress);
  },

  getUserProgress(userId) {
    const allProgress = this.getProgress();
    return allProgress[userId] || {};
  },

  getCourseProgress(userId, courseId) {
    const userProgress = this.getUserProgress(userId);
    return userProgress[courseId] || {
      currentChapter: 0,
      completedChapters: [],
      progress: 0,
      lastLearnTime: null
    };
  },

  updateCourseProgress(userId, courseId, updates) {
    const allProgress = this.getProgress();
    if (!allProgress[userId]) {
      allProgress[userId] = {};
    }
    const current = allProgress[userId][courseId] || {
      currentChapter: 0,
      completedChapters: [],
      progress: 0,
      lastLearnTime: null
    };
    allProgress[userId][courseId] = { ...current, ...updates, lastLearnTime: Date.now() };
    this.setProgress(allProgress);
    return allProgress[userId][courseId];
  },

  completeChapter(userId, courseId, chapterIndex) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const progress = this.getCourseProgress(userId, courseId);
    const completedChapters = [...new Set([...progress.completedChapters, chapterIndex])];
    const totalChapters = course.chapters.length;
    const progressPercent = Math.round((completedChapters.length / totalChapters) * 100);

    return this.updateCourseProgress(userId, courseId, {
      currentChapter: chapterIndex,
      completedChapters,
      progress: progressPercent
    });
  },

  getBadges() {
    return this.get(this.KEYS.BADGES) || [];
  },

  setBadges(badges) {
    this.set(this.KEYS.BADGES, badges);
  },

  getRecommendedCourses(userId, limit = 6) {
    const courses = this.getCourses();
    const user = this.getCurrentUser();
    
    if (user && user.interests && user.interests.length > 0) {
      const interestCourses = courses.filter(c => user.interests.includes(c.category));
      const otherCourses = courses.filter(c => !user.interests.includes(c.category));
      const shuffled = [...Utils.shuffleArray(interestCourses), ...Utils.shuffleArray(otherCourses)];
      return shuffled.slice(0, limit);
    }
    
    return Utils.shuffleArray(courses).slice(0, limit);
  },

  getContinueLearning(userId, limit = 4) {
    const userProgress = this.getUserProgress(userId);
    const inProgress = [];
    
    for (const [courseId, progress] of Object.entries(userProgress)) {
      if (progress.progress > 0 && progress.progress < 100) {
        const course = this.getCourseById(courseId);
        if (course) {
          inProgress.push({ ...course, userProgress: progress });
        }
      }
    }
    
    inProgress.sort((a, b) => {
      return new Date(b.userProgress.lastLearnTime) - new Date(a.userProgress.lastLearnTime);
    });
    
    return inProgress.slice(0, limit);
  }
};
