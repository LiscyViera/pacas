const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user'); // modelo de usuario

module.exports = function(passport) {
  passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    try {
      // Buscar el usuario por nombre de usuario
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Nombre de usuario no registrado' });
      }

      // Comparar la contraseña proporcionada con la almacenada en la base de datos
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
