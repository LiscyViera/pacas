var mysql =require('mysql');
var con =mysql.createConnection({
    host: 'localhost',
  database: 'ticket_gavilla',
  user: 'root',
  password: ''
})

con.connect(
    (err)=>{
        if(!err){
            console.log('Conexión establecida.');
        }else{
            console.log('Error de conexión');
        }
    }
);
module.exports=con;