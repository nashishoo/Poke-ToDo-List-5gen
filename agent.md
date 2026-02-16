# ToDoMon List App - Agent Documentation (v5.0)

## 📋 Project Overview

**Project Name:** ToDoMon List App  
**Type:** Single-page web application (HTML + CSS + Vanilla JavaScript)  
**Version:** 5.1 (Artificial Life Update)  
**Purpose:** A Pokémon-themed to-do list app where tasks "evolve" into Pokémon/items as you complete subtasks - gamifying productivity with a retro gaming feel  
**Target User:** Ignacio (owner of the project)  
**Last Updated:** February 2026

---

## 📁 File Structure

```
ToDo Pkmn/
├── index.html      # Main HTML structure (UI layout)
├── app.js         # JavaScript logic (v5.0 - Core functionality)
├── style.css      # Styling (v5.0 - White/Black Edition theme)
└── agent.md       # This documentation
```

---

## 🎯 Core Features

### 1. Task Categories

The app has three distinct categories, each with its own Pokémon theme:

| Category | Internal ID | Emoji | Pokemon Theme | Visual |
|----------|-------------|-------|---------------|--------|
| Coding Pendiente | `gym` | 💻 | Gym Leaders | Strong/competitive Pokémon |
| Ideas al Peo | `raid` | 💡 | Ash's Team | Classic Pokémon + 30% SHINY chance |
| Ayuda Memorias | `adventure` | 📝 | Items | Pokéballs + Evolution Stones |

#### Category Details:

