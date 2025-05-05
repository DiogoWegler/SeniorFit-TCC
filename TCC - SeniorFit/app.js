const express = require("express");
var session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
var cadastropersonalRouter = require('./routes/cadastropersonal');
var loginRouter = require('./routes/login');
var personalRouter = require('./routes/personal');
var alunoRouter = require('./routes/aluno');
const database = require('./config/db');
const Personal = require("./model/Personal");
const app = express();
const path = require("path");
const LocalStrategy = require('passport-local').Strategy;
const port = 3000;

app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 }
    }));
    

database.sync().then( result => {
    console.log("Tabela sincronizada com sucesso!");
});

require('./config/auth')(passport);
app.use(express.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(flash());
app.use('/cadastropersonal', cadastropersonalRouter);
app.use('/personal', authenticationMiddleware, personalRouter);
app.use('/aluno', authenticationMiddleware, alunoRouter);
app.use('/login', loginRouter);
app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/', function(req, res){
    let user = req.user ? req.user : null
    res.render('index', {user: user});
});

app.get("/cadastropersonal", (req, res) => {
    res.render("usuario/cadastropersonal"); 
});

function authenticationMiddleware(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect('/login?erro=1');
}



app.listen(port, () => console.log("Rodando"));
