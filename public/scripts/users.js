const USERS_STORAGE_KEY = 'uniportal_users';

/**
 * 1. Загружает список пользователей из LocalStorage.
 * @returns {Array<Object>} Массив объектов пользователей.
 */
function getUsers() {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
}

/**
 * 2. Сохраняет текущий список пользователей в LocalStorage.
 * @param {Array<Object>} users - Массив объектов пользователей.
 */
function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * 3. Добавляет нового пользователя в хранилище.
 * @param {Object} user - Объект нового пользователя ({nickname, email, password, inviteCode}).
 * @returns {boolean} true, если пользователь добавлен, false, если email или nickname уже существует.
 */
function addUser(user) {
    const users = getUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
    const nicknameExists = users.some(u => u.nickname.toLowerCase() === user.nickname.toLowerCase());

    if (emailExists) {
        console.error('Ошибка: Пользователь с таким Email уже зарегистрирован.');
        return false;
    }

    if (nicknameExists) {
        console.error('Ошибка: Пользователь с таким Никнеймом уже зарегистрирован.');
        return false;
    }

    if (!user.inviteCode || user.inviteCode.trim() === '') {
        console.error('Ошибка: Пригласительный код обязателен.');
        return false;
    }

    const defaultRole = user.inviteCode.startsWith('ADMIN') ? 'Администратор' : 'Студент';
    const defaultGroup = user.inviteCode.endsWith('2024') ? 'Group-A' : 'Group-B';

    users.push({
        ...user,
        // !!! ВАЖНО: Пароли здесь хранятся в открытом виде!
        // В продакшене их нужно хешировать на сервере (например, bcrypt).
        // Это лишь симуляция для клиентской логики.
        role: defaultRole,
        group: defaultGroup,
        // Удаляем inviteCode, так как он выполнил свою роль
        inviteCode: undefined
    });

    saveUsers(users);
    console.log('Пользователь успешно зарегистрирован:', user.email);
    return true;
}

/**
 * 4. Находит пользователя по email для входа.
 * @param {string} email - Email пользователя.
 * @returns {Object | undefined} Объект пользователя или undefined.
 */
function findUserByEmail(email) {
    const users = getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}