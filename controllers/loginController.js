var con = require('../config/db');
var login = require('../model/login');
const session = require('express-session');

module.exports={
    index: function (req, res) {
        res.render('login/login');
      },

    crear: function(req, res){
        res.render('login/users');
    },
    
    save: function (req, res) {
        login.insertar(con, req.body, function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al insertar los datos en la base de datos');
            }
            res.render('login/users');
        });

    },

}
