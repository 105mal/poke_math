const pokemonApiUrl = 'https://pokeapi.co/api/v2/pokemon/';
const maxPokemonId = 1010;

// 伝説および幻のポケモンのIDリスト
const legendaryAndMythicalPokemonIds = [
    144, 145, 146, 150, 151, 249, 250, 251,
    377, 378, 379, 380, 381, 382, 383, 384, 385,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    716, 717, 718, 719, 720, 721,
    785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807,
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
    1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010
];

// 通常ポケモンのIDリスト（伝説・幻を除外）
const normalPokemonIds = Array.from({ length: maxPokemonId }, (_, i) => i + 1).filter(id => !legendaryAndMythicalPokemonIds.includes(id));

let correctAnswer = 0;
let correctAnswers = 0; // 累計正答数
let selectedPokemonId = null;
let selectedPokemonBackImage = ''; // 選択したポケモンの後ろ姿画像URL

const starterPokemonGroups = [
    [1, 4, 7], // カントー地方
    [152, 155, 158], // ジョウト地方
    [252, 255, 258], // ホウエン地方
    [387, 390, 393], // シンオウ地方
    [495, 498, 501], // イッシュ地方
    [650, 653, 656], // カロス地方
    [722, 725, 728], // アローラ地方
    [810, 813, 816]  // ガラル地方
];

const starterFixedPokemon = [25, 133]; // ピカチュウ、イーブイ

// メインタイトルの設定
function setGameTitle() {
    const title = "ポケモンたしざんゲーム";
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF', '#FF1493', '#00CED1', '#FFD700'];
    const titleElement = document.getElementById('game-title');
    let coloredTitle = '';
    for (let i = 0; i < title.length; i++) {
        const char = title.charAt(i);
        const color = colors[i % colors.length];
        coloredTitle += `<span style="color:${color}">${char}</span>`;
    }
    titleElement.innerHTML = coloredTitle;
}

// ランダムなスターターグループを取得する関数
function getRandomStarterGroup() {
    const randomIndex = Math.floor(Math.random() * starterPokemonGroups.length);
    return starterPokemonGroups[randomIndex];
}

// ポケモン情報の取得
async function fetchPokemonInfo(pokemonId) {
    try {
        toggleSpinner(true); // スピナー表示
        const response = await fetch(`${pokemonApiUrl}${pokemonId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const responseSpecies = await fetch(data.species.url);
        if (!responseSpecies.ok) {
            throw new Error(`HTTP error! status: ${responseSpecies.status}`);
        }
        const speciesData = await responseSpecies.json();
        const nameInfo = speciesData.names.find(nameInfo => nameInfo.language.name === 'ja');
        const name = nameInfo ? nameInfo.name : 'ふめい';
        const types = data.types.map(typeInfo => {
            switch (typeInfo.type.name) {
                case 'normal': return '<span class="type normal">ノーマル</span>';
                case 'fire': return '<span class="type fire">ほのお</span>';
                case 'water': return '<span class="type water">みず</span>';
                case 'electric': return '<span class="type electric">でんき</span>';
                case 'grass': return '<span class="type grass">くさ</span>';
                case 'ice': return '<span class="type ice">こおり</span>';
                case 'fighting': return '<span class="type fighting">かくとう</span>';
                case 'poison': return '<span class="type poison">どく</span>';
                case 'ground': return '<span class="type ground">じめん</span>';
                case 'flying': return '<span class="type flying">ひこう</span>';
                case 'psychic': return '<span class="type psychic">エスパー</span>';
                case 'bug': return '<span class="type bug">むし</span>';
                case 'rock': return '<span class="type rock">いわ</span>';
                case 'ghost': return '<span class="type ghost">ゴースト</span>';
                case 'dragon': return '<span class="type dragon">ドラゴン</span>';
                case 'dark': return '<span class="type dark">あく</span>';
                case 'steel': return '<span class="type steel">はがね</span>';
                case 'fairy': return '<span class="type fairy">フェアリー</span>';
                default: return `<span class="type">${typeInfo.type.name}</span>`;
            }
        }).join(' ');
        const frontImage = data.sprites.front_default;
        const backImage = data.sprites.back_default || data.sprites.front_default; // フロント画像がない場合はフロントを代用
        toggleSpinner(false); // スピナー非表示
        return { name, types, frontImage, backImage };
    } catch (error) {
        console.error('ポケモン情報の取得に失敗しました:', error);
        toggleSpinner(false); // スピナー非表示
        showError();
        return { name: 'ふめい', types: 'ふめい', frontImage: '', backImage: '' };
    }
}

// ポケモンのフロント画像取得
async function fetchPokemonImage(pokemonId) {
    try {
        const response = await fetch(`${pokemonApiUrl}${pokemonId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.sprites.front_default || ''; // フロント画像がない場合は空文字
    } catch (error) {
        console.error('ポケモン画像の取得に失敗しました:', error);
        showError();
        return '';
    }
}

// 可視性を切り替える関数
function toggleVisibility(elementId, isVisible) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isVisible) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    } else {
        console.error(`Element with ID "${elementId}" not found.`);
    }
}

