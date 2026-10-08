/**
 * ToDoMon v6.0 - Estado, persistencia, migraciones y reglas de juego.
 * No toca el DOM: la interfaz (app.js) llama a estas funciones y muestra los "efectos" que devuelven.
 */
'use strict';

const STATE_KEY = 'todomon_v6';
const V5_KEYS = [
    'todopkmn_tasks', 'todopkmn_trainer_level', 'todopkmn_theme', 'todopkmn_collapsed',
    'todopkmn_app_name', 'todopkmn_header_pokemon', 'todopkmn_tasks_backup', 'todopkmn_dark_mode'
];
const V5_BACKUP_KEY = 'todomon_backup_v5';               // copia íntegra de las claves v5.x antes de migrar
const IMPORT_BACKUP_KEY = 'todomon_backup_before_import'; // copia del estado antes de importar un respaldo
const CORRUPT_BACKUP_KEY = 'todomon_backup_corrupt';     // datos v6 ilegibles (no se borran)

let state = null;

// ========== UTILIDADES DE FECHA (siempre hora local) ==========
function pad2(n) { return String(n).padStart(2, '0'); }
function toDateStr(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function todayStr() { return toDateStr(new Date()); }
function nowISO() { return new Date().toISOString(); }
function parseDateStr(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
}
function isValidDateStr(s) { return !!parseDateStr(s); }
function addDaysStr(s, n) { const d = parseDateStr(s) || new Date(); d.setDate(d.getDate() + n); return toDateStr(d); }
function daysBetween(fromStr, toStr) {
    const a = parseDateStr(fromStr), b = parseDateStr(toStr);
    if (!a || !b) return 0;
    return Math.round((b - a) / 86400000);
}
function isoToDateStr(iso) { const d = new Date(iso); return isNaN(d.getTime()) ? null : toDateStr(d); }
function weekStartStr(d) { // lunes de la semana de d
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - dow);
    return toDateStr(x);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
function randomTrainerId() { return String(Math.floor(Math.random() * 100000)).padStart(5, '0'); }
function emptyTasks() { const t = {}; ALL_CATEGORY_IDS.forEach(function (c) { t[c] = []; }); return t; }

function defaultState() {
    return {
        version: 6,
        tasks: emptyTasks(),
        history: [],   // eventos de completado: { id, type: 'task'|'subtask'|'bonus', taskId, subtaskId, category, at, xp, migrated }
        dex: {},       // Pokédex permanente: id -> { first, count, shiny, name }
        badges: {},    // id -> fecha ISO de obtención
        trainer: {
            name: 'Entrenador',
            trainerId: randomTrainerId(),
            partnerId: 1 + Math.floor(Math.random() * DEX_TOTAL),
            startedAt: nowISO()
        },
        settings: { theme: 'auto', sound: true, notify: false, appName: 'ToDoMon', collapsed: [], sort: 'manual' },
        meta: { createdAt: nowISO(), migratedFrom: null, lastNotifyDate: null }
    };
}

// ========== CARGA / GUARDADO ==========
function saveState() {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
        return true;
    } catch (e) {
        console.warn('No se pudo guardar el estado:', e);
        return false;
    }
}

// Devuelve { migratedFrom: null | 'v5' | 'corrupt' }
function loadState() {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
        try {
            state = normalizeState(JSON.parse(raw));
            saveState();
            return { migratedFrom: null };
        } catch (e) {
            console.warn('Estado v6 ilegible; se respalda en "' + CORRUPT_BACKUP_KEY + '".', e);
            try { localStorage.setItem(CORRUPT_BACKUP_KEY, raw); } catch (err) { }
            state = defaultState();
            saveState();
            return { migratedFrom: 'corrupt' };
        }
    }

    state = defaultState();
    const hasV5 = V5_KEYS.some(function (k) { return localStorage.getItem(k) !== null; });
    if (hasV5) {
        backupV5Keys();
        migrateFromV5();
        saveState();
        return { migratedFrom: 'v5' };
    }
    saveState();
    return { migratedFrom: null };
}

