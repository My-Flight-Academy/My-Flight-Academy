# My Flight Academy

Plataforma personal de estudio de aviación. Aplicación web estática (HTML, CSS y JavaScript), sin dependencias ni paso de compilación.

## Estructura

```
my-flight-academy/
├── index.html        Estructura de la página
├── css/styles.css    Estilos (paleta, layout, responsive)
├── js/app.js         Datos, vistas y lógica de cada módulo
├── .nojekyll         Evita el procesamiento de Jekyll en GitHub Pages
└── README.md
```

## Módulos incluidos

Dashboard, Academia (8 fases), Lecciones con preguntas, Exámenes, Mi progreso, Navegación (calculadora de viento), Meteorología (decodificador METAR), Comunicaciones (fraseología y readback), Aeropuertos, Cartas (visor), Biblioteca, Diario de vuelo, Simulador (checklists), Diccionario y Mi ruta.

## Probar en local con Visual Studio Code

1. Abre la carpeta en VS Code (Archivo > Abrir carpeta).
2. Instala la extensión **Live Server** (Ritwick Dey).
3. Clic derecho sobre `index.html` > **Open with Live Server**.

Alternativa sin extensión, desde la terminal en la carpeta del proyecto:

```
python -m http.server 8000
```

y abre http://localhost:8000.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `my-flight-academy`).
2. Sube el contenido de esta carpeta a la rama `main`. Con Git:
   ```
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/my-flight-academy.git
   git push -u origin main
   ```
3. En GitHub: **Settings > Pages > Build and deployment**. En *Source* elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
4. Tras uno o dos minutos la página estará en `https://TU_USUARIO.github.io/my-flight-academy/`.

## Notas

- Tu progreso, vuelos, fichas de aeropuertos, archivos y apuntes se guardan en el navegador (localStorage e IndexedDB), por dominio y dispositivo. No se sincronizan entre equipos ni se suben a GitHub.
- Las fuentes (Manrope y JetBrains Mono) se cargan desde Google Fonts; sin conexión se usan fuentes del sistema.
- Es material de estudio. Los datos aeronáuticos reales deben tomarse de las publicaciones oficiales vigentes (AIP) y no sirven para navegar.
