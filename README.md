# ✈️ My Flight Academy

> **Proyecto de enseñanza personal.** Este repositorio está en **constante evolución**: se añaden lecciones, se corrigen datos y se mejoran herramientas de forma continua. El contenido es material de estudio propio y no representa una fuente aeronáutica oficial.

---

## Estado del proyecto

![Último commit](https://img.shields.io/github/last-commit/OscarDavidRodriguezPorras/My-Flight-Academy?style=flat-square&logo=git&logoColor=white&label=Último%20commit&color=ffb020)
![Commits este mes](https://img.shields.io/github/commit-activity/m/OscarDavidRodriguezPorras/My-Flight-Academy?style=flat-square&label=Commits%20este%20mes&color=3d8bd9)
![Tamaño del repo](https://img.shields.io/github/repo-size/OscarDavidRodriguezPorras/My-Flight-Academy?style=flat-square&label=Tamaño&color=3fbf7f)
![Licencia](https://img.shields.io/badge/uso-personal%20%2F%20educativo-8a9ab3?style=flat-square)

### 🕐 Último commit

| Campo | Detalle |
|---|---|
| **Repositorio** | [OscarDavidRodriguezPorras/My-Flight-Academy](https://github.com/OscarDavidRodriguezPorras/My-Flight-Academy) |
| **Rama activa** | `main` |
| **Fecha** | [![Último commit](https://img.shields.io/github/last-commit/OscarDavidRodriguezPorras/My-Flight-Academy?style=flat-square&label=&color=ffb020)](https://github.com/OscarDavidRodriguezPorras/My-Flight-Academy/commits/main) |
| **Historial** | [Ver todos los commits →](https://github.com/OscarDavidRodriguezPorras/My-Flight-Academy/commits/main) |

> Los badges se actualizan automáticamente con cada `git push`. No es necesario editar este archivo a mano para reflejar los cambios más recientes.

---

## ¿Qué es este proyecto?

**My Flight Academy** es una aplicación web estática de estudio de aviación, construida completamente en HTML, CSS y JavaScript vanilla — sin frameworks, sin dependencias, sin paso de compilación.

El objetivo es acompañar mi proceso de aprendizaje teórico-práctico en aviación, con herramientas interactivas y material organizado por fases progresivas. **Todo cambia con el tiempo**: las fases se expanden, las lecciones se refinan y las herramientas se mejoran a medida que avanzo en mi formación.

---

## Módulos disponibles

| Módulo | Descripción |
|---|---|
| 🏠 **Dashboard** | Resumen del progreso general |
| 📚 **Academia** | 8 fases de formación con lecciones y preguntas |
| 📝 **Exámenes** | Evaluaciones por fase con puntaje y registro |
| 📈 **Mi progreso** | Estadísticas de avance |
| 🗺️ **Mi ruta** | Hoja de ruta de aprendizaje personalizada |
| 🧭 **Navegación** | Calculadora de corrección por viento (WCA, GS, ETE) con rosa animada |
| 🌦️ **Meteorología** | Decodificador educativo de METAR |
| 📡 **Comunicaciones** | Fraseología ICAO y ejercicios de readback con voz |
| 🛫 **Aeropuertos** | Fichas de estudio por código ICAO |
| 🗂️ **Cartas** | Biblioteca de cartas aeronáuticas con visor |
| 📖 **Biblioteca** | Material de estudio personal (PDFs, imágenes, apuntes) |
| 📓 **Diario de vuelo** | Registro personal de vuelos y horas |
| ✅ **Simulador** | Checklists interactivos para C172 y A320neo en MSFS 2024 |
| 📘 **Diccionario** | Glosario aeronáutico English → Español |

---

## Estructura del proyecto

```
my-flight-academy/
│
├── index.html                        # Entrada de la aplicación
│
├── css/
│   ├── styles.css                    # Paleta, layout, componentes, responsive
│   ├── background.css                # Fondo y efectos visuales
│   ├── diario.css                    # Estilos del diario de vuelo
│   └── sim.css                       # Estilos del simulador (checklists)
│
├── js/
│   ├── app.js                        # Núcleo: datos, vistas, lógica, navegación
│   ├── diario.js                     # Módulo: diario de vuelo
│   ├── sim.js                        # Módulo: checklists interactivos
│   └── lessons/
│       ├── helpers.js                # Utilidades para lecciones (imágenes, figuras)
│       ├── loader.js                 # Carga dinámica de lecciones por fase
│       ├── fase1-fundamentos-de-aviacion/
│       ├── fase2-operaciones-basicas/
│       ├── fase3-navegacion/
│       └── ...                       # Fases en desarrollo
│
├── images/                           # Imágenes organizadas por fase y lección
│
├── .nojekyll                         # Evita el procesamiento Jekyll en GitHub Pages
└── README.md
```

---

## Ejecutar en local

### Con VS Code + Live Server *(recomendado)*

1. Abre la carpeta en VS Code (`Archivo → Abrir carpeta`).
2. Instala la extensión **Live Server** (Ritwick Dey).
3. Clic derecho sobre `index.html` → **Open with Live Server**.

### Con Python (sin extensiones)

```bash
# Desde la carpeta del proyecto
python -m http.server 8000
```

Abre `http://localhost:8000` en el navegador.

---

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Empuja el contenido a la rama `main`:

```bash
git init
git add .
git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/my-flight-academy.git
git push -u origin main
```

3. Ve a **Settings → Pages → Build and deployment**.  
   Elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guarda.

4. En uno o dos minutos la app estará en:  
   `https://TU_USUARIO.github.io/my-flight-academy/`

---

## Notas importantes

- **Datos locales:** el progreso, vuelos, fichas de aeropuertos, archivos y apuntes se guardan en el navegador (`localStorage` e `IndexedDB`), por dominio y dispositivo. No se sincronizan entre equipos ni se suben a GitHub.
- **Fuentes:** Manrope y JetBrains Mono se cargan desde Google Fonts. Sin conexión, el navegador usa fuentes del sistema.
- **Solo para estudio:** los datos aeronáuticos incluidos son de referencia educativa. Para cualquier operación real consulta siempre las publicaciones oficiales vigentes (AIP, NOTAM, publicaciones de la autoridad aeronáutica de tu país).
- **En desarrollo continuo:** las fases incompletas, los módulos marcados como "pendiente" y las herramientas en construcción son parte normal del proceso. Este repositorio refleja el estado actual de mi aprendizaje, no un producto terminado.

---

## Arquitectura y hoja de ruta técnica

> Esta sección documenta la evolución planificada hacia una plataforma comunitaria.
> La Fase 1 está completada. Las siguientes se implementarán de forma incremental.

![Fase 1 completada](https://img.shields.io/badge/Fase%201%20(BD%20%2B%20seguridad)-completada-3fbf7f?style=flat-square)
![Fase 2 pendiente](https://img.shields.io/badge/Fase%202%20(autenticaci%C3%B3n)-pendiente-8a9ab3?style=flat-square)
![Fase 3 pendiente](https://img.shields.io/badge/Fase%203%20(sincronizaci%C3%B3n)-pendiente-8a9ab3?style=flat-square)
![Fase 4 pendiente](https://img.shields.io/badge/Fase%204%20(conector%20MSFS24)-pendiente-8a9ab3?style=flat-square)

### Stack tecnológico

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | HTML + CSS + JavaScript vanilla | ✅ En producción |
| Backend | [Supabase](https://supabase.com) (PostgreSQL + Auth + RLS) | 🔄 Diseñado, pendiente de configurar |
| Base de datos | PostgreSQL con Row Level Security | 🔄 Migración lista en `supabase/migrations/` |
| Autenticación | Supabase Auth (email/contraseña, OAuth futuro) | 📋 Fase 2 |
| Conector MSFS 2024 | C# + SimConnect SDK (aplicación Windows) | 📋 Fase 4 |

### Fases de desarrollo backend

| Fase | Descripción | Estado |
|---|---|---|
| **1** | Inspección, migración SQL, RLS, documentación de arquitectura | ✅ Completada |
| **2** | Autenticación (registro, login, perfiles), onboarding | 📋 Pendiente |
| **3** | Sincronización del diario local con la nube | 📋 Pendiente |
| **4** | Conector Windows (SimConnect), vinculación de dispositivos | 📋 Pendiente |
| **5** | Rankings, estadísticas comunitarias, validación de vuelos | 📋 Pendiente |

### Documentación técnica

| Documento | Descripción |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Componentes, flujos de datos y decisiones técnicas |
| [`docs/database.md`](docs/database.md) | Tablas, relaciones, restricciones y consultas |
| [`docs/security.md`](docs/security.md) | Políticas RLS, amenazas y mitigaciones |
| [`docs/setup-supabase.md`](docs/setup-supabase.md) | Guía de configuración del proyecto Supabase |
| [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) | Migración inicial: tablas, índices, RLS |

---

<div align="center">
  <sub>Hecho con curiosidad y muchas horas de estudio ✈️ — Oscar David Rodriguez Porras</sub>
</div>
