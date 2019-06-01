'use strict'

const baseModel = require('../common/baseModel')

module.exports = (sequelize, DataTypes) => {
  var Role = sequelize.define('Role',
    Object.assign(baseModel.getProperties(DataTypes), {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'uniqueTag'
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'uniqueTag'
      },
      permissions: {
        type: DataTypes.JSON,
        allowNull: false
      }
    }), {})
  Role.associate = function (models) {
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: {
        name: 'roleId',
        allowNull: false
      }
    }
    )
    // Role.belongsTo(models.Congregation, {
    //   foreignKey: {
    //     name: 'congregationId',
    //     allowNull: false,
    //     unique: 'uniqueTag'
    //   }
    // })
  }
  return Role
}
