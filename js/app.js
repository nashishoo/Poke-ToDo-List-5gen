/**
 * ToDoMon List App
 */

const STORAGE_KEY = 'todopkmn_tasks';
const TRAINER_KEY = 'todopkmn_trainer_level';
const DARK_MODE_KEY = 'todopkmn_dark_mode';

const CATEGORIES = {
    urgent: {
        id: 'urgent',
        name: 'Urgente',
        emoji: '🔥',
        subtitle: 'Prioridad máxima',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/257.png',
        listId: 'urgentList',
        color: '#E74C3C',
        ball: 'master-ball'
    },
    work: {
        id: 'work',
        name: 'Trabajo',
        emoji: '💼',
        subtitle: 'Tareas profesionales',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png',
        listId: 'workList',
        color: '#3498DB',
        ball: 'ultra-ball'
    },
    personal: {
        id: 'personal',
        name: 'Personal',
        emoji: '🏠',
        subtitle: 'Hogar y familia',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
        listId: 'personalList',
        color: '#2ECC71',
        ball: 'great-ball'
    },
    learning: {
        id: 'learning',
        name: 'Aprendizaje',
        emoji: '📚',
        subtitle: 'Cursos y skills',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png',
        listId: 'learningList',
        color: '#9B59B6',
        ball: 'poke-ball'
    },
    ideas: {
        id: 'ideas',
        name: 'Ideas',
        emoji: '💡',
        subtitle: 'Brainstorm y futuro',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png',
        listId: 'ideasList',
        color: '#F39C12',
        ball: 'ultra-ball'
    },
    someday: {
        id: 'someday',
        name: 'Algún Día',
        emoji: '🌟',
        subtitle: 'Sin prisa',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png',
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

const ADVENTURE_ITEMS = [
    { id: 'masterball', name: 'Master Ball', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png' },
    { id: 'ultraball', name: 'Ultra Ball', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png' },
    { id: 'greatball', name: 'Great Ball', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png' },
    { id: 'pokeball', name: 'Poke Ball', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' },
    { id: 'moonstone', name: 'Moon Stone', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-stone.png' },
    { id: 'sunstone', name: 'Sun Stone', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sun-stone.png' },
];

// Pool de Pokémon aleatorios para el header (Gen 1-5)
const HEADER_POKEMON_POOL = Array.from({ length: 649 }, (_, i) => i + 1);

const APP_NAME_KEY = 'todopkmn_app_name';
const HEADER_POKEMON_KEY = 'todopkmn_header_pokemon';
const POKEBALL_SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

// Función para obtener Pokémon aleatorio del header
function getRandomHeaderPokemon() {
    const randomIndex = Math.floor(Math.random() * HEADER_POKEMON_POOL.length);
    return HEADER_POKEMON_POOL[randomIndex];
}

// Función para actualizar el Pokémon del header
function updateHeaderPokemon() {
    const headerPokemon = document.getElementById('headerPokemon');
    if (!headerPokemon) return;
    
    // Si está durmiendo, mostrar Pokéball
    if (isSleeping) {
        headerPokemon.src = POKEBALL_SPRITE;
        headerPokemon.alt = 'Pokéball';
        return;
    }
    
    // Obtener o generar nuevo Pokémon
    let pokemonId = localStorage.getItem(HEADER_POKEMON_KEY);
    
    if (!pokemonId) {
        pokemonId = getRandomHeaderPokemon();
        localStorage.setItem(HEADER_POKEMON_KEY, pokemonId);
    }
    
    headerPokemon.src = getPokemonSpriteUrl(pokemonId);
    headerPokemon.alt = 'Pokemon #' + pokemonId;
}

// Settings functions
function openSettingsModal() {
    const appName = localStorage.getItem(APP_NAME_KEY) || 'ToDoMon';
    document.getElementById('settingsAppName').value = appName;
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
    
    // Generar nuevo Pokémon aleatorio para el header
    const newPokemonId = getRandomHeaderPokemon();
    localStorage.setItem(HEADER_POKEMON_KEY, newPokemonId);
    updateHeaderPokemon();
    
    closeSettingsModal();
}

// Modificar wakeUp para actualizar el Pokémon del header
const originalWakeUp = wakeUp;
wakeUp = function() {
    originalWakeUp();
    updateHeaderPokemon();
};

function getEvolutionChain(category, subtaskCount) {
    const now = Date.now();
    let chain, isItem = false, isShiny = false, noEvolution = false;

    // CASE 1: 5+ subtasks -> Legendary Pokemon
    if (subtaskCount >= 5) {
        const legendaryIndex = now % LEGENDARY_POKEMON_EXTENDED.length;
        chain = [LEGENDARY_POKEMON_EXTENDED[legendaryIndex]];
        isShiny = category === 'ideas' && Math.random() < 0.3;
        return { chain, isItem: false, isShiny, category, noEvolution: false };
    }

    // CASE 2: No subtasks -> Basic Pokemon (no evolution)
    if (subtaskCount === 0) {
        if (category === 'someday') {
            const itemIndex = now % ADVENTURE_ITEMS.length;
            return {
                chain: [ADVENTURE_ITEMS[itemIndex]],
                isItem: true,
                isShiny: false,
                category,
                noEvolution: true
            };
        }

        const pool = getCategoryPokemonPool(category);
        const basicIndex = (now + 7) % pool.length;
        const basicPokemon = pool[basicIndex];

        return {
            chain: [basicPokemon],
            isItem: false,
            isShiny: category === 'ideas' && Math.random() < 0.3,
            category,
            noEvolution: true
        };
    }

    // CASE 3: 1-4 subtasks -> Evolution chain
    if (category === 'someday') {
        isItem = true;
        const items = [];
        const startIndex = now % ADVENTURE_ITEMS.length;
        for (let i = 0; i < Math.min(3, subtaskCount + 1); i++) {
            items.push(ADVENTURE_ITEMS[(startIndex + i) % ADVENTURE_ITEMS.length]);
        }
        chain = items;
    } else if (category === 'work') {
        chain = GYM_EVOLUTIONS[(now + subtaskCount) % GYM_EVOLUTIONS.length];
    } else if (category === 'ideas') {
        const randomIndex = (now + subtaskCount) % IDEAS_POKEMON_POOL.length;
        const pokemonId = IDEAS_POKEMON_POOL[randomIndex];
        isShiny = Math.random() < 0.3;

        chain = [pokemonId];
        const evoChain = GYM_EVOLUTIONS.find(function (c) { return c.includes(pokemonId); });
        if (evoChain) chain = evoChain;
    } else {
        chain = getEvolutionChainFromPool(category, now, subtaskCount);
    }

    return { chain, isItem, isShiny, category, noEvolution: false };
}

// NEW HELPER: Get category-specific Pokemon pool
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

// NEW HELPER: Get evolution chain from pool
function getEvolutionChainFromPool(category, seed, subtaskCount) {
    const pool = getCategoryPokemonPool(category);

    const possibleChains = [];
    GYM_EVOLUTIONS.forEach(function (chain) {
        if (pool.includes(chain[0])) {
            possibleChains.push(chain);
        }
    });

    if (possibleChains.length > 0) {
        return possibleChains[(seed + subtaskCount) % possibleChains.length];
    }

    return [pool[seed % pool.length]];
}

function getEvolutionStage(evolutionData, completedCount, totalCount) {
    if (evolutionData.isItem) {
        const progress = totalCount > 0 ? completedCount / totalCount : 0;
        const itemIndex = Math.min(Math.floor(progress * evolutionData.chain.length), evolutionData.chain.length - 1);
        return { stage: itemIndex, item: evolutionData.chain[itemIndex] };
    }

    const percentage = totalCount > 0 ? completedCount / totalCount : 0;

    if (percentage >= 1 && evolutionData.chain.length > 0) {
        return { stage: evolutionData.chain.length, pokemonId: evolutionData.chain[evolutionData.chain.length - 1] };
    } else if (percentage >= 0.5 && evolutionData.chain.length >= 2) {
        return { stage: Math.floor(evolutionData.chain.length / 2), pokemonId: evolutionData.chain[Math.floor(evolutionData.chain.length / 2)] };
    } else {
        return { stage: 0, pokemonId: evolutionData.chain[0] };
    }
}

function getPokemonSpriteUrl(pokemonId) {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pokemonId + '.png';
}

function getShinySpriteUrl(pokemonId) {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/' + pokemonId + '.png';
}

function getPokemonCryUrl(pokemonId) {
    return 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/' + pokemonId + '.ogg';
}

const AudioSystem = {
    sounds: {}, initialized: false,

    async init() {
        if (this.initialized) return;
        const essentialSounds = [
            { key: 'add', id: 257 }, { key: 'complete', id: 248 },
            { key: 'delete', id: 530 }, { key: 'levelUp', id: 133 }
        ];
        for (const sound of essentialSounds) {
            try {
                const audio = new Audio();
                audio.src = getPokemonCryUrl(sound.id);
                audio.preload = 'auto';
                this.sounds[sound.key] = audio;
            } catch (e) { console.warn('Error:', e); }
        }
        this.initialized = true;
    },

    play(key) {
        if (!this.sounds[key]) return;
        const audio = this.sounds[key].cloneNode();
        audio.volume = 0.5;
        audio.play().catch(e => { });
    },

    playPokemonCry(pokemonId) {
        const audio = new Audio(getPokemonCryUrl(pokemonId));
        audio.volume = 0.6;
        audio.play().catch(e => { });
    }
};

let currentCategory = 'urgent';
let tasks = { urgent: [], work: [], personal: [], learning: [], ideas: [], someday: [] };
let trainerLevel = 1;
let editingTaskId = null;
let darkMode = false;
let tempSubtasks = [];
let newTaskModalSubtasks = [];
let collapsedCategories = JSON.parse(localStorage.getItem('todopkmn_collapsed') || '[]');

document.addEventListener('DOMContentLoaded', function () {
    // Cargar nombre de la app guardado
    const savedAppName = localStorage.getItem(APP_NAME_KEY);
    if (savedAppName) {
        document.querySelector('h1').textContent = savedAppName;
    }
    
    // Actualizar Pokémon del header (mostrará Pokéball si está dormido)
    updateHeaderPokemon();
    
    loadData();
    setupEventListeners();
    try {
        renderAllTasks();
    } catch (e) {
        console.error('Error rendering tasks:', e);
    }

    try {
        updateStats();
    } catch (e) {
        console.error('Error updating stats:', e);
    }
    AudioSystem.init();
    initDarkMode();
    initCollapsedCategories();

    // Render Pokédex Dashboard
    renderPokedex();
    updatePokedexNames();

    // Render habitat inmediatamente (en modo sleep por defecto)
    renderPokemonHabitat();

    // Init Sleep Mode
    initSleepMode();

    // Legacy task input (alternative method)
    document.getElementById('addTaskBtn')?.addEventListener('click', addTask);
});

// --- SLEEP MODE LOGIC ---
let isSleeping = true;

function initSleepMode() {
    isSleeping = true;
    document.body.classList.add('sleeping');
    document.getElementById('pokemonHabitat').classList.add('sleeping');

    // Play intro sound (optional) or just wait for interaction

    // One-time interaction listener to wake up
    document.addEventListener('click', wakeUp, { once: true });
    document.addEventListener('keydown', wakeUp, { once: true });
    document.addEventListener('touchstart', wakeUp, { once: true });
}

function wakeUp() {
    if (!isSleeping) return;

    console.log('Waking up...');
    isSleeping = false;

    document.body.classList.remove('sleeping');
    document.getElementById('pokemonHabitat').classList.remove('sleeping');

    // Play cheerful sound
    try {
        const audio = new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg'); // Pikachu cry
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio autoplay prevented'));
    } catch (e) { }

    // Helper text removal handled by CSS class toggle

    // Force re-render to start animations correctly
    renderPokemonHabitat();
}

function initDarkMode() {
    const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);
    if (savedDarkMode === 'true') {
        darkMode = true;
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem(DARK_MODE_KEY, darkMode);
}

function setupEventListeners() {
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    
    // Settings modal events
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('settingsModal').addEventListener('click', function (e) {
        if (e.target === e.currentTarget) closeSettingsModal();
    });
    
    // Dark mode always on - no toggle needed

    // Category buttons (for visual selection)
    document.querySelectorAll('.category-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { setCategory(btn.dataset.category); });
    });

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
            // Don't collapse if clicking on the pokeball button
            if (e.target.closest('.pokeball-btn')) return;
            toggleCategoryCollapse(header.dataset.category);
        });
    });

    // New Task Modal events
    document.getElementById('cancelNewTask').addEventListener('click', closeNewTaskModal);
    document.getElementById('saveNewTask').addEventListener('click', saveNewTask);
    document.getElementById('newTaskModal').addEventListener('click', function (e) {
        if (e.target === e.currentTarget) closeNewTaskModal();
    });

    document.getElementById('newTaskAddSubtaskBtn').addEventListener('click', addNewTaskSubtaskChip);
    document.getElementById('newTaskSubtaskInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addNewTaskSubtaskChip();
    });

    // Edit Modal events
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('saveEdit').addEventListener('click', saveEdit);
    document.getElementById('editModal').addEventListener('click', function (e) {
        if (e.target === e.currentTarget) closeEditModal();
    });
}

function setCategory(categoryId) {
    currentCategory = categoryId;
    document.querySelectorAll('.category-btn').forEach(function (btn) {
        btn.classList.remove('active');
        if (btn.dataset.category === categoryId) btn.classList.add('active');
    });
}

function addSubtaskChip() {
    const input = document.getElementById('newSubtaskInput');
    const title = input.value.trim();
    if (!title) return;

    tempSubtasks.push({ id: generateId(), title: title, completed: false });
    input.value = '';
    renderSubtaskChips();
    input.focus();
}

function removeSubtaskChip(id) {
    tempSubtasks = tempSubtasks.filter(function (s) { return s.id !== id; });
    renderSubtaskChips();
}

function renderSubtaskChips() {
    const container = document.getElementById('subtaskChips');

    if (tempSubtasks.length === 0) {
        container.innerHTML = '<span class="no-subtasks">Sin sub-tareas aún</span>';
        return;
    }

    container.innerHTML = tempSubtasks.map(function (subtask) {
        return '<div class="subtask-chip" data-id="' + subtask.id + '">' +
            '<span>' + escapeHTML(subtask.title) + '</span>' +
            '<button class="chip-delete" onclick="removeSubtaskChip(\'' + subtask.id + '\')">×</button>' +
            '</div>';
    }).join('');
}

function addTask() {
    const input = document.getElementById('taskInput');
    const descriptionInput = document.getElementById('taskDescription');

    const title = input.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) {
        input.style.borderColor = '#D32F2F';
        setTimeout(function () { input.style.borderColor = ''; }, 1000);
        return;
    }

    const subtasks = [...tempSubtasks];
    const evolutionData = getEvolutionChain(currentCategory, subtasks.length);

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

    tasks[currentCategory].unshift(task);
    saveData();
    renderTasks(currentCategory);
    updateStats();

    AudioSystem.play('add');
    if (!evolutionData.isItem) AudioSystem.playPokemonCry(task.currentPokemonId);

    input.value = '';
    descriptionInput.value = '';
    tempSubtasks = [];
    renderSubtaskChips();
    input.focus();

    // Force wake up on interaction
    if (isSleeping) wakeUp();
}

function toggleTask(category, taskId) {
    const taskIndex = tasks[category].findIndex(function (t) { return t.id === taskId; });
    if (taskIndex !== -1) {
        tasks[category][taskIndex].completed = !tasks[category][taskIndex].completed;
        saveData();
        renderTasks(category);
        updateStats();

        const task = tasks[category][taskIndex];
        if (tasks[category][taskIndex].completed) {
            AudioSystem.play('complete');
            if (task.evolutionData && !task.evolutionData.isItem) {
                AudioSystem.playPokemonCry(task.evolutionData.chain[task.evolutionData.chain.length - 1]);
            }
        }
    }
}

function toggleSubtask(category, taskId, subtaskId) {
    const task = tasks[category].find(function (t) { return t.id === taskId; });
    if (!task || !task.subtasks) return;

    const subtask = task.subtasks.find(function (s) { return s.id === subtaskId; });
    if (!subtask) return;

    subtask.completed = !subtask.completed;

    const completedCount = task.subtasks.filter(function (s) { return s.completed; }).length;
    const totalCount = task.subtasks.length;
    task.progress = completedCount;

    const evolution = getEvolutionStage(task.evolutionData, completedCount, totalCount);

    if (task.evolutionData.isItem) {
        task.currentItem = evolution.item;
    } else {
        task.currentPokemonId = evolution.pokemonId;
    }

    if (completedCount === totalCount && totalCount > 0) {
        task.completed = true;
        AudioSystem.play('levelUp');
        if (!task.evolutionData.isItem) AudioSystem.playPokemonCry(evolution.pokemonId);
    } else if (completedCount > 0) {
        if (!task.evolutionData.isItem) AudioSystem.playPokemonCry(evolution.pokemonId);
    }

    saveData();
    renderTasks(category);
    updateStats();
    renderPokemonHabitat();
    renderPokedex();

    // Force wake up on interaction
    if (isSleeping) wakeUp();
}

function deleteTask(category, taskId) {
    tasks[category] = tasks[category].filter(function (t) { return t.id !== taskId; });
    saveData();
    renderTasks(category);
    updateStats();
    renderTasks(category);
    updateStats();
    renderPokemonHabitat();
    renderPokedex();
    AudioSystem.play('delete');

    // Force wake up on interaction
    if (isSleeping) wakeUp();
}

function openEditModal(category, taskId) {
    const task = tasks[category].find(function (t) { return t.id === taskId; });
    if (!task) return;
    editingTaskId = { category: category, taskId: taskId };
    document.getElementById('editTaskInput').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';

    // Render subtasks in edit modal
    renderEditModalSubtasks(task);

    document.getElementById('editModal').classList.add('visible');
    setTimeout(function () { document.getElementById('editTaskInput').focus(); }, 100);
}

let editModalSubtasks = [];

function renderEditModalSubtasks(task) {
    editModalSubtasks = task.subtasks ? [...task.subtasks] : [];

    const container = document.getElementById('editTaskSubtaskChips');
    if (!container) {
        // Create container if doesn't exist
        const descriptionGroup = document.getElementById('editTaskDescription').closest('.description-group');
        if (descriptionGroup) {
            const subtaskSection = document.createElement('div');
            subtaskSection.className = 'subtasks-input-section';
            subtaskSection.innerHTML = `
                <label class="subtasks-label">Sub-tareas:</label>
                <div class="subtask-chips" id="editTaskSubtaskChips"></div>
                <div class="add-subtask-row">
                    <input type="text" id="editTaskSubtaskInput" placeholder="Nueva sub-tarea..." maxlength="50">
                    <button id="editTaskAddSubtaskBtn" class="add-subtask-btn">+</button>
                </div>
            `;
            descriptionGroup.after(subtaskSection);

            // Add event listeners
            document.getElementById('editTaskAddSubtaskBtn').addEventListener('click', addEditTaskSubtask);
            document.getElementById('editTaskSubtaskInput').addEventListener('keypress', function (e) {
                if (e.key === 'Enter') addEditTaskSubtask();
            });
        }
    }

    const chipsContainer = document.getElementById('editTaskSubtaskChips');
    if (editModalSubtasks.length === 0) {
        chipsContainer.innerHTML = '<span class="no-subtasks">Sin sub-tareas aún</span>';
    } else {
        chipsContainer.innerHTML = editModalSubtasks.map(function (subtask, index) {
            return '<div class="subtask-chip" data-id="' + subtask.id + '">' +
                '<span>' + escapeHTML(subtask.title) + '</span>' +
                '<button class="chip-delete" onclick="removeEditTaskSubtask(\'' + subtask.id + '\')">×</button>' +
                '</div>';
        }).join('');
    }
}

function addEditTaskSubtask() {
    const input = document.getElementById('editTaskSubtaskInput');
    const title = input.value.trim();
    if (!title) return;

    editModalSubtasks.push({ id: generateId(), title: title, completed: false });
    input.value = '';
    renderEditModalSubtasksChips();
    input.focus();
}

function removeEditTaskSubtask(id) {
    editModalSubtasks = editModalSubtasks.filter(function (s) { return s.id !== id; });
    renderEditModalSubtasksChips();
}

function renderEditModalSubtasksChips() {
    const container = document.getElementById('editTaskSubtaskChips');
    if (!container) return;

    if (editModalSubtasks.length === 0) {
        container.innerHTML = '<span class="no-subtasks">Sin sub-tareas aún</span>';
    } else {
        container.innerHTML = editModalSubtasks.map(function (subtask) {
            return '<div class="subtask-chip" data-id="' + subtask.id + '">' +
                '<span>' + escapeHTML(subtask.title) + '</span>' +
                '<button class="chip-delete" onclick="removeEditTaskSubtask(\'' + subtask.id + '\')">×</button>' +
                '</div>';
        }).join('');
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('visible');
    editingTaskId = null;
}

function saveEdit() {
    if (!editingTaskId) return;
    const newTitle = document.getElementById('editTaskInput').value.trim();
    const newDescription = document.getElementById('editTaskDescription').value.trim();
    if (!newTitle) {
        document.getElementById('editTaskInput').style.borderColor = '#D32F2F';
        setTimeout(function () { document.getElementById('editTaskInput').style.borderColor = ''; }, 1000);
        return;
    }
    const taskIndex = tasks[editingTaskId.category].findIndex(function (t) { return t.id === editingTaskId.taskId; });
    if (taskIndex !== -1) {
        tasks[editingTaskId.category][taskIndex].title = newTitle;
        tasks[editingTaskId.category][taskIndex].description = newDescription;

        // Save subtasks from edit modal
        const oldSubtaskCount = tasks[editingTaskId.category][taskIndex].subtasks.length;
        tasks[editingTaskId.category][taskIndex].subtasks = [...editModalSubtasks];

        // If subtask count changed, recalculate evolution stage but KEEP original Pokemon
        if (editModalSubtasks.length !== oldSubtaskCount) {
            const task = tasks[editingTaskId.category][taskIndex];
            
            // Get current progress to recalculate evolution stage
            const completedCount = task.subtasks.filter(s => s.completed).length;
            
            // Recalculate the evolution stage based on progress, but keep the original chain
            const evolution = getEvolutionStage(task.evolutionData, completedCount, editModalSubtasks.length);

            if (task.evolutionData.isItem) {
                task.currentItem = evolution.item;
            } else {
                task.currentPokemonId = evolution.pokemonId;
            }
        }

        saveData();
        renderTasks(editingTaskId.category);
        updateStats();
        renderPokemonHabitat();
        renderPokedex();
    }
    closeEditModal();
}

function renderAllTasks() {
    Object.keys(CATEGORIES).forEach(function (category) { renderTasks(category); });
    checkEmptyState();
    renderSubtaskChips();
}

function renderTasks(category) {
    const listElement = document.getElementById(CATEGORIES[category].listId);
    const countElement = document.querySelector('.task-count[data-category="' + category + '"]');

    if (!listElement) return;

    const categoryTasks = tasks[category];
    if (countElement) countElement.textContent = categoryTasks.length;

    if (categoryTasks.length === 0) {
        listElement.innerHTML = '';
    } else {
        listElement.innerHTML = categoryTasks.map(function (task) { return createTaskHTML(category, task); }).join('');

        listElement.querySelectorAll('.task-item').forEach(function (item) {
            const taskId = item.dataset.taskId;
            const categoryAttr = item.dataset.category;
            const hasSubtasks = item.classList.contains('has-subtasks');

            // Solo agregar evento click si NO hay sub-tareas
            if (!hasSubtasks) {
                const checkbox = item.querySelector('.task-checkbox');
                if (checkbox) {
                    checkbox.addEventListener('click', function () { toggleTask(categoryAttr, taskId); });
                }
            }

            item.querySelector('.edit-btn').addEventListener('click', function () { openEditModal(categoryAttr, taskId); });
            item.querySelector('.delete-btn').addEventListener('click', function () {
                if (confirm('¿Eliminar esta tarea?')) deleteTask(categoryAttr, taskId);
            });

            item.querySelectorAll('.subtask-mini').forEach(function (miniItem) {
                const checkbox = miniItem.querySelector('.mini-checkbox');
                if (checkbox) {
                    checkbox.addEventListener('click', function () {
                        toggleSubtask(categoryAttr, taskId, checkbox.dataset.subtaskId);
                    });
                }
            });
        });
    }
    checkEmptyState();
}

function createTaskHTML(category, task) {
    const completedCount = task.subtasks ? task.subtasks.filter(function (s) { return s.completed; }).length : 0;
    const totalCount = task.subtasks ? task.subtasks.length : 0;
    const hasSubtasks = totalCount > 0;
    const isFullyCompleted = hasSubtasks ? completedCount === totalCount : task.completed;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    let taskClass = 'task-item';
    if (hasSubtasks) taskClass += ' has-subtasks';
    if (task.completed || isFullyCompleted) taskClass += ' completed';
    if (hasSubtasks && isFullyCompleted) taskClass += ' task-complete shiny-complete';

    // TASK 1: Pokemon mascot sprite
    let pokemonSpriteHTML = '';
    const validPokemonId = task.currentPokemonId || (task.evolutionData && !task.evolutionData.isItem ? task.evolutionData.chain[0] : null);

    if (validPokemonId && !task.evolutionData.isItem) {
        const spriteUrl = task.evolutionData.isShiny
            ? getShinySpriteUrl(validPokemonId)
            : getPokemonSpriteUrl(validPokemonId);

        pokemonSpriteHTML = `
            <div class="pokemon-mascot ${task.evolutionData.isShiny ? 'shiny' : ''}">
                <img src="${spriteUrl}" alt="Pokemon ${validPokemonId}" class="mascot-sprite">
            </div>
        `;
    } else if (task.evolutionData && task.evolutionData.isItem && task.currentItem) {
        pokemonSpriteHTML = `
            <div class="pokemon-mascot item">
                <img src="${task.currentItem.sprite}" alt="${task.currentItem.name}" class="mascot-sprite mascot-item">
            </div>
        `;
    }

    // TASK 2: Visual Progress Bar for tasks with subtasks
    let progressBadgeHTML = '';
    if (hasSubtasks) {
        progressBadgeHTML = `
            <div class="task-progress">
                <div class="progress-bar-mini">
                    <div class="progress-fill-mini" style="width: ${percentage}%"></div>
                </div>
                <span class="progress-text-mini">${completedCount}/${totalCount}</span>
            </div>
        `;
    }

    // Checkbox - Only if no subtasks
    let checkboxHTML = '';
    if (!hasSubtasks) {
        checkboxHTML = `<div class="task-checkbox ${isFullyCompleted ? 'checked' : ''}"></div>`;
    }

    // Subtasks HTML
    let subtasksHTML = '';
    if (hasSubtasks) {
        subtasksHTML = '<div class="task-subtasks">';
        task.subtasks.forEach(function (subtask) {
            subtasksHTML += `
                <div class="subtask-mini ${subtask.completed ? 'completed' : ''}">
                    <div class="mini-checkbox ${subtask.completed ? 'checked' : ''}" data-subtask-id="${subtask.id}"></div>
                    <span>${escapeHTML(subtask.title)}</span>
                </div>
            `;
        });
        subtasksHTML += '</div>';
    }

    // ACTION ICONS: Tm for Edit, Repel for Delete
    // TM: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png
    // Repel: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-repel.png

    // TASK 3: Return Final Structure with Flex Header
    return `
        <li class="${taskClass}" 
            data-task-id="${task.id}" 
            data-category="${category}">
            
            <!-- Checkbox (if no subtasks) -->
            ${checkboxHTML}
            
            <!-- Task content -->
            <div class="task-content">
                <div class="task-header-top">
                    <!-- Title and Actions Row -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                        <div class="task-title" style="margin-bottom: 0;">${escapeHTML(task.title)}</div>
                        
                        <!-- Action buttons (Pokemon Item Icons) -->
                        <div class="task-actions" style="position: static; opacity: 0.8; margin-left: 8px;">
                            ${isFullyCompleted ? '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png" class="pixel-icon-img" alt="Done" style="margin-right: 4px;" title="Completado">' : ''}
                            <button class="action-btn edit-btn" title="Editar (TM)">
                                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png" class="pixel-icon-img" alt="Edit">
                            </button>
                            <button class="action-btn delete-btn" title="Eliminar (Repel)">
                                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-repel.png" class="pixel-icon-img" alt="Delete">
                            </button>
                        </div>
                    </div>
                </div>

                ${progressBadgeHTML}  <!-- Visual Bar below title -->
                
                ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ''}
                
                <!-- Subtasks -->
                ${subtasksHTML}
            </div>
            
            <!-- Pokemon mascot -->
            ${pokemonSpriteHTML}  <!-- BOTTOM RIGHT -->
        </li>
    `;
}

function checkEmptyState() {
    const totalTasks = Object.values(tasks).reduce(function (sum, arr) { return sum + arr.length; }, 0);
    const emptyState = document.getElementById('emptyState');
    emptyState.classList.toggle('visible', totalTasks === 0);
}

function updateStats() {
    let taskCount = 0, taskCompleted = 0;

    Object.values(tasks).forEach(function (categoryTasks) {
        categoryTasks.forEach(function (task) {
            taskCount++;
            if (task.completed) taskCompleted++;
        });
    });

    // Total only counts main tasks now
    const total = taskCount;
    const completed = taskCompleted;

    document.getElementById('completedCount').textContent = completed;
    document.getElementById('totalCount').textContent = total;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = percentage + '%';

    // Trainer level based on main tasks completed
    const newLevel = calculateTrainerLevel(completed);
    if (newLevel > trainerLevel) AudioSystem.play('levelUp');
    if (newLevel !== trainerLevel) {
        trainerLevel = newLevel;
        saveData();
    }
    document.getElementById('trainerLevel').textContent = trainerLevel;
}

function calculateTrainerLevel(completedCount) {
    if (completedCount >= 150) return 10;
    if (completedCount >= 100) return 9;
    if (completedCount >= 80) return 8;
    if (completedCount >= 60) return 7;
    if (completedCount >= 45) return 6;
    if (completedCount >= 30) return 5;
    if (completedCount >= 20) return 4;
    if (completedCount >= 10) return 3;
    if (completedCount >= 5) return 2;
    return 1;
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        localStorage.setItem(TRAINER_KEY, JSON.stringify(trainerLevel));
    } catch (e) { console.error('Error:', e); }
}

function loadData() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        const savedLevel = localStorage.getItem(TRAINER_KEY);
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        } else {
            tasks = { urgent: [], work: [], personal: [], learning: [], ideas: [], someday: [] };
        }

        // Always attempt to repair data, even if empty or just loaded
        repairData();

        if (savedLevel) trainerLevel = JSON.parse(savedLevel);
    } catch (e) {
        console.error('Error loading data:', e);
        tasks = { urgent: [], work: [], personal: [], learning: [], ideas: [], someday: [] };
        trainerLevel = 1;
        // Try to save the clean state to fix persistent crash loops
        saveData();
    }
}

