# Handoff — nueva portada de Acuaria Labs (`index-nuevo.html`)

Actualización visual: 15 de septiembre de 2026. Rama `rodrvc/nuevo-look`.

**Prueba vigente:** «La inteligencia toma forma», autorizada por Rodrigo tras encontrar demasiado sutiles el polvo y la lava azul. Ver `docs/decisiones/estilos.md` → «Corriente de luz» para alcance y verificaciones. Tres capas celestes: cinta principal derecha que ilumina la superficie y acompaña el morph, corriente amplia detrás y otra fina izquierda (`backgroundCurrentAt`). Fondo casi blanco, sin círculo técnico/manchas. `currentAt()`, `paintCurrent()` y `paintResponse()` comparten la escena Canvas/SVG; `sceneAt(time,true)` mantiene geometría móvil fija. Cursor suave solo escritorio. JS/poster: `?v=corrientes-profundidad`; CSS: `?v=corriente-luz`. Las explicaciones orbitales de abajo son históricas y ya no describen el código vigente. Rodrigo no eligió la dirección de las tres corrientes: Clara se conserva intacta para comparar. Nueva exploración independiente en `propuesta-umbral.html`; ver «Umbral» en decisiones de estilos. Sin publicar.
Issue en Linear: **ACU-242** — "Landing: nueva portada del sitio — que se vea seria y confiable".

## Punto de entrada

**El trabajo activo es `index-nuevo.html`**, la portada nueva completa. `propuesta-clara.html` fue el prototipo del que nació y sigue vivo porque **comparte el mismo JS y el mismo CSS**: si tocas la escena, cambian las dos.

Antes de editar: leer `CLAUDE.md` y `docs/decisiones/estilos.md`. Las decisiones permanentes viven ahí y están al día — este documento solo explica cómo retomar. No contradecir una decisión registrada sin avisarle a Rodrigo.

Nada de esto está publicado. **`index.html` (la home real) está intacta** y no se reemplaza sin autorización explícita.

## Cómo verlo

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Abrir <http://localhost:8765/index-nuevo.html>. Puede haber un servidor ya corriendo en ese puerto: comprobar antes de levantar otro.

Observar al menos 30 segundos: la escultura cicla matraz → gota → ampolleta cada 9 segundos. Si ves una versión vieja, es caché del navegador: el script va versionado (`?v=...`) y **hay que subir esa versión cada vez que se toca `propuesta-clara.js`**, o Rodrigo seguirá viendo lo anterior. Ya pasó dos veces.

En móvil (≤767 px) la figura queda quieta y las órbitas siguen vivas — es intencional, no un bug. Con `prefers-reduced-motion` se muestra el SVG estático.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `index-nuevo.html` | La portada. `noindex, nofollow` para no competir con `/`; canonical apunta a la home. Conserva todo el contenido, SEO, JSON-LD y GA4 de la home real. |
| `propuesta-clara.js` | Motor visual completo: geometrías, morph, órbitas, render Canvas 2D y menú móvil. Sin dependencias externas. |
| `clara-nucleo.svg` | Respaldo estático, generado desde la misma geometría. **No editar a mano.** |
| `styles.css` | Bloque `.cl-ui` al final. Regla del repo: una sola hoja global para todo el sitio. |
| `cl-reveal.js` | Aparición al hacer scroll. Sin dependencias. El estado oculto vive en `styles.css` bajo `html.cl-reveal-on` (clase que pone un script en línea del `<head>`). **Sumar un elemento exige tocar los dos lados**: la lista del CSS y `GROUPS` en el JS. |
| `docs/decisiones/estilos.md` | Registro de decisiones. Leer antes de cambiar nada. |
| `propuesta-clara.html` | Prototipo original. Comparte JS y CSS con la portada. |

## La escena, en dos minutos

No usa Three.js ni WebGL: son coordenadas 3D proyectadas sobre **Canvas 2D**. Mantener ese enfoque salvo acuerdo explícito.

**La escultura** (`sculptureAt`) cicla entre tres figuras con la misma identidad de partículas — ningún punto aparece ni desaparece, todos viajan a su próxima posición. `flaskAt` (matraz), `makeDrop` (gota), `makeBulb` (ampolleta, con su descarga eléctrica). Seis segundos de lectura y tres de transición por figura.

