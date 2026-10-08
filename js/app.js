/**
 * ToDoMon v6.0 - Interfaz (vistas, diálogos, atajos, PWA).
 * Depende de: data.js, store.js, sprites.js, habitat.js (scripts clásicos, en ese orden).
 */
'use strict';

const STATUS_FILTERS = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'today', label: 'Hoy' },
    { id: 'overdue', label: 'Vencidas' },
    { id: 'done', label: 'Completadas' }
];
const DEX_FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'caught', label: 'Capturados' },
    { id: 'progress', label: 'En progreso' },
    { id: 'shiny', label: 'Variocolor ✨' }
];
const VIEWS = { tasks: 'tareas', pokedex: 'pokedex', trainer: 'entrenador', stats: 'estadisticas' };
const VIEW_ORDER = ['tasks', 'pokedex', 'trainer', 'stats'];
const GENERATIONS = [
    { name: 'Kanto', from: 1, to: 151 }, { name: 'Johto', from: 152, to: 251 }, { name: 'Hoenn', from: 252, to: 386 },
    { name: 'Sinnoh', from: 387, to: 493 }, { name: 'Teselia', from: 494, to: 649 }
];
const THEME_LABELS = { auto: 'automático', light: 'día', dark: 'noche' };
const THEME_ICONS = { auto: '🌗', light: '☀️', dark: '🌙' };
const WEEKDAYS = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const ui = {
    view: 'tasks',
    search: '',
    status: 'all',
    category: 'all',
    dexFilter: 'all',
    dexSearch: '',
    editingId: null,
    editSubs: [],
    undo: null,
    celebrate: null,
    today: null,
    installPrompt: null,
    returnFocus: null
};

const $ = function (id) { return document.getElementById(id); };

// ========== UTILIDADES ==========
function normalizeText(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

function formatDate(dateStr) {
    const d = parseDateStr(dateStr);
    if (!d) return '';
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
}

function dueLabel(task) {
    const st = dueStatus(task);
    if (!st) return '';
    const diff = daysBetween(todayStr(), task.due);
    switch (st) {
        case 'overdue': return diff === -1 ? 'Venció ayer' : 'Venció hace ' + (-diff) + ' días';
        case 'today': return 'Vence hoy';
        case 'tomorrow': return 'Mañana';
        case 'soon': return 'En ' + diff + ' días';
        default: return formatDate(task.due);
    }
}

function focusByKey(key) {
    if (!key) return false;
    const el = document.querySelector('[data-focus="' + CSS.escape(key) + '"]');
    if (el && !el.disabled) { el.focus({ preventScroll: true }); return true; }
    return false;
}

// Re-renderiza conservando el foco (los elementos interactivos llevan data-focus)
function withFocus(fn) {
    const active = document.activeElement;
    const key = active && active.dataset ? active.dataset.focus : null;
    fn();
    if (key && document.activeElement !== active) focusByKey(key);
}

function nameSpan(id) {
    return '<span data-name-id="' + id + '">' + escapeHTML(pokemonLabel(id)) + '</span>';
}

// Anuncio solo para lectores de pantalla (el cambio ya es visible en la interfaz)
function announce(msg) {
    const live = $('srAnnounce');
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 50);
}

// ========== TOASTS ==========
function showToast(message, opts) {
    opts = opts || {};
    const box = $('toasts');
    const el = document.createElement('div');
    el.className = 'toast' + (opts.kind ? ' toast-' + opts.kind : '') + (opts.quiet ? ' toast-quiet' : '');
    if (opts.image) {
        const img = document.createElement('img');
        img.src = opts.image; img.alt = ''; img.className = opts.imageClass || '';
        el.appendChild(img);
    }
    const text = document.createElement('span');
    text.className = 'toast-text';
    // {pkmn} se reemplaza por el nombre del Pokémon (se actualiza solo cuando llega desde PokeAPI)
    String(message).split('{pkmn}').forEach(function (part, i) {
        if (i > 0) {
            const n = document.createElement('span');
            n.dataset.nameId = opts.pokemonId;
            n.textContent = pokemonLabel(opts.pokemonId);
            text.appendChild(n);
        }
        text.appendChild(document.createTextNode(part));
    });
    el.appendChild(text);
    if (opts.action) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'toast-action';
        btn.textContent = opts.action.label;
        btn.addEventListener('click', function () { opts.action.run(); dismiss(); });
        el.appendChild(btn);
    }
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Cerrar aviso');
    close.textContent = '✕';
    close.addEventListener('click', function () { dismiss(); });
    el.appendChild(close);
    box.appendChild(el);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    const timer = setTimeout(dismiss, opts.duration || (opts.action ? 8000 : 4500));
    function dismiss() {
        clearTimeout(timer);
        if (el.contains(document.activeElement)) { const m = $('main'); if (m) m.focus({ preventScroll: true }); }
        el.remove();
    }
    return el;
}

// ========== TEMA / SONIDO ==========
function isNight() { const h = new Date().getHours(); return h >= 20 || h < 7; }

function applyTheme() {
    const mode = state.settings.theme;
    const dark = mode === 'dark' || (mode === 'auto' && isNight());
    document.body.classList.toggle('dark-mode', dark);
    const btn = $('themeBtn');
    btn.textContent = THEME_ICONS[mode];
    btn.setAttribute('aria-label', 'Tema: ' + THEME_LABELS[mode] + '. Cambiar tema');
    btn.title = 'Tema: ' + THEME_LABELS[mode];
}

function cycleTheme() {
    const order = ['auto', 'light', 'dark'];
    state.settings.theme = order[(order.indexOf(state.settings.theme) + 1) % order.length];
    saveState();
    applyTheme();
    announce('Tema ' + THEME_LABELS[state.settings.theme]);
}

function applySound() {
    AudioSystem.enabled = !!state.settings.sound;
    const btn = $('soundBtn');
    btn.textContent = state.settings.sound ? '🔊' : '🔇';
    btn.setAttribute('aria-pressed', String(!!state.settings.sound));
    btn.setAttribute('aria-label', state.settings.sound ? 'Sonido activado' : 'Sonido desactivado');
    btn.title = btn.getAttribute('aria-label');
}

// ========== CABECERA ==========
function renderHeader() {
    const info = levelInfo();
    const streak = getStreak();
    $('chipLevel').textContent = info.level;
    $('chipXpFill').style.width = Math.round((info.into / info.span) * 100) + '%';
    $('chipStreak').textContent = streak.current;
    $('chipXpText').textContent = ', faltan ' + info.toNext + ' XP para subir de nivel,';
    $('appTitle').textContent = state.settings.appName || 'ToDoMon';
    document.title = state.settings.appName || 'ToDoMon';
    setPokemonSprite($('brandPartner'), state.trainer.partnerId, false);
}

// ========== TAREAS ==========
function taskMatches(task, category) {
    if (ui.category !== 'all' && ui.category !== category) return false;
    const st = dueStatus(task);
    switch (ui.status) {
        case 'pending': if (task.completed) return false; break;
        case 'done': if (!task.completed) return false; break;
        case 'today': if (task.completed || (st !== 'today' && st !== 'overdue')) return false; break;
        case 'overdue': if (st !== 'overdue') return false; break;
    }
    if (ui.search) {
        const q = normalizeText(ui.search);
        const pid = getTaskPokemonId(task);
        const hay = normalizeText(task.title + ' ' + task.description + ' ' + task.subtasks.map(function (s) { return s.title; }).join(' ') +
            ' ' + (pid ? pokemonLabel(pid) : (task.currentItem ? task.currentItem.name : '')));
        if (hay.indexOf(q) === -1) return false;
    }
    return true;
}

