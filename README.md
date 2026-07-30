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

---

## Demos reales (iteración 6) — el piloto `odense`

La pregunta era: ¿hay que programar 160 sitios (10 templates × 4 paletas × 4 fuentes)?
No. **Tema y layout son capas separadas**, así que se suman en vez de multiplicarse:
**10 layouts + 8 bloques de tema.**

```
demos/
├── odense.html            # el layout (uno por template)
├── css/demo.css           # estilos del layout — cero colores escritos a mano
├── js/demo.js             # motor genérico: datos, countdown, reveal, tema
└── data/anayluis.js       # los datos de UNA pareja
```

### Las tres capas

| capa | archivo | cuántas hay |
|---|---|---|
| **tema** (color + fuentes) | `css/themes.css` | 4 paletas + 4 packs, compartidas por todo |
| **layout** (estructura) | `demos/odense.html` + `demos/css/demo.css` | una por template |
| **datos** (la pareja) | `demos/data/anayluis.js` | una por cliente |

El demo lee el tema de la URL antes de pintar:

```
demos/odense.html?paleta=tinta&fuentes=editorial
```

Y carga `css/themes.css` — **el mismo archivo** que usa el personalizador del modal.
Por eso lo que ves en la vista previa es exactamente lo que abre el demo.

### La regla de oro

En `demos/css/demo.css` **no se escribe ni un hex**. Todo sale de:

`--pv-bg` · `--pv-line` · `--pv-accent` · `--pv-ink` · `--pv-display` · `--pv-body`

Si un template necesita un quinto color, se agrega el token a las **cuatro** paletas
de `themes.css`, nunca al template.

### La vista previa del modal ya es el demo

El recuadro del modal es un `<iframe>` del demo real renderizado a ancho de escritorio
y escalado a 40% (`transform: scale(.4)`). Al cambiar de paleta o fuente, el modal manda
un `postMessage` y el iframe se repinta **sin recargar**:

```js
frame.contentWindow.postMessage({ type:'memora:theme', palette:'tinta', fonts:'editorial' }, '*');
```

Una sola fuente de verdad: es imposible que la vista previa y el demo se desincronicen.

Los templates que **todavía no tienen demo** caen automáticamente en la maqueta CSS
(`#previewMock`) y su link *abrir demo completo* se apaga. Hoy solo `odense` tiene demo.

### Agregar el demo de otro template

**1 —** Duplica `demos/odense.html` → `demos/lund.html` y cambia la estructura a gusto.
Reutiliza `demo.css` o crea `demos/css/lund.css` (siempre con tokens, nunca hex).

**2 —** En `predisenadas.html`, agrega el atributo al `<button class="design__open">`:

```html
<button class="design__open" type="button"
        data-name="lund"
        data-demo="demos/lund.html"
        data-tag="minimal, todo en una vista"
        data-desc="...">
```

Listo. El iframe, el link de demo completo y el paso de parámetros se activan solos.

### Datos de una pareja nueva

Duplica `demos/data/anayluis.js`, cambia los valores y apunta el `<script src>` del
template. Los campos se inyectan por `data-f="ruta.del.dato"`:

```html
<p class="cover__date" data-f="evento.fechaTexto"></p>
```

La cuenta regresiva sale sola de `evento.fecha` (formato ISO con zona horaria).

> **Nota:** los datos van en un `.js` (`window.MEMORA_DATA = {...}`) y no en un `.json`
> a propósito: así el demo abre con doble clic desde el disco. Cuando esté en un servidor
> real, cambiar a `fetch('data/anayluis.json')` es un renglón.

### Por qué esto importa más allá del marketing

Este mismo motor es el producto. La invitación que entregas a una pareja es
*el demo + su archivo de datos*:

```
demos/odense.html?paleta=tinta&fuentes=editorial   →   bymemora.mx/anayluis
```

El trabajo de construir los demos no se tira: es la línea de producción.

---

## Templates externos (los que ya viven en Vercel)

`data-demo` acepta **rutas locales y URLs completas por igual**. Un template que ya
está desplegado en otro proyecto entra al catálogo sin moverlo de lugar:

```html
<button class="design__open" type="button"
        data-name="malmo"
        data-demo="https://wedding-minimalistinvite.vercel.app/"
        ...>
```

Ya quedaron conectados dos:

| slot | template |
|---|---|
| `malmo` | `wedding-minimalistinvite.vercel.app` |
| `alta` | `templatetwo-five.vercel.app` |