function repairData() {
    let hasChanges = false;

    // Ensure new categories exist
    ['urgent', 'work', 'personal', 'learning', 'ideas', 'someday'].forEach(cat => {
        if (!tasks[cat] || !Array.isArray(tasks[cat])) {
            tasks[cat] = [];
            hasChanges = true;
        }
    });

    // Legacy category migration (gym → work, raid → ideas, adventure → someday)
    if (tasks.gym && tasks.gym.length > 0) {
        tasks.work = (tasks.work || []).concat(tasks.gym);
        delete tasks.gym;
        hasChanges = true;
    }
    if (tasks.raid && tasks.raid.length > 0) {
        tasks.ideas = (tasks.ideas || []).concat(tasks.raid);
        delete tasks.raid;
        hasChanges = true;
    }
    if (tasks.adventure && tasks.adventure.length > 0) {
        tasks.someday = (tasks.someday || []).concat(tasks.adventure);
        delete tasks.adventure;
        hasChanges = true;
    }

    Object.keys(tasks).forEach(category => {
        tasks[category].forEach(task => {
            // 1. Ensure subtasks array exists
            if (!Array.isArray(task.subtasks)) {
                task.subtasks = [];
                hasChanges = true;
            }

            // 2. Repair evolutionData if missing or invalid
            if (!task.evolutionData || !task.evolutionData.chain || !Array.isArray(task.evolutionData.chain)) {
                console.warn('Reparing evolution data for:', task.title);
                task.evolutionData = getEvolutionChain(category, task.subtasks.length);
                hasChanges = true;
            }

            // 2b. v5.3: corregir cadenas evolutivas erróneas guardadas por v5.2
            if (!task.evolutionData.isItem) {
                const fixed = CHAIN_FIXES[task.evolutionData.chain.join(',')];
                if (fixed) {
                    task.evolutionData.chain = fixed.slice();
                    task.currentPokemonId = null; // se recalcula abajo según el progreso
                    hasChanges = true;
                }
            }

            // 3. Ensure currentPokemonId exists for non-item tasks
            if (!task.evolutionData.isItem && !task.currentPokemonId) {
                // Determine correct stage based on current subtask progress
                const completedSub = task.subtasks.filter(s => s.completed).length;
                const totalSub = task.subtasks.length;
                const evoInfo = getEvolutionStage(task.evolutionData, completedSub, totalSub);
                task.currentPokemonId = evoInfo.pokemonId;
                hasChanges = true;
            }

            // 4. FIX INCONSISTENT COMPLETION STATE
            // If task has subtasks, its completion state MUST match subtasks state
            if (task.subtasks.length > 0) {
                const allSubCompleted = task.subtasks.every(s => s.completed);
                if (task.completed !== allSubCompleted) {
                    console.warn(`Fixing inconsistent completion for ${task.title}: was ${task.completed}, should be ${allSubCompleted}`);
                    task.completed = allSubCompleted;
                    hasChanges = true;
                }
            }
        });
    });

    if (hasChanges) {
        saveData();
        console.log('Data repaired and saved.');
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== NUEVAS FUNCIONES v5.0 ==========

// Note: Los event listeners de collapse ya están en setupEventListeners()
// No necesitamos duplicarlos aquí
function setupNewEventListeners() {
    // Los event listeners principales están en setupEventListeners()
    // Aquí solo necesitamos los del modal que son únicos

    // New Task Modal
    document.getElementById('cancelNewTask').addEventListener('click', closeNewTaskModal);
    document.getElementById('saveNewTask').addEventListener('click', saveNewTask);
    document.getElementById('newTaskModal').addEventListener('click', function (e) {
        if (e.target === e.currentTarget) closeNewTaskModal();
    });

    document.getElementById('newTaskAddSubtaskBtn').addEventListener('click', addNewTaskSubtaskChip);
    document.getElementById('newTaskSubtaskInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addNewTaskSubtaskChip();
    });

    // Edit Modal - subtasks
    document.getElementById('editTaskAddSubtaskBtn').addEventListener('click', addEditTaskSubtask);
    document.getElementById('editTaskSubtaskInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addEditTaskSubtask();
    });
}