function filtersActive() { return ui.search !== '' || ui.status !== 'all' || ui.category !== 'all'; }
function canReorder() { return state.settings.sort === 'manual' && ui.search === '' && ui.status === 'all'; }

function sortTasks(list) {
    const sort = state.settings.sort;
    if (sort === 'manual') return list;
    return list.slice().sort(function (a, b) {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const da = a.due || '9999-99-99', db = b.due || '9999-99-99';
        const pa = PRIORITIES[a.priority].rank, pb = PRIORITIES[b.priority].rank;
        if (sort === 'due') return da < db ? -1 : da > db ? 1 : pa - pb;
        return pa !== pb ? pa - pb : (da < db ? -1 : da > db ? 1 : 0);
    });
}

function renderSummary() {
    const today = todayStr();
    let pending = 0, dueToday = 0, overdue = 0, doneToday = 0;
    allTasks().forEach(function (x) {
        const t = x.task;
        const st = dueStatus(t, today);
        if (!t.completed) pending++;
        if (st === 'today') dueToday++;
        if (st === 'overdue') overdue++;
        if (t.completed && t.completedAt && isoToDateStr(t.completedAt) === today) doneToday++;
    });
    const tiles = [
        { id: 'pending', n: pending, label: 'Pendientes' },
        { id: 'today', n: dueToday, label: 'Para hoy' },
        { id: 'overdue', n: overdue, label: 'Vencidas', alert: overdue > 0 },
        { id: 'done', n: doneToday, label: 'Hechas hoy' }
    ];
    withFocus(function () {
        $('summary').innerHTML = tiles.map(function (t) {
            return '<button type="button" class="tile' + (t.alert ? ' tile-alert' : '') + (ui.status === t.id ? ' is-active' : '') +
                '" data-status="' + t.id + '" data-focus="tile-' + t.id + '" aria-pressed="' + (ui.status === t.id) + '">' +
                '<span class="tile-n">' + t.n + '</span><span class="tile-label">' + t.label + '</span></button>';
        }).join('');
    });
}

function renderFilters() {
    withFocus(function () {
        $('statusFilters').innerHTML = STATUS_FILTERS.map(function (f) {
            return '<button type="button" class="chip' + (ui.status === f.id ? ' is-active' : '') + '" aria-pressed="' + (ui.status === f.id) +
                '" data-status="' + f.id + '" data-focus="st-' + f.id + '">' + f.label + '</button>';
        }).join('');
        $('categoryFilters').innerHTML = '<button type="button" class="chip' + (ui.category === 'all' ? ' is-active' : '') +
            '" aria-pressed="' + (ui.category === 'all') + '" data-cat="all" data-focus="cf-all">Todas las categorías</button>' +
            ALL_CATEGORY_IDS.map(function (c) {
                const cat = CATEGORIES[c];
                return '<button type="button" class="chip chip-cat' + (ui.category === c ? ' is-active' : '') + '" style="--cat:' + cat.color +
                    '" aria-pressed="' + (ui.category === c) + '" data-cat="' + c + '" data-focus="cf-' + c + '"><span aria-hidden="true">' +
                    cat.emoji + '</span> ' + cat.name + '</button>';
            }).join('');
    });
    $('sortSelect').value = state.settings.sort;
}

function taskSpriteHTML(task) {
    const pid = getTaskPokemonId(task);
    if (pid) {
        const shiny = !!task.evolutionData.isShiny;
        return '<div class="task-sprite">' + pokemonImgHTML(pid, shiny, 'card-sprite', '') +
            '<span class="sprite-name">' + (shiny ? '<span class="shiny-star" title="Variocolor">✨</span>' : '') + nameSpan(pid) + '</span>' +
            '<span class="sprite-id">#' + String(pid).padStart(3, '0') + '</span></div>';
    }
    const item = task.currentItem || {};
    return '<div class="task-sprite"><img class="item-sprite" src="' + escapeHTML(item.sprite || POKEBALL_SPRITE) + '" alt="" width="30" height="30">' +
        '<span class="sprite-name">' + escapeHTML(item.name || 'Objeto') + '</span><span class="sprite-id">Objeto</span></div>';
}

function taskCardHTML(task, category, reorder) {
    const id = task.id;
    const t = escapeHTML(task.title);
    const st = dueStatus(task);
    const total = task.subtasks.length;
    const pct = total ? Math.round((task.progress / total) * 100) : (task.completed ? 100 : 0);
    const prio = PRIORITIES[task.priority];
    const cat = CATEGORIES[category];
    const meta = [];
    if (ui.category === 'all' && filtersActive()) meta.push('<span class="meta meta-cat" style="--cat:' + cat.color + '">' + cat.emoji + ' ' + cat.name + '</span>');
    if (task.priority !== 'normal') meta.push('<span class="meta meta-prio prio-' + task.priority + '"><span aria-hidden="true">' + prio.icon + '</span> Prioridad ' + prio.label.toLowerCase() + '</span>');
    if (st) meta.push('<span class="meta meta-due due-' + st + '"><span aria-hidden="true">📅</span> ' + (st === 'done' ? formatDate(task.due) : dueLabel(task)) + '</span>');
    if (task.recurrence !== 'none') meta.push('<span class="meta meta-rec"><span aria-hidden="true">🔁</span> ' + RECURRENCES[task.recurrence].label + '</span>');
    if (total) meta.push('<span class="meta meta-progress">' + task.progress + '/' + total + ' subtareas</span>');

    const subs = total ? '<ul class="subtask-list">' + task.subtasks.map(function (s) {
        return '<li class="subtask' + (s.completed ? ' done' : '') + '"><label><input type="checkbox" data-action="toggle-sub" data-sub="' + escapeHTML(s.id) +
            '" data-focus="sub-' + id + '-' + escapeHTML(s.id) + '"' + (s.completed ? ' checked' : '') + '> <span>' + escapeHTML(s.title) + '</span></label></li>';
    }).join('') + '</ul>' : '';

    return '<li class="task-card prio-' + task.priority + (st ? ' due-' + st : '') + (task.completed ? ' is-done' : '') +
        (ui.celebrate === id ? ' celebrate' : '') + '" data-task-id="' + id + '" data-category="' + category + '">' +
        (reorder ? '<button type="button" class="drag-handle" data-action="drag" data-focus="drag-' + id + '" aria-label="Reordenar «' + t +
            '». Flechas arriba y abajo para mover" title="Arrastra o usa las flechas">⋮⋮</button>' : '') +
        '<input type="checkbox" class="task-check" data-action="toggle-task" data-focus="check-' + id + '" aria-label="' +
        (task.completed ? 'Marcar como pendiente: ' : 'Completar: ') + t + '"' + (task.completed ? ' checked' : '') + '>' +
        '<div class="task-body">' +
        '<button type="button" class="task-title" data-action="open" data-focus="open-' + id + '" aria-label="' + t + '. Abrir detalles">' + t + '</button>' +
        (task.description ? '<p class="task-desc">' + escapeHTML(task.description) + '</p>' : '') +
        (meta.length ? '<div class="task-meta">' + meta.join('') + '</div>' : '') +
        subs +
        (total ? '<div class="progress" role="progressbar" aria-label="Progreso de ' + t + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct +
            '"><span style="width:' + pct + '%"></span></div>' : '') +
        '</div>' +
        taskSpriteHTML(task) +
        '<button type="button" class="icon-btn task-delete" data-action="delete" data-focus="del-' + id + '" aria-label="Eliminar «' + t + '»" title="Eliminar">🗑️</button>' +
        '</li>';
}

