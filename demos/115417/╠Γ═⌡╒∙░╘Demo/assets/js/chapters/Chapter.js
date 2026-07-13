class Chapter {
  constructor(id, name, icon, color) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.color = color;
    this.levels = [];
    this.totalLevels = 10;
  }

  getLevel(levelNumber) {
    return this.levels.find(l => l.levelNumber === levelNumber);
  }

  getLevelQuestions(levelNumber) {
    const level = this.getLevel(levelNumber);
    return level ? level.questions : [];
  }

  getLevelInfo(levelNumber) {
    const level = this.getLevel(levelNumber);
    return level ? {
      name: level.name,
      description: level.description,
      difficulty: level.difficulty,
      timeLimit: level.timeLimit,
      questionCount: level.questions.length
    } : null;
  }

  unlockLevel(levelNumber) {
    const level = this.getLevel(levelNumber);
    if (level && !level.unlocked) {
      level.unlocked = true;
    }
  }

  isLevelUnlocked(levelNumber) {
    if (levelNumber === 1) return true;
    const prevLevel = this.getLevel(levelNumber - 1);
    return prevLevel && prevLevel.completed;
  }

  markLevelCompleted(levelNumber, stars) {
    const level = this.getLevel(levelNumber);
    if (level) {
      level.completed = true;
      level.stars = stars;
    }
  }

  getAllLevels() {
    return this.levels;
  }
}
