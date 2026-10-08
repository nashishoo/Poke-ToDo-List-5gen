/**
 * ToDoMon List App - v5.3
 * Vanilla JS, sin dependencias. Sprites, gritos y nombres desde PokeAPI.
 */

const STORAGE_KEY = 'todopkmn_tasks';
const TRAINER_KEY = 'todopkmn_trainer_level';
const THEME_KEY = 'todopkmn_theme';            // 'auto' | 'light' | 'dark'
const COLLAPSED_KEY = 'todopkmn_collapsed';
const BACKUP_KEY = 'todopkmn_tasks_backup';    // copia de seguridad si los datos no se pueden leer
const APP_NAME_KEY = 'todopkmn_app_name';
const HEADER_POKEMON_KEY = 'todopkmn_header_pokemon';

const CATEGORIES = {
    urgent: {
        id: 'urgent',
        name: 'Urgente',
        emoji: '🔥',
        subtitle: 'Prioridad máxima',
        pokemonId: 257,
        listId: 'urgentList',
        color: '#E74C3C',
        ball: 'master-ball'
    },
    work: {
        id: 'work',
        name: 'Trabajo',
        emoji: '💼',
        subtitle: 'Tareas profesionales',
        pokemonId: 248,
        listId: 'workList',
        color: '#3498DB',
        ball: 'ultra-ball'
    },
    personal: {
        id: 'personal',
        name: 'Personal',
        emoji: '🏠',
        subtitle: 'Hogar y familia',
        pokemonId: 25,
        listId: 'personalList',
        color: '#2ECC71',
        ball: 'great-ball'
    },
    learning: {
        id: 'learning',
        name: 'Aprendizaje',
        emoji: '📚',
        subtitle: 'Cursos y skills',
        pokemonId: 196,
        listId: 'learningList',
        color: '#9B59B6',
        ball: 'poke-ball'
    },
    ideas: {
        id: 'ideas',
        name: 'Ideas',
        emoji: '💡',
        subtitle: 'Brainstorm y futuro',
        pokemonId: 151,
        listId: 'ideasList',
        color: '#F39C12',
        ball: 'ultra-ball'
    },
    someday: {
        id: 'someday',
        name: 'Algún Día',
        emoji: '🌟',
        subtitle: 'Sin prisa',
        pokemonId: 143,
        listId: 'somedayList',
        color: '#95A5A6',
        ball: 'poke-ball'
    }
};

// Cadenas evolutivas Gen 1-5, verificadas contra PokeAPI (pokemon-species.evolves_from_species)
const GYM_EVOLUTIONS = [
    // Gen 1
    [1, 2, 3],        // Bulbasaur → Ivysaur → Venusaur
    [4, 5, 6],        // Charmander → Charmeleon → Charizard
    [7, 8, 9],        // Squirtle → Wartortle → Blastoise
    [43, 44, 45],     // Oddish → Gloom → Vileplume
    [60, 61, 62],     // Poliwag → Poliwhirl → Poliwrath
    [74, 75, 76],     // Geodude → Graveler → Golem
    [92, 93, 94],     // Gastly → Haunter → Gengar
    [109, 110],       // Koffing → Weezing
    [133, 470],       // Eevee → Leafeon
    // Gen 2
    [152, 153, 154],  // Chikorita → Bayleef → Meganium
    [155, 156, 157],  // Cyndaquil → Quilava → Typhlosion
    [158, 159, 160],  // Totodile → Croconaw → Feraligatr
    [161, 162],       // Sentret → Furret
    [165, 166],       // Ledyba → Ledian
    [167, 168],       // Spinarak → Ariados
    [170, 171],       // Chinchou → Lanturn
    [173, 35, 36],    // Cleffa → Clefairy → Clefable
    [187, 188, 189],  // Hoppip → Skiploom → Jumpluff
    [191, 192],       // Sunkern → Sunflora
    [194, 195],       // Wooper → Quagsire
    // Gen 3
    [258, 259, 260],  // Mudkip → Marshtomp → Swampert
    [261, 262],       // Poochyena → Mightyena
    [270, 271, 272],  // Lotad → Lombre → Ludicolo
    [273, 274, 275],  // Seedot → Nuzleaf → Shiftry
    [276, 277],       // Taillow → Swellow
    [278, 279],       // Wingull → Pelipper
    [280, 281, 282],  // Ralts → Kirlia → Gardevoir
    [283, 284],       // Surskit → Masquerain
    [300, 301],       // Skitty → Delcatty
    // Gen 4
    [387, 388, 389],  // Turtwig → Grotle → Torterra
    [390, 391, 392],  // Chimchar → Monferno → Infernape
    [393, 394, 395],  // Piplup → Prinplup → Empoleon
    [408, 409],       // Cranidos → Rampardos
    [410, 411],       // Shieldon → Bastiodon
    [415, 416],       // Combee → Vespiquen
    [420, 421],       // Cherubi → Cherrim
    [434, 435],       // Stunky → Skuntank
    // Gen 5
    [495, 496, 497],  // Snivy → Servine → Serperior
    [498, 499, 500],  // Tepig → Pignite → Emboar
    [501, 502, 503],  // Oshawott → Dewott → Samurott
    [519, 520, 521],  // Pidove → Tranquill → Unfezant
    [522, 523],       // Blitzle → Zebstrika
    [532, 533, 534],  // Timburr → Gurdurr → Conkeldurr
    [540, 541, 542],  // Sewaddle → Swadloon → Leavanny
    [543, 544, 545],  // Venipede → Whirlipede → Scolipede
    [546, 547],       // Cottonee → Whimsicott
    [548, 549],       // Petilil → Lilligant
    [551, 552, 553],  // Sandile → Krokorok → Krookodile
    [554, 555],       // Darumaka → Darmanitan
    [557, 558],       // Dwebble → Crustle
    [559, 560],       // Scraggy → Scrafty
    [562, 563],       // Yamask → Cofagrigus
    [570, 571],       // Zorua → Zoroark
    [572, 573],       // Minccino → Cinccino
    [574, 575, 576],  // Gothita → Gothorita → Gothitelle
    [577, 578, 579],  // Solosis → Duosion → Reuniclus
    [588, 589],       // Karrablast → Escavalier
    [590, 591],       // Foongus → Amoonguss
    [592, 593],       // Frillish → Jellicent
    [597, 598],       // Ferroseed → Ferrothorn
    [599, 600, 601],  // Klink → Klang → Klinklang
    [602, 603, 604],  // Tynamo → Eelektrik → Eelektross
    [605, 606],       // Elgyem → Beheeyem
    [607, 608, 609],  // Litwick → Lampent → Chandelure
    [610, 611, 612],  // Axew → Fraxure → Haxorus
    [613, 614],       // Cubchoo → Beartic
    [616, 617],       // Shelmet → Accelgor
    [619, 620],       // Mienfoo → Mienshao
    [622, 623],       // Golett → Golurk
    [624, 625],       // Pawniard → Bisharp
    [633, 634, 635],  // Deino → Zweilous → Hydreigon
    [636, 637],       // Larvesta → Volcarona
];

// v5.3: cadenas erróneas de v5.2 -> cadena corregida (migración de datos guardados)
const CHAIN_FIXES = {
    '173,174': [173, 35, 36],
    '408,409,410': [408, 409],
    '433,434': [434, 435],
    '546,547,548': [546, 547],
    '550,551,552': [551, 552, 553],
    '556,557': [557, 558],
    '561,562': [562, 563],
    '604,605,606': [605, 606],
    '615,616': [616, 617],
    '618,619': [619, 620],
    '622,623,624': [622, 623],
    '625,626': [624, 625],
    '636,637,638': [636, 637]
};

// Pool de la categoría Ideas: cualquier Pokémon de Gen 1-5 (#1-#649)
const IDEAS_POKEMON_POOL = Array.from({ length: 649 }, (_, i) => i + 1);

