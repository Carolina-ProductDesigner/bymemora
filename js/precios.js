/* ============================================================
   memora — PRECIOS
   ------------------------------------------------------------
   Este es el ÚNICO archivo que tocas para cambiar precios.
   Todo está en pesos mexicanos (MXN), sin centavos.

   Al editar:
     · No cambies las claves (id). Se guardan en el Google Sheets
       y en el histórico de pedidos.
     · Sí puedes cambiar libremente nombre, precio y nota.
     · Para desactivar un extra sin borrarlo: activo: false
   ============================================================ */

window.MEMORA_PRECIOS = {

  moneda: 'MXN',

  /* ---------- Anticipo ----------
     0.5  = se puede pagar el 50% ahora y 50% a la entrega
     null = solo pago completo (se oculta la opción) */
  anticipo: 0.5,

  /* ---------- Tipos de invitación (paso 2) ---------- */
  tipos: [
    {
      id: 'pre',
      nombre: 'wedding website pre-diseñado',
      precio: 2100,
      desde: false,
      nota: 'precio base sin extras.',
      pideDiseno: true              // desbloquea el paso "selecciona tu pre-diseñada"
    },
    {
      id: 'personalizado',
      nombre: 'wedding website personalizado',
      precio: 4400,
      desde: true,                  // se muestra como "desde $4400"
      nota: 'el precio final se ajusta según el alcance.',
      pideDiseno: false
    },
    {
      id: 'pdf',
      nombre: 'invitación digital en pdf',
      precio: 1850,
      desde: false,
      nota: 'pdf interactivo para enviar por whatsapp.',
      pideDiseno: false
    },
    {
      id: 'countdown',
      nombre: 'countdown para tu evento',
      precio: 1200,
      desde: false,
      nota: 'una landing con cuenta regresiva.',
      pideDiseno: false
    }
  ],

  /* ---------- Extras (paso 4) ----------
     "soloPara" limita el extra a ciertos tipos.
     Si lo omites, aplica para todos. */
  extras: [
    {
      id: 'dominio',
      nombre: 'dominio personalizado',
      precio: 600,
      nota: 'tunombre.com en lugar de bymemora.mx/tunombre',
      soloPara: ['pre', 'personalizado'],
      activo: true
    },
    {
      id: 'galeria',
      nombre: 'galería extendida',
      precio: 350,
      nota: 'hasta 60 fotos en lugar de 15',
      soloPara: ['pre', 'personalizado'],
      activo: true
    },
    {
      id: 'musica',
      nombre: 'música de fondo',
      precio: 250,
      nota: 'una canción con control de play/pausa',
      soloPara: ['pre', 'personalizado'],
      activo: true
    },
    {
      id: 'ingles',
      nombre: 'versión en inglés',
      precio: 700,
      nota: 'la invitación completa en dos idiomas',
      activo: true
    },
    {
      id: 'hospedaje',
      nombre: 'sección de hospedaje',
      precio: 300,
      nota: 'hoteles sugeridos con links y distancias',
      soloPara: ['pre', 'personalizado'],
      activo: true
    },
    {
      id: 'rsvp_plus',
      nombre: 'rsvp con control de acompañantes',
      precio: 400,
      nota: 'pases numerados y conteo automático',
      soloPara: ['pre', 'personalizado'],
      activo: true
    },
    {
      id: 'express',
      nombre: 'entrega express',
      precio: 800,
      nota: 'lista en 48 horas en lugar de 72',
      activo: true
    },
    {
      id: 'ronda',
      nombre: 'ronda extra de cambios',
      precio: 450,
      nota: 'una cuarta ronda además de las 3 incluidas',
      activo: true
    }
  ]
};
