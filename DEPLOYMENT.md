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
- [ ] Botón de tema alterna auto → día → noche (auto: noche de 20:00 a 07:00)
- [ ] Sin errores en la consola al cargar
- [ ] Datos de v5.2 cargan y se migran sin pérdidas

### Infrastructure & Hosting
- [x] GitHub Repository created
- [x] GitHub Pages: se publica automáticamente desde `master` (carpeta raíz, build legacy)
- [ ] Workflow "Pre-deploy Checks" en verde

## Release Steps
1.  Bump version in `README.md`, `index.html` (`?v=` y texto de versión) y `agent.md`.
2.  Commit all changes: `git commit -am "Prepare for release"`
3.  Push to master (vía PR): `git push origin master`
4.  Create a tag: `git tag v5.3.0`
5.  Push tag: `git push origin v5.3.0`
