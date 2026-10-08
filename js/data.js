/**
 * ToDoMon v6.0 - Datos estáticos (categorías, cadenas evolutivas, pools, medallas).
 * Scripts clásicos sin build: este archivo define constantes globales usadas por el resto.
 */
'use strict';

const APP_VERSION = '6.0.0';

// Colores de categoría elegidos con contraste >= 4.5:1 frente a texto blanco
const CATEGORIES = {
    urgent:   { id: 'urgent',   name: 'Urgente',     emoji: '🔥', subtitle: 'Prioridad máxima',     pokemonId: 257, color: '#B03A2E', color2: '#7B241C', ball: 'master-ball' },
    work:     { id: 'work',     name: 'Trabajo',     emoji: '💼', subtitle: 'Tareas profesionales', pokemonId: 248, color: '#1A5FA0', color2: '#123F6B', ball: 'ultra-ball' },
    personal: { id: 'personal', name: 'Personal',    emoji: '🏠', subtitle: 'Hogar y familia',      pokemonId: 25,  color: '#1D7A3E', color2: '#145229', ball: 'great-ball' },
    learning: { id: 'learning', name: 'Aprendizaje', emoji: '📚', subtitle: 'Cursos y skills',      pokemonId: 196, color: '#6C3483', color2: '#4A235A', ball: 'poke-ball' },
    ideas:    { id: 'ideas',    name: 'Ideas',       emoji: '💡', subtitle: 'Brainstorm y futuro',  pokemonId: 151, color: '#8A5300', color2: '#5E3900', ball: 'ultra-ball' },
    someday:  { id: 'someday',  name: 'Algún Día',   emoji: '🌟', subtitle: 'Sin prisa',            pokemonId: 143, color: '#566573', color2: '#3B4650', ball: 'poke-ball' }
};
const ALL_CATEGORY_IDS = Object.keys(CATEGORIES);

// Alias para el atajo de categoría en el "agregado rápido" (#trabajo, #ideas, ...)
const CATEGORY_ALIASES = {
    urgente: 'urgent', urgent: 'urgent', u: 'urgent',
    trabajo: 'work', work: 'work', t: 'work',
    personal: 'personal', casa: 'personal', p: 'personal',
    aprendizaje: 'learning', estudio: 'learning', learning: 'learning', a: 'learning',
    ideas: 'ideas', idea: 'ideas', i: 'ideas',
    algundia: 'someday', 'algúndía': 'someday', someday: 'someday', s: 'someday'
};

const PRIORITIES = {
    high:   { id: 'high',   label: 'Alta',  icon: '▲', rank: 0, xpBonus: 20 },
    normal: { id: 'normal', label: 'Media', icon: '●', rank: 1, xpBonus: 0 },
    low:    { id: 'low',    label: 'Baja',  icon: '▼', rank: 2, xpBonus: -10 }
};

const RECURRENCES = {
    none:   { id: 'none',   label: 'No se repite', days: 0 },
    daily:  { id: 'daily',  label: 'Cada día',     days: 1 },
    weekly: { id: 'weekly', label: 'Cada semana',  days: 7 }
};

// Experiencia
const XP_SUBTASK = 10;
const XP_TASK = 50;
const XP_SHINY_BONUS = 25;
const SHINY_ON_COMPLETE_CHANCE = 1 / 16;

// Medallas: sprites de PokeAPI (sprites/badges/33-40 = medallas de Teselia / Unova)
const BADGES = [
    { id: 'first',     sprite: 33, name: 'Primera misión',  desc: 'Completa tu primera tarea.' },
    { id: 'streak3',   sprite: 34, name: 'Constancia',      desc: 'Mantén una racha de 3 días.' },
    { id: 'team6',     sprite: 35, name: 'Equipo completo', desc: 'Captura 6 Pokémon distintos.' },
    { id: 'tasks25',   sprite: 36, name: 'Productivo',      desc: 'Completa 25 tareas.' },
    { id: 'streak7',   sprite: 37, name: 'Racha semanal',   desc: 'Mantén una racha de 7 días.' },
    { id: 'allcats',   sprite: 38, name: 'Explorador',      desc: 'Completa una tarea en cada categoría.' },
    { id: 'dex50',     sprite: 39, name: 'Coleccionista',   desc: 'Registra 50 Pokémon en la Pokédex.' },
    { id: 'tasks100',  sprite: 40, name: 'Maestro Pokémon', desc: 'Completa 100 tareas.' }
];

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
    { id: 'pokeball', name: 'Poké Ball', sprite: ITEM_SPRITE_BASE + 'poke-ball.png' },
    { id: 'moonstone', name: 'Piedra Lunar', sprite: ITEM_SPRITE_BASE + 'moon-stone.png' },
    { id: 'sunstone', name: 'Piedra Solar', sprite: ITEM_SPRITE_BASE + 'sun-stone.png' },
];

const POKEBALL_SPRITE = ITEM_SPRITE_BASE + 'poke-ball.png';
const MAX_ANIMATED_ID = 649; // Los GIF animados de Black/White existen para #1-#649
const DEX_TOTAL = 649;       // Pokédex Gen 1-5
