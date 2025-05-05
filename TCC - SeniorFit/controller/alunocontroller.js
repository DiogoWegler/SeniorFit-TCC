const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
var formidable = require('formidable');
var saltRounds = 10;

const Aluno = require('../model/Aluno');
const Personal = require('../model/Personal');
const Treino = require('../model/Treinos');
const Exercicios = require('../model/Exercicios');
const Avaliacao = require('../model/Avaliacao');
const Feedback = require('../model/Feedback');

module.exports = {
    index: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        let aluno = await Aluno.findOne({ where: { id: user.id } });
        let id = req.params.id;
        if (user.tipo == 'Aluno') {
            res.render('aluno/index', {aluno: aluno, erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id});
        } else {
            res.render('usuario/login', {aluno: aluno, erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Personal trainers não podem acessar essa área, faça login'},);
        } 
    },
    showtreino: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        id = req.params.id;
        console.log(id);
        console.log(user.id);
        let aluno = await Aluno.findByPk(id);
        if (user.id != req.params.id) {
            return res.status(403).send("Acesso negado.");
        }
        const treinos = await Treino.findAll({
            where: {
                id_aluno: id
            }
        });
        if (user.tipo == 'Aluno') {
            res.render('aluno/visualizartreinos', {user: user, treinos, id: id, aluno, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
        }else{
            res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    showExe: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        id = req.params.id;
        let treinos = await Treino.findOne({ where: { id_treino: req.params.id } });
        if (user.id !== treinos.id_aluno) {
            return res.status(403).send("Acesso negado.");
        }
        const exercicios = await Exercicios.findAll({
            where: {
                id_treino: id
            }
        });
        if (user.tipo == 'Aluno') {
            res.render('aluno/visualizarexercicios', {user: user, exercicios, erro: req.flash('erro'), sucesso: req.flash('sucesso'), treinos});
        }else{
            res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    store: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        const exercicios = await Exercicios.findAll({
            where: {
                id_treino: id
            }
        });
        id = req.params.id;
        let treinos = await Treino.findOne({ where: { id_treino: req.params.id } });
        if (user.id !== treinos.id_aluno) {
            return res.status(403).send("Acesso negado.");
        }

        Feedback.create({desc_feed: req.body['desc_feed'], qualid_feed: req.body['qualid_feed'], nome_treino: treinos.nome_treino,id_personal: treinos.id_personal, id_aluno: user.id}).then(result => {
            req.flash('sucesso', 'Feedback cadastrado com sucesso!');
            res.render('aluno/visualizarexercicios', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, treinos, exercicios});
        }).catch(err => {
            console.log(req.body);
            req.flash('erro', 'Falha ao cadastrar aluno');
            res.render('aluno/index', {erro: req.flash('erro')}); 
        });
    },
    showAva: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        var id = req.params.id;
        let aluno = await Aluno.findByPk(id);
        if (user.id != req.params.id) {
            return res.status(403).send("Acesso negado.");
        }
        let avaliacao = await Avaliacao.findAll({
            raw: true,
            where: {
                id_aluno: id 
            }
        });
        if (user.tipo == 'Aluno') {
            res.render('aluno/visualizaravaliacao', { user: user, id: id, aluno, avaliacao, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
        }else{
            res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    vistoAva: async function (req, res) {
        id = req.params.id;
        let avaliacao = await Avaliacao.findByPk(id);
        Avaliacao.destroy({
            where: {
                id_avaliacao: id
            }
        }).then(result => {
            req.flash('sucesso', 'Avaliação vista!');
            res.redirect('/aluno/visualizaravaliacao/' + avaliacao.id_aluno);
        }).catch(err => {
            console.log(err);
            req.flash('erro', 'Erro ao remover Feedback');
            res.redirect('/aluno/visualizar');
        });
    },
};