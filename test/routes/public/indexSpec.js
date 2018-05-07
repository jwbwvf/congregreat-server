/* global describe it beforeEach afterEach */

const {JsonWebTokenError} = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const passport = require('passport')
const mailer = require('../../../common/mailer')
const app = require('../../../app')
const User = require('../../../models').User
const expect = chai.expect
const assert = chai.assert

chai.use(chaiHttp)

describe('index routes', function () {
  let sandbox
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })
  describe('POST /public/login', function () {
    it('should fail if email is missing', function () {
      chai.request(app).post('/public/login')
        .send({ password: '12345678' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('All fields are required.')
        })
    })
    it('should fail if password is missing', function () {
      chai.request(app).post('/public/login')
        .send({ email: 'test@example.com' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('All fields are required.')
        })
    })
    it('should fail if the user is can not be authenticated', function () {
      sandbox.stub(passport, 'authenticate').yields(null, null, null)

      chai.request(app).post('/public/login')
        .send({ email: 'test@example.com', password: '12345678' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('Incorrect email or password.')
        })
    })
    it('should return the user and a token on success', function () {
      const id = 'testId'
      const email = 'test@example.com'
      const token = 'testToken'
      const user = {id: id}

      sandbox.stub(passport, 'authenticate').yields(null, user, null)
      sandbox.stub(User, 'generateJwt').returns(token)

      chai.request(app).post('/public/login')
        .send({ email: email, password: '12345678' })
        .end(function (error, response, body) {
          assert(!error)
          expect(response.status).to.equal(200)
          expect(response.body).to.eql({ 'user': { id: id }, 'token': token })
        })
    })
  })
  describe('POST /public/register', async function () {
    it('should fail if email is missing', async function () {
      try {
        await chai.request(app).post('/public/register')
          .send({ confirm_email: 'test@example.com', password: '12345678', confirm_password: '12345678' })
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('All fields are required.')
      }
    })
    it('should fail if confirm email is missing', async function () {
      try {
        await chai.request(app).post('/public/register')
          .send({ email: 'test@example.com', password: '12345678', confirm_password: '12345678' })
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('All fields are required.')
      }
    })
    it('should fail if password is missing', async function () {
      try {
        await chai.request(app).post('/public/register')
          .send({ email: 'test@example.com', confirm_email: 'test@example.com', confirm_password: '12345678' })
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('All fields are required.')
      }
    })
    it('should fail if confirm password is missing', async function () {
      try {
        await chai.request(app).post('/public/register')
          .send({ email: 'test@example.com', confirm_email: 'test@example.com', password: '12345678' })
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('All fields are required.')
      }
    })
    it('should fail if email and confirm email do not match', async function () {
      try {
        await chai.request(app).post('/public/register')
          .send({ email: 'test@example.com', confirm_email: 'nottest@example.com', password: '12345678', confirm_password: '12345678' })
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('Email fields do not match, try again.')
      }
    })
    it('should fail if password and confirm password do not match', async function () {
      sandbox.stub(User, 'findOne').resolves(null)
      sandbox.stub(User, 'verifyJwt').returns('123456')

      try {
        await chai.request(app).post('/public/register')
          .send({ email: 'test@example.com', confirm_email: 'test@example.com', password: '12345678', confirm_password: '1234' })
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('Password fields do not match, try again.')
      }
    })
    it('should fail if email is already registered', async function () {
      sandbox.stub(User, 'findOne').resolves({ id: 'testId', email: 'test@example.com' })

      try {
        await chai.request(app).post('/public/register')
          .send({ email: 'test@example.com', confirm_email: 'test@example.com', password: '12345678', confirm_password: '1234' })
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('Email is already registered. Did you forget your login information?')
      }
    })
    it('should return the new user and a token on success', async function () {
      const id = 'testId'
      const email = 'test@example.com'
      const salt = 'testSalt'
      const hash = 'testHash'
      const token = 'testToken'

      sandbox.stub(User, 'findOne').resolves(null)
      sandbox.stub(User, 'create').resolves({id: id, email: email, salt: salt, hash: hash})
      sandbox.stub(User, 'getSalt').returns(salt)
      sandbox.stub(User, 'getHash').returns(hash)
      sandbox.stub(User, 'generateJwt').returns(token)
      try {
        await chai.request(app).post('/public/register')
          .send({ email: email, confirm_email: email, password: '12345678', confirm_password: '12345678' })
      } catch ({response}) {
        expect(response.status).to.equal(200)
        expect(response.body).to.eql({ 'message': 'Please check your email to verify your account.' })
      }
    })
  })
  describe('GET /public/confirm/:token', function () {
    it('should fail if the token is invalid', async function () {
      sandbox.stub(User, 'verifyJwt').throws(new JsonWebTokenError())
      try {
        await chai.request(app).get(`/public/confirm/12345678`)
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal(`The token is invalid.`)
      }
    })
    it('should fail if the token is already expired', async function () {
      const user = {verified: false}
      const date = new Date()
      date.setDate(date.getDate() - 1)
      const token = {expiration: parseInt(date.getTime() / 1000)}

      sandbox.stub(User, 'verifyJwt').returns(token)
      sandbox.stub(User, 'findOne').resolves(user)

      try {
        await chai.request(app).get(`/public/confirm/12345678`)
      } catch ({response}) {
        expect(response.status).to.equal(409)
        expect(response.body.message).to.equal(`The token has already expired.`)
      }
    })
    it('should fail if the user does not exist', async function () {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      const token = {expiration: parseInt(date.getTime() / 1000)}

      sandbox.stub(User, 'verifyJwt').returns(token)
      sandbox.stub(User, 'findOne').resolves(null)

      try {
        await chai.request(app).get(`/public/confirm/12345678`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body.message).to.equal('No user exists for this token.')
      }
    })
    it('should fail for a user that has already verified their email', async function () {
      const user = {verified: true}
      const date = new Date()
      date.setDate(date.getDate() + 1)
      const token = {expiration: parseInt(date.getTime() / 1000)}

      sandbox.stub(User, 'verifyJwt').returns(token)
      sandbox.stub(User, 'findOne').resolves(user)

      try {
        await chai.request(app).get(`/public/confirm/12345678`)
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal(`The user's email has already been verified.`)
      }
    })
    it('should return the user successfuly confirmed their email', async function () {
      const generatedToken = 'testGeneratedToken'
      const id = 'testId'
      const user = {verified: false, id: id}
      user.update = sandbox.stub().returns(true)
      const date = new Date()
      date.setDate(date.getDate() + 1)
      const token = {expiration: parseInt(date.getTime() / 1000)}

      sandbox.stub(User, 'verifyJwt').returns(token)
      sandbox.stub(User, 'findOne').resolves(user)
      sandbox.stub(User, 'generateJwt').returns(generatedToken)

      const response = await chai.request(app).get(`/public/confirm/12345678`)

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: `The user's email has been verified, please login.` })
    })
    it('should return the user failed to confirmed their email', async function () {
      const generatedToken = 'testGeneratedToken'
      const id = 'testId'
      const user = {verified: false, id: id}
      user.update = sandbox.stub().returns(false)
      const date = new Date()
      date.setDate(date.getDate() + 1)
      const token = {expiration: parseInt(date.getTime() / 1000)}

      sandbox.stub(User, 'verifyJwt').returns(token)
      sandbox.stub(User, 'findOne').resolves(user)
      sandbox.stub(User, 'generateJwt').returns(generatedToken)

      try {
        await chai.request(app).get(`/public/confirm/12345678`)
      } catch ({response}) {
        expect(response.status).to.equal(500)
        expect(response.body).to.eql({ message: 'Unable to verify email at this time, please try again.' })
      }
    })
  })
  describe('POST /public/resend', function () {
    it('should fail if email is missing', async function () {
      try {
        await chai.request(app).post('/public/resend')
          .send({})
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('Email is required.')
      }
    })
    it('should fail for an email that has not been registered', async function () {
      const email = 'test@example.com'

      sandbox.stub(User, 'findOne').resolves(null)

      try {
        await chai.request(app).post('/public/resend')
          .send({email: email})
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('Email was never registered. Did you forget your login information?')
      }
    })
    it('should fail for a user that has already verified their email', async function () {
      const user = {verified: true}
      const email = 'test@example.com'

      sandbox.stub(User, 'findOne').resolves(user)

      try {
        await chai.request(app).post('/public/resend')
          .send({email: email})
      } catch ({response}) {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal(`The user's email has already been verified.`)
      }
    })
    it('should send a new token in an email', async function () {
      const email = 'test@example.com'
      const user = {verified: false, email: email}
      const token = 'testToken'

      sandbox.stub(User, 'findOne').resolves(user)
      sandbox.stub(User, 'generateJwt').returns(token)
      const sendMailStub = sandbox.stub(mailer, 'sendMail')
      sendMailStub.resolves()

      const response = await chai.request(app).post('/public/resend')
        .send({email: email})

      expect(response.status).to.equal(200)
      expect(response.body.message).to.equal('Email has been resent.  Please check your email to verify your account.')

      const args = sendMailStub.getCall(0).args
      expect(args[0]).to.equal(user)
      expect(args[1]).to.equal(email)
      expect(args[2]).to.equal(token)
    })
  })
})
