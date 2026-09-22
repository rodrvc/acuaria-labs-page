/*
 * Marea hero — water caustics rendered with a hand-written WebGL shader.
 * No external dependencies. Pauses when offscreen or tab hidden; renders a
 * single static frame under prefers-reduced-motion; the CSS gradient behind
 * the canvas is the fallback when WebGL is unavailable.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('sea');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) { canvas.remove(); return; }

  var VERT = [
    'attribute vec2 aPos;',
    'void main() { gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  // Caustics: two domain-warped value-noise fields; light is the ridged
  // interference of both, concentrated with a power curve.
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform vec2 uDrift;',
    '',
    'float hash(vec2 p) {',
    '  return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);',
    '}',
    'float vnoise(vec2 p) {',
    '  vec2 i = floor(p);',
    '  vec2 f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  float a = hash(i);',
    '  float b = hash(i + vec2(1.0, 0.0));',
    '  float c = hash(i + vec2(0.0, 1.0));',
    '  float d = hash(i + vec2(1.0, 1.0));',
    '  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);',
    '}',
    'float ridge(vec2 p, float t) {',
    '  vec2 w = p;',
    '  w.x += 0.9 * vnoise(p * 0.8 + vec2(t * 0.11, -t * 0.07));',
    '  w.y += 0.9 * vnoise(p * 0.8 + vec2(-t * 0.09, t * 0.13) + 17.0);',
    '  float n = vnoise(w * 2.1 + vec2(t * 0.05, t * 0.04));',
    '  return 1.0 - abs(2.0 * n - 1.0);',
    '}',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 3.4 + uDrift;',
    '  float t = uTime;',
    '  float c1 = ridge(p, t);',
    '  float c2 = ridge(p * 1.37 + 31.0, t * 1.21);',
    '  float light = pow(c1 * c2, 4.5);',
    '  float glow  = pow(c1 * c2, 1.8) * 0.22;',
    '  vec3 deep = vec3(0.027, 0.145, 0.188);',
    '  vec3 mid  = vec3(0.051, 0.231, 0.278);',
    '  vec3 base = mix(deep, mid, uv.y * 0.8 + 0.1);',
    '  vec3 caustic = vec3(0.56, 0.85, 0.78);',
    '  vec3 col = base + caustic * (light * 0.85 + glow);',
    '  // keep the lower-left readable for the headline',
    '  float shade = smoothstep(0.0, 0.75, uv.y) * 0.5 + 0.5;',
    '  shade = mix(shade, 1.0, uv.x * 0.45);',
    '  col *= mix(0.55, 1.0, shade);',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'uRes');
  var uTime = gl.getUniformLocation(prog, 'uTime');
  var uDrift = gl.getUniformLocation(prog, 'uDrift');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false;
  var visible = true;
  var inView = true;
  var rafId = 0;
  var start = performance.now();
  var drift = { x: 0, y: 0 };
  var driftTarget = { x: 0, y: 0 };

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var w = Math.round(canvas.clientWidth * dpr);
    var h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function draw(now) {
    resize();
    drift.x += (driftTarget.x - drift.x) * 0.03;
    drift.y += (driftTarget.y - drift.y) * 0.03;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000 * 0.55);
    gl.uniform2f(uDrift, drift.x, drift.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(now) {
    if (!running) return;
    draw(now);
    rafId = requestAnimationFrame(loop);
  }

  function update() {
    var shouldRun = !reducedMotion && visible && inView;
    if (shouldRun && !running) {
      running = true;
      rafId = requestAnimationFrame(loop);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(rafId);
    }
  }

  document.addEventListener('visibilitychange', function () {
    visible = document.visibilityState === 'visible';
    update();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      update();
    }).observe(canvas);
  }

  window.addEventListener('pointermove', function (e) {
    driftTarget.x = (e.clientX / window.innerWidth - 0.5) * 0.35;
    driftTarget.y = (e.clientY / window.innerHeight - 0.5) * -0.35;
  }, { passive: true });

  window.addEventListener('resize', function () {
    if (!running) draw(performance.now());
  });

  // Reduced motion: one calm frame, no loop.
  draw(performance.now());
  update();
})();