// Actualizar setupEventListeners para incluir nuevas funciones
const originalSetupEventListeners = setupEventListeners;
setupEventListeners = function () {
    originalSetupEventListeners();
    setupNewEventListeners();
};

// Modal de Nueva Tarea
function openNewTaskModal(category) {
    currentCategory = category;

    // Actualizar UI de categorías
    document.querySelectorAll('.category-btn').forEach(function (btn) {
        btn.classList.remove('active');
        if (btn.dataset.category === category) btn.classList.add('active');
    });

    // Configurar modal
    const categoryNames = {
        urgent: '🔥 Urgente',
        work: '💼 Trabajo',
        personal: '🏠 Personal',
        learning: '📚 Aprendizaje',
        ideas: '💡 Ideas',
        someday: '🌟 Algún Día'
    };
    document.getElementById('newTaskModalTitle').textContent = 'Nueva ' + categoryNames[category];
    document.getElementById('newTaskCategory').value = category;

    // Limpiar inputs
    document.getElementById('newTaskInput').value = '';
    document.getElementById('newTaskDescription').value = '';
    newTaskModalSubtasks = [];
    renderNewTaskSubtaskChips();

    document.getElementById('newTaskModal').classList.add('visible');
    setTimeout(function () { document.getElementById('newTaskInput').focus(); }, 100);
}

