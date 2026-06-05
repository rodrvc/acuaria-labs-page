# Acuaria Labs — Handoff de SEO

> **Para quién es esto:** para ti (Rodrigo) o para quien te ayude con la parte de Google.
> Explica QUÉ ya quedó hecho en el sitio web y QUÉ falta hacer en las plataformas de Google
> (que es la parte que no se puede automatizar desde el código). Está escrito sin tecnicismos.

**Dominio oficial:** `https://acuarialabs.cl` (registrado en NIC Chile / nic.cl)
**Objetivo de negocio:** aparecer en Google cuando alguien busca *"empresas de IA en el norte"*,
*"inteligencia artificial Antofagasta"*, *"agencia de IA norte de Chile"* y similares.
**Foco geográfico:** Antofagasta (principal) → norte de Chile → todo Chile.
**Marca definitiva:** Acuaria Labs. (IA Norte es OTRO proyecto distinto, no se mezcla acá.)

---

## PARTE 1 — Qué YA está hecho en el sitio web (no hay que tocar nada)

Todo esto ya quedó programado y commiteado en el código del sitio:

1. **Título y descripción optimizados** con la frase clave "Empresa de Inteligencia
   Artificial en Antofagasta y el Norte de Chile".
2. **Datos estructurados (JSON-LD `ProfessionalService`)**: le dicen a Google que Acuaria
   Labs es una empresa de IA **con base en Antofagasta** que atiende Antofagasta, Calama,
   Iquique, el norte de Chile y todo el país. Esto es lo que más ayuda al "SEO local".
3. **Etiquetas geográficas** con las coordenadas de Antofagasta.
4. **Open Graph y Twitter Cards**: hacen que el sitio se vea bonito (con imagen y título)
   cuando se comparte por WhatsApp, LinkedIn, etc.
5. **`robots.txt`** y **`sitemap.xml`**: archivos que le indican a Google qué páginas
   rastrear. Ya apuntan a `https://acuarialabs.cl`.
6. **Canonical, favicon, H1 con palabras clave**: buenas prácticas técnicas estándar.
7. **El sitio es estático y liviano** (sin frameworks pesados), lo que ayuda a la velocidad,
   que Google premia.

> Conclusión: la parte "on-page" (dentro del sitio) está completa. El sitio está listo para
> ser encontrado. Lo que falta es **publicarlo en el dominio y registrarlo en Google**.

---

## PARTE 2 — Qué FALTA hacer (la parte de Google — paso a paso)

Esto NO se puede hacer desde el código: requiere tus cuentas de Google y verificar que el
sitio es tuyo. Hazlo en este orden.

### Paso 0 — Publicar el sitio en el dominio (requisito previo)
Antes de Google, el sitio tiene que estar online en `https://acuarialabs.cl`.
- El sitio está hecho para **Netlify** (ya tiene formulario compatible con Netlify Forms).
- Pasos: crear cuenta en netlify.com → subir la carpeta del proyecto (o conectar el repo
  git) → en Netlify ir a *Domain settings* → agregar dominio `acuarialabs.cl`.
- En **NIC Chile (nic.cl)**: entrar a tu cuenta → administrar el dominio `acuarialabs.cl` →
  cambiar los **DNS / nameservers** a los que te indique Netlify (o crear un registro
  CNAME/A apuntando a Netlify). Netlify te da las instrucciones exactas al agregar el dominio.