// Fire-type Pokémon (Urgente category)
const FIRE_TYPES = [
    // Gen 1
    4, 5, 6,        // Charmander → Charmeleon → Charizard
    37, 38,         // Vulpix → Ninetales
    58, 59,         // Growlithe → Arcanine
    77, 78,         // Ponyta → Rapidash
    126,            // Magmar
    136,            // Flareon
    146,            // Moltres (Legendary)
    // Gen 2
    155, 156, 157,  // Cyndaquil → Quilava → Typhlosion
    218, 219,       // Slugma → Magcargo
    228, 229,       // Houndour → Houndoom
    240,            // Magby
    244,            // Entei (Legendary)
    250,            // Ho-Oh (Legendary)
    // Gen 3
    255, 256, 257,  // Torchic → Combusken → Blaziken
    322, 323,       // Numel → Camerupt
    324,            // Torkoal
    // Gen 4
    390, 391, 392,  // Chimchar → Monferno → Infernape
    467,            // Magmortar
    485,            // Heatran (Legendary)
    // Gen 5
    494,            // Victini (Legendary)
    498, 499, 500,  // Tepig → Pignite → Emboar
    513, 514,       // Pansear → Simisear
    554, 555,       // Darumaka → Darmanitan
    607, 608, 609,  // Litwick → Lampent → Chandelure
    631,            // Heatmor
    636, 637,       // Larvesta → Volcarona
    643             // Reshiram (Legendary)
];

// Friendly/Cute Pokémon (Personal category)
const FRIENDLY_TYPES = [
    // Gen 1
    25, 26,         // Pikachu → Raichu
    35, 36,         // Clefairy → Clefable
    39, 40,         // Jigglypuff → Wigglytuff
    113,            // Chansey
    133, 134, 135, 136, // Eevee → Vaporeon, Jolteon, Flareon
    // Gen 2
    172, 173, 174,  // Pichu, Cleffa, Igglybuff
    175, 176,       // Togepi → Togetic
    183, 184,       // Marill → Azumarill
    196, 197,       // Espeon, Umbreon
    216, 217,       // Teddiursa → Ursaring
    231,            // Phanpy
    242,            // Blissey
    // Gen 3
    298,            // Azurill
    300, 301,       // Skitty → Delcatty
    311, 312,       // Plusle, Minun
    363, 364, 365,  // Spheal → Sealeo → Walrein
    // Gen 4
    403, 404, 405,  // Shinx → Luxio → Luxray
    417,            // Pachirisu
    427, 428,       // Buneary → Lopunny
    438,            // Bonsly
    439,            // Mime Jr.
    440,            // Happiny
    468,            // Togekiss
    470, 471,       // Leafeon, Glaceon
    // Gen 5
    506, 507, 508,  // Lillipup → Herdier → Stoutland
    531,            // Audino
    546, 547,       // Cottonee → Whimsicott
    548, 549,       // Petilil → Lilligant
    572, 573        // Minccino → Cinccino
];

// Psychic-type Pokémon (Aprendizaje category)
const PSYCHIC_TYPES = [
    // Gen 1
    63, 64, 65,     // Abra → Kadabra → Alakazam
    79, 80,         // Slowpoke → Slowbro
    96, 97,         // Drowzee → Hypno
    102, 103,       // Exeggcute → Exeggutor
    121,            // Starmie
    122,            // Mr. Mime
    124,            // Jynx
    150, 151,       // Mewtwo, Mew
    // Gen 2
    177, 178,       // Natu → Xatu
    196,            // Espeon
    199,            // Slowking
    201,            // Unown
    202,            // Wobbuffet
    203,            // Girafarig
    238,            // Smoochum
    251,            // Celebi
    // Gen 3
    280, 281, 282,  // Ralts → Kirlia → Gardevoir
    307, 308,       // Meditite → Medicham
    325, 326,       // Spoink → Grumpig
    337, 338,       // Lunatone, Solrock
    343, 344,       // Baltoy → Claydol
    358,            // Chimecho
    360,            // Wynaut
    374, 375, 376,  // Beldum → Metang → Metagross
    380, 381,       // Latias, Latios
    385, 386,       // Jirachi, Deoxys
    // Gen 4
    433,            // Chingling
    436, 437,       // Bronzor → Bronzong
    439,            // Mime Jr.
    475,            // Gallade
    480, 481, 482,  // Uxie, Mesprit, Azelf
    488,            // Cresselia
    // Gen 5
    494,            // Victini
    517, 518,       // Munna → Musharna
    527, 528,       // Woobat → Swoobat
    561,            // Sigilyph
    574, 575, 576,  // Gothita → Gothorita → Gothitelle
    577, 578, 579,  // Solosis → Duosion → Reuniclus
    605, 606,       // Elgyem → Beheeyem
    648             // Meloetta
];

// Extended Legendary Pokémon (5+ subtasks)
const LEGENDARY_POKEMON_EXTENDED = [
    // Gen 1
    144, 145, 146,  // Articuno, Zapdos, Moltres
    150, 151,       // Mewtwo, Mew
    // Gen 2
    243, 244, 245,  // Raikou, Entei, Suicune
    249, 250,       // Lugia, Ho-Oh
    251,            // Celebi
    // Gen 3
    377, 378, 379,  // Regirock, Regice, Registeel
    380, 381,       // Latias, Latios
    382, 383, 384,  // Kyogre, Groudon, Rayquaza
    385, 386,       // Jirachi, Deoxys
    // Gen 4
    480, 481, 482,  // Uxie, Mesprit, Azelf
    483, 484,       // Dialga, Palkia
    485,            // Heatran
    486,            // Regigigas
    487,            // Giratina
    488,            // Cresselia
    489, 490,       // Phione, Manaphy
    491,            // Darkrai
    492,            // Shaymin
    493,            // Arceus
    // Gen 5
    494,            // Victini
    638, 639, 640,  // Cobalion, Terrakion, Virizion
    641, 642, 645,  // Tornadus, Thundurus, Landorus
    643, 644, 646,  // Reshiram, Zekrom, Kyurem
    647,            // Keldeo
    648,            // Meloetta
    649             // Genesect
];

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/';
const ITEM_SPRITE_BASE = SPRITE_BASE + 'items/';

const ADVENTURE_ITEMS = [
    { id: 'masterball', name: 'Master Ball', sprite: ITEM_SPRITE_BASE + 'master-ball.png' },
    { id: 'ultraball', name: 'Ultra Ball', sprite: ITEM_SPRITE_BASE + 'ultra-ball.png' },
    { id: 'greatball', name: 'Great Ball', sprite: ITEM_SPRITE_BASE + 'great-ball.png' },
    { id: 'pokeball', name: 'Poke Ball', sprite: ITEM_SPRITE_BASE + 'poke-ball.png' },
    { id: 'moonstone', name: 'Moon Stone', sprite: ITEM_SPRITE_BASE + 'moon-stone.png' },
    { id: 'sunstone', name: 'Sun Stone', sprite: ITEM_SPRITE_BASE + 'sun-stone.png' },
];

const HEADER_POKEMON_POOL = Array.from({ length: 649 }, (_, i) => i + 1); // Gen 1-5
const POKEBALL_SPRITE = ITEM_SPRITE_BASE + 'poke-ball.png';
const MAX_ANIMATED_ID = 649; // Los GIF animados de Black/White existen para #1-#649
const ALL_CATEGORY_IDS = Object.keys(CATEGORIES);

// ========== ESTADO GLOBAL ==========
let tasks = emptyTasks();
let trainerLevel = 1;
let editingTaskId = null;
let newTaskModalSubtasks = [];
let editModalSubtasks = [];
let collapsedCategories = readJSON(COLLAPSED_KEY, []);
let isSleeping = true;
let themeMode = 'auto';

function emptyTasks() {
    const t = {};
    ALL_CATEGORY_IDS.forEach(function (c) { t[c] = []; });
    return t;
}

function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