function renderTasks() {
    const container = $('categoryList');
    const total = allTasks().length;
    const reorder = canReorder();
    let shown = 0;
    const html = ALL_CATEGORY_IDS.map(function (c) {
        if (ui.category !== 'all' && ui.category !== c) return '';
        const cat = CATEGORIES[c];
        const list = state.tasks[c];
        const visible = sortTasks(list.filter(function (t) { return taskMatches(t, c); }));
        shown += visible.length;
        if (filtersActive() && visible.length === 0) return '';
        const done = list.filter(function (t) { return t.completed; }).length;
        const collapsed = state.settings.collapsed.indexOf(c) !== -1;
        return '<section class="category" data-category="' + c + '" style="--cat:' + cat.color + ';--cat2:' + cat.color2 + '">' +
            '<h2 class="category-head"><button type="button" class="category-toggle" data-action="collapse" data-cat="' + c + '" data-focus="cat-' + c +
            '" aria-expanded="' + !collapsed + '" aria-controls="list-' + c + '">' +
            '<span class="cat-icon">' + pokemonImgHTML(cat.pokemonId, false, 'cat-sprite', '') + '</span>' +
            '<span class="cat-text"><span class="cat-name">' + cat.emoji + ' ' + cat.name + '</span><span class="cat-sub">' + cat.subtitle + '</span></span>' +
            '<span class="cat-count" aria-label="' + done + ' de ' + list.length + ' completadas">' + done + '/' + list.length + '</span>' +
            '<span class="cat-chevron" aria-hidden="true">▾</span></button></h2>' +
            '<div class="category-body" id="list-' + c + '"' + (collapsed ? ' hidden' : '') + '>' +
            (visible.length ? '<ul class="task-list" data-category="' + c + '">' + visible.map(function (t) { return taskCardHTML(t, c, reorder); }).join('') + '</ul>'
                : '<p class="cat-empty">Sin misiones aquí. Prueba <code>#' + normalizeText(cat.name).replace(/\s/g, '') + '</code> en el agregado rápido.</p>') +
            '</div></section>';
    }).join('');
    withFocus(function () { container.innerHTML = html; });
    const empty = $('emptyState');
    if (total === 0) { empty.hidden = false; $('emptyText').textContent = '¡Tu equipo está vacío! Escribe tu primera misión arriba y aparecerá un Pokémon salvaje.'; container.hidden = true; }
    else if (shown === 0) { empty.hidden = false; $('emptyText').textContent = 'Ninguna tarea coincide con los filtros.'; container.hidden = false; }
    else { empty.hidden = true; container.hidden = false; }
    ui.celebrate = null;
}

function renderTasksView() {
    renderSummary();
    renderFilters();
    renderTasks();
    renderHabitat();
}

// ========== AGREGADO RÁPIDO ==========
function parseQuickAdd(text) {
    const out = { title: '', category: null, priority: null, due: null, recurrence: null };
    const keep = [];
    const today = todayStr();
    text.split(/\s+/).forEach(function (tok) {
        if (!tok) return;
        const n = normalizeText(tok);
        const body = n.slice(1);
        if (n[0] === '#' && CATEGORY_ALIASES[body]) { out.category = CATEGORY_ALIASES[body]; return; }
        if (n[0] === '!') {
            if (body === 'alta' || body === 'high' || body === '!') { out.priority = 'high'; return; }
            if (body === 'baja' || body === 'low') { out.priority = 'low'; return; }
            if (body === 'media' || body === 'normal') { out.priority = 'normal'; return; }
        }
        if (n[0] === '@') {
            if (body === 'hoy') { out.due = today; return; }
            if (body === 'manana') { out.due = addDaysStr(today, 1); return; }
            if (body === 'pasado') { out.due = addDaysStr(today, 2); return; }
            if (body === 'semana') { out.due = addDaysStr(today, 7); return; }
            if (WEEKDAYS[body] !== undefined) {
                const diff = (WEEKDAYS[body] - new Date().getDay() + 7) % 7;
                out.due = addDaysStr(today, diff); return;
            }
            if (isValidDateStr(body)) { out.due = body; return; }
        }
        if (n[0] === '*') {
            if (body === 'diaria' || body === 'diario' || body === 'daily') { out.recurrence = 'daily'; return; }
            if (body === 'semanal' || body === 'weekly') { out.recurrence = 'weekly'; return; }
        }
        keep.push(tok);
    });
    out.title = keep.join(' ').trim();
    return out;
}

function onQuickAdd(e) {
    e.preventDefault();
    const input = $('qaTitle');
    const parsed = parseQuickAdd(input.value);
    if (!parsed.title) {
        showToast('Escribe un nombre para la misión.', { kind: 'warn' });
        input.focus();
        return;
    }
    const recurrence = parsed.recurrence || $('qaRecurrence').value;
    let due = parsed.due || $('qaDue').value || null;
    if (recurrence !== 'none' && !due) due = todayStr();
    const created = createTask({
        title: parsed.title,
        category: parsed.category || $('qaCategory').value,
        priority: parsed.priority || $('qaPriority').value,
        due: due,
        recurrence: recurrence,
        subtasks: $('qaSubtasks').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean)
    });
    saveState();
    input.value = '';
    $('qaSubtasks').value = '';
    $('qaDue').value = '';
    $('qaPriority').value = 'normal';
    $('qaRecurrence').value = 'none';
    if (!taskMatches(created.task, created.category)) { ui.search = ''; ui.status = 'all'; ui.category = 'all'; $('searchInput').value = ''; }
    if (state.settings.collapsed.indexOf(created.category) !== -1) {
        state.settings.collapsed = state.settings.collapsed.filter(function (c) { return c !== created.category; });
        saveState();
    }
    ui.celebrate = created.task.id;
    renderAll();
    AudioSystem.sfx('add');
    const pid = getTaskPokemonId(created.task);
    const cat = CATEGORIES[created.category];
    showToast(pid ? '¡Apareció un {pkmn} salvaje en ' + cat.name + '!' : 'Nueva misión en ' + cat.name + ': encontraste un objeto.', {
        pokemonId: pid, image: pid ? getStaticSpriteUrl(pid, created.task.evolutionData.isShiny) : (created.task.currentItem || {}).sprite, imageClass: 'toast-sprite'
    });
    input.focus();
}

