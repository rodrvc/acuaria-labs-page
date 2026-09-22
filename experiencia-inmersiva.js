(() => {
    const body = document.body;
    if (!body.classList.contains('immersive-concept')) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = matchMedia('(max-width: 640px), (pointer: coarse)').matches;
    const loader = document.getElementById('ix-loader');
    const canvas = document.getElementById('ix-canvas');
    const poster = document.querySelector('.ix-poster');
    const header = document.getElementById('ix-header');
    const nav = document.getElementById('ix-nav');
    const menu = document.querySelector('.ix-menu');
    let sceneController = null;

    const finishLoading = () => {
        loader.classList.add('is-done');
        loader.setAttribute('aria-label', 'Laboratorio iniciado');
    };
    const safetyTimer = setTimeout(finishLoading, 2600);

    function initNavigation() {
        const close = () => {
            nav.classList.remove('is-open');
            menu.setAttribute('aria-expanded', 'false');
            body.classList.remove('ix-menu-open');
        };
        menu.addEventListener('click', () => {
            const open = !nav.classList.contains('is-open');
            nav.classList.toggle('is-open', open);
            menu.setAttribute('aria-expanded', String(open));
            body.classList.toggle('ix-menu-open', open);
        });
        nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
        const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 30);
        updateHeader();
        addEventListener('scroll', updateHeader, { passive: true });
    }

    function createReactor() {
        if (!window.THREE || reduced || mobile) return null;
        const THREE = window.THREE;
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
        } catch (_) {
            return null;
        }

        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        renderer.setSize(innerWidth, innerHeight, false);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, .1, 100);
        camera.position.set(0, .15, 12.5);
        const reactor = new THREE.Group();
        reactor.position.set(innerWidth < 1000 ? 2.8 : 3.6, 0, 0);
        scene.add(reactor);

        scene.add(new THREE.HemisphereLight(0xb8d5ea, 0x061824, 1.25));
        const key = new THREE.DirectionalLight(0x9bd2f2, 2.4);
        key.position.set(4, 5, 7);
        scene.add(key);
        const rim = new THREE.PointLight(0x3c80b4, 2.2, 22);
        rim.position.set(-4, -1, 4);
        scene.add(rim);

        const profile = [
            new THREE.Vector2(.15, -3), new THREE.Vector2(.72, -2.9),
            new THREE.Vector2(1.15, -2.45), new THREE.Vector2(1.3, -1.8),
            new THREE.Vector2(1.32, 1.7), new THREE.Vector2(1.14, 2.45),
            new THREE.Vector2(.68, 2.9), new THREE.Vector2(.15, 3)
        ];
        const shellGeometry = new THREE.LatheGeometry(profile, 48);
        const shellMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x6aa7cf, roughness: .08, metalness: .04, transmission: .76,
            transparent: true, opacity: .23, thickness: 1.1, clearcoat: 1,
            clearcoatRoughness: .08, side: THREE.DoubleSide
        });
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        reactor.add(shell);

        const innerVessel = new THREE.Mesh(
            new THREE.CylinderGeometry(1.06, 1.06, 3.85, 48, 1, true),
            new THREE.MeshPhysicalMaterial({ color: 0x1a4b70, roughness: .28, metalness: .1, transparent: true, opacity: .16, side: THREE.DoubleSide })
        );
        innerVessel.position.y = -.35;
        reactor.add(innerVessel);

        const coreUniforms = { uTime: { value: 0 }, uEnergy: { value: 0 } };
        const coreMaterial = new THREE.ShaderMaterial({
            uniforms: coreUniforms,
            transparent: true,
            vertexShader: `
                uniform float uTime; uniform float uEnergy; varying vec3 vNormal; varying vec3 vPosition;
                void main(){
                    vNormal=normal; vPosition=position;
                    float wave=sin(position.y*4.0+uTime*1.3)*0.055+sin(position.x*5.0-uTime*.8)*0.035;
                    vec3 moved=position+normal*wave*(.45+uEnergy);
                    gl_Position=projectionMatrix*modelViewMatrix*vec4(moved,1.0);
                }`,
            fragmentShader: `
                uniform float uTime; uniform float uEnergy; varying vec3 vNormal; varying vec3 vPosition;
                void main(){
                    float fresnel=pow(1.0-abs(dot(normalize(vNormal),vec3(0.,0.,1.))),2.2);
                    float pulse=.5+.5*sin(uTime*1.5+vPosition.y*3.0);
                    vec3 deep=vec3(.035,.18,.29); vec3 light=vec3(.39,.68,.86);
                    vec3 color=mix(deep,light,.28+fresnel*.58+pulse*.08*uEnergy);
                    gl_FragColor=vec4(color,.82+fresnel*.16);
                }`
        });
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.78, 5), coreMaterial);
        core.position.y = -.4;
        reactor.add(core);

        const rings = new THREE.Group();
        const ringMaterial = new THREE.MeshStandardMaterial({ color: 0x64a1ce, emissive: 0x153f5c, emissiveIntensity: 1.2, metalness: .7, roughness: .2 });
        [-1.55, -.35, .85].forEach((y, index) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(1.12 + index * .04, .018, 8, 72), ringMaterial);
            ring.position.y = y;
            ring.rotation.x = Math.PI / 2 + (index - 1) * .14;
            ring.rotation.y = (index - 1) * .16;
            rings.add(ring);
        });
        reactor.add(rings);

        const particleCount = innerWidth > 1200 ? 220 : 150;
        const positions = new Float32Array(particleCount * 3);
        const starts = new Float32Array(particleCount * 3);
        const targets = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const j = i * 3;
            const angle = i * 2.39996;
            const spread = 2.7 + (i % 11) * .17;
            starts[j] = Math.cos(angle) * spread + (i % 2 ? 1.6 : -1.6);
            starts[j + 1] = ((i * 37) % 100) / 100 * 7 - 3.5;
            starts[j + 2] = Math.sin(angle) * spread - 1.5;
            const t = i / particleCount;
            const targetAngle = t * Math.PI * 14;
            targets[j] = Math.cos(targetAngle) * (.28 + .62 * Math.sin(t * Math.PI));
            targets[j + 1] = t * 4.7 - 2.5;
            targets[j + 2] = Math.sin(targetAngle) * (.28 + .62 * Math.sin(t * Math.PI));
            positions[j] = starts[j]; positions[j + 1] = starts[j + 1]; positions[j + 2] = starts[j + 2];
        }
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0x8dc4e7, size: .035, transparent: true, opacity: .76, depthWrite: false }));
        reactor.add(particles);

        const halo = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.77, 96), new THREE.MeshBasicMaterial({ color: 0x64a1ce, transparent: true, opacity: .16, side: THREE.DoubleSide }));
        halo.rotation.x = Math.PI / 2;
        halo.position.y = -.35;
        reactor.add(halo);

        const state = { progress: 0, mouseX: 0, mouseY: 0, visible: true };
        let animationFrame;
        const clock = new THREE.Clock();

        function render() {
            if (!state.visible) { animationFrame = requestAnimationFrame(render); return; }
            const time = clock.getElapsedTime();
            const p = state.progress;
            const organize = THREE.MathUtils.smoothstep(p, .08, .55);
            const position = particleGeometry.attributes.position.array;
            for (let i = 0; i < particleCount * 3; i += 3) {
                const wave = Math.sin(time * .45 + i) * .012 * (1 - organize);
                position[i] = THREE.MathUtils.lerp(starts[i], targets[i], organize) + wave;
                position[i + 1] = THREE.MathUtils.lerp(starts[i + 1], targets[i + 1], organize);
                position[i + 2] = THREE.MathUtils.lerp(starts[i + 2], targets[i + 2], organize) + wave;
            }
            particleGeometry.attributes.position.needsUpdate = true;
            coreUniforms.uTime.value = time;
            coreUniforms.uEnergy.value = THREE.MathUtils.smoothstep(p, .42, .85);
            core.scale.setScalar(.72 + p * .52);
            rings.rotation.y = time * .08 + p * 2.2;
            rings.children.forEach((ring, index) => ring.rotation.z = time * (.06 + index * .025) * (index % 2 ? -1 : 1));
            shell.rotation.y = time * .035 + state.mouseX * .08;
            reactor.rotation.x += ((state.mouseY * .05 + p * .12) - reactor.rotation.x) * .04;
            reactor.rotation.y += ((state.mouseX * .12 + p * .7) - reactor.rotation.y) * .035;
            reactor.position.x += ((p > .78 ? 3.9 : 3.45) - reactor.position.x) * .035;
            camera.position.z += ((12.5 - p * 2.4) - camera.position.z) * .035;
            camera.position.y += ((p * .42) - camera.position.y) * .035;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
            animationFrame = requestAnimationFrame(render);
        }

        const pointerMove = event => {
            state.mouseX = event.clientX / innerWidth * 2 - 1;
            state.mouseY = event.clientY / innerHeight * 2 - 1;
        };
        const resize = () => {
            camera.aspect = innerWidth / innerHeight;
            camera.updateProjectionMatrix();
            renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
            renderer.setSize(innerWidth, innerHeight, false);
        };
        const visibility = () => { state.visible = !document.hidden; };
        addEventListener('pointermove', pointerMove, { passive: true });
        addEventListener('resize', resize);
        document.addEventListener('visibilitychange', visibility);
        canvas.classList.add('is-ready');
        poster.style.opacity = '0';
        render();

        return {
            setProgress(value) { state.progress = value; },
            destroy() {
                cancelAnimationFrame(animationFrame);
                removeEventListener('pointermove', pointerMove);
                removeEventListener('resize', resize);
                document.removeEventListener('visibilitychange', visibility);
                particleGeometry.dispose(); shellGeometry.dispose(); renderer.dispose();
            }
        };
    }

    function initMotion() {
        if (!window.gsap || !window.ScrollTrigger) {
            finishLoading();
            return;
        }
        const { gsap, ScrollTrigger } = window;
        gsap.registerPlugin(ScrollTrigger);
        document.documentElement.style.scrollBehavior = 'auto';

        let lenis;
        if (window.Lenis && !reduced) {
            lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: .9 });
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(time => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }

        if (!reduced) {
            gsap.set('.ix-line b', { yPercent: 110 });
            const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
            intro.to('.ix-line b', { yPercent: 0, duration: 1.25, stagger: .12 }, .15)
                .from('.ix-overline', { y: 14, opacity: 0, duration: .7 }, .3)
                .from('.ix-lead', { y: 18, opacity: 0, duration: .8 }, .62)
                .from('.ix-hero-actions > *', { y: 16, opacity: 0, duration: .65, stagger: .1 }, .75)
                .from('.ix-object-label', { x: 20, opacity: 0, duration: .7 }, .8);

            const beats = gsap.utils.toArray('.ix-beat');
            const count = document.querySelector('.ix-beat-count b');
            let activeBeat = 0;
            ScrollTrigger.create({
                trigger: '.ix-system', start: 'top top', end: 'bottom bottom', scrub: .9,
                onUpdate(self) {
                    sceneController?.setProgress(self.progress);
                    const next = Math.min(3, Math.floor(self.progress * 4));
                    if (next !== activeBeat) {
                        const old = beats[activeBeat];
                        const incoming = beats[next];
                        gsap.to(old, { autoAlpha: 0, y: next > activeBeat ? -36 : 36, duration: .35, ease: 'power2.in', onComplete: () => old.classList.remove('is-active') });
                        incoming.classList.add('is-active');
                        gsap.fromTo(incoming, { autoAlpha: 0, y: next > activeBeat ? 42 : -42 }, { autoAlpha: 1, y: 0, duration: .72, ease: 'power4.out' });
                        activeBeat = next;
                        count.textContent = String(next + 1).padStart(2, '0');
                    }
                }
            });

            gsap.utils.toArray('.ix-section-head, .ix-territory-copy > *, .ix-contact-main > *').forEach(element => {
                gsap.from(element, { y: 55, opacity: 0, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: element, start: 'top 86%', once: true } });
            });

            const mm = gsap.matchMedia();
            mm.add('(min-width: 641px)', () => {
                const track = document.querySelector('.ix-track');
                const distance = () => Math.max(0, track.scrollWidth - innerWidth);
                const tween = gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: '.ix-track-wrap', start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
                return () => tween.kill();
            });

            gsap.to('.ix-progress span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: body, start: 'top top', end: 'bottom bottom', scrub: .15 } });
            gsap.to('.ix-territory-map svg', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.ix-territory', start: 'top bottom', end: 'bottom top', scrub: true } });

            document.querySelectorAll('.ix-magnetic').forEach(button => {
                button.addEventListener('pointermove', event => {
                    const rect = button.getBoundingClientRect();
                    gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * .12, y: (event.clientY - rect.top - rect.height / 2) * .16, duration: .35, ease: 'power3.out' });
                });
                button.addEventListener('pointerleave', () => gsap.to(button, { x: 0, y: 0, duration: .65, ease: 'elastic.out(1,.45)' }));
            });
        }

        addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
        setTimeout(() => ScrollTrigger.refresh(), 600);
        finishLoading();
    }

    initNavigation();
    const boot = () => {
        sceneController = createReactor();
        initMotion();
        clearTimeout(safetyTimer);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 900 });
    else setTimeout(boot, 80);
})();
