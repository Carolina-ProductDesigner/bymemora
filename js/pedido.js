/* ============================================================
   memora — motor del cuestionario
   ------------------------------------------------------------
   1. Stepper de 6 pasos con validación
   2. Cotización en vivo (lee js/precios.js)
   3. Guardado local para no perder lo escrito
   4. Envío a Google Apps Script -> Sheets + Mercado Pago + correo
   ============================================================ */

(function () {
  'use strict';

  var form = document.getElementById('wizard');
  if (!form) return;

  /* ============================================================
     CONFIGURACIÓN — lo único que tienes que cambiar
     ============================================================ */
  var CONFIG = {
    // Pega aquí la URL que te da Apps Script al publicar el Web App.
    // Mientras esté vacía, el cuestionario corre en modo prueba:
    // calcula todo y te muestra el JSON, pero no envía nada.
    ENDPOINT: '',

    // Nombre de tu negocio en el correo y en el ticket de pago
    NEGOCIO: 'memora'
  };

  var P = window.MEMORA_PRECIOS;

  /* Los 6 diseños del catálogo. Deben coincidir con predisenadas.html */
  var DISENOS = [
    { id: 'malmo',  nombre: 'malmo',  tag: 'serif alta y mucho aire' },
    { id: 'odense', nombre: 'odense', tag: 'editorial, a dos columnas' },
    { id: 'lund',   nombre: 'lund',   tag: 'minimal, todo en una vista' },
    { id: 'oslo',   nombre: 'oslo',   tag: 'fondo oscuro y letra clara' },
    { id: 'flam',   nombre: 'flam',   tag: 'fotografía a página completa' },
    { id: 'lulea',  nombre: 'lulea',  tag: 'retícula y numeración' }
  ];

  var PALETAS = [
    { id: 'hueso', nombre: 'hueso' },
    { id: 'tinta', nombre: 'tinta' },
    { id: 'nieve', nombre: 'nieve' },
    { id: 'terracota', nombre: 'terracota' }
  ];

  var FUENTES = [
    { id: 'clasica', nombre: 'clásica' },
    { id: 'editorial', nombre: 'editorial' },
    { id: 'romantica', nombre: 'romántica' },
    { id: 'moderna', nombre: 'moderna' }
  ];

  /* ============================================================
     ESTADO
     ============================================================ */
  var state = {
    tipo: '',
    diseno: '',
    paleta: 'hueso',
    fuentes: 'clasica',
    extras: [],
    descuento: null   // { codigo, tipo:'porcentaje'|'fijo', valor, monto } una vez validado
  };

  var TOTAL_PASOS = 6;
  var paso = 1;

  var steps = form.querySelectorAll('.step');
  var stepperItems = document.querySelectorAll('.stepper__item');
  var countEl = document.getElementById('stepperCount');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');

  function money(n) {
    return '$' + Number(n).toLocaleString('es-MX') + ' mxn';
  }

  /* ============================================================
     GUARDADO LOCAL
     ============================================================ */
  var STORE = 'memora:pedido';

  function save() {
    var data = { state: state, campos: {} };
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.name && el.type !== 'radio' && el.type !== 'checkbox') data.campos[el.name] = el.value;
    });
    try { window.localStorage.setItem(STORE, JSON.stringify(data)); } catch (e) {}
  }

  function restore() {
    var raw = null;
    try { raw = window.localStorage.getItem(STORE); } catch (e) {}
    if (!raw) return;
    try {
      var d = JSON.parse(raw);
      if (d.state) Object.keys(d.state).forEach(function (k) { state[k] = d.state[k]; });
      if (d.campos) {
        Object.keys(d.campos).forEach(function (k) {
          var el = form.querySelector('[name="' + k + '"]');
          if (el) el.value = d.campos[k];
        });
      }
    } catch (e) {}
  }

  /* ============================================================
     PRE-LLENADO DESDE LA URL
     El modal del catálogo manda ?diseno=odense&paleta=tinta&fuentes=editorial
     ============================================================ */
  var pasoInicial = null;

  function fromURL() {
    var q = new URLSearchParams(window.location.search);
    if (q.get('tipo')) state.tipo = q.get('tipo');
    if (q.get('diseno')) { state.diseno = q.get('diseno'); if (!state.tipo) state.tipo = 'pre'; }
    if (q.get('paleta')) state.paleta = q.get('paleta');
    if (q.get('fuentes')) state.fuentes = q.get('fuentes');

    // ?paso=extras  → saltar directo al paso 4 (diseño y extras)
    var p = q.get('paso');
    if (p === 'extras') pasoInicial = 4;
    else if (p && !isNaN(Number(p))) pasoInicial = Number(p);
  }

  /* ============================================================
     PINTAR OPCIONES
     ============================================================ */
  function tipoActual() {
    for (var i = 0; i < P.tipos.length; i++) if (P.tipos[i].id === state.tipo) return P.tipos[i];
    return null;
  }

  function pintaTipos() {
    var c = document.getElementById('tipos');
    c.innerHTML = '';
    P.tipos.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'option' + (state.tipo === t.id ? ' is-active' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(state.tipo === t.id));
      b.dataset.tipo = t.id;
      b.innerHTML =
        '<span class="option__main">' +
          '<span class="option__name">' + t.nombre + '</span>' +
          '<span class="option__note">' + t.nota + '</span>' +
        '</span>' +
        '<span class="option__price">' + (t.desde ? 'desde ' : '') + money(t.precio) + '</span>' +
        '<span class="option__arrow">\u203A</span>';
      b.addEventListener('click', function () {
        state.tipo = t.id;
        state.extras = [];
        pintaTipos(); pintaExtras(); actualiza();
        window.setTimeout(function () { ir(paso + 1); }, 180);
      });
      c.appendChild(b);
    });
  }

  function pintaDisenos() {
    var c = document.getElementById('disenos');
    c.innerHTML = '';
    DISENOS.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dcard' + (state.diseno === d.id ? ' is-active' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(state.diseno === d.id));
      b.innerHTML =
        '<span class="ph dcard__media" aria-hidden="true"></span>' +
        '<span class="dcard__name">' + d.nombre + '</span>' +
        '<span class="dcard__tag">' + d.tag + '</span>';
      b.addEventListener('click', function () {
        state.diseno = d.id;
        pintaDisenos(); actualiza();
      });
      c.appendChild(b);
    });
  }

  function pintaTema() {
    var cp = document.getElementById('palettes');
    cp.innerHTML = '';
    PALETAS.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (state.paleta === p.id ? ' is-active' : '');
      b.setAttribute('data-palette', p.id);
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(state.paleta === p.id));
      b.innerHTML = '<span class="swatch__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
                    '<span class="swatch__name">' + p.nombre + '</span>';
      b.addEventListener('click', function () { state.paleta = p.id; pintaTema(); actualiza(); });
      cp.appendChild(b);
    });

    var cf = document.getElementById('fonts');
    cf.innerHTML = '';
    FUENTES.forEach(function (f) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fontchip' + (state.fuentes === f.id ? ' is-active' : '');
      b.setAttribute('data-fonts', f.id);
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(state.fuentes === f.id));
      b.innerHTML = '<span class="fontchip__head">Encabezado</span>' +
                    '<span class="fontchip__body">Texto de párrafo</span>' +
                    '<span class="fontchip__name">' + f.nombre + '</span>';
      b.addEventListener('click', function () { state.fuentes = f.id; pintaTema(); actualiza(); });
      cf.appendChild(b);
    });
  }

  function extrasDisponibles() {
    return P.extras.filter(function (x) {
      if (x.activo === false) return false;
      if (x.soloPara && state.tipo && x.soloPara.indexOf(state.tipo) === -1) return false;
      return true;
    });
  }

  function pintaExtras() {
    var c = document.getElementById('extras');
    c.innerHTML = '';
    extrasDisponibles().forEach(function (x) {
      var lab = document.createElement('label');
      lab.className = 'check';
      var on = state.extras.indexOf(x.id) !== -1;
      lab.innerHTML =
        '<input type="checkbox" value="' + x.id + '"' + (on ? ' checked' : '') + '>' +
        '<span class="check__body">' +
          '<span class="check__name">' + x.nombre + '</span>' +
          '<span class="check__note">' + x.nota + '</span>' +
        '</span>' +
        '<span class="check__price">+' + money(x.precio) + '</span>';
      lab.querySelector('input').addEventListener('change', function (e) {
        if (e.target.checked) {
          if (state.extras.indexOf(x.id) === -1) state.extras.push(x.id);
        } else {
          state.extras = state.extras.filter(function (id) { return id !== x.id; });
        }
        actualiza();
      });
      c.appendChild(lab);
    });
  }

  /* ============================================================
     COTIZACIÓN
     ============================================================ */
  function calcDescuento(subtotal) {
    var d = state.descuento;
    if (!d) return 0;
    var monto = d.tipo === 'porcentaje'
      ? Math.round(subtotal * (d.valor / 100))
      : Number(d.valor);
    if (monto > subtotal) monto = subtotal;   // nunca deja el total en negativo
    return monto;
  }

  function cotiza() {
    var lineas = [];
    var t = tipoActual();
    if (t) lineas.push({ nombre: t.nombre, precio: t.precio, desde: t.desde });

    extrasDisponibles().forEach(function (x) {
      if (state.extras.indexOf(x.id) !== -1) lineas.push({ nombre: x.nombre, precio: x.precio });
    });

    var subtotal = lineas.reduce(function (s, l) { return s + l.precio; }, 0);
    var descuento = calcDescuento(subtotal);
    return { lineas: lineas, subtotal: subtotal, descuento: descuento, total: subtotal - descuento };
  }

  function pintaCotizacion() {
    var q = cotiza();
    var ul = document.getElementById('quoteLines');
    ul.innerHTML = '';

    q.lineas.forEach(function (l) {
      var li = document.createElement('li');
      li.innerHTML = '<span>' + l.nombre + (l.desde ? ' <em>(precio base)</em>' : '') + '</span>' +
                     '<span>' + money(l.precio) + '</span>';
      ul.appendChild(li);
    });

    if (!q.lineas.length) {
      var li0 = document.createElement('li');
      li0.className = 'quote__empty';
      li0.textContent = 'todavía no eliges tipo de invitación.';
      ul.appendChild(li0);
    }

    // línea de descuento
    if (state.descuento && q.descuento > 0) {
      var li = document.createElement('li');
      li.className = 'quote__discount';
      li.innerHTML =
        '<span>descuento <em>(' + state.descuento.codigo + ')</em>' +
        '<button type="button" id="promoRemove">quitar</button></span>' +
        '<span>\u2212' + money(q.descuento) + '</span>';
      ul.appendChild(li);
      var rm = li.querySelector('#promoRemove');
      if (rm) rm.addEventListener('click', quitaDescuento);
    }

    document.getElementById('quoteTotal').textContent = money(q.total);

    var pt = document.getElementById('payTotal');
    var pa = document.getElementById('payAnticipo');
    if (pt) pt.textContent = money(q.total);
    if (pa) pa.textContent = money(Math.round(q.total * (P.anticipo || 0.5)));

    var pm = document.getElementById('paymode');
    if (pm) pm.hidden = !P.anticipo;
  }

  /* ============================================================
     CÓDIGO DE DESCUENTO
     La validación de verdad ocurre en el servidor (Apps Script),
     que lee tu pestaña "descuentos" del Sheets. Aquí solo pedimos
     que valide y mostramos el resultado. El precio final se vuelve
     a calcular en el backend al crear la liga de pago.
     ============================================================ */
  function promoMsg(txt, tipo) {
    var m = document.getElementById('promoMsg');
    if (!m) return;
    m.textContent = txt || '';
    m.className = 'promo__msg' + (tipo ? ' is-' + tipo : '');
  }

  function quitaDescuento() {
    state.descuento = null;
    var code = document.getElementById('promoCode');
    if (code) code.value = '';
    promoMsg('');
    pintaCotizacion();
    save();
  }

  function aplicaDescuento() {
    var input = document.getElementById('promoCode');
    var btn = document.getElementById('promoApply');
    if (!input) return;

    var codigo = input.value.trim().toUpperCase();
    if (!codigo) { promoMsg('escribe un código.', 'error'); return; }

    var q = cotiza();
    if (q.subtotal <= 0) { promoMsg('primero elige tu invitación.', 'error'); return; }

    // Sin backend configurado: no podemos validar de forma segura.
    if (!CONFIG.ENDPOINT) {
      promoMsg('los códigos se validan cuando el sitio esté conectado a tu Sheets. ' +
               'por ahora esta parte queda en modo prueba.', 'error');
      return;
    }

    btn.disabled = true;
    var original = btn.textContent;
    btn.textContent = 'validando…';
    promoMsg('');

    fetch(CONFIG.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ tipoDoc: 'validar-codigo', codigo: codigo, subtotal: q.subtotal })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        btn.disabled = false;
        btn.textContent = original;
        if (!res.ok || !res.valido) {
          state.descuento = null;
          pintaCotizacion();
          promoMsg(res.motivo || 'ese código no es válido.', 'error');
          return;
        }
        state.descuento = {
          codigo: res.codigo,
          tipo: res.tipo,       // 'porcentaje' | 'fijo'
          valor: res.valor
        };
        pintaCotizacion();
        var qd = cotiza();
        promoMsg('¡código aplicado! ahorras ' + money(qd.descuento) + '.', 'ok');
        save();
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = original;
        promoMsg('no pudimos validar el código. intenta de nuevo.', 'error');
      });
  }

  function initPromo() {
    var toggle = document.getElementById('promoToggle');
    var row = document.getElementById('promoRow');
    var apply = document.getElementById('promoApply');
    var code = document.getElementById('promoCode');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      row.hidden = false;
      toggle.classList.add('is-hidden');
      code.focus();
    });
    apply.addEventListener('click', aplicaDescuento);
    code.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); aplicaDescuento(); }
    });

    // Si venía un descuento guardado de una sesión anterior, lo reflejamos.
    if (state.descuento) {
      row.hidden = false;
      toggle.classList.add('is-hidden');
      code.value = state.descuento.codigo;
      var q = cotiza();
      promoMsg('código ' + state.descuento.codigo + ' aplicado · ahorras ' + money(q.descuento) + '.', 'ok');
    }
  }

  /* ============================================================
     RESUMEN
     ============================================================ */
  function val(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function nombreDe(lista, id) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i].nombre;
    return '—';
  }

  function pintaResumen() {
    var dl = document.getElementById('resumen');
    dl.innerHTML = '';
    var t = tipoActual();

    var filas = [
      ['contacto', val('nombre') + (val('pareja') ? ' y ' + val('pareja') : '')],
      ['correo', val('email')],
      ['whatsapp', val('telefono')],
      ['tipo de invitación', t ? t.nombre : '—']
    ];

    if (t && t.pideDiseno) {
      filas.push(['diseño', state.diseno || '—']);
      filas.push(['paleta', nombreDe(PALETAS, state.paleta)]);
      filas.push(['fuentes', nombreDe(FUENTES, state.fuentes)]);
    }

    filas.push(['nombres en la invitación', val('nombres')]);
    filas.push(['fecha del evento', val('fecha')]);
    if (val('hora')) filas.push(['hora', val('hora')]);
    if (val('ciudad')) filas.push(['ciudad', val('ciudad')]);
    if (val('invitados')) filas.push(['invitados', val('invitados')]);
    if (val('dominio')) filas.push(['dominio', 'bymemora.mx/' + val('dominio')]);

    var ex = extrasDisponibles().filter(function (x) { return state.extras.indexOf(x.id) !== -1; });
    filas.push(['extras', ex.length ? ex.map(function (x) { return x.nombre; }).join(', ') : 'ninguno']);

    filas.forEach(function (f) {
      var dt = document.createElement('dt'); dt.textContent = f[0];
      var dd = document.createElement('dd'); dd.textContent = f[1] || '—';
      dl.appendChild(dt); dl.appendChild(dd);
    });
  }

  /* ============================================================
     NAVEGACIÓN
     ============================================================ */
  function pasoAplica(n) {
    if (n !== 3) return true;
    var t = tipoActual();
    return !!t;  // el paso 3 siempre existe: cambia de contenido según el tipo
  }

  function pintaPaso3() {
    var t = tipoActual();
    var pre = t && t.pideDiseno;
    document.getElementById('paso3Pre').hidden = !pre;
    document.getElementById('paso3Custom').hidden = !!pre;
    var head = form.querySelector('[data-step="3"] .step__head');
    head.textContent = pre ? 'selecciona tu invitación pre-diseñada' : 'cuéntanos tu idea';
  }

  function ir(n, saltar) {
    n = Math.max(1, Math.min(TOTAL_PASOS, n));
    if (!saltar && n > paso) { for (var i = paso; i < n; i++) if (!valida(i)) { n = i; break; } }

    paso = n;

    steps.forEach(function (s) {
      s.classList.toggle('is-active', Number(s.dataset.step) === paso);
    });

    stepperItems.forEach(function (it, i) {
      var idx = i + 1;
      it.classList.toggle('is-current', idx === paso);
      it.classList.toggle('is-done', idx < paso);
      it.disabled = idx > paso;
    });

    countEl.textContent = 'paso ' + paso + ' de ' + TOTAL_PASOS;
    btnPrev.disabled = paso === 1;
    btnNext.hidden = paso === TOTAL_PASOS;

    if (paso === 3) pintaPaso3();
    if (paso === 4) pintaExtras();
    if (paso === 6) { pintaResumen(); pintaCotizacion(); }

    // Centramos el paso activo en el stepper (mobile)
    var act = document.querySelector('.stepper__item.is-current');
    if (act && act.scrollIntoView) act.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });

    var top = document.getElementById('wizard').getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: top, behavior: 'smooth' });

    save();
  }

  /* ============================================================
     VALIDACIÓN
     ============================================================ */
  function marcaError(el, msg) {
    var f = el.closest('.field');
    if (!f) return;
    f.classList.add('has-error');
    var e = f.querySelector('.field__err');
    if (e) e.textContent = msg;
  }

  function limpiaErrores(n) {
    var s = form.querySelector('[data-step="' + n + '"]');
    if (!s) return;
    s.querySelectorAll('.has-error').forEach(function (f) { f.classList.remove('has-error'); });
    s.querySelectorAll('.field__err').forEach(function (e) { e.textContent = ''; });
  }

  function valida(n) {
    limpiaErrores(n);
    var s = form.querySelector('[data-step="' + n + '"]');
    var ok = true;

    if (n === 2) {
      if (!state.tipo) {
        document.getElementById('err_tipo').textContent = 'elige una opción para continuar.';
        ok = false;
      }
      return ok;
    }

    if (n === 3) {
      var t = tipoActual();
      if (t && t.pideDiseno && !state.diseno) {
        document.getElementById('err_diseno').textContent = 'elige un diseño para continuar.';
        return false;
      }
      return true;
    }

    s.querySelectorAll('[required]').forEach(function (el) {
      if (el.type === 'checkbox') return;
      var v = el.value.trim();
      if (!v) { marcaError(el, 'este campo es necesario.'); ok = false; return; }
      if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        marcaError(el, 'revisa el formato del correo.'); ok = false;
      }
      if (el.type === 'tel' && v.replace(/\D/g, '').length < 10) {
        marcaError(el, 'necesitamos 10 dígitos.'); ok = false;
      }
    });

    if (!ok) {
      var primero = s.querySelector('.has-error .input');
      if (primero) primero.focus();
    }
    return ok;
  }

  /* ============================================================
     ENVÍO
     ============================================================ */
  function payload() {
    var q = cotiza();
    var campos = {};
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.name && el.type !== 'radio' && el.type !== 'checkbox') campos[el.name] = el.value.trim();
    });

    var modo = form.querySelector('[name="pago"]:checked');
    modo = modo ? modo.value : 'total';
    var aCobrar = modo === 'anticipo'
      ? Math.round(q.total * (P.anticipo || 0.5))
      : q.total;

    return {
      tipoDoc: 'pedido',
      fechaEnvio: new Date().toISOString(),
      contacto: {
        nombre: campos.nombre, pareja: campos.pareja,
        email: campos.email, telefono: campos.telefono,
        conocimos: campos.conocimos
      },
      invitacion: {
        tipo: state.tipo,
        tipoNombre: (tipoActual() || {}).nombre || '',
        diseno: state.diseno,
        paleta: state.paleta,
        fuentes: state.fuentes,
        idea: campos.idea,
        notasDiseno: campos.notasDiseno,
        extras: state.extras
      },
      evento: {
        nombres: campos.nombres, fecha: campos.fecha, hora: campos.hora,
        ciudad: campos.ciudad, invitados: campos.invitados,
        ceremonia: campos.ceremonia, ceremoniaDir: campos.ceremoniaDir,
        recepcion: campos.recepcion, recepcionDir: campos.recepcionDir,
        dresscode: campos.dresscode, dominio: campos.dominio,
        itinerario: campos.itinerario, regalos: campos.regalos, notas: campos.notas
      },
      cotizacion: {
        lineas: q.lineas,
        subtotal: q.subtotal,
        descuento: q.descuento,
        codigoDescuento: state.descuento ? state.descuento.codigo : '',
        total: q.total,
        modoPago: modo,
        aCobrar: aCobrar,
        moneda: P.moneda
      }
    };
  }

  function estado(msg, tipo) {
    var box = document.getElementById('sendState');
    box.hidden = false;
    box.className = 'sendstate is-' + (tipo || 'info');
    box.innerHTML = msg;
    box.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    document.getElementById('err_terms').textContent = '';
    if (!document.getElementById('f_terms').checked) {
      document.getElementById('err_terms').textContent = 'necesitamos tu confirmación para continuar.';
      return;
    }
    for (var i = 1; i <= 5; i++) { if (!valida(i)) { ir(i); return; } }

    var data = payload();
    var btn = document.getElementById('submitBtn');

    if (!CONFIG.ENDPOINT) {
      estado('<strong>modo prueba.</strong> todavía no conectas el Apps Script. ' +
             'esto es lo que se enviaría:<pre>' +
             JSON.stringify(data, null, 2).replace(/</g, '&lt;') + '</pre>', 'info');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'generando tu liga de pago…';

    fetch(CONFIG.ENDPOINT, {
      method: 'POST',
      // text/plain evita el preflight de CORS que Apps Script no maneja.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || 'error desconocido');
        try { window.localStorage.removeItem(STORE); } catch (err) {}
        if (res.pago) {
          estado('listo, tu folio es <strong>' + res.folio + '</strong>. te estamos llevando a mercado pago…', 'ok');
          window.setTimeout(function () { window.location.href = res.pago; }, 1200);
        } else {
          window.location.href = 'gracias.html?folio=' + encodeURIComponent(res.folio || '');
        }
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.textContent = 'ir a pagar con mercado pago';
        estado('no pudimos enviar tu pedido (' + err.message + '). ' +
               'escríbenos por whatsapp y lo resolvemos.', 'error');
      });
  });

  /* ============================================================
     ARRANQUE
     ============================================================ */
  function actualiza() {
    pintaCotizacion();
    save();
  }

  restore();
  fromURL();
  pintaTipos();
  pintaDisenos();
  pintaTema();
  pintaExtras();
  pintaCotizacion();
  initPromo();

  form.addEventListener('input', save);

  btnPrev.addEventListener('click', function () { ir(paso - 1); });
  btnNext.addEventListener('click', function () { if (valida(paso)) ir(paso + 1); });

  stepperItems.forEach(function (it) {
    it.addEventListener('click', function () { ir(Number(it.dataset.go)); });
  });

  // Arranque:
  //  · ?paso=extras (o número) → saltamos ahí directo (ya eligió tipo y diseño)
  //  · llegó con diseño/tipo    → empezamos en el paso 2
  //  · entrada normal           → paso 1
  if (pasoInicial) ir(pasoInicial, true);
  else if (state.diseno || state.tipo) ir(2);
  else ir(1);
})();
