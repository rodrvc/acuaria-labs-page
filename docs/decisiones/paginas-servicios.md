# Decisiones: páginas de servicio

## D1 (2026-06-11): 3 páginas INDEPENDIENTES, no secciones de la home
Rutas: `/chatbots-whatsapp/`, `/automatizacion/`, `/desarrollo-a-medida/`
Razón: Google rankea PÁGINAS, no empresas. Home genérica no rankea por servicio.
Patrón probado: `/campamento/` rankea por tener página dedicada → replicado.
Cada página apunta a búsqueda del cliente por PROBLEMA ("chatbot whatsapp empresa"), no por categoría ("empresa de IA").
NO consolidar en una página /servicios única. NO mover contenido a secciones de la home.

## D2 (2026-06-11): estructura común obligatoria por página
hero (texto + svg inline) → region-band → pillars(3 cards) → about(cómo trabajamos) → faq → CTA philosophy → footer
Head: title/desc por keyword del servicio + canonical + OG + JSON-LD `Service` + JSON-LD `FAQPage`.
FAQ visible (details/summary) = espejo exacto del FAQPage JSON-LD. Respuestas autocontenidas (GEO: citables por IAs).
Reusar clases de styles.css existente. NO crear CSS nuevo por página.

## D3 (2026-06-11, v2): navegación unificada en TODO el sitio
Nav idéntico en las 5 páginas: Nosotros(#about) · Servicios(#servicios) · Proyectos(#projects) · FAQ · Contacto(btn-nav).
Anclas → home con ../index.html# desde subdirs. FAQ en páginas de servicio = ancla local #faq. Campamento conserva btn "Quiero participar".
Home: sección id="servicios" (entre #pipeline y #about, patrón projects-grid/project-card) con 3 tarjetas → páginas de servicio.
Páginas de servicio: sección id="otros-servicios" ("También te puede servir", entre #faq y .philosophy) con 2 tarjetas a los otros servicios.
Footer idéntico en todas: columnas Servicios / Navegación / Social.
CTAs apuntan a `../index.html#contact` (formulario único en home, Netlify Forms).
NO volver a navs distintos por página.

## D4 (2026-08-22): 4ta página de servicio — capacitación
Ruta: `/capacitacion-ia-empresas/`. Talleres in-company para EQUIPOS/EMPRESAS (adultos), distinto de `/campamento/` (jóvenes 13-17). No enlazar como si fueran lo mismo.
Mismo patrón D2/D3. FAQ con 4 preguntas (NO SENCE — Acuaria no es OTEC, decisión explícita de Rodrigo).
Home #servicios: ahora 4 tarjetas (antes 3). Grid sigue en 3 columnas (styles.css sin cambios) → la 4ta card queda sola en su fila, aceptado.
otros-servicios de las 3 páginas viejas: se agregó 3ra card (capacitación) en vez de mantener fijas en 2 — el grid soporta 3 columnas sin problema. Página nueva enlaza a las 3 anteriores.
Footer "Servicios" (global, idéntico en todas las páginas): se agregó el 4to link en las 6 páginas existentes + la nueva.

## Branch/estado
Rama `paginas-servicios` (no mergeada a master aún).
PENDIENTE antes de publicar: agregar las 3 páginas a sitemap.xml, merge+push con ok de Rodrigo.

## D5 (2026-08-23): sección Blog — `/blog/` + `/blog/<slug>/`
Rutas: listado `/blog/index.html`, artículos `/blog/<slug>/index.html` (mismo patrón de carpeta que servicios; HTML estático, sin build). Hoy 4 artículos por rubro local: contratistas de minería, pymes de servicios (WhatsApp), retail/comercio local, logística/transporte.
Ángulo editorial fijo: "IA para las pymes/contratistas que trabajan CON la minería", no venderle a las mineras grandes (descartado en investigación previa). Contenido educativo; NO casos de clientes, cifras ni testimonios inventados.
Estructura artículo: blog-hero (breadcrumb + tag + h1 + desc + meta) → .post-body (lead + callout "En corto" citable + h2/h3) → FAQ (3, espejo exacto de FAQPage JSON-LD) → "Más artículos" (3 cards) → CTA philosophy → footer.
Head por artículo: title/desc por keyword, canonical, OG type=article, Twitter, JSON-LD BlogPosting + FAQPage + BreadcrumbList. Listado: JSON-LD Blog (con blogPost[]) + BreadcrumbList.
Enlaces internos: cada artículo enlaza a las 4 páginas de servicio y a otro artículo relacionado.
Nav global (D3) ahora: Nosotros · Servicios · Proyectos · **Blog** · FAQ · Contacto — agregado en las 6 páginas existentes + blog. Footer "Navegación" también lleva Blog. Sigue siendo idéntico en todas.
Nuevo artículo = copiar un `/blog/<slug>/index.html` existente, cambiar head/JSON-LD/cuerpo, agregarlo al listado y al sitemap con lastmod.