*(si prefieres asignarlos a otro slot, cambia el `data-demo` de la tarjeta que quieras)*

### Los tres estados de la vista previa

El badge abajo a la izquierda del recuadro lo dice siempre:

| badge | qué significa |
|---|---|
| `maqueta · este template aún no tiene demo` | no hay `data-demo`, se muestra la maqueta CSS |
| `demo real · falta conectar el tema` | el sitio carga, pero no responde al personalizador |
| `vista previa en vivo` | todo conectado: cambia de paleta sin recargar |

Los dos de Vercel arrancan en el estado de en medio hasta que les instales el adaptador.

### Conectarlos

Todo está en **`demos/adapter/`**:

- `memora-theme.js` — el adaptador, listo para copiar a `/public` del template
- `LEEME.md` — los 5 pasos, con la tabla de equivalencias de colores

Resumen: cargar `themes.css`, pegar `memora-theme.js`, cambiar los hex por tokens
(`--pv-bg`, `--pv-ink`, `--pv-accent`, `--pv-line`) y listo. No se reescribe el template.

### El detalle del template de Camila & Romina

Tiene una pantalla de entrada con botón *Entrar* que en una miniatura no se aprecia.
El adaptador le pone la clase `memora-embed` al `<html>` cuando está dentro del modal,
así que se resuelve con una regla:

```css
.memora-embed .intro-screen { display: none !important; }
```

---

## Catálogo reducido a 6

`predisenadas.html` ahora muestra `malmo · odense · lund · oslo · flam · lulea`.
Los demos conectados quedaron así:

| slot | demo |
|---|---|
| `malmo` | `wedding-minimalistinvite.vercel.app` |
| `odense` | `demos/odense.html` (local) |
| `lulea` | `templatetwo-five.vercel.app` |

Para volver a agregar diseños, duplica un `<article class="design">` y actualiza
también la lista `DISENOS` al inicio de `js/pedido.js` (el cuestionario los repite).

---

## Cuestionario de pedido (iteración 7)

```
pedir-mi-invitacion.html   # el cuestionario de 6 pasos
gracias.html               # a donde vuelve la pareja después de pagar
js/precios.js              # ← el único archivo de precios
js/pedido.js               # stepper, validación, cotización, envío
apps-script/Codigo.gs      # el backend (Sheets + Mercado Pago + correos)
apps-script/LEEME.md       # instalación paso a paso, 25 min
```

### Los 6 pasos

1. **tus datos** — nombre, pareja, correo, whatsapp
2. **tipo de invitación** — las 4 opciones con su precio
3. **selecciona tu pre-diseñada** — los 6 diseños + paleta + fuentes
   *(si eligió "personalizado", el paso cambia solo a un campo de idea/inspiración)*
4. **diseño y extras** — 8 extras con precio, la cotización se actualiza al instante
5. **información del evento** — fecha, sedes, itinerario, mesa de regalos…
6. **revisa y paga** — resumen completo, desglose, pago total o anticipo 50%

### Lo que ya está conectado

- El botón *seleccionar esta invitación* del modal llega al cuestionario **con el
  diseño, la paleta y las fuentes ya elegidas** y arranca en el paso 2
- Los CTA *quiero esta opción* de la home llegan con su tipo pre-seleccionado
- Lo que la pareja escribe se guarda en su navegador: si recarga, no pierde nada
- Validación por paso, con foco automático en el primer campo con error

### Precios

**Todo en `js/precios.js`.** No hay precios en ningún otro archivo.

```js
tipos:  [{ id:'pre', nombre:'...', precio:2100, desde:false, pideDiseno:true }]
extras: [{ id:'dominio', nombre:'...', precio:600, soloPara:['pre'], activo:true }]
anticipo: 0.5   // null = solo pago completo
```

- `soloPara` limita un extra a ciertos tipos (ej. "dominio" no aplica al pdf)
- `activo:false` esconde un extra sin borrarlo
- **Nunca cambies los `id`**: quedan guardados en el histórico del Sheets

### El backend

Google Apps Script hace de servidor, gratis y sin infraestructura:

1. Escribe el pedido en tu Google Sheets (estatus `pendiente de pago`)
2. Crea la preferencia de Mercado Pago y devuelve la liga
3. Manda correo a la pareja (folio + desglose + liga) y aviso a ti
4. Al confirmarse el pago, el webhook pasa el renglón a `pagado` y dispara el
   correo **"tu invitación ya está pedida"**

Instalación completa en `apps-script/LEEME.md`.

