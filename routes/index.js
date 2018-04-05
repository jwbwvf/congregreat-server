var express = require('express')
var router = express.Router()

const uuidv4 = require('uuid/v4')
var passport = require('passport')
var User = require('../models').User

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ title: 'Landing Page' })
})

router.post('/register', async function (req, res, next) {
  if (!req.body.email || !req.body.confirm_email || !req.body.password || !req.body.confirm_password) {
    return res.status(400).json({ message: 'All fields are required.' })
  };

  if (req.body.email !== req.body.confirm_email) {
    return res.status(400).json({ message: 'Email fields do not match, try again.' })
  }

  try {
    const userFound = await User.findOne({ where: { email: req.body.email } })
    if (userFound) {
      return res.status(400).json({ message: 'Email is already registered. Did you forget your login information?' })
    }

    if (req.body.password !== req.body.confirm_password) {
      return res.status(400).json({ message: 'Password fields do not match, try again.' })
    }

    const id = uuidv4()
    const email = req.body.email
    let salt = User.getSalt()
    let hash = User.getHash(salt, req.body.password)
    const user = await User.create({id, email, salt, hash})
    salt = ''
    hash = ''
    user.hash = ''
    user.salt = ''

    var token = User.generateJwt()

    const userResponse = (({id}) => ({id}))(user)
    res.status(200).json({ 'user': userResponse, 'token': token })
  } catch (error) {
    res.status(400).send(error)
  };
})

router.post('/login', function (req, res, next) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'All fields are required.' })
  }

  passport.authenticate('local', function (err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password.' })
    }
    req.logIn(user, function (err) {
      if (err) { return next(err) }

      var token = User.generateJwt()
      const userResponse = (({id}) => ({id}))(user)
      return res.status(200).json({ 'user': userResponse, 'token': token })
    })
  })(req, res, next)
})

module.exports = router
