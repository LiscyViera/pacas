const bcrypt = require('bcrypt');

module.exports = {
    insertar: function (con, datos, funcion, res, error) {
        // Generar el valor de hash de la contraseña
        const hash = bcrypt.hashSync(datos.password, 10);

        con.query('INSERT INTO users(user, name, password, rol) VALUES (?,?,?,?)',
            [datos.user, datos.name, hash, datos.rol], funcion);
        if (error) {
            res.redirect('/');
            console.log(error);
            //res.redirect('/');         
        }
    },

    obtener: function (con, funcion) {
        con.query('SELECT * FROM prueba_db.users', (error, resultados) => {
            if (error) {
                return funcion(error, null);
            } else {
                return funcion(null, resultados);
            }
        });
    },

    // borrar: function(con, id) {
    //     con.query('DELETE FROM users WHERE id=?',[id]);
    // }
}