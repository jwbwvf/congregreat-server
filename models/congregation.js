'use strict'

const baseModel = require('../common/baseModel')

module.exports = (sequelize, DataTypes) => {
  var Congregation = sequelize.define('Congregation',
    Object.assign(baseModel.getProperties(DataTypes), {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING
      }
    }), {})
  Congregation.associate = function (models) {
    Congregation.hasMany(models.Member, {
      foreignKey: {
        name: 'congregationId',
        allowNull: false
      }
    })
    Congregation.hasMany(models.Event, {
      foreignKey: {
        name: 'congregationId',
        allowNull: false
      }
    })
  }

  return Congregation
}
