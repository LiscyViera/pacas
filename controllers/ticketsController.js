var con = require('../config/db');
var ticket = require('../model/ticket');
var barcode = require('barcode');
const ITEMS_PER_PAGE = 10;

module.exports = {

    index: function (req, res,) {
        const page = parseInt(req.query.page) || 1;
      
        ticket.obtener(con, function (err, datos) {
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
      
          res.render('tickets/index', {
            title: 'Aplicación de tickets',
            ticket1: paginatedData,
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
    },

    crear: function (req, res) {
        res.render('tickets/crear');
    },
    save: function (req, res) {
        ticket.insertar(con, req.body, function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al insertar los datos en la base de datos');
            }
            res.redirect('/tickets');
            
        });

    },
    ver: function(req, res){
      ticket.returnId(con, req.params.id, function(err, registro){
        if(err) throw err;
        console.log(req.params.id);
        console.log(req.body);
        res.render('tickets/ver', {ticket:registro[0]});
      });

    },
    generarCodigoDeBarras: function(req, res) {
        var codigo = req.body.n_paca;
        var codigoDeBarras = barcode('code128', {
          data: codigo,
          width: 400,
          height: 100,
        });
        res.type('png');
        codigoDeBarras.pipe(res);
      },
    buscar:function(res) {
        res.render('tickets/buscar');
    },
     
}

