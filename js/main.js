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
   ============================================================ */

(function () {
  'use strict';

  var modal = document.getElementById('demoModal');
  if (!modal) return;

  var panel   = modal.querySelector('.modal__panel');
  var titleEl = modal.querySelector('#demoTitle');
  var textEl  = modal.querySelector('#demoText');
  var tagEl   = modal.querySelector('#demoTag');
  var tplEl   = modal.querySelector('#previewTpl');
  var preview = modal.querySelector('#preview');
  var comboEl = modal.querySelector('#demoCombo');
  var selectEl = modal.querySelector('#demoSelect');
  var closeBtn = modal.querySelector('.modal__close');

  var swatches  = modal.querySelectorAll('.swatch');
  var fontchips = modal.querySelectorAll('.fontchip');

  var lastFocused = null;
  var currentName = '';

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
    if (selectEl) {
      selectEl.setAttribute('href',
        'index.html?diseno=' + encodeURIComponent(currentName) +
        '&paleta=' + encodeURIComponent(theme.palette) +
        '&fuentes=' + encodeURIComponent(theme.fonts) + '#pedir');
    }
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

  /* --- Apertura / cierre --- */
  function open(trigger) {
    currentName = trigger.getAttribute('data-name') || '';
    var tag = trigger.getAttribute('data-tag') || 'pre-diseñada';
    var desc = trigger.getAttribute('data-desc') || '';

    titleEl.textContent = currentName;
    textEl.textContent = desc;
    tagEl.textContent = tag;
    if (tplEl) tplEl.textContent = currentName;

    applyTheme();

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

  document.querySelectorAll('.design__open, .design__demo').forEach(function (trigger) {
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

  applyTheme();
})();

/* ============================================================
   memora — cortinilla de introducción
   Video full screen + logo blanco centrado, ~5 s y se disuelve.
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

  var HOLD = 4200;   // ms visibles antes de empezar a disolverse
  var FADE = 1200;   // ms que tarda la disolución
  var video = curtain.querySelector('.intro-curtain__video');
  var skip = document.getElementById('introSkip');
  var closed = false;
  var timer;

  try { window.sessionStorage.setItem('memora:intro', '1'); } catch (e) {}
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!window.location.hash) window.scrollTo(0, 0);

  // Fade-in del logo en el siguiente frame.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { curtain.classList.add('is-ready'); });
  });

  // Algunos navegadores bloquean el autoplay: no pasa nada, queda el fondo negro.
  if (video && video.play) {
    var attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(function () {});
  }

  function close(fast) {
    if (closed) return;
    closed = true;
    clearTimeout(timer);

    var dur = fast ? 550 : FADE;
    curtain.style.setProperty('--intro-fade', dur + 'ms');
    curtain.classList.add('is-done');

    window.setTimeout(function () {
      root.classList.remove('intro-active');
      if (video) { try { video.pause(); } catch (e) {} }
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
