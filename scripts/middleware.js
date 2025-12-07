// Middleware для защиты страниц
class AuthMiddleware {
    static init() {
        // Проверяем аутентификацию на всех страницах кроме login.html
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('index.html')) {
            
            // Ждем загрузки auth.js
            setTimeout(() => {
                if (typeof UniPortalAuth === 'undefined') {
                    console.error('Auth system not loaded');
                    return;
                }
                
                if (!UniPortalAuth.isAuthenticated()) {
                    // Сохраняем текущую страницу для редиректа после входа
                    const returnUrl = window.location.pathname;
                    localStorage.setItem('return_url', returnUrl);
                    
                    // Перенаправляем на страницу входа
                    window.location.href = 'login.html';
                }
            }, 100);
        }
    }
    
    static checkRole(requiredRole) {
        if (typeof UniPortalAuth === 'undefined') return false;
        
        if (!UniPortalAuth.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (!UniPortalAuth.hasRole(requiredRole)) {
            alert('У вас недостаточно прав для доступа к этой странице');
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    }
}

// Инициализируем при загрузке
document.addEventListener('DOMContentLoaded', AuthMiddleware.init);