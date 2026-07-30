/* ============================================================
   memora — BACKEND (Google Apps Script)
   ------------------------------------------------------------
   Este archivo hace de servidor sin que pagues un servidor.
   Se encarga de:
     1. Guardar cada pedido en tu Google Sheets
     2. Crear la liga de pago de Mercado Pago
     3. Mandarte aviso a ti y confirmación a la pareja
     4. Escuchar el webhook de Mercado Pago y, al confirmarse
        el pago, marcar el pedido como PAGADO y mandar el
        correo de "tu invitación ya está pedida"

   Instrucciones completas en LEEME.md
   ============================================================ */

/* ============================================================
   CONFIGURACIÓN
   ============================================================ */
var CONFIG = {
  // Correo donde quieres recibir el aviso de cada pedido nuevo
  MI_CORREO: 'hola@bymemora.mx',

  // Cómo se firman los correos
  NEGOCIO: 'memora',

  // A dónde vuelve la pareja después de pagar
  URL_GRACIAS: 'https://bymemora.mx/gracias.html',

  // Nombre de las pestañas del Sheets
  HOJA_PEDIDOS: 'pedidos'
};

/* El token de Mercado Pago NO se escribe aquí.
   Va en Configuración del proyecto > Propiedades del script,
   con la clave MP_ACCESS_TOKEN. */
function mpToken() {
  return PropertiesService.getScriptProperties().getProperty('MP_ACCESS_TOKEN');
}

/* ============================================================
   ENTRADA
   ============================================================ */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // Webhook de Mercado Pago
    if (body.type === 'payment' || body.action === 'payment.updated') {
      return manejaPago(body);
    }

    // Pedido nuevo desde el cuestionario
    if (body.tipoDoc === 'pedido') {
      return manejaPedido(body);
    }

    // Validación de un código de descuento (antes de pagar)
    if (body.tipoDoc === 'validar-codigo') {
      return validaCodigo(body);
    }

    return json({ ok: false, error: 'tipo de mensaje no reconocido' });

  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, servicio: 'memora', estado: 'activo' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================
   DESCUENTOS
   ------------------------------------------------------------
   Los códigos viven en la pestaña "descuentos" de tu Sheets.
   Columnas (en este orden):
     A codigo      texto, ej. FAMILIA          (se compara en mayúsculas)
     B tipo        "porcentaje" o "fijo"
     C valor       número: 20 = 20% · 500 = $500
     D activo      "sí" / "no"
     E usos_max    número máx de veces que se puede usar (vacío = sin límite)
     F usos        cuántas veces se ha usado (lo actualiza el sistema)
     G vence       fecha AAAA-MM-DD (vacío = no vence)
     H nota        libre, para ti

   Para crear un código: agrega un renglón.
   Para apagarlo: pon "no" en la columna activo.
   ============================================================ */

function hojaDescuentos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName('descuentos');
  if (!h) {
    h = ss.insertSheet('descuentos');
    h.appendRow(['codigo', 'tipo', 'valor', 'activo', 'usos_max', 'usos', 'vence', 'nota']);
    h.appendRow(['FAMILIA', 'porcentaje', 20, 'sí', 50, 0, '', 'friends and family']);
    h.appendRow(['VERANO500', 'fijo', 500, 'sí', 100, 0, '2026-08-31', 'promo de verano']);
    h.setFrozenRows(1);
  }
  return h;
}

// Busca el código y devuelve { fila, datos } o null
function buscaCodigo(codigo) {
  var h = hojaDescuentos();
  var filas = h.getDataRange().getValues();
  codigo = String(codigo).trim().toUpperCase();
  for (var i = 1; i < filas.length; i++) {
    if (String(filas[i][0]).trim().toUpperCase() === codigo) {
      return { fila: i + 1, datos: filas[i] };
    }
  }
  return null;
}

