(() => {
  'use strict';
  const TAU = Math.PI * 2;
  // Normalized coordinates shared by the live scene and its generated SVG poster.
  // This is illustrative choreography, not telemetry or live agent activity.
  // Three open light layers: broad backdrop, quiet left ribbon, defined right
  // current. No orbital paths or fog; only the main current lights the glass.
  const HALO_Y = -.08;
  function currentAt(time) {
    const phase = (time % 9) / 9;
    const emphasis = .55 + .45 * Math.pow((1+Math.cos(TAU*(phase-.8)))/2,4);
    const envelope = Math.pow(Math.sin(Math.PI*phase),2);
    const rows = Array.from({length: 81}, (_,i) => {
      const u=i/80, taper=Math.pow(Math.sin(Math.PI*u),.8);
      const fold=u*5.8-time*.65;
      const width=(.07+.11*(.5+.5*Math.sin(fold)))*taper;
      const x=.17+.51*taper+.055*Math.sin(u*8-time*.55)*taper;
      const y=.85-1.86*u;
      const light=Math.exp(-Math.pow((u-phase)/.18,2))*envelope;
      return {u,fade:taper,light,points:Array.from({length: 11},(_,j)=>{
        const v=j/10*2-1;
        return {x:x+v*width*Math.cos(fold*.7),y:y+v*width*Math.sin(fold)*.32,
          z:-.06+v*width*Math.sin(fold*.7)};
      })};
    });
    return {rows,emphasis,frontY:.85-1.86*phase,envelope};
  }
  function backgroundCurrentAt(time, broad) {
    const speed=broad?.24:.38, phase=time*speed+(broad?1.4:3.1);
    const rows=Array.from({length:57},(_,i)=>{
      const u=i/56, taper=Math.pow(Math.sin(Math.PI*u),.9);
      const fold=u*5-phase;
      const width=(broad?.30:.075)*taper*(.8+.2*Math.sin(fold));
      const x=broad ? -.16+.34*Math.sin(u*5-phase*.55) : -.20-.50*taper+.04*Math.sin(fold);
      const y=.83-1.80*u;
      return {u,fade:taper,light:0,points:Array.from({length:7},(_,j)=>{
        const v=j/3-1;
        return {x:x+v*width*Math.cos(fold*.55),y:y+v*width*.35*Math.sin(fold),
          z:(broad?-.55:-.30)+v*width*Math.sin(fold*.55)};
      })};
    });
    return {rows,emphasis:broad?.88:.7,opacity:broad?.72:.52,threadOpacity:broad?.35:.65};
  }
  // Lathed Erlenmeyer surface in 3D. Front/back shading and tilted circular
  // cross-sections give depth; individual points circulate along the glass.
  function flaskRadius(y) {
    if (y < -.40) return .145;
    if (y < .43) return .145 + (y + .40) / .83 * .395;
    return .54 - Math.pow((y-.43)/.22, 3) * .085;
  }
  function flaskAt(time) {
    const points = [], rings = [];
    const tilt = -.10 + Math.sin(time*.18)*.025;
    const rotate = (x,y,z) => {
      const yy = y*Math.cos(.19)-z*Math.sin(.19);
      const zz = y*Math.sin(.19)+z*Math.cos(.19);
      return {x:x*Math.cos(tilt)-yy*Math.sin(tilt),y:x*Math.sin(tilt)+yy*Math.cos(tilt)-.07,z:zz};
    };
    for (let row=0; row<66; row++) {
      const y=-.91+row/65*1.56;
      const r=flaskRadius(y), ring=[];
      for (let col=0; col<88; col++) {
        const a=col/88*TAU+time*.10+row*.015;
        const ripple=Math.sin(a*4+row*.30+time*.8)*.003;
        const p=rotate((r+ripple)*Math.cos(a),y,(r+ripple)*Math.sin(a));
        p.alpha=.16+(Math.sin(a)+1)*.28;
        p.radius=.0010+(Math.sin(a)+1)*.00045;
        if(r>.20 || col%2===0) points.push(p);
        if (row%11===0 || row===65) ring.push(p);
      }
      if(ring.length) rings.push(ring);
    }
    // The rolled lip and bottom rim make the silhouette unmistakably a flask.
    for (const [y,r] of [[-.92,.177],[-.895,.177],[.65,.455]]) {
      const ring=[];
      for(let i=0;i<=120;i++){const a=i/120*TAU;ring.push(rotate(r*Math.cos(a),y,r*Math.sin(a)));}
      rings.push(ring);
    }
    // Rodrigo (2026-09-15): no suspended particles inside the chamber. They read
    // as dirt through the glass instead of contents. The flask is the surface
    // only; pointCount follows from this, so the other figures resample to it.
    return {points,rings};
  }
  const shapeNames = ['Laboratorio / Matraz', 'Fluidez / Gota', 'Ideas / Ampolleta'];
  const pointCount = flaskAt(0).points.length;
  function makeBulb() {
    const points=[],rings=[];
    const point=(r,y,a)=>({x:r*Math.cos(a),y:y-.10*r*Math.sin(a),z:r*Math.sin(a),
      alpha:.15+(Math.sin(a)+1)*.24,radius:.00145});
    // Rounded glass dome narrowing into a short neck, not a second teardrop.
    for(let row=0;row<70;row++){
      const y=-.86+row/69*1.10,t=Math.max(0,(y+.12)/.36);
      // Tangent-matched shoulder: a round dome, without a pinched long neck.
      const r=y<=-.12?.52*Math.sqrt(Math.max(0,1-((y+.36)/.50)**2))
        :(2*t**3-3*t*t+1)*.45618+(t**3-2*t*t+t)*(-.205)
          +(-2*t**3+3*t*t)*.185;
      const ring=[];
      for(let col=0;col<88;col++){
        const p=point(r,y,col/88*TAU+row*.037);points.push(p);
        if(row===26||row===50||row===69)ring.push(p);
      }
      if(ring.length)rings.push([...ring,ring[0]]);
    }
    // Compact socket with four fine ridges, rather than an elongated base.
    for(let row=0;row<18;row++){
      const y=.25+row/17*.21,r=.183+Math.cos(row/17*TAU*4)*.009,ring=[];
      for(let col=0;col<64;col++){
        const p=point(r,y,col/64*TAU);p.alpha+=.10;points.push(p);ring.push(p);
      }
      if(row%4===0)rings.push([...ring,ring[0]]);
    }
    for(let row=0;row<7;row++)for(let col=0;col<48;col++)
      points.push(point(.13*Math.sqrt(1-row/7),.47+row/6*.055,col/48*TAU));
    return {points,rings};
  }
  // A single short discharge between filament terminals, never a static icon.
  function bulbDischarge(time,local,active) {
    const t=(local-.30)/.85;
    if(!active||t<=0||t>=1)return {points:[],power:0};
    return {power:Math.sin(t*Math.PI)**2,points:Array.from({length:29},(_,i)=>{
      const u=i/28,envelope=Math.sin(u*Math.PI);
      return rotateBulb({x:-.13+u*.26,y:-.26+envelope*(
        Math.sin(i*2.39+time*12)*.023+Math.sin(i*1.1-time*9)*.014),z:.04},time);
    })};
  }
  const bulbFilament=[
    [{x:-.055,y:.24,z:.04},{x:-.075,y:-.16,z:.04},{x:-.13,y:-.26,z:.04}],
    [{x:.055,y:.24,z:.04},{x:.075,y:-.16,z:.04},{x:.13,y:-.26,z:.04}],
    Array.from({length:65},(_,i)=>({x:-.13+i/64*.26,
      y:-.26-.065*Math.pow(Math.sin(i/64*TAU),2),z:.04}))
  ];
  function makeDrop() {
    const points=[],rings=[];
    for(let row=0;row<66;row++){
      const t=row/65,y=-.99+t*1.64,r=1.45*t*Math.sqrt(1-t),ring=[];
      for(let col=0;col<88;col++){
        const a=col/88*TAU;
        const p={x:r*Math.cos(a),y:y-.12*r*Math.sin(a),z:r*Math.sin(a),alpha:.16+(Math.sin(a)+1)*.28,radius:.0015};
        points.push(p);if(row%11===0)ring.push(p);
      }
      if(ring.length)rings.push(ring);
    }
    return {points,rings};
  }
  // Each figure has the same stable particle identities. No disappearing cloud
  // or random respawn: every point travels to its next surface position.
  const normalizeShape=shape=>{
    shape.points.sort((a,b)=>a.y-b.y || a.x-b.x);
    const source=shape.points;
    shape.points=Array.from({length:pointCount},(_,i)=>source[Math.floor(i*source.length/pointCount)]);
    return shape;
  };
  const targets=[null,normalizeShape(makeDrop()),normalizeShape(makeBulb())];
  function rotateBulb(p,time) {
    const a=(time-18)*.06,c=Math.cos(a),s=Math.sin(a);
    const x=p.x*c-p.z*s,z=p.x*s+p.z*c,r=Math.hypot(p.x,p.z);
    return {...p,x,z,y:p.y+.10*p.z-.10*z,
      alpha:p.alpha===undefined?undefined:p.alpha+(r>1e-8?.24*(z-p.z)/r:0)};
  }
  function targetAt(index,time) {
    if(index===0)return flaskAt(time);
    if(index===2)return {points:targets[2].points.map(p=>rotateBulb(p,time)),
      rings:targets[2].rings.map(r=>r.map(p=>rotateBulb(p,time)))};
    // Circulate on each latitude at the flask's .10 rad/s, rather than
    // rocking the entire drop. Undo/reapply its tilt to preserve the silhouette.
    const angle=time*.10,cos=Math.cos(angle),sin=Math.sin(angle);
    const transform=p=>{
      const x=p.x*cos-p.z*sin,z=p.x*sin+p.z*cos,r=Math.hypot(p.x,p.z);
      return {...p,x,z,y:p.y+.12*p.z-.12*z+Math.sin(time*.35)*.009,
        alpha:r>1e-8?.16+(z/r+1)*.28:p.alpha};
    };
    return {points:targets[index].points.map(transform),rings:targets[index].rings.map(r=>r.map(transform))};
  }
  // Wider, slower and much fainter wave for glass/water only.
  function pulseAt(y,time) {
    const phase=(time%6.8)/6.8,front=-1.8+phase*3.5;
    return Math.exp(-Math.pow((y-front)/.30,2))*Math.pow(Math.sin(Math.PI*phase),2);
  }
  function pulsePoint(p,time,strength=1) {
    const pulse=pulseAt(p.y,time)*strength*.22, expansion=1+pulse*.012;
    return {...p,x:p.x*expansion,z:p.z*expansion,y:p.y+pulse*.002,
      alpha:Math.min(.95,(p.alpha ?? .4)+pulse*.14),radius:(p.radius ?? .0015)*(1+pulse*.18),pulse};
  }
  function sculptureAt(time) {
    const step=9, hold=6;
    const index=Math.floor(time/step)%3,next=(index+1)%3,local=time%step;
    const raw=Math.max(0,(local-hold)/(step-hold));
    const blend=raw*raw*raw*(raw*(raw*6-15)+10); // zero velocity/acceleration at each end
    const from=targetAt(index,time);
    const to=targetAt(next,time);
    const bulbWeight=(index===2?1-blend:0)+(next===2?blend:0);
    const waveStrength=0; // The rising current is now the only glass-light sweep.
    const ignition=Math.max(0,Math.min(1,(local-.25)/1.55));
    const bulbGlow=index===2?bulbWeight*bulbWeight*ignition*ignition*(3-2*ignition):0;
    const discharge=bulbDischarge(time,local,index===2);
    const points=from.points.map((p,i)=>{
      const q=to.points[i];
      return pulsePoint({x:p.x+(q.x-p.x)*blend,y:p.y+(q.y-p.y)*blend,z:p.z+(q.z-p.z)*blend,
        alpha:p.alpha+(q.alpha-p.alpha)*blend,radius:p.radius+(q.radius-p.radius)*blend},time,waveStrength);
    });
    // Contour guides gently fade while points reorganize; no outlines snap between shapes.
    const rings=[...from.rings.map(r=>Object.assign(r.map(p=>pulsePoint(p,time,waveStrength)),{opacity:1-blend})),...to.rings.map(r=>Object.assign(r.map(p=>pulsePoint(p,time,waveStrength)),{opacity:blend}))];
    const label=raw>0?`${shapeNames[index].split(' / ')[1]} → ${shapeNames[next].split(' / ')[1]}`:shapeNames[index];
    return {points,rings,label,index,blend,bulbWeight,bulbGlow,
      filament:bulbFilament.map(path=>path.map(p=>rotateBulb(p,time))),
      spark:discharge.points,sparkPower:discharge.power};
  }
  // Starfield behind everything; same visual family as the sculpture's points.
  // Kept inside the drawing box and faded towards the rim so the field dissolves
  // instead of ending on the canvas edge.
  const smoothstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x-a)/(b-a))); return t*t*(3-2*t); };
  const particles = Array.from({ length: 32 }, (_, i) => {
    const angle = i * 2.399963, radius = .78+.23*Math.sqrt((i+.5)/32);
    return {x:Math.cos(angle)*radius,y:HALO_Y+Math.sin(angle)*radius,z:0,phase:i*1.73};
  });
  const restingSculpture = sculptureAt(.8);
  function sceneAt(time, still = false) {
    const dust = particles.map(p => ({...p,
      x:p.x+Math.sin(time*.16+p.phase)*.012,y:p.y+Math.cos(time*.13+p.phase)*.012}));
    return {current:currentAt(time),backdrops:[backgroundCurrentAt(time,true),backgroundCurrentAt(time,false)],
      dust,flask:still ? restingSculpture : sculptureAt(time)};
  }
  // Renderer-neutral ribbon: shared mesh, silk threads and illumination in SVG
  // and Canvas. Adjacent strips give volume without a blur filter or WebGL.
  function paintCurrent(scene, screen, size, line, dot, patch) {
    const scale=size/800;
    // Paint distant layers first, with fewer threads and slower folds. The
    // glass is drawn after all three so no ribbon can cover its surface dots.
    [...scene.backdrops,scene.current].forEach(layer=>{
      const {rows,emphasis,opacity=1,threadOpacity=1}=layer;
      const projected=rows.map(row=>row.points.map(screen)), columns=rows[0].points.length-1;
      for(let i=1;i<rows.length;i++) {
        const row=rows[i], fade=(row.fade+rows[i-1].fade)/2*opacity;
        const light=(row.light+rows[i-1].light)/2;
        for(let j=0;j<columns;j++) {
          const middle=Math.sin(Math.PI*(j+.5)/columns);
          patch([projected[i-1][j],projected[i][j],projected[i][j+1],projected[i-1][j+1]],
            '#36b7e3',fade*(.18+middle*.34)*(emphasis+light*.35));
        }
        for(let j=0;j<=columns;j++) {
          const middle=Math.sin(Math.PI*j/columns), center=j===columns/2;
          line(projected[i-1][j],projected[i][j],center?'#e9fbff':'#219ecf',
            (center?1.7:.65)*scale,fade*(.22+middle*.20+light*.24)*threadOpacity);
        }
      }
    });
    scene.dust.forEach(p=>dot(screen(p),.85*scale,'#6bb6d6',.28));
  }
  // Illuminate only existing surface particles, never add suspended contents.
  // This is painted separately so mobile can retain its cached glass geometry.
  function paintResponse(scene, screen, size, dot) {
    const {frontY,envelope}=scene.current;
    for(let i=0;i<scene.flask.points.length;i+=3) {
      const p=scene.flask.points[i];
      if(p.z<-.04 || p.x<.02) continue;
      const power=Math.exp(-Math.pow((p.y-frontY)/.23,2))*envelope*smoothstep(.02,.30,p.x);
      if(power<.025) continue;
      const q=screen(p), r=p.radius*size;
      dot(q,r*2.5,'#74d8f3',power*.16);
      dot(q,r*1.35,'#139ecf',power*.85);
      dot(q,r*.6,'#edfcff',power*.9);
    }
  }
  function project(p, size) {
    const depth = 1 + p.z * .12;
    return { x: size * (.5 + p.x * .35 * depth), y: size * (.5 + p.y * .35 * depth) };
  }
  // Run `node -e "process.stdout.write(require('./propuesta-clara.js').poster())"`
  // to regenerate clara-nucleo.svg from exactly the same scene geometry.
  function poster(time = .8) {
    const size = 800, scene = sceneAt(time);
    const line = (a,b,stroke,width,opacity=1) => `<path d="M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}"/>`;
    const circle = (p,r,fill,opacity=1) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
    const out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><title>La inteligencia toma forma: un matraz de partículas entre tres capas de corrientes de luz celeste</title>'];
    const patch=(points,color,alpha)=>out.push(`<polygon points="${points.map(p=>`${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')}" fill="${color}" opacity="${alpha}"/>`);
    paintCurrent(scene, p => project(p,size), size,
      (...args) => out.push(line(...args)), (...args) => out.push(circle(...args)),patch);
    if(scene.flask.bulbGlow>0){
      out.push('<defs><radialGradient id="bulb-light"><stop stop-color="#ffffff" stop-opacity=".95"/><stop offset=".45" stop-color="#f5fbff" stop-opacity=".68"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>');
      out.push(circle(project({x:0,y:-.3,z:0},size),size*(.06+.17*scene.flask.bulbGlow),'url(#bulb-light)',scene.flask.bulbGlow));
    }
    scene.flask.rings.forEach(ring => out.push(`<path d="${ring.map((p,i)=>{const q=project(p,size);return `${i?'L':'M'}${q.x.toFixed(2)} ${q.y.toFixed(2)}`;}).join('')}" fill="none" stroke="#4c9fc7" stroke-width=".8" opacity="${(.30*(ring.opacity ?? 1)).toFixed(3)}"/>`));
    scene.flask.points.forEach(p=>out.push(circle(project(p,size),(p.radius*size).toFixed(2),'#348ab6',Math.min(.95,p.alpha*1.12).toFixed(2))));
    scene.flask.filament.forEach(path=>path.slice(1).forEach((p,i)=>out.push(line(project(path[i],size),project(p,size),'#7897ad',1.3,scene.flask.bulbGlow))));
    if(scene.flask.bulbGlow>0){
      out.push(circle(project({x:0,y:-.30,z:.04},size),size*.10,'url(#bulb-light)',scene.flask.bulbGlow*.82));
      const coil=scene.flask.filament[2];
      coil.slice(1).forEach((p,i)=>out.push(line(project(coil[i],size),project(p,size),'#ffffff',1.4,scene.flask.bulbGlow)));
      const spark=scene.flask.spark.map(p=>project(p,size));
      const d=spark.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join('');
      out.push(`<path d="${d}" fill="none" stroke="#64a1ce" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" opacity="${scene.flask.sparkPower}"/>`,
        `<path d="${d}" fill="none" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="${scene.flask.sparkPower}"/>`);
    }

    paintResponse(scene,p=>project(p,size),size,(...args)=>out.push(circle(...args)));
    out.push('</svg>');
    return out.join('');
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sceneAt, flaskAt, sculptureAt, pulseAt, currentAt, poster }; return;
  }

  const body = document.body;
  const menu = document.querySelector('.cl-menu');
  const nav = document.querySelector('#cl-nav');
  const compactNav = matchMedia('(max-width: 980px)');
  const mobile = matchMedia('(max-width: 767px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let syncAnimation = () => {};
  body.classList.add('cl-js');
  menu.hidden = !compactNav.matches;
  function closeMenu(returnFocus = false) {
    nav.classList.remove('cl-open');
    menu.setAttribute('aria-expanded', 'false');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('cl-open', open);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('cl-open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.cl-header')) closeMenu();
  });
  compactNav.addEventListener('change', () => { menu.hidden = !compactNav.matches; closeMenu(); });
  mobile.addEventListener('change', () => { syncAnimation(); });

  const canvas = document.querySelector('#cl-canvas');
  const art = document.querySelector('.cl-art');
  const control = document.querySelector('.cl-motion-control');
  const shapeLabel = document.querySelector('#cl-shape-label');
  const ctx = canvas.getContext('2d');
  if (!ctx) return; // Poster and navigation still work when Canvas is unavailable.
  let width = 0, height = 0, frame = 0, time = .8, last = null, inView = true, paused = false;
  // Mobile caches the 4620-point figure; only the ribbon and a sampled band
  // of surface illumination are repainted. No full morph evaluation per frame.
  let lite = false, frozenCanvas = null;
  const pointer = {x:0,y:0,targetX:0,targetY:0};
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  art.addEventListener('pointermove', event => {
    if(!finePointer.matches || mobile.matches || reduced.matches) return;
    const rect=art.getBoundingClientRect();
    pointer.targetX=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
    pointer.targetY=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
  });
  art.addEventListener('pointerleave',()=>{pointer.targetX=0;pointer.targetY=0;});
  function frozen(size, offsetX, offsetY) {
    if (frozenCanvas && frozenCanvas.dataset.size === String(size)) return frozenCanvas;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const c = frozenCanvas || document.createElement('canvas');
    c.width = Math.round(width*dpr); c.height = Math.round(height*dpr);
    c.dataset.size = String(size);
    const g = c.getContext('2d');
    g.setTransform(dpr,0,0,dpr,0,0);
    g.clearRect(0,0,width,height);
    paintSculpture(g, p => { const q=project(p,size); return {...p,x:q.x+offsetX,y:q.y+offsetY}; }, sceneAt(.8, true), size);
    frozenCanvas = c;
    return c;
  }
  // The sculpture layer, painted either straight onto the live canvas or once
  // into an offscreen bitmap (mobile: the figure is frozen, the light is not).
  function paintSculpture(g, screen, scene, size) {
    const dotG = (p,r,color) => {g.fillStyle=color;g.beginPath();g.arc(p.x,p.y,r,0,TAU);g.fill();};
    const lineG = (a,b,color,w) => {g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();};
    // Clear glass, without the old diffuse blue core washing out its points.
    if(scene.flask.bulbGlow>0){
      const center=screen({x:0,y:-.30,z:0}),r=size*(.06+.17*scene.flask.bulbGlow);
      const glow=g.createRadialGradient(center.x,center.y,0,center.x,center.y,r);
      glow.addColorStop(0,`rgba(255,255,255,${scene.flask.bulbGlow*.95})`);
      glow.addColorStop(.45,`rgba(245,251,255,${scene.flask.bulbGlow*.68})`);
      glow.addColorStop(1,'rgba(255,255,255,0)');dotG(center,r,glow);
    }
    scene.flask.rings.forEach(ring=>{
      g.beginPath();ring.forEach((p,i)=>{const q=screen(p);if(i)g.lineTo(q.x,q.y);else g.moveTo(q.x,q.y);});
      g.strokeStyle=`rgba(64,145,185,${.26*(ring.opacity ?? 1)})`;g.lineWidth=.8;g.stroke();
    });
    const bins=Array.from({length:8},()=>[]);
    scene.flask.points.forEach(p=>bins[Math.min(7,Math.floor(p.alpha*8))].push(p));
    bins.forEach((bin,i)=>{
      g.fillStyle=`rgba(41,127,173,${.16+i*.11})`;g.beginPath();
      bin.forEach(p=>{const q=screen(p),r=p.radius*size;g.moveTo(q.x+r,q.y);g.arc(q.x,q.y,r,0,TAU);});g.fill();
    });
    if(scene.flask.bulbWeight>0){
      g.save();
      g.shadowColor=`rgba(160,211,238,${scene.flask.bulbGlow})`;
      g.shadowBlur=12*scene.flask.bulbGlow;
      scene.flask.filament.forEach(path=>path.slice(1).forEach((p,i)=>lineG(screen(path[i]),screen(p),
        `rgba(120,151,173,${scene.flask.bulbWeight*(.20+.75*scene.flask.bulbGlow)})`,1.3)));
      // Small white bloom on top of the particles: light comes from the coil,
      // while the larger halo remains behind the glass to retain its outline.
      if(scene.flask.bulbGlow>0){
        const center=screen({x:0,y:-.30,z:.04}),r=size*.10;
        const bloom=g.createRadialGradient(center.x,center.y,0,center.x,center.y,r);
        bloom.addColorStop(0,`rgba(255,255,255,${scene.flask.bulbGlow*.82})`);
        bloom.addColorStop(.45,`rgba(255,255,255,${scene.flask.bulbGlow*.40})`);
        bloom.addColorStop(1,'rgba(255,255,255,0)');
        g.shadowBlur=0;dotG(center,r,bloom);
        g.shadowColor='white';g.shadowBlur=23*scene.flask.bulbGlow;
        const coil=scene.flask.filament[2];
        coil.slice(1).forEach((p,i)=>lineG(screen(coil[i]),screen(p),`rgba(255,255,255,${scene.flask.bulbGlow})`,1.4));
        const spark=scene.flask.spark.map(screen);
        g.beginPath();spark.forEach((p,i)=>{if(i)g.lineTo(p.x,p.y);else g.moveTo(p.x,p.y);});
        g.lineJoin='round';g.shadowColor='#91c6e1';g.shadowBlur=16*scene.flask.sparkPower;
        g.strokeStyle=`rgba(100,161,206,${scene.flask.sparkPower})`;
        g.lineWidth=2.8;g.stroke();
        g.shadowBlur=0;g.strokeStyle=`rgba(255,255,255,${scene.flask.sparkPower})`;
        g.lineWidth=1.2;g.stroke();
      }
      g.restore();
    }
    const waveBins=Array.from({length:8},()=>[]);
    scene.flask.points.forEach(p=>{if(p.pulse>.025)waveBins[Math.min(7,Math.floor(p.pulse*8))].push(p);});
    waveBins.forEach((bin,i)=>{
      g.fillStyle=`rgba(77,191,231,${(i+1)/8*.75})`;g.beginPath();
      bin.forEach(p=>{const q=screen(p),r=p.radius*size*1.12;g.moveTo(q.x+r,q.y);g.arc(q.x,q.y,r,0,TAU);});g.fill();
    });
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const size = Math.min(width, height) * 1.10;
    const offsetX = (width-size)/2, offsetY = (height-size)/2;
    const scene = sceneAt(time, lite);
    const label = lite || reduced.matches ? shapeNames[0] : scene.flask.label;
    if (shapeLabel.textContent !== label) shapeLabel.textContent = label;
    pointer.x += (pointer.targetX-pointer.x)*.06;
    pointer.y += (pointer.targetY-pointer.y)*.06;
    const yaw=lite || reduced.matches ? 0 : pointer.x*.055;
    const pitch=lite || reduced.matches ? 0 : pointer.y*.035;
    const screen = p => {
      const x=p.x*Math.cos(yaw)+p.z*Math.sin(yaw), z=p.z*Math.cos(yaw)-p.x*Math.sin(yaw);
      const q=project({x,y:p.y*Math.cos(pitch)-z*Math.sin(pitch),z:z*Math.cos(pitch)+p.y*Math.sin(pitch)},size);
      return {...p,x:q.x+offsetX,y:q.y+offsetY};
    };
    const dot = (p,r,color,alpha=1) => {ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill();};
    const line = (a,b,color,w,alpha=1) => {ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();};
    const patch = (points,color,alpha) => {
      ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();
      points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
    };
    ctx.lineCap = 'round';
    paintCurrent(scene, screen, size, line, dot, patch);
    ctx.globalAlpha = 1;
    if (lite) ctx.drawImage(frozen(size, offsetX, offsetY), 0, 0, width, height);
    else paintSculpture(ctx, screen, scene, size);
    paintResponse(scene, screen, size, dot);
    ctx.globalAlpha = 1;
    ctx.lineCap = 'butt';
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0); frozenCanvas = null; draw();
  }
  // ~30 fps by design, but the clock advances on a low-passed delta: a late or
  // dropped frame no longer shows up as a jump in the motion.
  let step = 1/30;
  function tick(now) {
    frame = 0;
    if (last === null || now-last >= 30) {
      if (last !== null) {
        step += (Math.min((now-last)/1000,.12) - step) * .10;
        time += step;
      }
      last = now; draw();
    }
    frame = requestAnimationFrame(tick);
  }
  syncAnimation = () => {
    cancelAnimationFrame(frame); frame=0; last=null; step=1/30;
    lite = mobile.matches;
    const enabled = !reduced.matches;
    control.hidden = !enabled;
    shapeLabel.textContent = enabled && !lite ? sculptureAt(time).label : shapeNames[0];
    art.classList.toggle('cl-canvas-ready', enabled);
    if (enabled && inView && !document.hidden && !paused) frame=requestAnimationFrame(tick);
  };
  control.addEventListener('click', () => {
    paused=!paused;
    control.textContent=paused?'Reanudar movimiento':'Pausar movimiento';
    control.setAttribute('aria-pressed',String(paused));syncAnimation();
  });
  new ResizeObserver(resize).observe(art);
  new IntersectionObserver(entries => {inView=entries[0].isIntersecting;syncAnimation();}).observe(art);
  reduced.addEventListener('change',syncAnimation);
  document.addEventListener('visibilitychange',syncAnimation);
  resize();syncAnimation();
})();
