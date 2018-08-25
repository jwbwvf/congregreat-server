/* global describe it beforeEach afterEach */

const passport = require('passport')
const sinon = require('sinon')
const faker = require('faker')
const User = require('../../models').User
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

describe('passport', function () {
  let sandbox, email, password
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    email = faker.internet.email()
    password = faker.internet.password()
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('use LocalStrategy', function () {
    it('returns false if user is not found', function (done) {
      const req = {body: {email, password}}
      const res = {}
      sandbox.stub(User, 'findOne').resolves(null)
      passport.authenticate('local', function (err, user, info) {
        if (err) done(err)
        assert(!user)
        expect(info.message).to.equal('Incorrect username or password.')
        done()
      })(req, res)
    })
    it('returns false if the password is invalid', function (done) {
      const req = {body: {email, password}}
      const res = {}
      const userStub = sandbox.stub()
      userStub.validPassword = password => false
      userStub.isVerified = () => true
      sandbox.stub(User, 'findOne').resolves(userStub)
      passport.authenticate('local', function (err, user, info) {
        if (err) done(err)
        assert(!user)
        expect(info.message).to.equal('Incorrect username or password.')
        done()
      })(req, res)
    })
    it('returns false if the user has not verified their email', function (done) {
      const req = {body: {email, password}}
      const res = {}
      const userStub = sandbox.stub()
      userStub.validPassword = password => true
      userStub.isVerified = () => false
      sandbox.stub(User, 'findOne').resolves(userStub)
      passport.authenticate('local', function (err, user, info) {
        if (err) done(err)
        assert(!user)
        expect(info.message).to.equal('User has not verified their email.')
        done()
      })(req, res)
    })
    it('returns the user on successful authentication', function (done) {
      const req = {body: {email, password}}
      const res = {}
      const userStub = sandbox.stub()
      userStub.hash = faker.random.alphaNumeric()
      userStub.salt = faker.random.alphaNumeric()
      userStub.isVerified = () => true
      userStub.validPassword = password => true
      sandbox.stub(User, 'findOne').resolves(userStub)
      passport.authenticate('local', function (err, user, info) {
        if (err) done(err)
        expect(user).to.be.equal(userStub)
        expect(user.hash).to.equal('')
        expect(user.salt).to.equal('')
        if (info) done(info)
        done()
      })(req, res)
    })
    it('returns false if an exception is caught', function (done) {
      const req = {body: {email, password}}
      const res = {}
      const userStub = sandbox.stub()
      userStub.validPassword = password => true
      sandbox.stub(User, 'findOne').throws({message: 'test exception thrown'})
      passport.authenticate('local', function (err, user, info) {
        expect(info.message).to.equal('test exception thrown')
        if (user) done(user)
        if (err) done(err)
        done()
      })(req, res)
    })
  })
})
