# Acuaria Labs — Handoff: revisión del sistema de color

> **Para el próximo Claude (o diseñador) que retome esto.**
> El cliente siente que la landing tiene **demasiados tonos de azul distintos** y quiere
> simplificar / armonizar la paleta. Este documento te da TODO el contexto para que tomes el
> trabajo sin tener que reconstruir la conversación. Lee también `CLAUDE.md` si existe.

## Estado del proyecto (importante)

- Proyecto: landing **estática** (solo `index.html`, `styles.css`, `script.js`). Sin build, sin npm.
- **Rama activa: `v2-norte-claro`** ← trabaja aquí. NO en master.
- Otras ramas (no tocar salvo que el cliente lo pida):
  - `master`: versión original publicada (lo que está hoy en vivo, desactualizado).
  - `rediseno-oscuro`: una versión con tema OSCURO/aqua que se descartó. (Sirve de referencia
    de paleta alternativa, pero el cliente eligió el tema CLARO.)
- Dominio: `https://acuarialabs.cl` (NIC Chile). El deploy a Netlify/GitHub **aún está pendiente**
  (hay commits sin pushear). No publiques sin pedírselo.

## Identidad acordada (NO cambiar el rumbo)

- Tema **claro / blanco** (fondo blanco, NO oscuro).
- Marca con espíritu de **laboratorio**: curiosidad, experimentación, ciencia + tecnología.
- Enfoque comercial: **agencia/laboratorio de IA en Antofagasta y el norte de Chile**.
- La paleta es **azul/celeste** (acuático, va con el nombre "Acuaria"). El amarillo NO va aquí
  (eso es de otro proyecto, "IA Norte", carpeta hermana — no mezclar).

## EL PROBLEMA A RESOLVER

Hay **4 azules de marca** + grises, y se perciben como "muchos azules" que no terminan de
pegar entre sí. El encargo: **definir un sistema de color más simple y coherente** (idealmente
1 azul principal + 1 acento celeste + neutros), y aplicarlo de forma consistente en todo el
sitio. NO rediseñar el layout; solo el color.

### Inventario de azules actuales (en `:root` de `styles.css`)

| Variable | Hex | Dónde se usa (aprox.) |
|---|---|---|
| `--color-primary` | `#1a4a6e` | azul oscuro de marca. Títulos, texto, logo, tarjeta destacada, banda regional, footer. ~25 usos. |
| `--color-primary-light` | `#2d7ab3` | celeste medio. **Highlight del hero**, hovers, iconos de pipeline. ~13 usos. |
| `--color-primary-dark` | `#0f3249` | azul muy oscuro. Casi sin uso (1). |
| `--color-accent` | `#4a9fd4` | celeste claro. Acentos, dots, gradientes, glow. ~7 usos. |
| `--color-sky-50` | `#eef7fd` | celeste casi blanco. Fondos suaves, chips. ~2 usos. |

También hay **azules hardcodeados** (mismos hex) que habría que migrar a variables:
- `index.html`: en el SVG de la **hélice de ADN del hero** (`#1a4a6e`, `#2d7ab3`) y en el
  SVG del **pipeline de IA** (gradiente `#2d7ab3`→`#4a9fd4`, partículas, glow).
- `styles.css`: algunos `rgba()` con esos azules en sombras/bordes.

### Puntos concretos que el cliente mencionó
- "tienes muchos toques azul" → demasiada variedad de tonos. Simplificar.
- Sobre el **highlight del hero**: ya se quitó un gradiente de texto (oscuro→claro) que
  "chocaba"; ahora es un solo tono (`--color-primary-light`). Validar que el highlight
  elegido pegue con el resto.
- Los **botones** ya quedaron aprobados ("el botón vale"): primario con gradiente celeste
  iluminado SIN borde, secundario blanco con borde fino. **No rompas los botones** al cambiar
  la paleta; si cambias variables, re-revisa que los botones sigan viéndose bien.

## Recomendación de enfoque (sugerencia, no obligatoria)

1. Definir una escala con **un solo azul base** y sus variantes derivadas (p. ej. 600/500/400/100)
   en vez de 4 azules sin relación clara. Mantener `#1a4a6e` como base es razonable (es el del logo).
2. Reducir a: **primario** (oscuro, texto/marca) + **acento** (un celeste, UNO solo, para
   highlight/hover/dots) + **neutros** (grises ya existentes) + **fondos suaves**.
3. Migrar los hex hardcodeados del SVG (hélice + pipeline) a las variables nuevas para que
   todo cambie desde `:root`.
4. Verificar **contraste/accesibilidad** del texto sobre fondos (sobre todo el celeste).
5. Probar en el navegador (abrir `index.html`) y revisar: hero, banda regional, pipeline,
   pilares (tarjeta destacada), proyectos, contacto, footer.

## Cómo previsualizar
Abrir `index.html` en el navegador (no necesita servidor). Las animaciones del pipeline y los
reveal requieren que la sección esté en viewport.

## Qué NO hacer
- No cambiar a tema oscuro ni meter amarillo.
- No tocar el layout ni el contenido; esto es SOLO color.
- No publicar (push/merge a master) sin autorización del cliente.
- No romper el estilo de botones ya aprobado.

## Definición de "listo"
Una paleta azul simplificada y coherente, aplicada en todo el sitio desde variables en
`:root`, con los SVG migrados a esas variables, botones intactos, y revisada en el navegador.
Dejar un commit en la rama `v2-norte-claro` describiendo el nuevo sistema de color.
