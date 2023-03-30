const express = require('express');
var router = express.Router();
const loginController = require('../controllers/loginController');

router.get('/', loginController.index);
router.get('/crear', loginController.crear);
router.post('/users', loginController.save);
router.get('/ver', loginController.ver);
// router.post('/edit/:id', loginController.edit);
router.get('/delete/:id', loginController.borrar)
// router.get('/logout', loginController.logout);

module.exports = router;