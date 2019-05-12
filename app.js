var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var passport = require('passport')
var cors = require('cors')

require('./common/passport')

var app = express()

var env = process.env.NODE_ENV || 'development'
if (env === 'development') {
  console.log('Using CORS.')
  app.use(cors())
}

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(passport.initialize())

var fs = require('fs')
var config = require('./common/config')
var expressjwt = require('express-jwt')
var publicKey = fs.readFileSync(config.jwt.public)
app.use(expressjwt({
  secret: publicKey,
  algorithm: 'RS512'
}).unless({
  path: [
    /^\/public\/.*/
  ]
}))

app.use('/public', require('./routes/public/index'))
app.use(require('./routes'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ message: 'Unauthorized.' })
    return
  }
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
})

module.exports = app
