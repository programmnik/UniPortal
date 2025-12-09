// Slideshow functionality - ENABLED manual navigation only
class Slideshow {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.slide-nav.prev');
        this.nextBtn = document.querySelector('.slide-nav.next');
        this.currentSlide = 0;
        
        this.init();
    }
    
    init() {
        this.showSlide(this.currentSlide);
        this.setupEventListeners();
        this.initSocialGlass();
    }
    
    showSlide(index) {
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
        });
        
        // Remove active from dots
        this.dots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide
        this.slides[index].classList.add('active');
        this.slides[index].style.opacity = '1';
        this.slides[index].style.visibility = 'visible';
        
        // Update dot
        this.dots[index].classList.add('active');
        
        this.currentSlide = index;
        
        // Update slide background based on theme
        this.updateSlideTheme();
    }
    
    updateSlideTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        const overlays = document.querySelectorAll('.slide-overlay');
        
        overlays.forEach(overlay => {
            if (overlay) {
                if (isDark) {
                    overlay.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.4) 100%)';
                } else {
                    overlay.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.3) 100%)';
                }
            }
        });
    }
    
    nextSlide() {
        let nextIndex = this.currentSlide + 1;
        if (nextIndex >= this.slides.length) {
            nextIndex = 0;
        }
        this.showSlide(nextIndex);
    }
    
    prevSlide() {
        let prevIndex = this.currentSlide - 1;
        if (prevIndex < 0) {
            prevIndex = this.slides.length - 1;
        }
        this.showSlide(prevIndex);
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.showSlide(index);
        }
    }
    
    setupEventListeners() {
        // Dots - ВКЛЮЧАЕМ клики
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
        
        // Buttons - ВКЛЮЧАЕМ клики
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }
        
        // Keyboard - ВКЛЮЧАЕМ управление
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            }
        });
        
        // Swipe - ВКЛЮЧАЕМ для мобильных
        let touchStartX = 0;
        let touchEndX = 0;
        
        const container = document.querySelector('.slideshow-container');
        if (container) {
            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }
        
        // Listen for theme changes
        document.addEventListener('themeChanged', () => {
            this.updateSlideTheme();
        });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
    
    initSocialGlass() {
        const socialContainer = document.querySelector('.social-container-uiverse');
        if (socialContainer) {
            const socialGlasses = socialContainer.querySelectorAll('.social-glass');
            
            socialContainer.addEventListener('mouseenter', () => {
                socialGlasses.forEach(glass => {
                    glass.style.transition = 'transform 0.5s ease, margin 0.5s ease';
                });
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const slideshow = new Slideshow();
    
    // Make available globally for debugging
    window.slideshow = slideshow;
});