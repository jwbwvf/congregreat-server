'use strict'
module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
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
