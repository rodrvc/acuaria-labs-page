# Decisiones — Correo del dominio

> Repo público. Aquí va solo información ya consultable públicamente vía DNS.
> NUNCA credenciales, tokens, IDs de proveedor, costos ni datos de clientes.
> Lo comercial (planes, precios, decisiones de costo) vive en Notion.

## Estado actual (agosto 2026)

Correo de acuarialabs.cl en **Google Workspace**. DNS administrado en **Netlify**.

- MX → `smtp.google.com` (prioridad 1). Google usa un único MX, no los 5 antiguos.
- SPF → `v=spf1 include:_spf.google.com ~all`
- DKIM → selector `google`, en `google._domainkey.acuarialabs.cl`

Antes el dominio usaba ImprovMX (reenvío) hacia un correo personal. Se reemplazó
para poder *responder* desde el correo institucional, no solo recibir.

## Reglas

- **No tocar MX/SPF/DKIM sin avisar a Rodrigo.** Un cambio mal hecho deja el correo
  rebotando sin aviso visible — nadie se entera hasta que un cliente reclama.
- **`hola@acuarialabs.cl` debe existir siempre.** Está publicado en el sitio.
  Hoy es un alias, no un buzón propio. Si se suspende o borra, los correos rebotan.
- **Los registros NETLIFY del DNS no se tocan** — son el sitio web, no el correo.
- Tras cualquier cambio, verificar de verdad (ver abajo). No asumir.

## Cómo verificar que el correo funciona

Consulta pública de los registros:

```bash
dig +short MX acuarialabs.cl @8.8.8.8
dig +short TXT acuarialabs.cl @8.8.8.8
dig +short TXT google._domainkey.acuarialabs.cl @8.8.8.8
```

Para comprobar si una dirección realmente acepta correo, se le pregunta al servidor
por SMTP sin enviar nada. Incluir siempre una dirección inventada como control: si
el control también da 250, el servidor acepta todo y la prueba no sirve.

```
250 → el buzón acepta correo
550 "does not exist" → no existe
550 "inactive" → existe pero está suspendido / sin licencia
```
