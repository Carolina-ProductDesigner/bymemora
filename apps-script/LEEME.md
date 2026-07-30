# Conectar el cuestionario · Google Sheets + Mercado Pago + correos

Sin servidor y sin costo. Google Apps Script hace de backend.
**Tiempo estimado: 25 minutos.**

---

## Qué va a pasar cuando esté listo

1. La pareja llena el cuestionario y le da a *ir a pagar*
2. El pedido se escribe en tu Google Sheets con estatus `pendiente de pago`
3. Se crea la liga de Mercado Pago y la pareja se va directo a pagar
4. Le llega un correo con su folio, el desglose y la liga (por si la cierra)
5. A ti te llega un aviso con todos los datos
6. Cuando paga, Mercado Pago avisa al script: el renglón pasa a `pagado`
   y a la pareja le llega **"tu invitación ya está pedida"**

---

## Paso 1 — Crea el Google Sheets

1. Nueva hoja de cálculo en Google Drive. Llámala `memora · pedidos`.
2. No hace falta crear columnas: el script arma la pestaña `pedidos`
   con sus encabezados la primera vez que corre.

---

## Paso 2 — Pega el script

1. En esa hoja: **Extensiones › Apps Script**
2. Borra lo que venga y pega todo `Codigo.gs`
3. Arriba, en `CONFIG`, cambia:

```js
MI_CORREO: 'tucorreo@gmail.com',
URL_GRACIAS: 'https://bymemora.mx/gracias.html',
```

4. Guarda (💾)

---

## Paso 3 — Tu token de Mercado Pago

1. Entra a **mercadopago.com.mx/developers** → *Tus integraciones* → crea una aplicación
2. En **Credenciales de producción** copia el `Access Token`
   *(para probar primero, usa el de **prueba**)*
3. En Apps Script: ⚙️ **Configuración del proyecto** → *Propiedades del script* → **Agregar propiedad**

| propiedad | valor |
|---|---|
| `MP_ACCESS_TOKEN` | `APP_USR-xxxxxxxx...` |

> El token **nunca** va en el código ni en el sitio. Si estuviera en el HTML,
> cualquiera podría cobrar a tu nombre. Por eso existe este paso.

---

## Paso 4 — Publica el Web App

1. **Implementar › Nueva implementación**
2. Tipo: **Aplicación web**
3. Configura así:

| campo | valor |
|---|---|
| Ejecutar como | **Yo** |
| Quién tiene acceso | **Cualquier usuario** |

4. *Implementar* → acepta los permisos (Google avisa que no está verificada:
   **Configuración avanzada › Ir a … (no seguro)**. Es tu propio script.)
5. **Copia la URL** que termina en `/exec`

---

## Paso 5 — Pégala en el sitio

En `js/pedido.js`, hasta arriba:

```js
var CONFIG = {
  ENDPOINT: 'https://script.google.com/macros/s/AKfycb.../exec',
  NEGOCIO: 'memora'
};
```

Listo. Mientras `ENDPOINT` esté vacío, el cuestionario corre en **modo prueba**:
calcula la cotización y te enseña el JSON que se enviaría, sin mandar nada.

---

## Paso 6 — Pruébalo

**Primero sin Mercado Pago:** en el editor de Apps Script, selecciona la función
`prueba` y dale ▶️. Debe aparecer un renglón en tu Sheets y llegarte dos correos.

**Después completo:** llena el cuestionario en el sitio con el token de *prueba*
de Mercado Pago y sus [tarjetas de prueba](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/additional-content/test-cards).

---

## Paso 7 — El webhook (para el correo de confirmación)

El script ya manda su propia URL como `notification_url`, así que en la mayoría
de los casos funciona solo. Para asegurarlo:

En Mercado Pago → *Tus integraciones* → tu app → **Webhooks** → agrega la misma
URL `/exec` y marca el evento **Pagos**.

---

## Cambiar precios

Todo vive en `js/precios.js`, en el sitio. No toques el Apps Script para eso.

```js
tipos: [
  { id: 'pre', nombre: 'wedding website pre-diseñado', precio: 2100, ... }
],
extras: [
  { id: 'dominio', nombre: 'dominio personalizado', precio: 600, ... }
]
```

- `anticipo: 0.5` → permite pagar 50% ahora. Ponlo en `null` para exigir pago completo.
- `activo: false` → esconde un extra sin borrarlo (y sin romper pedidos viejos)
- **No cambies los `id`**: son los que quedan guardados en el histórico del Sheets

---

## Cosas que conviene saber

**Cada vez que edites el script, hay que volver a implementar.**
*Implementar › Administrar implementaciones › ✏️ › Versión: Nueva › Implementar.*
Si creas una implementación nueva desde cero, la URL cambia y hay que actualizarla
en `pedido.js`.

**Límite de correos:** 100 al día con cuenta gratuita de Gmail,
1,500 con Google Workspace. De sobra para empezar.

**El token de prueba y el de producción son distintos.** Con el de prueba, los pagos
no son reales. Cuando vayas a vender de verdad, cámbialo en las Propiedades del script.

**Si Mercado Pago falla, el pedido no se pierde:** queda guardado en el Sheets y
a ti te llega un correo con el error para que mandes la liga a mano.

**Respaldo:** el cuestionario guarda lo que la pareja escribe en su propio navegador,
así que si se recarga la página no pierde nada.

---

## Códigos de descuento

No necesitas un panel de administrador: **los códigos viven en tu mismo Google Sheets**,
en una pestaña llamada `descuentos` que el script crea sola la primera vez.

### La tabla

| codigo | tipo | valor | activo | usos_max | usos | vence | nota |
|---|---|---|---|---|---|---|---|
| FAMILIA | porcentaje | 20 | sí | 50 | 3 | | friends and family |
| VERANO500 | fijo | 500 | sí | 100 | 12 | 2026-08-31 | promo verano |
| BODA10 | porcentaje | 10 | no | | 0 | | (apagado) |

- **codigo** — lo que teclea la persona. No importan mayúsculas/minúsculas.
- **tipo** — `porcentaje` (20 = 20% de descuento) o `fijo` (500 = $500 menos).
- **valor** — el número, sin símbolos.
- **activo** — `sí` para que funcione, `no` para apagarlo.
- **usos_max** — cuántas veces total se puede usar (vacío = ilimitado).
- **usos** — lo lleva el sistema solo; súmale tú si quieres "gastarlo" a mano.
- **vence** — fecha `AAAA-MM-DD` (vacío = no vence).
- **nota** — para ti, el script no la usa.

### Crear un código
Escribe un renglón nuevo. Ya está — funciona al instante, sin re-implementar nada.

### Apagar un código
Pon `no` en la columna **activo**. Para reactivarlo, `sí`.

### Cómo se cuenta un uso
El contador **usos** sube solo cuando un pago **se confirma** (no cuando alguien
teclea el código). Así, si abandonan el pago, el código no se "gasta".

### Por qué esto es seguro
El descuento **nunca** lo decide el navegador. Cuando la persona da *aplicar*, el sitio
le pregunta al script; y cuando paga, el script **vuelve a calcular** el total leyendo
el código real del Sheets antes de mandar el monto a Mercado Pago. Aunque alguien edite
la página para "ponerse" 90% de descuento, el precio que se cobra lo fija tu script.

Por eso los códigos solo funcionan con el `ENDPOINT` ya configurado: sin backend no hay
forma segura de validarlos, y el sitio lo dice en vez de aplicar un descuento falso.
