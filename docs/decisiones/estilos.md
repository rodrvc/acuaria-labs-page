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