// ========== SPRITES ==========
// Todas las imágenes de Pokémon usan la clase .pkmn-sprite:
// - Se intenta primero el GIF animado de Gen V (Black/White) cuando el id es <= 649.
// - Si falla, se usa el PNG estático (data-fallback) y, si también falla, una Poké Ball.
// - Al cargar, fitSprite() las escala por un factor ENTERO (o divisor entero) para que
//   los píxeles queden parejos.

function getStaticSpriteUrl(pokemonId, shiny) {
    return SPRITE_BASE + 'pokemon/' + (shiny ? 'shiny/' : '') + pokemonId + '.png';
}

function getAnimatedSpriteUrl(pokemonId, shiny) {
    return SPRITE_BASE + 'pokemon/versions/generation-v/black-white/animated/' + (shiny ? 'shiny/' : '') + pokemonId + '.gif';
}

function getPokemonSpriteUrl(pokemonId, shiny) {
    const id = Number(pokemonId);
    if (id >= 1 && id <= MAX_ANIMATED_ID) return getAnimatedSpriteUrl(id, shiny);
    return getStaticSpriteUrl(id, shiny);
}

// Atributos HTML para un <img class="pkmn-sprite"> de un Pokémon
function pokemonSpriteAttrs(pokemonId, shiny) {
    return 'src="' + getPokemonSpriteUrl(pokemonId, shiny) + '" data-fallback="' + getStaticSpriteUrl(pokemonId, shiny) + '"';
}

function setPokemonSprite(img, pokemonId, shiny) {
    const url = getPokemonSpriteUrl(pokemonId, shiny);
    img.dataset.fallback = getStaticSpriteUrl(pokemonId, shiny);
    if (img.getAttribute('src') !== url) img.src = url;
}

function setPlainSprite(img, url) {
    delete img.dataset.fallback;
    if (img.getAttribute('src') !== url) img.src = url;
}

function fitSprite(img) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return;
    const style = getComputedStyle(img);
    const box = parseInt(style.getPropertyValue('--sprite-box'), 10) || 96;
    let scale = parseInt(style.getPropertyValue('--sprite-scale'), 10) || 1;
    const longest = Math.max(w, h);
    while (scale > 1 && longest * scale > box) scale--;
    if (longest * scale > box) scale = 1 / Math.ceil(longest / box); // reducción por divisor entero
    img.style.width = Math.round(w * scale) + 'px';
    img.style.height = Math.round(h * scale) + 'px';
    img.style.imageRendering = scale >= 1 ? 'pixelated' : 'auto';
}

function fitAllSprites(root) {
    (root || document).querySelectorAll('img.pkmn-sprite').forEach(function (img) {
        if (img.complete && img.naturalWidth) fitSprite(img);
    });
}

function handleSpriteError(img) {
    const fallback = img.dataset.fallback;
    if (fallback && img.src !== fallback) {
        img.src = fallback;
    } else if (img.src !== POKEBALL_SPRITE) {
        img.src = POKEBALL_SPRITE;
    }
}

// 'load' y 'error' no burbujean: se escuchan en fase de captura para todas las imágenes
document.addEventListener('load', function (e) {
    const img = e.target;
    if (img && img.tagName === 'IMG' && img.classList.contains('pkmn-sprite')) {
        fitSprite(img);
        if (img._onSpriteLoad) img._onSpriteLoad();
    }
}, true);

document.addEventListener('error', function (e) {
    const img = e.target;
    if (img && img.tagName === 'IMG' && img.classList.contains('pkmn-sprite')) handleSpriteError(img);
}, true);

let resizeTimer = null;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        fitAllSprites();
        habitatSims.forEach(function (sim) { sim.layout(); });
    }, 150);
});

// Sprites estáticos del HTML (categorías, Pokédex) -> versión animada
function upgradeStaticSprites() {
    document.querySelectorAll('img[data-pokemon]').forEach(function (img) {
        setPokemonSprite(img, img.dataset.pokemon, false);
    });
}

function getPokemonCryUrl(pokemonId) {
    return 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/' + pokemonId + '.ogg';
}

// ========== HEADER Y AJUSTES ==========
function getRandomHeaderPokemon() {
    return HEADER_POKEMON_POOL[Math.floor(Math.random() * HEADER_POKEMON_POOL.length)];
}

function updateHeaderPokemon() {
    const headerPokemon = document.getElementById('headerPokemon');
    if (!headerPokemon) return;

    // Si está durmiendo, mostrar Pokéball
    if (isSleeping) {
        setPlainSprite(headerPokemon, POKEBALL_SPRITE);
        headerPokemon.alt = 'Pokéball';
        return;
    }

    let pokemonId = localStorage.getItem(HEADER_POKEMON_KEY);
    if (!pokemonId) {
        pokemonId = getRandomHeaderPokemon();
        localStorage.setItem(HEADER_POKEMON_KEY, pokemonId);
    }
    setPokemonSprite(headerPokemon, pokemonId, false);
    headerPokemon.alt = 'Pokémon #' + pokemonId;
}

function openSettingsModal() {
    document.getElementById('settingsAppName').value = localStorage.getItem(APP_NAME_KEY) || 'ToDoMon';
    document.getElementById('settingsModal').classList.add('visible');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('visible');
}

function saveSettings() {
    const newName = document.getElementById('settingsAppName').value.trim();
    if (newName) {
        localStorage.setItem(APP_NAME_KEY, newName);
        document.querySelector('h1').textContent = newName;
    }
    // Nuevo Pokémon aleatorio para el header
    localStorage.setItem(HEADER_POKEMON_KEY, getRandomHeaderPokemon());
    updateHeaderPokemon();
    closeSettingsModal();
}

// ========== TEMA DÍA / NOCHE ==========
// 'auto' = noche entre las 20:00 y las 07:00 (hora local). El botón alterna auto -> día -> noche.
const THEME_ORDER = ['auto', 'light', 'dark'];
const THEME_LABELS = { auto: 'Automático (según la hora)', light: 'Día', dark: 'Noche' };
const THEME_ICONS = { auto: '🌗', light: '☀️', dark: '🌙' };

function isNightHour(date) {
    const h = (date || new Date()).getHours();
    return h >= 20 || h < 7;
}

function applyTheme() {
    const dark = themeMode === 'dark' || (themeMode === 'auto' && isNightHour());
    document.body.classList.toggle('dark-mode', dark);
    const btn = document.getElementById('themeBtn');
    if (btn) {
        btn.textContent = THEME_ICONS[themeMode];
        btn.title = 'Tema: ' + THEME_LABELS[themeMode] + ' (clic para cambiar)';
        btn.setAttribute('aria-label', btn.title);
    }
}

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    themeMode = THEME_ORDER.includes(saved) ? saved : 'auto';
    localStorage.removeItem('todopkmn_dark_mode'); // clave antigua sin uso
    applyTheme();
    // En modo automático, revisar cada minuto si cambió el día/noche
    setInterval(function () { if (themeMode === 'auto') applyTheme(); }, 60 * 1000);
}

function cycleTheme() {
    themeMode = THEME_ORDER[(THEME_ORDER.indexOf(themeMode) + 1) % THEME_ORDER.length];
    localStorage.setItem(THEME_KEY, themeMode);
    applyTheme();
}

