# Web de Coolío: cómo funciona

Para añadir una fecha nueva, la escribís en una hoja de Google Sheets. La web la lee sola, ordena las fechas y quita las que ya han pasado. No hace falta tocar código.

## 1. Crear la hoja (una sola vez)

1. Entra en [sheets.new](https://sheets.new) y llámala **Coolío web**.
2. Llama **Eventos** a la primera pestaña. Copia en la fila 1 estas cabeceras, una por columna:

   | fecha | hora_inicio | hora_fin | discoteca | ciudad | djs | entradas | nota |
   |---|---|---|---|---|---|---|---|

   Otra forma: *Archivo → Importar → Subir* `plantillas/eventos.csv` y elegir "Reemplazar hoja actual".
3. Crea una segunda pestaña llamada **Equipo**, con estas cabeceras (o importa `plantillas/equipo.csv`):

   | nombre | rol | bio | instagram | foto |
   |---|---|---|---|---|

## 2. Publicar la hoja como CSV (una sola vez)

1. En la hoja: *Archivo → Compartir → Publicar en la web*.
2. En el primer desplegable elige la pestaña **Eventos**. En el segundo elige **Valores separados por comas (.csv)**. Pulsa **Publicar**.
3. Copia el enlace y pégalo en `js/config.js`, dentro de `eventosCSV: "…"`.
4. Repite los pasos con la pestaña **Equipo** y pega su enlace en `equipoCSV: "…"`.
5. En el mismo `config.js` pon vuestro Instagram y vuestro email.

> Publicar solo deja leer los datos de esa pestaña. Nadie puede editar la hoja sin vuestro permiso.

## 3. Uso diario

**Eventos**, una fila por fecha:
- `fecha`: 13/12/2026, en formato día/mes/año.
- `hora_inicio` y `hora_fin`: 18:00 y 23:00.
- `discoteca` y `ciudad`: Mataró o Barcelona.
- `djs`: los nombres separados por comas.
- `entradas`: el enlace completo, empezando por https://. Si lo dejáis vacío, el botón pone "Muy pronto".
- `nota` (opcional): una etiqueta verde junto al nombre de la sala, por ejemplo "Especial Navidad" o "Sold out".

Las fechas pasadas desaparecen solas. No hace falta borrarlas, así os queda un histórico.

**Equipo**, una fila por persona y en el orden en que queréis que salgan:
- `instagram`: solo el usuario, sin @.
- `foto`: la foto debe ser cuadrada o vertical. Hay dos maneras:
  - Guardarla en la carpeta `img/equipo/` y escribir el nombre del archivo, por ejemplo `jerreh.jpg`.
  - Escribir un enlace directo a la imagen que empiece por https://.

  Si la casilla está vacía, sale el isotipo de Coolío.

Google tarda **unos 5 minutos** en actualizar el CSV publicado después de cada cambio.

## 4. Dónde está publicada

La web está publicada con **GitHub Pages** desde este repositorio:
**https://coolioevents303-spec.github.io/coolio/**

Cada cambio que se sube a la rama `main` se publica solo en 1 o 2 minutos. Podéis ver el progreso en la pestaña **Actions** del repositorio.

Los eventos y el equipo vienen de la hoja, así que para cambiarlos no hay que tocar GitHub. Solo hay que tocar el repositorio para cambiar textos, fotos de la galería o el diseño:
- **Editar un archivo:** ábrelo en GitHub, pulsa el lápiz ✏️ y luego **Commit changes**.
- **Subir o cambiar fotos:** entra en la carpeta, **Add file → Upload files**. Si subís una foto con el mismo nombre que otra, la sustituye.

Si algún día queréis un dominio propio (por ejemplo coolio.es), se configura en *Settings → Pages → Custom domain*.

## Archivos

```
web/
├── index.html         estructura y textos fijos (Nosotros, portada…)
├── styles.css         diseño
├── js/config.js       ← enlaces de la hoja, Instagram, email
├── js/app.js          lee la hoja y pinta eventos y equipo
├── js/datos-ejemplo.js datos que se ven mientras config.js esté vacío
├── img/               logos, portada y fotos de la galería
├── img/equipo/        fotos de los integrantes
├── plantillas/        CSVs para importar en Google Sheets
└── AGENTS.md          contexto del proyecto para asistentes de IA (CLAUDE.md apunta a él)
```
