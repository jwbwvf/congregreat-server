'use strict'

const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const config = require('../common/config')

const iterations = 1000
const size = 16
const digest = 'SHA256'

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name',
      defaultValue: ''
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name',
      defaultValue: ''
    }
  }, {})

  User.associate = function (models) {
    // associations can be defined here
  }

  User.verifyJwt = function (token) {
    return jwt.verify(token, config.jwt.secret)
  }

  User.getSalt = function () {
    return crypto.randomBytes(16).toString('hex')
  }
  User.getHash = function (salt, password) {
    return crypto.pbkdf2Sync(password, salt, iterations, size, digest).toString('hex')
  }

  User.prototype.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, iterations, size, digest).toString('hex')
    return this.hash === hash
  }

  User.generateJwt = function (userId, email, expirationInDays = 2) {
    if (!userId || !email) {
      throw new Error('missing required parameter to generate jwt')
    }
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + expirationInDays)

    return jwt.sign({
      userId: userId,
      email: email,
      expiration: parseInt(expiry.getTime() / 1000)
    }, config.jwt.secret)
  }

  return User
}
