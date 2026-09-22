(() => {
    const body = document.body;
    if (!body.classList.contains('future-concept')) return;

    const header = document.getElementById('fc-header');
    const menu = document.querySelector('.fc-menu');
    const nav = document.getElementById('fc-nav');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const closeMenu = () => {
        nav.classList.remove('is-open');
        menu.setAttribute('aria-expanded', 'false');
        body.classList.remove('fc-menu-open');
    };

    menu.addEventListener('click', () => {
        const open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        menu.setAttribute('aria-expanded', String(open));
        body.classList.toggle('fc-menu-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 32);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
    document.querySelectorAll('.fc-reveal').forEach(element => revealObserver.observe(element));

    const canvas = document.getElementById('fc-network');
    const context = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let points = [];
    let pointer = { x: -9999, y: -9999 };
    let frame;

    const palette = ['rgba(100,161,206,.78)', 'rgba(60,128,180,.56)', 'rgba(184,213,234,.56)'];

    function resize() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const count = Math.max(28, Math.min(74, Math.floor(width / 20)));
        points = Array.from({ length: count }, (_, index) => ({
            x: (index * 137.5 % 100) / 100 * width,
            y: (index * 71.3 % 100) / 100 * height,
            vx: ((index % 5) - 2) * 0.035,
            vy: (((index * 3) % 5) - 2) * 0.028,
            radius: 1 + (index % 3) * 0.45,
            color: palette[index % palette.length]
        }));
    }

    function draw() {
        context.clearRect(0, 0, width, height);
        points.forEach((point, index) => {
            if (!reducedMotion) {
                point.x += point.vx;
                point.y += point.vy;
                if (point.x < 0 || point.x > width) point.vx *= -1;
                if (point.y < 0 || point.y > height) point.vy *= -1;
            }

            const pointerDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
            if (pointerDistance < 180) {
                context.beginPath();
                context.moveTo(point.x, point.y);
                context.lineTo(pointer.x, pointer.y);
                context.strokeStyle = `rgba(100,161,206,${(1 - pointerDistance / 180) * .28})`;
                context.stroke();
            }

            for (let otherIndex = index + 1; otherIndex < points.length; otherIndex++) {
                const other = points[otherIndex];
                const distance = Math.hypot(point.x - other.x, point.y - other.y);
                if (distance < 118) {
                    context.beginPath();
                    context.moveTo(point.x, point.y);
                    context.lineTo(other.x, other.y);
                    context.strokeStyle = `rgba(100,161,206,${(1 - distance / 118) * .14})`;
                    context.stroke();
                }
            }

            context.beginPath();
            context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
            context.fillStyle = point.color;
            context.fill();
        });
        if (!reducedMotion) frame = requestAnimationFrame(draw);
    }

    canvas.addEventListener('pointermove', event => {
        const rect = canvas.getBoundingClientRect();
        pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    });
    canvas.addEventListener('pointerleave', () => { pointer = { x: -9999, y: -9999 }; });
    window.addEventListener('resize', () => { cancelAnimationFrame(frame); resize(); draw(); });

    resize();
    draw();
})();