function backupV5Keys() {
    if (localStorage.getItem(V5_BACKUP_KEY)) return; // ya existe un respaldo, no sobrescribir
    const keys = {};
    V5_KEYS.forEach(function (k) {
        const v = localStorage.getItem(k);
        if (v !== null) keys[k] = v;
    });
    try {
        localStorage.setItem(V5_BACKUP_KEY, JSON.stringify({ savedAt: nowISO(), keys: keys }));
    } catch (e) {
        console.warn('No se pudo crear el respaldo v5 (las claves originales no se borran):', e);
    }
}

// Las claves v5 NO se borran: quedan intactas además del respaldo.
function migrateFromV5() {
    let v5tasks = null;
    const rawTasks = localStorage.getItem('todopkmn_tasks');
    if (rawTasks) {
        try { v5tasks = JSON.parse(rawTasks); } catch (e) { console.warn('todopkmn_tasks ilegible; queda en el respaldo v5.', e); }
    }
    state.tasks = migrateV5Tasks(v5tasks);

    const theme = localStorage.getItem('todopkmn_theme');
    if (['auto', 'light', 'dark'].includes(theme)) state.settings.theme = theme;
    try {
        const collapsed = JSON.parse(localStorage.getItem('todopkmn_collapsed') || '[]');
        if (Array.isArray(collapsed)) state.settings.collapsed = collapsed.filter(function (c) { return CATEGORIES[c]; });
    } catch (e) { }
    const appName = localStorage.getItem('todopkmn_app_name');
    if (appName) state.settings.appName = String(appName).slice(0, 30);
    const header = Number(localStorage.getItem('todopkmn_header_pokemon'));
    if (header >= 1 && header <= 1025) state.trainer.partnerId = header;

    seedProgressFromTasks(true);
    const first = allTasks().map(function (x) { return x.task.createdAt; }).sort()[0];
    if (first) state.trainer.startedAt = first;

    // No perder nivel: si el nivel v5 era mayor que el calculado, se agrega un bono de migración
    let oldLevel = 1;
    try { oldLevel = Number(JSON.parse(localStorage.getItem('todopkmn_trainer_level') || '1')) || 1; } catch (e) { }
    const xpNow = getTotalXP();
    const needed = xpForLevel(oldLevel);
    if (needed > xpNow) {
        state.history.push({ id: generateId(), type: 'bonus', at: nowISO(), xp: needed - xpNow, migrated: true, note: 'Nivel conservado de v5' });
    }
    checkBadges(); // silencioso: las medallas ya ganadas no generan avisos
    state.meta.migratedFrom = 'v5';
}

// Convierte el objeto de tareas v5.x (con categorías legacy) a la estructura v6
function migrateV5Tasks(v5tasks) {
    const tasks = emptyTasks();
    if (!v5tasks || typeof v5tasks !== 'object' || Array.isArray(v5tasks)) return tasks;
    const legacy = { gym: 'work', raid: 'ideas', adventure: 'someday' };
    Object.keys(v5tasks).forEach(function (key) {
        const list = v5tasks[key];
        if (!Array.isArray(list)) return;
        let target = CATEGORIES[key] ? key : legacy[key];
        if (!target) {
            console.warn('Categoría desconocida "' + key + '": sus tareas pasan a Personal.');
            target = 'personal';
        }
        list.forEach(function (t) {
            if (t && typeof t === 'object') tasks[target].push(normalizeTask(t, target));
        });
    });
    return tasks;
}

// Siembra historial y Pokédex desde el estado de las tareas (migraciones/importaciones)
function seedProgressFromTasks(migrated) {
    ALL_CATEGORY_IDS.forEach(function (category) {
        state.tasks[category].forEach(function (task) {
            const at = task.completedAt || task.createdAt;
            task.subtasks.forEach(function (s) {
                if (s.completed) state.history.push({ id: generateId(), type: 'subtask', taskId: task.id, subtaskId: s.id, category: category, at: at, xp: XP_SUBTASK, migrated: migrated });
            });
            if (task.completed) {
                if (!task.completedAt) task.completedAt = at;
                const pid = getTaskPokemonId(task);
                state.history.push({ id: generateId(), type: 'task', taskId: task.id, category: category, at: at, xp: taskXP(task), migrated: migrated, pokemonId: pid });
                if (pid) dexAdd(pid, !!task.evolutionData.isShiny, task.pokemonNameId === pid ? task.pokemonName : null, at);
            }
        });
    });
}

