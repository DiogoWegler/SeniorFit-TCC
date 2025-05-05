const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const Aluno = require('../model/Aluno');
const Personal = require('../model/Personal');

module.exports = function (passport){
    async function findUser(email, tipo){
        let user;
        if (tipo === 'Aluno') {
            user = await Aluno.findOne({
                raw: true, where: {
                    email: email
                }
            });
        } else if (tipo === 'Personal') {
            user = await Personal.findOne({
                raw: true, where: {
                    email: email
                }
            });
        }
        if(user){
            return user;
        } else {
            return null;
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'senha', passReqToCallback: true},
        async(req, email, senha, done) => {
            const tipo = req.body.tipo;
            try {
                const user = await findUser(email, tipo);
                if(!user){
                    return done(null,false);
                }
                const isValid = bcrypt.compareSync(senha, user.senha);
                if(!isValid){
                    return done(null, false);
                }
                return done(null, user);
            } catch (err) {
                done(err, false);
            }
        }));

    passport.serializeUser((user, done) => {
            done(null, {id: user.id, nome: user.nome, tipo: user.tipo});   
    });


    passport.deserializeUser(async (id, done) => {
        try {
            let user = await Personal.findAll({
                where: {
                    id: id
                }
            })
            if (!user) {
                user = await Aluno.findAll({
                    where: {
                        id: id
                    }
                })
            }
            done(null, user);
        } catch (err){
            done(err, null);
        }
    });

}