// メッセージ表示用共通関数
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.innerHTML = message;
        messageElement.classList.remove('hidden');
        if (type === 'correct') {
            messageElement.classList.add('correct-message');
            messageElement.classList.remove('incorrect-message');
        } else if (type === 'incorrect') {
            messageElement.classList.add('incorrect-message');
            messageElement.classList.remove('correct-message');
        }
    }
}

// ローディングスピナーの表示・非表示関数
function toggleSpinner(isVisible) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        if (isVisible) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }
}

// 初期化処理
window.onload = async () => {
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
        toggleVisibility('error-message', false);
        toggleVisibility('loading-spinner', false); // スピナー非表示
        console.log('画面の表示をきりかえました。');
        setGameTitle();
        await loadRandomPokemons();
    } catch (error) {
        console.error('初期化中にエラーが発生しました:', error);
        showError();
    }
};

// ランダムな通常ポケモンを3匹表示する関数
async function loadRandomPokemons() {
    const container = document.getElementById('random-pokemons');
    container.innerHTML = ''; // クリア
    const selectedIds = new Set();
    while (selectedIds.size < 3) {
        const randomId = normalPokemonIds[Math.floor(Math.random() * normalPokemonIds.length)];
        selectedIds.add(randomId);
    }
    for (const pokemonId of selectedIds) {
        const pokemonImage = await fetchPokemonImage(pokemonId);
        if (pokemonImage) {
            const imgElement = document.createElement('img');
            imgElement.src = pokemonImage;
            imgElement.alt = `Pokemon ${pokemonId}`;
            imgElement.classList.add('random-pokemon');
            container.appendChild(imgElement);
        }
    }
}

// 冒険の開始（ストーリー画面を非表示にし、キャラクター選択画面を表示）
function beginAdventure() {
    toggleVisibility('story', false);
    toggleVisibility('character-select', true);
    loadStarterPokemon(); // ポケモンリストを読み込む
}

// スターターポケモンの読み込み
function loadStarterPokemon() {
    const randomGroup = getRandomStarterGroup();
    const starters = starterFixedPokemon.concat(randomGroup); // ピカチュウとイーブイを固定
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = ''; // リストをクリア

    starters.forEach(async (pokemonId) => {
        const pokemonInfo = await fetchPokemonInfo(pokemonId);
        if (pokemonInfo.frontImage) {
            const imgElement = document.createElement('img');
            imgElement.src = pokemonInfo.frontImage;
            imgElement.alt = `${pokemonInfo.name}の画像`;
            imgElement.classList.add('pokemon-image');
            imgElement.onclick = () => selectPokemon(pokemonId);
            pokemonList.appendChild(imgElement);
        }
    });
}

