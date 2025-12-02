// Database API для UniPortal
class DatabaseAPI {
    constructor() {
        this.baseUrl = ''; // В реальном приложении здесь будет URL API
        this.isDemoMode = true; // Режим демо - пока используем localStorage
        this.init();
    }

    init() {
        // Инициализация локального хранилища для демо-режима
        if (this.isDemoMode && !localStorage.getItem('uniportal_demo_data')) {
            this.createDemoData();
        }
    }

    // Методы для работы с пользователями
    async authenticate(email, password) {
        if (this.isDemoMode) {
            return this.demoAuthenticate(email, password);
        }
        
        // В реальном приложении здесь будет fetch запрос к API
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Auth error:', error);
            return { success: false, message: 'Ошибка соединения' };
        }
    }

    async register(userData) {
        if (this.isDemoMode) {
            return this.demoRegister(userData);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Ошибка соединения' };
        }
    }

    async getUserInfo(email) {
        if (this.isDemoMode) {
            return this.demoGetUserInfo(email);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/users/${email}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            return await response.json();
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    // Методы для работы с группами
    async getUserGroups(email) {
        if (this.isDemoMode) {
            return this.demoGetUserGroups(email);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/users/${email}/groups`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            return await response.json();
        } catch (error) {
            console.error('Get groups error:', error);
            return [];
        }
    }

    async isGroupLeader(email) {
        if (this.isDemoMode) {
            return this.demoIsGroupLeader(email);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/users/${email}/is-leader`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            const data = await response.json();
            return data.isLeader || false;
        } catch (error) {
            console.error('Check leader error:', error);
            return false;
        }
    }

    async isAdmin(email) {
        if (this.isDemoMode) {
            return this.demoIsAdmin(email);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/users/${email}/is-admin`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            const data = await response.json();
            return data.isAdmin || false;
        } catch (error) {
            console.error('Check admin error:', error);
            return false;
        }
    }

    // Демо-реализации (работают через localStorage)
    demoAuthenticate(email, password) {
        const demoData = JSON.parse(localStorage.getItem('uniportal_demo_data') || '{}');
        const users = demoData.users || {};
        
        const user = users[email];
        if (!user) {
            return {
                success: false,
                message: 'Пользователь не найден'
            };
        }
        
        if (user.password !== password) {
            return {
                success: false,
                message: 'Неверный пароль'
            };
        }
        
        // Создаем сессию
        const session = {
            email: user.email,
            nickname: user.nickname,
            role: user.role,
            group: user.group,
            userId: user.userId
        };
        
        localStorage.setItem('uni_session', JSON.stringify({
            user: session,
            sessionId: 'demo_' + Date.now(),
            created: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000)
        }));
        
        return {
            success: true,
            message: 'Вход выполнен успешно',
            user: session
        };
    }

    demoRegister(userData) {
        const demoData = JSON.parse(localStorage.getItem('uniportal_demo_data') || '{}');
        const users = demoData.users || {};
        const groups = demoData.groups || {};
        
        // Проверяем существование email
        if (users[userData.email]) {
            return {
                success: false,
                message: 'Пользователь с таким email уже существует'
            };
        }
        
        // Проверяем существование никнейма
        for (const user of Object.values(users)) {
            if (user.nickname === userData.nickname) {
                return {
                    success: false,
                    message: 'Пользователь с таким никнеймом уже существует'
                };
            }
        }
        
        // Проверяем пригласительный код
        const inviteCode = userData.inviteCode;
        let role = 'student';
        let group = 'IT-101'; // По умолчанию
        
        if (inviteCode === 'LEADER2024') {
            role = 'leader';
        } else if (inviteCode === 'ADMIN2024') {
            role = 'admin';
        } else if (inviteCode !== 'STUDENT2024') {
            return {
                success: false,
                message: 'Неверный пригласительный код'
            };
        }
        
        // Создаем пользователя
        const userId = 'usr_' + Date.now();
        users[userData.email] = {
            email: userData.email,
            password: userData.password,
            nickname: userData.nickname,
            role: role,
            group: group,
            userId: userId,
            createdAt: new Date().toISOString()
        };
        
        // Добавляем пользователя в группу
        if (!groups[group]) {
            groups[group] = {
                groupId: group,
                groupName: `Группа ${group}`,
                members: []
            };
        }
        groups[group].members.push(userData.email);
        
        // Обновляем demoData
        demoData.users = users;
        demoData.groups = groups;
        localStorage.setItem('uniportal_demo_data', JSON.stringify(demoData));
        
        // Создаем сессию
        const session = {
            email: userData.email,
            nickname: userData.nickname,
            role: role,
            group: group,
            userId: userId
        };
        
        localStorage.setItem('uni_session', JSON.stringify({
            user: session,
            sessionId: 'demo_' + Date.now(),
            created: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000)
        }));
        
        return {
            success: true,
            message: 'Регистрация успешна',
            user: session
        };
    }

    demoGetUserInfo(email) {
        const demoData = JSON.parse(localStorage.getItem('uniportal_demo_data') || '{}');
        const users = demoData.users || {};
        
        const user = users[email];
        if (!user) return null;
        
        // Добавляем дополнительные поля
        return {
            ...user,
            attendance: 95,
            progress: [
                { subject: 'Высшая математика', percent: 75, modules: '3/4' },
                { subject: 'Физика', percent: 40, modules: '2/5' },
                { subject: 'Программирование', percent: 90, modules: '9/10' }
            ],
            messages: [
                { sender: 'Ирина Петрова', title: 'Обновление по проекту', time: '1 час назад' },
                { sender: 'Группа по физике', title: 'Встреча завтра', time: '3 часа назад' }
            ],
            schedule: [
                { name: 'Физика', teacher: 'Доц. Сергеев А.В.', time: '10:00-11:30', location: 'Аудитория 301' },
                { name: 'Программирование', teacher: 'Проф. Иванова Е.П.', time: '13:00-14:30', location: 'Онлайн' }
            ]
        };
    }

    demoGetUserGroups(email) {
        const demoData = JSON.parse(localStorage.getItem('uniportal_demo_data') || '{}');
        const users = demoData.users || {};
        const user = users[email];
        
        return user ? [user.group] : [];
    }

    demoIsGroupLeader(email) {
        const demoData = JSON.parse(localStorage.getItem('uniportal_demo_data') || '{}');
        const users = demoData.users || {};
        const user = users[email];
        
        return user ? user.role === 'leader' : false;
    }

    demoIsAdmin(email) {
        const demoData = JSON.parse(localStorage.getItem('uniportal_demo_data') || '{}');
        const users = demoData.users || {};
        const user = users[email];
        
        return user ? user.role === 'admin' : false;
    }

    createDemoData() {
        const demoData = {
            users: {
                'student@uniportal.ru': {
                    email: 'student@uniportal.ru',
                    password: 'student123',
                    nickname: 'ИванСтудент',
                    role: 'student',
                    group: 'IT-101',
                    userId: 'stu_001',
                    createdAt: new Date().toISOString()
                },
                'leader@uniportal.ru': {
                    email: 'leader@uniportal.ru',
                    password: 'leader123',
                    nickname: 'АннаСтароста',
                    role: 'leader',
                    group: 'IT-101',
                    userId: 'ldr_001',
                    createdAt: new Date().toISOString()
                },
                'admin@uniportal.ru': {
                    email: 'admin@uniportal.ru',
                    password: 'admin123',
                    nickname: 'АдминСистемы',
                    role: 'admin',
                    group: 'IT-101',
                    userId: 'adm_001',
                    createdAt: new Date().toISOString()
                }
            },
            groups: {
                'IT-101': {
                    groupId: 'IT-101',
                    groupName: 'Информационные технологии 101',
                    members: ['student@uniportal.ru', 'leader@uniportal.ru', 'admin@uniportal.ru'],
                    leaders: ['leader@uniportal.ru']
                }
            },
            admins: ['admin@uniportal.ru']
        };
        
        localStorage.setItem('uniportal_demo_data', JSON.stringify(demoData));
        console.log('✅ Демо-данные созданы');
    }

    // Вспомогательные методы
    getToken() {
        const session = localStorage.getItem('uni_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                return parsed.sessionId;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    clearSession() {
        localStorage.removeItem('uni_session');
    }
}

// Глобальный объект для доступа к API
window.UniPortalDB = new DatabaseAPI();