// ========== EVOLUCIONES ==========
function getEvolutionChain(category, subtaskCount) {
    const now = Date.now();
    let chain, isItem = false, isShiny = false;

    // CASE 1: 5+ subtasks -> Legendary Pokemon
    if (subtaskCount >= 5) {
        chain = [LEGENDARY_POKEMON_EXTENDED[now % LEGENDARY_POKEMON_EXTENDED.length]];
        isShiny = category === 'ideas' && Math.random() < 0.3;
        return { chain, isItem: false, isShiny, category, noEvolution: false };
    }

    // CASE 2: No subtasks -> Basic Pokemon (no evolution)
    if (subtaskCount === 0) {
        if (category === 'someday') {
            return {
                chain: [ADVENTURE_ITEMS[now % ADVENTURE_ITEMS.length]],
                isItem: true,
                isShiny: false,
                category,
                noEvolution: true
            };
        }
        const pool = getCategoryPokemonPool(category);
        return {
            chain: [pool[(now + 7) % pool.length]],
            isItem: false,
            isShiny: category === 'ideas' && Math.random() < 0.3,
            category,
            noEvolution: true
        };
    }

    // CASE 3: 1-4 subtasks -> Evolution chain
    if (category === 'someday') {
        isItem = true;
        chain = [];
        const startIndex = now % ADVENTURE_ITEMS.length;
        for (let i = 0; i < Math.min(3, subtaskCount + 1); i++) {
            chain.push(ADVENTURE_ITEMS[(startIndex + i) % ADVENTURE_ITEMS.length]);
        }
    } else if (category === 'work') {
        chain = GYM_EVOLUTIONS[(now + subtaskCount) % GYM_EVOLUTIONS.length];
    } else if (category === 'ideas') {
        const pokemonId = IDEAS_POKEMON_POOL[(now + subtaskCount) % IDEAS_POKEMON_POOL.length];
        isShiny = Math.random() < 0.3;
        chain = GYM_EVOLUTIONS.find(function (c) { return c.includes(pokemonId); }) || [pokemonId];
    } else {
        chain = getEvolutionChainFromPool(category, now, subtaskCount);
    }

    return { chain: chain.slice(), isItem, isShiny, category, noEvolution: false };
}

function getCategoryPokemonPool(category) {
    const pools = {
        urgent: FIRE_TYPES,
        work: GYM_EVOLUTIONS.flat(),
        personal: FRIENDLY_TYPES,
        learning: PSYCHIC_TYPES,
        ideas: IDEAS_POKEMON_POOL,
        someday: ADVENTURE_ITEMS
    };
    return pools[category] || FIRE_TYPES;
}

function getEvolutionChainFromPool(category, seed, subtaskCount) {
    const pool = getCategoryPokemonPool(category);
    const possibleChains = GYM_EVOLUTIONS.filter(function (chain) { return pool.includes(chain[0]); });
    if (possibleChains.length > 0) {
        return possibleChains[(seed + subtaskCount) % possibleChains.length];
    }
    return [pool[seed % pool.length]];
}

function getEvolutionStage(evolutionData, completedCount, totalCount) {
    const chain = evolutionData.chain;
    const progress = totalCount > 0 ? completedCount / totalCount : 0;

    if (evolutionData.isItem) {
        const itemIndex = Math.min(Math.floor(progress * chain.length), chain.length - 1);
        return { stage: itemIndex, item: chain[itemIndex] };
    }
    if (progress >= 1 && chain.length > 0) {
        return { stage: chain.length - 1, pokemonId: chain[chain.length - 1] };
    }
    if (progress >= 0.5 && chain.length >= 2) {
        const mid = Math.floor(chain.length / 2);
        return { stage: mid, pokemonId: chain[mid] };
    }
    return { stage: 0, pokemonId: chain[0] };
}

// Si una tarea sin subtareas (un solo Pokémon) recibe subtareas, darle su cadena evolutiva
function upgradeChainIfPossible(task) {
    const evo = task.evolutionData;
    if (evo.isItem || evo.chain.length !== 1 || task.subtasks.length === 0) return;
    const fullChain = GYM_EVOLUTIONS.find(function (c) { return c[0] === evo.chain[0]; });
    if (fullChain) {
        evo.chain = fullChain.slice();
        evo.noEvolution = false;
    }
}

function getTaskPokemonId(task) {
    if (!task.evolutionData || task.evolutionData.isItem) return null;
    return task.currentPokemonId || task.evolutionData.chain[0] || null;
}

// Recalcula progreso, etapa evolutiva y estado "completado" desde las subtareas.
// Devuelve true si algo cambió.
function syncTaskState(task) {
    const before = JSON.stringify([task.completed, task.currentPokemonId, task.currentItem, task.progress]);
    const total = task.subtasks.length;
    const done = task.subtasks.filter(function (s) { return s.completed; }).length;

    task.progress = done;
    if (total > 0) task.completed = done === total; // con subtareas, el estado se deriva de ellas

    const evolution = getEvolutionStage(task.evolutionData, done, total);
    if (task.evolutionData.isItem) {
        task.currentItem = evolution.item;
        task.currentPokemonId = null;
    } else {
        task.currentPokemonId = evolution.pokemonId;
        task.currentItem = null;
    }
    return before !== JSON.stringify([task.completed, task.currentPokemonId, task.currentItem, task.progress]);
}

// ========== AUDIO ==========
const AudioSystem = {
    sounds: {},
    initialized: false,

    init() {
        if (this.initialized) return;
        const essentialSounds = [
            { key: 'add', id: 257 }, { key: 'complete', id: 248 },
            { key: 'delete', id: 530 }, { key: 'levelUp', id: 133 }
        ];
        essentialSounds.forEach(function (sound) {
            try {
                const audio = new Audio();
                audio.src = getPokemonCryUrl(sound.id);
                audio.preload = 'auto';
                AudioSystem.sounds[sound.key] = audio;
            } catch (e) { console.warn('Audio no disponible:', e); }
        });
        this.initialized = true;
    },

    play(key) {
        if (!this.sounds[key]) return;
        const audio = this.sounds[key].cloneNode();
        audio.volume = 0.5;
        audio.play().catch(function () { });
    },

    playPokemonCry(pokemonId) {
        if (!pokemonId) return;
        const audio = new Audio(getPokemonCryUrl(pokemonId));
        audio.volume = 0.6;
        audio.play().catch(function () { });
    }
};

// ========== INICIO ==========
document.addEventListener('DOMContentLoaded', function () {
    const savedAppName = localStorage.getItem(APP_NAME_KEY);
    if (savedAppName) document.querySelector('h1').textContent = savedAppName;

    initTheme();
    upgradeStaticSprites();
    updateHeaderPokemon(); // mostrará Pokéball mientras está dormido

    loadData();
    setupEventListeners();
    renderAllTasks();
    updateStats();
    AudioSystem.init();
    initCollapsedCategories();

    renderPokedex();
    renderPokemonHabitat(); // en modo sleep por defecto
    initSleepMode();
});

// ========== MODO DORMIDO ==========
function initSleepMode() {
    isSleeping = true;
    document.body.classList.add('sleeping');
    document.getElementById('pokemonHabitat').classList.add('sleeping');

    document.addEventListener('click', wakeUp, { once: true });
    document.addEventListener('keydown', wakeUp, { once: true });
    document.addEventListener('touchstart', wakeUp, { once: true });
}

function wakeUp() {
    if (!isSleeping) return;
    isSleeping = false;

    document.body.classList.remove('sleeping');
    document.getElementById('pokemonHabitat').classList.remove('sleeping');

    try {
        const audio = new Audio(getPokemonCryUrl(25)); // Pikachu
        audio.volume = 0.3;
        audio.play().catch(function () { });
    } catch (e) { }

    updateHeaderPokemon();
    renderPokemonHabitat(); // arranca la simulación sin recrear a los Pokémon
}

// ========== EVENTOS ==========
function setupEventListeners() {
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('themeBtn').addEventListener('click', cycleTheme);
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('settingsModal').addEventListener('click', function (e) {
        if (e.target === e.currentTarget) closeSettingsModal();
    });

    document.getElementById('pokedexHeader').addEventListener('click', togglePokedex);

    // Pokéball buttons - abrir modal de nueva tarea
    document.querySelectorAll('.pokeball-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            openNewTaskModal(btn.dataset.category);
        });
    });

    // Category headers - colapsar/expandir
    document.querySelectorAll('.task-category.collapsible .category-header').forEach(function (header) {
        header.addEventListener('click', function (e) {
            if (e.target.closest('.pokeball-btn')) return;
            toggleCategoryCollapse(header.dataset.category);
        });
    });

    // Modal: nueva tarea
    document.getElementById('cancelNewTask').addEventListener('click', closeNewTaskModal);
    document.getElementById('saveNewTask').addEventListener('click', saveNewTask);
    document.getElementById('newTaskModal').addEventListener('click', function (e) {
        if (e.target === e.currentTarget) closeNewTaskModal();
    });
    document.getElementById('newTaskAddSubtaskBtn').addEventListener('click', addNewTaskSubtaskChip);
    document.getElementById('newTaskSubtaskInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addNewTaskSubtaskChip();
    });

    // Modal: editar tarea
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('saveEdit').addEventListener('click', saveEdit);
    document.getElementById('editModal').addEventListener('click', function (e) {
        if (e.target === e.currentTarget) closeEditModal();
    });
    document.getElementById('editTaskAddSubtaskBtn').addEventListener('click', addEditTaskSubtask);
    document.getElementById('editTaskSubtaskInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addEditTaskSubtask();
    });
}

