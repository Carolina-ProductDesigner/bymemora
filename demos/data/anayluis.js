/* ============================================================
   memora — datos de la invitación
   ------------------------------------------------------------
   Este archivo es lo ÚNICO que cambia entre una pareja y otra.
   El layout (odense.html) y el tema (css/themes.css) no se tocan.

   Para una pareja nueva: duplica este archivo, cambia los valores
   y apunta el <script src="..."> de odense.html al nuevo archivo.
   ============================================================ */

window.MEMORA_DATA = {

  slug: 'anayluis',

  pareja: {
    uno: 'ana',
    dos: 'luis',
    hashtag: '#anayluis2026'
  },

  evento: {
    // Formato ISO. De aquí sale la cuenta regresiva.
    fecha: '2026-11-14T17:00:00-06:00',
    fechaTexto: 'sábado 14 de noviembre, 2026',
    ciudad: 'tepoztlán, morelos'
  },

  portada: {
    eyebrow: 'nos casamos',
    frase: 'después de nueve años, un jardín, dos familias y un solo día.'
  },

  detalles: [
    {
      titulo: 'ceremonia',
      hora: '5:00 pm',
      lugar: 'capilla de san gabriel',
      direccion: 'av. del tepozteco 12, tepoztlán',
      mapa: 'https://maps.google.com'
    },
    {
      titulo: 'recepción',
      hora: '7:00 pm',
      lugar: 'hacienda san gabriel',
      direccion: 'camino a santo domingo s/n, tepoztlán',
      mapa: 'https://maps.google.com'
    }
  ],

  itinerario: [
    { hora: '4:30 pm', que: 'recepción de invitados' },
    { hora: '5:00 pm', que: 'ceremonia religiosa' },
    { hora: '6:30 pm', que: 'cóctel en el jardín' },
    { hora: '8:00 pm', que: 'cena' },
    { hora: '10:00 pm', que: 'fiesta' },
    { hora: '2:00 am', que: 'tornaboda' }
  ],

  codigo: {
    titulo: 'código de vestimenta',
    texto: 'formal de jardín. te recomendamos tacón bajo o de bloque: la ceremonia es sobre pasto.'
  },

  regalos: [
    { nombre: 'liverpool', dato: 'evento 51234567', link: '#' },
    { nombre: 'amazon', dato: 'mesa ana y luis', link: '#' },
    { nombre: 'sobre', dato: 'habrá buzón en la recepción', link: '' }
  ],

  rsvp: {
    fechaLimite: '30 de septiembre',
    texto: 'confírmanos antes del 30 de septiembre para poder apartar tu lugar.',
    link: '#'
  },

  galeria: 6,

  notas: [
    'el evento es solo para adultos.',
    'habrá transporte desde el centro de tepoztlán a las 4:00 pm.'
  ]
};
