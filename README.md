# memora — sitio web

Sitio estático (HTML + CSS + JS vanilla) para **memora**, estudio de invitaciones digitales.
Esta primera entrega cubre **estructura y layout** (desktop + mobile). Funcionalidad avanzada
y animaciones vienen en la siguiente iteración.

## Estructura

```
memora/
├── index.html          # markup completo del sitio
├── css/
│   └── styles.css      # estilos (mobile-first, breakpoint 1000px)
├── js/
│   └── main.js         # menú mobile, acordeón de planes, tabs
├── assets/             # aquí van las imágenes finales
└── README.md
```

## Sistema de diseño

**Colores**

| token | hex |
|---|---|
| `--gray-100` | `#EEEEEE` |
| `--gray-500` | `#787878` |
| `--black` | `#000000` |
| `--white` | `#FFFFFF` |

**Tipografías** (Google Fonts, cargadas desde `index.html`)

- `--font-display` → **Jomolhari** — títulos, precios, números
- `--font-body` → **Poppins** — navegación, párrafos, listas, botones
- `--font-logo` → **Instrument Serif** — logotipo (header y footer)

**Breakpoints**

- `< 640px` — mobile
- `640px – 999px` — tablet (steps a 2 columnas)
- `≥ 1000px` — desktop (planes a 2 columnas, steps a 4, nav completo)

## Placeholders de imagen

Todas las imágenes son `<div class="ph">` con textura diagonal. Variantes:

- `.ph--hero` / `.ph--wide` — bandas horizontales
- `.ph--plan` — imagen dentro de cada card

Para sustituir por una imagen real, reemplaza el div por un `<img>` o agrega
`background-image` a la clase correspondiente.

## Comportamiento

- **Mobile:** cards en acordeón (chevron), menú desplegable con el `+`
- **Desktop:** cards siempre abiertas en 2 columnas, nav horizontal
- Tabs de "¿cómo funciona?" cambian de estado activo (contenido pendiente)

## Uso local

No requiere build. Abre `index.html` o levanta un servidor:

```bash
python3 -m http.server 8000
```

## Publicar en GitHub

```bash
git init
git add .
git commit -m "estructura inicial del sitio memora"
git branch -M main
git remote add origin https://github.com/USUARIO/memora.git
git push -u origin main
```

Para GitHub Pages: Settings → Pages → Branch `main` / `root`.

## Pendientes

- [ ] Imágenes finales
- [ ] Contenido diferenciado por tab en "¿cómo funciona?"
- [ ] Biblioteca de pre-diseñados
- [ ] Formulario / cuestionario de pedido
- [ ] Animaciones de scroll y micro-interacciones

---

## Efectos (iteración 2)

### 1. Reveal fade in / fade out
Cualquier elemento con `data-reveal` aparece con fade + desplazamiento suave al entrar
al viewport y se desvanece al salir. Se controla con `IntersectionObserver`
(`rootMargin: -6% 0px -12% 0px`).

```html
<h2 data-reveal>título</h2>
<p data-reveal style="--d:1">entra 90 ms después</p>
<p data-reveal style="--d:2">entra 180 ms después</p>
```

- `--d` → índice de stagger (cada paso = 90 ms)
- `--rev-dur` → duración (default `1.05s`)
- Easing: `--ease-soft` = `cubic-bezier(.22,.61,.36,1)`

### 2. Stack de cards grises
Las cards `.plan` viven dentro de `.plans__stack` y usan `position: sticky`.
Cada una se ancla debajo de la anterior y la siguiente la va cubriendo; la card
tapada se escala y se atenúa para dar profundidad.

Tokens en `:root`:

| variable | mobile | desktop |
|---|---|---|
| `--stack-top` | `74px` | `100px` |
| `--stack-step` | `12px` | `22px` |
| `--stack-end` | `24px` | `40px` |

`js/main.js` calcula el `top` real de cada card:
`min(stackTop + i * stackStep, viewportHeight − alturaCard − stackEnd)`.
Así, si una card es más alta que la pantalla (caso mobile con el acordeón abierto),
se ancla por abajo y se alcanza a leer completa antes de que la cubra la siguiente.

El escalado/atenuación corre en `requestAnimationFrame` con suavizado `smoothstep`
(máx. `scale(0.945)` y `opacity(0.7)`).

