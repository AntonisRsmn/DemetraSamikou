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

    // ---- Load Site Images (hero + about) from API ----
    async function loadSiteImages() {
        try {
            const res = await fetch('/api/projects/site/settings');
            const data = await res.json();

            if (data.heroImage && data.heroImage.url) {
                const heroWrap = document.getElementById('heroImageWrap');
                if (heroWrap) {
                    heroWrap.innerHTML = '<img src="' + data.heroImage.url + '" alt="Demetra Samikou" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">';
                }
            }

            if (data.aboutImage && data.aboutImage.url) {
                const aboutWrap = document.getElementById('aboutImageWrap');
                if (aboutWrap) {
                    aboutWrap.innerHTML = '<img src="' + data.aboutImage.url + '" alt="About Demetra" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">';
                }
            }
        } catch {}
    }

    loadSiteImages();

    // ---- Load Portfolio Folders from API ----
    let featuredFolders = [];

    function escapeHtml(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    async function loadFoldersAndPortfolio() {
        const grid = document.getElementById('portfolioGrid');
        if (!grid) return;

        try {
            const res = await fetch('/api/projects/folders/featured');
            const data = await res.json();
            featuredFolders = Array.isArray(data) ? data : [];

            const filtersContainer = document.getElementById('portfolioFilters');
            if (filtersContainer) {
                filtersContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All Folders</button>';
            }

            renderFolderItems(featuredFolders);
            initPortfolioAnimations();
        } catch {
            if (grid) grid.innerHTML = '<p style="text-align:center;color:var(--text-light);grid-column:1/-1;padding:40px;">Failed to load folders.</p>';
        }
    }

    function renderFolderItems(folders) {
        const grid = document.getElementById('portfolioGrid');
        if (!grid) return;

        if (folders.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-light);grid-column:1/-1;padding:40px;">No folders selected yet.</p>';
            return;
        }

        grid.innerHTML = folders.map(folder => `
            <div class="portfolio-item">
                <a href="/projects?folder=${encodeURIComponent(folder._id)}" style="text-decoration:none;color:inherit;display:flex;height:100%">
                    <div class="portfolio-card">
                        <div class="portfolio-image">
                            <img src="${escapeHtml(folder.image)}" alt="${escapeHtml(folder.name)}" loading="lazy">
                        </div>
                        <div class="portfolio-info">
                            <h3>${escapeHtml(folder.name)}</h3>
                            <p>${escapeHtml(String(folder.projectCount || 0))} project(s)</p>
                        </div>
                        <div class="portfolio-overlay">
                            <span>View Folder →</span>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
    }

    function initPortfolioAnimations() {
        document.querySelectorAll('.portfolio-item').forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    }

    loadFoldersAndPortfolio();

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
