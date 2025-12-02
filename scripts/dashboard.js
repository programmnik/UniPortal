// Инициализация личного кабинета
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return;
    }

    // Загружаем данные пользователя
    loadUserData();
    
    // Инициализируем взаимодействия
    setupInteractions();
    
    // Инициализируем выпадающее меню
    initProfileDropdown();
    
    // Инициализируем модальное окно
    initHeadmanModal();
});

// Проверка авторизации
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return isLoggedIn && currentUser.email;
}

// Загрузка данных пользователя
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Заполняем данные пользователя
    if (userData.username) {
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('welcomeName').textContent = userData.username;
        document.getElementById('dropdownUserName').textContent = userData.username;
    }
    
    if (userData.group) {
        document.getElementById('dropdownUserGroup').textContent = `Группа ${userData.group}`;
    }
}

// Выпадающее меню профиля
function initProfileDropdown() {
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (!profileTrigger || !profileDropdown) return;
    
    // Открытие/закрытие выпадающего меню
    profileTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });
    
    // Закрытие при клике вне меню
    document.addEventListener('click', function() {
        profileDropdown.classList.remove('show');
    });
    
    // Предотвращаем закрытие при клике внутри меню
    profileDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Модальное окно для кода старосты
function initHeadmanModal() {
    const headmanBtn = document.getElementById('headmanCodeBtn');
    const modalOverlay = document.getElementById('headmanModal');
    const cancelBtn = document.getElementById('cancelHeadmanBtn');
    const submitBtn = document.getElementById('submitHeadmanBtn');
    const codeInput = document.getElementById('headmanCodeInput');
    
    if (!headmanBtn || !modalOverlay) return;
    
    // Открытие модального окна
    headmanBtn.addEventListener('click', function() {
        modalOverlay.style.display = 'flex';
        setTimeout(() => modalOverlay.classList.add('show'), 10);
        codeInput.focus();
    });
    
    // Закрытие модального окна
    function closeModal() {
        modalOverlay.classList.remove('show');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            codeInput.value = '';
        }, 300);
    }
    
    cancelBtn.addEventListener('click', closeModal);
    
    // Подтверждение кода
    submitBtn.addEventListener('click', function() {
        const code = codeInput.value.trim();
        if (code) {
            // Здесь будет логика проверки кода
            console.log('Проверка кода старосты:', code);
            showNotification('Код отправлен на проверку!', 'success');
            closeModal();
        } else {
            codeInput.focus();
            showNotification('Введите код', 'error');
        }
    });
    
    // Закрытие по клику на оверлей
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
            closeModal();
        }
    });
}

// Настройка взаимодействий
function setupInteractions() {
    // Выход из системы
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }
    
    // Сообщить об отсутствии
    const reportBtn = document.getElementById('reportAbsenceBtn');
    if (reportBtn) {
        reportBtn.addEventListener('click', function() {
            window.location.href = 'journal.html#report';
        });
    }
    
    // Клики по элементам для навигации
    setupNavigationClicks();
    
    // Бургер меню
    setupBurgerMenu();
}

// Навигация по кликам
function setupNavigationClicks() {
    // Сообщения → Чат
    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = 'chat.html';
        });
    });
    
    // Материалы → Материалы
    document.querySelectorAll('.material-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = 'materials.html';
        });
    });
    
    // Дедлайны → Календарь
    document.querySelectorAll('.deadline-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = 'calendar.html';
        });
    });
    
    // Расписание → Расписание
    document.querySelectorAll('.schedule-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = 'schedule.html';
        });
    });
}

// Бургер меню
function setupBurgerMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.querySelector('.nav');
    
    if (!navToggle || !nav) return;
    
    // Закрытие меню при клике на ссылку
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navToggle.checked = false;
        });
    });
    
    // Закрытие меню при ресайзе
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navToggle.checked = false;
        }
    });
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        border-left: 4px solid ${getNotificationColor(type)};
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

// Обновление данных (заглушка)
function refreshDashboard() {
    console.log('Обновление данных dashboard...');
    // Здесь будет логика обновления данных
}

