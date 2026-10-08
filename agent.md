# ToDoMon List App - Documentación para agentes (v5.3)

## 📋 Resumen

**Proyecto:** ToDoMon List App (repo `nashishoo/Poke-ToDo-List-5gen`)
**Tipo:** SPA estática (HTML + CSS + JavaScript puro, sin build ni dependencias)
**Versión:** 5.3
**Propósito:** Lista de tareas con temática Pokémon: cada tarea tiene un Pokémon (o ítem) que evoluciona a medida que se completan sus subtareas.
**Dueño:** Ignacio Garriga
**Publicación:** GitHub Pages desde `master` (carpeta raíz, build legacy) → https://nashishoo.github.io/Poke-ToDo-List-5gen/
**Última actualización:** Octubre 2026

---

## 📁 Estructura

```
Poke-ToDo-List-5gen/
├── index.html                  # Estructura de la UI (header, stats, Pokédex, categorías, modales, hábitat)
├── favicon.svg                 # Poké Ball
├── css/
│   ├── style.css               # Estilos generales (tema día/noche, tarjetas, modales, Pokédex)
│   └── habitat-style.css       # ÚNICA fuente de estilos del hábitat del footer (fondo, Pokémon, tooltip)
├── js/
│   └── app.js                  # Toda la lógica
├── README.md / DEPLOYMENT.md / LICENSE (MIT)
├── agent.md                    # Este documento
├── .agent/skills/              # Skills de apoyo para agentes
└── .github/workflows/deploy.yml  # "Pre-deploy Checks" (solo valida; no despliega)
```

`index.html` carga `css/*.css?v=5.3` y `js/app.js?v=5.3` con `defer`. Al publicar una versión nueva hay que subir el `?v=`.

---

## 🎯 Categorías

