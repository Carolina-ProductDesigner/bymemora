/* ═══════════════════════════════════════════════════════════
   CONFIGURACIÓN DE LA BODA
   Edita este archivo para personalizar todo el sitio.
   ═══════════════════════════════════════════════════════════ */

const WEDDING_CONFIG = {

  /* ── PAREJA ─────────────────────────────────────────── */
  couple: {
    name1:          "VALENTINA",
    name2:          "SANTIAGO",
    // Líneas del hero — ahora son los nombres (puedes cambiarlas)
    introLine1:     "VALENTINA Y",   // línea 1 del gran título
    introLine2:     "SANTIAGO",      // línea 2 del gran título
    // Datos del evento
    date:           "14 DE JUNIO 2026",
    dateISO:        "2026-06-14T18:00:00-06:00",
    city:           "POLANCO, CIUDAD DE MÉXICO",  // ← ciudad separada
    venue:          "HACIENDA DE LOS MORALES",
    address:        "POLANCO, CIUDAD DE MÉXICO",
    ceremonyTime:   "6:00 PM",
    receptionTime:  "7:30 PM",
    dresscode:      "FORMAL",
    rsvpDeadline:   "1 DE MAYO DE 2026",
    hashtag:        "#ValSan2026",
  },

  /* ── TEXTOS / SECCIONES ──────────────────────────────── */
  text: {
    storyLabel:       "NUESTRA HISTORIA",
    storyHeadline1:   "DOS CAMINOS,",
    storyHeadline2:   "UN DESTINO",
    detailsHeadline1: "LA GRAN",
    detailsHeadline2: "CELEBRACIÓN",
    galleryLabel:     "GALERÍA",
    rsvpHeadline1:    "CONFIRMA",
    rsvpHeadline2:    "TU LUGAR",
    countdownLabel:   "EL GRAN DÍA SE ACERCA",
  },

  /* ── HISTORIA (cards de momentos) ───────────────────── */
  story: [
    {
      number: "01",
      title:  "EL PRIMER ENCUENTRO",
      body:   "Una tarde de verano en Coyoacán, entre libros y café, fue donde todo comenzó. Había algo inexplicable en ese instante — ambos lo sentimos sin decirlo.",
      media:  { type: "image", src: "assets/images/story-01.jpg" }
      // Para video: { type: "video", src: "assets/videos/story-01.mp4", poster: "assets/images/story-01-poster.jpg" }
    },
    {
      number: "02",
      title:  "TRES AÑOS DE AVENTURAS",
      body:   "Viajamos, discutimos, reímos y crecimos juntos. Aprendimos que el amor es elegir cada día a alguien que se convierte en tu hogar.",
      media:  { type: "image", src: "assets/images/story-02.jpg" }
    },
  ],

  /* ── GALERÍA ─────────────────────────────────────────── */
  gallery: [
    { type: "image", src: "assets/images/gallery-01.jpg", caption: "LA CEREMONIA" },
    { type: "image", src: "assets/images/gallery-02.jpg", caption: "EL PRIMER BAILE" },
    { type: "image", src: "assets/images/gallery-03.jpg", caption: "NUESTRO VIAJE" },
    { type: "image", src: "assets/images/gallery-04.jpg", caption: "MOMENTOS ÚNICOS" },
    { type: "image", src: "assets/images/gallery-05.jpg", caption: "PARA SIEMPRE" },
    // Video example:
    // { type: "video", src: "assets/videos/gallery-06.mp4", poster: "assets/images/gallery-06-poster.jpg", caption: "LA CELEBRACIÓN" },
  ],

  /* ── MEDIA HERO ──────────────────────────────────────── */
  media: {
    // Foto pequeña flotante entre líneas del intro
    heroInline: { type: "image", src: "assets/images/hero-inline.jpg" },
    // Imagen/video principal del hero (visible al hacer scroll)
    heroBg:     { type: "image", src: "assets/images/hero-bg.jpg" },
    // Para video: { type: "video", src: "assets/videos/hero.mp4", poster: "assets/images/hero-poster.jpg" }
  },

  /* ── COLORES ─────────────────────────────────────────── */
  colors: {
    background:  "#FFFFFF",
    text:        "#0A0A0A",
    olive:       "#3C4A2D",       // verde olivo oscuro
    oliveMid:    "#6B7D56",       // verde olivo medio
    oliveMist:   "#CDD5BE",       // verde olivo muy claro (fondos suaves)
    olivePale:   "#EEF0E9",       // casi blanco con tono olivo
    gray:        "#E6E6E0",       // gris claro para cards
    warmGray:    "#888878",       // gris cálido para labels
  },

  /* ── TIPOGRAFÍA ──────────────────────────────────────── */
  fonts: {
    family:    "Work Sans",
    googleUrl: "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,300;0,600;0,700;0,800;1,300&display=swap",
  },


  /* ── MESA DE REGALOS ─────────────────────────────────── */
  gifts: [
    {
      name: "LIVERPOOL",
      desc: "MESA DE REGALOS EN TIENDA Y EN LÍNEA",
      linkText: "VER MESA →",
      linkUrl: "https://www.liverpool.com.mx",
    },
    {
      name: "TRANSFERENCIA",
      desc: "CLABE: 000 000 000 000 000 000\nBANCO: BBVA · A NOMBRE DE: VALENTINA",
      linkText: "TRANSFERENCIA DIRECTA",
      linkUrl: "",   // dejar vacío si no hay link
    },
    {
      name: "LUNA DE MIEL",
      desc: "CONTRIBUYE A NUESTRA LUNA DE MIEL CON UN APORTE DIRECTO",
      linkText: "CONTRIBUIR →",
      linkUrl: "#",
    },
  ],

  /* ── HOSPEDAJES ──────────────────────────────────────── */
  hotels: [
    {
      stars: "★★★★★",
      name: "CAMINO REAL POLANCO",
      distance: "5 MIN DEL VENUE",
      address: "MARIANO ESCOBEDO 700\nPOLANCO, CDMX",
      linkUrl: "https://www.caminoreal.com",
    },
    {
      stars: "★★★★★",
      name: "INTERCONTINENTAL PRESIDENTE",
      distance: "8 MIN DEL VENUE",
      address: "CAMPOS ELÍSEOS 218\nPOLANCO, CDMX",
      linkUrl: "https://www.ihg.com",
    },
    {
      stars: "★★★★",
      name: "KRYSTAL GRAND SUITES",
      distance: "10 MIN DEL VENUE",
      address: "LIVERPOOL 155\nJUÁREZ, CDMX",
      linkUrl: "https://www.krystal.com.mx",
    },
  ],

  /* ── GOOGLE SHEETS (RSVP) ────────────────────────────── */
  // Sigue el README.md para obtener tu URL
  googleSheets: {
    scriptUrl: "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE",
  },

};
