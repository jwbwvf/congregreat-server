'use strict'

const fs = require('fs')
const config = require('../common/config')
const jsonWebToken = require('jsonwebtoken')
const publicKey = fs.readFileSync(config.jwt.public)
const privateKey = fs.readFileSync(config.jwt.private)
const passphrase = config.jwt.passphrase
const algorithm = 'RS512'

const verifyToken = token => {
  return jsonWebToken.verify(
    token,
    publicKey,
    { algorithm }
  )
}

const generateToken = (payload, expirationInDays = 2) => {
  return jsonWebToken.sign(
    payload,
    {
      key: privateKey,
      passphrase
    }, {
      algorithm,
      expiresIn: `${expirationInDays}d`
    }
  )
}

module.exports = {
  verifyToken,
  generateToken
}
