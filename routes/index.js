var express = require('express');
var router = express.Router();

/* GET home page. */
/*router.get('/', function(req, res, next){
  res.send('Bienvenida');
});*/
router.get('/error', function(req, res){
  res.render('views/error');
})

module.exports = router;
