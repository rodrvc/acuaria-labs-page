(() => {
  'use strict';
  // Umbral: layers of information align into a usable structure. The piece
  // assembles and unfolds; it is deliberately not another atom/flask/particle core.
  const stage = document.querySelector('.um-stage');
  const canvas = document.querySelector('#um-canvas');
  const expandButton = document.querySelector('#um-expand');
  const pauseButton = document.querySelector('#um-pause');
  const hint = document.querySelector('#um-scene-hint');
  const status = document.querySelector('#um-scene-status');
  const poster = document.querySelector('.um-poster');
  const shapeButtons = [...document.querySelectorAll('[data-um-shape]')];
  const shapeNames = {umbral:'Umbral',gota:'Gota',onda:'Onda',a:'A arquitectónica'};
  let selectedShape = 'umbral';
  shapeButtons.forEach(button=>{
    button.disabled=false;
    button.addEventListener('click',()=>{
      const name=button.dataset.umShape;
      if(name===selectedShape) return;
      selectedShape=name;
      shapeButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      poster.src=(name==='umbral'?'umbral-poster.webp':`umbral-${name}-poster.webp`)+'?v=formas-1';
      document.querySelector('.um-caption-no').textContent=`0${Object.keys(shapeNames).indexOf(name)+1} / ${shapeNames[name].toUpperCase()}`;
      controller?.selectShape();
      status.textContent=`Forma seleccionada: ${shapeNames[name]}.`;
    });
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 700px)');
  let controller = null, loading = false, inView = true, paused = false, expanded = false;

  function fallback(message) {
    stage.classList.remove('is-live');
    expandButton.disabled = true;
    pauseButton.disabled = true;
    hint.textContent = message;
  }
  function sync() {
    if (reduced.matches) {
      controller?.stop();
      fallback('Vista estática · movimiento reducido');
      return;
    }
    if (!controller) { if (inView && !document.hidden) start(); return; }
    if (controller.lost) return;
    stage.classList.add('is-live');
    expandButton.disabled = false;
    pauseButton.disabled = false;
    if (inView && !document.hidden && !paused) controller.play();
    else controller.stop();
  }
  async function start() {
    if (loading || controller || reduced.matches) return;
    loading = true;
    try {
      // Pinned Three.js (MIT). Lazy load: text, navigation and local poster are
      // already visible; neither a model download nor a loading screen blocks them.
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js');
      if (reduced.matches) { loading = false; return; }
      controller = build(THREE);
      hint.textContent = small.matches ? 'Toca para descubrir sus capas.' : 'Mueve el cursor. Descubre sus capas.';
      sync();
    } catch (error) {
      fallback('Escultura conceptual / vista estática');
      console.info('Umbral: using local poster.', error.message);
    }
  }
  expandButton.addEventListener('click', () => {
    if (!controller || reduced.matches) return;
    expanded = !expanded;
    expandButton.setAttribute('aria-pressed', String(expanded));
    expandButton.innerHTML = `${expanded ? 'Reunir capas' : 'Desplegar capas'}<span aria-hidden="true">${expanded ? '−' : '+'}</span>`;
    status.textContent = expanded ? 'Capas de la escultura desplegadas.' : 'Capas de la escultura reunidas.';
    // A paused scene remains paused; explicit input renders its final state once.
    if (paused) controller.snap();
  });
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? 'Reanudar' : 'Pausar';
    sync();
  });
  reduced.addEventListener('change',()=>{
    // A shape chosen in static mode must also appear when WebGL resumes,
    // including when the user had manually paused before changing preference.
    if(!reduced.matches && controller && !controller.lost) controller.snap();
    sync();
  });
  small.addEventListener('change',()=>{
    if(controller && !reduced.matches && !controller.lost) hint.textContent=small.matches?'Toca para descubrir sus capas.':'Mueve el cursor. Descubre sus capas.';
  });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }).observe(stage);

  function build(THREE) {
    const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small.matches ? 1.25 : 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 50);
    camera.position.set(0, 0, 10.2);

    // Authored studio reflections: local procedural softboxes, no HDRI asset.
    const studio = new THREE.Scene();
    studio.background = new THREE.Color('#172938');
    function softbox(w,h,color,intensity,x,y,z,rx,ry) {
      const material = new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide});
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
      panel.position.set(x,y,z); panel.rotation.set(rx,ry,0); studio.add(panel);
    }
    softbox(7,4,'#e1f2ff',5,-3,4,3,-.8,-.5);
    softbox(2,7,'#79c7ff',4,4,0,1,0,-1.1);
    softbox(3,7,'#ffffff',3,-4,-1,-2,0,1.2);
    softbox(6,2,'#a5c9e1',2,0,-4,2,1.1,0);
    softbox(3,5,'#eaf7ff',3,1,1,6,0,0);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(studio,.08);
    scene.environment = environment.texture;
    pmrem.dispose();
    studio.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});
    scene.add(new THREE.HemisphereLight(0xc5e8ff,0x061522,1.3));
    const key = new THREE.DirectionalLight(0xe3f5ff,3.5);
    key.position.set(-3,5,5);scene.add(key);
    const rim = new THREE.DirectionalLight(0x4eacff,3);
    rim.position.set(4,-1,2);scene.add(rim);

    function roundPath(path,w,h,r) {
      const x=-w/2,y=-h/2;
      path.moveTo(x+r,y);path.lineTo(x+w-r,y);path.quadraticCurveTo(x+w,y,x+w,y+r);
      path.lineTo(x+w,y+h-r);path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      path.lineTo(x+r,y+h);path.quadraticCurveTo(x,y+h,x,y+h-r);
      path.lineTo(x,y+r);path.quadraticCurveTo(x,y,x+r,y);
      return path;
    }
    // Different authored silhouettes, not the same aperture scaled four ways.
    // Geometry is cached on first selection; no allocations in the render loop.
    const geometries = new Map();
    const profiles = {
      umbral:{twist:.9,depth:2.15,tilt:-.18,yaw:-.55},
      gota:{twist:.23,depth:1.8,tilt:-.10,yaw:-.44},
      onda:{twist:1.05,depth:2.0,tilt:.05,yaw:-.50},
      a:{twist:.10,depth:1.75,tilt:0,yaw:-.38}
    };
    function shapeGeometry(name) {
      if(geometries.has(name)) return geometries.get(name);
      let shape=new THREE.Shape();
      if(name==='umbral') {
        shape=roundPath(shape,2.65,3.35,.66);
        shape.holes.push(roundPath(new THREE.Path(),1.65,2.25,.49));
      } else if(name==='gota') {
        function drop(path,s=1,dy=0) {
          path.moveTo(0,1.7*s+dy);
          path.bezierCurveTo(.22*s,1.12*s+dy,1.26*s,.15*s+dy,1.26*s,-.60*s+dy);
          path.bezierCurveTo(1.26*s,-1.97*s+dy,-1.26*s,-1.97*s+dy,-1.26*s,-.60*s+dy);
          path.bezierCurveTo(-1.26*s,.15*s+dy,-.22*s,1.12*s+dy,0,1.7*s+dy);
          return path;
        }
        shape=drop(shape);
        shape.holes.push(drop(new THREE.Path(),.60,-.17));
      } else if(name==='onda') {
        // Open S-fold: the sheet doubles back on itself like liquid metal.
        shape.moveTo(1.1,1.4);
        shape.bezierCurveTo(-.6,2,-1.6,.8,-.6,.25);
        shape.bezierCurveTo(.1,-.18,1,-.38,.6,-.85);
        shape.bezierCurveTo(.2,-1.25,-.5,-1.3,-1.1,-.85);
        shape.lineTo(-1.45,-1.35);
        shape.bezierCurveTo(-.5,-2,.95,-1.6,1.22,-.78);
        shape.bezierCurveTo(1.55,.23,.2,.4,-.25,.77);
        shape.bezierCurveTo(-.7,1.18,.2,1.32,.8,.88);
        shape.closePath();
      } else {
        // Architectural A: two feet, a crossbar and a triangular skylight.
        shape.moveTo(-1.45,-1.65);shape.lineTo(-.45,1.65);shape.lineTo(.4,1.65);
        shape.lineTo(1.45,-1.65);shape.lineTo(.78,-1.65);shape.lineTo(.45,-.55);
        shape.lineTo(-.45,-.55);shape.lineTo(-.78,-1.65);shape.closePath();
        const hole=new THREE.Path();hole.moveTo(-.27,.08);hole.lineTo(.26,.08);hole.lineTo(0,1.0);hole.closePath();shape.holes.push(hole);
      }
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.012,curveSegments:name==='umbral'?16:24});
      geometry.center();
      const result={geometry,edges:new THREE.EdgesGeometry(geometry,35)};
      geometries.set(name,result);return result;
    }
    const initial=shapeGeometry(selectedShape);
    const geometry=initial.geometry;
    const material = new THREE.MeshPhysicalMaterial({color:0xe6f0f7,metalness:.96,roughness:.16,clearcoat:1,clearcoatRoughness:.2,envMapIntensity:1.35});
    // Slightly crowned sheet normals break up flat-face reflections, like
    // polished formed metal rather than a uniformly shaded extruded block.
    material.onBeforeCompile = shader => {
      shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`
        #include <beginnormal_vertex>
        if (abs(objectNormal.z) > 0.8) {
          objectNormal = normalize(objectNormal + vec3(sin(position.y*1.3)*0.18, cos(position.x*1.6)*0.14, 0.0));
        }
      `);
    };
    const count=48;
    const layers = new THREE.InstancedMesh(geometry,material,count);
    layers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    layers.frustumCulled = false;
    const blue = new THREE.Color('#367ba9'), silver = new THREE.Color('#d7e5ed');
    for(let i=0;i<count;i++) layers.setColorAt(i,blue.clone().lerp(silver,.35+.65*Math.pow(i/(count-1),.7)));
    const sculpture = new THREE.Group();
    sculpture.add(layers);scene.add(sculpture);

    // A few lit cut edges reveal the aperture and the thickness of the layers.
    const edgeGeometry = initial.edges;
    const edgeMaterial = new THREE.LineBasicMaterial({color:0x8cd9ff,transparent:true,opacity:.42});
    const edges = [0,16,32,47].map(index=>{
      const mesh = new THREE.LineSegments(edgeGeometry,edgeMaterial);sculpture.add(mesh);return {index,mesh};
    });
    const dummy = new THREE.Object3D();
    const pointer = {x:0,y:0,targetX:0,targetY:0};
    stage.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch' || reduced.matches || paused) return;
      const bounds=stage.getBoundingClientRect();
      pointer.targetX=Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
      pointer.targetY=Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height*2-1));
    });
    stage.addEventListener('pointerleave',()=>{pointer.targetX=0;pointer.targetY=0;});
    let elapsed=.8, unfold=0, frame=0, last=0, lost=false;
    function render(dt=0, snap=false) {
      elapsed += dt;
      const ease=snap?1:1-Math.exp(-dt*5);
      unfold += ((expanded?1:0)-unfold)*ease;
      pointer.x += (pointer.targetX-pointer.x)*ease;
      pointer.y += (pointer.targetY-pointer.y)*ease;
      const profile=profiles[selectedShape];
      sculpture.rotation.set(.18+pointer.y*.12, profile.yaw+pointer.x*.24+Math.sin(elapsed*.18)*.035, profile.tilt);
      sculpture.position.y = .04+Math.sin(elapsed*.55)*.045;
      sculpture.position.x = unfold*.18;
      sculpture.scale.setScalar(1-unfold*.24);
      for(let i=0;i<count;i++) {
        const u=i/(count-1), n=u-.5;
        dummy.position.set(Math.sin(u*3+elapsed*.18)*.025+unfold*Math.sin(u*5)*.2,unfold*Math.sin(u*4)*.13,n*(profile.depth+unfold*2.3));
        dummy.rotation.set(unfold*n*.15,unfold*n*.24,n*profile.twist+Math.sin(elapsed*.35+u*3)*.025);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();layers.setMatrixAt(i,dummy.matrix);
        const edge=edges.find(item=>item.index===i);
        if(edge){edge.mesh.position.copy(dummy.position);edge.mesh.rotation.copy(dummy.rotation);}
      }
      layers.instanceMatrix.needsUpdate=true;
      renderer.render(scene,camera);
    }
    function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
    function tick(now){
      frame=0;
      if(lost || reduced.matches || document.hidden || !inView || paused) return;
      const interval=small.matches?32:16;
      if(!last || now-last>=interval){const dt=last?Math.min((now-last)/1000,.05):0;last=now;render(dt);}
      frame=requestAnimationFrame(tick);
    }
    function play(){if(!frame && !lost)frame=requestAnimationFrame(tick);}
    function resize(){
      if(lost) return;
      const bounds=stage.getBoundingClientRect();
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1,small.matches?1.25:1.6));
      renderer.setSize(bounds.width,bounds.height,false);
      camera.aspect=bounds.width/bounds.height;camera.updateProjectionMatrix();render();
    }
    new ResizeObserver(resize).observe(stage);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;stop();fallback('Escultura conceptual / vista estática');});
    canvas.addEventListener('webglcontextrestored',()=>{lost=false;resize();sync();});
    resize();render();
    // Local authoring hook only; used to generate the actual static WebP fallback.
    if(new URLSearchParams(location.search).has('captura')) {
      window.__umCapture=()=>{render();return canvas.toDataURL('image/webp',.94);};
    }
    function selectShape() {
      const next=shapeGeometry(selectedShape);
      layers.geometry=next.geometry;
      edges.forEach(edge=>{edge.mesh.geometry=next.edges;});
      pointer.targetX=0;pointer.targetY=0;
      if(!lost && !reduced.matches) render(0,true);
    }
    return {play,stop,selectShape,snap:()=>render(0,true),get lost(){return lost;}};
  }
  sync();
})();
