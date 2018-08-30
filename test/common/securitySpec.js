/* global describe it */

const {generateHash, generateSalt, isPasswordValid} = require('../../common/security')
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

const hex = /[0-9A-Fa-f]{16}/g

describe('security', function () {
  describe('generateSalt', function () {
    it('gets a random 16 character string in hex form', function () {
      const salt = generateSalt()
      assert(hex.test(salt))
      expect(salt).not.to.equal(generateSalt())
    })
  })
  describe('generateHash', function () {
    it('encrypts a password using a salt', function () {
      const password1 = 'password1'
      const password2 = 'password2'
      const salt1 = '1234567890ABCDEF'
      const salt2 = 'FEDCBA0987654321'

      const hashSalt1Password1 = generateHash(salt1, password1)
      const hashSalt2Password1 = generateHash(salt2, password1)
      const hashSalt1Password2 = generateHash(salt1, password2)

      expect(hashSalt1Password1).not.to.equal(hashSalt2Password1)
      expect(hashSalt1Password1).not.to.equal(hashSalt1Password2)
      expect(hashSalt1Password1).to.equal(generateHash(salt1, password1))
      assert(hex.test(hashSalt1Password1))
    })
  })
  describe('isPasswordValid', function () {
    it('returns true for a valid password', function () {
      const salt = '0123456789ABCDEF'
      const password = 'password'
      const notPassword = 'notPassword'
      const hash = generateHash(salt, password)

      assert(isPasswordValid(password, salt, hash))
      assert(!isPasswordValid(notPassword, salt, hash))
    })
  })
})
