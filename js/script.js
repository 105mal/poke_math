// =============================
// 初期化とイベントハンドラの設定
// =============================

import { toggleVisibility, beginAdventure, startGameAfterTutorial, confirmSelection, cancelSelection } from './uiHandler.js';
import { checkAnswer, generateNewProblem } from './gameLogic.js';

// グローバルなイベントリスナーの設定
window.beginAdventure = beginAdventure;
window.startGameAfterTutorial = startGameAfterTutorial;
window.confirmSelection = confirmSelection;
window.cancelSelection = cancelSelection;
window.checkAnswer = checkAnswer;
window.generateNewProblem = generateNewProblem;

// 初期化時に特別な報酬ポップアップを非表示にする
window.onload = () => {
    console.log('Window loaded');
    try {
        toggleVisibility('story', true);
        toggleVisibility('character-select', false);
        toggleVisibility('tutorial', false);
        toggleVisibility('game', false);
        toggleVisibility('answers', false);
        toggleVisibility('new-problem-button', false);
        toggleVisibility('result-screen', false);
        toggleVisibility('special-reward-popup', false);
        console.log('画面の表示をきりかえました。');
    } catch (error) {
        console.error('初期化中にエラーが発生しました:', error);
    }
};
