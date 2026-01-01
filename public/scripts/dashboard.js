// Логика личного кабинета

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

function initDashboard() {
    // Проверяем авторизацию
    if (!window.auth || !window.auth.isAuthenticated()) {
        showError('Необходимо авторизоваться');
        setTimeout(() => {
            window.location.href = '/login?redirect=dashboard';
        }, 1500);
        return;
    }
    
    // Загружаем данные пользователя
    loadUserData();
    
    // Инициализируем UI
    initMobileMenu();
    initThemeToggle();
    loadDashboardData();
    initSearch();
}

function loadUserData() {
    const session = window.auth.getSession();
    if (!session) return;
    
    const user = userSystem.getCurrentUser(session.id);
    if (!user) return;
    
    // Обновляем данные на странице
    updateUserUI(user);
    
    // Сохраняем данные для быстрого доступа
    localStorage.setItem('current_user_data', JSON.stringify(user.toJSON()));
}

function updateUserUI(user) {
    // Аватары
    const avatars = document.querySelectorAll('.avatar, .mobile-avatar');
    avatars.forEach(avatar => {
        avatar.textContent = user.nickname.charAt(0).toUpperCase();
    });
    
    // Имена
    const nameElements = document.querySelectorAll('.profile-name, .profile-name-text');
    nameElements.forEach(el => {
        el.textContent = user.nickname;
    });
    
    // Email
    const emailElements = document.querySelectorAll('.profile-email');
    emailElements.forEach(el => {
        el.textContent = user.email;
    });
    
    // Роль
    const roleElements = document.querySelectorAll('#profileRole, .profile-role-student');
    roleElements.forEach(el => {
        if (el.id === 'profileRole') {
            el.value = user.role === 'student' ? 'Студент' : 
                       user.role === 'leader' ? 'Староста' : 'Администратор';
        } else {
            el.textContent = user.role === 'student' ? 'Студент' : 
                            user.role === 'leader' ? 'Староста' : 'Администратор';
        }
    });
    
    // Группа
    const groupElements = document.querySelectorAll('#profileGroup');
    groupElements.forEach(el => {
        el.value = user.group;
    });
}

function initMobileMenu() {
    const openBtn = document.getElementById('open-mobile-nav');
    const closeBtn = document.getElementById('close-mobile-nav');
    const mobileNav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');

    function openMenu() {
        mobileNav.classList.add('visible');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileNav.classList.remove('visible');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    openBtn?.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeMenu();
    });
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('.theme-icon');
    const isDark = document.documentElement.classList.contains('dark');

    if (icon) {
        icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    }

    themeToggle.addEventListener('click', function() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            if (icon) icon.textContent = 'dark_mode';
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            if (icon) icon.textContent = 'light_mode';
        }
    });
}

function loadDashboardData() {
    const user = getCurrentUserFromStorage();
    if (!user) return;

    // Обновляем приветствие
    updateGreeting(user);
    
    // Загружаем виджеты
    loadWidgetData();
}

function getCurrentUserFromStorage() {
    try {
        const data = localStorage.getItem('current_user_data');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function updateGreeting(user) {
    const greetingElements = document.querySelectorAll('.page-subtitle, .mobile-subtitle');
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 6) greeting = 'Доброй ночи';
    else if (hour < 12) greeting = 'Доброе утро';
    else if (hour < 18) greeting = 'Добрый день';
    else greeting = 'Добрый вечер';
    
    greetingElements.forEach(el => {
        if (el.textContent.includes('Добро пожаловать') || el.textContent.includes('Добро пожаловать')) {
            el.textContent = `${greeting}, ${user.nickname}! Вот ваша сводка на сегодня.`;
        }
    });
}

function loadWidgetData() {
    // Демо-данные
    const progressData = [
        { subject: 'Высшая математика', percent: 75, description: '3/4 модулей завершено' },
        { subject: 'Физика', percent: 40, description: '2/5 модулей завершено' },
        { subject: 'Программирование', percent: 90, description: '9/10 глав прочитано' }
    ];

    const classesData = [
        { 
            name: 'Физика', 
            teacher: 'Доц. Сергеев А.В.', 
            location: 'Аудитория 301, Главный корпус',
            start: '10:00', 
            end: '11:30',
            isNow: true 
        },
        { 
            name: 'Программирование', 
            teacher: 'Проф. Иванова Е.П.', 
            location: 'Онлайн - ссылка в портале',
            start: '13:00', 
            end: '14:30',
            isNow: false 
        }
    ];

    // Обновляем виджеты
    updateProgressWidget(progressData);
    updateClassesWidget(classesData);
    updateAttendanceWidget(95);
}

function updateProgressWidget(data) {
    const container = document.querySelector('.progress-list');
    if (!container) return;

    container.innerHTML = data.map(item => `
        <div class="progress-item">
            <div class="progress-header">
                <p class="progress-subject">${item.subject}</p>
                <p class="progress-percent">${item.percent}%</p>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${item.percent}%"></div>
            </div>
            <p class="progress-desc">${item.description}</p>
        </div>
    `).join('');
}

function updateClassesWidget(data) {
    const container = document.querySelector('.classes-list');
    if (!container) return;

    container.innerHTML = data.map(item => `
        <div class="class-item">
            <div class="class-time">
                <p class="time-start">${item.start}</p>
                <div class="time-line"></div>
                <p class="time-end">${item.end}</p>
            </div>
            <div class="class-info ${item.isNow ? 'primary' : ''}">
                <p class="class-name">${item.name}</p>
                <p class="class-teacher">${item.teacher}</p>
                <p class="class-location">${item.location}</p>
            </div>
        </div>
    `).join('');
}

function updateAttendanceWidget(percent) {
    const percentElement = document.querySelector('.attendance-percent');
    const svgElement = document.querySelector('.attendance-fill');
    
    if (percentElement) percentElement.textContent = percent + '%';
    if (svgElement) {
        const circumference = 2 * Math.PI * 16;
        const offset = circumference - (percent / 100) * circumference;
        svgElement.style.strokeDashoffset = offset;
    }
}

function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchIcon = document.querySelector('.search-icon');
    
    if (!searchInput || !searchIcon) return;
    
    searchIcon.addEventListener('click', () => searchInput.focus());
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch(this.value);
    });
}

function performSearch(query) {
    if (!query.trim()) return;
    
    console.log('Поиск:', query);
    showNotification(`Поиск: "${query}"`, 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="material-symbols-outlined">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

// Добавляем стили для анимаций
if (!document.querySelector('style[data-dashboard-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-dashboard-animations', 'true');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .notification { animation: slideIn 0.3s ease !important; }
        .progress-fill { transition: width 0.6s ease; }
    `;
    document.head.appendChild(style);
}