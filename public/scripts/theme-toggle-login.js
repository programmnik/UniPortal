// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggleInput = document.getElementById('theme-toggle');
    const themeButton = document.getElementById('theme-toggle-button');
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Применяем сохраненную тему
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        if (themeToggleInput) {
            themeToggleInput.checked = true; // Переключатель в положение "темная тема"
        }
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        if (themeToggleInput) {
            themeToggleInput.checked = false; // Переключатель в положение "светлая тема"
        }
    }
    
    // Обработчик клика по кнопке переключения темы
    if (themeButton) {
        themeButton.addEventListener('click', function(e) {
            // Предотвращаем стандартное поведение
            e.preventDefault();
            
            // Получаем текущее состояние переключателя
            const isDarkTheme = document.body.classList.contains('dark-theme');
            
            if (isDarkTheme) {
                // Переключаем на светлую тему
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
                if (themeToggleInput) {
                    themeToggleInput.checked = false;
                }
            } else {
                // Переключаем на темную тему
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                if (themeToggleInput) {
                    themeToggleInput.checked = true;
                }
            }
            
            // Обновляем meta theme-color для мобильных браузеров
            updateMetaThemeColor();
            
            // Отправляем событие о смене темы
            window.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { 
                    theme: isDarkTheme ? 'light' : 'dark'
                }
            }));
        });
        
        // Добавляем поддержку клавиатуры
        themeButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                themeButton.click();
            }
        });
    }
    
    // Обработчик изменения input checkbox (на всякий случай)
    if (themeToggleInput) {
        themeToggleInput.addEventListener('change', function() {
            const isChecked = this.checked;
            
            if (isChecked) {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
            }
            
            updateMetaThemeColor();
            
            window.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: isChecked ? 'dark' : 'light' }
            }));
        });
    }
    
    // Функция для обновления meta theme-color
    function updateMetaThemeColor() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (metaThemeColor) {
            metaThemeColor.content = isDarkTheme ? '#0f172a' : '#f8fafc';
        }
    }
    
    // Инициализация meta theme-color
    updateMetaThemeColor();
    
    // Слушаем изменения темы от других компонентов
    window.addEventListener('themeChanged', function(e) {
        console.log('Theme changed to:', e.detail.theme);
    });
});

// Функция для переключения темы программно
function toggleTheme() {
    const themeButton = document.getElementById('theme-toggle-button');
    if (themeButton) {
        themeButton.click();
    }
}

// Функция для установки конкретной темы
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        
        const themeToggleInput = document.getElementById('theme-toggle');
        if (themeToggleInput) {
            themeToggleInput.checked = true;
        }
    } else if (theme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
        
        const themeToggleInput = document.getElementById('theme-toggle');
        if (themeToggleInput) {
            themeToggleInput.checked = false;
        }
    }
    
    // Обновляем meta theme-color
    const isDarkTheme = theme === 'dark';
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.content = isDarkTheme ? '#0f172a' : '#f8fafc';
    }
    
    window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: theme }
    }));
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