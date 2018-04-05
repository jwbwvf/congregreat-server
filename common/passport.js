var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var User = require('../models').User

passport.use(new LocalStrategy({ usernameField: 'email' },
  function (username, password, done) {
    User.findOne({ where: { email: username } })
      .then(user => {
        if (!user) {
          return done(null, false, {
            message: 'Incorrect username or password'
          })
        }

        if (!user.validPassword(password)) {
          return done(null, false, {
            message: 'Incorrect username or password'
          })
        }

        user.hash = ''
        user.salt = ''
        return done(null, user)
      })
  })
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})
