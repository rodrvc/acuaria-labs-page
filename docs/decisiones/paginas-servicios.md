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

## Branch/estado
Rama `paginas-servicios` (no mergeada a master aún).
PENDIENTE antes de publicar: agregar las 3 páginas a sitemap.xml, merge+push con ok de Rodrigo.