| Categoría | ID | Pool de Pokémon | Notas |
|-----------|----|-----------------|-------|
| 🔥 Urgente | `urgent` | `FIRE_TYPES` | |
| 💼 Trabajo | `work` | `GYM_EVOLUTIONS` | Cadenas evolutivas completas |
| 🏠 Personal | `personal` | `FRIENDLY_TYPES` | |
| 📚 Aprendizaje | `learning` | `PSYCHIC_TYPES` | |
| 💡 Ideas | `ideas` | `IDEAS_POKEMON_POOL` (#1-#649) | 30% de probabilidad shiny |
| 🌟 Algún Día | `someday` | `ADVENTURE_ITEMS` | Ítems (Poké Balls, piedras) en vez de Pokémon |

Categorías legacy (`gym` → `work`, `raid` → `ideas`, `adventure` → `someday`) se migran en `repairData()`.

### Elección del Pokémon (`getEvolutionChain`)
- **5+ subtareas** → un legendario de `LEGENDARY_POKEMON_EXTENDED`.
- **0 subtareas** → un Pokémon (o ítem) sin evolución del pool de la categoría.
- **1-4 subtareas** → cadena evolutiva: `work` toma de `GYM_EVOLUTIONS`; `urgent`/`personal`/`learning` usan cadenas de `GYM_EVOLUTIONS` cuyo primer Pokémon está en su pool; `ideas` busca la cadena que contiene al Pokémon elegido.

### Etapas (`getEvolutionStage`)
- < 50% → primera etapa · ≥ 50% → etapa del medio · 100% → etapa final.
- Ítems: se avanza proporcionalmente por la lista de ítems.

`GYM_EVOLUTIONS` es un **arreglo** de 72 cadenas Gen 1-5 verificadas contra PokeAPI (`pokemon-species.evolves_from_species`). Si se agregan cadenas, verificarlas igual. `CHAIN_FIXES` mapea las cadenas erróneas que guardaba v5.2 a la cadena corregida.

---

## 🧱 Modelo de datos (localStorage)

| Clave | Contenido |
|-------|-----------|
| `todopkmn_tasks` | `{ urgent: Task[], work: Task[], ... }` |
| `todopkmn_tasks_backup` | Copia del JSON original si no se pudo leer (nunca se borran datos) |
| `todopkmn_trainer_level` | Nivel de entrenador (número) |
| `todopkmn_theme` | `'auto'` (por defecto) \| `'light'` \| `'dark'` |
| `todopkmn_collapsed` | IDs de categorías colapsadas |
| `todopkmn_app_name` | Título personalizado |
| `todopkmn_header_pokemon` | ID del Pokémon del header |

```javascript
Task = {
  id, title, description, createdAt,       // createdAt en ISO-8601
  completed,                               // con subtareas: SIEMPRE derivado de ellas
  subtasks: [{ id, title, completed }],
  evolutionData: { chain, isItem, isShiny, category, noEvolution },
  currentPokemonId,                        // null si es ítem
  currentItem,                             // objeto de ADVENTURE_ITEMS o null
  progress,                                // subtareas completadas
  pokemonName, pokemonNameId               // nombre cacheado y el id al que corresponde
}
```

### Reglas clave
- `syncTaskState(task)` es la única fuente de verdad para `progress`, etapa (`currentPokemonId`/`currentItem`) y `completed` (cuando hay subtareas). Se llama en `toggleSubtask`, `saveEdit` y `repairData`.
- Tareas sin subtareas se completan con su checkbox manual (`toggleTask`).
- `repairData()` corre al cargar: migra categorías legacy, descarta claves desconocidas, regenera `evolutionData` inválido, aplica `CHAIN_FIXES` y sincroniza el estado.

---

## 🖼️ Sprites

- `getPokemonSpriteUrl(id, shiny)`: GIF animado de Black/White (`sprites/pokemon/versions/generation-v/black-white/animated/[shiny/]{id}.gif`) para #1-#649; PNG estático para el resto.
- Toda imagen de Pokémon lleva la clase `.pkmn-sprite` y `data-fallback` (PNG estático). Un listener global de `error` (fase de captura) cambia a `data-fallback` y luego a la Poké Ball.
- `fitSprite(img)` (listener global de `load`) escala por factor entero según las variables CSS `--sprite-scale` (factor deseado) y `--sprite-box` (tamaño máximo). Si no cabe, reduce por divisor entero con render suavizado. **No usar anchos/altos fijos ni `transform: scale()` no enteros en sprites.**
- `img[data-pokemon]` en el HTML (íconos de categoría y Pokédex) se actualizan al GIF animado con `upgradeStaticSprites()`.

---

## 🌳 Hábitat (footer)

- `habitatSims: Map<taskId, HabitatPokemon>`. `renderPokemonHabitat()` hace un diff: crea, actualiza o elimina instancias, **sin recrear** las existentes (no saltan).
- `HabitatPokemon`: estado `idle`/`walking`, dirección, velocidad; `layout()` recalcula la profundidad (`bottom` y `z-index`) según la altura real del hábitat; `measure()` ajusta el límite derecho según el ancho del sprite.
- `animateHabitat()` corre con `requestAnimationFrame` solo cuando la app está despierta.
- El tooltip se actualiza con `textContent` (`update()` / `setName()`).

## 🏷️ Nombres

- `getPokemonDisplayName(task)` devuelve el nombre si `pokemonNameId === currentPokemonId`; si no, pide `pokemon-species/{id}` (nombre en español) con `ensurePokemonName()`.
- Al llegar el nombre, `applyPokemonName()` lo guarda en las tareas y actualiza solo los textos del hábitat y de la Pokédex (`updateNameUI`).

## 🌗 Tema día/noche

- `themeMode` (`auto`/`light`/`dark`), botón `#themeBtn` alterna en ese orden.
- Auto: noche entre las 20:00 y las 07:00 (hora local), se revisa cada minuto.
- Un script inline al inicio de `<body>` aplica la clase `dark-mode` antes de pintar para evitar parpadeo.
- Modo dormido (`body.sleeping`, hasta el primer clic/tecla/toque): el hábitat siempre se ve de noche y el header muestra una Poké Ball.

## 📕 Pokédex

`renderPokedex()` lista todas las tareas con Pokémon (capturadas primero, luego por fecha). Clic → `scrollToTask()`.

---

## ✅ Verificación manual sugerida

1. Abrir con un servidor local (`npx serve .` o `python -m http.server 8000`), consola sin errores.
2. Crear tareas en varias categorías, marcar y desmarcar subtareas: el Pokémon evoluciona y vuelve, el nombre coincide con el sprite y el contador se actualiza.
3. Editar una tarea completa y agregar una subtarea → queda pendiente.
4. Botón de tema: auto → día → noche.
5. El hábitat no reinicia posiciones al modificar tareas.

## 🏆 Créditos

- Sprites, gritos y datos: [PokeAPI](https://pokeapi.co/) / [PokeAPI Cries](https://github.com/PokeAPI/cries)
- Desarrollo: Ignacio Garriga · Licencia MIT
