let strokeAnimator = null;
let currentCharacterIndex = 0;
let currentCharacters = [];

let dictationIndex = 0;
let dictationScore = 0;
let dictationCharacters = [];
let currentDictationChar = null;

let puzzleGame = null;
let radicalGame = null;
let linkGame = null;

let puzzlePieces = [];
let puzzleEmptyIndex = 8;

let radicalParts = [];
let radicalTargetContent = '';

const initStrokeAnimation = (char) => {
    const container = document.getElementById('stroke-canvas-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    strokeAnimator = HanziWriter.create('stroke-canvas-container', char, {
        width: 250,
        height: 250,
        padding: 20,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 500,
        strokeColor: '#FF6B35',
        outlineColor: '#E0E0E0',
        drawingColor: '#FF6B35'
    });
};

const playStrokeAnimation = () => {
    if (strokeAnimator) {
        strokeAnimator.animateCharacter();
    }
};

const pauseStrokeAnimation = () => {
    if (strokeAnimator) {
        strokeAnimator.stopAnimation();
    }
};

const resetStrokeAnimation = () => {
    if (strokeAnimator) {
        strokeAnimator.hideCharacter();
        setTimeout(() => {
            strokeAnimator.animateCharacter();
        }, 300);
    }
};

const showMemoryCharacter = (char) => {
    document.getElementById('memory-character').textContent = char.char;
    document.getElementById('memory-pinyin').textContent = char.pinyin;
    document.getElementById('memory-radical').textContent = '部首: ' + char.radical;
    document.getElementById('memory-stroke').textContent = '笔画: ' + char.strokeCount;
    
    const wordsList = document.getElementById('memory-words');
    wordsList.innerHTML = char.words.map(word => `<span>${word}</span>`).join('');
    
    const sentencesList = document.getElementById('memory-sentences');
    sentencesList.innerHTML = char.sentences.map(sentence => `<p>${sentence}</p>`).join('');
    
    initStrokeAnimation(char.char);
};

const nextCharacter = () => {
    if (currentCharacterIndex < currentCharacters.length - 1) {
        currentCharacterIndex++;
        showMemoryCharacter(currentCharacters[currentCharacterIndex]);
    }
};

const prevCharacter = () => {
    if (currentCharacterIndex > 0) {
        currentCharacterIndex--;
        showMemoryCharacter(currentCharacters[currentCharacterIndex]);
    }
};

const initMemoryMode = () => {
    const userStats = getUserStats();
    currentCharacters = getRandomCharacters(20, userStats.level);
    currentCharacterIndex = 0;
    showMemoryCharacter(currentCharacters[0]);
};

const initDictationMode = () => {
    const userStats = getUserStats();
    dictationCharacters = getRandomCharacters(10, userStats.level);
    dictationIndex = 0;
    dictationScore = 0;
    updateDictationScore();
    loadDictationQuestion();
};

const loadDictationQuestion = () => {
    if (dictationIndex >= dictationCharacters.length) {
        showDictationResult();
        return;
    }
    
    currentDictationChar = dictationCharacters[dictationIndex];
    
    document.getElementById('dictation-pinyin').textContent = '?';
    document.getElementById('dictation-radical').textContent = '?';
    document.getElementById('dictation-stroke').textContent = '?';
    
    document.getElementById('dictation-progress').textContent = `${dictationIndex + 1}/${dictationCharacters.length}`;
    document.getElementById('dictation-progress-fill').style.width = `${((dictationIndex + 1) / dictationCharacters.length) * 100}%`;
    
    const feedback = document.getElementById('dictation-feedback');
    feedback.className = 'feedback-area';
    feedback.innerHTML = '';
    
    clearCanvas();
};

const playDictationAudio = () => {
    if (currentDictationChar) {
        window.speakText(currentDictationChar.char);
    }
};

const showDictationHint = () => {
    if (currentDictationChar) {
        document.getElementById('dictation-pinyin').textContent = currentDictationChar.pinyin;
        document.getElementById('dictation-radical').textContent = currentDictationChar.radical;
        document.getElementById('dictation-stroke').textContent = currentDictationChar.strokeCount;
    }
};

