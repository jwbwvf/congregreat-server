/* global describe it beforeEach afterEach */

const passport = require('passport')
const sinon = require('sinon')
const User = require('../../models').User
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

describe('passport', function () {
  let sandbox
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('use LocalStrategy', function () {
    it('returns false if user is not found', function (done) {
      const email = 'testEmail@example.com'
      const password = 'testPassword'
      const req = {body: {email: email, password: password}}
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
      const email = 'testEmail@example.com'
      const password = 'testPassword'
      const req = {body: {email: email, password: password}}
      const res = {}
      const userStub = sandbox.stub()
      userStub.validPassword = password => false
      userStub.verified = true
      sandbox.stub(User, 'findOne').resolves(userStub)
      passport.authenticate('local', function (err, user, info) {
        if (err) done(err)
        assert(!user)
        expect(info.message).to.equal('Incorrect username or password.')
        done()
      })(req, res)
    })
    it('returns false if the user has not verified their email', function (done) {
      const email = 'testEmail@example.com'
      const password = 'testPassword'
      const req = {body: {email: email, password: password}}
      const res = {}
      const userStub = sandbox.stub()
      userStub.validPassword = password => true
      userStub.verified = false
      sandbox.stub(User, 'findOne').resolves(userStub)
      passport.authenticate('local', function (err, user, info) {
        if (err) done(err)
        assert(!user)
        expect(info.message).to.equal('User has not verified their email.')
        done()
      })(req, res)
    })
    it('returns the user on successful authentication', function (done) {
      const email = 'testEmail@example.com'
      const password = 'testPassword'
      const req = {body: {email: email, password: password}}
      const res = {}
      const userStub = sandbox.stub()
      userStub.hash = 'testHash'
      userStub.salt = 'testSalt'
      userStub.verified = true
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
      const email = 'testEmail@example.com'
      const password = 'testPassword'
      const req = {body: {email: email, password: password}}
      const res = {}
      const userStub = sandbox.stub()
      userStub.validPassword = password => true
      sandbox.stub(User, 'findOne').throws({message: 'test exception thrown'})
      passport.authenticate('local', function (err, user, info) {
        expect(err.message).to.equal('test exception thrown')
        if (user) done(user)
        if (info) done(info)
        done()
      })(req, res)
    })
  })
})