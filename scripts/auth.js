// Добавим в начало auth.js после констант
class PageLoader {
    static show() {
        // Проверяем, есть ли уже прелоадер
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
            
            // Удаляем через 0.5 секунд после скрытия
            setTimeout(() => {
                if (loader && loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 500);
        }
    }
    
    static showWithDelay(ms = 300) {
        setTimeout(() => this.show(), ms);
    }
}
// Auth System for UniPortal - FIXED VERSION
// Secure authentication with session management

// PRIVATE DEMO DATA (not exposed in HTML)
const PRIVATE_DEMO_USERS = {
    'student@uniportal.ru': {
        password: 'student123',
        nickname: 'ИванСтудент',
        role: 'student',
        group: 'ИСП-21-1',
        inviteCode: 'STUDENT2024',
        userId: 'stu_001'
    },
    'leader@uniportal.ru': {
        password: 'leader123',
        nickname: 'АннаСтароста',
        role: 'leader',
        group: 'ИСП-21-1',
        inviteCode: 'LEADER2024',
        userId: 'ldr_001'
    },
    'admin@uniportal.ru': {
        password: 'admin123',
        nickname: 'АдминСистемы',
        role: 'admin',
        group: 'Администрация',
        inviteCode: 'ADMIN2024',
        userId: 'adm_001'
    }
};

const PRIVATE_VALID_CODES = {
    'STUDENT2024': { group: 'ИСП-21-1', role: 'student' },
    'LEADER2024': { group: 'ИСП-21-1', role: 'leader' },
    'ADMIN2024': { group: 'Администрация', role: 'admin' }
};

// Session management
class AuthSession {
    constructor() {
        this.currentUser = null;
        this.sessionId = null;
        this.init();
    }

    init() {
        // Check existing session
        const sessionData = localStorage.getItem('uni_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                
                // Verify session is still valid
                if (this.verifySession(session)) {
                    this.currentUser = session.user;
                    this.sessionId = session.sessionId;
                } else {
                    this.clearSession();
                }
            } catch (e) {
                this.clearSession();
            }
        }
    }

    createSession(user) {
        const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const sessionData = {
            user: {
                email: user.email,
                nickname: user.nickname,
                role: user.role,
                group: user.group,
                userId: user.userId
            },
            sessionId: sessionId,
            created: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        
        localStorage.setItem('uni_session', JSON.stringify(sessionData));
        this.currentUser = sessionData.user;
        this.sessionId = sessionId;
        
        // Set session cookie (for server-side in real app)
        document.cookie = `uni_session=${sessionId}; path=/; max-age=86400; SameSite=Strict`;
        
        return sessionData;
    }

    verifySession(session) {
        if (!session || !session.user || !session.sessionId) return false;
        
        // Check expiration
        if (session.expires < Date.now()) {
            return false;
        }
        
        return true;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    clearSession() {
        this.currentUser = null;
        this.sessionId = null;
        localStorage.removeItem('uni_session');
        document.cookie = 'uni_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    // Role-based access control
    hasRole(requiredRole) {
        if (!this.currentUser) return false;
        return this.currentUser.role === requiredRole;
    }

    isInGroup(groupName) {
        if (!this.currentUser) return false;
        return this.currentUser.group === groupName;
    }
}

// Initialize global auth session
const authSession = new AuthSession();

// XSS Protection
const XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
    /alert\s*\(/gi,
    /document\./gi,
    /window\./gi,
    /eval\s*\(/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<applet/gi
];

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    let clean = input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
    
    // Check for XSS patterns
    const hasXSS = XSS_PATTERNS.some(pattern => pattern.test(clean));
    if (hasXSS) {
        showSecurityWarning('Обнаружена попытка ввода опасного кода');
        return '';
    }
    
    return clean;
}

function showSecurityWarning(message) {
    const warning = document.createElement('div');
    warning.className = 'security-warning';
    warning.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        ">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-shield-alt"></i>
                <strong>⚠️ Безопасность:</strong>
                <span>${message}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.style.opacity = '0';
        setTimeout(() => warning.remove(), 300);
    }, 3000);
}

// Authentication functions
async function authenticateUser(identifier, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find user by email or nickname
    let user = null;
    let userEmail = null;
    
    // Check by email
    if (PRIVATE_DEMO_USERS[identifier]) {
        user = PRIVATE_DEMO_USERS[identifier];
        userEmail = identifier;
    } else {
        // Check by nickname
        for (const [email, userData] of Object.entries(PRIVATE_DEMO_USERS)) {
            if (userData.nickname === identifier) {
                user = userData;
                userEmail = email;
                break;
            }
        }
    }
    
    // Verify user exists and password matches
    if (!user || user.password !== password) {
        throw new Error('Неверные учетные данные');
    }
    
    // Create user session
    const sessionUser = {
        email: userEmail,
        nickname: user.nickname,
        role: user.role,
        group: user.group,
        userId: user.userId
    };
    
    return authSession.createSession(sessionUser);
}

async function registerUser(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate invite code
    if (!PRIVATE_VALID_CODES[userData.inviteCode]) {
        throw new Error('Неверный пригласительный код');
    }
    
    // Check if email already exists
    if (PRIVATE_DEMO_USERS[userData.email]) {
        throw new Error('Пользователь с таким email уже существует');
    }
    
    // Get group and role from code
    const codeInfo = PRIVATE_VALID_CODES[userData.inviteCode];
    
    // Generate unique user ID
    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    // Create new user (in real app, this would go to server)
    const newUser = {
        email: userData.email,
        nickname: userData.nickname,
        password: userData.password,
        role: codeInfo.role,
        group: codeInfo.group,
        userId: userId,
        createdAt: new Date().toISOString()
    };
    
    // Note: In demo we don't actually save new users
    // In real app: await api.register(newUser);
    
    // Create session for new user
    const sessionUser = {
        email: newUser.email,
        nickname: newUser.nickname,
        role: newUser.role,
        group: newUser.group,
        userId: newUser.userId
    };
    
    return authSession.createSession(sessionUser);
}

// Form validation
function validateLoginForm() {
    const identifier = sanitizeInput(document.getElementById('email').value.trim());
    const password = document.getElementById('password').value;
    
    // Clear previous errors
    clearFormErrors('login');
    
    let isValid = true;
    
    if (!identifier) {
        showFormError('loginEmailError', 'Введите email или никнейм');
        isValid = false;
    }
    
    if (!password) {
        showFormError('loginPasswordError', 'Введите пароль');
        isValid = false;
    }
    
    return isValid ? { identifier, password } : null;
}

function validateRegisterForm() {
    const nickname = sanitizeInput(document.getElementById('nickname').value.trim());
    const email = sanitizeInput(document.getElementById('regEmail').value.trim().toLowerCase());
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const inviteCode = sanitizeInput(document.getElementById('inviteCode').value.trim().toUpperCase());
    
    // Clear previous errors
    clearFormErrors('register');
    
    let isValid = true;
    
    // Nickname validation
    if (!nickname || nickname.length < 3) {
        showFormError('nicknameError', 'Никнейм должен быть не менее 3 символов');
        isValid = false;
    }
    
    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormError('emailError', 'Введите корректный email');
        isValid = false;
    }
    
