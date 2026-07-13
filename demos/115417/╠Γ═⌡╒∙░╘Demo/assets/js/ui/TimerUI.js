class TimerUI extends UI {
  constructor(containerId) {
    super(containerId);
    this.timeLimit = 180;
    this.remainingTime = 180;
    this.timerInterval = null;
    this.onTimeout = null;
  }

  render() {
    this.clear();
    
    const timerDiv = this.createElement('div', 'timer');
    timerDiv.textContent = this.formatTime(this.remainingTime);
    
    this.container.appendChild(timerDiv);
  }

  start(timeLimit = 180) {
    this.timeLimit = timeLimit;
    this.remainingTime = timeLimit;
    this.render();
    
    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.render();
      
      if (this.remainingTime <= 0) {
        this.stop();
        if (this.onTimeout) {
          this.onTimeout();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  reset() {
    this.stop();
    this.remainingTime = this.timeLimit;
    this.render();
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  setOnTimeout(callback) {
    this.onTimeout = callback;
  }

  getRemainingTime() {
    return this.remainingTime;
  }
}