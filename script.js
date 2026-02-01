// ==========================================
// ACUARIA LABS - JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Header scroll effect
    const header = document.querySelector('.header');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Close mobile menu if open
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in class to elements
    const animateElements = document.querySelectorAll(
        '.pillar-card, .project-card, .about-text, .about-visual, .contact-info, .contact-form'
    );

    animateElements.forEach(el => {
        el.classList.add('fade-in');
        fadeInObserver.observe(el);
    });

    // Form handling - Netlify handles the submission
    // No need to prevent default, Netlify will process the form

    // Parallax effect for floating bubbles
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const bubbles = document.querySelectorAll('.bubble');

                bubbles.forEach((bubble, index) => {
                    const speed = 0.05 + (index * 0.02);
                    bubble.style.transform = `translateY(${scrolled * speed}px)`;
                });

                ticking = false;
            });

            ticking = true;
        }
    });
});

// Add CSS for fade-in animations
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .pillar-card.fade-in {
        transition-delay: calc(var(--index, 0) * 0.1s);
    }

    .project-card.fade-in {
        transition-delay: calc(var(--index, 0) * 0.1s);
    }
`;
document.head.appendChild(style);

// Set animation delay indexes
document.querySelectorAll('.pillar-card').forEach((card, index) => {
    card.style.setProperty('--index', index);
});

document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.setProperty('--index', index);
});
