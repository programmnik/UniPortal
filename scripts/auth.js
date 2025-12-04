const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchText = document.getElementById('switchText');

let isLoginView = true;

function toggleAuthView(event) {
    if(event){
        event.preventDefault();
    }

    if(isLoginView){
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        switchText.innerHTML = 'Уже есть аккаунт? <a href="#" id="switchLink">Войти</a>';
        
    }else{
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        switchText.innerHTML = 'Ещё нет аккаунта? <a href="#" id="switchLink">Зарегистрироваться</a>';
    }

    isLoginView = !isLoginView;

    document.getElementById('switchLink').addEventListener('click', toggleAuthView);
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('remember').checked;

    const user = findUserByEmail(email);

    if(user){
        // 2. Проверяем пароль
        // ВАЖНО: В реальном проекте пароль нужно хешировать! 
        // Сейчас мы сравниваем открытый текст
        if(user.password === password){
            alert(`Добро пожаловать, ${user.nickname}!`);
            console.log('Параметр "Запомнить меня":', rememberMe);
            saveSession(user, rememberMe);
            window.location.href = 'dashboard.html';
        }else{
            alert('Ошибка: Неверный пароль.');
        }
    }else{
        alert('Ошибка: Пользователь с таким Email не найден.');
    }
}

/**
 * 
 * @param {Object} data
 * @returns {boolean} 
 */
function registerValidator(data){

    if(!data.nickname || !data.email || !data.password || !data.inviteCode){
        alert('Пожалуйста, заполните все обязательные поля!');
        return false;
    }

    if (!isValidEmail(data.email)){
        alert('Введите корректный Email!');
        return false;
    }

    if (!isValidPassword(data.password)){
        alert('Пароль должен быть не менее 8 символов и содержать буквы и цифры!');
        return false;
    }

    return true;
} 

function handleRegister(event) {
    event.preventDefault();

    const nickname = sanitizeInput(document.getElementById('regNickname').value);
    const email = sanitizeInput(document.getElementById('regEmail').value);
    const password = document.getElementById('regPassword').value;
    const inviteCode = sanitizeInput(document.getElementById('inviteCode').value);

    const userData = { nickname, email, password, inviteCode };

    if(!registerValidator(userData)){
        return;
    }

    const isSuccess = addUser(userData);

    if(isSuccess){
        alert(`Регистрация ${nickname} прошла успешно! Теперь войдите.`);

        registerForm.reset();

        if(!isLoginView){
            toggleAuthView();
        }
    }else{
        alert('Ошибка регистрации. Попробуйте другой Email/Никнейм/Код.');
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    if(registerForm){
        registerForm.style.display = 'none';
    }

    if(switchText){
        switchText.innerHTML = 'Ещё нет аккаунта? <a href="#" id="switchLink">Зарегистрироваться</a>';
    }
    
    if(document.getElementById('switchLink')){
        document.getElementById('switchLink').addEventListener('click', toggleAuthView);
    }

    if(loginForm){
        loginForm.addEventListener('submit', handleLogin);
    }

    if(registerForm){
        registerForm.addEventListener('submit', handleRegister);
    }
});
