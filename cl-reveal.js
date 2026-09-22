/* cl-ui — scroll reveal.
 *
 * Every element matched by GROUPS fades up once, the first time it enters the
 * viewport. Siblings inside the same parent are staggered so rows and grids
 * arrive in cascade instead of all at once.
 *
 * Contract with styles.css:
 *   - the initial hidden state lives in CSS, guarded by html.cl-reveal-on,
 *     which an inline snippet in <head> adds before first paint. Without JS,
 *     without IntersectionObserver or with prefers-reduced-motion the class is
 *     never set and every element renders normally.
 *   - this file only toggles .cl-in (playing) and .cl-shown (final state).
 *     Both are removed from the animation path once done, so hover transitions
 *     declared on the same elements keep working untouched.
 */
(function () {
    'use strict';

    var root = document.documentElement;
    if (!root.classList.contains('cl-reveal-on')) return;

    /* [selector, stagger in ms between siblings of the same parent] */
    var GROUPS = [
        ['.cl-band-cities > li', 90],
        ['.cl-section-intro > *', 90],
        ['.cl-service', 80],
        ['.cl-method-heading > *', 80],
        ['.cl-network-toolbar', 0],
        ['.cl-network-graph', 0],
        ['.cl-flow-loop', 0],
        ['.cl-flow-note > *', 80],
        ['.cl-about-copy > *', 70],
        ['.cl-values > li', 90],
        ['.cl-pillar', 90],
        ['.cl-work', 90],
        ['.cl-works-note > *', 80],
        ['.cl-faq > h2', 0],
        ['.cl-faq details', 45],
        ['.cl-quote blockquote', 0],
        ['.cl-contact .cl-kicker', 0],
        ['.cl-contact-grid > *', 120]
    ];

    var MAX_DELAY = 420;   /* a long row must not keep the reader waiting */
    var SAFETY = 1400;     /* ms: reveal anyway if animationend never fires */

    function show(el) {
        if (el.classList.contains('cl-shown')) return;
        el.classList.remove('cl-in');
        el.classList.add('cl-shown');
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            observer.unobserve(el);
            el.classList.add('cl-in');
            el.addEventListener('animationend', function () { show(el); }, { once: true });
            setTimeout(function () { show(el); }, SAFETY);
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });

    GROUPS.forEach(function (group) {
        var selector = group[0];
        var stagger = group[1];
        var parent = null;
        var index = 0;

        Array.prototype.forEach.call(document.querySelectorAll(selector), function (el) {
            if (el.parentElement !== parent) { parent = el.parentElement; index = 0; }
            if (stagger) {
                el.style.setProperty('--cl-reveal-delay', Math.min(index * stagger, MAX_DELAY) + 'ms');
            }
            index += 1;
            observer.observe(el);
        });
    });
})();