function normalizeState(s) {
    if (!s || typeof s !== 'object') throw new Error('Estado inválido');
    const base = defaultState();
    const out = base;
    out.tasks = emptyTasks();
    const tasksIn = s.tasks && typeof s.tasks === 'object' ? s.tasks : {};
    Object.keys(tasksIn).forEach(function (key) {
        if (!Array.isArray(tasksIn[key])) return;
        const target = CATEGORIES[key] ? key : 'personal';
        tasksIn[key].forEach(function (t) { if (t && typeof t === 'object') out.tasks[target].push(normalizeTask(t, target)); });
    });
    out.history = Array.isArray(s.history) ? s.history.filter(function (e) {
        return e && typeof e === 'object' && typeof e.xp === 'number' && ['task', 'subtask', 'bonus'].includes(e.type) && !isNaN(new Date(e.at).getTime());
    }) : [];
    out.dex = {};
    if (s.dex && typeof s.dex === 'object') {
        Object.keys(s.dex).forEach(function (id) {
            const e = s.dex[id];
            if (Number(id) >= 1 && e && typeof e === 'object') {
                out.dex[id] = { first: e.first || nowISO(), count: Math.max(1, Number(e.count) || 1), shiny: !!e.shiny, name: e.name || null };
            }
        });
    }
    out.badges = s.badges && typeof s.badges === 'object' ? Object.assign({}, s.badges) : {};
    out.trainer = Object.assign(base.trainer, s.trainer || {});
    out.trainer.name = String(out.trainer.name || 'Entrenador').slice(0, 20);
    out.settings = Object.assign(base.settings, s.settings || {});
    if (!['auto', 'light', 'dark'].includes(out.settings.theme)) out.settings.theme = 'auto';
    if (!['manual', 'due', 'priority'].includes(out.settings.sort)) out.settings.sort = 'manual';
    if (!Array.isArray(out.settings.collapsed)) out.settings.collapsed = [];
    out.meta = Object.assign(base.meta, s.meta || {});
    return out;
}

// Normaliza una tarea de cualquier versión (v5.0 - v6) y aplica las reparaciones de v5.3
function normalizeTask(t, category) {
    const task = t;
    if (!task.id) task.id = generateId();
    task.id = String(task.id);
    task.title = typeof task.title === 'string' && task.title.trim() ? task.title.slice(0, 100) : 'Tarea';
    task.description = typeof task.description === 'string' ? task.description : '';
    if (!task.createdAt || isNaN(new Date(task.createdAt).getTime())) task.createdAt = nowISO();
    if (!Array.isArray(task.subtasks)) task.subtasks = [];
    task.subtasks = task.subtasks.filter(function (s) { return s && typeof s === 'object'; }).map(function (s) {
        return { id: String(s.id || generateId()), title: typeof s.title === 'string' ? s.title : 'Subtarea', completed: !!s.completed };
    });
    if (!task.evolutionData || !Array.isArray(task.evolutionData.chain) || task.evolutionData.chain.length === 0) {
        task.evolutionData = getEvolutionChain(category, task.subtasks.length);
        task.currentPokemonId = null;
        task.currentItem = null;
    }
    if (!task.evolutionData.isItem) {
        const fixed = CHAIN_FIXES[task.evolutionData.chain.join(',')];
        if (fixed) task.evolutionData.chain = fixed.slice();
    }
    task.priority = PRIORITIES[task.priority] ? task.priority : 'normal';
    task.due = isValidDateStr(task.due) ? task.due : null;
    task.recurrence = RECURRENCES[task.recurrence] ? task.recurrence : 'none';
    task.completed = !!task.completed;
    if (task.completed && !task.completedAt) task.completedAt = null; // fecha desconocida (datos antiguos)
    syncTaskState(task);
    return task;
}