function closeNewTaskModal() {
    document.getElementById('newTaskModal').classList.remove('visible');
    newTaskModalSubtasks = [];
}

function saveNewTask() {
    const title = document.getElementById('newTaskInput').value.trim();
    const description = document.getElementById('newTaskDescription').value.trim();
    const category = document.getElementById('newTaskCategory').value;

    if (!title) {
        document.getElementById('newTaskInput').style.borderColor = '#D32F2F';
        setTimeout(function () { document.getElementById('newTaskInput').style.borderColor = ''; }, 1000);
        return;
    }

    const subtasks = [...newTaskModalSubtasks];
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
    renderTasks(category);
    updateStats();
    renderPokemonHabitat();
    renderPokedex();

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
    renderNewTaskSubtaskChips();
    input.focus();
}

function removeNewTaskSubtaskChip(id) {
    newTaskModalSubtasks = newTaskModalSubtasks.filter(function (s) { return s.id !== id; });
    renderNewTaskSubtaskChips();
}

function renderNewTaskSubtaskChips() {
    const container = document.getElementById('newTaskSubtaskChips');

    if (newTaskModalSubtasks.length === 0) {
        container.innerHTML = '<span class="no-subtasks">Sin sub-tareas aún</span>';
        return;
    }

    container.innerHTML = newTaskModalSubtasks.map(function (subtask) {
        return '<div class="subtask-chip" data-id="' + subtask.id + '">' +
            '<span>' + escapeHTML(subtask.title) + '</span>' +
            '<button class="chip-delete" onclick="removeNewTaskSubtaskChip(\'' + subtask.id + '\')">×</button>' +
            '</div>';
    }).join('');
}

