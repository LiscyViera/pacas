const express = require('express');
var router = express.Router();
const loginController = require('../controllers/loginController');

router.get('/', loginController.index);
router.get('/registro', loginController.crear);
router.post('/salvar', loginController.save);
// router.get('/logout', loginController.logout);

module.exports = router;