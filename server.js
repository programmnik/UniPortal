const routesData = require('./public/roots/roots.json');

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));

routesData.forEach(route =>{
    app.get(route.path, (req, res) =>{
        res.render('main', {
            basePath: route.variables.basePath,
            title: route.variables.title
        });
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