const submitDictation = () => {
    if (!currentDictationChar) return;
    
    showDictationHint();
    
    const feedback = document.getElementById('dictation-feedback');
    const isCorrect = confirm(`正确答案是"${currentDictationChar.char}"，你写对了吗？`);
    
    updateLearningProgress(currentDictationChar.id, isCorrect);
    
    if (isCorrect) {
        dictationScore += 10;
        feedback.className = 'feedback-area correct';
        feedback.innerHTML = `<div class="congratulations">🎉 太棒了！正确！</div>`;
        
        addPoints(10);
    } else {
        feedback.className = 'feedback-area wrong';
        feedback.innerHTML = `<div>😅 没关系，继续加油！</div><div>正确答案：${currentDictationChar.char}</div>`;
        
        addMistakeRecord(currentDictationChar.id, 'writing');
    }
    
    updateDictationScore();
    
    setTimeout(() => {
        dictationIndex++;
        loadDictationQuestion();
    }, 2000);
};

const updateDictationScore = () => {
    document.getElementById('dictation-score').textContent = dictationScore;
};

const showDictationResult = () => {
    const gameArea = document.querySelector('.dictation-container');
    gameArea.innerHTML = `
        <div class="text-center">
            <h2 class="text-3xl font-bold text-orange-500 mb-4">听写完成！</h2>
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <p class="text-xl mb-2">得分：<span class="font-bold text-orange-500">${dictationScore}</span> 分</p>
                <p class="text-lg mb-4">正确率：<span class="font-bold text-green-500">${Math.round((dictationScore / (dictationCharacters.length * 10)) * 100)}%</span></p>
                <button class="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-full text-lg font-bold" onclick="initDictationMode()">
                    再来一次
                </button>
            </div>
        </div>
    `;
    
    saveGameRecord({
        gameType: 'dictation',
        score: dictationScore,
        duration: 0
    });
};

const clearCanvas = () => {
    const canvas = document.getElementById('dictation-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawTianZiGe(ctx, canvas.width, canvas.height);
};

const drawTianZiGe = (ctx, width, height) => {
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    
    ctx.setLineDash([]);
};

const initCanvas = () => {
    const canvas = document.getElementById('dictation-canvas');
    if (!canvas) return;
    
    canvas.width = 300;
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d');
    drawTianZiGe(ctx, canvas.width, canvas.height);
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };
    
    const start = (e) => {
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
    };
    
    const move = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const pos = getPos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        lastX = pos.x;
        lastY = pos.y;
    };
    
    const end = () => {
        isDrawing = false;
    };
    
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseout', end);
    
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
};

const startPuzzleGame = () => {
    const gameArea = document.getElementById('game-area');
    if (!gameArea) return;
    
    const chars = ['明', '好', '学', '家', '花', '树', '日', '月'];
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    
    gameArea.innerHTML = `
        <div class="puzzle-game">
            <h3 class="text-xl font-bold text-orange-500 mb-4">汉字拼图</h3>
            <p class="text-gray-600 mb-4">目标：${randomChar}</p>
            <div class="puzzle-grid" id="puzzle-grid"></div>
            <div class="mt-4">
                <button class="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-full" onclick="startPuzzleGame()">换一个</button>
            </div>
        </div>
    `;
    
    createPuzzle(randomChar);
};

const createPuzzle = (char) => {
    const grid = document.getElementById('puzzle-grid');
    if (!grid) return;
    
    puzzlePieces = [];
    const positions = ['top-left', 'top-center', 'top-right', 
                      'middle-left', 'middle-center', 'middle-right', 
                      'bottom-left', 'bottom-center', 'bottom-right'];
    
    for (let i = 0; i < 9; i++) {
        puzzlePieces.push({
            id: i,
            position: positions[i],
            content: i < 8 ? char : ''
        });
    }
    
    puzzleEmptyIndex = 8;
    
    for (let i = 0; i < 100; i++) {
        const neighbors = getPuzzleNeighbors(puzzleEmptyIndex);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        swapPuzzlePieces(puzzleEmptyIndex, randomNeighbor);
        puzzleEmptyIndex = randomNeighbor;
    }
    
    renderPuzzle();
};

