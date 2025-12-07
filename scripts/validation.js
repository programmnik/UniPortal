/**
 * Очищает строку от потенциально опасных HTML-тегов, чтобы предотвратить XSS.
 * В идеале это должна делать Бэкенд-валидация, но это полезно и на клиенте.
 * @param {string} str
 * @returns {string}
 */
function sanitizeInput(str){
    if(typeof str != "string" || !str) return str;
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

/**
 * Проверяет Email на базовый формат.
 * @param {string} email
 * @returns {boolean} 
 */
function isValidEmail(email){
    const emailRegex = /^[^\s@]+@[^\s@]+(?:\.[^\s@]+)+$/;
    return emailRegex.test(email);
}

/**
 * Проверяет пароль на минимальные требования
 * @param {string} password
 * @returns {boolean}
 */
function isValidPassword(password){
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return password.length >= minLength && hasLetter && hasNumber;
}