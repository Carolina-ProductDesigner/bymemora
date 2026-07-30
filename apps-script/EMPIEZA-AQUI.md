# 🟢 Empieza aquí — Parte 1: que te lleguen los pedidos

Esta guía es solo el **primer tramo**: conectar tu Google Sheets y que te lleguen
los pedidos por correo. **Sin Mercado Pago todavía** — eso es la Parte 2.

Al terminar esto vas a poder:
- ✅ Ver cada pedido en una hoja de cálculo
- ✅ Recibir un correo cada vez que alguien pide
- ✅ Que a la pareja le llegue un correo con su resumen
- ✅ Cobrarles por transferencia mientras tanto (a mano)

**Tiempo: unos 15 minutos.** No necesitas saber programar. Solo copiar y pegar.

---

## ✅ Checklist rápido

- [ ] 1. Crear el Google Sheets
- [ ] 2. Abrir Apps Script
- [ ] 3. Pegar el código
- [ ] 4. Cambiar tu correo
- [ ] 5. Publicar y copiar la URL
- [ ] 6. Pegar la URL en el sitio
- [ ] 7. Probar

---

## Paso 1 · Crea el Google Sheets

1. Entra a **drive.google.com** con tu cuenta.
2. Botón **+ Nuevo** (arriba a la izquierda) → **Hojas de cálculo de Google**.
3. Se abre una hoja en blanco. Arriba a la izquierda, donde dice
   *"Hoja de cálculo sin título"*, ponle un nombre, por ejemplo **memora · pedidos**.

> No tienes que crear columnas ni encabezados. El sistema arma todo solo
> la primera vez que llega un pedido. Déjala en blanco.

✅ *Listo el paso 1.*

---

## Paso 2 · Abre el editor de código

1. En esa misma hoja, ve al menú de arriba: **Extensiones**.
2. Clic en **Apps Script**.
3. Se abre una **pestaña nueva** en el navegador con un editor de código.
   Trae algo escrito como `function myFunction() { }`. Eso lo vas a borrar.

✅ *Listo el paso 2.*

---

## Paso 3 · Pega el código

1. En el editor, **selecciona todo** lo que haya (clic dentro, luego `Ctrl+A`
   en Windows o `Cmd+A` en Mac) y **bórralo**.
2. Abre el archivo **`Codigo.gs`** (está en esta misma carpeta `apps-script/`).
   Ábrelo con cualquier editor de texto o el Bloc de notas, selecciona **todo**
   su contenido y cópialo.
3. Regresa al editor de Apps Script y **pega** (`Ctrl+V` / `Cmd+V`).
4. Arriba, clic en el ícono del **disquete 💾** (o `Ctrl+S`) para guardar.

✅ *Listo el paso 3.*

---

## Paso 4 · Pon tu correo

Casi hasta arriba del código que pegaste vas a ver este bloque:

```js
var CONFIG = {
  MI_CORREO: 'hola@bymemora.mx',
  NEGOCIO: 'memora',
  URL_GRACIAS: 'https://bymemora.mx/gracias.html',
  ...
};
```

- Cambia `MI_CORREO` por **el correo donde quieres recibir los avisos**.
  Puede ser tu Gmail normal.
- `URL_GRACIAS` déjala así por ahora; la ajustas cuando publiques el sitio.

Guarda otra vez con 💾.

> **Ejemplo:** `MI_CORREO: 'valeria.novia@gmail.com',`

✅ *Listo el paso 4.*

---

## Paso 5 · Publica y copia la URL

Aquí es donde le dices a Google "deja que mi sitio le hable a este código".

1. Arriba a la derecha, botón azul **Implementar** → **Nueva implementación**.
2. Verás un engrane ⚙️ junto a "Seleccionar tipo". Clic → elige **Aplicación web**.
3. Se abre un formulario. Ponlo así:

   | Campo | Qué elegir |
   |---|---|
   | Descripción | (opcional, déjalo vacío) |
   | Ejecutar como | **Yo (tu correo)** |
   | Quién tiene acceso | **Cualquier usuario** |

   > ⚠️ Ese "Cualquier usuario" es importante. Si dejas "Solo yo", tu sitio
   > no va a poder mandar los pedidos.

