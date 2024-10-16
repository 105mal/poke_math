const pokemonApiUrl = 'https://pokeapi.co/api/v2/pokemon/';
const pokemonSpeciesUrl = 'https://pokeapi.co/api/v2/pokemon-species/';
const maxPokemonId = 1010;

// ローカルストレージのキー定義
const LOCAL_STORAGE_KEY = 'collectedPokemonIds';

// 図鑑に表示するポケモンのIDリスト
let collectedPokemonIds = [];

// ロード中に表示するスピナーを管理
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

// エラーメッセージを表示する関数
function showError(message = 'エラーが発生しました。再度お試しください。') {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.querySelector('p').innerText = message;
        toggleVisibility('error-message', true);
    }
}

// エラーメッセージを非表示にし再試行する関数
async function retry() {
    toggleVisibility('error-message', false);
    try {
        await loadPokemonCards();
    } catch (error) {
        console.error('再試行中にエラーが発生しました:', error);
        showError('再試行中にエラーが発生しました。');
    }
}

// 戻るボタンの動作
function goBack() {
    window.history.back();
}

// ローカルストレージから収集済みポケモンIDの配列を取得
function getCollectedPokemonIds() {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
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
        return { id: pokemonId, name, types, frontImage, backImage };
    } catch (error) {
        console.error('ポケモン情報の取得に失敗しました:', error);
        toggleSpinner(false); // スピナー非表示
        showError();
        return { id: pokemonId, name: 'ふめい', types: 'ふめい', frontImage: '', backImage: '' };
    }
}

// ポケモンカードを作成して表示する関数
async function displayPokemonCards() {
    const container = document.getElementById('pokemon-cards');
    container.innerHTML = ''; // クリア

    if (collectedPokemonIds.length === 0) {
        container.innerHTML = '<p>まだポケモンを収集していません。</p>';
        return;
    }

    for (const pokemonId of collectedPokemonIds) {
        const pokemonInfo = await fetchPokemonInfo(pokemonId);
        if (pokemonInfo.frontImage) {
            const card = document.createElement('div');
            card.classList.add('pokemon-card');
            card.setAttribute('data-pokemon-id', pokemonId); // クリック時にIDを取得するための属性

            const img = document.createElement('img');
            img.src = pokemonInfo.frontImage;
            img.alt = `ポケモンID ${pokemonInfo.id}`;
            img.classList.add('pokemon-image');

            const info = document.createElement('div');
            info.classList.add('pokemon-info');
            info.innerHTML = `<p>ID: ${pokemonInfo.id}</p>`; // 名前を削除

            card.appendChild(img);
            card.appendChild(info);
            container.appendChild(card);

            // クリックイベントを追加
            card.addEventListener('click', () => {
                showPokemonDetailPopup(pokemonId);
            });
        }
    }
}

// ポケモンカードを読み込む関数
async function loadPokemonCards() {
    toggleSpinner(true);
    // ローカルストレージから収集済みポケモンIDを取得
    collectedPokemonIds = getCollectedPokemonIds();

    if (collectedPokemonIds.length === 0) {
        // 収集済みポケモンがない場合の処理
        const container = document.getElementById('pokemon-cards');
        container.innerHTML = '<p>まだポケモンを収集していません。</p>';
    } else {
        // ID順にソート（オプション）
        collectedPokemonIds.sort((a, b) => a - b);
        await displayPokemonCards();
    }

    toggleSpinner(false);
}

// ポケモン詳細ポップアップを表示する関数
async function showPokemonDetailPopup(pokemonId) {
    const popup = document.getElementById('pokemon-detail-popup');
    const detailName = document.getElementById('detail-pokemon-name');
    const detailImage = document.getElementById('detail-pokemon-image');
    const detailTypes = document.getElementById('detail-pokemon-types');
    const detailDescription = document.getElementById('detail-pokemon-description');

    try {
        // 基本情報の取得
        const pokemonInfo = await fetchPokemonInfo(pokemonId);
        if (!pokemonInfo.frontImage) {
            throw new Error('ポケモン情報の取得に失敗しました。');
        }

        // 図鑑説明の取得
        const description = await fetchPokemonDescription(pokemonId);

        // タイプの取得
        const types = pokemonInfo.types; // 既に取得済み

        // ポップアップに情報をセット
        detailName.innerText = pokemonInfo.name; // 日本語名
        detailImage.src = pokemonInfo.frontImage;
        detailImage.alt = `${pokemonInfo.name}の画像`;
        detailTypes.innerHTML = types;
        detailDescription.innerText = description;

        // ポップアップを表示
        popup.classList.add('show');
        popup.classList.remove('hidden');

        // アニメーションを追加
        detailImage.classList.add('animate-pop');
    } catch (error) {
        console.error('ポケモン詳細ポップアップ表示中にエラーが発生しました:', error);
        showError('ポケモン詳細の表示に失敗しました。');
    }
}

// ポケモンの図鑑説明（日本語）の取得
async function fetchPokemonDescription(pokemonId) {
    try {
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
        const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'ja');
        const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\n|\f/g, ' ') : '説明がありません。';
        return description;
    } catch (error) {
        console.error('図鑑説明の取得に失敗しました:', error);
        return '説明がありません。';
    }
}

// ポケモン詳細ポップアップを閉じる関数
function closePokemonDetailPopup() {
    const popup = document.getElementById('pokemon-detail-popup');
    popup.classList.remove('show');
    popup.classList.add('hidden');

    // アニメーションをリセット
    const detailImage = document.getElementById('detail-pokemon-image');
    detailImage.classList.remove('animate-pop');
}

// 初期化処理の修正
window.onload = async () => {
    try {
        await loadPokemonCards();
    } catch (error) {
        console.error('図鑑ページの初期化中にエラーが発生しました:', error);
        showError('図鑑ページの初期化に失敗しました。');
    }
};
