# AGENTS.md — contexto para agentes de IA

Este archivo explica el proyecto a cualquier agente de IA (Claude, Codex, Copilot, Cursor…) que trabaje en este repositorio. Léelo antes de hacer cambios. Las personas tienen la guía de uso en `LEEME.md`.

## Qué es

Web oficial de **Coolío** ("Your tribe, our tribe"). Coolío es un evento de música afrobeats **de tarde** que se celebra cada cierto tiempo en distintas discotecas de **Mataró y Barcelona**. Géneros: afrobeat, amapiano, afrohouse, dancehall, hip-hop, R&B y funky. Los valores del evento: multicultural, libre de prejuicios y discriminaciones; la pista y el set de DJ son "el corazón del caos"; la cultura urbana se encuentra con la tradición africana.

- **Web publicada:** https://coolioevents303-spec.github.io/coolio/
- **Repositorio:** `coolioevents303-spec/coolio` (público)
- **Instagram:** https://www.instagram.com/coolio.tribe/
- **Idioma:** todo el contenido y los comentarios del código están en **español** (de España). Mantenlo así.

## Arquitectura

Web **estática**, sin framework, sin dependencias y **sin paso de compilación**: HTML + CSS + JavaScript vanilla (ES5, compatible con navegadores antiguos). No añadas npm, bundlers ni frameworks salvo que el equipo lo pida explícitamente.

```
index.html            estructura y textos fijos (portada, géneros, galería, "Nosotros")
styles.css            todo el diseño; variables de color y fuentes en :root
js/config.js          ÚNICO archivo de configuración: enlaces CSV de Google Sheets, Instagram, email
js/app.js             lee los CSV y pinta el calendario y las fichas del equipo
js/datos-ejemplo.js   datos de respaldo cuando config.js no tiene enlaces
img/                  logos (SVG blanco), favicon, portada y fotos de la galería
img/equipo/           fotos de los integrantes (se referencian desde la hoja)
plantillas/*.csv      plantillas para crear las pestañas de Google Sheets
LEEME.md              guía para el equipo (no técnica)
```

### Contenido dinámico: Google Sheets

Los **eventos** y el **equipo** NO están en el código. Vienen de una hoja de Google Sheets publicada como CSV (*Archivo → Compartir → Publicar en la web*). Los enlaces están en `js/config.js` (`eventosCSV` y `equipoCSV`). El equipo edita la hoja y la web se actualiza sola; no hace falta tocar el repositorio para añadir fechas o integrantes.

**Pestaña Eventos**, columnas:

| columna | formato | notas |
|---|---|---|
| `fecha` | `DD/MM/AAAA` (también acepta `AAAA-MM-DD`) | las fechas pasadas se ocultan automáticamente |
| `hora_inicio`, `hora_fin` | `18:00` | |
| `discoteca` | texto | |
| `ciudad` | Mataró / Barcelona | |
| `djs` | texto, separados por comas | |
| `entradas` | URL `https://…` | vacío → botón desactivado "Muy pronto" |
| `nota` | texto corto opcional | se muestra como etiqueta verde (p. ej. "Sold out") |

**Pestaña Equipo**, columnas: `nombre`, `rol`, `bio`, `instagram` (usuario, @usuario o cualquier URL del perfil, incluidas las de "compartir" con `?utm_source=…`; `usuarioInstagram()` extrae el usuario y la ficha muestra solo un icono de Instagram con `aria-label`), `foto` (nombre de archivo dentro de `img/equipo/`, o URL `https://` directa a una imagen; vacío o error → isotipo de Coolío). `nombreFoto()` normaliza lo escrito en la hoja: minúsculas, sin tildes, espacios → `-` y añade `.jpg` si no hay extensión (`DJola` → `img/equipo/djola.jpg`). Por eso los archivos de `img/equipo/` se guardan siempre en minúsculas, sin tildes ni espacios.

