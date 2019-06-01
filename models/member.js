'use strict'

const baseModel = require('../common/baseModel')

module.exports = (sequelize, DataTypes) => {
  var Member = sequelize.define('Member',
    Object.assign(baseModel.getProperties(DataTypes), {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        defaultValue: null,
        validate: {
          isEmail: true
        }
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }), {})
  Member.associate = function (models) {
    Member.belongsTo(models.Congregation, {
      foreignKey: {
        name: 'congregationId',
        allowNull: false
      }
    })
    Member.hasMany(models.Attendance, {
      foreignKey: {
        name: 'memberId',
        allowNull: false
      }
    })
  }
  return Member
}
