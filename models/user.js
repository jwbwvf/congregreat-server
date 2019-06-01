'use strict'

const { USER_STATUS } = require('../common/status')
const baseModel = require('../common/baseModel')

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User',
    Object.assign(baseModel.getProperties(DataTypes), {
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
      }
    }), {})
  User.associate = function (models) {
    User.belongsTo(models.Member, {
      foreignKey: {
        name: 'memberId',
        allowNull: false,
        unique: true
      }
    })
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    }
    )
  }

  User.prototype.isVerified = function () {
    return this.status === USER_STATUS.VERIFIED
  }

  return User
}