Detalles de `js/app.js` que hay que respetar:
- Las cabeceras se normalizan (minúsculas, sin tildes, espacios → `_`), así que "Hora inicio" equivale a `hora_inicio`. Si añades columnas, documéntalas aquí, en `LEEME.md` y en `plantillas/`.
- El lector de CSV propio soporta comillas, comas y saltos de línea dentro de celdas. No lo sustituyas por un `split(',')`.
- Todo el contenido de la hoja es **entrada no confiable**: se inserta con `textContent`/`createElement`, nunca con `innerHTML`. Las URLs se validan con `urlSegura()` (solo `http(s)`). Mantén estas protecciones.
- Google tarda ~5 minutos en reflejar cambios en el CSV publicado; la petición añade `_=<timestamp>` para evitar la caché del navegador.

## Diseño (propuesta "A · Noche Verde")

- **Color oficial:** verde `#1E622C` (el de los logos). Úsalo para superficies, botones y la cinta de géneros.
- Fondo oscuro `#0A0F0B` / `#111813`; texto `#F2F5F1`; texto secundario `#A9B5AC`.
- Sobre fondo oscuro, el verde oficial no tiene contraste suficiente como color de texto: para texto verde usa la menta `#8FE3A8`.
- **Tipografías** (Google Fonts): `Anton` para titulares en mayúsculas, `Quicksand` para el cuerpo (es la del dossier del evento).
- Logos disponibles: `img/logo-blanco.svg` (imagotipo) e `img/isotipo-blanco.svg` (el djembé/tótem). Los originales en verde, negro y blanco (PNG y SVG) no están en este repositorio; pídelos al equipo si los necesitas.
- Accesibilidad: contraste mínimo 4.5:1, `alt` descriptivo en las fotos, objetivos táctiles de al menos 44 px, respeta `prefers-reduced-motion` (la cinta de géneros se detiene).
- Diseño adaptable: tiene que funcionar a 375 px de ancho sin scroll horizontal. Hay un menú desplegable por debajo de 760 px.

## Imágenes

- Optimiza siempre antes de subir: JPG, ~1400 px de ancho máximo para la portada, ~1000 px para galería y equipo, idealmente < 500 KB. Los originales de cámara (20–30 MB) nunca se suben al repositorio.
- Ejemplo con ffmpeg: `ffmpeg -i original.jpg -vf scale=1400:-1 -q:v 7 img/portada.jpg`
- Para sustituir una foto de la galería sin tocar código, súbela con el mismo nombre de archivo.
- La portada (`img/portada.jpg`) es vertical; su encuadre en escritorio se ajusta con `object-position` en `.hero__foto` (`styles.css`).
- Las fotos muestran al público del evento: si alguien pide que se retire una foto, hay que retirarla.

## Publicación

- **GitHub Pages** publica la rama `main` desde la raíz (`/`). No hay workflow ni build: cada push a `main` se publica en 1–2 minutos.
- La web vive en un **subdirectorio** (`/coolio/`). Usa siempre **rutas relativas** (`img/…`, `js/…`), nunca rutas que empiecen por `/`.
- Si algún día se conecta un dominio propio, se añade un archivo `CNAME` en la raíz y se configura en *Settings → Pages*.

## Probar en local

`fetch` no funciona abriendo `index.html` con `file://`; sirve la carpeta:

```bash
python3 -m http.server 8000
```

y abre http://localhost:8000. Comprueba escritorio y móvil (375 px).

## Seguridad y privacidad

- El repositorio es **público** y su historial también: no subas nunca contraseñas, claves de API, tokens, datos personales, teléfonos ni información interna (cachés, contratos…).
- Los enlaces CSV de `config.js` son públicos por diseño (solo lectura) y no son secretos.
- Todo lo que se escribe en las pestañas Eventos y Equipo es público. La información privada debe ir en otra hoja.

## Convenciones para cambios

- Cambios pequeños y enfocados; no reescribas el diseño sin que el equipo lo pida.
- Mensajes de commit en español, en imperativo o descriptivos (p. ej. "Añadir Instagram @coolio.tribe").
- Si cambias cómo se usa la hoja o cómo se publica, actualiza también `LEEME.md`.