// Revisa vigencia y devuelve el veredicto. NO descuenta usos (eso es al pagar).
function evaluaCodigo(codigo, subtotal) {
  var hit = buscaCodigo(codigo);
  if (!hit) return { valido: false, motivo: 'ese código no existe.' };

  var d = hit.datos;
  var activo = String(d[3]).trim().toLowerCase();
  if (activo !== 'sí' && activo !== 'si' && activo !== 'true') {
    return { valido: false, motivo: 'ese código ya no está disponible.' };
  }

  var usosMax = d[4] === '' ? null : Number(d[4]);
  var usos = Number(d[5] || 0);
  if (usosMax !== null && usos >= usosMax) {
    return { valido: false, motivo: 'este código ya llegó a su límite de usos.' };
  }

  if (d[6]) {
    var vence = new Date(d[6]);
    if (!isNaN(vence.getTime())) {
      vence.setHours(23, 59, 59);
      if (new Date() > vence) return { valido: false, motivo: 'este código ya venció.' };
    }
  }

  var tipo = String(d[1]).trim().toLowerCase();
  var valor = Number(d[2]);
  if (!(valor > 0)) return { valido: false, motivo: 'ese código no es válido.' };

  var monto = tipo === 'porcentaje' ? Math.round(subtotal * (valor / 100)) : valor;
  if (monto > subtotal) monto = subtotal;

  return {
    valido: true,
    codigo: String(d[0]).trim().toUpperCase(),
    tipo: tipo === 'porcentaje' ? 'porcentaje' : 'fijo',
    valor: valor,
    monto: monto
  };
}

// Respuesta al sitio cuando la persona da "aplicar"
function validaCodigo(body) {
  var r = evaluaCodigo(body.codigo, Number(body.subtotal) || 0);
  if (!r.valido) return json({ ok: true, valido: false, motivo: r.motivo });
  return json({ ok: true, valido: true, codigo: r.codigo, tipo: r.tipo, valor: r.valor, monto: r.monto });
}

// Suma 1 al contador de usos (se llama solo cuando el pago se confirma)
function marcaUsoCodigo(codigo) {
  if (!codigo) return;
  var hit = buscaCodigo(codigo);
  if (!hit) return;
  var h = hojaDescuentos();
  var usos = Number(hit.datos[5] || 0) + 1;
  h.getRange(hit.fila, 6).setValue(usos);
}


/* ============================================================
   1 · PEDIDO NUEVO
   ============================================================ */
function manejaPedido(d) {
  // ---- RECÁLCULO SEGURO DEL DESCUENTO ----
  // No confiamos en el monto que mandó el navegador: lo volvemos a
  // calcular aquí, leyendo el código real del Sheets. Así nadie puede
  // inflar el descuento editando la página.
  var subtotal = Number(d.cotizacion.subtotal || d.cotizacion.total || 0);
  var descuento = 0;
  var codigoOk = '';

  if (d.cotizacion.codigoDescuento) {
    var ev = evaluaCodigo(d.cotizacion.codigoDescuento, subtotal);
    if (ev.valido) { descuento = ev.monto; codigoOk = ev.codigo; }
  }

  var total = subtotal - descuento;
  var anticipo = 0.5;  // debe coincidir con precios.js; si cambia allá, cámbialo aquí
  var aCobrar = d.cotizacion.modoPago === 'anticipo'
    ? Math.round(total * anticipo)
    : total;

  // Reescribimos la cotización con los valores de confianza
  d.cotizacion.subtotal = subtotal;
  d.cotizacion.descuento = descuento;
  d.cotizacion.codigoDescuento = codigoOk;
  d.cotizacion.total = total;
  d.cotizacion.aCobrar = aCobrar;

  var folio = nuevoFolio();
  var hoja = hojaPedidos();

  var extras = (d.invitacion.extras || []).join(', ');
  var lineas = (d.cotizacion.lineas || [])
    .map(function (l) { return l.nombre + ' $' + l.precio; })
    .join(' | ');

  hoja.appendRow([
    new Date(),                 // A  fecha
    folio,                      // B  folio
    'pendiente de pago',        // C  estatus
    d.contacto.nombre,          // D
    d.contacto.pareja,          // E
    d.contacto.email,           // F
    d.contacto.telefono,        // G
    d.contacto.conocimos,       // H
    d.invitacion.tipoNombre,    // I
    d.invitacion.diseno,        // J
    d.invitacion.paleta,        // K
    d.invitacion.fuentes,       // L
    extras,                     // M
    lineas,                     // N
    d.cotizacion.total,         // O  (ya con descuento aplicado)
    d.cotizacion.modoPago,      // P
    d.cotizacion.aCobrar,       // Q
    '',                         // R  id de pago (lo llena el webhook)
    d.evento.nombres,           // S
    d.evento.fecha,             // T
    d.evento.hora,              // U
    d.evento.ciudad,            // V
    d.evento.invitados,         // W
    d.evento.ceremonia,         // X
    d.evento.ceremoniaDir,      // Y
    d.evento.recepcion,         // Z
    d.evento.recepcionDir,      // AA
    d.evento.dresscode,         // AB
    d.evento.dominio,           // AC
    d.evento.itinerario,        // AD
    d.evento.regalos,           // AE
    d.evento.notas,             // AF
    d.invitacion.idea,          // AG
    d.invitacion.notasDiseno,   // AH
    d.cotizacion.subtotal,      // AI  subtotal antes de descuento
    d.cotizacion.codigoDescuento, // AJ  código aplicado (vacío si ninguno)
    d.cotizacion.descuento      // AK  monto descontado
  ]);

  // Liga de pago
  var pago = '';
  try {
    pago = creaPreferencia(d, folio);
  } catch (err) {
    // Si Mercado Pago falla, el pedido igual quedó guardado.
    avisoInterno(folio, d, 'ERROR AL CREAR LA LIGA: ' + err);
  }

  if (pago) {
    hoja.getRange(hoja.getLastRow(), 18).setValue(pago); // columna R
  }

  correoPedidoRecibido(d, folio, pago);
  avisoInterno(folio, d, pago);

  return json({ ok: true, folio: folio, pago: pago });
}

