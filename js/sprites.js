/**
 * ToDoMon v6.0 - Sprites, nombres y sonidos (todo desde PokeAPI).
 */
'use strict';

// ========== SPRITES ==========
// <img class="pkmn-sprite">: GIF animado de Gen V (Black/White) para #1-#649 con respaldo al PNG
// estático (data-fallback) y luego a una Poké Ball. fitSprite() escala por factor entero
// (--sprite-scale) sin superar --sprite-box; si no cabe, reduce por divisor entero.

function getStaticSpriteUrl(id, shiny) {
    return SPRITE_BASE + 'pokemon/' + (shiny ? 'shiny/' : '') + id + '.png';
}
function getAnimatedSpriteUrl(id, shiny) {
    return SPRITE_BASE + 'pokemon/versions/generation-v/black-white/animated/' + (shiny ? 'shiny/' : '') + id + '.gif';
}
function getPokemonSpriteUrl(id, shiny) {
    const n = Number(id);
    return n >= 1 && n <= MAX_ANIMATED_ID ? getAnimatedSpriteUrl(n, shiny) : getStaticSpriteUrl(n, shiny);
}
function getBadgeSpriteUrl(n) { return SPRITE_BASE + 'badges/' + n + '.png'; }

function pokemonImgHTML(id, shiny, cls, alt) {
    return '<img class="pkmn-sprite ' + (cls || '') + '" src="' + getPokemonSpriteUrl(id, shiny) + '" data-fallback="' +
        getStaticSpriteUrl(id, shiny) + '" alt="' + escapeHTML(alt || '') + '" decoding="async">';
}

function setPokemonSprite(img, id, shiny) {
    const url = getPokemonSpriteUrl(id, shiny);
    img.dataset.fallback = getStaticSpriteUrl(id, shiny);
    if (img.getAttribute('src') !== url) img.src = url;
}

function fitSprite(img) {
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) return;
    const style = getComputedStyle(img);
    const box = parseInt(style.getPropertyValue('--sprite-box'), 10) || 96;
    let scale = parseInt(style.getPropertyValue('--sprite-scale'), 10) || 1;
    const longest = Math.max(w, h);
    while (scale > 1 && longest * scale > box) scale--;
    if (longest * scale > box) scale = 1 / Math.ceil(longest / box);
    img.style.width = Math.round(w * scale) + 'px';
    img.style.height = Math.round(h * scale) + 'px';
    img.style.imageRendering = scale >= 1 ? 'pixelated' : 'auto';
}

document.addEventListener('load', function (e) {
    const img = e.target;
    if (img && img.tagName === 'IMG' && img.classList.contains('pkmn-sprite')) {
        fitSprite(img);
        if (img._onSpriteLoad) img._onSpriteLoad();
    }
}, true);

document.addEventListener('error', function (e) {
    const img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.classList.contains('pkmn-sprite')) return;
    const fb = img.dataset.fallback;
    if (fb && img.src !== fb) img.src = fb;
    else if (img.src !== POKEBALL_SPRITE) img.src = POKEBALL_SPRITE;
}, true);

// ========== NOMBRES (español, desde pokemon-species) ==========
const NAMES_KEY = 'todomon_names';
const pokemonNames = (function () {
    try { return JSON.parse(localStorage.getItem(NAMES_KEY) || '{}') || {}; } catch (e) { return {}; }
})();
const pendingNames = {};
const failedNames = {};
const nameListeners = [];

function onPokemonName(fn) { nameListeners.push(fn); }

// Devuelve el nombre si ya se conoce; si no, lo pide y avisa a los listeners al llegar.
function getPokemonName(id) {
    id = Number(id);
    if (!id) return null;
    if (pokemonNames[id]) return pokemonNames[id];
    requestPokemonName(id);
    return failedNames[id] ? 'Pokémon #' + id : null;
}

function requestPokemonName(id) {
    if (pokemonNames[id] || pendingNames[id] || failedNames[id]) return;
    pendingNames[id] = true;
    fetch('https://pokeapi.co/api/v2/pokemon-species/' + id)
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
            const es = (data.names || []).find(function (n) { return n.language && n.language.name === 'es'; });
            const raw = es ? es.name : data.name;
            pokemonNames[id] = raw.charAt(0).toUpperCase() + raw.slice(1);
            try { localStorage.setItem(NAMES_KEY, JSON.stringify(pokemonNames)); } catch (e) { }
        })
        .catch(function (err) {
            console.warn('No se pudo obtener el nombre del Pokémon #' + id + ':', err.message);
            failedNames[id] = true;
        })
        .finally(function () {
            delete pendingNames[id];
            nameListeners.forEach(function (fn) { fn(id); });
        });
}

function pokemonLabel(id) { return getPokemonName(id) || 'Pokémon #' + id; }

// ========== SONIDO ==========
function getPokemonCryUrl(id) {
    return 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/' + id + '.ogg';
}

const AudioSystem = {
    enabled: true,
    play(id, volume) {
        if (!this.enabled || !id) return;
        try {
            const a = new Audio(getPokemonCryUrl(id));
            a.volume = volume || 0.5;
            a.play().catch(function () { });
        } catch (e) { }
    },
    // Efectos con gritos de Pokémon (igual que v5)
    sfx(kind) {
        const ids = { add: 257, complete: 248, delete: 530, levelUp: 133, badge: 25 };
        this.play(ids[kind], 0.4);
    }
};

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
