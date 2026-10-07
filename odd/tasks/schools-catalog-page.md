# Feature: schools catalog page (`/ia-para-colegios/`)

Issue: rodrvc/acuaria-labs-page#10 · Branch: `feat/10-schools-catalog-page`

## Objective
A public, evergreen, mobile-first service landing page presenting the Acuaria Labs
"AI solutions for schools" catalog, generic for any school.

## Problem / why
The catalog exists only as a school-specific PDF. A generic web page can be shared with any
school and can rank for school-related searches (service-page strategy, `docs/decisiones/paginas-servicios.md` D1).

## Scope
- `ia-para-colegios/index.html` + `ia-para-colegios/img/*.webp` + OG image.
- CSS block appended to `styles.css` (prefix `.school-*`, decision estilos D1/D4).
- `sitemap.xml` entry. Decision log entry in `docs/decisiones/paginas-servicios.md`.

## Constraints
- Copy in Spanish (Chile), formal "usted". No real school, person, religious order or vendor names (except the
  data-processing option naming the OpenAI API platform, as in the catalog).
- No prices, no absolutes ("100%", "siempre", "garantiza", "al instante", "a cualquier hora"); integrations are
  "lo definimos con Informática". No minors' health data. No photos with crests or brand logos.
- No push / PR / deploy. No new analytics (the site's existing gtag only).

## Tasks
- [x] T1 Issue #10 + project fields (In Progress, Acuaria Labs site, high), branch.
- [x] T2 Generic demo screenshots from the school RAG demo (neutral "Colegio Ejemplo" crest, names replaced in DOM, disclaimer/model/toolbars hidden). Demo repo untouched.
- [x] T3 Photos and screenshots converted to WebP (sizes 16–80 KB).
- [x] T4 Page HTML (head SEO/OG/JSON-LD, 6 solutions, integration, data options, FAQ, CTA) + CSS block.
- [x] T5 sitemap + decision log.
- [x] T6 Visual check at 375 / 768 / 1280 px; genericization grep; fix issues.

Route: inline (single owner; source context already loaded in the parent; one page + one CSS block).

## Acceptance
- No horizontal scroll at 375 px; screenshots legible on mobile (dedicated mobile crop for the demo).
- Lazy images with alt text; one h1, ordered headings; FAQ visible text == FAQPage JSON-LD.
- `grep -i "san luis\|jesu\|ignaci\|antofagasta.*colegio\|schoolnet\|softland\|marco"` finds nothing school-specific.

## Checks
- TDD: off (static site, no test runner). Functional checks: JSON-LD parses (`python3 -m json.tool`), HTML grep checks, agent-browser screenshots.

## Progress / evidence
- Screenshots captured 2026-10-06 against `acuaria-agent` (feat/school-rag-demo, port 8590); questions: atrasos, salidas pedagógicas. A becas answer was discarded (cited the school's religious educational project).
- T4/T5 checks: both JSON-LD blocks parse; FAQ visible text == FAQPage JSON-LD (4/4); HTML tags balanced; sitemap passes xmllint.
- T6: no horizontal scroll at 375/768/1280 (scrollWidth == viewport); 0 broken images. Fixes after review: mobile-specific crops via <picture> for both demo captures (salidas re-captured at 430 px) and both app screenshots; demo captures stacked at max 960 px on desktop; Option 2 data card no longer uses `.featured` (white-on-light-blue contrast); CTA button gap on mobile; tablet photo width cap.
- Commits: see `git log feat/10-schools-catalog-page`.

## Next step
Rodrigo reviews locally and decides: publish (merge to master → Netlify), link from home #servicios / global footer, address in CTA.
