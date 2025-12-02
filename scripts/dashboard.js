// Dashboard Module - UniPortal
class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        // Инициализация всех компонентов
        this.initMobileMenu();
        this.initThemeToggle();
        this.initActiveNav();
        this.initNotifications();
        this.initWidgetInteractions();
        this.loadUserData();
    }

    // Мобильное меню
    initMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
        const openMobileNavBtn = document.getElementById('open-mobile-nav');
        const closeMobileNavBtn = document.getElementById('close-mobile-nav');

        // Открыть меню
        openMobileNavBtn.addEventListener('click', () => {
            this.openMobileMenu(mobileNav, mobileNavOverlay);
        });

        // Закрыть меню
        closeMobileNavBtn.addEventListener('click', () => {
            this.closeMobileMenu(mobileNav, mobileNavOverlay);
        });

        // Закрыть по клику на оверлей
        mobileNavOverlay.addEventListener('click', () => {
            this.closeMobileMenu(mobileNav, mobileNavOverlay);
        });

        // Закрыть по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu(mobileNav, mobileNavOverlay);
            }
        });

        // Закрыть при клике на ссылку в мобильном меню
        document.querySelectorAll('#mobile-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu(mobileNav, mobileNavOverlay);
            });
        });
    }

    openMobileMenu(nav, overlay) {
        nav.classList.add('visible');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu(nav, overlay) {
        nav.classList.remove('visible');
        overlay.classList.remove('visible');
        document.body.style.overflow = 'auto';
    }

    // Переключение темы
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');

        // Проверка сохраненной темы
        const savedTheme = localStorage.getItem('uniportal-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            themeIcon.textContent = 'light_mode';
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            themeIcon.textContent = 'dark_mode';
        }

        // Обработчик переключения
        themeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                // Переключаем на светлую
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                localStorage.setItem('uniportal-theme', 'light');
                themeIcon.textContent = 'dark_mode';
            } else {
                // Переключаем на темную
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                localStorage.setItem('uniportal-theme', 'dark');
                themeIcon.textContent = 'light_mode';
            }
        });
    }

    // Активная навигация
    initActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        
        // Найти все ссылки в навигации
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            // Удалить активный класс
            link.classList.remove('active');
            
            // Проверить, соответствует ли ссылка текущей странице
            const linkHref = link.getAttribute('href');
            if (this.isCurrentPage(linkHref, currentPage)) {
                link.classList.add('active');
            }
            
            // Добавить обработчик для превью (если страница не существует)
            link.addEventListener('click', (e) => {
                if (!this.pageExists(linkHref)) {
                    e.preventDefault();
                    this.showPagePreview(linkHref);
                }
            });
        });
    }

    isCurrentPage(linkHref, currentPage) {
        // Специальные случаи
        if (currentPage === '' && linkHref === 'dashboard.html') return true;
        if (currentPage === 'index.html' && linkHref === 'dashboard.html') return true;
        
        // Обычное сравнение
        return linkHref === currentPage;
    }

    pageExists(page) {
        // В реальном приложении здесь была бы проверка на существование файла
        // Пока что симулируем существующие страницы
        const existingPages = [
            'dashboard.html',
            'materials.html',
            'calendar.html',
            'schedule.html',
            'chat.html',
            'journal.html',
            'information.html',
            'profile.html'
        ];
        
        return existingPages.includes(page);
    }

    // Уведомления
    initNotifications() {
        const notificationBtn = document.querySelector('.notification-btn');
        
        notificationBtn.addEventListener('click', () => {
            this.showNotifications();
        });
        
        // Симулируем получение новых уведомлений
        this.simulateNewNotifications();
    }

    showNotifications() {
        const notifications = [
            {
                id: 1,
                title: 'Новый материал по физике',
                message: 'Добавлена новая лекция по теме "Квантовая механика"',
                time: '10 минут назад',
                read: false
            },
            {
                id: 2,
                title: 'Сообщение от старосты',
                message: 'Завтра собрание группы в 14:00 в аудитории 301',
                time: '1 час назад',
                read: false
            },
            {
                id: 3,
                title: 'Изменение в расписании',
                message: 'Занятие по математике перенесено на 11:00',
                time: '2 часа назад',
                read: true
            }
        ];
        
        // В реальном приложении здесь было бы модальное окно
        // Показываем простой alert
        let message = 'У вас 3 уведомления:\n\n';
        notifications.forEach(notif => {
            message += `• ${notif.title}\n  ${notif.message}\n  ${notif.time}\n\n`;
        });
        
        alert(message);
    }

    simulateNewNotifications() {
        // В реальном приложении здесь была бы интеграция с сервером
        // Сейчас просто обновляем бейдж каждые 30 секунд
        setInterval(() => {
            const badge = document.querySelector('.notification-badge');
            if (Math.random() > 0.7) { // 30% шанс нового уведомления
                badge.style.display = 'flex';
            }
        }, 30000);
    }

    // Взаимодействия с виджетами
    initWidgetInteractions() {
        // Клик по сообщению
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => {
                this.openMessage(item);
            });
        });
        
        // Клик по занятию
        document.querySelectorAll('.class-info').forEach(item => {
            item.addEventListener('click', () => {
                this.showClassDetails(item);
            });
        });
        
        // Обновление прогресса
        this.updateProgressBars();
    }

    openMessage(messageElement) {
        const sender = messageElement.querySelector('.message-sender').textContent;
        const title = messageElement.querySelector('.message-title').textContent;
        
        alert(`Открыто сообщение от ${sender}:\n\nТема: ${title}\n\nЭта функция будет реализована в полной версии чата.`);
    }

    showClassDetails(classElement) {
        const className = classElement.querySelector('.class-name').textContent;
        const teacher = classElement.querySelector('.class-teacher').textContent;
        const location = classElement.querySelector('.class-location').textContent;
        
        alert(`Занятие: ${className}\nПреподаватель: ${teacher}\nМесто: ${location}\n\nЭта функция будет реализована в полной версии расписания.`);
    }

    updateProgressBars() {
        // Анимация заполнения прогресс-баров
        const progressBars = document.querySelectorAll('.progress-fill');
        
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.transition = 'width 1s ease-in-out';
                bar.style.width = width;
            }, 100);
        });
    }

    // Загрузка данных пользователя
    async loadUserData() {
        try {
            // В реальном приложении здесь был бы запрос к API
            const userData = {
                name: 'Алексей Иванов',
                email: 'студент@университет.ru',
                group: 'ИТ-201',
                role: 'Студент',
                avatar: 'А',
                attendance: 95,
                progress: [
                    { subject: 'Высшая математика', percent: 75, modules: '3/4' },
                    { subject: 'Физика', percent: 40, modules: '2/5' },
                    { subject: 'Программирование', percent: 90, modules: '9/10' }
                ],
                messages: [
                    { sender: 'Ирина Петрова', title: 'Обновление по проекту', time: '1 час назад' },
                    { sender: 'Группа по физике', title: 'Встреча завтра', time: '3 часа назад' }
                ],
                schedule: [
                    { name: 'Физика', teacher: 'Доц. Сергеев А.В.', time: '10:00-11:30', location: 'Аудитория 301' },
                    { name: 'Программирование', teacher: 'Проф. Иванова Е.П.', time: '13:00-14:30', location: 'Онлайн' }
                ]
            };
            
            this.updateUI(userData);
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.showError('Не удалось загрузить данные. Пожалуйста, проверьте соединение.');
        }
    }

    updateUI(data) {
        // Обновляем имя пользователя
        document.querySelectorAll('.profile-name').forEach(el => {
            el.textContent = data.name;
        });
        
        document.querySelector('.profile-name-text').textContent = data.name.split(' ')[0];
        
        // Обновляем email
        document.querySelectorAll('.profile-email').forEach(el => {
            el.textContent = data.email;
        });
        
        // Обновляем прогресс
        const progressItems = document.querySelectorAll('.progress-item');
        progressItems.forEach((item, index) => {
            if (data.progress[index]) {
                const progress = data.progress[index];
                item.querySelector('.progress-subject').textContent = progress.subject;
                item.querySelector('.progress-percent').textContent = `${progress.percent}%`;
                item.querySelector('.progress-fill').style.width = `${progress.percent}%`;
                item.querySelector('.progress-desc').textContent = `${progress.modules} модулей завершено`;
            }
        });
        
        // Обновляем сообщения
        const messageItems = document.querySelectorAll('.message-item');
        messageItems.forEach((item, index) => {
            if (data.messages[index]) {
                const message = data.messages[index];
                item.querySelector('.message-sender').textContent = message.sender;
                item.querySelector('.message-title').textContent = message.title;
                item.querySelector('.message-time').textContent = message.time;
                item.querySelector('.message-avatar').textContent = message.sender.charAt(0);
            }
        });
        
        // Обновляем расписание
        const classItems = document.querySelectorAll('.class-item');
        classItems.forEach((item, index) => {
            if (data.schedule[index]) {
                const classData = data.schedule[index];
                const [start, end] = classData.time.split('-');
                
                item.querySelector('.time-start').textContent = start;
                item.querySelector('.time-end').textContent = end;
                item.querySelector('.class-name').textContent = classData.name;
                item.querySelector('.class-teacher').textContent = classData.teacher;
                item.querySelector('.class-location').textContent = classData.location;
            }
        });
        
        // Обновляем посещаемость
        document.querySelector('.attendance-percent').textContent = `${data.attendance}%`;
        const attendanceCircle = document.querySelector('.attendance-fill');
        const offset = 100 - data.attendance;
        attendanceCircle.style.strokeDashoffset = offset;
    }

    // Вспомогательные методы
    showPagePreview(pageName) {
        const pageTitles = {
            'materials.html': 'Учебные материалы',
            'calendar.html': 'Календарь событий',
            'schedule.html': 'Расписание занятий',
            'chat.html': 'Академический чат',
            'journal.html': 'Электронный журнал',
            'information.html': 'Информация о платформе',
            'profile.html': 'Профиль пользователя'
        };
        
        const title = pageTitles[pageName] || pageName;
        alert(`Страница "${title}" находится в разработке.\n\nЭта функция будет доступна в следующем обновлении.`);
    }

    showError(message) {
        // В реальном приложении здесь было бы красивое уведомление
        console.error(message);
        
        // Просто показываем в консоли для разработки
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Метод для обновления данных в реальном времени
    startLiveUpdates() {
        // Обновляем данные каждые 5 минут
        setInterval(() => {
            this.loadUserData();
        }, 5 * 60 * 1000);
        
        // Обновляем время в уведомлениях
        setInterval(() => {
            this.updateMessageTimes();
        }, 60 * 1000);
    }

    updateMessageTimes() {
        const timeElements = document.querySelectorAll('.message-time');
        
        timeElements.forEach(element => {
            const currentText = element.textContent;
            const updatedText = this.getUpdatedTime(currentText);
            if (updatedText !== currentText) {
                element.textContent = updatedText;
            }
        });
    }

    getUpdatedTime(timeText) {
        // Простая логика обновления времени
        if (timeText.includes('только что')) {
            return '1 минуту назад';
        } else if (timeText.includes('минут')) {
            const minutes = parseInt(timeText);
            if (minutes < 59) {
                return `${minutes + 1} минут назад`;
            } else {
                return '1 час назад';
            }
        } else if (timeText.includes('час')) {
            const hours = parseInt(timeText);
            if (hours < 23) {
                return `${hours + 1} часов назад`;
            } else {
                return 'вчера';
            }
        }
        
        return timeText;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    
    // Запускаем обновления в реальном времени
    dashboard.startLiveUpdates();
    
    // Экспортируем для глобального доступа (если нужно)
    window.Dashboard = dashboard;
});

// Автоматическое скрытие меню при изменении размера окна
window.addEventListener('resize', () => {
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    
    if (window.innerWidth >= 768) {
        mobileNav.classList.remove('visible');
        mobileNavOverlay.classList.remove('visible');
        document.body.style.overflow = 'auto';
    }
});