// ポケモンの選択とポップアップの表示
async function selectPokemon(pokemonId) {
    selectedPokemonId = pokemonId;
    // ポップアップを表示
    await showPopup(pokemonId);
}

// ポップアップ表示関数
async function showPopup(pokemonId) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    const popupPokemonImage = document.getElementById('popup-pokemon-image');
    const popupPokemonName = document.getElementById('popup-pokemon-name');
    const popupPokemonTypes = document.getElementById('popup-pokemon-types'); // タイプ表示用

    // ポケモン情報を取得
    const pokemonInfo = await fetchPokemonInfo(pokemonId);
    if (!pokemonInfo.frontImage) {
        showError();
        return;
    }

    // ポップアップに情報をセット
    popupMessage.innerText = `${pokemonInfo.name}とぼうけんする？`;
    popupPokemonImage.src = pokemonInfo.frontImage;
    popupPokemonName.innerHTML = pokemonInfo.name;
    popupPokemonTypes.innerHTML = pokemonInfo.types; // タイプを表示

    // 選択したポケモンの後ろ姿を保存
    selectedPokemonBackImage = pokemonInfo.backImage;

    // ポップアップを表示
    popup.classList.add('show');
    popup.classList.remove('hidden');
}

// ポップアップで「はい」を選択
function confirmSelection() {
    // ポップアップのポケモン画像にアニメーションを追加
    const popupPokemonImage = document.getElementById('popup-pokemon-image');
    popupPokemonImage.classList.add('happy');

    // アニメーション後にチュートリアル画面へ遷移
    setTimeout(() => {
        // ポップアップを非表示
        document.getElementById('popup').classList.remove('show');
        document.getElementById('popup').classList.add('hidden');
        // アニメーションを削除
        popupPokemonImage.classList.remove('happy');
        // チュートリアル画面へ
        toggleVisibility('character-select', false);
        toggleVisibility('tutorial', true);
    }, 1500); // アニメーションの継続時間に合わせる（1.5秒）
}

// ポップアップで「いいえ」を選択
function cancelSelection() {
    // ポップアップを非表示
    document.getElementById('popup').classList.remove('show');
    document.getElementById('popup').classList.add('hidden');
    // 選択をリセット
    selectedPokemonId = null;
    selectedPokemonBackImage = '';
}

// チュートリアル後にゲームを開始
function startGameAfterTutorial() {
    toggleVisibility('tutorial', false);
    startGame(); // ゲームを開始
}

// ゲームを開始する関数
function startGame() {
    toggleVisibility('result-screen', false);
    toggleVisibility('game', true);
    toggleVisibility('answers', true);
    toggleVisibility('new-problem-button', true);
    toggleVisibility('story', false);
    toggleVisibility('tutorial', false);
    toggleVisibility('character-select', false);
    toggleVisibility('error-message', false);
    document.getElementById('pokemon-name').innerText = '';
    document.getElementById('pokemon-types').innerText = '';
    generateNewProblem();

    // 選択したポケモンの後ろ姿を表示
    const backImageElement = document.getElementById('selected-pokemon-back-image-game');
    if (selectedPokemonBackImage) {
        backImageElement.src = selectedPokemonBackImage;
        backImageElement.classList.remove('hidden');
        // アニメーションを適用
        backImageElement.classList.add('bounce');
        setTimeout(() => backImageElement.classList.remove('bounce'), 1000); // アニメーション後にクラスを削除
    } else {
        backImageElement.classList.add('hidden');
    }

    // 進捗バーを更新
    updateProgressBar();
}

// 新しい問題を生成する関数
function generateNewProblem() {
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

    // 特別な報酬メッセージの表示条件修正
    const specialRewardMessage = document.getElementById('special-reward-message');
    if ((correctAnswers % 10) === 9) { // 10問目の直前
        specialRewardMessage.classList.remove('hidden');
    } else {
        specialRewardMessage.classList.add('hidden');
    }
}

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
        button.innerHTML = ''; // 初期化
    });
}

