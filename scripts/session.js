const SESSION_KEY = 'uniportal_active_user';

/**
 * 1. Сохраняет данные пользователя в LocalStorage или SessionStorage.
 * @param {Object} user 
 * @param {boolean} rememberMe
 */
function saveSession(user, rememberMe) {
    
    const sessionData = {
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        group: user.group
    };

    const dataJson = JSON.stringify(sessionData);

    if(rememberMe){
        // LocalStorage: сохраняет сессию между закрытиями браузера
        localStorage.setItem(SESSION_KEY, dataJson);
    }else{
        // SessionStorage: сессия будет удалена, как только пользователь закроет вкладку/браузер
        sessionStorage.setItem(SESSION_KEY, dataJson);
    }
}

/**
 * 2. Получает данные текущего пользователя из хранилища.
 * Сначала проверяет SessionStorage (временную), затем LocalStorage (постоянную).
 * @returns {Object | null} Объект пользователя или null, если сессия отсутствует.
 */
function getCurrentUser(){
    let dataJson = sessionStorage.getItem(SESSION_KEY);

    if(!dataJson){
        dataJson = localStorage.getItem(SESSION_KEY);
    }

    if(dataJson){
        try{
            return JSON.parse(dataJson);
        }catch(e){
            console.error('Ошибка парсинга сессии:', e);
            return null;
        }
    }
    return null;
}

/**
 * 3. Удаляет сессию из обоих хранилищ. (Функция "Выход").
 */
function destroySession(){
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    console.log('Сессия пользователя успешно уничтожена (Выход).');
}

/**
 * 4. Проверяет авторизацию на защищенных страницах и перенаправляет, если ее нет.
 * @param {string} redirectUrl - URL, куда перенаправить неавторизованного пользователя.
 * @returns {boolean} true, если пользователь авторизован.
 */
function checkAuth(redirectUrl = 'login.html'){
    const user = getCurrentUser();

    if(!user){
        console.warn(`Неавторизованный доступ к ${window.location.pathname}. Перенаправление на ${redirectUrl}`);
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

