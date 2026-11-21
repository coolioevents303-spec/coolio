// Coolío · carga eventos y equipo desde Google Sheets (CSV publicado)
(function () {
  'use strict';

  var CONFIG = window.COOLIO_CONFIG || {};
  var EJEMPLO = window.COOLIO_EJEMPLO || { eventos: '', equipo: '' };

  // ---------- Utilidades ----------

  // Lector de CSV que respeta comillas, comas y saltos de línea dentro de celdas.
  function leerCSV(texto) {
    var filas = [], fila = [], celda = '', comillas = false;
    texto = String(texto).replace(/^﻿/, '');
    for (var i = 0; i < texto.length; i++) {
      var c = texto[i];
      if (comillas) {
        if (c === '"') {
          if (texto[i + 1] === '"') { celda += '"'; i++; } else { comillas = false; }
        } else { celda += c; }
      } else if (c === '"') { comillas = true; }
      else if (c === ',') { fila.push(celda); celda = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && texto[i + 1] === '\n') i++;
        fila.push(celda); filas.push(fila); fila = []; celda = '';
      } else { celda += c; }
    }
    if (celda !== '' || fila.length) { fila.push(celda); filas.push(fila); }
    if (!filas.length) return [];

    var cabecera = filas[0].map(normalizarClave);
    return filas.slice(1)
      .filter(function (f) { return f.some(function (v) { return v.trim() !== ''; }); })
      .map(function (f) {
        var obj = {};
        cabecera.forEach(function (clave, j) { obj[clave] = (f[j] || '').trim(); });
        return obj;
      });
  }

  // "Hora inicio" -> "hora_inicio", "Discoteca " -> "discoteca"
  function normalizarClave(s) {
    return s.trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  // Acepta 13/12/2026, 13-12-2026, 2026-12-13
  function leerFecha(s) {
    if (!s) return null;
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
    if (m) {
      var anio = +m[3] < 100 ? 2000 + +m[3] : +m[3];
      return new Date(anio, +m[2] - 1, +m[1]);
    }
    return null;
  }

  function el(etiqueta, clase, texto) {
    var n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function urlSegura(u) {
    return /^https?:\/\//i.test(u) ? u : null;
  }

  function cargar(url, respaldo) {
    if (!url) return Promise.resolve(leerCSV(respaldo));
    // El parámetro evita que el navegador guarde una versión vieja de la hoja
    var sep = url.indexOf('?') === -1 ? '?' : '&';
    return fetch(url + sep + '_=' + Date.now())
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(leerCSV);
  }

  var fmtMes = new Intl.DateTimeFormat('es-ES', { month: 'short' });
  var fmtSemana = new Intl.DateTimeFormat('es-ES', { weekday: 'long' });
  var fmtLargo = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  function mayus1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---------- Eventos ----------

  function pintarEventos(filas) {
    var lista = document.getElementById('lista-eventos');
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);

    var eventos = filas
      .map(function (f) { f._fecha = leerFecha(f.fecha); return f; })
      .filter(function (f) { return f._fecha && f._fecha >= hoy; })
      .sort(function (a, b) { return a._fecha - b._fecha; });

    lista.textContent = '';

    if (!eventos.length) {
      lista.appendChild(el('p', 'estado', 'Estamos preparando la próxima edición. Síguenos en Instagram para enterarte de la fecha.'));
      return;
    }

    eventos.forEach(function (ev) {
      var art = el('article', 'evento');

      var fecha = el('div', 'evento__fecha');
      fecha.appendChild(el('span', 'evento__dia', String(ev._fecha.getDate()).padStart(2, '0')));
      var mes = el('span', 'evento__mes', fmtMes.format(ev._fecha).replace('.', ''));
      mes.appendChild(el('span', 'evento__semana', mayus1(fmtSemana.format(ev._fecha))));
      fecha.appendChild(mes);

      var info = el('div', 'evento__info');
      var sala = el('h3', 'evento__sala', ev.discoteca || 'Sala por anunciar');
      if (ev.nota) sala.appendChild(el('span', 'evento__etiqueta', ev.nota));
      info.appendChild(sala);

      var partes = [];
      if (ev.ciudad) partes.push(ev.ciudad);
      if (ev.hora_inicio) partes.push(ev.hora_inicio + (ev.hora_fin ? ' – ' + ev.hora_fin : ''));
      if (ev.djs) partes.push('DJs: ' + ev.djs);
      info.appendChild(el('p', 'evento__detalle', partes.join(' · ')));

      var url = urlSegura(ev.entradas);
      var accion;
      if (url) {
        accion = el('a', 'boton', 'Entradas');
        accion.href = url; accion.target = '_blank'; accion.rel = 'noopener';
      } else {
        accion = el('span', 'boton boton--apagado', 'Muy pronto');
      }

      art.appendChild(fecha); art.appendChild(info); art.appendChild(accion);
      lista.appendChild(art);
    });

    // Chip de la portada con el próximo evento
    var p = eventos[0];
    var chip = document.getElementById('proximo-chip');
    chip.textContent = 'Próxima: ' + fmtLargo.format(p._fecha) +
      (p.discoteca ? ' · ' + p.discoteca : '') + (p.ciudad ? ', ' + p.ciudad : '');
    chip.hidden = false;
  }

  // ---------- Equipo ----------

  // "DJola" -> "djola.jpg", "Foto Omaima.JPG" -> "foto-omaima.jpg"
  // Los archivos de img/equipo/ se guardan siempre en minúsculas y sin tildes.
  function nombreFoto(s) {
    var n = s.trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9.\-_]/g, '');
    if (!/\.(jpe?g|png|webp)$/.test(n)) n += '.jpg';
    return n;
  }

  function pintarEquipo(filas) {
    var lista = document.getElementById('lista-equipo');
    lista.textContent = '';

    filas.filter(function (f) { return f.nombre; }).forEach(function (m) {
      var art = el('article', 'miembro');

      var marco = el('div', 'miembro__foto');
      var img = document.createElement('img');
      var foto = m.foto && (urlSegura(m.foto) || 'img/equipo/' + nombreFoto(m.foto));
      if (foto) {
        img.src = foto; img.alt = 'Foto de ' + m.nombre; img.loading = 'lazy';
        img.onerror = function () { img.src = 'img/isotipo-blanco.svg'; img.alt = ''; img.className = 'miembro__isotipo'; };
      } else {
        img.src = 'img/isotipo-blanco.svg'; img.alt = ''; img.className = 'miembro__isotipo';
      }
      marco.appendChild(img);

      var cuerpo = el('div', 'miembro__cuerpo');
      if (m.rol) cuerpo.appendChild(el('p', 'miembro__rol', m.rol));
      cuerpo.appendChild(el('h3', 'miembro__nombre', m.nombre));
      if (m.bio) cuerpo.appendChild(el('p', 'miembro__bio', m.bio));
      if (m.instagram) {
        var usuario = m.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[@\/]/g, '');
        var a = el('a', 'miembro__ig', '@' + usuario);
        a.href = 'https://www.instagram.com/' + encodeURIComponent(usuario) + '/';
        a.target = '_blank'; a.rel = 'noopener';
        cuerpo.appendChild(a);
      }

      art.appendChild(marco); art.appendChild(cuerpo);
      lista.appendChild(art);
    });
  }

  // ---------- Enlaces, menú ----------

  document.querySelectorAll('[data-enlace="instagram"]').forEach(function (a) {
    if (urlSegura(CONFIG.instagram)) { a.href = CONFIG.instagram; a.target = '_blank'; a.rel = 'noopener'; }
  });
  document.querySelectorAll('[data-enlace="email"]').forEach(function (a) {
    if (CONFIG.email) { a.href = 'mailto:' + CONFIG.email; a.textContent = CONFIG.email; }
    else { a.hidden = true; }
  });

  var botonMenu = document.querySelector('.nav__menu');
  var enlaces = document.getElementById('nav-enlaces');
  botonMenu.addEventListener('click', function () {
    var abierto = enlaces.classList.toggle('abierto');
    botonMenu.setAttribute('aria-expanded', String(abierto));
  });
  enlaces.addEventListener('click', function (e) {
    if (e.target.closest('a')) { enlaces.classList.remove('abierto'); botonMenu.setAttribute('aria-expanded', 'false'); }
  });

  // ---------- Arranque ----------

  cargar(CONFIG.eventosCSV, EJEMPLO.eventos)
    .then(pintarEventos)
    .catch(function () {
      document.getElementById('lista-eventos').innerHTML =
        '<p class="estado">No hemos podido cargar el calendario ahora mismo. Míralo en nuestro Instagram.</p>';
    });

  cargar(CONFIG.equipoCSV, EJEMPLO.equipo)
    .then(pintarEquipo)
    .catch(function () { /* si falla, la sección se queda solo con el texto */ });
})();
