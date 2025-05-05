const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/", (req, res, next) => {
  let user = null;
    if (typeof req.session.passport !== 'undefined') {
        user = req.session.passport.user;
    }
  if (user == null) {
    if (req.query.erro == 1) {
      res.render("usuario/login", {
        erro: "É necessário realizar login!",
        user: user,
      });
    } else if (req.query.erro == 2) {
      res.render("usuario/login", {
        erro: "Email e/ou senha incorretos!",
        user: user,
      });
    } else {
      res.render("usuario/login", { erro: null, user: user });
    }
  } else {
    res.redirect("back");
  }
  
});

router.post("/", (req, res, next) => {
  let tipo = req.body.tipo;
  if (tipo !== 'Aluno' && tipo !== 'Personal') {
    res.render('usuario/login', { erro: 'Tipo de usuário inválido!', user: null });
  } else {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("/login?erro=2");
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        if (tipo === 'Aluno') {
          passport.authenticate('local', {
            successRedirect: '/aluno', failureRedirect: '/login?erro=2'
          })(req, res, next);
        } else if (tipo === 'Personal') {
          passport.authenticate('local', {
            successRedirect: '/personal', failureRedirect: '/login?erro=2'
          })(req, res, next);
        }
      });
    })(req, res, next);
  }
});

module.exports = router;