// ========== ACCIONES SOBRE TAREAS ==========
function handleEffects(effects, opts) {
    if (!effects) return;
    opts = opts || {};
    if (effects.completed) ui.celebrate = effects.task.id;
    renderAll();
    if (effects.evolved && effects.evolved.forward && !effects.completed) {
        showToast('¡' + pokemonLabel(effects.evolved.from) + ' evolucionó a {pkmn}!', { pokemonId: effects.evolved.to, image: getStaticSpriteUrl(effects.evolved.to, effects.task.evolutionData.isShiny), imageClass: 'toast-sprite', kind: 'evo' });
        AudioSystem.play(effects.evolved.to, 0.5);
    }
    if (effects.completed) {
        const c = effects.captured;
        let msg = '¡Misión cumplida! +' + effects.xp + ' XP';
        if (c) msg += c.isNew ? ' · {pkmn} registrado en la Pokédex' : ' · {pkmn} capturado otra vez';
        showToast(msg, { kind: 'success', pokemonId: c ? c.pokemonId : null, image: c ? getStaticSpriteUrl(c.pokemonId, effects.task.evolutionData.isShiny) : null, imageClass: 'toast-sprite' });
        if (c) AudioSystem.play(c.pokemonId, 0.5); else AudioSystem.sfx('complete');
    } else if (!effects.evolved && effects.xp > 0 && !opts.silent) {
        AudioSystem.sfx('complete');
    }
    if (effects.shiny) showToast('✨ ¡Increíble! {pkmn} resultó ser variocolor (+' + XP_SHINY_BONUS + ' XP)', { kind: 'shiny', pokemonId: effects.shiny, image: getStaticSpriteUrl(effects.shiny, true), imageClass: 'toast-sprite' });
    if (effects.spawned) showToast('🔁 Próxima repetición: ' + formatDate(effects.spawned.due), {});
    if (effects.levelUp) {
        showToast('⬆️ ¡Subiste a nivel ' + effects.levelAfter + '!', { kind: 'level' });
        AudioSystem.sfx('levelUp');
    }
    effects.badges.forEach(function (b) {
        showToast('🏅 Medalla obtenida: ' + b.name, { kind: 'badge', image: getBadgeSpriteUrl(b.sprite), imageClass: 'toast-badge' });
        AudioSystem.sfx('badge');
    });
}

// Marca/desmarca una tarea. Con subtareas: marcar completa todas; desmarcar las reinicia.
function setTaskDone(taskId, done) {
    const found = findTask(taskId);
    if (!found) return;
    const task = found.task;
    if (task.subtasks.length === 0) { handleEffects(toggleTaskDone(taskId)); return; }
    const effects = updateTask(taskId, {
        title: task.title, description: task.description, category: found.category, priority: task.priority, due: task.due,
        recurrence: task.recurrence, subtasks: task.subtasks.map(function (s) { return { id: s.id, title: s.title, completed: done }; })
    });
    handleEffects(effects);
}

function deleteWithUndo(taskId) {
    const found = findTask(taskId);
    if (!found) return;
    // Mover el foco a la tarjeta vecina antes de borrar
    const card = document.querySelector('.task-card[data-task-id="' + CSS.escape(taskId) + '"]');
    const neighbor = card && (card.nextElementSibling || card.previousElementSibling);
    const snap = deleteTask(taskId);
    ui.undo = snap;
    renderAll();
    if (!(neighbor && focusByKey('open-' + neighbor.dataset.taskId))) focusByKey('cat-' + snap.category) || $('qaTitle').focus();
    AudioSystem.sfx('delete');
    showToast('Misión «' + snap.task.title + '» eliminada', { action: { label: 'Deshacer', run: undoDelete } });
}

function undoDelete() {
    if (!ui.undo) return;
    const snap = ui.undo;
    ui.undo = null;
    restoreTask(snap);
    if (state.settings.collapsed.indexOf(snap.category) !== -1) {
        state.settings.collapsed = state.settings.collapsed.filter(function (c) { return c !== snap.category; });
        saveState();
    }
    renderAll();
    focusByKey('open-' + snap.task.id);
    showToast('Misión «' + snap.task.title + '» restaurada', { quiet: true, duration: 2500 });
}

function moveByKeyboard(taskId, dir) {
    if (!canReorder()) { showToast('Para reordenar usa el orden «Manual» y quita la búsqueda y los filtros de estado.', { quiet: true }); return; }
    const found = findTask(taskId);
    if (!found) return;
    const list = state.tasks[found.category];
    const i = found.index;
    if ((dir < 0 && i === 0) || (dir > 0 && i === list.length - 1)) return;
    const beforeId = dir < 0 ? list[i - 1].id : (list[i + 2] ? list[i + 2].id : null);
    moveTask(taskId, beforeId);
    const active = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.focus : null;
    renderTasks();
    renderHabitat();
    focusByKey(active || 'drag-' + taskId);
    announce('Posición ' + (findTask(taskId).index + 1) + ' de ' + list.length);
}

// Arrastrar con puntero (ratón, táctil o lápiz) desde el asa ⋮⋮
function startDrag(e, handle) {
    const card = handle.closest('.task-card');
    const list = card && card.parentElement;
    if (!card || !list) return;
    e.preventDefault();
    card.classList.add('dragging');
    list.classList.add('is-sorting');
    const startY = e.clientY;
    const pointerId = e.pointerId;
    let moved = false;
    // Los listeners van en document: mover la tarjeta en el DOM rompería la captura del puntero
    function onMove(ev) {
        if (ev.pointerId !== pointerId) return;
        if (Math.abs(ev.clientY - startY) > 4) moved = true;
        if (!moved) return;
        ev.preventDefault();
        const siblings = Array.prototype.filter.call(list.children, function (c) { return c !== card; });
        let before = null;
        for (let i = 0; i < siblings.length; i++) {
            const r = siblings[i].getBoundingClientRect();
            if (ev.clientY < r.top + r.height / 2) { before = siblings[i]; break; }
        }
        if (before) { if (card.nextElementSibling !== before) list.insertBefore(card, before); }
        else if (list.lastElementChild !== card) list.appendChild(card);
    }
    function onUp(ev) {
        if (ev.pointerId !== pointerId) return;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        card.classList.remove('dragging');
        list.classList.remove('is-sorting');
        if (!moved) return;
        const next = card.nextElementSibling;
        moveTask(card.dataset.taskId, next ? next.dataset.taskId : null);
        renderTasks();
        renderHabitat();
        focusByKey('drag-' + card.dataset.taskId);
        announce('Misión movida');
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
}

function onCategoryListClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const card = el.closest('.task-card');
    const taskId = card ? card.dataset.taskId : null;
    switch (el.dataset.action) {
        case 'collapse': {
            const c = el.dataset.cat;
            const set = state.settings.collapsed;
            const i = set.indexOf(c);
            if (i === -1) set.push(c); else set.splice(i, 1);
            saveState();
            renderTasks();
            break;
        }
        case 'open': openTask(taskId); break;
        case 'delete': deleteWithUndo(taskId); break;
    }
}

function onCategoryListChange(e) {
    const el = e.target;
    const card = el.closest('.task-card');
    if (!card) return;
    if (el.dataset.action === 'toggle-sub') handleEffects(toggleSubtaskDone(card.dataset.taskId, el.dataset.sub));
    else if (el.dataset.action === 'toggle-task') setTaskDone(card.dataset.taskId, el.checked);
}

// ========== DIÁLOGO DE DETALLES ==========
function fillSelect(sel, items, value) {
    sel.innerHTML = items.map(function (it) { return '<option value="' + it.value + '">' + escapeHTML(it.label) + '</option>'; }).join('');
    if (value !== undefined) sel.value = value;
}
const categoryOptions = function () { return ALL_CATEGORY_IDS.map(function (c) { return { value: c, label: CATEGORIES[c].emoji + ' ' + CATEGORIES[c].name }; }); };
const priorityOptions = function () { return ['high', 'normal', 'low'].map(function (p) { return { value: p, label: PRIORITIES[p].icon + ' ' + PRIORITIES[p].label }; }); };
const recurrenceOptions = function () { return Object.keys(RECURRENCES).map(function (r) { return { value: r, label: RECURRENCES[r].label }; }); };

