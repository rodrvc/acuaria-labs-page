/* #pipeline 3D graph (prototype). Soft "clay" render with Three.js.
   - Loads Three.js lazily (dynamic import) only when the section nears the viewport.
   - Desktop only: >1024px, fine pointer, no reduced motion, WebGL available.
     Otherwise the flat HTML/SVG graph stays untouched.
   - The labels are the real <li> elements (text stays in the DOM); JS only positions them. */

const section = document.querySelector('#pipeline');
const graph = section && section.querySelector('.cl-network-graph');
const flow = graph && graph.querySelector('.cl-flow');
const pauseBox = section && section.querySelector('.cl-network-pause');

const mqDesktop = window.matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine)');
const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function hasWebGL() {
    try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
}
const eligible = () => mqDesktop.matches && !mqReduced.matches && hasWebGL();

let instance = null;   // active scene controller
let loading = false;
let nearViewport = false;

if (graph && flow) {
    const io = new IntersectionObserver((entries) => {
        nearViewport = entries.some((e) => e.isIntersecting);
        if (nearViewport) boot();
    }, { rootMargin: '500px 0px' });
    io.observe(section);
    mqDesktop.addEventListener('change', sync);
    mqReduced.addEventListener('change', sync);
}

function sync() {
    if (eligible()) { if (nearViewport) boot(); } else teardown();
}

async function boot() {
    if (instance || loading || !eligible()) return;
    loading = true;
    try {
        const [THREE, { RoundedBoxGeometry }, { RoomEnvironment }] = await Promise.all([
            import('three'),
            import('three/addons/geometries/RoundedBoxGeometry.js'),
            import('three/addons/environments/RoomEnvironment.js'),
        ]);
        if (!eligible()) return;
        instance = await createScene(THREE, RoundedBoxGeometry, RoomEnvironment);
    } catch (err) {
        console.warn('pipeline-3d: falling back to the flat graph', err);
        teardown();
    } finally {
        loading = false;
    }
}

function teardown() {
    if (instance) { instance.dispose(); instance = null; }
}

/* ------------------------------------------------------------------ */

const NODES = [
    // key, position (x, z), size, radius, clay colour
    { x: -9.2, z: 0,    size: 2.6, r: 0.42, color: '#f6f9fb', dx: -44 },
    { x: -3.6, z: 0,    size: 2.6, r: 0.42, color: '#f2f6f9', dx: 30 },
    { x: 1.7,  z: 0,    size: 3.5, r: 0.55, color: '#eef3f8', core: true, dx: -92, side: 'left' },
    { x: 7.8,  z: -3.4, size: 2.6, r: 0.42, color: '#f4f7fa', dx: 10 },
    { x: 7.8,  z: 3.4,  size: 2.6, r: 0.42, color: '#f0f4f8', dx: 36 },
    { x: 13.4, z: 0,    size: 2.6, r: 0.42, color: '#f3f6f9', dx: 34 },
];
const LABEL_BELOW = new Set([0, 1, 4]);   // every other label sits above its cube
const TUBE_Y = 1.3;

function darken(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const c = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
    return `rgb(${c(16)},${c(8)},${c(0)})`;
}

function loadIcon(li, stroke) {
    return new Promise((resolve) => {
        const src = li.querySelector('svg');
        if (!src) return resolve(null);
        const svg = src.cloneNode(true);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', '512');
        svg.setAttribute('height', '512');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', stroke);
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    });
}

function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

/* Recessed pocket floor for the top face (light comes from the top-left). The icon and the frosted
   glass lid are separate layers so the icon can glow during the pulse reaction. */
