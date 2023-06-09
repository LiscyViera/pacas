module.exports={
    obtener: function(conexion, funcion) {
        conexion.query('SELECT * FROM ticket_gavilla ORDER BY fecha_elaboracion DESC', (error, resultados) => {
            if (error) {
                return funcion(error, null);
            }
    
            const resultadosFormateados = resultados.map((fila) => {
                const fechaElaboracion = new Date(fila.fecha_elaboracion);
                const fechaElaboracionFormateada = `${fechaElaboracion.getDate()}/${fechaElaboracion.getMonth() + 1}/${fechaElaboracion.getFullYear()}`;
                return {
                    ...fila,
                    fecha_elaboracion: fechaElaboracionFormateada
                };
            });
    
            return funcion(null, resultadosFormateados);
        });
    },
    insertar: function(conexion, datos, funcion) {
        const hojas_paca = ( datos.gavillas_paca * datos.hojas_gavilla);
        const n_tickets =Math.floor(1 / 1);
        const resto = datos.gavillas_paca % 1;
        conexion.query('INSERT INTO ticket_gavilla(n_paca, variedad, tamano, fecha_elaboracion, gavillas_funda, gavillas_paca, clase, prom_gavillas, n_tickets, sobrante, hojas_gavilla, hojas_paca) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', 
        [datos.n_paca, datos.variedad, datos.tamano, datos.fecha_elaboracion, 0,datos.gavillas_paca, datos.clase, datos.prom_gavillas, n_tickets, resto, datos.hojas_gavilla, hojas_paca], funcion);
      },

    returnId:function(con, id, funcion){
        con.query('SELECT * FROM ticket_gavilla Where id= ?',[id], funcion);
    },
    returnPaca:function(con, q, funcion){
        con.query('SELECT * FROM ticket_gavilla WHERE n_paca = ?', [q], funcion);

    }
      
}