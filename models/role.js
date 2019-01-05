'use strict'
module.exports = (sequelize, DataTypes) => {
  var Role = sequelize.define('Role', {
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
  Role.associate = function (models) {
    // Role.belongsToMany(models.User,
    //   {
    //     through: models.UserRole
    //   }
    // )
    Role.belongsTo(models.Congregation, {
      foreignKey: {
        name: 'congregationId',
        allowNull: false
      }
    })
  }
  return Role
}