// ========== EVOLUCIONES (heredado de v5.3) ==========
function getEvolutionChain(category, subtaskCount) {
    // v5 usaba Date.now(): tareas creadas en el mismo milisegundo recibían el mismo Pokémon
    const now = Math.floor(Math.random() * 1e9);
    let chain, isItem = false, isShiny = false;

    if (subtaskCount >= 5) { // 5+ subtareas -> legendario
        chain = [LEGENDARY_POKEMON_EXTENDED[now % LEGENDARY_POKEMON_EXTENDED.length]];
        isShiny = category === 'ideas' && Math.random() < 0.3;
        return { chain, isItem: false, isShiny, category, noEvolution: false };
    }
    if (subtaskCount === 0) { // sin subtareas -> Pokémon (o ítem) sin evolución
        if (category === 'someday') {
            return { chain: [Object.assign({}, ADVENTURE_ITEMS[now % ADVENTURE_ITEMS.length])], isItem: true, isShiny: false, category, noEvolution: true };
        }
        const pool = getCategoryPokemonPool(category);
        return { chain: [pool[(now + 7) % pool.length]], isItem: false, isShiny: category === 'ideas' && Math.random() < 0.3, category, noEvolution: true };
    }
    if (category === 'someday') {
        isItem = true;
        chain = [];
        const start = now % ADVENTURE_ITEMS.length;
        for (let i = 0; i < Math.min(3, subtaskCount + 1); i++) chain.push(Object.assign({}, ADVENTURE_ITEMS[(start + i) % ADVENTURE_ITEMS.length]));
    } else if (category === 'work') {
        chain = GYM_EVOLUTIONS[(now + subtaskCount) % GYM_EVOLUTIONS.length];
    } else if (category === 'ideas') {
        const pokemonId = IDEAS_POKEMON_POOL[(now + subtaskCount) % IDEAS_POKEMON_POOL.length];
        isShiny = Math.random() < 0.3;
        chain = GYM_EVOLUTIONS.find(function (c) { return c.includes(pokemonId); }) || [pokemonId];
    } else {
        const pool = getCategoryPokemonPool(category);
        const possible = GYM_EVOLUTIONS.filter(function (c) { return pool.includes(c[0]); });
        chain = possible.length ? possible[(now + subtaskCount) % possible.length] : [pool[now % pool.length]];
    }
    return { chain: chain.slice(), isItem, isShiny, category, noEvolution: false };
}

function getCategoryPokemonPool(category) {
    return {
        urgent: FIRE_TYPES, work: GYM_EVOLUTIONS.flat(), personal: FRIENDLY_TYPES,
        learning: PSYCHIC_TYPES, ideas: IDEAS_POKEMON_POOL, someday: ADVENTURE_ITEMS
    }[category] || FIRE_TYPES;
}

function getEvolutionStage(evolutionData, completedCount, totalCount) {
    const chain = evolutionData.chain;
    const progress = totalCount > 0 ? completedCount / totalCount : 0;
    if (evolutionData.isItem) {
        const i = Math.min(Math.floor(progress * chain.length), chain.length - 1);
        return { stage: i, item: chain[i] };
    }
    if (progress >= 1) return { stage: chain.length - 1, pokemonId: chain[chain.length - 1] };
    if (progress >= 0.5 && chain.length >= 2) { const mid = Math.floor(chain.length / 2); return { stage: mid, pokemonId: chain[mid] }; }
    return { stage: 0, pokemonId: chain[0] };
}

function upgradeChainIfPossible(task) {
    const evo = task.evolutionData;
    if (evo.isItem || evo.chain.length !== 1 || task.subtasks.length === 0) return;
    const full = GYM_EVOLUTIONS.find(function (c) { return c[0] === evo.chain[0]; });
    if (full) { evo.chain = full.slice(); evo.noEvolution = false; }
}

function getTaskPokemonId(task) {
    if (!task.evolutionData || task.evolutionData.isItem) return null;
    return Number(task.currentPokemonId || task.evolutionData.chain[0]) || null;
}

