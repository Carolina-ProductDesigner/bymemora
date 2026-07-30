# Conectar un template externo al catálogo

Sirve para templates que ya viven en su propio proyecto (Vercel, Netlify, etc.).
Son **4 pasos** y no hay que reescribir el template.

---

## Paso 1 — Carga el archivo de temas

En el `<head>` del template, apuntando a tu dominio:

```html
<link rel="stylesheet" href="https://bymemora.mx/css/themes.css">
```

Así los 4 temas viven en **un solo lugar** para todos los templates,
sin importar en qué proyecto estén. Editas `themes.css` una vez y cambian todos.

> Mientras desarrollas, puedes copiar `themes.css` a `/public` del template
> y usar `href="/themes.css"`.

---

## Paso 2 — Instala el adaptador

Copia `memora-theme.js` a la carpeta `public/` del template y cárgalo
en el `<head>`, **antes de tu CSS**:

```html
<script src="/memora-theme.js"></script>
```

En Next.js:

```jsx
<Script src="/memora-theme.js" strategy="beforeInteractive" />
```

---

## Paso 3 — Cambia tus colores por tokens

Este es el único trabajo real, y es una pasada de buscar/reemplazar en tu CSS.

| tu color actual | token |
|---|---|
| fondo de la página | `var(--pv-bg)` |
| texto principal | `var(--pv-ink)` |
| color de acento, botones, filetes | `var(--pv-accent)` |
| líneas, bordes, separadores, fondos suaves | `var(--pv-line)` |
| fuente de títulos | `var(--pv-display)` |
| fuente de textos | `var(--pv-body)` |

Antes:

```css
.hero { background: #F7F4EE; color: #2B2A26; }
.btn  { border: 1px solid #B08968; color: #B08968; }
```

Después:

```css
.hero { background: var(--pv-bg); color: var(--pv-ink); }
.btn  { border: 1px solid var(--pv-accent); color: var(--pv-accent); }
```

Si usas Tailwind, decláralos en `tailwind.config`:

```js
theme: { extend: { colors: {
  bg: 'var(--pv-bg)', ink: 'var(--pv-ink)',
  accent: 'var(--pv-accent)', line: 'var(--pv-line)'
}}}
```

Para que el cambio se sienta suave, agrega en tu `body`:

```css
body { transition: background-color .55s ease, color .55s ease; }
```

### Las fotos

Las fotos no cambian de color y está bien: son el ancla del template.
Si quieres que acompañen a la paleta, un truco barato:

```css
.foto { filter: grayscale(1); }
[data-palette="tinta"] .foto { filter: grayscale(1) brightness(.85); }
```

---

## Paso 4 — Modo miniatura (opcional pero recomendado)

Cuando el template se ve dentro del modal, el adaptador le pone la clase
`memora-embed` al `<html>`. Úsala para saltarte lo que no se aprecia en chiquito:

```css
/* pantalla de entrada / loader / cursores custom */
.memora-embed .intro-screen,
.memora-embed .loader,
.memora-embed .cursor { display: none !important; }

/* que arranque directo en el contenido */
.memora-embed body { overflow: hidden; }
```

El template **Camila & Romina** tiene una pantalla con botón *Entrar*:
justo ese es el caso de uso.

---

## Paso 5 — Súbelo al catálogo

En `predisenadas.html`, en la tarjeta que le toque:

```html
<button class="design__open" type="button"
        data-name="malmo"
        data-demo="https://wedding-minimalistinvite.vercel.app/"
        data-tag="..."
        data-desc="...">
```

Ya está. `data-demo` acepta rutas locales y URLs completas por igual.

---

## Verificación

1. Abre a mano: `https://tu-template.vercel.app/?paleta=tinta&fuentes=editorial`
   → debe verse oscuro con Playfair. Si no, falta el Paso 3.
2. Abre el modal en el catálogo y cambia de paleta
   → debe repintarse sin recargar. Si no, falta el Paso 2.
3. Si el iframe sale en blanco, revisa que el hosting no mande
   `X-Frame-Options: DENY`. En Vercel no viene por defecto; si lo
   agregaste en `vercel.json` o `next.config.js`, cámbialo por:

```json
{ "key": "Content-Security-Policy",
  "value": "frame-ancestors 'self' https://bymemora.mx" }
```
