// =============================
// 画面表示・操作関連の関数
// =============================

import { fetchPokemonImage, fetchPokemonInfo, maxPokemonId } from './pokemonApi.js';
import { correctAnswers, generateNewProblem } from './gameLogic.js';

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

export let selectedPokemonId = null;

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

function getRandomStarterGroup() {
    const randomIndex = Math.floor(Math.random() * starterPokemonGroups.length);
    return starterPokemonGroups[randomIndex];
}

export function loadStarterPokemon() {
    const randomGroup = getRandomStarterGroup();
    const starters = starterFixedPokemon.concat(randomGroup); // ピカチュウとイーブイを固定
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = ''; // リストをクリア

    starters.forEach(async (pokemonId) => {
        const pokemonImage = await fetchPokemonImage(pokemonId);
        const imgElement = document.createElement('img');
        imgElement.src = pokemonImage;
        imgElement.alt = `Pokemon ${pokemonId}`;
        imgElement.classList.add('pokemon-image');
        imgElement.onclick = () => selectPokemon(pokemonId);
        pokemonList.appendChild(imgElement);
    });
}

// 可視性を切り替える関数
export function toggleVisibility(elementId, isVisible) {
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

// ポケモンの選択とポップアップの表示
function selectPokemon(pokemonId) {
    selectedPokemonId = pokemonId;
    // ポップアップを表示
    showPopup(pokemonId);
}

async function showPopup(pokemonId) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    const popupPokemonImage = document.getElementById('popup-pokemon-image');
    const popupPokemonName = document.getElementById('popup-pokemon-name');
    const popupPokemonTypes = document.getElementById('popup-pokemon-types'); // タイプ表示用

    // ポケモン情報を取得
    const pokemonImage = await fetchPokemonImage(pokemonId);
    const pokemonInfo = await fetchPokemonInfo(pokemonId);

    // ポップアップに情報をセット
    popupMessage.innerText = `${pokemonInfo.name}とぼうけんする？`;
    popupPokemonImage.src = pokemonImage;
    popupPokemonName.innerText = pokemonInfo.name;
    popupPokemonTypes.innerHTML = pokemonInfo.types; // タイプを表示

    // ポップアップを表示
    popup.classList.add('show');
    popup.classList.remove('hidden');
}

export function confirmSelection() {
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
    }, 1000); // アニメーションの継続時間に合わせる
}

export function cancelSelection() {
    // ポップアップを非表示
    document.getElementById('popup').classList.remove('show');
    document.getElementById('popup').classList.add('hidden');
    // 選択をリセット
    selectedPokemonId = null;
}

// チュートリアル後にゲームを開始
export function startGameAfterTutorial() {
    toggleVisibility('tutorial', false);
    startGame(); // ゲームを開始
}

// ゲームを開始する関数
export function startGame() {
    toggleVisibility('result-screen', false);
    toggleVisibility('game', true);
    toggleVisibility('answers', true);
    toggleVisibility('new-problem-button', true);
    toggleVisibility('story', false);
    toggleVisibility('tutorial', false);
    toggleVisibility('character-select', false);
    document.getElementById('pokemon-name').innerText = '';
    document.getElementById('pokemon-types').innerText = '';
    generateNewProblem();
}

// 冒険の開始（ストーリー画面を表示）
export function beginAdventure() {
    toggleVisibility('story', false);
    toggleVisibility('character-select', true);
    loadStarterPokemon(); // ポケモンリストを読み込む
}

// 結果画面を表示する関数
export async function showResultScreen(isCorrect, isSpecial) {
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

    if (isCorrect) {
        if (isSpecial) {
            // 特別な報酬ポップアップが表示されるので、ここでは何もしない
        } else {
            // 通常ポケモンからランダムに選択（伝説や幻を除外）
            const resultPokemonId = normalPokemonIds[Math.floor(Math.random() * normalPokemonIds.length)];
            const resultPokemonImage = await fetchPokemonImage(resultPokemonId);
            const resultPokemonInfo = await fetchPokemonInfo(resultPokemonId);

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
            setTimeout(() => resultPokemonImageElement.classList.remove('bounce'), 1000);
        }
    } else {
        loadingContainer.classList.add('hidden');
        resultPokemonImageElement.classList.add('hidden');
        document.getElementById('pokemon-name').innerText = '';
        document.getElementById('pokemon-types').innerHTML = '';
    }
}

// 特別な報酬ポップアップを表示する関数
export async function showSpecialRewardPopup() {
    const specialRewardPopup = document.getElementById('special-reward-popup');
    const specialPokemonName = document.getElementById('special-pokemon-name');
    const specialPokemonImage = document.getElementById('special-reward-pokemon-image');
    const specialPokemonTypes = document.getElementById('special-pokemon-types');

    // 特別な報酬ポケモンを取得
    const legendaryPokemonId = legendaryAndMythicalPokemonIds[Math.floor(Math.random() * legendaryAndMythicalPokemonIds.length)];
    const rewardPokemonImage = await fetchPokemonImage(legendaryPokemonId);
    const rewardPokemonInfo = await fetchPokemonInfo(legendaryPokemonId);

    // ポケモン情報をポップアップにセット
    specialPokemonName.innerText = rewardPokemonInfo.name;
    specialPokemonImage.src = rewardPokemonImage;
    specialPokemonTypes.innerHTML = rewardPokemonInfo.types;

    // ポップアップを表示
    specialRewardPopup.classList.add('show');
    specialRewardPopup.classList.remove('hidden');

    console.log(`Special Reward: ${rewardPokemonInfo.name} appeared!`);
}

// 特別な報酬ポップアップを閉じる関数
export function closeSpecialRewardPopup() {
    const specialRewardPopup = document.getElementById('special-reward-popup');
    specialRewardPopup.classList.remove('show');
    specialRewardPopup.classList.add('hidden');

    // 次の問題へ進む
    startGame();
}
