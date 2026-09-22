/*
 * Hero background for index-nuevo: pale water caustics on white.
 * Standalone WebGL shader, no dependencies; independent from the particle
 * scene (propuesta-clara.js). The pattern fades to white at all four edges
 * so the hero's 1440px box never shows a seam, and it is dimmed on the left
 * half where the headline sits. Pauses offscreen/hidden; prefers-reduced-motion
 * renders a single static frame; without WebGL the canvas is removed and the
 * hero stays plain white.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('cl-hero-caustics');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) { canvas.remove(); return; }

  var VERT = 'attribute vec2 aPos; void main(){ gl_Position = vec4(aPos,0.,1.); }';

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    '',
    'float hash(vec2 p) {',
    '  return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);',
    '}',
    'float vnoise(vec2 p) {',
    '  vec2 i = floor(p); vec2 f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  float a = hash(i);',
    '  float b = hash(i + vec2(1.0, 0.0));',
    '  float c = hash(i + vec2(0.0, 1.0));',
    '  float d = hash(i + vec2(1.0, 1.0));',
    '  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);',
    '}',
    '// One soft blob: gaussian-ish falloff around a drifting center,',
    '// with a noise wobble so the shape breathes like a lava lamp.',
    'float blob(vec2 p, vec2 center, float radius, float t, float seed) {',
    '  float wob = (vnoise(p * 1.4 + seed + t * 0.06) - 0.5) * 0.35;',
    '  float d = length(p - center) + wob;',
    '  return 1.0 - smoothstep(radius * 0.45, radius, d);',
    '}',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);',
    '  float t = uTime;',
    '  float aspect = uRes.x / uRes.y;',
    '  // six blobs rising and sinking on their own slow paths',
    '  float f = 0.0;',
    '  f += blob(p, vec2(0.16 * aspect + 0.05 * sin(t * 0.21), 0.72 + 0.12 * sin(t * 0.15)), 0.34, t, 3.1);',
    '  f += blob(p, vec2(0.48 * aspect + 0.07 * sin(t * 0.13 + 2.0), 0.28 + 0.16 * sin(t * 0.11 + 1.3)), 0.42, t, 7.7);',
    '  f += blob(p, vec2(0.82 * aspect + 0.05 * sin(t * 0.17 + 4.1), 0.62 + 0.14 * sin(t * 0.09 + 3.2)), 0.38, t, 12.4);',
    '  f += blob(p, vec2(0.30 * aspect + 0.06 * sin(t * 0.10 + 5.6), 0.10 + 0.12 * sin(t * 0.14 + 0.4)), 0.30, t, 21.9);',
    '  f += blob(p, vec2(0.66 * aspect + 0.05 * sin(t * 0.19 + 1.1), 0.90 + 0.10 * sin(t * 0.12 + 5.0)), 0.32, t, 33.2);',
    '  f += blob(p, vec2(0.05 * aspect + 0.04 * sin(t * 0.16 + 3.7), 0.30 + 0.13 * sin(t * 0.10 + 2.6)), 0.28, t, 44.5);',
    '  // two pastel tints: celeste where blobs are thin, aqua where they overlap',
    '  vec3 paper   = vec3(0.988, 0.992, 0.992);',
    '  vec3 celeste = vec3(0.804, 0.898, 0.945);',
    '  vec3 aqua    = vec3(0.792, 0.925, 0.894);',
    '  float body    = clamp(f, 0.0, 1.0);',
    '  float overlap = clamp(f - 1.0, 0.0, 1.0);',
    '  vec3 col = mix(paper, celeste, body * 0.48);',
    '  col = mix(col, aqua, overlap * 0.36);',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
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

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false, visible = true, inView = true, rafId = 0;
  var start = performance.now();

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.round(canvas.clientWidth * dpr);
    var h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function draw(now) {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000 * 0.4);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(now) {
    if (!running) return;
    draw(now);
    rafId = requestAnimationFrame(loop);
  }

  function update() {
    var shouldRun = !reducedMotion && visible && inView;
    if (shouldRun && !running) { running = true; rafId = requestAnimationFrame(loop); }
    else if (!shouldRun && running) { running = false; cancelAnimationFrame(rafId); }
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
  window.addEventListener('resize', function () {
    if (!running) draw(performance.now());
  });

  draw(performance.now());
  update();
})();