function makePocketTexture(THREE, node) {
    const S = 512, pad = 18, rad = 70;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    const x = pad, w = S - pad * 2;
    roundRectPath(ctx, x, x, w, w, rad);
    const g = ctx.createLinearGradient(0, 0, S, S);
    if (node.core) { g.addColorStop(0, '#10304d'); g.addColorStop(1, '#21557f'); }
    else { g.addColorStop(0, '#d6e1ea'); g.addColorStop(1, '#eef3f8'); }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    roundRectPath(ctx, x, x, w, w, rad);
    ctx.clip();
    const frame = (ox, oy, colour, blur) => {
        ctx.save();
        ctx.shadowColor = colour; ctx.shadowBlur = blur; ctx.shadowOffsetX = ox; ctx.shadowOffsetY = oy;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.rect(-400, -400, S + 800, S + 800);
        roundRectPath2(ctx, x, x, w, w, rad);
        ctx.fill('evenodd');
        ctx.restore();
    };
    frame(16, 16, node.core ? 'rgba(3,18,36,0.7)' : 'rgba(60,90,120,0.4)', 30);
    frame(-9, -9, node.core ? 'rgba(160,215,255,0.22)' : 'rgba(255,255,255,0.9)', 16);
    ctx.restore();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function makeIconTexture(THREE, node, icon) {
    const S = 512;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    if (icon) {
        const isz = node.core ? 290 : 270, ix = (S - isz) / 2;
        const tint = (css, dx, dy, alpha) => {
            const t = document.createElement('canvas');
            t.width = t.height = S;
            const c = t.getContext('2d');
            c.drawImage(icon, ix, ix, isz, isz);
            c.globalCompositeOperation = 'source-in';
            c.fillStyle = css; c.fillRect(0, 0, S, S);
            ctx.globalAlpha = alpha;
            ctx.drawImage(t, dx, dy);
            ctx.globalAlpha = 1;
        };
        tint(node.core ? '#031a30' : '#1c4d78', 5, 5, 0.3);       // depth under the glass
        tint(node.core ? '#c4e8ff' : '#3a86bb', 0, 0, 1);         // brand-blue icon
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

/* Frosted glass lid: translucent haze, lit rim and a soft specular streak (cheap fake, no transmission pass). */
function makeGlassTexture(THREE, node) {
    const S = 512, pad = 34, rad = 58;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    const x = pad, w = S - pad * 2;
    roundRectPath(ctx, x, x, w, w, rad);
    const g = ctx.createLinearGradient(x, x, x + w, x + w);
    if (node.core) { g.addColorStop(0, 'rgba(120,190,245,0.34)'); g.addColorStop(1, 'rgba(18,64,108,0.34)'); }
    else { g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(226,240,252,0.3)'); }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    roundRectPath(ctx, x, x, w, w, rad);
    ctx.clip();
    // frost grain
    for (let k = 0; k < 2600; k++) {
        ctx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.07).toFixed(3)})`;
        ctx.fillRect(x + Math.random() * w, x + Math.random() * w, 2, 2);
    }
    // specular streak, top-left
    const sg = ctx.createLinearGradient(x, x, x + w * 0.7, x + w * 0.7);
    sg.addColorStop(0, 'rgba(255,255,255,0.42)'); sg.addColorStop(0.45, 'rgba(255,255,255,0.08)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.moveTo(x, x); ctx.lineTo(x + w * 0.85, x); ctx.lineTo(x, x + w * 0.85); ctx.closePath(); ctx.fill();
    ctx.restore();
    // lit rim
    roundRectPath(ctx, x + 1.5, x + 1.5, w - 3, w - 3, rad);
    ctx.lineWidth = 3;
    ctx.strokeStyle = node.core ? 'rgba(170,222,255,0.75)' : 'rgba(255,255,255,0.9)';
    ctx.stroke();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function makeHaloTexture(THREE) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(150,215,255,0.95)'); g.addColorStop(0.55, 'rgba(90,185,245,0.4)'); g.addColorStop(1, 'rgba(90,185,245,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
}
function roundRectPath2(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function makeBlobTexture(THREE) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(64, 64, 6, 64, 64, 62);
    g.addColorStop(0, 'rgba(35,70,100,0.5)');
    g.addColorStop(0.5, 'rgba(35,70,100,0.2)');
    g.addColorStop(1, 'rgba(17,50,74,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
}

function makeGrainTexture(THREE) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const c = cv.getContext('2d');
    const d = c.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * 70;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    c.putImageData(d, 0, 0);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
}

function roundedPath(THREE, pts, radius) {
    const path = new THREE.CurvePath();
    let cur = pts[0].clone();
    for (let i = 1; i < pts.length - 1; i++) {
        const p = pts[i];
        const toPrev = pts[i - 1].clone().sub(p).normalize();
        const toNext = pts[i + 1].clone().sub(p).normalize();
        const a = p.clone().addScaledVector(toPrev, radius);
        const b = p.clone().addScaledVector(toNext, radius);
        if (cur.distanceTo(a) > 1e-4) path.add(new THREE.LineCurve3(cur, a));
        path.add(new THREE.QuadraticBezierCurve3(a, p.clone(), b));
        cur = b;
    }
    path.add(new THREE.LineCurve3(cur, pts[pts.length - 1].clone()));
    return path;
}

const TUBE_VERT = `
varying vec2 vUv; varying vec3 vN;
void main(){ vUv = uv; vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const TUBE_FRAG = `
uniform vec3 uBase; uniform vec3 uHot; uniform float uLen; uniform float uDash; uniform float uPos[3]; uniform float uOn; uniform float uAlpha;
varying vec2 vUv; varying vec3 vN;
void main(){
  float s = vUv.x * uLen;
  if (uDash > 0.0 && mod(s, uDash) > uDash * 0.55) discard;
  float rim = pow(1.0 - abs(vN.z), 2.0);
  float p = 0.0;
  for (int i = 0; i < 3; i++) { float d = (s - uPos[i]) / 1.0; p += exp(-d * d); }
  p = clamp(p, 0.0, 1.0) * uOn;
  vec3 col = uBase * (0.9 + 0.25 * rim) + rim * 0.25;
  col = mix(col, uHot, p * 0.95);
  gl_FragColor = vec4(col, uAlpha);
  #include <colorspace_fragment>
}`;

async function createScene(THREE, RoundedBoxGeometry, RoomEnvironment) {
    const items = [...flow.children];
    // label style switch: data-label-style="annotation" on .cl-network-graph (default = holographic cards)
    const ANNOT = graph.dataset.labelStyle === 'annotation';
    const disposables = [];
    const track = (o) => { disposables.push(o); return o; };

    const canvas = document.createElement('canvas');
    canvas.className = 'pl-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    graph.prepend(canvas);
    graph.classList.add('pl-gl');

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    const ENV = 0.75;

    // lights: soft sky/ground + key from the top-left + faint cool fill
    scene.add(new THREE.HemisphereLight(0xf0f7ff, 0xc3d3e0, 0.55));
    const key = new THREE.DirectionalLight(0xfff8ee, 1.6);
    key.position.set(-14, 24, 12);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    const sc = key.shadow.camera;
    sc.left = -24; sc.right = 24; sc.top = 24; sc.bottom = -24; sc.near = 1; sc.far = 80;
    key.shadow.radius = 11; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbfdcf5, 0.55);
    fill.position.set(16, 9, -6);
    scene.add(fill);

    const CENTER = new THREE.Vector3(2.7, 0, 3.5);
    const pivot = new THREE.Group();
    pivot.position.copy(CENTER);
    const content = new THREE.Group();
    content.position.copy(CENTER).negate();
    pivot.add(content);
    scene.add(pivot);

    // ground that only receives shadows
    const ground = new THREE.Mesh(
        track(new THREE.PlaneGeometry(90, 90)),
        track(new THREE.ShadowMaterial({ color: 0x2a4c6b, opacity: 0.3 }))
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    content.add(ground);

    const grain = track(makeGrainTexture(THREE));
    const blobTex = track(makeBlobTexture(THREE));
    const haloTex = track(makeHaloTexture(THREE));

    const icons = await Promise.all(items.map((li, i) => loadIcon(li, NODES[i].core ? '#1f5a86' : '#16394f')));

    // ---- nodes
    const nodeData = [];
    NODES.forEach((n, i) => {
        const geo = track(new RoundedBoxGeometry(n.size, n.size, n.size, 7, n.r));
        const mat = track(new THREE.MeshPhysicalMaterial({
            color: n.color, roughness: 0.88, metalness: 0, envMapIntensity: ENV,
            bumpMap: grain, bumpScale: 0.22,
            sheen: 0.5, sheenRoughness: 0.8, sheenColor: new THREE.Color('#dcecf8'),
        }));
        const group = new THREE.Group();
        content.add(group);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(n.x, n.size / 2, n.z);
        mesh.castShadow = mesh.receiveShadow = true;
        group.add(mesh);

        // contact shadow blob (ambient-occlusion feel); stays on the ground while the cube lifts
        const blobMat = track(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: n.core ? 1 : 0.9 }));
        const blob = new THREE.Mesh(track(new THREE.PlaneGeometry(n.size * 2.7, n.size * 2.7)), blobMat);
        blob.rotation.x = -Math.PI / 2;
        blob.position.set(n.x + 0.1, 0.012, n.z + 0.1);
        content.add(blob);

        // top inset: pocket floor -> halo -> icon -> frosted glass lid
        const ps = n.size - n.r * 1.25, ty = n.size;
        let order = 2;
        const layer = (geo2, material, dy) => {
            material.polygonOffset = true; material.polygonOffsetFactor = -(order++); material.polygonOffsetUnits = -4;
            const m = new THREE.Mesh(geo2, material);
            m.rotation.x = -Math.PI / 2;
            m.position.set(n.x, ty + dy, n.z);
            group.add(m);
            return m;
        };
        const pg = track(new THREE.PlaneGeometry(ps, ps));
        const pocket = layer(pg, track(new THREE.MeshStandardMaterial({
            map: track(makePocketTexture(THREE, n)), transparent: true, roughness: 0.75, metalness: 0, envMapIntensity: ENV,
            polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
        })), 0.004);
        pocket.receiveShadow = true;
        const haloMat = track(new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false, color: 0xffffff }));
        layer(track(new THREE.PlaneGeometry(ps * 1.1, ps * 1.1)), haloMat, 0.007);
        const iconMat = track(new THREE.MeshBasicMaterial({ map: track(makeIconTexture(THREE, n, icons[i])), transparent: true, depthWrite: false, toneMapped: false }));
        layer(pg, iconMat, 0.010);
        layer(pg, track(new THREE.MeshPhysicalMaterial({
            map: track(makeGlassTexture(THREE, n)), transparent: true, roughness: 0.32, metalness: 0,
            clearcoat: 1, clearcoatRoughness: 0.22, envMapIntensity: 1.5, depthWrite: false,
            polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
        })), 0.014);

        nodeData.push({ n, mesh, group, iconMat, haloMat, half: n.size / 2 });
    });

    // ---- tube anchors on the cube faces (no extra geometry: tubes emerge straight from the porcelain)
    function addPort(i, face) {   // face: '+x' '-x' '+z' '-z'
        const { n } = nodeData[i];
        const h = n.size / 2;
        const horiz = face[1] === 'x';
        const sign = face[0] === '+' ? 1 : -1;
        return new THREE.Vector3(n.x + (horiz ? sign * h : 0), TUBE_Y, n.z + (horiz ? 0 : sign * h));
    }

    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const p01 = addPort(0, '+x'), p02a = addPort(1, '-x'), p02b = addPort(1, '+x');
    const p03a = addPort(2, '-x'), p03b = addPort(2, '+x'), p03c = addPort(2, '+z');
    const p4a_in = addPort(3, '-x'), p4a_out = addPort(3, '+x');
    const p4b_in = addPort(4, '-x'), p4b_out = addPort(4, '+x');
    const p05_in = addPort(5, '-x'), p05_out = addPort(5, '+z');

    const bez = (a, b) => {
        const d = Math.abs(b.x - a.x) * 0.5;
        return new THREE.CubicBezierCurve3(a, a.clone().add(V(d, 0, 0)), b.clone().add(V(-d, 0, 0)), b);
    };
    const curves = [
        new THREE.LineCurve3(p01, p02a),                                        // 0: 01 -> 02
        new THREE.LineCurve3(p02b, p03a),                                       // 1: 02 -> 03
        bez(p03b, p4a_in),                                                      // 2: 03 -> 04A
        bez(p03b, p4b_in),                                                      // 3: 03 -> 04B
        bez(p4a_out, p05_in),                                                   // 4: 04A -> 05
        bez(p4b_out, p05_in),                                                   // 5: 04B -> 05
        roundedPath(THREE, ANNOT ? [p05_out, V(13.4, TUBE_Y, 7.6), V(1.7, TUBE_Y, 7.6), p03c] : [p05_out, V(13.4, TUBE_Y, 9.6), V(1.7, TUBE_Y, 9.6), p03c], ANNOT ? 1.1 : 1.6),   // 6: 05 -> 03 (dashed)
    ];
    const baseCol = new THREE.Color('#3fa3e6'), hotCol = new THREE.Color('#f2fbff');
    const glassMat = track(new THREE.MeshPhysicalMaterial({
        color: 0xdff2ff, roughness: 0.12, metalness: 0, transparent: true, opacity: 0.26,
        envMapIntensity: 1.2, depthWrite: false,
    }));
    const edges = curves.map((curve, idx) => {
        const len = curve.getLength();
        const dashed = idx === 6;
        const mat = track(new THREE.ShaderMaterial({
            vertexShader: TUBE_VERT, fragmentShader: TUBE_FRAG, toneMapped: false, transparent: dashed && ANNOT, depthWrite: !(dashed && ANNOT),
            uniforms: {
                uBase: { value: dashed ? new THREE.Color('#8cc4ea') : baseCol }, uHot: { value: hotCol },
                uLen: { value: len }, uDash: { value: dashed ? 0.62 : 0 },
                uPos: { value: [-99, -99, -99] }, uOn: { value: 1 }, uAlpha: { value: dashed && ANNOT ? 0.4 : 1 },
            },
        }));
        const segs = Math.max(24, Math.ceil(len * 14));
        const core = new THREE.Mesh(track(new THREE.TubeGeometry(curve, segs, dashed ? (ANNOT ? 0.03 : 0.045) : 0.065, 12, false)), mat);
        content.add(core);
        if (!dashed) {
            const glass = new THREE.Mesh(track(new THREE.TubeGeometry(curve, segs, 0.14, 14, false)), glassMat);
            glass.castShadow = true;
            glass.renderOrder = 2;
            content.add(glass);
        }
        return { len, mat };
    });

    // glow sprites that ride the pulse heads
    const glowCv = document.createElement('canvas');
    glowCv.width = glowCv.height = 128;
    const gc = glowCv.getContext('2d');
    const gg = gc.createRadialGradient(64, 64, 0, 64, 64, 64);
    gg.addColorStop(0, 'rgba(235,250,255,0.95)'); gg.addColorStop(0.18, 'rgba(120,205,255,0.7)'); gg.addColorStop(0.5, 'rgba(60,160,230,0.22)'); gg.addColorStop(1, 'rgba(60,160,230,0)');
    gc.fillStyle = gg; gc.fillRect(0, 0, 128, 128);
    const glowTex = track(new THREE.CanvasTexture(glowCv));
    const sprites = [0, 1, 2].map(() => {
        const sp = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false })));
        sp.scale.set(1.9, 1.9, 1); sp.renderOrder = 10; sp.visible = false;
        content.add(sp);
        return sp;
    });

    // pulse routes (edge indexes)
    const routes = [[0, 1, 2, 4], [0, 1, 3, 5], [6]];
    routes.forEach((r) => { r.total = r.reduce((s, e) => s + edges[e].len, 0); });
    const PERIOD = routes[0].total + 7;
    const SPEED = 4.6;

    function updatePulses(t, on) {
        edges.forEach((e) => { e.mat.uniforms.uPos.value = [-99, -99, -99]; e.mat.uniforms.uOn.value = on ? 1 : 0; });
        sprites.forEach((sp) => { sp.visible = false; });
        glowT.fill(0);
        if (!on) return;
        const heads = [
            (t * SPEED) % PERIOD,
            (t * SPEED + PERIOD / 2) % PERIOD,
            ((t * SPEED - routes[0].total) % PERIOD + PERIOD) % PERIOD,
        ];
        routes.forEach((route, ri) => {
            let s = heads[ri], acc = 0;
            if (s > route.total) return;
            for (const ei of route) {
                if (s <= acc + edges[ei].len) {
                    edges[ei].mat.uniforms.uPos.value[ri] = s - acc;
                    sprites[ri].position.copy(curves[ei].getPointAt(Math.min(1, (s - acc) / edges[ei].len)));
                    sprites[ri].visible = true;
                    break;
                }
                acc += edges[ei].len;
            }
        });
        {
            sprites.forEach((sp) => {
                if (!sp.visible) return;
                NODES.forEach((n, i) => {
                    const d = Math.max(0, Math.hypot(sp.position.x - n.x, sp.position.z - n.z) - n.size * 0.5);
                    glowT[i] = Math.max(glowT[i], Math.exp(-(d / 1.1) * (d / 1.1)));
                });
            });
        }
    }

    // ---- camera (orthographic, isometric-ish) fitted to the graph box
    const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 400);
    const AZ = THREE.MathUtils.degToRad(-12), EL = THREE.MathUtils.degToRad(30);
    const dir = new THREE.Vector3(Math.sin(AZ) * Math.cos(EL), Math.sin(EL), Math.cos(AZ) * Math.cos(EL));
    camera.position.copy(CENTER).addScaledVector(dir, 120);
    camera.lookAt(CENTER);
    camera.updateMatrixWorld();

    const fitPoints = [];
    NODES.forEach((n) => {
        for (const dx of [-1, 1]) for (const dz of [-1, 1]) for (const y of [0, n.size]) {
            fitPoints.push(V(n.x + dx * n.size / 2, y, n.z + dz * n.size / 2));
        }
    });
    NODES.forEach((n) => { for (const dx of [-1, 1]) for (const dz of [-1, 1]) fitPoints.push(V(n.x + dx * n.size * 0.95, 0, n.z + dz * n.size * 0.95)); });
    fitPoints.push(V(-10.5, 0, 0), V(1.7, 0, ANNOT ? 8 : 10), V(14.7, 0, ANNOT ? 8 : 10));

    let W = 1, H = 1, sizes = items.map(() => ({ w: 190, h: 100 }));
    function resize() {
        const r = graph.getBoundingClientRect();
        W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
        renderer.setSize(W, H, false);
        sizes = items.map((li) => ({ w: li.offsetWidth, h: li.offsetHeight }));
        const aspect = W / H;
        pivot.updateMatrixWorld(true);
        camera.updateMatrixWorld();
        const inv = camera.matrixWorldInverse;
        let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
        fitPoints.forEach((p) => {
            const v = p.clone().sub(CENTER).add(CENTER).applyMatrix4(inv);
            minx = Math.min(minx, v.x); maxx = Math.max(maxx, v.x);
            miny = Math.min(miny, v.y); maxy = Math.max(maxy, v.y);
        });
        let padT = 150, padB = 135, padX = 56;
        if (ANNOT) {
            const hTop = Math.max(...items.map((_, i) => (LABEL_BELOW.has(i) ? 0 : sizes[i].h)));
            const hBot = Math.max(...items.map((_, i) => (LABEL_BELOW.has(i) ? sizes[i].h : 0)));
            padT = 34 + hTop; padB = 34 + hBot; padX = 24;
        }
        let h = (maxy - miny) / 2;
        for (let k = 0; k < 4; k++) {
            const upp = (2 * h) / H;
            h = Math.max((maxy - miny + (padT + padB) * upp) / 2, (maxx - minx + 2 * padX * upp) / (2 * aspect));
        }
        const upp = (2 * h) / H, w = h * aspect;
        const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2 + (padT - padB) * upp / 2;
        camera.left = cx - w; camera.right = cx + w; camera.top = cy + h; camera.bottom = cy - h;
        camera.updateProjectionMatrix();
        placeLabels();
    }

    // ---- projection beams: SVG overlay from each cube to its label (re-aligned every frame)
    const NS = 'http://www.w3.org/2000/svg';
    const beamSvg = document.createElementNS(NS, 'svg');
    beamSvg.setAttribute('class', 'pl-beams');
    beamSvg.setAttribute('aria-hidden', 'true');
    const defs = document.createElementNS(NS, 'defs');
    beamSvg.appendChild(defs);
    const beams = ANNOT ? [] : NODES.map((n, i) => {
        const up = !LABEL_BELOW.has(i);
        const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
        const col = n.core ? '120,205,255' : '70,185,245';
        const lg = mk('linearGradient', { id: 'plb' + i, x1: 0, x2: 0, y1: up ? 1 : 0, y2: up ? 0 : 1 });
        lg.append(mk('stop', { offset: 0, 'stop-color': `rgb(${col})`, 'stop-opacity': 0.5 }), mk('stop', { offset: 0.65, 'stop-color': `rgb(${col})`, 'stop-opacity': 0.08 }), mk('stop', { offset: 1, 'stop-color': `rgb(${col})`, 'stop-opacity': 0 }));
        const lg2 = mk('linearGradient', { id: 'plc' + i, x1: 0, x2: 0, y1: up ? 1 : 0, y2: up ? 0 : 1 });
        lg2.append(mk('stop', { offset: 0, 'stop-color': '#ffffff', 'stop-opacity': 0.85 }), mk('stop', { offset: 0.7, 'stop-color': `rgb(${col})`, 'stop-opacity': 0.25 }), mk('stop', { offset: 1, 'stop-color': `rgb(${col})`, 'stop-opacity': 0 }));
        const rg = mk('radialGradient', { id: 'plg' + i });
        rg.append(mk('stop', { offset: 0, 'stop-color': '#f4fcff', 'stop-opacity': 0.85 }), mk('stop', { offset: 0.4, 'stop-color': `rgb(${col})`, 'stop-opacity': 0.3 }), mk('stop', { offset: 1, 'stop-color': `rgb(${col})`, 'stop-opacity': 0 }));
        defs.append(lg, lg2, rg);
        const g = mk('g', { class: 'beam' });
        const poly = mk('polygon', { fill: `url(#plb${i})` });
        const core = mk('polygon', { fill: `url(#plc${i})` });
        const glow = mk('ellipse', { fill: `url(#plg${i})`, rx: n.core ? 30 : 22, ry: n.core ? 10 : 8 });
        g.append(poly, core, glow);
        beamSvg.appendChild(g);
        return { poly, core, glow, up };
    });

    // annotation style: 1px leader + dot per cube (lit by the travelling pulse), no beams
    const GRAY = [176, 196, 212], LIT = [60, 168, 232];
    const leaders = !ANNOT ? [] : NODES.map(() => {
        const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
        const halo = mk('circle', { r: 8, fill: 'rgb(90,185,240)', opacity: 0 });
        const path = mk('path', { fill: 'none', 'stroke-width': 1, 'stroke-linecap': 'round' });
        const dot = mk('circle', { r: 2.6, stroke: '#ffffff', 'stroke-width': 1 });
        beamSvg.append(halo, path, dot);
        return { halo, path, dot };
    });
    const glow = NODES.map(() => 0), glowT = NODES.map(() => 0);
    if (ANNOT) beamSvg.classList.add('pl-leaders');
    graph.insertBefore(beamSvg, flow);
    items.forEach((li, i) => li.style.setProperty('--d', (0.25 + i * 0.22).toFixed(2) + 's'));

    // ---- labels: real <li> elements positioned from the projected cube
    const tmp = new THREE.Vector3();
    const toScreen = (x, y, z) => { tmp.set(x, y, z); content.localToWorld(tmp); tmp.project(camera); return [(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H]; };

    // Annotation layout: two tidy rows (above / below the scene), leader from each cube to its label rule.
    function placeAnnotations() {
        const dots = nodeData.map(({ n }, i) => {
            const below = LABEL_BELOW.has(i);
            let best = null;
            const e = n.size / 2 - n.r * 0.55;   // inset so the dot sits on the cube, not in the air past a rounded corner
            for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
                const p = toScreen(n.x + dx * e, (below ? n.r * 0.5 : n.size) + nodeData[i].group.position.y, n.z + dz * e);
                if (!best || (below ? p[1] > best[1] : p[1] < best[1])) best = p;
            }
            return best;
        });
        const GAP = 28;
        const topY = Math.min(...dots.filter((_, i) => !LABEL_BELOW.has(i)).map((d) => d[1])) - GAP;
        const botY = Math.max(...dots.filter((_, i) => LABEL_BELOW.has(i)).map((d) => d[1])) + GAP;
        [false, true].forEach((below) => {
            const idx = items.map((_, i) => i).filter((i) => LABEL_BELOW.has(i) === below);
            const lefts = {};
            idx.forEach((i) => { const w = sizes[i].w; lefts[i] = NODES[i].side === 'left' ? dots[i][0] - w : dots[i][0]; });
            idx.sort((a, b) => lefts[a] - lefts[b]);
            for (let k = 1; k < idx.length; k++) {
                const prev = idx[k - 1], i = idx[k];
                const need = lefts[prev] + sizes[prev].w + 16;
                if (lefts[i] < need) lefts[i] = need;
            }
            idx.forEach((i) => {
                const { w, h } = sizes[i];
                lefts[i] = Math.max(4, Math.min(W - w - 4, lefts[i]));
                const top = below ? botY : topY - h;
                items[i].style.transform = `translate(${lefts[i].toFixed(1)}px, ${top.toFixed(1)}px)`;
                const [sx, sy] = dots[i];
                const edge = below ? botY : topY;
                const x1 = Math.min(lefts[i], sx), x2 = Math.max(lefts[i] + w, sx);
                const L = leaders[i];
                L.path.setAttribute('d', `M${sx.toFixed(1)} ${sy.toFixed(1)}V${edge.toFixed(1)}M${x1.toFixed(1)} ${edge.toFixed(1)}H${x2.toFixed(1)}`);
                L.dot.setAttribute('cx', sx.toFixed(1)); L.dot.setAttribute('cy', sy.toFixed(1));
                L.halo.setAttribute('cx', sx.toFixed(1)); L.halo.setAttribute('cy', sy.toFixed(1));
            });
        });
        styleLeaders();
    }
    function styleLeaders() {
        leaders.forEach((L, i) => {
            const g = Math.max(0, Math.min(1, glow[i]));
            const c = GRAY.map((v, k) => Math.round(v + (LIT[k] - v) * g));
            const rgb = `rgb(${c[0]},${c[1]},${c[2]})`;
            L.path.setAttribute('stroke', rgb);
            L.dot.setAttribute('fill', rgb);
            L.halo.setAttribute('opacity', (g * 0.35).toFixed(3));
        });
    }
    function placeLabels() {
        beamSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        pivot.updateMatrixWorld(true);
        camera.updateMatrixWorld();
        if (ANNOT) { placeAnnotations(); return; }
        items.forEach((li, i) => {
            const { n } = nodeData[i];
            const below = LABEL_BELOW.has(i);
            const ys = below ? [0] : [n.size];
            let cx = 0, best = below ? -1e9 : 1e9;
            for (const dx of [-1, 1]) for (const dz of [-1, 1]) for (const y of ys) {
                tmp.set(n.x + dx * n.size / 2, y, n.z + dz * n.size / 2);
                content.localToWorld(tmp);
                tmp.project(camera);
                const sy = (-tmp.y * 0.5 + 0.5) * H;
                best = below ? Math.max(best, sy) : Math.min(best, sy);
            }
            tmp.set(n.x, n.size / 2, n.z);
            content.localToWorld(tmp); tmp.project(camera);
            cx = (tmp.x * 0.5 + 0.5) * W;
            const y = best + (below ? 38 : -42);
            // beam: from the cube (top centre, or base front for labels below) to the label edge
            const lcx = cx + (n.dx || 0);
            tmp.set(n.x, below ? 0 : n.size, below ? n.z + n.size / 2 : n.z);
            content.localToWorld(tmp); tmp.project(camera);
            const sx = (tmp.x * 0.5 + 0.5) * W, sy = (-tmp.y * 0.5 + 0.5) * H;
            const ex = Math.max(lcx - 66, Math.min(lcx + 66, sx));
            const bm = beams[i], half0 = 4, half1 = 22;
            const ey = below ? y - 4 : y + 4;   // stops just short of the label
            bm.poly.setAttribute('points', `${sx - half0},${sy} ${sx + half0},${sy} ${ex + half1},${ey} ${ex - half1},${ey}`);
            bm.core.setAttribute('points', `${sx - 0.7},${sy} ${sx + 0.7},${sy} ${ex + 0.7},${ey} ${ex - 0.7},${ey}`);
            bm.glow.setAttribute('cx', sx); bm.glow.setAttribute('cy', sy);
            li.style.transform = `translate(${(cx + (n.dx || 0)).toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, ${below ? '0' : '-100%'})`;
        });
    }

    // ---- pulse reaction: icon glow (fast attack, slow fade) + eased spring lift + idle float
    const energy = NODES.map(() => 0), lift = NODES.map(() => 0), vel = NODES.map(() => 0);
    function updateNodes(dt) {
        const ka = 1 - Math.exp(-dt / 0.07), kd = Math.exp(-dt / 0.8);
        const steps = Math.max(1, Math.ceil(dt / 0.008)), h = dt / steps;
        nodeData.forEach(({ n, group, iconMat, haloMat }, i) => {
            const t = glowT[i];
            energy[i] = t > energy[i] ? energy[i] + (t - energy[i]) * ka : Math.max(t, energy[i] * kd);
            const target = energy[i] * n.size * 0.06;           // 6% of the cube height
            for (let k = 0; k < steps; k++) {                    // damped spring (slight overshoot)
                vel[i] += (70 * (target - lift[i]) - 10 * vel[i]) * h;
                lift[i] += vel[i] * h;
            }
            const idle = Math.sin((clock / (7 + i * 0.9)) * Math.PI * 2 + i * 1.7) * 0.022;
            group.position.y = Math.max(0, lift[i]) + idle + 0.022;
            iconMat.color.setScalar(1 + energy[i] * 1.5);
            haloMat.opacity = Math.min(1, energy[i] * 0.95);
            glow[i] = energy[i];
        });
    }

    // ---- pointer parallax
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    const onMove = (e) => {
        const r = graph.getBoundingClientRect();
        target.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.2, 1.2);
        target.y = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1.2, 1.2);
    };
    const onLeave = () => { target.x = 0; target.y = 0; };
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);

    // ---- loop, only while visible
    let visible = true, tabVisible = !document.hidden, raf = 0, last = performance.now(), clock = 0, paused = !!(pauseBox && pauseBox.checked);
    function frame(now) {
        raf = 0;
        if (!(visible && tabVisible)) return;
        const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
        const k = 1 - Math.pow(0.001, dt);   // eased follow, frame-rate independent
        cur.x += (target.x - cur.x) * k * 0.9;
        cur.y += (target.y - cur.y) * k * 0.9;
        pivot.rotation.y = cur.x * 0.14;
        pivot.rotation.x = cur.y * 0.05;
        if (!paused) clock += dt;
        updatePulses(clock, !paused);
        updateNodes(dt);
        renderer.render(scene, camera);
        placeLabels();
        raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf && visible && tabVisible) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    const vio = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); kick(); }, { rootMargin: '80px' });
    vio.observe(graph);
    const onVis = () => { tabVisible = !document.hidden; kick(); };
    document.addEventListener('visibilitychange', onVis);
    const onPause = () => { paused = pauseBox.checked; kick(); };
    pauseBox && pauseBox.addEventListener('change', onPause);
    const ro = new ResizeObserver(() => { resize(); kick(); });
    ro.observe(graph);

    resize();
    renderer.render(scene, camera);
    placeLabels();
    graph.classList.add('pl-ready');
    kick();

    return {
        dispose() {
            if (raf) cancelAnimationFrame(raf);
            raf = 0; visible = false;
            vio.disconnect(); ro.disconnect();
            section.removeEventListener('pointermove', onMove);
            section.removeEventListener('pointerleave', onLeave);
            document.removeEventListener('visibilitychange', onVis);
            pauseBox && pauseBox.removeEventListener('change', onPause);
            disposables.forEach((d) => d.dispose && d.dispose());
            envRT.dispose(); pmrem.dispose(); renderer.dispose();
            canvas.remove(); beamSvg.remove();
            graph.classList.remove('pl-gl', 'pl-ready');
            items.forEach((li) => { li.style.transform = ''; });
        },
    };
}
