/* ============================================================
   memora — interacciones y efectos de scroll
   1. Menú mobile
   2. Acordeón de planes (mobile)
   3. Tabs de "¿cómo funciona?"
   4. Reveal fade in / fade out con scroll
   5. Stack de cards grises (sticky + escala + profundidad)
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqDesktop = window.matchMedia('(min-width: 1000px)');

  /* ---------------------------------------------------------
     0. Header transparente sobre el hero de video
     --------------------------------------------------------- */
  (function () {
    var header = document.querySelector('.header');
    var hero = document.querySelector('.hero--video');
    if (!header || !hero) return;

    function upd() {
      // el header va transparente mientras el hero cubra su zona
      var limite = hero.offsetHeight - header.offsetHeight - 10;
      header.classList.toggle('is-over-hero', window.scrollY < limite);
    }
    upd();
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
  })();

  /* ---------------------------------------------------------
     1. Menú mobile
     --------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'abrir menú' : 'cerrar menú');
      navMobile.classList.toggle('is-open', !open);
    });

    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'abrir menú');
        navMobile.classList.remove('is-open');
      });
    });
  }

  /* ---------------------------------------------------------
     4. Reveal fade in / fade out
     --------------------------------------------------------- */
  var revealTargets = document.querySelectorAll('[data-reveal]');

  function initReveal() {
    if ('IntersectionObserver' in window && !reduced.matches) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('is-out');
            entry.target.classList.add('is-in');
          } else {
            entry.target.classList.add('is-out');
            entry.target.classList.remove('is-in');
          }
        });
      }, {
        root: null,
        rootMargin: '-6% 0px -12% 0px',
        threshold: 0
      });

      revealTargets.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealTargets.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  // Si hay cortinilla, el contenido se revela cuando ésta se disuelve.
  if (root.classList.contains('intro-active')) {
    document.addEventListener('memora:intro-done', initReveal, { once: true });
  } else {
    initReveal();
  }

  /* ---------------------------------------------------------
     5. Stack de cards grises
     --------------------------------------------------------- */
  var plans = Array.prototype.slice.call(document.querySelectorAll('.plan'));
  var heights = [];
  var ticking = false;

  function cssVar(name, fallback) {
    var v = parseFloat(getComputedStyle(root).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }

  function layoutStack() {
    if (!plans.length || reduced.matches) return;

    var vh = window.innerHeight;
    var base = cssVar('--stack-top', 90);
    var step = cssVar('--stack-step', 18);
    var endPad = cssVar('--stack-end', 32);

    plans.forEach(function (plan, i) {
      var h = plan.offsetHeight;
      heights[i] = h;

      // Si la card cabe en pantalla se apila con escalón;
      // si es más alta, se ancla por abajo para poder leerla completa.
      var top = Math.min(base + i * step, vh - h - endPad);

      plan.style.setProperty('--plan-top', Math.round(top) + 'px');
      plan.style.setProperty('--z', String(i + 1));
    });

    updateStack();
  }

  function updateStack() {
    if (!plans.length || reduced.matches) return;

    for (var i = 0; i < plans.length; i++) {
      var plan = plans[i];
      var next = plans[i + 1];
      var scale = 1;
      var opacity = 1;

      if (next) {
        var top = plan.getBoundingClientRect().top;
        var nextTop = next.getBoundingClientRect().top;
        var h = heights[i] || plan.offsetHeight || 1;

        // 0 = la siguiente card aún no cubre · 1 = la cubre por completo
        var p = 1 - (nextTop - top) / h;
        p = p < 0 ? 0 : (p > 1 ? 1 : p);
        p = p * p * (3 - 2 * p); // suavizado

        scale = 1 - 0.055 * p;
        opacity = 1 - 0.3 * p;
      }

      plan.style.transform = 'scale(' + scale.toFixed(4) + ')';
      plan.style.opacity = opacity.toFixed(3);
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateStack();
      ticking = false;
    });
  }

  /* ---------------------------------------------------------
     2. Acordeón de planes (mobile)
     --------------------------------------------------------- */
  document.querySelectorAll('.plan__head').forEach(function (head) {
    head.addEventListener('click', function () {
      if (mqDesktop.matches) return;
      var plan = head.closest('.plan');
      var open = plan.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(open));
    });
  });

  document.querySelectorAll('.plan__body').forEach(function (body) {
    body.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'max-height') layoutStack();
    });
  });

  /* ---------------------------------------------------------
     3. Tabs
     --------------------------------------------------------- */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
    });
  });

  /* ---------------------------------------------------------
     Listeners globales
     --------------------------------------------------------- */
  var resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutStack, 140);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  layoutStack();
  window.addEventListener('load', layoutStack);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layoutStack);
  }

  reduced.addEventListener('change', function () {
    root.classList.toggle('reduced-motion', reduced.matches);
    layoutStack();
  });
})();

