'use strict'
module.exports = (sequelize, DataTypes) => {
  var UserRole = sequelize.define('UserRole', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    status: {
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
