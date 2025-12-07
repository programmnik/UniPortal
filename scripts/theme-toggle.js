// Theme toggle functionality

document.addEventListener('DOMContentLoaded', function() {
    const themeButton = document.getElementById('theme-toggle-button');
    const themeIcon = themeButton.querySelector('.theme-icon');
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Применяем сохраненную тему
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        updateThemeIcon('dark', themeIcon);
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        updateThemeIcon('light', themeIcon);
    }
    
    // Обработчик клика по кнопке переключения темы
    if (themeButton) {
        themeButton.addEventListener('click', function() {
            const isDarkTheme = document.body.classList.contains('dark-theme');
            
            if (isDarkTheme) {
                // Переключаем на светлую тему
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
                updateThemeIcon('light', themeIcon);
                
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { theme: 'light' }
                }));
            } else {
                // Переключаем на темную тему
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                updateThemeIcon('dark', themeIcon);
                
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { theme: 'dark' }
                }));
            }
        });
        
        // Добавляем поддержку клавиатуры
        themeButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                themeButton.click();
            }
        });
    }
    
    // Слушаем изменения темы от других компонентов
    window.addEventListener('themeChanged', function(e) {
        console.log('Theme changed to:', e.detail.theme);
        
        // Обновляем элементы, зависящие от темы
        updateThemeDependentElements(e.detail.theme);
    });
    
    // Инициализируем элементы, зависящие от темы
    updateThemeDependentElements(savedTheme);
});

// Обновляет иконку темы
function updateThemeIcon(theme, iconElement) {
    if (!iconElement) return;
    
    if (theme === 'dark') {
        iconElement.textContent = 'dark_mode'; // Иконка для переключения на светлую тему
    } else {
        iconElement.textContent = 'light_mode'; // Иконка для переключения на темную тему
    }
}

// Обновляет элементы, зависящие от темы
function updateThemeDependentElements(theme) {
    // Обновляем meta theme-color для мобильных браузеров
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
        // Создаем meta тег, если его нет
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = theme === 'dark' ? '#0f172a' : '#f8fafc';
        document.head.appendChild(meta);
    } else {
        metaThemeColor.setAttribute('content', 
            theme === 'dark' ? '#0f172a' : '#f8fafc'
        );
    }
    
    // Обновляем изображения в зависимости от темы
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
    
    // Обновляем SVG заливку, если нужно
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

// Функция для переключения темы программно
function toggleTheme() {
    const themeButton = document.getElementById('theme-toggle-button');
    if (themeButton) {
        themeButton.click();
    }
}

// Функция для установки конкретной темы
function setTheme(theme) {
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (theme === 'dark' && currentTheme !== 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        
        const themeButton = document.getElementById('theme-toggle-button');
        const themeIcon = themeButton?.querySelector('.theme-icon');
        updateThemeIcon('dark', themeIcon);
        
        updateThemeDependentElements('dark');
        
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: 'dark' }
        }));
    } else if (theme === 'light' && currentTheme !== 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
        
        const themeButton = document.getElementById('theme-toggle-button');
        const themeIcon = themeButton?.querySelector('.theme-icon');
        updateThemeIcon('light', themeIcon);
        
        updateThemeDependentElements('light');
        
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: 'light' }
        }));
    }
}

// Определяем системные настройки темы
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Слушаем изменения системной темы
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
        // Автоматически переключаемся только если пользователь не установил предпочтение вручную
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

// Инициализация при загрузке - если пользователь не выбрал тему, используем системную
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('theme')) {
        const systemTheme = detectSystemTheme();
        setTheme(systemTheme);
    }
});

// Экспортируем функции для использования в других модулях
window.themeManager = {
    toggleTheme,
    setTheme,
    detectSystemTheme
};