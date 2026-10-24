// Motion enhancement for index-pulido.html only. Content stays visible without JS.
(() => {
    if (!document.body.classList.contains('original-pulido')) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const targets = [...document.querySelectorAll(
        '.section-header, .project-card-link, .pillar-card, .about-text, ' +
        '.contact-info, .contact-form, .faq-item, .pipeline-cta, .projects-cta, .philosophy-quote'
    )];
    const hero = document.querySelector('.hero');
    const desktopScene = matchMedia('(min-width: 1025px)');
    // Three planes, one normalized scroll position. No timer or entrance trigger.
    const planes = [
        { element: document.querySelector('.pulido-depth-back'), travel: 205, zoom: 0.09 },
        { element: document.querySelector('.dna-helix'), travel: 115, zoom: 0.42 },
        { element: document.querySelector('.hero-text'), travel: -30, zoom: 0 }
    ];
    const accordions = new Map();
    const running = new Map();
    const seen = new WeakSet();
    let observer;
    let frame = 0;

    function finish(element) {
        running.get(element)?.cancel();
        running.delete(element);
    }

    function setup() {
        observer?.disconnect();
        for (const element of running.keys()) finish(element);
        if (reduce.matches || !window.IntersectionObserver || !Element.prototype.animate) return;
        observer = new IntersectionObserver(entries => {
            const visible = entries.filter(entry => entry.isIntersecting);
            const groups = new Map();
            visible.forEach(({ target }) => {
                observer.unobserve(target);
                if (seen.has(target)) return;
                seen.add(target);
                if (target.contains(document.activeElement)) return;
                const parent = target.parentElement;
                const index = groups.get(parent) || 0;
                groups.set(parent, index + 1);
                const animation = target.animate([
                    { opacity: 0 },
                    { opacity: 1 }
                ], {
                    duration: 480,
                    delay: Math.min(index * 40, 120),
                    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                    fill: 'backwards'
                });
                running.set(target, animation);
                animation.onfinish = () => running.delete(target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
        targets.forEach(target => { if (!seen.has(target)) observer.observe(target); });
    }

    // Animate the real details height so the following questions move with it.
    // Height is intentional here: transforms alone leave a jumping layout gap.
    function settle(item) {
        const state = accordions.get(item);
        if (!state) return;
        accordions.delete(item);
        item.open = state.open;
        state.animation.cancel();
        item.style.removeProperty('height');
        schedule();
    }
    document.querySelectorAll('.faq-item').forEach(item => {
        const summary = item.querySelector('summary');
        summary.addEventListener('click', event => {
            if (reduce.matches || !item.animate) return;
            event.preventDefault();
            finish(item);
            const prior = accordions.get(item);
            const open = prior ? !prior.open : !item.open;
            const from = item.getBoundingClientRect().height;
            prior?.animation.cancel();
            item.style.removeProperty('height');
            const border = parseFloat(getComputedStyle(item).borderTopWidth) +
                parseFloat(getComputedStyle(item).borderBottomWidth);
            item.open = true;
            const to = open ? item.getBoundingClientRect().height :
                summary.getBoundingClientRect().height + border;
            const animation = item.animate([
                { height: `${from}px` }, { height: `${to}px` }
            ], {
                duration: open ? 420 : 320,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'both'
            });
            accordions.set(item, { animation, open });
            animation.onfinish = () => settle(item);
        });
    });

    function paint() {
        frame = 0;
        if (document.hidden) return;
        if (!hero) return;
        if (reduce.matches || !desktopScene.matches) {
            planes.forEach(({ element }) => {
                element?.style.removeProperty('translate');
                element?.style.removeProperty('scale');
            });
            return;
        }
        // Measure the untransformed section, never the moving planes (no feedback).
        const rect = hero.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.75)));
        planes.forEach(({ element, travel, zoom }) => {
            if (!element) return;
            element.style.translate = `0 ${(progress * travel).toFixed(2)}px`;
            element.style.scale = (1 + progress * zoom).toFixed(4);
        });
    }
    function schedule() {
        if (!frame) frame = requestAnimationFrame(paint);
    }
    // Keyboard focus must never wait for an entrance animation.
    document.addEventListener('focusin', event => {
        for (const element of running.keys()) {
            if (element.contains(event.target)) finish(element);
        }
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', () => {
        for (const item of accordions.keys()) settle(item);
        schedule();
    }, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    reduce.addEventListener('change', () => {
        for (const item of accordions.keys()) settle(item);
        setup();
        schedule();
    });
    desktopScene.addEventListener('change', schedule);

    // Scroll progress bar, injected so the HTML stays identical. scaleX only.
    const bar = document.createElement('div');
    bar.className = 'pulido-progress';
    bar.setAttribute('aria-hidden', 'true');
    (document.querySelector('.header') || document.body).appendChild(bar);
    let barFrame = 0;
    function paintBar() {
        barFrame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
        bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
    }
    function scheduleBar() {
        if (!barFrame) barFrame = requestAnimationFrame(paintBar);
    }
    window.addEventListener('scroll', scheduleBar, { passive: true });
    window.addEventListener('resize', scheduleBar, { passive: true });
    scheduleBar();

    // Cursor spotlight: only sets --mx/--my; CSS draws it for fine pointers.
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let spotCard = null;
    let spotX = 0;
    let spotY = 0;
    let spotFrame = 0;
    function paintSpot() {
        spotFrame = 0;
        if (!spotCard) return;
        const box = spotCard.getBoundingClientRect();
        spotCard.style.setProperty('--mx', `${(spotX - box.left).toFixed(1)}px`);
        spotCard.style.setProperty('--my', `${(spotY - box.top).toFixed(1)}px`);
    }
    document.addEventListener('pointermove', event => {
        if (reduce.matches || !finePointer.matches || event.pointerType === 'touch') return;
        const card = event.target.closest?.('.project-card, .pillar-card:not(.featured)');
        if (!card) { spotCard = null; return; }
        spotCard = card;
        spotX = event.clientX;
        spotY = event.clientY;
        if (!spotFrame) spotFrame = requestAnimationFrame(paintSpot);
    }, { passive: true });

    // Section titles reveal line by line (v6). Split at runtime so the HTML text is
    // untouched: words are measured, grouped by visual line, each line gets a mask.
    // Headings stay visible until the split is done (class pl-split hides them).
    // The old fade on .section-header/.about-text/.contact-info stays: it is a soft
    // opacity fade of the whole block; the lines slide on their own observer. The hero
    // h1 is left alone (above the fold, it already moves with the hero parallax).
    const titles = [...document.querySelectorAll('main h2, section h2')]
        .filter(h => !h.closest('.hero'));
    const titleState = new Map();
    let titleObserver;
    let titleWidth = 0;
    let titleTimer = 0;

    function unsplitTitle(h) {
        const s = titleState.get(h);
        if (!s || !s.saved) return;
        h.replaceChildren(...s.saved.map(n => n.cloneNode(true)));
        h.classList.remove('pl-split');
        s.saved = null;
    }
    function splitTitle(h) {
        let s = titleState.get(h);
        if (!s) { s = { revealed: false, text: h.textContent, saved: null }; titleState.set(h, s); }
        if (s.saved) unsplitTitle(h);
        const saved = [...h.childNodes].map(n => n.cloneNode(true));
        // 1. wrap each word (text nodes only, inline elements keep their place)
        const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
        const texts = [];
        while (walker.nextNode()) texts.push(walker.currentNode);
        const words = [];
        texts.forEach(node => {
            const frag = document.createDocumentFragment();
            node.nodeValue.split(/(\s+)/).forEach(part => {
                if (!part) return;
                if (/^\s+$/.test(part)) { frag.append(part); return; }
                const w = document.createElement('span');
                w.className = 'pl-w';
                w.textContent = part;
                words.push(w);
                frag.append(w);
            });
            node.replaceWith(frag);
        });
        // 2. group words by visual line
        const lines = [];
        let lastTop = null;
        words.forEach(w => {
            const top = w.offsetTop;
            if (lastTop === null || Math.abs(top - lastTop) > 4) { lines.push([]); lastTop = top; }
            lines[lines.length - 1].push(w);
        });
        // 3. rebuild the heading as one masked block per line, cloning inline wrappers
        const leaves = [];
        const collect = node => node.childNodes.forEach(c => {
            if (c.nodeType === 1 && !c.classList.contains('pl-w')) collect(c); else leaves.push(c);
        });
        collect(h);
        const lineOf = new Map();
        lines.forEach((ws, i) => ws.forEach(w => lineOf.set(w, i)));
        const buckets = lines.map(() => []);
        let current = 0;
        leaves.forEach(leaf => {
            if (lineOf.has(leaf)) current = lineOf.get(leaf);
            buckets[current].push(leaf);
        });
        const chainOf = leaf => {
            const chain = [];
            for (let p = leaf.parentNode; p && p !== h; p = p.parentNode) chain.unshift(p);
            return chain;
        };
        const built = buckets.map((leafs, i) => {
            const line = document.createElement('span');
            line.className = 'pl-line';
            const inner = document.createElement('span');
            inner.className = 'pl-inner';
            inner.style.setProperty('--i', i);
            line.append(inner);
            let open = []; // [{orig, clone}]
            leafs.forEach(leaf => {
                const chain = chainOf(leaf);
                let k = 0;
                while (k < open.length && k < chain.length && open[k].orig === chain[k]) k++;
                open = open.slice(0, k);
                for (let j = k; j < chain.length; j++) {
                    const clone = chain[j].cloneNode(false);
                    (open.length ? open[open.length - 1].clone : inner).append(clone);
                    open.push({ orig: chain[j], clone });
                }
                (open.length ? open[open.length - 1].clone : inner).append(leaf);
            });
            return line;
        });
        h.replaceChildren(...built);
        // Safety: the visible text must be byte-identical, otherwise undo.
        if (h.textContent !== s.text) {
            h.replaceChildren(...saved);
            return;
        }
        s.saved = saved;
        if (s.revealed) h.classList.add('pl-in');
        h.classList.add('pl-split');
    }
    function splitTitles() {
        titleObserver?.disconnect();
        titleObserver = null;
        if (reduce.matches || !window.IntersectionObserver) {
            titles.forEach(h => { unsplitTitle(h); h.classList.remove('pl-in'); });
            return;
        }
        titleWidth = window.innerWidth;
        titleObserver = new IntersectionObserver(entries => {
            entries.forEach(({ target, isIntersecting }) => {
                if (!isIntersecting) return;
                titleObserver.unobserve(target);
                const s = titleState.get(target);
                if (s) s.revealed = true;
                target.classList.add('pl-in');
            });
        }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
        titles.forEach(h => {
            try { splitTitle(h); } catch (e) { unsplitTitle(h); return; }
            const s = titleState.get(h);
            if (h.classList.contains('pl-split') && !s.revealed) titleObserver.observe(h);
        });
    }
    function startTitles() {
        const run = () => { try { splitTitles(); } catch (e) { titles.forEach(unsplitTitle); } };
        if (document.fonts?.ready) document.fonts.ready.then(run, run); else run();
    }
    window.addEventListener('resize', () => {
        clearTimeout(titleTimer);
        titleTimer = setTimeout(() => {
            if (window.innerWidth === titleWidth || reduce.matches) return;
            splitTitles();
        }, 200);
    }, { passive: true });
    reduce.addEventListener('change', splitTitles);
    startTitles();

    setup();
    schedule();
})();
