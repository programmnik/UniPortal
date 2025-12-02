// Theme toggle functionality

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeButton = document.getElementById('theme-toggle-button');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.checked = false;
    }
    
    // Theme toggle functionality
    if (themeToggle && themeButton) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                
                // Dispatch custom event for theme change
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { theme: 'dark' }
                }));
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { theme: 'light' }
                }));
            }
        });
        
        // Add keyboard support
        themeButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                themeToggle.click();
            }
        });
    }
    
    // Listen for theme changes from other components
    window.addEventListener('themeChanged', function(e) {
        console.log('Theme changed to:', e.detail.theme);
        
        // Update any theme-dependent elements here
        updateThemeDependentElements(e.detail.theme);
    });
    
    // Initialize theme-dependent elements
    updateThemeDependentElements(savedTheme);
});

// Update elements that depend on theme
function updateThemeDependentElements(theme) {
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', 
            theme === 'dark' ? '#0f172a' : '#f8fafc'
        );
    }
    
    // Update images based on theme
    const themeImages = document.querySelectorAll('[data-theme-image]');
    themeImages.forEach(img => {
        const lightSrc = img.getAttribute('data-light-src');
        const darkSrc = img.getAttribute('data-dark-src');
        
        if (theme === 'dark' && darkSrc) {
            img.src = darkSrc;
        } else if (lightSrc) {
            img.src = lightSrc;
        }
    });
    
    // Update SVG fills if needed
    const svgElements = document.querySelectorAll('[data-theme-fill]');
    svgElements.forEach(svg => {
        const lightFill = svg.getAttribute('data-light-fill');
        const darkFill = svg.getAttribute('data-dark-fill');
        
        if (theme === 'dark' && darkFill) {
            svg.style.fill = darkFill;
        } else if (lightFill) {
            svg.style.fill = lightFill;
        }
    });
}

// Function to toggle theme programmatically
function toggleTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.click();
    }
}

// Function to set specific theme
function setTheme(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        if (theme === 'dark' && !themeToggle.checked) {
            themeToggle.checked = true;
            themeToggle.dispatchEvent(new Event('change'));
        } else if (theme === 'light' && themeToggle.checked) {
            themeToggle.checked = false;
            themeToggle.dispatchEvent(new Event('change'));
        }
    }
}

// Detect system preference
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Listen for system theme changes
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Export functions for use in other modules
window.themeManager = {
    toggleTheme,
    setTheme,
    detectSystemTheme
};