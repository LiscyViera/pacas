var con = require('../config/db');
var login = require('../model/login');
const session = require('express-session');
const ITEMS_PER_PAGE = 10;

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

    ver: function(res, req){
        const page = parseInt(req.query.page) || 1;
        login.obtener(con, function (err, datos) {
            if (err) {
              // manejar el error aquí
              console.error(err);
              return res.status(500).send('Error al obtener los datos de la base de datos');
            }
            const totalItems = datos.length;
            const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = page * ITEMS_PER_PAGE;

            const paginatedData = datos.slice(startIndex, endIndex);
            res.render('login/users', {
                title: 'Usuarios',
                usuario1: paginatedData,
                pageInfo: {
                  currentPage: page,
                  totalPages: totalPages,
                  hasNextPage: endIndex < totalItems,
                  hasPreviousPage: startIndex > 0,
                  nextPage: page + 1,
                  previousPage: page - 1
                }
              });
            });
    }


}
