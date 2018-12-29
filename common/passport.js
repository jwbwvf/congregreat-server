var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
const { User, Member } = require('../models')
const Security = require('../common/security')
const Sequelize = require('sequelize')

passport.use(new LocalStrategy({ usernameField: 'email' },
  async function (username, password, done) {
    try {
      const user = await User.findOne({
        where: { email: username },
        attributes: ['id', 'email', 'status', 'memberId', 'hash', 'salt'],
        include: [{
          model: Member,
          attributes: ['congregationId'],
          // creates inner join when true, left outer join when false
          required: true
        }]
      })
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username or password.'
        })
      }

      if (!Security.isPasswordValid(password, user.salt, user.hash)) {
        return done(null, false, {
          message: 'Incorrect username or password.'
        })
      }

      if (!user.isVerified()) {
        return done(null, false, {
          message: 'User has not verified their email.'
        })
      }

      user.hash = ''
      user.salt = ''
      return done(null, user)
    } catch (error) {
      return (done(null, false, {message: error.message}))
    }
  })
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})
