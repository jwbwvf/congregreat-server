const express = require('express')
const router = express.Router()

const uuid = require('uuid/v4')
const passport = require('passport')
const { User, Member } = require('../../models')
const mailer = require('../../common/mailer')
const { USER_STATUS } = require('../../common/status')
const Sequelize = require('sequelize')

router.get('/status', async function (req, res, next) {
  return res.status(200).json({ status: 'online' })
})

// TODO rework how registration works since we expect somone who has already been entered into the
// system as a member to be able to register as a user.
router.post('/register', async function (req, res, next) {
  if (!req.body.email ||
    !req.body.confirm_email ||
    !req.body.password ||
    !req.body.confirm_password ||
    !req.body.first_name ||
    !req.body.last_name) {
    return res.status(400).json({ message: 'All fields are required.' })
  }

  if (req.body.email !== req.body.confirm_email) {
    return res.status(400).json({ message: 'Email fields do not match, try again.' })
  }

  try {
    const userFound = await User.findOne({ where: { email: req.body.email } })
    if (userFound) {
      return res.status(400).json({
        message: 'Email is already registered. Did you forget your login information? Have you checked your email for a confirmation link?'
      })
    }

    if (req.body.password !== req.body.confirm_password) {
      return res.status(400).json({ message: 'Password fields do not match, try again.' })
    }

    const member = await Member.findOne({
      where: { email: req.body.email },
      attributes: ['id', 'status']
    })
    if (!member) {
      return res.status(400).json({
        message: 'Unable to register at this time.  Check with your congregation to make sure they have added you as a member.'
      })
    }
    // TODO do we check status as a rule for anyone trying to registered, like don't let deleted members register

    const id = uuid()
    const email = req.body.email
    const firstName = req.body.first_name
    const lastName = req.body.last_name
    let salt = User.getSalt()
    let hash = User.getHash(salt, req.body.password)
    const status = USER_STATUS.UNVERIFIED
    const memberId = member.id
    const user = await User.create({id, email, salt, hash, status, memberId})
    salt = ''
    hash = ''
    user.hash = ''
    user.salt = ''

    // generate token that expires in half a day
    const token = User.generateJwt(user.id, user.email, 0.5)

    mailer.sendMail(firstName, lastName, email, token)

    return res.status(200).json({ message: 'Please check your email to verify your account.' })
  } catch (error) {
    return res.status(400).send(error)
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

router.put('/confirm', async function (req, res, next) {
  let token
  try {
    token = User.verifyJwt(req.body.token)
  } catch (error) {
    console.error(error) // replace when we switch to a logger
    return res.status(400).json({ message: 'The token is invalid.' })
  }

  try {
    const user = await User.findOne({ where: { id: token.userId },
      attributes: ['id', 'status'] })

    if (!user) {
      return res.status(404).json({ message: 'No user exists for this token.' })
    }

    if (user.isVerified()) {
      return res.status(400).json({ message: `The user's email has already been verified.` })
    }

    // now that the user has been verified have them log in instead of responding with a token incase
    // it was someone hitting this service trying to get back a token by guessing confirmation tokens
    const response = await user.update({ status: USER_STATUS.VERIFIED })
    if (response) {
      return res.status(200).json({ message: `The user's email has been verified, please login.` })
    } else {
      return res.status(500).json({ message: 'Unable to verify email at this time, please try again.' })
    }
  } catch (error) {
    return res.status(400).send(error)
  }
})

router.post('/resend', async function (req, res, next) {
  if (!req.body.email) {
    return res.status(400).json({ message: 'Email is required.' })
  }

  try {
    const user = await User.findOne({
      where: { email: req.body.email },
      attributes: ['id', 'email', 'status', 'memberId'],
      include: [{
        model: Member,
        where: { id: Sequelize.col('User.member_id') },
        attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
        required: false
      }]
    })

    if (!user) {
      return res.status(400).json({ message: 'Email was never registered. Did you forget your login information?' })
    }

    if (user.isVerified()) {
      return res.status(400).json({ message: `The user's email has already been verified.` })
    }

    if (!user.Member) {
      return res.status(400).json({
        message: 'Unable to resend at this time.  Check with your congregation to make sure they have added you as a member.'
      })
    }

    // generate token that expires in half a day
    const { id, email } = user
    const token = User.generateJwt(id, email, 0.5)

    const { firstName, lastName } = user.Member
    mailer.sendMail(firstName, lastName, email, token)

    return res.status(200).json({ message: 'Email has been resent.  Please check your email to verify your account.' })
  } catch (error) {
    return res.status(400).send(error)
  }
})

module.exports = router
