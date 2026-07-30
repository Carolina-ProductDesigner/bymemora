/* ============================================================
   memora — CURSOR PERSONALIZADO
   ------------------------------------------------------------
   Un circulito negro que sigue al mouse. Crece a un anillo
   sobre elementos clickeables y se vuelve blanco sobre las
   zonas oscuras (hero, footer). Solo en equipos con mouse.
   ============================================================ */

(function () {
  'use strict';

  var finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  if (!finePointer.matches) return;

  var root = document.documentElement;
  root.classList.add('has-cursor');

  var dot = document.createElement('div');
  dot.className = 'cursor-dot is-hidden';
  function mount() { document.body.appendChild(dot); }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  var x = window.innerWidth / 2, y = window.innerHeight / 2;
  var cx = x, cy = y;
  var raf;

  // seguimiento suave (el punto persigue al mouse con un pequeño retraso)
  function loop() {
    cx += (x - cx) * 0.28;
    cy += (y - cy) * 0.28;
    dot.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) translate(-50%,-50%)';
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  document.addEventListener('mousemove', function (e) {
    x = e.clientX; y = e.clientY;
    dot.classList.remove('is-hidden');
  });

  document.addEventListener('mouseleave', function () { dot.classList.add('is-hidden'); });
  document.addEventListener('mouseenter', function () { dot.classList.remove('is-hidden'); });

  // crece a anillo sobre lo clickeable
  var HOVER = 'a, button, .steprow, input, textarea, select, [role="button"], label';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(HOVER)) dot.classList.add('is-hover');
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(HOVER) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOVER))) {
      dot.classList.remove('is-hover');
    }
  });

  // se vuelve blanco sobre zonas oscuras (hero de video y footer)
  document.addEventListener('mousemove', function (e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    var enHero = el.closest('.hero--video') && !el.closest('.page-layer');
    var enFooter = el.closest('.footer');
    dot.classList.toggle('is-light', !!(enHero || enFooter));
  });
})();
