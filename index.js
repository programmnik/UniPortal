const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/dashboard', (req, res) => {
    res.render('main', {
        basePath: '/dashboard',
        title: 'Панель управления'
    });
});

app.get('/materials', (req, res) => {
    res.render('main', {
        basePath: '/materials',
        title: 'Материалы'
    });
});

app.get('/calendar', (req, res) => {
    res.render('main', {
        basePath: '/calendar',
        title: 'Календарь'
    });
});

app.get('/schedule', (req, res) => {
    res.render('main', {
        basePath: '/schedule',
        title: 'Расписание'
    });
});

app.get('/chat', (req, res) => {
    res.render('main', {
        basePath: '/chat',
        title: 'Чат'
    });
});

app.get('/journal', (req, res) => {
    res.render('main', {
        basePath: '/journal',
        title: 'Журнал'
    });
});

app.get('/information', (req, res) => {
    res.render('main', {
        basePath: '/information',
        title: 'Информация'
    });
});

app.get('/profile', (req, res) => {
    res.render('main', {
        basePath: '/profile',
        title: 'Профиль и настройки'
    });
});

app.use((req, res, next) =>{
    res.status(404).render('404');
});

const PORT = 3000;
const HOST = 'localhost';

app.listen(PORT, () =>{
    console.log(`Сервер запущен: http://${HOST}:${PORT}`);
});