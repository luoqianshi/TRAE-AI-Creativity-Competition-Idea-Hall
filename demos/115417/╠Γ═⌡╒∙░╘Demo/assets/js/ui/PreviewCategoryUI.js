class PreviewCategoryUI extends UI {
  constructor(containerId) {
    super(containerId);
    this.onSelectCategory = null;
    this.onLogout = null;
  }

  render() {
    this.clear();

    const categoryContainer = this.createElement('div', 'category-container');
    gsap.set(categoryContainer, { opacity: 0 });
    
    const categoryHeader = this.createElement('div', 'category-header');
    
    const categoryTitle = this.createElement('h2', 'category-title');
    categoryTitle.textContent = '预习模式';
    
    const logoutButton = this.createElement('button', 'logout-button');
    logoutButton.textContent = '退出';
    logoutButton.addEventListener('click', () => {
      if (this.onLogout) {
        this.onLogout();
      }
    });
    
    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(logoutButton);
    
    const welcomeText = this.createElement('p', 'level-info');
    welcomeText.textContent = '选择学科开始预习之旅';
    
    const categoryGrid = this.createElement('div', 'category-grid');
    
    const subjects = [
      { id: 'preview_chinese', name: '语文', icon: 'fa-book-open', color: '#e74c3c' },
      { id: 'preview_math', name: '数学', icon: 'fa-calculator', color: '#3498db' },
      { id: 'preview_english', name: '英语', icon: 'fa-language', color: '#27ae60' },
      { id: 'preview_history', name: '历史', icon: 'fa-landmark', color: '#9b59b6' },
      { id: 'preview_politics', name: '道法', icon: 'fa-heart', color: '#1abc9c' },
      { id: 'preview_geography', name: '地理', icon: 'fa-globe', color: '#f39c12' },
      { id: 'preview_physics', name: '物理', icon: 'fa-bolt', color: '#16a085' },
      { id: 'preview_chemistry', name: '化学', icon: 'fa-flask', color: '#95a5a6' },
      { id: 'preview_biology', name: '生物', icon: 'fa-leaf', color: '#2ecc71' }
    ];
    
    subjects.forEach(subject => {
      const categoryCard = this.createElement('div', 'category-card');
      gsap.set(categoryCard, { opacity: 0, y: 20 });
      
      const categoryIcon = this.createElement('div', 'category-icon');
      categoryIcon.style.borderColor = subject.color;
      categoryIcon.style.color = subject.color;
      
      const icon = this.createElement('i', 'fa', subject.icon);
      categoryIcon.appendChild(icon);
      
      const categoryName = this.createElement('div', 'category-name');
      categoryName.textContent = subject.name;
      categoryName.style.color = subject.color;
      
      categoryCard.appendChild(categoryIcon);
      categoryCard.appendChild(categoryName);
      
      categoryCard.addEventListener('click', () => {
        gsap.to(categoryCard, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            if (this.onSelectCategory) {
              this.onSelectCategory(subject.id);
            }
          }
        });
      });
      
      categoryGrid.appendChild(categoryCard);
    });
    
    categoryContainer.appendChild(categoryHeader);
    categoryContainer.appendChild(welcomeText);
    categoryContainer.appendChild(categoryGrid);
    
    this.container.appendChild(categoryContainer);
    
    gsap.to(categoryContainer, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
    
    gsap.to('.category-card', {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.3
    });
  }

  setOnSelectCategory(callback) {
    this.onSelectCategory = callback;
  }

  setOnLogout(callback) {
    this.onLogout = callback;
  }
}