function nuevoFolio() {
  var p = PropertiesService.getScriptProperties();
  var n = Number(p.getProperty('FOLIO') || '1000') + 1;
  p.setProperty('FOLIO', String(n));
  return 'MEM-' + n;
}

function hojaPedidos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(CONFIG.HOJA_PEDIDOS);
  if (!h) {
    h = ss.insertSheet(CONFIG.HOJA_PEDIDOS);
    h.appendRow([
      'fecha', 'folio', 'estatus', 'nombre', 'pareja', 'email', 'whatsapp', 'nos conoció por',
      'tipo', 'diseño', 'paleta', 'fuentes', 'extras', 'desglose', 'total', 'modo de pago',
      'a cobrar', 'liga / id de pago', 'nombres', 'fecha evento', 'hora', 'ciudad', 'invitados',
      'ceremonia', 'dir ceremonia', 'recepción', 'dir recepción', 'dresscode', 'dominio',
      'itinerario', 'mesa de regalos', 'notas', 'idea', 'notas de diseño',
      'subtotal', 'código', 'descuento'
    ]);
    h.setFrozenRows(1);
  }
  return h;
}

/* ============================================================
   2 · MERCADO PAGO
   ============================================================ */
function creaPreferencia(d, folio) {
  var token = mpToken();
  if (!token) throw new Error('falta MP_ACCESS_TOKEN en las propiedades del script');

  var concepto = d.cotizacion.modoPago === 'anticipo'
    ? 'anticipo 50% · ' + d.invitacion.tipoNombre
    : d.invitacion.tipoNombre;

  var pref = {
    items: [{
      title: CONFIG.NEGOCIO + ' · ' + concepto,
      description: 'folio ' + folio,
      quantity: 1,
      currency_id: d.cotizacion.moneda || 'MXN',
      unit_price: Number(d.cotizacion.aCobrar)
    }],
    payer: {
      name: d.contacto.nombre,
      email: d.contacto.email
    },
    external_reference: folio,
    back_urls: {
      success: CONFIG.URL_GRACIAS + '?folio=' + folio + '&estado=aprobado',
      pending: CONFIG.URL_GRACIAS + '?folio=' + folio + '&estado=pendiente',
      failure: CONFIG.URL_GRACIAS + '?folio=' + folio + '&estado=rechazado'
    },
    auto_return: 'approved',
    statement_descriptor: 'MEMORA',
    notification_url: ScriptApp.getService().getUrl()
  };

  var res = UrlFetchApp.fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify(pref),
    muteHttpExceptions: true
  });

  var out = JSON.parse(res.getContentText());
  if (!out.init_point) throw new Error(out.message || res.getContentText());

  // init_point = producción · sandbox_init_point = pruebas
  return out.init_point;
}

