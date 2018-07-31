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
    status: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {})

  Congregation.associate = function (models) {
    Congregation.hasMany(models.User, {
      foreignKey: {
        name: 'congregationId',
        field: 'congregation_id'
      }
    })
  }

  return Congregation
}
