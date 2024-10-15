// =============================
// ゲームロジック関連の関数
// =============================

import { fetchPokemonImage, fetchPokemonInfo } from './pokemonApi.js';
import { toggleVisibility, showResultScreen, showSpecialRewardPopup } from './uiHandler.js';

export let correctAnswer = 0;
export let correctAnswers = 0; // 正答数をカウントする変数

// ランダムな数字を生成する関数（1から9までの数）
function getRandomNumber() {
    return Math.floor(Math.random() * 9) + 1;
}

// 1つ目の数値に基づいて、2つ目の数値を生成する関数
function getValidSecondNumber(number1) {
    const maxSecondNumber = 10 - number1; // 合計が10を超えないようにするための最大値
    return Math.floor(Math.random() * maxSecondNumber) + 1;
}

// 答えの候補を生成する関数
function generateAnswers(correctAnswer) {
    const answers = new Set();
    answers.add(correctAnswer);
    while (answers.size < 4) {
        let randomAnswer = getRandomNumber(); // 1から9の範囲で生成
        if (randomAnswer !== correctAnswer) {
            answers.add(randomAnswer);
        }
    }
    return Array.from(answers).sort(() => Math.random() - 0.5);
}

// 答えのボタンをリセットする関数
function resetAnswerButtons(answerButtons) {
    answerButtons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
        button.classList.add('answer-button');
        button.innerText = ''; // 初期化
    });
}

// 新しい問題を生成する関数
export function generateNewProblem() {
    const number1 = getRandomNumber();
    const number2 = getValidSecondNumber(number1);

    document.getElementById('number1').innerText = number1;
    document.getElementById('number2').innerText = number2;
    document.getElementById('result').innerText = '?';

    correctAnswer = number1 + number2;
    const answers = generateAnswers(correctAnswer);
    const answerButtons = document.querySelectorAll('.answer-button');
    resetAnswerButtons(answerButtons);
    answerButtons.forEach((button, index) => {
        button.innerText = answers[index];
    });
}

// 答えをチェックする関数
export async function checkAnswer(selectedAnswerIndex) {
    const answerButtons = document.querySelectorAll('.answer-button');
    const selectedValue = parseInt(answerButtons[selectedAnswerIndex].innerText, 10);
    const resultMessage = document.getElementById('result-message');

    console.log(`Selected Answer: ${selectedValue}, Correct Answer: ${correctAnswer}`);

    if (selectedValue === correctAnswer) {
        resultMessage.innerHTML = '<span style="font-size:5em; color:green;">〇</span><br><span style="font-size:2em;">すごい！せいかいです！</span>';
        answerButtons[selectedAnswerIndex].classList.add('correct');

        // 正答数をカウント
        correctAnswers += 1;
        console.log(`Correct Answers updated: ${correctAnswers}`);

        // 10問ごとに特別な報酬ポップアップを表示
        if (correctAnswers % 10 === 0) {
            await showSpecialRewardPopup();
        } else {
            // 正解時に結果画面に移行
            await showResultScreen(true, false); // 通常ポケモンを取得
        }
    } else {
        resultMessage.innerHTML = '<span style="font-size:5em; color:red;">×</span><br><span style="font-size:2em;">ざんねん！つぎはがんばろう！</span>';
        answerButtons[selectedAnswerIndex].classList.add('incorrect');

        // 不正解時に結果画面に移行
        await showResultScreen(false, false);
    }
}
