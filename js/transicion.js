/* ============================================================
   memora — TRANSICIÓN ENTRE PÁGINAS
   ------------------------------------------------------------
   El contenido de la página nueva entra deslizándose desde
   arriba (baja a su lugar) con un fundido suave; al salir,
   sube y se desvanece. No hay cortina: se mueve el contenido.

   Se engancha sola a los links internos. No hay que marcar nada.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  if (root.classList.contains('reduced-motion')) return;

  var OUT = 500;   // ms de salida (coincide con pageOut en el CSS)

  /* ---------- marcar el "contenido" que se anima ----------
     Animamos <main> y <footer>. El <header> se queda quieto,
     así el menú no salta y solo se desliza el contenido. */
  function shellEls() {
    return document.querySelectorAll('main, .footer');
  }
  function marcarShell() {
    shellEls().forEach(function (el) { el.classList.add('page-shell'); });
  }
  if (document.body) marcarShell();
  else document.addEventListener('DOMContentLoaded', marcarShell);

  /* ============================================================
     ENTRADA — al llegar vía la transición, el contenido baja
     ============================================================ */
  function entrar() {
    var vino = false;
    try { vino = sessionStorage.getItem('memora:transicion') === '1'; } catch (e) {}
    if (!vino) return;
    try { sessionStorage.removeItem('memora:transicion'); } catch (e) {}

    root.classList.add('page-entering');
    shellEls().forEach(function (el) {
      el.addEventListener('animationend', function () {
        root.classList.remove('page-entering');
      }, { once: true });
    });
  }
  if (document.body) entrar();
  else document.addEventListener('DOMContentLoaded', entrar);

  /* ============================================================
     SALIDA — al hacer click en un link interno, sube y navega
     ============================================================ */
  function esInterno(a) {
    if (!a) return false;
    if (a.target === '_blank' || a.hasAttribute('download')) return false;
    if (a.dataset.noTransition !== undefined) return false;

    var href = a.getAttribute('href') || '';
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (/^(mailto:|tel:)/i.test(href)) return false;
    if (a.hostname && a.hostname !== window.location.hostname) return false;
    if (/\.(pdf|zip|jpe?g|png|gif|mp4|webp|svg)$/i.test(href)) return false;
    return true;
  }

  function salir(url) {
    try { sessionStorage.setItem('memora:transicion', '1'); } catch (e) {}
    root.classList.add('page-leaving');
    window.setTimeout(function () { window.location.href = url; }, OUT - 20);
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var a = e.target.closest('a');
    if (!a || !esInterno(a)) return;

    // misma página (solo cambia el #ancla) → scroll normal, sin transición
    var destino = new URL(a.href, window.location.href);
    var actual = window.location.href.split('#')[0];
    if (destino.href.split('#')[0] === actual) return;

    e.preventDefault();
    salir(a.href);
  });

  /* Si vuelven con "atrás" (bfcache), limpiamos cualquier estado a medias. */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      root.classList.remove('page-leaving', 'page-entering');
    }
  });
})();
