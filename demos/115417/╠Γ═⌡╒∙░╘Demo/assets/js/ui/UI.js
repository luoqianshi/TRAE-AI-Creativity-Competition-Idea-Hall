class UI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.gameManager = null;
    this.animManager = new AnimationManager();
  }

  setGameManager(gameManager) {
    this.gameManager = gameManager;
  }

  render() {
    this.container.innerHTML = '';
  }

  show() {
    this.container.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
  }

  clear() {
    this.container.innerHTML = '';
  }

  createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  createButton(text, onClick, className) {
    const button = this.createElement('button', className);
    button.textContent = text;
    button.addEventListener('click', onClick);
    
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
    
    return button;
  }

  createInput(type, placeholder, className) {
    const input = this.createElement('input', className);
    input.type = type;
    input.placeholder = placeholder;
    
    input.addEventListener('focus', () => {
      gsap.to(input, {
        scale: 1.02,
        boxShadow: '0 0 20px rgba(184, 134, 11, 0.5)',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    input.addEventListener('blur', () => {
      gsap.to(input, {
        scale: 1,
        boxShadow: 'none',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    return input;
  }

  createCard(title, content) {
    const card = this.createElement('div', 'card');
    const cardHeader = this.createElement('div', 'card-header');
    cardHeader.textContent = title;
    const cardBody = this.createElement('div', 'card-body');
    cardBody.innerHTML = content;
    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    return card;
  }

  animateIn(type = 'fade', element = null) {
    const target = element || this.container;
    switch (type) {
      case 'slideLeft':
        this.animManager.slideInFromLeft(target);
        break;
      case 'slideRight':
        this.animManager.slideInFromRight(target);
        break;
      case 'slideTop':
        this.animManager.slideInFromTop(target);
        break;
      case 'slideBottom':
        this.animManager.slideInFromBottom(target);
        break;
      case 'scale':
        this.animManager.scaleIn(target);
        break;
      case 'bounce':
        this.animManager.bounceIn(target);
        break;
      case 'flip':
        this.animManager.flipIn(target);
        break;
      case 'rotate':
        this.animManager.rotateIn(target);
        break;
      default:
        this.animManager.fadeIn(target);
    }
  }

  animateOut(type = 'fade', callback = null) {
    const target = this.container;
    switch (type) {
      case 'slideLeft':
        gsap.to(target, { x: -100, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: callback });
        break;
      case 'slideRight':
        gsap.to(target, { x: 100, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: callback });
        break;
      case 'scale':
        gsap.to(target, { scale: 0.9, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: callback });
        break;
      default:
        gsap.to(target, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: callback });
    }
  }
}