'use strict'

const baseModel = require('../common/baseModel')

module.exports = (sequelize, DataTypes) => {
  const Phone = sequelize.define('Phone',
    Object.assign(baseModel.getProperties(DataTypes), {
      number: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }), {})
  Phone.associate = function (models) {
    // associations can be defined here
  }
  return Phone
}
