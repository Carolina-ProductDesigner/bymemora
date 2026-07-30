/* ============================================================
   memora — CONTACTO
   ------------------------------------------------------------
   Tus datos de contacto en UN solo lugar. Edita aquí y se
   actualiza en todo el sitio (caja de contacto + botones).

   · WHATSAPP: solo números, con lada de país. México = 52.
     Ejemplo CDMX: '525512345678'  (52 + 55 + número)
   · EMAIL: tu correo de informes
   · MENSAJE_WA: el texto con el que se abre el chat (opcional)
   ============================================================ */

window.MEMORA_CONTACTO = {
  whatsapp: '525500000000',           // ← cámbialo por tu número real
  whatsappBonito: '+52 55 0000 0000', // ← cómo se ve escrito
  email: 'hola@bymemora.mx',          // ← tu correo
  instagram: 'bymemora',
  mensajeWa: 'hola memora, me interesa una invitación para mi evento :)',
  asuntoMail: 'quiero información sobre una invitación'
};

/* --- Aplica los datos a toda la página (no necesitas tocar esto) --- */
(function () {
  'use strict';
  var C = window.MEMORA_CONTACTO;

  var waHref = 'https://wa.me/' + C.whatsapp.replace(/\D/g, '') +
               '?text=' + encodeURIComponent(C.mensajeWa || '');
  var mailHref = 'mailto:' + C.email +
                 '?subject=' + encodeURIComponent(C.asuntoMail || '');

  function set(id, attr, val) {
    var el = document.getElementById(id);
    if (el) { attr === 'text' ? (el.textContent = val) : el.setAttribute(attr, val); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Caja de contacto (sobre-memora)
    set('waLink', 'href', waHref);
    set('waText', 'text', C.whatsappBonito);
    set('mailLink', 'href', mailHref);
    set('mailText', 'text', C.email);

    // Todos los botones "escríbeme un mensaje" repartidos por el sitio.
    // En la página de contacto hacen scroll a la caja; en otras, van a ella.
    var enContacto = !!document.getElementById('contacto');
    document.querySelectorAll('[data-contacto]').forEach(function (a) {
      a.setAttribute('href', enContacto ? '#contacto' : 'sobre-memora.html#contacto');
    });
  });
})();