> **El token de Mercado Pago va en las Propiedades del script, nunca en el sitio.**
> Crear un cobro requiere una llave secreta; si viviera en el HTML cualquiera podría
> cobrar a tu nombre. Por eso el paso de pago necesita este backend y no puede
> resolverse solo con JavaScript en el navegador.

### Modo prueba

Mientras `ENDPOINT` esté vacío en `js/pedido.js`, el cuestionario funciona completo
—stepper, validación, cotización— y al enviar te muestra el JSON exacto que se
mandaría. Así puedes probar todo el flujo antes de configurar nada.

### Pendientes de esta parte

- [ ] Subir imágenes reales a las tarjetas de diseño del paso 3
- [ ] Página de términos del servicio (hoy el checkbox no enlaza a nada)
- [ ] Recordatorio automático a quien no pagó en 48 h (se hace con un
      *activador por tiempo* en Apps Script)


---

## Modal de confirmación de elección (iteración 8)

Al dar *seleccionar esta invitación* dentro del modal de un template, ya no salta
directo al cuestionario: aparece una confirmación que repite la elección y ofrece
una salida a quien todavía quiere ver más.

- **título:** ¡buena elección!
- **cuerpo:** estás seleccionando *(diseño)* con la variante de color *(paleta)* y la
  tipografía *(paquete)* — los tres se leen en vivo de lo que la persona eligió
- **quiero seguir explorando** (secundario) → cierra todo y vuelve a la parrilla
- **¡sí! sigamos el proceso** (primario) → va al cuestionario con la elección puesta

Vive en `predisenadas.html` (`#confirmModal`) y su lógica está al final del bloque
del modal de demo en `js/main.js`. Como el destino se arma en `selectURL`, sigue
mandando `?tipo=pre&diseno=...&paleta=...&fuentes=...` igual que antes.


---

## Flujo de selección revisado (iteración 9)

El CTA de cada tarjeta del catálogo cambió de "seleccionar" a **"explorar este template"**.
El recorrido completo quedó así:

1. **tarjeta → explorar este template** → abre el modal del template
2. dentro del modal: elige **paleta** y **tipografía**, y puede dar
   **ver template con mi selección** para abrir el demo real con su elección aplicada
3. **seleccionar esta invitación** → modal de confirmación (¡buena elección!)
4. **¡sí! sigamos el proceso** → cuestionario **directo al paso de extras**

### Por qué salta a extras

Como al llegar del catálogo ya están definidos el tipo (`pre`) y el diseño, no tiene
sentido volver a preguntarlos. La liga lleva `&paso=extras` y el cuestionario abre en
el paso 4.

Los pasos que se saltó (datos, tipo, diseño) **no se pierden**: al intentar pagar en el
paso 6, el cuestionario valida del 1 al 5 y, si falta algo, regresa a la persona al
primer paso incompleto. O sea, puede llenar sus datos con el botón *atrás* o cuando el
sistema se lo pida antes de cobrar. Nadie paga con datos faltantes.

`?paso=extras` es genérico: `?paso=3` abriría en el paso 3, etc.


---

## Códigos de descuento (iteración 10)

En el paso de pago aparece "¿tienes un código de descuento?". Al aplicarlo, la
cotización muestra el descuento y baja el total; ese total es el que va a Mercado Pago.

**Los códigos se administran desde el Google Sheets**, en la pestaña `descuentos`
(el backend la crea sola). Crear un código = escribir un renglón. Apagarlo = poner
`no` en la columna *activo*. No hace falta panel de administrador ni tocar código.

Soporta porcentaje (`20` = 20%) o monto fijo (`500` = $500), con límite de usos y
fecha de vencimiento opcionales. El contador de usos sube solo al confirmarse el pago.

**Seguridad:** el descuento se valida y se recalcula en el servidor (Apps Script
leyendo tu Sheets), nunca en el navegador. El precio que se cobra no puede falsificarse
editando la página. Por eso los códigos solo operan con el `ENDPOINT` configurado;
en modo prueba el sitio lo indica y no aplica descuentos falsos.

Guía completa de administración en `apps-script/LEEME.md`.


---

## Prueba de template externo con temas (iteración 11)

Se integró el template completo **mi-boda** (Valentina & Santiago) al slot `flam` del
catálogo, como prueba de que un template ajeno puede tomar las paletas y fuentes de memora.

