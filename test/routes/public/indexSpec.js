/* global describe it beforeEach afterEach */

const {JsonWebTokenError} = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const faker = require('faker')
const passport = require('passport')
const mailer = require('../../../common/mailer')
const {USER_STATUS, MEMBER_STATUS} = require('../../../common/status')
const app = require('../../../app')
const { User, Member } = require('../../../models')
const Token = require('../../../common/token')
const Security = require('../../../common/security')
const expect = chai.expect

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
    it('should fail if email is missing', async function () {
      const response = await chai.request(app).post('/public/login')
        .send({ password: faker.internet.password() })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('All fields are required.')
    })
    it('should fail if password is missing', async function () {
      const response = await chai.request(app).post('/public/login')
        .send({ email: faker.internet.email() })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('All fields are required.')
    })
    it('should fail if the user can not be authenticated', async function () {
      sandbox.stub(passport, 'authenticate').yields(null, null, {message: 'Incorrect username or password.'})

      const response = await chai.request(app).post('/public/login')
        .send({ email: faker.internet.email(), password: faker.internet.password() })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Incorrect username or password.')
    })
    it('should return the user and a token on success', async function () {
      const id = faker.random.uuid()
      const email = faker.internet.email()
      const password = faker.internet.password()
      const token = faker.random.alphaNumeric()
      const memberId = faker.random.uuid()
      const congregationId = faker.random.uuid()
      const user = {id, email, memberId, Member: {congregationId}}

      sandbox.stub(passport, 'authenticate').yields(null, user, null)
      sandbox.stub(Token, 'generateToken').returns(token)

      const response = await chai.request(app).post('/public/login')
        .send({ email, password })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ 'user': { id: id }, 'token': token })
    })
  })
  describe('POST /public/register', async function () {
    const email = faker.internet.email()
    const confirmEmail = email
    const password = faker.internet.password()
    const confirmPassword = password
    const firstName = faker.name.findName()
    const lastName = faker.name.findName()

    it('should fail if email is missing', async function () {
      const response = await chai.request(app).post('/public/register')
        .send({ confirmEmail, password, confirmPassword, firstName, lastName })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('All fields are required.')
    })
    it('should fail if confirm email is missing', async function () {
      const response = await chai.request(app).post('/public/register')
        .send({ email, password, confirmPassword, firstName, lastName })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('All fields are required.')
    })
    it('should fail if password is missing', async function () {
      const response = await chai.request(app).post('/public/register')
        .send({ email, confirmEmail, confirmPassword, firstName, lastName })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('All fields are required.')
    })
    it('should fail if confirm password is missing', async function () {
      const response = await chai.request(app).post('/public/register')
        .send({ email, confirmEmail, password, firstName, lastName })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('All fields are required.')
    })
    it('should fail if firstName is missing', async function () {
      const response = await chai.request(app).post('/public/register')
        .send({ confirmEmail, password, confirmPassword, lastName })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('All fields are required.')
    })
    it('should fail if lastName is missing', async function () {
      const response = await chai.request(app).post('/public/register')
        .send({ confirmEmail, password, confirmPassword, firstName })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('All fields are required.')
    })
    it('should fail if email and confirm email do not match', async function () {
      const response = await chai.request(app).post('/public/register')
        .send({ email, confirmEmail: `not${confirmEmail}`, password, confirmPassword, firstName, lastName })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Email fields do not match, try again.')
    })
    it('should fail if password and confirm password do not match', async function () {
      sandbox.stub(User, 'findOne').resolves(null)
      sandbox.stub(Token, 'verifyToken').returns('123456')

      const response = await chai.request(app).post('/public/register')
        .send({ email, confirmEmail, password, confirmPassword: `not${confirmPassword}`, firstName, lastName })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Password fields do not match, try again.')
    })
    it('should fail if email is already registered', async function () {
      sandbox.stub(User, 'findOne').resolves({ id: faker.random.uuid(), email: faker.internet.email() })

      const response = await chai.request(app).post('/public/register')
        .send({ email, confirmEmail, password, confirmPassword, firstName, lastName })

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal(
        'Email is already registered. Did you forget your login information? Have you checked your email for a confirmation link?'
      )
    })
    it('should fail if the user is not a member of a congregation', async function () {
      sandbox.stub(User, 'findOne').resolves(null)
      sandbox.stub(Member, 'findOne').resolves(null)

      const response = await chai.request(app).post('/public/register')
        .send({ email, confirmEmail, password, confirmPassword, firstName, lastName })

      expect(response.status).to.equal(400)
      expect(response.body).to.eql({ message: 'Unable to register at this time.  Check with your congregation to make sure they have added you as a member.' })
    })
    it('should return the new user and a token on success', async function () {
      const id = faker.random.uuid()
      const salt = faker.random.alphaNumeric()
      const hash = faker.random.alphaNumeric()
      const token = faker.random.alphaNumeric()
      const memberId = faker.random.alphaNumeric()
      const memberStatus = MEMBER_STATUS.ACTIVE
      sandbox.stub(User, 'findOne').resolves(null)
      sandbox.stub(Member, 'findOne').resolves({id: memberId, status: memberStatus})

      const createStub = sandbox.stub(User, 'create').resolves({id, email, salt, hash})
      sandbox.stub(Security, 'generateSalt').returns(salt)
      sandbox.stub(Security, 'generateHash').returns(hash)
      sandbox.stub(Token, 'generateToken').returns(token)
      const sendMailStub = sandbox.stub(mailer, 'sendMail')
      sendMailStub.resolves()

      const response = await chai.request(app).post('/public/register')
        .send({ email, confirmEmail, password, confirmPassword, firstName, lastName })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ 'message': 'Please check your email to verify your account.' })
      const status = USER_STATUS.NEW
      expect(createStub.getCall(0).calledWith({id, email, salt, hash, status, firstName, lastName}))
    })
  })
  describe('PUT /public/confirm/', function () {
    it('should fail if the token is invalid', async function () {
      const consoleStub = sandbox.stub(console, 'error')
      const errorMessage = faker.lorem.sentence()
      sandbox.stub(Token, 'verifyToken').throws(new JsonWebTokenError(errorMessage))

      const response = await chai.request(app).put(`/public/confirm`).send('12345678')

      expect(consoleStub.getCall(0).calledWith(errorMessage))
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal(`The token is invalid.`)
    })
    it('should fail if the token is already expired', async function () {
      const consoleStub = sandbox.stub(console, 'error')
      const userStub = sandbox.stub()
      userStub.isVerified = () => false
      const errorMessage = faker.lorem.sentence()
      sandbox.stub(Token, 'verifyToken').throws(new Error(errorMessage))
      sandbox.stub(User, 'findOne').resolves(userStub)

      const response = await chai.request(app).put(`/public/confirm`).send('12345678')

      expect(consoleStub.getCall(0).calledWith(errorMessage))
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('The token is invalid.')
    })
    it('should fail if the user does not exist', async function () {
      const token = {id: 1}

      sandbox.stub(Token, 'verifyToken').returns(token)
      sandbox.stub(User, 'findOne').resolves(null)

      const response = await chai.request(app).put(`/public/confirm`).send('12345678')

      expect(response.status).to.equal(404)
      expect(response.body.message).to.equal('No user exists for this token.')
    })
    it('should fail for a user that has already verified their email', async function () {
      const userStub = sandbox.stub()
      userStub.isVerified = () => true

      sandbox.stub(Token, 'verifyToken').returns({})
      sandbox.stub(User, 'findOne').resolves(userStub)

      const response = await chai.request(app).put(`/public/confirm`).send('12345678')

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal(`The user's email has already been verified.`)
    })
    it('should return the user successfuly confirmed their email', async function () {
      const generatedToken = faker.random.alphaNumeric()
      const id = faker.random.uuid()
      const userStub = sandbox.stub()
      userStub.id = id
      userStub.isVerified = () => false
      userStub.update = () => true

      sandbox.stub(Token, 'verifyToken').returns({})
      sandbox.stub(User, 'findOne').resolves(userStub)
      sandbox.stub(Token, 'generateToken').returns(generatedToken)

      const response = await chai.request(app).put(`/public/confirm`).send('12345678')

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: `The user's email has been verified, please login.` })
    })
    it('should return the user failed to confirmed their email', async function () {
      const generatedToken = faker.random.alphaNumeric()
      const id = faker.random.uuid()
      const userStub = sandbox.stub()
      userStub.id = id
      userStub.isVerified = () => false
      userStub.update = () => false

      sandbox.stub(Token, 'verifyToken').returns({})
      sandbox.stub(User, 'findOne').resolves(userStub)
      sandbox.stub(Token, 'generateToken').returns(generatedToken)

      const response = await chai.request(app).put(`/public/confirm`).send('12345678')

      expect(response.status).to.equal(500)
      expect(response.body).to.eql({ message: 'Unable to verify email at this time, please try again.' })
    })
  })
  describe('POST /public/resend', function () {
    it('should fail if email is missing', async function () {
      const response = await chai.request(app).post('/public/resend').send({})

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Email is required.')
    })
    it('should fail for an email that has not been registered', async function () {
      const email = faker.internet.email()

      sandbox.stub(User, 'findOne').resolves(null)

      const response = await chai.request(app).post('/public/resend').send({email: email})

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Email was never registered. Did you forget your login information?')
    })
    it('should fail for a user that has already verified their email', async function () {
      const userStub = sandbox.stub()
      userStub.isVerified = () => true
      const email = faker.internet.email()

      sandbox.stub(User, 'findOne').resolves(userStub)

      const response = await chai.request(app).post('/public/resend').send({email: email})

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal(`The user's email has already been verified.`)
    })
    it('should fail for a user that does not belong to a congregation', async function () {
      const userStub = sandbox.stub()
      userStub.isVerified = () => false
      const email = faker.internet.email()

      sandbox.stub(User, 'findOne').resolves(userStub)

      const response = await chai.request(app).post('/public/resend').send({email: email})

      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal(
        'Unable to resend at this time.  Check with your congregation to make sure they have added you as a member.'
      )
    })
    it('should send a new token in an email', async function () {
      const email = faker.internet.email()
      const userStub = sandbox.stub()
      userStub.isVerified = () => false
      userStub.email = email
      userStub.Member = {firstName: faker.name.findName(), lastName: faker.name.findName()}
      const token = faker.random.alphaNumeric()

      sandbox.stub(User, 'findOne').resolves(userStub)
      sandbox.stub(Token, 'generateToken').returns(token)
      const sendMailStub = sandbox.stub(mailer, 'sendMail')
      sendMailStub.resolves()

      const response = await chai.request(app).post('/public/resend')
        .send({email: email})

      expect(response.status).to.equal(200)
      expect(response.body.message).to.equal('Email has been resent.  Please check your email to verify your account.')

      const args = sendMailStub.getCall(0).args
      expect(args[0]).to.equal(userStub.Member.firstName)
      expect(args[1]).to.equal(userStub.Member.lastName)
      expect(args[2]).to.equal(email)
      expect(args[3]).to.equal(token)
    })
  })
  describe('GET /public/status', function () {
    it('should return online', async function () {
      const response = await chai.request(app).get('/public/status')
      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('online')
    })
  })
})
