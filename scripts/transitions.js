// Page transitions and theme consistency
class PageTransitions {
    constructor() {
        this.initTheme();
        this.initNavigation();
        this.initPageLoad();
    }
    
    initTheme() {
        // Устанавливаем тему ДО загрузки страницы
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        // Применяем тему к html элементу сразу
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
        
        // Инициализируем переключатель темы
        this.initThemeToggle();
    }
    
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        // Устанавливаем начальное состояние
        const savedTheme = localStorage.getItem('theme') || 'light';
        themeToggle.checked = savedTheme === 'dark';
        
        themeToggle.addEventListener('change', function() {
            PageLoader.show();
            
            setTimeout(() => {
                if (this.checked) {
                    document.documentElement.classList.add('dark-theme');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark-theme');
                    localStorage.setItem('theme', 'light');
                }
                
                PageLoader.hide();
            }, 300);
        });
    }
    
    initNavigation() {
        // Перехватываем клики по ссылкам для плавных переходов
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // Проверяем, что это внутренняя ссылка
            if (href && (href.startsWith('#') || href.includes('javascript:'))) return;
            if (href && (href.startsWith('mailto:') || href.startsWith('tel:'))) return;
            
            // Исключаем ссылки, которые открываются в новой вкладке
            if (link.target === '_blank') return;
            
            // Проверяем, что это не тот же самый URL
            const currentPath = window.location.pathname;
            if (href === currentPath) return;
            
            // Показываем прелоадер для переходов между страницами
            if (href && (href.endsWith('.html') || href === '/')) {
                e.preventDefault();
                
                PageLoader.show();
                
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
        
        // Обработка формы
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                // Прелоадер показывается в auth.js
            }
        });
    }
    
    initPageLoad() {
        // Показываем прелоадер при загрузке страницы
        window.addEventListener('load', () => {
            setTimeout(() => {
                PageLoader.hide();
                
                // Добавляем анимацию появления контента
                const mainContent = document.querySelector('main, .auth-container, .dashboard');
                if (mainContent) {
                    mainContent.classList.add('fade-in');
                }
            }, 500);
        });
        
        // Показываем прелоадер при уходе со страницы
        window.addEventListener('beforeunload', () => {
            PageLoader.show();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PageTransitions();
    
    // Показываем прелоадер на короткое время при загрузке
    PageLoader.show();
    
    // Скрываем прелоадер через 0.5с если страница уже загружена
    if (document.readyState === 'complete') {
        setTimeout(() => PageLoader.hide(), 500);
    }
});