// Refresca todo lo que depende del estado de las tareas
function refreshViews(category) {
    if (category) renderTasks(category); else renderAllTasks();
    updateStats();
    renderPokemonHabitat();
    renderPokedex();
}

// ========== ACCIONES SOBRE TAREAS ==========
function findTask(category, taskId) {
    return (tasks[category] || []).find(function (t) { return t.id === taskId; });
}

function toggleTask(category, taskId) {
    const task = findTask(category, taskId);
    if (!task || task.subtasks.length > 0) return; // con subtareas, el estado se deriva de ellas

    task.completed = !task.completed;
    saveData();
    refreshViews(category);

    if (task.completed) {
        AudioSystem.play('complete');
        AudioSystem.playPokemonCry(getTaskPokemonId(task));
    }
}

function toggleSubtask(category, taskId, subtaskId) {
    const task = findTask(category, taskId);
    if (!task) return;
    const subtask = task.subtasks.find(function (s) { return s.id === subtaskId; });
    if (!subtask) return;

    const wasCompleted = task.completed;
    const previousPokemon = task.currentPokemonId;

    subtask.completed = !subtask.completed;
    syncTaskState(task);

    if (task.completed && !wasCompleted) {
        AudioSystem.play('levelUp');
        AudioSystem.playPokemonCry(task.currentPokemonId);
    } else if (subtask.completed || task.currentPokemonId !== previousPokemon) {
        AudioSystem.playPokemonCry(task.currentPokemonId);
    }

    saveData();
    refreshViews(category);
    if (isSleeping) wakeUp();
}

function deleteTask(category, taskId) {
    tasks[category] = tasks[category].filter(function (t) { return t.id !== taskId; });
    saveData();
    refreshViews(category);
    AudioSystem.play('delete');
    if (isSleeping) wakeUp();
}

// ========== MODAL: NUEVA TAREA ==========
const CATEGORY_TITLES = {
    urgent: '🔥 Urgente',
    work: '💼 Trabajo',
    personal: '🏠 Personal',
    learning: '📚 Aprendizaje',
    ideas: '💡 Ideas',
    someday: '🌟 Algún Día'
};

function openNewTaskModal(category) {
    document.getElementById('newTaskModalTitle').textContent = 'Nueva ' + CATEGORY_TITLES[category];
    document.getElementById('newTaskCategory').value = category;
    document.getElementById('newTaskInput').value = '';
    document.getElementById('newTaskDescription').value = '';
    newTaskModalSubtasks = [];
    renderChips('newTaskSubtaskChips', newTaskModalSubtasks, 'removeNewTaskSubtaskChip');

    document.getElementById('newTaskModal').classList.add('visible');
    setTimeout(function () { document.getElementById('newTaskInput').focus(); }, 100);
}

function closeNewTaskModal() {
    document.getElementById('newTaskModal').classList.remove('visible');
    newTaskModalSubtasks = [];
}

function saveNewTask() {
    const input = document.getElementById('newTaskInput');
    const title = input.value.trim();
    const description = document.getElementById('newTaskDescription').value.trim();
    const category = document.getElementById('newTaskCategory').value;

    if (!title) {
        flashInvalid(input);
        return;
    }

    const subtasks = newTaskModalSubtasks.slice();
    const evolutionData = getEvolutionChain(category, subtasks.length);
    const task = {
        id: generateId(),
        title: title,
        description: description,
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: subtasks,
        evolutionData: evolutionData,
        currentPokemonId: evolutionData.isItem ? null : evolutionData.chain[0],
        currentItem: evolutionData.isItem ? evolutionData.chain[0] : null,
        progress: 0
    };

    tasks[category].unshift(task);
    saveData();
    refreshViews(category);

    AudioSystem.play('add');
    if (!evolutionData.isItem) AudioSystem.playPokemonCry(task.currentPokemonId);

    closeNewTaskModal();
}

function addNewTaskSubtaskChip() {
    const input = document.getElementById('newTaskSubtaskInput');
    const title = input.value.trim();
    if (!title) return;
    newTaskModalSubtasks.push({ id: generateId(), title: title, completed: false });
    input.value = '';
    renderChips('newTaskSubtaskChips', newTaskModalSubtasks, 'removeNewTaskSubtaskChip');
    input.focus();
}

function removeNewTaskSubtaskChip(id) {
    newTaskModalSubtasks = newTaskModalSubtasks.filter(function (s) { return s.id !== id; });
    renderChips('newTaskSubtaskChips', newTaskModalSubtasks, 'removeNewTaskSubtaskChip');
}

function renderChips(containerId, subtasks, removeFnName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (subtasks.length === 0) {
        container.innerHTML = '<span class="no-subtasks">Sin sub-tareas aún</span>';
        return;
    }
    container.innerHTML = subtasks.map(function (subtask) {
        return '<div class="subtask-chip" data-id="' + escapeHTML(subtask.id) + '">' +
            '<span>' + escapeHTML(subtask.title) + '</span>' +
            '<button class="chip-delete" onclick="' + removeFnName + '(\'' + escapeHTML(subtask.id) + '\')">×</button>' +
            '</div>';
    }).join('');
}

function flashInvalid(input) {
    input.style.borderColor = '#D32F2F';
    setTimeout(function () { input.style.borderColor = ''; }, 1000);
}

// ========== MODAL: EDITAR TAREA ==========
function openEditModal(category, taskId) {
    const task = findTask(category, taskId);
    if (!task) return;
    editingTaskId = { category: category, taskId: taskId };
    document.getElementById('editTaskInput').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    editModalSubtasks = task.subtasks.map(function (s) { return Object.assign({}, s); });
    renderChips('editTaskSubtaskChips', editModalSubtasks, 'removeEditTaskSubtask');

    document.getElementById('editModal').classList.add('visible');
    setTimeout(function () { document.getElementById('editTaskInput').focus(); }, 100);
}

function addEditTaskSubtask() {
    const input = document.getElementById('editTaskSubtaskInput');
    const title = input.value.trim();
    if (!title) return;
    editModalSubtasks.push({ id: generateId(), title: title, completed: false });
    input.value = '';
    renderChips('editTaskSubtaskChips', editModalSubtasks, 'removeEditTaskSubtask');
    input.focus();
}

function removeEditTaskSubtask(id) {
    editModalSubtasks = editModalSubtasks.filter(function (s) { return s.id !== id; });
    renderChips('editTaskSubtaskChips', editModalSubtasks, 'removeEditTaskSubtask');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('visible');
    editingTaskId = null;
}

function saveEdit() {
    if (!editingTaskId) return;
    const input = document.getElementById('editTaskInput');
    const newTitle = input.value.trim();
    if (!newTitle) {
        flashInvalid(input);
        return;
    }
    const category = editingTaskId.category;
    const task = findTask(category, editingTaskId.taskId);
    if (task) {
        task.title = newTitle;
        task.description = document.getElementById('editTaskDescription').value.trim();
        task.subtasks = editModalSubtasks.slice();

        // Se conserva el Pokémon original; solo se recalcula la etapa y el estado completado
        upgradeChainIfPossible(task);
        syncTaskState(task);

        saveData();
        refreshViews(category);
    }
    closeEditModal();
}

