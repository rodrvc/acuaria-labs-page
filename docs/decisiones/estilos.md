# Decisiones: estilos / CSS

## D1: un solo styles.css global
Todas las páginas (home, /campamento/, servicios) cargan el mismo `styles.css` (subpáginas: `../styles.css`).
NO crear hojas por página. Cambio de CSS afecta TODO el sitio → revisar impacto cruzado antes de editar.

## D2 (2026-06-11): .faq padding fix
`.faq` usaba `var(--section-padding)` que NUNCA se definió → padding computado 0 (secciones pegadas).
Fix: `padding: 8rem 0` (estándar de .about/.pillars). NO reintroducir la variable sin definirla en :root.

## D3 (2026-06-11): CTA sobre fondo oscuro
`.projects-cta` está diseñado para fondo claro (texto gris + border-top gris).
Para usarlo dentro de `.philosophy` (fondo azul) existe override `.philosophy .projects-cta` (texto blanco, sin borde).
Cualquier CTA nuevo sobre fondo oscuro: usar ese patrón, no .projects-cta a secas.

## Convenciones
Paleta: --color-primary #1a4b70, accent #3c80b4 / #64a1ce. Fuente: Inter.
Secciones: padding 8rem 0. Decoración: .floating-elements/.bubble en todas las páginas.
SVGs de heros: inline, gradiente primary→accent, stroke ~5.

## D4 (2026-08-23): bloque CSS del blog dentro de styles.css (NO hoja aparte)
Clases nuevas al final de `styles.css`, prefijo `.post-*` + `.blog-hero`: `.blog-hero` (cabecera corta, sin 100vh), `.post-breadcrumb`, `.post-meta`, `.post`, `.post-body` (máx 760px, tipografía de lectura), `.post-lead`, `.post-callout` (resumen citable GEO, fondo primary-50 + borde accent), `.post-card-meta`.
Tarjetas del listado y "más artículos" reusan `.projects` / `.projects-grid` / `.project-card` / `.project-more`. FAQ reusa `.faq-*`. CTA final reusa `.philosophy .projects-cta` (D3).
Razón: mantener D1 (un solo CSS) y no duplicar tarjetas/FAQ. Si se agregan más clases de blog → mismo bloque, mismo prefijo.
