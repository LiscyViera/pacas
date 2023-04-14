const express = require('express');
var router = express.Router();
const loginController = require('../controllers/loginController');
const bcrypt = require('bcrypt');
const con = require('../config/db');
const { index } = require('../controllers/ticketsController');
const rp = require('request-promise');
var ticket = require('../model/ticket');

//Registro de usuarios
router.get('/', loginController.index);
router.get('/crear', loginController.crear);
router.post('/users', loginController.save);
router.get('/ver', loginController.ver);
// router.post('/edit/:id', loginController.edit);
router.get('/delete/:id', loginController.borrar)

//Autenticacion de usuarios

router.post('/login', async (req, res) => {
    const user = req.body.user;
    const password = req.body.password;
    if (user === user && password === password) {
        req.session.loggedin = true;
        req.session.user = user;
        // req.session.rol = rol;

        const page = 1; // cambiar a la página que necesites
        const ITEMS_PER_PAGE = 10; // o el valor que tengas definido en tu controlador

        const options = {
            uri: 'http://localhost:3000/tickets',
            qs: {
                page: 1 // cambiar a la página que necesites
            },
            json: true
        };
    
        const tickets = await rp(options);
        const totalItems = tickets.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = page * ITEMS_PER_PAGE;
        const paginatedData = tickets.slice(startIndex, endIndex);


        res.render('tickets/index', {
            alert: true,
            alertTitle: "Conexión exitosa",
            alertMessage: "¡LOGIN CORRECTO!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 700,
            ruta: '',
            // Pasamos la variable con el resultado de tickets al objeto que se pasa como segundo parámetro
            // ticket1: ticket1,
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
    } else {
        if (user && password) {
            con.query('SELECT * FROM users WHERE user = ?', [user], async (error, results, fields) => {
                if (results.length == 0 || !(await bcrypt.compare(password, results[0].password))) {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSworpasswordWORD incorrectas",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });

                } else {
                    //creamos una var de session y le asignamos true si INICIO SESSION       
                    req.session.loggedin = true;
                    req.session.name = results[0].name;
                    req.session.rol = results[0].rol;
                    res.render('login', {
                        alert: true,
                        alertTitle: "Conexión exitosa",
                        alertMessage: "¡LOGIN CORRECTO!",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 700,
                        ruta: ''
                    });
                }
                res.end();
            });
        } else {
            res.send('Please enter user and Password!');
            res.end();
        }
    }
});


module.exports = router;