// ========== RENDER DE TAREAS ==========
function renderAllTasks() {
    ALL_CATEGORY_IDS.forEach(function (category) { renderTasks(category); });
    checkEmptyState();
}

function renderTasks(category) {
    const listElement = document.getElementById(CATEGORIES[category].listId);
    const countElement = document.querySelector('.task-count[data-category="' + category + '"]');
    if (!listElement) return;

    const categoryTasks = tasks[category];
    if (countElement) countElement.textContent = categoryTasks.length;

    listElement.innerHTML = categoryTasks.map(function (task) { return createTaskHTML(category, task); }).join('');

    listElement.querySelectorAll('.task-item').forEach(function (item) {
        const taskId = item.dataset.taskId;
        const checkbox = item.querySelector('.task-checkbox');
        if (checkbox) checkbox.addEventListener('click', function () { toggleTask(category, taskId); });

        item.querySelector('.edit-btn').addEventListener('click', function () { openEditModal(category, taskId); });
        item.querySelector('.delete-btn').addEventListener('click', function () {
            if (confirm('¿Eliminar esta tarea?')) deleteTask(category, taskId);
        });

        item.querySelectorAll('.mini-checkbox').forEach(function (miniCheckbox) {
            miniCheckbox.addEventListener('click', function () {
                toggleSubtask(category, taskId, miniCheckbox.dataset.subtaskId);
            });
        });
    });
    fitAllSprites(listElement);
    checkEmptyState();
}

function createTaskHTML(category, task) {
    const totalCount = task.subtasks.length;
    const completedCount = task.subtasks.filter(function (s) { return s.completed; }).length;
    const hasSubtasks = totalCount > 0;
    const isFullyCompleted = hasSubtasks ? completedCount === totalCount : task.completed;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    let taskClass = 'task-item';
    if (hasSubtasks) taskClass += ' has-subtasks';
    if (isFullyCompleted) taskClass += ' completed';
    if (hasSubtasks && isFullyCompleted) taskClass += ' task-complete shiny-complete';

    // Sprite del Pokémon (o ítem) de la tarea
    let pokemonSpriteHTML = '';
    const pokemonId = getTaskPokemonId(task);
    if (pokemonId) {
        const shiny = !!task.evolutionData.isShiny;
        pokemonSpriteHTML =
            '<div class="pokemon-mascot' + (shiny ? ' shiny' : '') + '">' +
            '<img ' + pokemonSpriteAttrs(pokemonId, shiny) + ' alt="Pokémon #' + pokemonId + '" class="pkmn-sprite mascot-sprite">' +
            '</div>';
    } else if (task.evolutionData.isItem && task.currentItem) {
        pokemonSpriteHTML =
            '<div class="pokemon-mascot item">' +
            '<img src="' + escapeHTML(task.currentItem.sprite) + '" alt="' + escapeHTML(task.currentItem.name) + '" class="pkmn-sprite mascot-sprite mascot-item">' +
            '</div>';
    }

    let progressBadgeHTML = '';
    if (hasSubtasks) {
        progressBadgeHTML =
            '<div class="task-progress">' +
            '<div class="progress-bar-mini"><div class="progress-fill-mini" style="width: ' + percentage + '%"></div></div>' +
            '<span class="progress-text-mini">' + completedCount + '/' + totalCount + '</span>' +
            '</div>';
    }

    // Checkbox manual solo si no hay subtareas
    const checkboxHTML = hasSubtasks ? '' : '<div class="task-checkbox ' + (isFullyCompleted ? 'checked' : '') + '"></div>';

    let subtasksHTML = '';
    if (hasSubtasks) {
        subtasksHTML = '<div class="task-subtasks">' + task.subtasks.map(function (subtask) {
            return '<div class="subtask-mini ' + (subtask.completed ? 'completed' : '') + '">' +
                '<div class="mini-checkbox ' + (subtask.completed ? 'checked' : '') + '" data-subtask-id="' + escapeHTML(subtask.id) + '"></div>' +
                '<span>' + escapeHTML(subtask.title) + '</span>' +
                '</div>';
        }).join('') + '</div>';
    }

    // Íconos de acción: TM = editar, Super Repel = eliminar, Rare Candy = completado
    return '' +
        '<li class="' + taskClass + '" data-task-id="' + escapeHTML(task.id) + '" data-category="' + category + '">' +
        checkboxHTML +
        '<div class="task-content">' +
        '<div class="task-header-top">' +
        '<div class="task-title">' + escapeHTML(task.title) + '</div>' +
        '<div class="task-actions">' +
        (isFullyCompleted ? '<img src="' + ITEM_SPRITE_BASE + 'rare-candy.png" class="pixel-icon-img" alt="Completado" title="Completado">' : '') +
        '<button class="action-btn edit-btn" title="Editar (TM)"><img src="' + ITEM_SPRITE_BASE + 'tm-normal.png" class="pixel-icon-img" alt="Editar"></button>' +
        '<button class="action-btn delete-btn" title="Eliminar (Repel)"><img src="' + ITEM_SPRITE_BASE + 'super-repel.png" class="pixel-icon-img" alt="Eliminar"></button>' +
        '</div>' +
        '</div>' +
        progressBadgeHTML +
        (task.description ? '<p class="task-description">' + escapeHTML(task.description) + '</p>' : '') +
        subtasksHTML +
        '</div>' +
        pokemonSpriteHTML +
        '</li>';
}

function checkEmptyState() {
    const totalTasks = ALL_CATEGORY_IDS.reduce(function (sum, c) { return sum + tasks[c].length; }, 0);
    document.getElementById('emptyState').classList.toggle('visible', totalTasks === 0);
}

function updateStats() {
    let total = 0, completed = 0;
    ALL_CATEGORY_IDS.forEach(function (c) {
        tasks[c].forEach(function (task) {
            total++;
            if (task.completed) completed++;
        });
    });

    document.getElementById('completedCount').textContent = completed;
    document.getElementById('totalCount').textContent = total;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = percentage + '%';

    const newLevel = calculateTrainerLevel(completed);
    if (newLevel > trainerLevel) AudioSystem.play('levelUp');
    if (newLevel !== trainerLevel) {
        trainerLevel = newLevel;
        saveData();
    }
    document.getElementById('trainerLevel').textContent = trainerLevel;
}

function calculateTrainerLevel(completedCount) {
    const thresholds = [[150, 10], [100, 9], [80, 8], [60, 7], [45, 6], [30, 5], [20, 4], [10, 3], [5, 2]];
    for (let i = 0; i < thresholds.length; i++) {
        if (completedCount >= thresholds[i][0]) return thresholds[i][1];
    }
    return 1;
}

// ========== PERSISTENCIA ==========
function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        localStorage.setItem(TRAINER_KEY, JSON.stringify(trainerLevel));
    } catch (e) { console.error('No se pudieron guardar los datos:', e); }
}

function loadData() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    try {
        tasks = savedTasks ? JSON.parse(savedTasks) : emptyTasks();
        if (!tasks || typeof tasks !== 'object' || Array.isArray(tasks)) throw new Error('Formato de tareas inválido');
        repairData();
        const savedLevel = localStorage.getItem(TRAINER_KEY);
        if (savedLevel) trainerLevel = Number(JSON.parse(savedLevel)) || 1;
    } catch (e) {
        console.warn('No se pudieron leer las tareas guardadas; se respaldan en "' + BACKUP_KEY + '" y se parte de cero.', e);
        // Nunca perder datos: guardar una copia antes de reiniciar
        if (savedTasks) {
            try { localStorage.setItem(BACKUP_KEY, savedTasks); } catch (err) { }
        }
        tasks = emptyTasks();
        trainerLevel = 1;
        saveData();
    }
}

