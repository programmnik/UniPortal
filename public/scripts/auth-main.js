document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const themeToggle = document.getElementById('theme-toggle');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchText = document.getElementById('switchText');
    const switchLink = document.getElementById('switchLink');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    // Инициализация темы
    initTheme();
    
    // Переключение темы
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }
    
    // Переключение между вкладками
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab.addEventListener('click', () => switchAuthTab('register'));
    
    // Ссылка переключения
    switchLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (loginForm.style.display === 'block') {
            switchAuthTab('register');
        } else {
            switchAuthTab('login');
        }
    });
    
    // Обработка формы входа
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Обработка формы регистрации
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Инициализация силовой шкалы пароля
    const passwordInput = document.getElementById('regPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
});

// Функция инициализации темы
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    
    // Установка темы
    document.documentElement.className = savedTheme;
    
    // Установка состояния переключателя
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark-theme';
    }
}

// Переключение темы
function toggleTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    if (themeToggle.checked) {
        html.classList.remove('light-theme');
        html.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    } else {
        html.classList.remove('dark-theme');
        html.classList.add('light-theme');
        localStorage.setItem('theme', 'light-theme');
    }
}

// Переключение между вкладками входа и регистрации
function switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchText = document.getElementById('switchText');
    const switchLink = document.getElementById('switchLink');
    
    if (tab === 'login') {
        // Активация вкладки входа
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        
        // Обновление текста переключения
        switchText.innerHTML = 'Ещё нет аккаунта? ';
        const link = document.createElement('a');
        link.href = '#';
        link.id = 'switchLink';
        link.textContent = 'Зарегистрироваться';
        switchText.appendChild(link);
        
        // Добавляем обработчик события на новую ссылку
        link.addEventListener('click', function(e) {
            e.preventDefault();
            switchAuthTab('register');
        });
    } else {
        // Активация вкладки регистрации
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        
        // Обновление текста переключения
        switchText.innerHTML = 'Уже есть аккаунт? ';
        const link = document.createElement('a');
        link.href = '#';
        link.id = 'switchLink';
        link.textContent = 'Войти';
        switchText.appendChild(link);
        
        // Добавляем обработчик события на новую ссылку
        link.addEventListener('click', function(e) {
            e.preventDefault();
            switchAuthTab('login');
        });
    }
}