/* ============================================================
   3 · WEBHOOK DE PAGO
   ============================================================ */
function manejaPago(body) {
  var id = (body.data && body.data.id) || body['data.id'];
  if (!id) return json({ ok: true, nota: 'sin id de pago' });

  var res = UrlFetchApp.fetch('https://api.mercadopago.com/v1/payments/' + id, {
    headers: { Authorization: 'Bearer ' + mpToken() },
    muteHttpExceptions: true
  });
  var pago = JSON.parse(res.getContentText());

  if (pago.status !== 'approved') return json({ ok: true, estado: pago.status });

  var folio = pago.external_reference;
  var hoja = hojaPedidos();
  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    if (datos[i][1] !== folio) continue;
    if (String(datos[i][2]).indexOf('pagado') === 0) return json({ ok: true, nota: 'ya estaba pagado' });

    hoja.getRange(i + 1, 3).setValue('pagado');
    hoja.getRange(i + 1, 18).setValue('pago ' + id);

    // Si el pedido traía un código (columna AJ = 36), le sumamos un uso.
    var codigoUsado = datos[i][35];
    if (codigoUsado) marcaUsoCodigo(codigoUsado);

    correoPagoConfirmado({
      email: datos[i][5],
      nombre: datos[i][3],
      pareja: datos[i][4],
      tipo: datos[i][8],
      monto: pago.transaction_amount,
      modo: datos[i][15]
    }, folio);

    MailApp.sendEmail(CONFIG.MI_CORREO,
      'PAGADO · ' + folio,
      folio + ' quedó pagado.\n\nPareja: ' + datos[i][3] + ' y ' + datos[i][4] +
      '\nMonto: $' + pago.transaction_amount +
      '\nCorreo: ' + datos[i][5] + '\nWhatsApp: ' + datos[i][6]);

    break;
  }

  return json({ ok: true });
}

/* ============================================================
   4 · CORREOS
   ============================================================ */
function correoPedidoRecibido(d, folio, pago) {
  if (!d.contacto.email) return;

  var extras = (d.invitacion.extras || []).join(', ') || 'ninguno';
  var esAnticipo = d.cotizacion.modoPago === 'anticipo';

  var html =
    '<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#111;max-width:520px">' +
    '<p style="font-size:26px;margin:0 0 24px">memora</p>' +
    '<p>hola ' + d.contacto.nombre + ',</p>' +
    '<p>recibimos tu pedido. tu folio es <strong>' + folio + '</strong>.</p>' +
    '<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:13px">' +
      fila('invitación', d.invitacion.tipoNombre) +
      (d.invitacion.diseno ? fila('diseño', d.invitacion.diseno) : '') +
      (d.invitacion.diseno ? fila('tema', d.invitacion.paleta + ' · ' + d.invitacion.fuentes) : '') +
      fila('extras', extras) +
      (d.cotizacion.descuento > 0
        ? fila('subtotal', '$' + d.cotizacion.subtotal + ' mxn') +
          fila('descuento (' + d.cotizacion.codigoDescuento + ')', '\u2212$' + d.cotizacion.descuento + ' mxn')
        : '') +
      fila('total', '$' + d.cotizacion.total + ' mxn') +
      fila(esAnticipo ? 'a pagar ahora (50%)' : 'a pagar ahora', '$' + d.cotizacion.aCobrar + ' mxn') +
    '</table>' +
    (pago
      ? '<p><a href="' + pago + '" style="display:inline-block;background:#000;color:#fff;padding:14px 26px;text-decoration:none;font-size:13px">pagar mi invitación</a></p>' +
        '<p style="font-size:12px;color:#787878">si el botón no abre, copia esta liga:<br>' + pago + '</p>'
      : '<p>en un momento te mandamos la liga de pago.</p>') +
    '<p>en cuanto se confirme el pago te escribimos para arrancar tu invitación.</p>' +
    '<p style="color:#787878;font-size:12px;margin-top:30px">memora · bymemora.mx</p>' +
    '</div>';

  MailApp.sendEmail({
    to: d.contacto.email,
    subject: 'tu pedido en memora · ' + folio,
    htmlBody: html,
    name: CONFIG.NEGOCIO
  });
}

