const { con, User } = require('../config/db');
var ticket = require('../model/ticket');
var barcode = require('barcode');
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
// Importamos el objeto infoVariedad
const infoVariedad = require('../datos/variedad.js');

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
        const variedades = infoVariedad.variedad[0].Variedad;
        res.render('tickets/crear', { variedades });

    },
    buscar: function (req, res) {
        res.render('tickets/buscar');
    },

    searchTickets: function (req, res) {
        ticket.returnPaca(con, req.query.q, function (err, registro) {
            if (err) throw err;

            console.log(req.query.q);
            res.render('tickets/search', { ticket1: registro });
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
            const text = registro[0].n_paca;
            const bcid = 'code128'; // tipo de código de barras que se generará
            const scale = 1.5; // escala del código de barras
            const height = 14; // altura del código de barras
            const includetext = false;
            const textxalign = 'center';

            // Genera el código de barras en una promise para una ves generado no exista problema
            const bar = new Promise((resolve, reject) => {
                bwipjs.toBuffer({
                    bcid,
                    text,
                    scale,
                    height,
                    includetext,
                    textxalign,
                }, (err, png) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(png);
                    }
                });
            })

            //invocamos a la promesa
            bar.then((png) => {
                //crearemos la instancia del pdf dentro de la promesa ya que generar la instancia del PDF
                //fuera de la promisa y luego insertar un doc.text hace que la instancia del PDF finalice
                //antes de que la promesa entre en accion
                const doc = new PDFDocument({
                    size: [7.6 * 28.35, 5 * 28.35],
                    margins: {
                        top: 0.5 * 28.35,
                        bottom: 0.3 * 28.35,
                        left: 0.8 * 28.35,
                        right: 0.8 * 28.35
                    }
                });

                // Aumenta el límite de escuchadores de eventos para el objeto res
                res.setMaxListeners(registro[0].n_tickets + 1);

                //declaramos el pipe aqui para que no genere error
                doc.pipe(res);
                //insertamos el for dpara recorrer el numero de tickets
                for (let i = 0; i < registro[0].n_tickets; i++) {

                    //generamos los datos de tickes
                    doc.fontSize(9);

                    doc.text('N° Paca: ' + registro[0].n_paca + '   P. Capa_____');
                    doc.text('Variedad: ' + registro[0].variedad);
                    doc.text('Clase: ' + registro[0].clase + '        Tam: ' + registro[0].tamano);
                    doc.text('Peso humedo: ___________');
                    doc.text('Peso despalillo: ________');

                    // Verificamos si hay gavillas sobrantes y las sumamos a gavillas_funda si es necesario
                    if (i === registro[0].n_tickets - 1 && registro[0].sobrante <= 5) {
                        registro[0].gavillas_funda += registro[0].sobrante;
                        registro[0].sobrante = 0;
                    }
                    doc.text('Gavillas funda:  ' + registro[0].gavillas_funda);
                    doc.text('Gavillas paca:  ' + registro[0].gavillas_paca);
                    doc.text('Maquinista: __________________');
                    doc.text('Fecha elaboración: ' + registro[0].fecha_elaboracion.toLocaleDateString('es-ES'));
                    doc.text('Prom. Gavillas:' + registro[0].prom_gavillas);
                    if (registro[0].sobrante > 5) {
                        var tic = registro[0].n_tickets + 1;
                        var ia = i + 1;
                        doc.text(ia + '/' + tic, { align: 'center' });
                    } else {
                        var ia = i + 1;
                        var tic = registro[0].n_tickets + 1;
                        doc.text(ia + '/' + registro[0].n_tickets, { align: 'center' });
                    }

                    // Calculamos la posición y de la imagen para que se centre verticalmente en la página
                    const y = (doc.page.height - doc.page.margins.bottom - doc.page.margins.top - 40) / 2 + doc.page.margins.top;
                    doc.image(png, doc.page.width - doc.page.margins.right - 60, y, { fit: [60, 40], align: 'center', valign: 'center' });

                    if (i === registro[0].n_tickets - 1 && registro[0].sobrante !== 0) {
                        doc.addPage();
                        doc.text('N° Paca: ' + registro[0].n_paca + '   P. Capa_____');
                        doc.text('Variedad: ' + registro[0].variedad);
                        doc.text('Clase: ' + registro[0].clase + '        Tam: ' + registro[0].tamano);
                        doc.text('Peso humedo: ___________');
                        doc.text('Peso despalillo: ________');
                        doc.text('Gavillas funda:  ' + registro[0].sobrante);
                        doc.text('Gavillas paca:  ' + registro[0].gavillas_paca);
                        doc.text('Maquinista: __________________');
                        doc.text('Fecha elaboración: ' + registro[0].fecha_elaboracion.toLocaleDateString('es-ES'));
                        doc.text('Prom. Gavillas:' + registro[0].prom_gavillas);
                        var tic = registro[0].n_tickets + 1;
                        doc.text(tic + '/' + tic, { align: 'center' });

                        // Calculamos la posición y de la imagen para que se centre verticalmente en la página
                        const y = (doc.page.height - doc.page.margins.bottom - doc.page.margins.top - 40) / 2 + doc.page.margins.top;
                        doc.image(png, doc.page.width - doc.page.margins.right - 60, y, { fit: [60, 40], align: 'center', valign: 'center' });
                    }

                    //validamos si es el ultimo ciclo finalizar, si no lo es agregar otra pagina
                    if (i < registro[0].n_tickets - 1) {
                        doc.addPage();
                    } else {
                        doc.end();
                    };
                }
            }).catch((err) => {
                console.error(err);
            });
        });
    },

    // Creamos una función que utiliza el objeto infoVariedad
    //     mInfoVariedad: function (req, res) {
    //     const infoVariedad = req.params.variedad;

    //     res.redirect('/crear', { infoVariedad: infoVariedad });

    // },



}

