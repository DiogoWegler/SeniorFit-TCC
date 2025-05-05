const express = require('express');
const router = express.Router();
const alunoController = require('../controller/alunocontroller');

router.get('/', authenticationMiddleware, alunoController.index);
router.get('/visualizartreinos/:id', authenticationMiddleware, alunoController.showtreino);

router.get('/visualizarexercicios/:id', authenticationMiddleware, alunoController.showExe);
router.post('/visualizarexercicios/:id', authenticationMiddleware, alunoController.store);

router.get('/visualizaravaliacao/:id', authenticationMiddleware, alunoController.showAva);
router.get('/visualizaravaliacao/visto/:id', authenticationMiddleware, alunoController.vistoAva);


function authenticationMiddleware(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect('/login?erro=1');
}

module.exports = router;