// Инициализация личного кабинета
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return;
    }

    // Загружаем данные пользователя
    loadUserData();
    
    // Инициализируем взаимодействия
    setupInteractions();
    
    // Инициализируем выпадающее меню
    initProfileDropdown();
    
    // Инициализируем бургер меню
    initBurgerMenu();
});

// Проверка авторизации
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return isLoggedIn && currentUser.email;
}

// Загрузка данных пользователя
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Заполняем данные пользователя
    if (userData.username) {
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('welcomeName').textContent = userData.username;
        document.getElementById('userNameDisplay').textContent = userData.username;
    }
    
    if (userData.group) {
        document.getElementById('userGroupDisplay').textContent = `Группа ${userData.group}`;
    }
}

// Выпадающее меню профиля
function initProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!profileBtn || !profileDropdown) return;
    
    // Открытие/закрытие выпадающего меню
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });
    
    // Закрытие при клике вне меню
    document.addEventListener('click', function() {
        profileDropdown.classList.remove('show');
    });
    
    // Предотвращаем закрытие при клике внутри меню
    profileDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Выход из системы
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }
}

// Бургер меню
function initBurgerMenu() {
    const burgerMenu = document.getElementById('burgerMenu');
    const nav = document.getElementById('mainNav');
    
    if (!burgerMenu || !nav) return;
    
    burgerMenu.addEventListener('click', function() {
        nav.classList.toggle('active');
        burgerMenu.classList.toggle('active');
    });
    
    // Закрытие меню при клике на ссылку
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            burgerMenu.classList.remove('active');
        });
    });
    
    // Закрытие меню при ресайзе
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
            burgerMenu.classList.remove('active');
        }
    });
}

// Настройка взаимодействий
function setupInteractions() {
    // Сообщить об отсутствии
    const reportBtn = document.getElementById('reportAbsenceBtn');
    if (reportBtn) {
        reportBtn.addEventListener('click', function() {
            window.location.href = 'journal.html#report';
        });
    }
    
    // Клики по элементам для навигации
    setupNavigationClicks();
}

// Навигация по кликам
function setupNavigationClicks() {
    // Сообщения → Чат
    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = 'chat.html';
        });
    });
    
    // Материалы → Материалы
    document.querySelectorAll('.material-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = 'materials.html';
        });
    });
    
    // Дедлайны → Календарь
    document.querySelectorAll('.deadline-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = 'calendar.html';
        });
    });
    
    // Расписание → Расписание
    document.querySelectorAll('.schedule-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = 'schedule.html';
        });
    });
}

// scripts/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Элементы шапки
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const burgerMenu = document.getElementById('burgerMenu');
    const mainNav = document.getElementById('mainNav');
    const logoutBtn = document.getElementById('logoutBtn');

    // Переключение выпадающего меню профиля
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // Бургер меню для мобильных устройств
    if (burgerMenu && mainNav) {
        burgerMenu.addEventListener('click', function() {
            burgerMenu.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            // Закрываем меню профиля при открытии бургер-меню
            if (profileDropdown) {
                profileDropdown.classList.remove('show');
            }
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (!burgerMenu.contains(e.target) && !mainNav.contains(e.target)) {
                burgerMenu.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    }

    // Выход из системы
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                // Здесь будет логика выхода
                window.location.href = 'index.html';
            }
        });
    }

    // Заполнение данных пользователя
    const userData = {
        name: 'Иван Петров',
        shortName: 'Иван',
        group: 'Группа ИВТ-101',
        shortGroup: 'ИВТ-101'
    };

    // Обновляем все элементы с данными пользователя
    document.querySelectorAll('[id*="userNameDisplay"]').forEach(el => {
        if (el.id.includes('Large')) {
            el.textContent = userData.name;
        } else {
            el.textContent = userData.shortName;
        }
    });

    document.querySelectorAll('[id*="userGroupDisplay"]').forEach(el => {
        if (el.id.includes('Large')) {
            el.textContent = userData.group;
        } else {
            el.textContent = userData.shortGroup;
        }
    });

    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName) welcomeName.textContent = userData.shortName;
});