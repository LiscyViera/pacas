var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ticketsRouter = require('./routes/tickets');
var loginRouter = require('./routes/login');
const session = require('express-session');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: true
}));

//app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tickets', ticketsRouter);
app.use('/', loginRouter);

app.get('/', (req, res) => {
	if (req.session.loggedin) {
		let name = req.session.name;

 		res.render('home', { name });
	} else {
		res.redirect('/login');
	}
});

app.get('/pdf', function (req, res) {

  // Genera el PDF utilizando PDFKit
  const PDFDocument = require('pdfkit');
  const bwipjs = require('bwip-js');
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
  doc.text('N° Paca:');
  doc.text('Variedad:');
  doc.text('Clase:                 Tam:');
  doc.text('Peso humedo:____________');
  doc.text('Peso despalillo:___________');
  doc.text('Gavillas funda:');
  doc.text('Gavillas paca:');
  doc.text('Maquinista:_________________');
  doc.text('Fecha elaboración:');
  doc.text('Prom. Gavillas:');

  const barcodeData = '1234567890'; // aquí se define el valor del código de barras
  bwipjs.toBuffer({
    bcid: 'code128',
    text: barcodeData,
    scale: 1,
    height: 12,
    includetext: false,
    textxalign: 'center'
  }, function (err, png) {
    if (err) {
      console.log(err);
    } else {
      doc.rotate(-90, { origin: [90, 80] });

      doc.image(png, 80, 170, {
        fit: [60, 40],
        align: 'center',
        valign: 'center', width: 40, height: 60
      });
      doc.end();
    }
  });
}),

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//11 - Metodo para la autenticacion
app.post('/auth', async (req, res)=> {
	const user = req.body.user;
	const pass = req.body.pass; 
	if(user === adminDefault.name && pass === adminDefault.password){
		req.session.loggedin = true;                
					req.session.name = adminDefault.name;
					req.session.rol = adminDefault.rol;
					res.render('tickets', {
						alert: true,
						alertTitle: "Conexión exitosa",
						alertMessage: "¡LOGIN CORRECTO!",
						alertIcon:'success',
						showConfirmButton: false,
						timer: 700,
						ruta: ''
					}); 
	}else{
		if (user && pass) {
			connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results, fields)=> {
				if( results.length == 0 || !(await bcrypt.compare(pass, results[0].pass)) ) {    
					res.render('tickets', {
							alert: true,
							alertTitle: "Error",
							alertMessage: "USUARIO y/o PASSWORD incorrectas",
							alertIcon:'error',
							showConfirmButton: true,
							timer: false,
							ruta: 'tickets/index'    
						});
								
				} else {         
					//creamos una var de session y le asignamos true si INICIO SESSION       
					req.session.loggedin = true;                
					req.session.name = results[0].name;
					req.session.rol = results[0].rol;
					res.render('tickets', {
						alert: true,
						alertTitle: "Conexión exitosa",
						alertMessage: "¡LOGIN CORRECTO!",
						alertIcon:'success',
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


module.exports = app;
