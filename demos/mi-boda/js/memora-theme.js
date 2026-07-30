/* ============================================================
   memora — ADAPTADOR para el template "mi-boda"
   ------------------------------------------------------------
   Conecta este template al personalizador del catálogo memora.
   · Lee ?paleta= y ?fuentes= de la URL (antes de pintar)
   · Escucha cambios en vivo del modal (postMessage)
   · Mapea los 4 tokens de memora → las 8 variables del template

   Este template usa 8 roles de color y 1 familia tipográfica.
   Memora maneja 4 roles + 2 fuentes (display/body). Aquí abajo,
   en MAPEO, decides cómo se traduce uno al otro. Es lo único
   que ajustarías por template.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- 1. Definición de temas (igual que css/themes.css) ----------
     Los repetimos aquí en JS porque este template está en otra carpeta y
     conviene que sea autónomo. Si cambias una paleta en themes.css,
     cámbiala también aquí. */
  var PALETAS = {
    hueso:     { bg:'#F6F3EC', line:'#DDD5C2', accent:'#B08968', ink:'#2B2A26' },
    tinta:     { bg:'#16150F', line:'#3A382C', accent:'#C9A227', ink:'#F3F0E6' },
    nieve:     { bg:'#FFFFFF', line:'#EEEEEE', accent:'#787878', ink:'#000000' },
    terracota: { bg:'#F7EDE8', line:'#E7CFC5', accent:'#C0675A', ink:'#3A2621' }
  };

  var FUENTES = {
    clasica:   { display:'Jomolhari',          body:'Poppins',       url:'Jomolhari&family=Poppins:wght@300;600;700' },
    editorial: { display:'Playfair Display',   body:'Karla',         url:'Playfair+Display:wght@500;700&family=Karla:wght@300;600' },
    romantica: { display:'Cormorant Garamond', body:'DM Sans',       url:'Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;500' },
    moderna:   { display:'Instrument Serif',   body:'Space Grotesk', url:'Instrument+Serif&family=Space+Grotesk:wght@300;500' }
  };

  /* ---------- 2. MAPEO: 4 tokens memora → 8 variables del template ----------
     Aquí es donde "traduces". Si un rol del template no tiene equivalente
     directo, lo derivas mezclando (mix) con transparencia sobre el fondo. */
  function aplicaPaleta(id) {
    var p = PALETAS[id] || PALETAS.hueso;
    var s = root.style;

    s.setProperty('--bg',   p.bg);
    s.setProperty('--ink',  p.ink);
    // "olive" es el color de acento del template (eyebrows, líneas, hovers)
    s.setProperty('--olive',      p.accent);
    s.setProperty('--olive-mid',  mix(p.accent, p.bg, 0.35)); // acento más suave
    s.setProperty('--olive-mist', mix(p.accent, p.bg, 0.82)); // fondo teñido claro
    s.setProperty('--olive-pale', mix(p.accent, p.bg, 0.92)); // casi como el fondo
    s.setProperty('--gray',       p.line);                    // bordes y cards
    s.setProperty('--warm',       mix(p.ink, p.bg, 0.45));    // texto secundario
  }

  function aplicaFuentes(id) {
    var f = FUENTES[id] || FUENTES.clasica;

    // Carga las familias necesarias
    var link = document.getElementById('memora-fonts');
    if (!link) {
      link = document.createElement('link');
      link.id = 'memora-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = 'https://fonts.googleapis.com/css2?family=' + f.url + '&display=swap';

    // El template usa --font en todo; añadimos --font-display para titulares.
    root.style.setProperty('--font', "'" + f.body + "', system-ui, sans-serif");
    root.style.setProperty('--font-display', "'" + f.display + "', Georgia, serif");
  }

  /* Mezcla dos hex. t=0 → a, t=1 → b. Sirve para derivar tonos intermedios. */
  function mix(a, b, t) {
    a = hex(a); b = hex(b);
    var r = Math.round(a[0] + (b[0] - a[0]) * t);
    var g = Math.round(a[1] + (b[1] - a[1]) * t);
    var bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }
  function hex(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }

  /* ---------- 3. Arranque desde la URL ---------- */
  var q = new URLSearchParams(window.location.search);
  var pal = q.get('paleta') || 'hueso';
  var fon = q.get('fuentes') || 'clasica';
  if (q.get('embed') === '1') root.classList.add('memora-embed');

  // Solo tomamos el control si venimos del catálogo memora (hay parámetros).
  // Si abres el template solito, sigue usando su propio config.js.
  var activo = q.has('paleta') || q.has('fuentes') || q.get('embed') === '1';

  function aplicaTodo() {
    if (!activo) return;
    aplicaPaleta(pal);
    aplicaFuentes(fon);
  }

  aplicaTodo();
  // El config.js del template aplica sus colores en DOMContentLoaded;
  // volvemos a aplicar los nuestros después para que ganen los de memora.
  document.addEventListener('DOMContentLoaded', aplicaTodo);
  window.addEventListener('load', aplicaTodo);

  /* ---------- 4. Cambios en vivo desde el modal ---------- */
  window.addEventListener('message', function (e) {
    var m = e.data;
    if (!m || m.type !== 'memora:theme') return;
    activo = true;
    if (m.palette) { pal = m.palette; aplicaPaleta(m.palette); }
    if (m.fonts) { fon = m.fonts; aplicaFuentes(m.fonts); }
  });

  /* ---------- 5. Aviso al modal de que ya cargó ---------- */
  function ready() {
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage({ type: 'memora:demo-ready' }, '*'); } catch (err) {}
    }
  }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
})();
