/* global describe it beforeEach afterEach */

const fs = require('fs')
const User = require('../../models').User
const jwt = require('jsonwebtoken')
const config = require('../../common/config')
const {USER_STATUS} = require('../../common/status')
const sinon = require('sinon')
const faker = require('faker')
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

describe('User', function () {
  let sandbox
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  const hex = /[0-9A-Fa-f]{16}/g
  const publicKey = fs.readFileSync(config.jwt.public)
  const privateKey = fs.readFileSync(config.jwt.private)
  const passphrase = config.jwt.passphrase
  describe('getSalt', function () {
    it('gets a random 16 character string in hex form', function () {
      const salt = User.getSalt()
      assert(hex.test(salt))
      expect(salt).not.to.equal(User.getSalt())
    })
  })
  describe('getHash', function () {
    it('encrypts a password using a salt', function () {
      const password1 = 'password1'
      const password2 = 'password2'
      const salt1 = '1234567890ABCDEF'
      const salt2 = 'FEDCBA0987654321'

      const hashSalt1Password1 = User.getHash(salt1, password1)
      const hashSalt2Password1 = User.getHash(salt2, password1)
      const hashSalt1Password2 = User.getHash(salt1, password2)

      expect(hashSalt1Password1).not.to.equal(hashSalt2Password1)
      expect(hashSalt1Password1).not.to.equal(hashSalt1Password2)
      expect(hashSalt1Password1).to.equal(User.getHash(salt1, password1))
      assert(hex.test(hashSalt1Password1))
    })
  })
  describe('validPassword', function () {
    it('returns true for a valid password', function () {
      const salt = '0123456789ABCDEF'
      const password = 'password'
      const notPassword = 'notPassword'
      const user = new User()
      user.salt = salt
      user.hash = User.getHash(salt, password)

      assert(user.validPassword(password))
      assert(!user.validPassword(notPassword))
    })
  })
  describe('isVerified', function () {
    it('returns true if the users status is verified', function () {
      const user = new User()
      user.status = USER_STATUS.VERIFIED

      assert(user.isVerified())
    })
    it('returns false if the users status is not verified', function () {
      const user = new User()
      user.status = USER_STATUS.UNVERIFIED

      assert(!user.isVerified())
    })
  })
  describe('generateJwt', function () {
    it('encodes a token that includes the id and email', function () {
      const userId = faker.random.uuid()
      const email = faker.internet.email()
      const token = User.generateJwt(userId, email)

      const decodedToken = jwt.verify(token, publicKey, { algorithm: 'RS512' })
      expect(decodedToken.userId).to.eql(userId)
      expect(decodedToken.email).to.eql(email)
      assert(decodedToken.exp !== null)
    })
    it('throws an error if the userId is not passed as parameters', function () {
      const email = faker.internet.email()
      assert.throws(() => { User.generateJwt(null, email) }, Error, 'Missing required parameter to generateJwt.')
    })
    it('throws an error if the email is not passed as parameters', function () {
      const userId = faker.random.uuid()
      assert.throws(() => { User.generateJwt(userId, null) }, Error, 'Missing required parameter to generateJwt.')
    })
    it('logs the error if sign throws an error', function () {
      const consoleStub = sandbox.stub(console, 'error')
      const errorMessage = faker.lorem.sentence()
      sandbox.stub(jwt, 'sign').throws(new Error(errorMessage))
      const userId = faker.random.uuid()
      const email = faker.internet.email()
      User.generateJwt(userId, email)
      expect(consoleStub.getCall(0).calledWith(errorMessage))
    })
  })
  describe('verifyJwt', function () {
    it('returns the decoded token', function () {
      const id = faker.random.uuid()
      const email = faker.internet.email()

      const token = jwt.sign({
        id: id,
        email: email
      }, { key: privateKey, passphrase }, { algorithm: 'RS512' })

      const decodedToken = User.verifyJwt(token)
      expect(decodedToken.id).to.eql(id)
      expect(decodedToken.email).to.eql(email)
    })
  })
})