// Progreso, etapa evolutiva y "completado" derivados de las subtareas
function syncTaskState(task) {
    const total = task.subtasks.length;
    const done = task.subtasks.filter(function (s) { return s.completed; }).length;
    task.progress = done;
    if (total > 0) task.completed = done === total;
    const evo = getEvolutionStage(task.evolutionData, done, total);
    if (task.evolutionData.isItem) { task.currentItem = evo.item; task.currentPokemonId = null; }
    else { task.currentPokemonId = evo.pokemonId; task.currentItem = null; }
}

// ========== CONSULTAS ==========
function findTask(taskId) {
    for (let i = 0; i < ALL_CATEGORY_IDS.length; i++) {
        const category = ALL_CATEGORY_IDS[i];
        const index = state.tasks[category].findIndex(function (t) { return t.id === taskId; });
        if (index !== -1) return { task: state.tasks[category][index], category: category, index: index };
    }
    return null;
}

function allTasks() {
    const out = [];
    ALL_CATEGORY_IDS.forEach(function (c) { state.tasks[c].forEach(function (t) { out.push({ task: t, category: c }); }); });
    return out;
}

// 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later' | null
function dueStatus(task, today) {
    if (!task.due || task.completed) return task.due ? 'done' : null;
    const diff = daysBetween(today || todayStr(), task.due);
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'today';
    if (diff === 1) return 'tomorrow';
    if (diff <= 7) return 'soon';
    return 'later';
}

// ========== XP, NIVEL, RACHA ==========
function taskXP(task) { return Math.max(10, XP_TASK + PRIORITIES[task.priority || 'normal'].xpBonus); }
function getTotalXP() { return state.history.reduce(function (sum, e) { return sum + (e.xp || 0); }, 0); }
function xpForLevel(level) { return 50 * level * (level - 1); } // XP acumulada necesaria para el nivel
function levelFromXP(xp) { return Math.min(100, Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2))); }
function levelInfo() {
    const xp = getTotalXP();
    const level = levelFromXP(xp);
    const base = xpForLevel(level), next = xpForLevel(level + 1);
    return { xp: xp, level: level, into: xp - base, span: next - base, toNext: next - xp };
}

function activeDays() {
    const days = new Set();
    state.history.forEach(function (e) {
        if (e.migrated || e.type === 'bonus') return;
        const d = isoToDateStr(e.at);
        if (d) days.add(d);
    });
    return days;
}

function getStreak() {
    const days = activeDays();
    const today = todayStr();
    let current = 0;
    let cursor = days.has(today) ? today : addDaysStr(today, -1); // la racha sigue viva si ayer hubo actividad
    while (days.has(cursor)) { current++; cursor = addDaysStr(cursor, -1); }
    let best = 0;
    Array.from(days).sort().forEach(function (d, i, arr) {
        let run = 1;
        while (i - run >= 0 && arr[i - run] === addDaysStr(d, -run)) run++;
        best = Math.max(best, run);
    });
    return { current: current, best: Math.max(best, current), activeToday: days.has(today) };
}

function completedTaskEvents() { return state.history.filter(function (e) { return e.type === 'task'; }); }

// ========== POKÉDEX ==========
function dexAdd(pokemonId, shiny, name, at) {
    const key = String(pokemonId);
    const e = state.dex[key];
    if (e) { e.count++; if (shiny) e.shiny = true; if (name && !e.name) e.name = name; }
    else state.dex[key] = { first: at || nowISO(), count: 1, shiny: !!shiny, name: name || null };
}
function dexRemove(pokemonId) {
    const key = String(pokemonId);
    const e = state.dex[key];
    if (!e) return;
    e.count--;
    if (e.count <= 0) delete state.dex[key];
}
function dexCount() { return Object.keys(state.dex).length; }

// ========== MEDALLAS ==========
function badgeMetrics() {
    const events = completedTaskEvents();
    const streak = getStreak();
    return {
        tasks: events.length,
        streak: streak.best,
        dex: dexCount(),
        categories: new Set(events.map(function (e) { return e.category; })).size
    };
}
function badgeMet(id, m) {
    switch (id) {
        case 'first': return m.tasks >= 1;
        case 'streak3': return m.streak >= 3;
        case 'team6': return m.dex >= 6;
        case 'tasks25': return m.tasks >= 25;
        case 'streak7': return m.streak >= 7;
        case 'allcats': return m.categories >= ALL_CATEGORY_IDS.length;
        case 'dex50': return m.dex >= 50;
        case 'tasks100': return m.tasks >= 100;
        default: return false;
    }
}
// Las medallas son permanentes una vez obtenidas. Devuelve las nuevas.
function checkBadges() {
    const m = badgeMetrics();
    const unlocked = [];
    BADGES.forEach(function (b) {
        if (!state.badges[b.id] && badgeMet(b.id, m)) {
            state.badges[b.id] = nowISO();
            unlocked.push(b);
        }
    });
    return unlocked;
}