function openTask(taskId) {
    const found = findTask(taskId);
    if (!found) return;
    const task = found.task;
    ui.editingId = taskId;
    ui.returnFocus = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.focus : null;
    ui.editSubs = task.subtasks.map(function (s) { return { id: s.id, title: s.title, completed: s.completed }; });
    $('tdTitle').value = task.title;
    $('tdDescription').value = task.description;
    $('tdCategory').value = found.category;
    $('tdPriority').value = task.priority;
    $('tdDue').value = task.due || '';
    $('tdRecurrence').value = task.recurrence;
    $('tdCompleted').checked = task.completed;
    $('tdNewSubtask').value = '';
    renderEvoLine(task);
    renderSubtaskEditor();
    $('taskDialog').showModal();
    $('tdTitle').focus();
}

function renderEvoLine(task) {
    const evo = task.evolutionData;
    const stage = evo.isItem ? evo.chain.findIndex(function (it) { return task.currentItem && it.id === task.currentItem.id; }) : evo.chain.indexOf(task.currentPokemonId);
    $('evoLine').innerHTML = '<span class="evo-label">' + (evo.isItem ? 'Objetos de la aventura' : (evo.chain.length > 1 ? 'Línea evolutiva' : 'Pokémon')) + '</span><ol class="evo-steps">' +
        evo.chain.map(function (step, i) {
            const current = i === stage;
            if (evo.isItem) {
                return '<li class="evo-step' + (current ? ' is-current' : '') + '"' + (current ? ' aria-current="step"' : '') + '><img src="' + escapeHTML(step.sprite) +
                    '" alt="" width="30" height="30" class="item-sprite"><span>' + escapeHTML(step.name) + '</span></li>';
            }
            return '<li class="evo-step' + (current ? ' is-current' : '') + (i < stage ? ' is-past' : '') + '"' + (current ? ' aria-current="step"' : '') + '>' +
                pokemonImgHTML(step, evo.isShiny, 'evo-sprite', '') + '<span>' + nameSpan(step) + '</span></li>';
        }).join('') + '</ol>' +
        (evo.chain.length > 1 && !evo.isItem ? '<p class="hint">Evoluciona al completar el 50% y el 100% de las subtareas.</p>' : '');
}

function renderSubtaskEditor() {
    const ul = $('tdSubtasks');
    withFocus(function () {
        ul.innerHTML = ui.editSubs.map(function (s, i) {
            return '<li class="subtask-edit"><input type="checkbox" data-i="' + i + '" data-focus="es-check-' + i + '" aria-label="Subtarea ' + (i + 1) + ' completada"' +
                (s.completed ? ' checked' : '') + '><input type="text" class="input" data-i="' + i + '" data-focus="es-title-' + i + '" maxlength="80" aria-label="Texto de la subtarea ' +
                (i + 1) + '" value="' + escapeHTML(s.title) + '"><button type="button" class="icon-btn" data-remove="' + i + '" data-focus="es-del-' + i +
                '" aria-label="Quitar subtarea ' + (i + 1) + '">✕</button></li>';
        }).join('') || '<li class="hint">Sin subtareas: la misión se completa con la casilla. Con subtareas, el Pokémon evoluciona.</li>';
    });
    $('tdCompletedRow').hidden = ui.editSubs.length > 0;
}

function addEditSubtask() {
    const input = $('tdNewSubtask');
    const title = input.value.trim();
    if (!title) { input.focus(); return; }
    ui.editSubs.push({ id: null, title: title.slice(0, 80), completed: false });
    input.value = '';
    renderSubtaskEditor();
    input.focus();
}

function saveTaskDialog() {
    const id = ui.editingId;
    if (!id || !findTask(id)) return;
    let due = $('tdDue').value || null;
    const recurrence = $('tdRecurrence').value;
    if (recurrence !== 'none' && !due) due = todayStr();
    const effects = updateTask(id, {
        title: $('tdTitle').value,
        description: $('tdDescription').value,
        category: $('tdCategory').value,
        priority: $('tdPriority').value,
        due: due,
        recurrence: recurrence,
        subtasks: ui.editSubs,
        completed: $('tdCompleted').checked
    });
    handleEffects(effects, { silent: true });
    showToast('Cambios guardados', { quiet: true, duration: 2500 });
}

// ========== POKÉDEX ==========
function dexEntries() {
    const map = {};
    Object.keys(state.dex).forEach(function (id) {
        const e = state.dex[id];
        map[id] = { id: Number(id), caught: true, shiny: e.shiny, count: e.count, first: e.first, progress: false };
    });
    allTasks().forEach(function (x) {
        if (x.task.completed) return;
        const pid = getTaskPokemonId(x.task);
        if (!pid) return;
        if (map[pid]) map[pid].progress = true;
        else map[pid] = { id: pid, caught: false, shiny: !!x.task.evolutionData.isShiny, count: 0, progress: true };
    });
    return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return a.id - b.id; });
}