// Categorías Colapsables
function initCollapsedCategories() {
    collapsedCategories.forEach(function (category) {
        const element = document.getElementById(category + 'Tasks');
        if (element) element.classList.add('collapsed');
    });
}

function toggleCategoryCollapse(category) {
    const element = document.getElementById(category + 'Tasks');
    if (!element) return;

    element.classList.toggle('collapsed');

    // Guardar estado
    if (element.classList.contains('collapsed')) {
        if (!collapsedCategories.includes(category)) {
            collapsedCategories.push(category);
        }
    } else {
        collapsedCategories = collapsedCategories.filter(function (c) { return c !== category; });
    }
    localStorage.setItem('todopkmn_collapsed', JSON.stringify(collapsedCategories));

    // Update footer position after toggle
    setTimeout(updateFooterPosition, 100);
}

// Footer Pokemon Habitat
// Dynamic footer positioning - keeps footer close to content
function updateFooterPosition() {
    const appContainer = document.querySelector('.app-container');
    const footer = document.getElementById('pokemonHabitat');
    if (!appContainer || !footer) return;

    const containerBottom = appContainer.getBoundingClientRect().bottom;
    const footerTop = footer.getBoundingClientRect().top;
    const gap = footerTop - containerBottom;

    // If there's too much gap, reduce it
    if (gap > 20) {
        footer.style.marginTop = '0px';
    } else {
        footer.style.marginTop = '10px';
    }
}