// ========== ACCIONES ==========
function createTask(data) {
    const category = CATEGORIES[data.category] ? data.category : 'urgent';
    const subtasks = (data.subtasks || []).map(function (s) {
        return typeof s === 'string' ? { id: generateId(), title: s, completed: false } : { id: s.id || generateId(), title: s.title, completed: !!s.completed };
    }).filter(function (s) { return s.title && s.title.trim(); });
    const evolutionData = getEvolutionChain(category, subtasks.length);
    const task = {
        id: generateId(),
        title: String(data.title).trim().slice(0, 100),
        description: (data.description || '').trim(),
        completed: false,
        completedAt: null,
        createdAt: nowISO(),
        subtasks: subtasks,
        evolutionData: evolutionData,
        currentPokemonId: null,
        currentItem: null,
        progress: 0,
        priority: PRIORITIES[data.priority] ? data.priority : 'normal',
        due: isValidDateStr(data.due) ? data.due : null,
        recurrence: RECURRENCES[data.recurrence] ? data.recurrence : 'none'
    };
    syncTaskState(task);
    state.tasks[category].unshift(task);
    return { task: task, category: category };
}

function removeLastEvent(predicate) {
    for (let i = state.history.length - 1; i >= 0; i--) {
        if (predicate(state.history[i])) return state.history.splice(i, 1)[0];
    }
    return null;
}

// Aplica XP/Pokédex/shiny/recurrencia cuando cambia el estado "completado" de una tarea.
function applyCompletionTransition(task, category, wasCompleted, effects) {
    if (!wasCompleted && task.completed) {
        task.completedAt = nowISO();
        let xp = taskXP(task);
        let shinyGained = false;
        if (!task.evolutionData.isItem && !task.evolutionData.isShiny && Math.random() < SHINY_ON_COMPLETE_CHANCE) {
            task.evolutionData.isShiny = true;
            shinyGained = true;
            xp += XP_SHINY_BONUS;
            effects.shiny = getTaskPokemonId(task);
        }
        const pid = getTaskPokemonId(task);
        state.history.push({ id: generateId(), type: 'task', taskId: task.id, category: category, at: task.completedAt, xp: xp, shinyGained: shinyGained, pokemonId: pid });
        effects.xp += xp;
        effects.completed = true;
        if (pid) {
            const isNew = !state.dex[String(pid)];
            dexAdd(pid, !!task.evolutionData.isShiny, task.pokemonNameId === pid ? task.pokemonName : null, task.completedAt);
            effects.captured = { pokemonId: pid, isNew: isNew };
        }
        // Las completadas bajan al final de su categoría; la repetición ocupa su lugar
        const list = state.tasks[category];
        const slot = list.indexOf(task);
        if (slot !== -1) { list.splice(slot, 1); list.push(task); }
        if (task.recurrence !== 'none' && !task.spawnedNextId) {
            const next = spawnNextOccurrence(task, category, slot);
            task.spawnedNextId = next.id;
            effects.spawned = next;
        }
    } else if (wasCompleted && !task.completed) {
        const ev = removeLastEvent(function (e) { return e.type === 'task' && e.taskId === task.id; });
        if (ev) {
            effects.xp -= ev.xp;
            if (ev.shinyGained) task.evolutionData.isShiny = false; // evitar "farmear" shiny marcando/desmarcando
        }
        if (ev && (ev.pokemonId || ev.migrated)) dexRemove(ev.pokemonId || getTaskPokemonId(task));
        task.completedAt = null;
        // Si la siguiente repetición sigue intacta, se retira
        if (task.spawnedNextId) {
            const found = findTask(task.spawnedNextId);
            if (found && !found.task.completed && found.task.subtasks.every(function (s) { return !s.completed; })) {
                state.tasks[found.category].splice(found.index, 1);
                effects.unspawned = true;
            }
            delete task.spawnedNextId;
        }
    }
}