function renderPokedex() {
    const caught = dexCount();
    const shinies = Object.keys(state.dex).filter(function (id) { return state.dex[id].shiny; }).length;
    const pct = Math.round((caught / DEX_TOTAL) * 1000) / 10;
    $('dexProgress').innerHTML = '<div class="dex-total"><span class="dex-big">' + caught + '<small>/' + DEX_TOTAL + '</small></span><span>Pokémon registrados · ' +
        String(pct).replace('.', ',') + '% · ' + shinies + ' variocolor</span></div>' +
        '<div class="progress big" role="progressbar" aria-label="Pokédex completada" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '"><span style="width:' + pct + '%"></span></div>' +
        '<ul class="gen-list">' + GENERATIONS.map(function (g) {
            const n = Object.keys(state.dex).filter(function (id) { return id >= g.from && id <= g.to; }).length;
            const size = g.to - g.from + 1;
            return '<li><span class="gen-name">' + g.name + '</span><span class="gen-bar"><span style="width:' + (n / size * 100) + '%"></span></span><span class="gen-n">' + n + '/' + size + '</span></li>';
        }).join('') + '</ul>';
    withFocus(function () {
        $('dexFilters').innerHTML = DEX_FILTERS.map(function (f) {
            return '<button type="button" class="chip' + (ui.dexFilter === f.id ? ' is-active' : '') + '" aria-pressed="' + (ui.dexFilter === f.id) + '" data-dex="' + f.id + '" data-focus="dex-' + f.id + '">' + f.label + '</button>';
        }).join('');
    });
    const q = normalizeText(ui.dexSearch.replace(/^#/, ''));
    const entries = dexEntries().filter(function (e) {
        if (ui.dexFilter === 'caught' && !e.caught) return false;
        if (ui.dexFilter === 'progress' && !(e.progress && !e.caught)) return false;
        if (ui.dexFilter === 'shiny' && !e.shiny) return false;
        if (q && normalizeText(pokemonLabel(e.id)).indexOf(q) === -1 && String(e.id).indexOf(q.replace(/^0+/, '')) !== 0) return false;
        return true;
    });
    $('dexGrid').innerHTML = entries.map(function (e) {
        const status = e.caught ? 'Capturado' + (e.count > 1 ? ' ×' + e.count : '') : 'En progreso';
        return '<li class="dex-card' + (e.caught ? ' is-caught' : ' is-progress') + (e.shiny ? ' is-shiny' : '') + '">' +
            '<span class="dex-no">#' + String(e.id).padStart(3, '0') + '</span>' +
            pokemonImgHTML(e.id, e.shiny, 'dex-sprite', '') +
            '<span class="dex-name">' + (e.shiny ? '<span class="shiny-star" aria-label="Variocolor">✨</span> ' : '') + nameSpan(e.id) + '</span>' +
            '<span class="dex-status">' + status + '</span></li>';
    }).join('');
    $('dexGrid').querySelectorAll('img').forEach(function (img) { img.loading = 'lazy'; });
    $('dexEmpty').hidden = entries.length > 0;
    $('dexEmpty').textContent = dexEntries().length ? 'Ningún Pokémon coincide con el filtro.' : 'Completa tareas para registrar Pokémon en tu Pokédex.';
}

// ========== ENTRENADOR ==========
function renderTrainer() {
    const info = levelInfo();
    const streak = getStreak();
    const tasksDone = completedTaskEvents().length;
    const badgesN = Object.keys(state.badges).length;
    const tr = state.trainer;
    const partnerOptions = Object.keys(state.dex).map(Number);
    if (partnerOptions.indexOf(tr.partnerId) === -1) partnerOptions.unshift(tr.partnerId);
    const started = new Date(tr.startedAt);
    const html = '<article class="trainer-card">' +
        '<header class="tc-head"><span class="tc-title">TARJETA DE ENTRENADOR</span><span class="tc-id">ID No. ' + escapeHTML(tr.trainerId) + '</span></header>' +
        '<div class="tc-body">' +
        '<div class="tc-partner"><div class="tc-partner-frame">' + pokemonImgHTML(tr.partnerId, !!(state.dex[tr.partnerId] && state.dex[tr.partnerId].shiny), 'partner-sprite', '') + '</div>' +
        '<label class="field"><span>Compañero</span><select id="partnerSelect" class="input" data-focus="partner">' + partnerOptions.map(function (id) {
            return '<option value="' + id + '"' + (id === tr.partnerId ? ' selected' : '') + '>#' + String(id).padStart(3, '0') + ' ' + escapeHTML(pokemonLabel(id)) + '</option>';
        }).join('') + '</select></label>' +
        '<button type="button" class="btn btn-ghost btn-small" id="randomPartner" data-focus="partner-random">🎲 Compañero aleatorio</button></div>' +
        '<div class="tc-info">' +
        '<label class="field"><span>Nombre</span><input id="trainerName" class="input" type="text" maxlength="20" value="' + escapeHTML(tr.name) + '" data-focus="trainer-name"></label>' +
        '<div class="tc-level"><span class="tc-level-n">Nv. ' + info.level + '</span><span class="tc-xp">' + info.xp + ' XP · faltan ' + info.toNext + ' para Nv. ' + (info.level + 1) + '</span></div>' +
        '<div class="progress big" role="progressbar" aria-label="Experiencia hacia el siguiente nivel" aria-valuemin="0" aria-valuemax="' + info.span + '" aria-valuenow="' + info.into + '"><span style="width:' + (info.into / info.span * 100) + '%"></span></div>' +
        '<dl class="tc-stats">' +
        '<div><dt>Misiones</dt><dd>' + tasksDone + '</dd></div>' +
        '<div><dt>Racha</dt><dd>' + streak.current + ' 🔥</dd></div>' +
        '<div><dt>Mejor racha</dt><dd>' + streak.best + '</dd></div>' +
        '<div><dt>Pokédex</dt><dd>' + dexCount() + '</dd></div>' +
        '<div><dt>Medallas</dt><dd>' + badgesN + '/' + BADGES.length + '</dd></div>' +
        '<div><dt>Aventura desde</dt><dd>' + (isNaN(started) ? '—' : started.getDate() + ' ' + MONTHS[started.getMonth()] + ' ' + started.getFullYear()) + '</dd></div>' +
        '</dl>' + (streak.activeToday ? '' : '<p class="hint">Completa una tarea o subtarea hoy para ' + (streak.current ? 'mantener' : 'empezar') + ' tu racha.</p>') +
        '</div></div></article>';
    withFocus(function () { $('trainerCard').innerHTML = html; });
    $('badgeCase').innerHTML = BADGES.map(function (b) {
        const at = state.badges[b.id];
        const d = at ? new Date(at) : null;
        return '<li class="badge' + (at ? ' is-earned' : '') + '"><img src="' + getBadgeSpriteUrl(b.sprite) + '" alt="" width="60" height="60">' +
            '<span class="badge-name">' + b.name + '</span><span class="badge-desc">' + b.desc + '</span>' +
            '<span class="badge-state">' + (d ? 'Obtenida el ' + d.getDate() + ' ' + MONTHS[d.getMonth()] : 'Bloqueada') + '</span></li>';
    }).join('');
}

// ========== ESTADÍSTICAS ==========
function renderStats() {
    const weeks = weeklyCompletions(8);
    const byCat = completionsByCategory();
    const maxW = Math.max(1, Math.max.apply(null, weeks.map(function (w) { return w.count; })));
    const maxC = Math.max(1, Math.max.apply(null, ALL_CATEGORY_IDS.map(function (c) { return byCat[c]; })));
    const info = levelInfo();
    const streak = getStreak();
    let pending = 0, overdue = 0;
    allTasks().forEach(function (x) { if (!x.task.completed) pending++; if (dueStatus(x.task) === 'overdue') overdue++; });
    const weekLabel = function (w) { const d = parseDateStr(w.start); return d.getDate() + ' ' + MONTHS[d.getMonth()]; };
    const thisWeek = weeks[weeks.length - 1].count;
    const subToday = state.history.filter(function (e) { return !e.migrated && e.type !== 'bonus' && isoToDateStr(e.at) === todayStr(); }).length;
    $('statsContent').innerHTML =
        '<div class="stat-tiles">' +
        '<div class="tile static"><span class="tile-n">' + thisWeek + '</span><span class="tile-label">Esta semana</span></div>' +
        '<div class="tile static"><span class="tile-n">' + completedTaskEvents().length + '</span><span class="tile-label">Misiones totales</span></div>' +
        '<div class="tile static"><span class="tile-n">' + info.xp + '</span><span class="tile-label">XP total</span></div>' +
        '<div class="tile static"><span class="tile-n">' + streak.current + '<small>/' + streak.best + '</small></span><span class="tile-label">Racha / mejor</span></div>' +
        '<div class="tile static"><span class="tile-n">' + pending + '</span><span class="tile-label">Pendientes</span></div>' +
        '<div class="tile static' + (overdue ? ' tile-alert' : '') + '"><span class="tile-n">' + overdue + '</span><span class="tile-label">Vencidas</span></div>' +
        '<div class="tile static"><span class="tile-n">' + subToday + '</span><span class="tile-label">Acciones hoy</span></div>' +
        '</div>' +
        '<section class="panel chart-panel" aria-labelledby="chartWeeks"><h2 class="section-title" id="chartWeeks">Misiones completadas por semana</h2>' +
        '<div class="bar-chart" aria-hidden="true">' + weeks.map(function (w) {
            return '<div class="bar-col"><span class="bar-n">' + w.count + '</span><span class="bar" style="height:' + (w.count / maxW * 100) + '%"></span><span class="bar-label">' + weekLabel(w) + '</span></div>';
        }).join('') + '</div>' +
        '<table class="sr-only"><caption>Misiones completadas por semana (semana que empieza el lunes)</caption><tr><th scope="col">Semana</th><th scope="col">Misiones</th></tr>' +
        weeks.map(function (w) { return '<tr><td>' + weekLabel(w) + '</td><td>' + w.count + '</td></tr>'; }).join('') + '</table></section>' +
        '<section class="panel chart-panel" aria-labelledby="chartCats"><h2 class="section-title" id="chartCats">Por categoría (total)</h2><ul class="hbars">' +
        ALL_CATEGORY_IDS.map(function (c) {
            const cat = CATEGORIES[c];
            return '<li style="--cat:' + cat.color + '"><span class="hbar-label">' + cat.emoji + ' ' + cat.name + '</span><span class="hbar"><span style="width:' + (byCat[c] / maxC * 100) +
                '%"></span></span><span class="hbar-n">' + byCat[c] + '</span></li>';
        }).join('') + '</ul></section>' +
        (state.meta.migratedFrom === 'v5' ? '<p class="hint">Las tareas completadas en v5 se cuentan en la fecha en que se crearon (v5 no guardaba la fecha de completado).</p>' : '');
}

// ========== NAVEGACIÓN ==========
function viewFromHash() {
    const h = location.hash.replace('#', '');
    const v = Object.keys(VIEWS).find(function (k) { return VIEWS[k] === h; });
    return v || 'tasks';
}

function route(fromUser) {
    ui.view = viewFromHash();
    document.querySelectorAll('.view').forEach(function (s) { s.hidden = s.dataset.view !== ui.view; });
    document.querySelectorAll('.tab').forEach(function (a) {
        if (a.dataset.view === ui.view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    renderCurrentView();
    if (fromUser) {
        const h = document.querySelector('#view-' + ui.view + ' .view-title');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        window.scrollTo(0, 0);
    }
}

function renderCurrentView() {
    if (ui.view === 'tasks') renderTasksView();
    else if (ui.view === 'pokedex') renderPokedex();
    else if (ui.view === 'trainer') renderTrainer();
    else if (ui.view === 'stats') renderStats();
}

function renderAll() {
    renderHeader();
    renderCurrentView();
}

function goToView(v) {
    const hash = '#' + VIEWS[v];
    if (location.hash === hash) route(true); else location.hash = hash;
}

// ========== AJUSTES / RESPALDO ==========
function openSettings() {
    $('setAppName').value = state.settings.appName;
    document.querySelectorAll('#setTheme input').forEach(function (r) { r.checked = r.value === state.settings.theme; });
    $('setSound').checked = !!state.settings.sound;
    $('setNotify').checked = !!state.settings.notify && notificationPermission() === 'granted';
    updateNotifyStatus();
    $('installBtn').hidden = !ui.installPrompt;
    $('settingsDialog').showModal();
}

function exportBackup() {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'todomon-respaldo-' + todayStr() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    showToast('Respaldo exportado (' + allTasks().length + ' tareas).', { kind: 'success' });
}

function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
        if (!window.confirm('Importar reemplazará tus datos actuales. Se guardará una copia de seguridad en este navegador. ¿Continuar?')) return;
        try {
            importData(String(reader.result));
            applyTheme();
            applySound();
            renderAll();
            showToast('Respaldo importado: ' + allTasks().length + ' tareas.', { kind: 'success' });
        } catch (err) {
            console.warn('Importación fallida:', err);
            showToast('No se pudo importar: ' + err.message, { kind: 'warn' });
        }
    };
    reader.readAsText(file);
}

// ========== NOTIFICACIONES (opcionales, mientras la app está abierta) ==========
function notificationPermission() { return 'Notification' in window ? Notification.permission : 'unsupported'; }

function updateNotifyStatus() {
    const p = notificationPermission();
    $('notifyStatus').textContent = p === 'unsupported' ? 'Este navegador no admite notificaciones.' :
        p === 'denied' ? 'Las notificaciones están bloqueadas en la configuración del navegador.' :
            state.settings.notify && p === 'granted' ? 'Recibirás un resumen al día como máximo.' : '';
}

function onNotifyToggle(e) {
    if (!e.target.checked) { state.settings.notify = false; saveState(); updateNotifyStatus(); return; }
    if (notificationPermission() === 'unsupported') { e.target.checked = false; updateNotifyStatus(); return; }
    Notification.requestPermission().then(function (p) {
        state.settings.notify = p === 'granted';
        e.target.checked = state.settings.notify;
        saveState();
        updateNotifyStatus();
        if (state.settings.notify) { state.meta.lastNotifyDate = null; maybeNotify(); }
    });
}

function maybeNotify() {
    if (!state.settings.notify || notificationPermission() !== 'granted') return;
    const today = todayStr();
    if (state.meta.lastNotifyDate === today) return;
    let dueToday = 0, overdue = 0;
    allTasks().forEach(function (x) {
        const st = dueStatus(x.task, today);
        if (st === 'today') dueToday++;
        if (st === 'overdue') overdue++;
    });
    state.meta.lastNotifyDate = today;
    saveState();
    if (!dueToday && !overdue) return;
    const body = [dueToday ? dueToday + ' para hoy' : '', overdue ? overdue + ' vencida' + (overdue > 1 ? 's' : '') : ''].filter(Boolean).join(' · ');
    const opts = { body: body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'todomon-daily' };
    const title = (state.settings.appName || 'ToDoMon') + ': misiones pendientes';
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(function (reg) { return reg.showNotification(title, opts); }).catch(function () { });
    } else {
        try { new Notification(title, opts); } catch (err) { }
    }
}

// ========== PWA ==========
function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(function (err) { console.warn('Service worker no registrado:', err); });
    let notified = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (!hadController || notified) return;
        notified = true;
        showToast('Hay una nueva versión de ToDoMon.', { action: { label: 'Recargar', run: function () { location.reload(); } }, duration: 15000 });
    });
}