/* ============================================================
   memora — modal del catálogo pre-diseñadas
   + personalizador de paleta y tipografía
   + vista previa en vivo (iframe del demo real)
   ============================================================ */

(function () {
  'use strict';

  var modal = document.getElementById('demoModal');
  if (!modal) return;

  var panel    = modal.querySelector('.modal__panel');
  var titleEl  = modal.querySelector('#demoTitle');
  var textEl   = modal.querySelector('#demoText');
  var tagEl    = modal.querySelector('#demoTag');
  var tplEl    = modal.querySelector('#previewTpl');
  var preview  = modal.querySelector('#preview');
  var frame    = modal.querySelector('#previewFrame');
  var comboEl  = modal.querySelector('#demoCombo');
  var selectEl = modal.querySelector('#demoSelect');
  var openEl   = modal.querySelector('#demoOpen');
  var closeBtn = modal.querySelector('.modal__close');

  var swatches  = modal.querySelectorAll('.swatch');
  var fontchips = modal.querySelectorAll('.fontchip');

  var lastFocused = null;
  var currentName = '';
  var currentDemo = '';   // ruta del demo real, si el template ya tiene uno
  var selectURL = '';     // destino del cuestionario con la elección actual

  /* --- Estado del personalizador (se conserva entre templates) --- */
  var theme = {
    palette: preview ? preview.getAttribute('data-palette') : 'hueso',
    fonts:   preview ? preview.getAttribute('data-fonts')   : 'clasica'
  };

  function labelOf(list, value, cls) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute('data-palette') === value ||
          list[i].getAttribute('data-fonts') === value) {
        var el = list[i].querySelector(cls);
        return el ? el.textContent.trim() : value;
      }
    }
    return value;
  }

  function syncChips(list, attr, value) {
    list.forEach(function (chip) {
      var on = chip.getAttribute(attr) === value;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-checked', String(on));
    });
  }

  function themeQuery() {
    return 'paleta=' + encodeURIComponent(theme.palette) +
           '&fuentes=' + encodeURIComponent(theme.fonts);
  }

  function pushThemeToFrame() {
    if (!frame || !frame.contentWindow || !currentDemo) return;
    try {
      frame.contentWindow.postMessage({
        type: 'memora:theme',
        palette: theme.palette,
        fonts: theme.fonts
      }, '*');
    } catch (e) {}
  }

  function applyTheme() {
    if (!preview) return;

    preview.setAttribute('data-palette', theme.palette);
    preview.setAttribute('data-fonts', theme.fonts);

    syncChips(swatches, 'data-palette', theme.palette);
    syncChips(fontchips, 'data-fonts', theme.fonts);

    if (comboEl) {
      comboEl.textContent =
        labelOf(swatches, theme.palette, '.swatch__name') + ' · ' +
        labelOf(fontchips, theme.fonts, '.fontchip__name');
    }

    // La selección viaja al flujo de pedido como parámetros de URL.
    // paso=extras: como ya eligió tipo y diseño, saltamos al paso de extras.
    selectURL = 'pedir-mi-invitacion.html?tipo=pre&diseno=' +
                encodeURIComponent(currentName) + '&' + themeQuery() + '&paso=extras';

    // Y también al demo completo.
    if (openEl) {
      if (currentDemo) {
        openEl.setAttribute('href', currentDemo + '?' + themeQuery());
        openEl.classList.remove('is-off');
        openEl.removeAttribute('aria-disabled');
      } else {
        openEl.setAttribute('href', '#');
        openEl.classList.add('is-off');
        openEl.setAttribute('aria-disabled', 'true');
      }
    }

    // La vista previa en vivo se actualiza sin recargar.
    pushThemeToFrame();
  }

  swatches.forEach(function (chip) {
    chip.addEventListener('click', function () {
      theme.palette = chip.getAttribute('data-palette');
      applyTheme();
    });
  });

  fontchips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      theme.fonts = chip.getAttribute('data-fonts');
      applyTheme();
    });
  });

  /* --- Estado de la vista previa en vivo ---
     Un template puede estar en tres situaciones:
       a) sin demo            -> se muestra la maqueta CSS
       b) con demo conectado  -> responde al personalizador
       c) con demo sin adaptador -> se ve real, pero no cambia de tema
     El badge lo dice claro para que no haya confusión. */
  var badge = modal.querySelector('#previewBadge');
  var adapterOK = false;
  var adapterTimer;

  function setBadge(txt) { if (badge) badge.textContent = txt; }

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'memora:demo-ready' && currentDemo) {
      adapterOK = true;
      clearTimeout(adapterTimer);
      preview.classList.add('has-live');
      setBadge('vista previa en vivo');
      pushThemeToFrame();
    }
  });

  if (frame) {
    frame.addEventListener('load', function () {
      if (!currentDemo) return;
      preview.classList.add('has-live');
      pushThemeToFrame();
      // Si en 2 s no saludó, es que le falta memora-theme.js
      clearTimeout(adapterTimer);
      adapterTimer = window.setTimeout(function () {
        if (!adapterOK) setBadge('demo real · falta conectar el tema');
      }, 2000);
    });
  }

  function loadPreview() {
    if (!frame) return;
    adapterOK = false;
    clearTimeout(adapterTimer);
    preview.classList.remove('has-live');
    setBadge('cargando vista previa…');

    if (currentDemo) {
      var join = currentDemo.indexOf('?') === -1 ? '?' : '&';
      frame.setAttribute('src', currentDemo + join + themeQuery() + '&embed=1');
    } else {
      frame.removeAttribute('src');
      setBadge('maqueta · este template aún no tiene demo');
    }
  }

  /* --- Apertura / cierre --- */
  function open(trigger) {
    currentName = trigger.getAttribute('data-name') || '';
    currentDemo = trigger.getAttribute('data-demo') || '';
    var tag = trigger.getAttribute('data-tag') || 'pre-diseñada';
    var desc = trigger.getAttribute('data-desc') || '';

    titleEl.textContent = currentName;
    textEl.textContent = desc;
    tagEl.textContent = tag;
    if (tplEl) tplEl.textContent = currentName;

    applyTheme();
    loadPreview();

    lastFocused = trigger;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    panel.scrollTop = 0;
    window.setTimeout(function () { closeBtn.focus(); }, 60);
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.design__open, .design__demo, .design__explore').forEach(function (trigger) {
    trigger.addEventListener('click', function () { open(trigger); });
  });

  modal.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  /* trampa de foco simple */
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusables = modal.querySelectorAll('button, [href], input, select, textarea');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  /* ============================================================
     Modal de confirmación de elección
     ============================================================ */
  var confirm = document.getElementById('confirmModal');
  if (confirm) {
    var confTemplate = confirm.querySelector('#confTemplate');
    var confPalette  = confirm.querySelector('#confPalette');
    var confFonts    = confirm.querySelector('#confFonts');
    var confGo       = confirm.querySelector('#confirmGo');
    var confExplore  = confirm.querySelector('#confirmExplore');
    var confClose    = confirm.querySelector('.confirm__close');
    var confReturn   = null;
    var confFromDemo = false;

    function openConfirm(opts) {
      opts = opts || {};
      var name = opts.name || currentName;
      var pal  = opts.palette || theme.palette;
      var fon  = opts.fonts || theme.fonts;
      var url  = opts.url || selectURL ||
                 ('pedir-mi-invitacion.html?tipo=pre&diseno=' + encodeURIComponent(name) +
                  '&paleta=' + encodeURIComponent(pal) + '&fuentes=' + encodeURIComponent(fon) +
                  '&paso=extras');

      // ¿venimos del modal de demo o directo de una tarjeta del catálogo?
      confFromDemo = modal.classList.contains('is-open');

      confTemplate.textContent = name;
      confPalette.textContent  = labelOf(swatches, pal, '.swatch__name');
      confFonts.textContent    = labelOf(fontchips, fon, '.fontchip__name');
      confGo.setAttribute('href', url);

      confReturn = document.activeElement;
      confirm.classList.add('is-open');
      confirm.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      window.setTimeout(function () { confGo.focus(); }, 60);
    }

    function closeConfirm() {
      confirm.classList.remove('is-open');
      confirm.setAttribute('aria-hidden', 'true');
      // el modal de demo sigue abierto detrás, así que mantenemos el lock
      if (!modal.classList.contains('is-open')) document.body.classList.remove('is-locked');
      if (confReturn && confReturn.focus) confReturn.focus();
    }

    // "seleccionar esta invitación" (dentro del modal de demo) abre la confirmación
    if (selectEl) {
      selectEl.addEventListener('click', function () { openConfirm(); });
    }

    // "quiero seguir explorando" → cierra la confirmación (y el demo si venía de ahí)
    confExplore.addEventListener('click', function () {
      var wasDemo = confFromDemo;
      closeConfirm();
      if (wasDemo) close();  // vuelve a la parrilla completa
    });

    // "¡sí! sigamos el proceso" es un <a>, navega solo; solo liberamos el scroll
    confGo.addEventListener('click', function () {
      document.body.classList.remove('is-locked');
    });

    confirm.querySelectorAll('[data-confirm-close]').forEach(function (el) {
      el.addEventListener('click', closeConfirm);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && confirm.classList.contains('is-open')) {
        e.stopPropagation();
        closeConfirm();
      }
    }, true);

    confirm.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = confirm.querySelectorAll('button, [href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  applyTheme();
})();