function renderPokemonHabitat() {
    const container = document.getElementById('pokemonTeam');
    if (!container) return;

    // Update footer position after rendering
    setTimeout(updateFooterPosition, 100);

    // Recolectar todos los Pokémon de todas las tareas (AHORA INCLUYENDO TAREAS SIN SUBTAREAS)
    const allPokemon = [];
    Object.keys(tasks).forEach(function (category) {
        tasks[category].forEach(function (task) {
            // REPARACIÓN DE DATOS: Verificar y regenerar evolutionData si está corrupto o falta
            if (!task.evolutionData || !task.evolutionData.chain || task.evolutionData.chain.length === 0) {
                console.warn('Reparando datos de tarea:', task.title);
                const subtaskCount = task.subtasks ? task.subtasks.length : 0;
                task.evolutionData = getEvolutionChain(category, subtaskCount);

                // Asegurar que tenga un Pokémon actual si no es item
                if (!task.evolutionData.isItem && !task.currentPokemonId) {
                    task.currentPokemonId = task.evolutionData.chain[0];
                }

                // Guardar los cambios reparados
                saveData();
            }

            // All tasks with Pokémon appear (not just those with subtasks)
            // Si es item, saltar (los items no van al habitat)
            if (task.evolutionData.isItem) {
                return;
            }

            // Usar currentPokemonId o calcularlo si falta (double check)
            const pokemonId = task.currentPokemonId || (task.evolutionData.chain && task.evolutionData.chain.length > 0 ? task.evolutionData.chain[0] : null);

            if (pokemonId) {
                const isShiny = task.evolutionData.isShiny || false;
                allPokemon.push({
                    id: task.id,
                    category: category,
                    pokemonId: pokemonId,
                    pokemonName: task.pokemonName, // Pass stored name
                    isShiny: isShiny,
                    title: task.title,
                    createdAt: task.createdAt,
                    completed: task.completed,
                    progress: task.progress || 0,
                    total: task.subtasks ? task.subtasks.length : 0
                });
            }
        });
    });

    if (allPokemon.length === 0) {
        container.innerHTML = '';
        return;
    }

    // Clear container logic is handled differently now that we use JS objects
    // We need to keep track of existing pokemon to avoid resetting them if possible,
    // or just clear and recreate for simplicity (simplicity chosen for now).
    container.innerHTML = '';
    habitatPokemons = []; // Clear array of active instances

    allPokemon.forEach(function (pkmn, index) {
        const spriteUrl = pkmn.isShiny ? getShinySpriteUrl(pkmn.pokemonId) : getPokemonSpriteUrl(pkmn.pokemonId);
        const shinyClass = pkmn.isShiny ? ' shiny' : '';
        const date = new Date(pkmn.createdAt).toLocaleDateString('es-CL');
        let statusText = pkmn.completed ? 'Completado' : (pkmn.total > 0 ? pkmn.progress + '/' + pkmn.total : 'En progreso');
        const statusClass = pkmn.completed ? ' completed' : '';

        // Random start position
        // Debug: Log position to ensure it's random
        const startLeft = Math.floor(Math.random() * 85); // 0-85% to ensure they don't spawn partly off-screen
        console.log('Spawning Pokemon (v1.2):', pkmn.pokemonName || pkmn.pokemonId, 'at', startLeft + '%');

        let displayName = pkmn.pokemonName;
        if (!displayName) {
            fetchPokemonName(pkmn.id, pkmn.category, pkmn.pokemonId);
            displayName = 'Cargando...';
        }

        // Create DOM Element
        const el = document.createElement('div');
        el.className = 'habitat-pokemon' + shinyClass;
        el.dataset.taskId = pkmn.id;
        el.dataset.category = pkmn.category;
        el.style.left = startLeft + '%';

        el.innerHTML =
            '<img src="' + spriteUrl + '" alt="Pokemon">' +
            '<div class="pokemon-tooltip">' +
            '<div class="tooltip-header">' +
            '<div class="tooltip-name">' + displayName + '</div>' +
            '<div class="tooltip-id">#' + pkmn.pokemonId + '</div>' +
            '</div>' +
            '<div class="tooltip-task">📝 ' + escapeHTML(pkmn.title.substring(0, 25)) + (pkmn.title.length > 25 ? '...' : '') + '</div>' +
            '<div class="tooltip-date">📅 ' + date + '</div>' +
            '<div class="tooltip-status' + statusClass + '">' + statusText + '</div>' +
            '</div>';

        container.appendChild(el);

        // Click event
        el.addEventListener('click', function () {
            scrollToTask(el.dataset.category, el.dataset.taskId);
        });

        // Add to simulation (except if sleeping)
        if (!isSleeping) {
            // Create Simulation Instance
            const sim = new HabitatPokemon(el, startLeft);
            habitatPokemons.push(sim);
        } else {
            el.classList.add('sleeping');
            // Sleeping position fixed
            el.style.left = (Math.floor(Math.random() * 80) + 10) + '%';
        }
    });

    // Start/Restart Loop if not already running
    if (!isSimulationRunning && !isSleeping) {
        isSimulationRunning = true;
        animateHabitat();
    }
}

