// UniPortal Secure Auth System
// Full XSS protection, CSRF tokens, and security headers

(function() {
    'use strict';
    
    // Security constants
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
    
    const SQL_PATTERNS = [
        /(\s*;\s*|\s*--\s*|\s*\/\*\s*|\s*\*\/\s*)/gi,
        /(\s*union\s+select\s*|\s*drop\s+table\s*)/gi,
        /(\s*delete\s+from\s*|\s*insert\s+into\s*|\s*update\s+set\s*)/gi,
        /(\s*or\s+1\s*=\s*1\s*|\s*and\s+1\s*=\s*1\s*)/gi,
        /(\s*exec\s*\(|\s*xp_cmdshell\s*)/gi
    ];
    
    // CSRF token
    let csrfToken = null;
    
    // Rate limiting
    let loginAttempts = 0;
    let lastAttemptTime = 0;
    
    // Security functions
    function sanitizeInput(input, maxLength = 255) {
        if (typeof input !== 'string') return '';
        
        let clean = input.trim();
        
        // Limit length
        if (clean.length > maxLength) {
            clean = clean.substring(0, maxLength);
        }
        
        // HTML escaping
        clean = clean
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        
        // Check for XSS patterns
        const hasXSS = XSS_PATTERNS.some(pattern => pattern.test(clean));
        if (hasXSS) {
            logSecurityEvent('xss_attempt', null, false, 'XSS pattern detected');
            return '';
        }
        
        // Check for SQL patterns
        const hasSQL = SQL_PATTERNS.some(pattern => pattern.test(clean));
        if (hasSQL) {
            logSecurityEvent('sql_injection_attempt', null, false, 'SQL pattern detected');
            return '';
        }
        
        return clean;
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function validatePassword(password) {
        if (password.length < 8) {
            return { valid: false, message: 'Пароль должен быть не менее 8 символов' };
        }
        
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Пароль должен содержать хотя бы одну заглавную букву' };
        }
        
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'Пароль должен содержать хотя бы одну строчную букву' };
        }
        
        if (!/\d/.test(password)) {
            return { valid: false, message: 'Пароль должен содержать хотя бы одну цифру' };
        }
        
        return { valid: true, message: 'Пароль надежен' };
    }
    
    function checkRateLimit() {
        const now = Date.now();
        const timeWindow = 15 * 60 * 1000; // 15 минут
        
        if (now - lastAttemptTime > timeWindow) {
            loginAttempts = 0;
            lastAttemptTime = now;
        }
        
        if (loginAttempts >= 5) {
            const remainingTime = Math.ceil((timeWindow - (now - lastAttemptTime)) / 60000);
            return {
                allowed: false,
                message: `Слишком много попыток. Подождите ${remainingTime} минут`
            };
        }
        
        loginAttempts++;
        lastAttemptTime = now;
        
        return { allowed: true };
    }
    
    function generateCSRFToken() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        
        // Set token in localStorage
        localStorage.setItem('csrf_token', csrfToken);
        localStorage.setItem('csrf_token_time', Date.now().toString());
        
        return csrfToken;
    }
    
    function validateCSRFToken(token) {
        const storedToken = localStorage.getItem('csrf_token');
        const tokenTime = localStorage.getItem('csrf_token_time');
        
        if (!storedToken || !tokenTime) return false;
        
        // Token expires after 24 hours
        if (Date.now() - parseInt(tokenTime) > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('csrf_token');
            localStorage.removeItem('csrf_token_time');
            return false;
        }
        
        // Use timing-safe comparison
        let result = 0;
        const length = Math.max(token.length, storedToken.length);
        
        for (let i = 0; i < length; i++) {
            result |= (token.charCodeAt(i) || 0) ^ (storedToken.charCodeAt(i) || 0);
        }
        
        return result === 0;
    }
    
    function logSecurityEvent(eventType, userEmail = null, success = true, details = '') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: eventType,
            user: userEmail,
            success: success,
            details: details,
            userAgent: navigator.userAgent,
            path: window.location.pathname
        };
        
        // In production, send to server
        console.log('Security Event:', logEntry);
        
        // Store in localStorage for debugging
        const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        securityLogs.push(logEntry);
        
        if (securityLogs.length > 100) {
            securityLogs.shift();
        }
        
        localStorage.setItem('security_logs', JSON.stringify(securityLogs));
    }
    
    // Set security headers (for iframe protection)
    function setSecurityHeaders() {
        // Add CSP meta tag if not present
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const cspMeta = document.createElement('meta');
            cspMeta.httpEquiv = "Content-Security-Policy";
            cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';";
            document.head.appendChild(cspMeta);
        }
        
        // Add security headers via meta tags
        const securityHeaders = [
            { name: 'X-Content-Type-Options', value: 'nosniff' },
            { name: 'X-Frame-Options', value: 'DENY' },
            { name: 'X-XSS-Protection', value: '1; mode=block' },
            { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ];
        
        securityHeaders.forEach(header => {
            if (!document.querySelector(`meta[http-equiv="${header.name}"]`)) {
                const meta = document.createElement('meta');
                meta.httpEquiv = header.name;
                meta.content = header.value;
                document.head.appendChild(meta);
            }
        });
    }
    
    // Secure storage for sensitive data
    const SecureStorage = {
        set: function(key, value, ttl = 24 * 60 * 60 * 1000) {
            const item = {
                value: value,
                expires: Date.now() + ttl,
                signature: this._sign(key + JSON.stringify(value))
            };
            
            localStorage.setItem(key, JSON.stringify(item));
        },
        
        get: function(key) {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;
            
            try {
                const item = JSON.parse(itemStr);
                
                // Check expiration
                if (Date.now() > item.expires) {
                    localStorage.removeItem(key);
                    return null;
                }
                
                // Verify signature
                const expectedSignature = this._sign(key + JSON.stringify(item.value));
                if (item.signature !== expectedSignature) {
                    logSecurityEvent('tamper_detected', null, false, `Tampering detected for key: ${key}`);
                    localStorage.removeItem(key);
                    return null;
                }
                
                return item.value;
            } catch (e) {
                logSecurityEvent('storage_error', null, false, `Failed to parse storage item: ${key}`);
                localStorage.removeItem(key);
                return null;
            }
        },
        
        remove: function(key) {
            localStorage.removeItem(key);
        },
        
        _sign: function(data) {
            // Simple signature for demo (in production use HMAC)
            return btoa(data).split('').reverse().join('');
        }
    };
    
    // Main auth system
    const AuthSystem = {
        init: function() {
            setSecurityHeaders();
            generateCSRFToken();
            this.bindEvents();
            
            // Check if already authenticated
            if (this.isAuthenticated() && window.location.pathname.includes('login.html')) {
                window.location.href = 'dashboard.html';
            }
        },
        
        bindEvents: function() {
            // Login form
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => this.handleLogin(e));
                
                // Add CSRF token to form
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                csrfInput.value = csrfToken;
                loginForm.appendChild(csrfInput);
            }
            
            // Register form
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => this.handleRegister(e));
                
                // Add CSRF token to form
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                csrfInput.value = csrfToken;
                registerForm.appendChild(csrfInput);
                
                // Password strength
                const passwordInput = document.getElementById('regPassword');
                if (passwordInput) {
                    passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
                }
            }
            
            // Theme toggle
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('change', (e) => this.toggleTheme(e.target.checked));
            }
            
            // Tab switching
            const loginTab = document.getElementById('loginTab');
            const registerTab = document.getElementById('registerTab');
            
            if (loginTab && registerTab) {
                loginTab.addEventListener('click', () => this.switchTab('login'));
                registerTab.addEventListener('click', () => this.switchTab('register'));
                
                // Check URL for action parameter
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('action') === 'register') {
                    this.switchTab('register');
                }
            }
        },
        
        handleLogin: async function(e) {
            e.preventDefault();
            
            // Rate limiting check
            const rateLimit = checkRateLimit();
            if (!rateLimit.allowed) {
                this.showError('loginEmailError', rateLimit.message);
                return;
            }
            
            // Get form data
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const csrfInput = e.target.querySelector('input[name="csrf_token"]');
            
            if (!email || !password || !csrfInput) {
                this.showError('loginEmailError', 'Ошибка формы');
                return;
            }
            
            // Validate CSRF token
            if (!validateCSRFToken(csrfInput.value)) {
                logSecurityEvent('csrf_attempt', null, false, 'Invalid CSRF token');
                this.showError('loginEmailError', 'Ошибка безопасности. Обновите страницу.');
                generateCSRFToken();
                return;
            }
            
            // Sanitize inputs
            const cleanEmail = sanitizeInput(email.value.trim().toLowerCase());
            const cleanPassword = password.value;
            
            // Validate
            if (!cleanEmail || !cleanPassword) {
                this.showError('loginEmailError', 'Заполните все поля');
                return;
            }
            
            if (!validateEmail(cleanEmail)) {
                this.showError('loginEmailError', 'Неверный формат email');
                return;
            }
            
            // Show loading
            const loginBtn = document.getElementById('loginBtn');
            this.setLoading(loginBtn, true);
            
            try {
                // In production: API call to server
                // const response = await this.apiLogin(cleanEmail, cleanPassword);
                
                // For demo: simulate API call
                const response = await this.demoLogin(cleanEmail, cleanPassword);
                
                if (response.success) {
                    // Store session securely
                    SecureStorage.set('user_session', {
                        email: response.user.email,
                        nickname: response.user.nickname,
                        role: response.user.role,
                        group: response.user.group,
                        sessionId: response.sessionId
                    });
                    
                    // Log successful login
                    logSecurityEvent('login_success', cleanEmail, true);
                    
                    // Clear rate limiting
                    loginAttempts = 0;
                    
                    // Show success and redirect
                    this.showSuccess('Вход выполнен успешно! Перенаправление...');
                    
                    PageLoader.show();
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                    
                } else {
                    this.showError('loginEmailError', response.message);
                    logSecurityEvent('login_failed', cleanEmail, false, response.message);
                }
                
            } catch (error) {
                console.error('Login error:', error);
                this.showError('loginEmailError', 'Ошибка соединения с сервером');
                logSecurityEvent('login_error', cleanEmail, false, error.message);
                
            } finally {
                this.setLoading(loginBtn, false);
            }
        },
        
        handleRegister: async function(e) {
            e.preventDefault();
            
            // Get form data
            const nickname = document.getElementById('nickname');
            const email = document.getElementById('regEmail');
            const password = document.getElementById('regPassword');
            const confirmPassword = document.getElementById('confirmPassword');
            const inviteCode = document.getElementById('inviteCode');
            const csrfInput = e.target.querySelector('input[name="csrf_token"]');
            
            if (!nickname || !email || !password || !confirmPassword || !inviteCode || !csrfInput) {
                this.showError('codeError', 'Ошибка формы');
                return;
            }
            
            // Validate CSRF token
            if (!validateCSRFToken(csrfInput.value)) {
                logSecurityEvent('csrf_attempt', null, false, 'Invalid CSRF token on register');
                this.showError('codeError', 'Ошибка безопасности. Обновите страницу.');
                generateCSRFToken();
                return;
            }
            
            // Sanitize inputs
            const cleanNickname = sanitizeInput(nickname.value.trim());
            const cleanEmail = sanitizeInput(email.value.trim().toLowerCase());
            const cleanPassword = password.value;
            const cleanConfirm = confirmPassword.value;
            const cleanInviteCode = sanitizeInput(inviteCode.value.trim().toUpperCase());
            
            // Clear previous errors
            this.clearErrors();
            
            // Validate
            let isValid = true;
            
            if (!cleanNickname || cleanNickname.length < 3) {
                this.showError('nicknameError', 'Никнейм должен быть не менее 3 символов');
                isValid = false;
            }
            
            if (!cleanEmail || !validateEmail(cleanEmail)) {
                this.showError('emailError', 'Введите корректный email');
                isValid = false;
            }
            
            const passwordValidation = validatePassword(cleanPassword);
            if (!passwordValidation.valid) {
                this.showError('passwordError', passwordValidation.message);
                isValid = false;
            }
            
            if (cleanPassword !== cleanConfirm) {
                this.showError('confirmError', 'Пароли не совпадают');
                isValid = false;
            }
            
            if (!cleanInviteCode) {
                this.showError('codeError', 'Введите пригласительный код');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Check invite code
            const validCodes = ['STUDENT2024', 'LEADER2024', 'ADMIN2024'];
            if (!validCodes.includes(cleanInviteCode)) {
                this.showError('codeError', 'Неверный пригласительный код');
                logSecurityEvent('invalid_invite_code', cleanEmail, false, `Code: ${cleanInviteCode}`);
                return;
            }
            
            // Show loading
            const registerBtn = document.getElementById('registerBtn');
            this.setLoading(registerBtn, true);
            
            try {
                // In production: API call to server
                // const response = await this.apiRegister({
                //     nickname: cleanNickname,
                //     email: cleanEmail,
                //     password: cleanPassword,
                //     inviteCode: cleanInviteCode
                // });
                
                // For demo: simulate API call
                const response = await this.demoRegister({
                    nickname: cleanNickname,
                    email: cleanEmail,
                    password: cleanPassword,
                    inviteCode: cleanInviteCode
                });
                
                if (response.success) {
                    // Store session securely
                    SecureStorage.set('user_session', {
                        email: response.user.email,
                        nickname: response.user.nickname,
                        role: response.user.role,
                        group: response.user.group,
                        sessionId: response.sessionId
                    });
                    
                    // Log successful registration
                    logSecurityEvent('register_success', cleanEmail, true);
                    
                    // Show success and redirect
                    this.showSuccess('Регистрация успешна! Создание сессии...');
                    
                    PageLoader.show();
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                    
                } else {
                    this.showError('codeError', response.message);
                    logSecurityEvent('register_failed', cleanEmail, false, response.message);
                }
                
            } catch (error) {
                console.error('Register error:', error);
                this.showError('codeError', 'Ошибка соединения с сервером');
                logSecurityEvent('register_error', cleanEmail, false, error.message);
                
            } finally {
                this.setLoading(registerBtn, false);
            }
        },
        
        demoLogin: function(email, password) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Demo users
                    const demoUsers = {
                        'student@uniportal.ru': {
                            password: 'Student123',
                            nickname: 'ИванСтудент',
                            role: 'student',
                            group: 'IT-101'
                        },
                        'leader@uniportal.ru': {
                            password: 'Leader123',
                            nickname: 'АннаСтароста',
                            role: 'leader',
                            group: 'IT-101'
                        },
                        'admin@uniportal.ru': {
                            password: 'Admin123',
                            nickname: 'АдминСистемы',
                            role: 'admin',
                            group: 'IT-101'
                        }
                    };
                    
                    const user = demoUsers[email];
                    
                    if (!user) {
                        resolve({
                            success: false,
                            message: 'Пользователь не найден'
                        });
                        return;
                    }
                    
                    if (user.password !== password) {
                        resolve({
                            success: false,
                            message: 'Неверный пароль'
                        });
                        return;
                    }
                    
                    // Generate session
                    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    
                    resolve({
                        success: true,
                        message: 'Вход выполнен успешно',
                        user: {
                            email: email,
                            nickname: user.nickname,
                            role: user.role,
                            group: user.group
                        },
                        sessionId: sessionId
                    });
                    
                }, 800); // Simulate network delay
            });
        },
        
        demoRegister: function(userData) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Determine role from invite code
                    let role = 'student';
                    if (userData.inviteCode === 'LEADER2024') {
                        role = 'leader';
                    } else if (userData.inviteCode === 'ADMIN2024') {
                        role = 'admin';
                    }
                    
                    // Generate session
                    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    
                    resolve({
                        success: true,
                        message: 'Регистрация успешна',
                        user: {
                            email: userData.email,
                            nickname: userData.nickname,
                            role: role,
                            group: 'IT-101'
                        },
                        sessionId: sessionId
                    });
                    
                }, 1000); // Simulate network delay
            });
        },
        
        // Helper methods
        switchTab: function(tabName) {
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
            
            this.clearErrors();
        },
        
        checkPasswordStrength: function(password) {
            const bar = document.getElementById('strengthBar');
            const text = document.getElementById('strengthText');
            
            if (!bar || !text) return;
            
            let strength = 0;
            if (password.length >= 8) strength += 30;
            if (/[A-Z]/.test(password)) strength += 20;
            if (/[a-z]/.test(password)) strength += 20;
            if (/\d/.test(password)) strength += 15;
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
        },
        
        showError: function(elementId, message) {
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
        },
        
        showSuccess: function(message) {
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
        },
        
        clearErrors: function() {
            const errorElements = document.querySelectorAll('.form-error');
            errorElements.forEach(el => {
                el.classList.remove('show');
                el.textContent = '';
            });
            
            const inputs = document.querySelectorAll('.form-input');
            inputs.forEach(input => input.classList.remove('error'));
        },
        
        setLoading: function(button, isLoading) {
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
        },
        
        toggleTheme: function(isDark) {
            if (isDark) {
                document.documentElement.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        },
        
        isAuthenticated: function() {
            const session = SecureStorage.get('user_session');
            return !!session;
        },
        
        getCurrentUser: function() {
            return SecureStorage.get('user_session');
        },
        
        logout: function() {
            // Log logout event
            const user = this.getCurrentUser();
            if (user) {
                logSecurityEvent('logout', user.email, true);
            }
            
            // Clear session
            SecureStorage.remove('user_session');
            
            // Redirect to login
            window.location.href = 'login.html';
        }
    };
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        AuthSystem.init();
    });
    
    // Export for global access
    window.UniPortalAuth = {
        isAuthenticated: () => AuthSystem.isAuthenticated(),
        getCurrentUser: () => AuthSystem.getCurrentUser(),
        logout: () => AuthSystem.logout(),
        hasRole: (role) => {
            const user = AuthSystem.getCurrentUser();
            return user ? user.role === role : false;
        }
    };
    
})();