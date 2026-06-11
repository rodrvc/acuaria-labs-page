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

## D3 (2026-06-11): interlinking
Nav de cada página de servicio enlaza a las otras 2 + home. Footer: columna "Servicios" con las 3.
CTAs apuntan a `../index.html#contact` (formulario único en home, Netlify Forms).

## Branch/estado
Rama `paginas-servicios` (no mergeada a master aún).
PENDIENTE antes de publicar: enlaces desde home → 3 páginas, agregarlas a sitemap.xml, merge+push con ok de Rodrigo.
