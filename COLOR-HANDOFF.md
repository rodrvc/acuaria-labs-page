# Acuaria Labs — Encargo: implementar el nuevo sistema de color

> **Para el equipo / próximo Claude que IMPLEMENTE esto.**
> El diagnóstico ya está hecho y revisado en navegador. La dirección de paleta ya está
> **decidida por el cliente**. Tu trabajo NO es diseñar la paleta — es **aplicarla**.
> Evidencia visual: abre `color-audit.html` en el navegador (antes vs después, lado a lado).

---

## Diagnóstico (confirmado visualmente — no re-investigar)

El cliente percibía "demasiados azules". Tras revisar la página real en el navegador, el
problema concreto es:

1. **4 azules de marca sin relación de escala.** Son tonos sueltos, no una rampa.
2. **Salto brusco** de `#1a4a6e` (primary) a `#2d7ab3` (primary-light): cambia matiz Y saturación.
3. **Dos celestes casi redundantes**: `#2d7ab3` (light) y `#4a9fd4` (accent) son vecinos —
   hacen ruido sin aportar diferencia clara.
4. **En el hero conviven 3 azules a la vez** (título oscuro + highlight celeste + hélice ADN
   con los 3) → es donde más se siente el desorden.
5. **`--gradient-brand` (primary→accent)** abarca un rango oscuro→claro enorme: se ve "elástico".
6. **Hex hardcodeados en SVG** (hélice del hero + pipeline) no salen de `:root`, así que hoy
   no se pueden armonizar desde un solo lugar.

---

## Decisión del cliente: ESCALA DE UN SOLO AZUL

Una sola rampa derivada del **matiz del logo `#1a4a6e` (HSL 205.7°)**. Todos los tonos
comparten ese matiz → cualquier par combina. Un primario (texto/marca) + un único acento
celeste + fondos suaves + los grises neutros que ya existen.

### Nueva escala (hex exactos — listos para pegar en `:root`)

