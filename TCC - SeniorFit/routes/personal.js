const express = require('express');
const router = express.Router();
const personalController = require('../controller/personalcontroller');

router.get('/', authenticationMiddleware, personalController.index);
router.get('/cadastroaluno', authenticationMiddleware, personalController.createaluno);
router.post('/cadastroaluno', authenticationMiddleware, personalController.storealuno);

router.get('/visualizar', authenticationMiddleware, personalController.show);
router.get('/visualizar/:id', authenticationMiddleware, personalController.deletealuno);
router.get('/visualizar/delete/:id', authenticationMiddleware, personalController.destroyaluno);

router.get('/editar/:id', authenticationMiddleware, personalController.editaluno);
router.post('/editar/:id', authenticationMiddleware, personalController.update);

router.get('/visualizartreinos/:id', authenticationMiddleware, personalController.showtreino);
router.get('/visualizartreinos/delete/:id', authenticationMiddleware, personalController.destroytreino);

router.get('/visualizartreinos/exercicios/:id', authenticationMiddleware, personalController.showExe);
router.get('/visualizartreinos/exercicios/delete/:id', authenticationMiddleware, personalController.destroyExe);

router.get('/cadastroexercicio/:id', authenticationMiddleware, personalController.createExercicio);
router.post('/cadastroexercicio/:id', authenticationMiddleware, personalController.storeExe);

router.get('/cadastrotreino/:id', authenticationMiddleware, personalController.cadastrotreino);
router.post('/cadastrotreino/:id', authenticationMiddleware, personalController.storetreino);

router.get('/ver/:id', authenticationMiddleware, personalController.showver);

router.get('/visualizaravaliacoes/:id', authenticationMiddleware, personalController.showAva);
router.get('/visualizaravaliacoes/delete/:id', authenticationMiddleware, personalController.destroyAva);


router.get('/cadastroavaliacao/:id', authenticationMiddleware, personalController.createAva);
router.post('/cadastroavaliacao/:id', authenticationMiddleware, personalController.storeAva);

router.get('/visualizarfeedback/:id', authenticationMiddleware, personalController.showFeed);
router.get('/visualizarfeedback/visto/:id', authenticationMiddleware, personalController.destroyFeed);

function authenticationMiddleware(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect('/login?erro=1');
}

module.exports = router;
