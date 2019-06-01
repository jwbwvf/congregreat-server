'use strict'
module.exports = (sequelize, DataTypes) => {
  const Phone = sequelize.define('Phone', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {})
  Phone.associate = function (models) {
    // associations can be defined here
  }
  return Phone
}