// Repara y migra datos guardados por versiones anteriores (v5.0 - v5.2)
function repairData() {
    let hasChanges = false;

    // Migración de categorías antiguas (gym → work, raid → ideas, adventure → someday)
    const legacy = { gym: 'work', raid: 'ideas', adventure: 'someday' };
    Object.keys(legacy).forEach(function (oldKey) {
        if (Object.prototype.hasOwnProperty.call(tasks, oldKey)) {
            const target = legacy[oldKey];
            if (Array.isArray(tasks[oldKey]) && tasks[oldKey].length > 0) {
                tasks[target] = (Array.isArray(tasks[target]) ? tasks[target] : []).concat(tasks[oldKey]);
            }
            delete tasks[oldKey];
            hasChanges = true;
        }
    });

    // Asegurar que existan todas las categorías y descartar claves desconocidas vacías
    ALL_CATEGORY_IDS.forEach(function (cat) {
        if (!Array.isArray(tasks[cat])) {
            tasks[cat] = [];
            hasChanges = true;
        }
    });
    Object.keys(tasks).forEach(function (key) {
        if (!CATEGORIES[key]) {
            console.warn('Categoría desconocida en los datos guardados, se ignora:', key);
            delete tasks[key];
            hasChanges = true;
        }
    });

    ALL_CATEGORY_IDS.forEach(function (category) {
        tasks[category] = tasks[category].filter(function (task) { return task && typeof task === 'object'; });
        tasks[category].forEach(function (task) {
            if (!task.id) { task.id = generateId(); hasChanges = true; }
            if (typeof task.title !== 'string') { task.title = String(task.title || 'Tarea'); hasChanges = true; }
            if (!task.createdAt) { task.createdAt = new Date().toISOString(); hasChanges = true; }

            // 1. Asegurar arreglo de subtareas
            if (!Array.isArray(task.subtasks)) {
                task.subtasks = [];
                hasChanges = true;
            }

            // 2. Regenerar evolutionData si falta o es inválido
            if (!task.evolutionData || !Array.isArray(task.evolutionData.chain) || task.evolutionData.chain.length === 0) {
                task.evolutionData = getEvolutionChain(category, task.subtasks.length);
                task.currentPokemonId = null;
                task.currentItem = null;
                hasChanges = true;
            }

            // 3. v5.3: corregir cadenas evolutivas erróneas guardadas por v5.2
            if (!task.evolutionData.isItem) {
                const fixed = CHAIN_FIXES[task.evolutionData.chain.join(',')];
                if (fixed) {
                    task.evolutionData.chain = fixed.slice();
                    hasChanges = true;
                }
            }

            // 4. Etapa evolutiva y estado "completado" coherentes con las subtareas
            if (syncTaskState(task)) hasChanges = true;
        });
    });

    if (hasChanges) saveData();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escapeHTML(str) {
    if (str === null || str === undefined || str === '') return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ========== CATEGORÍAS COLAPSABLES ==========
function initCollapsedCategories() {
    collapsedCategories.forEach(function (category) {
        const element = document.getElementById(category + 'Tasks');
        if (element) element.classList.add('collapsed');
    });
}

function saveCollapsed() {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(collapsedCategories));
}

function toggleCategoryCollapse(category) {
    const element = document.getElementById(category + 'Tasks');
    if (!element) return;
    element.classList.toggle('collapsed');
    if (element.classList.contains('collapsed')) {
        if (!collapsedCategories.includes(category)) collapsedCategories.push(category);
    } else {
        collapsedCategories = collapsedCategories.filter(function (c) { return c !== category; });
    }
    saveCollapsed();
}

function scrollToTask(category, taskId) {
    const taskElement = document.querySelector('.task-item[data-task-id="' + CSS.escape(taskId) + '"]');
    if (!taskElement) return;

    const categoryElement = document.getElementById(category + 'Tasks');
    if (categoryElement && categoryElement.classList.contains('collapsed')) {
        categoryElement.classList.remove('collapsed');
        collapsedCategories = collapsedCategories.filter(function (c) { return c !== category; });
        saveCollapsed();
    }

    taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    taskElement.style.boxShadow = '0 0 20px rgba(255, 204, 0, 0.8)';
    setTimeout(function () { taskElement.style.boxShadow = ''; }, 2000);
}

// ========== NOMBRES DE POKÉMON ==========
// El nombre se guarda en la tarea junto al id al que corresponde (pokemonNameId).
// Si el Pokémon evoluciona, el id cambia y el nombre se vuelve a pedir a PokeAPI.
const nameCache = {};          // id -> nombre (sesión actual)
const pendingNameFetches = {}; // id -> true mientras hay una petición en curso
const failedNameFetches = {};  // id -> true si falló (no reintentar en esta sesión)

function getPokemonDisplayName(task) {
    const id = getTaskPokemonId(task);
    if (!id) return null;
    if (task.pokemonName && Number(task.pokemonNameId) === Number(id)) return task.pokemonName;
    if (nameCache[id]) return nameCache[id];
    ensurePokemonName(id);
    return failedNameFetches[id] ? 'Pokémon #' + id : null;
}

function ensurePokemonName(pokemonId) {
    if (nameCache[pokemonId] || pendingNameFetches[pokemonId] || failedNameFetches[pokemonId]) return;
    pendingNameFetches[pokemonId] = true;

    fetch('https://pokeapi.co/api/v2/pokemon-species/' + pokemonId)
        .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function (data) {
            const es = (data.names || []).find(function (n) { return n.language && n.language.name === 'es'; });
            const raw = es ? es.name : data.name;
            nameCache[pokemonId] = raw.charAt(0).toUpperCase() + raw.slice(1);
            applyPokemonName(pokemonId);
        })
        .catch(function (err) {
            console.warn('No se pudo obtener el nombre del Pokémon #' + pokemonId + ':', err.message);
            failedNameFetches[pokemonId] = true;
            applyPokemonName(pokemonId);
        })
        .finally(function () {
            delete pendingNameFetches[pokemonId];
        });
}

// Guarda el nombre en las tareas que muestran ese Pokémon y actualiza solo los textos en pantalla
function applyPokemonName(pokemonId) {
    let changed = false;
    ALL_CATEGORY_IDS.forEach(function (category) {
        tasks[category].forEach(function (task) {
            if (Number(getTaskPokemonId(task)) !== Number(pokemonId)) return;
            const name = nameCache[pokemonId];
            if (name && (task.pokemonName !== name || Number(task.pokemonNameId) !== Number(pokemonId))) {
                task.pokemonName = name;
                task.pokemonNameId = Number(pokemonId);
                changed = true;
            }
            updateNameUI(task);
        });
    });
    if (changed) saveData();
}

function updateNameUI(task) {
    const name = getPokemonDisplayName(task) || 'Cargando...';
    const sim = habitatSims.get(task.id);
    if (sim) sim.setName(name);
    const entry = document.querySelector('.pokedex-entry[data-task-id="' + CSS.escape(task.id) + '"] .pokedex-name-text');
    if (entry) entry.textContent = name;
}

// ========== HÁBITAT (VIDA ARTIFICIAL) ==========
// Cada Pokémon es un HabitatPokemon persistente (Map por id de tarea). Al re-renderizar solo
// se agregan/quitan/actualizan los que cambiaron, así no "saltan" de posición.
const habitatSims = new Map();
let isSimulationRunning = false;

function collectHabitatEntries() {
    const entries = [];
    ALL_CATEGORY_IDS.forEach(function (category) {
        tasks[category].forEach(function (task) {
            const pokemonId = getTaskPokemonId(task);
            if (!pokemonId) return; // los ítems no van al hábitat
            entries.push({
                taskId: task.id,
                category: category,
                task: task,
                pokemonId: pokemonId,
                isShiny: !!task.evolutionData.isShiny
            });
        });
    });
    return entries;
}