```
demos/mi-boda/
├── index.html            # el template (con una línea añadida: carga el adaptador)
├── js/memora-theme.js    # ← el adaptador que traduce los temas de memora
├── css/styles.css        # + un bloque memora al final (fuente display + transición)
└── data/config.js        # sin cambios: sus colores propios siguen ahí
```

### Cómo se conectó

Este template ya estaba muy bien hecho: leía sus colores y fuente de `config.js` y los
aplicaba con variables CSS. El adaptador (`js/memora-theme.js`) hace tres cosas:

1. Lee `?paleta=` y `?fuentes=` de la URL (y escucha los cambios del modal)
2. **Traduce** los 4 tokens de memora a las 8 variables del template

   | memora | → | template |
   |---|---|---|
   | `--pv-bg` | → | `--bg` |
   | `--pv-ink` | → | `--ink` |
   | `--pv-accent` | → | `--olive` (+ derivados mid/mist/pale por mezcla) |
   | `--pv-line` | → | `--gray` |

3. Solo toma el control si hay parámetros de memora en la URL. Si abres el template
   solo, sigue usando su `config.js` normal.

### Lo importante para los que faltan

Cuando este template tenga **sus propias** paletas y packs (los que tú definas), solo se
editan los objetos `PALETAS` y `FUENTES` de `demos/mi-boda/js/memora-theme.js`. La tabla
de traducción (el "MAPEO") ya queda hecha; no se vuelve a tocar.

Como el template usa 8 roles de color y memora maneja 4, los 4 tonos intermedios
(`olive-mid`, `olive-mist`, `olive-pale`, `warm`) se **derivan** mezclando el acento o
el texto con el fondo. Así una sola paleta de 4 colores llena las 8 variables de forma
coherente, en claro y en oscuro.

> Las imágenes del template son placeholders (no venían en el zip), así que en la vista
> previa se ven como textura gris. Al subir las fotos reales a `assets/images/` se ven.


---

## Transición entre páginas (iteración 12)

Al cambiar de página, el **contenido** de la página nueva entra **deslizándose desde
arriba** con un fundido suave (estilo Sage East); al salir, sube y se desvanece.
No es una cortina que tapa: se mueve el contenido en sí.

Vive en `js/transicion.js` y se engancha sola a los links internos.

- Se anima `<main>` + `<footer>`. El `<header>` se queda quieto, así el menú no salta.
- **Salida:** 0.5 s (sube y se desvanece) · **Entrada:** 0.8 s (baja a su lugar)
- Ignora: enlaces externos, correo, whatsapp, descargas, anclas `#`, y Cmd/Ctrl+click
- Con `prefers-reduced-motion: reduce` no se anima

Para excluir un link: `data-no-transition`. Duraciones ajustables en `transicion.js`
(`OUT`) y en el CSS (`pageOut` / `pageIn`).


---

## Hero con video (iteración 13)

La home cambió a un hero **a pantalla completa con video de fondo** (estilo The Footprint
Firm): el video llena la pantalla, con un velo oscuro degradado y el texto encima, abajo
a la izquierda.

- Titular grande: **"el evento siempre llega"**
- Arriba, en chico: "invitaciones para todos" (eyebrow)
- Abajo, la frase de apoyo reducida
- El **header se vuelve transparente y blanco** mientras el hero cubre la pantalla, y
  pasa a sólido al hacer scroll (lógica en `js/main.js`, bloque 0)

```
assets/hero.mp4   # video de fondo — comprimido a ~600 KB (venía en 19 MB)
```

> El video original pesaba 19 MB; se recomprimió a 1280px/CRF30 sin audio y quedó en
> ~600 KB, que carga rápido en móvil. Para cambiarlo, reemplaza `assets/hero.mp4`
> (ideal: ≤1280px, sin audio, con `-movflags +faststart`).


---

## Cortinilla de intro con logo animado (iteración 14)

La cortinilla de entrada ya no usa video: ahora es el **logo "memora" que se dibuja solo**
(efecto de trazo con stroke-dashoffset) y luego se rellena, sobre fondo blanco. Minimalista.

```
assets/logo.svg   # el logo original (referencia)
```

El path del logo va inline en la cortinilla (en cada página). `js/main.js` mide la
longitud del trazo y anima el dibujado (~2.2s) + relleno (~1s), y a los 3.4s se disuelve.
Ajustable con `HOLD` y `FADE` en el bloque de la cortinilla de `main.js`.

Se muestra una vez por sesión, se puede saltar con click / Esc, y respeta
`prefers-reduced-motion`. Se quitó el `intro.mp4` que ya no se usa.