// 答えをチェックする関数
async function checkAnswer(selectedAnswerIndex) {
    const answerButtons = document.querySelectorAll('.answer-button');
    const selectedValue = parseInt(answerButtons[selectedAnswerIndex].innerText, 10);
    const resultMessage = document.getElementById('result-message');

    console.log(`Selected Answer: ${selectedValue}, Correct Answer: ${correctAnswer}`);

    if (selectedValue === correctAnswer) {
        // 正解メッセージの更新（改行を追加）
        showMessage('result-message', '<span class="result-icon correct-icon">〇</span><br>すごい！せいかいです！', 'correct');

        // ポケモン画像に輝きを追加（オプション）
        const resultPokemonImageElement = document.getElementById('result-pokemon');
        if (resultPokemonImageElement) {
            resultPokemonImageElement.classList.add('sparkle');
            setTimeout(() => {
                resultPokemonImageElement.classList.remove('sparkle');
            }, 3000); // 3秒間輝きを続ける
        }

        answerButtons[selectedAnswerIndex].classList.add('correct');

        // 正答数を加算
        correctAnswers += 1;
        console.log(`Correct Answers: ${correctAnswers}`);

        // 進捗バーを更新
        updateProgressBar();

        // 特別な報酬ポップアップを表示するかどうかを判定
        if (correctAnswers % 10 === 0) {
            // 特別な報酬メッセージを表示
            const specialRewardMessage = document.getElementById('special-reward-message');
            specialRewardMessage.innerHTML = 'せいかいで とくべつなポケモンが もらえる！';
            specialRewardMessage.classList.remove('hidden');

            // 特別な報酬ポップアップを表示
            await showSpecialRewardPopup();
        } else {
            // 正解時に結果画面に移行
            await showResultScreen(true);
        }
    } else {
        // 不正解メッセージの更新（改行を追加）
        showMessage('result-message', '<span class="result-icon incorrect-icon">×</span><br>ざんねん！つぎはがんばろう！', 'incorrect');

        // ポケモン画像にシェイクを追加（オプション）
        const resultPokemonImageElement = document.getElementById('result-pokemon');
        if (resultPokemonImageElement) {
            resultPokemonImageElement.classList.add('shake');
            setTimeout(() => {
                resultPokemonImageElement.classList.remove('shake');
            }, 500); // 0.5秒間シェイクを続ける
        }

        answerButtons[selectedAnswerIndex].classList.add('incorrect');

        // 不正解時に結果画面に移行
        await showResultScreen(false);
    }
}

