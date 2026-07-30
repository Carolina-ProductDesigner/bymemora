/* ============================================================
   memora — motor del demo
   ------------------------------------------------------------
   Este archivo es genérico: sirve para cualquier template.
   Hace cuatro cosas:
     1. Pinta los datos de window.MEMORA_DATA en el HTML
     2. Corre la cuenta regresiva
     3. Revela secciones al hacer scroll
     4. Escucha cambios de tema del personalizador (postMessage)
   ============================================================ */

(function () {
  'use strict';

  var D = window.MEMORA_DATA || {};
  var root = document.documentElement;
  var embed = root.classList.contains('is-embed');

  /* ---------- utilidades ---------- */
  function get(path) {
    return path.split('.').reduce(function (o, k) {
      return (o && o[k] !== undefined) ? o[k] : '';
    }, D);
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  /* ---------- 1. datos ---------- */
  document.querySelectorAll('[data-f]').forEach(function (node) {
    node.textContent = get(node.getAttribute('data-f'));
  });

  // detalles (ceremonia / recepción)
  var cDet = document.getElementById('detalles');
  if (cDet && D.detalles) {
    D.detalles.forEach(function (d) {
      var box = el('div', 'detail');
      box.setAttribute('data-r', '');
      box.appendChild(el('h3', 'detail__title', d.titulo));
      box.appendChild(el('p', 'detail__hora', d.hora));
      box.appendChild(el('p', 'detail__lugar', d.lugar));
      box.appendChild(el('p', 'detail__dir', d.direccion));
      if (d.mapa) {
        var a = el('a', 'detail__map', 'ver ubicación');
        a.href = d.mapa;
        a.target = '_blank';
        a.rel = 'noopener';
        box.appendChild(a);
      }
      cDet.appendChild(box);
    });
  }

  // itinerario
  var cIti = document.getElementById('itinerario');
  if (cIti && D.itinerario) {
    D.itinerario.forEach(function (i) {
      var li = el('li');
      li.appendChild(el('span', 'timeline__hora', i.hora));
      li.appendChild(el('span', 'timeline__que', i.que));
      cIti.appendChild(li);
    });
  }

  // galería (placeholders)
  var cGal = document.getElementById('galeria');
  if (cGal && D.galeria) {
    for (var g = 0; g < D.galeria; g++) cGal.appendChild(el('div', 'gallery__item'));
  }

  // mesa de regalos
  var cReg = document.getElementById('regalos');
  if (cReg && D.regalos) {
    D.regalos.forEach(function (r) {
      var node = r.link ? el('a', 'gift') : el('div', 'gift');
      if (r.link) { node.href = r.link; node.target = '_blank'; node.rel = 'noopener'; }
      node.appendChild(el('span', 'gift__nombre', r.nombre));
      node.appendChild(el('span', 'gift__dato', r.dato));
      cReg.appendChild(node);
    });
  }

  // notas
  var cNot = document.getElementById('notas');
  if (cNot && D.notas) {
    D.notas.forEach(function (n) { cNot.appendChild(el('li', null, n)); });
  }

  // rsvp
  var rsvp = document.getElementById('rsvpBtn');
  if (rsvp && D.rsvp && D.rsvp.link) rsvp.href = D.rsvp.link;

  // título de la pestaña
  if (D.pareja) {
    document.title = D.pareja.uno + ' & ' + D.pareja.dos + ' — invitación';
  }

  /* ---------- 2. cuenta regresiva ---------- */
  var target = D.evento && D.evento.fecha ? new Date(D.evento.fecha).getTime() : 0;
  var out = {
    dias: document.getElementById('cDias'),
    horas: document.getElementById('cHoras'),
    min: document.getElementById('cMin'),
    seg: document.getElementById('cSeg')
  };

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tick() {
    if (!target || !out.dias) return;
    var diff = target - Date.now();
    if (diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    out.dias.textContent = Math.floor(s / 86400);
    out.horas.textContent = pad(Math.floor(s % 86400 / 3600));
    out.min.textContent = pad(Math.floor(s % 3600 / 60));
    out.seg.textContent = pad(s % 60);
  }
  tick();
  if (!embed) window.setInterval(tick, 1000);

  /* ---------- 3. reveal ---------- */
  if (!embed && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    document.querySelectorAll('[data-r]').forEach(function (n) { io.observe(n); });
  } else {
    document.querySelectorAll('[data-r]').forEach(function (n) { n.classList.add('on'); });
  }

  /* ---------- 4. sincronía de tema con el personalizador ----------
     El modal manda un mensaje cada que cambias paleta o fuentes.
     Así la vista previa cambia al instante, sin recargar el iframe. */
  window.addEventListener('message', function (e) {
    var m = e.data;
    if (!m || m.type !== 'memora:theme') return;
    if (m.palette) root.setAttribute('data-palette', m.palette);
    if (m.fonts) root.setAttribute('data-fonts', m.fonts);
  });

  // Avisamos al padre que el demo ya cargó (para quitar el fallback).
  if (window.parent && window.parent !== window) {
    try { window.parent.postMessage({ type: 'memora:demo-ready' }, '*'); } catch (err) {}
  }
})();
