// Добавим в начало auth.js после констант
class PageLoader {
    static show() {
        let loader = document.getElementById('pageLoader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'pageLoader';
            loader.className = 'page-loader';
            loader.innerHTML = `
                <div class="page-loader-content">
                    <div class="uni-loader-logo">
                        <div class="logo">
                            <div class="logo-icon">
                                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="#136dec"></path>
                                </svg>
                            </div>
                            <span class="logo-text">UniPortal</span>
                        </div>
                    </div>
                    <div class="uni-loader">
                        <span class="uni-loader-text">loading</span>
                        <span class="uni-loader-dot"></span>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        
        loader.classList.remove('hidden');
    }
    
    static hide() {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.classList.add('hidden');
            
            setTimeout(() => {
                if (loader && loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 500);
        }
    }
}

// УПРОЩЁННАЯ СИСТЕМА АВТОРИЗАЦИИ ДЛЯ ТЕСТИРОВАНИЯ

// Демо пользователи (простая версия)
const DEMO_USERS = {
    'student@uniportal.ru': {
        password: 'student123',
        nickname: 'ИванСтудент',
        role: 'student',
        group: 'ИСП-21-1',
        userId: 'stu_001'
    },
    'leader@uniportal.ru': {
        password: 'leader123',
        nickname: 'АннаСтароста',
        role: 'leader',
        group: 'ИСП-21-1',
        userId: 'ldr_001'
    },
    'admin@uniportal.ru': {
        password: 'admin123',
        nickname: 'АдминСистемы',
        role: 'admin',
        group: 'Администрация',
        userId: 'adm_001'
    }
};

// Простая сессия
class AuthSession {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        const sessionData = localStorage.getItem('uni_session');
        if (sessionData) {
            try {
                const data = JSON.parse(sessionData);
                // Проверяем, не истекла ли сессия (24 часа)
                if (data.created && Date.now() - data.created < 24 * 60 * 60 * 1000) {
                    this.currentUser = data.user;
                } else {
                    this.clearSession();
                }
            } catch (e) {
                this.clearSession();
            }
        }
    }

    createSession(user) {
        const sessionData = {
            user: {
                email: user.email,
                nickname: user.nickname,
                role: user.role,
                group: user.group,
                userId: user.userId
            },
            created: Date.now()
        };
        
        localStorage.setItem('uni_session', JSON.stringify(sessionData));
        this.currentUser = sessionData.user;
        
        return sessionData;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    clearSession() {
        this.currentUser = null;
        localStorage.removeItem('uni_session');
    }

    hasRole(requiredRole) {
        if (!this.currentUser) return false;
        return this.currentUser.role === requiredRole;
    }

    isInGroup(groupName) {
        if (!this.currentUser) return false;
        return this.currentUser.group === groupName;
    }
}

// Глобальная сессия
const authSession = new AuthSession();

// ПРОСТАЯ ФУНКЦИЯ ВХОДА
async function authenticateUser(email, password) {
    // Имитация задержки сервера
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Простая проверка - ищем пользователя по email
    const user = DEMO_USERS[email.toLowerCase()];
    
    if (!user) {
        throw new Error('Пользователь не найден');
    }
    
    // Проверяем пароль (простое сравнение)
    if (user.password !== password) {
        throw new Error('Неверный пароль');
    }
    
    // Создаём сессию
    const sessionUser = {
        email: email.toLowerCase(),
        nickname: user.nickname,
        role: user.role,
        group: user.group,
        userId: user.userId
    };
    
    return authSession.createSession(sessionUser);
}

// ПРОСТАЯ ФУНКЦИЯ РЕГИСТРАЦИИ (только для демо)
async function registerUser(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Проверяем код приглашения
    const validCodes = ['STUDENT2024', 'LEADER2024', 'ADMIN2024'];
    if (!validCodes.includes(userData.inviteCode)) {
        throw new Error('Неверный пригласительный код');
    }
    
    // Простая проверка email
    if (!userData.email || !userData.email.includes('@')) {
        throw new Error('Введите корректный email');
    }
    
    // Проверяем, существует ли уже пользователь
    if (DEMO_USERS[userData.email.toLowerCase()]) {
        throw new Error('Пользователь с таким email уже существует');
    }
    
    // В демо-режиме создаём временную сессию
    const userId = 'usr_' + Date.now().toString(36);
    
    const sessionUser = {
        email: userData.email.toLowerCase(),
        nickname: userData.nickname,
        role: userData.inviteCode === 'STUDENT2024' ? 'student' : 
              userData.inviteCode === 'LEADER2024' ? 'leader' : 'admin',
        group: userData.inviteCode === 'ADMIN2024' ? 'Администрация' : 'ИСП-21-1',
        userId: userId
    };
    
    return authSession.createSession(sessionUser);
}

// ПРОСТАЯ ВАЛИДАЦИЯ ФОРМ
function validateLoginForm() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    clearFormErrors();
    
    let isValid = true;
    
    if (!email) {
        showFormError('loginEmailError', 'Введите email');
        isValid = false;
    } else if (!email.includes('@')) {
        showFormError('loginEmailError', 'Введите корректный email');
        isValid = false;
    }
    
    if (!password) {
        showFormError('loginPasswordError', 'Введите пароль');
        isValid = false;
    }
    
    return isValid ? { email, password } : null;
}

function validateRegisterForm() {
    const nickname = document.getElementById('regNickname').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const inviteCode = document.getElementById('inviteCode').value.trim().toUpperCase();
    
    clearFormErrors();
    
    let isValid = true;
    
    if (!nickname || nickname.length < 2) {
        showFormError('nicknameError', 'Никнейм должен быть не менее 2 символов');
        isValid = false;
    }
    
    if (!email || !email.includes('@')) {
        showFormError('emailError', 'Введите корректный email');
        isValid = false;
    }
    
    if (!password || password.length < 6) {
        showFormError('passwordError', 'Пароль должен быть не менее 6 символов');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showFormError('confirmError', 'Пароли не совпадают');
        isValid = false;
    }
    
    const validCodes = ['STUDENT2024', 'LEADER2024', 'ADMIN2024'];
    if (!inviteCode || !validCodes.includes(inviteCode)) {
        showFormError('codeError', 'Неверный пригласительный код');
        isValid = false;
    }
    
    return isValid ? { 
        nickname, 
        email, 
        password, 
        inviteCode 
    } : null;
}

function showFormError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        
        // Подсветка поля
        if (elementId === 'loginEmailError') {
            document.getElementById('loginEmail')?.classList.add('error');
        } else if (elementId === 'loginPasswordError') {
            document.getElementById('loginPassword')?.classList.add('error');
        } else if (elementId === 'nicknameError') {
            document.getElementById('regNickname')?.classList.add('error');
        } else if (elementId === 'emailError') {
            document.getElementById('regEmail')?.classList.add('error');
        } else if (elementId === 'passwordError') {
            document.getElementById('regPassword')?.classList.add('error');
        } else if (elementId === 'confirmError') {
            document.getElementById('confirmPassword')?.classList.add('error');
        } else if (elementId === 'codeError') {
            document.getElementById('inviteCode')?.classList.add('error');
        }
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
    
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

function showSuccess(message) {
    const successEl = document.getElementById('authSuccess');
    if (successEl) {
        successEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        successEl.classList.add('show');
        
        setTimeout(() => {
            successEl.classList.remove('show');
        }, 3000);
    }
}

function setLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Обработка...</span>';
        button.disabled = true;
    } else {
        if (button.id === 'loginBtn') {
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Войти</span>';
        } else if (button.id === 'registerBtn') {
            button.innerHTML = '<i class="fas fa-user-plus"></i><span>Зарегистрироваться</span>';
        }
        button.disabled = false;
    }
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    // Редирект если уже авторизован
    if (authSession.isAuthenticated() && window.location.pathname.includes('login.html')) {
        PageLoader.show();
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
        return;
    }
    
    // Тема
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark-theme');
            themeToggle.checked = true;
        }
        
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }
    
    // Переключение вкладок
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            switchTab('login');
            clearFormErrors();
        });
        registerTab.addEventListener('click', () => {
            switchTab('register');
            clearFormErrors();
        });
    }
    
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = validateLoginForm();
            if (!data) return;
            
            const loginBtn = document.getElementById('loginBtn');
            setLoading(loginBtn, true);
            
            try {
                await authenticateUser(data.email, data.password);
                showSuccess('Вход выполнен успешно! Перенаправление...');
                
                PageLoader.show();
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } catch (error) {
                showFormError('loginEmailError', error.message);
            } finally {
                setLoading(loginBtn, false);
            }
        });
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = validateRegisterForm();
            if (!data) return;
            
            const registerBtn = document.getElementById('registerBtn');
            setLoading(registerBtn, true);
            
            try {
                await registerUser(data);
                showSuccess('Регистрация успешна! Создание сессии...');
                
                PageLoader.show();
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            } catch (error) {
                showFormError('codeError', error.message);
            } finally {
                setLoading(registerBtn, false);
            }
        });
    }
    
    // Ссылка переключения
    const switchLink = document.getElementById('switchLink');
    if (switchLink) {
        switchLink.addEventListener('click', function(e) {
            e.preventDefault();
            const currentTab = document.querySelector('.auth-tab.active');
            if (currentTab && currentTab.id === 'loginTab') {
                switchTab('register');
            } else {
                switchTab('login');
            }
        });
    }
    
    // Забыли пароль
    const forgotPasswordLink = document.querySelector('a[href="#"]');
    if (forgotPasswordLink && forgotPasswordLink.textContent.includes('Забыли пароль')) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Демо доступы:\n\n' +
                  'student@uniportal.ru / student123\n' +
                  'leader@uniportal.ru / leader123\n' +
                  'admin@uniportal.ru / admin123');
        });
    }
    
    // Клавиша Enter
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const activeForm = document.querySelector('form[style*="display: block"], form[style="display: block;"]');
            if (activeForm && !e.target.matches('textarea')) {
                e.preventDefault();
                activeForm.dispatchEvent(new Event('submit'));
            }
        }
    });
});

function switchTab(tabName) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchText = document.getElementById('switchText');
    
    if (tabName === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        if (switchText) {
            switchText.innerHTML = 'Ещё нет аккаунта? <a href="#" id="switchLink">Зарегистрироваться</a>';
        }
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        if (switchText) {
            switchText.innerHTML = 'Уже есть аккаунт? <a href="#" id="switchLink">Войти</a>';
        }
    }
    
    clearFormErrors();
}

// Глобальный объект
window.UniPortalAuth = {
    getCurrentUser: () => authSession.getCurrentUser(),
    isAuthenticated: () => authSession.isAuthenticated(),
    hasRole: (role) => authSession.hasRole(role),
    logout: () => {
        authSession.clearSession();
        PageLoader.show();
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    },
    requireAuth: () => {
        if (!authSession.isAuthenticated()) {
            PageLoader.show();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
            return false;
        }
        return true;
    }
};

window.switchTab = switchTab;
window.currentTab = 'login';