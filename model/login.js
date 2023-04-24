const mysqlSync = require('mysql-sync');
module.exports = {
    insertar: function (conexion, datos, funcion, res, error) {
        conexion.query('INSERT INTO users(user, name, password, rol) VALUES (?,?,?,?)',
            [datos.user, datos.name, datos.password, datos.rol], funcion);
        if (error) {
            res.redirect('/');
            console.log(error);
            //res.redirect('/');         
        }
    },

    obtener: function (conexion, funcion) {
        conexion.query('SELECT * FROM prueba_db.users', (error, resultados) => {
            if (error) {
                return funcion(error, null);
            } else {
                return funcion(null, resultados);
            }
        });
    },

    borrar: function(conexion, id) {
        conexion.query('DELETE FROM users WHERE id=?',[id]);
    }
}