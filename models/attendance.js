'use strict'

module.exports = (sequelize, DataTypes) => {
  var Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
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
  Attendance.associate = function (models) {
    Attendance.belongsTo(models.Member, {
      foreignKey: {
        name: 'memberId',
        allowNull: false
      }
    })
    Attendance.belongsTo(models.Congregation, {
      foreignKey: {
        name: 'congregationId',
        allowNull: false
      }
    })
  }
  return Attendance
}
