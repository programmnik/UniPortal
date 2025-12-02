// Navigation and routing functionality

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initActiveLinks();
    initScrollSpy();
    initBackToTop();
});

// Initialize navigation
function initNavigation() {
    // Handle internal navigation
    document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't intercept if it's a hash link or external
            if (this.getAttribute('href').startsWith('#') || 
                this.getAttribute('target') === '_blank' ||
                this.hasAttribute('download')) {
                return;
            }
            
            // Check if it's a same-page anchor
            const href = this.getAttribute('href');
            const currentPath = window.location.pathname;
            
            if (href.startsWith('#') || 
                (href.includes(currentPath) && href.includes('#'))) {
                return; // Let browser handle anchor links
            }
            
            // Add loading state
            showPageTransition();
            
            // Simulate navigation delay (remove in production)
            setTimeout(() => {
                window.location.href = href;
            }, 300);
            
            e.preventDefault();
        });
    });
}

// Update active navigation links based on current page
function initActiveLinks() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Check if this link corresponds to current page
        if (linkPath === currentPath || 
            (linkPath !== '/' && currentPath.includes(linkPath))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
        
        // Handle hash links
        if (linkPath.startsWith('#')) {
            const targetId = linkPath.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }, {
                    rootMargin: '-50% 0px -50% 0px'
                });
                
                observer.observe(targetSection);
            }
        }
    });
}

// Scroll spy for section highlighting
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -50% 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Back to top button
function initBackToTop() {
    // Create back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.setAttribute('aria-label', 'Вернуться наверх');
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 3rem;
        height: 3rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 99;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-lg);
    `;
    
    document.body.appendChild(backToTopButton);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
            backToTopButton.style.transform = 'translateY(0)';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
            backToTopButton.style.transform = 'translateY(20px)';
        }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Add hover effect
    backToTopButton.addEventListener('mouseenter', () => {
        backToTopButton.style.background = 'var(--primary-dark)';
        backToTopButton.style.transform = 'translateY(-4px)';
    });
    
    backToTopButton.addEventListener('mouseleave', () => {
        backToTopButton.style.background = 'var(--primary-color)';
        backToTopButton.style.transform = 'translateY(0)';
    });
}

// Page transition animation
function showPageTransition() {
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition';
    transitionOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--background-light);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        animation: fadeIn 0.3s ease forwards;
    `;
    
    // Add loading animation
    const loader = document.createElement('div');
    loader.className = 'transition-loader';
    loader.innerHTML = `
        <div class="spinner"></div>
        <p style="margin-top: 1rem; color: var(--text-secondary);">Загрузка...</p>
    `;
    
    transitionOverlay.appendChild(loader);
    document.body.appendChild(transitionOverlay);
    
    // Add spinner styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .transition-loader .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color);
            border-top-color: var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
}

// Handle browser back/forward navigation
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Page was restored from bfcache
        initNavigation();
        initActiveLinks();
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Page became visible again
        initActiveLinks();
    }
});

// Export navigation functions
window.navigationManager = {
    initNavigation,
    initActiveLinks,
    initScrollSpy,
    showPageTransition
};