**Las órbitas** (`orbits`, `sceneAt`) son tres anillos **idénticos girados 60° entre sí**: mismo radio, misma inclinación, misma velocidad, dos luces cada uno. Esa simetría es la decisión, no un accidente: antes cada anillo tenía valores propios y Rodrigo lo leía como desorden. **Si cambias uno de esos valores, cámbialo en los tres.**

**La profundidad es lo que hace que funcione.** `depthOf(z, radio)` da 0 atrás y 1 adelante, y modula grosor, opacidad y tamaño. `orbitPass(front)` dibuja el sistema dos veces: lo que va detrás se pinta *antes* que la escultura y queda tapado por sus partículas; lo de adelante, después. Si pintas todo de una pasada, la escena vuelve a verse plana.

**El modo liviano** (`lite`, bajo 768 px) pinta la escultura **una sola vez** en un canvas fuera de pantalla (`frozen()`) y cada cuadro solo hace `drawImage` más las órbitas. Por eso el teléfono tiene movimiento sin pagar 4810 partículas por cuadro. `paintSculpture(g, screen, scene, size)` es la capa extraída para poder pintar en cualquier contexto. `resize()` invalida el bitmap.

**El reloj** avanza con un paso filtrado (media móvil), no con el retraso real de cada cuadro: así un cuadro atrasado no se ve como un salto. Se detiene con la pausa, fuera de viewport, con la pestaña oculta y con `reduced-motion`.

### Regenerar el respaldo

Después de cualquier cambio de geometría o de escena:

```sh
node --check propuesta-clara.js
node -e "require('fs').writeFileSync('clara-nucleo.svg', require('./propuesta-clara.js').poster())"
```

`poster()` usa exactamente la misma `sceneAt`, así que si el respaldo se ve distinto al canvas, es que olvidaste replicar el cambio en la rama del poster. Ese es el error más fácil de cometer en este archivo: **casi todo cambio visual va en dos lugares**, el `draw()` del canvas y el `poster()` del SVG.

## Lo que Rodrigo pidió y no hay que deshacer

- **Sin texto en la escena.** Nada de etiquetas de agentes ni nombres de figura. El `#cl-shape-label` existe oculto porque el JS le escribe el nombre para lectores de pantalla.
- **Sin flechas →** en botones ni enlaces. Se conserva solo el ↓ del indicador de scroll.
- **La luz rodea la figura, nunca la cruza.** Los pulsos que iban al centro parecían electrones cayendo al núcleo; se eliminaron.
- **Un solo tipo de luz.** Hubo dos (nodos con anillo + cometas rápidos) y se leía como error.
- **Nada de anillos ni "donas"** alrededor de los puntos.

## Verificación: qué correr y qué no prometer

Hay Playwright disponible en este equipo (ruta local, no es dependencia del repo):

```
~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright
```

Se usó `page.clock.install()` + `page.clock.runFor()` para recorrer el ciclo sin esperar en tiempo real. Los scripts fueron ad hoc, en el scratchpad de la sesión; **no hay suite de tests persistida ni `package.json`** — si los necesitas, se rescriben en diez líneas.

Lo que se comprueba en cada cambio: 360/768/1024/1440/1920 px sin desborde ni errores de consola; movimiento real en móvil; rotación de pantalla; `reduced-motion` estático. La continuidad de la animación se puede medir en Node recorriendo `sceneAt(t)` cuadro a cuadro y mirando el salto máximo entre cuadros — así se encontraron los tirones.

**No se midieron Core Web Vitals en un teléfono físico.** Las pruebas son de navegador emulado: no presentarlas como certificación de rendimiento móvil.

## Estado y próximo paso

Rodrigo aprobó la dirección y el resultado actual, con un pero: **"queda un poco de desorden"**. La hipótesis abierta es que son seis luces; el experimento propuesto es bajar a tres, una por anillo. No se ejecutó porque él no lo confirmó.

Falta antes de publicar: revisión suya en el teléfono real, cotejo de SEO/GEO, y su autorización explícita para reemplazar `index.html`. Después del deploy, verificar en vivo con `curl`.

## Cómo trabajar con Rodrigo

No es técnico en SEO ni en git: explicar sin tecnicismos y paso a paso. Confirmar antes de publicar cualquier cosa. Itera mirando: conviene mostrarle capturas o pedirle que recargue, no describirle el cambio. Y cuando dice que algo "se ve raro" suele haber una causa concreta y medible — vale la pena buscarla antes de proponer alternativas.

Lo comercial (clientes, precios, decisiones de negocio) **no vive en este repo, que es público**: va a Notion, bajo la página *Acuaria Labs*.