**💻 Coding Pendiente (Gym)**
- Purpose: Development tasks, coding projects, technical work
- Pokémon: Strong/competitive Pokémon from Gen 1-5
- Evolution: Full 3-stage evolution chains (e.g., Charmander → Charmeleon → Charizard)
- Visual: Blue accent color (#2E5EAA)

**💡 Ideas al Peo (Raid)**
- Purpose: Brainstorming, creative ideas, spontaneous thoughts
- Pokémon: Pokémon from Ash Ketchum's anime team (Gen 1-5)
- Special: **30% chance of SHINY** Pokémon (with golden glow animation)
- Visual: Gold accent color (#C8A000)

**📝 Ayuda Memorias (Adventure)**
- Purpose: Notes, reminders, memory aids
- Items: Pokéballs (Master Ball, Ultra Ball, Great Ball, Poke Ball) + Evolution Stones
- Visual: Green accent color (#1E7A00)

---

### 2. Task System

#### Creating Tasks

There are **two ways** to create tasks:

1. **Modal-based (Primary Method)**
   - Click the Pokéball button (🎱) in any category header
   - Opens a modal with fields for:
     - Task title (required, max 100 chars)
     - Description (optional)
     - Subtasks (optional, added as chips)
   - Click "Crear Tarea" to save

2. **Quick-add Form (Legacy)**
   - Use the form at the top of the page
   - Select category from buttons
   - Enter title and optional description
   - Add subtasks as chips
   - Click add button

#### Task Properties

```javascript
{
  id: "unique-id",              // Generated: timestamp + random string
  title: "Task title",         // Required, max 100 characters
  description: "Optional",      // Optional description
  completed: false,             // Boolean: main completion status
  createdAt: "ISO-8601",       // Creation timestamp
  subtasks: [                  // Array of subtask objects
    {
      id: "subtask-id",
      title: "Subtask title",
      completed: false
    }
  ],
  evolutionData: {             // Pokémon evolution data
    chain: [1, 2, 3],         // Array of Pokémon IDs or items
    isItem: false,             // Boolean: true for Adventure category
    isShiny: false,            // Boolean: true for shiny Pokémon
    category: "gym"            // Category identifier
  },
  currentPokemonId: 1,         // Current Pokémon ID in evolution
  currentItem: null,           // Current item (for Adventure category)
  progress: 0                  // Number of completed subtasks
}
```

#### Checkbox Behavior

- **Tasks WITHOUT subtasks**: Have a manual checkbox (32x32px) that you click to toggle completion
- **Tasks WITH subtasks**: Checkbox is HIDDEN - completion is automatic when ALL subtasks are done

---

### 3. Evolution System

The app implements a gamified evolution system:

#### Evolution Stages

| Progress | Stage | Visual |
|----------|-------|--------|
| 0% | Basic | First Pokémon in chain (e.g., Bulbasaur) |
| 50% | First Evolution | Middle Pokémon (e.g., Ivysaur) |
| 100% | Final Evolution | Last Pokémon (e.g., Venusaur) |
| 5+ subtasks | LEGENDARY | Special legendary Pokémon |

#### Evolution Chains

**Gym Category (71 chains, Gen 1-5):**
- Example: 1 → 2 → 3 (Bulbasaur → Ivysaur → Venusaur)
- Example: 4 → 5 → 6 (Charmander → Charmeleon → Charizard)
- Example: 258 → 259 → 260 (Mudkip → Marshtomp → Swampert)
- See `GYM_EVOLUTIONS` object in app.js for complete list

**Raid Category (Ash's Team):**
- Pokémon from the anime (Pikachu, Charizard, Squirtle, etc.)
- **30% chance of SHINY** (golden glow animation)
- Selection is pseudo-random based on timestamp

**Adventure Category (Items):**
- Pokéballs: Master Ball, Ultra Ball, Great Ball, Poke Ball
- Evolution Stones: Moon Stone, Sun Stone
- Progression shows different items at 0%, 50%, 100%

**Legendary Pokémon (5+ subtasks):**
- Triggered when a task has 5 or more subtasks
- Includes: Articuno, Zapdos, Moltres, Mewtwo, Mew, Raikou, Entei, Suicune, Lugia, Ho-Oh, Latias, Latios, Kyogre, Groudon, Rayquaza, Dialga, Palkia, Giratina, Heatran, Regigigas, Cresselia, Phione, Manaphy, Darkrai, Shaymin, Arceus, Cobalion, Terrakion, Virizion, Tornadus, Thundurus, Reshiram, Zekrom, Kyurem, Keldeo, Meloetta, Genesect, Xerneas, Yvelta, Zygarde, Diancie, Hoopa, Volcanion

---

### 4. Visual Elements

#### Task Card Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Pokemon/Item]                           [✓] [✏️] [🗑️]   │
│  Task Title                                                 │
│  Description (if exists)                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☐ Subtask 1                                        │   │
│  │ ☑ Subtask 2                                        │   │
│  │ ☐ Subtask 3                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                          [Pokemon Sprite]   │
│                                          2/3               │
└─────────────────────────────────────────────────────────────┘
```

#### Key Visual Features:

- **Pokemon Mascot**: 70x70px sprite in bottom-right corner of task cards
- **Progress Badge**: Shows "X/Y" (completed/total subtasks)
- **Shiny Animation**: Golden pulse effect for shiny Pokémon (1.5s ease-in-out infinite)
- **Task Card Styling**:
  - Hover: lift effect with shadow, border color change
  - Completed: opacity 0.7, strikethrough text
  - Fully Complete (all subtasks done): green gradient background
- **Completion Check**: Animated pop effect (0.4s) when task is completed

---

### 5. Dark Mode

- Toggle button in header (moon/sun icon)
- **Light Mode**: White/Gray background, blue accents (#2E5EAA)
- **Dark Mode**: Black/Charcoal background, neon green accents (#00D26A)
- State persists in localStorage

---

### 6. Trainer Level System

Level increases based on **completed subtasks** (more accurate measure of work):

| Level | Subtasks Completed |
|-------|-------------------|
| 1 | 0-4 |
| 2 | 5-9 |
| 3 | 10-19 |
| 4 | 20-29 |
| 5 | 30-44 |
| 6 | 45-59 |
| 7 | 60-79 |
| 8 | 80-99 |
| 9 | 100-149 |
| 10 | 150+ |

**Level Up**: 
- Triggers sound effect (Eevee's cry)
- Animated badge update in header

---

### 7. Collapsible Categories

- Click anywhere on category header (except Pokéball button) to collapse/expand
- Collapsed state hides the task list
- State persists in localStorage (`todopkmn_collapsed`)

---

### 8. Pokemon Habitat Footer

A animated "habitat" at the bottom of the screen showing all active Pokémon from tasks with subtasks.

#### Features:
- **Fixed Position**: Always at bottom of screen (120px height)
- **Walking Animation**: Each Pokémon has a unique walking animation (offset timing)
- **Hover Effects**: 
  - Pauses animation
  - Shows tooltip with task info
  - Brightens sprite
- **Click Action**: Scrolls to and highlights the associated task

#### Tooltip Shows:
- Pokémon number and ID
- Task title (truncated to 25 chars)
- Creation date
- Progress status

---

## 🔧 Technical Implementation

### Data Storage (localStorage)

| Key | Type | Description |
|-----|------|-------------|
| `todopkmn_tasks` | JSON String | All tasks organized by category |
| `todopkmn_trainer_level` | JSON Number | Current trainer level |
| `todopkmn_dark_mode` | JSON Boolean | Dark mode state |
| `todopkmn_collapsed` | JSON Array | List of collapsed category IDs |

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Action   │────▶│  Update State   │────▶│  Save to        │
│  (add/complete)│     │  (tasks object) │     │  localStorage   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Re-render UI   │
                        │  (DOM updates)  │
                        └─────────────────┘
```

### Event Flow

1. **Page Load** (`DOMContentLoaded`):
   - `loadData()` - Load tasks from localStorage
   - `setupEventListeners()` - Initialize all event listeners
   - `renderAllTasks()` - Render all category lists
   - `updateStats()` - Calculate and display stats
   - `AudioSystem.init()` - Load sound effects
   - `initDarkMode()` - Apply saved theme
   - `initCollapsedCategories()` - Restore collapsed state
   - `setTimeout(renderPokemonHabitat, 100)` - Render footer after delay

2. **Add Task**:
   - Validate input
   - Generate evolution data based on category + subtask count
   - Add to beginning of category array
   - Save to localStorage
   - Re-render category
   - Update stats
   - Play "add" sound + Pokémon cry

3. **Complete Subtask**:
   - Toggle subtask completion
   - Calculate new progress
   - Determine evolution stage
   - Update Pokémon/item
   - Auto-complete task if 100%
   - Save + render + update stats

### Functions Reference

#### Core Functions

| Function | Purpose |
|----------|---------|
| `loadData()` | Load tasks and level from localStorage |
| `saveData()` | Save tasks and level to localStorage |
| `renderTasks(category)` | Render task list for a category |
| `renderAllTasks()` | Render all category lists |
| `updateStats()` | Calculate and update progress/level |

#### Task Operations

| Function | Purpose |
|----------|---------|
| `addTask()` | Add new task (legacy method) |
| `toggleTask(category, taskId)` | Toggle main task completion |
| `toggleSubtask(category, taskId, subtaskId)` | Toggle subtask + trigger evolution |
| `deleteTask(category, taskId)` | Delete task |
| `openEditModal(category, taskId)` | Open edit modal |
| `saveEdit()` | Save edited task |

#### Evolution System

| Function | Purpose |
|----------|---------|
| `getEvolutionChain(category, subtaskCount)` | Generate evolution data for new task |
| `getEvolutionStage(evolutionData, completed, total)` | Calculate current evolution stage |

#### UI Functions

| Function | Purpose |
|----------|---------|
| `toggleDarkMode()` | Toggle light/dark theme |
| `toggleCategoryCollapse(category)` | Collapse/expand category |
| `renderPokemonHabitat()` | Render footer Pokémon |
| `scrollToTask(category, taskId)` | Scroll to task + highlight |

### Audio System

The app uses Pokémon cries from PokeAPI for sound effects:

| Sound | Trigger | Pokémon |
|-------|---------|---------|
| `add` | New task created | Blaziken (#257) |
| `complete` | Task completed manually | Tyranitar (#248) |
| `delete` | Task deleted | Excadrill (#530) |
| `levelUp` | Level increases | Eevee (#133) |
| Pokemon Cry | Evolution triggered | Current Pokémon |

**Note**: Audio may have CORS issues when running locally without a server.

---

## 📊 Statistics System

### Progress Calculation

```
Total = taskCount + subtaskCount
Completed = taskCompleted + subtaskCompleted

Progress % = (Completed / Total) * 100
```

### Display

- **Task Counter**: "X / Y" showing completed/total
- **Progress Bar**: Visual percentage with gradient fill
- **Percentage Text**: Numeric percentage

---

## 🎨 CSS Architecture

### CSS Variables (`:root`)

```css
:root {
    --white-primary: #FAFAFA;      /* Main background */
    --white-secondary: #FFFFFF;    /* Card background */
    --black-primary: #111111;      /* Text color */
    --gray-light: #E8E8E8;         /* Borders, dividers */
    --gray-medium: #CCCCCC;        /* Hover states */
    --gray-dark: #666666;          /* Secondary text */
    --unova-blue: #2E5EAA;         /* Gym category */
    --unova-red: #D32F2F;          /* Errors, delete */
    --unova-green: #1E7A00;        /* Success, adventure */
    --gold: #C8A000;               /* Raid category */
    --shadow: rgba(0, 0, 0, 0.1); /* Box shadows */
}
```

### Dark Mode Overrides

```css
body.dark-mode {
    --white-primary: #0a0a0a;
    --white-secondary: #141414;
    --black-primary: #E8E8E8;
    --gray-light: #1a1a1a;
    --gray-medium: #2a2a2a;
    --gray-dark: #888888;
    --unova-green: #00D26A;  /* Neon green! */
    --gold: #FFD700;
    --shadow: rgba(0, 0, 0, 0.6);
}
```

### Key Animations

| Animation | Duration | Trigger |
|-----------|----------|---------|
| `shinyPulse` | 1.5s infinite | Shiny Pokémon hover |
| `checkPop` | 0.4s | Task completion |
| `pokemonWalk` | 3s infinite | Footer Pokémon |
| `tooltipFadeIn` | 0.2s | Tooltip show |
| `float` | 3s infinite | Empty state Pokémon |

---

## 🔄 How to Use

### Step 1: Open the App
```
Open index.html in any modern browser
```

### Step 2: Create a Task
```
Click the Pokéball (🎱) in any category header
- Enter task title
- Optionally add description
- Optionally add subtasks as chips
- Click "Crear Tarea"
```

### Step 3: Complete Subtasks (Evolution)
```
Click the checkbox next to each subtask
- At 50%: Pokémon evolves (first evolution)
- At 100%: Final evolution + completion sound
- With 5+ subtasks: Legendary Pokémon appears!
```

### Step 4: Track Progress
```
Watch the progress bar and stats update in real-time
Complete subtasks to level up your trainer!
```

### Step 5: Explore Features
```
- Toggle dark mode with 🌙/☀️ button
- Collapse/expand categories by clicking headers
- Hover over footer Pokémon to see task details
- Click footer Pokémon to scroll to task
```

---

## ✅ Recent Fixes (v5.0.x)

1. **Checkbox behavior**: Tasks with subtasks now properly hide the main checkbox
2. **Subtask styling**: Improved visual styling with bold font
3. **CSS variables**: Added missing `--unova-blue` and `--unova-red`
4. **No-subtasks text**: Added proper styling for empty subtask state
5. **Initialization**: Fixed `initCollapsedCategories()` being called properly
6. **Collapse duplicate events**: Removed duplicate event listeners causing conflicts
7. **Stats accuracy**: Now counts both tasks AND subtasks for progress
8. **Level calculation**: Now based on completed subtasks (more accurate)
9. **Footer rendering**: Added timeout delay to ensure proper loading from localStorage
10. **Tooltip z-index**: Increased to 9999 to appear above all elements
11. **Footer positioning**: Made footer always fixed at bottom with proper padding

---

## 🐛 Troubleshooting

### Audio not playing
- **Cause**: Browser autoplay restrictions or CORS issues
- **Solution**: 
  - Interact with the page first (click somewhere)
  - Use a local server (VS Code Live Server, Python http.server, etc.)

### Pokémon not showing in footer
- **Cause**: Only tasks WITH subtasks appear in footer
- **Cause**: Adventure category shows items, not Pokémon
- **Solution**: Create tasks with at least one subtask

### Categories won't collapse
- **Cause**: Clicking on Pokéball button triggers task creation instead
- **Solution**: Click on the category header area, not the Pokéball button

### Dark mode not persisting
- **Cause**: localStorage disabled or full
- **Solution**: Check browser settings, clear localStorage

### Stats show wrong numbers
- **Cause**: Old calculation only counted main tasks
- **Solution**: Fixed in v5.0 - now counts tasks + subtasks

### Footer disappears on refresh
- **Cause**: Race condition in rendering
- **Solution**: Fixed with setTimeout delay (100ms)

### Tooltip hidden behind page
- **Cause**: Low z-index value
- **Solution**: Fixed - z-index now 9999

---

## 🔮 Future Development Ideas

1. **More Pokémon variety**: Add Gen 6-9 Pokémon
2. **Custom categories**: Allow user to create custom categories
3. **Tags/labels**: Add tagging system for tasks
4. **Due dates**: Add date-based reminders
5. **Export/Import**: Backup and restore functionality
6. **Multi-language**: Support for English, Spanish, etc.
7. **Sound settings**: Volume control, mute option
8. **Achievements**: Badges for milestones
9. **Streaks**: Daily task completion tracking

---

## 📞 Contact & Support

For issues or questions about the app:
- Check the troubleshooting section above
- Review the code in `app.js` for implementation details
- Check browser console for JavaScript errors (F12)

---

## 🏆 Credits

- **Pokémon sprites**: [PokeAPI](https://pokeapi.co/)
- **Pokémon cries**: [PokeAPI Cries](https://github.com/PokeAPI/cries)
- **Inspiration**: Pokémon Black/White games, gamification concepts
- **Developer**: Ignacio

---

## ✨ v5.1 Update (Artificial Life & Realism)

### 1. Artificial Life System (Footer Habitat)
- **Replaced CSS Animations**: Moved from rigid `keyframes` to a custom JS implementation (`HabitatPokemon` class).
- **Natural Behavior**: Pokémon now wander, idle, and change speeds randomly.
- **Fixed Flipping Bug**: Tooltip text no longer mirrors when the Pokémon turns around (sprite flip decoupled from container).
- **Depth System**: Added vertical depth (Z-index + Y-position) to prevent flat stacking.

### 2. "Shiny Card" Visuals
- **Legendary Glow**: Completed tasks (100% subtasks) get a "Shiny" card effect.
- **Gold Border**: Pulsating golden border animation.
- **Text Radiance**: Task title gets a heavy white outline and gold shadow for high visibility.
- **Victory Jump**: The card's mascot Pokemon jumps in celebration.

### 3. Smart Tooltips
- **Real Names**: Tooltips now fetch the actual Pokémon name from PokeAPI (e.g., "Charizard #006") instead of just ID.
- **Positioning**: Fixed clipping issues where tooltips were hidden by the footer overflow.

### 4. Layout & Reliability
- **Robust Task Counter**: Fixed bugs where the counter reset on reload or counted subtasks incorrectly.
- **Static Habitat**: Refactored the footer to be a static section at the bottom of the page (350px height) rather than a sticky element.
*Note: Some sticky positioning issues may persist in certain browser contexts, requiring further CSS diagnostics.*

---

*End of Documentation - ToDoMon List App v5.1*