// --- Artificial Life System ---

let habitatPokemons = [];
let isSimulationRunning = false;

class HabitatPokemon {
    constructor(element, startX) {
        this.element = element;
        this.img = element.querySelector('img');
        this.x = startX; // Percentage 0-100

        // Add Depth (Y-axis)
        // Expanded range for 350px height: 20px to 300px
        this.y = Math.floor(Math.random() * 280) + 20;
        this.element.style.bottom = this.y + 'px';
        // Z-Index based on depth (closer = lower Y = higher Z? No, usually closer = down = higher Z in 2.5D)
        // Higher Y (further back) -> Lower Z
        // Lower Y (closer front) = Higher Z
        // Max Y is ~300. Max Z can be 1000. 
        this.element.style.zIndex = 1000 - this.y;

        this.speed = (Math.random() * 0.03) + 0.01; // Random speed
        this.direction = Math.random() > 0.5 ? 1 : -1; // 1 = right, -1 = left
        this.state = 'idle'; // 'walking', 'idle'
        this.timer = Math.floor(Math.random() * 100); // Frames until next state change

        // Initial look direction
        this.updateSpriteFlip();
    }

    update() {
        if (this.timer > 0) {
            this.timer--;
        } else {
            // Pick new state
            this.changeState();
        }

        if (this.state === 'walking') {
            this.x += this.speed * this.direction;

            // Boundaries
            if (this.x > 95) {
                this.x = 95;
                this.direction = -1;
                this.timer = 60; // Walk back for at least 1s
                this.updateSpriteFlip();
            } else if (this.x < 0) {
                this.x = 0;
                this.direction = 1;
                this.timer = 60;
                this.updateSpriteFlip();
            }
        }

        // Render position
        this.element.style.left = this.x + '%';
    }

