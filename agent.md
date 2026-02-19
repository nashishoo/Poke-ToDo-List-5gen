# ToDoMon List App - Agent Documentation (v5.2)

## 📋 Project Overview

**Project Name:** ToDoMon List App  
**Type:** Single-page web application (HTML + CSS + Vanilla JavaScript)  
**Version:** 5.2 (Living World Update)  
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
├── agent.md       # This documentation
└── .github/        # GitHub Actions workflows
```

---

## 🎯 Core Features

### 1. Task Categories

The app has three distinct categories, each with its own Pokémon theme:

| Category | Internal ID | Emoji | Pokemon Theme | Visual |
|----------|-------------|-------|---------------|--------|
| Coding Pendiente | `gym` → `work` | 💻 | Gym Leaders | Strong/competitive Pokémon |
| Ideas al Peo | `raid` → `ideas` | 💡 | Ash's Team | Classic Pokémon + 30% SHINY chance |
| Ayuda Memorias | `adventure` → `someday` | 📝 | Items | Pokéballs + Evolution Stones |

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
   - Use the form at the top of the page (if enabled)
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
- Ranges from Gen 1 Birds to Gen 6 Mythicals

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

### 5. Pokédex Dashboard (New in v5.2)

A collapsible panel that tracks your entire collection of captured and in-progress Pokémon.

#### Features:
- **Collection Tracking**: Scans all tasks to build a unique list of Pokémon.
- **Card View**: Displays 20 entries per row with sprite, name, ID, and catch date.
- **Status Indicators**:
  - `✓ CAPTURADO`: For completed tasks.
  - `◐ EN PROGRESO`: For active tasks.
- **Filters**: Auto-sorts by status (Captured first) and then by date.
- **Interaction**: Clicking a Pokémon scrolls to the associated task.

---

### 6. Artificial Life Habitat (Footer)

An animated "habitat" at the bottom of the screen showing all active Pokémon from tasks.

#### Features:
- **Autonomous Behavior (AI)**: Each Pokémon is a `HabitatPokemon` instance with its own state machine:
  - **States**: `idle` (standing still), `walking` (moving left/right).
  - **Decisions**: Randomly decides when to stop, start walking, change speed, or turn around.
- **Depth System**: 
  - Random `bottom` position (20px - 300px) simulates depth.
  - `z-index` calculated relative to vertical position (lower down = closer = higher z-index).
- **Day/Night Cycle**: The habitat background changes with the app's Dark Mode, showing stars at night.
- **Interactivity**: Clicking a Pokémon scrolls to its task. Hovering shows a detailed tooltip.

---

### 7. Core Systems

#### Data Storage (localStorage)

| Key | Type | Description |
|-----|------|-------------|
| `todopkmn_tasks` | JSON String | All tasks organized by category |
| `todopkmn_trainer_level` | JSON Number | Current trainer level |
| `todopkmn_dark_mode` | JSON Boolean | Dark mode state |
| `todopkmn_collapsed` | JSON Array | List of collapsed category IDs |
| `todopkmn_app_name` | String | Custom app title |
| `todopkmn_header_pokemon`| Number | ID of current header mascot |

#### Self-Healing Data (`repairData`)

The app includes a robust `repairData()` function that runs on load to fix common issues:
1. **Migration**: Converts old category names (`gym` → `work`, etc.) to new ones.
2. **Structure**: Ensures every task has a `subtasks` array.
3. **Evolution Integrity**: Regenerates missing `evolutionData` if it was lost.
4. **State Consistency**: Forces task completion state to match subtask completion (e.g., if all subtasks are done, task MUST be marked done).

---

## 🔧 Technical Implementation

### CSS Architecture

#### CSS Variables (`:root`)

```css
:root {
    --white-primary: #FAFAFA;      /* Main background */
    --white-secondary: #FFFFFF;    /* Card background */
    --black-primary: #111111;      /* Text color */
    /* ... category colors ... */
    --unova-blue: #2E5EAA;         /* Gym category */
    --unova-red: #D32F2F;          /* Errors, delete */
    --unova-green: #1E7A00;        /* Success, adventure */
    --gold: #C8A000;               /* Raid category */
}
```

#### Dark Mode Overrides

```css
body.dark-mode {
    --white-primary: #0a0a0a;
    --unova-green: #00D26A;  /* Neon green! */
    --gold: #FFD700;
}
```

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
- Watch your Pokémon grow in the Habitat footer!
```

### Step 4: Check your Pokédex
```
Click the "POKÉDEX" header to expand your collection
See all the Pokémon you've gathered on your journey
```

---

## 📞 Contact & Support

For issues or questions about the app:
- Check browser console for JavaScript errors (F12)
- Review `js/app.js` for logic details
- Contact: Ignacio

---

## 🏆 Credits

- **Pokémon sprites**: [PokeAPI](https://pokeapi.co/)
- **Pokémon cries**: [PokeAPI Cries](https://github.com/PokeAPI/cries)
- **Inspiration**: Pokémon Black/White games, gamification concepts
- **Developer**: Ignacio

---

*End of Documentation - ToDoMon List App v5.2*
