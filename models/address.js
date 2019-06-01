'use strict'

const baseModel = require('../common/baseModel')

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address',
    Object.assign(baseModel.getProperties, {
      addressLine1: {
        type: DataTypes.STRING,
        allowNull: false
      },
      addressLine2: DataTypes.STRING,
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false
      },
      zipCode: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }), {})
  Address.associate = function (models) {
    // associations can be defined here
  }
  return Address
}
