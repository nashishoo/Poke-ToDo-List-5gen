/**
 * ToDoMon v6.0 - Hábitat: los Pokémon de tus tareas pasean por la pradera (decorativo).
 * Instancias persistentes por tarea: al cambiar las tareas no se recrean ni saltan.
 */
'use strict';

const HABITAT_MAX = 12;
const habitatSims = new Map();
let habitatRunning = false;
let habitatOnSelect = null; // (taskId) => void, lo define app.js
const reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

function prefersReducedMotion() { return !!(reduceMotionQuery && reduceMotionQuery.matches); }

function habitatEntries() {
    const pending = [], done = [];
    allTasks().forEach(function (x) {
        const id = getTaskPokemonId(x.task);
        if (!id) return;
        (x.task.completed ? done : pending).push({ task: x.task, category: x.category, pokemonId: id, shiny: !!x.task.evolutionData.isShiny });
    });
    return pending.concat(done).slice(0, HABITAT_MAX);
}

function renderHabitat() {
    const container = document.getElementById('pokemonTeam');
    if (!container) return;
    const seen = new Set();
    habitatEntries().forEach(function (entry) {
        seen.add(entry.task.id);
        let sim = habitatSims.get(entry.task.id);
        if (!sim) { sim = new HabitatPokemon(entry, container); habitatSims.set(entry.task.id, sim); }
        sim.update(entry);
    });
    habitatSims.forEach(function (sim, id) {
        if (!seen.has(id)) { sim.element.remove(); habitatSims.delete(id); }
    });
    startHabitat();
}

function startHabitat() {
    if (habitatRunning || prefersReducedMotion()) return;
    habitatRunning = true;
    requestAnimationFrame(habitatLoop);
}

function habitatLoop() {
    const container = document.getElementById('pokemonTeam');
    const visible = container && container.offsetParent !== null && document.visibilityState === 'visible';
    if (!visible || prefersReducedMotion()) { habitatRunning = false; return; }
    habitatSims.forEach(function (sim) { sim.tick(); });
    requestAnimationFrame(habitatLoop);
}

document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') startHabitat(); });
window.addEventListener('resize', function () { habitatSims.forEach(function (sim) { sim.layout(); }); });

class HabitatPokemon {
    constructor(entry, container) {
        this.container = container;
        this.taskId = entry.task.id;
        this.spriteKey = null;
        const el = document.createElement('div');
        el.className = 'habitat-pokemon';
        el.innerHTML = '<img class="pkmn-sprite habitat-sprite" alt="">' +
            '<div class="pokemon-tooltip"><div class="tooltip-header"><span class="tooltip-name"></span><span class="tooltip-id"></span></div>' +
            '<div class="tooltip-task"></div><div class="tooltip-status"></div></div>';
        this.element = el;
        this.img = el.querySelector('img');
        const self = this;
        el.addEventListener('click', function () { if (habitatOnSelect) habitatOnSelect(self.taskId); });
        this.img._onSpriteLoad = function () { self.measure(); };
        this.x = Math.random() * 85;
        this.depth = Math.random();
        this.speed = Math.random() * 0.03 + 0.01;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.state = 'idle';
        this.timer = Math.floor(Math.random() * 100);
        this.widthPct = 8;
        container.appendChild(el);
        this.layout();
        this.flip();
    }

    update(entry) {
        const key = entry.pokemonId + (entry.shiny ? 's' : '');
        if (key !== this.spriteKey) {
            this.spriteKey = key;
            setPokemonSprite(this.img, entry.pokemonId, entry.shiny);
        }
        this.element.classList.toggle('shiny', entry.shiny);
        this.element.classList.toggle('done', !!entry.task.completed);
        const t = entry.task;
        const total = t.subtasks.length;
        this.element.querySelector('.tooltip-name').textContent = pokemonLabel(entry.pokemonId);
        this.element.querySelector('.tooltip-id').textContent = '#' + entry.pokemonId;
        this.element.querySelector('.tooltip-task').textContent = '📝 ' + (t.title.length > 28 ? t.title.slice(0, 28) + '…' : t.title);
        this.element.querySelector('.tooltip-status').textContent = t.completed ? '✓ Completada' : (total ? t.progress + '/' + total + ' subtareas' : 'En progreso');
    }

    layout() {
        const height = this.container.clientHeight || 220;
        const usable = Math.max(0, height - 100);
        this.y = Math.round(8 + this.depth * usable);
        this.element.style.bottom = this.y + 'px';
        this.element.style.zIndex = String(1000 - this.y);
        this.measure();
    }

    measure() {
        const cw = this.container.clientWidth;
        if (cw > 0 && this.element.offsetWidth > 0) this.widthPct = (this.element.offsetWidth / cw) * 100;
        this.x = Math.min(this.x, Math.max(0, 100 - this.widthPct));
        this.element.style.left = this.x + '%';
    }

    tick() {
        if (this.timer > 0) this.timer--;
        else if (Math.random() < 0.3) { this.state = 'idle'; this.timer = 60 + Math.random() * 120; }
        else {
            this.state = 'walking';
            if (Math.random() > 0.5) { this.direction *= -1; this.flip(); }
            this.timer = 120 + Math.random() * 200;
            this.speed = Math.random() * 0.03 + 0.01;
        }
        if (this.state === 'walking') {
            const maxX = Math.max(0, 100 - this.widthPct);
            this.x += this.speed * this.direction;
            if (this.x > maxX) { this.x = maxX; this.direction = -1; this.timer = 60; this.flip(); }
            else if (this.x < 0) { this.x = 0; this.direction = 1; this.timer = 60; this.flip(); }
            this.element.style.left = this.x + '%';
        }
    }

    // Los sprites de Gen V miran a la izquierda
    flip() { this.img.style.transform = this.direction === 1 ? 'scaleX(-1)' : 'scaleX(1)'; }
}
