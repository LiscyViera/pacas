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

    // obtener: function (conexion, funcion) {
    //     conexion.query('SELECT * FROM users ORDER BY id ASDC', (error, resultados) => {
    //         if (error) {
    //             return funcion(error, null);
    //         } else{
    //             return funcion(null, resultados);
    //         }
    //     });
    // },

}