// ========== ATAJOS DE TECLADO ==========
function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return el.isContentEditable || tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && !['checkbox', 'radio', 'button'].includes(el.type));
}

function onKeydown(e) {
    if (document.querySelector('dialog[open]')) return;
    const target = e.target;
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isTypingTarget(target)) {
        const card = target.closest && target.closest('.task-card');
        if (card) { e.preventDefault(); moveByKeyboard(card.dataset.taskId, e.key === 'ArrowUp' ? -1 : 1); }
        return;
    }
    if (target.classList && target.classList.contains('drag-handle') && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        moveByKeyboard(target.closest('.task-card').dataset.taskId, e.key === 'ArrowUp' ? -1 : 1);
        return;
    }
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && !isTypingTarget(target)) {
        if (ui.undo) { e.preventDefault(); undoDelete(); }
        return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(target)) return;
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); if (ui.view !== 'tasks') goToView('tasks'); $('qaTitle').focus(); }
    else if (e.key === '/') { e.preventDefault(); if (ui.view !== 'tasks') goToView('tasks'); $('searchInput').focus(); }
    else if (e.key === '?') { e.preventDefault(); $('helpDialog').showModal(); }
    else if (/^[1-4]$/.test(e.key)) { e.preventDefault(); goToView(VIEW_ORDER[Number(e.key) - 1]); }
}