| Token nuevo | Hex | HSL | Reemplaza a | Uso |
|---|---|---|---|---|
| `--primary-800` | `#11324a` | `205.7° 62% 18%` | `--color-primary-dark` | sombras/extremo oscuro (o eliminar) |
| `--primary-700` | `#1a4b70` | `205.7° 62% 27%` | `--color-primary` | **marca, títulos, texto, logo, footer** (≈ el #1a4a6e original) |
| `--primary-600` | `#2a6692` | `205.7° 55% 37%` | — | hover oscuro, banda regional |
| `--primary-500` | `#3c80b4` | `205.7° 50% 47%` | `--color-primary-light` | **hovers, iconos del pipeline** |
| `--primary-400` | `#64a1ce` | `205.7° 52% 60%` | `--color-accent` + highlight | **highlight del hero, dots, glow** (UN solo acento) |
| `--primary-200` | `#b8d5ea` | `205.7° 55% 82%` | — | bordes suaves, partículas SVG |
| `--primary-100` | `#deecf7` | `205.7° 60% 92%` | — | chips ("CÓMO TRABAJAMOS") |
| `--primary-50`  | `#eef6fb` | `205.7° 62% 96%` | `--color-sky-50` | fondos suaves de sección |

> Mantén los grises `--color-gray-*` y `--color-white` tal cual. NO toques los neutros.

### Mapa de migración (variable vieja → nueva)

```
--color-primary        #1a4a6e  →  --primary-700  #1a4b70
--color-primary-light  #2d7ab3  →  --primary-500  #3c80b4   (hover / iconos pipeline)
                                →  --primary-400  #64a1ce   (cuando hacía de highlight del hero)
--color-primary-dark   #0f3249  →  --primary-800  #11324a   (o eliminar; solo 1 uso)
--color-accent         #4a9fd4  →  --primary-400  #64a1ce   (se fusiona con el highlight)
--color-sky-50         #eef7fd  →  --primary-50   #eef6fb
```

> **Ojo con `--color-primary-light`**: hoy hace DOS papeles (hover/iconos *y* highlight del
> hero). En la nueva escala se separan: hover/iconos → `500`, highlight del hero → `400`.
> Revisa caso por caso al migrar (busca cada uso en `styles.css` antes de reemplazar a ciegas).

### Gradientes nuevos

```css
--gradient-brand: linear-gradient(120deg, var(--primary-700) 0%, var(--primary-400) 100%);
--gradient-soft:  linear-gradient(180deg, var(--color-white) 0%, var(--primary-50) 100%);
/* botón primario (NO romper): */ linear-gradient(120deg, var(--primary-500), var(--primary-400));
```

---

## Pasos para implementar

1. En `styles.css` `:root`: reemplaza los 5 azules viejos por la escala de 8 tokens de arriba.
   - Recomendado: deja **alias temporales** para no romper nada (ej. `--color-primary: var(--primary-700);`)
     y migra los usos en una segunda pasada. O migra todo de una si prefieres dejarlo limpio.
2. Migra los **hex hardcodeados de los SVG** en `index.html` a las variables nuevas:
   - SVG **hélice de ADN del hero**: `#1a4a6e`→`--primary-700`, `#2d7ab3`→`--primary-500`.
   - SVG **pipeline de IA**: gradiente `#2d7ab3`→`#4a9fd4` ahora `--primary-500`→`--primary-400`;
     partículas/glow → `--primary-400` / `--primary-200`.
   - (SVG inline usa `fill`/`stroke`; puedes usar `var(--...)` si el SVG está en el DOM, o
     pasar los colores por CSS. Verifica que el SVG quede controlado desde `:root`.)
3. Revisa los `rgba()` de sombras/bordes en `styles.css` que usan los azules viejos
   (p. ej. `rgba(74, 159, 212, .4)` = accent) y reapúntalos al nuevo acento `#64a1ce`.
4. **Highlight del hero**: déjalo en `--primary-400` (un solo tono, sin gradiente de texto).
5. **Botones (NO romper — ya aprobados)**: primario = gradiente celeste iluminado SIN borde
   (`--primary-500`→`--primary-400`); secundario = blanco con borde fino gris. Re-revísalos
   tras cambiar variables.

## Verificación (obligatoria antes de cerrar)

- [ ] Abrir `index.html` en navegador y revisar: hero, banda regional, pipeline, pilares
      (tarjeta destacada), proyectos, contacto, footer. (Las animaciones reveal necesitan que
      la sección entre al viewport.)
- [ ] Los **botones** siguen viéndose como antes (no se rompieron).
- [ ] Ningún azul viejo hardcodeado quedó suelto: `grep -n '#1a4a6e\|#2d7ab3\|#0f3249\|#4a9fd4\|#eef7fd' index.html styles.css` debe volver vacío.
- [ ] **Contraste**: texto blanco sobre `--primary-400` (#64a1ce) es bajo — NO pongas texto
      blanco pequeño sobre ese tono; úsalo solo para acentos/fondos. Texto sobre `--primary-50`
      debe usar `--primary-700`.
- [ ] Commit en la rama **`v2-norte-claro`** describiendo el nuevo sistema de color.

---

## Contexto que NO debe cambiar (identidad acordada)

- Proyecto: landing **estática** (`index.html`, `styles.css`, `script.js`). Sin build, sin npm.
- **Rama activa: `v2-norte-claro`** ← trabaja aquí. NO en master.
- Tema **claro / blanco** (NO oscuro). Espíritu de **laboratorio** (ciencia + tecnología).
- Agencia/laboratorio de **IA en Antofagasta y el norte de Chile**.
- Paleta **azul/celeste** (acuático, va con "Acuaria"). **El amarillo NO va** (es de otro
  proyecto, "IA Norte" — no mezclar).
- Dominio `https://acuarialabs.cl`. Deploy a Netlify/GitHub **pendiente** — **no publicar**
  (no push/merge a master) sin autorización del cliente.

## Qué NO hacer

- No cambiar a tema oscuro ni meter amarillo.
- No tocar layout ni contenido: esto es **SOLO color**.
- No romper el estilo de botones ya aprobado.
- No re-diseñar la paleta: la dirección ya está decidida (escala de un solo azul, arriba).

## Definición de "listo"

Escala de un solo azul aplicada desde `:root` en todo el sitio, SVG (hélice + pipeline)
migrados a esas variables, sin azules viejos hardcodeados, botones intactos, contraste
verificado, y revisada en navegador. Commit en `v2-norte-claro`.

---

### Ramas de referencia (no tocar salvo que el cliente lo pida)
- `master`: versión original publicada (lo que está en vivo, desactualizado).
- `rediseno-oscuro`: versión tema OSCURO/aqua descartada (referencia de paleta alternativa).
