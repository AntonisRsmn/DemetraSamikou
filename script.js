// ============================================
// DIMITRA SAMIKOU — Portfolio JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navbar Scroll Effect & Scroll to Top ----
    const navbar = document.getElementById('navbar');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        if (scrollToTopBtn) {
            scrollToTopBtn.classList.toggle('visible', window.scrollY > 400);
        }
    });
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

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

    // ---- Load Site Images (hero + about) + Social Links from API ----
    const socialIconSVGs = {
        instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
        facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        behance: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.609.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.63.165-1.27.25-1.95.25H0V4.51h6.938v-.007zM6.545 10.16c.63 0 1.14-.163 1.53-.488.39-.325.583-.81.583-1.45 0-.364-.075-.66-.218-.886a1.474 1.474 0 00-.577-.53 2.33 2.33 0 00-.79-.24 5.16 5.16 0 00-.89-.074H3.293v3.668h3.252zm.26 5.676c.338 0 .66-.03.96-.09.303-.06.57-.16.8-.31.24-.14.42-.35.55-.6.13-.26.19-.6.19-1.004 0-.79-.22-1.35-.66-1.69-.44-.33-1.01-.5-1.73-.5H3.293v4.2h3.512v-.006zm9.098-9.663h5.905v1.508h-5.905V6.173zm2.9 9.93c.41.438.97.66 1.69.66.52 0 .96-.14 1.33-.42.37-.28.6-.57.68-.87h2.27c-.36 1.09-.9 1.88-1.63 2.39-.73.5-1.61.76-2.66.76-.72 0-1.37-.12-1.95-.37a4.123 4.123 0 01-1.49-1.06 4.858 4.858 0 01-.95-1.64 6.16 6.16 0 01-.33-2.08c0-.71.11-1.37.34-1.98.23-.61.55-1.14.98-1.59.43-.45.93-.8 1.51-1.06.59-.26 1.24-.4 1.94-.4.82 0 1.52.17 2.1.49.59.33 1.07.77 1.44 1.32.37.55.63 1.19.78 1.91.15.72.21 1.48.17 2.28h-6.8c.04.91.28 1.61.69 2.05v.01zm3.01-4.71c-.35-.39-.87-.58-1.55-.58-.44 0-.81.08-1.09.22-.29.15-.52.33-.68.54-.17.21-.28.44-.35.68-.06.24-.1.45-.11.64h4.44c-.07-.77-.31-1.33-.66-1.71v.21z"/></svg>',
        dribbble: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308a10.29 10.29 0 004.395-6.87h-.003zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4a10.161 10.161 0 006.29 2.166c1.42 0 2.77-.29 4-.81l.006-.006zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855l-.002.003zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17v.006zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702A10.18 10.18 0 0012 1.764c-.825 0-1.63.1-2.4.285v.003zm10.335 3.483c-.218.29-1.91 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33a10.097 10.097 0 00-2.32-6.386h.004z"/></svg>',
        youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        tiktok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
        pinterest: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24 18.635 24 24 18.633 24 12.013 24 5.394 18.635.028 12.017.028v-.028z"/></svg>',
        whatsapp: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
        website: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        email: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        threads: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.228 1.33-2.93.88-.67 2.082-1.04 3.482-1.073 1.014-.024 1.96.09 2.82.336-.075-.784-.3-1.404-.67-1.843-.44-.52-1.124-.79-2.034-.802h-.07c-.713.007-1.32.197-1.8.565l-.406.342-1.29-1.53.42-.354c.845-.71 1.92-1.086 3.108-1.086h.1c2.611.04 4.12 1.695 4.216 4.612a8.03 8.03 0 01.01.446c.004.088.004.177.003.264.258.137.5.291.727.461 1.065.799 1.818 1.87 2.237 3.082.602 1.741.584 4.39-1.601 6.534-1.82 1.787-4.053 2.584-7.22 2.607zm.818-7.89c-.36 0-.695.026-1 .077-.9.15-1.753.527-2.194.96-.387.378-.575.812-.55 1.28.038.69.474 1.376 1.377 1.773.64.35 1.38.453 2.085.42 1.088-.06 1.908-.462 2.497-1.194.488-.608.83-1.448.998-2.467-.82-.32-1.758-.542-2.78-.582a9.2 9.2 0 00-.433-.004v-.263z"/></svg>'
    };

    function getSocialIcon(platform) {
        return socialIconSVGs[platform] || socialIconSVGs['website'];
    }

    function getPlatformLabel(platform) {
        const labels = {
            instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn',
            twitter: 'X (Twitter)', x: 'X', behance: 'Behance', dribbble: 'Dribbble',
            youtube: 'YouTube', tiktok: 'TikTok', pinterest: 'Pinterest',
            whatsapp: 'WhatsApp', website: 'Website', email: 'Email', threads: 'Threads'
        };
        return labels[platform] || platform;
    }

    function renderSocialLinks(links, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !links || !links.length) return;
        container.innerHTML = links.map(link => {
            const icon = getSocialIcon(link.platform);
            const label = getPlatformLabel(link.platform);
            return '<a href="' + link.url + '" aria-label="' + label + '" class="social-link" target="_blank" rel="noopener noreferrer">' + icon + '</a>';
        }).join('');
    }

    async function loadSiteImages() {
        try {
            const res = await fetch('/api/projects/site/settings');
            const data = await res.json();

            if (data.heroImage && data.heroImage.url) {
                const heroWrap = document.getElementById('heroImageWrap');
                if (heroWrap) {
                    heroWrap.innerHTML = '<img src="' + data.heroImage.url + '" alt="Demetra Samikou" style="width:100%;height:100%;object-fit:cover;border-radius:20px;" loading="eager">';
                }
            }

            if (data.aboutImage && data.aboutImage.url) {
                const aboutWrap = document.getElementById('aboutImageWrap');
                if (aboutWrap) {
                    aboutWrap.innerHTML = '<img src="' + data.aboutImage.url + '" alt="About Demetra" style="width:100%;height:100%;object-fit:cover;border-radius:16px;" loading="lazy">';
                }
            }

            // Render social links in all containers
            if (data.socialLinks && data.socialLinks.length) {
                renderSocialLinks(data.socialLinks, 'socialLinksContact');
                renderSocialLinks(data.socialLinks, 'socialLinksFooter');
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
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (response.ok) {
                    btn.textContent = 'Message Sent! ✓';
                    btn.style.backgroundColor = '#4a7c59';
                    contactForm.reset();
                } else {
                    btn.textContent = result.message || 'Failed to send';
                    btn.style.backgroundColor = '#c0392b';
                }
            } catch (err) {
                btn.textContent = 'Connection error';
                btn.style.backgroundColor = '#c0392b';
            }

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.disabled = false;
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