### Accesibilidad
Con `prefers-reduced-motion: reduce` se desactivan reveals y stack: las cards vuelven
a flujo normal (`position: static`) y todo se muestra sin transiciones.

---

## Páginas (iteración 3)

```
index.html            # home
predisenadas.html     # catálogo de invitaciones pre-diseñadas
sobre-memora.html     # bio / de dónde nace memora
```

La navegación (desktop y mobile) ya apunta a las tres. La página actual se marca con
`class="is-current"` en el link correspondiente.

### predisenadas.html
Grid de 10 diseños (`malmo, odense, lund, oslo, flam, lulea, aarhus, orebro, tromso, alta`).
1 columna en mobile, 2 desde `640px`.

Cada tarjeta tiene:
- `seleccionar` → lleva al flujo de pedido
- `ver demo` / click en la imagen → abre el **modal** con el detalle

El contenido del modal se lee de los `data-*` del disparador, así que agregar un diseño
nuevo es solo duplicar el bloque `<article class="design">` y cambiar:

```html
<button class="design__open" type="button"
        data-name="bergen"
        data-tag="serif alta y mucho aire"
        data-desc="descripción corta del estilo.">
```

El modal es full-width por abajo en mobile (tipo sheet) y centrado a 2 columnas en desktop.
Cierra con la ✕, con click en el fondo o con `Esc`, y tiene trampa de foco.

### sobre-memora.html
Retrato + copy. En mobile la imagen va arriba a ancho completo, en desktop queda a 45% / 50%
con `column-gap: 5%`. El texto es lorem ipsum, listo para reemplazar.

Ambas páginas usan la sección de cierre `.closing--bare` (sin banda de imagen) y heredan
el reveal fade in/out del resto del sitio.

---

## Cortinilla de intro (iteración 4)

Video a pantalla completa con el logotipo blanco centrado. Dura ~5 s y se disuelve solo.

```
assets/intro.mp4    # placeholder, 1920×1080 · ~2.4 MB
```

### Línea de tiempo

| tiempo | qué pasa |
|---|---|
| `0 ms` | video en `object-fit: cover` + zoom lento (`introZoom`, 6.4 s) |
| `450 ms` | el logo entra: fade + subida de 10px + letter-spacing de `.16em` a `.005em` |
| `2050 ms` | aparece "saltar" abajo a la derecha |
| `4200 ms` | empieza la disolución |
| `5400 ms` | la cortinilla se elimina del DOM y el sitio revela su contenido |

Ajustables en `js/main.js`:

```js
var HOLD = 4200;   // ms visibles antes de disolverse
var FADE = 1200;   // ms de la disolución
```

### Detalles

- Se muestra **una vez por sesión** (`sessionStorage: memora:intro`), para no repetirla al
  navegar entre páginas. Para que salga siempre, borra el bloque `try { ...setItem... }`.
- Está en las tres páginas. El script inline del `<head>` decide antes de pintar,
  así que no hay parpadeo de contenido.
- Mientras corre, el scroll queda bloqueado y el reveal del sitio espera:
  se dispara con el evento `memora:intro-done`.
- Se salta con el botón "saltar", con click en cualquier parte o con `Esc`.
- Con `prefers-reduced-motion: reduce` no se muestra.
- Si el navegador bloquea el autoplay, queda el fondo negro con el logo: no rompe nada.

### Cambiar el video

Reemplaza `assets/intro.mp4` conservando el nombre. Recomendado: H.264, ≤1080p,
6–8 s y menos de 3 MB. Si pesa más, súbelo con Git LFS o sírvelo desde un CDN y
cambia el `src` del `<video class="intro-curtain__video">`.

---

## Personalizador de tema (iteración 5)

Dentro del modal de **cada** pre-diseñada, la vista previa ya no es una imagen fija:
es una mini-invitación que se repinta en vivo con la paleta y el paquete de fuentes
que elija la persona. Aplica a los 10 templates automáticamente — el modal es uno solo.

- **4 paletas:** `hueso` · `tinta` · `nieve` · `terracota`
- **4 paquetes de fuentes:** `clasica` · `editorial` · `romantica` · `moderna`
- La combinación se conserva al cerrar y abrir otro template
- El botón *seleccionar esta invitación* se lleva la elección en la URL:
  `index.html?diseno=odense&paleta=tinta&fuentes=editorial#pedir`