// Обработка входа
async function handleLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const rememberCheckbox = document.getElementById('remember');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Сброс ошибок
    clearErrors('login');
    
    // Валидация
    let isValid = true;
    
    if (!email) {
        showError('loginEmailError', 'Введите email или никнейм');
        isValid = false;
    }
    
    if (!password) {
        showError('loginPasswordError', 'Введите пароль');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Показываем индикатор загрузки
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
    loginBtn.disabled = true;
    
    try {
        // Проверяем пользователя (симуляция задержки сети)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = validateUser(email, password);
        
        if (user) {
            // Успешный вход
            showSuccess('Авторизация успешна! Перенаправление...');
            
            // Сохраняем сессию
            saveSession(user, rememberCheckbox.checked);
            
            // Перенаправляем на dashboard через 1 секунду
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            // Неверные данные
            showError('loginPasswordError', 'Неверный email/никнейм или пароль');
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        showError('loginPasswordError', 'Ошибка сервера. Попробуйте позже.');
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

// Обработка регистрации
async function handleRegistration(e) {
    e.preventDefault();
    
    const nicknameInput = document.getElementById('regNickname');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');
    const confirmInput = document.getElementById('confirmPassword');
    const inviteCodeInput = document.getElementById('inviteCode');
    
    const nickname = nicknameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    const inviteCode = inviteCodeInput.value.trim();
    
    // Сброс ошибок
    clearErrors('register');
    
    // Валидация
    let isValid = true;
    
    // Валидация никнейма
    if (!nickname) {
        showError('nicknameError', 'Введите никнейм');
        isValid = false;
    } else if (nickname.length < 3) {
        showError('nicknameError', 'Никнейм должен быть не менее 3 символов');
        isValid = false;
    }
    
    // Валидация email
    if (!email) {
        showError('emailError', 'Введите email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Введите корректный email');
        isValid = false;
    }
    
    // Валидация пароля
    if (!password) {
        showError('passwordError', 'Введите пароль');
        isValid = false;
    } else if (password.length < 8) {
        showError('passwordError', 'Пароль должен быть не менее 8 символов');
        isValid = false;
    } else if (!isStrongPassword(password)) {
        showError('passwordError', 'Пароль должен содержать буквы и цифры');
        isValid = false;
    }
    
    // Проверка подтверждения пароля
    if (!confirmPassword) {
        showError('confirmError', 'Подтвердите пароль');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmError', 'Пароли не совпадают');
        isValid = false;
    }
    
    // Валидация пригласительного кода
    if (!inviteCode) {
        showError('codeError', 'Введите пригласительный код');
        isValid = false;
    } else if (!isValidInviteCode(inviteCode)) {
        showError('codeError', 'Неверный пригласительный код');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Показываем индикатор загрузки
    const originalText = registerBtn.innerHTML;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
    registerBtn.disabled = true;
    
    try {
        // Симуляция задержки регистрации
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Проверяем, существует ли уже пользователь с таким email
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            showError('emailError', 'Пользователь с таким email уже существует');
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
            return;
        }
        
        // Проверяем, существует ли уже пользователь с таким никнеймом
        const existingNickname = findUserByNickname(nickname);
        if (existingNickname) {
            showError('nicknameError', 'Этот никнейм уже занят');
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
            return;
        }
        
        // Регистрируем нового пользователя
        const newUser = registerUser({
            nickname,
            email,
            password,
            inviteCode
        });
        
        if (newUser) {
            // Успешная регистрация
            showSuccess('Регистрация успешна! Выполняется вход...');
            
            // Сохраняем сессию
            saveSession(newUser, false);
            
            // Перенаправляем на dashboard через 1.5 секунды
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showError('codeError', 'Ошибка регистрации. Попробуйте позже.');
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showError('codeError', 'Ошибка сервера. Попробуйте позже.');
        registerBtn.innerHTML = originalText;
        registerBtn.disabled = false;
    }
}

// Вспомогательные функции валидации
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isStrongPassword(password) {
    // Проверяет, содержит ли пароль хотя бы одну букву и одну цифру
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
}

function isValidInviteCode(code) {
    // Простая проверка пригласительного кода
    // В реальном приложении здесь должна быть проверка с сервером
    const validCodes = ['STUDENT2024', 'LEADER2024', 'ADMIN2024', 'UNI2024', 'PORTAL2024'];
    return validCodes.includes(code.toUpperCase());
}

// Обновление индикатора силы пароля
function updatePasswordStrength() {
    const password = document.getElementById('regPassword').value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    let text = 'Слабый';
    let color = '#ef4444';
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    strengthBar.style.width = strength + '%';
    
    if (strength >= 75) {
        text = 'Сильный';
        color = '#10b981';
    } else if (strength >= 50) {
        text = 'Средний';
        color = '#f59e0b';
    } else if (strength >= 25) {
        text = 'Слабый';
        color = '#ef4444';
    } else {
        text = 'Введите пароль';
        color = '#6b7280';
    }
    
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
}

// Показать сообщение об ошибке
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

// Сбросить все ошибки
function clearErrors(formType) {
    const errorIds = formType === 'login' 
        ? ['loginEmailError', 'loginPasswordError']
        : ['nicknameError', 'emailError', 'passwordError', 'confirmError', 'codeError'];
    
    errorIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    });
}

// Показать сообщение об успехе
function showSuccess(message) {
    const successElement = document.getElementById('authSuccess');
    if (successElement) {
        successElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <span>${message}</span>
            </div>
        `;
        successElement.style.display = 'block';
    }
}

// Проверка существующего email
function findUserByEmail(email) {
    const users = getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Проверка существующего никнейма
function findUserByNickname(nickname) {
    const users = getUsers();
    return users.find(user => user.nickname.toLowerCase() === nickname.toLowerCase());
}

// scripts/auth.js - Основная логика для страницы входа

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, авторизован ли пользователь
    checkAuthStatus();
    
    // Инициализация темы
    initTheme();
    
    // Инициализация переключателей
    initTabs();
    
    // Инициализация обработчиков форм
    initForms();
});

// Проверка статуса авторизации
function checkAuthStatus() {
    const currentUser = getCurrentUser();
    
    // Если пользователь уже авторизован, перенаправляем на dashboard
    if (currentUser && window.location.pathname.includes('/login')) {
        // Даем небольшую задержку для лучшего UX
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 100);
    }
}

// Инициализация темы
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    
    // Установка темы
    document.documentElement.className = savedTheme;
    
    // Установка состояния переключателя
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark-theme';
        themeToggle.addEventListener('change', toggleTheme);
    }
}

// Переключение темы
function toggleTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    if (themeToggle.checked) {
        html.classList.remove('light-theme');
        html.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    } else {
        html.classList.remove('dark-theme');
        html.classList.add('light-theme');
        localStorage.setItem('theme', 'light-theme');
    }
}

// Инициализация вкладок
function initTabs() {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const switchLink = document.getElementById('switchLink');
    
    if (loginTab) {
        loginTab.addEventListener('click', () => switchAuthTab('login'));
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', () => switchAuthTab('register'));
    }
    
    if (switchLink) {
        switchLink.addEventListener('click', function(e) {
            e.preventDefault();
            const loginForm = document.getElementById('loginForm');
            if (loginForm.style.display === 'block') {
                switchAuthTab('register');
            } else {
                switchAuthTab('login');
            }
        });
    }
}

// Переключение между вкладками
function switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchText = document.getElementById('switchText');
    
    // Сбрасываем ошибки при переключении
    resetAllErrors();
    
    if (tab === 'login') {
        // Активация вкладки входа
        loginTab?.classList.add('active');
        registerTab?.classList.remove('active');
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        
        // Обновление текста переключения
        if (switchText) {
            switchText.innerHTML = 'Ещё нет аккаунта? <a href="#" id="switchLink">Зарегистрироваться</a>';
            document.getElementById('switchLink')?.addEventListener('click', (e) => {
                e.preventDefault();
                switchAuthTab('register');
            });
        }
    } else {
        // Активация вкладки регистрации
        loginTab?.classList.remove('active');
        registerTab?.classList.add('active');
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        
        // Обновление текста переключения
        if (switchText) {
            switchText.innerHTML = 'Уже есть аккаунт? <a href="#" id="switchLink">Войти</a>';
            document.getElementById('switchLink')?.addEventListener('click', (e) => {
                e.preventDefault();
                switchAuthTab('login');
            });
        }
    }
}

// Инициализация обработчиков форм
function initForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
}

// Обработка входа
async function handleLogin(e) {
    e.preventDefault();
    
    // Валидация формы
    const isValid = validateLoginForm();
    
    if (!isValid) {
        showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }
    
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const rememberCheckbox = document.getElementById('remember');
    
    // Показываем индикатор загрузки
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn?.innerHTML;
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        loginBtn.disabled = true;
    }
    
    try {
        // Симуляция задержки сети
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Проверяем пользователя
        const user = validateUser(email, password);
        
        if (user) {
            // Успешный вход
            showNotification('Авторизация успешна!', 'success');
            
            // Сохраняем сессию
            saveSession(user, rememberCheckbox?.checked || false);
            
            // Перенаправляем на dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            // Неверные данные
            showNotification('Неверный email/никнейм или пароль', 'error');
            if (loginBtn) {
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        showNotification('Ошибка сервера. Попробуйте позже.', 'error');
        if (loginBtn) {
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }
}

// Обработка регистрации
async function handleRegistration(e) {
    e.preventDefault();
    
    // Валидация формы
    const isValid = validateRegisterForm();
    
    if (!isValid) {
        showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }
    
    const nickname = document.getElementById('regNickname')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const inviteCode = document.getElementById('inviteCode')?.value.trim();
    
    // Показываем индикатор загрузки
    const registerBtn = document.getElementById('registerBtn');
    const originalText = registerBtn?.innerHTML;
    if (registerBtn) {
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        registerBtn.disabled = true;
    }
    
    try {
        // Симуляция задержки регистрации
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Проверяем уникальность email
        const existingEmail = findUserByEmail(email);
        if (existingEmail) {
            showNotification('Этот email уже зарегистрирован', 'error');
            validateEmail(); // Обновляем отображение ошибки
            if (registerBtn) {
                registerBtn.innerHTML = originalText;
                registerBtn.disabled = false;
            }
            return;
        }
        
        // Проверяем уникальность никнейма
        const existingNickname = findUserByNickname(nickname);
        if (existingNickname) {
            showNotification('Этот никнейм уже занят', 'error');
            validateNickname(); // Обновляем отображение ошибки
            if (registerBtn) {
                registerBtn.innerHTML = originalText;
                registerBtn.disabled = false;
            }
            return;
        }
        
        // Регистрируем нового пользователя
        const newUser = registerUser({
            nickname,
            email,
            password,
            inviteCode
        });
        
        if (newUser) {
            // Успешная регистрация
            showNotification('Регистрация успешна! Выполняется вход...', 'success');
            
            // Сохраняем сессию
            saveSession(newUser, false);
            
            // Перенаправляем на dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showNotification('Ошибка регистрации. Попробуйте позже.', 'error');
            if (registerBtn) {
                registerBtn.innerHTML = originalText;
                registerBtn.disabled = false;
            }
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showNotification('Ошибка сервера. Попробуйте позже.', 'error');
        if (registerBtn) {
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
        }
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const successElement = document.getElementById('authSuccess');
    if (!successElement) return;
    
    let icon = 'fa-info-circle';
    let color = '#3b82f6';
    
    if (type === 'success') {
        icon = 'fa-check-circle';
        color = '#10b981';
    } else if (type === 'error') {
        icon = 'fa-exclamation-circle';
        color = '#ef4444';
    } else if (type === 'warning') {
        icon = 'fa-exclamation-triangle';
        color = '#f59e0b';
    }
    
    successElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${icon}" style="color: ${color};"></i>
            <span>${message}</span>
        </div>
    `;
    successElement.style.display = 'block';
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 5000);
}

// Проверка существующего email
function findUserByEmail(email) {
    const users = getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Проверка существующего никнейма
function findUserByNickname(nickname) {
    const users = getUsers();
    return users.find(user => user.nickname.toLowerCase() === nickname.toLowerCase());
}