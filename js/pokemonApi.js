// =============================
// ポケモンAPI関連の関数
// =============================

export const pokemonApiUrl = 'https://pokeapi.co/api/v2/pokemon/';
export const maxPokemonId = 1010;

// ポケモンの画像を取得
export async function fetchPokemonImage(pokemonId) {
    try {
        const response = await fetch(`${pokemonApiUrl}${pokemonId}`);
        const data = await response.json();
        return data.sprites.front_default;
    } catch (error) {
        console.error('ポケモン画像の取得に失敗しました:', error);
        return '';
    }
}

// ポケモンの情報を取得
export async function fetchPokemonInfo(pokemonId) {
    try {
        const response = await fetch(`${pokemonApiUrl}${pokemonId}`);
        const data = await response.json();
        const responseSpecies = await fetch(data.species.url);
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
        return { name, types };
    } catch (error) {
        console.error('ポケモン情報の取得に失敗しました:', error);
        return { name: 'ふめい', types: 'ふめい' };
    }
}