// 結果画面を表示する関数
async function showResultScreen(isCorrect) {
    // 特別な報酬ポップアップが表示されている場合は、結果画面を表示しない
    const specialRewardPopup = document.getElementById('special-reward-popup');
    if (specialRewardPopup.classList.contains('show')) {
        return;
    }

    toggleVisibility('game', false);
    toggleVisibility('answers', false);
    toggleVisibility('new-problem-button', false);
    toggleVisibility('result-screen', true);

    const loadingContainer = document.getElementById('loading-container');
    const resultPokemonImageElement = document.getElementById('result-pokemon');

    // ポケモン画像を非表示にし、ロード中のボールを表示
    resultPokemonImageElement.classList.add('hidden');
    loadingContainer.classList.remove('hidden');

    // 前回のポケモンを完全に非表示にする
    document.getElementById('result-pokemon').src = '';
    document.getElementById('pokemon-name').innerText = '';
    document.getElementById('pokemon-types').innerHTML = '';

    if (isCorrect) {
        try {
            // 通常ポケモンからランダムに選択（伝説や幻を除外）
            const resultPokemonId = normalPokemonIds[Math.floor(Math.random() * normalPokemonIds.length)];
            const resultPokemonInfo = await fetchPokemonInfo(resultPokemonId);
            if (!resultPokemonInfo.frontImage) {
                throw new Error('ポケモン画像が取得できませんでした。');
            }
            const resultPokemonImage = resultPokemonInfo.frontImage;

            // ポケモン画像を設定
            resultPokemonImageElement.src = resultPokemonImage;

            // ポケモン情報を設定
            document.getElementById('pokemon-name').innerText = resultPokemonInfo.name;
            document.getElementById('pokemon-types').innerHTML = resultPokemonInfo.types;

            // ロード中のボールを非表示にし、ポケモン画像を表示
            loadingContainer.classList.add('hidden');
            resultPokemonImageElement.classList.remove('hidden');

            // アニメーションを適用
            resultPokemonImageElement.classList.add('bounce'); // 正解時のアニメーション
            setTimeout(() => resultPokemonImageElement.classList.remove('bounce'), 1000); // アニメーション後にクラスを削除
        } catch (error) {
            console.error('結果画面表示中にエラーが発生しました:', error);
            showError();
        }
    } else {
        loadingContainer.classList.add('hidden');
        resultPokemonImageElement.classList.add('hidden');
        document.getElementById('pokemon-name').innerText = '';
        document.getElementById('pokemon-types').innerHTML = '';
    }
}

// 特別な報酬ポップアップを表示する関数
async function showSpecialRewardPopup() {
    const specialRewardPopup = document.getElementById('special-reward-popup');
    const specialPokemonName = document.getElementById('special-pokemon-name');
    const specialPokemonImage = document.getElementById('special-reward-pokemon-image');
    const specialPokemonTypes = document.getElementById('special-pokemon-types');

    try {
        // 特別な報酬ポケモンを取得
        const legendaryPokemonId = legendaryAndMythicalPokemonIds[Math.floor(Math.random() * legendaryAndMythicalPokemonIds.length)];
        const rewardPokemonInfo = await fetchPokemonInfo(legendaryPokemonId);
        if (!rewardPokemonInfo.frontImage) {
            throw new Error('特別なポケモンの画像が取得できませんでした。');
        }
        const rewardPokemonImage = rewardPokemonInfo.frontImage;

        // ポケモン情報をポップアップにセット
        specialPokemonName.innerText = rewardPokemonInfo.name;
        specialPokemonImage.src = rewardPokemonImage;
        specialPokemonTypes.innerHTML = rewardPokemonInfo.types;

        // 特別なポケモンにアニメーションを追加
        specialPokemonImage.classList.add('bounce');

        // アニメーション後にクラスを削除
        setTimeout(() => {
            specialPokemonImage.classList.remove('bounce');
        }, 1000); // アニメーション時間に合わせる（1秒）

        // ポップアップを表示
        specialRewardPopup.classList.add('show');
        specialRewardPopup.classList.remove('hidden');

        console.log(`Special Reward: ${rewardPokemonInfo.name} appeared!`);
    } catch (error) {
        console.error('特別な報酬ポップアップ表示中にエラーが発生しました:', error);
        showError();
    }
}

// 特別な報酬ポップアップを閉じる関数
function closeSpecialRewardPopup() {
    const specialRewardPopup = document.getElementById('special-reward-popup');
    specialRewardPopup.classList.remove('show');
    specialRewardPopup.classList.add('hidden');

    // 次の問題へ進む
    startGame();
}

// エラーメッセージを表示する関数
function showError() {
    toggleVisibility('error-message', true);
}

// エラーメッセージを非表示にし再試行する関数
async function retry() {
    toggleVisibility('error-message', false);
    try {
        await loadRandomPokemons();
    } catch (error) {
        console.error('再試行中にエラーが発生しました:', error);
        showError();
    }
}

// 進捗バーを更新する関数
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progress = (correctAnswers % 10) / 10 * 100;
    progressBar.style.width = `${progress}%`;
}
