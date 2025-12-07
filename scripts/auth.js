const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchText = document.getElementById('switchText');
let registerTab;
let loginTab;

let isLoginView = true;

function toggleAuthView(event) {
    registerTab = document.getElementById('registerTab');
    loginTab = document.getElementById('loginTab');
    if(event){
        event.preventDefault();
    }

    if(isLoginView){
        if (loginTab && registerTab) {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        } else {
            alert('Элементы не найдены!');
        }
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        switchText.innerHTML = 'Уже есть аккаунт? <a href="#" id="switchLink">Войти</a>';
        document.getElementById('loginTab').addEventListener('click', toggleAuthView);
    }else{
        if (loginTab && registerTab) {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            alert('Элементы не найдены!');
        }
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        switchText.innerHTML = 'Ещё нет аккаунта? <a href="#" id="switchLink">Зарегистрироваться</a>';
        document.getElementById('registerTab').addEventListener('click', toggleAuthView);
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

    if(document.getElementById('registerTab')){
        document.getElementById('registerTab').addEventListener('click', toggleAuthView);
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
