'use strict'
module.exports = (sequelize, DataTypes) => {
  var Congregation = sequelize.define('Congregation', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {})

  Congregation.associate = function (models) {
    Congregation.hasMany(models.Member, {
      foreignKey: {
        name: 'congregationId',
        allowNull: false
      }
    })
  }

  return Congregation
}
