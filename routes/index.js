const express = require('express')
const router = express.Router()

const uuidv4 = require('uuid/v4')
const passport = require('passport')
const User = require('../models').User
const nodemailer = require('../common/nodemailer')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ title: 'Landing Page' })
})

router.post('/register', async function (req, res, next) {
  if (!req.body.email || !req.body.confirm_email || !req.body.password || !req.body.confirm_password) {
    return res.status(400).json({ message: 'All fields are required.' })
  }

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

    // generate token that expires in half a day
    const token = User.generateJwt(user.id, user.email, 0.5)

    nodemailer.sendMail(user, email, token)

    res.status(200).json({ message: 'Please check your email to verify your account.' })
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
      return res.status(400).json({ message: info.message })
    }
    req.logIn(user, function (err) {
      if (err) { return next(err) }

      const token = User.generateJwt(user.id, user.email)

      const userResponse = (({id}) => ({id}))(user)
      return res.status(200).json({ 'user': userResponse, 'token': token })
    })
  })(req, res, next)
})

router.get('/confirm/:token', async function (req, res, next) {
  const token = User.verifyJwt(req.params.token)
  const currentTime = parseInt(new Date()) / 1000
  if (token.expiration > currentTime) {
    return res.status(400).json({ message: 'The token has already expired.' })
  }

  try {
    const user = await User.findOne({ where: { id: token.userId },
      attributes: ['id', 'verified'] })

    if (!user) {
      return res.status(400).json({ message: 'No user exists for this token.' })
    }

    if (user.verified) {
      return res.status(400).json({ message: `The user's email has already been verified.` })
    }

    user.update({ verified: true })

    const userResponse = (({id}) => ({id}))(user)
    return res.status(200).json({ 'user': userResponse, 'token': User.generateJwt(user.id, user.email) })
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/resend', async function (req, res, next) {
  if (!req.body.email) {
    return res.status(400).json({ message: 'Email is required.' })
  }

  try {
    const user = await User.findOne({ where: { email: req.body.email },
      attributes: ['id', 'firstName', 'lastName', 'email', 'verified']})

    if (!user) {
      return res.status(400).json({ message: 'Email was never registered. Did you forget your login information?' })
    }

    if (user.verified) {
      return res.status(400).json({ message: `The user's email has already been verified.` })
    }

    // generate token that expires in half a day
    const token = User.generateJwt(user.id, user.email, 0.5)

    nodemailer.sendMail(user, user.email, token)

    res.status(200).json({ message: 'Email has been resent.  Please check your email to verify your account.' })
  } catch (error) {
    res.status(400).send(error)
  }
})

module.exports = router