const getPuzzleNeighbors = (index) => {
    const neighbors = [];
    const row = Math.floor(index / 3);
    const col = index % 3;
    
    if (row > 0) neighbors.push(index - 3);
    if (row < 2) neighbors.push(index + 3);
    if (col > 0) neighbors.push(index - 1);
    if (col < 2) neighbors.push(index + 1);
    
    return neighbors;
};

const swapPuzzlePieces = (index1, index2) => {
    const temp = puzzlePieces[index1];
    puzzlePieces[index1] = puzzlePieces[index2];
    puzzlePieces[index2] = temp;
};

const renderPuzzle = () => {
    const grid = document.getElementById('puzzle-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    puzzlePieces.forEach((piece, index) => {
        const div = document.createElement('div');
        div.className = 'puzzle-piece';
        if (piece.content) {
            div.textContent = piece.content;
        }
        div.onclick = () => handlePuzzleClick(index);
        grid.appendChild(div);
    });
};

const handlePuzzleClick = (index) => {
    const neighbors = getPuzzleNeighbors(puzzleEmptyIndex);
    if (neighbors.includes(index)) {
        swapPuzzlePieces(puzzleEmptyIndex, index);
        puzzleEmptyIndex = index;
        renderPuzzle();
        
        if (checkPuzzleComplete()) {
            setTimeout(() => {
                alert('🎉 恭喜！拼图完成！');
                addPoints(20);
                startPuzzleGame();
            }, 500);
        }
    }
};

const checkPuzzleComplete = () => {
    for (let i = 0; i < 8; i++) {
        if (!puzzlePieces[i].content) {
            return false;
        }
    }
    return true;
};

const startRadicalGame = () => {
    const gameArea = document.getElementById('game-area');
    if (!gameArea) return;
    
    const radicalPairs = [
        { parts: ['女', '子'], result: '好' },
        { parts: ['日', '月'], result: '明' },
        { parts: ['木', '木'], result: '林' },
        { parts: ['木', '对'], result: '树' },
        { parts: ['口', '天'], result: '吞' },
        { parts: ['亻', '本'], result: '体' },
        { parts: ['氵', '也'], result: '池' },
        { parts: ['火', '山'], result: '灿' }
    ];
    
    const randomPair = radicalPairs[Math.floor(Math.random() * radicalPairs.length)];
    
    radicalParts = [...randomPair.parts];
    radicalTargetContent = '';
    
    gameArea.innerHTML = `
        <div class="radical-game">
            <h3 class="text-xl font-bold text-orange-500 mb-4">部首组合</h3>
            <p class="text-gray-600 mb-4">将部首拖到中间组合成汉字</p>
            <div class="radical-parts">
                <div class="radical-part" draggable="true" id="radical-part-0">${randomPair.parts[0]}</div>
                <div class="radical-part" draggable="true" id="radical-part-1">${randomPair.parts[1]}</div>
            </div>
            <div class="radical-target" ondragover="dragOver(event)" ondrop="dropRadical(event, '${randomPair.result}')">
                拖到这里
            </div>
            <div class="mt-4">
                <button class="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-full" onclick="startRadicalGame()">换一个</button>
            </div>
        </div>
    `;
};

const dragStart = (event) => {
    event.dataTransfer.setData('text', event.target.textContent);
    event.dataTransfer.setData('id', event.target.id);
};

const dragOver = (event) => {
    event.preventDefault();
};

const dropRadical = (event, expected) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    const id = event.dataTransfer.getData('id');
    
    if (data) {
        if (radicalTargetContent.length < 2) {
            radicalTargetContent += data;
            event.target.textContent = radicalTargetContent;
            
            const sourceElement = document.getElementById(id);
            if (sourceElement) {
                sourceElement.style.opacity = '0.3';
                sourceElement.draggable = false;
            }
            
            if (radicalTargetContent === expected) {
                setTimeout(() => {
                    event.target.textContent = expected;
                    alert('🎉 恭喜！组合正确！');
                    addPoints(15);
                    startRadicalGame();
                }, 500);
            } else if (radicalTargetContent.length === 2) {
                setTimeout(() => {
                    alert('😅 不对哦，再试一次！');
                    startRadicalGame();
                }, 500);
            }
        }
    }
};