function correoPagoConfirmado(p, folio) {
  if (!p.email) return;

  var html =
    '<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#111;max-width:520px">' +
    '<p style="font-size:26px;margin:0 0 24px">memora</p>' +
    '<p>hola ' + p.nombre + ',</p>' +
    '<p><strong>tu invitación ya está pedida.</strong> recibimos tu pago de $' + p.monto + ' mxn ' +
    'y tu folio <strong>' + folio + '</strong> ya está en producción.</p>' +
    '<p>en las próximas horas te contactamos por correo o whatsapp para afinar los últimos detalles ' +
    'y mandarte la primera propuesta. tu invitación te llega por correo en cuanto esté lista.</p>' +
    (p.modo === 'anticipo'
      ? '<p style="font-size:13px;color:#787878">este fue el anticipo del 50%. el resto se liquida al entregarte tu invitación.</p>'
      : '') +
    '<p>gracias por confiarnos algo tan importante.</p>' +
    '<p style="color:#787878;font-size:12px;margin-top:30px">memora · bymemora.mx</p>' +
    '</div>';

  MailApp.sendEmail({
    to: p.email,
    subject: '¡listo! tu invitación ya está pedida · ' + folio,
    htmlBody: html,
    name: CONFIG.NEGOCIO
  });
}

function fila(k, v) {
  return '<tr>' +
    '<td style="padding:7px 0;color:#787878;border-bottom:1px solid #eee">' + k + '</td>' +
    '<td style="padding:7px 0;text-align:right;border-bottom:1px solid #eee">' + (v || '—') + '</td>' +
    '</tr>';
}

function avisoInterno(folio, d, pago) {
  MailApp.sendEmail(CONFIG.MI_CORREO,
    'nuevo pedido · ' + folio,
    'Folio: ' + folio +
    '\nPareja: ' + d.contacto.nombre + ' y ' + d.contacto.pareja +
    '\nCorreo: ' + d.contacto.email +
    '\nWhatsApp: ' + d.contacto.telefono +
    '\n\nTipo: ' + d.invitacion.tipoNombre +
    '\nDiseño: ' + (d.invitacion.diseno || '—') +
    '\nTema: ' + d.invitacion.paleta + ' · ' + d.invitacion.fuentes +
    '\nExtras: ' + ((d.invitacion.extras || []).join(', ') || 'ninguno') +
    '\n\nTotal: $' + d.cotizacion.total +
    '\nA cobrar: $' + d.cotizacion.aCobrar + ' (' + d.cotizacion.modoPago + ')' +
    '\n\nEvento: ' + d.evento.nombres + ' · ' + d.evento.fecha + ' · ' + d.evento.ciudad +
    '\n\nLiga: ' + (pago || '—'));
}

/* ============================================================
   PRUEBA MANUAL
   Corre esta función desde el editor para verificar que el
   Sheets y los correos funcionan, sin tocar Mercado Pago.
   ============================================================ */
function prueba() {
  var demo = {
    tipoDoc: 'pedido',
    contacto: { nombre: 'prueba', pareja: 'prueba', email: CONFIG.MI_CORREO, telefono: '5512345678', conocimos: 'instagram' },
    invitacion: { tipo: 'pre', tipoNombre: 'wedding website pre-diseñado', diseno: 'odense', paleta: 'hueso', fuentes: 'clasica', extras: ['dominio'], idea: '', notasDiseno: '' },
    evento: { nombres: 'ana & luis', fecha: '2026-11-14', hora: '17:00', ciudad: 'tepoztlán', invitados: '120', ceremonia: '', ceremoniaDir: '', recepcion: '', recepcionDir: '', dresscode: '', dominio: 'anayluis', itinerario: '', regalos: '', notas: '' },
    cotizacion: { lineas: [{ nombre: 'wedding website pre-diseñado', precio: 2100 }, { nombre: 'dominio personalizado', precio: 600 }], total: 2700, modoPago: 'total', aCobrar: 2700, moneda: 'MXN' }
  };
  Logger.log(manejaPedido(demo).getContent());
}
