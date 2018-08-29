'use strict'

const crypto = require('crypto')

const iterations = 1000
const size = 16
const digest = 'SHA256'

const generateSalt = () => {
  return crypto.randomBytes(size).toString('hex')
}
const generateHash = (salt, password) => {
  return crypto.pbkdf2Sync(password, salt, iterations, size, digest).toString('hex')
}

const isPasswordValid = function (password, salt, hash) {
  const generatedHash = crypto.pbkdf2Sync(password, salt, iterations, size, digest).toString('hex')
  return hash === generatedHash
}

module.exports = {
  generateSalt,
  generateHash,
  isPasswordValid
}