    changeState() {
        const rand = Math.random();
        if (rand < 0.3) {
            this.state = 'idle';
            this.timer = 60 + Math.random() * 120; // Idling 1-3 seconds
        } else {
            this.state = 'walking';
            // Maybe change direction?
            if (Math.random() > 0.5) {
                this.direction *= -1;
                this.updateSpriteFlip();
            }
            this.timer = 120 + Math.random() * 200; // Walk for 2-5 seconds
            this.speed = (Math.random() * 0.03) + 0.01; // Change speed
        }
    }

    updateSpriteFlip() {
        // FLIP IMAGE ONLY, NOT CONTAINER
        // scaleX(1) usually faces left for some sprites, -1 right. 
        // Standard Gen 5 sprites usually face Left.
        // So: Left (-1 dir) = scaleX(1). Right (1 dir) = scaleX(-1)
        // Wait, standard sprites face Left? Let's assume standard is Left.
        // If moving Right (1), flip (-1).
        // If moving Left (-1), normal (1).
        if (this.direction === 1) {
            this.img.style.transform = 'scaleX(-1)';
        } else {
            this.img.style.transform = 'scaleX(1)';
        }
    }
}

function animateHabitat() {
    if (!isSimulationRunning) return;

    habitatPokemons.forEach(pkmn => pkmn.update());

    requestAnimationFrame(animateHabitat);
}


// Cache to prevent multiple fetches for the same ID while in flight
const pendingFetches = new Set();

function fetchPokemonName(taskId, category, pokemonId) {
    const fetchKey = taskId + '_' + pokemonId;
    if (pendingFetches.has(fetchKey)) return;

    pendingFetches.add(fetchKey);

    fetch('https://pokeapi.co/api/v2/pokemon/' + pokemonId)
        .then(response => response.json())
        .then(data => {
            // Capitalize name
            const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);

            // Find task and update
            const task = tasks[category].find(t => t.id === taskId);
            if (task) {
                task.pokemonName = name;
                task.pokemonNameId = pokemonId; // Store ID to invalidate if pokemon changes
                saveData();
                renderPokemonHabitat(); // Re-render to show name
            }
        })
        .catch(err => {
            console.error('Error fetching pokemon name:', err);
        })
        .finally(() => {
            pendingFetches.delete(fetchKey);
        });
}

function scrollToTask(category, taskId) {
    // Buscar la tarea en el DOM
    const taskElement = document.querySelector('.task-item[data-task-id="' + taskId + '"]');
    if (taskElement) {
        // Asegurar que la categoría esté expandida
        const categoryElement = document.getElementById(category + 'Tasks');
        if (categoryElement && categoryElement.classList.contains('collapsed')) {
            categoryElement.classList.remove('collapsed');
            collapsedCategories = collapsedCategories.filter(function (c) { return c !== category; });
            localStorage.setItem('todopkmn_collapsed', JSON.stringify(collapsedCategories));
        }

        // Scroll hacia la tarea
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Resaltar la tarea
        taskElement.style.boxShadow = '0 0 20px rgba(255, 204, 0, 0.8)';
        setTimeout(function () {
            taskElement.style.boxShadow = '';
        }, 2000);
    }
}

// ========== POKÉDEX DASHBOARD ==========

// Toggle Pokédex panel
function togglePokedex() {
    const dashboard = document.getElementById('pokedexDashboard');
    dashboard.classList.toggle('collapsed');
}

// Render Pokédex entries
function renderPokedex() {
    const grid = document.getElementById('pokedexGrid');
    const empty = document.getElementById('pokedexEmpty');
    const countEl = document.getElementById('pokedexCount');
    
    if (!grid || !empty || !countEl) return;

    // Collect all Pokémon from all tasks
    const pokedexEntries = [];
    
    Object.keys(tasks).forEach(function (category) {
        tasks[category].forEach(function (task) {
            // Skip items - only show Pokémon
            if (task.evolutionData && task.evolutionData.isItem) {
                return;
            }
            
            const pokemonId = task.currentPokemonId || 
                (task.evolutionData && task.evolutionData.chain ? task.evolutionData.chain[0] : null);
            
            if (pokemonId) {
                const isCompleted = task.completed || 
                    (task.subtasks && task.subtasks.length > 0 && 
                     task.subtasks.every(s => s.completed));
                
                pokedexEntries.push({
                    id: task.id,
                    category: category,
                    pokemonId: pokemonId,
                    pokemonName: task.pokemonName || 'Cargando...',
                    isShiny: task.evolutionData ? task.evolutionData.isShiny : false,
                    createdAt: task.createdAt,
                    completed: isCompleted,
                    taskTitle: task.title
                });
            }
        });
    });

    // Update count
    countEl.textContent = pokedexEntries.length;

    // Show empty state if no entries
    if (pokedexEntries.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    // Sort: completed first, then by date
    pokedexEntries.sort(function (a, b) {
        if (a.completed !== b.completed) {
            return a.completed ? -1 : 1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Render entries
    grid.innerHTML = pokedexEntries.map(function (entry) {
        const spriteUrl = entry.isShiny 
            ? getShinySpriteUrl(entry.pokemonId) 
            : getPokemonSpriteUrl(entry.pokemonId);
        
        const formattedDate = new Date(entry.createdAt).toLocaleDateString('es-CL');
        
        return '<div class="pokedex-entry ' + (entry.completed ? 'completed' : '') + '" ' +
               'data-task-id="' + entry.id + '" ' +
               'data-category="' + entry.category + '">' +
            '<img src="' + spriteUrl + '" alt="#" class="pokedex-sprite">' +
            '<div class="pokedex-info">' +
                '<div class="pokedex-id">#' + String(entry.pokemonId).padStart(3, '0') + '</div>' +
                '<div class="pokedex-name">' + 
                    escapeHTML(entry.pokemonName) + 
                    (entry.isShiny ? '<span class="pokedex-shiny">SHINY</span>' : '') +
                '</div>' +
                '<span class="pokedex-status ' + (entry.completed ? 'completed' : 'in-progress') + '">' +
                    (entry.completed ? '✓ CAPTURADO' : '◐ EN PROGRESO') +
                '</span>' +
                '<div class="pokedex-date">📅 ' + formattedDate + '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    // Add click handlers to scroll to task
    grid.querySelectorAll('.pokedex-entry').forEach(function (el) {
        el.addEventListener('click', function () {
            scrollToTask(el.dataset.category, el.dataset.taskId);
        });
    });
}

// Fetch and update Pokémon names for Pokédex
function updatePokedexNames() {
    Object.keys(tasks).forEach(function (category) {
        tasks[category].forEach(function (task) {
            if (!task.evolutionData || task.evolutionData.isItem) return;
            
            const pokemonId = task.currentPokemonId || 
                (task.evolutionData.chain ? task.evolutionData.chain[0] : null);
            
            if (pokemonId && !task.pokemonName) {
                fetchPokemonName(task.id, category, pokemonId);
            }
        });
    });
}

