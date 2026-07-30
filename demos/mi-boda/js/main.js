/* ═══════════════════════════════════════════════════════════
   WEDDING WEBSITE — MAIN JS
   Reads WEDDING_CONFIG from data/config.js
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const C = WEDDING_CONFIG;

  /* ── HELPERS ─────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const pad = n => String(n).padStart(2, '0');
  const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isDesktop = () => window.innerWidth >= 1024;

  /* Build a media element (img or video) */
  function buildMedia(media, cls = '') {
    if (!media || !media.src) return '';
    if (media.type === 'video') {
      return `<video class="${cls}" autoplay muted loop playsinline
        ${media.poster ? `poster="${media.poster}"` : ''}
        aria-hidden="true">
        <source src="${media.src}" type="video/mp4" />
      </video>`;
    }
    return `<img class="${cls}" src="${media.src}" alt="" loading="lazy" />`;
  }

  /* ════════════════════════════════════════════════════════════
     1. APPLY CONFIG — colors, fonts, text content
  ════════════════════════════════════════════════════════════ */
  function applyConfig() {
    /* Colors → CSS custom properties */
    const root = document.documentElement;
    const col = C.colors;
    root.style.setProperty('--bg',          col.background);
    root.style.setProperty('--ink',         col.text);
    root.style.setProperty('--olive',       col.olive);
    root.style.setProperty('--olive-mid',   col.oliveMid);
    root.style.setProperty('--olive-mist',  col.oliveMist);
    root.style.setProperty('--olive-pale',  col.olivePale);

    /* Font */
    root.style.setProperty('--font', `'${C.fonts.family}', system-ui, sans-serif`);
    const fontLink = $('#google-font');
    if (fontLink && C.fonts.googleUrl) fontLink.href = C.fonts.googleUrl;

    /* Text content */
    const set = (id, val) => { const el = $(id); if (el && val) el.innerHTML = val; };
    const couple = C.couple;
    const txt = C.text;

    set('#introL1',      couple.introLine1 || `${couple.name1} Y`);
    set('#introL2',      couple.introLine2 || couple.name2);
    set('#introDate',    couple.date);
    set('#introCity',    couple.address || couple.city || '');
    set('#mobileDate',   couple.date);

    set('#storyLabel',   txt.storyLabel);
    set('#storyH1',      txt.storyHeadline1);
    set('#storyH2',      txt.storyHeadline2);
    set('#detailsH1',    txt.detailsHeadline1);
    set('#detailsH2',    txt.detailsHeadline2);
    set('#galleryLabel', txt.galleryLabel);
    set('#rsvpH1',       txt.rsvpHeadline1);
    set('#rsvpH2',       txt.rsvpHeadline2);
    set('#countdownLabel', txt.countdownLabel);
    set('#rsvpDeadline', couple.rsvpDeadline);
    set('#rsvpSuccessHash', couple.hashtag);

    set('#footerNames',  `${couple.name1} &amp; ${couple.name2}`);
    set('#footerDate',   couple.date);
    set('#footerHash',   couple.hashtag);
    set('#footerCity',   couple.address || couple.city);

    /* Hero photo — columna derecha */
    const photoCol = $('#introPhotoCol');
    const heroMedia = C.media.heroInline || C.media.heroBg;
    if (photoCol && heroMedia) {
      photoCol.innerHTML = buildMedia(heroMedia);
    }

    /* Page title */
    document.title = `${couple.name1} & ${couple.name2} — ${couple.date}`;
  }

  /* ════════════════════════════════════════════════════════════
     2. BUILD STORY ITEMS
  ════════════════════════════════════════════════════════════ */
  function buildStory() {
    const container = $('#storyItems');
    if (!container || !C.story) return;

    container.innerHTML = C.story.map((item, i) => {
      const flip = i % 2 !== 0 ? 'flip' : '';
      return `
        <div class="story-item ${flip}">
          <div class="story-media mask-wrap js-reveal" data-r="scale">
            <div class="mask-cover" aria-hidden="true"></div>
            ${buildMedia(item.media)}
          </div>
          <div class="story-text">
            <p class="story-num  js-reveal" data-r="up">${item.number || `0${i+1}`}</p>
            <h3 class="story-title js-reveal" data-r="up" data-d="1">${item.title || ''}</h3>
            <div class="story-divider js-reveal" data-r="scale" data-d="2" aria-hidden="true"></div>
            <p class="story-body js-reveal" data-r="up" data-d="2">${item.body || ''}</p>
          </div>
        </div>`;
    }).join('');
  }

  /* ════════════════════════════════════════════════════════════
     3. BUILD DETAILS CARDS
  ════════════════════════════════════════════════════════════ */
  function buildDetails() {
    const container = $('#detailsCards');
    if (!container) return;
    const c = C.couple;

    const cards = [
      { lbl: 'FECHA',     val: c.date,          sub: 'SÁBADO' },
      { lbl: 'LUGAR',     val: c.venue,         sub: c.address },
      { lbl: 'HORARIO',   val: c.ceremonyTime,  sub: `RECEPCIÓN ${c.receptionTime}` },
      { lbl: 'DRESSCODE', val: c.dresscode,     sub: 'VESTIMENTA' },
    ];

    container.innerHTML = cards.map((card, i) => `
      <div class="detail-card js-reveal" data-r="up" data-d="${i+1}">
        <div class="detail-card-bar" aria-hidden="true"></div>
        <p class="detail-card-lbl">${card.lbl}</p>
        <p class="detail-card-val">${card.val}</p>
        <p class="detail-card-sub">${card.sub}</p>
      </div>`
    ).join('');
  }

  /* ════════════════════════════════════════════════════════════
     4. BUILD GALLERY
  ════════════════════════════════════════════════════════════ */
  function buildGallery() {
    const track   = $('#galTrack');
    const counter = $('#galCounter');
    if (!track || !C.gallery) return;

    const items = C.gallery;

    /* Inicializar counter */
    if (counter) counter.textContent = `01 / ${pad(items.length)}`;

    /* Construir items */
    track.innerHTML = items.map((item, i) => `
      <div class="gal-item" role="listitem" aria-label="${item.caption || `Foto ${i+1}`}">
        ${buildMedia(item)}
        <div class="gal-caption" aria-hidden="true">${item.caption || ''}</div>
      </div>`
    ).join('');
  }

  /* ════════════════════════════════════════════════════════════
     5. NAVIGATION
  ════════════════════════════════════════════════════════════ */
  function initNav() {
    const nav      = $('#nav');
    const hamBtn   = $('#hamBtn');
    const menu     = $('#mobileMenu');
    const overlay  = $('#mobileOverlay');
    const closeBtn = $('#mobileClose');

    /* Show nav after intro animations settle */
    setTimeout(() => nav.classList.add('ready'), 200);

    /* Scroll → frosted style */
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Hamburger */
    function openMenu() {
      menu.classList.add('open');
      overlay.classList.add('show');
      menu.setAttribute('aria-hidden', 'false');
      overlay.setAttribute('aria-hidden', 'false');
      hamBtn.classList.add('open');
      hamBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menu.classList.remove('open');
      overlay.classList.remove('show');
      menu.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('aria-hidden', 'true');
      hamBtn.classList.remove('open');
      hamBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamBtn?.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
    closeBtn?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);
    $$('.mobile-link').forEach(a => a.addEventListener('click', closeMenu));

    /* Keyboard close */
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ════════════════════════════════════════════════════════════
     6. PROGRESS BAR
  ════════════════════════════════════════════════════════════ */
  function initProgressBar() {
    const bar = $('#pgbar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = `scaleX(${Math.min(progress, 1)})`;
    }, { passive: true });
  }

  /* ════════════════════════════════════════════════════════════
     7. SCROLL REVEAL (IntersectionObserver)
     — Bidireccional: anima al entrar Y al salir del viewport
     — Umbrales bajos para funcionar perfecto en mobile
     — Sin unobserve: se repite cada vez que haces scroll
  ════════════════════════════════════════════════════════════ */
  function initScrollReveal() {

    /* Opciones generosas para mobile (pantallas pequeñas) */
    const LINE_OPTS = {
      threshold: 0.04,
      rootMargin: '0px 0px -8px 0px',
    };
    const EL_OPTS = {
      threshold: 0.05,
      rootMargin: '0px 0px -10px 0px',
    };

    /* ─── Mega-line reveals (bidireccional) ─── */
    const lineObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const inner = e.target.querySelector('.mega-line-inner');
        if (!inner) return;
        /* toggle: añade al entrar, quita al salir → re-anima siempre */
        inner.classList.toggle('visible', e.isIntersecting);
      });
    }, LINE_OPTS);

    /* Solo observa las que NO están en el intro (esas usan CSS @keyframes) */
    $$('.mega-line').forEach(line => {
      if (!line.closest('#intro')) lineObserver.observe(line);
    });

    /* ─── Elementos generales .js-reveal (bidireccional) ─── */
    const elObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        /* toggle: visible al entrar, oculto al salir */
        e.target.classList.toggle('visible', e.isIntersecting);
      });
    }, EL_OPTS);

    $$('.js-reveal').forEach(el => elObserver.observe(el));
  }

  /* ════════════════════════════════════════════════════════════
     8. PARALLAX (desktop / pointer:fine only)
  ════════════════════════════════════════════════════════════ */
  function initParallax() {
    /* Only on devices with a mouse pointer, not touch */
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    function updateParallax() {
      const sy = window.scrollY;

      /* Intro: text drifts up slightly as you scroll */
      const introEl = $('#introHeadline');
      if (introEl) {
        introEl.style.transform = `translateY(${sy * 0.12}px)`;
      }

      ticking = false;
    }
  }

  /* ════════════════════════════════════════════════════════════
     9. GALLERY
     MOBILE  (< 1024px): CSS swipe nativo — solo actualiza counter
     DESKTOP (≥ 1024px): sticky scroll JS — translateX
  ════════════════════════════════════════════════════════════ */
  function initStickyGallery() {
    const outer   = $('#gal-outer');
    const track   = $('#galTrack');
    const counter = $('#galCounter');
    const hint    = $('#galScrollHint');
    if (!track) return;

    const items = $$('.gal-item', track);
    if (!items.length) return;

    const DESKTOP = 1024;

    /* ────────────────────────────────────────────────────────
       MOBILE: el swipe lo maneja el CSS (scroll-snap).
       Aquí solo actualizamos el counter al deslizar.
    ──────────────────────────────────────────────────────── */
    function initMobile() {
      track.addEventListener('scroll', () => {
        const itemW = (items[0] ? items[0].offsetWidth : 0) + 10;
        if (!itemW) return;
        const idx = Math.min(Math.round(track.scrollLeft / itemW), items.length - 1);
        if (counter) counter.textContent = `${pad(idx + 1)} / ${pad(items.length)}`;
      }, { passive: true });
    }

    /* ────────────────────────────────────────────────────────
       DESKTOP: sticky + JS translateX
    ──────────────────────────────────────────────────────── */
    function calcMaxTranslate() {
      if (!items.length || !outer) return 0;
      const padX     = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const lastItem = items[items.length - 1];
      return Math.max(0, lastItem.offsetLeft + lastItem.offsetWidth + padX - window.innerWidth);
    }

    function setOuterHeight() {
      const needed = calcMaxTranslate();
      if (needed <= 0) return;           /* medición aún no lista — no sobreescribir */
      outer.style.height = (window.innerHeight + needed) + 'px';
    }

    let ticking = false, hintHidden = false;

    function updateGallery() {
      if (!outer) return;
      const rect   = outer.getBoundingClientRect();
      const outerH = outer.offsetHeight;
      const winH   = window.innerHeight;
      if (rect.top > 2 || rect.bottom < winH - 2) { ticking = false; return; }

      const progress = Math.max(0, Math.min(1, -rect.top / (outerH - winH)));
      const maxT     = calcMaxTranslate();
      track.style.transform = `translateX(-${progress * maxT}px)`;

      const idx = Math.min(Math.floor(progress * items.length), items.length - 1);
      if (counter) counter.textContent = `${pad(idx + 1)} / ${pad(items.length)}`;

      if (!hintHidden && progress > 0.02 && hint) { hint.classList.add('hidden'); hintHidden = true; }
      if (hintHidden && progress <= 0.01 && hint)  { hint.classList.remove('hidden'); hintHidden = false; }
      ticking = false;
    }

    function initDesktop() {
      window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(updateGallery); ticking = true; }
      }, { passive: true });
      /* Medir después de 2 frames para que el layout esté listo */
      requestAnimationFrame(() => requestAnimationFrame(setOuterHeight));
      setTimeout(setOuterHeight, 600);
      setTimeout(setOuterHeight, 1500);
    }

    /* ── Arrancar según breakpoint ── */
    if (window.innerWidth >= DESKTOP) {
      initDesktop();
    } else {
      initMobile();
      track.style.transform = '';
      if (outer) outer.style.height = '';
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= DESKTOP) {
          setOuterHeight();
        } else {
          track.style.transform = '';
          if (outer) outer.style.height = '';
        }
      }, 200);
    });
  }

  /* ════════════════════════════════════════════════════════════
     10. COUNTDOWN TIMER
  ════════════════════════════════════════════════════════════ */
  function initCountdown() {
    const target = new Date(C.couple.dateISO);

    function update() {
      const diff = target - new Date();
      if (diff <= 0) {
        ['cd-d','cd-h','cd-m','cd-s'].forEach(id => { const el = $(id); if (el) el.textContent = '00'; });
        return;
      }
      $('#cd-d').textContent = pad(Math.floor(diff / 86400000));
      $('#cd-h').textContent = pad(Math.floor((diff % 86400000) / 3600000));
      $('#cd-m').textContent = pad(Math.floor((diff % 3600000) / 60000));
      $('#cd-s').textContent = pad(Math.floor((diff % 60000) / 1000));
    }

    update();
    setInterval(update, 1000);
  }

  /* ════════════════════════════════════════════════════════════
     11. RSVP FORM → GOOGLE SHEETS
  ════════════════════════════════════════════════════════════ */
  function initRSVP() {
    const form    = $('#rsvpForm');
    const btn     = $('#rsvpBtn');
    const btnText = $('#rsvpBtnText');
    const loader  = $('#rsvpLoader');
    const success = $('#rsvpSuccess');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      /* Basic validation */
      const nombre = $('#fNombre')?.value.trim();
      const email  = $('#fEmail')?.value.trim();
      const conf   = $('#fConfirm')?.value;

      if (!nombre || !email || !conf) {
        showError('POR FAVOR COMPLETA LOS CAMPOS REQUERIDOS');
        return;
      }
      if (!email.includes('@')) {
        showError('CORREO ELECTRÓNICO NO VÁLIDO');
        return;
      }

      /* Loading state */
      btn.classList.add('loading');
      btnText.textContent = 'ENVIANDO...';

      const payload = {
        nombre,
        email,
        confirmacion: conf,
        acompanantes: $('#fGuests')?.value || '0',
        mensaje:      $('#fMsg')?.value?.trim() || '',
        fecha:        new Date().toISOString(),
      };

      const result = await sendToSheets(payload);

      btn.classList.remove('loading');

      if (result.ok) {
        form.style.display = 'none';
        success.classList.add('show');
      } else {
        btnText.textContent = 'CONFIRMAR ASISTENCIA';
        if (result.noUrl) {
          /* Dev mode: sheets not configured, show success anyway */
          console.warn('⚠️ Google Sheets URL no configurado. Configura en data/config.js');
          form.style.display = 'none';
          success.classList.add('show');
        } else {
          showError('HUBO UN ERROR. INTENTA DE NUEVO.');
        }
      }
    });

    function showError(msg) {
      btnText.textContent = msg;
      btn.style.background = '#c0392b';
      setTimeout(() => {
        btnText.textContent = 'CONFIRMAR ASISTENCIA';
        btn.style.background = '';
      }, 3000);
    }
  }

  async function sendToSheets(data) {
    const url = C.googleSheets?.scriptUrl;
    if (!url || url.includes('YOUR_GOOGLE')) {
      return { ok: false, noUrl: true };
    }
    try {
      /* Google Apps Script requires mode: 'no-cors' */
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return { ok: true };
    } catch (err) {
      console.error('Error enviando a Google Sheets:', err);
      return { ok: false };
    }
  }

  /* ════════════════════════════════════════════════════════════
     12. INIT
  ════════════════════════════════════════════════════════════ */
  function init() {
    applyConfig();
    buildStory();
    buildDetails();
    buildGallery();
    initNav();
    initProgressBar();
    initScrollReveal();
    initParallax();
    initStickyGallery();
    initCountdown();
    initRSVP();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
