# ToDoMon v6.0 — Notas para agentes

App de tareas gamificada (vanilla HTML/CSS/JS, sin compilación) que se publica en GitHub Pages desde la raíz de `master`. Todo el estado vive en `localStorage`.

## Archivos

| Archivo | Rol |
|---|---|
| `index.html` | Estructura, diálogos y script inline que aplica el tema antes de pintar |
| `js/data.js` | Constantes: categorías, cadenas evolutivas (72, verificadas), pools, medallas, XP |
| `js/store.js` | Estado, persistencia, migración, acciones (crear, completar, editar, borrar, mover) |
| `js/sprites.js` | Sprites de PokeAPI, nombres en español, gritos, `fitSprite`, `escapeHTML` |
| `js/habitat.js` | Pradera decorativa (instancias persistentes por tarea, máx. 12) |
| `js/app.js` | Interfaz: vistas, diálogos, atajos, toasts, PWA |
| `sw.js` + `manifest.webmanifest` + `icons/` | PWA: precarga del app shell y caché de sprites vistos |
| `css/style.css`, `css/habitat-style.css` | Estilos (tokens de tema en `:root` / `body.dark-mode`) |

Scripts clásicos sin módulos (funcionan también abriendo `index.html` como archivo). El service worker solo se registra en `http(s)`.

## Modelo de datos (`todomon_v6` en localStorage)

```
{ version: 6,
  tasks: { urgent|work|personal|learning|ideas|someday: [Task] },
  history: [{ id, type: 'task'|'subtask'|'bonus', taskId, category, at, xp, migrated?, shinyGained?, pokemonId? }],
  dex: { [pokemonId]: { first, count, shiny, name } },
  badges: { [badgeId]: isoDate },
  trainer: { name, trainerId, partnerId, startedAt },
  settings: { theme: 'auto'|'light'|'dark', sound, notify, appName, collapsed: [], sort: 'manual'|'due'|'priority' },
  meta: { createdAt, migratedFrom, lastNotifyDate } }
```

`Task`: `{ id, title, description, completed, completedAt, createdAt, subtasks: [{id,title,completed}], evolutionData, currentPokemonId, currentItem, progress, priority: 'high'|'normal'|'low', due: 'YYYY-MM-DD'|null, recurrence: 'none'|'daily'|'weekly', pokemonName?, pokemonNameId?, spawnedNextId? }`.

`evolutionData`: `{ chain, isItem, isShiny, category, noEvolution }`. `chain` es una lista de ids de Pokémon, o de objetos `{id,name,sprite}` si es un ítem (categoría Algún Día).

## Reglas de juego

- Con subtareas, `completed` se deriva de ellas (`syncTaskState`). Sin subtareas, la casilla principal alterna `completed`.
- Evolución: 0% primera etapa, ≥50% etapa media, 100% etapa final (`getEvolutionStage`).
- XP: 10 por subtarea, 50 por tarea ± bono de prioridad (+20 alta, −10 baja, mínimo 10), +25 si sale variocolor (1/16 al completar). Nivel: XP acumulada para el nivel L = `50·L·(L−1)`.
- Al completar una recurrente se crea la siguiente ocurrencia en su lugar y la completada baja al final de la categoría. Desmarcar elimina esa ocurrencia si sigue intacta y revierte el variocolor ganado (no se puede "farmear").
- La Pokédex suma al completar y resta al desmarcar (usa el `pokemonId` guardado en el evento). Las medallas, una vez obtenidas, son permanentes.
- La racha cuenta días con actividad real (los eventos `migrated` y `bonus` no cuentan).

## Migración desde v5.x

Si no existe `todomon_v6` pero sí alguna clave `todopkmn_*`:

1. Copia íntegra de las claves v5 en `todomon_backup_v5` (no se sobrescribe si ya existe). **Las claves v5 originales no se borran.**
2. Las categorías legacy se reasignan (`gym→work`, `raid→ideas`, `adventure→someday`) y cualquier clave desconocida va a `personal` con un `console.warn` (v5.3 las borraba).
3. Se reparan las cadenas erróneas con `CHAIN_FIXES` y se siembra `history` y `dex` desde las tareas ya completadas (marcadas `migrated: true`, con fecha = `createdAt`, porque v5 no guardaba `completedAt`).
4. Si el nivel guardado en v5 es mayor que el calculado, se agrega un evento `bonus` para conservarlo.
5. Tema, categorías colapsadas, nombre de la app y Pokémon de cabecera se trasladan a `settings`/`trainer`.

Otras copias: `todomon_backup_corrupt` (estado v6 ilegible) y `todomon_backup_before_import` (estado previo a importar un JSON). `importData` acepta un export v6 o un objeto de tareas v5.

## Sprites y nombres

- GIF animado Gen V: `sprites/pokemon/versions/generation-v/black-white/animated/[shiny/]{id}.gif` (existe para #1–#649), con `data-fallback` al PNG estático y luego a una Poké Ball. `fitSprite` escala por factor entero dentro de `--sprite-box`.
- Nombres en español desde `pokeapi.co/api/v2/pokemon-species/{id}`, cacheados en `todomon_names`. El HTML usa `<span data-name-id>` para actualizarse solo cuando llega el nombre.
- Gritos: `raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/{id}.ogg`.
- Medallas: `sprites/badges/33.png`–`40.png` (set de Teselia).

## Interfaz

- Vistas por hash: `#tareas`, `#pokedex`, `#entrenador`, `#estadisticas` (pestañas arriba en ≥900px, barra fija abajo en móvil).
- Todo elemento interactivo de una vista lleva `data-focus`; `withFocus()` re-renderiza sin perder el foco.
- Agregado rápido: `#categoría`, `!alta|!baja`, `@hoy|@mañana|@lunes|@YYYY-MM-DD`, `*diaria|*semanal`.
- Reordenar: arrastrar el asa `⋮⋮` (listeners de puntero en `document`, porque mover el nodo rompe la captura) o flechas con el asa enfocada / Alt+flechas.
- Al subir de versión hay que actualizar los `?v=` de `index.html` **y** la lista `SHELL` de `sw.js`: el workflow lo verifica.

## Service worker

Precarga el app shell, navegación con red primero y caché de respaldo, archivos propios con revalidación en segundo plano, `raw.githubusercontent.com` con caché primero (sprites ya vistos = offline) y PokeAPI/fuentes con revalidación. Las respuestas opacas no se reutilizan para peticiones CORS. Rutas relativas para funcionar bajo `/Poke-ToDo-List-5gen/`.

## Qué se decidió dejar fuera

- El modo "dormir" de v5 (overlay que bloqueaba la app): el ciclo día/noche queda en el tema y el hábitat.
- Notificaciones push con la app cerrada: el aviso diario solo funciona mientras la app está abierta.
- Nombres oficiales de las medallas de Teselia: se usan nombres de hitos propios.
- La Pokédex no muestra los 649 en silueta, solo capturados y en progreso (el porcentaje sí es sobre 649).
