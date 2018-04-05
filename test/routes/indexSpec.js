/* global describe it beforeEach afterEach */

const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const passport = require('passport')
const app = require('../../app')
const User = require('../../models').User
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
  describe('POST /login', function () {
    it('should fail if email is missing', function () {
      chai.request(app).post('/login')
        .send({ password: '12345678' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('All fields are required.')
        })
    })
    it('should fail if password is missing', function () {
      chai.request(app).post('/login')
        .send({ email: 'test@example.com' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('All fields are required.')
        })
    })
    it('should fail if the user is can not be authenticated', function () {
      sandbox.stub(passport, 'authenticate').yields(null, null, null)
      chai.request(app).post('/login')
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

      chai.request(app).post('/login')
        .send({ email: email, password: '12345678' })
        .end(function (error, response, body) {
          assert(!error)
          expect(response.status).to.equal(200)
          expect(response.body).to.eql({ 'user': { id: id }, 'token': token })
        })
    })
  })
  describe('POST /register', function () {
    it('should fail if email is missing', function () {
      chai.request(app).post('/register')
        .send({ confirm_email: 'test@example.com', password: '12345678', confirm_password: '12345678' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('All fields are required.')
        })
    })
    it('should fail if confirm email is missing', function () {
      chai.request(app).post('/register')
        .send({ email: 'test@example.com', password: '12345678', confirm_password: '12345678' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('All fields are required.')
        })
    })
    it('should fail if password is missing', function () {
      chai.request(app).post('/register')
        .send({ email: 'test@example.com', confirm_email: 'test@example.com', confirm_password: '12345678' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('All fields are required.')
        })
    })
    it('should fail if confirm password is missing', function () {
      chai.request(app).post('/register')
        .send({ email: 'test@example.com', confirm_email: 'test@example.com', password: '12345678' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('All fields are required.')
        })
    })
    it('should fail if email and confirm email do not match', function () {
      chai.request(app).post('/register')
        .send({ email: 'test@example.com', confirm_email: 'nottest@example.com', password: '12345678', confirm_password: '12345678' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('Email fields do not match, try again.')
        })
    })
    it('should fail if password and confirm password do not match', function () {
      sandbox.stub(User, 'findOne').resolves(null)
      chai.request(app).post('/register')
        .send({ email: 'test@example.com', confirm_email: 'test@example.com', password: '12345678', confirm_password: '1234' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('Password fields do not match, try again.')
        })
    })
    it('should fail if email is already registered', function () {
      sandbox.stub(User, 'findOne').resolves({ id: 'testId', email: 'test@example.com' })
      chai.request(app).post('/register')
        .send({ email: 'test@example.com', confirm_email: 'test@example.com', password: '12345678', confirm_password: '1234' })
        .end(function (error, response, body) {
          assert(error)
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal('Email is already registered. Did you forget your login information?')
        })
    })
    it('should return the new user and a token on success', function () {
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

      chai.request(app).post('/register')
        .send({ email: email, confirm_email: email, password: '12345678', confirm_password: '12345678' })
        .end(function (error, response, body) {
          assert(!error)
          expect(response.status).to.equal(200)
          expect(response.body).to.eql({ 'user': { id: id }, 'token': token })
        })
    })
  })
})
