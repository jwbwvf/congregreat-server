'use strict'

const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const config = require('../common/config')
const { USER_STATUS } = require('../common/status')
const fs = require('fs')
const publicKey = fs.readFileSync(config.jwt.public)
const privateKey = fs.readFileSync(config.jwt.private)
const passphrase = config.jwt.passphrase


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
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
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
    User.belongsTo(models.Congregation, {
      foreignKey: {
        name: 'congregationId',
        field: 'congregation_id'
      }
    })
  }

  User.verifyJwt = function (token) {
    return jwt.verify(token, publicKey, { algorithm: 'RS512' })
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

  User.prototype.isVerified = function () {
    return this.status === USER_STATUS.VERIFIED
  }

  User.generateJwt = function (userId, email, expirationInDays = 2) {
    if (!userId || !email) {
      throw new Error('Missing required parameter to generateJwt.')
    }

    try {
      return jwt.sign({
        userId: userId,
        email: email
      }, { key: privateKey, passphrase }, { algorithm: 'RS512', expiresIn: `${expirationInDays}d` })
    } catch (error) {
      console.error(error)
    }
  }

  return User
}
