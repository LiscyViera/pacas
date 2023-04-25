const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
//const bcrypt = require('bcrypt');
const {con, User} = require('../config/db');
const session = require('express-session');
const flash = require('connect-flash');
//const User = require('../config/db');

//Registro de usuarios
router.get('/', loginController.index);
router.get('/crear', loginController.crear);
router.post('/users', loginController.save);
router.get('/ver', loginController.ver);
//router.post('/edit/:id', loginController.edit);
//router.get('/delete/:id', loginController.borrar);

router.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    con.query('DELETE FROM users WHERE id = ?',[id], (error, results)=>{
        if(error){
            console.log(error);
        }else{           
            res.redirect('ver');         
        }
    })
});

router.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

//Autenticacion de usuarios
router.use(flash());

router.get('/login', function (req, res) {
  res.render('login/login', { message: req.flash('message') });
});

router.post('/login', function (req, res) {
  const username = req.body.user;
  const password = req.body.password;
  User.findByUsername(username, function (err, user) {
    if (err) {
      req.flash('message', err.message);
      return res.redirect('/login');
    }
    if (!user) {
      req.flash('message', 'Invalid user or password');
      return res.redirect('/login');
    }
    User.checkPassword(password, user.password, function (err, match) {
      if (err) {
        req.flash('message', err.message);
        return res.redirect('/login');
      }
      if (!match) {
        req.flash('message', 'Invalid user or password');
        return res.redirect('/login');
      }
      req.session.user = { id: user.id, user: user.user };
      //debe de reedireccionar a una ruta index
      res.redirect('/tickets');
  });
  console.log(`login correcto ${username} con contraseña ${password}`);
});
});

// router.get('/register', function (req, res) {
//   res.render('register', { message: req.flash('message') });
// });

// router.post('/register', function (req, res) {
//   const username = req.body.user;
//   const password = req.body.password;
//   User.create(username, password, function (err, user) {
//     if (err) {
//       req.flash('message', err.message);
//       return res.redirect('/register');
//     }
//     req.session.user = { id: user.id, user: user.user };
//     res.redirect('/');
//   });
// });

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;