function spawnNextOccurrence(task, category, slot) {
    const days = RECURRENCES[task.recurrence].days;
    const today = todayStr();
    let due = addDaysStr(task.due || today, days);
    while (daysBetween(today, due) < 0) due = addDaysStr(due, days);
    const created = createTask({
        title: task.title,
        description: task.description,
        category: category,
        priority: task.priority,
        due: due,
        recurrence: task.recurrence,
        subtasks: task.subtasks.map(function (s) { return s.title; })
    });
    // Se ubica donde estaba la tarea original
    const list = state.tasks[category];
    list.splice(list.indexOf(created.task), 1);
    list.splice(slot >= 0 ? Math.min(slot, list.length) : list.indexOf(task) + 1, 0, created.task);
    return created.task;
}

function newEffects() { return { xp: 0, levelBefore: levelInfo().level, completed: false, evolved: null, captured: null, shiny: null, spawned: null, badges: [] }; }
function finishEffects(effects) {
    effects.badges = checkBadges();
    effects.levelAfter = levelInfo().level;
    effects.levelUp = effects.levelAfter > effects.levelBefore;
    saveState();
    return effects;
}

function toggleSubtaskDone(taskId, subtaskId) {
    const found = findTask(taskId);
    if (!found) return null;
    const task = found.task;
    const sub = task.subtasks.find(function (s) { return s.id === subtaskId; });
    if (!sub) return null;
    const effects = newEffects();
    const wasCompleted = task.completed;
    const before = task.currentPokemonId;
    sub.completed = !sub.completed;
    if (sub.completed) {
        state.history.push({ id: generateId(), type: 'subtask', taskId: task.id, subtaskId: sub.id, category: found.category, at: nowISO(), xp: XP_SUBTASK });
        effects.xp += XP_SUBTASK;
    } else {
        const ev = removeLastEvent(function (e) { return e.type === 'subtask' && e.taskId === task.id && e.subtaskId === sub.id; });
        if (ev) effects.xp -= ev.xp;
    }
    syncTaskState(task);
    if (task.currentPokemonId !== before && task.currentPokemonId) effects.evolved = { from: before, to: task.currentPokemonId, forward: sub.completed };
    applyCompletionTransition(task, found.category, wasCompleted, effects);
    effects.task = task;
    return finishEffects(effects);
}

function toggleTaskDone(taskId) {
    const found = findTask(taskId);
    if (!found || found.task.subtasks.length > 0) return null; // con subtareas se deriva de ellas
    const effects = newEffects();
    const task = found.task;
    const was = task.completed;
    task.completed = !task.completed;
    applyCompletionTransition(task, found.category, was, effects);
    effects.task = task;
    return finishEffects(effects);
}

// Guarda los cambios del diálogo de detalles. data.subtasks = [{id?, title, completed}]
function updateTask(taskId, data) {
    const found = findTask(taskId);
    if (!found) return null;
    const effects = newEffects();
    const task = found.task;
    const wasCompleted = task.completed;
    const oldSubs = {};
    task.subtasks.forEach(function (s) { oldSubs[s.id] = s.completed; });

    task.title = String(data.title).trim().slice(0, 100) || task.title;
    task.description = (data.description || '').trim();
    task.priority = PRIORITIES[data.priority] ? data.priority : task.priority;
    task.due = isValidDateStr(data.due) ? data.due : null;
    task.recurrence = RECURRENCES[data.recurrence] ? data.recurrence : 'none';
    task.subtasks = (data.subtasks || []).filter(function (s) { return s.title && s.title.trim(); }).map(function (s) {
        return { id: s.id || generateId(), title: s.title.trim().slice(0, 80), completed: !!s.completed };
    });

    // XP por subtareas marcadas/desmarcadas desde el diálogo
    task.subtasks.forEach(function (s) {
        const was = oldSubs[s.id] === true;
        if (s.completed && !was) {
            state.history.push({ id: generateId(), type: 'subtask', taskId: task.id, subtaskId: s.id, category: found.category, at: nowISO(), xp: XP_SUBTASK });
            effects.xp += XP_SUBTASK;
        } else if (!s.completed && was) {
            const ev = removeLastEvent(function (e) { return e.type === 'subtask' && e.taskId === task.id && e.subtaskId === s.id; });
            if (ev) effects.xp -= ev.xp;
        }
    });

    let category = found.category;
    if (CATEGORIES[data.category] && data.category !== category) {
        state.tasks[category].splice(found.index, 1);
        state.tasks[data.category].unshift(task);
        category = data.category;
    }
    if (task.subtasks.length === 0 && typeof data.completed === 'boolean') task.completed = data.completed;
    upgradeChainIfPossible(task);
    syncTaskState(task);
    applyCompletionTransition(task, category, wasCompleted, effects);
    effects.task = task;
    return finishEffects(effects);
}

