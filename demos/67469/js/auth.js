const Auth = {
  register(username, password, interests = []) {
    if (!username || !password) {
      return { success: false, message: '用户名和密码不能为空' };
    }
    
    if (username.length < 3) {
      return { success: false, message: '用户名至少3个字符' };
    }
    
    if (password.length < 6) {
      return { success: false, message: '密码至少6个字符' };
    }

    const existingUser = Storage.findUserByUsername(username);
    if (existingUser) {
      return { success: false, message: '用户名已存在' };
    }

    const avatars = ['🦊', '🐰', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐱', '🐶'];
    const user = {
      id: Utils.generateId(),
      username,
      password: this.simpleEncrypt(password),
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      interests,
      level: 1,
      exp: 0,
      totalLearnTime: 0,
      completedCourses: [],
      signInDays: 0,
      lastSignInDate: null,
      badges: [],
      works: [],
      createdAt: Date.now()
    };

    Storage.addUser(user);
    Storage.setCurrentUser(user.id);
    
    return { success: true, user, message: '注册成功' };
  },

  login(username, password) {
    if (!username || !password) {
      return { success: false, message: '用户名和密码不能为空' };
    }

    const user = Storage.findUserByUsername(username);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }

    if (this.simpleDecrypt(user.password) !== password) {
      return { success: false, message: '密码错误' };
    }

    Storage.setCurrentUser(user.id);
    return { success: true, user, message: '登录成功' };
  },

  logout() {
    Storage.clearCurrentUser();
  },

  isLoggedIn() {
    return Storage.getCurrentUser() !== null;
  },

  getCurrentUser() {
    return Storage.getCurrentUser();
  },

  updateUser(updates) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    return Storage.updateUser(currentUser.id, updates);
  },

  addExp(amount) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    
    const newExp = currentUser.exp + amount;
    const oldLevel = Utils.levelFromExp(currentUser.exp);
    const newLevel = Utils.levelFromExp(newExp);
    
    const updated = Storage.updateUser(currentUser.id, { exp: newExp });
    
    if (newLevel > oldLevel) {
      Utils.celebrate();
      Utils.toast(`🎉 恭喜升级到 Lv.${newLevel}！`, 'success');
      this.checkBadges();
    }
    
    return updated;
  },

  addLearnTime(minutes) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    
    const newTime = currentUser.totalLearnTime + minutes;
    return Storage.updateUser(currentUser.id, { totalLearnTime: newTime });
  },

  completeCourse(courseId) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    
    const completedCourses = [...new Set([...currentUser.completedCourses, courseId])];
    const updated = Storage.updateUser(currentUser.id, { completedCourses });
    
    this.addExp(50);
    this.checkBadges();
    
    return updated;
  },

  addWork(workId) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    
    const works = [...currentUser.works, workId];
    const updated = Storage.updateUser(currentUser.id, { works });
    
    this.checkBadges();
    
    return updated;
  },

  signIn() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    
    const today = new Date().toDateString();
    const lastSignIn = currentUser.lastSignInDate ? new Date(currentUser.lastSignInDate).toDateString() : null;
    
    if (lastSignIn === today) {
      return { success: false, message: '今天已经签到过啦~', signInDays: currentUser.signInDays };
    }
    
    const newSignInDays = currentUser.signInDays + 1;
    const updated = Storage.updateUser(currentUser.id, {
      signInDays: newSignInDays,
      lastSignInDate: new Date().toISOString()
    });
    
    this.addExp(10);
    this.checkBadges();
    
    return { success: true, message: `签到成功！连续签到 ${newSignInDays} 天`, signInDays: newSignInDays };
  },

  canSignInToday() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    
    const today = new Date().toDateString();
    const lastSignIn = currentUser.lastSignInDate ? new Date(currentUser.lastSignInDate).toDateString() : null;
    return lastSignIn !== today;
  },

  checkBadges() {
    const user = this.getCurrentUser();
    if (!user) return [];
    
    const allBadges = Storage.getBadges();
    const newBadges = [];
    
    if (user.completedCourses.length >= 1 && !user.badges.includes('b1')) {
      newBadges.push('b1');
    }
    if (user.completedCourses.length >= 5 && !user.badges.includes('b2')) {
      newBadges.push('b2');
    }
    if (user.works.length >= 1 && !user.badges.includes('b3')) {
      newBadges.push('b3');
    }
    
    const works = Storage.getWorksByUser(user.id);
    const totalLikes = works.reduce((sum, w) => sum + w.likes, 0);
    if (totalLikes >= 100 && !user.badges.includes('b4')) {
      newBadges.push('b4');
    }
    
    const courses = Storage.getCourses();
    const categories = ['handmade', 'painting', 'photo', 'food', 'video'];
    
    for (const cat of categories) {
      const catCourses = courses.filter(c => c.category === cat);
      const completedInCat = catCourses.filter(c => user.completedCourses.includes(c.id));
      if (completedInCat.length >= catCourses.length && catCourses.length > 0) {
        const badgeId = { handmade: 'b5', painting: 'b6', photo: 'b7', food: 'b8', video: 'b9' }[cat];
        if (badgeId && !user.badges.includes(badgeId)) {
          newBadges.push(badgeId);
        }
      }
    }
    
    const hasAllCategories = categories.every(cat => 
      user.completedCourses.some(cid => {
        const course = Storage.getCourseById(cid);
        return course && course.category === cat;
      })
    );
    if (hasAllCategories && !user.badges.includes('b10')) {
      newBadges.push('b10');
    }
    
    if (newBadges.length > 0) {
      const allBadgeIds = [...new Set([...user.badges, ...newBadges])];
      Storage.updateUser(user.id, { badges: allBadgeIds });
      
      newBadges.forEach((bid, i) => {
        const badge = allBadges.find(b => b.id === bid);
        if (badge) {
          setTimeout(() => {
            Utils.toast(`🏆 获得新徽章：${badge.name}！`, 'success');
          }, i * 1000);
        }
      });
    }
    
    return newBadges;
  },

  simpleEncrypt(str) {
    return btoa(encodeURIComponent(str));
  },

  simpleDecrypt(str) {
    try {
      return decodeURIComponent(atob(str));
    } catch {
      return '';
    }
  }
};
