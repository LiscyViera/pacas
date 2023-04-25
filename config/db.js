const mysql = require('mysql');
const bcrypt = require('bcrypt');
const con = mysql.createConnection({
    host: 'localhost',
    database: 'prueba_db',
    user: 'root',
    password: ''
});

con.connect(
    (err) => {
        if (!err) {
            console.log('Conexión establecida.');
        } else {
            console.log('Error de conexión');
        }
    }
);

const User = {};

User.findByUsername = function (username, callback) {
    const query = 'SELECT * FROM users WHERE user = ?';
    con.query(query, [username], function (err, results, fields) {
        if (err) {
            return callback(err);
        }
        if (results.length === 0) {
            return callback(null, null);
        }
        const user = results[0];
        callback(null, {
            id: user.id,
            username: user.User,
            password: user.password
        });
    });
};

User.create = function (username, password, callback) {
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
            return callback(err);
        }
        const query = 'INSERT INTO users (User, password) VALUES (?, ?)';
        con.query(query, [username, hash], function (err, results, fields) {
            if (err) {
                return callback(err);
            }
            const id = results.insertId;
            callback(null, { id, username, password });
        });
    });
};

User.checkPassword = function (password, hash, callback) {
    bcrypt.compare(password, hash, function (err, res) {
        if (err) {
            return callback(err);
        }
        callback(null, res);
    });
};

module.exports = {
    con: con,
    User: User
};