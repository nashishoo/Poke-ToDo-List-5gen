# 🎮 ToDoMon List App

> **Para los amantes de Pokémon, ¡una Poke ToDo list!**

![ToDoMon App Screenshot](https://i.postimg.cc/ZnnyD7CC/Captura-de-pantalla-19-2-2026-20331.jpg)

Una aplicación de tareas gamificada donde tus pendientes cobran vida. Cada tarea es un Pokémon que evoluciona a medida que avanzas, transformando tu productividad en una aventura clásica de Pokémon.

> [!NOTE]
> **Estado Actual (v5.3)**: La aplicación es totalmente funcional. La v5.3 corrigió las cadenas de evolución erróneas, el estado de las tareas al desmarcar subtareas, los nombres de Pokémon al evolucionar y el escalado de los sprites. Ver [Novedades v5.3](#-novedades-v53).

> [!TIP]
> **Futuro del Proyecto**: Se planea una refactorización completa a **React** para mejorar la escalabilidad y el rendimiento en la próxima gran versión.

![Version](https://img.shields.io/badge/version-5.3-blue)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ⚡ Características Principales

Esta no es una lista de tareas ordinaria. Aquí, completas misiones para **construir tu equipo Pokémon**:

-   **Nuevo: Pokédex Dashboard**: 
    -   Rastrea todos los Pokémon que has capturado completando tareas.
    -   Visualiza tu colección con sprites, nombres y fechas de captura.
    -   Filtra por estado: Capturado (Completado) o En Progreso.

-   **Nuevo: Hábitat de Vida Artificial**:
    -   Tus tareas activas viven en el pie de página como Pokémon reales.
    -   **Comportamiento Autónomo**: Caminan, descansan y exploran el entorno de forma independiente.
    -   **Profundidad Visual**: Sistema de capas que da sensación de espacio 3D.
    -   **Ciclo Día/Noche**: Automático según la hora local (noche de 20:00 a 07:00) o fijo con el botón 🌗/☀️/🌙 del header. De noche el hábitat muestra un cielo estrellado.
    -   **Sprites animados de 5ta generación**: Los Pokémon usan los GIF animados de Pokémon Negro/Blanco (con respaldo al sprite estático).

-   **Evolución e Items**:
    -   Las tareas **Urgentes** e **Ideas** evolucionan como Pokémon reales al completar sus subtareas.
    -   Las tareas de **Algún Día** (Someday) se representan como objetos de aventura (Pokéballs, Piedras Evolutivas).

-   **Sistema de Categorías Expandido**:
    -   🔥 **Urgente**: Pokémon de Fuego para máxima prioridad.
    -   💼 **Trabajo**: Retos de gimnasio y batalla.
    -   🏠 **Personal**: Pokémon amigables y compañeros.
    -   📚 **Aprendizaje**: Tipo Psíquico para el conocimiento.
    -   💡 **Ideas**: Creatividad y Legendarios (¡con probabilidad Shiny!).
    -   🌟 **Algún Día**: Items y objetos especiales.

-   **Diseño Nostálgico**:
    -   Fuentes Pixel Art ('Press Start 2P') para la inmersión retro.
    -   Iconos de acción temáticos: **TM** para editar, **Repel** para borrar, **Rare Candy** para completar.
    -   Barras de progreso visuales y contadores integrados.
    -   Efectos holográficos "Shiny" al completar tareas al 100%.

## 🚀 Cómo Empezar

No necesitas instalar nada complejo. Es tan simple como abrir una Pokéball.

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/nashishoo/Poke-ToDo-List-5gen.git
    cd Poke-ToDo-List-5gen
    ```

2.  **Juega:**
    -   Abre el archivo `index.html` en tu navegador favorito.
    -   *(Opcional)* Para escuchar los "crys" de los Pokémon y asegurar que todos los recursos carguen correctamente, usa un servidor local:
        ```bash
        npx serve .
        # o
        python -m http.server 8000
        ```

También puedes usarla directamente en GitHub Pages: **https://nashishoo.github.io/Poke-ToDo-List-5gen/**

## 🆕 Novedades v5.3

-   **Evoluciones corregidas**: las 72 cadenas evolutivas están verificadas contra PokeAPI (antes había 13 erróneas, como Larvesta → Volcarona → Cobalion). Las tareas guardadas con cadenas erróneas se corrigen solas al abrir la app.
-   **Desmarcar funciona**: si desmarcas una subtarea (o agregas una nueva al editar), la tarea vuelve a quedar pendiente.
-   **Nombres al día**: cuando un Pokémon evoluciona, su nombre se actualiza en el hábitat y en la Pokédex.
-   **Sprites nítidos**: GIF animados de Negro/Blanco escalados por factores enteros para que los píxeles no se deformen.
-   **Hábitat estable**: los Pokémon ya no "saltan" de posición cuando cambias tus tareas.
-   **Día/Noche real** con modo automático por hora.
-   **Datos seguros**: los datos de versiones anteriores se migran solos; si algo no se puede leer, se respalda en `todopkmn_tasks_backup` en lugar de borrarse.

## 🛠️ Stack Tecnológico

Construido con amor y estándares web puros:

-   **HTML5 & CSS3**: Diseño responsivo, animaciones fluidas y variables CSS para temas dinámicos.
-   **Vanilla JavaScript**: Lógica ligera y rápida sin frameworks pesados.
-   **PokeAPI**: La fuente de datos para sprites (incluidos los GIF animados de Gen V), nombres y sonidos.
-   **LocalStorage**: Tus tareas y progreso se guardan automáticamente en tu navegador.

## 📄 Licencia

Código bajo licencia [MIT](LICENSE). Pokémon es marca de Nintendo, Creatures Inc. y GAME FREAK inc.; los recursos gráficos y de audio se cargan desde PokeAPI y no forman parte del repositorio.

## 🤝 Contribuir

¿Tienes ideas para una nueva generación? ¡Los Pull Requests son bienvenidos!

1.  Haz un Fork del proyecto.
2.  Crea tu rama de características (`git checkout -b feature/AmazingFeature`).
3.  Commit a tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

---

<div align="center">


### Dolan
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nashishoo)

</div>
