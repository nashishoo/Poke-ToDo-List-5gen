---
name: Crafting Effective READMEs
description: A guide and templates for creating comprehensive and effective README files for various project types.
---

# Crafting Effective READMEs

READMEs answer questions your audience will have:
- Who is this for?
- How does it help me?
- How do I use it?
- What if something breaks?

## Process

### Step 1: Identify the Task
- **New Project:** Creating a README from scratch. Focus on core value and quickstart.
- **Refinement:** Improving an existing README. Look for missing sections or unclear instructions.
- **Audit:** Checking readiness for a specific audience (e.g., "Is this ready for external contributors?").

### Step 2: Draft/Review
- Write content for identified sections.
- Identify gaps or outdated information.
- Flag outdated sections.
- Update "Last reviewed" date if present.

### Step 3: Always Ask
After drafting, ask: "Anything else to highlight or include that I might have missed?"

## Project Types

| Type | Audience | Key Sections | Template |
| :--- | :--- | :--- | :--- |
| **Open Source** | Contributors, users worldwide | Install, Usage, Contributing, License | `templates/oss.md` |
| **Personal** | Future you, portfolio viewers | What it does, Tech stack, Learnings | `templates/personal.md` |
| **Internal** | Teammates, new hires | Setup, Architecture, Runbooks | `templates/internal.md` |
| **Config** | Future you (confused) | What's here, Why, How to extend, Gotchas | `templates/xdg-config.md` |

*Note: Ask the user if unclear. Don't assume OSS defaults for everything.*

## Essential Sections (All Types)
Every README needs at minimum:
1. **Name:** Self-explanatory title.
2. **Description:** What + why in 1-2 sentences.
3. **Usage:** How to use it (examples help).

## References
- **`section-checklist.md`**: Which sections to include by project type.
- **`style-guide.md`**: Common README mistakes and prose guidance.
- **`using-references.md`**: Guide to deeper reference materials.
