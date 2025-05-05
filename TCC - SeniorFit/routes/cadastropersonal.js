const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const Personal = require("../model/Personal");
var saltRounds = 10;

router.get('/', function(req, res){
    let user = null;
    if (typeof req.session.passport !== 'undefined') {
        user = req.session.passport.user;
    }
    if (user == null) {
        res.render('usuario/cadastropersonal', { user, erro: req.flash('erro') });
    } else {
        res.redirect('back');
    }
});
router.post('/', async function(req, res){
    let emailEmUso = await Personal.findAll({
        where: {
            email: req.body['email']
        }
    });
    if (emailEmUso != '') {
        req.flash('erro', 'Email já cadastrado!')
        res.redirect('/cadastropersonal');
    } else {
    bcrypt.hash(req.body['senha'], saltRounds, function(err, hash){
        const resultadoCadastro = Personal.create({
            nome: req.body['nome'],
            email: req.body['email'],
            senha: hash,
            tipo: 'Personal'
        })
    });
    res.redirect('/login');
    }
});

module.exports = router;