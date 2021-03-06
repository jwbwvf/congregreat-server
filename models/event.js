'use strict'

const baseModel = require('../common/baseModel')

module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define('Event',
    Object.assign(baseModel.getProperties(DataTypes), {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false
      }
    }), {})
  Event.associate = function (models) {
    Event.belongsTo(models.Congregation, {
      foreignKey: {
        name: 'congregationId',
        allowNull: false
      }
    })
    Event.hasMany(models.Attendance, {
      foreignKey: {
        name: 'eventId',
        allowNull: false
      }
    })
  }
  return Event
}
