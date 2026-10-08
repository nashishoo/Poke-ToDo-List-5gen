# Deployment Checklist

Lista para dejar **ToDoMon** listo en GitHub Pages.

## Antes de publicar

### Código
- [ ] El workflow "Pre-deploy Checks" está en verde (sintaxis JS, manifest, iconos, precarga del service worker, referencias locales)
- [ ] Sin errores en la consola al cargar
- [ ] Sin claves ni secretos en el código

### Funcionalidad
- [ ] Crear, editar, completar y eliminar tareas (con deshacer)
- [ ] Subtareas: evolución al 50% y al 100%, y la tarea vuelve a pendiente al desmarcar
- [ ] Fechas límite, prioridades, recurrencias, búsqueda y filtros
- [ ] Pokédex, tarjeta de entrenador, medallas y estadísticas
- [ ] El hábitat muestra los Pokémon de las tareas
- [ ] Los datos persisten al recargar y se migran desde v5.2/v5.3 sin pérdidas
- [ ] Tema: auto → día → noche
- [ ] Recargar sin conexión (con el service worker activo) sigue mostrando la app

### Infraestructura
- [x] Repositorio de GitHub creado
- [x] GitHub Pages: se publica automáticamente desde `master` (carpeta raíz, build legacy). No hay paso de compilación.
- [ ] Workflow "Pre-deploy Checks" en verde

## Publicar una versión

1.  Subir la versión en `README.md`, en los `?v=` de `index.html`, en la lista `SHELL` de `sw.js` y en `APP_VERSION` (`js/data.js`). El workflow verifica que index y sw coincidan.
2.  Commit y push mediante un Pull Request hacia `master`.
3.  Al mergear, GitHub Pages publica solo.
4.  (Opcional) Etiquetar: `git tag v6.0.0 && git push origin v6.0.0`.
