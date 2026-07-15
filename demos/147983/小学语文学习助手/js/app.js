const navigateTo = (pageId) => {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    if (pageId === 'home') {
        updateHomeStats();
    } else if (pageId === 'memory') {
        initMemoryMode();
    } else if (pageId === 'dictation') {
        initDictationMode();
        initCanvas();
    } else if (pageId === 'challenge') {
        document.getElementById('game-area').innerHTML = '';
    } else if (pageId === 'learning') {
        renderCharactersGrid(charactersData);
    } else if (pageId === 'mistakes') {
        renderMistakesList();
    } else if (pageId === 'report') {
        renderReport();
    }
};

const initApp = () => {
    checkContinuousDays();
    updateHomeStats();
    renderCharactersGrid(charactersData);
    
    const modal = document.getElementById('character-detail');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
};

document.addEventListener('DOMContentLoaded', initApp);

window.navigateTo = navigateTo;
window.playStrokeAnimation = playStrokeAnimation;
window.pauseStrokeAnimation = pauseStrokeAnimation;
window.resetStrokeAnimation = resetStrokeAnimation;
window.speakCurrentMemoryChar = () => {
    const currentChar = currentCharacters[currentCharacterIndex];
    if (currentChar) {
        window.speakText(currentChar.char);
    }
};
window.nextCharacter = nextCharacter;
window.prevCharacter = prevCharacter;
window.playDictationAudio = playDictationAudio;
window.clearCanvas = clearCanvas;
window.submitDictation = submitDictation;
window.startPuzzleGame = startPuzzleGame;
window.startRadicalGame = startRadicalGame;
window.startLinkGame = startLinkGame;
window.filterCharacters = filterCharacters;
window.showCharacterDetail = showCharacterDetail;
window.closeModal = closeModal;
window.speakModalCharacter = speakModalCharacter;
window.reviewMistake = reviewMistake;
window.markMistakeFixed = markMistakeFixed;
