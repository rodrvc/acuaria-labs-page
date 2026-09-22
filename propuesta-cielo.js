/*
 * Cielo hero — Atacama night sky on a 2D canvas. No dependencies.
 * Background stars twinkle; the Southern Cross (with its two pointer stars)
 * is drawn in silver as the sky everyone knows; then a new, invented
 * constellation is traced in gold — the lines Acuaria draws.
 * Pauses offscreen/hidden; prefers-reduced-motion gets one finished frame.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('sky');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }

  // Deterministic pseudo-random so the sky is the same on every visit.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var STAR_COUNT = 340;
  var stars = [];
  var rnd = mulberry32(20260916);
  for (var i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: rnd(), y: rnd(),
      r: 0.4 + rnd() * 1.2,
      depth: 0.4 + rnd() * 0.6,          // parallax layer
      phase: rnd() * Math.PI * 2,
      speed: 0.3 + rnd() * 0.9           // twinkle speed
    });
  }

  // Southern Cross + pointers (upper right, fractional coords).
  var crux = {
    gacrux: { x: 0.80, y: 0.13 },
    delta:  { x: 0.746, y: 0.20 },
    mimosa: { x: 0.875, y: 0.235 },
    acrux:  { x: 0.825, y: 0.33 },
    beta:   { x: 0.945, y: 0.30 },
    alpha:  { x: 0.975, y: 0.365 }
  };
  var cruxLines = [
    [crux.gacrux, crux.acrux],
    [crux.delta, crux.mimosa],
    [crux.beta, crux.alpha]
  ];
  var cruxStars = [
    [crux.gacrux, 1.9], [crux.delta, 1.5], [crux.mimosa, 2.1],
    [crux.acrux, 2.3], [crux.beta, 2.0], [crux.alpha, 2.4]
  ];

  // The invented constellation (lower left): scattered data, connected.
  var net = [
    { x: 0.075, y: 0.52 }, { x: 0.16, y: 0.40 }, { x: 0.245, y: 0.50 },
    { x: 0.13, y: 0.635 }, { x: 0.225, y: 0.70 }, { x: 0.30, y: 0.60 },
    { x: 0.055, y: 0.72 }
  ];
  var netEdges = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [3, 6]];

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false, visible = true, inView = true, rafId = 0;
  var start = performance.now();
  var drift = { x: 0, y: 0 }, driftTarget = { x: 0, y: 0 };
  var W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(canvas.clientWidth * dpr);
    var h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
    }
    W = w; H = h;
  }

  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }

  // Draw a set of segments partially, one after another.
  function drawSegments(segs, progress, color, width, glow) {
    if (progress <= 0) return;
    var per = 1 / segs.length;
    ctx.strokeStyle = color;
    ctx.lineWidth = width * dpr;
    ctx.shadowColor = glow ? color : 'transparent';
    ctx.shadowBlur = glow ? 6 * dpr : 0;
    for (var i = 0; i < segs.length; i++) {
      var local = (progress - i * per) / per;
      if (local <= 0) break;
      if (local > 1) local = 1;
      var a = segs[i][0], b = segs[i][1];
      ctx.beginPath();
      ctx.moveTo(a.x * W + drift.x, a.y * H + drift.y);
      ctx.lineTo(
        (a.x + (b.x - a.x) * local) * W + drift.x,
        (a.y + (b.y - a.y) * local) * H + drift.y
      );
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  function starDot(fx, fy, r, alpha, color, depth) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(fx * W + drift.x * (depth || 1), fy * H + drift.y * (depth || 1), r * dpr, 0, 6.2832);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function draw(now) {
    resize();
    var t = (now - start) / 1000;
    if (reducedMotion) t = 10; // everything finished, nothing moving
    ctx.clearRect(0, 0, W, H);
    drift.x += (driftTarget.x - drift.x) * 0.04;
    drift.y += (driftTarget.y - drift.y) * 0.04;

    // Milky Way: a faint diagonal band.
    var grad = ctx.createLinearGradient(0, H * 0.1, W, H * 0.75);
    grad.addColorStop(0, 'rgba(190, 200, 255, 0)');
    grad.addColorStop(0.5, 'rgba(190, 200, 255, 0.05)');
    grad.addColorStop(1, 'rgba(190, 200, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    var appear = ease(t / 1.2);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = reducedMotion ? 0.75 : 0.55 + 0.45 * Math.sin(s.phase + t * s.speed);
      starDot(s.x, s.y, s.r, appear * tw * 0.85, '#eef1ff', s.depth);
    }

    // Southern Cross: silver, drawn first. Stars visible from the start.
    for (var c = 0; c < cruxStars.length; c++) {
      starDot(cruxStars[c][0].x, cruxStars[c][0].y, cruxStars[c][1], appear, '#ffffff');
    }
    drawSegments(cruxLines, ease((t - 1.0) / 1.4), 'rgba(200, 210, 240, 0.4)', 1, false);

    // The new constellation: gold, drawn after — the lines we trace.
    var netP = ease((t - 2.6) / 2.4);
    for (var n = 0; n < net.length; n++) {
      var pulse = reducedMotion ? 1 : 0.8 + 0.2 * Math.sin(t * 1.4 + n);
      starDot(net[n].x, net[n].y, 2.1, appear * pulse, '#e8cf96');
    }
    drawSegments(netEdges.map(function (e) { return [net[e[0]], net[e[1]]]; }),
      netP, 'rgba(215, 185, 124, 0.75)', 1.2, true);

    // A shooting star roughly every 13 s, subtle, upper third.
    if (!reducedMotion) {
      var cycle = t % 13;
      if (cycle > 11 && cycle < 11.7) {
        var p = (cycle - 11) / 0.7;
        var sx = (0.28 + p * 0.16) * W, sy = (0.10 + p * 0.07) * H;
        ctx.strokeStyle = 'rgba(238, 241, 255,' + (0.5 * Math.sin(p * Math.PI)) + ')';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(sx - 0.05 * W, sy - 0.022 * H);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    }
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
  window.addEventListener('pointermove', function (e) {
    driftTarget.x = (e.clientX / window.innerWidth - 0.5) * -14 * dpr;
    driftTarget.y = (e.clientY / window.innerHeight - 0.5) * -8 * dpr;
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (!running) draw(performance.now());
  });

  draw(performance.now());
  update();
})();