    // Password validation
    if (!password || password.length < 8) {
        showFormError('passwordError', 'Пароль должен быть не менее 8 символов');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showFormError('confirmError', 'Пароли не совпадают');
        isValid = false;
    }
    
    // Invite code validation
    if (!inviteCode) {
        showFormError('codeError', 'Введите пригласительный код');
        isValid = false;
    }
    
    return isValid ? { nickname, email, password, inviteCode } : null;
}

function showFormError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        
        // Highlight input
        const inputId = elementId.replace('Error', '');
        const input = document.getElementById(inputId);
        if (input) {
            input.classList.add('error');
        }
    }
}

function clearFormErrors(formType) {
    const prefix = formType === 'login' ? 'login' : '';
    const errorElements = document.querySelectorAll(`.form-error`);
    errorElements.forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
    
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => input.classList.remove('error'));
}

// UI Feedback
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

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
}

function setLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        const originalHTML = button.innerHTML;
        button.setAttribute('data-original-html', originalHTML);
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Обработка...</span>';
        button.disabled = true;
    } else {
        const originalHTML = button.getAttribute('data-original-html');
        if (originalHTML) {
            button.innerHTML = originalHTML;
        }
        button.disabled = false;
    }
}

// Password strength indicator
function updatePasswordStrength(password) {
    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');
    
    if (!bar || !text) return;
    
    let strength = 0;
    if (password.length >= 8) strength += 30;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    strength = Math.min(strength, 100);
    bar.style.width = `${strength}%`;
    
    if (strength < 40) {
        bar.style.backgroundColor = '#ef4444';
        text.textContent = 'Слабый пароль';
        text.style.color = '#ef4444';
    } else if (strength < 70) {
        bar.style.backgroundColor = '#f59e0b';
        text.textContent = 'Средний пароль';
        text.style.color = '#f59e0b';
    } else {
        bar.style.backgroundColor = '#10b981';
        text.textContent = 'Сильный пароль';
        text.style.color = '#10b981';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already logged in
    if (authSession.isAuthenticated() && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Remove demo credentials from DOM for security
    const demoSection = document.querySelector('.demo-credentials');
    if (demoSection && !window.location.href.includes('localhost')) {
        demoSection.style.display = 'none';
    }
    
    // Theme initialization
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
    
    // Tab switching
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => switchTab('login'));
        registerTab.addEventListener('click', () => switchTab('register'));
    }
    
    // Password strength
    const passwordInput = document.getElementById('regPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = validateLoginForm();
            if (!data) return;
            
            const loginBtn = document.getElementById('loginBtn');
            setLoading(loginBtn, true);
            
            try {
                await authenticateUser(data.identifier, data.password);
                showSuccess('Вход выполнен успешно! Перенаправление...');
                
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
    
    // Register form
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
    
    // Switch link
    const switchLink = document.getElementById('switchLink');
    if (switchLink) {
        switchLink.addEventListener('click', function(e) {
            e.preventDefault();
            const currentTab = document.querySelector('.auth-tab.active').id;
            if (currentTab === 'loginTab') {
                switchTab('register');
            } else {
                switchTab('login');
            }
        });
    }
});

// Tab switching function
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
    
    // Clear form errors
    clearFormErrors(tabName);
}

// Global auth object
window.UniPortalAuth = {
    getCurrentUser: () => authSession.getCurrentUser(),
    isAuthenticated: () => authSession.isAuthenticated(),
    hasRole: (role) => authSession.hasRole(role),
    logout: () => {
        authSession.clearSession();
        window.location.href = 'login.html';
    },
    requireAuth: () => {
        if (!authSession.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};