/* ============================================================
   memora — cortinilla de introducción
   Logo "memora" que se dibuja (stroke) y se rellena, ~3.5 s y se disuelve.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var curtain = document.getElementById('introCurtain');

  function finish() {
    document.dispatchEvent(new CustomEvent('memora:intro-done'));
  }

  if (!curtain || !root.classList.contains('intro-active')) {
    // Sin cortinilla: el sitio arranca normal.
    if (curtain) curtain.remove();
    return;
  }

  var HOLD = 3400;   // ms visibles antes de empezar a disolverse
  var FADE = 900;    // ms que tarda la disolución
  var path = curtain.querySelector('.intro-curtain__path');
  var skip = document.getElementById('introSkip');
  var closed = false;
  var timer;

  try { window.sessionStorage.setItem('memora:intro', '1'); } catch (e) {}
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!window.location.hash) window.scrollTo(0, 0);

  // Preparamos el trazo: medimos su longitud y la usamos como dasharray/offset.
  if (path && path.getTotalLength) {
    var len = Math.ceil(path.getTotalLength());
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.setProperty('--len', len);
  }

  // Siguiente frame: arranca la animación de dibujado.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { curtain.classList.add('is-ready'); });
  });

  function close(fast) {
    if (closed) return;
    closed = true;
    clearTimeout(timer);

    var dur = fast ? 500 : FADE;
    curtain.style.setProperty('--intro-fade', dur + 'ms');
    curtain.classList.add('is-done');

    window.setTimeout(function () {
      root.classList.remove('intro-active');
      curtain.remove();
      finish();
    }, dur);
  }

  timer = window.setTimeout(function () { close(false); }, HOLD);

  if (skip) {
    skip.addEventListener('click', function (e) {
      e.stopPropagation();
      close(true);
    });
  }
  curtain.addEventListener('click', function () { close(true); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Enter') close(true);
  });
})();
