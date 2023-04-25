const {con, User} = require('../config/db');
var login = require('../model/login');

module.exports = {
  index: function (req, res) {
    res.render('login/login');
  },

  crear: function (req, res) {
    res.render('login/users');
  },

  save: function (req, res) {
    login.insertar(con, req.body, function (err, datos) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al insertar los datos en la base de datos');
      }
      res.redirect('ver');
      //res.render('login/verusuarios', { title: 'Usuarios', usuario1: datos });
    });

  },

  ver: function (req, res) {
    login.obtener(con, function (err, datos) {
      if (err) {
        // manejar el error aquí
        console.error(err);
        return res.status(500).send('Error al obtener los datos de la base de datos');
      }

      res.render('login/verusuarios', { title: 'Usuarios', usuario1: datos });
      // console.log(datos.user);

    });
  },

  // borrar: function (req, res) {
  //   login.borrar(con, req.params.id, function(err, result) {
  //     if (err) {
  //       console.log('Error al borrar el usuario:', err);
  //       res.status(500).send('Error al borrar el usuario');
  //     } else {
  //       console.log('Usuario borrado:', id);
  //       res.redirect('/login/verusuarios');
  //     }
  //   });
  // }


}
