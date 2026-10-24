# Feature: pulido-site-wide

## Objective
Apply the approved "pulido + porcelain" look (index-pulido.html, `.original-pulido` CSS, porcelain cards from T15 of `pulido-pro-touch`) to every page of the site, and make it the official home.

## Problem / why
Rodrigo (2026-10-24): "me gustó el estilo nuevo, aplícalo en toda la web, todas las páginas deben quedar con este estilo; haz backup del anterior".

## Scope & constraints
- Pages: home (`index.html`), `chatbots-whatsapp/`, `automatizacion/`, `desarrollo-a-medida/`, `capacitacion-ia-empresas/`, `campamento/`, `workspace/`, `ia-para-colegios/`, `blog/` + 4 articles.
- Style only (memory `acuaria-labs-restyle-solo-estilo`, `docs/decisiones/seo-geo.md`): no changes to title, meta, canonical, OG, JSON-LD, H1/H2 texts, copy, FAQ texts, ids, section order, nav/footer structure (`paginas-servicios.md` D2/D3/D5). Only exception already approved: the `#pipeline` network graph of index-pulido.
- Production home head must keep gtag + `robots index, follow` (index-pulido is noindex review copy).
- Three.js only on the home `#pipeline` (desktop, lazy). No WebGL on other pages.
- No new per-page CSS files: rules live in `styles.css` under `.original-pulido`.
- Commit locally per task; no push/deploy without Rodrigo's OK.

## Backup of the old style
- Git tag `backup/old-style-production` = production master (883dc9f) before this work.
- Checkpoint commit `6fb2aed` (pulido + porcelain sample), merge of master `cabb949`.

## Tasks
- [x] T1 — Generalize porcelain from `#servicios` to all card families of the home (projects, pillars incl. `.featured`, any other bordered cards) in index-pulido. Route: delegated writer.
- [x] T2 — Promote pulido to the official home: `index.html` = index-pulido body + production head (gtag, robots index, cache-busted assets). Keep index-pulido.html as review copy. Route: same writer.
- [x] T3 — Apply pulido body class, motion script and porcelain to the 4 service pages. Route: same writer.
- [x] T4 — Same for campamento, workspace, ia-para-colegios. Route: same writer.
- [x] T5 — Same for blog listing + 4 articles (blog-hero, post-body, callout, blog cards). Route: same writer.
- [x] T6 — Verify all pages 360/768/1440/1920: no overflow, no console errors, menu/FAQ/anchors; SEO invariants diff (title/meta/JSON-LD/h1 byte-identical vs `backup/old-style-production`); log in `docs/decisiones/estilos.md`. Route: writer + parent spot check.

## Acceptance
Every page shows the pulido/porcelain look; SEO head and texts identical to production (except approved #pipeline); no overflow/console errors.

## TDD
Off (static site, no test runner). Functional checks: browser checks + automated SEO diff.

## Delivery
Strategy: ask-on-risk. Mostly CSS/attribute changes; forecast ~600 authored lines (home swap is a copy).

## Progress
- 2026-10-24: document created; checkpoint commit + backup tag + master merge done.
- T1 done: porcelain block generalized (v18) to project/pillar (featured navy kept)/faq/contact/screenshot frames/blog callout; fixed merge-corrupted CSS around `.project-status.available .status-dot` (unclosed rule swallowed the school-hero-img rule). index-pulido: css `pulido-site-1b`, motion `site-1`, footer link to IA para colegios added. Check: 1440 no overflow, visual OK.
- T1 commit: 4c773a8.
- T2 done: `index.html` = index-pulido markup + production head (gtag, robots index/follow, no review comment); css `pulido-site-1`, motion `site-1`. IA para colegios card + footer link present. SEO diff vs backup: only `id="inicio"` on hero (+ logo href `#inicio`) and #pipeline/hero SVG (approved). Checks 360/768/1440/1920 no overflow, no console errors. index-pulido.html kept (noindex).
- T2 commit: 0260f50.
- T3 done: chatbots-whatsapp, automatizacion, desarrollo-a-medida, capacitacion-ia-empresas: body class, css `pulido-site-1`, `pulido-motion.js?v=site-1` (null-safe, no change needed). SEO check OK; overflow/console OK at 360/768/1440.
- T3 commit: f8ef948.
- T4 done: campamento, workspace, ia-para-colegios: body class, css, motion script. No markup changes; workspace inline `<style>` (.ws-card/.ws-shot) overridden by higher-specificity `.original-pulido` rules in styles.css; school-* cards/screenshots and camp-shot/camp-hero-card covered by the porcelain block. SEO OK; overflow/console OK at 360/768/1440.
- T4 commit: 8ded233.
- T5 done: blog listing + 4 articles: body class, css, motion script. Callout restyled as porcelain slab, blog cards use project-card porcelain. SEO OK; overflow/console OK at 360/768/1440.
- T5 commit: 02e6bcf.
- T6 done: all 13 pages checked at 360/768/1440/1920 (no horizontal overflow, no console errors); mobile menu opens and first FAQ item opens on every page that has one (campamento, workspace, blog index have no FAQ); SEO invariant script: 12/13 pages byte-identical (title, metas, canonical, JSON-LD, h1-h3, FAQ, ids, hrefs); home differs only by `id="inicio"` + #pipeline + hero decorative SVG (approved). Decision logged in `docs/decisiones/estilos.md`. Nothing pushed.
