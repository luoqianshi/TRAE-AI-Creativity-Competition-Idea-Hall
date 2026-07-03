class WordApp {
  constructor() {
    this.currentBook = 'cet4';
    this.words = [];
    this.currentIndex = 0;
    this.rememberedCount = 0;
    this.forgottenCount = 0;
    this.isFlipped = false;
    this.isAnimating = false;
    this.forgottenWords = [];

    this.initElements();
    this.initEvents();
    this.loadBook(this.currentBook);
  }

  initElements() {
    this.mainCard = document.getElementById('mainCard');
    this.wordEl = document.getElementById('word');
    this.wordBackEl = document.getElementById('wordBack');
    this.phoneticEl = document.getElementById('phonetic');
    this.translationEl = document.getElementById('translation');
    this.exampleEl = document.getElementById('example');
    this.relatedCardsEl = document.getElementById('relatedCards');
    this.showAnswerBtn = document.getElementById('showAnswerBtn');
    this.forgotBtn = document.getElementById('forgotBtn');
    this.rememberBtn = document.getElementById('rememberBtn');
    this.rememberedCountEl = document.getElementById('rememberedCount');
    this.forgottenCountEl = document.getElementById('forgottenCount');
    this.bookSelect = document.getElementById('bookSelect');
    this.emptyState = document.getElementById('emptyState');
    this.restartBtn = document.getElementById('restartBtn');
    this.cardArea = document.querySelector('.card-area');
  }

  initEvents() {
    this.showAnswerBtn.addEventListener('click', () => this.flipCard());
    this.forgotBtn.addEventListener('click', () => this.handleForgot());
    this.rememberBtn.addEventListener('click', () => this.handleRemember());
    this.bookSelect.addEventListener('change', (e) => {
      this.loadBook(e.target.value);
    });
    this.restartBtn.addEventListener('click', () => this.restart());
  }

  async loadBook(bookId, resume = true) {
    this.currentBook = bookId;
    this.rememberedCount = 0;
    this.forgottenCount = 0;
    this.forgottenWords = [];
    this.isFlipped = false;
    this.isAnimating = false;

    this.updateStats();
    this.words = await fetchWordBook(bookId);
    this.shuffleWords();

    if (resume) {
      const saved = this.loadProgress();
      if (saved && saved.bookId === bookId) {
        this.rememberedCount = saved.rememberedCount || 0;
        this.forgottenCount = saved.forgottenCount || 0;
        this.currentIndex = saved.currentIndex || 0;
        this.forgottenWords = saved.forgottenWords || [];
        if (saved.remainingWords && saved.remainingWords.length > 0) {
          const remainingSet = new Set(saved.remainingWords);
          this.words = this.words.filter(w => remainingSet.has(w.word));
          if (this.words.length === 0) {
            this.words = saved.remainingWords.map(w => ({ word: w, translation: '', phonetic: '', example: '', related: [] }));
          }
        }
        this.updateStats();
      }
    }

    this.currentIndex = 0;

    if (this.words.length > 0) {
      this.emptyState.style.display = 'none';
      this.cardArea.style.display = 'flex';
      this.showCurrentWord();
    } else {
      this.showEmpty();
    }
  }

  saveProgress() {
    const remainingWords = this.words.slice(this.currentIndex).map(w => w.word);
    const data = {
      bookId: this.currentBook,
      rememberedCount: this.rememberedCount,
      forgottenCount: this.forgottenCount,
      currentIndex: 0,
      remainingWords: remainingWords,
      forgottenWords: this.forgottenWords.map(w => w.word)
    };
    try {
      localStorage.setItem('wordApp_progress', JSON.stringify(data));
    } catch (e) {}
  }

  loadProgress() {
    try {
      const data = localStorage.getItem('wordApp_progress');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  clearProgress() {
    try {
      localStorage.removeItem('wordApp_progress');
    } catch (e) {}
  }

  shuffleWords() {
    for (let i = this.words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.words[i], this.words[j]] = [this.words[j], this.words[i]];
    }
  }

  showCurrentWord() {
    if (this.currentIndex >= this.words.length) {
      this.showEmpty();
      return;
    }

    const word = this.words[this.currentIndex];
    this.wordEl.textContent = word.word;
    this.wordBackEl.textContent = word.word;
    this.phoneticEl.textContent = word.phonetic || '';
    this.translationEl.textContent = '';
    this.exampleEl.textContent = '';

    this.mainCard.classList.remove('flipped', 'fly-out-right', 'fly-out-left');
    this.isFlipped = false;

    this.renderRelatedWords(word);
  }

  renderRelatedWords(word) {
    this.relatedCardsEl.innerHTML = '';
    const related = word.related || [];
    if (related.length === 0) return;

    const positions = [
      { top: '5%', left: '5%', rotate: -12 },
      { top: '8%', right: '8%', rotate: 10 },
      { top: '40%', left: '2%', rotate: -8 },
      { top: '45%', right: '3%', rotate: 9 },
      { bottom: '10%', left: '8%', rotate: 8 },
      { bottom: '6%', right: '6%', rotate: -10 },
    ];

    const count = Math.min(related.length, 6);
    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      card.className = 'related-card';
      const pos = positions[i];
      card.style.top = pos.top;
      card.style.left = pos.left;
      card.style.right = pos.right;
      card.style.bottom = pos.bottom;
      card.style.transform = `rotate(${pos.rotate}deg)`;

      const relatedWord = related[i];
      const trans = this.findTranslation(relatedWord);
      card.innerHTML = `
        <div class="related-word">${relatedWord}</div>
        ${trans ? `<div class="related-trans">${trans}</div>` : ''}
      `;
      card.addEventListener('click', () => this.handleRelatedWordClick(relatedWord));
      this.relatedCardsEl.appendChild(card);
    }
  }

  handleRelatedWordClick(word) {
    const foundIndex = this.words.findIndex(w => w.word.toLowerCase() === word.toLowerCase());
    if (foundIndex !== -1 && foundIndex !== this.currentIndex) {
      const found = this.words[foundIndex];
      this.words.splice(foundIndex, 1);
      this.words.splice(this.currentIndex, 0, found);
      this.showCurrentWord();
      this.mainCard.classList.add('fly-in');
      setTimeout(() => {
        this.mainCard.classList.remove('fly-in');
      }, 400);
    }
  }

  findTranslation(word) {
    const found = this.words.find(w => w.word.toLowerCase() === word.toLowerCase());
    return found ? found.translation.split(';')[0].split(',')[0] : '';
  }

  async flipCard() {
    if (this.isAnimating) return;
    const word = this.words[this.currentIndex];
    if (word) {
      this.translationEl.textContent = word.translation || '';
      this.exampleEl.textContent = word.example || '';
      await this.fetchDictionaryData(word.word);
    }
    this.mainCard.classList.add('flipped');
    this.isFlipped = true;
  }

  async fetchDictionaryData(word) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const entry = data[0];
        this.playAudio(entry.phonetics);
      }
    } catch (error) {
      console.warn('Dictionary API failed:', error);
    }
  }

  playAudio(phonetics) {
    const phoneticWithAudio = phonetics?.find(p => p.audio);
    if (phoneticWithAudio?.audio) {
      const audio = new Audio(phoneticWithAudio.audio);
      audio.play().catch(e => console.warn('Audio play failed:', e));
    }
  }

  renderMeanings(meanings) {
    if (!meanings || meanings.length === 0) return;
    const definitions = meanings.flatMap(m => m.definitions.map(d => ({
      partOfSpeech: m.partOfSpeech,
      definition: d.definition,
      example: d.example
    })));
    const first = definitions[0];
    this.translationEl.textContent = first ? `${first.partOfSpeech}. ${first.definition}` : '';
    this.exampleEl.textContent = first?.example ? `"${first.example}"` : '';
  }

  handleRemember() {
    if (this.isAnimating || !this.isFlipped) return;
    this.isAnimating = true;
    this.rememberedCount++;
    this.updateStats();
    this.mainCard.classList.add('fly-out-right');
    this.flyOutRelated('right');
    this.saveProgress();

    setTimeout(() => {
      this.nextWord();
    }, 550);
  }

  handleForgot() {
    if (this.isAnimating || !this.isFlipped) return;
    this.isAnimating = true;
    this.forgottenCount++;
    this.forgottenWords.push(this.words[this.currentIndex]);
    this.updateStats();
    this.mainCard.classList.add('fly-out-left');
    this.flyOutRelated('left');
    this.saveProgress();

    setTimeout(() => {
      this.nextWord();
    }, 550);
  }

  flyOutRelated(direction) {
    const cards = this.relatedCardsEl.querySelectorAll('.related-card');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease-out';
        if (direction === 'right') {
          card.style.transform = `translateX(400px) rotate(${30 + i * 5}deg)`;
        } else {
          card.style.transform = `translateX(-400px) rotate(${-30 - i * 5}deg)`;
        }
        card.style.opacity = '0';
      }, i * 30);
    });
  }

  nextWord() {
    this.currentIndex++;
    if (this.currentIndex >= this.words.length) {
      if (this.forgottenWords.length > 0) {
        this.words = [...this.forgottenWords];
        this.forgottenWords = [];
        this.currentIndex = 0;
        this.shuffleWords();
        this.showCurrentWord();
        this.isAnimating = false;
      } else {
        this.showEmpty();
        this.isAnimating = false;
      }
    } else {
      this.showCurrentWord();
      this.isAnimating = false;
    }
  }

  updateStats() {
    this.rememberedCountEl.textContent = this.rememberedCount;
    this.forgottenCountEl.textContent = this.forgottenCount;
  }

  showEmpty() {
    this.cardArea.style.display = 'none';
    this.emptyState.style.display = 'flex';
  }

  restart() {
    this.clearProgress();
    this.loadBook(this.currentBook, false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WordApp();
});
