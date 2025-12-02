document.addEventListener('DOMContentLoaded', function() {
    const headmanForm = document.getElementById('headmanForm');
    const authMessage = document.getElementById('authMessage');
    
    headmanForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const code = document.getElementById('headmanCode').value.trim();
        
        if (!code) {
            showMessage('Введите код старосты', 'error');
            return;
        }
        
        // Заглушка для проверки кода
        if (code === 'STUDENT2024') {
            showMessage('Поздравляем! Теперь вы староста группы.', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showMessage('Неверный код старосты', 'error');
        }
    });
    
    function showMessage(text, type) {
        authMessage.textContent = text;
        authMessage.className = 'auth-message ' + type;
    }
});