// ========== EVENTOS ==========
function bindEvents() {
    $('quickAdd').addEventListener('submit', onQuickAdd);
    $('qaMore').addEventListener('click', function () {
        const extra = $('qaExtra');
        extra.hidden = !extra.hidden;
        this.setAttribute('aria-expanded', String(!extra.hidden));
        this.textContent = extra.hidden ? 'Más' : 'Menos';
    });

    let searchTimer = null;
    $('searchInput').addEventListener('input', function () {
        const v = this.value.trim();
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () { ui.search = v; renderTasks(); }, 120);
    });
    $('summary').addEventListener('click', function (e) {
        const b = e.target.closest('[data-status]');
        if (!b) return;
        ui.status = ui.status === b.dataset.status ? 'all' : b.dataset.status;
        renderTasksView();
    });
    $('statusFilters').addEventListener('click', function (e) {
        const b = e.target.closest('[data-status]');
        if (b) { ui.status = b.dataset.status; renderTasksView(); }
    });
    $('categoryFilters').addEventListener('click', function (e) {
        const b = e.target.closest('[data-cat]');
        if (b) { ui.category = b.dataset.cat; renderTasksView(); }
    });
    $('sortSelect').addEventListener('change', function () { state.settings.sort = this.value; saveState(); renderTasks(); });

    const list = $('categoryList');
    list.addEventListener('click', onCategoryListClick);
    list.addEventListener('change', onCategoryListChange);
    list.addEventListener('pointerdown', function (e) {
        const h = e.target.closest('.drag-handle');
        if (h && e.button === 0) startDrag(e, h);
    });
    list.addEventListener('dblclick', function (e) {
        const card = e.target.closest('.task-card');
        if (card && !e.target.closest('input,button,label')) openTask(card.dataset.taskId);
    });

    // Diálogo de tarea
    const dlg = $('taskDialog');
    $('taskForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const action = e.submitter ? e.submitter.value : 'save';
        if (action === 'save') saveTaskDialog();
        dlg.close();
    });
    dlg.addEventListener('close', function () {
        const id = ui.editingId;
        ui.editingId = null;
        if (!focusByKey(ui.returnFocus) && id) focusByKey('open-' + id);
    });
    $('tdAddSubtask').addEventListener('click', addEditSubtask);
    $('tdNewSubtask').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addEditSubtask(); } });
    $('tdSubtasks').addEventListener('input', function (e) {
        const i = e.target.dataset.i;
        if (i !== undefined && e.target.type === 'text') ui.editSubs[i].title = e.target.value;
    });
    $('tdSubtasks').addEventListener('change', function (e) {
        const i = e.target.dataset.i;
        if (i !== undefined && e.target.type === 'checkbox') ui.editSubs[i].completed = e.target.checked;
    });
    $('tdSubtasks').addEventListener('click', function (e) {
        const b = e.target.closest('[data-remove]');
        if (!b) return;
        ui.editSubs.splice(Number(b.dataset.remove), 1);
        renderSubtaskEditor();
        if (!focusByKey('es-del-' + Math.min(Number(b.dataset.remove), ui.editSubs.length - 1))) $('tdNewSubtask').focus();
    });
    $('tdDelete').addEventListener('click', function () {
        const id = ui.editingId;
        ui.returnFocus = null;
        dlg.close();
        deleteWithUndo(id);
    });

    // Cabecera
    $('themeBtn').addEventListener('click', cycleTheme);
    $('soundBtn').addEventListener('click', function () {
        state.settings.sound = !state.settings.sound;
        saveState();
        applySound();
        announce(state.settings.sound ? 'Sonido activado' : 'Sonido desactivado');
    });
    $('settingsBtn').addEventListener('click', openSettings);
    $('helpBtn').addEventListener('click', function () { $('helpDialog').showModal(); });
    $('openHelpFromSettings').addEventListener('click', function () { $('settingsDialog').close(); $('helpDialog').showModal(); });
    $('trainerChip').addEventListener('click', function () { goToView('trainer'); });

    // Ajustes
    $('setAppName').addEventListener('input', function () {
        state.settings.appName = this.value.trim().slice(0, 30) || 'ToDoMon';
        saveState();
        renderHeader();
    });
    $('setTheme').addEventListener('change', function (e) { state.settings.theme = e.target.value; saveState(); applyTheme(); });
    $('setSound').addEventListener('change', function () { state.settings.sound = this.checked; saveState(); applySound(); });
    $('setNotify').addEventListener('change', onNotifyToggle);
    $('exportBtn').addEventListener('click', exportBackup);
    $('importInput').addEventListener('change', function () { importBackup(this.files[0]); this.value = ''; });
    $('installBtn').addEventListener('click', function () {
        if (!ui.installPrompt) return;
        ui.installPrompt.prompt();
        ui.installPrompt = null;
        this.hidden = true;
    });

    // Pokédex
    $('dexFilters').addEventListener('click', function (e) {
        const b = e.target.closest('[data-dex]');
        if (b) { ui.dexFilter = b.dataset.dex; renderPokedex(); }
    });
    $('dexSearch').addEventListener('input', function () { ui.dexSearch = this.value.trim(); renderPokedex(); });

    // Entrenador (delegado: la tarjeta se re-renderiza)
    $('trainerCard').addEventListener('change', function (e) {
        if (e.target.id === 'partnerSelect') {
            state.trainer.partnerId = Number(e.target.value);
            saveState();
            renderHeader();
            renderTrainer();
            AudioSystem.play(state.trainer.partnerId, 0.4);
        } else if (e.target.id === 'trainerName') {
            state.trainer.name = e.target.value.trim().slice(0, 20) || 'Entrenador';
            saveState();
            announce('Nombre guardado');
        }
    });
    $('trainerCard').addEventListener('click', function (e) {
        if (e.target.id !== 'randomPartner') return;
        state.trainer.partnerId = 1 + Math.floor(Math.random() * DEX_TOTAL);
        saveState();
        renderHeader();
        renderTrainer();
        AudioSystem.play(state.trainer.partnerId, 0.4);
    });

    $('brandPartner').addEventListener('click', function () { AudioSystem.play(state.trainer.partnerId, 0.4); });
    window.addEventListener('hashchange', function () { route(true); });
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); ui.installPrompt = e; });

    // Nombres de Pokémon que llegan desde PokeAPI: actualizar solo el texto
    onPokemonName(function (id) {
        const name = pokemonLabel(id);
        document.querySelectorAll('[data-name-id="' + id + '"]').forEach(function (el) { el.textContent = name; });
        document.querySelectorAll('#partnerSelect option[value="' + id + '"]').forEach(function (o) { o.textContent = '#' + String(id).padStart(3, '0') + ' ' + name; });
        if (state.dex[id] && !state.dex[id].name && pokemonNames[id]) { state.dex[id].name = pokemonNames[id]; saveState(); }
    });

    habitatOnSelect = openTask;
}

// ========== INICIO ==========
function init() {
    const result = loadState();
    ui.today = todayStr();
    fillSelect($('qaCategory'), categoryOptions(), 'urgent');
    fillSelect($('qaPriority'), priorityOptions(), 'normal');
    fillSelect($('qaRecurrence'), recurrenceOptions(), 'none');
    fillSelect($('tdCategory'), categoryOptions());
    fillSelect($('tdPriority'), priorityOptions());
    fillSelect($('tdRecurrence'), recurrenceOptions());
    $('appVersion').textContent = APP_VERSION;
    applyTheme();
    applySound();
    bindEvents();
    route(false);
    renderHeader();

    if (result.migratedFrom === 'v5') {
        showToast('¡Bienvenido a ToDoMon 6! Migramos tus ' + allTasks().length + ' tareas de v5 (con copia de seguridad).', { kind: 'success', duration: 8000 });
    } else if (result.migratedFrom === 'corrupt') {
        showToast('Tus datos guardados estaban dañados: se guardó una copia y empezamos de nuevo.', { kind: 'warn', duration: 10000 });
    }

    registerServiceWorker();
    maybeNotify();
    setInterval(function () {
        if (state.settings.theme === 'auto') applyTheme();
        if (todayStr() !== ui.today) { ui.today = todayStr(); renderAll(); maybeNotify(); }
    }, 60000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