const startLinkGame = () => {
    const gameArea = document.getElementById('game-area');
    if (!gameArea) return;
    
    const chars = ['明', '明', '好', '好', '学', '学', '家', '家', '花', '花', '树', '树', '日', '日', '月', '月'];
    const shuffled = chars.sort(() => 0.5 - Math.random());
    
    gameArea.innerHTML = `
        <div class="link-game">
            <h3 class="text-xl font-bold text-orange-500 mb-4">汉字连连看</h3>
            <p class="text-gray-600 mb-4">找出相同的汉字</p>
            <div class="link-grid" id="link-grid"></div>
            <div class="mt-4">
                <button class="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-full" onclick="startLinkGame()">重新开始</button>
            </div>
        </div>
    `;
    
    createLinkGrid(shuffled);
};

let selectedLinkItem = null;

const createLinkGrid = (chars) => {
    const grid = document.getElementById('link-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    chars.forEach((char, index) => {
        const div = document.createElement('div');
        div.className = 'link-item';
        div.textContent = char;
        div.dataset.char = char;
        div.dataset.index = index;
        div.onclick = () => handleLinkClick(div);
        grid.appendChild(div);
    });
};

const handleLinkClick = (item) => {
    if (item.classList.contains('matched')) return;
    
    if (!selectedLinkItem) {
        selectedLinkItem = item;
        item.classList.add('selected');
    } else if (selectedLinkItem === item) {
        selectedLinkItem.classList.remove('selected');
        selectedLinkItem = null;
    } else if (selectedLinkItem.dataset.char === item.dataset.char) {
        selectedLinkItem.classList.add('matched');
        item.classList.add('matched');
        selectedLinkItem.classList.remove('selected');
        selectedLinkItem = null;
        
        addPoints(5);
        
        const remaining = document.querySelectorAll('.link-item:not(.matched)');
        if (remaining.length === 0) {
            setTimeout(() => {
                alert('🎉 恭喜！全部消除！');
                startLinkGame();
            }, 500);
        }
    } else {
        selectedLinkItem.classList.remove('selected');
        selectedLinkItem = item;
        item.classList.add('selected');
    }
};

const filterCharacters = () => {
    const grade = document.getElementById('grade-filter').value;
    const semester = document.getElementById('semester-filter').value;
    const difficulty = document.getElementById('difficulty-filter').value;
    
    const filtered = getCharactersByFilter(grade, semester, difficulty);
    renderCharactersGrid(filtered);
};

const renderCharactersGrid = (chars) => {
    const grid = document.getElementById('characters-grid');
    if (!grid) return;
    
    grid.innerHTML = chars.map(char => `
        <div class="character-item" onclick="showCharacterDetail('${char.id}')">
            <div class="char">${char.char}</div>
            <div class="py">${char.pinyin}</div>
        </div>
    `).join('');
};

let currentModalChar = null;

const showCharacterDetail = (id) => {
    const char = getCharacterById(id);
    if (!char) return;
    
    currentModalChar = char;
    
    document.getElementById('modal-char').textContent = char.char;
    document.getElementById('modal-pinyin').textContent = char.pinyin;
    document.getElementById('modal-radical').textContent = char.radical;
    document.getElementById('modal-stroke').textContent = char.strokeCount;
    document.getElementById('modal-words').textContent = char.words.join('、');
    document.getElementById('modal-sentences').textContent = char.sentences.join('；');
    
    document.getElementById('character-detail').classList.add('active');
};

const closeModal = () => {
    document.getElementById('character-detail').classList.remove('active');
    currentModalChar = null;
};

const speakModalCharacter = () => {
    if (currentModalChar) {
        window.speakText(currentModalChar.char);
    }
};

