'use strict'

const baseModel = require('../common/baseModel')

module.exports = (sequelize, DataTypes) => {
  var Attendance = sequelize.define('Attendance',
    Object.assign(baseModel.getProperties(DataTypes), {}), {})
  Attendance.associate = function (models) {
    Attendance.belongsTo(models.Member, {
      foreignKey: {
        name: 'memberId',
        allowNull: false
      }
    })
    Attendance.belongsTo(models.Event, {
      foreignKey: {
        name: 'eventId',
        allowNull: false
      }
    })
  }
  return Attendance
}