function renderPokemonHabitat() {
    const container = document.getElementById('pokemonTeam');
    if (!container) return;

    const seen = new Set();
    collectHabitatEntries().forEach(function (entry) {
        seen.add(entry.taskId);
        let sim = habitatSims.get(entry.taskId);
        if (!sim) {
            sim = new HabitatPokemon(entry, container);
            habitatSims.set(entry.taskId, sim);
        }
        sim.update(entry);
    });

    habitatSims.forEach(function (sim, taskId) {
        if (!seen.has(taskId)) {
            sim.destroy();
            habitatSims.delete(taskId);
        }
    });

    habitatSims.forEach(function (sim) { sim.element.classList.toggle('sleeping', isSleeping); });

    if (!isSimulationRunning && !isSleeping) {
        isSimulationRunning = true;
        requestAnimationFrame(animateHabitat);
    }
}

class HabitatPokemon {
    constructor(entry, container) {
        this.container = container;
        this.taskId = entry.taskId;
        this.category = entry.category;
        this.spriteKey = null;

        const el = document.createElement('div');
        el.className = 'habitat-pokemon';
        el.dataset.taskId = entry.taskId;
        el.dataset.category = entry.category;
        el.innerHTML =
            '<img class="pkmn-sprite habitat-sprite" alt="Pokémon">' +
            '<div class="pokemon-tooltip">' +
            '<div class="tooltip-header"><div class="tooltip-name"></div><div class="tooltip-id"></div></div>' +
            '<div class="tooltip-task"></div>' +
            '<div class="tooltip-date"></div>' +
            '<div class="tooltip-status"></div>' +
            '</div>';
        this.element = el;
        this.img = el.querySelector('img');
        this.nameEl = el.querySelector('.tooltip-name');

        const self = this;
        el.addEventListener('click', function () { scrollToTask(self.category, self.taskId); });
        this.img._onSpriteLoad = function () { self.measure(); };

        // Posición y "profundidad" aleatorias, fijas durante la vida del elemento
        this.x = Math.random() * 85;
        this.depth = Math.random(); // 0 = al frente, 1 = al fondo
        this.speed = Math.random() * 0.03 + 0.01;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.state = 'idle';
        this.timer = Math.floor(Math.random() * 100);
        this.widthPct = 8;

        container.appendChild(el);
        this.layout();
        this.render();
        this.updateSpriteFlip();
    }

    update(entry) {
        const task = entry.task;
        this.category = entry.category;
        this.element.dataset.category = entry.category;

        const key = entry.pokemonId + (entry.isShiny ? 's' : '');
        if (key !== this.spriteKey) {
            this.spriteKey = key;
            setPokemonSprite(this.img, entry.pokemonId, entry.isShiny);
            this.img.alt = 'Pokémon #' + entry.pokemonId;
        }
        this.element.classList.toggle('shiny', entry.isShiny);

        const total = task.subtasks.length;
        const statusText = task.completed ? 'Completado' : (total > 0 ? task.progress + '/' + total : 'En progreso');
        const title = task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title;
        this.element.querySelector('.tooltip-id').textContent = '#' + entry.pokemonId;
        this.element.querySelector('.tooltip-task').textContent = '📝 ' + title;
        this.element.querySelector('.tooltip-date').textContent = '📅 ' + new Date(task.createdAt).toLocaleDateString('es-CL');
        const statusEl = this.element.querySelector('.tooltip-status');
        statusEl.textContent = statusText;
        statusEl.classList.toggle('completed', !!task.completed);
        this.setName(getPokemonDisplayName(task) || 'Cargando...');
    }

    setName(name) {
        if (this.nameEl.textContent !== name) this.nameEl.textContent = name;
    }

    // Recalcula la altura según el tamaño actual del hábitat (responsive)
    layout() {
        const height = this.container.clientHeight || 350;
        const usable = Math.max(0, height - 110);
        this.y = Math.round(10 + this.depth * usable);
        this.element.style.bottom = this.y + 'px';
        this.element.style.zIndex = String(1000 - this.y); // más abajo = más cerca = encima
        this.measure();
    }

    measure() {
        const cw = this.container.clientWidth;
        if (cw > 0 && this.element.offsetWidth > 0) {
            this.widthPct = (this.element.offsetWidth / cw) * 100;
        }
        this.x = Math.min(this.x, this.maxX());
        this.render();
    }

    maxX() {
        return Math.max(0, 100 - this.widthPct);
    }

    tick() {
        if (this.timer > 0) this.timer--;
        else this.changeState();

        if (this.state === 'walking') {
            this.x += this.speed * this.direction;
            if (this.x > this.maxX()) {
                this.x = this.maxX();
                this.direction = -1;
                this.timer = 60;
                this.updateSpriteFlip();
            } else if (this.x < 0) {
                this.x = 0;
                this.direction = 1;
                this.timer = 60;
                this.updateSpriteFlip();
            }
        }
        this.render();
    }

    render() {
        this.element.style.left = this.x + '%';
    }

    changeState() {
        if (Math.random() < 0.3) {
            this.state = 'idle';
            this.timer = 60 + Math.random() * 120; // 1-3 s
        } else {
            this.state = 'walking';
            if (Math.random() > 0.5) {
                this.direction *= -1;
                this.updateSpriteFlip();
            }
            this.timer = 120 + Math.random() * 200; // 2-5 s
            this.speed = Math.random() * 0.03 + 0.01;
        }
    }

    // Los sprites de Gen V miran a la izquierda: al caminar a la derecha se voltea la imagen
    updateSpriteFlip() {
        this.img.style.transform = this.direction === 1 ? 'scaleX(-1)' : 'scaleX(1)';
    }

    destroy() {
        this.element.remove();
    }
}

function animateHabitat() {
    if (isSleeping) {
        isSimulationRunning = false;
        return;
    }
    habitatSims.forEach(function (sim) { sim.tick(); });
    requestAnimationFrame(animateHabitat);
}

// ========== POKÉDEX ==========
function togglePokedex() {
    document.getElementById('pokedexDashboard').classList.toggle('collapsed');
}

function renderPokedex() {
    const grid = document.getElementById('pokedexGrid');
    const empty = document.getElementById('pokedexEmpty');
    const countEl = document.getElementById('pokedexCount');
    if (!grid || !empty || !countEl) return;

    const entries = collectHabitatEntries().map(function (entry) {
        return {
            id: entry.taskId,
            category: entry.category,
            pokemonId: entry.pokemonId,
            pokemonName: getPokemonDisplayName(entry.task) || 'Cargando...',
            isShiny: entry.isShiny,
            createdAt: entry.task.createdAt,
            completed: !!entry.task.completed
        };
    });

    countEl.textContent = entries.length;
    if (entries.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    // Capturados primero, luego por fecha (más recientes arriba)
    entries.sort(function (a, b) {
        if (a.completed !== b.completed) return a.completed ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    grid.innerHTML = entries.map(function (entry) {
        return '<div class="pokedex-entry ' + (entry.completed ? 'completed' : '') + '" ' +
            'data-task-id="' + escapeHTML(entry.id) + '" data-category="' + entry.category + '">' +
            '<div class="pokedex-sprite-box"><img ' + pokemonSpriteAttrs(entry.pokemonId, entry.isShiny) + ' alt="Pokémon #' + entry.pokemonId + '" class="pkmn-sprite pokedex-sprite"></div>' +
            '<div class="pokedex-info">' +
            '<div class="pokedex-id">#' + String(entry.pokemonId).padStart(3, '0') + '</div>' +
            '<div class="pokedex-name"><span class="pokedex-name-text">' + escapeHTML(entry.pokemonName) + '</span>' +
            (entry.isShiny ? '<span class="pokedex-shiny">SHINY</span>' : '') +
            '</div>' +
            '<span class="pokedex-status ' + (entry.completed ? 'completed' : 'in-progress') + '">' +
            (entry.completed ? '✓ CAPTURADO' : '◐ EN PROGRESO') +
            '</span>' +
            '<div class="pokedex-date">📅 ' + new Date(entry.createdAt).toLocaleDateString('es-CL') + '</div>' +
            '</div>' +
            '</div>';
    }).join('');

    grid.querySelectorAll('.pokedex-entry').forEach(function (el) {
        el.addEventListener('click', function () { scrollToTask(el.dataset.category, el.dataset.taskId); });
    });
    fitAllSprites(grid);
}
