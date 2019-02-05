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
      allowNull: false,
      unique: 'uniqueTag'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'uniqueTag'
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
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {})
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
