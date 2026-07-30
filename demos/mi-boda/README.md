# 💍 Wedding Website Template

Sitio de boda editorial premium. Inspirado en el estilo de **Poeza Bride** — tipografía masiva, animaciones cinematográficas, 100% responsivo en mobile.

---

## 📁 Estructura del proyecto

```
boda-website/
├── index.html              ← Página principal
├── css/
│   └── styles.css          ← Todos los estilos (mobile-first)
├── js/
│   └── main.js             ← Animaciones, galería, countdown, RSVP
├── data/
│   └── config.js           ← ⭐ EDITA AQUÍ: nombres, colores, fonts, imágenes
├── assets/
│   ├── images/             ← Pon tus fotos aquí (.jpg, .webp, .png)
│   │   ├── hero-inline.jpg     (foto pequeña flotante en el hero)
│   │   ├── hero-bg.jpg         (imagen principal del hero)
│   │   ├── story-01.jpg        (historia momento 1)
│   │   ├── story-02.jpg        (historia momento 2)
│   │   ├── story-03.jpg        (historia momento 3)
│   │   ├── gallery-01.jpg      (galería)
│   │   └── ...
│   └── videos/             ← Videos opcionales (.mp4)
│       └── ejemplo.mp4
├── apps-script/
│   └── code.gs             ← Código Google Apps Script para el RSVP
└── README.md               ← Este archivo
```

---

## ⚡ Inicio rápido

### 1. Clona o descarga el repositorio

```bash
git clone https://github.com/tuusuario/boda-website.git
cd boda-website
```

### 2. Edita `data/config.js`

Este es el **único archivo que necesitas editar** para personalizar todo:

```js
couple: {
  name1: "TU_NOMBRE",
  name2: "NOMBRE_PAREJA",
  date:  "14 DE JUNIO · 2026",
  venue: "HACIENDA DE LOS MORALES",
  // ... etc
}
```

### 3. Agrega tus imágenes

Coloca tus fotos en `assets/images/` con los nombres indicados arriba, o cambia los `src` en `data/config.js`.

### 4. Abre en el navegador o sube a GitHub Pages

Para desarrollo local usa un servidor (el fetch de config necesita HTTP):

```bash
# Opción 1: Python
python3 -m http.server 8080

# Opción 2: Node
npx serve .

# Opción 3: VS Code → Live Server extension
```

Para producción, sube a **GitHub Pages** (gratuito):
1. Push a tu repo en GitHub
2. Settings → Pages → Branch: main, folder: / (root)
3. Tu sitio estará en `https://tuusuario.github.io/boda-website`

---

## 🎨 Personalización

### Colores

Edita en `data/config.js`:

```js
colors: {
  background: "#FFFFFF",   // fondo del sitio
  text:       "#0A0A0A",   // texto principal
  olive:      "#3C4A2D",   // verde olivo oscuro (acento principal)
  oliveMid:   "#6B7D56",   // verde olivo medio
  oliveMist:  "#CDD5BE",   // verde olivo muy claro
  olivePale:  "#EEF0E9",   // fondo secciones alternadas
}
```

### Tipografía

Cambia el font (debe ser de Google Fonts):

```js
fonts: {
  family:    "Barlow",     // nombre del font
  googleUrl: "https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,900&display=swap"
}
```

Opciones editoriales recomendadas:
- `"Barlow"` — grotesca wide, muy editorial
- `"DM Sans"` — moderna y limpia
- `"Syne"` — fashionista, geométrica
- `"Space Grotesk"` — tech-editorial
- `"Outfit"` — elegante y contemporánea

### Videos en lugar de imágenes

En cualquier sección, cambia `type: "image"` por `type: "video"`:

```js
story: [
  {
    number: "01",
    title:  "EL PRIMER ENCUENTRO",
    body:   "...",
    media: {
      type:   "video",
      src:    "assets/videos/mi-video.mp4",
      poster: "assets/images/poster.jpg"   // thumbnail mientras carga
    }
  }
]
```

Los videos se reproducen automáticamente en loop y silencio.

---

## 📋 Integración RSVP con Google Sheets

### Paso 1: Crea tu Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com)
2. Crea una nueva hoja
3. En la pestaña (parte inferior), renómbrala `RSVP`
4. En la fila 1, añade estos encabezados:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Nombre | Email | Confirmación | Acompañantes | Mensaje | Fecha |

### Paso 2: Crea el Apps Script

1. En tu Google Sheet: **Extensiones → Apps Script**
2. Borra todo el código que hay por defecto
3. Copia y pega el contenido de `apps-script/code.gs`
4. Cambia `TU_SPREADSHEET_ID_AQUI` por el ID de tu hoja
   - El ID está en la URL: `docs.google.com/spreadsheets/d/**ID_AQUI**/edit`
5. (Opcional) cambia `TU_EMAIL_AQUI@gmail.com` para recibir notificaciones

### Paso 3: Implementa como web app

1. Haz clic en **Implementar → Nueva implementación**
2. Tipo de implementación: **Aplicación web**
3. Ejecutar como: **Yo (tu-email@gmail.com)**
4. Quién tiene acceso: **Cualquier usuario**
5. Clic en **Implementar**
6. Copia la **URL de la aplicación web**

### Paso 4: Configura en el sitio

En `data/config.js`:

```js
googleSheets: {
  scriptUrl: "https://script.google.com/macros/s/TU_ID_AQUI/exec",
}
```

---

## 📱 Notas de responsividad mobile

El sitio está construido **mobile-first**. Todo funciona en:
- iPhone SE (375px) hasta pantallas 4K
- iOS Safari 15+ y Android Chrome
- La galería en mobile usa CSS scroll snap con touch nativo
- En desktop usa scroll horizontal sticky con JS
- Menú hamburger con overlay para mobile
- Inputs con `font-size: 16px` para prevenir zoom en iOS
- `100dvh` para secciones fullscreen (evita el bug de la barra de Safari)
- `viewport-fit=cover` para iPhones con notch

---

## 🚀 Deploy a GitHub Pages

```bash
# 1. Inicializa git (si no lo has hecho)
git init
git add .
git commit -m "Mi sitio de boda ✨"

# 2. Sube a GitHub
git remote add origin https://github.com/tuusuario/mi-boda.git
git push -u origin main

# 3. Activa Pages
# GitHub → tu repo → Settings → Pages → Deploy from branch → main
```

Tu sitio estará en: `https://tuusuario.github.io/mi-boda`

---

## ✏️ Créditos y personalización avanzada

Para cambios avanzados de layout o animaciones, edita directamente:
- `css/styles.css` — todos los estilos, bien comentados
- `js/main.js` — toda la lógica, funciones bien separadas

---

*Hecho con ❤️ para el día más especial.*
