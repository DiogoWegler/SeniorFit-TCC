const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const path = require('path');
var formidable = require('formidable');
var saltRounds = 10;
const { Op } = require('sequelize');
const multer = require('multer');

const Aluno = require('../model/Aluno');
const Personal = require('../model/Personal');
const Treinos = require('../model/Treinos');
const Exercicios = require('../model/Exercicios');
const Avaliacao = require('../model/Avaliacao');
const Feedback = require('../model/Feedback');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/videos')); // Define o diretório de destino para os arquivos
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        cb(null, `${hash}${ext}`); // Renomeia o arquivo com um hash + extensão
    }
});

const upload = multer({ storage: storage }).single('video'); // 'logo' é o nome do campo de arquivo no formulário

module.exports = {
    index: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        let aluno = await Aluno.findAll();
        let id = req.params.id;
        if (user.tipo == 'Personal') {
            res.render('personal/index', {aluno: aluno, erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id});
        }else{
            res.render('usuario/login', {aluno: aluno, erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
        
    },
    
    createaluno: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        let id = req.params.id;
        let personal = await Personal.findByPk(id);
        let aluno = await Aluno.findAll();
        if (user.tipo == 'Personal') {
            res.render('personal/cadastroaluno', {aluno: aluno, personal: personal, user: user, id: id, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
        }else{
            res.render('usuario/login', {aluno: aluno, erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    storealuno: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        let emailEmUso = await Aluno.findAll({
            where: {
                email: req.body['email'],
            }
        });
        if (emailEmUso != '') {
            req.flash('erro', 'Email já cadastrado!')
            res.redirect('/personal/cadastroaluno');
        } else {
        bcrypt.hash(req.body['senha'], saltRounds, function(err, hash){
        Aluno.create({nome: req.body['nome'], email: req.body['email'], senha: hash, tipo: 'Aluno', id_personal: user.id}).then(result => {
            req.flash('sucesso', 'Novo aluno cadastrado com sucesso!');
            res.render('personal/cadastroaluno', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user});
        }).catch(err => {
            console.log(req.body);
            req.flash('erro', 'Falha ao cadastrar aluno');
            res.render('personal/cadastroaluno', {erro: req.flash('erro')}); 
        }); });
    }
    },

    show: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        let alunos = await Aluno.findAll({
            raw: true,
            where: {
                id_personal: user.id // Busca por alunos do personal logado
            }
        });
        var id = req.params.id;
        let personal = await Personal.findByPk(id);
        if (user.tipo == 'Personal') {
            res.render('personal/visualizar', {personal: personal, user: user, id: id, alunos, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
        }else{
            res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    deletealuno: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        let id = req.params.id;
        let alunos = await Aluno.findOne({ where: { id: req.params.id } });
        if (user.id !== alunos.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        let aluno = await Aluno.findAll({
            raw: true,
            where: {
                id: id // Busca por alunos do personal logado
            }
        });
        if (user.tipo == 'Personal') {
        res.render('personal/deletealuno', {aluno: aluno, user: user, id: id, erro: req.flash('erro'), alunos});
        }else{
            res.render('usuario/login', {aluno: aluno, alunos, erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    destroyaluno: async function (req, res) {
        const id = req.params.id;
        const aluno = await Aluno.findByPk(id);
        const treinos = await Treinos.findAll({ where: { id_aluno: id } });
        const avaliacao = await Avaliacao.findAll({ where: { id_aluno: id } });
        const feedback = await Feedback.findAll({ where: { id_aluno: id } });
        const exercicios = await Exercicios.findAll({ where: { id_treino: treinos.map(treino => treino.id) } });


        // Remove os exercícios relacionados ao aluno
        await Exercicios.destroy({ where: { id_treino: treinos.map(treino => treino.id) } });

        
        await Feedback.destroy({ where: { id_feedback: feedback.map(feedback => feedback.id) } });

        await Avaliacao.destroy({ where: { id_avaliacao: avaliacao.map(avaliacao => avaliacao.id) } });

        // Remove os treinos relacionados ao aluno
        await Treinos.destroy({ where: { id_aluno: id } });

        
        // Remove o aluno
        await Aluno.destroy({ where: { id: id } })
            .then(result => {
            req.flash('sucesso', 'Aluno removido com sucesso!');
            res.redirect('/personal/visualizar');
        })
            .catch(err => {
            console.log(err);
            req.flash('erro', 'Erro ao remover aluno');
            res.redirect('/personal/visualizar');
        });
    },

    editaluno: async function (req, res) {
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        var id = req.params.id;
        let aluno = await Aluno.findOne({ where: { id: req.params.id } });
        if (user.id !== aluno.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        let alunos = await Aluno.findByPk(id);
        res.render('personal/editaluno', {alunos, aluno, user, id, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
    },
    update: async function (req, res) {

        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        id = req.params.id;
        const alunoExistente = await Aluno.findOne({
            where: {
                email: req.body['email'],
                id: id
            }
        });
        const alunoExistente2 = await Aluno.findOne({
            where: {
                email: req.body['email']
            }
        });

        if (alunoExistente) {
            bcrypt.hash(req.body['senha'], saltRounds, function(err, hash){
                Aluno.update({nome: req.body['nome'], email: req.body['email'], senha: hash, tipo: 'Aluno', id_personal: user.id}, { where: {id: id}}).then(result => {
                    req.flash('sucesso', 'Aluno atualizado com sucesso!');
                    res.render('personal/cadastroaluno', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user});
                }).catch(err => {
                    console.log(req.body);
                    req.flash('erro', 'Falha ao cadastrar aluno');
                    res.render('personal/cadastroaluno', {erro: req.flash('erro')}); 
                }); 
            });
        } else if (alunoExistente2) {
            req.flash('erro', 'Email já cadastrado!');
            res.redirect('/personal/cadastroaluno/');
        } else{
            bcrypt.hash(req.body['senha'], saltRounds, function(err, hash){
                Aluno.update({nome: req.body['nome'], email: req.body['email'], senha: hash, tipo: 'Aluno', id_personal: user.id}, { where: {id: id}}).then(result => {
                    req.flash('sucesso', 'Aluno atualizado com sucesso!');
                    res.render('personal/cadastroaluno', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user});
                }).catch(err => {
                    console.log(req.body);
                    req.flash('erro', 'Falha ao cadastrar aluno');
                    res.render('personal/cadastroaluno', {erro: req.flash('erro')}); 
                }); 
            });
        }
    },
    showtreino: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        id = req.params.id;
        let aluno = await Aluno.findByPk(id);
        let alunos = await Aluno.findOne({ where: { id: req.params.id } });
        if (user.id !== alunos.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        const treinos = await Treinos.findAll({
            where: {
                id_personal: user.id,
                id_aluno: id
            }
        });
        if (user.tipo == 'Personal') {
            res.render('personal/visualizartreinos', {user: user, treinos, id: id, aluno, erro: req.flash('erro'), sucesso: req.flash('sucesso'), alunos});
        }else{
            res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    cadastrotreino: async function (req, res) {
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        let alunos = await Aluno.findOne({ where: { id: req.params.id } });
        if (user.id !== alunos.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        var id = req.params.id;
        let aluno = await Aluno.findByPk(id);
        res.render('personal/cadastrotreino', {aluno, alunos, user, id, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
    },
    storetreino: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        id = req.params.id;
        let alunos = await Aluno.findAll({
            raw: true,
            where: {
                id_personal: user.id // Busca por alunos do personal logado
            }
        });
        Treinos.create({nome_treino: req.body['nome'], parte_treino: req.body['parte'], id_personal: user.id, id_aluno: id}).then(result => {
            req.flash('sucesso', 'Novo treino cadastrado com sucesso!');
            res.render('personal/cadastrotreino', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user, alunos});
        }).catch(err => {
            console.log(req.body);
            req.flash('erro', 'Falha ao cadastrar treino');
            res.render('personal/visualizar', {erro: req.flash('erro'), alunos}); 
        });
    
    },
    destroytreino: async function (req, res) {
        id = req.params.id;
        const treino = await Treinos.findByPk(id);
        const exercicios = await Exercicios.findAll({ where: { id_treino: id } });
    
        if (exercicios.length > 0) {
            // Deletar exercícios
            Exercicios.destroy({
                where: {
                    id_treino: id
                }
            }).then(result => {
                // Remover vídeos associados aos exercícios
                exercicios.forEach(exercicio => {
                    if (exercicio.video_exe) {
                        const video = path.join(__dirname, '../public/videos/', exercicio.video_exe);
                        fs.unlink(video, (err) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    }
                });
    
                // Deletar o treino depois de excluir os exercícios e vídeos
                Treinos.destroy({
                    where: {
                        id_treino: id
                    }
                }).then(result => {
                    req.flash('sucesso', 'Treino removido com sucesso!');
                    res.redirect('/personal/visualizar');
                }).catch(err => {
                    console.log(err);
                    req.flash('erro', 'Erro ao remover treino');
                    res.redirect('/personal/visualizar');
                });
            }).catch(err => {
                console.log(err);
                req.flash('erro', 'Erro ao remover exercícios');
                res.redirect('/personal/visualizar');
            });
        } else {
            // Se não houver exercícios, apenas exclua o treino
            Treinos.destroy({
                where: {
                    id_treino: id
                }
            }).then(result => {
                req.flash('sucesso', 'Treino removido com sucesso!');
                res.redirect('/personal/visualizar');
            }).catch(err => {
                console.log(err);
                req.flash('erro', 'Erro ao remover treino');
                res.redirect('/personal/visualizar');
            });
        }
    },
    
    showExe: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        id = req.params.id;
        let treinos = await Treinos.findOne({ where: { id_treino: req.params.id } });
        if (user.id !== treinos.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        const exercicios = await Exercicios.findAll({
            where: {
                id_treino: id
            }
        });
        if (user.tipo == 'Personal') {
            res.render('personal/visualizarexercicios', {user: user, exercicios, erro: req.flash('erro'), sucesso: req.flash('sucesso'), treinos});
        }else{
            res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    createExercicio: async function (req, res) {
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        let treinos = await Treinos.findOne({ where: { id_treino: req.params.id } });
        if (user.id !== treinos.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        var id = req.params.id;
        let aluno = await Aluno.findByPk(id);
        res.render('personal/cadastroexercicio', {aluno, treinos, user, id, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
    },
    storeExe: async function (req, res) {
        let id = req.params.id;
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }

        upload(req, res, function (err) {
            console.log(req.body, req.file);
            if (err) {
                console.log(err);
                req.flash('erro', 'Falha ao fazer upload do arquivo');
                res.redirect('/personal');
            } else {
                const fields = req.body;
                const file = req.file;

                    const hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
                    const nomeimg = `${hash}.${file.mimetype.split('/')[1]}`;
                    const newpath = path.join(__dirname, '../public/videos', nomeimg);

                    fs.rename(file.path, newpath, function (err) {
                        if (err) throw err;
                    });

                    Exercicios.create({ nome_exe: fields.nome, video_exe: nomeimg, series_exe: fields.series, repet_exe: fields.repet, tempo_exe: fields.tempo, carga_exe: fields.carga, intervalo_exe: fields.intervalo, dica_exe: fields.dica, id_treino: id}).then(result => {
                        req.flash('sucesso', 'Novo exercício cadastrado com sucesso!');
                        res.redirect('/personal/visualizar');
                    }).catch(err => {
                        console.log(err);
                        req.flash('erro', 'Falha ao cadastrar exercicio');
                        res.redirect('/personal/visualizar');
                    });
            }
        });
    },
    destroyExe: async function (req, res) {
        id = req.params.id;
        const exercicios = await Exercicios.findByPk(id);
        Exercicios.destroy({
            where: {
                id_exercicios: id
            }
        }).then(result => {
            var video = path.join(__dirname, '../public/videos/', exercicios.video_exe);
            fs.unlink(video, (err) => { })
            req.flash('sucesso', 'Exercício removido com sucesso!');
            res.redirect('/personal/visualizartreinos/exercicios/' + exercicios.id_treino);
        }).catch(err => {
            console.log(err);
            req.flash('erro', 'Erro ao remover exercicio');
            res.redirect('/personal/visualizar');
        });
    },
    showver: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        var id = req.params.id;
        let aluno = await Aluno.findOne({ where: { id: req.params.id } });
        if (user.id !== aluno.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        let alunos = await Aluno.findAll({
            raw: true,
            where: {
                id_personal: user.id,
                id: id 
            }
        });
        if (user.tipo == 'Personal') {
            res.render('personal/ver', { user: user, id: id, alunos, aluno, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
        }else{
            res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    showAva: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        var id = req.params.id;
        let aluno = await Aluno.findOne({ where: { id: req.params.id } });
        if (user.id !== aluno.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        let avaliacao = await Avaliacao.findAll({
            raw: true,
            where: {
                id_personal: user.id,
                id_aluno: id 
            }
        });
        if (user.tipo == 'Personal') {
            res.render('personal/avaliacao', { user: user, id: id, aluno, avaliacao, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
        }else{
            res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    createAva: async function (req, res) {
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        var id = req.params.id;
        let alunos = await Aluno.findOne({ where: { id: req.params.id } });
        if (user.id !== alunos.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        let aluno = await Aluno.findByPk(id);
        if (user.tipo == 'Personal') {
        res.render('personal/cadastroavaliacao', {aluno, alunos, user, id, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
        }else{
        res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
    }
    },
    storeAva: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        let id = req.params.id;
        Avaliacao.create({avaliacao: req.body['avaliacao'], desc_avali: req.body['desc_avali'], id_personal: user.id, id_aluno: id}).then(result => {
            req.flash('sucesso', 'Nova avalição cadastrado com sucesso!');
            res.redirect('/personal/cadastroavaliacao/' + id);
        }).catch(err => {
            console.log(req.body);
            req.flash('erro', 'Falha ao cadastrar avaliação');
            res.render('personal/cadastroaluno', {erro: req.flash('erro')}); 
        }); 
    },
    destroyAva: async function (req, res) {
        id = req.params.id;
        let avaliacao = await Avaliacao.findByPk(id);
        Avaliacao.destroy({
            where: {
                id_avaliacao: id
            }
        }).then(result => {
            req.flash('sucesso', 'Avaliação removida com sucesso!');
            res.redirect('/personal/visualizaravaliacoes/'+ avaliacao.id_aluno);
        }).catch(err => {
            console.log(err);
            req.flash('erro', 'Erro ao remover avaliação');
            res.redirect('/personal/visualizar');
        });
    },
    showFeed: async function(req, res){
        let user = null;
        if (typeof req.session.passport !== 'undefined') {
            user = req.session.passport.user;
        }
        var id = req.params.id;
        let aluno = await Aluno.findOne({ where: { id: req.params.id } });
        if (user.id !== aluno.id_personal) {
            return res.status(403).send("Acesso negado.");
        }
        let feedback = await Feedback.findAll({
            raw: true,
            where: {
                id_personal: user.id,
                id_aluno: id 
            }
        });
        if (user.tipo == 'Personal') {
            res.render('personal/feedback', { user: user, id: id, aluno, feedback, erro: req.flash('erro'), sucesso: req.flash('sucesso')});
        }else{
            res.render('usuario/login', {erro: req.flash('erro'), sucesso: req.flash('sucesso'), user: user, id: id, erro: 'Alunos não podem acessar essa área, faça login!'});
        }
    },
    destroyFeed: async function (req, res) {
        id = req.params.id;
        let feedback = await Feedback.findByPk(id);
        Feedback.destroy({
            where: {
                id_feedback: id
            }
        }).then(result => {
            req.flash('sucesso', 'Feedback visto!');
            res.redirect('/personal/visualizarfeedback/' + feedback.id_aluno);
        }).catch(err => {
            console.log(err);
            req.flash('erro', 'Erro ao remover Feedback');
            res.redirect('/personal/visualizar');
        });
    },

};