# Deployment Checklist

Use this checklist to ensure the **ToDoMon List App** is ready for production/GitHub.

## Pre-Deployment Checklist

### Code Quality
- [ ] All CI checks passing (if configured)
- [ ] Code reviewed/Self-reviewed
- [ ] No critical bugs in the console
- [ ] Security: No exposed API keys or secrets in code

### Dependencies & Setup
- [ ] All files tracked in git (check `.gitignore`)
- [ ] `README.md` is up-to-date and accurate
- [ ] `LICENSE` file included (optional but recommended)

### Functionality Check
- [ ] Tasks can be added, edited, deleted
- [ ] Subtasks update progress correctly
- [ ] Evolution system works (50%, 100%)
- [ ] **Pokédex Dashboard**: Tracks captured Pokémon correctly
- [ ] **Habitat**: Pokémon appear and move in the footer
- [ ] LocalStorage persists data after refresh
- [ ] Mode toggle (Dark/Light) works

### Infrastructure & Hosting
- [ ] GitHub Repository created
- [ ] GitHub Pages configured (if applicable)

## Release Steps
1.  Bump version in `README.md` (if applicable).
2.  Commit all changes: `git commit -am "Prepare for release"`
3.  Push to main: `git push origin main`
4.  Create a tag: `git tag v1.0.0`
5.  Push tag: `git push origin v1.0.0`