const renderMistakesList = () => {
    const mistakes = getMistakeRecords();
    
    if (mistakes.length === 0) {
        document.getElementById('mistakes-list').style.display = 'none';
        document.getElementById('no-mistakes').style.display = 'block';
        return;
    }
    
    document.getElementById('mistakes-list').style.display = 'grid';
    document.getElementById('no-mistakes').style.display = 'none';
    
    const list = document.getElementById('mistakes-list');
    list.innerHTML = mistakes.map(mistake => {
        const char = getCharacterById(mistake.charId);
        if (!char) return '';
        return `
            <div class="mistake-item" onclick="reviewMistake('${char.id}')">
                <div class="char">${char.char}</div>
                <div class="count">错误${mistake.wrongCount}次</div>
            </div>
        `;
    }).join('');
};

const reviewMistake = (charId) => {
    const char = getCharacterById(charId);
    if (!char) return;
    
    const reviewArea = document.getElementById('review-area');
    reviewArea.innerHTML = `
        <h3 class="text-lg font-bold text-red-500 mb-3">复习：${char.char}</h3>
        <div class="flex items-center gap-3 mb-3">
            <span class="text-green-500 font-bold">${char.pinyin}</span>
            <span class="text-yellow-600">部首: ${char.radical}</span>
            <span class="text-purple-600">笔画: ${char.strokeCount}</span>
        </div>
        <div class="mb-3">
            <strong>组词：</strong>${char.words.join('、')}
        </div>
        <div class="mb-3">
            <strong>造句：</strong>${char.sentences.join('；')}
        </div>
        <div class="flex gap-3">
            <button class="bg-green-500 text-white px-4 py-2 rounded-full" onclick="window.speakText('${char.char}')">听发音</button>
            <button class="bg-orange-500 text-white px-4 py-2 rounded-full" onclick="markMistakeFixed('${char.id}')">已掌握</button>
        </div>
    `;
};

const markMistakeFixed = (charId) => {
    removeMistakeRecord(charId);
    renderMistakesList();
    document.getElementById('review-area').innerHTML = '';
};

const renderReport = () => {
    const stats = getUserStats();
    const progress = getProgressByGrade();
    const weakAreas = getWeakAreas();
    const correctRate = getCorrectRate();
    const totalLearned = getTotalLearned();
    
    document.getElementById('report-total-learned').textContent = totalLearned;
    document.getElementById('report-correct-rate').textContent = `${correctRate}%`;
    document.getElementById('report-total-points').textContent = stats.points;
    document.getElementById('report-streak').textContent = `${stats.daysStreak}天`;
    
    const updateProgress = (key, id) => {
        const p = progress[key];
        const percent = p.total > 0 ? Math.round((p.learned / p.total) * 100) : 0;
        document.getElementById(id).style.width = `${percent}%`;
        document.getElementById(`percent-${id.replace('progress-', '')}`).textContent = `${percent}%`;
    };
    
    updateProgress('1-1', 'progress-g1s1');
    updateProgress('1-2', 'progress-g1s2');
    updateProgress('2-1', 'progress-g2s1');
    updateProgress('2-2', 'progress-g2s2');
    
    const weakContainer = document.getElementById('weak-areas');
    if (weakAreas.length === 0) {
        weakContainer.innerHTML = '<p class="text-green-500">没有明显的薄弱环节，继续保持！</p>';
    } else {
        weakContainer.innerHTML = weakAreas.map(char => `
            <span class="weak-area-item">${char}</span>
        `).join('');
    }
    
    document.getElementById('report-total-time').textContent = '0';
    document.getElementById('report-avg-time').textContent = '0';
};

const updateHomeStats = () => {
    const stats = getUserStats();
    const mastery = calculateTotalMastery();
    const totalLearned = getTotalLearned();
    
    document.getElementById('points-text').textContent = stats.points;
    document.getElementById('level-text').textContent = getLevelName(stats.level);
    document.getElementById('learned-count').textContent = totalLearned;
    document.getElementById('streak-days').textContent = `${stats.daysStreak}天`;
    document.getElementById('mastery-percent').textContent = `${mastery}%`;
};
