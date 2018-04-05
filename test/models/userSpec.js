/* global describe it */

const User = require('../../models').User
const jwt = require('jsonwebtoken')
const config = require('../../common/config')
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

describe('User', function () {
  const hex = /[0-9A-Fa-f]{16}/g

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
  describe('generateJwt', function () {
    it('encodes a token that includes the id and email', function () {
      const id = 'testId'
      const email = 'testEmail@example.com'
      const token = User.generateJwt(id, email)

      const decodedToken = jwt.verify(token, config.jwt.secret)
      expect(decodedToken.id).to.eql(id)
      expect(decodedToken.email).to.eql(email)
      assert(decodedToken.exp !== null)
    })
  })
  describe('verifyJwt', function () {
    it('returns the decoded token', function () {
      const id = 'testId'
      const email = 'testEmail@example.com'

      const token = jwt.sign({
        id: id,
        email: email
      }, config.jwt.secret)

      const decodedToken = User.verifyJwt(token)
      expect(decodedToken.id).to.eql(id)
      expect(decodedToken.email).to.eql(email)
    })
  })
})
