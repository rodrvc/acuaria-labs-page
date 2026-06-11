# Acuaria Labs — reglas para agentes

## REGLA OBLIGATORIA
Antes de cualquier cambio: leer el/los archivos de `docs/decisiones/` del área afectada.
No contradecir decisiones registradas. Si un cambio requiere contradecir una → avisar a Rodrigo, no proceder.
Nueva decisión tomada en sesión → registrarla en el archivo del área (crear si no existe). Mantener entradas telegráficas.

## Índice de decisiones (cargar solo el relevante)
- `docs/decisiones/paginas-servicios.md` — por qué existen 3 páginas de servicio independientes, estructura
- `docs/decisiones/estilos.md` — CSS compartido, fixes, convenciones
- `docs/decisiones/seo-geo.md` — estrategia SEO/GEO, qué no tocar

## Handoffs de contexto largo (solo si se retoma ese tema)
- `GOOGLE-HANDOFF.md` — Search Console + Business Profile
- `GEO-HANDOFF.md` — estrategia GEO (IAs citando el sitio)
- `SEO-HANDOFF.md`, `COLOR-HANDOFF.md` — históricos

## Datos fijos
- Sitio estático HTML/CSS/JS. Deploy: push a `master` (GitHub rodrvc/acuaria-labs-page) → Netlify auto → https://acuarialabs.cl (~1-2 min)
- Email: hola@acuarialabs.cl (NUNCA .com). Tel: 9 8278 5644
- `googleacff5990863d24c0.html` = verificación Search Console. NO BORRAR
- Confirmar con Rodrigo antes de push/deploy. Verificar en vivo con curl tras deploy
- Rodrigo no es técnico en SEO/git: explicar sin tecnicismos, paso a paso
