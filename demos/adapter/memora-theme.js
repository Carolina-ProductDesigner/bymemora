/* ============================================================
   memora — ADAPTADOR DE TEMA
   ------------------------------------------------------------
   Pega este archivo en cualquier template externo (Vercel, Netlify,
   lo que sea) y quedará conectado al personalizador del catálogo.

   Son 3 cosas:
     1. Lee la paleta y las fuentes de la URL, antes de pintar
     2. Escucha los cambios que manda el modal (postMessage)
     3. Avisa al modal que ya cargó

   Cómo instalarlo:
     · Vite / React / HTML plano → copia este archivo a /public
       y agrégalo en el <head> de index.html:
         <script src="/memora-theme.js"></script>
     · Next.js → ponlo en /public y cárgalo en app/layout.tsx con
         <Script src="/memora-theme.js" strategy="beforeInteractive" />

   IMPORTANTE: va en el <head> y ANTES de tu CSS, para que no
   haya parpadeo de color al cargar.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var params = new URLSearchParams(window.location.search);

  /* --- 1. Tema inicial desde la URL --- */
  root.setAttribute('data-palette', params.get('paleta') || 'hueso');
  root.setAttribute('data-fonts', params.get('fuentes') || 'clasica');

  /* Modo miniatura: el template se está viendo dentro del modal.
     Úsalo para saltarte pantallas de entrada, loaders o animaciones
     largas que no se aprecian en una vista previa pequeña. */
  if (params.get('embed') === '1') root.classList.add('memora-embed');

  /* --- 2. Cambios en vivo desde el personalizador --- */
  window.addEventListener('message', function (e) {
    var m = e.data;
    if (!m || m.type !== 'memora:theme') return;
    if (m.palette) root.setAttribute('data-palette', m.palette);
    if (m.fonts) root.setAttribute('data-fonts', m.fonts);
  });

  /* --- 3. Aviso de que ya cargó --- */
  function ready() {
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage({ type: 'memora:demo-ready' }, '*'); } catch (err) {}
    }
  }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
})();