### Cómo funciona

Todo vive en un solo bloque de `css/styles.css`, bajo el comentario
`PERSONALIZADOR DE TEMAS`. Cada tema es un grupo de variables CSS colgado de un
atributo. Ese mismo bloque alimenta **la vista previa y el chip que lo selecciona**,
así que editas una vez y se actualizan los dos.

```css
[data-palette="hueso"]{
  --pv-bg:#F6F3EC;      /* fondo de la invitación            */
  --pv-line:#DDD5C2;    /* líneas, bordes, detalles suaves   */
  --pv-accent:#B08968;  /* acentos: "&", filete, botón       */
  --pv-ink:#2B2A26;     /* texto principal                   */
}

[data-fonts="clasica"]{
  --pv-display:"Jomolhari", Georgia, serif;             /* títulos  */
  --pv-body:"Poppins", Helvetica, Arial, sans-serif;    /* textos   */
}
```

Las cuatro barritas del chip de color son, en orden:
`--pv-bg` · `--pv-line` · `--pv-accent` · `--pv-ink`.

### Cambiar los colores de una paleta

Edita los hex del bloque `[data-palette="..."]`. Nada más. Ejemplo — volver `terracota`
más profunda:

```css
[data-palette="terracota"]{
  --pv-bg:#F2E3DC;
  --pv-line:#DBB9AC;
  --pv-accent:#A44A3C;
  --pv-ink:#2E1C17;
}
```

### Cambiar un paquete de fuentes

1. Carga la familia en el `<head>` de `predisenadas.html` (línea de Google Fonts).
2. Cambia `--pv-display` y `--pv-body` en el bloque `[data-fonts="..."]`.

```css
[data-fonts="editorial"]{
  --pv-display:"Bodoni Moda", Georgia, serif;
  --pv-body:"Inter", Helvetica, Arial, sans-serif;
}
```

Deja siempre un fallback (`Georgia, serif` / `Helvetica, Arial, sans-serif`) por si la
fuente tarda en cargar.

### Agregar una quinta paleta (o un quinto paquete)

**1 —** Agrega el bloque de variables en `css/styles.css`:

```css
[data-palette="oliva"]{
  --pv-bg:#F0F1E8;
  --pv-line:#D2D6BE;
  --pv-accent:#6B7B4A;
  --pv-ink:#23261B;
}
```

**2 —** Agrega el chip en `predisenadas.html`, dentro de
`<div class="picker__grid" role="radiogroup" aria-labelledby="labelPalettes">`:

```html
<button class="swatch" type="button" role="radio" aria-checked="false" data-palette="oliva">
  <span class="swatch__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
  <span class="swatch__name">oliva</span>
</button>
```

Para fuentes es igual, pero con `data-fonts` y este markup:

```html
<button class="fontchip" type="button" role="radio" aria-checked="false" data-fonts="nordica">
  <span class="fontchip__head">Encabezado</span>
  <span class="fontchip__body">Texto de párrafo</span>
  <span class="fontchip__name">nórdica</span>
</button>
```

No hay que tocar `js/main.js`: los chips se detectan solos por su clase
(`.swatch` / `.fontchip`) y por su atributo `data-*`.

> En desktop los chips van en 4 columnas. Si pasas de 4, cambia
> `.picker__grid{grid-template-columns:repeat(4,1fr)}` dentro del media query
> `@media (min-width:1000px)`.

### Cambiar el contenido de la vista previa

El maquetado de la mini-invitación está en `predisenadas.html`, en
`<div class="preview" id="preview">`. Los nombres, la fecha y la sede son placeholder:

```html
<p class="preview__eyebrow">nos casamos</p>
<h3 class="preview__names">ana <span class="preview__amp">&amp;</span> luis</h3>
<span class="preview__rule"></span>
<p class="preview__meta">sábado 14 de noviembre · 2026</p>
```

El nombre del template (arriba a la derecha, en la barra) se inyecta solo desde el
`data-name` de la tarjeta.

### Nota sobre las transiciones

Los colores cruzan con una transición de `.55s`; las fuentes cambian de golpe
(el navegador no interpola `font-family`). Si quieres suavizarlo, agrega un
fade corto al `.preview` al cambiar de paquete.