- Activar **HTTPS** (Netlify lo hace gratis y automático con Let's Encrypt). Google exige https.
- ✅ Cómo saber que funcionó: abrir `https://acuarialabs.cl` y que cargue el sitio con el
  candado de seguridad.

### Paso 1 — Google Search Console (indexación)  ⭐ IMPORTANTE
Esto le avisa a Google que el sitio existe y le pide que lo indexe.
1. Entra a **https://search.google.com/search-console** con tu cuenta Google.
2. "Agregar propiedad" → elige **"Prefijo de URL"** → escribe `https://acuarialabs.cl`.
3. Verifica que el sitio es tuyo. La forma más fácil con Netlify: el método **"Etiqueta HTML"**
   — Google te da un código tipo `<meta name="google-site-verification" content="XXXX">`.
   👉 Pásame ese código y yo lo agrego al sitio en 1 minuto. (También sirve verificación por DNS en NIC Chile.)
4. Una vez verificado: menú **Sitemaps** → escribe `sitemap.xml` → Enviar.
5. Menú **Inspección de URLs** → pega `https://acuarialabs.cl` → "Solicitar indexación".
- ✅ Resultado: en unos días Google empieza a mostrar el sitio en los resultados.

### Paso 2 — Google Business Profile (Perfil de Empresa)  ⭐⭐ LA MÁS IMPORTANTE PARA "IA EN ANTOFAGASTA"
Esto es lo que hace que aparezcas en **Google Maps** y en el recuadro lateral cuando alguien
busca "empresa de IA en Antofagasta". Es GRATIS y es lo de mayor impacto para SEO local.
1. Entra a **https://www.google.com/business/** con tu cuenta Google.
2. Crea el perfil: nombre **Acuaria Labs**.
3. Categoría: busca algo como **"Servicio de tecnología de la información"** o
   **"Consultor de software"** (no existe "agencia de IA" como categoría; elige la más cercana).
4. Ubicación: **Antofagasta**. Si NO quieres mostrar dirección exacta (trabajas sin oficina
   de cara al público), elige **"Atiendo a clientes fuera de mi ubicación"** y define
   Antofagasta + norte como **zona de servicio**.
5. Agrega: sitio web `https://acuarialabs.cl`, email `hola@acuarialabs.com`, horario, y un
   teléfono (recomendado — ayuda mucho a la confianza/ranking).
6. **Verificación**: Google pide confirmar que la empresa es real (por teléfono, video o
   postal). Sigue lo que te indique.
7. Sube el **logo** y fotos. Escribe una descripción usando las palabras clave:
   *"Empresa de Inteligencia Artificial en Antofagasta..."*.
- ✅ Resultado: empiezas a aparecer en Maps y en búsquedas locales de Antofagasta.

### Paso 3 — Refuerzos (cuando tengas tiempo)
- **Datos consistentes (NAP):** usa SIEMPRE el mismo Nombre, dirección/ciudad y teléfono en
  todos lados (web, Google, redes, directorios). Google premia la consistencia.
- **Redes / directorios:** crea LinkedIn de empresa y, si puedes, aparece en directorios
  locales/cámaras de comercio de Antofagasta. Cada enlace de calidad suma.
- **Reseñas:** pide a tus primeros clientes que dejen reseña en el Google Business Profile.
  Las reseñas son uno de los factores más fuertes del ranking local.
- **Contenido:** a futuro, un blog con artículos tipo "Casos de IA para la minería del norte"
  ayuda a posicionar para más búsquedas. (Habría que agregar páginas al sitio.)

---

## PARTE 3 — Datos que faltan (para que el SEO quede aún más fuerte)

Cuando los tengas, **pásamelos y los agrego al sitio** (al JSON-LD y al contenido):
- [ ] **Teléfono** de contacto de la empresa.
- [ ] **Dirección física** en Antofagasta (si decides tener/mostrar una).
- [ ] **Redes sociales** (LinkedIn, Instagram, X) → van al campo `sameAs` del JSON-LD.
- [ ] **Imagen para compartir (OG image):** hoy se usa el logo. Lo ideal es una imagen
      1200×630px con el nombre + "IA en Antofagasta". Si la creas, la conecto.
- [ ] Confirmar el **email definitivo** (hoy figura `hola@acuarialabs.com` — ojo: el dominio
      es `.cl`, quizá quieras `hola@acuarialabs.cl` para que todo sea consistente).

---

## PARTE 4 — Palabras clave objetivo (referencia)

Estas son las búsquedas para las que está optimizado el sitio. Úsalas en el Google Business
Profile, en redes y en futuro contenido:
- inteligencia artificial Antofagasta
- empresa de IA norte de Chile
- agencia de inteligencia artificial Antofagasta
- soluciones de IA Chile / desarrollo de IA Antofagasta
- IA para minería / automatización con IA norte de Chile

---

## Resumen de una línea
**El sitio ya está optimizado por dentro. Falta: (1) publicarlo en acuarialabs.cl con HTTPS,
(2) registrarlo en Google Search Console y enviar el sitemap, y (3) crear el Google Business
Profile en Antofagasta —que es lo que más te hará aparecer en "empresas de IA en el norte".**

Cuando hagas Search Console, mándame el código de verificación y lo dejo puesto al toque.
