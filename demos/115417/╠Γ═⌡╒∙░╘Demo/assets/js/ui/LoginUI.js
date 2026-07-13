class LoginUI extends UI {
  constructor(containerId) {
    super(containerId);
    this.onPreview = null;
  }

  render() {
    this.clear();

    const loginContainer = this.createElement('div', 'login-container');
    gsap.set(loginContainer, { opacity: 0 });
    
    const titleParchment = this.createElement('div', 'title-parchment');
    gsap.set(titleParchment, { opacity: 0, scale: 0.8, y: -50 });
    
    const corner1 = this.createElement('div', 'corner-decoration');
    gsap.set(corner1, { opacity: 0, scale: 0 });
    titleParchment.appendChild(corner1);
    const corner2 = this.createElement('div', 'corner-decoration');
    gsap.set(corner2, { opacity: 0, scale: 0 });
    titleParchment.appendChild(corner2);
    const corner3 = this.createElement('div', 'corner-decoration');
    gsap.set(corner3, { opacity: 0, scale: 0 });
    titleParchment.appendChild(corner3);
    const corner4 = this.createElement('div', 'corner-decoration');
    gsap.set(corner4, { opacity: 0, scale: 0 });
    titleParchment.appendChild(corner4);
    
    const title = this.createElement('h1', 'login-title');
    title.textContent = '题王争霸';
    gsap.set(title, { opacity: 0, y: 30 });
    
    const subtitle = this.createElement('p', 'login-subtitle');
    subtitle.textContent = 'THE KING OF KNOWLEDGE';
    gsap.set(subtitle, { opacity: 0, y: 20 });
    
    titleParchment.appendChild(title);
    titleParchment.appendChild(subtitle);
    
    const form = this.createElement('form', 'login-form');
    gsap.set(form, { opacity: 0, y: 50 });
    
    const previewButton = this.createElement('button', 'preview-button');
    gsap.set(previewButton, { opacity: 0, scale: 0.8 });
    
    const previewRune1 = this.createElement('span', 'btn-rune');
    previewRune1.textContent = '◎';
    gsap.set(previewRune1, { opacity: 0, rotation: -180 });
    previewButton.appendChild(previewRune1);
    const previewRune2 = this.createElement('span', 'btn-rune');
    previewRune2.textContent = '◉';
    gsap.set(previewRune2, { opacity: 0, rotation: 180 });
    previewButton.appendChild(previewRune2);
    
    const previewButtonText = this.createElement('span');
    previewButtonText.textContent = '高一上学期预习';
    gsap.set(previewButtonText, { opacity: 0, scale: 0.5 });
    previewButton.appendChild(previewButtonText);
    
    previewButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      gsap.to(loginContainer, {
        opacity: 0,
        scale: 0.9,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          if (this.onPreview) {
            this.onPreview();
          }
        }
      });
    });

    form.appendChild(previewButton);

    loginContainer.appendChild(titleParchment);
    loginContainer.appendChild(form);

    this.container.appendChild(loginContainer);

    this.playAnimations();
  }

  playAnimations() {
    const tl = gsap.timeline();
    
    tl.to('.login-container', {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    })
    .to('.title-parchment', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: 'back.out(1.7)'
    }, '-=0.3')
    .to('.login-title', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.5')
    .to('.login-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.4')
    .to('.corner-decoration', {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.3')
    .to('.login-form', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2')
    .to('.preview-button', {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(1.5)'
    }, '-=0.1')
    .to('.preview-button .btn-rune', {
      opacity: 1,
      rotation: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.2')
    .to('.preview-button span:last-child', {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    }, '-=0.1');
  }

  setOnPreview(callback) {
    this.onPreview = callback;
  }
}