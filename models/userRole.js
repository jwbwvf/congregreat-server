'use strict'

const baseModel = require('../common/baseModel')

module.exports = (sequelize, DataTypes) => {
  var UserRole = sequelize.define('UserRole',
    Object.assign(baseModel.getProperties(DataTypes), {
      status: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }), {})
  UserRole.associate = function (models) {
    UserRole.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    })
    UserRole.belongsTo(models.Role, {
      foreignKey: {
        name: 'roleId',
        allowNull: false
      }
    })
  }
  return UserRole
}
