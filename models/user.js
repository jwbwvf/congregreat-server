'use strict';

const sequelize = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../common/config');

const iterations = 1000;
const size = 16;
const digest = 'SHA256';

module.exports = function (sequelize, DataTypes){
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
    hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});

  User.associate = function (models) {
    // associations can be defined here
  };

  User.verifyJwt = function (token) {
    return jwt.verify(token, config.jwt.secret);
  };

  User.getSalt = function () {
    return crypto.randomBytes(16).toString('hex');
  }
  User.getHash = function (salt, password) {
    return crypto.pbkdf2Sync(password, salt, iterations, size, digest).toString('hex');
  };

  User.prototype.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, iterations, size, digest).toString('hex');
    return this.hash === hash;
  };

  User.generateJwt = function (id, email) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 2); //set expire in two days

    return jwt.sign({
      id : id,
      email : email,
      exp : parseInt(expiry.getTime() / 1000)
    }, config.jwt.secret);
  };

  return User;
};