4. Clic en **Implementar**.
5. **La primera vez Google te pide permisos.** Aparece una ventana:
   - Clic en **Autorizar acceso**.
   - Elige tu cuenta.
   - Sale una pantalla que dice *"Google no ha verificado esta aplicación"*.
     No te asustes — es **tu propio** código. Clic en **Configuración avanzada**
     (abajo a la izquierda) → **Ir a (nombre) (no seguro)**.
   - Clic en **Permitir**.
6. Vuelve a la ventana de implementación y ahora sí te muestra una
   **URL de la aplicación web** que termina en **`/exec`**.
   Se ve algo así:

   ```
   https://script.google.com/macros/s/AKfycbx...largo.../exec
   ```

7. **Cópiala.** Clic en el botón *Copiar* que está junto a ella.

✅ *Listo el paso 5. Guarda esa URL, la usas en el siguiente paso.*

---

## Paso 6 · Pega la URL en el sitio

1. En los archivos del sitio, abre **`js/pedido.js`**.
2. Casi hasta arriba vas a ver:

   ```js
   var CONFIG = {
     ENDPOINT: '',
     NEGOCIO: 'memora'
   };
   ```

3. Pega tu URL **entre las comillas** de `ENDPOINT`:

   ```js
   var CONFIG = {
     ENDPOINT: 'https://script.google.com/macros/s/AKfycbx.../exec',
     NEGOCIO: 'memora'
   };
   ```

4. Guarda el archivo. Si tu sitio ya está en línea (GitHub/Vercel), sube el cambio.

✅ *Listo el paso 6.*

---

## Paso 7 · Pruébalo

1. Abre tu sitio y ve a **pedir mi invitación**.
2. Llena el cuestionario con datos de prueba (usa tu propio correo en el campo
   de correo, para ver qué le llega a la pareja).
3. Hasta el final, dale al botón de pagar.
   - Como todavía **no** conectas Mercado Pago, el botón te va a mandar a la
     página de gracias con un folio, y **el pedido ya quedó guardado**.
4. Revisa:
   - Tu **Google Sheets**: debe haber aparecido una pestaña `pedidos` con un renglón.
   - Tu **correo** (`MI_CORREO`): debe llegarte el aviso "nuevo pedido".
   - El correo que pusiste en el cuestionario: debe llegar el resumen a la pareja.

Si llegó todo → **¡funciona!** 🎉

---

## ¿Y ahora cómo cobro?

Por ahora, a mano y es totalmente válido para empezar:

1. Te llega el correo del pedido con todos los datos y el total.
2. Le escribes a la pareja por WhatsApp (su número viene en el pedido).
3. Le pasas tu CLABE o número de tarjeta para transferencia.
4. Cuando te pagan, en el Sheets cambias la columna **estatus** de
   `pendiente de pago` a `pagado` tú misma, y arrancas su invitación.

Cuando te canses de cobrar a mano, seguimos con la **Parte 2** (Mercado Pago)
y eso se vuelve automático.

---

## Si algo no salió

**No apareció nada en el Sheets ni llegó correo**
- Revisa que en el paso 5 hayas puesto acceso **"Cualquier usuario"**.
- Revisa que la URL en `pedido.js` termine en `/exec` y esté entre comillas.
- Revisa que subiste el cambio de `pedido.js` si tu sitio está en línea.

**El botón sigue mostrando el JSON de "modo prueba"**
- Es que `ENDPOINT` quedó vacío. Vuelve al paso 6.

**Cambié el código después y ya no jala**
- Cada vez que editas `Codigo.gs` hay que **volver a implementar**:
  *Implementar › Administrar implementaciones › ✏️ (editar) › Versión: Nueva › Implementar.*
  Así la misma URL toma tus cambios.

**Me da miedo lo de "Google no ha verificado"**
- Es normal y seguro: esa advertencia sale para todo script propio.
  Tú escribiste (bueno, pegaste) ese código; no hay nada externo.

---

## Lo que sigue (cuando quieras, sin prisa)

- **Parte 2 — Mercado Pago:** cobro automático con liga de pago. Está en `LEEME.md`.
- **Parte 3 — Códigos de descuento:** funcionan solos una vez conectado el Sheets.
  Solo agregas la pestaña `descuentos` (también se crea sola). Está en `LEEME.md`.

Pero con la Parte 1 ya tienes un negocio funcionando. 💛
