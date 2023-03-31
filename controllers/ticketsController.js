var con = require('../config/db');
var ticket = require('../model/ticket');
var barcode = require('barcode');
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');


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
    buscar: function (req, res) {
        res.render('tickets/buscar');
    },

    searchTickets:function(req, res){
        ticket.returnPaca(con, req.query.q, function (err, registro) {
          if (err) throw err;
         
          console.log(req.query.q);
          res.render('tickets/search', {ticket1: registro });
        });
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
    ver: function (req, res) {
        ticket.returnId(con, req.params.id, function (err, registro) {
            if (err) throw err;
            console.log(req.params.id);
            console.log(req.body);
            res.render('tickets/ver', { ticket: registro[0] });
        });

    },


    generarCodigoDeBarras: function (req, res) {
        ticket.returnId(con, req.params.id, function (err, registro) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al obtener los datos de la base de datos');
            }

            const doc = new PDFDocument({
                size: [7.6 * 28.35, 5 * 28.35],
                margins: {
                    top: 0.5 * 28.35,
                    bottom: 0.5 * 28.35,
                    left: 0.5 * 28.35,
                    right: 0.5 * 28.35
                }
            });
            doc.fontSize(9);
            doc.pipe(res);
            
            //res.setHeader('Content-disposition', 'attachment; filename=pacas.pdf');
            for (let i = 0; i < registro[0].n_tickets; i++) {
               
                doc.text('N° Paca: ' + registro[0].n_paca);
                doc.text('Variedad: ' + registro[0].variedad);
                doc.text('Clase: ' + registro[0].clase + '        Tam: ' + registro[0].tamano);
                doc.text('Peso humedo: ___________');
                doc.text('Peso despalillo: __________');
                doc.text('Gavillas funda:  ' + registro[0].gavillas_funda);
                doc.text('Gavillas paca:  ' + registro[0].gavillas_paca);
                doc.text('Maquinista: __________________');
                doc.text('Fecha elaboración: ' + registro[0].fecha_elaboracion.toLocaleDateString('es-ES'));
                doc.text('Prom. Gavillas:' + registro[0].prom_gavillas);  
                const text = registro[0].n_paca;
                const bcid = 'code128'; // tipo de código de barras que se generará
                const scale = 3; // escala del código de barras
                const height = 10; // altura del código de barras
                
                // Genera el código de barras
                bwipjs.toBuffer({
                    bcid,
                    text,
                    scale,
                    height,
                }, (err, png) => {
                    if (err) {
                        console.log(err);
                    } else {
                        // Guarda el código de barras generado en un archivo png
                       
                        doc.image(png, {
                            fit: [150, 150], // Tamaño del código de barras
                            align: 'center', // Alinear el código de barras en el centro de la página
                            valign: 'center' // Alinear el código de barras verticalmente en el centro de la página
                        });
                        
                        console.log('Código de barras generado correctamente');
                    }
                });
                if (i === registro[0].n_tickets - 1 && registro[0].sobrante !== 0) {
                    doc.addPage();
                    doc.text('N° Paca: ' + registro[0].n_paca);
                    doc.text('Variedad: ' + registro[0].variedad);
                    doc.text('Clase: ' + registro[0].clase + '        Tam: ' + registro[0].tamano);
                    doc.text('Peso humedo: ___________');
                    doc.text('Peso despalillo: __________');
                    doc.text('Gavillas funda:  ' + registro[0].sobrante);
                    doc.text('Gavillas paca:  ' + registro[0].gavillas_paca);
                    doc.text('Maquinista: __________________');
                    doc.text('Fecha elaboración: ' + registro[0].fecha_elaboracion.toLocaleDateString('es-ES'));
                    doc.text('Prom. Gavillas:' + registro[0].prom_gavillas);
                }

                if (i < registro[0].n_tickets - 1) {
                    doc.addPage();
                } else {
                    doc.end();
                };
            };
        });
    },


}