function deleteTask(taskId) {
    const found = findTask(taskId);
    if (!found) return null;
    state.tasks[found.category].splice(found.index, 1);
    saveState();
    return found; // { task, category, index } para deshacer
}

function restoreTask(snapshot) {
    const list = state.tasks[snapshot.category];
    list.splice(Math.min(snapshot.index, list.length), 0, snapshot.task);
    saveState();
}

// Reordena una tarea dentro de su categoría. beforeId = id de la tarea que debe quedar debajo (o null = al final)
function moveTask(taskId, beforeId) {
    const found = findTask(taskId);
    if (!found) return false;
    const list = state.tasks[found.category];
    list.splice(found.index, 1);
    const idx = beforeId ? list.findIndex(function (t) { return t.id === beforeId; }) : -1;
    if (idx === -1) list.push(found.task); else list.splice(idx, 0, found.task);
    saveState();
    return true;
}

// ========== ESTADÍSTICAS ==========
function weeklyCompletions(weeks) {
    const now = new Date();
    const out = [];
    const thisWeek = weekStartStr(now);
    for (let i = weeks - 1; i >= 0; i--) out.push({ start: addDaysStr(thisWeek, -7 * i), count: 0 });
    completedTaskEvents().forEach(function (e) {
        const d = new Date(e.at);
        if (isNaN(d.getTime())) return;
        const ws = weekStartStr(d);
        const bucket = out.find(function (b) { return b.start === ws; });
        if (bucket) bucket.count++;
    });
    return out;
}

function completionsByCategory() {
    const counts = {};
    ALL_CATEGORY_IDS.forEach(function (c) { counts[c] = 0; });
    completedTaskEvents().forEach(function (e) { if (counts[e.category] !== undefined) counts[e.category]++; });
    return counts;
}

// ========== RESPALDO JSON ==========
function exportData() {
    return JSON.stringify({ app: 'ToDoMon', exportedAt: nowISO(), appVersion: APP_VERSION, state: state }, null, 2);
}

// Acepta un respaldo v6 (exportado), un estado v6 crudo o un objeto de tareas v5 (todopkmn_tasks).
function importData(text) {
    const parsed = JSON.parse(text);
    let next;
    if (parsed && parsed.state && parsed.state.version >= 6) {
        next = normalizeState(parsed.state);
    } else if (parsed && parsed.version >= 6 && parsed.tasks) {
        next = normalizeState(parsed);
    } else if (parsed && typeof parsed === 'object' && Object.keys(parsed).some(function (k) { return Array.isArray(parsed[k]); })) {
        const prev = state;
        state = defaultState();
        state.trainer = prev.trainer;
        state.settings = prev.settings;
        state.tasks = migrateV5Tasks(parsed);
        seedProgressFromTasks(true);
        checkBadges();
        next = state;
        state = prev;
    } else {
        throw new Error('El archivo no parece un respaldo de ToDoMon.');
    }
    try { localStorage.setItem(IMPORT_BACKUP_KEY, JSON.stringify({ savedAt: nowISO(), state: state })); } catch (e) { }
    state = next;
    saveState();
    return state;
}
