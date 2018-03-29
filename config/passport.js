var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models = require('../models');

passport.use(new LocalStrategy({ usernameField : 'email' },
  function (username, password, done) {
    models.User.findOne({ where: { email: username } })
    .then(user => {
      if (!user) {
        return done(null, false, {
          message : 'Incorrect username or password'
        });
      }

      if (!user.validPassword(password)) {
        return done(null, false, {
          message : 'Incorrect username or password'
        });
      }

      user.hash = '';
      user.hash = undefined;
      user.salt = '';
      user.salt = undefined;
      return done(null, user);
    })
    .catch(error => {
      return done(null, false, {
        message: error.message
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});