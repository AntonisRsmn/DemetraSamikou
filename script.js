// ============================================
// DIMITRA SAMIKOU — Portfolio JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navbar Scroll Effect ----
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ---- Mobile Nav Toggle ----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    function openNav() {
        navToggle.classList.add('active');
        navLinks.classList.add('active');
        navOverlay.classList.add('active');
        document.body.classList.add('nav-open');
    }

    function closeNav() {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.classList.remove('nav-open');
    }

    navToggle.addEventListener('click', () => {
        navLinks.classList.contains('active') ? closeNav() : openNav();
    });

    // Close on overlay click
    navOverlay.addEventListener('click', closeNav);

    // Close on X button click
    const navClose = document.getElementById('navClose');
    if (navClose) {
        navClose.addEventListener('click', closeNav);
    }

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // ---- Portfolio Filtering ----
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const portfolioGrid = document.querySelector('.portfolio-grid');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            portfolioItems.forEach(item => {
                const matches = filter === 'all' || item.dataset.category === filter;
                if (matches) {
                    item.classList.remove('hidden');
                    item.style.display = '';
                } else {
                    item.classList.add('hidden');
                    // Wait for fade out then hide
                    setTimeout(() => {
                        if (item.classList.contains('hidden')) {
                            item.style.display = 'none';
                        }
                    }, 400);
                }
            });
        });
    });

    // ---- Scroll Reveal Animations ----
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in class to animatable elements
    const animatableSelectors = [
        '.hero-content',
        '.hero-image',
        '.about-image',
        '.about-content',
        '.portfolio-item',
        '.service-card',
        '.process-step',
        '.testimonial-card',
        '.cta-content',
        '.contact-info',
        '.contact-form-wrapper',
        '.section-header'
    ];

    animatableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    });

    // ---- Contact Form Handler ----
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Placeholder: log form data (backend integration later)
            console.log('Form submitted:', data);

            // Show success feedback
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Message Sent! ✓';
            btn.style.backgroundColor = '#4a7c59';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);
        });
    }

    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    // ---- Active Nav Link Highlighting ----
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop - 100;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);

            if (link) {
                if (scrollPos >= top && scrollPos < bottom) {
                    link.style.color = 'var(--antique-ruby)';
                } else {
                    link.style.color = '';
                }
            }
        });
    });

});
